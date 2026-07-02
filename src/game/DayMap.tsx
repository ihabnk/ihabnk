import { useRef } from 'react';
import { motion } from 'framer-motion';
import { DAYS } from '../data/onboarding';
import { TOTAL_DAYS } from './types';
import { gsap, useGSAP, reduceMotion } from './gsapSetup';

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

/** Walker floats this far above the trail. */
const HOVER = 26;
const MOUTH_REST = 'M-4 5 L4 5';
const MOUTH_GRIN = 'M-4 4 Q0 10 4 4';

interface Props {
  isUnlocked: (n: number) => boolean;
  isDone: (n: number) => boolean;
  onPick: (n: number) => void;
}

export default function DayMap({ isUnlocked, isDone, onPick }: Props) {
  const nodes = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1);
  const current = nodes.find((n) => !isDone(n)) ?? TOTAL_DAYS;
  const currentIdx = current - 1;

  const svgRef = useRef<SVGSVGElement>(null);
  const walkerRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPolylineElement>(null);

  // connector polyline through node centers
  const line = nodes.map((_, i) => { const p = pos(i); return `${p.x},${p.y}`; }).join(' ');
  // the travelled part of the trail: node 0 up to the current node
  const trail = nodes.slice(0, currentIdx + 1).map((_, i) => { const p = pos(i); return `${p.x},${p.y}`; }).join(' ');

  // Bit walks the trail to today's node: DrawSVG draws the travelled line
  // while MotionPath carries the walker along it; MorphSVG grins on arrival.
  useGSAP(() => {
    const walker = walkerRef.current;
    if (!walker) return;
    const mouth = walker.querySelector<SVGPathElement>('.qg-walker-mouth');
    const points = nodes.slice(0, currentIdx + 1).map((_, i) => {
      const p = pos(i);
      return { x: p.x, y: p.y - HOVER };
    });
    const end = points[points.length - 1];

    if (reduceMotion() || currentIdx === 0) {
      gsap.set(walker, { x: end.x, y: end.y });
      if (trailRef.current) gsap.set(trailRef.current, { drawSVG: '100%' });
      return;
    }

    const travel = Math.min(0.28 * currentIdx + 0.6, 2.4);
    const tl = gsap.timeline();
    tl.set(walker, { x: points[0].x, y: points[0].y });
    if (trailRef.current) {
      tl.fromTo(trailRef.current, { drawSVG: '0%' }, { drawSVG: '100%', duration: travel, ease: 'power1.inOut' }, 0);
    }
    if (points.length > 1) {
      tl.to(walker, { motionPath: { path: points, curviness: 1 }, duration: travel, ease: 'power1.inOut' }, 0);
      // a little waddle while travelling
      tl.to(walker, { rotation: 6, duration: 0.18, repeat: Math.ceil(travel / 0.18) - 1, yoyo: true, ease: 'sine.inOut' }, 0);
      tl.set(walker, { rotation: 0 });
    }
    if (mouth) tl.to(mouth, { morphSVG: MOUTH_GRIN, duration: 0.3, ease: 'back.out(2)' }, '>-0.05');
    // settle into an idle hover-bob over today's node
    tl.to(walker, { y: end.y - 5, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }, { dependencies: [current], scope: svgRef });

  return (
    <div className="qg-map">
      <svg ref={svgRef} viewBox="0 0 520 500" className="qg-map-svg" role="list" aria-label="30-day journey">
        <polyline points={line} className="qg-map-line" />
        {currentIdx > 0 && <polyline ref={trailRef} points={trail} className="qg-map-trail" />}
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

        {/* Bit, en route to today */}
        <g ref={walkerRef} className="qg-walker" aria-hidden="true">
          <rect x="-10" y="-10" width="20" height="20" rx="6" />
          <circle className="qg-walker-eye" cx="2" cy="-2.5" r="4.4" />
          <circle className="qg-walker-pupil" cx="2.8" cy="-2" r="2" />
          <path className="qg-walker-mouth" d={MOUTH_REST} />
        </g>
      </svg>

      <div className="qg-weeks">
        {WEEKS.map((w, i) => (
          <span key={w} className="qg-week-chip">W{i + 1} · {w}</span>
        ))}
      </div>
    </div>
  );
}
