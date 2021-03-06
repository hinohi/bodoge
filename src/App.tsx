import 'bulma/css/bulma.css';
import React, {Suspense} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

const TicTacToe = React.lazy(() => import('./tic-tac-toe/app'));
const ConnectFour = React.lazy(() => import('./connect-four/app'));
const Mancala = React.lazy(() => import('./mancala/app'));

function App() {
  return (
    <Router basename="/bodoge">
      <div>
        <nav className="navbar">
          <div className="navbar-menu">
            <Link to="/" className="navbar-item">
              Home
            </Link>
            <Link to="/tic-tac-toe" className="navbar-item">
              Tic Tac Toe
            </Link>
            <Link to="/connect-four" className="navbar-item">
              Connect Four
            </Link>
            <Link to="/mancala" className="navbar-item">
              Mancala
            </Link>
          </div>
        </nav>
        <Switch>
          <Route path="/tic-tac-toe">
            <Suspense fallback={<div>Loading Tic Tac Toe...</div>}>
              <TicTacToe/>
            </Suspense>
          </Route>
          <Route path="/connect-four">
            <Suspense fallback={<div>Loading Connect Four...</div>}>
              <ConnectFour/>
            </Suspense>
          </Route>
          <Route path="/mancala">
            <Suspense fallback={<div>Loading Mancala...</div>}>
              <Mancala/>
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
