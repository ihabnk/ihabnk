import { useRef, useState } from 'react';
import type { Mission, ToolMeta } from '../types';

export const TERM_TOOL: ToolMeta = {
  id: 'term',
  name: 'Terminal',
  tagline: 'ls, cat, grep, npm test — the keyboard side of the job.',
  glyph: '>_',
};

/* A tiny read-only filesystem. Directories are objects, files are strings. */
type Dir = { [name: string]: Dir | string };

const APP_LOG = [
  '09:11:52 INFO checkout started req=a1f3 user=101',
  '09:11:54 INFO checkout complete req=a1f3',
  '09:13:58 DEBUG cache warm key=catalog:v42',
  '09:14:05 WARN db: connection pool exhausted (waited 5000ms)',
  '09:14:07 ERROR checkout failed req=c3d9 TimeoutError: db query exceeded 5000ms',
  '09:14:10 ERROR checkout failed req=d4c2 TimeoutError: db query exceeded 5000ms',
  '09:14:15 ERROR checkout failed req=e5b8 TimeoutError: db query exceeded 5000ms',
  '09:15:02 WARN db: pool recovered — 9/20 in use',
  '09:15:23 INFO checkout complete req=f6a1',
].join('\n');

const FS: Dir = {
  'README.md': [
    '# northwind-tests',
    '',
    'End-to-end and API checks for Northwind.',
    '',
    '- `npm test` runs the suite',
    '- logs from staging land in `logs/app.log`',
    '- flaky tests are quarantined in `tests/quarantine/`',
  ].join('\n'),
  'package.json': '{\n  "name": "northwind-tests",\n  "scripts": { "test": "qa-runner tests/" }\n}',
  logs: { 'app.log': APP_LOG },
  tests: {
    'reminders.test.ts': [
      "test('reminder fires within a minute', async () => {",
      "  const task = await api.createTask({ title: 'DST rota', dst: true });",
      "  await api.addReminder(task.id, at('01:30', { tz: 'Europe/London' }));",
      '  await clock.advanceThroughDst();   // <- BUG: 01:30 does not exist on DST night',
      '  expect(fired(task.id)).toBe(true);',
      '});',
    ].join('\n'),
    'checkout.test.ts': "test('checkout completes', async () => { /* … */ });",
    quarantine: { 'flaky-modal.test.ts': '// quarantined 2026-06-12 — waits on animation, needs a condition wait' },
  },
};

const TEST_OUTPUT = [
  '> qa-runner tests/',
  '',
  '✓ checkout.test.ts — checkout completes (211ms)',
  '✓ api-contract.test.ts — response shape unchanged (48ms)',
  '✗ reminders.test.ts — reminder fires within a minute',
  '    Expected: true   Received: false',
  '    at tests/reminders.test.ts:5',
  '',
  'Tests: 1 failed, 2 passed · time 4.1s',
  'Hint: read the failing file — tests/reminders.test.ts',
].join('\n');

export const TERM_MISSIONS: Mission[] = [
  {
    id: 'orient',
    title: 'Find your feet',
    brief: 'You’ve landed in a repo you’ve never seen. Look around with ls, then read the README with cat README.md.',
    hint: 'ls shows what’s here; cat <file> prints it. That’s 80% of terminal life.',
    learn: 'ls and cat are how you case a new codebase without an IDE — every CI box, every server, every “can you ssh in and check?” starts exactly here.',
  },
  {
    id: 'grep',
    title: 'Grep the evidence',
    brief: 'Staging logs are in logs/app.log. Pull out just the error lines: grep ERROR logs/app.log.',
    hint: 'grep <pattern> <file> prints only matching lines. Patterns are case-sensitive.',
    learn: 'grep is the log viewer with no UI: one command turns a thousand lines into the three that matter. It works on any machine you can reach — which is why it outlives every fancy tool.',
  },
  {
    id: 'runtests',
    title: 'Run the suite',
    brief: 'Run npm test and read the output — the whole output, not just the last line.',
    hint: 'Type: npm test',
    learn: 'A failing suite tells you three things: WHAT failed, WHERE (file:line), and how everything else fared. Testers read failures top to bottom — the summary line is the least interesting part.',
  },
  {
    id: 'readfail',
    title: 'Read the failing test',
    brief: 'The suite pointed at tests/reminders.test.ts. Open it with cat and find the comment marking the bug.',
    hint: 'cat tests/reminders.test.ts — the runner told you the exact path.',
    learn: 'The failure was a DST edge: the test schedules 01:30 on a night when 01:30 doesn’t exist. Terminal skills close the loop — from red suite to file to root cause without leaving the keyboard.',
  },
];

interface TermLine { text: string; kind: 'cmd' | 'out' | 'err' }
interface CmdEvent { cmd: string; arg: string; ok: boolean }

const checks: Record<string, (h: CmdEvent[]) => boolean> = {
  orient: (h) => h.some((e) => e.cmd === 'ls' && e.ok) && h.some((e) => e.cmd === 'cat' && e.ok && /readme\.md$/i.test(e.arg)),
  grep: (h) => h.some((e) => e.cmd === 'grep' && e.ok && e.arg.includes('ERROR') && e.arg.includes('app.log')),
  runtests: (h) => h.some((e) => e.cmd === 'npm' && e.ok),
  readfail: (h) => h.some((e) => e.cmd === 'cat' && e.ok && e.arg.includes('reminders.test.ts')),
};

