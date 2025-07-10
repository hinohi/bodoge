import type React from 'react';
import { lazy, Suspense } from 'react';
import { Loading } from '../components/common/Loading';

const Mancala = lazy(() => import('../mancala/app'));

export const MancalaPage: React.FC = () => {
  return (
    <Suspense fallback={<Loading text="Loading Mancala..." />}>
      <Mancala />
    </Suspense>
  );
};

export default MancalaPage;
