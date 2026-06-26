import { motion, useReducedMotion } from 'framer-motion';
import type { MentorState } from './types';

const SPARK = 'M0 -7 C1.6 -2 2 -2 7 0 C2 2 1.6 2 0 7 C-1.6 2 -2 2 -7 0 C-2 -2 -1.6 -2 0 -7 Z';

/**
 * Bit — the mentor. Flat, square 2D character in the site's amber grammar,
 * with a single expressive eye. Expression is driven by `state` (CSS keyed on
 * data-state in onboarding.css); Framer adds a subtle reaction on state change.
 */
export default function MentorAvatar({ state = 'idle', size = 96 }: { state?: MentorState; size?: number }) {
  const reduce = useReducedMotion();

  // a small physical reaction layered on top of the CSS expression
  const react =
    reduce ? {} :
    state === 'success' || state === 'welcome' ? { y: [0, -10, 0] } :
    state === 'celebrate' ? { y: [0, -12, 0, -5, 0] } :
    state === 'concern' ? { x: [0, -3, 3, -2, 0] } :
    { y: 0 };

  return (
    <motion.div
      className="qg-bot"
      data-state={state}
      style={{ width: size, height: size * 1.05 }}
      aria-hidden="true"
      animate={react}
      transition={{ duration: state === 'celebrate' ? 0.7 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 160 168" xmlns="http://www.w3.org/2000/svg">
        <rect className="qg-shadow" x="31" y="27" width="104" height="104" rx="22" />
        <g className="qg-float">
          <g className="qg-tilt">
            <g className="qg-orbit"><path className="qg-spark" d={SPARK} transform="translate(122 36)" /></g>
            <g className="qg-breathe">
              <rect className="qg-body" x="28" y="22" width="104" height="104" rx="22" />
              <g className="qg-eye">
                <ellipse className="qg-eyeball" cx="80" cy="66" rx="18" ry="19" />
                <g className="qg-pupil">
                  <circle className="qg-pupil-dot" cx="80" cy="68" r="8" />
                  <circle className="qg-glint" cx="84" cy="62" r="2.6" />
                </g>
              </g>
              <path className="qg-eye-happy" d="M61 70 q19 -17 38 0" />
              <path className="qg-mouth m-rest" d="M70 100 q10 7 20 0" />
              <path className="qg-mouth m-grin" d="M67 97 q13 12 26 0 q-13 7 -26 0 z" />
              <path className="qg-mouth m-frown" d="M70 103 q10 -7 20 0" />
            </g>
            <g className="qg-burst">
              <path className="qg-spark b1" d={SPARK} transform="translate(34 50) scale(0.8)" />
              <path className="qg-spark b2" d={SPARK} transform="translate(128 56)" />
              <path className="qg-spark b3" d={SPARK} transform="translate(122 104) scale(0.7)" />
            </g>
          </g>
        </g>
      </svg>
    </motion.div>
  );
}