function resolve(path: string, cwd: string[]): { node: Dir | string | null; parts: string[] } {
  const parts = [...cwd];
  for (const seg of path.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { parts.pop(); continue; }
    parts.push(seg);
  }
  let node: Dir | string = FS;
  for (const p of parts) {
    if (typeof node === 'string' || !(p in node)) return { node: null, parts };
    node = node[p];
  }
  return { node, parts };
}

export default function Terminal({ missionId, onComplete }: { missionId: string; onComplete: (id: string) => void }) {
  const [lines, setLines] = useState<TermLine[]>([
    { text: 'northwind-tests — staging box. Type `help` for commands.', kind: 'out' },
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState<string[]>([]);
  const historyRef = useRef<CmdEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const print = (out: TermLine[]) => {
    setLines((l) => [...l.slice(-200), ...out]);
    queueMicrotask(() => scrollRef.current?.scrollTo({ top: 99999 }));
  };

  const exec = (raw: string) => {
    const line = raw.trim();
    const prompt = `~/${cwd.join('/')}$`.replace('/$', '$');
    const out: TermLine[] = [{ text: `${prompt} ${line}`, kind: 'cmd' }];
    const [cmd = '', ...args] = line.split(/\s+/);
    const argStr = args.join(' ');
    let ok = false;

    switch (cmd) {
      case '': break;
      case 'help':
        out.push({ text: 'commands: ls [dir] · cd <dir> · cat <file> · grep <pattern> <file> · tail -n <k> <file> · pwd · npm test · clear', kind: 'out' });
        ok = true; break;
      case 'pwd':
        out.push({ text: '/home/qa/northwind-tests' + (cwd.length ? '/' + cwd.join('/') : ''), kind: 'out' }); ok = true; break;
      case 'ls': {
        const { node } = resolve(args[0] ?? '.', cwd);
        if (node === null) out.push({ text: `ls: no such path: ${args[0]}`, kind: 'err' });
        else if (typeof node === 'string') out.push({ text: args[0], kind: 'out' });
        else { out.push({ text: Object.entries(node).map(([k, v]) => (typeof v === 'string' ? k : k + '/')).join('   '), kind: 'out' }); ok = true; }
        break;
      }
      case 'cd': {
        if (!args[0]) { setCwd([]); ok = true; break; }
        const { node, parts } = resolve(args[0], cwd);
        if (node === null || typeof node === 'string') out.push({ text: `cd: not a directory: ${args[0]}`, kind: 'err' });
        else { setCwd(parts); ok = true; }
        break;
      }
      case 'cat': {
        const { node } = resolve(args[0] ?? '', cwd);
        if (typeof node !== 'string') out.push({ text: `cat: no such file: ${args[0] ?? ''}`, kind: 'err' });
        else { out.push({ text: node, kind: 'out' }); ok = true; }
        break;
      }
      case 'grep': {
        const [pattern, file] = [args[0], args[1]];
        const { node } = resolve(file ?? '', cwd);
        if (!pattern || typeof node !== 'string') { out.push({ text: 'usage: grep <pattern> <file>', kind: 'err' }); break; }
        const hits = node.split('\n').filter((l) => l.includes(pattern));
        out.push({ text: hits.length ? hits.join('\n') : `(no lines match "${pattern}")`, kind: hits.length ? 'out' : 'err' });
        ok = hits.length > 0; break;
      }
      case 'tail': {
        const n = args[0] === '-n' ? Number(args[1]) : 10;
        const file = args[0] === '-n' ? args[2] : args[0];
        const { node } = resolve(file ?? '', cwd);
        if (typeof node !== 'string') { out.push({ text: 'usage: tail -n <k> <file>', kind: 'err' }); break; }
        out.push({ text: node.split('\n').slice(-n).join('\n'), kind: 'out' }); ok = true; break;
      }
      case 'npm':
        if (args[0] === 'test') { out.push({ text: TEST_OUTPUT, kind: 'out' }); ok = true; }
        else out.push({ text: 'npm: only `npm test` works on this box', kind: 'err' });
        break;
      case 'clear':
        setLines([]); setInput(''); return;
      default:
        out.push({ text: `${cmd}: command not found — try \`help\``, kind: 'err' });
    }

    print(out);
    setInput('');
    if (line) {
      historyRef.current.push({ cmd, arg: argStr, ok });
      if (checks[missionId]?.(historyRef.current)) onComplete(missionId);
    }
  };

  return (
    <div className="ql-tool">
      <div className="ql-term ql-console" ref={scrollRef} onClick={() => document.getElementById('ql-term-input')?.focus()}>
        {lines.map((l, i) => (
          <pre key={i} className={`ql-term-line ql-term-line--${l.kind}`}>{l.text}</pre>
        ))}
        <div className="ql-term-prompt">
          <span>~{cwd.length ? '/' + cwd.join('/') : ''}$</span>
          <input
            id="ql-term-input" value={input} spellCheck={false} autoComplete="off"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') exec(input); }}
            aria-label="Terminal input"
          />
        </div>
      </div>
    </div>
  );
}
