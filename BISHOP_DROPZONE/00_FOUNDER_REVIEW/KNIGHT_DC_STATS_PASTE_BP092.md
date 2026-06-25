# KNIGHT PASTE PROMPT — DC Savings Stats Section — mnemosynec.org — BP092

You are a Knight SEG. Operator mechanic per BP089. Bishop has composed this dispatch. Execute exactly as specified.

---

## YOUR TASK

Add a stats section to mnemosynec.org that features Pawn's empirical industry-savings numbers directly below the Six Pillars "Good. Fast. Cheap." card (anchored to the "No new Data Centers needed" / "Cheap" row).

**Mandatory constraints:** Sonnet 4.6 · §14 + §15 + §17 BLOOD · MIC per-Block-close · Caithedral always · Hugo/Firebase = Knight lane per BP089. No Bishop-direct deploys.

---

## FILE LOCATIONS

- Hugo project root: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`
- Partials dir: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\`
- Homepage partial: `layouts\partials\mnemosynec-homepage.html` (~1,661 lines)
- Target anchor: line ~1001 — `</section>` closing the `id="six-pillars"` section, immediately before the `SEG-6: Pinned Proofs` comment block

---

## BLOCK 1 — CREATE: `layouts/partials/dc-savings-stats.html`

Create this file exactly:

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\dc-savings-stats.html
```

File contents:

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

  {{- /* Mobile responsive: collapse License Fee column on narrow screens */ -}}
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

**MIC BLOCK 1 CLOSE.**

---

## BLOCK 2 — EDIT: `layouts/partials/mnemosynec-homepage.html`

Open: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

Find this exact string (around line 1001–1003):

```
  </section>

  <!-- ═══════════════════════════════════════════════
       SEG-6: Pinned Proofs · expandable accordions
```

Replace with:

```
  </section>

  {{- /* DC SAVINGS STATS — BP092 — immediately below Six Pillars / Cheap row anchor */ -}}
  {{- partial "dc-savings-stats.html" . -}}

  <!-- ═══════════════════════════════════════════════
       SEG-6: Pinned Proofs · expandable accordions
```

**MIC BLOCK 2 CLOSE.**

---

## BLOCK 3 — SMOKE TEST

```
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo serve --config config-mnemosynec.toml
```

Open `http://localhost:1313/` in browser. Verify:
- Stats section renders below "Good. Fast. Cheap." card
- Amber heading "Substrate Replaces New Data Centers" visible
- Table: 6 rows + amber TOTAL row
- "Read the full analysis" button renders
- Mobile viewport (375px): License Fee column hides, no horizontal scroll

**MIC BLOCK 3 CLOSE.**

---

## BLOCK 4 — DEPLOY

```
firebase deploy --only hosting:mnemosyne -P default
```

Verify:
- `curl -I https://mnemosynec.org/` → HTTP 200
- Open production mnemosynec.org in browser
- Stats card visible below Six Pillars

**MIC BLOCK 4 CLOSE. Task complete.**

---

## FOLLOW-ON NOTE

After Founder publishes Pawn's Substack report: update placeholder URL in `dc-savings-stats.html` and re-deploy. 5-minute task.

---

*BP092 · Bishop Sonnet 4.6 · Self-contained Knight paste prompt*
