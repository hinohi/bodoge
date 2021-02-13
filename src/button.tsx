import React from 'react';

export function ResetButton(props: Readonly<{ hasWinner: boolean, onClick: () => void }>) {
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
