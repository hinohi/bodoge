import { expect, test } from '@playwright/test';
import { chooseMove } from '../src/lucky-numbers/cpu';
import { legalMoves, newGame, play } from '../src/lucky-numbers/game';

test('both evaluation-based CPUs take an immediate win from the table', () => {
  const board = [1, 3, 5, 7, 2, 4, 6, 8, 9, 11, 13, 15, 10, 12, 14, 0];
  const opponent = [1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 12, 0, 0, 0, 0, 20];
  const finish = {
    boards: [board, opponent],
    turn: 0,
    market: [17],
    remaining: 20,
    drawn: null,
    winners: [],
    lastPlay: null,
  };
  for (const difficulty of ['strategic', 'expert'] as const) {
    expect(chooseMove(finish, difficulty)).toEqual({ type: 'take', tile: 17, cell: 15 });
  }
});

test('Expert returns legal moves in both phases of a four-player turn', () => {
  let seed = 10;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const game = newGame(4, 0, random);
  const drawn = play(game, { type: 'draw' });
  const discarded = play(drawn, { type: 'discard' });
  for (const { position } of [drawn, discarded]) {
    expect(legalMoves(position)).toContainEqual(chooseMove(position, 'expert', random));
  }
});
