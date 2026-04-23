# Pudding #114 — Play With These Numbers

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 114
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Paper 5 — Contingency Operators as Financial Literacy Tools

---

## The Pudding

"What will I earn?"

Every platform gets asked. And every platform lies.

MLM calculators show you diamond-level fantasies — the top 0.1% outcomes presented as typical. Uber shows peak-hour earnings in Manhattan and calls it representative. DoorDash quotes gross revenue and forgets to mention your car payment, insurance, fuel, depreciation, and self-employment tax. The information is technically present somewhere in the fine print. The impression is carefully engineered to mislead.

Liana Banyan built a different tool. A Contingency Operator. An interactive what-if sandbox where you pick your role, move the sliders, and watch the economics change in real time. The model is not behind the interface. The model IS the interface.

The defaults are conservative. Not best-case. Not worst-case. What a new member might realistically see in their first months. You have to deliberately push the sliders upward to see bigger numbers — and when you push, you feel the departure from baseline. That push is the nudge. Thaler and Sunstein would recognize the architecture.

The outputs are ranges. Not "you will earn $2,400." Instead: "Your monthly service participation may look like $1,200 to $2,800." The low end is shown in larger font. The high end is smaller. Asymmetric framing against optimism bias. Deliberate. Structural. Not a disclaimer — a design decision.

Cost+20% is visible in every scenario. 83.3% to you. 16.7% to the cooperative. You cannot model a scenario where you take everything. You cannot model a scenario where the platform takes more. The constraint is the constitution, made experiential.

Time is modeled. Hours per week. Prep time. Drive time. The tool computes your effective hourly rate and compares it to local minimum wage. A member who enters impressive revenue but realistic hours sees their per-hour truth. No hiding behind gross numbers.

Your mentor uses the tool with you. The same tool. The same model. Neither of you can exaggerate — the numbers are right there. You save the scenario to your Portable Reputation portfolio as a mini business plan. A concrete, parameterized, range-bounded plan that replaces the pitch.

"PLAY WITH THESE NUMBERS."

Not play as in games. Play as in learning. Play as in understanding through interaction. Financial literacy at the point of decision. Paper 5 of 5. The Contingency Operator.

---

## This is NOT Pudding

Paper 5: "Contingency Operators as Financial Literacy Tools: Interactive What-If Sandboxes for Cooperative Platform Roles" is a ~12,000-word academic paper with 25+ references spanning financial literacy (Lusardi & Mitchell), behavioral economics (Thaler & Sunstein), simulation pedagogy (de Jong & van Joolingen), FTC enforcement (Vemma case), gig-economy critique (Rosenblat, Dubal, Prassl), and MLM analysis (Taylor, Keep). It includes a structural comparison table between MLM calculators and COs across ten design dimensions, temperament-adaptive presentation architecture, and SEC-safe language framework.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full paper with FTC compliance analysis, behavioral economics framework, and comparison tables |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Platform roles with dedicated CO templates | 16 (one per initiative) |
| Default calibration | Conservative (below-typical, early-stage) |
| Output format | Range (low, expected, high) — not point estimates |
| Cost+20% floor | Visible, non-negotiable, modeled in every scenario |
| MLM comparison dimensions | 10 (COs win all 10) |
| SEC-safe language patterns | 6 (service participation, not earnings) |
| Papers in complete series | 5 of 5 |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Garlic (Finance/Business) | Primary |
| Basil (Education/Creative) | Secondary |
| Pepper (Legal/Compliance) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  114,
  'Play With These Numbers',
  'play-with-these-numbers',
  'Paper 5: Contingency Operators as Financial Literacy Tools',
  12000,
  'What will I earn? Every platform gets asked. And every platform lies...',
  'Full paper with FTC compliance analysis, behavioral economics nudge framework, MLM comparison across 10 dimensions, temperament-adaptive presentation, and SEC-safe language architecture.',
  'garlic',
  ARRAY['basil', 'pepper'],
  ARRAY[],
  'B075',
  'draft'
);
```
