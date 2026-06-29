import { Suspense, lazy, useEffect, useState } from 'react';
import OpeningScene from './OpeningScene';

/**
 * Day 1 cold-open. Plays a Lottie animation if `public/scenes/day1.lottie`
 * exists, otherwise the GSAP-driven SVG OpeningScene. Drop a .lottie in to
 * upgrade — the player chunk is only fetched when the asset is present.
 *
 * (To author one: export a .lottie from After Effects / LottieFiles to
 *  public/scenes/day1.lottie. Nothing else changes.)
 */
const LottieScene = lazy(() => import('./LottieScene'));
const SRC = '/scenes/day1.lottie';
let present: boolean | null = null;

export default function Day1Scene({ text, onContinue }: { text: string; onContinue: () => void }) {
  const [has, setHas] = useState<boolean | null>(present);

  useEffect(() => {
    if (present !== null) { setHas(present); return; }
    let alive = true;
    fetch(SRC, { method: 'HEAD' })
      .then((r) => { present = r.ok; if (alive) setHas(r.ok); })
      .catch(() => { present = false; if (alive) setHas(false); });
    return () => { alive = false; };
  }, []);

  if (has) {
    return (
      <div className="qg-card qg-opening">
        <div className="qg-op-stage">
          <Suspense fallback={null}><LottieScene src={SRC} /></Suspense>
        </div>
        <p className="qg-narration-text">{text}</p>
        <button className="qg-btn qg-btn-primary" onClick={onContinue}>Take a breath →</button>
      </div>
    );
  }
  return <OpeningScene text={text} onContinue={onContinue} />;
}
