import { useEffect, useState } from 'react';
import { chooseMove, type Difficulty } from './cpu';
import {
  type Board,
  CELLS,
  countTiles,
  DIAGONAL,
  legalCells,
  type Move,
  newGame,
  type PlayerCount,
  play,
  SIDE,
} from './game';
import './style.css';

type Controller = 'human' | Difficulty;
const controllers: { value: Controller; label: string }[] = [
  { value: 'human', label: 'Human' },
  { value: 'basic', label: 'CPU · Basic' },
  { value: 'strategic', label: 'CPU · Strategic' },
  { value: 'expert', label: 'CPU · Expert' },
];

const rulebook = 'https://cdn.1j1ju.com/medias/53/fb/40-lucky-numbers-rulebook.pdf';

function Clover({ tile }: { tile?: number }) {
  return (
    <span className="lucky-clover" aria-hidden="true">
      {tile}
    </span>
  );
}

function Garden({
  board,
  player,
  controller,
  active,
  winner,
  legal,
  lastCell,
  onControllerChange,
  onPlace,
}: {
  board: Board;
  player: number;
  controller: Controller;
  active: boolean;
  winner: boolean;
  legal: number[];
  lastCell?: number | null;
  onControllerChange: (controller: Controller) => void;
  onPlace: (cell: number) => void;
}) {
  return (
    <section
      className="lucky-garden"
      data-active={active}
      data-winner={winner}
      aria-label={`Player ${player + 1} garden`}
    >
      <header className="lucky-garden-heading">
        <h2>Player {player + 1}</h2>
        <span className="lucky-score">
          {countTiles(board)} / {CELLS}
        </span>
      </header>
      <select
        aria-label={`Player ${player + 1} controller`}
        value={controller}
        onChange={(event) => onControllerChange(event.target.value as Controller)}
      >
        {controllers.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="lucky-grid">
        {board.map((tile, cell) => {
          const canPlace = legal.includes(cell);
          const label = `Row ${Math.floor(cell / SIDE) + 1}, column ${(cell % SIDE) + 1}`;
          const description = canPlace ? (tile ? `replace ${tile}` : 'place tile') : tile || 'empty';
          return (
            <button
              type="button"
              className="lucky-cell"
              key={cell}
              data-diagonal={DIAGONAL.some((index) => index === cell)}
              data-last={lastCell === cell}
              aria-label={`${label}: ${description}`}
              disabled={!canPlace}
              onClick={() => onPlace(cell)}
            >
              {tile ? <Clover tile={tile} /> : canPlace && <span aria-hidden="true">+</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function LuckyNumbers() {
  const [game, setGame] = useState(() => newGame(2));
  const [seats, setSeats] = useState<Controller[]>(['human', 'strategic', 'strategic', 'strategic']);
  const [first, setFirst] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const { boards, market, remaining, turn, drawn, winners, lastPlay } = game.position;
  const finished = winners.length > 0;
  const controller = seats[turn];
  const humanTurn = !finished && controller === 'human';
  const tile = drawn ?? selected;
  const legal = humanTurn && tile !== null ? legalCells(boards[turn], tile) : [];
  const marketCounts = new Map<number, number>();
  for (const value of market) marketCounts.set(value, (marketCounts.get(value) ?? 0) + 1);

  useEffect(() => {
    if (finished || controller === 'human') return;
    let worker: Worker | undefined;
    function commit(move: Move | undefined) {
      if (move) setGame((current) => (current === game ? play(current, move) : current));
    }
    function fallback() {
      worker?.terminate();
      commit(chooseMove(game.position, controller === 'basic' ? 'basic' : 'strategic'));
    }
    const timer = window.setTimeout(() => {
      try {
        worker = new Worker(new URL('./worker.ts', import.meta.url), { name: 'lucky-numbers', type: 'module' });
        worker.onmessage = ({ data }: MessageEvent<Move | undefined>) => commit(data);
        worker.onerror = fallback;
        worker.postMessage({ position: game.position, difficulty: controller });
      } catch {
        fallback();
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      worker?.terminate();
    };
  }, [controller, finished, game]);

  function restart(players: PlayerCount, firstPlayer: number) {
    setSelected(null);
    setFirst(firstPlayer);
    setGame(newGame(players, firstPlayer));
  }

  function move(action: Move) {
    if (!humanTurn) return;
    setSelected(null);
    setGame((current) => (current === game ? play(current, action) : current));
  }

  function place(cell: number) {
    if (drawn !== null) move({ type: 'place', cell });
    else if (selected !== null) move({ type: 'take', tile: selected, cell });
  }

  let status = 'Draw a tile or choose one from the table.';
  if (finished) {
    status =
      winners.length > 1
        ? `Players ${winners.map((winner) => winner + 1).join(', ')} tie for the win.`
        : `Player ${winners[0] + 1} wins!`;
  } else if (!humanTurn) {
    status = `Player ${turn + 1} is thinking…`;
  } else if (drawn !== null) {
    status = legal.length
      ? `Place ${drawn} in a highlighted space or discard it.`
      : `No space fits ${drawn}. Discard it to end your turn.`;
  } else if (selected !== null) {
    status = `Place ${selected} in a highlighted space.`;
  }

  return (
    <div className="lucky-page">
      <div className="lucky-shell">
        <header className="lucky-header">
          <div>
            <h1>Lucky Numbers</h1>
            <p>Fill your garden with numbers that rise from left to right and top to bottom.</p>
          </div>
          <a href={rulebook} target="_blank" rel="noreferrer">
            Read the rules <span aria-hidden="true">↗</span>
          </a>
        </header>

        <div className="lucky-settings">
          <label>
            Players
            <select
              aria-label="Players"
              value={boards.length}
              onChange={(event) => {
                const players = Number(event.target.value) as PlayerCount;
                restart(players, first < players ? first : 0);
              }}
            >
              {[2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <label>
            First player
            <select
              aria-label="First player"
              value={first}
              onChange={(event) => restart(boards.length as PlayerCount, Number(event.target.value))}
            >
              {boards.map((_, player) => (
                <option key={player} value={player}>
                  Player {player + 1}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => restart(boards.length as PlayerCount, first)}>
            New game
          </button>
        </div>

        <div className="lucky-table" data-players={boards.length}>
          <section className="lucky-supply" aria-label="Tile supply">
            <div className="lucky-turn">
              <span>
                {finished
                  ? boards[winners[0]].every(Boolean)
                    ? 'Garden complete'
                    : 'Deck exhausted'
                  : `Player ${turn + 1}’s turn`}
              </span>
              <p role="status">{status}</p>
            </div>
            <div className="lucky-draw">
              <button
                type="button"
                className="lucky-deck"
                disabled={!humanTurn || drawn !== null || !remaining}
                onClick={() => move({ type: 'draw' })}
              >
                <Clover />
                <span>
                  Draw tile <small>{remaining} left</small>
                </span>
              </button>
              {drawn !== null && (
                <div className="lucky-drawn">
                  <span className="lucky-tile">
                    <Clover tile={drawn} />
                  </span>
                  {humanTurn && (
                    <button type="button" onClick={() => move({ type: 'discard' })}>
                      Discard {drawn}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="lucky-market">
              <h2>Face-up tiles</h2>
              {market.length ? (
                <div className="lucky-market-tiles">
                  {[...marketCounts]
                    .sort(([a], [b]) => a - b)
                    .map(([value, copies]) => (
                      <button
                        type="button"
                        className="lucky-tile"
                        key={value}
                        disabled={!humanTurn || drawn !== null || !legalCells(boards[turn], value).length}
                        aria-label={`Take ${value}${copies > 1 ? `, ${copies} available` : ''}`}
                        aria-pressed={selected === value}
                        onClick={() => setSelected(selected === value ? null : value)}
                      >
                        <Clover tile={value} />
                        {copies > 1 && <small aria-hidden="true">×{copies}</small>}
                      </button>
                    ))}
                </div>
              ) : (
                <p>The table is empty.</p>
              )}
            </div>
          </section>
          {boards.map((board, player) => (
            <Garden
              key={player}
              board={board}
              player={player}
              controller={seats[player]}
              active={!finished && player === turn}
              winner={winners.includes(player)}
              legal={player === turn ? legal : []}
              lastCell={lastPlay?.player === player ? lastPlay.cell : undefined}
              onControllerChange={(value) => {
                setSelected(null);
                setSeats((previous) => previous.map((seat, index) => (index === player ? value : seat)));
              }}
              onPlace={place}
            />
          ))}
          {lastPlay && (
            <p className="lucky-last">
              Player {lastPlay.player + 1}{' '}
              {lastPlay.cell === null
                ? `discarded ${lastPlay.tile}`
                : lastPlay.replaced
                  ? `exchanged ${lastPlay.replaced} for ${lastPlay.tile}`
                  : `placed ${lastPlay.tile}`}
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
