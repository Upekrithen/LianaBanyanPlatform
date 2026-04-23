# Pudding #112 — The Portable Reputation

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 112
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Paper 4 — The Portable Reputation

---

## The Pudding

An Uber driver completes 10,000 trips. Five stars. A decade of excellent work. Then they leave. Their reputation? Zero. Ten thousand verified interactions, erased at the platform boundary.

This is not a bug. It is a business model. Lock-in through reputation. You built the asset. The platform owns it. Try to leave and you start from nothing.

The Portable Reputation Portfolio does the opposite. It is yours. Five categories — Quality, Timeliness, Professionalism, Collaboration, Standards — not one meaningless star rating. Blocks accumulate with every positive interaction. Five blocks compress into a star. Five stars compress into a sun. A sun represents 25 sustained positive interactions that you cannot fake and cannot buy.

The platform verifies every entry. Ratings are tied to real interactions — completed transactions, project collaborations, guild activities, mentoring outcomes. Not like LinkedIn, where anyone clicks "endorse" on a skill they have never seen you demonstrate. Not like Amazon, where fake reviews are an industry. Verified. Multi-dimensional. Anchored to real work.

And when you leave? You take it with you. JSON export, digitally signed by the cooperative. Blockchain-anchored provenance medallions for high-stakes verification — a cryptographic hash on-chain proving your data existed in its claimed state at a specific time. No personal data on the blockchain. Just the proof.

Your guild credentials come too. The Forge, The Scale, The Engine Room — earned through participation and peer evaluation, not self-reported claims. Your committee eligibility history. Your mentoring track record from the Lighthouse Ladder. Your saved Contingency Operator scenarios that function as mini business plans in your portfolio.

Privacy is member-controlled. Show your full name or use a moniker. Show your scores or hide them entirely. You cannot cherry-pick — hide individual bad ratings while showing good ones. But you can control visibility at the category level. Privacy without deception. Transparency without compulsion.

The cooperative issued your credentials. You own them. Present them anywhere. The signature is on it. The provenance is on-chain. Your reputation is a portable asset, not a sunk cost.

---

## This is NOT Pudding

Paper 4: "The Portable Reputation: User-Controlled, Platform-Verified Influence Portfolios for Cooperative Platforms" is a ~12,000-word academic paper with 25+ references spanning reputation system foundations (Resnick, Dellarocas, Bolton), manipulation research (Luca, Mayzlin), platform lock-in economics (Shapiro & Varian, Srnicek), cooperative governance (Scholz, Schneider), self-sovereign identity (Allen, Mühle), and gamification (Deterding). It includes comparative analysis against Uber, Amazon, LinkedIn, and eBay/Etsy reputation systems.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full academic paper with system design, incentive analysis, and portability architecture |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Scoring categories | 5 (Quality, Timeliness, Professionalism, Collaboration, Standards) |
| Compression ratio | 5:1 (blocks→stars→suns) |
| Interactions for 1 sun | 25 |
| Committee eligibility | 100+ interactions AND 4.0+ overall |
| Guild count | 7 (Forge, Scale, Engine Room, War Table, Ledger, Crow's Nest, Quarterdeck) |
| Uber driver trips lost on exit | 100% |
| LB member data retained on exit | 100% |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Ginger (Innovation/R&D) | Primary |
| Oregano (Coordination/Governance) | Secondary |
| Cinnamon (Design/UX) | Secondary |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  112,
  'The Portable Reputation',
  'the-portable-reputation',
  'Paper 4: The Portable Reputation — User-Controlled, Platform-Verified Influence Portfolios',
  12000,
  'An Uber driver completes 10,000 trips. Five stars. A decade of excellent work. Then they leave...',
  'Full academic paper with five-category scoring architecture, blocks-stars-suns aggregation, Shadow Mark mechanism, blockchain provenance, and comparative analysis against Uber/Amazon/LinkedIn.',
  'ginger',
  ARRAY['oregano', 'cinnamon'],
  ARRAY[],
  'B075',
  'draft'
);
```
