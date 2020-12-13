import 'bulma/css/bulma.css';
import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

const Twice = React.lazy(() => import('./twice/app'));
const TicTacToe = React.lazy(() => import('./tic-tac-toe/app'));

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="navbar-menu">
            <Link to="/" className="navbar-item">
              Home
            </Link>
            <Link to="/twice" className="navbar-item">
              Twice the Number
            </Link>
            <Link to="/tic-tac-toe" className="navbar-item">
              Tic Tac Toe
            </Link>
          </div>
        </nav>
        <Switch>
          <Route path="/twice">
            <Suspense fallback={<div>Loading Twice...</div>}>
              <Twice/>
            </Suspense>
          </Route>
          <Route path="/tic-tac-toe">
            <Suspense fallback={<div>Loading TicTacToe...</div>}>
              <TicTacToe/>
            </Suspense>
          </Route>
          <Route path="/">
            <Home/>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <section className="section">
        <div className="container">
          <div className="content">
            <h1>Bodoge!（ボドゲ！）</h1>
            <p>
              Play some board games with the game AI provided by WASM.
            </p>
            <p>
              Source code is available {" "}
              <a href="https://github.com/hinohi/bodoge" target="_blank" rel="noreferrer">here</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
