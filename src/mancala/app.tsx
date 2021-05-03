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

interface BoardState {
  readonly side: Side
  readonly stealing: boolean
  readonly seeds: ReadonlyArray<ReadonlyArray<number>>
  readonly score: ReadonlyArray<number>
}

interface BoardProps extends BoardState {
  readonly finished: boolean
  readonly onClick: (side: Side, i: number) => void
}

function Board(props: BoardProps) {
  const size = 100;
  const mineSeedColor = '#111';
  const oppSeedColor = '#666';
  const zeroSeedColor = '#ccc';
  const sideColors = {
    First: '#226',
    Second: '#622',
  } as const;

  function textColor(target: Side, s: number): string {
    if (props.finished) {
      return sideColors[target];
    }
    if (props.side === target) {
      if (s > 0) {
        return mineSeedColor;
      } else {
        return zeroSeedColor;
      }
    } else {
      return oppSeedColor;
    }
  }

  return (
    <Svg
      width={size * 8}
      height={size * 2}
    >
      <NumberRect
        x={0}
        y={0}
        width={size}
        height={size * 1.5}
        text={`${props.score[1]}`}
        textColor={sideColors.Second}
        key="s1"
      />
      {props.seeds[1].map((s, i) => {
        return (
          <NumberRect
            x={size * (6 - i)}
            y={0}
            width={size}
            height={size}
            text={`${s}`}
            textColor={textColor('Second', s)}
            key={`Second${i}`}
            onClick={() => props.onClick('Second', i)}
          />
        );
      })}
      {props.seeds[0].map((s, i) => {
        return (
          <NumberRect
            x={size * (i + 1)}
            y={size}
            width={size}
            height={size}
            text={`${s}`}
            textColor={textColor('First', s)}
            key={`First${i}`}
            onClick={() => props.onClick('First', i)}
          />
        );
      })}
      <NumberRect
        x={size * 7}
        y={size * 0.5}
        width={size}
        height={size * 1.5}
        text={`${props.score[0]}`}
        textColor={sideColors.First}
        key="s0"/>
    </Svg>
  );
}

interface NumberRectProps {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly text: string
  readonly textColor: string
  readonly onClick?: () => void
}

function NumberRect(props: NumberRectProps) {
  const margin = props.width / 50;
  return (
    <>
      <text
        x={props.x + margin * 4}
        y={props.y + props.height - margin * 4}
        fontSize="64"
        fill={props.textColor}
      >
        {props.text}
      </text>
      <rect
        x={props.x + margin}
        y={props.y + margin}
        width={props.width - margin * 2}
        height={props.height - margin * 2}
        rx={margin * 3}
        ry={margin * 3}
        fill={'rgba(0, 0, 0, 0)'}
        stroke={'#333'}
        onClick={props.onClick}
      />
    </>
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
  | { type: 'change_stealing', stealing: boolean }
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
    case 'change_stealing':
      if (state.board.stealing === action.stealing) return state;
      return init(action.stealing, state.player);
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
      params: 'dfs:nn6:3',
    },
    {
      type: 'CPU',
      params: 'dfs:nn4:3',
    },
    {
      type: 'CPU',
      params: 'dfs:nn6:5',
    },
    {
      type: 'CPU',
      params: 'dfs:nn4:5',
    },
    {
      type: 'CPU',
      params: 'dfs:nn6:7',
    },
    {
      type: 'CPU',
      params: 'dfs:nn6:9',
    },
    {
      type: 'CPU',
      params: 'random',
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

  function handleClick(side: Side, i: number): void {
    if (side !== state.board.side) return;
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
    if (state.player[side] === id) return;
    cancel();
    dispatch({type: 'change_player', side, id});
  }

  function handleStealingChange(value: string): void {
    const stealing = value !== 'stealing';
    if (state.board.stealing === stealing) return;
    cancel();
    dispatch({type: 'change_stealing', stealing});
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
      <div className="content">
        <label className="checkbox">
          <input
            type="checkbox"
            value={state.board.stealing ? 'stealing' : 'no_stealing'}
            checked={state.board.stealing}
            onChange={(e) => handleStealingChange(e.target.value)}
          />
          stealing
        </label>
      </div>
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
          finished={state.score !== null}
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
