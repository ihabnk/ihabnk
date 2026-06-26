import type { Choice, Day } from './types';
import { TOTAL_DAYS } from './types';

const LETTERS = ['A', 'B', 'C', 'D'];

/* ── Top HUD: confidence meter · streak · skills ───────────────── */
export function GameHUD({
  completed, confidence, streak, skills,
}: { completed: number; confidence: number; streak: number; skills: number }) {
  const pct = Math.round((completed / TOTAL_DAYS) * 100);
  return (
    <div className="qg-hud">
      <div className="qg-hud-meter">
        <div className="qg-hud-meter-top">
          <span className="qg-hud-label">Confidence</span>
          <span className="qg-hud-xp">{confidence} XP</span>
        </div>
        <div className="qg-hud-bar"><div className="qg-hud-fill" style={{ width: `${pct}%` }} /></div>
        <span className="qg-hud-sub">Day {Math.min(completed + 1, TOTAL_DAYS)} of {TOTAL_DAYS}</span>
      </div>
      <div className="qg-hud-stats">
        <span className="qg-chip" title="Day streak">🔥 {streak}</span>
        <span className="qg-chip" title="Skills unlocked">★ {skills}</span>
      </div>
    </div>
  );
}

/* ── Day intro card ────────────────────────────────────────────── */
export function DayIntroCard({ day, onStart, onBack }: { day: Day; onStart: () => void; onBack: () => void }) {
  return (
    <div className="qg-card qg-intro">
      <button className="qg-back" onClick={onBack}>← Map</button>
      <span className="qg-kicker">Week {day.week} · {day.weekTitle}</span>
      <h2 className="qg-day-title"><span className="qg-day-n">Day {day.n}</span>{day.title}</h2>
      <p className="qg-goal">{day.goal}</p>
      <p className="qg-intro-text">{day.intro}</p>
      <button className="qg-btn qg-btn-primary" onClick={onStart}>Start the day →</button>
    </div>
  );
}

/* ── Mentor narrative beat ─────────────────────────────────────── */
export function MentorBeat({ text, onContinue }: { text: string; onContinue: () => void }) {
  return (
    <div className="qg-card qg-beat">
      <p className="qg-beat-text">{text}</p>
      <button className="qg-btn qg-btn-primary" onClick={onContinue}>Continue</button>
    </div>
  );
}

/* ── Choice scene (prompt + options + feedback) ────────────────── */
export function ChoiceScene({
  prompt, subtitle, options, picked, onPick, onContinue, isLast,
}: {
  prompt: string; subtitle?: string; options: Choice[];
  picked: number | null; onPick: (i: number) => void; onContinue: () => void; isLast: boolean;
}) {
  const answered = picked !== null;
  const chosen = answered ? options[picked!] : null;
  return (
    <div className="qg-card qg-choice">
      <span className="qg-tag">Your call</span>
      <p className="qg-prompt">{prompt}</p>
      {subtitle && <p className="qg-subtitle">{subtitle}</p>}

      <div className="qg-options">
        {options.map((o, i) => {
          const cls = !answered ? '' : o.best ? 'is-best' : i === picked ? 'is-picked' : 'is-dim';
          return (
            <button key={i} className={`qg-opt ${cls}`} disabled={answered} onClick={() => onPick(i)}>
              <span className="qg-opt-key">{LETTERS[i]}</span>
              <span className="qg-opt-text">{o.text}</span>
              {answered && o.best && <span className="qg-opt-mark">✓</span>}
              {answered && !o.best && i === picked && <span className="qg-opt-mark qg-opt-mark--x">✕</span>}
            </button>
          );
        })}
      </div>

      {answered && chosen && (
        <div className={`qg-feedback ${chosen.best ? 'is-good' : 'is-soft'}`}>
          <span className="qg-feedback-tag">{chosen.best ? 'Strong call' : 'Worth a rethink'} · +{chosen.confidence} XP</span>
          <p>{chosen.feedback}</p>
          <button className="qg-btn qg-btn-primary" onClick={onContinue}>{isLast ? 'Wrap up the day' : 'Continue'}</button>
        </div>
      )}
    </div>
  );
}

/* ── End-of-day recap ──────────────────────────────────────────── */
export function DayRecapCard({
  day, gained, onFinish, isLastContent,
}: { day: Day; gained: number; onFinish: () => void; isLastContent: boolean }) {
  return (
    <div className="qg-card qg-recap">
      <span className="qg-kicker">Day {day.n} complete</span>
      <h2 className="qg-recap-title">Nice work today.</h2>
      <div className="qg-skill-unlock">
        <span className="qg-skill-star">★</span>
        <div>
          <span className="qg-skill-label">Skill unlocked</span>
          <strong className="qg-skill-name">{day.skill.label}</strong>
        </div>
        <span className="qg-skill-xp">+{gained} XP</span>
      </div>
      <ul className="qg-recap-list">
        {day.recap.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
      <button className="qg-btn qg-btn-primary" onClick={onFinish}>
        {isLastContent ? 'Back to the map' : 'Next day →'}
      </button>
    </div>
  );
}

/* ── Skill toast (shown briefly on the map after finishing) ────── */
export function SkillToast({ label }: { label: string }) {
  return (
    <div className="qg-toast">
      <span className="qg-skill-star">★</span> Skill unlocked: <strong>{label}</strong>
    </div>
  );
}
