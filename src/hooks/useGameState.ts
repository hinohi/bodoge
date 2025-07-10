import { useCallback, useReducer } from 'react';

export interface GameAction<T = unknown> {
  type: string;
  payload?: T;
}

export interface UseGameStateOptions<TState, TAction extends GameAction> {
  initialState: TState;
  reducer: (state: TState, action: TAction) => TState;
  onStateChange?: (newState: TState, action: TAction) => void;
}

export function useGameState<TState, TAction extends GameAction>({
  initialState,
  reducer,
  onStateChange,
}: UseGameStateOptions<TState, TAction>) {
  const [state, dispatch] = useReducer((prevState: TState, action: TAction) => {
    const newState = reducer(prevState, action);
    if (onStateChange && newState !== prevState) {
      onStateChange(newState, action);
    }
    return newState;
  }, initialState);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' } as TAction);
  }, []);

  return {
    state,
    dispatch,
    reset,
  };
}
