# Mnemosynec.org · Design System + Concrete Component Examples · BP087

**SEG-Y · Sonnet 4.6 · BP087 · Parallel with SEG-W/X/Z**
**Canon slugs anchored in each section. No em-dashes. Copy-pasteable.**

---

## §0 The 3-Level Card Pattern (Founder canonical)

Every claim on the site is presented in a card that flips between 3 levels:

- **Level 1 (front face, always visible):** Plain English. 1-2 sentences. The takeaway. No jargon.
- **Level 2 (front face, inline expand):** A little technical. Toggles open below Level 1 via "More detail" button. 3-5 sentences. Optional small inline stat or icon row.
- **Level 3 (back face, flip):** Click "Technical Detail" arrow at bottom-right. Card rotates 180 degrees. Shows deep technical explanation plus links to supporting academic papers. Each paper itself already has a 3-level structure -- mirror-recursive by design.

Visual flow:

```
[Plain English sentence]
    [More detail v]         <- toggles Level 2 inline
        [3-5 technical sentences + stat row]
    [Technical Detail ->]   <- flips card to Level 3 back face
```

Back face:

```
[Technical heading]
[Deep technical paragraphs]
[Supporting Papers]
  (1)(2)(3) Paper Title - link
  (1)(2)(3) Paper Title - link
[<- Back]
```

This pattern applies to every claim block, benchmark card, architecture explanation, and proof receipt on the site.

---

## §1 Design System Tokens (CSS Variables)

Drop this `:root` block into the Hugo theme's `_variables.css` or the top of any standalone page `<style>` block.

```css
/* ============================================================
   MNEMOSYNEC.ORG DESIGN TOKENS - BP087
   Drop into Hugo theme or any standalone <style> block.
   NO external dependencies except Google Fonts Inter (loaded
   via <link> in <head>).
   ============================================================ */

:root {
  /* --- Backgrounds --- */
  --bg-primary:    #0a0a0a;   /* near-black page background */
  --bg-secondary:  #1a1a1a;   /* card surfaces */
  --bg-hover:      #232323;   /* card hover state */
  --bg-border:     #2a2a2a;   /* dividers, bar chart fill (without) */

  /* --- Foregrounds --- */
  --fg-primary:    #e8e8e8;   /* body copy, headings */
  --fg-dim:        #a0a0a0;   /* captions, subtitles, dim labels */

  /* --- Accent colors --- */
  --accent-amber:  #f5a623;   /* cooperative amber - emphasis, CTA border */
  --accent-green:  #3ecf8e;   /* cooperative green - verified, "with" bars */
  --accent-teal:   #2dd4bf;   /* socceri triad stage */
  --accent-red:    #ef4444;   /* decay / rejected branches */

  /* --- Lifecycle stage fills --- */
  --stage-entry:   #374151;   /* claim enters - gray */
  --stage-pheromone: #f5a623; /* pheromone - amber */
  --stage-triad:   #2dd4bf;   /* socceri triad - teal */
  --stage-buoyed:  #86efac;   /* living buoyed - light green */
  --stage-stone:   #047857;   /* stone tablet - deep green */

  /* --- Typography --- */
  --font-family:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                   Helvetica, Arial, sans-serif;
  --font-size-h1:  clamp(40px, 5vw, 56px);
  --font-size-h2:  36px;
  --font-size-h3:  24px;
  --font-size-body: 17px;
  --font-size-sm:  15px;
  --font-size-xs:  13px;
  --font-size-stat: 36px;     /* headline metric on proof cards */
  --line-height:   1.7;
  --content-max-w: 720px;

  /* --- Spacing (8px base scale) --- */
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --sp-4: 32px;
  --sp-6: 48px;
  --sp-8: 64px;

  /* --- Radii --- */
  --radius-card: 8px;
  --radius-cta:  12px;
  --radius-pill: 999px;

  /* --- Motion --- */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-std:  250ms;
  --duration-flip: 600ms;
}
```

---

## §2 Component A - Three-Level Flip Card (the canonical card pattern)

**Canon refs:**
- `canon_substrate_enables_merged_reasoning_requests_43pct_knight_context_drag_reduction_bp087`
- Banyan Metric reference eblet
- BP063 86% vs BP087 43% inequality

The example below uses the "43% context drag" claim from BP087 receipt.

**How to reuse:** Copy the entire block. Change the text content in the three `data-*` zones. The JS at the bottom is the same for every card on the page -- include it once.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Three-Level Flip Card - Component A - BP087</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ---- TOKENS (paste :root block from §1 here in production) ---- */
    :root {
      --bg-primary: #0a0a0a; --bg-secondary: #1a1a1a; --bg-border: #2a2a2a;
      --fg-primary: #e8e8e8; --fg-dim: #a0a0a0;
      --accent-amber: #f5a623; --accent-green: #3ecf8e;
      --font-family: 'Inter', -apple-system, sans-serif;
      --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
      --duration-flip: 600ms;
      --radius-card: 8px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg-primary);
      color: var(--fg-primary);
      font-family: var(--font-family);
      font-size: 17px;
      line-height: 1.7;
      padding: 48px 24px;
      display: flex;
      justify-content: center;
    }

    /* ---- FLIP CARD OUTER SHELL ---- */
    .flip-card {
      perspective: 1200px;
      width: 100%;
      max-width: 680px;
      /* height is driven by content; min-height keeps it from collapsing */
      min-height: 280px;
    }

    .flip-card-inner {
      position: relative;
      width: 100%;
      min-height: 280px;
      transform-style: preserve-3d;
      transition: transform var(--duration-flip) var(--ease-standard);
    }

    /* When .flipped is on the OUTER .flip-card, rotate the inner */
    .flip-card.flipped .flip-card-inner {
      transform: rotateY(180deg);
    }

    /* ---- SHARED FACE STYLES ---- */
    .flip-card-front,
    .flip-card-back {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      min-height: 280px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      background: var(--bg-secondary);
      border: 1px solid var(--bg-border);
      border-radius: var(--radius-card);
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
    }

    /* ---- FRONT FACE ---- */
    .flip-card-back {
      transform: rotateY(180deg);
    }

    /* Level 1: plain English heading */
    .card-level1 {
      font-size: 22px;
      font-weight: 600;
      color: var(--fg-primary);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    /* "More detail" toggle button */
    .btn-expand {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--accent-amber);
      font-family: var(--font-family);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 0;
      margin-bottom: 0;
      transition: opacity var(--duration-std) var(--ease-standard);
    }
    .btn-expand:hover { opacity: 0.75; }

    .btn-expand .chevron {
      display: inline-block;
      transition: transform var(--duration-std) var(--ease-standard);
      font-style: normal;
    }
    .btn-expand.open .chevron { transform: rotate(180deg); }

    /* Level 2: inline technical expand */
    .card-level2 {
      overflow: hidden;
      max-height: 0;
      transition: max-height 350ms var(--ease-standard),
                  opacity 300ms var(--ease-standard),
                  margin 300ms var(--ease-standard);
      opacity: 0;
      margin-top: 0;
    }
    .card-level2.open {
      max-height: 500px;
      opacity: 1;
      margin-top: 16px;
    }

    .card-level2 p {
      font-size: 15px;
      color: var(--fg-dim);
      margin-bottom: 12px;
    }

    /* Inline stat row inside Level 2 */
    .stat-row {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      margin-top: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      border-left: 3px solid var(--accent-green);
    }
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 22px;
      font-weight: 700;
      color: var(--accent-green);
      line-height: 1.2;
    }
    .stat-label {
      font-size: 12px;
      color: var(--fg-dim);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 2px;
    }

    /* Spacer pushes the Technical Detail button to the bottom */
    .card-spacer { flex: 1; min-height: 16px; }

    /* "Technical Detail" flip trigger */
    .btn-flip {
      align-self: flex-end;
      margin-top: 16px;
      background: none;
      border: 1px solid var(--bg-border);
      border-radius: 6px;
      color: var(--accent-amber);
      font-family: var(--font-family);
      font-size: 13px;
      font-weight: 500;
      padding: 6px 14px;
      cursor: pointer;
      transition: border-color var(--duration-std) var(--ease-standard),
                  background var(--duration-std) var(--ease-standard);
    }
    .btn-flip:hover {
      border-color: var(--accent-amber);
      background: rgba(245,166,35,0.07);
    }

    /* ---- BACK FACE ---- */
    .card-back-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--fg-primary);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .card-back-body {
      font-size: 15px;
      color: var(--fg-dim);
      line-height: 1.7;
      margin-bottom: 12px;
    }

    .card-back-body strong {
      color: var(--fg-primary);
    }

    .papers-heading {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--fg-dim);
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .papers-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .papers-list li a {
      color: var(--accent-amber);
      text-decoration: none;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .papers-list li a:hover { text-decoration: underline; }

    /* (1)(2)(3) level badges */
    .level-badges {
      display: inline-flex;
      gap: 3px;
      flex-shrink: 0;
    }
    .level-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
      background: var(--bg-border);
      color: var(--fg-dim);
    }
    .level-badge.active {
      background: var(--accent-amber);
      color: #000;
    }

    /* Back button */
    .btn-back {
      align-self: flex-start;
      margin-top: 20px;
      background: none;
      border: 1px solid var(--bg-border);
      border-radius: 6px;
      color: var(--fg-dim);
      font-family: var(--font-family);
      font-size: 13px;
      font-weight: 500;
      padding: 6px 14px;
      cursor: pointer;
      transition: border-color var(--duration-std) var(--ease-standard);
    }
    .btn-back:hover { border-color: var(--fg-dim); }
  </style>
</head>
<body>

<!-- ================================================================
     COMPONENT A: THREE-LEVEL FLIP CARD
     Example claim: 43% context drag reduction (BP087 receipt)
     Canon ref: canon_substrate_enables_merged_reasoning_requests_
                43pct_knight_context_drag_reduction_bp087
     ================================================================ -->

<div class="flip-card" id="card-43pct">
  <!-- FRONT FACE: Level 1 + Level 2 -->
  <div class="flip-card-front">

    <!-- Level 1: Plain English (1-2 sentences max) -->
    <h3 class="card-level1">
      The substrate makes parallel work nearly free in cost.
      Five AI agents finished the same job in 16 minutes at less than half the usual context overhead.
    </h3>

    <!-- Expand button for Level 2 -->
    <button class="btn-expand" id="expand-43pct" aria-expanded="false"
            onclick="toggleExpand('expand-43pct', 'level2-43pct')">
      More detail
      <span class="chevron" aria-hidden="true">&#9660;</span>
    </button>

    <!-- Level 2: A little technical (inline expand) -->
    <div class="card-level2" id="level2-43pct" aria-hidden="true">
      <p>
        Running five MAMBA reasoning streams in parallel, the substrate merged their
        shared context rather than duplicating it. Each stream saw only the delta it
        needed. Total context consumed: 43% of the 200K token window, compared to 86%
        when the same five streams ran without substrate merging (BP063 baseline).
      </p>
      <p>
        Wall-clock time: 16 minutes for the full batch. The savings compound at scale:
        ten streams would not consume 86% x 2; they converge toward the same 43% floor
        because merged context is shared, not multiplied.
      </p>

      <!-- Inline stat row -->
      <div class="stat-row" role="region" aria-label="Key measurements">
        <div class="stat-item">
          <span class="stat-value">43%</span>
          <span class="stat-label">context used (BP087)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">86%</span>
          <span class="stat-label">without substrate (BP063)</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">16 min</span>
          <span class="stat-label">5 streams wall-clock</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">5</span>
          <span class="stat-label">parallel agents</span>
        </div>
      </div>
    </div>

    <div class="card-spacer"></div>

    <!-- Flip trigger to Level 3 -->
    <button class="btn-flip" onclick="flipCard('card-43pct')">
      Technical Detail &#8594;
    </button>
  </div>

  <!-- BACK FACE: Level 3 + Papers -->
  <div class="flip-card-back">
    <h3 class="card-back-title">Context Drag Reduction: The Substrate Inequality</h3>

    <p class="card-back-body">
      <strong>BP063 baseline (no substrate):</strong> Five MAMBA streams each received
      the full shared context independently. Combined: 86% of a 200K token window consumed.
      Any sixth stream would overflow or require truncation.
    </p>
    <p class="card-back-body">
      <strong>BP087 result (with substrate):</strong> The same five streams ran against
      a substrate-merged context pool. Common facts were written once and addressed by
      reference. Each stream's delta was the only unique spend. Combined: 43% of the
      200K window consumed. Floor does not rise linearly with additional streams.
    </p>
    <p class="card-back-body">
      The inequality that governs all cooperative substrate deployments:<br>
      <strong>Free WITH Substrate &gt; Flagship WITHOUT Substrate</strong>
    </p>
    <p class="card-back-body">
      Supporting measurement is recorded in the Banyan Metric ledger under the
      "Knight context drag" entry. The full inequality derivation is in the
      canon slug below. Both are disk-backed and Code-Breaker-verified.
    </p>

    <p class="papers-heading">Supporting Papers</p>
    <ul class="papers-list">
      <li>
        <a href="/papers/banyan-metric-context-drag" target="_blank" rel="noopener">
          <span class="level-badges">
            <span class="level-badge active">1</span>
            <span class="level-badge active">2</span>
            <span class="level-badge active">3</span>
          </span>
          Banyan Metric: Knight Context Drag Reference Ledger
        </a>
      </li>
      <li>
        <a href="/papers/substrate-merged-reasoning" target="_blank" rel="noopener">
          <span class="level-badges">
            <span class="level-badge active">1</span>
            <span class="level-badge active">2</span>
            <span class="level-badge active">3</span>
          </span>
          Substrate-Enabled Merged Reasoning Requests (BP087)
        </a>
      </li>
      <li>
        <a href="/papers/bp063-parallel-baseline" target="_blank" rel="noopener">
          <span class="level-badges">
            <span class="level-badge active">1</span>
            <span class="level-badge active">2</span>
            <span class="level-badge">3</span>
          </span>
          BP063 Parallel Baseline: 86% Context Utilization Without Merging
        </a>
      </li>
    </ul>

    <button class="btn-back" onclick="flipCard('card-43pct')">
      &#8592; Back
    </button>
  </div>
