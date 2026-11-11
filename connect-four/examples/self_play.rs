use std::{env, process::ExitCode, time::Duration, time::Instant};

use connect_four::{search, BitBoard, McTreeAI, SearchLimit};
use rand::{rngs::SmallRng, seq::IndexedRandom, SeedableRng};

const USAGE: &str = "Usage: self_play [--a search:200ms] [--b mctree:200ms] \
[--pairs 8] [--seed 1] [--opening-plies 4]\n\
Engines: search:<N>ms, search:<N>nodes, mctree:<N>ms.\n\
Each pair plays the same opening twice with the engines swapping sides.";

#[derive(Clone, Copy)]
enum Engine {
    Search(SearchLimit),
    McTree(u64),
}

impl Engine {
    fn parse(spec: &str) -> Result<Self, String> {
        let engine = match spec.split_once(':') {
            Some((name, budget)) => match (
                name,
                budget.strip_suffix("ms"),
                budget.strip_suffix("nodes"),
            ) {
                ("search", Some(ms), _) => {
                    Self::Search(SearchLimit::Time(Duration::from_millis(positive(ms)?)))
                }
                ("search", _, Some(nodes)) => Self::Search(SearchLimit::Nodes(positive(nodes)?)),
                ("mctree", Some(ms), _) => Self::McTree(positive(ms)?),
                _ => return Err(format!("invalid engine: {spec}")),
            },
            None => return Err(format!("invalid engine: {spec}")),
        };
        Ok(engine)
    }

    fn choose(self, board: &BitBoard, seed: u64) -> usize {
        match self {
            Self::Search(limit) => search(board, limit).expect("game in progress").column,
            Self::McTree(ms) => {
                McTreeAI::new(SmallRng::seed_from_u64(seed), ms, 2, 2.0)
                    .search(board)
                    .0
            }
        }
    }
}

fn positive(value: &str) -> Result<u64, String> {
    value
        .parse()
        .ok()
        .filter(|&n| n > 0)
        .ok_or_else(|| format!("expected a positive integer, got {value}"))
}

#[derive(Default)]
struct Stats {
    wins: u64,
    first_wins: u64,
    times: Vec<Duration>,
}

impl Stats {
    fn print(mut self, label: &str, spec: &str, games: u64, draws: u64) {
        self.times.sort_unstable();
        let count = self.times.len();
        let average_ms =
            self.times.iter().map(Duration::as_secs_f64).sum::<f64>() * 1000.0 / count as f64;
        let p95 = self.times[(count * 95).div_ceil(100) - 1].as_secs_f64() * 1000.0;
        let max = self.times[count - 1].as_secs_f64() * 1000.0;
        println!(
            "{label} ({spec}): {} wins ({} first / {} second), {} losses, {draws} draws; \
             move time mean {average_ms:.1}ms / p95 {p95:.1}ms / max {max:.1}ms",
            self.wins,
            self.first_wins,
            self.wins - self.first_wins,
            games - self.wins - draws,
        );
    }
}

fn run() -> Result<(), String> {
    let mut specs = ["search:200ms".to_owned(), "mctree:200ms".to_owned()];
    let mut pairs = 8;
    let mut seed = 1;
    let mut opening_plies = 4;
    let mut args = env::args().skip(1);
    while let Some(flag) = args.next() {
        if flag == "--help" || flag == "-h" {
            println!("{USAGE}");
            return Ok(());
        }
        let value = args
            .next()
            .ok_or_else(|| format!("missing value for {flag}"))?;
        match flag.as_str() {
            "--a" => specs[0] = value,
            "--b" => specs[1] = value,
            "--pairs" => pairs = positive(&value)?,
            "--seed" => {
                seed = value
                    .parse()
                    .map_err(|_| "seed must be an unsigned integer")?
            }
            "--opening-plies" => {
                opening_plies = value
                    .parse()
                    .map_err(|_| "opening plies must be between 0 and 6")?;
                if !(0..=6).contains(&opening_plies) {
                    return Err("opening plies must be between 0 and 6".to_owned());
                }
            }
            _ => return Err(format!("unknown option: {flag}")),
        }
    }
    let games = pairs.checked_mul(2).ok_or("too many pairs")?;
    let engines = [Engine::parse(&specs[0])?, Engine::parse(&specs[1])?];
    let mut rng = SmallRng::seed_from_u64(seed);
    let mut stats = [Stats::default(), Stats::default()];
    let mut draws = 0;

    println!(
        "A={} B={} pairs={pairs} seed={seed} opening_plies={opening_plies}",
        specs[0], specs[1]
    );
    for pair in 1..=pairs {
        let mut opening = BitBoard::new();
        let mut prefix = String::new();
        for _ in 0..opening_plies {
            let column = *opening.list_can_put().choose(&mut rng).unwrap();
            opening.put(column, opening.calc_next());
            prefix.push(char::from(b'1' + column as u8));
        }

        // Use the same seed for a given engine and move number across each pair.
        let move_seeds: [[u64; 42]; 2] = rand::RngExt::random(&mut rng);
        for first in 0..2 {
            let mut board = opening.clone();
            let mut moves = prefix.clone();
            let mut winner = None;
            while !board.is_full() {
                let side = board.calc_next();
                let engine = (first + moves.len() % 2) % 2;
                let start = Instant::now();
                let column = engines[engine].choose(&board, move_seeds[engine][moves.len()]);
                stats[engine].times.push(start.elapsed());
                assert!(
                    column < 7 && board.can_put(column),
                    "illegal move: {column}, game: {moves}"
                );
                moves.push(char::from(b'1' + column as u8));
                if board.put(column, side) {
                    winner = Some(engine);
                    break;
                }
            }
            let result = match winner {
                Some(engine) => {
                    stats[engine].wins += 1;
                    stats[engine].first_wins += u64::from(engine == first);
                    if engine == 0 {
                        "A wins"
                    } else {
                        "B wins"
                    }
                }
                None => {
                    draws += 1;
                    "draw"
                }
            };
            let first_label = if first == 0 { 'A' } else { 'B' };
            println!("Pair {pair}, {first_label} first: {result}, moves={moves}");
        }
    }
    let [a, b] = stats;
    a.print("A", &specs[0], games, draws);
    b.print("B", &specs[1], games, draws);
    Ok(())
}

fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}\n{USAGE}");
            ExitCode::FAILURE
        }
    }
}
