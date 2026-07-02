import { useEffect, useRef } from 'react';
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas';
import type { MentorState } from './types';

/**
 * Rive-powered Bit. Loads /bit.riv and drives a state-machine number input
 * from the game's MentorState so the character animates its own transitions.
 *
 * Contract for bit.riv (see bit-rive-guide.md):
 *   - state machine named "Bit"
 *   - Number input named "state": 0 idle · 1 speaking · 2 thinking ·
 *     3 happy · 4 concerned · 5 celebrate
 */
const STATE_INDEX: Record<MentorState, number> = {
  idle: 0, welcome: 1, speaking: 1, hint: 2,
  success: 3, recap: 3, concern: 4, caution: 4, celebrate: 5,
};

export default function RiveBit({ state, size = 96 }: { state: MentorState; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<{ value: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const r = new Rive({
      src: '/bit.riv',
      canvas: canvasRef.current,
      autoplay: true,
      stateMachines: 'Bit',
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        r.resizeDrawingSurfaceToCanvas();
        const inputs = r.stateMachineInputs('Bit') ?? [];
        inputRef.current = (inputs.find((i) => i.name === 'state') as unknown as { value: number }) ?? null;
        if (inputRef.current) inputRef.current.value = STATE_INDEX[state] ?? 0;
      },
    });
    return () => { try { r.cleanup(); } catch { /* noop */ } };
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = STATE_INDEX[state] ?? 0;
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={Math.round(size * 1.05)}
      style={{ width: size, height: Math.round(size * 1.05) }}
      aria-hidden="true"
    />
  );
}
