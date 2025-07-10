export type TicTacToeSide = 'X' | 'O';
export type TicTacToeCellType = 'E' | TicTacToeSide;

export interface TicTacToeBoard {
  squares: ReadonlyArray<TicTacToeCellType>;
  moveHistory: Array<{
    position: number;
    player: TicTacToeSide;
    score?: number;
  }>;
}

export interface TicTacToeGameState {
  board: TicTacToeBoard;
  currentPlayer: TicTacToeSide;
  players: Record<TicTacToeSide, number>;
  winner: TicTacToeSide | 'E' | null;
  isGameOver: boolean;
  gameKey: number;
}

export interface TicTacToeAIResponse {
  position?: number;
  score: number;
}

export const BOARD_SIZE = 9;
export const GRID_SIZE = 3;
