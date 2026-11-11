import { expect, test } from '@playwright/test';
import { applyMove, DIAGONAL, fits, newGame, play, unseenTiles } from '../src/lucky-numbers/game';

test('deals sorted diagonals and accounts for every tile in a four-player game', () => {
  const game = newGame(4, 2, () => 0.3);
  expect(game.position.turn).toBe(2);
  expect(game.position.remaining).toBe(64);
  for (const board of game.position.boards) {
    const diagonal = DIAGONAL.map((cell) => board[cell]);
    expect(diagonal).toEqual([...diagonal].sort((a, b) => a - b));
    expect(board.filter(Boolean)).toHaveLength(4);
  }
  const afterDraw = play(game, { type: 'draw' });
  expect(unseenTiles(afterDraw.position)).toEqual([...afterDraw.deck].sort((a, b) => a - b));
});

test('checks distant tiles and rejects equality in the same row or column', () => {
  const board = [0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0];
  expect(fits(board, 4, 0)).toBe(true);
  expect(fits(board, 5, 0)).toBe(false);
  expect(fits(board, 7, 1)).toBe(false);
  expect(fits(board, 5, 5)).toBe(true);
});

test('exchanges a face-up tile without drawing and returns the replaced tile', () => {
  const game = newGame(2, 0, () => 0.3);
  const position = { ...game.position, market: [1, 1] };
  const oldTile = position.boards[0][0];
  const after = applyMove(position, { type: 'take', tile: 1, cell: 0 });
  expect(after.boards[0][0]).toBe(1);
  expect(after.market).toEqual([1, oldTile]);
  expect(after.remaining).toBe(position.remaining);
  expect(after.turn).toBe(1);
  expect(applyMove(position, { type: 'discard' })).toBe(position);
});

test('resolves the final draw before scoring and supports shared wins', () => {
  const { position } = newGame(3, 0, () => 0.3);
  const drawn = applyMove({ ...position, remaining: 1 }, { type: 'draw' }, 1);
  expect(drawn.remaining).toBe(0);
  expect(drawn.winners).toEqual([]);
  const discarded = applyMove(drawn, { type: 'discard' });
  expect(discarded.market).toEqual([1]);
  expect(discarded.winners).toEqual([0, 1, 2]);
  expect(applyMove(discarded, { type: 'draw' }, 2)).toBe(discarded);
});

test('ends immediately when a garden is filled', () => {
  const { position } = newGame(2);
  const board = [1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6, 4, 5, 6, 0];
  const after = applyMove(
    { ...position, boards: [board, position.boards[1]], market: [7] },
    {
      type: 'take',
      tile: 7,
      cell: 15,
    },
  );
  expect(after.winners).toEqual([0]);
  expect(after.remaining).toBe(position.remaining);
});
