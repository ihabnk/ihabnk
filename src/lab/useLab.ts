import { useCallback, useEffect, useState } from 'react';
import type { LabProgress } from './types';

const KEY = 'qa-lab-v1';
const INITIAL: LabProgress = { done: {} };

function load(): LabProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...INITIAL, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return INITIAL;
}

/** Persistent lab progress: which missions are done in each tool. */
export function useLab() {
  const [progress, setProgress] = useState<LabProgress>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setProgress(load()); setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress, hydrated]);

  const complete = useCallback((tool: string, mission: string) => {
    setProgress((p) => {
      const list = p.done[tool] ?? [];
      if (list.includes(mission)) return p;
      return { done: { ...p.done, [tool]: [...list, mission] } };
    });
  }, []);

  const doneIn = useCallback((tool: string) => progress.done[tool] ?? [], [progress.done]);

  return { progress, hydrated, complete, doneIn };
}
