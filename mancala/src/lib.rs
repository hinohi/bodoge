use mancala_rust::{build_ai, Board};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

fn parse_board(board: &JsValue) -> Result<Board, JsValue> {
    from_value(board.clone()).map_err(|e| JsValue::from_str(&e.to_string()))
}

fn calculate_score(board: &Board) -> Option<(u8, u8)> {
    if board.is_finished() {
        Some(board.last_scores())
    } else {
        None
    }
}

#[wasm_bindgen(js_name = calculateScore)]
pub fn js_calculate_score(board: &JsValue) -> Result<JsValue, JsValue> {
    let board = parse_board(board)?;
    let scores = calculate_score(&board);
    Ok(to_value(&scores)?)
}

fn calculate_moved(board: &Board, pos: &[usize]) -> Result<Board, String> {
    let mut board = board.clone();
    for &pos in pos {
        board.can_sow(pos)?;
        board.sow(pos);
    }
    Ok(board)
}

#[wasm_bindgen(js_name = calculateMoved)]
pub fn js_calculate_moved(board: &JsValue, pos: u32) -> Result<JsValue, JsValue> {
    let board = parse_board(board)?;
    let board = calculate_moved(&board, &[pos as usize]).map_err(|e| JsValue::from_str(&e))?;
    Ok(to_value(&board)?)
}

fn search(board: &Board, searcher: &str) -> Result<Board, String> {
    let mut searcher = build_ai(board.stealing(), searcher)?;
    let pos = searcher.sow(board);
    Ok(calculate_moved(board, &pos).unwrap())
}

#[wasm_bindgen(js_name = search)]
pub fn js_search(board: &JsValue, searcher: &str) -> Result<JsValue, JsValue> {
    let board = parse_board(board)?;
    let board = search(&board, searcher).map_err(|e| JsValue::from_str(&e))?;
    Ok(to_value(&board)?)
}

#[cfg(target_arch = "wasm32")]
#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn test_js_calculate_score() {
        let board = js_sys::JSON::parse(
            r#"{
            "side": "First",
            "stealing": true,
            "seeds": [[4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4]],
            "score": [0, 0]
        }"#,
        )
        .unwrap();
        assert_eq!(js_calculate_score(&board), Ok(JsValue::NULL));

        assert!(js_sys::JSON::parse(
            r#"{
            "side": "First",
            "stealing": true,
            "seeds": [[0, 0, 0, 0, 0, 0], [4, 4, 4, 4, 4, 4]],
            "score": [12, 12]
        }"#,
        )
        .is_ok());
    }
}