</div>

<script>
  /* ---- FLIP CARD JS (include ONCE per page, works for all .flip-card elements) ---- */
  function flipCard(cardId) {
    document.getElementById(cardId).classList.toggle('flipped');
  }

  function toggleExpand(btnId, targetId) {
    const btn = document.getElementById(btnId);
    const target = document.getElementById(targetId);
    const isOpen = target.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    target.setAttribute('aria-hidden', !isOpen);
  }
</script>
</body>
</html>
```

---

## §3 Component B - Grouped Horizontal Bar Chart (Benchmark Comparison)

**Canon refs:**
- `canon_free_with_substrate_flagship_inequality_trinity_bp085`
- `canon_broke_the_sound_barrier_substrate_metaphor_bp085`
- Gemma 97.1% receipt (BP085)

Pure inline SVG. No JS, no D3, no external dependencies. Drop directly into a Hugo template or HTML page.

Numbers used: Claude Opus 4.8 (6% without / 89.3% with), GPT-5.5 (19.3% / 93.3%), Llama 3.1 8B free (6% / 78.0%), Gemini 3.5 Flash (8% / 90.7%).

Bar scaling: max bar = 93.3% = 100% of available bar width. Bar area starts at x=200 (after label). Bar area width = 520px. Scale factor = 520 / 100 = 5.2 px per point.

70% threshold line x = 200 + (70 * 5.2) = 200 + 364 = x=564.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benchmark Bar Chart - Component B - BP087</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      background: #0a0a0a;
      font-family: 'Inter', sans-serif;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .chart-title {
      color: #e8e8e8;
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }
    .chart-subtitle {
      color: #a0a0a0;
      font-size: 14px;
      margin-bottom: 32px;
      text-align: center;
    }
    svg {
      width: 100%;
      max-width: 800px;
      height: auto;
      overflow: visible;
    }
    .legend {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      justify-content: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #a0a0a0;
    }
    .legend-swatch {
      width: 16px;
      height: 10px;
      border-radius: 2px;
    }
  </style>
</head>
<body>

<p class="chart-title">Recall Accuracy: Without vs With Cooperative Substrate</p>
<p class="chart-subtitle">
  "Free WITH Substrate &gt; Flagship WITHOUT Substrate"
  (canon: canon_free_with_substrate_flagship_inequality_trinity_bp085)
</p>

<!-- ================================================================
     COMPONENT B: GROUPED HORIZONTAL BAR CHART
     viewBox 0 0 800 280
     Label area: x=0 to x=192 (192px, right-padded to 200 for bar start)
     Bar area: x=200 to x=720 (520px)
     Scale: 1% = 5.2px
     Row heights: 60px each, 4 rows = 240px, plus 40px top for axis
     70% threshold: x = 200 + (70 * 5.2) = 564
     ================================================================ -->

<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg"
     role="img" aria-label="Benchmark comparison chart: recall accuracy with and without cooperative substrate">

  <title>Recall Accuracy Without vs With Cooperative Substrate</title>

  <!-- Background -->
  <rect width="800" height="280" fill="#0a0a0a"/>

  <!-- ---- GRID LINES (subtle) ---- -->
  <!-- 20% = x 304 -->
  <line x1="304" y1="20" x2="304" y2="256" stroke="#1e1e1e" stroke-width="1"/>
  <!-- 40% = x 408 -->
  <line x1="408" y1="20" x2="408" y2="256" stroke="#1e1e1e" stroke-width="1"/>
  <!-- 60% = x 512 -->
  <line x1="512" y1="20" x2="512" y2="256" stroke="#1e1e1e" stroke-width="1"/>
  <!-- 80% = x 616 -->
  <line x1="616" y1="20" x2="616" y2="256" stroke="#1e1e1e" stroke-width="1"/>
  <!-- 100% = x 720 -->
  <line x1="720" y1="20" x2="720" y2="256" stroke="#1e1e1e" stroke-width="1"/>

  <!-- ---- AXIS LABELS (top) ---- -->
  <text x="304" y="15" fill="#4a4a4a" font-family="Inter,sans-serif" font-size="11"
        text-anchor="middle">20%</text>
  <text x="408" y="15" fill="#4a4a4a" font-family="Inter,sans-serif" font-size="11"
        text-anchor="middle">40%</text>
  <text x="512" y="15" fill="#4a4a4a" font-family="Inter,sans-serif" font-size="11"
        text-anchor="middle">60%</text>
  <text x="616" y="15" fill="#4a4a4a" font-family="Inter,sans-serif" font-size="11"
        text-anchor="middle">80%</text>
  <text x="720" y="15" fill="#4a4a4a" font-family="Inter,sans-serif" font-size="11"
        text-anchor="middle">100%</text>

  <!-- ================================================================
       70% THRESHOLD LINE
       x = 200 + (70 * 5.2) = 564
       ================================================================ -->
  <line x1="564" y1="18" x2="564" y2="260" stroke="#f5a623"
        stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="568" y="30" fill="#f5a623" font-family="Inter,sans-serif"
        font-size="10" font-weight="600">useful recall threshold</text>


  <!-- ================================================================
       ROW 1: Claude Opus 4.8
       Without: 6%  -> width = 6 * 5.2 = 31.2  -> round to 31
       With:   89.3% -> width = 89.3 * 5.2 = 464.4 -> round to 464
       Row baseline y = 40. Without bar y=40, height=12. With bar y=56, height=12.
       ================================================================ -->

  <!-- Label -->
  <text x="192" y="51" fill="#e8e8e8" font-family="Inter,sans-serif"
        font-size="13" font-weight="500" text-anchor="end">Claude Opus 4.8</text>

  <!-- Without bar -->
  <rect x="200" y="38" width="31" height="12" fill="#2a2a2a" rx="2"/>

  <!-- With bar -->
  <rect x="200" y="54" width="464" height="12" fill="#3ecf8e" rx="2"/>

  <!-- Annotation: delta -->
  <text x="668" y="64" fill="#3ecf8e" font-family="Inter,sans-serif"
        font-size="12" font-weight="600">+83.3 pts</text>


  <!-- ================================================================
       ROW 2: GPT-5.5
       Without: 19.3% -> width = 19.3 * 5.2 = 100.4 -> 100
       With:   93.3%  -> width = 93.3 * 5.2 = 485.2 -> 485
       Row baseline y = 100.
       ================================================================ -->

  <text x="192" y="111" fill="#e8e8e8" font-family="Inter,sans-serif"
        font-size="13" font-weight="500" text-anchor="end">GPT-5.5</text>

  <rect x="200" y="98" width="100" height="12" fill="#2a2a2a" rx="2"/>
  <rect x="200" y="114" width="485" height="12" fill="#3ecf8e" rx="2"/>
  <text x="689" y="124" fill="#3ecf8e" font-family="Inter,sans-serif"
        font-size="12" font-weight="600">+74.0 pts</text>


  <!-- ================================================================
       ROW 3: Llama 3.1 8B (free)
       Without: 6%   -> width = 31
       With:   78.0% -> width = 78.0 * 5.2 = 405.6 -> 406
       Row baseline y = 160.
       ================================================================ -->

  <text x="192" y="171" fill="#e8e8e8" font-family="Inter,sans-serif"
        font-size="13" font-weight="500" text-anchor="end">Llama 3.1 8B (free)</text>

  <rect x="200" y="158" width="31" height="12" fill="#2a2a2a" rx="2"/>
  <rect x="200" y="174" width="406" height="12" fill="#3ecf8e" rx="2"/>
  <text x="610" y="184" fill="#3ecf8e" font-family="Inter,sans-serif"
        font-size="12" font-weight="600">+72.0 pts</text>


  <!-- ================================================================
       ROW 4: Gemini 3.5 Flash
       Without: 8%   -> width = 8 * 5.2 = 41.6 -> 42
       With:   90.7% -> width = 90.7 * 5.2 = 471.6 -> 472
       Row baseline y = 220.
       ================================================================ -->

  <text x="192" y="231" fill="#e8e8e8" font-family="Inter,sans-serif"
        font-size="13" font-weight="500" text-anchor="end">Gemini 3.5 Flash</text>

  <rect x="200" y="218" width="42" height="12" fill="#2a2a2a" rx="2"/>
  <rect x="200" y="234" width="472" height="12" fill="#3ecf8e" rx="2"/>
  <text x="676" y="244" fill="#3ecf8e" font-family="Inter,sans-serif"
        font-size="12" font-weight="600">+82.7 pts</text>

  <!-- ---- BOTTOM AXIS LINE ---- -->
  <line x1="200" y1="258" x2="720" y2="258" stroke="#2a2a2a" stroke-width="1"/>

</svg>

<div class="legend">
  <div class="legend-item">
    <div class="legend-swatch" style="background:#2a2a2a;"></div>
    Without Substrate
  </div>
  <div class="legend-item">
    <div class="legend-swatch" style="background:#3ecf8e;"></div>
    With Cooperative Substrate
  </div>
</div>

</body>
</html>
```

---

## §4 Component C - Lifecycle Flow Diagram (Pheromones to Stone Tablets)

**Canon refs:**
- `canon_persistent_active_memory_crown_jewel_bp085`
- Eblet / Pheromone / Code Breakers lifecycle

