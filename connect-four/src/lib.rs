mod board;
mod mctree;

use rand::{rngs::SmallRng, SeedableRng};
use serde::Serialize;
use wasm_bindgen::prelude::*;

pub use crate::board::*;
use crate::mctree::McTreeAI;

#[wasm_bindgen(js_name = calculateWinner)]
pub fn js_calculate_winner(board: &JsValue) -> Result<JsValue, JsValue> {
    let board: Board = board.into_serde().map_err(|e| e.to_string())?;
    let board = BitBoard::from(board);
    let winner = board.calc_winner();
    match winner {
        Some(Side::A) => Ok("A".into()),
        Some(Side::B) => Ok("B".into()),
        None => {
            if board.is_full() {
                Ok("F".into())
            } else {
                Ok(JsValue::null())
            }
        }
    }
}

#[derive(Debug, Serialize)]
pub struct SearchResponse {
    pub position: Option<u32>,
    pub score: String,
}

fn none_response() -> JsValue {
    JsValue::from_serde(&SearchResponse {
        position: None,
        score: "".to_owned(),
    })
    .unwrap()
}

fn gen_rng() -> SmallRng {
    #[cfg(target_arch = "wasm32")]
    let seed = (js_sys::Math::random() * 2f64.powi(64)) as u64;
    #[cfg(not(target_arch = "wasm32"))]
    let seed = {
        use rand::RngCore;
        rand::thread_rng().next_u64()
    };
    SmallRng::seed_from_u64(seed)
}

#[wasm_bindgen(js_name = mctree)]
pub fn js_mctree(
    board: &JsValue,
    limit: u32,
    expansion_threshold: u32,
    c: f64,
) -> Result<JsValue, JsValue> {
    let board: Board = board.into_serde().map_err(|e| e.to_string())?;
    let board = BitBoard::from(board);
    if board.is_full() {
        return Ok(none_response());
    }
    let mut ai = McTreeAI::new(gen_rng(), limit as u64, expansion_threshold, c);
    let (position, score) = ai.search(&board);
    if !board.can_put(position) {
        return Ok(none_response());
    }
    JsValue::from_serde(&SearchResponse {
        position: Some(position as u32),
        score: score.to_string(),
    })
    .map_err(|e| e.to_string().into())
}

#[cfg(target_arch = "wasm32")]
#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn smoke_mctree() {
        let board = js_sys::JSON::parse(
            r#"{
        "cols": [
            [],
            [],
            [],
            ["A", "B"],
            [],
            [],
            []
        ]
}"#,
        )
        .unwrap();
        js_mctree(&board, 10, 2, 2.0).unwrap();
    }
}
