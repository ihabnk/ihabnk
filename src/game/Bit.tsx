import { Suspense, lazy, useEffect, useState } from 'react';
import MentorAvatar from './MentorAvatar';
import type { MentorState } from './types';

/**
 * Bit. Renders the Rive character when `public/bit.riv` exists and the browser
 * allows motion; otherwise the hand-built SVG MentorAvatar (reduced-motion /
 * no asset / SSR). Drop a bit.riv in (see `npm run use-rive`) and it upgrades
 * automatically — the Rive runtime chunk is only fetched when the asset exists.
 */
const RiveBit = lazy(() => import('./RiveBit'));
let rivePresent: boolean | null = null;

export default function Bit({ state, size = 96 }: { state: MentorState; size?: number }) {
  const [hasRive, setHasRive] = useState<boolean | null>(rivePresent);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setHasRive(false); return; }
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
