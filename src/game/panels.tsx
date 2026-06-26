import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Choice, Day, MentorState, Scene } from './types';
import { TOTAL_DAYS } from './types';

type TaskScn = Extract<Scene, { kind: 'task' }>;

const LETTERS = ['A', 'B', 'C', 'D'];

type Tier = 'strong' | 'partial' | 'risky';
const tierOf = (c: Choice): Tier => (c.best ? 'strong' : c.confidence >= 4 ? 'partial' : 'risky');
const TIER: Record<Tier, { label: string; glyph: string }> = {
  strong: { label: 'Strong QA instinct', glyph: '✓' },
  partial: { label: 'Partial reasoning', glyph: '◑' },
  risky: { label: 'Risky mindset', glyph: '!' },
};

/* Count-up number that eases toward its target. */
function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || prev.current === value) { setShown(value); prev.current = value; return; }
    const from = prev.current, to = value, t0 = performance.now(), dur = 650;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(from + (to - from) * e));
      if (k < 1) raf = requestAnimationFrame(tick); else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);
  return <>{shown}</>;
}

/* ── World layer: HUD ──────────────────────────────────────────── */
export function GameHUD({
  completed, confidence, streak, skills,
}: { completed: number; confidence: number; streak: number; skills: number }) {
  const pct = Math.round((completed / TOTAL_DAYS) * 100);
  return (
    <div className="qg-hud">
      <div className="qg-hud-meter">
        <div className="qg-hud-meter-top">
          <span className="qg-hud-label">Confidence</span>
          <span className="qg-hud-xp"><AnimatedNumber value={confidence} /> XP</span>
        </div>
        <div className="qg-hud-bar">
          <motion.div className="qg-hud-fill" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <span className="qg-hud-sub">Day {Math.min(completed + 1, TOTAL_DAYS)} of {TOTAL_DAYS}</span>
      </div>
      <div className="qg-hud-stats">
        <motion.span key={streak} className="qg-chip" title="Day streak"
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>🔥 {streak}</motion.span>
        <motion.span key={skills} className="qg-chip" title="Skills unlocked"
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>★ {skills}</motion.span>
      </div>
    </div>
  );
}

/* ── Day intro ─────────────────────────────────────────────────── */
export function DayIntroCard({ day, onStart, onBack }: { day: Day; onStart: () => void; onBack: () => void }) {
  return (
    <div className="qg-card qg-intro">
      <button className="qg-back" onClick={onBack}>← Map</button>
      <span className="qg-kicker">Week {day.week} · {day.weekTitle}</span>
      <h2 className="qg-day-title"><span className="qg-day-n">Day {day.n}</span>{day.title}</h2>
      <p className="qg-goal"><span className="qg-goal-pin" aria-hidden="true">◎</span>{day.goal}</p>
      <p className="qg-intro-text">{day.intro}</p>
      <button className="qg-btn qg-btn-primary" onClick={onStart}>Start the day →</button>
    </div>
  );
}

/* ── Story layer: mentor narrative beat ────────────────────────── */
export function MentorBeat({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <div className="qg-card qg-beat">
      <span className="qg-speaker">Bit · your mentor</span>
      <p className="qg-beat-text">{text}</p>
      <button className="qg-btn qg-btn-primary" onClick={onContinue}>Continue</button>
    </div>
  );
}

