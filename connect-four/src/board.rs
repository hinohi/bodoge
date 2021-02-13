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
        let row = self.cols[col].len() - 1;
        if row >= 4 {}
        false
    }
}

fn check_conn<'a, I: Iterator<Item = &'a Side>>(mut iter: I) -> Option<Side> {
    let side = iter.next()?;
    for _ in 0..3 {
        if side != iter.next()? {
            return check_conn(iter);
        }
    }
    Some(*side)
}

fn check_dis<'a, I: Iterator<Item = Option<&'a Side>>>(mut iter: I) -> Option<Side> {
    let side = loop {
        let r = iter.next()?;
        if r.is_some() {
            break r;
        }
    };
    for _ in 0..3 {
        if side != iter.next()? {
            return check_dis(iter);
        }
    }
    side.copied()
}
