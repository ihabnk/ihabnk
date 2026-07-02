import { useMemo, useState } from 'react';
import type { Mission, ToolMeta } from '../types';

export const SEL_TOOL: ToolMeta = {
  id: 'sel',
  name: 'Selector Lab',
  tagline: 'Write locators that find the right element — and survive a redesign.',
  glyph: '#',
};

/**
 * Each mission renders real HTML into a sandbox and runs your selector with
 * querySelectorAll. The element(s) marked data-answer are the target — the
 * marker is stripped before your selector runs, so no cheating with it.
 * The final mission runs your selector against TWO versions of the page.
 */
interface SelMission extends Mission {
  html: string;
  /** Optional second DOM the same selector must also satisfy (the redesign). */
  html2?: string;
  /** How many elements must match (default 1). */
  expect?: number;
}

const CHECKOUT_V1 = `
<form class="checkout">
  <h3>Checkout</h3>
  <div class="field">
    <label>Email</label>
    <input type="email" class="input" />
    <p class="form-error">Enter a valid email.</p>
  </div>
  <div class="field">
    <label>Coupon</label>
    <input type="text" class="input" data-testid="coupon-input" data-answer2 />
    <p class="form-error">Coupon expired.</p>
  </div>
  <div class="field">
    <label>Card</label>
    <input type="text" class="input" />
    <p class="form-error">Card number is incomplete.</p>
  </div>
  <div class="actions">
    <button type="button" class="btn">Cancel</button>
    <button type="submit" class="btn btn-primary" id="pay-now" data-answer>Pay now</button>
  </div>
</form>`;

const CART = `
<table class="cart">
  <tr class="cart-row" data-sku="basic"><td>Basic plan</td><td>$9</td><td><button class="btn">Remove</button></td></tr>
  <tr class="cart-row" data-sku="deluxe"><td>Deluxe plan</td><td>$29</td><td><button class="btn" data-answer>Remove</button></td></tr>
  <tr class="cart-row" data-sku="team"><td>Team plan</td><td>$99</td><td><button class="btn">Remove</button></td></tr>
</table>`;

const SAVE_V1 = `
<div class="toolbar">
  <div class="toolbar-left">
    <button class="btn sm">Undo</button>
    <button class="btn sm">Redo</button>
  </div>
  <div class="toolbar-right">
    <button class="btn btn-ghost">Preview</button>
    <button class="btn btn-primary" data-testid="save-doc" data-answer>Save</button>
  </div>
</div>`;

/* The redesign: classes renamed, structure reshuffled, copy changed — only
 * the test hook survives. */
const SAVE_V2 = `
<header class="topbar">
  <nav class="topbar-nav">
    <button class="action action--quiet">Preview</button>
    <span class="divider"></span>
    <button class="action action--brand" data-testid="save-doc" data-answer>Save changes</button>
    <button class="action">Share</button>
  </nav>
</header>`;

export const SEL_MISSIONS: SelMission[] = [
  {
    id: 'byid',
    title: 'The obvious handle',
    brief: 'Target the “Pay now” button. It has an id — use it.',
    hint: 'ids are selected with a hash: #the-id',
    learn: 'An id is the strongest handle an element can offer: unique by contract, fast, and unambiguous. When one exists, take it.',
    html: CHECKOUT_V1,
  },
  {
    id: 'bytestid',
    title: 'The test hook',
    brief: 'Target the coupon input. No id this time — but the developers left you a data-testid. Use an attribute selector.',
    hint: 'Attribute selectors use square brackets: [data-testid="…"]',
    learn: 'data-testid is a contract between devs and tests: “this hook will not change.” It survives copy edits, restyles, and translations — the workhorse locator of real suites.',
    html: CHECKOUT_V1.replace(' data-answer ', ' ').replace('data-answer2', 'data-answer'),
  },
  {
    id: 'multi',
    title: 'All of them',
    brief: 'The form shows validation errors. Select ALL of them — your selector must match exactly 3 elements.',
    hint: 'They share a class. Class selectors start with a dot.',
    learn: 'Selectors return sets, not just single elements — asserting “exactly 3 errors appear” is one selector plus a count. Counts catch bugs single-element checks miss.',
    html: CHECKOUT_V1.replace(' data-answer>', '>').replace('data-answer2', '')
      .replaceAll('class="form-error"', 'class="form-error" data-answer'),
    expect: 3,
  },
  {
    id: 'scoped',
    title: 'The right row',
    brief: 'Three identical “Remove” buttons. Click the wrong one and the customer loses the wrong plan. Target ONLY the Deluxe row’s button.',
    hint: 'Scope through the row: the rows carry a data-sku attribute. Descend from the right one.',
    learn: 'When elements are identical, identity lives in their CONTEXT. Scoping through a stable ancestor ([data-sku="deluxe"] button) is how you pick one needle from a stack of needles.',
    html: CART,
  },
  {
    id: 'survivor',
    title: 'Survive the redesign',
    brief: 'Final exam: target the Save button — but your ONE selector must find it in today’s toolbar AND in next month’s redesigned header. Both versions are shown.',
    hint: 'Classes get renamed, structure moves, copy changes. What stayed identical across both versions?',
    learn: 'Only the data-testid survived the redesign — that’s the whole argument for test hooks in one exercise. A locator tied to structure or styling is a bug scheduled for the next redesign.',
    html: SAVE_V1,
    html2: SAVE_V2,
  },
];

