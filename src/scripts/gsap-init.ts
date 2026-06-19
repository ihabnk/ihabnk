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

gsap.registerPlugin(ScrollTrigger);

// Mobile reliability:
//  - ignoreMobileResize prevents ScrollTrigger from re-calculating every
//    time the mobile address bar shows/hides (the viewport-height jump
//    causes a visible flicker otherwise).
//  - normalizeScroll smooths iOS Safari's elastic / momentum scroll so
//    ScrollTrigger fires at the right times instead of stuttering when
//    rubber-banding past the top or bottom of the page.
ScrollTrigger.config({ ignoreMobileResize: true });
ScrollTrigger.normalizeScroll(true);

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
      document.querySelectorAll<HTMLElement>('[data-anim="section-head"]').forEach((head) => {
        const kids = Array.from(head.children);
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

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
  );
}

function teardown(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
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
