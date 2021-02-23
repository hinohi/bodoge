import React, {useEffect, useState, useMemo, useReducer} from 'react';
import {wrap} from 'comlink';

import {Svg, Cross, Circle, Square} from '../svg';
import {ResetButton} from '../button';
import {Select} from '../select';
import {ModuleType} from './worker';


function createWorker(): Worker {
  return new Worker('./worker', {
    name: 'connect-four',
    type: 'module'
  });
}

function useWorker(): [boolean, (calculating: boolean) => void, ModuleType, () => void] {
  const [worker, setWorker] = useState(createWorker);
  const proxy = useMemo(() => wrap<ModuleType>(worker), [worker]);
  const [initialized, setInitialize] = useState(false);
  const [calculating, setCalculating] = useState(true);

  useEffect(() => {
    if (initialized) return;
    proxy.initialize().then(() => {
      setInitialize(true);
      setCalculating(false);
    });
  }, [initialized, calculating, proxy]);

  function cancel(): void {
    worker.terminate();
    setCalculating(true);
    setWorker(createWorker());
    setInitialize(false);
  }

  return [calculating, setCalculating, proxy, cancel];
}

type Side = 'A' | 'B';

interface BoardBase {
  readonly cols: ReadonlyArray<ReadonlyArray<Side>>
}

interface BoardState extends BoardBase {
  readonly next: Side
  readonly history: ReadonlyArray<{
    readonly position: number
    readonly score?: string
  }>
}

interface BoardProps extends BoardBase {
  readonly onClick: (i: number) => void
}

interface ColumnProps {
  readonly col: ReadonlyArray<Side>
  readonly size: number
  readonly x: number
  readonly onClick: () => void
}

function Column(props: ColumnProps): React.ReactElement {
  const col: React.ReactElement[] = [];
  const cx = props.x + props.size / 2;
  for (let row = 0; row < 6; row++) {
    const y = (5 - row) * props.size;
    const cy = y + props.size / 2;
    col.push(<Square x={props.x} y={y} size={props.size} onClick={props.onClick} key={row * 2}/>);
    switch (props.col[row]) {
      case 'A':
        col.push(<Cross centerX={cx} centerY={cy} size={props.size} key={row * 2 + 1}/>);
        break;
      case 'B':
        col.push(<Circle centerX={cx} centerY={cy} size={props.size} key={row * 2 + 1}/>);
        break;
    }
  }
  return (
    <React.Fragment>
      {col}
    </React.Fragment>
  );
}

function Board(props: BoardProps): React.ReactElement {
  const cell_size = 100;
  return (
    <Svg width={cell_size * 7} height={cell_size * 6}>
      {props.cols.map((col, i) => {
        const x = cell_size * i;
        return (<Column col={col} size={cell_size} x={x} onClick={() => props.onClick(i)} key={i}/>);
      })}
    </Svg>
  )
}

function put(board: BoardState, position: number, score?: string): BoardState {
  const cols = board.cols.map((c, i) => {
    if (position === i) {
      const s = c.slice();
      s.push(board.next);
      return s;
    } else {
      return c;
    }
  });
  return {
    cols,
    next: board.next === 'A' ? 'B' : 'A',
    history: board.history.concat([{position, score}])
  };
}

interface SearchResponse {
  readonly position?: number
  readonly score: string
}

interface HumanPlayer {
  readonly type: 'Human'
  readonly name: string
}

interface McTreePlayer {
  readonly type: 'MCTree'
  readonly name: string
  readonly limit: number
  readonly expansion_threshold: number
  readonly c: number
}

type Player =
  | HumanPlayer
  | McTreePlayer;

type Winner = Side | 'F' | null;

interface ConnectFourState {
  board: BoardState
  key: number
  winner: Winner
  judged: boolean
  player: { [P in Side]: number }
}

type Action =
  | { type: 'reset' }
  | { type: 'change_player', side: Side, id: number }
  | { type: 'put', key: number, side: Side, position: number, score?: string }
  | { type: 'judge', key: number, winner: Winner }
  ;