/* ── Decision layer + outcome layer ────────────────────────────── */
export function ChoiceScene({
  dayN, prompt, subtitle, options, picked, onPick, onContinue, isLast,
}: {
  dayN: number; prompt: string; subtitle?: string; options: Choice[];
  picked: number | null; onPick: (i: number) => void; onContinue: () => void; isLast: boolean;
}) {
  const reduce = useReducedMotion();
  const answered = picked !== null;
  const chosen = answered ? options[picked!] : null;
  const tier = chosen ? tierOf(chosen) : null;

  const list = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.05 } },
  };
  const item = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 26 } },
  };

  return (
    <div className="qg-card qg-scenario">
      <div className="qg-scenario-head">
        <span className="qg-decision-pill"><span className="qg-decision-dot" aria-hidden="true" />Your call</span>
        <span className="qg-scenario-ctx">Day {dayN} · scenario</span>
      </div>
      <p className="qg-prompt">{prompt}</p>
      {subtitle && <p className="qg-subtitle">{subtitle}</p>}

      <motion.div className="qg-options" variants={list} initial="hidden" animate="show">
        {options.map((o, i) => {
          const cls = !answered ? '' : o.best ? 'is-best' : i === picked ? 'is-picked' : 'is-dim';
          return (
            <motion.button
              key={i}
              variants={item}
              whileHover={answered || reduce ? undefined : { y: -2 }}
              whileTap={answered || reduce ? undefined : { scale: 0.99 }}
              className={`qg-dcard ${cls}`}
              disabled={answered}
              onClick={() => onPick(i)}
            >
              <span className="qg-dcard-key">{LETTERS[i]}</span>
              <span className="qg-dcard-text">{o.text}</span>
              <span className="qg-dcard-mark" aria-hidden="true">
                {answered && o.best ? '✓' : answered && i === picked ? '✕' : '›'}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {answered && chosen && tier && (
          <motion.div
            className={`qg-outcome is-${tier}`}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="qg-outcome-head">
              <span className="qg-outcome-glyph" aria-hidden="true">{TIER[tier].glyph}</span>
              <span className="qg-outcome-verdict">{TIER[tier].label}</span>
              <motion.span className="qg-outcome-xp"
                initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}>
                +{chosen.confidence} XP
              </motion.span>
            </div>
            <p className="qg-outcome-text">{chosen.feedback}</p>
            <button className="qg-btn qg-btn-primary" onClick={onContinue}>{isLast ? 'Wrap up the day →' : 'Continue →'}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Interactive task (explore reveal / multi-select) ──────────── */
export function TaskScene({
  dayN, task, onResolve, onContinue, onMentor,
}: {
  dayN: number; task: TaskScn;
  onResolve: (gained: number) => void; onContinue: () => void; onMentor: (s: MentorState) => void;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [resolved, setResolved] = useState(false);
  const [gain, setGain] = useState(0);
  const [strong, setStrong] = useState(true);

  const need = task.variant === 'explore' ? (task.minReveal ?? task.items.length) : 0;

  const openCard = (i: number) => {
    if (resolved) return;
    setOpen((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev).add(i);
      if (next.size >= need) { setResolved(true); setGain(task.xp); setStrong(true); onResolve(task.xp); onMentor('success'); }
      else onMentor('speaking');
      return next;
    });
  };

  const toggleSel = (i: number) => {
    if (resolved) return;
    setSel((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  const submit = () => {
    if (resolved || sel.size === 0) return;
    const wrong = [...sel].filter((i) => !task.items[i].correct).length;
    const missed = task.items.filter((it, i) => it.correct && !sel.has(i)).length;
    const perfect = wrong === 0 && missed === 0;
    const g = perfect ? task.xp : Math.max(3, Math.round(task.xp * 0.5));
    setResolved(true); setGain(g); setStrong(perfect); onResolve(g); onMentor(perfect ? 'success' : 'caution');
  };

  const selClass = (i: number) => {
    const it = task.items[i];
    if (!resolved) return sel.has(i) ? 'is-sel' : '';
    if (it.correct && sel.has(i)) return 'is-correct';
    if (it.correct && !sel.has(i)) return 'is-missed';
    if (!it.correct && sel.has(i)) return 'is-wrong';
    return 'is-dim';
  };

  return (
    <div className="qg-card qg-scenario">
      <div className="qg-scenario-head">
        <span className="qg-decision-pill"><span className="qg-decision-dot" aria-hidden="true" />{task.variant === 'explore' ? 'Explore' : 'Hands-on'}</span>
        <span className="qg-scenario-ctx">Day {dayN} · task</span>
      </div>
      <p className="qg-prompt">{task.prompt}</p>
      {task.subtitle && <p className="qg-subtitle">{task.subtitle}</p>}

      {task.variant === 'explore' && (
        <>
          <div className="qg-explore">
            {task.items.map((it, i) => {
              const o = open.has(i);
              return (
                <motion.button key={i} className={`qg-explore-card ${o ? 'is-open' : ''}`} onClick={() => openCard(i)}
                  whileHover={o || reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.99 }}>
                  <span className="qg-explore-top">
                    <span className="qg-explore-label">{it.label}</span>
                    <span className="qg-explore-plus" aria-hidden="true">{o ? '✓' : '+'}</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {o && it.note && (
                      <motion.span className="qg-explore-note"
                        initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        {it.note}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
          {!resolved && <p className="qg-task-progress">Opened {open.size} of {need}</p>}
        </>
      )}

      {task.variant === 'select' && (
        <>
          <div className="qg-select">
            {task.items.map((it, i) => (
              <button key={i} className={`qg-selectable ${selClass(i)}`} disabled={resolved} onClick={() => toggleSel(i)}
                aria-pressed={sel.has(i)}>
                <span className="qg-check" aria-hidden="true">
                  {resolved ? (it.correct ? '✓' : sel.has(i) ? '✕' : '') : (sel.has(i) ? '✓' : '')}
                </span>
                <span>{it.label}</span>
              </button>
            ))}
          </div>
          {!resolved && (
            <div className="qg-task-actions">
              <button className="qg-btn qg-btn-primary" disabled={sel.size === 0} onClick={submit}>Confirm selection</button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {resolved && (
          <motion.div className={`qg-outcome is-${strong ? 'strong' : 'partial'}`}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
            <div className="qg-outcome-head">
              <span className="qg-outcome-glyph" aria-hidden="true">{strong ? '✓' : '◑'}</span>
              <span className="qg-outcome-verdict">{strong ? 'Well done' : 'Close — worth a review'}</span>
              <motion.span className="qg-outcome-xp" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}>+{gain} XP</motion.span>
            </div>
            <p className="qg-outcome-text">{task.done}</p>
            <button className="qg-btn qg-btn-primary" onClick={onContinue}>Continue →</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Outcome layer: end-of-day recap ───────────────────────────── */
export function DayRecapCard({
  day, gained, onFinish, isLastContent,
}: { day: Day; gained: number; onFinish: () => void; isLastContent: boolean }) {
  return (
    <div className="qg-card qg-recap">
      <span className="qg-kicker">Day {day.n} complete</span>
      <h2 className="qg-recap-title">Nice work today.</h2>
      <motion.div className="qg-skill-unlock"
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.05 }}>
        <span className="qg-skill-star">★</span>
        <div>
          <span className="qg-skill-label">Skill unlocked</span>
          <strong className="qg-skill-name">{day.skill.label}</strong>
        </div>
        <span className="qg-skill-xp">+{gained} XP</span>
      </motion.div>
      <ul className="qg-recap-list">
        {day.recap.map((r, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>{r}</motion.li>
        ))}
      </ul>
      <button className="qg-btn qg-btn-primary" onClick={onFinish}>
        {isLastContent ? 'Back to the map' : 'Next day →'}
      </button>
    </div>
  );
}

/* ── Skill toast ───────────────────────────────────────────────── */
export function SkillToast({ label, xp }: { label: string; xp: number }) {
  return (
    <div className="qg-toast">
      <span className="qg-skill-star">★</span> Skill unlocked: <strong>{label}</strong> <span className="qg-toast-xp">+{xp} XP</span>
    </div>
  );
}
