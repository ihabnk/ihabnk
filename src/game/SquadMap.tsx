import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from './gsapSetup';

/**
 * The "whole picture", visualized as the narration says it: not a hub with
 * spokes — a THREAD. One figure-eight weave passes through all four roles
 * and crosses at the centre, and You (the tester) ride it continuously:
 * product → priorities → build → users, through the middle every lap.
 *
 * GSAP: the weave draws itself (DrawSVG), stations pop as the thread
 * reaches them, "quality lives here" decrypts at the crossing point
 * (ScrambleText), then You travel the weave forever (MotionPath).
 */
interface Station { id: string; label: string; sub: string; color: string; x: number; y: number; }

const CX = 185, CY = 165;
const STATIONS: Station[] = [
  { id: 'pm',    label: 'Maya',  sub: 'PM · what & why',    color: '#9a6010', x: 75,  y: 70 },
  { id: 'po',    label: 'Priya', sub: 'PO · priorities',    color: '#c0521a', x: 295, y: 70 },
  { id: 'dev',   label: 'Idris', sub: 'Devs · build & fix', color: '#6b5040', x: 75,  y: 260 },
  { id: 'users', label: 'Users', sub: 'who you protect',    color: '#4a7fa8', x: 295, y: 260 },
];

/* One closed figure-eight: centre → Maya → Priya → centre → Idris → Users →
 * centre. The crossing point IS the middle of the squad. */
const WEAVE = `M ${CX} ${CY}
  Q 60 130 75 70 Q 185 18 295 70 Q 310 130 ${CX} ${CY}
  Q 60 200 75 260 Q 185 312 295 260 Q 310 200 ${CX} ${CY} Z`;

/* Where along the weave (0..1) the thread passes each station, for pops. */
const STATION_AT = [0.125, 0.375, 0.625, 0.875];

export default function SquadMap() {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const weave = root.querySelector<SVGPathElement>('.qg-sm-weave');
    const stations = root.querySelectorAll('.qg-sm-station');
    const labels = root.querySelectorAll('.qg-sm-labels');
    const cross = root.querySelector('.qg-sm-crosslabel');
    const rider = root.querySelector('.qg-sm-rider');
    const glowTrail = root.querySelector<SVGPathElement>('.qg-sm-weave-hot');

    if (reduceMotion()) {
      gsap.set([weave, ...stations, ...labels, cross].filter(Boolean) as Element[], { opacity: 1 });
      if (glowTrail) gsap.set(glowTrail, { opacity: 0 });
      if (rider && weave) {
        gsap.set(rider, { motionPath: { path: weave, start: 0.125, end: 0.125, align: weave, alignOrigin: [0.5, 0.5] } });
      }
      return;
    }

    const DRAW = 2.0;
    const tl = gsap.timeline();

    // the thread draws itself through the whole squad…
    tl.fromTo(weave, { drawSVG: '0%' }, { drawSVG: '100%', duration: DRAW, ease: 'power1.inOut' }, 0);
    // …and each role pops the moment the thread reaches them
    STATION_AT.forEach((t, i) => {
      tl.from(stations[i], { scale: 0, transformOrigin: 'center', duration: 0.55, ease: 'back.out(2.4)' }, t * DRAW);
    });
    tl.from(labels, { opacity: 0, y: 6, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, DRAW - 0.3);

    // the crossing point gets named
    if (cross) {
      tl.set(cross, { opacity: 1 }, DRAW + 0.1);
      tl.to(cross, { duration: 0.9, scrambleText: { text: 'quality lives here', chars: '▓▒░<>/', speed: 0.5 }, ease: 'none' }, DRAW + 0.1);
    }

    // You arrive at the crossing with a squash — then ride the weave forever
    if (rider && weave) {
      tl.from(rider, { scale: 0, transformOrigin: 'center', duration: 0.9, ease: 'bitBounce' }, DRAW + 0.4);
      tl.to(rider, {
        motionPath: { path: weave, align: weave, alignOrigin: [0.5, 0.5] },
        duration: 12,
        ease: 'none',
        repeat: -1,
      }, DRAW + 1.4);
      // a warm comet-trail chases the rider around the weave
      if (glowTrail) {
        gsap.set(glowTrail, { opacity: 1 });
        tl.fromTo(glowTrail,
          { drawSVG: '0% 10%' },
          { drawSVG: '90% 100%', duration: 12, ease: 'none', repeat: -1 },
          DRAW + 1.4);
      }
      // stations greet You as you pass: a soft pulse, phase-locked to the lap
      stations.forEach((s, i) => {
        gsap.to(s, {
          scale: 1.08, transformOrigin: 'center', duration: 0.4, yoyo: true, repeat: -1,
          repeatDelay: 12 - 0.8, delay: DRAW + 1.4 + STATION_AT[i] * 12, ease: 'sine.inOut',
        });
      });
    }
  }, { scope: ref });

  return (
    <svg ref={ref} className="qg-squadmap" viewBox="0 0 370 330" role="img" aria-label="Your squad as a woven thread: one loop passes through the PM, the PO, the developers, and the users, crossing in the middle — where you, the tester, travel it continuously.">
      {/* the weave (faint guide + hot trail chasing the rider) */}
      <path className="qg-sm-weave" d={WEAVE} />
      <path className="qg-sm-weave-hot" d={WEAVE} />

      {/* the crossing point */}
      <text className="qg-sm-crosslabel" x={CX} y={CY + 30} textAnchor="middle">·</text>

      {/* role stations */}
      {STATIONS.map((s) => (
        <g key={s.id} transform={`translate(${s.x} ${s.y})`}>
          <g className="qg-sm-station">
            <circle r="24" fill={s.color} className="qg-sm-node" />
            <text className="qg-sm-init" textAnchor="middle" dy="5">{s.label.slice(0, 1)}</text>
            <g className="qg-sm-labels">
              <text className="qg-sm-label" textAnchor="middle" y="40">{s.label}</text>
              <text className="qg-sm-sub" textAnchor="middle" y="53">{s.sub}</text>
            </g>
          </g>
        </g>
      ))}

      {/* You — the tester, riding the thread */}
      <g className="qg-sm-rider" aria-hidden="true">
        <circle className="qg-sm-rider-halo" r="17" />
        <rect x="-11" y="-11" width="22" height="22" rx="7" className="qg-sm-rider-body" />
        <circle className="qg-sm-rider-eye" cx="2.5" cy="-2.5" r="4.6" />
        <circle className="qg-sm-rider-pupil" cx="3.2" cy="-2" r="2.1" />
        <path className="qg-sm-rider-mouth" d="M-4.5 4.5 Q0 8.5 4.5 4.5" />
        <text className="qg-sm-rider-tag" textAnchor="middle" y="26">you</text>
      </g>
    </svg>
  );
}
