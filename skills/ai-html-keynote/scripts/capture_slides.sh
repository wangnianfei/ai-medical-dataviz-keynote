#!/usr/bin/env bash
# Capture 1280x720 Headless Chrome QA screenshots for specified slide numbers.
# Usage:
#   bash capture_slides.sh <path/to/slides/index.html> <output_dir> <slide_num1> [slide_num2 ...]
# Example:
#   bash capture_slides.sh slides/index.html qa_shots 1 16 17 20 34 38

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <slides/index.html> <output_dir> <slide_num> [slide_num ...]" >&2
  exit 1
fi

HTML_PATH="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
OUT_DIR="$2"
shift 2

mkdir -p "$OUT_DIR"

# Locate Chrome / Chromium binary
CHROME_BIN=""
for candidate in \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "$(command -v google-chrome 2>/dev/null || true)" \
  "$(command -v chromium 2>/dev/null || true)"; do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    CHROME_BIN="$candidate"
    break
  fi
done

if [ -z "$CHROME_BIN" ]; then
  echo "[ERROR] Google Chrome / Chromium not found." >&2
  exit 1
fi

for n in "$@"; do
  out_file="$OUT_DIR/slide_$(printf "%02d" "$n").png"
  "$CHROME_BIN" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --window-size=1280,720 \
    --virtual-time-budget=1200 \
    --screenshot="$out_file" \
    "file://${HTML_PATH}#${n}" >/dev/null 2>&1
  echo "Captured slide ${n} -> ${out_file}"
done
