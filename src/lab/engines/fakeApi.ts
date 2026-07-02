/**
 * A tiny in-memory REST API for the API Console tool.
 *
 * Base URL: https://api.northwind.test
 * Auth:     every /tasks route requires `Authorization: Bearer qa-token-2026`.
 *
 * One bug is planted on purpose: POST /tasks silently truncates titles to
 * 60 chars — but the 201 response echoes the FULL title back, so only a
 * follow-up GET reveals the loss. The final mission is finding it.
 */

export interface ApiResult {
  status: number;
  statusText: string;
  timeMs: number;
  body: unknown;
}

export interface Task {
  id: number;
  title: string;
  done: boolean;
  assignee: string;
}

const TOKEN = 'Bearer qa-token-2026';
const TITLE_LIMIT = 60;

const seed = (): Task[] => [
  { id: 1, title: 'Draft the release notes', done: true, assignee: 'maya' },
  { id: 2, title: 'Fix login validation message', done: false, assignee: 'idris' },
  { id: 3, title: 'Review reminder API contract', done: true, assignee: 'sam' },
  { id: 4, title: 'Update the roster import', done: false, assignee: 'priya' },
  { id: 5, title: 'Test snooze on mobile', done: false, assignee: 'nadia' },
];

let tasks: Task[] = seed();
let nextId = 6;

export function resetApi(): void {
  tasks = seed();
  nextId = 6;
}

const STATUS_TEXT: Record<number, string> = {
  200: 'OK', 201: 'Created', 204: 'No Content',
  400: 'Bad Request', 401: 'Unauthorized', 404: 'Not Found', 405: 'Method Not Allowed', 500: 'Internal Server Error',
};

const respond = (status: number, body: unknown): ApiResult => ({
  status,
  statusText: STATUS_TEXT[status] ?? '',
  timeMs: Math.round(24 + Math.random() * 40),
  body,
});

/** Handle one request. `headers` keys are matched case-insensitively. */
export function apiRequest(
  method: string,
  rawUrl: string,
  headers: Record<string, string>,
  rawBody: string,
): ApiResult {
  const m = method.toUpperCase();

  // Accept full URLs against our base, or bare paths.
  let path = rawUrl.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const u = new URL(path);
      if (u.hostname !== 'api.northwind.test') {
        return respond(404, { error: `unknown host '${u.hostname}' — this console only reaches api.northwind.test` });
      }
      path = u.pathname + u.search;
    }
  } catch {
    return respond(400, { error: 'that does not look like a valid URL' });
  }
  if (!path.startsWith('/')) path = '/' + path;
  const [pathname, query = ''] = path.split('?');
  const params = new URLSearchParams(query);

  const auth = Object.entries(headers).find(([k]) => k.toLowerCase() === 'authorization')?.[1];

  if (pathname === '/health') {
    if (m !== 'GET') return respond(405, { error: 'only GET is supported on /health' });
    return respond(200, { status: 'ok', service: 'northwind-api', version: '2.4.1' });
  }

  if (pathname === '/tasks' || /^\/tasks\/\d+$/.test(pathname)) {
    if (auth !== TOKEN) {
      return respond(401, { error: 'missing or invalid Authorization header', hint: 'send: Authorization: Bearer qa-token-2026' });
    }

    if (pathname === '/tasks') {
      if (m === 'GET') {
        let list = tasks;
        if (params.has('done')) {
          const want = params.get('done') === 'true';
          list = list.filter((t) => t.done === want);
        }
        return respond(200, list);
      }
      if (m === 'POST') {
        let parsed: Record<string, unknown>;
        try { parsed = rawBody.trim() ? JSON.parse(rawBody) : {}; }
        catch { return respond(400, { error: 'request body is not valid JSON' }); }
        const title = parsed.title;
        if (typeof title !== 'string' || title.trim() === '') {
          return respond(400, { error: 'title is required and must be a non-empty string' });
        }
        // The planted bug: store truncated, echo the full title back.
        const stored: Task = { id: nextId++, title: title.slice(0, TITLE_LIMIT), done: false, assignee: 'you' };
        tasks.push(stored);
        return respond(201, { ...stored, title });
      }
      return respond(405, { error: `${m} is not supported on /tasks` });
    }

    const id = Number(pathname.split('/')[2]);
    const task = tasks.find((t) => t.id === id);
    if (m === 'GET') {
      return task ? respond(200, task) : respond(404, { error: `no task with id ${id}` });
    }
    if (m === 'DELETE') {
      if (!task) return respond(404, { error: `no task with id ${id}` });
      tasks = tasks.filter((t) => t.id !== id);
      return respond(204, null);
    }
    return respond(405, { error: `${m} is not supported on /tasks/{id}` });
  }

  return respond(404, { error: `no route matches ${pathname}`, routes: ['/health', '/tasks', '/tasks/{id}'] });
}