function init(player: { [P in Side]: number }): ConnectFourState {
  return {
    board: {
      cols: [[], [], [], [], [], [], []],
      next: 'A',
      history: [],
    },
    key: Math.random(),
    winner: null,
    judged: true,
    player,
  };
}

function reducer(state: ConnectFourState, action: Action): ConnectFourState {
  switch (action.type) {
    case 'reset':
      return init(state.player);
    case 'change_player':
      if (state.player[action.side] === action.id) return state;
      return init({...state.player, [action.side]: action.id});
    case 'put':
      if (action.key !== state.key) return state;
      if (state.board.next !== action.side) return state;
      if (state.winner) return state;
      if (!state.judged) return state;
      if (state.board.cols[action.position].length >= 6) {
        console.warn(state, action);
        return state;
      }
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

function ConnectFour(): React.ReactElement {
  const playerMaster = useMemo<ReadonlyArray<Player>>(() => [
    {
      type: 'Human',
      name: 'Human',
    },
    {
      type: 'MCTree',
      name: 'MCTree (200ms)',
      limit: 200,
      expansion_threshold: 2,
      c: 2.0,
    },
    {
      type: 'MCTree',
      name: 'MCTree (3s)',
      limit: 10000,
      expansion_threshold: 2,
      c: 2.0,
    },
  ], []);

  const [calculating, setCalculating, wasm, cancel] = useWorker();
  const [state, dispatch] = useReducer(reducer, init({A: 0, B: 0}));

  useEffect(() => {
    if (calculating) return;
    if (state.winner) return;
    if (state.judged) {
      const side = state.board.next;
      const player = playerMaster[state.player[side]];
      switch (player.type) {
        case 'Human':
          break;
        case 'MCTree':
          const key = state.key;
          setCalculating(true);
          wasm.mctree({cols: state.board.cols}, player.limit, player.expansion_threshold, player.c)
            .then((r: SearchResponse) => {
              if (typeof r.position === 'number') {
                dispatch({type: 'put', key, side, position: r.position, score: r.score});
              } else {
                console.error(r);
              }
              setCalculating(false);
            });
          break;
      }
    } else {
      setCalculating(true);
      const key = state.key;
      wasm.calculateWinner({cols: state.board.cols}).then((winner: Winner) => {
        dispatch({type: 'judge', key, winner});
        setCalculating(false);
      });
    }

  }, [calculating, playerMaster, state, setCalculating, wasm]);

  function handleClick(i: number): void {
    if (state.board.cols[i].length >= 6) return;
    const side = state.board.next;
    if (playerMaster[state.player[side]].type === 'Human') {
      dispatch({type: 'put', key: state.key, side, position: i});
    }
  }

  function handlePlayerChange(side: 'A' | 'B', id: number): void {
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
  if (state.winner === null) {
    status = `next player: ${state.board.next}`;
  } else if (state.winner === 'F') {
    status = 'draw';
  } else {
    status = `winner: ${state.winner}`
  }

  const history = state.board.history.map((h, i) => {
    if (h.score != null) {
      return <li key={i}>{'AB'[i % 2]}: pos={h.position} score={h.score}</li>
    } else {
      return <li key={i}>{'AB'[i % 2]}: pos={h.position}</li>
    }
  });

  return (
    <div className="container">
      <div className="content is-flex-direction-row">
        X
        <Select
          items={playerMaster.map((p) => p.name)}
          selected={state.player.A}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('A', i)}
        />
        vs
        <Select
          items={playerMaster.map((p) => p.name)}
          selected={state.player.B}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('B', i)}
        />
        O
      </div>
      <div className="content">
        <Board onClick={handleClick} cols={state.board.cols}/>
      </div>
      <div className="content">
        <p>{status}</p>
        <p>calculating: {calculating ? 't' : 'f'}</p>
      </div>
      <div className="content">
        <ResetButton hasWinner={state.winner !== null} onClick={resetBoard}/>
      </div>
      <div className="content">
        <ol>{history}</ol>
      </div>
    </div>
  );
}

export default ConnectFour;
