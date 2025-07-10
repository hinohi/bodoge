import type React from 'react';
import { useMemo } from 'react';
import { useTicTacToe } from '../../../hooks/useTicTacToe';
import { PlayerSelection, ResetButton } from '../../common';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToeHistory } from './TicTacToeHistory';
import { TicTacToeStatus } from './TicTacToeStatus';

const PLAYER_OPTIONS = ['Human', 'AI (Full Exploration)'];

export const TicTacToe: React.FC = () => {
  const { gameState, isLoading, makeMove, changePlayer, reset } = useTicTacToe(PLAYER_OPTIONS);

  const handlePlayerChange = (playerIndex: 0 | 1, optionIndex: number) => {
    const side = playerIndex === 0 ? 'X' : 'O';
    changePlayer(side, optionIndex);
  };

  const handleCellClick = (position: number) => {
    if (gameState.players[gameState.currentPlayer] === 0) {
      makeMove(position);
    }
  };

  const isHumanTurn = useMemo(() => {
    return !gameState.isGameOver && PLAYER_OPTIONS[gameState.players[gameState.currentPlayer]] === 'Human';
  }, [gameState.currentPlayer, gameState.isGameOver, gameState.players]);

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-8">
            <h1 className="title has-text-centered">Tic Tac Toe</h1>

            <PlayerSelection
              playerLabels={['X', 'O']}
              playerOptions={PLAYER_OPTIONS}
              selectedPlayers={[gameState.players.X, gameState.players.O]}
              onPlayerChange={handlePlayerChange}
              isDisabled={isLoading}
            />

            <div className="box">
              <div className="has-text-centered">
                <TicTacToeBoard
                  squares={gameState.board.squares}
                  onCellClick={handleCellClick}
                  disabled={!isHumanTurn || isLoading}
                />
              </div>

              <TicTacToeStatus
                currentPlayer={gameState.currentPlayer}
                winner={gameState.winner}
                isGameOver={gameState.isGameOver}
              />

              <div className="has-text-centered">
                <ResetButton hasWinner={gameState.isGameOver} onClick={reset} />
              </div>

              <TicTacToeHistory moves={gameState.board.moveHistory} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
