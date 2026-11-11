use std::time::Duration;

use crate::{clock::Instant, BitBoard, Side};

const COLUMNS: [usize; 7] = [3, 2, 4, 1, 5, 0, 6];
const BOTTOM: u64 = 0x0001_0101_0101_0101;
const CELLS: u64 = BOTTOM * 0x3f;
const ODD_ROWS: u64 = BOTTOM * 0x15;
const MATE: i16 = 10_000;
const TABLE_SIZE: usize = 1 << 18;

#[derive(Clone, Copy)]
pub enum SearchLimit {
    Time(Duration),
    Nodes(u64),
}

#[derive(Debug)]
pub struct SearchResult {
    pub column: usize,
    pub depth: u8,
    pub nodes: u64,
    score: i16,
    solved: bool,
}

impl SearchResult {
    pub fn score_label(&self) -> String {
        match self.score {
            score if score >= MATE - 42 => format!("Win in ≤{}", MATE - score),
            score if score <= 42 - MATE => format!("Loss in ≤{}", MATE + score),
            0 if self.solved => "Draw".to_owned(),
            score => format!("{score:+} (depth {})", self.depth),
        }
    }
}

// Same eight-bit column stride as BitBoard, oriented to the side to move.
#[derive(Clone, Copy)]
struct Position {
    own: u64,
    occupied: u64,
}

impl Position {
    fn play(self, cell: u64) -> Self {
        Self {
            own: self.occupied ^ self.own,
            occupied: self.occupied | cell,
        }
    }

    fn playable(self) -> u64 {
        (self.occupied + BOTTOM) & CELLS
    }

    // Each column height occupies a disjoint range of sums.
    fn key(self) -> u64 {
        self.occupied + self.own
    }
}

fn has_four(stones: u64) -> bool {
    [1, 7, 8, 9].into_iter().any(|shift| {
        let pairs = stones & (stones >> shift);
        pairs & (pairs >> (2 * shift)) != 0
    })
}

fn winning_cells(stones: u64, occupied: u64) -> u64 {
    // A vertical winning cell must be above its three stones. For the other
    // directions, consider a gap at either end or anywhere inside the line.
    let mut cells = (stones << 1) & (stones << 2) & (stones << 3);
    for shift in [7, 8, 9] {
        let adjacent = (stones << shift) & (stones >> shift);
        cells |= adjacent & ((stones << (2 * shift)) | (stones >> (2 * shift)));
        let triples = stones & (stones << shift) & (stones << (2 * shift));
        cells |= (triples << shift) | (triples >> (3 * shift));
    }
    cells & (CELLS ^ occupied)
}

fn safe_moves(playable: u64, opponent_wins: u64) -> u64 {
    let forced = playable & opponent_wins;
    if forced.count_ones() > 1 {
        return 0;
    }
    let candidates = if forced == 0 { playable } else { forced };
    // Playing underneath a winning cell lets the opponent drop into it.
    candidates & !(opponent_wins >> 1)
}

fn column_cell(cells: u64, column: usize) -> u64 {
    cells & (0x3f << (8 * column))
}

fn first_column(cells: u64) -> usize {
    COLUMNS
        .into_iter()
        .find(|&column| column_cell(cells, column) != 0)
        .expect("at least one playable column")
}

fn evaluate(stones: u64, wins: u64, opponent_wins: u64, preferred_rows: u64) -> i16 {
    let threats = wins & !(opponent_wins << 1);
    12 * threats.count_ones() as i16
        + 10 * (threats & preferred_rows).count_ones() as i16
        + 4 * column_cell(stones, 3).count_ones() as i16
        + 2 * (column_cell(stones, 2) | column_cell(stones, 4)).count_ones() as i16
}

#[derive(Clone, Copy)]
enum Bound {
    Exact,
    Lower,
    Upper,
}

#[derive(Clone, Copy)]
struct Entry {
    key: u64,
    score: i16,
    column: u8,
    depth: u8,
    bound: Bound,
}

struct Search {
    table: Vec<Option<Entry>>,
    nodes: u64,
    start: Instant,
    limit: SearchLimit,
}

