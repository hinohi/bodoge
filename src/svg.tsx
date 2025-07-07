import type { ReactElement, ReactNode } from 'react';

export interface SvgProps {
  readonly width: number;
  readonly height: number;
}

export function Svg(props: SvgProps & Readonly<{ children?: ReactNode[] }>): ReactElement {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height}>
      {props.children}
    </svg>
  );
}

export interface SquareProps {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly onClick?: () => void;
}

export function Square(props: SquareProps): ReactElement {
  const margin = props.size / 50;
  return (
    <rect
      x={props.x + margin}
      y={props.y + margin}
      width={props.size - margin * 2}
      height={props.size - margin * 2}
      rx={margin * 3}
      ry={margin * 3}
      fill="rgba(0, 0, 0, 0)"
      stroke="#111111"
      onClick={props.onClick}
    />
  );
}

export interface CellMarkProps {
  readonly centerX: number;
  readonly centerY: number;
  readonly size: number;
}

export function Cross(props: CellMarkProps): ReactElement {
  const a = props.size * 0.9;
  const b = props.size * 0.1;
  return (
    <g fill="#53B0FF" transform={`rotate(45 ${props.centerX} ${props.centerY})`}>
      <rect x={props.centerX - a / 2} y={props.centerY - b / 2} rx={b / 2} width={a} height={b} />
      <rect x={props.centerX - b / 2} y={props.centerY - a / 2} ry={b / 2} width={b} height={a} />
    </g>
  );
}

export function Circle(props: CellMarkProps): ReactElement {
  return (
    <circle
      cx={props.centerX}
      cy={props.centerY}
      r={props.size / 3.5}
      fill="none"
      stroke="#FF972D"
      strokeWidth={props.size / 10}
    />
  );
}
