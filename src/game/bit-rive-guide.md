# Using your Rive Bit

Bit renders the Rive character when `public/bit.riv` exists; otherwise the SVG
fallback. Drop your export in and it upgrades automatically — no code changes.

## 1. Build it in the Rive editor to this contract (names are case-sensitive)
- **State machine** named exactly **`Bit`**
- One **Number input** named exactly **`state`**, with transitions for:

| value | state      |
|------:|------------|
| 0     | idle       |
| 1     | speaking   |
| 2     | thinking   |
| 3     | happy      |
| 4     | concerned  |
| 5     | celebrate  |

Artboard ~200×210, transparent background, Fit: Contain.

## 2. Export
Rive editor → **File → Export → Runtime (.riv)**.

## 3. Drop it into the project
```bash
# newest .riv in ~/Downloads:
npm run use-rive
# or an explicit path:
npm run use-rive -- ~/Downloads/Bit.riv
```
That copies it to `public/bit.riv`. Reload the game — Bit is now the Rive
character, reacting to each story moment via the `state` input.

> If the state machine isn't named `Bit` (or has no `state` input), the file
> still loads but won't react — rename them in the editor and re-export.
