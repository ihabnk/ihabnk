import { Suspense, lazy, useEffect, useState } from 'react';
import MentorAvatar from './MentorAvatar';
import type { MentorState } from './types';

/**
 * Bit — the companion. Renders the rich Rive character if `public/bit.riv`
 * exists, otherwise the hand-built SVG MentorAvatar. Drop a bit.riv in and the
 * upgrade happens automatically; until then everything works on the SVG.
 *
 * The Rive runtime is only fetched (lazy chunk) when a .riv is actually present.
 */
const RiveBit = lazy(() => import('./RiveBit'));

// module-level cache so we only probe for the asset once per session
let rivePresent: boolean | null = null;

export default function Bit({ state, size = 96 }: { state: MentorState; size?: number }) {
  const [hasRive, setHasRive] = useState<boolean | null>(rivePresent);

  useEffect(() => {
    if (rivePresent !== null) { setHasRive(rivePresent); return; }
    let alive = true;
    fetch('/bit.riv', { method: 'HEAD' })
      .then((r) => { rivePresent = r.ok; if (alive) setHasRive(r.ok); })
      .catch(() => { rivePresent = false; if (alive) setHasRive(false); });
    return () => { alive = false; };
  }, []);

  if (hasRive) {
    return (
      <Suspense fallback={<MentorAvatar state={state} size={size} />}>
        <RiveBit state={state} size={size} />
      </Suspense>
    );
  }
  return <MentorAvatar state={state} size={size} />;
}