Horizontal flow, 5 stages, 2 decay branches. Pure SVG, inline.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lifecycle Flow - Component C - BP087</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      background: #0a0a0a;
      font-family: 'Inter', sans-serif;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .flow-title {
      color: #e8e8e8;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }
    .flow-subtitle {
      color: #a0a0a0;
      font-size: 14px;
      margin-bottom: 32px;
      text-align: center;
    }
    svg { width: 100%; max-width: 900px; height: auto; overflow: visible; }
  </style>
</head>
<body>

<p class="flow-title">Claim Lifecycle: Pheromone to Stone Tablet</p>
<p class="flow-subtitle">
  How a claim earns permanence on the cooperative substrate
  (canon: canon_persistent_active_memory_crown_jewel_bp085)
</p>

<!-- ================================================================
     COMPONENT C: LIFECYCLE FLOW DIAGRAM
     Canvas: viewBox 0 0 900 340
     Stage boxes: 140 wide, 80 tall
     5 main stages spaced across x: 20, 180, 340, 500, 660 -> right edge 800
     Center y for main row: 100 (box top=60, bottom=140)
     Decay branch y: 240 (box top=200, bottom=280)
     Arrows: main row y=100 (center), decay arrows down from pheromone + triad
     ================================================================ -->

<svg viewBox="0 0 900 340" xmlns="http://www.w3.org/2000/svg"
     role="img" aria-label="Claim lifecycle flow from entry through pheromone salience verification and stone tablet permanence">

  <title>Claim Lifecycle: Pheromone to Stone Tablet</title>

  <!-- DEFS: arrowhead markers -->
  <defs>
    <!-- Green forward arrow -->
    <marker id="arrow-green" markerWidth="10" markerHeight="7"
            refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#3ecf8e"/>
    </marker>
    <!-- Gray decay arrow -->
    <marker id="arrow-gray" markerWidth="10" markerHeight="7"
            refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#4a4a4a"/>
    </marker>
    <!-- Amber arrow (final to stone) -->
    <marker id="arrow-amber" markerWidth="10" markerHeight="7"
            refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f5a623"/>
    </marker>
  </defs>

  <!-- ================================================================
       STAGE 1: Claim Enters (gray)
       Box: x=20, y=60, w=140, h=80
       ================================================================ -->
  <rect x="20" y="60" width="140" height="80" rx="10"
        fill="#374151" stroke="#4b5563" stroke-width="1.5"/>
  <text x="90" y="82" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="22">&#128236;</text>
  <text x="90" y="102" text-anchor="middle" fill="#e8e8e8"
        font-family="Inter,sans-serif" font-size="12" font-weight="600">CLAIM ENTERS</text>
  <text x="90" y="118" text-anchor="middle" fill="#9ca3af"
        font-family="Inter,sans-serif" font-size="10">Eblet created</text>
  <text x="90" y="132" text-anchor="middle" fill="#9ca3af"
        font-family="Inter,sans-serif" font-size="10">Pheromone seeded</text>

  <!-- Arrow: Stage 1 -> Stage 2 -->
  <line x1="162" y1="100" x2="178" y2="100" stroke="#3ecf8e"
        stroke-width="2" marker-end="url(#arrow-green)"/>

  <!-- ================================================================
       STAGE 2: Pheromone (amber)
       Box: x=180, y=60
       ================================================================ -->
  <rect x="180" y="60" width="140" height="80" rx="10"
        fill="#78350f" stroke="#f5a623" stroke-width="1.5"/>
  <text x="250" y="82" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="22">&#127744;</text>
  <text x="250" y="102" text-anchor="middle" fill="#fde68a"
        font-family="Inter,sans-serif" font-size="12" font-weight="600">PHEROMONE</text>
  <text x="250" y="118" text-anchor="middle" fill="#fde68a"
        font-family="Inter,sans-serif" font-size="10">Salience tracked</text>
  <text x="250" y="132" text-anchor="middle" fill="#fde68a"
        font-family="Inter,sans-serif" font-size="10">Decays if ignored</text>

  <!-- Decay arrow DOWN from Stage 2 -->
  <line x1="250" y1="142" x2="250" y2="198" stroke="#4a4a4a"
        stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arrow-gray)"/>
  <!-- Decay label -->
  <text x="258" y="174" fill="#6b7280" font-family="Inter,sans-serif"
        font-size="10">low salience</text>

  <!-- Arrow: Stage 2 -> Stage 3 -->
  <line x1="322" y1="100" x2="338" y2="100" stroke="#3ecf8e"
        stroke-width="2" marker-end="url(#arrow-green)"/>

  <!-- ================================================================
       STAGE 3: Socceri Triad (teal)
       Box: x=340, y=60
       ================================================================ -->
  <rect x="340" y="60" width="140" height="80" rx="10"
        fill="#134e4a" stroke="#2dd4bf" stroke-width="1.5"/>
  <text x="410" y="82" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="22">&#10003;</text>
  <text x="410" y="102" text-anchor="middle" fill="#99f6e4"
        font-family="Inter,sans-serif" font-size="12" font-weight="600">SOCCERI TRIAD</text>
  <text x="410" y="118" text-anchor="middle" fill="#99f6e4"
        font-family="Inter,sans-serif" font-size="10">3x Shadow E-Giant</text>
  <text x="410" y="132" text-anchor="middle" fill="#99f6e4"
        font-family="Inter,sans-serif" font-size="10">vote required</text>

  <!-- Decay arrow DOWN from Stage 3 -->
  <line x1="410" y1="142" x2="410" y2="198" stroke="#4a4a4a"
        stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arrow-gray)"/>
  <text x="418" y="174" fill="#6b7280" font-family="Inter,sans-serif"
        font-size="10">vote fails</text>

  <!-- Arrow: Stage 3 -> Stage 4 -->
  <line x1="482" y1="100" x2="498" y2="100" stroke="#3ecf8e"
        stroke-width="2" marker-end="url(#arrow-green)"/>

  <!-- ================================================================
       STAGE 4: Living Buoyed Claim (light green)
       Box: x=500, y=60
       ================================================================ -->
  <rect x="500" y="60" width="140" height="80" rx="10"
        fill="#052e16" stroke="#86efac" stroke-width="1.5"/>
  <text x="570" y="82" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="22">&#128167;</text>
  <text x="570" y="102" text-anchor="middle" fill="#86efac"
        font-family="Inter,sans-serif" font-size="12" font-weight="600">LIVING BUOYED</text>
  <text x="570" y="118" text-anchor="middle" fill="#86efac"
        font-family="Inter,sans-serif" font-size="10">Active in substrate</text>
  <text x="570" y="132" text-anchor="middle" fill="#86efac"
        font-family="Inter,sans-serif" font-size="10">Code Breaker eligible</text>

  <!-- Arrow: Stage 4 -> Stage 5 (amber, this one is the big win) -->
  <line x1="642" y1="100" x2="658" y2="100" stroke="#f5a623"
        stroke-width="2.5" marker-end="url(#arrow-amber)"/>

  <!-- ================================================================
       STAGE 5: Stone Tablet (deep green, permanent)
       Box: x=660, y=60
       ================================================================ -->
  <rect x="660" y="60" width="140" height="80" rx="10"
        fill="#047857" stroke="#059669" stroke-width="2"/>
  <text x="730" y="82" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="22">&#129704;</text>
  <text x="730" y="102" text-anchor="middle" fill="#d1fae5"
        font-family="Inter,sans-serif" font-size="12" font-weight="700">STONE TABLET</text>
  <text x="730" y="118" text-anchor="middle" fill="#a7f3d0"
        font-family="Inter,sans-serif" font-size="10">Permanent record</text>
  <text x="730" y="132" text-anchor="middle" fill="#a7f3d0"
        font-family="Inter,sans-serif" font-size="10">GOLD_REFINED_BY_FIRE</text>

  <!-- ================================================================
       DECAY LEAF BOXES (bottom row)
       ================================================================ -->

  <!-- Decay Leaf 1: Forgotten (under Stage 2, x=180) -->
  <rect x="200" y="200" width="100" height="48" rx="8"
        fill="#1c0a0a" stroke="#ef4444" stroke-width="1"/>
  <text x="250" y="218" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="16">&#10007;</text>
  <text x="250" y="238" text-anchor="middle" fill="#ef4444"
        font-family="Inter,sans-serif" font-size="11" font-weight="600">Forgotten</text>

  <!-- Decay Leaf 2: Withers (under Stage 3, x=340) -->
  <rect x="360" y="200" width="100" height="48" rx="8"
        fill="#1c0a0a" stroke="#ef4444" stroke-width="1"/>
  <text x="410" y="218" text-anchor="middle" font-family="Inter,sans-serif"
        font-size="16">&#10007;</text>
  <text x="410" y="238" text-anchor="middle" fill="#ef4444"
        font-family="Inter,sans-serif" font-size="11" font-weight="600">Withers</text>

  <!-- ================================================================
       STAGE LABELS (below boxes)
       ================================================================ -->
  <text x="90" y="162" text-anchor="middle" fill="#6b7280"
        font-family="Inter,sans-serif" font-size="10">Stage 1</text>
  <text x="250" y="162" text-anchor="middle" fill="#6b7280"
        font-family="Inter,sans-serif" font-size="10">Stage 2</text>
  <text x="410" y="162" text-anchor="middle" fill="#6b7280"
        font-family="Inter,sans-serif" font-size="10">Stage 3</text>
  <text x="570" y="162" text-anchor="middle" fill="#6b7280"
        font-family="Inter,sans-serif" font-size="10">Stage 4</text>
  <text x="730" y="162" text-anchor="middle" fill="#6b7280"
        font-family="Inter,sans-serif" font-size="10">Stage 5</text>

</svg>

</body>
</html>
```

---

## §5 Component D - Architecture Stack (Reader / Verifier / Accumulator)

**Canon refs:**
- `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085`
- `canon_dedicated_sub_agent_one_role_comptroller_pattern_bp085`
- `canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085`

Vertical stack of 3 cards with amber downward arrows between them.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architecture Stack - Component D - BP087</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0a0a0a;
      color: #e8e8e8;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stack-title {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }
    .stack-subtitle {
      color: #a0a0a0;
      font-size: 14px;
      margin-bottom: 40px;
      text-align: center;
    }

    .arch-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 560px;
      gap: 0;
    }

    /* Individual architecture card */
    .arch-card {
      width: 100%;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .arch-card:hover { background: #232323; }

    .arch-card-top {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }
    .arch-icon {
      font-size: 28px;
      line-height: 1;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .arch-text { flex: 1; }

    .arch-title {
      font-size: 20px;
      font-weight: 700;
      color: #e8e8e8;
      letter-spacing: 0.02em;
      line-height: 1.2;
    }
    .arch-subtitle {
      font-size: 13px;
      color: #a0a0a0;
      margin-top: 3px;
      font-weight: 500;
    }

    /* Plain English one-liner */
    .arch-plain {
      font-size: 15px;
      color: #c0c0c0;
      margin-top: 10px;
      line-height: 1.6;
    }

    /* Mini stat / icon row */
    .arch-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 12px;
      padding: 10px 14px;
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      border-left: 3px solid #2a2a2a;
    }
    .arch-stat {
      display: flex;
      flex-direction: column;
    }
    .arch-stat-value {
      font-size: 16px;
      font-weight: 700;
      color: #3ecf8e;
      line-height: 1.2;
    }
    .arch-stat-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-top: 2px;
    }

    /* Downward arrow connector between cards */
    .arch-arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 36px;
      flex-shrink: 0;
    }
    /* SVG triangle arrow */
    .arch-arrow svg {
      width: 20px;
      height: 16px;
    }

    /* Accent left border variant per card */
    .arch-card--reader  { border-left: 3px solid #3ecf8e; }
    .arch-card--verifier { border-left: 3px solid #f5a623; }
    .arch-card--accum   { border-left: 3px solid #2dd4bf; }
  </style>
</head>
<body>

<p class="stack-title">How It Works: Three-Layer Architecture</p>
<p class="stack-subtitle">
  Each layer is a dedicated callable substrate worker (StitchPunk).
  "Consult, don't Rent." (canon: canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085)
</p>

<!-- ================================================================
     COMPONENT D: ARCHITECTURE STACK
     3 cards + 2 amber downward arrows
     ================================================================ -->

<div class="arch-stack">

  <!-- CARD 1: READER -->
  <div class="arch-card arch-card--reader">
    <div class="arch-card-top">
      <div class="arch-icon">&#128269;</div>
      <div class="arch-text">
        <div class="arch-title">READER</div>
        <div class="arch-subtitle">Gemma 4 12B or Your AI</div>
      </div>
    </div>
    <p class="arch-plain">
      Reads each document in the task batch, extracts the relevant facts,
      and writes a structured summary the Verifier can check. Runs free
      on local hardware for most sessions.
    </p>
    <div class="arch-stats">
      <div class="arch-stat">
        <span class="arch-stat-value">Free</span>
        <span class="arch-stat-label">default model tier</span>
      </div>
      <div class="arch-stat">
        <span class="arch-stat-value">Local</span>
        <span class="arch-stat-label">no API cost</span>
      </div>
      <div class="arch-stat">
        <span class="arch-stat-value">Swappable</span>
        <span class="arch-stat-label">CCI brain-swap compatible</span>
      </div>
    </div>
  </div>

  <!-- Arrow 1 -> 2 -->
  <div class="arch-arrow" aria-hidden="true">
    <svg viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,16 0,0 20,0" fill="#f5a623"/>
    </svg>
  </div>

  <!-- CARD 2: VERIFIER -->
  <div class="arch-card arch-card--verifier">
    <div class="arch-card-top">
      <div class="arch-icon">&#9878;&#65039;</div>
      <div class="arch-text">
        <div class="arch-title">VERIFIER</div>
        <div class="arch-subtitle">Shadow E-Giant Concordance</div>
      </div>
    </div>
    <p class="arch-plain">
      Three independent AI agents each vote on whether the Reader's summary
      is accurate. Two of three must agree before the claim advances.
      Disagreement triggers escalation, not silent failure.
    </p>
    <div class="arch-stats">
      <div class="arch-stat">
        <span class="arch-stat-value">3</span>
        <span class="arch-stat-label">parallel votes</span>
      </div>
      <div class="arch-stat">
        <span class="arch-stat-value">2-of-3</span>
        <span class="arch-stat-label">must agree</span>
      </div>
      <div class="arch-stat">
        <span class="arch-stat-value">Ascending Andon</span>
        <span class="arch-stat-label">escalates, never guesses</span>
      </div>
    </div>
  </div>

  <!-- Arrow 2 -> 3 -->
  <div class="arch-arrow" aria-hidden="true">
    <svg viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,16 0,0 20,0" fill="#f5a623"/>
    </svg>
  </div>

  <!-- CARD 3: ACCUMULATOR -->
  <div class="arch-card arch-card--accum">
    <div class="arch-card-top">
      <div class="arch-icon">&#128451;&#65039;</div>
      <div class="arch-text">
        <div class="arch-title">ACCUMULATOR</div>
        <div class="arch-subtitle">Eblet Store JSONL</div>
      </div>
    </div>
    <p class="arch-plain">
      Verified claims are written to disk as Eblets: compact, addressed,
      pheromone-seeded knowledge units. They persist across sessions,
      across AI vendors, and across version upgrades. Your work does not
      reset when the model changes.
    </p>
    <div class="arch-stats">
      <div class="arch-stat">
        <span class="arch-stat-value">Disk-backed</span>
        <span class="arch-stat-label">never lost in context</span>
      </div>
      <div class="arch-stat">
        <span class="arch-stat-value">Vendor-resilient</span>
        <span class="arch-stat-label">works across all AI providers</span>
      </div>
      <div class="arch-stat">
        <span class="arch-stat-value">JSONL</span>
        <span class="arch-stat-label">open, auditable format</span>
      </div>
    </div>
  </div>

</div>

</body>
</html>
```

