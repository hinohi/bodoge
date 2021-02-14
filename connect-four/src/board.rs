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

impl Default for Board {
    fn default() -> Board {
        const V: Vec<Side> = Vec::new();
        Board { cols: [V; 7] }
    }
}

impl Board {
    pub fn new() -> Board {
        Default::default()
    }

    pub fn calc_next(&self) -> Side {
        let c = self.cols.iter().map(|c| c.len()).sum::<usize>();
        if c % 2 == 0 {
            Side::A
        } else {
            Side::B
        }
    }

    pub fn can_put(&self, col: usize) -> bool {
        self.cols[col].len() < 6
    }

    pub fn put(&mut self, col: usize, side: Side) {
        self.cols[col].push(side);
    }

    pub fn back(&mut self, col: usize) {
        self.cols[col].pop();
    }

    pub fn is_full(&self) -> bool {
        self.cols.iter().all(|c| c.len() >= 6)
    }

    pub fn calc_winner(&self) -> Option<Side> {
        for col in self.cols.iter() {
            let r = check_conn(col.iter());
            if r.is_some() {
                return r;
            }
        }
        for row in 0..6 {
            let r = check_dis(self.cols.iter().map(|c| c.get(row)));
            if r.is_some() {
                return r;
            }
        }
        for col0 in 0..4 {
            for row0 in 0..4 {
                let r = check_dis(
                    self.cols
                        .iter()
                        .skip(col0)
                        .enumerate()
                        .map(|(i, c)| c.get(row0 + i)),
                );
                if r.is_some() {
                    return r;
                }
            }
        }
        for col0 in 0..4 {
            for row0 in 3..7 {
                let r = check_dis(
                    self.cols
                        .iter()
                        .skip(col0)
                        .take(row0 + 1)
                        .enumerate()
                        .map(|(i, c)| c.get(row0 - i)),
                );
                if r.is_some() {
                    return r;
                }
            }
        }
        None
    }

    pub fn is_winner(&self, col: usize) -> bool {
        if check_conn(self.cols[col].iter()).is_some() {
            return true;
        }
        let row = self.cols[col].len() - 1;
        if check_dis(self.cols.iter().map(|c| c.get(row))).is_some() {
            return true;
        }

        let offset = col.min(row);
        if check_dis(
            self.cols
                .iter()
                .skip(col - offset)
                .enumerate()
                .map(|(i, c)| c.get(row + i - offset)),
        )
        .is_some()
        {
            return true;
        }
        let offset = col.min(5 - row);
        if check_dis(
            self.cols
                .iter()
                .skip(col - offset)
                .take(row + offset + 1)
                .enumerate()
                .map(|(i, c)| c.get(row + offset - i)),
        )
        .is_some()
        {
            return true;
        }
        false
    }
}

fn check_conn<'a, I: Iterator<Item = &'a Side>>(mut iter: I) -> Option<Side> {
    let mut side = *iter.next()?;
    'OUT: loop {
        for _ in 0..3 {
            if side != *iter.next()? {
                side = side.flip();
                continue 'OUT;
            }
        }
        break Some(side);
    }
}

fn check_dis<'a, I: Iterator<Item = Option<&'a Side>>>(mut iter: I) -> Option<Side> {
    macro_rules! next_some {
        ($iter:ident) => {
            loop {
                let r = iter.next()?;
                if r.is_some() {
                    break *r.unwrap();
                }
            }
        };
    }
    let mut side = next_some!(iter);
    'OUT: loop {
        for _ in 0..3 {
            match iter.next()? {
                None => {
                    side = next_some!(iter);
                    continue 'OUT;
                }
                Some(&s) => {
                    if s != side {
                        side = s;
                        continue 'OUT;
                    }
                }
            }
        }
        break Some(side);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use Side::*;

    fn put(col: usize, side: Side, board: &mut Board) -> (Option<Side>, bool, bool) {
        assert!(board.can_put(col));
        assert_eq!(board.calc_next(), side);
        board.put(col, side);
        (board.calc_winner(), board.is_winner(col), board.is_full())
    }

    #[test]
    fn play_0() {
        let mut board = Board::new();
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
        let mut board = Board::new();
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
        let mut board = Board::new();
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
        let mut board = Board::new();
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
}
