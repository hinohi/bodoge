import type React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <section className="hero is-medium is-light">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1 className="title is-1">Bodoge!（ボドゲ！）</h1>
          <p className="subtitle is-3">Play board games with AI powered by WebAssembly</p>

          <div className="content is-medium">
            <p>Choose a game to start playing:</p>
          </div>

          <div className="columns is-centered">
            <div className="column is-one-third">
              <Link to="/tic-tac-toe" className="box has-background-primary has-text-white">
                <h2 className="title is-4 has-text-white">Tic Tac Toe</h2>
                <p>Classic 3x3 grid game with perfect AI</p>
              </Link>
            </div>
            <div className="column is-one-third">
              <Link to="/connect-four" className="box has-background-info has-text-white">
                <h2 className="title is-4 has-text-white">Connect Four</h2>
                <p>Strategic game with Monte Carlo Tree Search AI</p>
              </Link>
            </div>
            <div className="column is-one-third">
              <Link to="/mancala" className="box has-background-success has-text-white">
                <h2 className="title is-4 has-text-white">Mancala</h2>
                <p>Ancient strategy game with multiple AI difficulties</p>
              </Link>
            </div>
          </div>

          <div className="content has-text-centered mt-6">
            <p>
              <a href="https://github.com/hinohi/bodoge" target="_blank" rel="noreferrer" className="button is-dark">
                <span className="icon">
                  <i className="fab fa-github"></i>
                </span>
                <span>View Source on GitHub</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
