import React, { useEffect, useMemo, useReducer } from 'react';
import { ResetButton } from '../button';
import { Select } from '../select';
import { Circle, Cross, Square, Svg } from '../svg';
import { useWorker } from '../workerHook';
import type { ModuleType } from './worker';

function createWorker(): Worker {
  return new Worker(new URL('./worker', import.meta.url), {
    name: 'tic-tac-toe',
    type: 'module',
  });
}

type Side = 'X' | 'O';
type CellType = 'E' | Side;

interface BoardBase {
  readonly squares: ReadonlyArray<CellType>;
}

interface BoardState extends BoardBase {
  readonly next: Side;
  readonly history: ReadonlyArray<{
    readonly position: number;
    readonly score?: number;
  }>;
}

interface BoardProps extends BoardBase {
  readonly onClick: (i: number) => void;
}

interface SearchResponse {
  readonly position?: number;
  readonly score: number;
}

function Board(props: BoardProps) {
  const size = 400;
  return (
    <Svg width={size} height={size}>
      {props.squares.map((c, i) => {
        const length = size / 3;
        const x = (i % 3) * length;
        const y = Math.floor(i / 3) * length;
        const cx = x + length / 2;
        const cy = y + length / 2;
        const rect = <Square x={x} y={y} size={length} onClick={() => props.onClick(i)} />;
        let mark: React.ReactElement | undefined;
        switch (c) {
          case 'X':
            mark = <Cross centerX={cx} centerY={cy} size={length} />;
            break;
          case 'O':
            mark = <Circle centerX={cx} centerY={cy} size={length} />;
            break;
        }
        return (
          <React.Fragment key={`cell-${i}`}>
            {mark}
            {rect}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function put(board: BoardState, position: number, score?: number): BoardState {
  const s = board.squares.slice();
  s[position] = board.next;
  return {
    squares: s,
    next: board.next === 'X' ? 'O' : 'X',
    history: board.history.concat([{ position, score }]),
  };
}

type Winner = CellType | null;

interface TicTacToeState {
  readonly board: BoardState;
  readonly key: number;
  readonly winner: Winner;
  readonly judged: boolean;
  readonly player: { [P in Side]: number };
}

type Action =
  | { type: 'reset' }
  | { type: 'change_player'; side: Side; id: number }
  | { type: 'put'; key: number; side: Side; position: number; score?: number }
  | { type: 'judge'; key: number; winner: Winner };

function init(player: { [P in Side]: number }): TicTacToeState {
  return {
    board: {
      squares: Array(9).fill('E'),
      next: 'X',
      history: [],
    },
    key: Math.random(),
    winner: null,
    judged: true,
    player,
  };
}

function reducer(state: TicTacToeState, action: Action): TicTacToeState {
  switch (action.type) {
    case 'reset':
      return init(state.player);
    case 'change_player':
      if (state.player[action.side] === action.id) return state;
      return init({ ...state.player, [action.side]: action.id });
    case 'put':
      if (action.key !== state.key) return state;
      if (state.board.next !== action.side) return state;
      if (state.winner) return state;
      if (!state.judged) return state;
      if (state.board.squares[action.position] !== 'E') return state;
      return {
        ...state,
        board: put(state.board, action.position, action.score),
        judged: false,
      };
    case 'judge':
      if (action.key !== state.key) return state;
      return {
        ...state,
        winner: action.winner,
        judged: true,
      };
  }
}

function TicTacToe(): React.ReactElement {
  const playerMaster = useMemo(() => ['Human', 'AI (Full Exploration)'], []);

  const [calculating, setCalculating, wasm, cancel] = useWorker<ModuleType>(createWorker);
  const [state, dispatch] = useReducer(reducer, init({ X: 0, O: 0 }));

  useEffect(() => {
    if (calculating) return;
    if (state.winner) return;
    if (state.judged) {
      const side = state.board.next;
      const player = playerMaster[state.player[side]];
      switch (player) {
        case 'Human':
          break;
        case 'AI (Full Exploration)': {
          const key = state.key;
          setCalculating(true);
          wasm
            .search(state.board.squares, state.board.next)
            .then((r: SearchResponse) => {
              if (typeof r.position === 'number') {
                dispatch({ type: 'put', key, side, position: r.position, score: r.score });
              } else {
                console.error(r);
              }
              setCalculating(false);
            })
            .catch((err: unknown) => console.error(err));
          break;
        }
      }
    } else {
      setCalculating(true);
      const key = state.key;
      wasm
        .calculateWinner(state.board.squares)
        .then((winner: Winner) => {
          dispatch({ type: 'judge', key, winner });
          setCalculating(false);
        })
        .catch((err: unknown) => console.error(err));
    }
  }, [calculating, playerMaster, state, setCalculating, wasm]);

  function handleClick(i: number): void {
    const side = state.board.next;
    if (state.player[side] === 0) {
      dispatch({ type: 'put', key: state.key, side, position: i });
    }
  }

  function handlePlayerChange(side: Side, id: number): void {
    if (state.player[side] !== id) {
      cancel();
      dispatch({ type: 'change_player', side, id });
    }
  }

  function resetBoard(): void {
    cancel();
    dispatch({ type: 'reset' });
  }

  let status: string;
  if (state.winner === null) {
    status = `next player: ${state.board.next}`;
  } else if (state.winner === 'E') {
    status = 'draw';
  } else {
    status = `winner: ${state.winner}`;
  }

  const history = state.board.history.map((h, i) => {
    if (h.score != null) {
      return (
        <li key={`history-${i}`}>
          {'OX'[i % 2]}: pos={h.position} score={h.score}
        </li>
      );
    } else {
      return (
        <li key={`history-${i}`}>
          {'OX'[i % 2]}: pos={h.position}
        </li>
      );
    }
  });

  return (
    <div className="container">
      <div className="content is-flex-direction-row">
        X
        <Select
          items={playerMaster}
          selected={state.player.X}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('X', i)}
        />
        vs
        <Select
          items={playerMaster}
          selected={state.player.O}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('O', i)}
        />
        O
      </div>
      <div className="content">
        <Board squares={state.board.squares} onClick={handleClick} />
      </div>
      <div className="content">
        <p>{status}</p>
      </div>
      <div className="content">
        <ResetButton hasWinner={state.winner !== null} onClick={resetBoard} />
      </div>
      <div className="content">
        <ol>{history}</ol>
      </div>
    </div>
  );
}

export default TicTacToe;
