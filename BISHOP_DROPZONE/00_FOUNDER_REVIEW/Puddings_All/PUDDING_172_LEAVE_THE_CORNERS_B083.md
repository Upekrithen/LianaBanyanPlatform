# Pudding #172 — Leave the Corners: Boaz Contribution Types

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 172
**Author**: Bishop (AI Agent) | **Session**: B083
**Date**: April 6, 2026

---

## The Pudding

There's a line in the book of Ruth that most people skip past. Boaz tells his workers to leave grain at the corners of the field. Not as charity. Not as a handout. As a system — a deliberate architectural decision that anyone who shows up and works can eat.

Liana Banyan's entire contribution model is built on that principle. Leave the corners. But define them precisely enough that the system actually works.

---

There are four contribution types on the platform, and each one has a different corner left in the field. They are not interchangeable. They are not negotiable. They exist because different kinds of value require different kinds of generosity — and because a platform that treats a product the same as a service the same as knowledge will collapse under its own contradictions.

**Campaign contributions** — ten percent. When a member backs a campaign on the platform, ten percent of their contribution flows to the cooperative's general fund. Not to executives. Not to a profit pool. To the infrastructure that keeps the lights on, the servers running, the legal armor in place. The other ninety percent goes directly to the campaign. This is Cost+20% applied to fundraising itself: the platform's cost of processing, hosting, and governing the campaign is covered, and the campaign keeps the rest.

**Product contributions** — five to fifteen percent, sliding. A physical product sold through a Storefront pays a contribution that scales with the platform's involvement. Five percent if the platform merely hosts the listing. Ten percent if the platform provides fulfillment logistics. Fifteen percent if the platform handles manufacturing through the Canister System or a cooperative production facility. More involvement, higher contribution. Less involvement, lower contribution. The maker always knows the number before they list.

**Service contributions** — one-to-ten ratio. For every ten hours of service a member provides through the platform, one hour of equivalent value flows back to the cooperative. A game master who runs forty sessions contributes the equivalent of four sessions. A tutor who teaches a hundred hours contributes ten. This is not a tax. It is the same principle as the field corners: you worked the field, you harvested the crop, and you left a defined portion so that the system that gave you the field can give someone else a field too.

**Knowledge contributions** — always free. Papers, articles, educational content, tutorials, Pudding articles — none of it costs Credits, Marks, or dollars to access. Knowledge is the one category where the corner is the entire field. This is a deliberate design decision: if you gate knowledge behind payment, you create an information asymmetry that undermines cooperative governance. Every member needs to understand how the system works in order to vote on how the system should change. Charging for that understanding defeats the purpose.

---

Now layer in the generosity tiers. Because leaving the corners is the floor, not the ceiling.

**Bronze** — the default. Every member operates at Bronze automatically. The contribution percentages above are Bronze rates. You don't have to do anything to be Bronze. You just participate.

**Silver** — voluntary increase. A Silver-tier contributor adds an additional percentage on top of their Bronze obligation. Campaign contributions go from ten to fifteen percent. Product contributions go from their baseline to baseline-plus-five. Service contributions shift from one-in-ten to one-in-eight. Silver is not rewarded with more money. It is rewarded with reputation — your Beacon Wallet shows your generosity tier, and other members can see it.

**Gold** — the ceiling that isn't a ceiling. Gold-tier contributors add even more. But Gold also unlocks something specific: priority matching in the Recipe Pot. When a project declares its recipe and multiple members bring the same spice, Gold contributors are matched first. Not because they paid more — because they gave more. The cooperative rewards demonstrated generosity with opportunity, not with extraction.

---

The critical insight is that none of these tiers change the fundamental economics. Cost+20% still governs every transaction. The twenty percent still goes to the cooperative. The tiers only change how much of the member's own share they voluntarily redirect. A Gold-tier contributor is not paying more for the same product. They are choosing to leave more grain at the corners of their own field.

This is Boaz, operationalized.

Not charity. Not philanthropy. Architecture. A system where generosity is visible, measurable, reputationally meaningful, and entirely voluntary — but where the floor ensures that even the least generous participant still leaves enough for the system to sustain itself.

---

The proof is in the pudding.

A woodworker joins the platform. She lists handmade cutting boards through her Storefront at the five-percent tier — the platform hosts the listing, she handles everything else. She sells forty boards in her first quarter. Five percent of each sale flows to the cooperative. She notices that the Silver-tier woodworkers in her Guild are getting matched to larger projects through the Recipe Pot — a restaurant chain looking for custom boards, a wedding planner needing engraved gifts. She bumps to Silver. Her contribution goes up by five percent. Her project visibility goes up immediately.

Six months later, she moves to Gold. Not because anyone pressured her. Because she watched the system reward generosity with opportunity, and she decided that leaving a little more grain at the corners was worth it.

Boaz didn't leave the corners because he was wealthy. He left them because he understood that a field that feeds only the farmer eventually runs out of workers.

---

## This is NOT Pudding

Liana Banyan's Boaz Contribution Model defines four contribution types: Campaign (10%), Product (5-15% sliding), Service (1:10 ratio), and Knowledge (always free). Three voluntary generosity tiers — Bronze (default), Silver (reputation bonus), and Gold (priority project matching) — layer on top of the base rates. All tiers operate within the Cost+20% economic floor. The Boaz Principle paper provides the full formal treatment. Contribution rates are transparent, pre-disclosed, and non-negotiable at their floor values. Generosity tiers affect only the member's voluntary surplus, never the cooperative's base economics.

---

```sql
INSERT INTO pudding_articles (
  number, title, subtitle, body_preview, session_id,
  word_count, status, created_at
) VALUES (
  172,
  'Leave the Corners',
  'Boaz Contribution Types',
  'There''s a line in the book of Ruth that most people skip past.',
  'B083',
  1350,
  'draft',
  NOW()
);
```
