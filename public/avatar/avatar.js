/* ============================================================
   Assistant avatar widget — behavior
   No dependencies. Exposes a tiny global `avatar` with:
     avatar.mount('#sel' | element)   -> build + attach
     avatar.setState('idle'|'listening'|'thinking'|'talking'|'celebrating')
     avatar.destroy()                 -> clean up timers + DOM

   Generated SVG DOM (no innerHTML of untrusted data). Motion is CSS;
   JS only schedules random blinks and the talking mouth cycle.
   ============================================================ */
(function (global) {
  'use strict';

  var STATES = ['idle', 'listening', 'thinking', 'talking', 'celebrating'];

  // Mascot markup. Kept as a string so it can also live in avatar.svg.
  var SPARK = 'M0 -7 C1.6 -2 2 -2 7 0 C2 2 1.6 2 0 7 C-1.6 2 -2 2 -7 0 C-2 -2 -1.6 -2 0 -7 Z';
  var SVG = [
    '<svg class="av-svg" viewBox="0 0 160 168" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
    '  <defs>',
    '    <linearGradient id="avBody" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%" style="stop-color:var(--av-body-top)"/>',
    '      <stop offset="52%" style="stop-color:var(--av-body-mid)"/>',
    '      <stop offset="100%" style="stop-color:var(--av-body-bot)"/>',
    '    </linearGradient>',
    '    <radialGradient id="avGloss" cx="50%" cy="30%" r="62%">',
    '      <stop offset="0%" stop-color="#fff" stop-opacity="0.38"/>',
    '      <stop offset="60%" stop-color="#fff" stop-opacity="0.05"/>',
    '      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>',
    '    </radialGradient>',
    '  </defs>',
    '  <ellipse class="av-shadow" cx="80" cy="152" rx="40" ry="6"/>',
    '  <g class="av-float">',
    '    <g class="av-tilt">',
    '      <g class="av-think-orbit"><path class="av-spark" d="' + SPARK + '" transform="translate(118 40)"/></g>',
    '      <g class="av-breathe">',
    '        <rect class="av-body" x="28" y="26" width="104" height="100" rx="46" ry="48" fill="url(#avBody)"/>',
    '        <rect class="av-gloss" x="28" y="26" width="104" height="100" rx="46" ry="48" fill="url(#avGloss)"/>',
    '        <g class="av-eyes">',
    '          <ellipse class="av-eye" cx="62" cy="78" rx="6.5" ry="8.5"/>',
    '          <ellipse class="av-eye" cx="98" cy="78" rx="6.5" ry="8.5"/>',
    '          <circle class="av-glint" cx="64" cy="75" r="1.8"/>',
    '          <circle class="av-glint" cx="100" cy="75" r="1.8"/>',
    '        </g>',
    '        <g class="av-eyes-happy">',
    '          <path d="M54 80 q8 -9 16 0"/>',
    '          <path d="M90 80 q8 -9 16 0"/>',
    '        </g>',
    '        <path class="av-mouth m-rest" d="M68 95 q12 9 24 0"/>',
    '        <path class="av-mouth m-mid"  d="M72 94 q8 5 16 0 q-8 2 -16 0 z"/>',
    '        <path class="av-mouth m-open" d="M71 93 q9 11 18 0 q-9 6 -18 0 z"/>',
    '        <path class="av-mouth m-grin" d="M64 92 q16 15 32 0 q-16 8 -32 0 z"/>',
    '      </g>',
    '      <g class="av-burst">',
    '        <path class="av-spark b1" d="' + SPARK + '" transform="translate(36 56) scale(0.8)"/>',
    '        <path class="av-spark b2" d="' + SPARK + '" transform="translate(126 60)"/>',
    '        <path class="av-spark b3" d="' + SPARK + '" transform="translate(120 104) scale(0.7)"/>',
    '      </g>',
    '    </g>',
    '  </g>',
    '</svg>'
  ].join('\n');

  var el = null;          // root element
  var state = 'idle';
  var blinkTimer = null;
  var talkTimer = null;
  var mql = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function reduced() { return !!mql.matches; }

  function scheduleBlink() {
    clearTimeout(blinkTimer);
    if (!el || reduced()) return;
    var next = 2400 + Math.random() * 3600; // 2.4–6s
    blinkTimer = setTimeout(function () {
      if (!el) return;
      // don't blink mid-celebration (eyes are arcs)
      if (state !== 'celebrating') {
        el.classList.add('is-blink');
        setTimeout(function () { el && el.classList.remove('is-blink'); }, 120);
      }
      scheduleBlink();
    }, next);
  }

  function startTalking() {
    clearInterval(talkTimer);
    if (reduced()) { el.setAttribute('data-mouth', '0'); return; }
    var i = 0;
    var frames = ['0', '1', '2', '1']; // rest → mid → open → mid
    el.setAttribute('data-mouth', frames[0]);
    talkTimer = setInterval(function () {
      i = (i + 1) % frames.length;
      el.setAttribute('data-mouth', frames[i]);
    }, 150);
  }

  function stopTalking() {
    clearInterval(talkTimer);
    talkTimer = null;
    if (el) el.removeAttribute('data-mouth');
  }

  function mount(target) {
    var node = typeof target === 'string' ? document.querySelector(target) : target;
    if (!node) throw new Error('avatar.mount: target "' + target + '" not found');
    if (el) destroy();

    el = node;
    el.classList.add('av-root');
    el.setAttribute('role', 'img');
    el.innerHTML = SVG;

    setState('idle');
    scheduleBlink();

    // keep behavior correct if the motion preference changes live
    if (mql.addEventListener) mql.addEventListener('change', onMotionChange);
    return api;
  }

  function onMotionChange() {
    scheduleBlink();
    if (state === 'talking') startTalking();
  }

  function setState(next) {
    if (!el) return api;
    if (STATES.indexOf(next) === -1) throw new Error('avatar.setState: unknown state "' + next + '"');
    state = next;
    el.setAttribute('data-state', next);
    el.setAttribute('aria-label', 'Assistant avatar — ' + next);

    if (next === 'talking') startTalking(); else stopTalking();
    return api;
  }

  function destroy() {
    clearTimeout(blinkTimer);
    clearInterval(talkTimer);
    blinkTimer = talkTimer = null;
    if (mql.removeEventListener) mql.removeEventListener('change', onMotionChange);
    if (el) {
      el.classList.remove('av-root', 'is-blink');
      el.removeAttribute('data-state');
      el.removeAttribute('data-mouth');
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
      el.innerHTML = '';
    }
    el = null;
    state = 'idle';
  }

  var api = { mount: mount, setState: setState, destroy: destroy, states: STATES.slice() };

  // UMD-ish export
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.avatar = api;
})(typeof window !== 'undefined' ? window : this);
