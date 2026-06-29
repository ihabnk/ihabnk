# Bit — Designer Build Sheet (Rive)

**Bit** is the companion/mentor character in *The Tester* onboarding game. This
sheet is everything a motion designer needs to build Bit in **Rive** so the
exported file drops into the live integration and "just works."

> Tooling: build in the **Rive editor** (rive.app — free). Export a **runtime
> `.riv`**. Rive is required for Bit (not Lottie) because Bit must *react* to
> game state in real time via a **state machine**. Lottie is for non-interactive
> set-pieces (scenes), not the character.

The code is already wired (`RiveBit.tsx`, `Bit.tsx`). Until the asset exists,
the game uses a hand-built SVG fallback — so nothing is blocked; this is a
pure upgrade.

---

## 1. The contract (must match exactly — case-sensitive)

These names/values are read by the code. If they don't match, Bit won't animate.

| Thing | Value |
|---|---|
| File name | **`bit.riv`** |
| Placed at | **`/public/bit.riv`** (served as `/bit.riv`) |
| State machine name | **`Bit`** |
| Input | **one Number input named `state`** |

### `state` values → what they mean
The game sets `state` to a number. Several game moments share a number, so you
build **6 visual states (0–5)**:

| `state` | Build this state | Fires in-game when… |
|--:|---|---|
| **0** | **Idle** | resting / waiting for the player |
| **1** | **Speaking** | mentor brief, narration, mid-dialogue |
| **2** | **Thinking** | the player is mid-task (a nudge/hint) |
| **3** | **Happy** | a strong answer, or the day's recap |
| **4** | **Concerned** | a weaker answer (gentle, not scary) |
| **5** | **Celebrate** | a milestone / celebration |

(Reference: `RiveBit.tsx → STATE_INDEX`.)

---

## 2. The look (match the existing Bit)

Bit is a **flat, friendly square character** — a rounded-square amber body with
**one large white eye** and a small sparkle. Reference art lives in
`src/components/Avatar.astro` / `MentorAvatar.tsx` (open in browser to see it).

