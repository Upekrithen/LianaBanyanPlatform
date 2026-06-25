# KNIGHT QUICK TASK — DC Savings Stats Section — mnemosynec.org — BP092
**Sonnet 4.6 · §14 + §15 + §17 BLOOD · MIC per-Block-close · Caithedral always · Knight = operator mechanic per BP089**

---

## MISSION

Feature Pawn's empirical industry-savings numbers directly below the "No new Data Centers needed" claim in the Six Pillars section on mnemosynec.org.

Founder verbatim BP092: *"it really does need to be ... featured on the Mnemosynec portion that says 'Substrate replaces new data centers' or whatever we said amounting to such"*

Target anchor in live site: the **Cheap** row of the Six Pillars table (mnemosynec-homepage.html line ~980):
> *"No new Data Centers needed — we make existing data centers 95% cheaper, more efficient, AND more accurate."*

---

## OPEN QUESTION (Bishop default — confirm or override before firing)

**OQ-1 — Placement:** Bishop default = stats section lands **immediately after the six-pillars `</section>` close** (mnemosynec-homepage.html line ~1001), before SEG-6 Pinned Proofs. This keeps it adjacent to the "Cheap" / data center claim without interrupting the pillar table itself.

Alternatives:
- (A) Mid-homepage hero — before Six Pillars
- (B) New `/math/` dedicated page Knight builds with link from Six Pillars "Cheap" row
- (C) Inline expansion inside the "Cheap" row's `<td>` (most compact)

**If no Founder override received: proceed with Bishop default (immediately after six-pillars section close).**

---

## PRE-BLOCK — Gadget (confirmed by Bishop read pass)

| Item | Status |
|---|---|
| `layouts/partials/alpha-banner.html` | CONFIRMED EXISTS — amber stripe, dismissible, BP092 comment header present |
| `layouts/partials/mnemosynec-homepage.html` | CONFIRMED EXISTS — 1,661+ lines, Six Pillars section lines ~962–1001 |
| `dc-savings-stats.html` partial | DOES NOT EXIST — Knight creates it in BLOCK 1 |
| `layouts/_default/baseof.html` | CONFIRMED — alpha-banner wired at line 24; stats section does NOT go here |
| `layouts/index.html` | CONFIRMED — mnemosynec branch calls `mnemosynec-homepage.html` partial |
| `content-mnemosynec/_index.md` | EXISTS but not the live render path for mnemosynec.org; ignore for this task |

**Placement target:** `mnemosynec-homepage.html` — insert partial call immediately after line ~1001 (`</section>` close of `six-pillars`), before SEG-6 comment block.

---

## BLOCK 1 — Create Hugo partial: `layouts/partials/dc-savings-stats.html`

**File to create:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\dc-savings-stats.html`

**Content:**

```html
{{- /* DC SAVINGS STATS — BP092 · Pawn empirical numbers · featured below Six Pillars */ -}}
<section id="dc-savings-stats" aria-labelledby="dc-savings-heading" style="
  margin: 2rem 0 1.5rem;
  padding: 0;
