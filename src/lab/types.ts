/** Shared types for the QA Lab ("real tools, simulated"). */

export interface Mission {
  id: string;
  title: string;
  /** What the player must do, in second person. May reference exact commands/URLs. */
  brief: string;
  hint: string;
  /** The takeaway, shown once the mission passes. */
  learn: string;
}

export interface ToolMeta {
  id: string;
  name: string;
  tagline: string;
  /** Small mono glyph shown on the hub card. */
  glyph: string;
}

export interface LabProgress {
  /** toolId -> completed mission ids */
  done: Record<string, string[]>;
}
