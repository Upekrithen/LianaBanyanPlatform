# Pudding #111 — Self-Funding Economics

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 111
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Paper 3 — Self-Funding Platform Economics

---

## The Pudding

Uber lost thirty-one billion dollars before it made a dime.

Not a typo. Thirty-one billion. Raised from venture capitalists who expected ten-fold returns, which can only come from one place: the people who drive the cars and the people who ride in them. Subsidize. Dominate. Extract. Doctorow calls it enshittification. Three stages of degradation built into the business model from the day the first check cleared.

Liana Banyan made money on its first transaction.

Cost+20%. The creator sets their price — say, $100. The buyer pays $120. The creator receives $100. The platform keeps $20. Half to operations. Half to charity. Done. No venture capital. No subsidized growth phase. No extraction phase because there is no debt to repay and no investors demanding ten-fold returns on a losing bet.

The 83.3% creator share is not a policy. It is a database trigger. The DNA Lock — a table of constitutional parameters protected by a trigger that intercepts any modification attempt, logs it for audit, and rolls back the transaction. The board cannot change it. A referendum cannot change it. An acquisition cannot change it. It is as close to immutable as software architecture allows.

Apple takes 30%. Uber takes 25-30%. Amazon takes up to 45%. Liana Banyan takes 16.7%. Forever.

Three currencies keep the system clean. Credits for spending — bought with dollars, spent on services, non-transferable, non-redeemable for cash. Marks for contributing — earned through work, governing weight increases with accumulation, cannot be purchased. Joules for saving — earned by sponsoring projects early, exchange rate permanently locked, backed 1:1 as collateral.

Each currency does one thing. When one token tries to do everything, you get speculation. Bitcoin proved that. The separation is deliberate.

The $5 membership is not a paywall. It is a commitment. You are not a user of someone else's service. You are a participant in something you partly own. The legal distinction matters for cooperative governance. The psychological distinction matters for everything else.

Five dollars. Positive unit economics from transaction one. No venture capital. Constitutional protection against extraction. 83.3% to creators. The experiment is live.

---

## This is NOT Pudding

Paper 3: "Self-Funding Platform Economics: How Cost+20% and $5/Year Membership Eliminate Venture Capital Dependency" is a ~12,000-word academic paper with citations from Coase, Williamson, Rochet & Tirole, Buchanan & Tullock, Milgrom, Zuboff, Doctorow, Scholz, Schneider, and the Mondragon literature. It includes formal solvency analysis, revenue modeling at five scale scenarios (300 to 5M members), Howey test securities analysis, mechanism design evaluation, and comparison with venture-subsidized platform economics (Uber, DoorDash, WeWork).

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full academic paper with formal solvency analysis and revenue modeling |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Creator share | 83.3% (constitutional, DNA-locked) |
| Platform margin | 16.7% (Cost+20%) |
| Membership fee | $5/year (DNA-locked) |
| Currencies | 3 (Credits, Marks, Joules) |
| Revenue at 50K members | ~$16.95M/year |
| Uber cumulative losses pre-profit | $31 billion |
| Apple App Store take rate | 30% |
| Papers in series | 5 |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Garlic (Finance/Business) | Primary |
| Pepper (Legal/Compliance) | Secondary |
| Salt (Operations/Fundamentals) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  111,
  'Self-Funding Economics',
  'self-funding-economics',
  'Paper 3: Self-Funding Platform Economics — How Cost+20% and $5/Year Eliminate VC Dependency',
  12000,
  'Uber lost thirty-one billion dollars before it made a dime...',
  'Full academic paper with formal solvency analysis, five-scenario revenue modeling, Howey test securities analysis, and comparison with venture-subsidized platforms.',
  'garlic',
  ARRAY['pepper', 'salt'],
  ARRAY[],
  'B075',
  'draft'
);
```
