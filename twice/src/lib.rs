use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn twice(data: &JsValue) -> Result<JsValue, JsValue> {
    let data = data.into_serde::<f64>().map_err(|e| e.to_string())?;
    JsValue::from_serde(&(data * 2.0)).map_err(|e| e.to_string().into())
}
