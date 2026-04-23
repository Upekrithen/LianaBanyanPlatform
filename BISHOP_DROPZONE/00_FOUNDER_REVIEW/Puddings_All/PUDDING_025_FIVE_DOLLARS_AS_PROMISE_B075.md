# Pudding #25 — Five Dollars as Promise

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 25 (RETROACTIVE)
**Author**: Bishop (AI Agent) | **Session**: B075 (retroactive fill for B052-B053 gap)
**Date**: April 4, 2026
**Source**: Retroactive bridge between Pudding #24 (B052) and Pudding #26 (B053)

---

## Note on the Gap

Pudding #25 was never written. The numbered sequence jumped from #24 ("No Effort Is Wasted," Bishop B052, March 2026) directly to #26 ("Making Affordability a Status Symbol," Bishop B053, March 2026). A slot was left empty.

This Pudding, written in B075 (April 4, 2026), fills that gap retroactively. It bridges the thematic distance between B052's Liana Banyan Promise and B053's affordability-as-status argument.

Supersedes the placeholder row Knight added to cephas_puddings (K269).

---

## The Pudding

Five dollars.

That is what membership in Liana Banyan costs. Not five hundred. Not fifty. Five.

Less than a fast-food meal. Less than a single hour of street parking in some cities. Less than the per-month cost of a single streaming service you probably forgot you subscribed to.

And Pudding #24 said: "Everything you do on this platform earns Marks. Nothing disappears."

So the question becomes: what does five dollars actually buy, when nothing you do afterward is ever wasted?

Most things you pay for are transactions. You give money. You get a thing. The exchange ends. Whether you use the thing well or poorly, whether you return to it or never again, the transaction is complete and closed. Gym memberships at $80/month. Streaming services at $15/month. FoundersCard at $495/year (as Pudding #26 will note).

Five dollars to join Liana Banyan is not a transaction. It is a **declaration of intent**. You are saying: "I am going to participate in this cooperative. I am going to earn Marks. I am going to contribute. I am going to build a track record that nothing erases."

The five dollars opens the door. What happens on the other side of the door — every Mark earned, every Credit circulated, every Joule backed, every contribution logged — accrues to you permanently. The membership is the entry fee. The accrual is the point.

Compare the mental model:
- **Gym membership**: $80/month, you lose access the moment you stop paying
- **FoundersCard**: $495/year, you get hotel discounts while you pay, nothing after
- **Streaming service**: $15/month, your watch history exists only while you subscribe
- **Liana Banyan**: $5/year, everything you build stays yours forever

This is the inversion. Most subscriptions are **rented access**. Liana Banyan membership is a **permanent participation license**. The fee is tiny because the ask is simple: show us you care enough to commit five dollars to being here.

Once you commit, the cooperative commits back: we will record everything you contribute. We will back up your Marks. We will preserve your Portable Reputation. We will keep your participation history intact.

Five dollars is the smallest number large enough to mean "I am serious." It filters out bots (who won't pay $5 at scale) and tire-kickers (who won't pay for something they won't use). It includes virtually anyone (the charitable arm covers members who can't afford even $5).

The five dollars is not a price. It is a promise, made both ways.

That is why the number is constitutionally locked. That is why it won't be raised. That is why it is the smallest DNA-locked parameter in the platform's architecture.

Five dollars is the promise that $5 stays $5. The promise that the membership is accessible forever. The promise that entry into the cooperative never becomes a status filter.

And — as Pudding #26 will argue — five dollars is what makes affordability itself a new kind of status.

---

## This is NOT Pudding

Pudding #25 is a retroactive bridge document between Puddings #24 and #26, filling a gap in the sequential numbering left during Bishop sessions B052-B053. It explores the relationship between the $5/year membership fee (constitutionally locked in the DNA Lock) and the "nothing is wasted" promise established in Pudding #24. Situates the $5 price as a declaration of intent rather than transactional pricing, setting up Pudding #26's argument that affordability becomes status.

Documented via Knight K269 placeholder row replacement.

---

## Depth Layers

| Layer | Name | What You Get |
|-------|------|-------------|
| 1 | Skipping Stone | This article title + one-sentence hook |
| 2 | The Proof is in the Pudding | You are here — the accessible version |
| 3 | This is NOT Pudding | DNA Lock architecture + membership cost rationale |
| 4 | Reading Beacon | Schedule your return |

---

## By the Numbers

| Stat | Value |
|------|-------|
| Membership cost | $5/year |
| DNA Lock status | Constitutionally locked |
| Can be raised | No |
| Filter effect | Excludes bots, includes anyone |
| Charitable subsidy | Available for members who can't afford $5 |
| Bridge between Puddings | #24 (B052) and #26 (B053) |
| Session written | B075 (retroactive) |

---

## Spice Tags

| Tag | Type |
|-----|------|
| Garlic (Finance/Business) | Primary — membership economics |
| Paprika (Leadership/Vision) | Secondary — promise architecture |
| Oregano (Coordination/Governance) | Secondary — constitutional lock |

---

## SQL Insert (supersedes Knight K269 placeholder)

```sql
-- Supersede placeholder row for Pudding #25
UPDATE cephas_puddings SET
  title = 'Five Dollars as Promise',
  slug = 'five-dollars-as-promise',
  source_paper = 'Retroactive bridge (Bishop B075)',
  source_paper_word_count = NULL,
  pudding_text = 'Five dollars. That is what membership in Liana Banyan costs...',
  not_pudding_summary = 'Retroactive bridge Pudding exploring $5 membership as declaration of intent rather than transactional pricing.',
  primary_spice = 'garlic',
  secondary_spices = ARRAY['paprika', 'oregano'],
  innovations_referenced = ARRAY[],
  bishop_session = 'B075-RETROACTIVE',
  status = 'draft'
WHERE pudding_number = 25;
```
