/**
 * A tiny SQL engine for the Database tool. Supports a deliberate subset:
 *
 *   SELECT <*|cols|COUNT(*)> FROM <table>
 *     [JOIN <table2> ON <a.col = b.col>]
 *     [WHERE <cond> [AND <cond>]*]
 *     [ORDER BY <col> [ASC|DESC]]
 *     [LIMIT <n>]
 *
 *   cond: col <op> value | col LIKE 'pat%' | col IS [NOT] NULL
 *   ops:  = != < > <= >=      values: numbers, 'strings'
 *
 * Booleans are stored as 0/1 (like SQLite). NULLs are real nulls.
 * Errors are thrown as friendly messages — the terminal shows them verbatim.
 */

export type Row = Record<string, number | string | null>;
export interface SqlResult { columns: string[]; rows: Row[] }

/* Seeded data — continuity with the onboarding story: dana (user 4) has a
 * NULL timezone, and task 7 has a duplicated reminder. */
export const DB: Record<string, Row[]> = {
  users: [
    { id: 1, name: 'Maya Chen', email: 'maya@northwind.test', tz: 'Europe/London', role: 'pm' },
    { id: 2, name: 'Idris Kone', email: 'idris@northwind.test', tz: 'Europe/London', role: 'dev' },
    { id: 3, name: 'Priya Shah', email: 'priya@northwind.test', tz: 'Asia/Kolkata', role: 'po' },
    { id: 4, name: 'Dana Reyes', email: 'dana@northwind.test', tz: null, role: 'ops' },
    { id: 5, name: 'Sam Okafor', email: 'sam@northwind.test', tz: 'America/New_York', role: 'qa' },
    { id: 6, name: 'Nadia Karim', email: 'nadia@northwind.test', tz: 'Europe/Berlin', role: 'qa' },
  ],
  tasks: [
    { id: 1, title: 'Cover night shift', user_id: 4, done: 0, created_at: '2026-06-28' },
    { id: 2, title: 'Restock bay 12', user_id: 4, done: 1, created_at: '2026-06-29' },
    { id: 3, title: 'Approve rota', user_id: 1, done: 1, created_at: '2026-06-30' },
    { id: 4, title: 'Audit reminder queue', user_id: 3, done: 0, created_at: '2026-07-01' },
    { id: 5, title: 'Ship snooze fix', user_id: 2, done: 1, created_at: '2026-07-01' },
    { id: 6, title: 'Write eval examples', user_id: 5, done: 0, created_at: '2026-07-02' },
    { id: 7, title: 'Handover checklist', user_id: 4, done: 0, created_at: '2026-07-02' },
    { id: 8, title: 'Update squad map', user_id: 6, done: 1, created_at: '2026-07-02' },
  ],
  reminders: [
    { id: 1, task_id: 1, at: '2026-07-03 06:00', fired: 1 },
    { id: 2, task_id: 1, at: '2026-07-03 21:45', fired: 0 },
    { id: 3, task_id: 3, at: '2026-07-01 09:00', fired: 1 },
    { id: 4, task_id: 4, at: '2026-07-04 08:30', fired: 0 },
    { id: 5, task_id: 5, at: '2026-07-01 17:00', fired: 1 },
    { id: 6, task_id: 6, at: '2026-07-05 10:00', fired: 0 },
    { id: 7, task_id: 7, at: '2026-07-03 07:15', fired: 1 },
    { id: 8, task_id: 7, at: '2026-07-03 07:15', fired: 0 },
    { id: 9, task_id: 8, at: '2026-07-02 12:00', fired: 0 },
    { id: 10, task_id: 2, at: '2026-06-30 08:00', fired: 0 },
  ],
};

export const SCHEMA: Record<string, string[]> = Object.fromEntries(
  Object.entries(DB).map(([t, rows]) => [t, Object.keys(rows[0])]),
);

const fail = (msg: string): never => { throw new Error(msg); };

interface Cond { col: string; op: string; val: number | string | null }

/** Resolve a possibly table-qualified column against a joined row. */
function get(row: Row, col: string): number | string | null {
  if (col in row) return row[col];
  // bare name: match a single `table.col` suffix
  const hits = Object.keys(row).filter((k) => k.endsWith('.' + col));
  if (hits.length === 1) return row[hits[0]];
  if (hits.length > 1) fail(`column '${col}' is ambiguous — qualify it (e.g. ${hits.join(' or ')})`);
  fail(`unknown column '${col}'`);
  return null; // unreachable
}

function parseValue(tok: string): number | string {
  if (/^-?\d+(\.\d+)?$/.test(tok)) return Number(tok);
  const m = tok.match(/^'(.*)'$/s);
  if (m) return m[1];
  fail(`can't read value ${tok} — strings need single quotes, e.g. 'dana@northwind.test'`);
  return ''; // unreachable
}