impl Search {
    fn negamax(
        &mut self,
        position: Position,
        ply: u8,
        depth: u8,
        mut alpha: i16,
        beta: i16,
    ) -> Option<(i16, usize)> {
        let exhausted = match self.limit {
            SearchLimit::Time(limit) => {
                self.nodes.is_multiple_of(256) && self.start.elapsed() >= limit
            }
            SearchLimit::Nodes(limit) => self.nodes >= limit,
        };
        if exhausted {
            return None;
        }
        self.nodes += 1;

        let playable = position.playable();
        if playable == 0 {
            return Some((0, 0));
        }
        let opponent = position.occupied ^ position.own;
        let own_wins = winning_cells(position.own, position.occupied);
        if own_wins & playable != 0 {
            return Some((MATE - i16::from(ply + 1), first_column(own_wins & playable)));
        }
        let opponent_wins = winning_cells(opponent, position.occupied);
        let safe = safe_moves(playable, opponent_wins);
        if safe == 0 {
            return Some((i16::from(ply + 2) - MATE, first_column(playable)));
        }

        // Follow forced defenses even at the depth limit.
        if depth == 0 && safe.count_ones() > 1 {
            let preferred = if ply.is_multiple_of(2) {
                ODD_ROWS
            } else {
                CELLS ^ ODD_ROWS
            };
            let score = evaluate(position.own, own_wins, opponent_wins, preferred)
                - evaluate(opponent, opponent_wins, own_wins, CELLS ^ preferred);
            return Some((score, 0));
        }

        let key = position.key();
        let index = ((key.wrapping_mul(0x9e37_79b9_7f4a_7c15) >> 32) as usize) % TABLE_SIZE;
        let cached = self.table[index].filter(|entry| entry.key == key);
        if let Some(entry) = cached {
            if entry.depth >= depth
                && match entry.bound {
                    Bound::Exact => true,
                    Bound::Lower => entry.score >= beta,
                    Bound::Upper => entry.score <= alpha,
                }
            {
                return Some((entry.score, usize::from(entry.column)));
            }
        }

        let mut moves = [(0, 0, 0); 7];
        let mut count = 0;
        for (order, column) in COLUMNS.into_iter().enumerate() {
            let cell = column_cell(safe, column);
            if cell == 0 {
                continue;
            }
            let threats = winning_cells(position.own | cell, position.occupied | cell);
            let mut priority = 8 * threats.count_ones() as usize + 7 - order;
            if cached.is_some_and(|entry| usize::from(entry.column) == column) {
                priority += 512;
            }
            moves[count] = (priority, column, cell);
            count += 1;
        }
        moves[..count].sort_unstable_by_key(|&(priority, _, _)| std::cmp::Reverse(priority));

        let original_alpha = alpha;
        let mut best = (-MATE, moves[0].1);
        for &(_, column, cell) in &moves[..count] {
            let (reply, _) = self.negamax(
                position.play(cell),
                ply + 1,
                depth.saturating_sub(1),
                -beta,
                -alpha,
            )?;
            let score = -reply;
            if score > best.0 {
                best = (score, column);
            }
            alpha = alpha.max(score);
            if alpha >= beta {
                break;
            }
        }

        let bound = if best.0 <= original_alpha {
            Bound::Upper
        } else if best.0 >= beta {
            Bound::Lower
        } else {
            Bound::Exact
        };
        self.table[index] = Some(Entry {
            key,
            score: best.0,
            column: best.1 as u8,
            depth,
            bound,
        });
        Some(best)
    }
}

