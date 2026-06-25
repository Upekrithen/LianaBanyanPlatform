# Pawn Brief Consolidated · BP087 · Compounding Chart Fixes + Click-Expand Retrofit

**To:** Pawn
**From:** Bishop (SEG-FFF)
**Date:** 2026-06-20
**Priority:** Founder direct (all 4 in parallel)

Three asks landed together. Two are surgical fixes on the substrate compounding chart. One is a site-wide UX retrofit on every chart in the main demo. All four should fit in one Pawn pass.

---

## ASK 1 · Founder-Quote Drift Fix (P0) on substrate-compounding-chart.html

**File:** `C:\Users\Administrator\Downloads\substrate-compounding-chart.html`

The Founder quote callout currently at lines 168-170 reads:

```
"The MORE there is, the FASTER and MORE efficient it gets."
-- Founder direct, BP087, 2026-06-20
```

This is **paraphrased**, not verbatim. Two problems: (1) "Notice how" is dropped from the opening, (2) the second sentence is missing entirely.

**Canonical Anchor 1 verbatim:**
> Notice how the MORE there is, the FASTER and MORE efficient it gets? We need a chart for that. For real.

The current callout rect is `width="380" height="34"` -- too short for two lines of text at font-size 11. Expand it.

**Replace** this block:

```xml
<!-- ── FOUNDER QUOTE CALLOUT ── -->
<rect x="96" y="38" width="380" height="34" rx="4" fill="#1a1a0a" stroke="#f59e0b" stroke-width="1" opacity="0.85"/>
<text x="104" y="51" fill="#f59e0b" font-size="10" font-weight="700" opacity="0.9">"The MORE there is, the FASTER and MORE efficient it gets."</text>
<text x="104" y="64" fill="#9ca3af" font-size="9" opacity="0.7">-- Founder direct, BP087, 2026-06-20</text>
```

**With** this block:

```xml
<!-- ── FOUNDER QUOTE CALLOUT ── -->
<rect x="96" y="34" width="380" height="54" rx="4" fill="#1a1a0a" stroke="#f59e0b" stroke-width="1" opacity="0.85"/>
<text x="104" y="47" fill="#f59e0b" font-size="10" font-weight="700" opacity="0.9">
  <tspan x="104" dy="0">"Notice how the MORE there is, the FASTER and MORE efficient</tspan>
  <tspan x="104" dy="13">it gets? We need a chart for that. For real."</tspan>
</text>
<text x="104" y="78" fill="#9ca3af" font-size="9" opacity="0.7">-- Founder direct, BP087, 2026-06-20</text>
```

Constraint: character-for-character verbatim of Anchor 1. Truth-Always at the chart layer.

---

## ASK 2 · Standalone SVG Sibling (P1)

**Source file:** `C:\Users\Administrator\Downloads\substrate-compounding-chart.html`
**Output file:** `C:\Users\Administrator\Downloads\substrate-compounding-chart.svg`

Extract the full `<svg>...</svg>` block from the HTML (everything from `<svg viewBox=...` through `</svg>`) and write it verbatim as a standalone `.svg` file. Add the XML declaration at the top:

```xml
<?xml version="1.0" encoding="UTF-8"?>
```

The SVG file must be self-contained (no external references, no HTML wrapper). Needed for Substack image embeds, paper figures, and any surface that consumes raw SVG assets where pasting an HTML file is not an option.

Note: if you applied the Founder-quote fix in ASK 1 first, export the already-corrected SVG so the standalone file is also verbatim-correct.

---

## ASK 3 · Baseline Slope Label (P3)

**File:** `C:\Users\Administrator\Downloads\substrate-compounding-chart.html`

The gray dashed baseline (Curve A, "Without substrate") has no slope label. The green and amber curves already have slope labels. Add a matching one for the gray curve.

The gray curve goes from MAMBA 0 (x=90, y=410) to MAMBA 1 (x=152, y=138). That is an 86% single-MAMBA burn. The label should read: `86% / MAMBA`

Add this after the existing `<!-- ── SLOPE LABELS ── -->` block (around line 149):

```xml
<!-- Baseline slope label (gray curve, no substrate) -->
<text x="96" y="125" fill="#6b7280" font-size="11" font-weight="600" opacity="0.9">86% / MAMBA</text>
<text x="96" y="138" fill="#6b7280" font-size="10" opacity="0.7">(No substrate)</text>
```

Adjust x/y to sit visually near the gray curve midpoint without overlapping the crash-zone callout. Match the visual style (font-size 11, font-weight 600) of the existing "10.75% / MAMBA" and "6.57% / MAMBA" labels.

---

## ASK 4 · Click-to-Expand Site-Wide UX Pattern (BP087 canon)

Founder direct: every chart on every cooperative-class surface SHALL be click-to-expand to large overlay AND click-to-collapse back. Site-wide. Composes with the 3-level flip card pattern via stopPropagation.

### CSS (paste once into each file's `<style>` block):

```css
/* ====== CHART CLICK-EXPAND PATTERN -- BP087 ====== */
.chart-tile {
  cursor: zoom-in;
  transition: transform 200ms cubic-bezier(0.4,0,0.2,1);
  position: relative;
}
.chart-tile:focus {
  outline: 2px solid #22c55e;
  outline-offset: 4px;
}
.chart-tile-expanded-backdrop {
  position: fixed;
  inset: 0;
  background: #000000aa;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 150ms;
}
.chart-tile-expanded-backdrop.open {
  opacity: 1;
}
.chart-tile-expanded {
  position: fixed;
  width: 90vw;
  height: 85vh;
  max-width: 1400px;
  max-height: 900px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 32px;
  z-index: 1000;
  cursor: zoom-out;
  overflow: auto;
}
.chart-tile-expanded svg {
  width: 100%;
  height: 100%;
}
.chart-tile-close-hint {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #a0a0a0;
  font-size: 12px;
  pointer-events: none;
}
/* ====== END CHART CLICK-EXPAND PATTERN ====== */
```

