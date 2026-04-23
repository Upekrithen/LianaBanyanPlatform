# Pudding #181 — BandWagon: Trust Your Taste

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 181
**Author**: Bishop (AI Agent) | **Session**: B083
**Date**: April 6, 2026

---

## The Pudding

You've been right before. About restaurants. About music. About which project in your Guild would actually work and which one was going to collapse under its own ambition. You've got taste — that inarticulate pattern-matching ability that says "this one, not that one" before your rational brain can explain why.

Most platforms ignore that. BandWagon doesn't.

---

BandWagon is the system that turns demonstrated judgment into authority. Not authority over people — authority over allocation. The better your track record of predicting what succeeds, the larger your budget for backing what comes next.

Here's the basic loop. You see a campaign on the platform. A new product, a new service, a new project. You decide to back it — with Credits, with Marks, with your name on the supporter list. You're not just spending. You're making a prediction: this will succeed.

If it succeeds — defined by the campaign reaching its goal, the product hitting its sales threshold, or the project delivering on its stated outcomes — your prediction is validated. Your BandWagon score goes up. And when your score goes up, your allocation budget grows.

Allocation budget is the amount of cooperative resources you can direct toward projects in the next cycle. A member with a high BandWagon score can back more campaigns, with more Credits, and with more influence on which projects get priority placement in the marketplace. A member with a low score can still back anything they want — but their allocation budget is smaller, meaning their capacity to direct cooperative resources is proportionally limited.

---

This is not gambling. The distinction matters.

In gambling, you risk your own money on an uncertain outcome and the house takes a cut regardless. In BandWagon, you allocate cooperative resources toward projects you believe in, and the cooperative tracks whether your beliefs were accurate. Your Credits are still spent — you don't get them back if the campaign fails. But your BandWagon score — the meta-currency of demonstrated judgment — is what determines your future influence.

The Credits you spend are real. The taste you demonstrate is the compounding asset.

---

The scoring model has three components.

**Hit rate** — what percentage of your backed projects succeed? A member who backs ten campaigns and seven succeed has a seventy percent hit rate. A member who backs twenty and fourteen succeed also has seventy percent, but with more statistical confidence. Hit rate alone isn't enough — a member who only backs safe, obvious campaigns would have a high hit rate but wouldn't be demonstrating exceptional taste.

**Discovery score** — did you back it early? A campaign that eventually gets five hundred backers is a proven success. Backing it as backer number four hundred and ninety-nine shows agreement, not prediction. Backing it as backer number twelve shows discovery — you identified the value before the crowd validated it. Discovery score rewards early backing with a multiplier on the BandWagon score. The earlier you saw it, the more credit you receive.

**Diversity coefficient** — are you backing across domains, or only within your comfort zone? A member who exclusively backs manufacturing campaigns has taste in manufacturing. A member who backs manufacturing, education, design, and service campaigns — and gets them right across all four domains — has general taste. The diversity coefficient rewards cross-domain accuracy because generalized judgment is rarer and more valuable to the cooperative.

These three components multiply together. High hit rate times early discovery times diverse accuracy equals a BandWagon score that represents genuine curatorial ability — the ability to look at an unproven idea and say "this one" before the evidence is in.

---

The allocation budget scales with the score, but it has a ceiling. No member, regardless of BandWagon score, can direct more than a defined percentage of the cooperative's discretionary allocation in any cycle. This prevents taste concentration — the scenario where one person with an exceptional track record effectively controls the cooperative's resource allocation. The ceiling ensures that many members with good taste collectively determine resource flow, not one member with extraordinary taste.

The ceiling also creates a natural mentorship incentive. A member who has maxed out their allocation budget can't grow it further — but they can grow other members' budgets by teaching them to identify quality. A Guild with five members at near-ceiling BandWagon scores has five times the collective allocation power of a Guild with one star and four passengers. Spreading taste is more valuable than hoarding it.

---

The TasteMaker integration connects BandWagon to content. A member with a high BandWagon score in Ginger (innovation) gets elevated visibility when they recommend Ginger-tagged content. Their Skipping Stone shares, their Pudding recommendations, their BST episode highlights — all carry more weight in the discovery algorithm because their track record says: this person identifies quality innovation.

This is editorial authority earned through prediction, not given through title. Nobody appointed the member as an innovation curator. They demonstrated curatorial ability by consistently backing innovations that succeeded, and the platform rewarded that demonstration with influence over what other members discover.

The feedback loop closes when the content they recommend generates engagement, which generates Beacon data, which validates the recommendation, which further strengthens their BandWagon score. Good taste compounds. The better your recommendations, the more visible your future recommendations become, and the more responsible you are for what succeeds next.

---

The proof is in the pudding.

A member — let's call him Ray — joins the platform and starts backing campaigns. In his first six months, he backs fourteen projects. Eleven succeed. His hit rate is seventy-nine percent. But what gets the algorithm's attention is his discovery score: nine of his eleven successful picks were backed when they had fewer than twenty supporters. Ray wasn't following the crowd. He was ahead of it.

His BandWagon score rises. His allocation budget grows from the base level to three times the default. He starts backing more ambitious projects — a Canister System product that nobody else is touching, a Cooperative Classroom course in a niche subject. Both succeed.

Other members notice. Ray's profile shows his BandWagon score and his backed-projects history. Two Guild leaders invite him to consult on which projects their Guilds should support. He doesn't charge for the advice — but the members he advises start backing the same projects, and their scores start climbing too.

A year in, Ray's Guild has the highest average BandWagon score on the platform. Not because Ray is picking everything. Because Ray taught five other people to pick, and now six people with strong taste are collectively directing cooperative resources toward projects that succeed at a rate well above average.

Trust your taste. Then teach it.

---

## This is NOT Pudding

BandWagon is a taste-prediction authority system that converts demonstrated judgment into allocation budgets for directing cooperative resources. The scoring model combines hit rate (prediction accuracy), discovery score (early-backing multiplier), and diversity coefficient (cross-domain accuracy). Allocation budgets scale with score but are ceiling-capped to prevent taste concentration. TasteMaker integration elevates content recommendations from high-scoring members within their demonstrated domains. The system creates a compounding loop where accurate predictions increase influence, increased influence increases visibility of future recommendations, and recommendation outcomes feed back into the score. Mentorship incentives emerge naturally from the ceiling cap: spreading taste is more valuable than hoarding it.

---

```sql
INSERT INTO pudding_articles (
  number, title, subtitle, body_preview, session_id,
  word_count, status, created_at
) VALUES (
  181,
  'BandWagon',
  'Trust Your Taste',
  'You''ve been right before. About restaurants. About music.',
  'B083',
  1420,
  'draft',
  NOW()
);
```
