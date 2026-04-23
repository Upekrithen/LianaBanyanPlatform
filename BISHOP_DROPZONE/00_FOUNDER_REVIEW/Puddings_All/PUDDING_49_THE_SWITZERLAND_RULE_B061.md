# Pudding #49: The Switzerland Rule

*How a cooperative handles the two topics everyone says you should never discuss.*

---

## At a Glance

Religion and politics. The two things your grandmother told you not to bring up at dinner. Every online platform struggles with them. Most either ban all political and religious content (which feels like censorship) or allow everything (which turns every comment section into a war zone).

Liana Banyan does neither. It has a policy called the Switzerland Rule — and it works differently than anything you have seen before.

---

## More Info

### The Problem

A cooperative platform has members who disagree about politics and religion. This is not a bug. It is a feature — a healthy cooperative includes people with different beliefs working together on shared economic goals. The problem is when those disagreements *prevent* the work from getting done.

Most platforms solve this with one of two bad options:

**Option A: Ban it all.** No political or religious discussion anywhere. This feels safe until a bill that directly affects cooperative food policy comes up for a vote, and members cannot even discuss it on the platform where they buy food together.

**Option B: Allow it all.** Every thread becomes a battleground. Members who came to sell leather goods or buy groceries leave because the comment section is toxic. The cooperative loses members over arguments that have nothing to do with its mission.

### The Switzerland Rule: A Third Option

The Switzerland Rule says: **The platform does not take sides. But it builds arenas where members can.**

Here is how it works:

**Tier 1 — The Marketplace is Neutral.** Product listings, transactions, Crew Calls, Design Democracy votes — all of these are Switzerland. No political or religious content in commerce spaces. You are here to buy, sell, make, and vote on designs. Period.

**Tier 2 — Arenas Exist.** The Political Expedition and the community forums have designated arenas where political and religious discussion is explicitly allowed — but only inside those arenas. If you enter an arena, you know what you are walking into.

**Tier 3 — Arenas Have Rules.** Inside an arena, you can argue. You can disagree. You can advocate. But you cannot: attack another member personally, use slurs, threaten, or attempt to silence someone by flooding the space. Violations get an acknowledgment stamp — not a ban. The stamp says: "This content was flagged. The member was notified." Three stamps and the member's arena access is paused for 30 days. Not their marketplace access. Not their membership. Just the arena.

**Tier 4 — The Record Is Public.** Every position taken in a Political Expedition arena is public and attached to a verified membership. Anonymous trolling is not possible. If you say something, you own it.

### Why Switzerland?

Switzerland is not pacifist. It is not apathetic. It is neutral — with one of the most well-armed and well-prepared populations in Europe. The Swiss model says: "We will not choose your side. But we will build the infrastructure for you to defend your own."

That is what the cooperative does. It does not tell you how to vote. It builds the Political Expedition so you *can* vote. It does not tell you what to believe. It builds arenas where you *can* discuss what you believe — in a structured space where disagreement does not destroy the community.

---

## Full Detail

### The Acknowledgment Stamp System

Most moderation systems are binary: content stays up or gets removed. Users get warnings or bans. This creates an adversarial dynamic between moderators and members.

The acknowledgment stamp is different. When content in an arena is flagged and reviewed:

1. **The content stays up.** It is not removed. It is *stamped* — visibly marked as having been reviewed and found to violate arena rules.
2. **The member is notified.** "Your post received an acknowledgment stamp for [specific rule]. This is stamp 1 of 3."
3. **The stamp is public.** Other members can see that the content was flagged. They can still read it. They can still respond to it.
4. **Three stamps = 30-day arena pause.** Not a ban. Not account deletion. A cooling-off period for that specific space.

The result: the member is held accountable without being silenced. The community sees that moderation happened without content being memory-holed. And the member keeps their marketplace access, their membership, their economic participation — because disagreement in an arena should never affect your ability to buy groceries.

### The No Religion/No Politics Linkage

There is a subtle but important design decision: religion and politics are linked in the policy because they are linked in practice. In American public life, religious conviction often drives political position and vice versa. A platform that bans political discussion but allows religious discussion (or the reverse) creates an asymmetry that inevitably feels unfair to someone.

The Switzerland Rule treats them identically. Both are confined to arenas. Both follow the same acknowledgment stamp rules. Both are attached to verified identities. Neither is banned. Neither is unmoderated. The platform's neutrality applies equally to both.

### Why This Matters for Cooperatives

Cooperatives that avoid all political engagement become invisible to policymakers. Cooperatives that embrace political engagement risk alienating half their membership.

The Switzerland Rule is a structural answer: build the tool, set the rules, stay neutral, let members decide. The cooperative's position is *infrastructure*. The members' positions are *their own*.

And if someone sends you a political text that makes your blood boil? Open Political Expedition. Find the bill. Vote against it. The Switzerland Rule did not stop you from caring. It gave you a structured place to do something about it.

---

*Pudding #49 — The Switzerland Rule*
*Bishop B061 | April 2, 2026*
*~1,000 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  49,
  'The Switzerland Rule',
  'the-switzerland-rule',
  'How a cooperative handles the two topics everyone says you should never discuss.',
  'pudding-49-the-switzerland-rule',
  1000,
  ARRAY['switzerland-rule', 'moderation', 'arenas', 'political-expedition', 'acknowledgment-stamps'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
