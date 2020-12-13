import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

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

type CellType = 'E' | 'X' | 'O';

interface BoardProps {
  readonly squares: ReadonlyArray<CellType>
  readonly xIsNext: boolean
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

function Board(props: BoardProps & Readonly<{ onClick: (i: number) => void }>) {
  const size = 300;
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
    >
      {props.squares.map((c, i) => {
        const length = size / 3;
        const x = i % 3 * length;
        const y = Math.floor(i / 3) * length;
        const cx = x + length / 2;
        const cy = y + length / 2;
        const rect = (<rect
          x={x + 2}
          y={y + 2}
          width={length - 4}
          height={length - 4}
          rx="6"
          ry="6"
          fill="rgba(255, 255, 255, 0)"
          stroke="#111111"
          onClick={() => props.onClick(i)}
        />);
        let mark;
        switch (c) {
          case 'X':
            const a = length * 0.9;
            const b = length * 0.1;
            mark = (
              <g
                fill="#53B0FF"
                transform={`rotate(45 ${cx} ${cy})`}
              >
                <rect
                  x={cx - a / 2}
                  y={cy - b / 2}
                  rx={b / 2}
                  width={a}
                  height={b}
                />
                <rect
                  x={cx - b / 2}
                  y={cy - a / 2}
                  ry={b / 2}
                  width={b}
                  height={a}
                />
              </g>
            );
            break;
          case 'O':
            mark = (
              <circle
                cx={cx}
                cy={cy}
                r={length / 3.5}
                fill="none"
                stroke="#FF972D"
                strokeWidth={length / 10}
              />
            );
            break;
          default:
            break;
        }
        return (
          <React.Fragment key={i}>
            {mark}
            {rect}
          </React.Fragment>
        );
      })}
    </svg>
  );
}

function ResetButton(props: Readonly<{ hasWinner: boolean, onClick: () => void }>) {
  if (props.hasWinner) {
    return (
      <button className="button is-primary" onClick={props.onClick}>
        Reset
      </button>
    );
  } else {
    return (
      <button className="button is-danger" onClick={props.onClick}>
        Reset
      </button>
    );
  }
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

function put(board: BoardProps, position: number): BoardProps {
  const s = board.squares.slice();
  s[position] = board.xIsNext ? 'X' : 'O';
  return {
    squares: s,
    xIsNext: !board.xIsNext,
  };
}

function TicTacToe() {
  const defaultBoard = {
    squares: Array(9).fill('E'),
    xIsNext: true,
  } as const;
  const playerList = ['Human', 'AI (Full Exploration)'] as const;

  const loaded = useWasm();
  const [calculating, setCalculating] = useState(false);
  const [board, setBoard] = useState<BoardProps>(defaultBoard);
  const [winner, setWinner] = useState<CellType | null>(null);
  const [player, setPlayer] = useState({
    X: 0,
    O: 0,
  });

  useEffect(() => {
    if (loaded) {
      wasm.calculateWinner(board.squares).then(setWinner);
    }
  }, [loaded, board.squares]);
  useEffect(() => {
    if (!loaded) return;
    if (calculating) return;

    const side = board.xIsNext ? 'X' : 'O';
    if (player[side] !== 1) return;

    setCalculating(true);
    wasm.search(board.squares, side).then((result: SearchResponse) => {
      console.log(result);
      if (typeof result.position === 'number') {
        setBoard(put(board, result.position));
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
    const next = board.xIsNext ? 'X' : 'O';
    if (player[next] === 0) {
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
    status = `next player: ${board.xIsNext ? 'X' : 'O'}`
  } else if (winner === 'E') {
    status = 'draw';
  } else {
    status = `winner: ${winner}`;
  }

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
          xIsNext={board.xIsNext}
          onClick={handleClick}
        />
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

export default TicTacToe;
