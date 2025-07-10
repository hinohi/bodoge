import React from 'react';
import { GRID_SIZE, type TicTacToeCellType } from '../../../types/tic-tac-toe';
import { Circle, Cross, Square, Svg } from '../../common';

interface TicTacToeBoardProps {
  squares: ReadonlyArray<TicTacToeCellType>;
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

const BOARD_SIZE_PX = 400;
const CELL_SIZE = BOARD_SIZE_PX / GRID_SIZE;

export const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({ squares, onCellClick, disabled = false }) => {
  const renderCell = (cellValue: TicTacToeCellType, index: number) => {
    const x = (index % GRID_SIZE) * CELL_SIZE;
    const y = Math.floor(index / GRID_SIZE) * CELL_SIZE;
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;

    const handleClick = () => {
      if (!disabled && cellValue === 'E') {
        onCellClick(index);
      }
    };

    return (
      <React.Fragment key={`cell-${index}`}>
        {cellValue === 'X' && <Cross centerX={centerX} centerY={centerY} size={CELL_SIZE} />}
        {cellValue === 'O' && <Circle centerX={centerX} centerY={centerY} size={CELL_SIZE} />}
        <Square x={x} y={y} size={CELL_SIZE} onClick={handleClick} />
      </React.Fragment>
    );
  };

  return (
    <Svg width={BOARD_SIZE_PX} height={BOARD_SIZE_PX}>
      {squares.map(renderCell)}
    </Svg>
  );
};
