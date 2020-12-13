import 'bulma/css/bulma.css';
import React, {Suspense} from 'react';

const Twice = React.lazy(() => import('./twice/app'));
const TicTacToe = React.lazy(() => import('./tic-tac-toe/app'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading Twice...</div>}>
        <Twice/>
      </Suspense>
      <Suspense fallback={<div>Loading TicTacToe...</div>}>
        <TicTacToe/>
      </Suspense>
    </div>
  );
}

export default App;