---

## §6 Component E - Scannable Proof Cards (Pinned Proof Receipts)

**Canon refs:**
- `canon_ascending_andon_right_fast_cheap_discipline_bp085` (97.1% / ~70min / $0)
- Storm Test receipt (20/20 - 16.6ms p50)
- Banyan Metric Ledger

CSS Grid: 3 columns desktop, 1 column mobile. Hover lightens card. Expandable audit trail.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proof Cards - Component E - BP087</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0a0a0a;
      color: #e8e8e8;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      padding: 48px 24px;
    }

    .proof-section-title {
      font-size: 22px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 8px;
    }
    .proof-section-sub {
      color: #a0a0a0;
      font-size: 14px;
      text-align: center;
      margin-bottom: 32px;
    }

    /* CSS Grid wrapper */
    .proof-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 960px;
      margin: 0 auto;
    }
    @media (max-width: 720px) {
      .proof-grid { grid-template-columns: 1fr; }
    }

    /* Individual proof card */
    .proof-card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      transition: background 200ms cubic-bezier(0.4,0,0.2,1),
                  border-color 200ms cubic-bezier(0.4,0,0.2,1);
      position: relative;
    }
    .proof-card:hover { background: #232323; border-color: #3a3a3a; }

    /* Headline metric */
    .proof-metric {
      font-size: 32px;
      font-weight: 700;
      color: #3ecf8e;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }

    /* Card title */
    .proof-card-title {
      font-size: 15px;
      font-weight: 600;
      color: #e8e8e8;
      margin-top: 4px;
    }

    /* Plain English one-liner */
    .proof-card-desc {
      font-size: 14px;
      color: #a0a0a0;
      line-height: 1.5;
      margin-top: 2px;
    }

    /* Bottom row: badge + link */
    .proof-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #2a2a2a;
    }

    .badge-verified {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(62,207,142,0.12);
      color: #3ecf8e;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
      border: 1px solid rgba(62,207,142,0.3);
      letter-spacing: 0.04em;
    }

    .proof-card-link {
      color: #a0a0a0;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: color 200ms;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      padding: 0;
    }
    .proof-card-link:hover { color: #f5a623; }

    /* Expandable audit trail */
    .proof-audit {
      overflow: hidden;
      max-height: 0;
      transition: max-height 350ms cubic-bezier(0.4,0,0.2,1),
                  opacity 300ms cubic-bezier(0.4,0,0.2,1);
      opacity: 0;
    }
    .proof-audit.open {
      max-height: 400px;
      opacity: 1;
    }
    .proof-audit-inner {
      margin-top: 12px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.02);
      border-radius: 6px;
      border-left: 3px solid #f5a623;
    }
    .proof-audit-inner p {
      font-size: 13px;
      color: #a0a0a0;
      margin-bottom: 6px;
      line-height: 1.5;
    }
    .proof-audit-inner p:last-child { margin-bottom: 0; }
    .proof-audit-inner strong { color: #e8e8e8; }
  </style>
</head>
<body>

<p class="proof-section-title">Pinned Proof Receipts</p>
<p class="proof-section-sub">
  Every number here is disk-backed. Click "View receipts" to expand the audit trail.
  (canon: canon_ascending_andon_right_fast_cheap_discipline_bp085)
</p>

<!-- ================================================================
     COMPONENT E: PROOF CARDS GRID
     3 cards: Storm Test / Mesh Proof / Benchmark R10
     ================================================================ -->

<div class="proof-grid">

  <!-- CARD 1: Storm Test -->
  <div class="proof-card" id="proof-storm">
    <div class="proof-metric">20/20 &middot; 16.6 ms</div>
    <div class="proof-card-title">Storm Test</div>
    <p class="proof-card-desc">
      A node answered correctly for data it never held locally. All 20 requests
      resolved at 16.6 ms median across 5 peers under simultaneous load.
    </p>

    <div class="proof-card-footer">
      <span class="badge-verified">&#10003; VERIFIED</span>
      <button class="proof-card-link"
              onclick="toggleAudit('proof-storm', this)">
        View receipts &#8595;
      </button>
    </div>

    <div class="proof-audit" id="proof-storm-audit">
      <div class="proof-audit-inner">
        <p><strong>Test date:</strong> BP087 session batch</p>
        <p><strong>Method:</strong> 20 concurrent requests to a peer node with zero local
           copies of the target data. Substrate routed each to the holding peer via
           relay.lianabanyan.com (WAN roundtrip, not LAN shortcut per
           canon_lan_as_wan_test_mode_4_machine_mesh_bp085).</p>
        <p><strong>Result:</strong> 20/20 correct. p50 latency 16.6 ms. p99 latency 41 ms.</p>
        <p><strong>Receipt file:</strong> BISHOP_DROPZONE/STORM_TEST_RECEIPT_BP087.md</p>
      </div>
    </div>
  </div>

  <!-- CARD 2: Mesh Proof -->
  <div class="proof-card" id="proof-mesh">
    <div class="proof-metric">97.1% &middot; 68/70</div>
    <div class="proof-card-title">Mesh Proof</div>
    <p class="proof-card-desc">
      68 of 70 staggered single-domain connections verified end-to-end. Tested
      one domain at a time, then connected. 14-domain methodology.
    </p>

    <div class="proof-card-footer">
      <span class="badge-verified">&#10003; VERIFIED</span>
      <button class="proof-card-link"
              onclick="toggleAudit('proof-mesh', this)">
        View receipts &#8595;
      </button>
    </div>

    <div class="proof-audit" id="proof-mesh-audit">
      <div class="proof-audit-inner">
        <p><strong>Test date:</strong> BP085 receipt</p>
        <p><strong>Method:</strong> Staggered single-domain methodology. 14 domains tested
           one at a time sequentially, then connected. 68/70 = 97.1%. Two failures were
           TLS configuration mismatches caught by the WAN-roundtrip constraint (would have
           been invisible on LAN-local tests).</p>
        <p><strong>Canon ref:</strong> canon_staggered_single_domains_14_domain_methodology_bp085</p>
        <p><strong>PROV claim:</strong> PROV_23 claim in progress</p>
      </div>
    </div>
  </div>

  <!-- CARD 3: Benchmark R10 -->
  <div class="proof-card" id="proof-r10">
    <div class="proof-metric">43% &middot; 16 min</div>
    <div class="proof-card-title">Benchmark R10 (Context Drag)</div>
    <p class="proof-card-desc">
      Five parallel AI streams used only 43% of the available context window,
      down from 86% without substrate merging. Completed in 16 minutes wall-clock.
    </p>

    <div class="proof-card-footer">
      <span class="badge-verified">&#10003; VERIFIED</span>
      <button class="proof-card-link"
              onclick="toggleAudit('proof-r10', this)">
        View receipts &#8595;
      </button>
    </div>

    <div class="proof-audit" id="proof-r10-audit">
      <div class="proof-audit-inner">
        <p><strong>Test date:</strong> BP087 session</p>
        <p><strong>Method:</strong> 5 MAMBA reasoning streams dispatched in parallel with
           substrate-merged shared context. Banyan Metric "Knight context drag" measurement
           protocol. Compared against BP063 baseline (same 5 streams, no merging = 86%).</p>
        <p><strong>Inequality confirmed:</strong> BP063 86% vs BP087 43% = 50% reduction
           in context consumption.</p>
        <p><strong>Canon ref:</strong>
           canon_substrate_enables_merged_reasoning_requests_43pct_knight_context_drag_reduction_bp087</p>
      </div>
    </div>
  </div>

</div>

<script>
  function toggleAudit(cardId, btn) {
    const audit = document.getElementById(cardId + '-audit');
    const isOpen = audit.classList.toggle('open');
    btn.textContent = isOpen ? 'Hide receipts ↑' : 'View receipts ↓';
  }
</script>
</body>
</html>
```

---

## §7 Component F - Callout Box (Caveats, Methodology)

Used for SmartScreen warnings, methodology notes, and important caveats. Left amber accent border. Drop anywhere in a page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Callout Box - Component F - BP087</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #e8e8e8;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      padding: 48px 24px;
      max-width: 720px;
      margin: 0 auto;
    }

    /* ================================================================
       COMPONENT F: CALLOUT BOX
       Reuse class: .callout
       Variants: .callout--warning (amber), .callout--info (teal),
                 .callout--verified (green)
       ================================================================ */

    .callout {
      background: #1a1a1a;
      border-left: 4px solid #f5a623;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }
    .callout--info    { border-left-color: #2dd4bf; }
    .callout--verified { border-left-color: #3ecf8e; }

    .callout-icon {
      font-size: 20px;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .callout-body { flex: 1; }

    .callout-title {
      font-size: 14px;
      font-weight: 700;
      color: #f5a623;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .callout--info    .callout-title { color: #2dd4bf; }
    .callout--verified .callout-title { color: #3ecf8e; }

    .callout-text {
      font-size: 15px;
      color: #c0c0c0;
      font-style: italic;
      line-height: 1.6;
    }
    .callout-text strong { color: #e8e8e8; font-style: normal; }

    /* Steps list inside a callout */
    .callout-steps {
      list-style: none;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .callout-steps li {
      font-size: 14px;
      color: #c0c0c0;
      font-style: normal;
      display: flex;
      gap: 8px;
    }
    .callout-steps li .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f5a623;
      color: #000;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 3px;
    }
  </style>
</head>
<body>

<!-- ================================================================
     EXAMPLE 1: SmartScreen Warning (most common use on download page)
     ================================================================ -->
<div class="callout" role="note" aria-label="Windows SmartScreen notice">
  <div class="callout-icon">&#128274;</div>
  <div class="callout-body">
    <div class="callout-title">One quick thing about Windows SmartScreen</div>
    <p class="callout-text">
      Dr. MnemosyneC is signed by <strong>Liana Banyan Corporation</strong>
      but is not yet enrolled in Microsoft SmartScreen (code-signing is in progress).
      Windows may show a blue "Windows protected your PC" dialog.
    </p>
    <ol class="callout-steps">
      <li>
        <span class="step-num">1</span>
        Click <strong>"More info"</strong> in the SmartScreen dialog.
      </li>
      <li>
        <span class="step-num">2</span>
        Click <strong>"Run anyway"</strong> to proceed with the install.
      </li>
      <li>
        <span class="step-num">3</span>
        If your organization's IT policy blocks this, contact your admin.
        The installer hash is listed in our public receipt ledger.
      </li>
    </ol>
  </div>
</div>

<br>

<!-- ================================================================
     EXAMPLE 2: Methodology note (reuse for any caveat block)
     ================================================================ -->
<div class="callout callout--info" role="note" aria-label="Methodology note">
  <div class="callout-icon">&#128202;</div>
  <div class="callout-body">
    <div class="callout-title">Methodology</div>
    <p class="callout-text">
      All benchmark numbers are produced by the
      <strong>Ascending Andon</strong> protocol: the system refuses to guess and
      escalates to a human when confidence is below threshold. Receipt files are
      disk-backed JSONL under <strong>BISHOP_DROPZONE/</strong> and are
      Code-Breaker-verified before being marked GOLD_REFINED_BY_FIRE.
    </p>
  </div>
</div>

</body>
</html>
```

---

## §7B Component G - Commercial License Offer Card

**Canon refs:**
- `canon_android_of_ai_four_layer_licensing_model_bp087` (SEG-AA)
- `canon_30_day_commercial_license_offer_letter_campaign_bp087` (SEG-BB)
- `canon_star_chamber_multi_agent_consensus_verification_product_bp086` (10x work-per-token receipt)
- Pledge #2260 (Upekrithen LLC patent peace)

Used on the /licensing page and on Founder outreach pages. Visually distinct from cooperative-class member cards. Shows a 30-day countdown, the 50 percent discount, the empirical math that justifies the savings, and a single contact CTA. Dark surface with amber accent border signals commercial tier, not cooperative tier.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commercial License Offer Card - Component G - BP087</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #0a0a0a;
      color: #e8e8e8;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 17px;
      line-height: 1.7;
      padding: 48px 24px;
      display: flex;
      justify-content: center;
    }

    /* ================================================================
       COMPONENT G: COMMERCIAL LICENSE OFFER CARD
       720px wide, dark surface #1a1a1a, 2px amber accent border #f5a623
       padding 32px, radius 12px
       Canon refs:
         canon_android_of_ai_four_layer_licensing_model_bp087 (SEG-AA)
         canon_30_day_commercial_license_offer_letter_campaign_bp087 (SEG-BB)
       ================================================================ */

    .offer-card {
      width: 100%;
      max-width: 720px;
      background: #1a1a1a;
      border: 2px solid #f5a623;
      border-radius: 12px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ---- TOP ROW: eyebrow label + countdown badge ---- */
    .offer-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .offer-eyebrow {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #f5a623;
    }

    /* Countdown badge: amber pill with inline SVG clock icon */
    .offer-countdown-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f5a623;
      color: #000;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 999px;
      letter-spacing: 0.04em;
    }

    .offer-countdown-badge svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    /* ---- HEADLINE ---- */
    .offer-headline {
      font-size: 28px;
      font-weight: 700;
      color: #e8e8e8;
      line-height: 1.25;
    }

    .offer-subline {
      font-size: 16px;
      color: #a0a0a0;
      margin-top: 8px;
      line-height: 1.5;
    }

    /* ---- BLOCK A: offer headline block ---- */
    .offer-block-a {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .offer-block-a-eyebrow {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #f5a623;
    }

    .offer-block-a-headline {
      font-size: 22px;
      font-weight: 700;
      color: #e8e8e8;
      line-height: 1.25;
    }

    .offer-block-a-subheadline {
      font-size: 14px;
      color: #a0a0a0;
      line-height: 1.5;
    }

    /* ---- BLOCK B: decay schedule table ---- */
    .offer-decay-table {
      width: 100%;
      border-collapse: collapse;
    }

    .offer-decay-table thead tr {
      border-bottom: 1px solid #333;
    }

    .offer-decay-table thead th {
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666;
      text-align: left;
    }

    .offer-decay-table tbody tr {
      border-bottom: 1px solid #222;
      transition: background 100ms;
    }

    .offer-decay-table tbody tr:last-child {
      border-bottom: none;
    }

    .offer-decay-table tbody td {
      padding: 11px 10px;
      font-size: 14px;
      vertical-align: middle;
      color: #a0a0a0;
    }

    .offer-decay-table tbody td:first-child {
      font-weight: 600;
      color: #c0c0c0;
    }

    .offer-decay-table tbody td:last-child {
      text-align: right;
      font-weight: 600;
    }

    /* Active row: Window 1 -- amber left border, brighter text */
    .offer-decay-table tr.decay-active {
      border-left: 3px solid #f5a623;
      background: rgba(245, 166, 35, 0.06);
    }

    .offer-decay-table tr.decay-active td {
      color: #f5a623;
    }

    /* Progressive dimming: Window 2 through 5 */
    .offer-decay-table tr.decay-w2 td { opacity: 0.85; }
    .offer-decay-table tr.decay-w3 td { opacity: 0.70; }
    .offer-decay-table tr.decay-w4 td { opacity: 0.55; }
    .offer-decay-table tr.decay-w5 td { opacity: 0.40; }

    /* Closed row: gray, discount shown with strikethrough */
    .offer-decay-table tr.decay-closed td {
      color: #555;
      opacity: 0.7;
    }

    .offer-decay-table tr.decay-closed .decay-strike {
      text-decoration: line-through;
      color: #555;
    }

    /* ---- FOOTER ROW: Saladin-mercy pill + CTA button ---- */
    .offer-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid #2a2a2a;
    }

    /* Saladin-mercy pill: green, signals patent peace */
    .saladin-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(62, 207, 142, 0.12);
      color: #3ecf8e;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid rgba(62, 207, 142, 0.3);
    }

    .saladin-pill svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    /* CTA button */
    .offer-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f5a623;
      color: #000;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .offer-cta-btn:hover { opacity: 0.85; }
  </style>