**Shapes**
- **Body:** rounded square (corner radius ≈ 22 % of width). Single solid fill.
- **Eye:** one large white rounded ellipse, roughly centred-upper.
- **Pupil:** a dark rounded dot inside the eye (this moves — see Idle/Thinking).
- **Glint:** tiny white highlight on the pupil.
- **Sparkle:** a 4-point star floating near the top-right (Bit's signature).
- **Mouth:** simple line/arc; only appears in Happy/Celebrate/Concerned.

**Palette** (bake these hexes — Rive can't read the site's CSS variables):

| Part | Hex | Notes |
|---|---|---|
| Body | `#DD8E22` | warm amber; reads on both light & dark site backgrounds |
| Body top sheen (optional) | `#F0B25A` | subtle top-lighter gradient stop |
| Outline | `#3D2F1E` | flat 2–3 px ink outline |
| Eye (white) | `#FFFFFF` | |
| Pupil / mouth | `#1A0E00` | near-black warm |
| Sparkle | `#FFE2C2` | light amber |

> **Important — no theme-flipping shadow.** The SVG version uses a hard drop
> shadow that flips colour by theme; a baked `.riv` can't do that. **Skip the
> hard shadow**, or use a soft neutral one (`rgba(0,0,0,0.18)`) that works on
> any background. Keep the background **transparent**.

---

## 3. Artboard & export

- **Artboard:** square-ish, **200 × 210** (the code renders at ~1 : 1.05). Centre
  Bit with a little breathing room; sparkle may sit near the edge.
- **Background:** transparent.
- **Fit:** the runtime uses **Contain**, so design at any scale — it scales
  crisply. Keep strokes as real vector strokes.
- **Export:** **Runtime `.riv`** (not the editor file), include the **`Bit`**
  state machine. File → `public/bit.riv`.

---

## 4. State-by-state spec

Each state is reached by `state` changing to its number. Use the state machine's
transitions to **blend** between them (≈ 150–250 ms) so changes feel smooth, not
snappy. States 0–2 **loop**; 3–5 play a short reaction then settle into a loop.

| # | State | Emotion | Motion | Loop? | Feel |
|--:|---|---|---|---|---|
| 0 | **Idle** | calm, attentive | gentle vertical "breathing" (±2–3 px), slow; eye blinks every ~4 s; pupil drifts/looks around occasionally; sparkle twinkles | loop | relaxed, alive but quiet |
| 1 | **Speaking** | engaged | a soft "talking" bob/nod in rhythm; mouth not required (it's a square bot) but a subtle mouth flap is a nice touch; eye stays open | loop | "I'm telling you something" |
| 2 | **Thinking** | curious | pupil looks **up**; a slight head tilt/wobble; the sparkle can orbit the head slowly | loop | pondering, encouraging |
| 3 | **Happy** | warm approval | eye becomes a happy upward **arc** (^), a small mouth smile, one bright **bounce**, then settle to a content idle | one-shot → idle | "nice — good call" |
| 4 | **Concerned** | gentle, kind | pupil down slightly, a small mouth (flat/soft frown), a tiny side-to-side shake — **never alarmed** | one-shot → idle | "hmm, let's rethink" |
| 5 | **Celebrate** | joyful | happy arc eyes + grin, a bigger bounce, **sparkle burst** (extra sparkles pop), maybe confetti flecks | loop (short) | milestone! |

**Tone guardrails:** professional and warm, **not** childish or cartoonish.
Concerned should feel supportive, never angry. Keep motion subtle and premium —
small amplitudes, smooth easing (ease-in-out / a touch of spring on bounces).

---

## 5. Idle ambient layers (build into Idle, reuse elsewhere)
- **Blink:** quick eye scaleY → 0.1 → back, every 3.5–5 s (slightly random feels best).
- **Breathe:** whole body translateY ±2.5 px, ~2.4 s, ease-in-out.
- **Pupil life:** small look-around drift in Idle; **up** in Thinking; **down** in Concerned.
- **Sparkle:** continuous gentle scale/opacity twinkle; in Celebrate it bursts (extra instances).

---

## 6. Theme & contrast (read me)
- One baked palette must look good on **both** the site's light (cream `#F5EFE6`)
  and dark (espresso `#150F0B`) backgrounds. The amber body + ink outline above
  satisfies this — please sanity-check Bit on both.
- **Optional advanced:** if you want Bit's amber to match the site's per-theme
  accent exactly, expose a **Color input** (or two) on the state machine and tell
  us the input name — we can drive it from the theme. Not required.

---

## 7. Reduced motion
The app already swaps to a calm SVG under `prefers-reduced-motion`, so you don't
have to solve it in Rive. If easy, a low-energy variant is welcome but optional.

---

## 8. Acceptance checklist (how we'll verify)
- [ ] File is `bit.riv`, state machine is exactly **`Bit`**, with a Number input exactly **`state`**.
- [ ] Setting `state` to 0,1,2,3,4,5 visibly produces Idle / Speaking / Thinking / Happy / Concerned / Celebrate.
- [ ] Transitions between states blend smoothly (no hard pops).
- [ ] Idle loops cleanly (no jump at loop point); blink + breathe + sparkle present.
- [ ] Transparent background; looks right on cream **and** espresso.
- [ ] Crisp at ~64–110 px (where it renders) and scales up cleanly.
- [ ] Reasonable file size (aim < ~150 KB).

## 9. Handoff
Drop `bit.riv` into `public/`. On next load, `Bit.tsx` detects it and replaces
the SVG automatically — no code change. Send the file (or a preview link) and
we'll run it against the live states and confirm the mapping, then tune timings
if needed.

---

### Quick reference card (paste into Rive)
```
File:           bit.riv  →  /public/bit.riv
State machine:  Bit
Input:          state  (Number)
Values:         0 Idle · 1 Speaking · 2 Thinking · 3 Happy · 4 Concerned · 5 Celebrate
Body #DD8E22 · Outline #3D2F1E · Eye #FFFFFF · Pupil/Mouth #1A0E00 · Sparkle #FFE2C2
Artboard 200×210, transparent, Fit: Contain. Export runtime .riv.
```
