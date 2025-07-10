import { Select } from './Select';

interface PlayerSelectionProps {
  readonly playerLabels: [string, string];
  readonly playerOptions: ReadonlyArray<string>;
  readonly selectedPlayers: [number, number];
  readonly onPlayerChange: (playerIndex: 0 | 1, optionIndex: number) => void;
  readonly isDisabled?: boolean;
}

export function PlayerSelection(props: PlayerSelectionProps) {
  const { playerLabels, playerOptions, selectedPlayers, onPlayerChange, isDisabled = false } = props;

  return (
    <div className="box">
      <div className="columns is-mobile is-vcentered">
        <div className="column is-narrow">
          <div className="field">
            <div className="label">{playerLabels[0]}</div>
            <div className="control">
              <Select
                items={playerOptions}
                selected={selectedPlayers[0]}
                isDisabled={isDisabled}
                onChange={(i) => onPlayerChange(0, i)}
              />
            </div>
          </div>
        </div>

        <div className="column is-narrow has-text-centered">
          <span className="tag is-info is-medium">VS</span>
        </div>

        <div className="column is-narrow">
          <div className="field">
            <div className="label">{playerLabels[1]}</div>
            <div className="control">
              <Select
                items={playerOptions}
                selected={selectedPlayers[1]}
                isDisabled={isDisabled}
                onChange={(i) => onPlayerChange(1, i)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
