import { motion, useReducedMotion } from 'framer-motion';

/**
 * Day 1 cold-open — the hero arrives, sits, and stares at the laptop.
 * Framer choreographs the entrance; CSS loops carry the ambient life
 * (window light + drifting dust, rising coffee steam, a colleague walking
 * past, a swaying plant, breathing, blinking, a floating "?"). Reduced-motion
 * settles everything to a still pose.
 */
export default function OpeningScene({ text, onContinue }: { text: string; onContinue: () => void }) {
  const reduce = useReducedMotion();
  const slide = (delay: number) => reduce
    ? { initial: false as const }
    : { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, transition: { type: 'spring' as const, stiffness: 140, damping: 18, delay } };
  const rise = (delay: number) => reduce
    ? { initial: false as const }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay } };
  const pop = (delay: number) => reduce
    ? { initial: false as const }
    : { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { type: 'spring' as const, stiffness: 300, damping: 16, delay } };

  return (
    <div className="qg-card qg-opening">
      <div className="qg-op-stage">
        <svg viewBox="0 0 460 300" className="qg-op-svg" role="img" aria-label="Your first morning: you sit at a new desk, staring at the laptop, unsure where to start.">
          {/* room */}
          <rect className="qg-op-wall" x="0" y="0" width="460" height="226" />
          <rect className="qg-op-floor" x="0" y="226" width="460" height="74" />
          <rect className="qg-op-window" x="40" y="46" width="118" height="94" rx="3" />
          <rect className="qg-op-windowlit" x="44" y="50" width="110" height="86" rx="2" />
          <line className="qg-op-pane" x1="99" y1="46" x2="99" y2="140" />
          <line className="qg-op-pane" x1="40" y1="93" x2="158" y2="93" />
          <circle className="qg-op-clock" cx="408" cy="62" r="20" />
          <line className="qg-op-hand" x1="408" y1="62" x2="408" y2="49" />
          <line className="qg-op-hand" x1="408" y1="62" x2="419" y2="62" />
          <rect className="qg-op-deskbg" x="18" y="252" width="110" height="9" rx="3" />
          <g className="qg-op-plant">
            <path className="qg-op-pot" d="M424 240 h26 l-3 22 h-20 z" />
            <path className="qg-op-leaf" d="M437 240 q-16 -20 -2 -34 q10 16 2 34" />
            <path className="qg-op-leaf" d="M437 240 q16 -18 4 -34 q-10 16 -4 34" />
          </g>

          {/* light shaft + drifting dust */}
          <polygon className="qg-op-beam" points="68,60 150,60 250,226 40,226" />
          <g className="qg-op-motes">
            <circle className="qg-op-mote" cx="96" cy="150" r="2.4" />
            <circle className="qg-op-mote" cx="128" cy="186" r="2" />
            <circle className="qg-op-mote" cx="150" cy="120" r="2.6" />
            <circle className="qg-op-mote" cx="82" cy="200" r="1.8" />
            <circle className="qg-op-mote" cx="190" cy="206" r="2.2" />
          </g>

          {/* a colleague walks past in the background */}
          <g className="qg-op-passer">
            <circle cx="36" cy="186" r="9" />
            <rect x="28" y="195" width="17" height="30" rx="7" />
          </g>

          {/* hero (behind desk + laptop) */}
          <motion.g {...slide(0.3)}>
            <g className="qg-op-breathe">
              <rect className="qg-op-body" x="222" y="158" width="60" height="44" rx="12" />
              <rect className="qg-op-head" x="228" y="116" width="48" height="46" rx="14" />
              <ellipse className="qg-op-eye" cx="252" cy="137" rx="7.5" ry="9" />
              <circle className="qg-op-pupil" cx="249" cy="141" r="3.6" />
              <circle className="qg-op-glint" cx="254" cy="134" r="1.6" />
            </g>
          </motion.g>

          {/* desk + laptop (settle in just after the hero) */}
          <motion.g {...rise(0.5)}>
            <rect className="qg-op-desk" x="138" y="196" width="206" height="14" rx="4" />
            <line className="qg-op-leg" x1="156" y1="210" x2="156" y2="226" />
            <line className="qg-op-leg" x1="326" y1="210" x2="326" y2="226" />
            <rect className="qg-op-laptopbase" x="176" y="188" width="74" height="9" rx="2" />
            <rect className="qg-op-screen" x="182" y="156" width="60" height="34" rx="2" />
            <rect className="qg-op-line" x="190" y="164" width="38" height="2.5" rx="1" />
            <rect className="qg-op-line" x="190" y="170" width="26" height="2.5" rx="1" />
            <rect className="qg-op-cursor" x="190" y="176" width="14" height="3" rx="1" />
            <ellipse className="qg-op-screenlight" cx="232" cy="166" rx="46" ry="26" />
            <rect className="qg-op-coffee" x="298" y="183" width="15" height="13" rx="2" />
            <path className="qg-op-handle" d="M313 186 q6 1 0 8" />
            <g className="qg-op-steams">
              <path className="qg-op-steam" d="M303 182 q-3 -5 0 -10" />
              <path className="qg-op-steam" d="M309 182 q3 -5 0 -10" />
            </g>
          </motion.g>

          {/* "?" thought — pops, then floats */}
          <motion.g {...pop(1.0)}>
            <g className="qg-op-thinkfloat">
              <ellipse className="qg-op-bubble" cx="305" cy="92" rx="22" ry="16" />
              <circle className="qg-op-bubble" cx="285" cy="112" r="5" />
              <circle className="qg-op-bubble" cx="276" cy="122" r="3" />
              <text className="qg-op-q" x="305" y="99" textAnchor="middle">?</text>
            </g>
          </motion.g>
        </svg>
      </div>

      <p className="qg-narration-text">{text}</p>
      <button className="qg-btn qg-btn-primary" onClick={onContinue}>Take a breath →</button>
    </div>
  );
}
