import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

import {Svg, Cross, Circle, Square} from '../svg';
import {ResetButton} from '../button';
import {Select} from '../select';

const wasm = Comlink.wrap<import('./worker').ModuleType>(new Worker('./worker', {
  name: 'connect-four',
  type: 'module'
}));

function useWasm(): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    wasm.initialize().then(() => setLoaded(true));
  }, [loaded]);
  return loaded;
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

type State =
  | 'wait_for_input'
  | 'wait_for_judge'
  | 'end';

interface Player {
  readonly name: string
  readonly isHuman: boolean
}

function ConnectFour(): React.ReactElement {
  const defaultBoard: BoardState = {
    cols: [[], [], [], [], [], [], []],
    next: 'A',
    history: [],
  } as const;
  const playerMaster: ReadonlyArray<Player> = [
    {
      name: 'Human',
      isHuman: true,
    },
    {
      name: 'AI (MC)',
      isHuman: false,
    },
  ] as const;

  const loaded = useWasm();
  const [state, setState] = useState<State>('wait_for_input');
  const [winner, setWinner] = useState<Side | 'F' | null>(null);
  const [board, setBoard] = useState<BoardState>(defaultBoard);
  const [player, setPlayer] = useState({A: 0, B: 0});

  useEffect(() => {
    if (!loaded) return;

    switch (state) {
      case 'wait_for_input': {
        if (!playerMaster[player[board.next]].isHuman) {
          wasm.search({cols: board.cols}).then((result: SearchResponse) => {
            if (typeof result.position === 'number') {
              setBoard(put(board, result.position, result.score));
              setState('wait_for_judge');
            } else {
              setState('end');
            }
          });
        }
        break;
      }
      case 'wait_for_judge':
        wasm.calculateWinner({cols: board.cols}).then((w: Side | 'F' | null) => {
          setWinner(w);
          if (w) {
            setState('end');
          } else {
            setState('wait_for_input');
          }
        });
        break;
      case 'end':
        break;
    }
  }, [loaded, state]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  function handleClick(i: number): void {
    if (state !== 'wait_for_input') return;
    if (board.cols[i].length >= 6) return;
    if (playerMaster[player[board.next]].isHuman) {
      setBoard(put(board, i));
      setState('wait_for_judge');
    }
  }

  function handlePlayerChange(side: 'A' | 'B', i: number): void {
    if (player[side] !== i) {
      setPlayer({
        ...player,
        [side]: i,
      });
      resetBoard();
    }
  }

  function resetBoard(): void {
    setBoard(defaultBoard);
    setWinner(null);
    setState('wait_for_input');
  }

  let status;
  if (winner === null) {
    status = `next player: ${board.next}`;
  } else if (winner === 'F') {
    status = 'draw';
  } else {
    status = `winner: ${winner}`
  }

  const history = board.history.map((h, i) => {
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
          selected={player.A}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('A', i)}
        />
        vs
        <Select
          items={playerMaster.map((p) => p.name)}
          selected={player.B}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('B', i)}
        />
        O
      </div>
      <div className="content">
        <Board onClick={handleClick} cols={board.cols}/>
      </div>
      <div className="content">
        <p>{status}</p>
        <p>{state}</p>
      </div>
      <div className="content">
        <ResetButton hasWinner={winner !== null} onClick={resetBoard}/>
      </div>
      <div className="content">
        <ol>{history}</ol>
      </div>
    </div>
  );
}

export default ConnectFour;
