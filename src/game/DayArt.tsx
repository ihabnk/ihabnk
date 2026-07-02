import { useRef } from 'react';
import { gsap, useGSAP, reduceMotion } from './gsapSetup';

/**
 * Every day gets a picture: six week-themed line-art vignettes that draw
 * themselves on (DrawSVG), with one looping motion beat each (MotionPath
 * runners, popping props, a waving flag). One animation routine drives all
 * six scenes via shared classes:
 *
 *   .da-draw    — strokes that draw on, in stagger
 *   .da-pop     — props that pop in after the drawing
 *   .da-route   — an invisible path a .da-runner loops along
 *   .da-runner  — the element that rides the route
 *   .da-flag    — waves gently forever
 */

const CAPTIONS: Record<number, string> = {
  1: 'Week 1 · Observe — learn the room before you touch anything.',
  2: 'Week 2 · Question — the sharpest tool is asked out loud.',
  3: 'Week 3 · Break — find what fails before the users do.',
  4: 'Week 4 · Protect — make the proof run without you.',
  5: 'Week 5 · Collaborate — quality is a team sport.',
  6: 'Week 6 · Own — the whole picture is yours now.',
};

function Scene({ week }: { week: number }) {
  switch (week) {
    case 1: // Observe: a journey line, scanned by a travelling magnifier
      return (
        <>
          <path className="da-draw" d="M20 78 q60 -40 110 -10 t110 6 t110 -14 t60 4" strokeDasharray="1 9" />
          <path className="da-route" d="M30 74 q60 -38 108 -10 t110 6 t110 -14" fill="none" stroke="none" />
          <g className="da-runner">
            <circle className="da-glass" cx="0" cy="0" r="15" />
            <line className="da-accent" x1="10" y1="10" x2="21" y2="21" strokeWidth="4" />
          </g>
          <g className="da-pop"><circle className="da-dot" cx="60" cy="66" r="3" /><circle className="da-dot" cx="230" cy="70" r="3" /><circle className="da-dot" cx="392" cy="58" r="3" /></g>
        </>
      );
    case 2: // Question: a story card interrogated by popping question bubbles
      return (
        <>
          <rect className="da-draw" x="40" y="30" width="150" height="76" rx="6" />
          <line className="da-draw" x1="56" y1="50" x2="172" y2="50" />
          <line className="da-draw" x1="56" y1="66" x2="150" y2="66" />
          <line className="da-draw" x1="56" y1="82" x2="162" y2="82" />
          <path className="da-draw da-accent" d="M292 84 q-4 -12 8 -18 q14 -7 22 4 q8 11 -3 20 q-8 6 -8 15" strokeWidth="5" />
          <circle className="da-pop da-accentfill" cx="311" cy="118" r="4" />
          <g className="da-pop"><ellipse className="da-bubble" cx="240" cy="38" rx="16" ry="11" /><text className="da-q" x="240" y="43">?</text></g>
          <g className="da-pop"><ellipse className="da-bubble" cx="386" cy="52" rx="14" ry="10" /><text className="da-q" x="386" y="57">?</text></g>
        </>
      );
    case 3: // Break: a cracked block, a bug on the run
      return (
        <>
          <rect className="da-draw" x="60" y="34" width="110" height="72" rx="8" />
          <path className="da-draw da-accent" d="M115 34 l-9 20 l14 12 l-10 18 l7 22" strokeWidth="2.5" />
          <path className="da-route" d="M210 100 q60 -50 110 -20 t100 -6" fill="none" stroke="none" />
          <g className="da-runner">
            <ellipse className="da-bugbody" cx="0" cy="0" rx="7" ry="5" />
            <circle className="da-bugbody" cx="7" cy="0" r="2.8" />
            <path className="da-bugleg" d="M-4 -4 l-3 -4 M0 -5 l0 -5 M4 -4 l3 -4 M-4 4 l-3 4 M0 5 l0 5 M4 4 l3 4" />
          </g>
          <circle className="da-draw da-accent" cx="392" cy="66" r="24" strokeDasharray="4 6" />
        </>
      );
    case 4: // Protect: a pipeline feeding a shield; the check earns itself
      return (
        <>
          <path className="da-draw" d="M228 26 l42 12 v34 q0 30 -42 44 q-42 -14 -42 -44 v-34 z" />
          <path className="da-draw da-accent" d="M210 72 l14 13 l24 -26" strokeWidth="4" />
          <path className="da-route da-pipe" d="M18 72 h150" strokeDasharray="2 8" />
          <circle className="da-runner da-accentfill" cx="0" cy="0" r="4" />
          <path className="da-draw da-pipe2" d="M296 72 h146" strokeDasharray="2 8" />
          <g className="da-pop"><circle className="da-dot" cx="330" cy="72" r="3.5" /><circle className="da-dot" cx="366" cy="72" r="3.5" /><circle className="da-dot" cx="402" cy="72" r="3.5" /></g>
        </>
      );
    case 5: // Collaborate: three heads, wired together, a pulse riding the wire
      return (
        <>
          <path className="da-draw" d="M96 96 q64 -64 134 -34 q70 30 134 -18" fill="none" />
          <path className="da-route" d="M96 96 q64 -64 134 -34 q70 30 134 -18" fill="none" stroke="none" />
          <circle className="da-runner da-accentfill" cx="0" cy="0" r="4.5" />
          <g className="da-pop"><circle className="da-head" cx="96" cy="96" r="17" /><circle className="da-facedot" cx="99" cy="93" r="3" /></g>
          <g className="da-pop"><circle className="da-head da-headaccent" cx="230" cy="62" r="19" /><circle className="da-facedot" cx="234" cy="58" r="3.4" /></g>
          <g className="da-pop"><circle className="da-head" cx="364" cy="44" r="17" /><circle className="da-facedot" cx="368" cy="41" r="3" /></g>
          <g className="da-pop"><ellipse className="da-bubble" cx="300" cy="106" rx="17" ry="11" /><text className="da-q" x="300" y="111">!</text></g>
        </>
      );
    default: // Own: the flag planted at the top of the climb, a star in orbit
      return (
        <>
          <path className="da-draw" d="M16 122 q120 -8 200 -48 q60 -30 120 -38 l88 -8" fill="none" />
          <line className="da-draw" x1="336" y1="36" x2="336" y2="112" />
          <path className="da-flag da-accentflag" d="M336 38 l54 10 l-54 12 z" />
          <path className="da-route" d="M336 30 m-42 0 a42 26 0 1 0 84 0 a42 26 0 1 0 -84 0" fill="none" stroke="none" />
          <path className="da-runner da-accentfill" d="M0 -6 l1.8 3.8 4.2 .6 -3 3 .7 4.2 -3.7 -2 -3.7 2 .7 -4.2 -3 -3 4.2 -.6 z" />
          <g className="da-pop"><circle className="da-dot" cx="120" cy="104" r="3" /><circle className="da-dot" cx="220" cy="72" r="3" /></g>
        </>
      );
  }
}

