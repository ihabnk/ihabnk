# Bit as a Rive character

The game renders Bit through `Bit.tsx`, which uses the rich **Rive** character
when `public/bit.riv` exists and otherwise falls back to the hand-built SVG
(`MentorAvatar.tsx`). Nothing breaks without the asset — adding it is a pure
upgrade.

## How to make it live

1. Design **Bit** in the [Rive editor](https://rive.app) (reuse the SVG look:
   flat amber square body, single white eye, sparkle).
2. Add a **State Machine named exactly `Bit`**.
3. Add **one Number input named exactly `state`**, and wire transitions for
   these values:

   | value | meaning    | when it fires                                  |
   |------:|------------|------------------------------------------------|
   | 0     | idle       | resting / between moments                      |
   | 1     | speaking   | mentor brief, narration, mid-dialogue          |
   | 2     | thinking   | during an interactive task (hint state)        |
   | 3     | happy      | a strong answer / day recap                    |
   | 4     | concerned  | a weaker answer (caution)                       |
   | 5     | celebrate  | milestone / celebration                        |

   (The JS→value mapping lives in `RiveBit.tsx → STATE_INDEX`.)

4. **Export** as a runtime `.riv` and drop it at **`public/bit.riv`**.

That's it. On next load, `Bit.tsx` detects the file and swaps the SVG for the
animated character; the Rive runtime chunk (~40 kb) is only fetched when the
asset is present.

## Notes
- The canvas is sized from the `size` prop and respects device pixel ratio via
  `resizeDrawingSurfaceToCanvas()`.
- Keep the SVG `MentorAvatar` — it's the guaranteed fallback and the reduced-
  motion / no-JS baseline.
