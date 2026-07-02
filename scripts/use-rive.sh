#!/usr/bin/env bash
# Copy a Rive export into the project so Bit uses it.
#
# Usage:
#   npm run use-rive                 # grabs the newest *.riv in ~/Downloads
#   npm run use-rive -- /path/to.riv # or pass an explicit file
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-}"

if [ -z "$SRC" ]; then
  SRC="$(ls -t "$HOME/Downloads"/*.riv 2>/dev/null | head -1 || true)"
fi

if [ -z "$SRC" ] || [ ! -f "$SRC" ]; then
  echo "✗ No .riv found."
  echo "  Export one from Rive (File → Export → Runtime .riv), then run:"
  echo "    npm run use-rive -- /path/to/Bit.riv"
  echo "  …or drop it in ~/Downloads and just run:  npm run use-rive"
  exit 1
fi

mkdir -p "$ROOT/public"
cp "$SRC" "$ROOT/public/bit.riv"
echo "✓ Copied: $SRC"
echo "        → $ROOT/public/bit.riv"
echo "Reload the game. Bit uses the Rive character when the state machine is named 'Bit'."