interface DomCase { root: HTMLElement; targets: Element[] }

function buildCase(html: string): DomCase {
  const root = document.createElement('div');
  root.innerHTML = html;
  const targets = Array.from(root.querySelectorAll('[data-answer]'));
  targets.forEach((el) => el.removeAttribute('data-answer'));
  root.querySelectorAll('[data-answer2]').forEach((el) => el.removeAttribute('data-answer2'));
  return { root, targets };
}

const sameSet = (a: Element[], b: Element[]) =>
  a.length === b.length && a.every((el) => b.includes(el));

export default function SelectorLab({ missionId, onComplete }: { missionId: string; onComplete: (id: string) => void }) {
  const mission = SEL_MISSIONS.find((mm) => mm.id === missionId) ?? SEL_MISSIONS[0];
  const [selector, setSelector] = useState('');
  const [msg, setMsg] = useState<{ tone: 'yes' | 'no'; text: string } | null>(null);
  const [showHtml, setShowHtml] = useState(true);

  // Rebuild sandbox DOMs when the mission changes.
  const cases = useMemo<DomCase[]>(
    () => [buildCase(mission.html), ...(mission.html2 ? [buildCase(mission.html2)] : [])],
    [mission.id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const tryMatch = () => {
    const sel = selector.trim();
    if (!sel) { setMsg({ tone: 'no', text: 'Type a selector first.' }); return; }
    if (/data-answer/.test(sel)) { setMsg({ tone: 'no', text: 'Nice try — that marker is stripped before your selector runs.' }); return; }

    for (let i = 0; i < cases.length; i++) {
      let found: Element[];
      try { found = Array.from(cases[i].root.querySelectorAll(sel)); }
      catch { setMsg({ tone: 'no', text: `“${sel}” is not a valid CSS selector.` }); return; }

      const label = cases.length > 1 ? ` in version ${i + 1}` : '';
      if (found.length === 0) { setMsg({ tone: 'no', text: `Matches nothing${label}.` }); return; }
      if (!sameSet(found, cases[i].targets)) {
        const want = mission.expect ?? cases[i].targets.length;
        setMsg({
          tone: 'no',
          text: `Matches ${found.length} element${found.length === 1 ? '' : 's'}${label}, but not exactly the target${want > 1 ? 's' : ''}. ${found.length > want ? 'Too broad — tighten it.' : 'Wrong element — check what you hit.'}`,
        });
        return;
      }
    }
    setMsg({ tone: 'yes', text: cases.length > 1 ? 'Exact match in BOTH versions — that locator ships.' : 'Exact match.' });
    onComplete(missionId);
  };

  return (
    <div className="ql-tool">
      <div className="ql-sel-stages">
        {cases.map((c, i) => (
          <div key={i} className="ql-sel-stage">
            {cases.length > 1 && <span className="ql-io-label">Version {i + 1}{i === 1 ? ' — after the redesign' : ' — today'}</span>}
            <div className="ql-sel-preview" dangerouslySetInnerHTML={{ __html: c.root.innerHTML }} />
          </div>
        ))}
      </div>

      <button className="ql-sel-toggle" onClick={() => setShowHtml((v) => !v)}>
        {showHtml ? '▾ hide HTML' : '▸ show HTML'}
      </button>
      {showHtml && cases.map((c, i) => (
        <pre key={i} className="ql-console ql-sel-html">{c.root.innerHTML.trim()}</pre>
      ))}

      <div className="ql-sel-bar">
        <input
          className="ql-filter ql-sel-input" value={selector} spellCheck={false}
          onChange={(e) => { setSelector(e.target.value); setMsg(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') tryMatch(); }}
          placeholder='e.g. [data-testid="save-doc"]'
          aria-label="CSS selector"
        />
        <button className="qg-btn qg-btn-primary" onClick={tryMatch}>Match</button>
      </div>
      {msg && <p className={`ql-verdict ${msg.tone === 'yes' ? 'ql-verdict--yes' : 'ql-verdict--no'}`}>{msg.text}</p>}
    </div>
  );
}
