use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn twice(data: f64) -> f64 {
    data * 2.0
}
