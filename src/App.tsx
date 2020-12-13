import React, {Suspense} from 'react';

const Twice = React.lazy(() => import('./twice'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>loading...</div>}>
        <Twice/>
      </Suspense>
    </div>
  );
}

export default App;
