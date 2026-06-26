import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './onboarding.css';
import { DAYS, getDay } from '../data/onboarding';
import { useGame } from './useGame';
import type { Day, MentorState } from './types';
import MentorAvatar from './MentorAvatar';
import DayMap from './DayMap';
import { GameHUD, DayIntroCard, MentorBeat, ChoiceScene, DayRecapCard, SkillToast } from './panels';

const CAPTION: Record<MentorState, string> = {
  idle: 'Take your time.',
  welcome: "Let's get started.",
  hint: 'Here’s a nudge…',
  success: 'Nice — strong call.',
  concern: 'Hmm — let’s rethink that.',
  celebrate: 'That’s the way!',
};

const hasContent = (n: number) => DAYS.some((d) => d.n === n);

export default function OnboardingGame() {
  const { progress, hydrated, completeDay, isUnlocked, isDone } = useGame();
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [mentor, setMentor] = useState<MentorState>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const [startStep, setStartStep] = useState(0); // deep-link: 0=intro, k=scene index k-1

  // Deep-link support: ?day=N (&step=K) opens a day directly (resume / share / preview).
  useEffect(() => {
    if (!hydrated) return;
    const q = new URLSearchParams(location.search);
    const n = Number.parseInt(q.get('day') ?? '', 10);
    if (!Number.isNaN(n) && hasContent(n)) {
      setStartStep(Number.parseInt(q.get('step') ?? '0', 10) || 0);
      setActiveDay(n);
    }
  }, [hydrated]);

  const day = activeDay ? getDay(activeDay) : null;
  const current = useMemo(() => {
    for (let n = 1; n <= DAYS.length; n++) if (!isDone(n)) return n;
    return DAYS.length;
  }, [isDone, progress.completedDays]);

  useEffect(() => { if (!activeDay) setMentor('idle'); }, [activeDay]);

  const enterDay = (n: number) => { if (hasContent(n) && isUnlocked(n)) { setToast(null); setActiveDay(n); } };

  const finishDay = (d: Day, gained: number) => {
    completeDay(d.n, gained, d.skill.id);
    setToast(d.skill.label);
    window.setTimeout(() => setToast(null), 3200);
    if (hasContent(d.n + 1) && (d.n + 1 === 1 || true)) setActiveDay(d.n + 1);
    else setActiveDay(null);
  };

  const transition = reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="qg-root">
      <GameHUD
        completed={progress.completedDays.length}
        confidence={progress.confidence}
        streak={progress.streak}
        skills={progress.skills.length}
      />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <SkillToast label={toast} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!day ? (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
            <div className="qg-mapwrap">
              <div className="qg-mapintro">
                <MentorAvatar state="welcome" size={104} />
                <div>
                  <span className="qg-kicker">The First 30 Days</span>
                  <h1 className="qg-h1">Learn to think like a tester — one workday at a time.</h1>
                  <p className="qg-lead">
                    You’ve just joined Northwind as a junior quality engineer. Over your first 30 days,
                    Bit will guide you through real onboarding scenarios that build the QA mindset.
                  </p>
                  <button className="qg-btn qg-btn-primary" onClick={() => enterDay(current)} disabled={!hydrated}>
                    {progress.completedDays.length === 0 ? 'Start Day 1' : `Continue — Day ${current}`}
                  </button>
                </div>
              </div>
              <DayMap isUnlocked={isUnlocked} isDone={isDone} onPick={enterDay} />
            </div>
          </motion.div>
        ) : (
          <motion.div key={`day-${day.n}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition}>
            <div className="qg-stage">
              <aside className="qg-rail">
                <MentorAvatar state={mentor} size={96} />
                <span className="qg-caption">{CAPTION[mentor]}</span>
              </aside>
              <div className="qg-scene-col">
                <DayPlayer
                  key={day.n}
                  day={day}
                  startStep={startStep}
                  onMentor={setMentor}
                  onExit={() => setActiveDay(null)}
                  onComplete={(gained) => finishDay(day, gained)}
                  transition={transition}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Per-day scene flow ────────────────────────────────────────── */
type Stage = 'intro' | 'scene' | 'recap';

function DayPlayer({
  day, startStep = 0, onMentor, onExit, onComplete, transition,
}: {
  day: Day;
  startStep?: number;
  onMentor: (s: MentorState) => void;
  onExit: () => void;
  onComplete: (gained: number) => void;
  transition: { duration: number; ease?: readonly number[] };
}) {
  const [stage, setStage] = useState<Stage>(startStep > 0 ? 'scene' : 'intro');
  const [sceneIdx, setSceneIdx] = useState(startStep > 0 ? Math.min(startStep - 1, day.scenes.length - 1) : 0);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [gained, setGained] = useState(0);

  const scene = day.scenes[sceneIdx];
  const lastContentDay = day.n + 1 > Math.max(...DAYS.map((d) => d.n));

  // Drive the mentor's expression from the current stage/scene.
  useEffect(() => {
    if (stage === 'intro') return onMentor('welcome');
    if (stage === 'recap') return onMentor('celebrate');
    if (!scene) return;
    if (scene.kind === 'mentor') return onMentor(scene.mentor ?? 'hint');
    const p = picked[sceneIdx];
    if (p === undefined) return onMentor('idle');
    onMentor(day.scenes[sceneIdx].kind === 'choice' && (day.scenes[sceneIdx] as any).options[p].best ? 'success' : 'concern');
  }, [stage, sceneIdx, picked, scene, onMentor, day]);

  const advance = () => {
    if (sceneIdx + 1 < day.scenes.length) setSceneIdx((i) => i + 1);
    else setStage('recap');
  };

  const pick = (i: number) => {
    if (picked[sceneIdx] !== undefined || scene.kind !== 'choice') return;
    setPicked((m) => ({ ...m, [sceneIdx]: i }));
    setGained((g) => g + scene.options[i].confidence);
  };

  const sceneKey = `${stage}-${sceneIdx}-${picked[sceneIdx] ?? 'x'}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={transition}
      >
        {stage === 'intro' && (
          <DayIntroCard day={day} onBack={onExit} onStart={() => { setStage('scene'); setSceneIdx(0); }} />
        )}

        {stage === 'scene' && scene?.kind === 'mentor' && (
          <MentorBeat text={scene.text} onContinue={advance} />
        )}

        {stage === 'scene' && scene?.kind === 'choice' && (
          <ChoiceScene
            prompt={scene.prompt}
            subtitle={scene.subtitle}
            options={scene.options}
            picked={picked[sceneIdx] ?? null}
            onPick={pick}
            onContinue={advance}
            isLast={sceneIdx + 1 >= day.scenes.length}
          />
        )}

        {stage === 'recap' && (
          <DayRecapCard day={day} gained={gained} isLastContent={lastContentDay} onFinish={() => onComplete(gained)} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