function matches(row: Row, c: Cond): boolean {
  const v = get(row, c.col);
  switch (c.op) {
    case 'isnull': return v === null;
    case 'notnull': return v !== null;
    case 'like': {
      if (v === null) return false;
      const pat = String(c.val).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
      return new RegExp(`^${pat}$`, 'i').test(String(v));
    }
  }
  if (v === null) return false;
  const a = typeof c.val === 'number' ? Number(v) : String(v).toLowerCase();
  const b = typeof c.val === 'number' ? c.val : String(c.val).toLowerCase();
  switch (c.op) {
    case '=': return a === b;
    case '!=': case '<>': return a !== b;
    case '<': return a < b;
    case '>': return a > b;
    case '<=': return a <= b;
    case '>=': return a >= b;
  }
  fail(`unsupported operator '${c.op}'`);
  return false; // unreachable
}

export function runSql(sql: string): SqlResult {
  const src = sql.trim().replace(/;\s*$/, '');
  if (!src) fail('type a query first');
  if (!/^select\s/i.test(src)) fail("only SELECT is supported here — this terminal is read-only (as staging DBs for testers usually are)");

  const re = /^select\s+(.+?)\s+from\s+([a-z_]+)(?:\s+join\s+([a-z_]+)\s+on\s+([a-z_.]+)\s*=\s*([a-z_.]+))?(?:\s+where\s+(.+?))?(?:\s+order\s+by\s+([a-z_.]+)(\s+desc|\s+asc)?)?(?:\s+limit\s+(\d+))?$/is;
  const m = src.match(re);
  if (!m) fail("couldn't parse that — supported shape: SELECT cols FROM table [JOIN t2 ON a.x = b.y] [WHERE …] [ORDER BY col] [LIMIT n]");

  const [, colsRaw, table, joinTable, joinL, joinR, whereRaw, orderCol, orderDir, limitRaw] = m!;

  const t1 = table.toLowerCase();
  if (!DB[t1]) fail(`unknown table '${t1}' — tables here: ${Object.keys(DB).join(', ')}`);

  // Build the working row set (namespaced keys when joined).
  let rows: Row[];
  if (joinTable) {
    const t2 = joinTable.toLowerCase();
    if (!DB[t2]) fail(`unknown table '${t2}' — tables here: ${Object.keys(DB).join(', ')}`);
    const qual = (t: string, r: Row): Row => Object.fromEntries(Object.entries(r).map(([k, v]) => [`${t}.${k}`, v]));
    rows = [];
    for (const a of DB[t1]) {
      for (const b of DB[t2]) {
        const joined = { ...qual(t1, a), ...qual(t2, b) };
        if (get(joined, joinL.toLowerCase()) === get(joined, joinR.toLowerCase())) rows.push(joined);
      }
    }
  } else {
    rows = DB[t1].map((r) => ({ ...r }));
  }

  // WHERE
  if (whereRaw) {
    const parts = whereRaw.split(/\s+and\s+/i);
    const conds: Cond[] = parts.map((p) => {
      const s = p.trim();
      let mm = s.match(/^([a-z_.]+)\s+is\s+not\s+null$/i);
      if (mm) return { col: mm[1].toLowerCase(), op: 'notnull', val: null };
      mm = s.match(/^([a-z_.]+)\s+is\s+null$/i);
      if (mm) return { col: mm[1].toLowerCase(), op: 'isnull', val: null };
      mm = s.match(/^([a-z_.]+)\s+like\s+(.+)$/i);
      if (mm) return { col: mm[1].toLowerCase(), op: 'like', val: parseValue(mm[2].trim()) };
      mm = s.match(/^([a-z_.]+)\s*(=|!=|<>|<=|>=|<|>)\s*(.+)$/);
      if (mm) return { col: mm[1].toLowerCase(), op: mm[2], val: parseValue(mm[3].trim()) };
      fail(`couldn't read condition: ${s}`);
      return null as never;
    });
    rows = rows.filter((r) => conds.every((c) => matches(r, c)));
  }

  // ORDER BY
  if (orderCol) {
    const dir = (orderDir ?? '').trim().toLowerCase() === 'desc' ? -1 : 1;
    const col = orderCol.toLowerCase();
    rows = [...rows].sort((a, b) => {
      const va = get(a, col), vb = get(b, col);
      if (va === vb) return 0;
      if (va === null) return -dir;
      if (vb === null) return dir;
      return (va < vb ? -1 : 1) * dir;
    });
  }

  // LIMIT
  if (limitRaw) rows = rows.slice(0, Number(limitRaw));

  // Projection
  const colsSpec = colsRaw.trim();
  if (/^count\(\s*\*\s*\)$/i.test(colsSpec)) {
    return { columns: ['count'], rows: [{ count: rows.length }] };
  }
  if (colsSpec === '*') {
    const columns = rows.length ? Object.keys(rows[0]) : (joinTable ? [] : SCHEMA[t1]);
    return { columns, rows };
  }
  const wanted = colsSpec.split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
  const out = rows.map((r) => {
    const o: Row = {};
    for (const w of wanted) o[w] = get(r, w);
    return o;
  });
  return { columns: wanted, rows: out };
}