</head>
<body>

<!-- ================================================================
     COMPONENT G: COMMERCIAL LICENSE OFFER CARD
     Canon: canon_30_day_commercial_license_offer_letter_campaign_bp087 (SEG-BB)
     Canon: canon_android_of_ai_four_layer_licensing_model_bp087 (SEG-AA)
     Empirical receipt for 10x: canon_star_chamber_multi_agent_consensus_
       verification_product_bp086
     ================================================================ -->

<div class="offer-card" role="region" aria-label="Commercial License Offer">

  <!-- TOP ROW: eyebrow + countdown badge -->
  <div class="offer-top-row">
    <span class="offer-eyebrow">Commercial License Offer</span>

    <span class="offer-countdown-badge">
      <!-- Inline SVG clock icon -->
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
           fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      30-day window
    </span>
  </div>

  <!-- BLOCK A: OFFER WINDOW label + headline + subheadline -->
  <div class="offer-block-a">
    <span class="offer-block-a-eyebrow">OFFER WINDOW</span>
    <h2 class="offer-block-a-headline">50 percent off commercial licensing fees</h2>
    <p class="offer-block-a-subheadline">Term decays from 5 years to 1 year as you wait</p>
  </div>

  <!-- BLOCK B: decay schedule table -->
  <!-- Canon: canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087 §3.5 -->
  <!-- Founder direct BP087 verbatim: "the 50% if good for 5 years, but it decreases a year at a time for each additional delay period you don't take advantage." -->
  <table class="offer-decay-table" aria-label="Licensing discount decay schedule">
    <thead>
      <tr>
        <th>Window</th>
        <th>Days from letter</th>
        <th>Discount term</th>
      </tr>
    </thead>
    <tbody>
      <tr class="decay-active">
        <td>Window 1 (initial)</td>
        <td>0 to 30</td>
        <td>50% off for 5 years</td>
      </tr>
      <tr class="decay-w2">
        <td>Window 2</td>
        <td>31 to 60</td>
        <td>50% off for 4 years</td>
      </tr>
      <tr class="decay-w3">
        <td>Window 3</td>
        <td>61 to 90</td>
        <td>50% off for 3 years</td>
      </tr>
      <tr class="decay-w4">
        <td>Window 4</td>
        <td>91 to 120</td>
        <td>50% off for 2 years</td>
      </tr>
      <tr class="decay-w5">
        <td>Window 5</td>
        <td>121 to 150</td>
        <td>50% off for 1 year</td>
      </tr>
      <tr class="decay-closed">
        <td>After day 150</td>
        <td>151 plus</td>
        <td><span class="decay-strike">50%</span> full FRAND rate</td>
      </tr>
    </tbody>
  </table>

  <!-- FOOTER ROW: Saladin-mercy pill + CTA -->
  <div class="offer-footer-row">

    <!-- Saladin-mercy pill: patent peace signal -->
    <span class="saladin-pill" role="note" aria-label="Patent peace notice">
      <!-- Inline SVG shield icon -->
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
           fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      Pledge #2260 patent peace included
    </span>

    <!-- CTA: contact Upekrithen LLC -->
    <a href="mailto:hello@upekrithen.com" class="offer-cta-btn">
      Contact Upekrithen LLC
      <!-- Inline SVG arrow -->
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
           width="14" height="14" fill="none" stroke="currentColor"
           stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
           aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </svg>
    </a>

  </div>

</div>

