use rand::{rngs::SmallRng, seq::SliceRandom, Rng, SeedableRng};
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

#[derive(Debug, Serialize)]
pub struct SearchResponse {
    pub position: Option<u32>,
    pub score: i32,
}

pub fn search(board: &[CellType; 9], next: CellType) -> SearchResponse {
    debug_assert!(next != E);

    fn dfs<R: Rng>(rng: &mut R, board: &mut [CellType; 9], next: CellType) -> SearchResponse {
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
                    let score = -r.score / 2;
                    board[pos] = E;

                    if score == best_score {
                        best.push(pos);
                        best_score = score;
                    } else if score > best_score {
                        best = vec![pos];
                        best_score = score;
                    }
                }
                SearchResponse {
                    position: Some(*best.choose(rng).unwrap() as u32),
                    score: best_score,
                }
            }
            Some(E) => SearchResponse {
                position: None,
                score: 0,
            },
            Some(c) => {
                if c == next {
                    SearchResponse {
                        position: None,
                        score: 1024,
                    }
                } else {
                    SearchResponse {
                        position: None,
                        score: -1024,
                    }
                }
            }
        }
    }

    #[cfg(target_arch = "wasm32")]
    let seed = (js_sys::Math::random() * 2f64.powi(64)) as u64;
    #[cfg(not(target_arch = "wasm32"))]
    let seed = {
        use rand::RngCore;
        rand::thread_rng().next_u64()
    };
    let mut rng = SmallRng::seed_from_u64(seed);
    dfs(&mut rng, &mut board.clone(), next)
}

#[wasm_bindgen(js_name = search)]
pub fn js_search(board: &JsValue, next: &str) -> Result<JsValue, JsValue> {
    let board = board.into_serde().map_err(|e| e.to_string())?;
    let next = if next == "X" { X } else { O };
    JsValue::from_serde(&search(&board, next)).map_err(|e| e.to_string().into())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[cfg(target_arch = "wasm32")]
    use wasm_bindgen_test::*;

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
        let r = search(&[E; 9], O);
        assert!(r.position.is_some());
        assert_eq!(r.score, 0);

        // One turn.
        let r = search(&[X, X, E, O, O, E, E, E, E], X);
        assert_eq!(r.position, Some(2));
        assert!(r.score > 0);
        let r = search(&[X, X, E, O, O, E, E, E, E], O);
        assert_eq!(r.position, Some(5));
        assert!(r.score > 0);

        // Next is X, X is a must win on this board.
        //    | O |
        // ---+---+---
        //    | X |
        // ---+---+---
        //    |   |
        let r = search(&[X, O, E, E, X, E, E, E, E], O);
        assert_eq!(r.position, Some(8));
        assert!(r.score < 0);
    }

    #[cfg(target_arch = "wasm32")]
    #[wasm_bindgen_test]
    fn test_js_search() {
        let board =
            js_sys::JSON::parse(r#"["X", "X", "E", "O", "O", "E", "E", "E", "E"]"#).unwrap();
        js_search(&board, "X").unwrap();
    }
}
