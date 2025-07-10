import type React from 'react';
import type { TicTacToeSide } from '../../../types/tic-tac-toe';

interface TicTacToeStatusProps {
  currentPlayer: TicTacToeSide;
  winner: TicTacToeSide | 'E' | null;
  isGameOver: boolean;
}

export const TicTacToeStatus: React.FC<TicTacToeStatusProps> = ({ currentPlayer, winner, isGameOver }) => {
  const getStatusMessage = (): string => {
    if (!isGameOver) {
      return `Next player: ${currentPlayer}`;
    }

    if (winner === 'E') {
      return 'Draw!';
    }

    return `Winner: ${winner}`;
  };

  return (
    <div className="content">
      <p className={`subtitle ${isGameOver ? 'has-text-weight-bold' : ''}`}>{getStatusMessage()}</p>
    </div>
  );
};