</body>
</html>
```

**Reuse notes:**
- The countdown badge text ("30-day window") must be updated dynamically at build time to show actual days remaining from the campaign open date. Hugo shortcode or JS date calc both work.
- The CTA href `mailto:hello@upekrithen.com` is the canonical contact for commercial licensing inquiries (BP087). Do not substitute Liana Banyan Corporation email here.
- The 10x figure in row 1 traces to the Star Chamber multi-agent consensus receipt (canon_star_chamber_multi_agent_consensus_verification_product_bp086). Do not change without a new canon receipt.
- The Saladin-mercy pill signals conditional patent peace per Pledge #2260. The green color is intentional: it is the cooperative green accent, not a danger or warning signal.

---

## §7C /licensing Page Recipe (new dedicated page on mnemosynec.org)

**Page slug:** `/licensing` (also serves `/license` -- both URLs same content)
**Hugo template:** standalone page template, `layouts/licensing/single.html`
**Components used:** Component A (flip cards), Component F (callout boxes), Component G (offer card)
**No new components needed beyond A, F, G.**

**Canon refs:**
- `canon_android_of_ai_four_layer_licensing_model_bp087` (SEG-AA)
- `canon_30_day_commercial_license_offer_letter_campaign_bp087` (SEG-BB)
- Pledge #2260 (Upekrithen LLC)
- SSPL v1 Section 13 (SaaS clause forcing function)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Licensing - MnemosyneC</title>
  <meta name="description"
        content="MnemosyneC is licensed under SSPL v1 for personal and cooperative use, Apache 2.0 for library extractions, and commercially via Upekrithen LLC. Pledge 2260 covers patent peace for all users.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* === PASTE §1 TOKENS IN PRODUCTION === */
    :root {
      --bg-primary: #0a0a0a; --bg-secondary: #1a1a1a; --bg-border: #2a2a2a;
      --fg-primary: #e8e8e8; --fg-dim: #a0a0a0;
      --accent-amber: #f5a623; --accent-green: #3ecf8e; --accent-teal: #2dd4bf;
      --font-family: 'Inter', -apple-system, sans-serif;
      --content-max-w: 720px;
      --radius-card: 8px; --radius-cta: 12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-primary);
      color: var(--fg-primary);
      font-family: var(--font-family);
      font-size: 17px;
      line-height: 1.7;
    }
    .page-section {
      padding: 80px 24px;
      max-width: var(--content-max-w);
      margin: 0 auto;
    }
    .page-section--wide {
      padding: 80px 24px;
      max-width: 860px;
      margin: 0 auto;
    }
    .section-eyebrow {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent-amber);
      margin-bottom: 16px;
    }
    h1 {
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 26px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    p { margin-bottom: 16px; color: var(--fg-dim); }
    p:last-child { margin-bottom: 0; }
    strong { color: var(--fg-primary); }
    a { color: var(--accent-amber); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ---- 4-LAYER TABLE ---- */
    .license-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      font-size: 15px;
    }
    .license-table th {
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--fg-dim);
      border-bottom: 1px solid var(--bg-border);
    }
    .license-table td {
      padding: 14px 12px;
      vertical-align: top;
      border-bottom: 1px solid var(--bg-border);
      color: var(--fg-dim);
      line-height: 1.55;
    }
    .license-table td:first-child { color: var(--fg-primary); font-weight: 600; }
    .license-table tr:last-child td { border-bottom: none; }

    /* ---- CALLOUT (Component F, inline tokens) ---- */
    .callout {
      background: var(--bg-secondary);
      border-left: 4px solid var(--accent-amber);
      border-radius: 0 8px 8px 0;
      padding: 20px 24px;
      margin: 0;
    }
    .callout--info  { border-left-color: var(--accent-teal); }
    .callout--green { border-left-color: var(--accent-green); }
    .callout-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent-amber);
      margin-bottom: 8px;
    }
    .callout--info  .callout-title { color: var(--accent-teal); }
    .callout--green .callout-title { color: var(--accent-green); }
    .callout-body {
      font-size: 15px;
      color: #c0c0c0;
      line-height: 1.65;
    }
    .callout-body strong { color: var(--fg-primary); }

    /* ---- FAQ FLIP CARDS (Component A, simplified inline) ---- */
    .faq-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }
    .flip-card {
      perspective: 1200px;
      width: 100%;
      min-height: 120px;
    }
    .flip-card-inner {
      position: relative;
      width: 100%;
      min-height: 120px;
      transform-style: preserve-3d;
      transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .flip-card.flipped .flip-card-inner {
      transform: rotateY(180deg);
    }
    .flip-card-front,
    .flip-card-back {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      min-height: 120px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      background: var(--bg-secondary);
      border: 1px solid var(--bg-border);
      border-radius: var(--radius-card);
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .flip-card-back { transform: rotateY(180deg); }
    .faq-question {
      font-size: 17px;
      font-weight: 600;
      color: var(--fg-primary);
      margin-bottom: 10px;
    }
    .faq-plain {
      font-size: 15px;
      color: var(--fg-dim);
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .faq-detail {
      font-size: 14px;
      color: var(--fg-dim);
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .btn-flip-faq {
      align-self: flex-end;
      background: none;
      border: 1px solid var(--bg-border);
      border-radius: 6px;
      color: var(--accent-amber);
      font-family: var(--font-family);
      font-size: 13px;
      font-weight: 500;
      padding: 5px 12px;
      cursor: pointer;
      transition: border-color 200ms, background 200ms;
    }
    .btn-flip-faq:hover {
      border-color: var(--accent-amber);
      background: rgba(245,166,35,0.07);
    }
    .btn-back-faq {
      align-self: flex-start;
      background: none;
      border: 1px solid var(--bg-border);
      border-radius: 6px;
      color: var(--fg-dim);
      font-family: var(--font-family);
      font-size: 13px;
      font-weight: 500;
      padding: 5px 12px;
      cursor: pointer;
    }

    /* Android-of-AI flip card (Section 3) */
    .android-card {
      perspective: 1200px;
      max-width: var(--content-max-w);
      min-height: 180px;
      margin: 24px 0;
    }
    .android-card-inner {
      position: relative;
      width: 100%;
      min-height: 180px;
      transform-style: preserve-3d;
      transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    .android-card.flipped .android-card-inner {
      transform: rotateY(180deg);
    }
    .android-card-front,
    .android-card-back {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      min-height: 180px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      background: var(--bg-secondary);
      border: 1px solid var(--bg-border);
      border-radius: var(--radius-card);
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
    }
    .android-card-back { transform: rotateY(180deg); }
    .android-front-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--fg-primary);
      margin-bottom: 12px;
    }
    .android-front-detail {
      font-size: 15px;
      color: var(--fg-dim);
      line-height: 1.65;
      flex: 1;
      margin-bottom: 16px;
    }

    /* ---- OFFER CARD WRAPPER (Component G) ---- */
    .offer-section {
      padding: 80px 24px;
      max-width: 780px;
      margin: 0 auto;
    }

    /* ---- FOOTER CONTACT + LITURGY ---- */
    .contact-section {
      padding: 80px 24px;
      max-width: var(--content-max-w);
      margin: 0 auto;
      text-align: center;
    }
    .contact-headline {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .contact-email {
      font-size: 16px;
      color: var(--accent-amber);
    }
    footer {
      border-top: 1px solid var(--bg-border);
      padding: 48px 24px;
      text-align: center;
    }
    .closing-liturgy {
      font-size: 14px;
      color: var(--fg-dim);
      font-style: italic;
      line-height: 2;
      max-width: 480px;
      margin: 0 auto 16px;
    }
    .closing-byline {
      font-size: 13px;
      color: var(--fg-dim);
      opacity: 0.6;
    }
    .footer-links {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 20px;
    }
    .footer-links a {
      font-size: 13px;
      color: var(--fg-dim);
    }
    .footer-links a:hover { color: var(--accent-amber); }
  </style>
</head>
<body>

<!-- ================================================================
     SECTION 1: HERO
     Eyebrow: "Licensing"
     Headline: "How MnemosyneC is licensed."
     One-liner below headline.
     ================================================================ -->
<section class="page-section" aria-label="Licensing hero">
  <p class="section-eyebrow">Licensing</p>
  <h1>How MnemosyneC is licensed.</h1>
  <p style="font-size:18px; color:#c0c0c0; margin-bottom:0;">
    Free under SSPL for everyone. Apache for library extractions.
    Patent peace via Pledge #2260. Trademarks held by Upekrithen LLC.
  </p>
</section>


<!-- ================================================================
     SECTION 2: THE 4-LAYER TABLE
     Canon: canon_android_of_ai_four_layer_licensing_model_bp087 (SEG-AA)
     ================================================================ -->
<section class="page-section--wide" aria-label="Four-layer license table">
  <h2>The four layers</h2>
  <table class="license-table" aria-label="MnemosyneC four-layer licensing breakdown">
    <thead>
      <tr>
        <th>Layer</th>
        <th>License</th>
        <th>Who it serves</th>
        <th>What it requires</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Substrate node and installer</td>
        <td>SSPL v1</td>
        <td>Everyone, free</td>
        <td>
          If you wrap it as a service, you must open-source your entire
          service stack (Section 13)
        </td>
      </tr>
      <tr>
        <td>Library extractions and reference implementations</td>
        <td>Apache 2.0</td>
        <td>For-profit AI integrations</td>
        <td>Attribution only</td>
      </tr>
      <tr>
        <td>Patents (Upekrithen LLC, 2,700+ claims)</td>
        <td>Cooperative Defensive Patent Pledge #2260</td>
        <td>Everyone</td>
        <td>
          Patent peace conditional on not suing a cooperative member
        </td>
      </tr>
      <tr>
        <td>Trademarks (MnemosyneC, Dr. Mnemosynec, Liana Banyan, Cephas)</td>
        <td>TUP Full-Exclusive</td>
        <td>Everyone</td>
        <td>
          Written permission required; non-licensable for forks or derivatives
        </td>
      </tr>
    </tbody>
  </table>
</section>


<!-- ================================================================
     SECTION 3: THE ANDROID-OF-AI EXPLANATION
     Component A flip card pattern.
     Canon: canon_android_of_ai_four_layer_licensing_model_bp087 (SEG-AA)
     ================================================================ -->
<section class="page-section" aria-label="Android of AI explanation">
  <h2>We use the Android licensing model.</h2>
  <p>
    The Android ecosystem is the closest commercial analogy. Open core with
    controlled surface layers. This is how it maps.
  </p>

  <!-- Component A flip card: Android-of-AI -->
  <div class="android-card" id="card-android">
    <div class="android-card-inner">

      <!-- FRONT -->
      <div class="android-card-front">
        <div class="android-front-title">We use the Android licensing model.</div>
        <p class="android-front-detail">
          <strong>AOSP equivalent:</strong> SSPL v1 node and installer, free for
          everyone who does not wrap it as a SaaS product.<br><br>
          <strong>GMS equivalent (live cooperative substrate):</strong> The substrate
          itself; members get personalization, CREW access, bounty eligibility, and
          Marks economy. Non-members get full substrate read and mesh participation
          at base tier free.<br><br>
          <strong>Google patents equivalent (Pledge #2260):</strong> Defensive
          cross-license to 2,700+ Upekrithen LLC patent claims; revoked if you
          sue a cooperative member.<br><br>
          <strong>Trademark control (TUP):</strong> MnemosyneC, Dr. Mnemosynec,
          Liana Banyan, Cephas. Non-licensable for forks. Use a different name.
        </p>
        <button class="btn-flip-faq" onclick="flipCard('card-android')">
          Technical Detail &#8594;
        </button>
      </div>

      <!-- BACK -->
      <div class="android-card-back">
        <div class="android-front-title">Android-of-AI: canon anchor</div>
        <p class="android-front-detail">
          The full structural analysis is recorded in the BP087 Android-of-AI
          canon eblet. The four-layer mapping (SSPL node / cooperative substrate /
          Pledge #2260 / TUP trademarks) is Founder-ratified and Code-Breaker-eligible.
          SEG-AA minted the dedicated canon slug. SEG-BB minted the 30-day offer canon.
          Both are disk-backed under BISHOP_DROPZONE/STATE/EBLETS/CANON/.
        </p>
        <p class="android-front-detail">
          Canon slug: <strong>canon_android_of_ai_four_layer_licensing_model_bp087</strong>
        </p>
        <button class="btn-back-faq" onclick="flipCard('card-android')">
          &#8592; Back
        </button>
      </div>

    </div>
  </div>
</section>


<!-- ================================================================
     SECTION 4: SSPL SECTION 13 IN PLAIN ENGLISH
     Component F callout.
     Canon: SSPL v1 Section 13 (SaaS clause forcing function)
     ================================================================ -->
<section class="page-section" aria-label="SSPL Section 13 explanation">
  <h2>What SSPL Section 13 means in practice.</h2>

  <!-- Component F callout -->
  <div class="callout" role="note" aria-label="SSPL Section 13 plain English">
    <div class="callout-title">What Section 13 means in practice</div>
    <div class="callout-body">
      <p>
        If you wrap MnemosyneC as a service offered to anyone outside your own
        organization, SSPL Section 13 requires you to release your entire
        service-stack source code under SSPL.
      </p>
      <p>
        <strong>We do not interpret this as a trap. It is a forcing function.</strong>
        You either open-source your stack or you license commercially. Internal
        R&amp;D, integration work, and personal use are not affected.
      </p>
    </div>
  </div>
</section>


<!-- ================================================================
     SECTION 5: COMMERCIAL LICENSE OFFER (Component G)
     Canon: canon_30_day_commercial_license_offer_letter_campaign_bp087 (SEG-BB)
     ================================================================ -->
<section class="offer-section" aria-label="Commercial license offer">
  <h2>Commercial licensing: 30-day offer.</h2>
  <p style="margin-bottom:32px;">
    If Section 13 applies to your product and you prefer a commercial license,
    a 50 percent discount is available within 30 days of receiving your offer letter.
    Standard FRAND rate applies after the window closes.
  </p>

  <!-- [INSERT COMPONENT G OFFER CARD HERE - see §7B for full copy-pasteable block] -->
  <!-- Paste the .offer-card div from §7B directly below this comment. -->
  <div style="background:#1a1a1a;border:2px dashed #f5a623;border-radius:12px;
              padding:32px;text-align:center;color:#a0a0a0;font-size:14px;">
    [Paste Component G commercial license offer card from §7B]
  </div>
</section>


<!-- ================================================================
     SECTION 6: PLEDGE #2260 IN PLAIN ENGLISH
     Component F callout (green variant).
     ================================================================ -->
<section class="page-section" aria-label="Pledge 2260 patent peace">
  <h2>Patent peace, conditional.</h2>

  <div class="callout callout--green" role="note" aria-label="Pledge 2260 plain English">
    <div class="callout-title">Patent peace, conditional</div>
    <div class="callout-body">
      <p>
        We hold <strong>2,700+ patent claims</strong> via Upekrithen LLC. Under
        Pledge #2260 every user receives a defensive cross-license to those claims.
      </p>
      <p>
        The cross-license is revoked the moment you initiate patent litigation against
        any cooperative member. We compete fair. We do not strike first.
      </p>
    </div>
  </div>
</section>


<!-- ================================================================
     SECTION 7: TRADEMARKS IN PLAIN ENGLISH
     Component F callout (info/teal variant).
     ================================================================ -->
<section class="page-section" aria-label="Trademark policy">
  <h2>Trademarks belong to Upekrithen LLC.</h2>

  <div class="callout callout--info" role="note" aria-label="Trademark policy plain English">
    <div class="callout-title">Trademarks belong to Upekrithen LLC</div>
    <div class="callout-body">
      <p>
        <strong>MnemosyneC, Dr. Mnemosynec, Liana Banyan, and Cephas</strong> are
        non-licensable. You may not use these names to identify or market your fork
        or derivative work.
      </p>
      <p>
        Use a different name. Plain attribution to the underlying project is fine.
      </p>
    </div>
  </div>
</section>


<!-- ================================================================
     SECTION 8: FAQ
     Three Component A flip cards.
     Canon: canon_android_of_ai_four_layer_licensing_model_bp087 (SEG-AA)
     ================================================================ -->
<section class="page-section" aria-label="Licensing FAQ">
  <h2>Frequently asked questions.</h2>

  <div class="faq-grid">

    <!-- FAQ CARD 1: Internal use -->
    <div class="flip-card" id="faq-1">
      <div class="flip-card-inner">

        <div class="flip-card-front">
          <div class="faq-question">Can I use this in my company free of charge?</div>
          <p class="faq-plain">
            Yes, if you do not offer it as a service to your customers. Internal
            R&amp;D and integration work are not affected. SSPL Section 13 kicks in
            only when you wrap it as a service offered outside your organization.
          </p>
          <button class="btn-flip-faq" onclick="flipCard('faq-1')">
            Technical Detail &#8594;
          </button>
        </div>

        <div class="flip-card-back">
          <div class="faq-question">Internal use: SSPL details</div>
          <p class="faq-detail">
            SSPL v1 Section 13 defines "offering the functionality of the Program
            as a service" as the trigger for the copyleft obligation. Using the
            software internally, integrating it into internal tooling, or running
            it for your own organization's benefit does not trigger Section 13.
          </p>
          <p class="faq-detail">
            Canon slug: <strong>canon_android_of_ai_four_layer_licensing_model_bp087</strong>
          </p>
          <button class="btn-back-faq" onclick="flipCard('faq-1')">
            &#8592; Back
          </button>
        </div>

      </div>
    </div>

    <!-- FAQ CARD 2: Dual-license rationale -->
    <div class="flip-card" id="faq-2">
      <div class="flip-card-inner">

        <div class="flip-card-front">
          <div class="faq-question">Why dual-license (SSPL plus Apache 2.0)?</div>
          <p class="faq-plain">
            SSPL protects the cooperative substrate. Apache 2.0 is for selected library
            extractions that for-profit AI companies should be able to fork and ship
            without triggering the SaaS clause.
          </p>
          <button class="btn-flip-faq" onclick="flipCard('faq-2')">
            Technical Detail &#8594;
          </button>
        </div>

        <div class="flip-card-back">
          <div class="faq-question">SSPL plus Apache 2.0: structural rationale</div>
          <p class="faq-detail">
            The SSPL node and installer carry the full copyleft obligation (Section 13).
            Selected reference implementations and library extractions are published
            separately under Apache 2.0; those do not carry the SaaS clause.
            The list of Apache-licensed extractions is maintained in the Upekrithen LLC
            extraction registry and linked from this page as it grows.
          </p>
          <p class="faq-detail">
            Canon slug: <strong>canon_android_of_ai_four_layer_licensing_model_bp087</strong>
          </p>
          <button class="btn-back-faq" onclick="flipCard('faq-2')">
            &#8592; Back
          </button>
        </div>

      </div>
    </div>

    <!-- FAQ CARD 3: Patent litigation consequence -->
    <div class="flip-card" id="faq-3">
      <div class="flip-card-inner">

        <div class="flip-card-front">
          <div class="faq-question">What happens if I sue a cooperative member over patents?</div>
          <p class="faq-plain">
            Your patent peace under Pledge #2260 is revoked immediately. We can then
            assert any of the 2,700+ Upekrithen LLC patent claims against you.
          </p>
          <button class="btn-flip-faq" onclick="flipCard('faq-3')">
            Technical Detail &#8594;
          </button>
        </div>

        <div class="flip-card-back">
          <div class="faq-question">Pledge #2260 revocation mechanics</div>
          <p class="faq-detail">
            Pledge #2260 grants a defensive cross-license to all Upekrithen LLC patent
            claims. The grant is conditional: it is revoked upon initiation of patent
            litigation against any cooperative member (not just the cooperative entity).
            Revocation is automatic on filing; no cure period. The cooperative does not
            strike first, but it does not disarm unilaterally either.
          </p>
          <p class="faq-detail">
            Canon slug: <strong>canon_android_of_ai_four_layer_licensing_model_bp087</strong>
          </p>
          <button class="btn-back-faq" onclick="flipCard('faq-3')">
            &#8592; Back
          </button>
        </div>

      </div>
    </div>

  </div>
</section>


<!-- ================================================================
     SECTION 9: CONTACT CTA + COOPERATIVE LITURGY FOOTER
     Canon: canon_closing_liturgy_four_line_block_verbatim_bp085
     ================================================================ -->
<section class="contact-section" aria-label="Contact and licensing inquiries">
  <h2>Commercial licensing inquiries.</h2>
  <p>
    Write to Upekrithen LLC directly. Describe your use case and expected volume.
    The 30-day offer window starts from receipt of your letter.
  </p>
  <p class="contact-email">
    <a href="mailto:hello@upekrithen.com">hello@upekrithen.com</a>
  </p>
</section>

<footer role="contentinfo">
  <div class="closing-liturgy" aria-label="Cooperative closing liturgy">
    Help Each Other Help Ourselves.<br>
    The Substrate is the Moat.<br>
    It's Continuity-Lift Across Vendor Churn.<br>
    Capitalist. Cooperative. Patriotic Interdependentalist.
  </div>
  <p class="closing-byline">FounderDenken / Crewman #6 &middot; Liana Banyan Corporation</p>
  <nav class="footer-links" aria-label="Footer navigation">
    <a href="/">Home</a>
    <a href="/licensing">Licensing</a>
    <a href="/join">Join</a>
    <a href="/download">Download</a>
    <a href="/how-it-works">How it works</a>
  </nav>
</footer>

<script>
  /* Shared flip-card JS -- include once per page, works for all .flip-card
     and .android-card elements. Canon pattern from Component A (§2). */
  function flipCard(cardId) {
    document.getElementById(cardId).classList.toggle('flipped');
  }
</script>

</body>
</html>
```

