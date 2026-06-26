import { useCallback, useEffect, useState } from 'react';
import type { GameProgress } from './types';

const KEY = 'qa-onboarding-v1';
const INITIAL: GameProgress = { completedDays: [], confidence: 0, streak: 0, skills: [] };

function load(): GameProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...INITIAL, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return INITIAL;
}

/** Persistent progress (completed days, confidence/XP, streak, unlocked skills). */
export function useGame() {
  const [progress, setProgress] = useState<GameProgress>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => { setProgress(load()); setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress, hydrated]);

  const completeDay = useCallback((n: number, gained: number, skillId: string) => {
    setProgress((p) => {
      if (p.completedDays.includes(n)) return p; // idempotent — replaying doesn't double-count
      return {
        completedDays: [...p.completedDays, n].sort((a, b) => a - b),
        confidence: p.confidence + gained,
        streak: p.streak + 1,
        skills: p.skills.includes(skillId) ? p.skills : [...p.skills, skillId],
        lastPlayedISO: new Date().toISOString(),
      };
    });
  }, []);

  const reset = useCallback(() => setProgress(INITIAL), []);

  const isUnlocked = useCallback(
    (n: number) => n === 1 || progress.completedDays.includes(n - 1),
    [progress.completedDays],
  );
  const isDone = useCallback((n: number) => progress.completedDays.includes(n), [progress.completedDays]);

  return { progress, hydrated, completeDay, reset, isUnlocked, isDone };
}
