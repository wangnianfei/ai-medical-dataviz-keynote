#!/usr/bin/env python3
"""Static pre-flight auditor for Slides-as-Code HTML keynotes.

Checks:
  1. Total <section class="slide"> count
  2. All <img src="..."> resolve to existing files on disk
  3. Zero inline font-size declarations below 21px (~16pt floor)
  4. Zero hardcoded local machine paths (/Users/..., C:\\...)
  5. Optional JS syntax check via `node --check` if deck.js sits alongside index.html
"""

import pathlib
import re
import shutil
import subprocess
import sys


def audit(html_path: pathlib.Path) -> int:
    if not html_path.exists():
        print(f"[ERROR] File not found: {html_path}")
        return 1

    html = html_path.read_text(encoding="utf-8")
    base_dir = html_path.parent

    # 1. Slide count
    slides = re.findall(r'<section[^>]*class="[^"]*\bslide\b[^"]*"', html)

    # 2. Image resolution
    img_srcs = sorted(set(re.findall(r'<img[^>]+src="([^"]+)"', html)))
    missing_imgs = []
    for src in img_srcs:
        if src.startswith(("http://", "https://", "data:")):
            continue
        resolved = (base_dir / src).resolve()
        if not resolved.exists():
            missing_imgs.append(src)

    # 3. Inline small fonts (< 21px) inside slide sections
    small_fonts = []
    for m in re.finditer(r'font-size\s*:\s*([0-9.]+)\s*px', html):
        val = float(m.group(1))
        if val < 21.0:
            line_no = html[: m.start()].count("\n") + 1
            small_fonts.append((line_no, val))
    for m in re.finditer(r'font-size="([0-9.]+)"', html):
        val = float(m.group(1))
        if val < 21.0:
            line_no = html[: m.start()].count("\n") + 1
            small_fonts.append((line_no, val))

    # 4. Hardcoded local paths
    local_paths = re.findall(r'(/Users/[^\s"\'<>]+|C:\\\\[^\s"\'<>]+)', html)

    # 5. Companion deck.js syntax check
    js_path = base_dir / "deck.js"
    js_status = "skipped (deck.js not found)"
    js_failed = False
    if js_path.exists():
        if shutil.which("node"):
            proc = subprocess.run(["node", "--check", str(js_path)], capture_output=True, text=True)
            if proc.returncode == 0:
                js_status = "OK"
            else:
                js_status = f"FAIL: {proc.stderr.strip()}"
                js_failed = True
        else:
            js_status = "skipped (node not installed)"

    print(f"Deck        : {html_path}")
    print(f"Slides      : {len(slides)}")
    print(f"Unique imgs : {len(img_srcs)}")
    print(f"Missing imgs: {missing_imgs}")
    print(f"Small fonts : {small_fonts}")
    print(f"Local paths : {local_paths}")
    print(f"deck.js     : {js_status}")

    failed = bool(missing_imgs or small_fonts or local_paths or js_failed or len(slides) == 0)
    print("\nRESULT:", "FAILED" if failed else "PASSED")
    return 1 if failed else 0


if __name__ == "__main__":
    target = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path("slides/index.html")
    sys.exit(audit(target))