export default function DayArt({ week }: { week: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    const root = ref.current;
    if (!root) return;
    const draws = root.querySelectorAll('.da-draw');
    const pops = root.querySelectorAll('.da-pop');
    const route = root.querySelector('.da-route');
    const runner = root.querySelector('.da-runner');
    const flag = root.querySelector('.da-flag');

    if (reduceMotion()) {
      gsap.set([...draws, ...pops], { opacity: 1 });
      if (runner && route) gsap.set(runner, { motionPath: { path: route as SVGPathElement, start: 0.5, end: 0.5, align: route as SVGPathElement, alignOrigin: [0.5, 0.5] } });
      return;
    }

    const tl = gsap.timeline();
    if (draws.length) tl.fromTo(draws, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut', stagger: 0.12 });
    if (pops.length) tl.from(pops, { scale: 0, transformOrigin: 'center', duration: 0.45, ease: 'back.out(2.2)', stagger: 0.1 }, '-=0.3');
    if (runner && route) {
      tl.to(runner, {
        motionPath: { path: route as SVGPathElement, align: route as SVGPathElement, alignOrigin: [0.5, 0.5], autoRotate: week === 3 },
        duration: 3.4,
        ease: 'power1.inOut',
        repeat: -1,
        repeatDelay: 1.2,
        yoyo: week !== 3,
      }, '-=0.2');
    }
    if (flag) {
      gsap.to(flag, { skewY: 4, scaleX: 0.94, transformOrigin: 'left center', duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
  }, { dependencies: [week], scope: ref });

  return (
    <figure className="qg-dayart" aria-hidden="false">
      <svg ref={ref} viewBox="0 0 460 140" role="img" aria-label={CAPTIONS[week] ?? ''}>
        <Scene week={week} />
      </svg>
      <figcaption className="qg-dayart-cap">{CAPTIONS[week]}</figcaption>
    </figure>
  );
}
