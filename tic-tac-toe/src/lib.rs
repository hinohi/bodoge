use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use CellType::*;

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum CellType {
    E,
    X,
    O,
}

pub fn calculate_winner(board: [CellType; 9]) -> CellType {
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
            return board[a];
        }
    }
    return E;
}

#[wasm_bindgen(js_name = calculateWinner)]
pub fn js_calculate_winner(data: &JsValue) -> Result<JsValue, JsValue> {
    let board = data.into_serde().map_err(|e| e.to_string())?;
    let winner = calculate_winner(board);
    JsValue::from_serde(&winner).map_err(|e| e.to_string().into())
}
