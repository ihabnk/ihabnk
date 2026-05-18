const WORDS_PER_MINUTE = 220;

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function readingTimeLabel(body: string): string {
  return `${readingTime(body)} min read`;
}
