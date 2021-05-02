import React, {useEffect, useMemo, useReducer} from 'react';

import {Svg} from '../svg';
import {ResetButton} from '../button';
import {Select} from '../select';
import {useWorker} from '../workerHook';
import {ModuleType} from './worker';


function createWorker(): Worker {
  return new Worker('./worker', {
    name: 'mancala',
    type: 'module',
  });
}

type Side = 'First' | 'Second';

interface BoardBase {
  readonly seeds: ReadonlyArray<ReadonlyArray<number>>
  readonly score: ReadonlyArray<number>
}

interface BoardState extends BoardBase {
  readonly stealing: boolean
  readonly side: Side
}

interface BoardProps extends BoardBase {
  readonly onClick: (i: number) => void
}

function Board(props: BoardProps) {
  const size = 100;
  return (
    <Svg
      width={size * 8}
      height={size * 2}
    >
    </Svg>
  );
}

type Score = [number, number] | null;

interface TicTacToeState {
  readonly board: BoardState
  readonly key: number
  readonly score: Score
  readonly judged: boolean
  readonly player: { [P in Side]: number }
}

type Action =
  | { type: 'reset' }
  | { type: 'change_player', side: Side, id: number }
  | { type: 'put', key: number, board: BoardState }
  | { type: 'judge', key: number, score: Score }
  ;

type Player =
  | { type: 'Human' }
  | { type: 'CPU', params: string }
  ;

function showPlayer(player: Player): string {
  switch (player.type) {
    case 'Human':
      return 'Human';
    case 'CPU':
      return `CPU (${player.params})`;
  }
}

function init(stealing: boolean, player: { [P in Side]: number }): TicTacToeState {
  return {
    board: {
      stealing,
      side: 'First',
      seeds: [[4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4]],
      score: [0, 0],
    },
    key: Math.random(),
    score: null,
    judged: true,
    player,
  };
}

function reducer(state: TicTacToeState, action: Action): TicTacToeState {
  switch (action.type) {
    case 'reset':
      return init(state.board.stealing, state.player);
    case 'change_player':
      if (state.player[action.side] === action.id) return state;
      return init(state.board.stealing, {...state.player, [action.side]: action.id});
    case 'put':
      if (action.key !== state.key) return state;
      if (state.score) return state;
      if (!state.judged) return state;
      return {
        ...state,
        board: action.board,
        judged: false,
      };
    case 'judge':
      if (action.key !== state.key) return state;
      return {
        ...state,
        score: action.score,
        judged: true,
      };
  }
}

function Mancala(): React.ReactElement {
  const playerMaster = useMemo<ReadonlyArray<Player>>(() => [
    {
      type: 'Human',
    },
    {
      type: 'CPU',
      params: 'dfs:nn6:5',
    },
  ], []);

  const [calculating, setCalculating, wasm, cancel] = useWorker<ModuleType>(createWorker);
  const [state, dispatch] = useReducer(reducer, init(true, {First: 0, Second: 0}));

  useEffect(() => {
    if (calculating) return;
    if (state.score) return;
    if (state.judged) {
      const side = state.board.side;
      const player = playerMaster[state.player[side]];
      switch (player.type) {
        case 'Human':
          break;
        case 'CPU':
          const key = state.key;
          setCalculating(true);
          wasm.search(state.board, player.params)
            .then((board: BoardState) => {
              dispatch({type: 'put', key, board});
              setCalculating(false);
            }).catch((err: any) => console.error(err));
          break;
      }
    } else {
      setCalculating(true);
      const key = state.key;
      wasm.calculateScore(state.board).then((score: [number, number]) => {
        dispatch({type: 'judge', key, score});
        setCalculating(false);
      }).catch((err: any) => console.error(err));
    }
  }, [calculating, playerMaster, state, setCalculating, wasm]);

  function handleClick(i: number): void {
    const side = state.board.side;
    if (state.player[side] === 0) {
      setCalculating(true);
      const key = state.key;
      wasm.calculateMoved(state.board, i).then((board: BoardState) => {
        dispatch({type: 'put', key, board});
        setCalculating(false);
      }).catch((err: any) => console.error(err));
    }
  }

  function handlePlayerChange(side: Side, id: number): void {
    if (state.player[side] !== id) {
      cancel();
      dispatch({type: 'change_player', side, id});
    }
  }

  function resetBoard(): void {
    cancel();
    dispatch({type: 'reset'});
  }

  let status;
  if (state.score === null) {
    status = `next player: ${state.board.side} side`;
  } else {
    const score = `${state.score[0]} - ${state.score[1]}`;
    if (state.score[0] > state.score[1]) {
      status = `winner First: ${score}`;
    } else if (state.score[0] < state.score[1]) {
      status = `winner Second: ${score}`;
    } else {
      status = `draw: ${score}`;
    }
  }

  return (
    <div className="container">
      <div className="content is-flex-direction-row">
        First
        <Select
          items={playerMaster.map(showPlayer)}
          selected={state.player.First}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('First', i)}
        />
        vs
        <Select
          items={playerMaster.map(showPlayer)}
          selected={state.player.Second}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('Second', i)}
        />
        Second
      </div>
      <div className="content">
        <Board
          {...state.board}
          onClick={handleClick}
        />
      </div>
      <div className="content">
        <p>{status}</p>
      </div>
      <div className="content">
        <ResetButton hasWinner={state.score !== null} onClick={resetBoard}/>
      </div>
    </div>
  );
}

export default Mancala;
