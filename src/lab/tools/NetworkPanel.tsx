import { useState } from 'react';
import type { Mission, ToolMeta } from '../types';

export const NET_TOOL: ToolMeta = {
  id: 'net',
  name: 'Network Tab',
  tagline: 'One page load, thirteen requests, five problems. Inspect and flag.',
  glyph: '⇅',
};

interface NetEntry {
  id: string;
  name: string;
  method: string;
  status: number; // 0 = blocked
  type: string;
  size: string;
  time: number; // ms
  reqHeaders: string[];
  resHeaders: string[];
  reqBody?: string;
  resBody?: string;
  note?: string;
}

/** The dashboard page load, frozen in time. */
export const ENTRIES: NetEntry[] = [
  { id: 'doc', name: 'dashboard', method: 'GET', status: 200, type: 'document', size: '12.4 kB', time: 89, reqHeaders: ['Accept: text/html'], resHeaders: ['Content-Type: text/html', 'Cache-Control: no-cache'] },
  { id: 'css', name: 'app.css', method: 'GET', status: 200, type: 'stylesheet', size: '38.1 kB', time: 42, reqHeaders: [], resHeaders: ['Content-Type: text/css', 'Cache-Control: max-age=31536000'] },
  { id: 'js', name: 'app.js', method: 'GET', status: 200, type: 'script', size: '214 kB', time: 130, reqHeaders: [], resHeaders: ['Content-Type: text/javascript', 'Cache-Control: max-age=31536000'] },
  { id: 'user', name: '/api/user', method: 'GET', status: 200, type: 'fetch', size: '0.4 kB', time: 95, reqHeaders: ['Authorization: Bearer eyJhb…', 'Accept: application/json'], resHeaders: ['Content-Type: application/json'], resBody: '{"id": 8231, "name": "Dana Reyes", "plan": "team"}' },
  { id: 'tasks1', name: '/api/tasks', method: 'GET', status: 200, type: 'fetch', size: '2.1 kB', time: 180, reqHeaders: ['Authorization: Bearer eyJhb…'], resHeaders: ['Content-Type: application/json'], resBody: '[ …12 tasks… ]' },
  { id: 'tasks2', name: '/api/tasks', method: 'GET', status: 200, type: 'fetch', size: '2.1 kB', time: 176, reqHeaders: ['Authorization: Bearer eyJhb…'], resHeaders: ['Content-Type: application/json'], resBody: '[ …12 tasks… ]', note: 'Identical to the request just above it — same URL, same response, milliseconds apart.' },
  { id: 'rem', name: '/api/reminders', method: 'GET', status: 500, type: 'fetch', size: '0.2 kB', time: 310, reqHeaders: ['Authorization: Bearer eyJhb…'], resHeaders: ['Content-Type: application/json'], resBody: '{"error": "TypeError: cannot read \'tz\' of null"}', note: 'The reminders widget shows an infinite spinner because of this response.' },
  { id: 'avatar', name: 'avatar-8231.png', method: 'GET', status: 404, type: 'img', size: '0.1 kB', time: 61, reqHeaders: [], resHeaders: ['Content-Type: text/plain'], resBody: 'Not found', note: 'The page shows a broken-image icon where the profile photo should be.' },
  { id: 'analytics', name: 'analytics.js', method: 'GET', status: 200, type: 'script', size: '96 kB', time: 3210, reqHeaders: [], resHeaders: ['Content-Type: text/javascript'], note: 'Third-party script from cdn.trackmetrics.io — the page felt “stuck” while this loaded.' },
  { id: 'telemetry', name: '/api/telemetry', method: 'POST', status: 204, type: 'fetch', size: '0 B', time: 88, reqHeaders: ['Content-Type: application/json'], resHeaders: [], reqBody: '{"event": "dashboard_view", "email": "dana@northwind.test", "tz": null, "plan": "team"}', note: 'Look at what this REQUEST sends, not what comes back.' },
  { id: 'partner', name: 'widgets.partner.com/feed', method: 'GET', status: 0, type: 'fetch', size: '0 B', time: 210, reqHeaders: ['Origin: https://app.northwind.test'], resHeaders: [], note: 'Blocked by CORS: the response had no Access-Control-Allow-Origin header, so the browser refused to hand it to the page. Console: “blocked by CORS policy”.' },
  { id: 'font', name: 'inter.woff2', method: 'GET', status: 200, type: 'font', size: '44 kB', time: 71, reqHeaders: [], resHeaders: ['Content-Type: font/woff2'] },
  { id: 'fav', name: 'favicon.svg', method: 'GET', status: 200, type: 'img', size: '1.2 kB', time: 12, reqHeaders: [], resHeaders: ['Content-Type: image/svg+xml'] },
];

