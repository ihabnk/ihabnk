/** Shared types for the QA onboarding game ("The First 30 Days"). */

export type MentorState =
  | 'idle' | 'welcome' | 'speaking' | 'hint' | 'success' | 'concern' | 'caution' | 'recap' | 'celebrate';

export interface TaskItem {
  label: string;
  /** explore: short note revealed on tap. */
  note?: string;
  /** select: whether this belongs in the correct set. */
  correct?: boolean;
}

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
  | {
      kind: 'task';
      /** explore = tap to reveal; select = tap all that apply; order = sequence. */
      variant: 'explore' | 'select' | 'order';
      prompt: string;
      subtitle?: string;
      /** For `order`, author items in the CORRECT order (they’re shuffled in UI). */
      items: TaskItem[];
      /** explore: how many items must be opened to proceed (defaults to all). */
      minReveal?: number;
      /** XP awarded on completing the task (select/order scale by correctness). */
      xp: number;
      /** Mentor line shown once the task is done. */
      done: string;
      /** Optional on-demand hint the mentor can offer. */
      hint?: string;
    }
  | { kind: 'choice'; prompt: string; subtitle?: string; options: Choice[]; hint?: string }
  | {
      kind: 'dialogue';
      /** cast id of the colleague speaking. */
      speaker: string;
      /** what they say to you. */
      line: string;
      /** how you can reply (conversational, not a quiz). */
      replies: Reply[];
      /** the takeaway the moment teaches. */
      learn?: string;
    }
  | { kind: 'narration'; text: string };

export interface Reply {
  text: string;
  /** the colleague's response to your reply. */
  reply: string;
  /** the most professional / instinctive reply. */
  best?: boolean;
  /** a beat about how it landed (relationship/tone), shown subtly. */
  note?: string;
}

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
  /** Hidden growth value — never shown as a number; drives the felt word. */
  confidence: number;
  streak: number;
  skills: string[];
  /** cast ids of colleagues you've met. */
  met: string[];
  lastPlayedISO?: string;
}

export const TOTAL_DAYS = 30;

/** A felt confidence state — words, not points. */
export const confidenceWord = (v: number): string =>
  v < 15 ? 'Nervous' : v < 45 ? 'Finding your feet' : v < 90 ? 'Settling in' : v < 150 ? 'Steady' : 'Trusted';

/** 1–5 pips for the quiet confidence meter. */
export const confidenceLevel = (v: number): number =>
  v < 15 ? 1 : v < 45 ? 2 : v < 90 ? 3 : v < 150 ? 4 : 5;
