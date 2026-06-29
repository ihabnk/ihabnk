import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion';
import './onboarding.css';
import { DAYS, getDay } from '../data/onboarding';
import { useGame } from './useGame';
import type { Day, MentorState } from './types';
import Bit from './Bit';
import DayMap from './DayMap';
import Day1Scene from './Day1Scene';
import { GameHUD, DayIntroCard, MentorBeat, NarrationCard, ChoiceScene, TaskScene, DialogueScene, SquadReveal, DayRecapCard, DayProgress, SkillToast } from './panels';

const CAPTION: Record<MentorState, string> = {
  idle: 'Take your time.',
  welcome: "Let's get started.",
  speaking: 'Here’s the brief…',
  hint: 'Give it a try.',
  success: 'Nice — strong call.',
  concern: 'Hmm — let’s rethink that.',
  caution: 'Not quite — worth another look.',
  recap: 'Great progress today.',
  celebrate: 'That’s the way!',
};

const hasContent = (n: number) => DAYS.some((d) => d.n === n);

export default function OnboardingGame() {
  const { progress, hydrated, completeDay, meet, isUnlocked, isDone } = useGame();

  // Deep-link support: ?day=N (&step=K&pick=I) opens a day on first paint
  // (resume / share / preview) — avoids a map→day transition flash.
  const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  const dlDay = (() => { const n = Number.parseInt(params.get('day') ?? '', 10); return !Number.isNaN(n) && hasContent(n) ? n : null; })();

  const [activeDay, setActiveDay] = useState<number | null>(dlDay);
  const [mentor, setMentor] = useState<MentorState>('idle');
  const [mentorLine, setMentorLine] = useState<string | null>(null);
  const handleMentor = useCallback((s: MentorState, line?: string) => { setMentor(s); setMentorLine(line ?? null); }, []);
  const [toast, setToast] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const [startStep] = useState(() => Number.parseInt(params.get('step') ?? '0', 10) || 0);
  const [startPick] = useState<number | null>(() => { const p = params.get('pick'); return p != null ? Number.parseInt(p, 10) : null; });

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
    window.setTimeout(() => setToast(null), 3400);
    if (hasContent(d.n + 1) && (d.n + 1 === 1 || true)) setActiveDay(d.n + 1);
    else setActiveDay(null);
  };

  const transition = reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionConfig reducedMotion="user">
    <div className="qg-root">
      <GameHUD
        dayN={day?.n ?? current}
        week={(day ?? getDay(current))?.weekTitle}
        confidence={progress.confidence}
        met={progress.met.length}
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
                <Bit state="welcome" size={104} />
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
                <Bit state={mentor} size={96} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mentorLine ?? mentor}
                    className="qg-bubble"
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mentorLine ?? CAPTION[mentor]}
                  </motion.div>
                </AnimatePresence>
              </aside>
              <div className="qg-scene-col">
                <DayPlayer
                  key={day.n}
                  day={day}
                  startStep={startStep}
                  startPick={startPick}
                  onMentor={handleMentor}
                  onMeet={meet}
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
    </MotionConfig>
  );
}

/* ── Per-day scene flow ────────────────────────────────────────── */
type Stage = 'intro' | 'scene' | 'recap';

