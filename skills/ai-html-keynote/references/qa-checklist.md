# Quality Assurance Checklist — Static Audit + Headless Chrome Visual QA

Never assume an HTML presentation looks right from code alone. Run both automated
gates after every structural or styling edit.

---

## Gate 1 — Automated Static Audit

Run the bundled script against your deck:

```bash
python3 skills/ai-html-keynote/scripts/audit_deck.py slides/index.html
node --check slides/deck.js
```

Required zero-tolerance targets:
- **Broken images (`Missing`)**: `0`
- **Inline small fonts (`< 21px`)**: `0`
- **JS syntax errors**: `0`
- **Hardcoded user/machine paths** (`/Users/...`, `C:\...`): `0`
- **Slide numbering consistency**: header/footer `NN / Total` matches actual `<section class="slide">` count.

---

## Gate 2 — Headless Chrome Visual QA (`1280×720`)

Capture real rendered PNGs for every new or edited slide:

```bash
bash skills/ai-html-keynote/scripts/capture_slides.sh slides/index.html ./qa_shots 1 16 17 20 34 38
```

> **Common Pitfall — URL Hash Format**: Verify what hash format `deck.js` parses
> before capturing. Standard decks use `#1`..`#N` (NOT `#slide-1`). Passing the
> wrong hash silently renders Slide 1 for every screenshot!

### Visual Inspection Checklist (Inspect Every Captured PNG)

1. **Zero Right/Bottom Clipping**: All card borders, shadows, kickers, and slide
   numbers sit comfortably inside the `16:9` frame with symmetric margins.
2. **Typography Hierarchy & Legibility**: No tiny footnotes, no cramped tables,
   no overlapping SVG labels.
3. **Zero Orphan Line Wraps**: Check Chinese/English headings and bullets for
   awkward 1–2 character widow lines (e.g., `子！` or `+ Skill` alone on line 2).
4. **Balanced Vertical Density**: No top-heavy slides with huge blank lower
   halves; add charts, visual flows, or illustrations to fill dead space cleanly.
5. **Uncropped Artwork**: Verify circular diagrams, magnifying rings, and figure
   axes are never clipped (`object-fit: contain` when full frame integrity matters).
6. **Animation `t = 0` Legibility**: Animated badges/packets must be clearly
   visible at initial paint (`opacity: 1` at `0%` keyframe) so Print-to-PDF and
   first-glance viewing never look broken.
7. **Speaker & Provenance Compliance**: Verify speaker name/title, exact quotes,
   citations, and absence of private/unpublished assets before public push.
