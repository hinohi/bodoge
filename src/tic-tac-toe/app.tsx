import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

import {Svg, Cross, Circle, Square} from '../svg';
import {ResetButton} from '../button';

const wasm = Comlink.wrap<import('./worker').ModuleType>(new Worker('./worker', {
  name: 'tic-tac-toe',
  type: 'module'
}));

function useWasm(): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    wasm.initialize().then(() => setLoaded(true));
  }, [loaded]);
  return loaded;
}

type Side = 'X' | 'O'
type CellType = 'E' | Side;

interface BoardProps {
  readonly squares: ReadonlyArray<CellType>
  readonly next: Side
  readonly history: ReadonlyArray<{
    readonly position: number
    readonly score?: number
  }>
}

interface SelectProps {
  readonly items: ReadonlyArray<string>
  readonly isDisabled: boolean
  readonly selected: number
  readonly onChange: (i: number) => void
}

interface SearchResponse {
  readonly position?: number
  readonly score: number
}

function Board(props: Readonly<{ squares: ReadonlyArray<CellType>, onClick: (i: number) => void }>) {
  const size = 400;
  return (
    <Svg
      width={size}
      height={size}
    >
      {props.squares.map((c, i) => {
        const length = size / 3;
        const x = i % 3 * length;
        const y = Math.floor(i / 3) * length;
        const cx = x + length / 2;
        const cy = y + length / 2;
        const rect = <Square x={x} y={y} size={length} onClick={() => props.onClick(i)}/>;
        let mark;
        switch (c) {
          case 'X':
            mark = <Cross centerX={cx} centerY={cy} size={length}/>;
            break;
          case 'O':
            mark = <Circle centerX={cx} centerY={cy} size={length}/>;
            break;
        }
        return (
          <React.Fragment key={i}>
            {mark}
            {rect}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function Select(props: SelectProps) {
  return (
    <div className="select">
      <select
        onChange={(e) => props.onChange(parseInt(e.target.value))}
        value={props.selected}
        disabled={props.isDisabled}
      >
        {props.items.map((s, i) => (
          <option key={i} value={i}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}

function put(board: BoardProps, position: number, score?: number): BoardProps {
  const s = board.squares.slice();
  s[position] = board.next;
  return {
    squares: s,
    next: board.next === 'X' ? 'O' : 'X',
    history: board.history.concat([{position, score}]),
  };
}

function TicTacToe(): React.ReactElement {
  const defaultBoard: BoardProps = {
    squares: Array(9).fill('E'),
    next: 'X',
    history: [],
  } as const;
  const playerList = ['Human', 'AI (Full Exploration)'] as const;

  const loaded = useWasm();
  const [calculating, setCalculating] = useState(false);
  const [board, setBoard] = useState<BoardProps>(defaultBoard);
  const [winner, setWinner] = useState<CellType | null>(null);
  const [player, setPlayer] = useState({X: 0, O: 0});

  useEffect(() => {
    if (loaded) {
      wasm.calculateWinner(board.squares).then(setWinner);
    }
  }, [loaded, board.squares]);
  useEffect(() => {
    if (!loaded) return;
    if (calculating) return;

    if (player[board.next] !== 1) return;

    setCalculating(true);
    wasm.search(board.squares, board.next).then((result: SearchResponse) => {

      if (typeof result.position === 'number') {
        setBoard(put(board, result.position, result.score));
      }
      setCalculating(false);
    });
  }, [loaded, calculating, board, player])

  if (!loaded) {
    return <div>Loading...</div>;
  }

  function handleClick(i: number): void {
    if (winner !== null) return;
    if (board.squares[i] !== 'E') return;
    if (player[board.next] === 0) {
      setBoard(put(board, i));
    }
  }

  function handlePlayerChange(side: 'X' | 'O', i: number): void {
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
  }

  let status;
  if (winner === null) {
    status = `next player: ${board.next}`
  } else if (winner === 'E') {
    status = 'draw';
  } else {
    status = `winner: ${winner}`;
  }

  const history = board.history.map((h, i) => {
    if (h.score != null) {
      return <li key={i}>{'OX'[i % 2]}: pos={h.position} score={h.score}</li>
    } else {
      return <li key={i}>{'OX'[i % 2]}: pos={h.position}</li>
    }
  });

  return (
    <div className="container">
      <div className="content is-flex-direction-row">
        X
        <Select
          items={playerList}
          selected={player.X}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('X', i)}
        />
        vs
        <Select
          items={playerList}
          selected={player.O}
          isDisabled={false}
          onChange={(i) => handlePlayerChange('O', i)}
        />
        O
      </div>
      <div className="content">
        <Board
          squares={board.squares}
          onClick={handleClick}
        />
      </div>
      <div className="content">
        <p>{status}</p>
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

export default TicTacToe;
