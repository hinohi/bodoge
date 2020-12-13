use rand::{rngs::SmallRng, seq::SliceRandom, thread_rng, Rng, SeedableRng};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use CellType::*;

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum CellType {
    E,
    X,
    O,
}

impl CellType {
    pub fn flip(self) -> CellType {
        match self {
            X => O,
            O => X,
            E => E,
        }
    }
}

pub fn calculate_winner(board: &[CellType; 9]) -> Option<CellType> {
    static LINES: &[[usize; 3]] = &[
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for &[a, b, c] in LINES.iter() {
        if board[a] != E && board[a] == board[b] && board[a] == board[c] {
            return Some(board[a]);
        }
    }
    if board.iter().all(|&c| c != E) {
        Some(E)
    } else {
        None
    }
}

#[wasm_bindgen(js_name = calculateWinner)]
pub fn js_calculate_winner(board: &JsValue) -> Result<JsValue, JsValue> {
    let board = board.into_serde().map_err(|e| e.to_string())?;
    let winner = calculate_winner(&board);
    JsValue::from_serde(&winner).map_err(|e| e.to_string().into())
}

pub fn search(board: &[CellType; 9], next: CellType) -> (Option<usize>, i32) {
    debug_assert!(next != E);

    fn dfs<R: Rng>(rng: &mut R, board: &mut [CellType; 9], next: CellType) -> (Option<usize>, i32) {
        let winner = calculate_winner(board);
        match winner {
            None => {
                let mut best = Vec::new();
                let mut best_score = i32::MIN;
                for pos in 0..9 {
                    if board[pos] != E {
                        continue;
                    }
                    board[pos] = next;
                    let r = dfs(rng, board, next.flip());
                    // flip and reduce
                    let score = -r.1 / 2;
                    board[pos] = E;

                    if score == best_score {
                        best.push(pos);
                        best_score = score;
                    } else if score > best_score {
                        best = vec![pos];
                        best_score = score;
                    }
                }
                (Some(*best.choose(rng).unwrap()), best_score)
            }
            Some(E) => (None, 0),
            Some(c) => {
                if c == next {
                    (None, 1024)
                } else {
                    (None, -1024)
                }
            }
        }
    }

    let mut rng = SmallRng::from_rng(thread_rng()).unwrap();
    dfs(&mut rng, &mut board.clone(), next)
}

#[wasm_bindgen(js_name = search)]
pub fn js_search(board: &JsValue, next: &JsValue) -> Result<JsValue, JsValue> {
    let board = board.into_serde().map_err(|e| e.to_string())?;
    let next = next.into_serde().map_err(|e| e.to_string())?;
    let result = search(&board, next);
    JsValue::from_serde(&result).map_err(|e| e.to_string().into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calc_winner() {
        assert_eq!(calculate_winner(&[E; 9]), None);
        assert_eq!(calculate_winner(&[X, X, X, E, E, E, E, E, E]), Some(X));
        assert_eq!(calculate_winner(&[X, X, E, O, O, O, E, E, E]), Some(O));
        assert_eq!(calculate_winner(&[O, O, X, X, X, O, O, X, X]), Some(E));
    }

    #[test]
    fn test_search() {
        // The "tic tac toe" result is a tie.
        let (pos, score) = search(&[E; 9], O);
        assert!(pos.is_some());
        assert_eq!(score, 0);

        // One turn.
        let (pos, score) = search(&[X, X, E, O, O, E, E, E, E], X);
        assert_eq!(pos, Some(2));
        assert!(score > 0);
        let (pos, score) = search(&[X, X, E, O, O, E, E, E, E], O);
        assert_eq!(pos, Some(5));
        assert!(score > 0);

        // Next is X, X is a must win on this board.
        //    | O |
        // ---+---+---
        //    | X |
        // ---+---+---
        //    |   |
        let (pos, score) = search(&[X, O, E, E, X, E, E, E, E], O);
        assert_eq!(pos, Some(8));
        assert!(score < 0);
    }
}
