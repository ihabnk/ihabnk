import { useState } from 'react';
import type { Mission, ToolMeta } from '../types';

export const LOG_TOOL: ToolMeta = {
  id: 'logs',
  name: 'Log Viewer',
  tagline: 'Forty lines of noise, one story. Filter, follow, find the root cause.',
  glyph: '≡',
};

interface LogLine { id: number; t: string; level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'; msg: string }

/** The checkout incident of 09:14, plus ordinary noise. */
export const LINES: LogLine[] = [
  { id: 1, t: '09:11:52', level: 'INFO', msg: 'checkout started req=a1f3 user=101 cart=3 items' },
  { id: 2, t: '09:11:53', level: 'DEBUG', msg: 'price calc req=a1f3 subtotal=42.00 tax=8.40' },
  { id: 3, t: '09:11:54', level: 'INFO', msg: 'payment authorised req=a1f3 amount=50.40' },
  { id: 4, t: '09:11:54', level: 'INFO', msg: 'checkout complete req=a1f3 user=101' },
  { id: 5, t: '09:12:10', level: 'INFO', msg: 'session refresh user=118' },
  { id: 6, t: '09:12:31', level: 'DEBUG', msg: 'cache hit key=catalog:v42' },
  { id: 7, t: '09:12:48', level: 'INFO', msg: 'checkout started req=b2e7 user=214 cart=1 item' },
  { id: 8, t: '09:12:49', level: 'DEBUG', msg: 'price calc req=b2e7 subtotal=9.99 tax=2.00' },
  { id: 9, t: '09:12:50', level: 'INFO', msg: 'payment authorised req=b2e7 amount=11.99' },
  { id: 10, t: '09:12:51', level: 'INFO', msg: 'checkout complete req=b2e7 user=214' },
  { id: 11, t: '09:13:22', level: 'INFO', msg: 'search query user=330 q="usb hub"' },
  { id: 12, t: '09:13:40', level: 'DEBUG', msg: 'cache hit key=catalog:v42' },
  { id: 13, t: '09:14:05', level: 'WARN', msg: 'db: connection pool exhausted — 20/20 in use, request queued (waited 5000ms)' },
  { id: 14, t: '09:14:06', level: 'INFO', msg: 'checkout started req=c3d9 user=274 cart=5 items' },
  { id: 15, t: '09:14:07', level: 'ERROR', msg: 'checkout failed req=c3d9 user=274 TimeoutError: db query exceeded 5000ms' },
  { id: 16, t: '09:14:09', level: 'INFO', msg: 'checkout started req=d4c2 user=305 cart=2 items' },
  { id: 17, t: '09:14:10', level: 'ERROR', msg: 'checkout failed req=d4c2 user=305 TimeoutError: db query exceeded 5000ms' },
  { id: 18, t: '09:14:12', level: 'INFO', msg: 'session refresh user=274' },
  { id: 19, t: '09:14:14', level: 'INFO', msg: 'checkout started req=e5b8 user=101 cart=1 item' },
  { id: 20, t: '09:14:15', level: 'ERROR', msg: 'checkout failed req=e5b8 user=101 TimeoutError: db query exceeded 5000ms' },
  { id: 21, t: '09:14:30', level: 'INFO', msg: 'search query user=412 q="hdmi cable"' },
  { id: 22, t: '09:14:41', level: 'DEBUG', msg: 'cache miss key=catalog:v43 — rebuilding' },
  { id: 23, t: '09:15:02', level: 'WARN', msg: 'db: pool recovered — 9/20 in use' },
  { id: 24, t: '09:15:20', level: 'INFO', msg: 'checkout started req=f6a1 user=274 cart=5 items' },
  { id: 25, t: '09:15:22', level: 'INFO', msg: 'payment authorised req=f6a1 amount=118.20' },
  { id: 26, t: '09:15:23', level: 'INFO', msg: 'checkout complete req=f6a1 user=274' },
];

type LogMission = Mission & ({ kind: 'flag'; target: number } | { kind: 'count'; answer: number });

export const LOG_MISSIONS: LogMission[] = [
  {
    id: 'firsterror', kind: 'flag', target: 15,
    title: 'Find the first failure',
    brief: 'Support says checkouts started failing around 09:14. Filter the noise away and flag the FIRST error line.',
    hint: 'Click the ERROR level chip — three lines survive. You want the earliest.',
    learn: 'Level filtering is the first move on any log: 26 lines became 3. Timestamps order the story — the first error is where the incident begins (but not necessarily where it was caused…).',
  },
  {
    id: 'blast', kind: 'count', answer: 3,
    title: 'Measure the blast radius',
    brief: 'How many checkouts failed in total during the incident? Count the failures and type the number.',
    hint: 'Filter for “checkout failed” — or by ERROR level — and count.',
    learn: 'Blast radius turns “checkouts are failing!” into “3 checkouts failed over 8 seconds, then recovery.” Scale changes severity — and the fix conversation.',
  },
  {
    id: 'thread', kind: 'flag', target: 14,
    title: 'Follow the thread',
    brief: 'Take the first failure (req=c3d9) and follow its request id back. Flag the line where that request STARTED.',
    hint: 'Type c3d9 into the filter — every line of that request’s life appears.',
    learn: 'Request ids stitch a story across interleaved logs: this checkout started at 09:14:06 and died one second later. Correlation ids are the single most useful thing a tester can ask developers to add.',
  },
  {
    id: 'rootcause', kind: 'flag', target: 13,
    title: 'The cause before the symptom',
    brief: 'The errors are timeouts — but timeouts are symptoms. Something happened just BEFORE the first failure. Flag the true root cause.',
    hint: 'Clear the filter and read upward in time from the first ERROR. What did the database say at 09:14:05?',
    learn: 'The WARN two seconds before the first ERROR is the story: the connection pool ran dry, then queries queued past their timeout. Root causes hide above the first error, often at a quieter log level.',
  },
];

const LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG'] as const;

export default function LogViewer({ missionId, onComplete }: { missionId: string; onComplete: (id: string) => void }) {
  const [filter, setFilter] = useState('');
  const [levels, setLevels] = useState<Set<string>>(new Set(LEVELS));
  const [selected, setSelected] = useState<number | null>(null);
  const [countInput, setCountInput] = useState('');
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);

