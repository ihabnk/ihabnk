import { useState } from 'react';
import type { Mission, ToolMeta } from '../types';
import { runSql, SCHEMA, type SqlResult, type Row } from '../engines/miniSql';

export const SQL_TOOL: ToolMeta = {
  id: 'sql',
  name: 'The Database',
  tagline: 'Read-only SQL against staging. Prove bugs with queries, not opinions.',
  glyph: 'db',
};

export const SQL_MISSIONS: Mission[] = [
  {
    id: 'look',
    title: 'Look around',
    brief: 'Start wide: SELECT * FROM users — see everyone in the system.',
    hint: 'Exactly that query. The schema panel on the right lists every table and column.',
    learn: 'Testers read databases to verify what the UI claims. SELECT * on a small table is the “walk the product” of data: get the shape in your head first.',
  },
  {
    id: 'filter',
    title: 'Filter to the facts',
    brief: 'Support says “lots of tasks are unfinished.” Get the real list: every task WHERE done = 0.',
    hint: 'Booleans are stored as 0/1 here (like SQLite). WHERE done = 0.',
    learn: 'A WHERE clause turns “lots” into an exact list. Vague reports become checkable facts the moment you can filter for them.',
  },
  {
    id: 'count',
    title: 'Count, don’t scroll',
    brief: 'How many reminders have actually fired? Get the number itself with COUNT(*).',
    hint: 'SELECT COUNT(*) FROM reminders WHERE fired = 1',
    learn: 'When the answer is a number, ask for the number. Counting rows by eye works until the table has ten thousand of them.',
  },
  {
    id: 'nullhunt',
    title: 'The null hunt',
    brief: 'A reminder job crashed on a user with no timezone (sound familiar?). Find every user whose tz IS NULL.',
    hint: 'NULL is not a value — you can’t say tz = null. The operator is IS NULL.',
    learn: 'NULL means “no value at all” and it breaks code that assumes one. IS NULL hunts are how testers find the data that will crash tomorrow’s job.',
  },
  {
    id: 'join',
    title: 'Join the dots',
    brief: 'Task 4 has a problem and you need its owner’s name — but tasks only stores user_id. JOIN users to tasks and get the name for task id 4.',
    hint: 'SELECT users.name FROM tasks JOIN users ON tasks.user_id = users.id WHERE tasks.id = 4',
    learn: 'Real answers usually live across two tables. JOIN … ON is how you follow a foreign key — the single most-used move in a tester’s SQL.',
  },
  {
    id: 'dupes',
    title: 'Prove the double-fire',
    brief: 'A customer swears task 7 reminded them twice at the same moment. Support doubts it. Settle it with a query.',
    hint: 'SELECT * FROM reminders WHERE task_id = 7 — then read the rows carefully.',
    learn: 'Two rows, same task, same timestamp — the duplicate is real and now it’s evidence. A query result in the ticket ends the “are you sure?” conversation forever.',
  },
];

const cell = (rows: Row[], val: string | number) =>
  rows.some((r) => Object.values(r).some((v) => v === val));

const checks: Record<string, (r: SqlResult) => boolean> = {
  look: (r) => r.rows.length === 6 && r.columns.includes('email'),
  filter: (r) => r.rows.length === 4 && cell(r.rows, 'Cover night shift') && !cell(r.rows, 'Approve rota'),
  count: (r) => r.rows.length === 1 && Object.values(r.rows[0]).includes(4),
  nullhunt: (r) => r.rows.length === 1 && cell(r.rows, 'dana@northwind.test'),
  join: (r) => r.rows.length === 1 && cell(r.rows, 'Priya Shah'),
  dupes: (r) => r.rows.length === 2 && r.rows.every((row) => Object.values(row).includes('2026-07-03 07:15')),
};

export default function SqlTerminal({ missionId, onComplete }: { missionId: string; onComplete: (id: string) => void }) {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<SqlResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    try {
      const r = runSql(sql);
      setResult(r);
      setError(null);
      if (checks[missionId]?.(r)) onComplete(missionId);
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    }
  };

  return (
    <div className="ql-tool ql-sql">
      <div className="ql-sql-main">
        <textarea
          className="ql-sql-input" rows={3} value={sql} spellCheck={false}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }}
          placeholder="SELECT * FROM users"
          aria-label="SQL query"
        />
        <div className="ql-sql-actions">
          <button className="qg-btn qg-btn-primary" onClick={run}>Run query</button>
          <span className="ql-io-label"><em>⌘⏎ runs too · read-only</em></span>
        </div>

        {error && <pre className="ql-console ql-console--err">SQL error: {error}</pre>}

        {result && !error && (
          <div className="ql-table-wrap">
            <table className="ql-table">
              <thead>
                <tr>{result.columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {result.rows.length === 0 && (
                  <tr><td colSpan={Math.max(result.columns.length, 1)} className="ql-empty">0 rows</td></tr>
                )}
                {result.rows.map((row, i) => (
                  <tr key={i}>
                    {result.columns.map((c) => (
                      <td key={c}>{row[c] === null ? <em className="ql-null">NULL</em> : String(row[c])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <span className="ql-rowcount">{result.rows.length} row{result.rows.length === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>

      <aside className="ql-schema" aria-label="Schema">
        <span className="ql-io-label">Schema</span>
        {Object.entries(SCHEMA).map(([t, cols]) => (
          <div key={t} className="ql-schema-table">
            <b>{t}</b>
            <span>{cols.join(' · ')}</span>
          </div>
        ))}
        <p className="ql-schema-note">Booleans are 0/1. Strings take 'single quotes'.</p>
      </aside>
    </div>
  );
}
