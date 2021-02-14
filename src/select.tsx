import React from "react";

interface SelectProps {
  readonly items: ReadonlyArray<string>
  readonly isDisabled: boolean
  readonly selected: number
  readonly onChange: (i: number) => void
}

export function Select(props: SelectProps) {
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
