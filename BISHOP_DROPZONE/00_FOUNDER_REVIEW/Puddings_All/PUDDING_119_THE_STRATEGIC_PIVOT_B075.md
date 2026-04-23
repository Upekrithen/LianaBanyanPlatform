# Pudding #119 — The Strategic Pivot

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 119
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 compilation of Kickstarter Campaigns 1-7

---

## The Pudding

There are two versions of Kickstarter Campaign 1.

The first version is Tereno. The Water Table. A gaming surface that creates real tides, waves, and currents. No batteries. No electronics. Just water, gravity, and 40 years of engineering. Goal: $12,000. Category: Tabletop Games. Hook: "What if your game table could breathe?"

This was the original vision. Campaign 1 would be the full water table. The centerpiece product. The thing that made everyone say "I've never seen anything like this before." A $12,000 ask for a product that would set the tone for the entire 14-campaign arc.

The second version is Slotted Top. A single hex tile. 60mm. Compatible with Catan, BattleTech, Heroscape, or any hex-based game you already own. One hex tile. Every game. Goal: $1,000. Chain link: 1 of 14.

This is the revised strategy. Start smaller. Build commitment. One hex tile is the first piece of something bigger — a 27-piece modular mechanical system called the Hexel. The Slotted Top is the gateway. You back it. You get a hex tile that works with your existing games. And you're now part of a 14-campaign journey to build the most ambitious tabletop gaming system ever attempted.

Both campaigns are in the archive. Neither was deleted.

The strategic shift is preserved. You can read the original Tereno pitch and see the vision — the entire water table, revealed all at once, asking backers to commit to something audacious. You can read the Slotted Top pitch and see the patience — the low-commitment entry point, the build-trust-first philosophy, the escalation arc.

These are not just two drafts of the same campaign. They are two different theories of how to launch a tabletop gaming product line.

Theory A: Lead with the hero product. Make people believe. If they believe, they back big. If they don't, the campaign fails and you learn.

Theory B: Lead with the compatible upgrade. Make people try. If they try, they're in the ecosystem. If they don't, the campaign hits a small goal and you iterate.

Most organizations would pick one theory, write the campaign, and delete the other. Liana Banyan kept both.

And now there is a Pawn prompt in the dropzone asking for a strategic synthesis — not to pick between them, but to find a hybrid that captures the strengths of both. Dual-track campaigns. Sequential linked launches. Stretch goal unlocks. The Founder is asking: what happens if we combine the $12K ambition with the $1K entry point?

The Attic preserved the question. The Attic did not force the answer.

That is why you keep two versions. Because someday you will need to synthesize them, and you will be glad the evidence is still there.

---

## This is NOT Pudding

Bishop B075 compilation of Kickstarter Campaigns 1-7 identified that Campaign 1 exists in two strategic versions in the archive: the original $12,000 Tereno Water Table (Vault canonical) and the revised $1,000 Slotted Top (BISHOP_DROPZONE master copy for the 14-campaign arc). A Pawn B45 synthesis prompt has been dispatched requesting analysis of hybrid strategies combining both approaches. Full compilation in `COMPILED_KICKSTARTER_CAMPAIGNS_1_7_B075.md`.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Both Campaign 1 versions + Pawn synthesis request with hybrid strategy options |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Campaign 1 strategic versions | 2 |
| Original Tereno goal | $12,000 |
| Revised Slotted Top goal | $1,000 |
| Arc length | 14 campaigns |
| Chain bonus stacking | 5% Joule per consecutive backing |
| Character progression lines | 2 (Peasant→King, Merchant→Queen) |
| Patent bags connected | 2 (Bag 5 Hydraulic, Bag 6 Diceless Combat) |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Sugar (Marketing/Outreach) | Primary — campaign strategy, backer psychology |
| Paprika (Leadership/Vision) | Secondary — strategic pivots, launch theory |
| Oregano (Coordination/Governance) | Secondary — preserved decision history |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  119,
  'The Strategic Pivot',
  'the-strategic-pivot',
  'Kickstarter Campaigns 1-7 (Bishop B075 compilation) + Pawn B45 synthesis request',
  NULL,
  'There are two versions of Kickstarter Campaign 1. The first version is Tereno...',
  'Both Campaign 1 strategic versions ($12K Tereno vs $1K Slotted Top) preserved in archive, with Pawn B45 hybrid synthesis analysis dispatched.',
  'sugar',
  ARRAY['paprika', 'oregano'],
  ARRAY[],
  'B075',
  'draft'
);
```
