mod board;
mod search;

use rand::{rngs::SmallRng, SeedableRng};
use serde::Serialize;
use wasm_bindgen::prelude::*;

pub use crate::board::*;
use crate::search::{search, Playout};

#[wasm_bindgen(js_name = calculateWinner)]
pub fn js_calculate_winner(board: &JsValue) -> Result<JsValue, JsValue> {
    let board: Board = board.into_serde().map_err(|e| e.to_string())?;
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

#[wasm_bindgen(js_name = search)]
pub fn js_search(board: &JsValue) -> Result<JsValue, JsValue> {
    let mut board: Board = board.into_serde().map_err(|e| e.to_string())?;

    fn none_response() -> JsValue {
        JsValue::from_serde(&SearchResponse {
            position: None,
            score: "".to_owned(),
        })
        .unwrap()
    }

    if board.is_full() {
        return Ok(none_response());
    }

    #[cfg(target_arch = "wasm32")]
    let seed = (js_sys::Math::random() * 2f64.powi(64)) as u64;
    #[cfg(not(target_arch = "wasm32"))]
    let seed = {
        use rand::RngCore;
        rand::thread_rng().next_u64()
    };
    let rng = SmallRng::seed_from_u64(seed);
    let mut eval = Playout::new(rng, 64);
    let (position, score) = search(&mut eval, &mut board);
    if !board.can_put(position) {
        return Ok(none_response());
    }
    JsValue::from_serde(&SearchResponse {
        position: Some(position as u32),
        score,
    })
    .map_err(|e| e.to_string().into())
}
