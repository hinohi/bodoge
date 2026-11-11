import {
  applyMove,
  type Board,
  CELLS,
  countTiles,
  fits,
  legalMoves,
  MAX_TILE,
  type Move,
  type Position,
  SIDE,
  shuffle,
  unseenTiles,
} from './game';

export type Difficulty = 'basic' | 'strategic' | 'expert';

const MAX_CANDIDATES = 12;
const MAX_WORLDS = 192;
const MAX_SEARCH_MS = 300;
const ROLLOUT_TURNS = 40;

const rangeValue = Array.from({ length: MAX_TILE + 1 }, (_, width) => 0.42 * Math.log1p(width));
const idealTile = Array.from({ length: CELLS }, (_, i) => 2.5 + 2.65 * (Math.floor(i / SIDE) + (i % SIDE)));

function basicMove(position: Position, moves: Move[], random: () => number): Move {
  const board = position.boards[position.turn];
  const additions = moves.filter((move) => (move.type === 'take' || move.type === 'place') && !board[move.cell]);
  return (
    additions[Math.floor(random() * additions.length)] ??
    moves.find((move) => move.type === 'draw' || move.type === 'discard') ??
    moves[0]
  );
}

function boardValue(board: Board, changedCell = -1, tile = 0): number {
  // Propagate bounds across both axes, leaving an integer for each intervening cell.
  // An empty cell can be legal to play yet incompatible with a completed grid.
  const lower = new Int8Array(CELLS);
  const upper = new Int8Array(CELLS);
  for (let cell = 0; cell < CELLS; cell++) {
    const left = cell % SIDE ? lower[cell - 1] : 0;
    const above = cell >= SIDE ? lower[cell - SIDE] : 0;
    lower[cell] = Math.max(cell === changedCell ? tile : board[cell], 1 + Math.max(left, above));
  }
  let score = 0;
  for (let cell = CELLS - 1; cell >= 0; cell--) {
    const right = cell % SIDE < SIDE - 1 ? upper[cell + 1] : MAX_TILE + 1;
    const below = cell < CELLS - SIDE ? upper[cell + SIDE] : MAX_TILE + 1;
    const value = cell === changedCell ? tile : board[cell];
    upper[cell] = Math.min(value || MAX_TILE, Math.min(right, below) - 1);
    if (value) {
      score += 2.35 - 0.055 * Math.abs(idealTile[cell] - value);
    } else {
      const width = upper[cell] - lower[cell] + 1;
      score += width > 0 ? rangeValue[width] : -0.75 + 0.06 * Math.max(width, -10);
    }
  }
  return score;
}

function finishesWith(board: Board, tile: number): boolean {
  const cell = board.indexOf(0);
  return cell >= 0 && cell === board.lastIndexOf(0) && fits(board, tile, cell);
}

function rateMoves(position: Position, moves: Move[], unseen?: number[]): { move: Move; score: number }[] {
  const { boards, turn, market, remaining, drawn } = position;
  const board = boards[turn];
  const occupied = countTiles(board);
  const baseline = boardValue(board);
  const nextBoard = boards[(turn + 1) % boards.length];
  const marketWins = new Set(market.filter((tile) => finishesWith(nextBoard, tile)));
  const values = new Map<number, number>();
  const drawValue = () => {
    // The rollout policy uses a cheaper estimate than the root policy.
    if (!unseen) return baseline + 0.52;
    let sum = 0;
    for (const tile of unseen) {
      let best = values.get(tile);
      if (best === undefined) {
        best = baseline;
        for (let cell = 0; cell < CELLS; cell++) {
          if (!fits(board, tile, cell)) continue;
          best = Math.max(best, occupied === CELLS - 1 && !board[cell] ? baseline + 9 : boardValue(board, cell, tile));
        }
        values.set(tile, best);
      }
      sum += best;
    }
    return sum / unseen.length;
  };

  return moves.map((move) => {
    if (move.type === 'draw') return { move, score: drawValue() - (remaining > 1 && marketWins.size ? 12 : 0) };
    const cell = move.type === 'discard' ? -1 : move.cell;
    const tile = move.type === 'take' ? move.tile : (drawn ?? 0);
    const replaced = cell < 0 ? tile : board[cell];
    const addition = cell >= 0 && !replaced;
    if (addition && occupied === CELLS - 1) return { move, score: 100 };
    if (!remaining) {
      const bestOpponent = Math.max(...boards.filter((_, i) => i !== turn).map(countTiles));
      const total = occupied + Number(addition);
      return { move, score: 20 * Math.sign(total - bestOpponent) + total };
    }
    const threat =
      (replaced !== 0 && finishesWith(nextBoard, replaced)) ||
      (marketWins.size > 0 &&
        !(
          move.type === 'take' &&
          marketWins.size === 1 &&
          marketWins.has(tile) &&
          market.indexOf(tile) === market.lastIndexOf(tile)
        ));
    const value = cell < 0 ? baseline : boardValue(board, cell, tile);
    return { move, score: value - (threat ? 12 : 0) - (replaced && cell >= 0 ? 0.12 : 0) };
  });
}

function bestRated(position: Position, moves: Move[]): Move {
  const rated = rateMoves(position, moves);
  return rated.reduce((best, candidate) => (candidate.score > best.score ? candidate : best)).move;
}

function simulate(position: Position, first: Move, deck: number[]): number {
  const player = position.turn;
  let drawn = 0;
  let move = first;
  for (let turns = 0; turns < ROLLOUT_TURNS; turns++) {
    position = applyMove(position, move, deck[drawn]);
    if (move.type === 'draw') {
      drawn++;
      position = applyMove(position, bestRated(position, legalMoves(position)));
    }
    if (position.winners.length) {
      return position.winners.includes(player) ? 1 / position.winners.length : 0;
    }
    move = bestRated(position, legalMoves(position));
  }
  const scores = position.boards.map((board) => boardValue(board));
  const opponent = Math.max(...scores.filter((_, i) => i !== player));
  return 1 / (1 + Math.exp((opponent - scores[player]) / 2));
}

export function chooseMove(position: Position, difficulty: Difficulty, random = Math.random): Move | undefined {
  const moves = legalMoves(position);
  if (moves.length <= 1) return moves[0];
  if (difficulty === 'basic') return basicMove(position, moves, random);

  const unseen = unseenTiles(position);
  const ranked = rateMoves(position, moves, unseen).sort((a, b) => b.score - a.score);
  if (difficulty === 'strategic' || ranked[0].score === 100 || position.remaining === 0) return ranked[0].move;

  // Compare candidates on the same sampled decks, then spend more samples on the leaders.
  // Reserve a spot for drawing, since it may run down the clock even if it rates poorly locally.
  const draw = ranked.find(({ move }) => move.type === 'draw');
  const shortlist = ranked.slice(0, MAX_CANDIDATES);
  if (draw && !shortlist.includes(draw)) shortlist[MAX_CANDIDATES - 1] = draw;
  let candidates = shortlist.map(({ move, score }) => ({ move, score, total: 0 }));
  const deadline = performance.now() + MAX_SEARCH_MS;
  for (let world = 1; world <= MAX_WORLDS; world++) {
    const deck = shuffle([...unseen], random);
    for (const candidate of candidates) {
      candidate.total += simulate(position, candidate.move, deck);
    }
    candidates.sort((a, b) => b.total - a.total || b.score - a.score);
    if (performance.now() >= deadline) break;
    if (world === 12 || world === 32 || world === 64) {
      candidates = candidates.slice(0, Math.max(2, Math.ceil(candidates.length / 2)));
    }
  }
  return candidates[0].move;
}
