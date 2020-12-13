import React, {useEffect, useState} from 'react';
import * as Comlink from 'comlink';

const wasm = Comlink.wrap<import('./worker').ModuleType>(new Worker('./worker', {
  name: 'ttt',
  type: 'module'
}));

type CellType = 'E' | 'X' | 'O';

interface BoardProps {
  readonly squares: ReadonlyArray<CellType>
  readonly xIsNext: boolean
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


function TicTacToe() {
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState([{
    squares: Array(9).fill('E'),
    xIsNext: true,
  }]);
  const [winner, setWinner] = useState('E');

  const board = history[history.length - 1];

  useEffect(() => {
    wasm.initialize().then(() => setLoaded(true));
  }, [loaded]);
  useEffect(() => {
    if (loaded) {
      wasm.calculateWinner(board.squares).then(setWinner);
    }
  }, [loaded, board.squares]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  function handleClick(i: number): void {
    if (winner !== 'E') {
      return;
    }
    if (board.squares[i] !== 'E') {
      return;
    }
    const s = board.squares.slice();
    s[i] = board.xIsNext ? 'X' : 'O';
    setHistory(history.concat({
      squares: s,
      xIsNext: !board.xIsNext,
    }));
  }

  function jumpTo(i: number): void {
    setHistory(history.slice(0, i + 1));
  }

  let status;
  if (winner !== 'E') {
    status = `winner: ${winner}`;
  } else {
    status = `next player: ${board.xIsNext ? 'X' : 'O'}`
  }

  const moves = history
    .slice(0, history.length - 1)
    .map((board, move) => {
      const desc = move === 0 ? 'Go to game start' : `Go to #${move}`;
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{desc}</button>
        </li>
      );
    });

  return (
    <div className="container">
      <div className="content">
        <Board
          squares={board.squares}
          xIsNext={board.xIsNext}
          onClick={handleClick}
        />
      </div>
      <div className="content">
        <div>{status}</div>
      </div>
      <div className="content">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

export default TicTacToe;
