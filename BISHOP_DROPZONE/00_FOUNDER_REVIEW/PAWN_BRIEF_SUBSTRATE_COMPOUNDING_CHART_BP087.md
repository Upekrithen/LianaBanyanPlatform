# Pawn Brief: Substrate Compounding Chart · BP087

**To:** Pawn
**From:** Bishop (SEG-QQ)
**Session:** BP087
**Date:** 2026-06-20
**Priority:** Founder direct

---

## What the Chart Needs to Show

This chart makes one empirical claim visual: substrate compounding reduces marginal context cost per MAMBA across waves. The second wave costs less per unit of work than the first, because the substrate is denser. More substrate, fewer tokens per unit of work.

X axis: Cumulative MAMBA count (0 to 12, labeled 0 through 11)
Y axis: Cumulative context percent (0 to 120, with 100 marked as a hard ceiling line labeled "Session limit")

Three curves plotted on the same axes:

- Curve A (baseline without substrate, BP063): linear at approximately 86% per MAMBA. Labeled "Without substrate (BP063 baseline)." Color: dim gray. This line exits the top of the chart (would crash past 100% by MAMBA 2). Mark with a dashed ceiling at 100% and a small callout: "Crash zone."
- Curve B (Wave 1 with substrate): slope 10.75% per MAMBA from MAMBA 0 through MAMBA 4, ending at 43%. Labeled "Wave 1 (with substrate)." Color: cooperative green.
- Curve C (Wave 1 + Wave 2, compounding): slope 10.75% per MAMBA through MAMBA 4 (same as Curve B), then slope changes to 6.57% per MAMBA from MAMBA 4 through MAMBA 11, ending at 89%. Labeled "Wave 1 + Wave 2 (compounding)." Color: amber at the slope-change point and beyond, to distinguish Wave 2 leg visually.

Key annotations:
- At MAMBA 4 / 43%: vertical dashed line labeled "Wave 1 complete"
- At MAMBA 11 / 89%: dot + callout "11 MAMBAs · same Knight session"
- Slope label on Wave 2 leg: "6.57% / MAMBA (Wave 2)"
- Slope label on Wave 1 leg: "10.75% / MAMBA (Wave 1)"
- Caption below chart: "More substrate, fewer tokens per unit of work. The compounding compounds."
- Founder quote callout (top or side): "Founder direct: the MORE there is, the FASTER and MORE efficient it gets."

---

## Specific Data Points (Verbatim)

| MAMBA Index | Cumulative Context % | Wave | Comment |
|---|---|---|---|
| 0 | 0% | Setup | Session open |
| 1 | 10.75% | Wave 1 | MAMBA 1 (beta-3) |
| 2 | 21.5% | Wave 1 | MAMBA 2 (beta-2) |
| 3 | 32.25% | Wave 1 | MAMBA 3 (Substrace) |
| 4 | 43% | Wave 1 complete | MAMBA 4 (zeta) |
| 5 | 49.57% | Wave 2 | MAMBA 5 (Pay-to-Join) |
| 6 | 56.14% | Wave 2 | MAMBA 6 (Substrate Market) |
| 7 | 62.71% | Wave 2 | MAMBA 7 (Gemma Brain-Swap) |
| 8 | 69.28% | Wave 2 | MAMBA 8 (Scrambler) |
| 9 | 75.85% | Wave 2 | MAMBA 9 (Trial 02 fire) |
| 10 | 82.42% | Wave 2 | MAMBA 10 (close-out audit) |
| 11 | 89% | Wave 2 complete | MAMBA 11 (pre-flight) |

Baseline curve (Curve A, no substrate): MAMBA 1 = 86%, MAMBA 2 = 172% (off-chart). Draw only through MAMBA 1 then show it crashing into the ceiling.

---

## Style Direction

Match the existing Component B horizontal bar chart palette:
- Font: Inter (or system sans-serif fallback)
- Background: near-black (#0f0f0f or equivalent)
- Cooperative green: #22c55e or the exact hex used in Component B
- Amber threshold: #f59e0b
- Dim gray for baseline: #6b7280
- White or near-white for axis labels and title
- Red dashed line for crash zone ceiling at 100%

Single chart. Suitable for hero placement on mnemosynec.org and for embedding in a Substack piece. No wide margins needed; keep the data region large.

Deliver as inline SVG with no JS library dependency. Same constraint as Component B: pure SVG, no d3, no chart.js. The chart must render standalone when pasted into an HTML file or a Markdown page that supports SVG.

Dimensions: viewBox "0 0 900 520" (landscape, readable on both desktop and mobile embed).

Legend in upper-left corner, inside the chart frame (not outside).

---

## Founder Verbatim Anchors (Paste-Ready)

Anchor 1 (ratification, use as chart callout):
> "Notice how the MORE there is, the FASTER and MORE efficient it gets? We need a chart for that. For real."

Anchor 2 (context evidence):
> "And ALL THAT at 89% context! SAME SESSION AS THE OTHER MAMBAS. Because I put it in the same one as before."

Both are Founder direct BP087, 2026-06-20.

---

## Cross-References to BP087 Canons

- `canon_substrate_compounding_at_89_percent_knight_context_11_mambas_same_session_wave_2_inherits_wave_1_bp087` (the receipt this chart visualizes)
- `canon_substrate_enables_merged_reasoning_requests_43pct_knight_context_drag_reduction_bp087` (Wave 1 first-order compounding receipt)
- `canon_pinned_proof_bp087_knight_wave_2_ride_28_screenshots_0022_0053_compounding_evidence_bp087` (photographic evidence record)
- `canon_pinned_proof_setup_no_delete_screenshot_evidence_preservation_discipline_bp087` (no-delete discipline)

---

## Where the Chart Lives

Three placements, all simultaneous when ready:

1. Hero block on mnemosynec.org alongside the 4-layer license strip. Same visual weight as the inequality trinity block. Label the section "The Compounding Receipt."

2. Embed in the Substack piece already drafted at:
   `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTACK_PIECES\THE_10X_COMPOUNDING_SUBSTRATE_RECEIPT_BP087.md`
   Place it immediately after the Wave 2 data table.

3. Embed on the Cephas papers page at:
   `papers/10x-compounding-receipt/index.md`
   Add an `<img>` or inline SVG block in the hero section.

---

## Delivery

Return:
- The SVG file as a standalone artifact Founder can drop into any of the three placements
- File path: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\CHART_SUBSTRATE_COMPOUNDING_BP087.svg`
- One confirmation that no em-dashes appear in the SVG text content
- One confirmation that the 28-screenshot Pinned Proof folder is cited in the chart caption or footer

No em-dashes anywhere in the SVG or this brief. This is a compounding/receipt artifact; do not close with "For Alford."
