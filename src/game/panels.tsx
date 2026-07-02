import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Choice, Day, MentorState, Scene } from './types';
import { TOTAL_DAYS, confidenceWord, confidenceLevel } from './types';
import { character } from './cast';
import CharacterPortrait from './CharacterPortrait';
import SquadMap from './SquadMap';

type TaskScn = Extract<Scene, { kind: 'task' }>;
type DialogueScn = Extract<Scene, { kind: 'dialogue' }>;

const LETTERS = ['A', 'B', 'C', 'D'];

type Tier = 'strong' | 'partial' | 'risky';
const tierOf = (c: Choice): Tier => (c.best ? 'strong' : c.confidence >= 4 ? 'partial' : 'risky');
const TIER: Record<Tier, { label: string; glyph: string }> = {
  strong: { label: 'That’s the instinct.', glyph: '✓' },
  partial: { label: 'Reasonable — but…', glyph: '◑' },
  risky: { label: 'Worth a rethink.', glyph: '·' },
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

/* On-demand hint (the mentor delivers it in the rail speech bubble). */
function HintRow({ onHint }: { onHint: () => void }) {
  const [used, setUsed] = useState(false);
  return (
    <div className="qg-hint-row">
      <button className="qg-hint-btn" onClick={() => { setUsed(true); onHint(); }}>
        <span className="qg-hint-ic" aria-hidden="true">?</span>
        {used ? 'Bit shared a hint →' : 'Ask Bit for a hint'}
      </button>
    </div>
  );
}

/* Within-day beat stepper — shows the 5-beat learning structure. */
export function DayProgress({ scenes, stage, sceneIdx }: { scenes: Scene[]; stage: 'intro' | 'scene' | 'recap'; sceneIdx: number }) {
  const beats = scenes.map((s) => {
    switch (s.kind) {
      case 'mentor': return 'Brief';
      case 'opening': return 'Arrive';
      case 'narration': return 'Story';
      case 'dialogue': return 'Meet';
      case 'squad': return 'The picture';
      case 'task': return s.variant === 'explore' ? 'Explore' : s.variant === 'order' ? 'Sequence' : 'Task';
      default: return 'Decision';
    }
  });
  beats.push('Recap');
  const active = stage === 'recap' ? beats.length - 1 : sceneIdx;
  return (
    <div className="qg-steps" role="list" aria-label={`Beat ${active + 1} of ${beats.length}`}>
      {beats.map((b, i) => (
        <div key={i} role="listitem" className={`qg-step ${i < active ? 'is-done' : i === active ? 'is-active' : ''}`}>
          <span className="qg-step-dot" aria-hidden="true" />
          <span className="qg-step-label">{b}</span>
        </div>
      ))}
    </div>
  );
}

/* ── World layer: felt status (no points/scores) ───────────────── */
export function GameHUD({
  dayN, week, confidence, met,
}: { dayN: number; week?: string; confidence: number; met: number }) {
  const word = confidenceWord(confidence);
  const lvl = confidenceLevel(confidence);
  const [bump, setBump] = useState(false);
  const prevC = useRef(confidence);
  useEffect(() => {
    if (confidence > prevC.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 700);
      prevC.current = confidence;
      return () => clearTimeout(t);
    }
    prevC.current = confidence;
  }, [confidence]);
  return (
    <div className={`qg-hud ${bump ? 'is-bump' : ''}`}>
      <div className="qg-hud-day">
        <span className="qg-hud-daynum">Day {dayN}</span>
        <span className="qg-hud-sub">of {TOTAL_DAYS}{week ? ` · ${week}` : ''}</span>
      </div>
      <div className="qg-hud-conf">
        <span className="qg-hud-label">Confidence</span>
        <div className="qg-pips" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => <span key={i} className={`qg-pip ${i <= lvl ? 'on' : ''}`} />)}
        </div>
        <span className="qg-hud-word">{word}</span>
      </div>
      <div className="qg-hud-people">
        <span className="qg-hud-label">People</span>
        <span className="qg-hud-peoplen">{met} met</span>
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
  dayN, prompt, subtitle, options, picked, onPick, onContinue, isLast, hasHint, onHint,
}: {
  dayN: number; prompt: string; subtitle?: string; options: Choice[];
  picked: number | null; onPick: (i: number) => void; onContinue: () => void; isLast: boolean;
  hasHint?: boolean; onHint?: () => void;
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

      {!answered && hasHint && onHint && <HintRow onHint={onHint} />}

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
            </div>
            <p className="qg-outcome-text">{chosen.feedback}</p>
            <button className="qg-btn qg-btn-primary" onClick={onContinue}>{isLast ? 'Wrap up the day →' : 'Continue →'}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Interactive task (explore / multi-select / order) ─────────── */
export function TaskScene({
  dayN, task, onResolve, onContinue, onMentor, onHint,
}: {
  dayN: number; task: TaskScn;
  onResolve: (gained: number) => void; onContinue: () => void;
  onMentor: (s: MentorState) => void; onHint?: () => void;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [seq, setSeq] = useState<number[]>([]);
  const [resolved, setResolved] = useState(false);
  const [gain, setGain] = useState(0);
  const [strong, setStrong] = useState(true);

  const need = task.variant === 'explore' ? (task.minReveal ?? task.items.length) : 0;

  // shuffled presentation order for the `order` task (stable per mount)
  const [shuffled] = useState<number[]>(() => {
    const arr = task.items.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  });

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

  const place = (i: number) => { if (resolved || seq.includes(i)) return; setSeq((s) => [...s, i]); onMentor('speaking'); };
  const unplace = (i: number) => { if (resolved) return; setSeq((s) => s.filter((x) => x !== i)); };
  const submitOrder = () => {
    if (resolved || seq.length !== task.items.length) return;
    const right = seq.filter((v, idx) => v === idx).length; // items authored in correct order
    const perfect = right === task.items.length;
    const g = perfect ? task.xp : Math.max(3, Math.round(task.xp * (right / task.items.length)));
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

  const headLabel = task.variant === 'explore' ? 'Explore' : task.variant === 'order' ? 'Sequence' : 'Hands-on';

  return (
    <div className="qg-card qg-scenario">
      <div className="qg-scenario-head">
        <span className="qg-decision-pill"><span className="qg-decision-dot" aria-hidden="true" />{headLabel}</span>
        <span className="qg-scenario-ctx">Day {dayN} · task</span>
      </div>
      <p className="qg-prompt">{task.prompt}</p>
      {task.subtitle && <p className="qg-subtitle">{task.subtitle}</p>}

      {task.variant === 'order' && (
        <div className="qg-order">
          <ol className="qg-order-seq">
            {Array.from({ length: task.items.length }).map((_, pos) => {
              const it = seq[pos];
              const cls = resolved ? (it === pos ? 'is-correct' : 'is-wrong') : (it != null ? 'is-filled' : '');
              return (
                <li key={pos} className={`qg-slot ${cls}`} onClick={() => it != null && unplace(it)}>
                  <span className="qg-slot-n">{pos + 1}</span>
                  <span className="qg-slot-label">{it != null ? task.items[it].label : 'Tap a step below…'}</span>
                  {resolved && <span className="qg-slot-mark" aria-hidden="true">{it === pos ? '✓' : '✕'}</span>}
                </li>
              );
            })}
          </ol>
          {!resolved && (
            <div className="qg-order-bank">
              {shuffled.filter((i) => !seq.includes(i)).map((i) => (
                <motion.button key={i} className="qg-chip-btn" onClick={() => place(i)}
                  whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.97 }}
                  layout={!reduce}>
                  {task.items[i].label}
                </motion.button>
              ))}
            </div>
          )}
          {!resolved && (
            <div className="qg-task-actions">
              <button className="qg-btn qg-btn-primary" disabled={seq.length !== task.items.length} onClick={submitOrder}>Confirm order</button>
            </div>
          )}
        </div>
      )}

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

      {!resolved && task.hint && onHint && <HintRow onHint={onHint} />}

      <AnimatePresence>
        {resolved && (
          <motion.div className={`qg-outcome is-${strong ? 'strong' : 'partial'}`}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
            <div className="qg-outcome-head">
              <span className="qg-outcome-glyph" aria-hidden="true">{strong ? '✓' : '◑'}</span>
              <span className="qg-outcome-verdict">{strong ? 'Nicely done.' : 'Close — worth another look.'}</span>
            </div>
            <p className="qg-outcome-text">{task.done}</p>
            <button className="qg-btn qg-btn-primary" onClick={onContinue}>Continue →</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── End of day: a journal entry, not a scoreboard ─────────────── */
export function DayRecapCard({
  day, onFinish, isLastContent,
}: { day: Day; onFinish: () => void; isLastContent: boolean }) {
  return (
    <div className="qg-card qg-recap">
      <span className="qg-kicker">Day {day.n} · end of the day</span>
      <h2 className="qg-recap-title">You head home, thinking it over.</h2>
      <motion.div className="qg-skill-unlock"
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.05 }}>
        <span className="qg-skill-star">✦</span>
        <div>
          <span className="qg-skill-label">You’re getting the hang of</span>
          <strong className="qg-skill-name">{day.skill.label}</strong>
        </div>
      </motion.div>
      <span className="qg-journal-label">What clicked today</span>
      <ul className="qg-recap-list">
        {day.recap.map((r, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>{r}</motion.li>
        ))}
      </ul>
      <button className="qg-btn qg-btn-primary" onClick={onFinish}>
        {day.n % 5 === 0 ? 'Finish the week →' : isLastContent ? 'Back to the map' : 'Next day →'}
      </button>
    </div>
  );
}

/* ── Week complete — a milestone, not just another recap ───────── */
export function WeekCompleteCard({
  week, weekTitle, skills, final = false, onContinue,
}: { week: number; weekTitle: string; skills: string[]; final?: boolean; onContinue: () => void }) {
  return (
    <div className="qg-card qg-weekdone">
      <motion.span className="qg-weekdone-badge"
        initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
        {final ? 'Day 30' : `Week ${week}`}
      </motion.span>
      <span className="qg-kicker">{final ? 'The First 30 Days — complete' : `Week ${week} complete`}</span>
      <h2 className="qg-recap-title">{final ? 'You own it now.' : `“${weekTitle}” — done.`}</h2>
      <p className="qg-weekdone-lead">
        {final
          ? 'Six weeks — observe, question, break, protect, collaborate, own. The final week gave you the owner’s tools:'
          : 'Five workdays, and none of this was in your head a week ago. It is now:'}
      </p>
      <div className="qg-weekdone-skills">
        {skills.map((s, i) => (
          <motion.span key={s} className="qg-weekdone-skill"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.09 }}>
            <span aria-hidden="true">✦</span> {s}
          </motion.span>
        ))}
      </div>
      <button className="qg-btn qg-btn-primary" onClick={onContinue}>Back to the map →</button>
    </div>
  );
}

/* ── The journal — quiet proof of progress on the map screen ───── */
export function Journal({ skills, met }: { skills: string[]; met: string[] }) {
  if (skills.length === 0 && met.length === 0) return null;
  return (
    <section className="qg-journal" aria-label="Your journal">
      <span className="qg-kicker">Your journal</span>
      <div className="qg-journal-cols">
        {skills.length > 0 && (
          <div>
            <span className="qg-journal-h">What you can do now</span>
            <div className="qg-journal-skills">
              {skills.map((s) => <span key={s} className="qg-weekdone-skill"><span aria-hidden="true">✦</span> {s}</span>)}
            </div>
          </div>
        )}
        {met.length > 0 && (
          <div>
            <span className="qg-journal-h">People you know</span>
            <div className="qg-journal-people">
              {met.map((id) => {
                const c = character(id);
                return (
                  <span key={id} className="qg-journal-person">
                    <CharacterPortrait id={id} size={34} />
                    <span className="qg-journal-pname">{c.name}<em>{c.role}</em></span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Narration beat — the hero's inner voice ───────────────────── */
export function NarrationCard({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <div className="qg-card qg-narration">
      <p className="qg-narration-text">{text}</p>
      <button className="qg-btn qg-btn-primary" onClick={onContinue}>Continue</button>
    </div>
  );
}

/* ── The "pull back" reveal — the whole squad picture ──────────── */
export function SquadReveal({ text, caption, onContinue }: { text: string; caption?: string; onContinue: () => void }) {
  return (
    <div className="qg-card qg-squad">
      <span className="qg-kicker">The whole picture</span>
      <p className="qg-narration-text">{text}</p>
      <SquadMap />
      {caption && <p className="qg-squad-cap">{caption}</p>}
      <button className="qg-btn qg-btn-primary" onClick={onContinue}>Continue →</button>
    </div>
  );
}

/* ── Dialogue with a colleague ─────────────────────────────────── */
export function DialogueScene({
  scene, onResolve, onMeet, onContinue, onMentor, isLast,
}: {
  scene: DialogueScn;
  onResolve: (gained: number) => void; onMeet: (id: string) => void;
  onContinue: () => void; onMentor: (s: MentorState, line?: string) => void; isLast: boolean;
}) {
  const reduce = useReducedMotion();
  const c = character(scene.speaker);
  const [picked, setPicked] = useState<number | null>(null);
  const reply = picked !== null ? scene.replies[picked] : null;

  useEffect(() => { onMeet(scene.speaker); }, [scene.speaker]);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const r = scene.replies[i];
    onResolve(r.best ? 14 : 6);
    onMentor(r.best ? 'success' : 'speaking');
  };

  return (
    <div className="qg-card qg-dialogue">
      <div className="qg-dialogue-head">
        <CharacterPortrait id={c.id} size={52} />
        <div>
          <span className="qg-dialogue-name">{c.name}</span>
          <span className="qg-dialogue-role">{c.role}</span>
        </div>
      </div>

      <div className="qg-said qg-said--them">{scene.line}</div>

      <div className="qg-replies">
        {scene.replies.map((r, i) => {
          const cls = picked === null ? '' : i === picked ? 'is-picked' : 'is-dim';
          return (
            <motion.button key={i} className={`qg-reply ${cls}`} disabled={picked !== null} onClick={() => choose(i)}
              whileHover={picked !== null || reduce ? undefined : { x: 3 }} whileTap={reduce ? undefined : { scale: 0.99 }}>
              <span className="qg-reply-you" aria-hidden="true">You</span>
              <span>{r.text}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {reply && (
          <motion.div className="qg-dialogue-out"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}>
            <div className="qg-said qg-said--them qg-said--reply"><strong>{c.name}:</strong> {reply.reply}</div>
            {reply.note && <p className="qg-dialogue-note">{reply.note}</p>}
            {scene.learn && (
              <p className="qg-dialogue-learn"><span className="qg-learn-tag">Takeaway</span>{scene.learn}</p>
            )}
            <button className="qg-btn qg-btn-primary" onClick={onContinue}>{isLast ? 'Wrap up the day →' : 'Continue →'}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Quiet acknowledgement toast (no points) ───────────────────── */
export function SkillToast({ label }: { label: string }) {
  return (
    <div className="qg-toast">
      <span className="qg-skill-star">✦</span> You’re getting the hang of <strong>{label}</strong>
    </div>
  );
}
