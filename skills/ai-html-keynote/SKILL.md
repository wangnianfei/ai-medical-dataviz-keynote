---
name: ai-html-keynote
description: >-
  Design, engineer, and verify zero-dependency, interactive 16:9 HTML5 keynotes
  ("Slides-as-Code") to replace PowerPoint for scientific, medical, technical,
  and executive presentations. Use when creating a new HTML slide deck from
  scratch, converting an outline or paper into interactive browser slides,
  replacing static slides with live code-to-figure runners or SVG animations,
  or auditing/polishing an existing HTML presentation for publication-grade
  aesthetics and GitHub Pages deployment.
---

# AI HTML Keynote (Slides-as-Code)

Replace fragile binary `.pptx` files with version-controlled, offline-ready,
zero-dependency HTML5 / CSS3 / Vanilla JS presentations that combine editorial
aesthetics, reproducible R/Python figures, live interactive demonstrations, and
one-click GitHub Pages publishing.

## When to Load References

Use progressive disclosure — read only the reference needed for the current step:

- Typography, 16:9 canvas math, Warm Editorial palette, and layout geometry:
  [references/design-system.md](./references/design-system.md)
- Interactive simulators, Matrix code-to-figure runner, CSS/SVG animations, and
  presenter HUD:
  [references/interactive-patterns.md](./references/interactive-patterns.md)
- Automated static audit, Headless Chrome visual QA, and common bug traps:
  [references/qa-checklist.md](./references/qa-checklist.md)

---

## End-to-End 6-Stage Workflow

### Stage 1 — Repository & Narrative Architecture

Initialize every presentation as a self-contained, GitHub-ready project so data,
code, figures, slides, and speaker notes live together:

```text
<talk-repo>/
├── index.html             # Redirects root URL -> ./slides/index.html (GitHub Pages)
├── README.md              # Overview, controls, slide map, reproducibility commands
├── data/                  # Tidy CSV teaching / benchmark datasets
├── code/r/ (or python/)   # Reproducible figure scripts (300 DPI PNG + vector PDF)
├── assets/
│   ├── generated/         # Script outputs & bespoke AI editorial illustrations
│   ├── figures/           # High-res original scientific figures (kept in original language)
│   └── media/             # Portraits, lecture stills, reference captures
├── slides/
│   ├── index.html         # Single-file 16:9 semantic slide deck (<section class="slide">)
│   ├── styles.css         # Design tokens, scaling engine, animations, @media print
│   └── deck.js            # Navigation, #1..#N hash sync, Grid (G), Notes (N), widgets
└── docs/                  # Outline, verified links, asset manifest, methodology
```

**Narrative discipline**:
- Budget roughly **1 slide per minute** of speaking time.
- Separate **on-screen visual anchors** (concise scannable phrases, 60–75% visual
  area, ≤ 6–7 lines of text) from **spoken prose** (stored in each slide's
  `data-notes` attribute and viewed via the `N` speaker-notes drawer).

### Stage 2 — Visual Design System & Non-Negotiable Floors

Read [references/design-system.md](./references/design-system.md) before writing CSS:
1. **Centered 16:9 Logical Canvas (`1440×810`)**: Scale uniformly with
   `transform: scale(min(vw/1440, vh/810))` and flex-center inside `100vw × 100vh`
   so slides never clip on the right edge on any projector.
2. **Strict Typography Floor (`≥ 16pt` / `22px` minimum)**: Never render visible
   slide text below `22px` — including kickers, badges, buttons, captions,
   tables, and SVG labels. If something needs tiny text, cut it or move it to
   `data-notes`.
3. **Editorial Palette Discipline**: Default to a cohesive **Warm Editorial**
   palette (Warm Ivory `#F7F4EE`, Pure White `#FFFFFF` cards, Warm Obsidian
   `#1B1815` dark contrast slides, Deep Forest Pine `#1B5E55`, Terracotta
   `#C2412D`, Burnished Ochre `#B07219`) instead of generic corporate blue.

### Stage 3 — Dual-Track Asset Production

Never settle for blurry screenshots or generic clip art:
1. **Data-Driven Figures (Reproducible Code)**:
   - Write self-contained R (`ggplot2` + `ragg::agg_png(..., res = 300)` +
     `cairo_pdf`) or Python scripts with fixed seeds (`set.seed(...)`) and zero
     hardcoded machine-local paths.
   - Keep benchmark/top-journal figures in their **original high-resolution
     English**; do not destructively translate axes or labels.
   - Pull verified exemplars from local MCP libraries (e.g., `PlotCase`,
     `top-journal-figures`) when available.
2. **Concept & Editorial Illustrations (AI Image Generation)**:
   - When an abstract mechanism, hardware concept, or cautionary plate cannot be
     plotted from tabular data, generate bespoke 4:3 or 16:9 illustrations whose
     color temperature and lighting match the slide palette (ivory/obsidian/brass/pine).
   - Always inspect every generated image visually and iterate if typography,
     tick marks, or visual accuracy fails.

### Stage 4 — Interactive Widgets & Micro-Animations

Upgrade static explanations into concrete, stage-ready browser experiences
(see [references/interactive-patterns.md](./references/interactive-patterns.md)):
- Add high-contrast **presenter cue badges** (`▶ 点击互动演示`) on every
  interactive slide so the speaker never forgets to trigger a live demo.
- Use a **Matrix Code-to-Figure Runner** (scrolling real R/Python code in an
  obsidian terminal that reveals the resulting high-res plot on click) to show
  reproducible code execution live on stage.
- Replace abstract boxes with **pure CSS/SVG animations** (e.g., looping data
  shuttles, closed-loop dashed flows, VRAM/context bar simulators, colorblindness
  SVG filters) and ensure `t = 0` initial keyframes look informative in static
  screenshots and PDF exports.

### Stage 5 — Mandatory Dual Quality Gate (Static + Visual QA)

Never ship an HTML deck without running both checks
(see [references/qa-checklist.md](./references/qa-checklist.md)):

1. **Static Audit**: Run [scripts/audit_deck.py](./scripts/audit_deck.py):
   ```bash
   python3 skills/ai-html-keynote/scripts/audit_deck.py slides/index.html
   node --check slides/deck.js
   ```
   Verify: `0` missing images, `0` inline fonts `< 21px`, `0` JS syntax errors,
   and `0` hardcoded local paths.
2. **Headless Chrome Visual QA**: Capture rendered `1280×720` screenshots with
   [scripts/capture_slides.sh](./scripts/capture_slides.sh) using the deck's
   exact URL hash (`#<N>`):
   ```bash
   bash skills/ai-html-keynote/scripts/capture_slides.sh slides/index.html qa_shots 1 2 16 38
   ```
   Inspect EVERY modified or new slide image directly to catch:
   - Right-edge or bottom-edge overflow/clipping
   - Orphan single-character line wraps on titles or bullets
   - Empty lower-half dead space ("top-heavy" slides)
   - Cropped rings/badges (switch `object-fit: cover` → `object-fit: contain`)
   - Invisible animation badges at `t = 0`

### Stage 6 — Open-Source Packaging & GitHub Pages Delivery

1. Audit the repository before `git push`: include ONLY referenced assets,
   portable scripts, clean CSV datasets, docs, and the skill; exclude private
   manuscripts, raw intermediate dumps, `.DS_Store`, and `.Rhistory`.
2. Add root `index.html` redirecting to `./slides/index.html` and enable
   **GitHub Pages** on `main` (`/`) so anyone can view the live interactive deck
   via URL or QR code on the closing slide.
