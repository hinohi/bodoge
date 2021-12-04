use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash, Serialize, Deserialize)]
pub enum Side {
    A,
    B,
}

impl Side {
    #[inline]
    pub fn flip(self) -> Side {
        match self {
            Side::A => Side::B,
            Side::B => Side::A,
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Hash, Deserialize)]
pub struct Board {
    cols: [Vec<Side>; 7],
}

#[derive(Debug, Clone, Eq, PartialEq, Hash, Deserialize, Default)]
pub struct BitBoard {
    a: u64,
    b: u64,
}

impl From<Board> for BitBoard {
    fn from(board: Board) -> BitBoard {
        let mut bit_board = Self::new();
        for (x, col) in board.cols.iter().enumerate() {
            for (y, &side) in col.iter().enumerate() {
                match side {
                    Side::A => bit_board.a += 1 << (y + x * 8),
                    Side::B => bit_board.b += 1 << (y + x * 8),
                }
            }
        }
        bit_board
    }
}

impl BitBoard {
    pub fn new() -> BitBoard {
        Default::default()
    }

    pub fn calc_next(&self) -> Side {
        let b = self.a ^ self.b;
        if b.count_ones() % 2 == 0 {
            Side::A
        } else {
            Side::B
        }
    }

    fn col_val(&self, col: usize) -> u64 {
        let b = self.a ^ self.b;
        b >> (col * 8) & 0xff
    }

    pub fn can_put(&self, col: usize) -> bool {
        self.col_val(col) < 0x3f
    }

    pub fn list_can_put(&self) -> Vec<usize> {
        (0..7).filter(|&col| self.can_put(col)).collect()
    }

    pub fn put(&mut self, col: usize, side: Side) -> bool {
        let o = self.col_val(col);
        let v = (o + 1) << (col * 8);
        let row = o.count_ones() as usize;
        match side {
            Side::A => {
                self.a += v;
                is_win(self.a, col, row)
            }
            Side::B => {
                self.b += v;
                is_win(self.b, col, row)
            }
        }
    }

    pub fn is_full(&self) -> bool {
        let b = self.a ^ self.b;
        b == 0x3f3f3f3f3f3f3f
    }

    pub fn calc_winner(&self) -> Option<Side> {
        use std::cmp::Ordering::*;
        let board = self.a ^ self.b;
        let mut w = None;
        for col in 0..7 {
            let count = (board >> (col * 8) & 0xff).count_ones() as usize;
            if count == 0 {
                continue;
            }
            let a = self.a >> (col * 8) & 0xff;
            let b = self.b >> (col * 8) & 0xff;
            match a.cmp(&b) {
                Greater => {
                    if is_win(self.a, col, count - 1) {
                        w = Some(Side::A);
                    }
                }
                Less => {
                    if is_win(self.b, col, count - 1) {
                        w = Some(Side::B);
                    }
                }
                Equal => (),
            };
        }
        w
    }
}

fn is_win(board: u64, col: usize, row: usize) -> bool {
    for &mask in FOUR[col][row].iter() {
        if board & mask == mask {
            return true;
        }
    }
    false
}

static FOUR: Lazy<[[Vec<u64>; 6]; 7]> = Lazy::new(|| {
    #[rustfmt::skip]
    let mut four = [
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
        [Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new(), Vec::new()],
    ];
    for (x, col) in four.iter_mut().enumerate() {
        for (y, v) in col.iter_mut().enumerate() {
            // 縦
            if y >= 3 {
                v.push(0b1111 << (y - 3 + x * 8));
            }
            // 横
            for dx in 0..=3 {
                if dx <= x && x - dx <= 3 {
                    v.push(0x01010101 << (y + (x - dx) * 8));
                }
            }
            // 左下から右上
            for i in 0..=3 {
                let x = x as isize - i;
                let y = y as isize - i;
                if (0..3).contains(&y) && (0..4).contains(&x) {
                    v.push(0x08040201 << (y + x * 8));
                }
            }
            // 左上から右下
            for i in 0..=3 {
                let x = x as isize - i;
                let y = y as isize + i;
                if (3..6).contains(&y) && (0..4).contains(&x) {
                    v.push(0x01020408 << (y - 3 + x * 8));
                }
            }
        }
    }
    four
});

#[cfg(test)]
mod tests {
    use super::*;
    use Side::*;

    fn put(col: usize, side: Side, board: &mut BitBoard) -> (Option<Side>, bool, bool) {
        assert!(board.can_put(col));
        assert_eq!(board.calc_next(), side);
        let t = board.put(col, side);
        (board.calc_winner(), t, board.is_full())
    }

    #[test]
    fn play_0() {
        let mut board = BitBoard::new();
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(4, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(5, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (Some(B), true, false));
    }

    #[test]
    fn play_1() {
        let mut board = BitBoard::new();
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(0, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (Some(B), true, false));
    }

    #[test]
    fn play_2() {
        let mut board = BitBoard::new();
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(5, B, &mut board), (None, false, false));
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(4, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(1, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(4, A, &mut board), (None, false, false));
        assert_eq!(put(0, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(1, B, &mut board), (None, false, false));
        assert_eq!(put(6, A, &mut board), (None, false, false));
        assert_eq!(put(1, B, &mut board), (None, false, false));
        assert_eq!(put(1, A, &mut board), (None, false, false));
        assert_eq!(put(1, B, &mut board), (None, false, false));
        assert_eq!(put(6, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(0, B, &mut board), (Some(B), true, false));
    }

    #[test]
    fn play_3() {
        let mut board = BitBoard::new();
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(3, A, &mut board), (None, false, false));
        assert_eq!(put(3, B, &mut board), (None, false, false));
        assert_eq!(put(5, A, &mut board), (None, false, false));
        assert_eq!(put(6, B, &mut board), (None, false, false));
        assert_eq!(put(5, A, &mut board), (None, false, false));
        assert_eq!(put(0, B, &mut board), (None, false, false));
        assert_eq!(put(5, A, &mut board), (None, false, false));
        assert_eq!(put(5, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(0, B, &mut board), (None, false, false));
        assert_eq!(put(2, A, &mut board), (None, false, false));
        assert_eq!(put(0, B, &mut board), (None, false, false));
        assert_eq!(put(0, A, &mut board), (None, false, false));
        assert_eq!(put(2, B, &mut board), (None, false, false));
        assert_eq!(put(6, A, &mut board), (None, false, false));
        assert_eq!(put(4, B, &mut board), (None, false, false));
        assert_eq!(put(4, A, &mut board), (Some(A), true, false));
    }

    #[test]
    fn is_full() {
        let mut board = BitBoard::new();
        let mut side = Side::A;
        for col in 0..7 {
            for _ in 0..6 {
                assert!(!board.is_full());
                board.put(col, side);
                side = side.flip();
            }
        }
        assert!(board.is_full());
    }
}
