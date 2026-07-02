import { useState } from 'react';
import type { Mission, ToolMeta } from '../types';
import { apiRequest, type ApiResult } from '../engines/fakeApi';

export const API_TOOL: ToolMeta = {
  id: 'api',
  name: 'API Console',
  tagline: 'Send real requests. Read real responses. Find the liar.',
  glyph: '{ }',
};

export const API_MISSIONS: Mission[] = [
  {
    id: 'health',
    title: 'First contact',
    brief: 'Every API worth testing has a health check. Send GET https://api.northwind.test/health and get a 200 back.',
    hint: 'Pick GET, paste the URL, press Send. That’s the whole move.',
    learn: 'A health endpoint is the cheapest question you can ask a system: “are you even alive?” It needs no auth — everything else here will.',
  },
  {
    id: 'auth',
    title: 'The locked door',
    brief: 'Now GET /tasks. It will refuse you — read the error, then add the header it asks for and get in.',
    hint: 'Add a line to Headers: Authorization: Bearer qa-token-2026',
    learn: 'A 401 means “who are you?” — and a good 401 tells you how to answer. Auth headers are the first thing to check when an API test fails.',
  },
  {
    id: 'notfound',
    title: 'Read one, miss one',
    brief: 'GET a single task that exists (try /tasks/3), then GET one that doesn’t (try /tasks/999). You need to see the 404.',
    hint: 'Same URL shape both times — only the id changes. Keep the auth header.',
    learn: 'A clean 404 on a missing resource is CORRECT behaviour — testers assert the failure cases as deliberately as the happy path.',
  },
  {
    id: 'create',
    title: 'Create — then break the rules',
    brief: 'POST /tasks with a JSON body like {"title": "test the API console"} for a 201. Then POST again with {} and confirm you get a clean 400.',
    hint: 'The Body panel only matters on POST. Empty title must be rejected — that rejection is a passing test.',
    learn: 'Every write endpoint has two tests minimum: the valid input is accepted (201), the invalid one is refused with a clear 400 — not a 500, not a silent 200.',
  },
  {
    id: 'delete',
    title: 'Delete is forever',
    brief: 'DELETE /tasks/2, then prove it’s gone: GET /tasks/2 and see the 404.',
    hint: 'A 204 means “done, nothing to show you.” The follow-up GET is the actual verification.',
    learn: 'Never trust a delete that only reports success — verify absence. The GET after the DELETE is the test; the 204 was just a claim.',
  },
  {
    id: 'liar',
    title: 'The liar',
    brief: 'There is a data-loss bug hiding in POST /tasks. Create a task with a title LONGER than 60 characters, read the 201 response carefully… then GET that task back by its id.',
    hint: 'Compare the title in the 201 response with the title in the follow-up GET. Count characters.',
    learn: 'The 201 echoed your full title — but the server stored only 60 characters. Silent truncation: perfect status codes, lost data. This is why API tests re-READ what they write instead of trusting the write’s response.',
  },
];

interface HistEntry {
  method: string;
  path: string;
  status: number;
  sentTitle?: string;
  bodyTitle?: string;
  bodyId?: number;
}

const checks: Record<string, (h: HistEntry[]) => boolean> = {
  health: (h) => h.some((e) => e.method === 'GET' && e.path.startsWith('/health') && e.status === 200),
  auth: (h) => h.some((e) => e.method === 'GET' && e.path.startsWith('/tasks') && e.status === 200),
  notfound: (h) => h.some((e) => e.method === 'GET' && /^\/tasks\/\d+/.test(e.path) && e.status === 404),
  create: (h) =>
    h.some((e) => e.method === 'POST' && e.status === 201) &&
    h.some((e) => e.method === 'POST' && e.status === 400),
  delete: (h) =>
    h.some((e) => e.method === 'DELETE' && e.status === 204) &&
    h.some((d, i) => d.method === 'DELETE' && d.status === 204 &&
      h.slice(i + 1).some((g) => g.method === 'GET' && g.path === d.path && g.status === 404)),
  liar: (h) =>
    h.some((e) => e.method === 'GET' && e.status === 200 &&
      e.bodyTitle !== undefined && e.bodyTitle.length === 60 &&
      h.some((p) => p.method === 'POST' && p.status === 201 && p.bodyId !== undefined &&
        `/tasks/${p.bodyId}` === e.path && (p.sentTitle?.length ?? 0) > 60)),
};

const statusTone = (s: number) => (s === 0 ? 'err' : s < 300 ? 'ok' : s < 500 ? 'warn' : 'err');

export default function ApiConsole({ missionId, onComplete }: { missionId: string; onComplete: (id: string) => void }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.northwind.test/health');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [res, setRes] = useState<ApiResult | null>(null);
  const [history, setHistory] = useState<HistEntry[]>([]);

  const send = () => {
    const headerMap: Record<string, string> = {};
    for (const line of headers.split('\n')) {
      const i = line.indexOf(':');
      if (i > 0) headerMap[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    const r = apiRequest(method, url, headerMap, body);
    setRes(r);

    let sentTitle: string | undefined;
    try { const parsed = JSON.parse(body); if (typeof parsed?.title === 'string') sentTitle = parsed.title; } catch { /* ignore */ }
    const rb = r.body as { title?: unknown; id?: unknown } | null;
    const entry: HistEntry = {
      method: method.toUpperCase(),
      path: url.replace(/^https?:\/\/[^/]+/i, '').split('?')[0] || '/',
      status: r.status,
      sentTitle,
      bodyTitle: typeof rb?.title === 'string' ? rb.title : undefined,
      bodyId: typeof rb?.id === 'number' ? rb.id : undefined,
    };
    const h = [...history, entry];
    setHistory(h);
    if (checks[missionId]?.(h)) onComplete(missionId);
  };

  return (
    <div className="ql-tool">
      <div className="ql-reqbar">
        <select className="ql-method" value={method} onChange={(e) => setMethod(e.target.value)} aria-label="HTTP method">
          {['GET', 'POST', 'DELETE', 'PUT'].map((mm) => <option key={mm}>{mm}</option>)}
        </select>
        <input
          className="ql-url" value={url} onChange={(e) => setUrl(e.target.value)} spellCheck={false}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }} aria-label="Request URL"
        />
        <button className="qg-btn qg-btn-primary ql-send" onClick={send}>Send</button>
      </div>

      <div className="ql-req-io">
        <label className="ql-io">
          <span className="ql-io-label">Headers <em>(one per line, Key: Value)</em></span>
          <textarea rows={2} value={headers} onChange={(e) => setHeaders(e.target.value)} spellCheck={false}
            placeholder="Authorization: Bearer …" />
        </label>
        <label className="ql-io">
          <span className="ql-io-label">Body <em>(JSON, used on POST)</em></span>
          <textarea rows={2} value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false}
            placeholder='{"title": "…"}' />
        </label>
      </div>

      {res && (
        <div className="ql-response">
          <div className="ql-res-line">
            <span className={`ql-status ql-status--${statusTone(res.status)}`}>{res.status} {res.statusText}</span>
            <span className="ql-res-time">{res.timeMs} ms</span>
          </div>
          <pre className="ql-console">{res.body === null ? '(empty body)' : JSON.stringify(res.body, null, 2)}</pre>
        </div>
      )}

      {history.length > 0 && (
        <div className="ql-history">
          {history.slice(-6).map((e, i) => (
            <span key={i} className="ql-hist-chip">
              {e.method} {e.path} → <b className={`ql-status--${statusTone(e.status)}`}>{e.status}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