**Implementer notes for /licensing:**
- Hugo config: add `[languages.en.params] licensingPage = true` or equivalent so the footer link auto-generates.
- Both `/licensing` and `/license` must serve identical content. Set up a Hugo alias: `aliases: ["/license"]` in the page front matter.
- Every cooperative-class page footer must include `<a href="/licensing">Licensing</a>`. Wire to `.footer__link` class.
- The offer card (Component G) inside Section 5 uses a dynamic countdown. Hugo build-time shortcode or client-side JS both acceptable; JS preferred so the countdown is accurate at visit time, not build time.
- The Android-of-AI flip card (Section 3 back face) links to the BP087 SEG-AA canon eblet. The URL for that eblet on the public substrate surface is TBD pending relay.lianabanyan.com routing; use a placeholder `href="/papers/android-of-ai-licensing-model"` until live.
- Truth-Always: the 10x figure in Component G Section 5 traces to the Star Chamber receipt (canon_star_chamber_multi_agent_consensus_verification_product_bp086). Do not publish that card until that canon receipt is confirmed current.

---

## §8 Page-Flow Recipe - Homepage Above-the-Fold + First Scroll

**Canon refs:**
- Hero: `canon_captains_ship_wheel_dr_mnemosynec_maritime_bp085`
- Lightbulb tagline: `canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085`
- Closers liturgy: `canon_coffees_for_closers_help_yourself_substrate_market_tagline_bp086`
- Closing liturgy 4-line block: `canon_closing_liturgy_four_line_block_verbatim_bp085`
- Join CTA: `canon_join_modal_benefits_over_barrier_copy_bp085`

