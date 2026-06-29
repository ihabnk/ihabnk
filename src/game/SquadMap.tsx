import { motion, useReducedMotion } from 'framer-motion';

/**
 * The "whole view" — the squad picture the hero pieces together over Day 1.
 * You (the tester) at the centre, woven through the roles around you. Built as
 * SVG so it scales/themes; Framer staggers the reveal so it assembles itself.
 */
interface Node { id: string; label: string; sub: string; color: string; x: number; y: number; center?: boolean; }

const CX = 185, CY = 165;
const NODES: Node[] = [
  { id: 'you',   label: 'You',   sub: 'Tester',            color: '#9a6010', x: CX, y: CY, center: true },
  { id: 'pm',    label: 'Maya',  sub: 'PM · what & why',   color: '#9a6010', x: 60,  y: 60 },
  { id: 'po',    label: 'Priya', sub: 'PO · priorities',   color: '#c0521a', x: 310, y: 60 },
  { id: 'dev',   label: 'Idris', sub: 'Devs · build & fix', color: '#6b5040', x: 60,  y: 270 },
  { id: 'users', label: 'Users', sub: 'who you protect',   color: '#4a7fa8', x: 310, y: 270 },
];
const around = NODES.filter((n) => !n.center);
const you = NODES.find((n) => n.center)!;

export default function SquadMap() {
  const reduce = useReducedMotion();
  const t = (i: number) => (reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 260, damping: 22, delay: 0.25 + i * 0.12 });

  return (
    <svg className="qg-squadmap" viewBox="0 0 370 330" role="img" aria-label="Your squad: you, the tester, connected to the PM, PO, developers, and users">
      {/* relationship links */}
      {around.map((n, i) => (
        <motion.line key={`l-${n.id}`} x1={you.x} y1={you.y} x2={n.x} y2={n.y}
          className="qg-sm-link"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.15 + i * 0.12 }} />
      ))}

      {/* nodes — outer <g> positions (static), inner motion <g> scales in place */}
      {NODES.map((n, i) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <motion.g
            initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={t(n.center ? 0 : i)}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle r={n.center ? 30 : 24} fill={n.color} className={`qg-sm-node ${n.center ? 'is-you' : ''}`} />
            <text className="qg-sm-init" textAnchor="middle" dy={n.center ? 6 : 5}>{n.label.slice(0, 1)}</text>
            <text className="qg-sm-label" textAnchor="middle" y={n.center ? 48 : 40}>{n.label}</text>
            <text className="qg-sm-sub" textAnchor="middle" y={n.center ? 62 : 53}>{n.sub}</text>
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