export const NET_MISSIONS: Mission[] = [
  { id: 'broken', title: 'The spinning widget', brief: 'The reminders widget on the dashboard spins forever. Find the request that broke it, open it, and flag it.', hint: 'Sort your eyes by status — one of these is a 500. Click a row to inspect it.', learn: 'An infinite spinner in the UI is almost always a failed request underneath. The network tab shows you the failure the page is hiding — read the response body: that TypeError is a server bug, filed with the exact evidence.' },
  { id: 'missing', title: 'The broken image', brief: 'There’s a broken-image icon where Dana’s profile photo should be. Flag the request that explains it.', hint: 'Images have type “img”. One of them didn’t come back.', learn: 'A 404 on an asset is a bug with two possible owners: the URL is wrong (frontend) or the file is missing (backend/storage). The network tab tells you WHAT failed; the fix conversation starts from there.' },
  { id: 'slow', title: 'Why is it slow?', brief: 'Users say the dashboard “feels stuck” for a few seconds. Flag the request responsible.', hint: 'Read the time column. One number is not like the others.', learn: '3.2 seconds for a third-party analytics script — a classic. The time column turns “feels slow” into a named culprit, and “it’s the tracker, not our code” changes who fixes it.' },
  { id: 'dupe', title: 'Double trouble', brief: 'Something on this page is being fetched twice. Find the duplicate request and flag it.', hint: 'Two rows are nearly identical. Same URL, same method, milliseconds apart.', learn: 'Duplicate fetches waste bandwidth and — for non-GET requests — can double-charge, double-create, double-send. Usually a component mounting twice or a missing cache. Cheap to spot here, expensive in production.' },
  { id: 'leak', title: 'The oversharer', brief: 'One request on this page sends personal data it shouldn’t. Inspect request payloads and flag the offender.', hint: 'Check what each request SENDS (the request body), not what it receives. Telemetry should be anonymous.', learn: 'The telemetry beacon ships the user’s email address with every event — a privacy leak invisible in the UI and obvious in the network tab. Testers are often the only people who ever look here.' },
  { id: 'cors', title: 'Blocked at the border', brief: 'The partner widget area is empty and the console says something about “CORS policy”. Flag the request the browser refused.', hint: 'Status 0 with 0 bytes — the browser blocked the response before the page could see it.', learn: 'CORS failures happen in the browser, not the server — the response arrived but had no Access-Control-Allow-Origin header, so the browser refused to share it. Status 0 + a console error is the signature.' },
];

const TARGETS: Record<string, string[]> = {
  broken: ['rem'],
  missing: ['avatar'],
  slow: ['analytics'],
  dupe: ['tasks1', 'tasks2'],
  leak: ['telemetry'],
  cors: ['partner'],
};

const tone = (s: number) => (s === 0 || s >= 500 ? 'err' : s >= 400 ? 'warn' : 'ok');

export default function NetworkPanel({ missionId, onComplete }: { missionId: string; onComplete: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);

  const shown = ENTRIES.filter((e) =>
    !filter || `${e.name} ${e.method} ${e.status} ${e.type}`.toLowerCase().includes(filter.toLowerCase()));
  const sel = ENTRIES.find((e) => e.id === selected);

  const flag = () => {
    if (!sel) return;
    const hit = TARGETS[missionId]?.includes(sel.id) ?? false;
    setVerdict(hit ? 'right' : 'wrong');
    if (hit) onComplete(missionId);
  };

  return (
    <div className="ql-tool">
      <div className="ql-netbar">
        <input
          className="ql-filter" placeholder="Filter (name, status, type…)" value={filter}
          onChange={(e) => { setFilter(e.target.value); setVerdict(null); }} aria-label="Filter requests"
        />
        <span className="ql-io-label"><em>{shown.length} / {ENTRIES.length} requests</em></span>
      </div>

      <div className="ql-net-grid">
        <div className="ql-net-list" role="listbox" aria-label="Network requests">
          <div className="ql-net-row ql-net-head">
            <span>Name</span><span>Method</span><span>Status</span><span>Type</span><span>Size</span><span>Time</span>
          </div>
          {shown.map((e) => (
            <button
              key={e.id}
              className={`ql-net-row ${selected === e.id ? 'is-sel' : ''}`}
              onClick={() => { setSelected(e.id); setVerdict(null); }}
              role="option" aria-selected={selected === e.id}
            >
              <span className="ql-net-name">{e.name}</span>
              <span>{e.method}</span>
              <span className={`ql-status--${tone(e.status)}`}>{e.status === 0 ? '(blocked)' : e.status}</span>
              <span>{e.type}</span>
              <span>{e.size}</span>
              <span className={e.time > 1000 ? 'ql-status--warn' : ''}>{e.time} ms</span>
            </button>
          ))}
        </div>

        {sel && (
          <div className="ql-net-detail">
            <div className="ql-net-detail-head">
              <b>{sel.method} {sel.name}</b>
              <button className="qg-btn qg-btn-primary ql-flag" onClick={flag}>⚑ Flag as the culprit</button>
            </div>
            {verdict === 'wrong' && <p className="ql-verdict ql-verdict--no">Not this one — it’s innocent. Re-read the mission and look again.</p>}
            {verdict === 'right' && <p className="ql-verdict ql-verdict--yes">Flagged — that’s the one.</p>}
            <div className="ql-net-sections">
              <section>
                <span className="ql-io-label">Request headers</span>
                <pre className="ql-console">{sel.reqHeaders.join('\n') || '(none of note)'}</pre>
              </section>
              {sel.reqBody && (
                <section>
                  <span className="ql-io-label">Request body</span>
                  <pre className="ql-console">{sel.reqBody}</pre>
                </section>
              )}
              <section>
                <span className="ql-io-label">Response headers</span>
                <pre className="ql-console">{sel.resHeaders.join('\n') || '(blocked — nothing delivered to the page)'}</pre>
              </section>
              {sel.resBody && (
                <section>
                  <span className="ql-io-label">Response body</span>
                  <pre className="ql-console">{sel.resBody}</pre>
                </section>
              )}
              {sel.note && <p className="ql-net-note">{sel.note}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
