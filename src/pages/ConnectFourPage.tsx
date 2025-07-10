import type React from 'react';
import { lazy, Suspense } from 'react';
import { Loading } from '../components/common/Loading';

const ConnectFour = lazy(() => import('../connect-four/app'));

export const ConnectFourPage: React.FC = () => {
  return (
    <Suspense fallback={<Loading text="Loading Connect Four..." />}>
      <ConnectFour />
    </Suspense>
  );
};

export default ConnectFourPage;
