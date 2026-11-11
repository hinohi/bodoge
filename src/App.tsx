import 'bulma/css/bulma.css';
import type React from 'react';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Loading } from './components/common/Loading';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';

// Lazy load game pages for better performance
const TicTacToePage = lazy(() => import('./pages/TicTacToePage').then((m) => ({ default: m.TicTacToePage })));
const ConnectFourPage = lazy(() => import('./pages/ConnectFourPage').then((m) => ({ default: m.ConnectFourPage })));
const MancalaPage = lazy(() => import('./pages/MancalaPage').then((m) => ({ default: m.MancalaPage })));

const LuckyNumbers = lazy(() => import('./lucky-numbers/app'));

export const App: React.FC = () => {
  return (
    <BrowserRouter basename="/bodoge">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tic-tac-toe" element={<TicTacToePage />} />
          <Route path="connect-four" element={<ConnectFourPage />} />
          <Route path="mancala" element={<MancalaPage />} />
          <Route
            path="lucky-numbers"
            element={
              <Suspense fallback={<Loading text="Loading Lucky Numbers..." />}>
                <LuckyNumbers />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
