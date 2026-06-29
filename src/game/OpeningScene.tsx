import { motion, useReducedMotion } from 'framer-motion';

/**
 * Day 1 cold-open: the hero arrives at the office, sits at an unfamiliar desk,
 * and stares at the laptop — no idea what to do yet. SVG + Framer; the hero
 * slides in, a "?" thought pops, the cursor blinks. Reduced-motion → still pose.
 */
export default function OpeningScene({ text, onContinue }: { text: string; onContinue: () => void }) {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce ? { initial: false as const } : { initial: { opacity: 0, x: -28 }, animate: { opacity: 1, x: 0 }, transition: { type: 'spring' as const, stiffness: 140, damping: 18, delay } };
  const pop = (delay: number) =>
    reduce ? { initial: false as const } : { initial: { opacity: 0, scale: 0.4 }, animate: { opacity: 1, scale: 1 }, transition: { type: 'spring' as const, stiffness: 320, damping: 16, delay } };

  return (
    <div className="qg-card qg-opening">
      <div className="qg-op-stage">
        <svg viewBox="0 0 460 300" className="qg-op-svg" role="img" aria-label="Your first morning: you sit at a new desk, staring at the laptop, unsure what to do.">
          {/* room */}
          <rect className="qg-op-wall" x="0" y="0" width="460" height="226" />
          <rect className="qg-op-floor" x="0" y="226" width="460" height="74" />

          {/* window with soft morning light */}
          <rect className="qg-op-window" x="40" y="46" width="118" height="94" rx="3" />
          <rect className="qg-op-glow" x="44" y="50" width="110" height="86" rx="2" />
          <line className="qg-op-pane" x1="99" y1="46" x2="99" y2="140" />
          <line className="qg-op-pane" x1="40" y1="93" x2="158" y2="93" />

          {/* clock */}
          <circle className="qg-op-clock" cx="408" cy="66" r="20" />
          <line className="qg-op-hand" x1="408" y1="66" x2="408" y2="53" />
          <line className="qg-op-hand qg-op-hand-min" x1="408" y1="66" x2="419" y2="66" />

          {/* faint background desks (open-plan office) */}
          <rect className="qg-op-deskbg" x="20" y="250" width="120" height="9" rx="3" />
          <rect className="qg-op-deskbg" x="330" y="250" width="120" height="9" rx="3" />

          {/* the hero — slides in and settles */}
          <motion.g {...enter(0.25)}>
            <g className="qg-op-bob">
              <rect className="qg-op-body" x="222" y="158" width="60" height="44" rx="12" />
              <rect className="qg-op-head" x="228" y="116" width="48" height="46" rx="14" />
              <ellipse className="qg-op-eye" cx="252" cy="137" rx="7.5" ry="9" />
              <circle className="qg-op-pupil" cx="248" cy="141" r="3.6" />
              <circle className="qg-op-glint" cx="254" cy="134" r="1.6" />
            </g>
          </motion.g>

          {/* desk over the hero's lower half */}
          <rect className="qg-op-desk" x="138" y="196" width="206" height="14" rx="4" />
          <line className="qg-op-leg" x1="156" y1="210" x2="156" y2="226" />
          <line className="qg-op-leg" x1="326" y1="210" x2="326" y2="226" />

          {/* laptop, screen facing the hero */}
          <rect className="qg-op-laptopbase" x="176" y="188" width="74" height="9" rx="2" />
          <rect className="qg-op-screen" x="182" y="158" width="60" height="32" rx="2" />
          <rect className="qg-op-cursor" x="190" y="171" width="15" height="3" rx="1" />
          <ellipse className="qg-op-screenlight" cx="230" cy="168" rx="46" ry="26" />

          {/* coffee */}
          <rect className="qg-op-coffee" x="298" y="183" width="15" height="13" rx="2" />
          <path className="qg-op-handle" d="M313 186 q6 1 0 8" />

          {/* "?" thought — pops after a beat, then floats */}
          <motion.g {...pop(1.1)}>
            <g className="qg-op-think">
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