">
  <div style="
    max-width: 760px;
    margin: 0 auto;
    background: #0e1f33;
    border: 1px solid #f59e0b;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,.35);
  ">

    {{- /* Header */ -}}
    <div style="
      padding: 22px 28px 14px;
      background: linear-gradient(180deg,#1a2e00 0%,#0e1f33 100%);
      border-bottom: 1px solid #f59e0b;
      text-align: center;
    ">
      <div style="
        display: inline-block;
        background: #f59e0b;
        color: #1c1917;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        padding: 0.2rem 0.65rem;
        border-radius: 4px;
        margin-bottom: 10px;
        text-transform: uppercase;
      ">Public Alpha · Independent Analysis</div>

      <h2 id="dc-savings-heading" style="
        font-size: 1.45rem;
        font-weight: 800;
        color: #f59e0b;
        margin: 0 0 8px;
        line-height: 1.2;
      ">Substrate Replaces New Data Centers</h2>

      <p style="
        font-size: 0.97rem;
        color: #bcd6ee;
        margin: 0;
        line-height: 1.55;
      ">Independent analysis projects <strong style="color:#ffffff;">~$4.49B/yr</strong> in industry savings
      across the 6 largest frontier AI labs &middot;
      <strong style="color:#ffffff;">~$898M/yr</strong> cooperative license revenue &middot;
      <strong style="color:#3ddc84;">83.3%</strong> to Workers&hairsp;/&hairsp;Builders&hairsp;/&hairsp;Creators</p>
    </div>

    {{- /* Savings table */ -}}
    <div style="overflow-x:auto;">
      <table style="
        width: 100%;
        border-collapse: collapse;
        font-size: 0.91rem;
        color: #e7f0fa;
        font-variant-numeric: tabular-nums;
      ">
        <thead>
          <tr style="background:#112d4e;border-bottom:2px solid #f59e0b;">
            <th style="padding:10px 18px;text-align:left;font-weight:700;color:#f59e0b;letter-spacing:0.03em;">AI Lab</th>
            <th style="padding:10px 14px;text-align:right;font-weight:700;color:#f59e0b;letter-spacing:0.03em;">Annual Savings</th>
            <th style="padding:10px 14px;text-align:right;font-weight:700;color:#f59e0b;letter-spacing:0.03em;">License Fee (20%)</th>
            <th style="padding:10px 18px;text-align:right;font-weight:700;color:#f59e0b;letter-spacing:0.03em;">Net to Lab</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-top:1px solid #1c3f63;">
            <td style="padding:12px 18px;font-weight:600;color:#ffffff;">OpenAI</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;">$1.25B</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;color:#bcd6ee;">$250M</td>
            <td style="padding:12px 18px;text-align:right;font-family:monospace;color:#3ddc84;">$1.00B</td>
          </tr>
          <tr style="border-top:1px solid #1c3f63;background:rgba(255,255,255,0.02);">
            <td style="padding:12px 18px;font-weight:600;color:#ffffff;">Google&hairsp;/&hairsp;DeepMind</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;">$1.75B</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;color:#bcd6ee;">$350M</td>
            <td style="padding:12px 18px;text-align:right;font-family:monospace;color:#3ddc84;">$1.40B</td>
          </tr>
          <tr style="border-top:1px solid #1c3f63;">
            <td style="padding:12px 18px;font-weight:600;color:#ffffff;">Meta AI</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;">$900M</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;color:#bcd6ee;">$180M</td>
            <td style="padding:12px 18px;text-align:right;font-family:monospace;color:#3ddc84;">$720M</td>
          </tr>
          <tr style="border-top:1px solid #1c3f63;background:rgba(255,255,255,0.02);">
            <td style="padding:12px 18px;font-weight:600;color:#ffffff;">Anthropic</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;">$400M</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;color:#bcd6ee;">$80M</td>
            <td style="padding:12px 18px;text-align:right;font-family:monospace;color:#3ddc84;">$320M</td>
          </tr>
          <tr style="border-top:1px solid #1c3f63;">
            <td style="padding:12px 18px;font-weight:600;color:#ffffff;">Cohere</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;">~$95M</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;color:#bcd6ee;">~$19M</td>
            <td style="padding:12px 18px;text-align:right;font-family:monospace;color:#3ddc84;">~$76M</td>
          </tr>
          <tr style="border-top:1px solid #1c3f63;background:rgba(255,255,255,0.02);">
            <td style="padding:12px 18px;font-weight:600;color:#ffffff;">Mistral</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;">~$95M</td>
            <td style="padding:12px 14px;text-align:right;font-family:monospace;color:#bcd6ee;">~$19M</td>
            <td style="padding:12px 18px;text-align:right;font-family:monospace;color:#3ddc84;">~$76M</td>
          </tr>
          <tr style="border-top:2px solid #f59e0b;background:#112d4e;">
            <td style="padding:13px 18px;font-weight:800;color:#f59e0b;">TOTAL (core 6)</td>
            <td style="padding:13px 14px;text-align:right;font-family:monospace;font-weight:800;color:#f59e0b;">~$4.49B/yr</td>
            <td style="padding:13px 14px;text-align:right;font-family:monospace;font-weight:800;color:#f59e0b;">~$898M/yr</td>
            <td style="padding:13px 18px;text-align:right;font-family:monospace;font-weight:800;color:#3ddc84;">~$3.59B/yr saved</td>
          </tr>
        </tbody>
      </table>
    </div>

    {{- /* Methodology footnote + CTA */ -}}
    <div style="
      padding: 14px 20px 18px;
      border-top: 1px solid #1c3f63;
      background: #0a1929;
    ">
      <p style="
        font-size: 0.78rem;
        color: #86a6c6;
        margin: 0 0 12px;
        line-height: 1.6;
      ">
        <strong style="color:#bcd6ee;">Methodology:</strong>
        5 savings channels per <em>canon_license_fee_twenty_percent_of_measured_savings_bp092</em>.
        Pilot floor: 10&ndash;20% of each company&rsquo;s AI inference workload absorbed by cooperative substrate.
        Maturity projection: 85&ndash;90% absorption.
        License fee = 20% of measured savings; 83.3% of fee to Workers&hairsp;/&hairsp;Builders&hairsp;/&hairsp;Creators.
        Per-company figures are independent projections, not audited actuals.
      </p>
      <p style="margin: 0; text-align: center;">
        <a
          href="https://lianabanyan.substack.com/p/substrate-replaces-data-centers"
          target="_blank"
          rel="noopener"
          style="
            display: inline-block;
            background: #f59e0b;
            color: #1c1917;
            font-weight: 700;
            font-size: 0.88rem;
            padding: 0.5rem 1.4rem;
            border-radius: 6px;
            text-decoration: none;
            letter-spacing: 0.03em;
          "
        >&#128220;&nbsp; Read the full analysis &rarr;</a>
        <span style="
          display: block;
          font-size: 0.72rem;
          color: #86a6c6;
          margin-top: 6px;
        ">(Substack &middot; link activates on publish &middot; placeholder until then)</span>
      </p>
    </div>

  </div>

  {{- /* Mobile responsive: collapse table columns on narrow screens */ -}}
  <style>
    @media (max-width: 560px) {
      #dc-savings-stats table { font-size: 0.78rem; }
      #dc-savings-stats table th,
      #dc-savings-stats table td { padding: 9px 8px; }
      #dc-savings-stats table th:nth-child(3),
      #dc-savings-stats table td:nth-child(3) { display: none; }
    }
  </style>

</section>
```

**MIC BLOCK 1 CLOSE:** partial `dc-savings-stats.html` created. Amber accent matches alpha-banner. Table uses monospace numbers. "License Fee" column hidden on mobile narrower than 560px (keeps Amount + Net readable). Placeholder Substack URL wired — Knight updates after publish.

---

## BLOCK 2 — Wire partial into `mnemosynec-homepage.html`

**File to edit:**
`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

**Find** (exact string at line ~1001–1003):

```html
  </section>

  <!-- ═══════════════════════════════════════════════
       SEG-6: Pinned Proofs · expandable accordions
```

**Replace with:**

```html
  </section>

  {{- /* DC SAVINGS STATS — BP092 — immediately below Six Pillars / Cheap row anchor */ -}}
  {{- partial "dc-savings-stats.html" . -}}

  <!-- ═══════════════════════════════════════════════
       SEG-6: Pinned Proofs · expandable accordions
```

**Rationale:** The six-pillars `</section>` closes at line ~1001. The stats partial inserts immediately after, before SEG-6. This places the savings numbers directly below the "Cheap — No new Data Centers needed" row, matching Founder verbatim intent without breaking any existing SEG structure.

**MIC BLOCK 2 CLOSE:** Partial wired. One-line insertion. No other files touched.

---

## BLOCK 3 — Smoke test

```
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo serve --config config-mnemosynec.toml
```

**Checklist:**
- [ ] Hugo build: zero errors, zero warnings on new partial
- [ ] Open `http://localhost:1313/` in browser
- [ ] Confirm stats section renders below "Good. Fast. Cheap." Six Pillars card
- [ ] Confirm amber heading "Substrate Replaces New Data Centers" is visible
- [ ] Confirm table renders with all 6 labs + TOTAL row
- [ ] Confirm "Read the full analysis" button renders (placeholder URL — no 404 test needed, `target="_blank"` opens new tab)
- [ ] Chrome DevTools → Toggle mobile viewport (375px width) → confirm "License Fee" column hides, layout stacks cleanly
- [ ] Confirm no horizontal scroll on mobile

**MIC BLOCK 3 CLOSE:** Smoke test complete when checklist passes.

---

## BLOCK 4 — Deploy

```
firebase deploy --only hosting:mnemosyne -P default
```

**Post-deploy verify:**
- [ ] `curl -I https://mnemosynec.org/` → HTTP 200
- [ ] Open `https://mnemosynec.org/` in browser
- [ ] Scroll to Six Pillars section — stats card renders immediately below
- [ ] Amber border and "Substrate Replaces New Data Centers" heading visible in production

**MIC BLOCK 4 CLOSE:** Deploy confirmed. Task complete.

---

## FOLLOW-ON (small task — after Substack publish)

When Founder publishes Pawn's report to Substack:
1. Update placeholder URL in `dc-savings-stats.html` line with the live Substack URL
2. Remove the `(placeholder until then)` span
3. Re-deploy: `firebase deploy --only hosting:mnemosyne -P default`

Estimated: 5-minute Knight task.

---

## ESTIMATED WALL-CLOCK

| Block | Task | Time |
|---|---|---|
| PRE | Gadget read (already done by Bishop) | 0 min |
| 1 | Create `dc-savings-stats.html` | 10 min |
| 2 | Wire into `mnemosynec-homepage.html` | 5 min |
| 3 | Smoke test (hugo serve + browser check) | 10 min |
| 4 | Firebase deploy + production verify | 10 min |
| **TOTAL** | | **~35 min** |

---

*BP092 · Bishop Sonnet 4.6 · Composed for Knight execution · Founder review required before fire*