pub fn search(board: &BitBoard, limit: SearchLimit) -> Option<SearchResult> {
    let start = Instant::now();
    let a = board.stones(Side::A);
    let b = board.stones(Side::B);
    let ply = (a | b).count_ones() as u8;
    if ply == 42 || has_four(a) || has_four(b) {
        return None;
    }
    let position = Position {
        own: if ply.is_multiple_of(2) { a } else { b },
        occupied: a | b,
    };

    let playable = position.playable();
    let win = winning_cells(position.own, position.occupied) & playable;
    let opponent_wins = winning_cells(position.occupied ^ position.own, position.occupied);
    let safe = safe_moves(playable, opponent_wins);
    let (column, score, solved) = if win != 0 {
        (first_column(win), MATE - 1, true)
    } else if safe == 0 {
        (first_column(playable), 2 - MATE, true)
    } else {
        (first_column(safe), 0, false)
    };
    let mut result = SearchResult {
        column,
        score,
        solved,
        depth: 0,
        nodes: 0,
    };
    // The empty board's known winning opening is the center column.
    if solved || ply == 0 {
        return Some(result);
    }

    let mut search = Search {
        table: vec![None; TABLE_SIZE],
        nodes: 0,
        start,
        limit,
    };
    for depth in 1..=42 - ply {
        let Some((score, column)) = search.negamax(position, ply, depth, -MATE, MATE) else {
            break;
        };
        result.column = column;
        result.depth = depth;
        result.score = score;
        if score.abs() >= MATE - 42 {
            // The table stores absolute ply so its scores are independent of depth.
            result.score += score.signum() * i16::from(ply);
            result.solved = true;
            break;
        }
        if depth == 42 - ply {
            result.solved = true;
        }
    }
    result.nodes = search.nodes;
    Some(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand::{rngs::SmallRng, seq::IndexedRandom, SeedableRng};

    fn replay(moves: &str) -> BitBoard {
        let mut board = BitBoard::new();
        for digit in moves.bytes() {
            let column = usize::from(digit - b'1');
            assert!(board.calc_winner().is_none());
            assert!(board.can_put(column));
            board.put(column, board.calc_next());
        }
        board
    }

    #[test]
    fn handles_opening_and_finished_games() {
        let limit = SearchLimit::Nodes(0);
        assert_eq!(search(&BitBoard::new(), limit).unwrap().column, 3);
        assert!(search(&replay("1212121"), limit).is_none());

        let draw = "554312137511313657523325174464644272277666";
        assert!(search(&replay(draw), limit).is_none());
        let last_move = search(&replay(&draw[..41]), SearchLimit::Nodes(10)).unwrap();
        assert_eq!(last_move.column, 5);
        assert_eq!(last_move.score_label(), "Draw");
    }

    #[test]
    fn handles_immediate_tactics_even_with_no_budget() {
        let limit = SearchLimit::Nodes(0);
        let win = search(&replay("121212"), limit).unwrap();
        assert_eq!(win.column, 0);
        assert_eq!(win.score, MATE - 1);
        assert_eq!(search(&replay("1212134"), limit).unwrap().column, 0);

        // The center move supplies the square directly below the opponent's win.
        assert_ne!(
            search(&replay("7667575516351354"), limit).unwrap().column,
            3
        );

        let double_threat = search(&replay("47212132652362743525775434473"), limit).unwrap();
        assert_eq!(double_threat.score, 2 - MATE);
    }

    // Exhaustive reference using the game's original move generator and win checks.
    fn outcome_after(board: &BitBoard, column: usize) -> i16 {
        let mut child = board.clone();
        if child.put(column, child.calc_next()) {
            return 1;
        }
        -child
            .list_can_put()
            .into_iter()
            .map(|reply| outcome_after(&child, reply))
            .max()
            .unwrap_or(0)
    }

    #[test]
    fn agrees_with_exhaustive_endgames() {
        let mut rng = SmallRng::seed_from_u64(42);
        let mut checked = 0;
        for _ in 0..128 {
            let mut board = BitBoard::new();
            for _ in 0..34 {
                let side = board.calc_next();
                let continuations: Vec<_> = board
                    .list_can_put()
                    .into_iter()
                    .filter_map(|column| {
                        let mut child = board.clone();
                        (!child.put(column, side)).then_some(child)
                    })
                    .collect();
                let Some(next) = continuations.choose(&mut rng) else {
                    break;
                };
                board = next.clone();
            }
            if (board.stones(Side::A) | board.stones(Side::B)).count_ones() != 34 {
                continue;
            }
            let best = board
                .list_can_put()
                .into_iter()
                .map(|column| outcome_after(&board, column))
                .max()
                .unwrap();
            let result = search(&board, SearchLimit::Nodes(100_000)).unwrap();
            assert!(result.solved);
            assert_eq!(result.score.signum(), best, "board: {board:?}");
            assert_eq!(
                outcome_after(&board, result.column),
                best,
                "board: {board:?}"
            );
            checked += 1;
        }
        assert!(checked >= 64);
    }

    #[test]
    fn respects_node_budget_and_returns_a_legal_move() {
        let board = replay("4444");
        let shallow = search(&board, SearchLimit::Nodes(100)).unwrap();
        assert_eq!(shallow.nodes, 100);
        assert!(shallow.depth > 0);
        assert!(board.can_put(shallow.column));

        let deeper = search(&board, SearchLimit::Nodes(1_000)).unwrap();
        assert_eq!(deeper.nodes, 1_000);
        assert!(deeper.depth > shallow.depth);
        assert!(board.can_put(deeper.column));
    }
}