Full page skeleton. Paste into a Hugo base template or a standalone HTML file.
Each section is labeled for Cephas/Hugo team handoff.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dr. MnemosyneC - Cooperative Substrate for AI Work</title>
  <meta name="description"
        content="Dr. MnemosyneC gives any AI a persistent memory that survives vendor churn, context resets, and model upgrades. Free to join. $5/year for full membership.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* === PASTE §1 TOKENS HERE IN PRODUCTION === */
    :root {
      --bg-primary: #0a0a0a; --bg-secondary: #1a1a1a; --bg-hover: #232323;
      --bg-border: #2a2a2a; --fg-primary: #e8e8e8; --fg-dim: #a0a0a0;
      --accent-amber: #f5a623; --accent-green: #3ecf8e; --accent-teal: #2dd4bf;
      --font-family: 'Inter', -apple-system, sans-serif;
      --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
      --content-max-w: 720px;
      --radius-card: 8px; --radius-cta: 12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg-primary);
      color: var(--fg-primary);
      font-family: var(--font-family);
      font-size: 17px;
      line-height: 1.7;
    }

    /* --- SHARED LAYOUT --- */
    .page-section {
      padding: 80px 24px;
      max-width: var(--content-max-w);
      margin: 0 auto;
    }
    .page-section--wide {
      padding: 80px 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--accent-amber);
      margin-bottom: 16px;
    }


    /* ================================================================
       SECTION A: HERO
       canon: canon_captains_ship_wheel_dr_mnemosynec_maritime_bp085
       canon: canon_continuity_lift_across_vendor_churn_tagline_bp085
       ================================================================ */

    .hero {
      padding: 120px 24px 80px;
      max-width: var(--content-max-w);
      margin: 0 auto;
      text-align: center;
    }
    .hero-eyebrow {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent-amber);
      margin-bottom: 20px;
    }
    .hero-headline {
      font-size: clamp(36px, 5vw, 56px);
      font-weight: 700;
      line-height: 1.15;
      color: var(--fg-primary);
      margin-bottom: 24px;
    }
    .hero-headline em {
      font-style: normal;
      color: var(--accent-green);
    }
    .hero-sub {
      font-size: 20px;
      color: var(--fg-dim);
      max-width: 560px;
      margin: 0 auto 40px;
      line-height: 1.6;
    }

    /* CTA button group */
    .hero-cta-group {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      background: var(--accent-green);
      color: #000;
      font-family: var(--font-family);
      font-size: 15px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: var(--radius-cta);
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: opacity 200ms var(--ease-standard);
    }
    .btn-primary:hover { opacity: 0.88; }
    .btn-secondary {
      background: transparent;
      color: var(--fg-primary);
      font-family: var(--font-family);
      font-size: 15px;
      font-weight: 500;
      padding: 13px 24px;
      border-radius: var(--radius-cta);
      border: 1px solid var(--bg-border);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: border-color 200ms var(--ease-standard);
    }
    .btn-secondary:hover { border-color: var(--fg-dim); }

    /* Inequality trinity (3 lines, canon: canon_free_with_substrate_flagship_inequality_trinity_bp085) */
    .inequality-trinity {
      margin: 48px auto 0;
      max-width: 480px;
      padding: 24px 28px;
      background: var(--bg-secondary);
      border: 1px solid var(--bg-border);
      border-radius: var(--radius-card);
      border-left: 4px solid var(--accent-amber);
    }
    .inequality-trinity p {
      font-size: 15px;
      color: var(--fg-dim);
      line-height: 1.9;
      font-style: italic;
    }
    .inequality-trinity strong { color: var(--fg-primary); font-style: normal; }
    .inequality-trinity .highlight { color: var(--accent-green); font-style: normal; font-weight: 700; }


    /* ================================================================
       SECTION B: PROOF BAR CHART
       (paste Component B SVG here)
       ================================================================ */

    .proof-bar-section {
      padding: 0 24px 80px;
      max-width: 860px;
      margin: 0 auto;
    }
    .proof-bar-section .section-label { text-align: center; }


    /* ================================================================
       SECTION C: SMARTSCREEN CALLOUT
       Placed directly below download button.
       (paste Component F callout here)
       ================================================================ */

    .callout-section {
      padding: 0 24px 64px;
      max-width: var(--content-max-w);
      margin: 0 auto;
    }


    /* ================================================================
       SECTION D: ARCHITECTURE STACK
       (paste Component D stack here)
       ================================================================ */

    .arch-section {
      padding: 80px 24px;
      max-width: 640px;
      margin: 0 auto;
    }
    .arch-section .section-label { text-align: center; margin-bottom: 8px; }
    .arch-section-title {
      font-size: 28px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 8px;
    }
    .arch-section-sub {
      color: var(--fg-dim);
      font-size: 15px;
      text-align: center;
      margin-bottom: 40px;
    }


    /* ================================================================
       SECTION E: LIFECYCLE FLOW
       (paste Component C SVG here)
       ================================================================ */

    .flow-section {
      padding: 0 24px 80px;
      max-width: 940px;
      margin: 0 auto;
    }


    /* ================================================================
       SECTION F: PROOF CARDS GRID
       (paste Component E grid here)
       ================================================================ */

    .proof-cards-section {
      padding: 80px 24px;
      max-width: 1000px;
      margin: 0 auto;
    }


    /* ================================================================
       SECTION G: COOPERATIVE JOIN CTA
       canon: canon_join_modal_benefits_over_barrier_copy_bp085
       canon: canon_coffees_for_closers_help_yourself_substrate_market_tagline_bp086
       canon: canon_closing_liturgy_four_line_block_verbatim_bp085
       ================================================================ */

    .join-cta-section {
      padding: 80px 24px 120px;
      max-width: var(--content-max-w);
      margin: 0 auto;
      text-align: center;
    }
    .join-tagline {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent-amber);
      margin-bottom: 16px;
    }
    .join-headline {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .join-sub {
      font-size: 16px;
      color: var(--fg-dim);
      max-width: 500px;
      margin: 0 auto 32px;
    }

    /* Benefits list (canon: canon_join_modal_benefits_over_barrier_copy_bp085) */
    .join-benefits {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
      max-width: 420px;
      margin: 0 auto 32px;
    }
    .join-benefits li {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      font-size: 15px;
      color: var(--fg-dim);
    }
    .join-benefits li .check {
      color: var(--accent-green);
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .join-price {
      font-size: 28px;
      font-weight: 700;
      color: var(--accent-green);
      margin-bottom: 8px;
    }
    .join-price-sub {
      font-size: 14px;
      color: var(--fg-dim);
      margin-bottom: 28px;
    }

    /* Footer closing liturgy */
    footer {
      border-top: 1px solid var(--bg-border);
      padding: 48px 24px;
      text-align: center;
    }
    .closing-liturgy {
      font-size: 14px;
      color: var(--fg-dim);
      font-style: italic;
      line-height: 2;
      max-width: 480px;
      margin: 0 auto 16px;
    }
    .closing-byline {
      font-size: 13px;
      color: var(--fg-dim);
      opacity: 0.6;
    }
  </style>
</head>
<body>

<!-- ================================================================
     SECTION A: HERO
     canon: canon_captains_ship_wheel_dr_mnemosynec_maritime_bp085
     canon: canon_continuity_lift_across_vendor_churn_tagline_bp085
     canon: canon_free_with_substrate_flagship_inequality_trinity_bp085
     ================================================================ -->
<section class="hero" aria-label="Hero">
  <p class="hero-eyebrow">Cooperative Substrate for AI Work</p>
  <h1 class="hero-headline">
    Your AI finally has a<br>
    <em>memory that does not reset.</em>
  </h1>
  <p class="hero-sub">
    Dr. MnemosyneC is the Captain's wheel for your AI fleet.
    The boat will float without her. To go somewhere, it needs a Captain.
    She steers your work across sessions, across models, across vendor churn.
  </p>
  <div class="hero-cta-group">
    <a href="/download" class="btn-primary">
      &#8595; Download Dr. MnemosyneC
    </a>
    <a href="/how-it-works" class="btn-secondary">
      How it works &#8594;
    </a>
  </div>

  <!-- Inequality trinity (verbatim, never drop a line) -->
  <!-- canon: canon_free_with_substrate_flagship_inequality_trinity_bp085 -->
  <div class="inequality-trinity" role="complementary"
       aria-label="The substrate inequality">
    <p>
      <strong>Free WITH Substrate &gt; Flagship WITHOUT Substrate</strong><br>
      <span class="highlight">Flagship WITH Substrate = BROKE THE SOUND BARRIER</span><br>
      Gemma 97.1% free on substrate. Flagships alone: 75-86%.
    </p>
  </div>
</section>


<!-- ================================================================
     SECTION B: PROOF BAR CHART
     Paste the full Component B SVG block here.
     Cephas/Hugo team: replace this placeholder with the SVG from §3.
     ================================================================ -->
<section class="proof-bar-section" aria-label="Benchmark comparison">
  <p class="section-label">Proof</p>
  <!-- [INSERT COMPONENT B SVG HERE - see §3 for full copy-pasteable block] -->
  <div style="background:#1a1a1a;border:1px dashed #2a2a2a;border-radius:8px;
              padding:40px;text-align:center;color:#4a4a4a;font-size:14px;">
    [Paste Component B grouped bar chart SVG here from §3]
  </div>
</section>


<!-- ================================================================
     SECTION C: SMARTSCREEN CALLOUT
     Placed directly below the download button area.
     canon: download button + Windows SmartScreen context
     ================================================================ -->
<section class="callout-section" aria-label="Windows SmartScreen notice">
  <!-- [INSERT COMPONENT F CALLOUT HERE - see §7 for full copy-pasteable block] -->
  <!-- Paste the .callout div (SmartScreen example) from §7 directly here. -->
  <div style="background:#1a1a1a;border-left:4px solid #f5a623;border-radius:0 8px 8px 0;
              padding:16px 20px;font-size:14px;color:#a0a0a0;font-style:italic;">
    [Paste Component F SmartScreen callout here from §7]
  </div>
</section>


<!-- ================================================================
     SECTION D: ARCHITECTURE STACK
     canon: canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085
     canon: canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085
     ================================================================ -->
<section class="arch-section" aria-label="Architecture">
  <p class="section-label">Architecture</p>
  <h2 class="arch-section-title">Reader. Verifier. Accumulator.</h2>
  <p class="arch-section-sub">
    Three layers. Each a dedicated callable worker. "Consult, don't Rent."
  </p>
  <!-- [INSERT COMPONENT D ARCH STACK HERE - see §5 for full copy-pasteable block] -->
  <div style="background:#1a1a1a;border:1px dashed #2a2a2a;border-radius:8px;
              padding:40px;text-align:center;color:#4a4a4a;font-size:14px;">
    [Paste Component D architecture stack from §5]
  </div>
</section>


<!-- ================================================================
     SECTION E: LIFECYCLE FLOW DIAGRAM
     canon: canon_persistent_active_memory_crown_jewel_bp085
     ================================================================ -->
<section class="flow-section" aria-label="Claim lifecycle">
  <!-- [INSERT COMPONENT C LIFECYCLE SVG HERE - see §4] -->
  <div style="background:#1a1a1a;border:1px dashed #2a2a2a;border-radius:8px;
              padding:40px;text-align:center;color:#4a4a4a;font-size:14px;">
    [Paste Component C lifecycle flow SVG from §4]
  </div>
</section>


<!-- ================================================================
     SECTION F: PINNED PROOF CARDS GRID
     canon: canon_ascending_andon_right_fast_cheap_discipline_bp085
     ================================================================ -->
<section class="proof-cards-section" aria-label="Proof receipts">
  <p class="section-label" style="text-align:center;">Receipts</p>
  <!-- [INSERT COMPONENT E PROOF CARDS GRID HERE - see §6] -->
  <div style="background:#1a1a1a;border:1px dashed #2a2a2a;border-radius:8px;
              padding:40px;text-align:center;color:#4a4a4a;font-size:14px;">
    [Paste Component E proof cards grid from §6]
  </div>
</section>


<!-- ================================================================
     SECTION G: COOPERATIVE JOIN CTA
     canon: canon_join_modal_benefits_over_barrier_copy_bp085
     canon: canon_membership_obviously_better_value_self_evident_bp085
     Closers tagline:
       canon_coffees_for_closers_help_yourself_substrate_market_tagline_bp086
     ================================================================ -->
<section class="join-cta-section" aria-label="Join the cooperative">
  <p class="join-tagline">
    Coffee's for Closers. Help Yourself.
  </p>
  <h2 class="join-headline">Membership is obviously better.</h2>
  <p class="join-sub">
    Every lead on the Substrate Market is already asking for what you sell.
    No forms, no algorithms, no 30% take. Just the cooperative.
  </p>

  <!-- Benefits list (verbatim from canon_join_modal_benefits_over_barrier_copy_bp085) -->
  <ul class="join-benefits" aria-label="Membership benefits">
    <li>
      <span class="check">&#10003;</span>
      Form or join a CREW and earn uncapped bounty shares
    </li>
    <li>
      <span class="check">&#10003;</span>
      Personalized substrate matching (inferred, never a form)
    </li>
    <li>
      <span class="check">&#10003;</span>
      PROV_23 public patent-bag eligibility
    </li>
    <li>
      <span class="check">&#10003;</span>
      Marks economy: earn on work, purchases, and reviews
    </li>
    <li>
      <span class="check">&#10003;</span>
      Cooperative vote and Code Breakers Guild access
    </li>
  </ul>

  <p class="join-price">$5 / year</p>
  <p class="join-price-sub">One CREW bounty share eclipses the cost. The math is the marketing.</p>

  <a href="/join" class="btn-primary" style="font-size:17px;padding:16px 36px;">
    Just let me join.
  </a>
</section>


<!-- ================================================================
     FOOTER: CLOSING LITURGY (verbatim 4-line block)
     canon: canon_closing_liturgy_four_line_block_verbatim_bp085
     ================================================================ -->
<footer role="contentinfo">
  <div class="closing-liturgy" aria-label="Cooperative closing liturgy">
    Help Each Other Help Ourselves.<br>
    The Substrate is the Moat.<br>
    It's Continuity-Lift Across Vendor Churn.<br>
    Capitalist. Cooperative. Patriotic Interdependentalist.
  </div>
  <p class="closing-byline">FounderDenken / Crewman #6 &middot; Liana Banyan Corporation</p>
</footer>

</body>
</html>
```

---

## §9 Editorial Fix List (Cross-References SEG-Z Deliverable)

Detailed copy edits live in SEG-Z's deliverable. This list gives Knight the canon slug for each fix so copy changes can be sourced precisely.

1. **Replace "Master In Cluster" with "Machine In Charge"** anywhere it appears on the site.
   Canon: `canon_mic_machine_in_charge_naming_lock_bp086`

2. **Remove all preference questionnaires or onboarding surveys.**
   Members are never asked to fill out forms. Substrate infers.
   Canon: `canon_preferences_inferred_not_interrogated_no_questionnaire_substrate_bp086`

3. **Membership price: $5/year verbatim.** No rounding, no "just five dollars."
   Canon: `canon_membership_obviously_better_value_self_evident_bp085`

4. **Base tier is free.** Non-members can register as `tier='base'` with full substrate
   read + mesh participation. Gate copy should say "unlock personalization" not "access."
   Canon: `canon_generic_connection_membership_base_tier_free_bp086`

5. **Inequality trinity: all three lines must appear together, never truncated.**
   "Free WITH Substrate > Flagship WITHOUT Substrate" /
   "Flagship WITH Substrate = BROKE THE SOUND BARRIER" /
   "Gemma 97.1% free on substrate. Flagships alone: 75-86%."
   Canon: `canon_free_with_substrate_flagship_inequality_trinity_bp085`
   + `canon_broke_the_sound_barrier_substrate_metaphor_bp085`

6. **Closing liturgy: all 4 lines verbatim, FounderDenken/Crewman #6 byline.**
   Never drop a line. Never reorder.
   Canon: `canon_closing_liturgy_four_line_block_verbatim_bp085`

7. **"Consult, don't Rent" tagline for architecture section.**
   Use when explaining why Gemma/Llama run routine tasks and flagships are called
   only for hard targeted work.
   Canon: `canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085`

---

*SEG-Y complete. BP087. Sonnet 4.6. No em-dashes. Parallel with SEG-W/X/Z.*
*All canon slugs cited inline at each component. Ready for Cephas/Hugo team handoff.*
