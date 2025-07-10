import type React from 'react';
import { lazy, Suspense } from 'react';
import { Loading } from '../components/common/Loading';

const TicTacToe = lazy(() =>
  import('../components/games/tic-tac-toe').then((module) => ({
    default: module.TicTacToe,
  })),
);

export const TicTacToePage: React.FC = () => {
  return (
    <Suspense fallback={<Loading text="Loading Tic Tac Toe..." />}>
      <TicTacToe />
    </Suspense>
  );
};
