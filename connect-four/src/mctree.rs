use std::time::Duration;
#[cfg(not(target_arch = "wasm32"))]
use std::time::Instant;

use rand::{seq::SliceRandom, Rng};

use crate::{Board, Side};

const WIN_POINT: f64 = 1.0;
const LOSE_POINT: f64 = 0.0;
const DRAW_POINT: f64 = 0.5;

fn choice_with_weight<R: Rng>(rng: &mut R, weight: &[f64]) -> usize {
    let sum = weight.iter().fold(0.0, |x, y| x + *y);
    let r = rng.gen_range(0.0..sum);
    let mut p = 0.0;
    for (i, w) in weight.iter().enumerate() {
        p += *w;
        if r <= p {
            return i;
        }
    }
    weight.len() - 1
}

fn random_down<R: Rng>(rng: &mut R, board: &Board, side: Side) -> f64 {
    let mut board = board.clone();
    let mut s = side;
    loop {
        let can = (0..7).filter(|&col| board.can_put(col)).collect::<Vec<_>>();
        if can.is_empty() {
            return DRAW_POINT;
        }
        let col = *can.choose(rng).unwrap();
        board.put(col, s);
        if board.is_winner(col) {
            return if s == side { WIN_POINT } else { LOSE_POINT };
        }
        s = s.flip();
    }
}

#[derive(Debug, Clone)]
struct Node {
    visited_count: u32,
    win_point: f64,
    board: Board,
    result: Option<f64>,
    children: Vec<Node>,
}

pub struct McTreeAI<R> {
    rng: R,
    limit: Duration,
    expansion_threshold: u32,
    c: f64,
}

impl Node {
    fn new(board: Board, is_lose: bool) -> Node {
        Node {
            visited_count: 0,
            win_point: 0.0,
            board,
            result: if is_lose { Some(LOSE_POINT) } else { None },
            children: Vec::new(),
        }
    }
}

impl<R: Rng> McTreeAI<R> {
    pub fn new(rng: R, limit: u64, expansion_threshold: u32, c: f64) -> McTreeAI<R> {
        McTreeAI {
            rng,
            limit: Duration::from_millis(limit),
            expansion_threshold,
            c,
        }
    }

    fn choice_child(&mut self, log_total_count: f64, node: &Node) -> usize {
        let mut weight = Vec::with_capacity(node.children.len());
        for (i, child) in node.children.iter().enumerate() {
            if child.visited_count == 0 {
                return i;
            }
            let a = 1.0 - child.win_point / child.visited_count as f64;
            let b = self.c * (log_total_count / child.visited_count as f64).sqrt();
            weight.push(a + b);
        }
        choice_with_weight(&mut self.rng, &weight)
    }

    fn selection(&mut self, log_total_count: f64, node: &mut Node, side: Side) -> f64 {
        node.visited_count += 1;
        if let Some(r) = node.result {
            node.win_point += r;
            return r;
        }
        if node.children.is_empty() {
            if node.visited_count <= self.expansion_threshold {
                let r = random_down(&mut self.rng, &node.board, side);
                node.win_point += r;
                return r;
            }
            for col in 0..7 {
                if !node.board.can_put(col) {
                    continue;
                }
                let mut board = node.board.clone();
                board.put(col, side);
                let is_win = board.is_winner(col);
                if is_win {
                    node.result = Some(WIN_POINT);
                    node.children = vec![Node::new(board, true)];
                    node.children[0].visited_count += 1;
                    node.win_point += WIN_POINT;
                    return WIN_POINT;
                } else {
                    node.children.push(Node::new(board, false));
                }
            }
        }
        let i = self.choice_child(log_total_count, node);
        let p = 1.0 - self.selection(log_total_count, &mut node.children[i], side.flip());
        node.win_point += p;
        p
    }

    pub fn search(&mut self, board: &Board) -> (usize, f64) {
        let start = Instant::now();
        let side = board.calc_next();
        let mut node = Node::new(board.clone(), false);
        let mut total_count = 0;
        while start.elapsed() < self.limit && node.result.is_none() {
            for _ in 0..1000 {
                total_count += 1;
                self.selection((total_count as f64).ln(), &mut node, side);
            }
        }
        let best = node
            .children
            .iter()
            .max_by(|x, y| {
                use std::cmp::Ordering::*;
                if x.result == Some(LOSE_POINT) {
                    Greater
                } else if y.result == Some(LOSE_POINT) {
                    Less
                } else {
                    x.visited_count.cmp(&y.visited_count)
                }
            })
            .unwrap();
        for col in 0..7 {
            if !board.can_put(col) {
                continue;
            }
            let mut board = board.clone();
            board.put(col, side);
            if board == best.board {
                return (col, best.win_point / best.visited_count as f64);
            }
        }
        (0, 0.0)
    }
}

#[cfg(target_arch = "wasm32")]
struct Instant(f64);

#[cfg(target_arch = "wasm32")]
impl Instant {
    fn now() -> Instant {
        Instant(js_sys::Date::now())
    }

    fn elapsed(&self) -> Duration {
        Duration::from_secs_f64((js_sys::Date::now() - self.0) / 1000.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rand_pcg::Pcg32;

    #[test]
    fn smoke() {
        let rng = Pcg32::new(1, 11634580027462260723);
        let mut ai = McTreeAI::new(rng, 10, 2, 2.0);
        let mut board = Board::new();
        let mut side = Side::A;
        while board.calc_winner().is_none() {
            let (pos, f) = ai.search(&board);
            assert!(board.can_put(pos));
            assert!(0.0 <= f && f <= 1.0);
            board.put(pos, side);
            side = side.flip();
        }
    }
}
