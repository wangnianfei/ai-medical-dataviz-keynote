# Interactive & Animation Patterns Reference

HTML presentations surpass PowerPoint when abstract mechanics become clickable,
live-animated browser experiences — all with **zero external CDN dependencies**
so venue Wi-Fi failure can never break the talk.

---

## 1. High-Visibility Presenter Click Cues

Speakers forget hidden demos under stage lights. Every interactive slide MUST
display a clear, ≥22px high-contrast pill badge near the top kicker or widget
header (e.g., `▶ 现场点击互动演示`, `⚡ 点击体验 RAG 翻滚溯源`, `▶ 切换模式演示 KV Cache`)
using `--accent-ochre` (`#B07219`) or `--accent-terracotta` (`#C2412D`) with a
subtle CSS pulse.

---

## 2. Matrix Code-to-Figure Live Runner

To demonstrate that scientific plots come from reproducible code (not hand-drawn
graphics), pair real R/Python snippets with a Matrix-style live runner:

1. Attach `data-runner="<id>"` to any figure card's `⚡ 跑代码` button.
2. When clicked, open a modal (or inline obsidian terminal panel) that streams
   real syntax-highlighted R/Python lines rapidly (`requestAnimationFrame` /
   short interval ~25–40 ms per line) with a blinking green/pine cursor.
3. Upon reaching the final `ggsave()` / `dev.off()` line, smoothly cross-fade or
   reveal the actual high-resolution figure next to the code, with a button to
   re-run or zoom via Lightbox.

---

## 3. Domain Concept Simulators (Zero External Libraries)

| Concept | Interactive Pattern | Implementation Notes |
| :--- | :--- | :--- |
| **Autoregressive LLM** | Step-by-step next-token chain + context fork | Click to append tokens and branch between vague vs structured prompts |
| **Context Compression (`/compact`)** | Animated stacked progress bar | Show raw noisy context (`88%`) collapsing cleanly to a distilled summary (`18%`) |
| **Subagents & KV Cache** | Mode toggle (`Isolated Clean Return` vs `Verbose Return Overflow`) | Animate cloud GPU VRAM KV Cache bar turning red when verbose subagent outputs flood the parent window |
| **Local RAG Retrieval** | Disease/query switcher + scrolling retrieval log | Animate chunk scanning → cosine similarity scores → grounded answer with `[Doc §3.2]` citations |
| **Scientific Palette & Colorblindness** | Live theme chips + SVG `<feColorMatrix>` toggle | Switch CNS / `MetBrewer` palettes live on an embedded chart and toggle deuteranopia simulation |

---

## 4. Pure CSS / SVG Looping Micro-Animations

Use lightweight CSS `@keyframes` inside inline SVGs or flex stages for processes
that benefit from motion without needing a click:

- **Shuttle / Porter Loop** (e.g., human copying & pasting between Web Chatbot
  and Local RStudio):
  - Animate character head/torso oscillation (`porterTurn`), outbound/inbound
    text packets (`packetFlyRight` / `packetFlyLeft`), and target monitor error
    flash (`errScreenPulse`).
  - **Critical `t = 0` Rule**: Start key badges at `opacity: 1` (e.g., `0% { opacity: 1; transform: translateX(18px); }`) so both static screenshots and Print-to-PDF capture a legible, self-explanatory frame.
- **Closed-Loop Flow Diagrams** (e.g., `AI Write → AI Review → AI Read`):
  - Use curved SVG `<path>` arrows with `stroke-dasharray: 8 6` and animated
    `stroke-dashoffset` (`@keyframes dashFlow`) + a centered dashed rounded pill
    (`rx="34"`) that gives generous padding around center text.

---

## 5. Standard Presenter HUD (`deck.js`)

Include these core controls in every deck:
- **Keyboard Navigation**: `ArrowRight` / `ArrowDown` / `Space` / `PageDown` (next), `ArrowLeft` / `ArrowUp` / `PageUp` (prev), `Home` / `End`.
- **URL Hash Sync (`#1`..`#N`)**: Update `window.location.hash` on navigation and restore slide index on `hashchange` / `DOMContentLoaded`. (This also enables deterministic Headless Chrome QA!)
- **Grid Overview (`G`)**: Full-screen thumbnail grid of all slides for instant non-linear Q&A jumping.
- **Speaker Notes & Timer (`N`)**: Slide-out drawer reading `slide.dataset.notes`, paired with a start/reset talk timer.
- **Fullscreen (`F`)** and **Click-to-Zoom Lightbox**: Clicking any slide image opens a full-viewport high-res overlay (dismiss with `Esc` or click outside).
