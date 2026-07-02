/**
 * Site-wide GSAP + ScrollTrigger animation orchestration.
 *
 *   Hooks driven by data-anim attributes on markup:
 *     hero-stagger    — stagger children on page load (e.g. hero block)
 *     section-head    — stagger children when section header scrolls in
 *     card-grid       — stagger grid children as the grid enters viewport
 *     row-list        — stagger row children (left-to-right reveal)
 *     featured        — single-element rise reveal
 *     prose           — wrapper around editorial body; h2 / blockquote
 *                       reveal individually, paragraphs scrub on scroll
 *
 *   On `astro:page-load` every ScrollTrigger is killed and animations
 *   are rebuilt against the new DOM. Reduced-motion preference disables
 *   everything via gsap.matchMedia.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin, MorphSVGPlugin);

// Live SplitText instances — reverted on teardown so view transitions
// always rebuild from clean markup.
let splits: SplitText[] = [];
// Bound magnetic-button listeners, removed on teardown.
let magnetCleanups: Array<() => void> = [];

// Mobile reliability:
//  - ignoreMobileResize prevents ScrollTrigger from re-calculating every
//    time the mobile address bar shows/hides (the viewport-height jump
//    causes a visible flicker otherwise).
//
// NOTE: we deliberately do NOT call ScrollTrigger.normalizeScroll(). It makes
// GSAP hijack touch events and drive the scroll position itself, which breaks
// scrolling entirely inside in-app webviews (Instagram/Facebook/LinkedIn/X
// browsers, embedded WebViews) — the gesture gets swallowed and the page
// won't move. Native momentum scrolling is fine; the smoothing it bought
// wasn't worth a dead page.
ScrollTrigger.config({ ignoreMobileResize: true });

// Tell the rest of the stylesheet that GSAP owns motion now —
// the CSS .reveal / .reveal-soft transitions are gated behind
// :not(.gsap-ready) so they don't compete.
document.documentElement.classList.add('gsap-ready');

// `play none none none` = play once when the trigger enters, then stay.
// Using `reverse` instead causes content to fade back out on scroll-up,
// which reads as ghosting / disappearing content when re-reading.
const SCROLL_OPTS = {
  start: 'top 85%',
  toggleActions: 'play none none none',
} as const;

const EASE = 'power3.out';

function setup(): void {
  const mm = gsap.matchMedia();

  // Use gsap.matchMedia with two breakpoints so the same animation runs at
  // mobile-scaled values on small screens (gentler distances, less heavy on
  // a small viewport) and full size on tablet+. Both branches gate on
  // prefers-reduced-motion: no-preference automatically by being inside the
  // outer mm.add condition object.
  mm.add(
    {
      isDesktop: '(min-width: 700px) and (prefers-reduced-motion: no-preference)',
      isMobile:  '(max-width: 699px) and (prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean; isDesktop: boolean };
      const k = isMobile ? 0.6 : 1; // distance multiplier

      // 1. HERO — staggered entrance on page load
      document.querySelectorAll<HTMLElement>('[data-anim="hero-stagger"]').forEach((hero) => {
        const kids = Array.from(hero.children);
        if (!kids.length) return;
        gsap.from(kids, {
          y: 28 * k,
          opacity: 0,
          filter: isMobile ? 'blur(2px)' : 'blur(4px)',
          duration: isMobile ? 0.7 : 0.85,
          ease: EASE,
          stagger: isMobile ? 0.07 : 0.09,
          clearProps: 'filter',
        });
      });

      // 2. SECTION HEADS — // label + h2 + p stagger
      //    (children carrying data-split are owned by the SplitText handler)
      document.querySelectorAll<HTMLElement>('[data-anim="section-head"]').forEach((head) => {
        const kids = Array.from(head.children).filter((c) => !c.hasAttribute('data-split'));
        if (!kids.length) return;
        gsap.from(kids, {
          scrollTrigger: { trigger: head, ...SCROLL_OPTS },
          y: 22 * k,
          opacity: 0,
          duration: 0.65,
          ease: EASE,
          stagger: 0.08,
        });
      });

      // 3. CARD GRIDS — stagger children rising into place
      document.querySelectorAll<HTMLElement>('[data-anim="card-grid"]').forEach((grid) => {
        const cards = Array.from(grid.children);
        if (!cards.length) return;
        gsap.from(cards, {
          scrollTrigger: { trigger: grid, ...SCROLL_OPTS },
          y: 40 * k,
          opacity: 0,
          scale: 0.97,
          duration: 0.7,
          ease: EASE,
          stagger: { each: isMobile ? 0.07 : 0.09, from: 'start' },
        });
      });

      // 4. ROW LISTS — left-to-right reveal with stagger
      document.querySelectorAll<HTMLElement>('[data-anim="row-list"]').forEach((list) => {
        const rows = Array.from(list.children);
        if (!rows.length) return;
        gsap.from(rows, {
          scrollTrigger: { trigger: list, start: 'top 88%', toggleActions: SCROLL_OPTS.toggleActions },
          x: -30 * k,
          opacity: 0,
          duration: 0.6,
          ease: EASE,
          stagger: 0.07,
        });
      });

      // 5. FEATURED — single big card lifts in
      document.querySelectorAll<HTMLElement>('[data-anim="featured"]').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, ...SCROLL_OPTS },
          y: 56 * k,
          opacity: 0,
          scale: 0.985,
          duration: 0.85,
          ease: EASE,
        });
      });

      // 6. PROSE — h2 / blockquote / figure individually staggered;
      //    paragraphs scrub up gently as you scroll past.
      document.querySelectorAll<HTMLElement>('[data-anim="prose"]').forEach((prose) => {
        prose.querySelectorAll<HTMLElement>('h2').forEach((h) => {
          gsap.from(h, {
            scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: SCROLL_OPTS.toggleActions },
            y: 30 * k,
            opacity: 0,
            duration: 0.6,
            ease: EASE,
          });
        });

        prose.querySelectorAll<HTMLElement>('h3, h4').forEach((h) => {
          gsap.from(h, {
            scrollTrigger: { trigger: h, start: 'top 90%', toggleActions: SCROLL_OPTS.toggleActions },
            y: 18 * k,
            opacity: 0,
            duration: 0.5,
            ease: EASE,
          });
        });

        prose.querySelectorAll<HTMLElement>('blockquote').forEach((q) => {
          gsap.from(q, {
            scrollTrigger: { trigger: q, start: 'top 88%', toggleActions: SCROLL_OPTS.toggleActions },
            x: -28 * k,
            rotation: isMobile ? -0.6 : -1.4,
            opacity: 0,
            duration: 0.7,
            ease: EASE,
          });
        });

        prose.querySelectorAll<HTMLElement>('figure, img, pre, hr').forEach((el) => {
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 95%',
              end: 'bottom 20%',
              scrub: 0.4,
            },
            y: 40 * k,
            opacity: 0.2,
            ease: 'none',
          });
        });

        // Paragraphs: fade-up reveal, individually triggered so reading flow
        // isn't interrupted.
        prose.querySelectorAll<HTMLElement>('p, ul, ol').forEach((p) => {
          gsap.from(p, {
            scrollTrigger: { trigger: p, start: 'top 92%', toggleActions: SCROLL_OPTS.toggleActions },
            y: 14 * k,
            opacity: 0.4,
            duration: 0.45,
            ease: EASE,
          });
        });
      });

      // 7. HORIZONTAL STRIP — pinned section, track scrubs sideways.
      //    On mobile the strip is a native swipe row (CSS), no pin.
      if (!isMobile) {
        document.querySelectorAll<HTMLElement>('[data-anim="hscroll"]').forEach((sec) => {
          const track = sec.querySelector<HTMLElement>('[data-hscroll-track]');
          if (!track) return;
          const amount = () => Math.max(0, track.scrollWidth - sec.clientWidth);
          const scrub = gsap.to(track, {
            x: () => -amount(),
            ease: 'none',
            scrollTrigger: {
              trigger: sec,
              start: 'top top',
              end: () => '+=' + amount(),
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          // Panels pop up as they ride into view inside the moving track.
          track.querySelectorAll<HTMLElement>('[data-hscroll-panel]').forEach((panel) => {
            gsap.from(panel, {
              y: 44,
              opacity: 0,
              rotation: 1.2,
              duration: 0.55,
              ease: EASE,
              scrollTrigger: {
                trigger: panel,
                containerAnimation: scrub,
                start: 'left 88%',
                toggleActions: SCROLL_OPTS.toggleActions,
              },
            });
          });
        });
      }

      // 8. SVG DRAW-ON — strokes draw themselves when scrolled into view.
      document.querySelectorAll<SVGElement>('svg[data-anim="draw"]').forEach((svg) => {
        const strokes = svg.querySelectorAll('path, line, polyline, circle');
        if (!strokes.length) return;
        gsap.from(strokes, {
          scrollTrigger: { trigger: svg, ...SCROLL_OPTS },
          drawSVG: '0%',
          duration: 1.1,
          ease: 'power2.inOut',
          stagger: 0.15,
          delay: 0.25,
        });
      });

      // 8b. PATH FOLLOWERS — any [data-follow-path] element travels along
      //     the first <path> in its own SVG (MotionPath). Think: the bug
      //     that scurries across the hero squiggle every few seconds.
      document.querySelectorAll<SVGGraphicsElement>('svg [data-follow-path]').forEach((runner) => {
        const svg = runner.closest('svg');
        const path = svg?.querySelector('path');
        if (!path) return;
        gsap.set(runner, { opacity: 0 });
        gsap.to(runner, {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true },
          duration: 2.6,
          ease: 'power1.inOut',
          repeat: -1,
          repeatDelay: 5,
          delay: 2.5,
          onRepeat: function () { gsap.set(runner, { opacity: 1 }); },
          onStart: function () { gsap.set(runner, { opacity: 1 }); },
        });
      });

      // 9. TEXT SPLITS — run after fonts settle so line breaks are final.
      document.fonts.ready.then(() => {
        // Hero titles: character tumble on load.
        document.querySelectorAll<HTMLElement>('[data-anim="split-chars"]').forEach((el) => {
          const split = SplitText.create(el, { type: 'lines,chars', mask: 'lines' });
          splits.push(split);
          gsap.from(split.chars, {
            yPercent: 115,
            rotation: 5,
            duration: 0.65,
            ease: 'back.out(1.4)',
            stagger: 0.016,
            delay: 0.1,
          });
        });

        // Standalone headings: word-mask rise when scrolled to.
        document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          const split = SplitText.create(el, { type: 'lines,words', mask: 'lines' });
          splits.push(split);
          gsap.from(split.words, {
            scrollTrigger: { trigger: el, ...SCROLL_OPTS },
            yPercent: 110,
            duration: 0.6,
            ease: EASE,
            stagger: 0.045,
          });
        });
      });

      // 10. MAGNETIC BUTTONS — primary CTAs lean toward a fine pointer.
      if (!isMobile && matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll<HTMLElement>('.btn-primary, .ghost-btn, [data-magnetic]').forEach((el) => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
          };
          el.addEventListener('mousemove', move);
          el.addEventListener('mouseleave', leave);
          magnetCleanups.push(() => {
            el.removeEventListener('mousemove', move);
            el.removeEventListener('mouseleave', leave);
            gsap.set(el, { clearProps: 'x,y' });
          });
        });
      }

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        magnetCleanups.forEach((fn) => fn());
        magnetCleanups = [];
      };
    },
  );
}

function teardown(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  splits.forEach((s) => s.revert());
  splits = [];
  magnetCleanups.forEach((fn) => fn());
  magnetCleanups = [];
  gsap.globalTimeline.clear();
}

// Single bootstrap path so setup() runs exactly once per page.
// Astro fires astro:page-load on both initial render AND subsequent
// view-transition navigations, so this covers both cases without
// double-queueing tweens on the same targets.
function bootstrap() {
  teardown(); // safe no-op on first call; kills stale tweens after a swap
  setup();
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

document.addEventListener('astro:page-load', bootstrap);

// after-swap fires before page-load — preemptively kill old tweens so they
// don't briefly target nodes that no longer exist in the new DOM.
document.addEventListener('astro:after-swap', () => {
  teardown();
  document.documentElement.classList.add('gsap-ready');
});

// bfcache restore.
window.addEventListener('pageshow', (ev) => {
  if (!ev.persisted) return;
  bootstrap();
});

// Orientation change on mobile dramatically resizes the viewport and can
// leave ScrollTrigger with stale positions. Refresh after a short settle
// delay so the new layout is locked in first.
window.addEventListener('orientationchange', () => {
  setTimeout(() => ScrollTrigger.refresh(), 250);
});

// Fallback for the unlikely case where the page-load event already fired
// before this module evaluated.
if (document.readyState === 'complete') {
  bootstrap();
}
