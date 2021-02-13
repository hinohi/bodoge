mod board;

use wasm_bindgen::prelude::*;

pub use board::*;

#[wasm_bindgen(js_name = calculateWinner)]
pub fn js_calculate_winner(board: &JsValue) -> Result<JsValue, JsValue> {
    let board: Board = board.into_serde().map_err(|e| e.to_string())?;
    let winner = board.calc_winner();
    JsValue::from_serde(&winner).map_err(|e| e.to_string().into())
}
