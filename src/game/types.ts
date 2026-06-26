/** Shared types for the QA onboarding game ("The First 30 Days"). */

export type MentorState =
  | 'idle' | 'welcome' | 'hint' | 'success' | 'concern' | 'celebrate';

export interface Skill {
  id: string;
  label: string;
}

export interface Choice {
  text: string;
  /** The strongest answer (drives the "success" mentor + biggest confidence). */
  best?: boolean;
  /** Confidence (XP) awarded for this pick. Always >= 0 — beginner-friendly. */
  confidence: number;
  feedback: string;
}

export type Scene =
  | { kind: 'mentor'; text: string; mentor?: MentorState }
  | { kind: 'choice'; prompt: string; subtitle?: string; options: Choice[] };

export interface Day {
  n: number;
  week: number;
  weekTitle: string;
  title: string;
  goal: string;
  skill: Skill;
  intro: string;
  scenes: Scene[];
  recap: string[];
}

export interface GameProgress {
  completedDays: number[];
  confidence: number;
  streak: number;
  skills: string[];
  lastPlayedISO?: string;
}

export const TOTAL_DAYS = 30;
