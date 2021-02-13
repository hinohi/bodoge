use std::collections::HashMap;
use std::fmt::Debug;

use rand::{seq::SliceRandom, Rng};

use crate::{Board, Side};

pub fn search<E: Eval>(eval: &mut E, board: &mut Board) -> (usize, String) {
    let mut mem = Vec::with_capacity(6);
    for _ in 0..mem.len() {
        mem.push(HashMap::with_capacity(7));
    }
    let side = board.calc_next();
    let mut best_score = E::Score::MIN;
    let mut best_col = 0;
    for col in 0..7 {
        if !board.can_put(col) {
            continue;
        }
        board.put(col, side);
        let a = ab_search(
            eval,
            board,
            side.flip(),
            0,
            &mut mem,
            best_score,
            E::Score::MAX,
        )
        .flip();
        board.back(col);
        if a > best_score {
            best_score = a;
            best_col = col;
        }
    }
    (best_col, format!("{:?}", best_score))
}

fn ab_search<E: Eval>(
    eval: &mut E,
    board: &mut Board,
    side: Side,
    depth: usize,
    mem: &mut [HashMap<Board, E::Score>],
    alpha: E::Score,
    beta: E::Score,
) -> E::Score {
    if mem.len() <= depth {
        return eval.eval(board, side);
    }
    if let Some(s) = mem[depth].get(board) {
        return *s;
    }
    if board.is_full() {
        return E::Score::DRAW;
    }
    let mut alpha = alpha;
    for col in 0..7 {
        if !board.can_put(col) {
            continue;
        }
        board.put(col, side);
        if board.is_winner(col) {
            board.back(col);
            return E::Score::MAX;
        }
        let a = ab_search(
            eval,
            board,
            side.flip(),
            depth + 1,
            mem,
            beta.flip(),
            alpha.flip(),
        )
        .flip();
        board.back(col);
        if a > alpha {
            alpha = a;
        }
        if alpha >= beta {
            break;
        }
    }
    mem[depth].insert(board.clone(), alpha);
    alpha
}

pub trait Eval {
    type Score: Score;
    fn eval(&mut self, board: &Board, side: Side) -> Self::Score;
}

pub trait Score: Copy + PartialOrd + Debug {
    const MAX: Self;
    const MIN: Self;
    const DRAW: Self;
    fn flip(self) -> Self;
}

pub struct Playout<R> {
    rng: R,
    n: u32,
}

impl<R> Playout<R> {
    pub fn new(rng: R, n: u32) -> Playout<R> {
        Playout { rng, n }
    }
}

impl Score for (f64, f64) {
    const MAX: Self = (1.0, 0.0);
    const MIN: Self = (0.0, 0.0);
    const DRAW: Self = (0.0, 1.0);
    fn flip(self) -> Self {
        (1.0 - self.0 - self.1, self.1)
    }
}

impl<R: Rng> Eval for Playout<R> {
    type Score = (f64, f64);
    fn eval(&mut self, board: &Board, side: Side) -> (f64, f64) {
        let mut win = 0;
        let mut draw = 0;
        for _ in 0..self.n {
            let mut board = board.clone();
            let mut s = side;
            loop {
                let can = (0..7).filter(|&col| board.can_put(col)).collect::<Vec<_>>();
                if can.is_empty() {
                    draw += 1;
                    break;
                }
                let col = *can.choose(&mut self.rng).unwrap();
                board.put(col, s);
                if board.is_winner(col) {
                    if s == side {
                        win += 1;
                    }
                    break;
                }
                s = s.flip();
            }
        }
        (win as f64 / self.n as f64, draw as f64 / self.n as f64)
    }
}
