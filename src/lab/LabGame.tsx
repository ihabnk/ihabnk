import { useState } from 'react';
import './lab.css';
import type { Mission, ToolMeta } from './types';
import { useLab } from './useLab';
import { resetApi } from './engines/fakeApi';

import ApiConsole, { API_TOOL, API_MISSIONS } from './tools/ApiConsole';
import SqlTerminal, { SQL_TOOL, SQL_MISSIONS } from './tools/SqlTerminal';
import NetworkPanel, { NET_TOOL, NET_MISSIONS } from './tools/NetworkPanel';
import LogViewer, { LOG_TOOL, LOG_MISSIONS } from './tools/LogViewer';
import SelectorLab, { SEL_TOOL, SEL_MISSIONS } from './tools/SelectorLab';
import Terminal, { TERM_TOOL, TERM_MISSIONS } from './tools/Terminal';

interface ToolDef {
  meta: ToolMeta;
  missions: Mission[];
  Component: React.ComponentType<{ missionId: string; onComplete: (id: string) => void }>;
}

const TOOLS: ToolDef[] = [
  { meta: API_TOOL, missions: API_MISSIONS, Component: ApiConsole },
  { meta: SQL_TOOL, missions: SQL_MISSIONS, Component: SqlTerminal },
  { meta: NET_TOOL, missions: NET_MISSIONS, Component: NetworkPanel },
  { meta: LOG_TOOL, missions: LOG_MISSIONS, Component: LogViewer },
  { meta: SEL_TOOL, missions: SEL_MISSIONS, Component: SelectorLab },
  { meta: TERM_TOOL, missions: TERM_MISSIONS, Component: Terminal },
];

const TOTAL_MISSIONS = TOOLS.reduce((n, t) => n + t.missions.length, 0);

export default function LabGame() {
  const { hydrated, complete, doneIn, progress } = useLab();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [justLearned, setJustLearned] = useState<string | null>(null);

  const tool = TOOLS.find((t) => t.meta.id === activeTool);
  const totalDone = Object.values(progress.done).reduce((n, l) => n + l.length, 0);

  /* ── Hub ─────────────────────────────────────────────────────── */
  if (!tool) {
    return (
      <div className="ql-root">
        <header className="ql-head">
          <span className="qg-kicker">The QA Lab</span>
          <h1 className="ql-h1">Real tools, simulated. Type it yourself.</h1>
          <p className="ql-lead">
            Six instruments every tester works with — an API console, a database, the network tab,
            logs, locators, and a terminal. Each one is a working simulator with missions:
            you type real queries, real requests, real selectors, and the lab checks what actually happened.
          </p>
          {hydrated && totalDone > 0 && (
            <span className="ql-total">{totalDone} / {TOTAL_MISSIONS} missions complete</span>
          )}
        </header>

        <div className="ql-grid">
          {TOOLS.map(({ meta, missions }) => {
            const done = doneIn(meta.id).length;
            const complete_ = done >= missions.length;
            return (
              <button
                key={meta.id}
                className={`ql-card ${complete_ ? 'is-complete' : ''}`}
                onClick={() => { setActiveTool(meta.id); setShowHint(false); setJustLearned(null); if (meta.id === 'api') resetApi(); }}
                disabled={!hydrated}
              >
                <span className="ql-glyph" aria-hidden="true">{meta.glyph}</span>
                <span className="ql-card-name">{meta.name}</span>
                <span className="ql-card-tag">{meta.tagline}</span>
                <span className="ql-card-progress">
                  {complete_ ? '✓ complete' : `${done} / ${missions.length} missions`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Inside a tool ───────────────────────────────────────────── */
  const done = doneIn(tool.meta.id);
  const current = tool.missions.find((m) => !done.includes(m.id));
  const allDone = !current;
  const { Component } = tool;

  const onComplete = (id: string) => {
    const m = tool.missions.find((mm) => mm.id === id);
    complete(tool.meta.id, id);
    setShowHint(false);
    setJustLearned(m?.learn ?? null);
  };

  return (
    <div className="ql-root">
      <div className="ql-toolhead">
        <button className="ql-back" onClick={() => setActiveTool(null)}>← All tools</button>
        <span className="ql-toolname"><span className="ql-glyph ql-glyph--sm" aria-hidden="true">{tool.meta.glyph}</span> {tool.meta.name}</span>
        <span className="ql-toolprog">{done.length} / {tool.missions.length}</span>
      </div>

      <div className="ql-stage">
        <aside className="ql-missions">
          <span className="ql-io-label">Missions</span>
          <ol className="ql-mission-list">
            {tool.missions.map((m) => {
              const isDone = done.includes(m.id);
              const isCurrent = current?.id === m.id;
              return (
                <li key={m.id} className={isDone ? 'is-done' : isCurrent ? 'is-current' : 'is-locked'}>
                  <span className="ql-mission-mark" aria-hidden="true">{isDone ? '✓' : isCurrent ? '▸' : '·'}</span>
                  {m.title}
                </li>
              );
            })}
          </ol>

          {justLearned && (
            <div className="ql-learned">
              <span className="ql-learn-tag">✓ Mission complete</span>
              <p>{justLearned}</p>
              {!allDone && (
                <button className="qg-btn qg-btn-primary ql-next" onClick={() => setJustLearned(null)}>
                  Next mission →
                </button>
              )}
            </div>
          )}

          {!justLearned && current && (
            <div className="ql-brief">
              <span className="ql-brief-title">{current.title}</span>
              <p>{current.brief}</p>
              {showHint
                ? <p className="ql-hint">{current.hint}</p>
                : <button className="ql-hint-btn" onClick={() => setShowHint(true)}>Need a hint?</button>}
            </div>
          )}

          {allDone && !justLearned && (
            <div className="ql-learned">
              <span className="ql-learn-tag">Tool mastered</span>
              <p>All {tool.missions.length} missions done. The simulator stays open — keep poking at it, that’s the job.</p>
              <button className="qg-btn qg-btn-primary ql-next" onClick={() => setActiveTool(null)}>Back to the lab →</button>
            </div>
          )}
        </aside>

        <div className="ql-toolpane">
          <Component missionId={current?.id ?? '__free_play__'} onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
}
