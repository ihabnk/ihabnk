import { character } from './cast';

/** A clean monogram portrait for a colleague — editorial, not cartoonish. */
export default function CharacterPortrait({ id, size = 56 }: { id: string; size?: number }) {
  const c = character(id);
  return (
    <span
      className="qg-portrait"
      style={{ width: size, height: size, background: c.color, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {c.name.slice(0, 1)}
    </span>
  );
}
