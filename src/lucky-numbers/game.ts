export const SIDE = 4;
export const CELLS = SIDE * SIDE;
export const MAX_TILE = 20;
export const DIAGONAL = [0, 5, 10, 15] as const;

export type Board = readonly number[];
export type PlayerCount = 2 | 3 | 4;

export type Move =
  | { type: 'draw' }
  | { type: 'place'; cell: number }
  | { type: 'discard' }
  | { type: 'take'; tile: number; cell: number };

type PlayedTile = { player: number; tile: number; cell: number | null; replaced: number };

export interface Position {
  readonly boards: readonly Board[];
  readonly market: readonly number[];
  readonly remaining: number;
  readonly turn: number;
  readonly drawn: number | null;
  readonly winners: readonly number[];
  readonly lastPlay: PlayedTile | null;
}

export interface Game {
  readonly position: Position;
  readonly deck: readonly number[];
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function newGame(players: PlayerCount, first = 0, random = Math.random): Game {
  const tiles = shuffle(
    Array.from({ length: players * MAX_TILE }, (_, i) => (i % MAX_TILE) + 1),
    random,
  );
  const boards = Array.from({ length: players }, () => {
    const board = Array<number>(CELLS).fill(0);
    const startingTiles = tiles.splice(0, SIDE).sort((a, b) => a - b);
    DIAGONAL.forEach((cell, i) => {
      board[cell] = startingTiles[i];
    });
    return board;
  });
  return {
    deck: tiles,
    position: { boards, remaining: tiles.length, market: [], turn: first, drawn: null, winners: [], lastPlay: null },
  };
}

const lines = Array.from({ length: CELLS }, (_, cell) => {
  const row = Math.floor(cell / SIDE);
  const col = cell % SIDE;
  const horizontal = Array.from({ length: SIDE }, (_, i) => row * SIDE + i);
  const vertical = Array.from({ length: SIDE }, (_, i) => i * SIDE + col);
  return {
    before: [...horizontal.slice(0, col), ...vertical.slice(0, row)],
    after: [...horizontal.slice(col + 1), ...vertical.slice(row + 1)],
  };
});

export function fits(board: Board, tile: number, cell: number): boolean {
  if (!Number.isInteger(cell) || cell < 0 || cell >= CELLS) return false;
  const { before, after } = lines[cell];
  return before.every((i) => board[i] < tile) && after.every((i) => !board[i] || board[i] > tile);
}

export function legalCells(board: Board, tile: number): number[] {
  const cells: number[] = [];
  for (let cell = 0; cell < CELLS; cell++) {
    if (fits(board, tile, cell)) cells.push(cell);
  }
  return cells;
}

export function legalMoves(position: Position): Move[] {
  const { boards, market, remaining, turn, drawn, winners } = position;
  if (winners.length) return [];
  const board = boards[turn];
  if (drawn !== null) {
    return [...legalCells(board, drawn).map((cell): Move => ({ type: 'place', cell })), { type: 'discard' }];
  }
  const moves: Move[] = remaining ? [{ type: 'draw' }] : [];
  for (const tile of new Set(market)) {
    for (const cell of legalCells(board, tile)) moves.push({ type: 'take', tile, cell });
  }
  return moves;
}

export function countTiles(board: Board): number {
  return board.reduce((count, tile) => count + Number(tile !== 0), 0);
}

// Called with the next hidden tile only for a draw, including sampled draws in CPU search.
export function applyMove(position: Position, move: Move, nextTile?: number): Position {
  const { boards, turn, drawn, remaining } = position;
  if (position.winners.length) return position;
  if (move.type === 'draw') {
    if (drawn !== null || !remaining || nextTile === undefined) return position;
    return { ...position, remaining: remaining - 1, drawn: nextTile };
  }
  if ((move.type === 'take') !== (drawn === null)) return position;

  const market = [...position.market];
  const tile = move.type === 'take' ? move.tile : drawn;
  if (tile === null) return position;
  const cell = move.type === 'discard' ? null : move.cell;
  const board = boards[turn];
  if (cell !== null && !fits(board, tile, cell)) return position;
  if (move.type === 'take') {
    const index = market.indexOf(tile);
    if (index < 0) return position;
    market.splice(index, 1);
  }

  const replaced = cell === null ? 0 : board[cell];
  if (cell === null) market.push(tile);
  if (replaced) market.push(replaced);
  const updatedBoards =
    cell === null
      ? boards
      : boards.map((b, player) => (player === turn ? b.map((value, index) => (index === cell ? tile : value)) : b));

  let winners: number[] = [];
  if (updatedBoards[turn].every(Boolean)) {
    winners = [turn];
  } else if (!remaining) {
    const scores = updatedBoards.map(countTiles);
    const best = Math.max(...scores);
    winners = scores.flatMap((score, player) => (score === best ? [player] : []));
  }
  return {
    boards: updatedBoards,
    market,
    remaining,
    turn: (turn + 1) % boards.length,
    drawn: null,
    winners,
    lastPlay: { player: turn, tile, cell, replaced },
  };
}

export function play(game: Game, move: Move): Game {
  const position = applyMove(game.position, move, game.deck[0]);
  if (position === game.position) return game;
  return { position, deck: move.type === 'draw' ? game.deck.slice(1) : game.deck };
}

export function unseenTiles(position: Position): number[] {
  const counts = Array<number>(MAX_TILE + 1).fill(position.boards.length);
  for (const board of position.boards) {
    for (const tile of board) {
      if (tile) counts[tile]--;
    }
  }
  for (const tile of position.market) counts[tile]--;
  if (position.drawn !== null) counts[position.drawn]--;
  return counts.slice(1).flatMap((count, i) => Array<number>(count).fill(i + 1));
}
