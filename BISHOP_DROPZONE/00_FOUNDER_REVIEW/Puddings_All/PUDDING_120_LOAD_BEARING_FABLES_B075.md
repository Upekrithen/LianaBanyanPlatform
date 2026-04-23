# Pudding #120 — Load-Bearing Fables

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 120
**Author**: Bishop (AI Agent) | **Session**: B075
**Date**: April 4, 2026
**Source**: Bishop B075 compilation of Reference Materials / Fable Arc

---

## The Pudding

Most platforms decorate their marketing with stories.

A tagline. A folksy founder anecdote. Some gentle metaphors about community. The stories are wallpaper — applied to the outside of the building to make it look warmer than the corporate structure underneath.

Liana Banyan built its platform from the fables outward.

Three classic children's stories. Each one maps to a specific production system that runs on the platform every day.

Stone Soup is the Recipe Pot.

In the fable, three hungry soldiers arrive in a village. The villagers hide their food. The soldiers announce they will make stone soup — just a pot, some water, and a stone. As the soup simmers, they mention it would be better with a few carrots. A villager brings carrots. It would be better with some onion. Another villager brings onion. By the end, every villager has contributed an ingredient, and there is enough soup to feed the whole village.

Innovation #2143: The Recipe Pot. A project declares its recipe — "We need Garlic, Cumin, and a pinch of Pepper." Members bring their spice (their skill). The project fills. The cooperative produces. Stone Soup, operationalized. Every villager brings an ingredient. The pot feeds everyone.

The Grasshopper and the Ants is "Us. The Ants."

In the fable, the ants spend summer gathering food while the grasshopper plays music. When winter comes, the grasshopper starves while the ants survive on what they stored. Most modern retellings soften this — the ants share. In the original, the lesson is harder: the colony survives because everyone carried something.

Pudding #108 (The Spice Must Flow): "Where does all that money come from, anyway? Us. The Ants." Not the grasshoppers watching from the sideline. The ants — the ones who carry leaves ten times their body weight, who build tunnels that outlast the builders, who figured out long ago that the colony survives because everyone carries something. The cooperative is the colony. The membership is the ants.

The Little Red Hen is cooperative labor.

"Who will help me plant the wheat?" "Not I," said the dog. "Not I," said the cat. "Not I," said the duck. The hen plants alone, harvests alone, grinds the flour alone, bakes the bread alone. When the bread is done, everyone wants to eat. "Not you," says the hen. "I will eat it myself." And she does.

The cooperative principle: those who plant, harvest, grind, and bake get to eat. Contribution-based reward. 83.3% to the creator. Not because the cooperative is generous. Because the cooperative remembers who carried the weight.

Three fables. Three production systems. The narrative layer is not decoration on the outside of the platform. It is the foundation underneath.

And a drawing brief exists — explicit instructions to illustrate these fables in warm, hand-painted children's book style. Golden amber. Soft yellows. Burnt orange. Red for the Hen's gingham apron. Blue for sky and water. Avoid harsh neons. Avoid cold grays. Avoid black outlines. Do not be corporate, slick, sterile, or preachy.

The platform is serious infrastructure told as a bedtime story.

---

## This is NOT Pudding

The Liana Banyan Fable Arc consists of three classic children's fables (Little Red Hen, Stone Soup, Grasshopper and the Ants) that directly power three platform production systems. Documented in `07_REFERENCE_MATERIALS/Fable_Arc/` with drawing briefs, unified instructions, and visual world reference. The Fable Arc is designed to connect cooperative economics to childhood stories, creating semantic anchoring between the platform's technical mechanics and narrative identity.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | Full Fable Arc with drawing briefs and production system mappings |
| 4 | Reading Beacon | Your position saved, shareable on your Cue Card |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Fables in the arc | 3 |
| Production systems connected | 3 |
| Stone Soup → Recipe Pot | Innovation #2143 |
| Grasshopper/Ants → "Us. The Ants." | Pudding #108 + BST Ch.6 EP-042 |
| Little Red Hen → 83.3% creator share | Cost+20% margin architecture |
| Brand aesthetic | Hand-painted children's book (anti-corporate) |
| Family involvement | Founder's son illustrating |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Basil (Education/Creative) | Primary — narrative architecture, storytelling infrastructure |
| Paprika (Leadership/Vision) | Secondary — brand identity, strategic differentiation |
| Sugar (Marketing/Outreach) | Secondary — visual identity, illustration style |

---

## SQL Insert

```sql
INSERT INTO cephas_puddings (
  pudding_number, title, slug, source_paper, source_paper_word_count,
  pudding_text, not_pudding_summary, primary_spice, secondary_spices,
  innovations_referenced, bishop_session, status
) VALUES (
  120,
  'Load-Bearing Fables',
  'load-bearing-fables',
  'Fable Arc (Bishop B075 compilation of 07_REFERENCE_MATERIALS)',
  NULL,
  'Most platforms decorate their marketing with stories. Liana Banyan built its platform from the fables outward...',
  'The Fable Arc narrative architecture connecting Little Red Hen, Stone Soup, and Grasshopper/Ants to Recipe Pot, cooperative labor, and Pudding #108.',
  'basil',
  ARRAY['paprika', 'sugar'],
  ARRAY[2143],
  'B075',
  'draft'
);
```
