import { motion } from 'framer-motion';
import { DAYS } from '../data/onboarding';
import { TOTAL_DAYS } from './types';

const COLS = [60, 160, 260, 360, 460];
const ROWS = [54, 134, 214, 294, 374, 454];
const WEEKS = ['Observe', 'Question', 'Break', 'Protect', 'Collaborate', 'Own'];

function pos(i: number) {
  const row = Math.floor(i / 5);
  const inRow = i % 5;
  const col = row % 2 === 0 ? inRow : 4 - inRow; // serpentine
  return { x: COLS[col], y: ROWS[row], row };
}

const hasContent = (n: number) => DAYS.some((d) => d.n === n);
const dayTitle = (n: number) => DAYS.find((d) => d.n === n)?.title;

interface Props {
  isUnlocked: (n: number) => boolean;
  isDone: (n: number) => boolean;
  onPick: (n: number) => void;
}

export default function DayMap({ isUnlocked, isDone, onPick }: Props) {
  const nodes = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
  const current = nodes.find((n) => !isDone(n)) ?? TOTAL_DAYS;

  // connector polyline through node centers
  const line = nodes.map((_, i) => { const p = pos(i); return `${p.x},${p.y}`; }).join(' ');

  return (
    <div className="qg-map">
      <svg viewBox="0 0 520 500" className="qg-map-svg" role="list" aria-label="30-day journey">
        <polyline points={line} className="qg-map-line" />
        {nodes.map((n, i) => {
          const p = pos(i);
          const done = isDone(n);
          const playable = isUnlocked(n) && hasContent(n);
          const isCurrent = n === current && playable;
          const state = done ? 'done' : playable ? 'open' : 'locked';
          return (
            <g
              key={n}
              role="listitem"
              className={`qg-node qg-node--${state} ${isCurrent ? 'is-current' : ''}`}
              transform={`translate(${p.x} ${p.y})`}
              onClick={() => playable && onPick(n)}
              tabIndex={playable ? 0 : -1}
              onKeyDown={(e) => { if (playable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onPick(n); } }}
              aria-label={`Day ${n}${dayTitle(n) ? ` — ${dayTitle(n)}` : ''}${done ? ', completed' : playable ? '' : ', locked'}`}
            >
              {dayTitle(n) && <title>{`Day ${n} — ${dayTitle(n)}`}</title>}
              {isCurrent && <circle className="qg-node-pulse" r="22" />}
              <motion.circle
                className="qg-node-dot" r="17"
                initial={false}
                animate={{ scale: done ? 1 : isCurrent ? 1 : 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {done
                ? <path className="qg-node-check" d="M-6 0 L-2 4 L6 -5" />
                : <text className="qg-node-num" textAnchor="middle" dy="5">{n}</text>}
            </g>
          );
        })}
      </svg>

      <div className="qg-weeks">
        {WEEKS.map((w, i) => (
          <span key={w} className="qg-week-chip">W{i + 1} · {w}</span>
        ))}
      </div>
    </div>
  );
}
