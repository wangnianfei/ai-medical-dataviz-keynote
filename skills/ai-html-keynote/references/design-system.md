# Design System Reference — Warm Editorial 16:9 HTML Keynote

## 1. Centered 16:9 Logical Canvas (Zero Right-Edge Clipping)

Never let slides reflow dynamically by viewport aspect ratio. Design against a
fixed `1440 × 810` logical coordinate space and scale uniformly via JS + CSS:

```css
:root {
  --slide-w: 1440px;
  --slide-h: 810px;
}

body {
  margin: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #141210;
}

.deck-stage {
  position: relative;
  width: var(--slide-w);
  height: var(--slide-h);
  transform-origin: center center;
  transform: scale(var(--deck-scale, 1));
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}
```

Compute `--deck-scale` on `load` and `resize`:

```js
function updateScale() {
  const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
  document.documentElement.style.setProperty('--deck-scale', String(scale));
}
```

### Print / Static PDF Fallback

Provide `@media print` with `@page { size: 1440px 810px; margin: 0; }` and
`break-after: page` on `.slide` so `Cmd/Ctrl + P` exports an exact 16:9 backup
PDF in seconds.

---

## 2. Strict Typography Floor (≥ 16pt / 22px Minimum)

Projector audiences sit 8–20 meters away. On a `1440×810` canvas, `22px` maps to
roughly `16.5pt` — the absolute readability floor.

| Semantic Role | Font Size | Weight | Notes |
| :--- | :---: | :---: | :--- |
| Cover Hero `H1` | `48–52px` | `800` | Tight line-height `1.16`, max 2 lines |
| Slide Title `H2` | `36–38px` | `800` | Consistent position across all content slides |
| Card Title `H3` | `25–26px` | `700` | Distinct semantic accent border or top pill |
| Core Body / Bullet Phrases | `23–24px` | `500–600` | Concise scannable phrases, ≤ 6–7 lines/slide |
| Kicker / Tag / Button / Caption / Table / SVG text | **`22px` (Hard Floor)** | `600–700` | Never `< 22px` on any visible slide element |

**Typography rules**:
- Prefer crisp sans-serif stacks (`"PingFang SC", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif`) for slides and scientific figures.
- Use monospace (`"JetBrains Mono", "SF Mono", Menlo, monospace`) exclusively for code terminals, token counters, and CLI commands.
- Avoid orphan single-character line wraps in Chinese (e.g., a lone `子！` or `。` dropping to line 2) by tightening copy or widening the container.

---

## 3. Warm Editorial Color Tokens (Zero Generic Corporate Blue)

Avoid default SaaS/PowerPoint blue gradients. Use a museum-grade editorial
palette inspired by print journals (*Nature* editorial, *The Economist*, Met
Museum pigment palettes):

```css
:root {
  --bg-ivory: #F7F4EE;        /* Primary paper canvas */
  --surface-white: #FFFFFF;   /* Elevated figure & content cards */
  --border-sand: #E3DDD2;     /* Subtle editorial hairlines */
  --ink-primary: #1C1917;     /* Warm charcoal body ink */
  --ink-muted: #57534E;       /* Secondary captions & labels */

  --dark-obsidian: #1B1815;   /* Dark contrast slides & code terminals */
  --dark-card: #26221E;       /* Elevated card on dark slides */

  --accent-pine: #1B5E55;     /* Primary semantic accent (trust, precision, good) */
  --accent-terracotta: #C2412D; /* Warning, bad example, critical contrast */
  --accent-ochre: #B07219;    /* Highlight, interactive presenter cue, gold */
  --accent-plum: #6D4C67;     /* Secondary analytical / taxonomy contrast */
}
```

**Rhythm across the deck**:
- ~80–85% Warm Ivory (`#F7F4EE`) content slides for calm long-form readability.
- ~15–20% Warm Obsidian (`#1B1815`) dramatic pivot slides (Cover, Climactic Question, Closing Finale) to reset audience attention.
- **Scientific Color Taboo**: Never use Rainbow / Jet colormaps except as explicit "Bad Example" counter-proofs (cite Crameri et al., *Nature Communications* 2020).

---

## 4. Layout & Image Framing Principles

1. **Cover Slide Geometry**: Never paste boxy rectangular thumbnails over cover text. Use circular crops, angled editorial strips, or masked decorative accents placed strictly in the peripheral framing zone.
2. **Eliminate Top-Heavy Dead Space**: When a slide has few words, materialize the abstract concept into a structured diagram, stat bar chart, comparison matrix, or bespoke editorial illustration so the lower half never feels empty.
3. **Framing Rules (`object-fit`)**:
   - Use `object-fit: contain` (with matching dark or white matte background) for scientific charts, forensic plates, circular rings, and magnifying-glass callouts so zero edges or axes are ever clipped.
   - Reserve `object-fit: cover` only for editorial portraits or edge-to-edge ambient textures.
4. **Original English Scientific Figures**: Keep top-journal and reproducible R/Python figures in their crisp original English — do not overlay clumsy Chinese translations on high-res plots.