function DayPlayer({
  day, startStep = 0, startPick = null, onMentor, onMeet, onExit, onComplete, transition,
}: {
  day: Day;
  startStep?: number;
  startPick?: number | null;
  onMentor: (s: MentorState, line?: string) => void;
  onMeet: (id: string) => void;
  onExit: () => void;
  onComplete: (gained: number) => void;
  transition: { duration: number; ease?: readonly number[] };
}) {
  const startIdx = startStep > 0 ? Math.min(startStep - 1, day.scenes.length - 1) : 0;
  const seeded = startStep > 0 && startPick != null;
  const seededScene = day.scenes[startIdx];
  const [stage, setStage] = useState<Stage>(startStep > 0 ? 'scene' : 'intro');
  const [sceneIdx, setSceneIdx] = useState(startIdx);
  const [picked, setPicked] = useState<Record<number, number>>(seeded ? { [startIdx]: startPick! } : {});
  const [taskDone, setTaskDone] = useState<Record<number, boolean>>({});
  const [gained, setGained] = useState(
    seeded && seededScene?.kind === 'choice' ? (seededScene.options[startPick!]?.confidence ?? 0) : 0,
  );

  const scene = day.scenes[sceneIdx];
  const lastContentDay = day.n + 1 > Math.max(...DAYS.map((d) => d.n));

  // Drive the mentor's expression from the current stage/scene. Tasks own
  // their own success/caution on resolve (so we don't override them here).
  useEffect(() => {
    if (stage === 'intro') return onMentor('welcome');
    if (stage === 'recap') return onMentor('recap');
    if (!scene) return;
    if (scene.kind === 'mentor') return onMentor(scene.mentor ?? 'speaking');
    if (scene.kind === 'narration' || scene.kind === 'opening') return onMentor('speaking');
    if (scene.kind === 'squad') return onMentor('recap');
    if (scene.kind === 'dialogue') { if (!taskDone[sceneIdx]) onMentor('speaking'); return; }
    if (scene.kind === 'task') { if (!taskDone[sceneIdx]) onMentor('hint'); return; }
    const p = picked[sceneIdx];
    if (p === undefined) return onMentor('idle');
    onMentor(scene.kind === 'choice' && scene.options[p].best ? 'success' : 'caution');
  }, [stage, sceneIdx, picked, taskDone, scene, onMentor, day]);

  const resolveTask = (g: number) => {
    if (taskDone[sceneIdx]) return;
    setTaskDone((m) => ({ ...m, [sceneIdx]: true }));
    setGained((x) => x + g);
  };

  const advance = () => {
    if (sceneIdx + 1 < day.scenes.length) setSceneIdx((i) => i + 1);
    else setStage('recap');
  };

  const pick = (i: number) => {
    if (picked[sceneIdx] !== undefined || scene.kind !== 'choice') return;
    setPicked((m) => ({ ...m, [sceneIdx]: i }));
    setGained((g) => g + scene.options[i].confidence);
  };

  const hintText = scene && (scene.kind === 'choice' || scene.kind === 'task') ? scene.hint : undefined;
  const showHint = () => { if (hintText) onMentor('hint', hintText); };

  const sceneKey = `${stage}-${sceneIdx}-${picked[sceneIdx] ?? 'x'}`;

  return (
    <>
      {stage !== 'intro' && <DayProgress scenes={day.scenes} stage={stage} sceneIdx={sceneIdx} />}
      <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={transition}
      >
        {stage === 'intro' && (
          <DayIntroCard day={day} onBack={onExit} onStart={() => { setStage('scene'); setSceneIdx(0); }} />
        )}

        {stage === 'scene' && scene?.kind === 'mentor' && (
          <MentorBeat text={scene.text} onContinue={advance} />
        )}

        {stage === 'scene' && scene?.kind === 'opening' && (
          <Day1Scene text={scene.text} onContinue={advance} />
        )}

        {stage === 'scene' && scene?.kind === 'narration' && (
          <NarrationCard text={scene.text} onContinue={advance} />
        )}

        {stage === 'scene' && scene?.kind === 'squad' && (
          <SquadReveal text={scene.text} caption={scene.caption} onContinue={advance} />
        )}

        {stage === 'scene' && scene?.kind === 'dialogue' && (
          <DialogueScene scene={scene} onMentor={onMentor} onMeet={onMeet}
            onResolve={resolveTask} onContinue={advance} isLast={sceneIdx + 1 >= day.scenes.length} />
        )}

        {stage === 'scene' && scene?.kind === 'task' && (
          <TaskScene dayN={day.n} task={scene} onMentor={onMentor} onResolve={resolveTask} onContinue={advance}
            onHint={hintText ? showHint : undefined} />
        )}

        {stage === 'scene' && scene?.kind === 'choice' && (
          <ChoiceScene
            dayN={day.n}
            prompt={scene.prompt}
            subtitle={scene.subtitle}
            options={scene.options}
            picked={picked[sceneIdx] ?? null}
            onPick={pick}
            onContinue={advance}
            isLast={sceneIdx + 1 >= day.scenes.length}
            hasHint={!!hintText}
            onHint={showHint}
          />
        )}

        {stage === 'recap' && (
          <DayRecapCard day={day} isLastContent={lastContentDay} onFinish={() => onComplete(gained)} />
        )}
      </motion.div>
    </AnimatePresence>
    </>
  );
}