  const mission = LOG_MISSIONS.find((mm) => mm.id === missionId);
  const shown = LINES.filter((l) =>
    levels.has(l.level) && (!filter || `${l.t} ${l.level} ${l.msg}`.toLowerCase().includes(filter.toLowerCase())));

  const toggleLevel = (lv: string) => {
    setLevels((s) => {
      const n = new Set(s);
      if (n.has(lv) && n.size === 1) return new Set(LEVELS); // clicking the only active chip resets
      if (n.has(lv)) n.delete(lv); else n.add(lv);
      return n;
    });
  };

  const flag = (id: number) => {
    setSelected(id);
    if (mission?.kind !== 'flag') return;
    const hit = mission.target === id;
    setVerdict(hit ? 'right' : 'wrong');
    if (hit) onComplete(missionId);
  };

  const answer = () => {
    if (mission?.kind !== 'count') return;
    const hit = Number(countInput.trim()) === mission.answer;
    setVerdict(hit ? 'right' : 'wrong');
    if (hit) onComplete(missionId);
  };

  return (
    <div className="ql-tool">
      <div className="ql-netbar">
        <input
          className="ql-filter" placeholder="Filter lines (text, req id…)" value={filter}
          onChange={(e) => setFilter(e.target.value)} aria-label="Filter log lines"
        />
        <div className="ql-levels">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              className={`ql-level ql-level--${lv.toLowerCase()} ${levels.has(lv) ? 'is-on' : ''}`}
              onClick={() => toggleLevel(lv)}
            >{lv}</button>
          ))}
        </div>
      </div>

      <div className="ql-log-list ql-console" role="listbox" aria-label="Log lines">
        {shown.length === 0 && <span className="ql-empty">no lines match</span>}
        {shown.map((l) => (
          <button
            key={l.id}
            className={`ql-log-line ${selected === l.id ? 'is-sel' : ''}`}
            onClick={() => flag(l.id)}
            role="option" aria-selected={selected === l.id}
          >
            <span className="ql-log-t">{l.t}</span>
            <span className={`ql-log-lv ql-level--${l.level.toLowerCase()}`}>{l.level}</span>
            <span className="ql-log-msg">{l.msg}</span>
          </button>
        ))}
      </div>

      <div className="ql-log-foot">
        {mission?.kind === 'count' ? (
          <div className="ql-count-row">
            <input
              className="ql-filter ql-count" inputMode="numeric" placeholder="your count…"
              value={countInput} onChange={(e) => setCountInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') answer(); }}
              aria-label="Count answer"
            />
            <button className="qg-btn qg-btn-primary" onClick={answer}>Answer</button>
          </div>
        ) : (
          <span className="ql-io-label"><em>click a line to flag it for the current mission</em></span>
        )}
        {verdict === 'wrong' && <p className="ql-verdict ql-verdict--no">Not quite — look again.</p>}
        {verdict === 'right' && <p className="ql-verdict ql-verdict--yes">Correct.</p>}
      </div>
    </div>
  );
}