### JS (paste once per page as a `<script>` just before `</body>`):

```javascript
/* ====== CHART CLICK-EXPAND HANDLER -- BP087 ====== */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var tiles = document.querySelectorAll('.chart-tile');
    var activeBackdrop = null;
    var activeTile = null;
    var originTile = null;

    function expandTile(tile) {
      if (activeTile) return;
      originTile = tile;
      var backdrop = document.createElement('div');
      backdrop.className = 'chart-tile-expanded-backdrop';
      var clone = tile.cloneNode(true);
      clone.classList.add('chart-tile-expanded');
      clone.setAttribute('aria-expanded', 'true');
      clone.setAttribute('tabindex', '0');
      var closeHint = document.createElement('div');
      closeHint.className = 'chart-tile-close-hint';
      closeHint.textContent = 'Click again or press ESC to collapse';
      clone.appendChild(closeHint);
      backdrop.appendChild(clone);
      document.body.appendChild(backdrop);
      requestAnimationFrame(function () { backdrop.classList.add('open'); });
      clone.focus();
      activeBackdrop = backdrop;
      activeTile = clone;
    }

    function collapse() {
      if (!activeBackdrop) return;
      activeBackdrop.classList.remove('open');
      var origin = originTile;
      var bd = activeBackdrop;
      activeBackdrop = null;
      activeTile = null;
      originTile = null;
      setTimeout(function () {
        bd && bd.remove();
        origin && origin.focus();
      }, 200);
    }

    tiles.forEach(function (tile) {
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('aria-label', 'Click to expand chart');
      tile.style.cursor = 'zoom-in';
      tile.addEventListener('click', function (e) {
        e.stopPropagation();
        expandTile(tile);
      });
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          expandTile(tile);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!activeBackdrop) return;
      if (e.target === activeBackdrop || (activeTile && activeTile.contains(e.target))) {
        collapse();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') collapse();
    });
  });
}());
/* ====== END CHART CLICK-EXPAND HANDLER ====== */
```

### Retrofit list -- add `class="chart-tile"` to each outer container:

**File: `C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2 (2).html`**

Find each chart's outer wrapper div or section and append `chart-tile` to its class list. If it has no existing class, add `class="chart-tile"`. Charts to tag:

1. Horizontal grouped bar chart (benchmark Without vs With) -- outer container wrapping the bar chart SVG
2. Lifecycle flow diagram (Pheromone to Stone Tablet) -- outer div wrapping the lifecycle SVG
3. Architecture stack (Reader / Verifier / Accumulator) -- outer div wrapping the architecture layers
4. Proof card: Storm Test -- outer card div
5. Proof card: Mesh Proof -- outer card div
6. Proof card: Benchmark R10 -- outer card div
7. Commercial license offer card (Component G) -- outer card div
8. 4-layer license strip -- outer div wrapping the strip

**File: `C:\Users\Administrator\Downloads\substrate-compounding-chart.html`**

The SVG is a direct child of `<body>` with no wrapper div. Wrap it:

Before:
```html
<body>
<svg viewBox="0 0 900 520" ...>
```

After:
```html
<body>
<div class="chart-tile" style="width:100%;max-width:900px;margin:0 auto;">
<svg viewBox="0 0 900 520" ...>
```

Close the wrapper div just before `</body>`:
```html
</svg>
</div>
</body>
```

---

## Composition with the 3-Level Flip Card Pattern

Charts inside flip cards: chart click uses stopPropagation so it expands (lightbox) without flipping the card. The "Technical Detail" link click flips the card. Two affordances, zero conflict.

---

## Acceptance

- [ ] Founder quote on compounding chart is verbatim Anchor 1: "Notice how the MORE there is, the FASTER and MORE efficient it gets? We need a chart for that. For real."
- [ ] Callout rect is tall enough that no text is clipped (height approx 54px)
- [ ] Standalone SVG sibling exists at `C:\Users\Administrator\Downloads\substrate-compounding-chart.svg`
- [ ] Standalone SVG contains the verbatim-corrected Founder quote (not the old paraphrase)
- [ ] Gray baseline curve has an "86% / MAMBA" slope label styled to match the green and amber labels
- [ ] Every chart in `mnemosynec-design-demo-v2 (2).html` has `chart-tile` class on its outer container
- [ ] The SVG in `substrate-compounding-chart.html` is wrapped in a `div.chart-tile`
- [ ] Click on any tagged chart in either file opens a full-viewport dark-backdrop overlay
- [ ] Click on the expanded chart (or on the dark backdrop outside it) collapses the overlay
- [ ] ESC key collapses the overlay from any expanded state
- [ ] Only one chart can be expanded at a time
- [ ] Keyboard: Tab to chart, Enter or Space opens, ESC closes, focus returns to original element
- [ ] Flip card charts: chart click expands without flipping the card
- [ ] No em-dashes in any delivered HTML, CSS, or JavaScript

---

## Cross-references

- `canon_charts_click_to_expand_click_to_collapse_site_wide_ux_pattern_bp087`
- `canon_substrate_compounding_at_89_percent_knight_context_11_mambas_same_session_wave_2_inherits_wave_1_bp087`
- `PAWN_BRIEF_CHARTS_CLICK_EXPAND_PATTERN_BP087.md` (prior brief, superseded by this consolidated version for Pawn use)
