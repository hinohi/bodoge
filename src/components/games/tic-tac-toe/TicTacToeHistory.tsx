import type React from 'react';
import type { TicTacToeSide } from '../../../types/tic-tac-toe';

interface Move {
  position: number;
  player: TicTacToeSide;
  score?: number;
}

interface TicTacToeHistoryProps {
  moves: Move[];
}

export const TicTacToeHistory: React.FC<TicTacToeHistoryProps> = ({ moves }) => {
  if (moves.length === 0) {
    return null;
  }

  return (
    <div className="content">
      <h4 className="subtitle is-5">Move History</h4>
      <ol>
        {moves.map((move, index) => (
          <li key={`move-${index}`}>
            {move.player}: position {move.position}
            {move.score !== undefined && ` (score: ${move.score})`}
          </li>
        ))}
      </ol>
    </div>
  );
};
