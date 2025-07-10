import { useCallback, useEffect, useState } from 'react';
import type { ModuleType } from '../tic-tac-toe/worker';
import {
  BOARD_SIZE,
  type TicTacToeAIResponse,
  type TicTacToeBoard,
  type TicTacToeCellType,
  type TicTacToeGameState,
  type TicTacToeSide,
} from '../types/tic-tac-toe';
import { useWorker } from '../workerHook';
import { useGameState } from './useGameState';

type TicTacToeAction =
  | { type: 'RESET' }
  | { type: 'CHANGE_PLAYER'; payload: { side: TicTacToeSide; playerId: number } }
  | { type: 'MAKE_MOVE'; payload: { position: number; score?: number } }
  | { type: 'SET_WINNER'; payload: { winner: TicTacToeSide | 'E' | null } };

const initialBoard: TicTacToeBoard = {
  squares: Array(BOARD_SIZE).fill('E') as TicTacToeCellType[],
  moveHistory: [],
};

const initialState: TicTacToeGameState = {
  board: initialBoard,
  currentPlayer: 'X',
  players: { X: 0, O: 0 },
  winner: null,
  isGameOver: false,
  gameKey: Date.now(),
};

function createWorker(): Worker {
  return new Worker(new URL('../tic-tac-toe/worker', import.meta.url), {
    name: 'tic-tac-toe',
    type: 'module',
  });
}

function ticTacToeReducer(state: TicTacToeGameState, action: TicTacToeAction): TicTacToeGameState {
  switch (action.type) {
    case 'RESET':
      return {
        ...initialState,
        players: state.players,
        gameKey: Date.now(),
      };

    case 'CHANGE_PLAYER':
      return {
        ...initialState,
        players: {
          ...state.players,
          [action.payload.side]: action.payload.playerId,
        },
        gameKey: Date.now(),
      };

    case 'MAKE_MOVE': {
      if (state.isGameOver) return state;

      const newSquares = [...state.board.squares];
      newSquares[action.payload.position] = state.currentPlayer;

      return {
        ...state,
        board: {
          squares: newSquares,
          moveHistory: [
            ...state.board.moveHistory,
            {
              position: action.payload.position,
              player: state.currentPlayer,
              score: action.payload.score,
            },
          ],
        },
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
      };
    }

    case 'SET_WINNER':
      return {
        ...state,
        winner: action.payload.winner,
        isGameOver: action.payload.winner !== null,
      };

    default:
      return state;
  }
}

export function useTicTacToe(playerOptions: string[]) {
  const { state, dispatch, reset } = useGameState({
    initialState,
    reducer: ticTacToeReducer,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [wasmLoading, , wasm, cancel] = useWorker<ModuleType>(createWorker);

  const isLoading = wasmLoading || isCalculating;

  const makeMove = useCallback(
    (position: number, score?: number) => {
      if (state.board.squares[position] !== 'E' || state.isGameOver) {
        return;
      }
      dispatch({ type: 'MAKE_MOVE', payload: { position, score } });
    },
    [state.board.squares, state.isGameOver, dispatch],
  );

  const changePlayer = useCallback(
    (side: TicTacToeSide, playerId: number) => {
      if (state.players[side] !== playerId) {
        cancel();
        dispatch({ type: 'CHANGE_PLAYER', payload: { side, playerId } });
      }
    },
    [state.players, cancel, dispatch],
  );

  const handleReset = useCallback(() => {
    cancel();
    reset();
  }, [cancel, reset]);

  // Check for winner after each move
  useEffect(() => {
    if (!wasm || state.winner !== null || isCalculating) return;

    const lastMove = state.board.moveHistory[state.board.moveHistory.length - 1];
    if (!lastMove) return;

    setIsCalculating(true);
    wasm
      .calculateWinner(state.board.squares)
      .then((winner: TicTacToeSide | 'E' | null) => {
        dispatch({ type: 'SET_WINNER', payload: { winner } });
      })
      .catch((err: unknown) => console.error('Error calculating winner:', err))
      .finally(() => setIsCalculating(false));
  }, [wasm, state.board.moveHistory, state.board.squares, state.winner, isCalculating, dispatch]);

  // Handle AI moves
  useEffect(() => {
    if (!wasm || state.isGameOver || isCalculating) return;

    const currentPlayerType = playerOptions[state.players[state.currentPlayer]];
    if (!currentPlayerType || currentPlayerType === 'Human') return;

    setIsCalculating(true);
    wasm
      .search(state.board.squares, state.currentPlayer)
      .then((response: TicTacToeAIResponse) => {
        if (typeof response.position === 'number') {
          makeMove(response.position, response.score);
        }
      })
      .catch((err: unknown) => console.error('Error getting AI move:', err))
      .finally(() => setIsCalculating(false));
  }, [
    wasm,
    state.currentPlayer,
    state.players,
    state.isGameOver,
    state.board.squares,
    playerOptions,
    isCalculating,
    makeMove,
  ]);

  return {
    gameState: state,
    isLoading,
    makeMove,
    changePlayer,
    reset: handleReset,
  };
}
