# Pawn Brief: Charts Click-to-Expand · Click-to-Collapse · BP087

**Canon anchor:** `canon_charts_click_to_expand_click_to_collapse_site_wide_ux_pattern_bp087.eblet.md`
**Date:** 2026-06-20
**BP:** BP087

---

## What Founder Asked For

> "that chart, like all the charts here: needs to EXPAND when you click it, to read, and collapse back when you click it again. All charts need to do this, site-wide, when we make them."

## The Rule (One Sentence)

Every chart on every cooperative-class surface: click to expand to a full-viewport overlay, click again (or press ESC, or click outside) to collapse back. Site-wide. No exceptions.

---

## CSS to Add (Paste-Ready Block)

Add this to the `<style>` block in every demo file being retrofitted. If a shared stylesheet exists, add it there.

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

---

## JavaScript to Add (Paste-Ready Block)

Add this inside a `<script>` tag just before the closing `</body>` tag in each file.

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

---

## Charts to Retrofit: Specific List

### File: `C:\Users\Administrator\Downloads\mnemosynec-design-demo-v2 (2).html`

Find each chart's outer wrapper div or section and add `class="chart-tile"` to it. If the outer wrapper already has classes, append `chart-tile` to the class list.

Charts to tag:

1. **Horizontal grouped bar chart** (benchmark results) -- the outer container wrapping the bar chart SVG or canvas
2. **Lifecycle flow diagram** (Pheromones to Stone Tablets) -- the outer div wrapping the lifecycle SVG
3. **Architecture stack** (Reader / Verifier / Accumulator) -- the outer div wrapping the architecture layers
4. **Proof card: Storm Test** -- the outer card div
5. **Proof card: Mesh Proof** -- the outer card div
6. **Proof card: Benchmark R10** -- the outer card div
7. **Commercial license offer card** (Component G) -- the outer card div
8. **4-layer license strip** -- the outer div wrapping the strip
9. **Compounding chart** (when embedded from substrate-compounding-chart.html) -- the embed wrapper or the SVG container div

**Pattern for each:**

Before:
```html
<div class="benchmark-chart">
```

After:
```html
<div class="benchmark-chart chart-tile">
```

### File: `C:\Users\Administrator\Downloads\substrate-compounding-chart.html`

The SVG container div needs `class="chart-tile"` added. If the SVG is the top-level element, wrap it:

```html
<div class="chart-tile" style="width:100%;height:100%;">
  <!-- existing SVG here -->
</div>
```

---

## Composition with the Flip Card Pattern

Inside the 3-level flip cards, there are TWO separate clickable affordances:

- **Click the chart** -- triggers expand (chart-tile handler, `stopPropagation` prevents flip)
- **Click the "Technical Detail" link** -- triggers flip to back face

These compose without conflict. The `stopPropagation` call in the chart click handler ensures the flip card listener does not fire when the user clicks the chart. Both affordances must be verified in the acceptance test.

---

## Acceptance Checklist

Before marking this brief complete, verify each of the following:

- [ ] Every chart in `mnemosynec-design-demo-v2 (2).html` has `chart-tile` class on its outer container
- [ ] Every chart in `substrate-compounding-chart.html` has `chart-tile` class
- [ ] Click on any chart in either file opens a full-viewport dark-backdrop overlay with the chart scaled up
- [ ] Click again on the expanded chart collapses the overlay
- [ ] ESC key collapses the overlay from any expanded state
- [ ] Click outside the chart frame (on the dark backdrop) collapses the overlay
- [ ] Only one chart can be expanded at a time (second click blocked while one is open)
- [ ] Keyboard: Tab to chart, Enter or Space opens, ESC closes, focus returns to original chart
- [ ] Mobile (touch tap): tap expands, tap again collapses
- [ ] Flip card charts: chart click expands, "Technical Detail" link still flips independently
- [ ] No em-dashes in any delivered HTML, CSS, or JavaScript
- [ ] No library dependencies added (vanilla JS only)

---

## Compose with Existing Canons

- `canon_charts_click_to_expand_click_to_collapse_site_wide_ux_pattern_bp087.eblet.md` (parent canon, Asteroid-ProofVault)
- 3-level flip card pattern from the design system (two affordances, no conflict)
- `canon-pinned-proof-setup-no-delete-screenshot-evidence-preservation-discipline-bp087` (Pinned Proof link at bottom of expanded view -- required before Cephas paper publish)
