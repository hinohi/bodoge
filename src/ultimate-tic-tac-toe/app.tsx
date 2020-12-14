import React, {Fragment, useState, useEffect} from 'react';

import {Svg, Cross, Circle, Square} from '../svg';

type Side = 'X' | 'O'
type CellType = 'E' | Side;
type MidCellType = Side | ReadonlyArray<CellType>;

interface BoardProps {
  readonly size: number
  readonly squares: ReadonlyArray<MidCellType>
  readonly onClick: (i: number, j: number) => void
}

function Board(props: BoardProps) {
  return (
    <Svg
      width={props.size}
      height={props.size}
    >
      {props.squares.map((sq, i) => {
        const size = props.size / 3;
        const x = i % 3 * size;
        const y = Math.floor(i / 3) * size;
        return (
          <MidCell
            key={i}
            id={i}
            x={x}
            y={y}
            size={size}
            squares={sq}
            onClick={(j: number) => props.onClick(i, j)}
          />
        );
      })}
    </Svg>
  );
}

interface MidCellProps {
  readonly id: number
  readonly x: number
  readonly y: number
  readonly size: number
  readonly squares: MidCellType
  readonly onClick: (i: number) => void
}

function MidCell(props: MidCellProps) {
  if (typeof props.squares === 'object') {
    const margin = props.size / 10;
    return (
      <Fragment>
        <Square x={props.x} y={props.y} size={props.size}/>
        {props.squares.map((cell, i) => {
          const size = (props.size - margin * 2) / 3;
          const x = props.x + i % 3 * size + margin;
          const y = props.y + Math.floor(i / 3) * size + margin;
          return (
            <Cell
              key={i}
              id={i}
              x={x}
              y={y}
              size={size}
              type={cell}
              onClick={() => props.onClick(i)}
            />
          );
        })}
      </Fragment>
    );
  } else {
    return (
      <Cell
        id={props.id}
        x={props.x}
        y={props.y}
        size={props.size}
        type={props.squares}
      />
    );
  }
}

interface CellProps {
  readonly id: number
  readonly x: number
  readonly y: number
  readonly size: number
  readonly type: CellType
  readonly onClick?: () => void
}

function Cell(props: CellProps) {
  const cx = props.x + props.size / 2;
  const cy = props.y + props.size / 2;
  let mark;
  switch (props.type) {
    case 'X':
      mark = <Cross centerX={cx} centerY={cy} size={props.size}/>;
      break;
    case 'O':
      mark = <Circle centerX={cx} centerY={cy} size={props.size}/>;
      break;
  }
  return (
    <React.Fragment>
      {mark}
      <Square
        x={props.x}
        y={props.y}
        size={props.size}
        onClick={props.onClick}
      />
    </React.Fragment>
  );
}

interface PlayingInfo {
  readonly squares: ReadonlyArray<MidCellType>
  readonly next: Side
}

function put(info: PlayingInfo, midPos: number, innerPos: number): PlayingInfo {
  const squares = info.squares.slice();
  const inner = squares[midPos];
  if (typeof inner === 'object') {
    const s = inner.slice()
    s[innerPos] = info.next;
    squares[midPos] = s;
  }
  return {
    squares,
    next: info.next === 'X' ? 'O' : 'X',
  };
}

function UTicTacToe() {
  const defaultInfo = {
    squares: Array(9).fill(Array(9).fill('E')),
    next: 'X',
  } as const;
  const [playingInfo, setPlayingInfo] = useState<PlayingInfo>(defaultInfo);

  useEffect(() => {
    let change = false;
    const squares = playingInfo.squares.map((sq) => {
      if (typeof sq === 'object') {
        if (sq.reduce((a, b) => a + (b !== 'E' ? 1 : 0), 0) > 2) {
          change = true;
          return 'X';
        }
      }
      return sq
    });
    if (change) {
      setPlayingInfo({
        squares,
        next: playingInfo.next,
      });
    }
  }, [playingInfo]);

  function handleClick(i: number, j: number): void {
    const inner = playingInfo.squares[i]
    if (typeof inner !== 'object') return;
    if (inner[j] !== 'E') return;
    setPlayingInfo(put(playingInfo, i, j));
  }

  return (
    <div className="container">
      <div className="content">
        <Board
          size={9 * 50}
          squares={playingInfo.squares}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

export default UTicTacToe;
