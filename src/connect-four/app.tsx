import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

import {Svg, Cross, Circle, Square} from '../svg';
import {ResetButton} from "../button";

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

function put(board: BoardState, col: number): BoardState {
  const cols = board.cols.map((c, i) => {
    if (col === i) {
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
  };
}

function ConnectFour(): React.ReactElement {
  const defaultBoard: BoardState = {
    cols: [[], [], [], [], [], [], []],
    next: 'A',
  } as const;
  const loaded = useWasm();
  const [winner, setWinner] = useState<Side | 'F' | null>(null);
  const [board, setBoard] = useState<BoardState>(defaultBoard);

  useEffect(() => {
    if (loaded) {
      wasm.calculateWinner({cols: board.cols}).then(setWinner);
    }
  }, [loaded, board.cols]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  function handleClick(i: number): void {
    if (winner !== null) return;
    if (board.cols[i].length >= 6) return;
    setBoard(put(board, i));
  }

  function resetBoard(): void {
    setBoard(defaultBoard);
  }

  let status;
  if (winner === null) {
    status = `next player: ${board.next}`;
  } else if (winner === 'F') {
    status = 'draw';
  } else {
    status = `winner: ${winner}`
  }

  return (
    <div className="container">
      <div className="content">
        <Board onClick={handleClick} cols={board.cols}/>
      </div>
      <div className="content">
        <p>{status}</p>
      </div>
      <div className="content">
        <ResetButton hasWinner={winner !== null} onClick={resetBoard}/>
      </div>
    </div>
  );
}

export default ConnectFour;
