import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from './gsapSetup';

/**
 * The "whole picture" — the squad map the hero pieces together on Day 1.
 * GSAP orchestrates the reveal as one timeline:
 *
 *   1. You land in the centre (CustomBounce, with squash)
 *   2. Curved relationship links draw outward (DrawSVG)…
 *   3. …and each role node pops in as its link arrives
 *   4. The perimeter web joins the squad to each other (DrawSVG, dashed)
 *   5. "Tester" decrypts under your node (ScrambleText)
 *   6. Forever after: signal dots ride the curved links (MotionPath),
 *      a spark orbits the perimeter, the centre ring pulses
 */
interface Node { id: string; label: string; sub: string; color: string; x: number; y: number; center?: boolean; }

const CX = 185, CY = 165;
const NODES: Node[] = [
  { id: 'you',   label: 'You',   sub: 'Tester',             color: '#9a6010', x: CX, y: CY, center: true },
  { id: 'pm',    label: 'Maya',  sub: 'PM · what & why',    color: '#9a6010', x: 60,  y: 60 },
  { id: 'po',    label: 'Priya', sub: 'PO · priorities',    color: '#c0521a', x: 310, y: 60 },
  { id: 'dev',   label: 'Idris', sub: 'Devs · build & fix', color: '#6b5040', x: 60,  y: 270 },
  { id: 'users', label: 'Users', sub: 'who you protect',    color: '#4a7fa8', x: 310, y: 270 },
];
const around = NODES.filter((n) => !n.center);
const you = NODES.find((n) => n.center)!;

/** Curved link from the centre to a node — bows outward for life. */
function linkPath(n: Node): string {
  const mx = (you.x + n.x) / 2;
  const my = (you.y + n.y) / 2;
  // perpendicular offset for the bow
  const dx = n.x - you.x, dy = n.y - you.y;
  const len = Math.hypot(dx, dy) || 1;
  const bow = 16;
  const ox = (-dy / len) * bow, oy = (dx / len) * bow;
  return `M ${you.x} ${you.y} Q ${mx + ox} ${my + oy} ${n.x} ${n.y}`;
}

/** The perimeter web: colleagues joined to each other, bowing outward. */
const PERIMETER = 'M 60 60 Q 185 34 310 60 Q 338 165 310 270 Q 185 296 60 270 Q 32 165 60 60';

export default function SquadMap() {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const links = root.querySelectorAll<SVGPathElement>('.qg-sm-linkpath');
    const nodes = root.querySelectorAll('.qg-sm-nodepop');
    const centre = root.querySelector('.qg-sm-nodepop--you');
    const perim = root.querySelector<SVGPathElement>('.qg-sm-perim');
    const labels = root.querySelectorAll('.qg-sm-labels');
    const sub = root.querySelector('.qg-sm-sub--you');
    const ring = root.querySelector('.qg-sm-ring');
    const signals = root.querySelectorAll<SVGCircleElement>('.qg-sm-signal');
    const orb = root.querySelector('.qg-sm-orb');

    if (reduceMotion()) {
      gsap.set([...links, ...nodes, ...labels, perim].filter(Boolean), { opacity: 1 });
      gsap.set([ring, orb, ...signals].filter(Boolean) as Element[], { opacity: 0 });
      return;
    }

    const tl = gsap.timeline();

    // 1. you land, with squash
    tl.from(centre, { scale: 0, transformOrigin: 'center', duration: 0.9, ease: 'bitBounce' });

    // 2 + 3. links draw out; each node pops as its link arrives
    links.forEach((link, i) => {
      const at = 0.55 + i * 0.22;
      tl.fromTo(link, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'power2.out' }, at);
      tl.from(nodes[i], { scale: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(2.4)' }, at + 0.3);
    });

    // 4. the squad is a web, not a star: perimeter joins them to each other
    if (perim) tl.fromTo(perim, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power2.inOut' }, '>-0.1');

    // labels settle
    tl.from(labels, { opacity: 0, y: 6, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '<');

    // 5. your role decrypts
    if (sub) tl.to(sub, { duration: 0.7, scrambleText: { text: 'Tester', chars: '▓▒░/<>', speed: 0.5 }, ease: 'none' }, '>-0.2');

    // 6. the picture stays alive
    if (ring) {
      tl.fromTo(ring, { scale: 0.7, opacity: 0.5 }, {
        scale: 1.7, opacity: 0, transformOrigin: 'center', duration: 2.2, ease: 'power1.out', repeat: -1, repeatDelay: 0.4,
      }, '>');
    }
    signals.forEach((dot, i) => {
      gsap.set(dot, { opacity: 0 });
      gsap.to(dot, {
        motionPath: { path: links[i], align: links[i], alignOrigin: [0.5, 0.5] },
        duration: 1.6,
        ease: 'power1.inOut',
        repeat: -1,
        repeatDelay: 1.4,
        delay: 2.4 + i * 0.5,
        onRepeat() { gsap.set(dot, { opacity: 1 }); },
        onStart() { gsap.set(dot, { opacity: 1 }); },
      });
    });
    if (orb && perim) {
      gsap.to(orb, {
        motionPath: { path: perim, align: perim, alignOrigin: [0.5, 0.5] },
        duration: 9, ease: 'none', repeat: -1, delay: 3,
      });
      gsap.fromTo(orb, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 3 });
    }
    // idle float on the role nodes, slightly out of phase
    nodes.forEach((n, i) => {
      if (n === centre) return;
      gsap.to(n, { y: '-=4', duration: 1.8 + i * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 + i * 0.3 });
    });
  }, { scope: ref });

  return (
    <svg ref={ref} className="qg-squadmap" viewBox="0 0 370 330" role="img" aria-label="Your squad: you, the tester, at the centre — connected to the PM, PO, developers, and users, who are all connected to each other">
      {/* the squad's own web */}
      <path className="qg-sm-perim" d={PERIMETER} />
      <circle className="qg-sm-orb" r="3" />

      {/* relationship links (curved) */}
      {around.map((n) => (
        <path key={`l-${n.id}`} className="qg-sm-linkpath" d={linkPath(n)} />
      ))}

      {/* signal dots that ride the links */}
      {around.map((n) => (
        <circle key={`s-${n.id}`} className="qg-sm-signal" r="3.2" />
      ))}

      {/* centre pulse ring */}
      <circle className="qg-sm-ring" cx={you.x} cy={you.y} r="30" fill="none" />

      {/* nodes */}
      {NODES.map((n, i) => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <g className={`qg-sm-nodepop ${n.center ? 'qg-sm-nodepop--you' : ''}`}>
            <circle r={n.center ? 30 : 24} fill={n.color} className={`qg-sm-node ${n.center ? 'is-you' : ''}`} />
            <text className="qg-sm-init" textAnchor="middle" dy={n.center ? 6 : 5}>{n.label.slice(0, 1)}</text>
            <g className="qg-sm-labels">
              <text className="qg-sm-label" textAnchor="middle" y={n.center ? 48 : 40}>{n.label}</text>
              <text className={`qg-sm-sub ${n.center ? 'qg-sm-sub--you' : ''}`} textAnchor="middle" y={n.center ? 62 : 53}>{n.sub}</text>
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}
