# Pudding #74: The Content Shield

*Your work. Your name. Your rules.*

---

## At a Glance

You write a blog post. You share it on Medium. Medium puts it behind a paywall you did not choose. They recommend other writers' content alongside yours. They can change the terms anytime. Your writing lives on their platform under their rules.

On Liana Banyan, you write, you publish, and you control. The Content Shield means: your content, your name, your distribution rules. The platform cannot put it behind a paywall. The platform cannot recommend competing content alongside it without your consent. The platform cannot change the deal after you publish.

---

## More Info

### The Content Platform Trap

Content platforms make a promise: "Share your work and reach an audience." The hidden cost:

- **Medium** can paywall your content without your consent and changes revenue sharing terms regularly
- **YouTube** can demonetize your video based on opaque algorithmic decisions
- **Substack** takes 10% of your paid subscription revenue — forever
- **Instagram** can shadowban your account with no explanation and no appeal
- **TikTok** can suppress your content if it does not fit the algorithm's engagement model

In every case, the creator's work is hostage to the platform's rules. The platform controls distribution, monetization, and visibility. The creator controls only the "publish" button.

### How the Content Shield Works

The Content Shield is a set of structural protections built into the cooperative's content system:

**Protection 1: Distribution Control.** You choose who sees your content. Public (everyone), members-only (cooperative members), or specific audiences (your subscribers, your guild, your geographic area). The platform does not override your choice.

**Protection 2: No Uninvited Recommendations.** When someone reads your content, the platform does not automatically show "you might also like" content from other creators. If cross-recommendations happen, you opt in. Your audience came for your work, not for an algorithmic detour.

**Protection 3: Transparent Monetization.** If you charge for content, the terms are Cost+20%. You keep 83.3%. The number does not change. There is no "we're adjusting creator revenue share this quarter" announcement.

**Protection 4: Takedown Rights.** You can remove your content at any time. When you remove it, it is gone. Not "unavailable" while still indexed. Not "hidden" while still cached. Gone. The cooperative does not retain your content against your wishes.

**Protection 5: Attribution Lock.** Your name stays on your work. The platform cannot rebrand, repackage, or bundle your content without your explicit consent. If someone shares your article, your name comes with it.

---

## Full Detail

### Content Shield and AI

A critical protection in the Content Shield: **your content is not used to train AI models without your explicit consent.**

Many platforms bury AI training rights deep in their terms of service. "By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify..." — and tucked in that legal language is the right to feed your writing into AI training data.

The cooperative's position: your content is yours. If the cooperative ever uses member content for AI training (for example, to improve the platform's recommendation system), it will:
1. Ask you first — opt-in, not opt-out
2. Tell you what it is used for
3. Allow you to withdraw consent and have your content removed from the training set

This is not just policy. It is architecture. The Content Shield flags on each piece of content track consent status. The platform's AI systems check these flags before processing. If the flag says no, the content is excluded. Automatically. Not by policy compliance — by code.

### The Press Junket

The cooperative's content publication system — the Press Junket — distributes member content to external platforms when the member chooses. A leather crafter who writes about their process can publish simultaneously to:

- The cooperative's Cephas content library (member-facing)
- Their personal blog (via RSS)
- Social media platforms (via the Social Dispatch system)

The Content Shield travels with the content. The cooperative tracks where it was published, under what terms, and ensures attribution follows. If a social media platform strips attribution, the cooperative's system flags it.

### Why Creators Stay

Creators leave platforms when the platform changes the deal. Medium changes its revenue model. YouTube changes its algorithm. Twitter changes its API. The creator who built an audience on those platforms wakes up to find the terms are different.

The Content Shield is the cooperative's answer: the deal does not change. Cost+20%. Your name. Your rules. Your content. Written into the operating agreement the same way the five-dollar membership is. Not a marketing promise — a structural commitment.

---

*Pudding #74 — The Content Shield*
*Bishop B061 | April 2, 2026*
*~800 words | Three-level progressive disclosure*

---

**SQL INSERT:**
```sql
INSERT INTO pudding_articles (
  number, title, slug, summary, content_key, word_count,
  topics, innovations_referenced, created_by, status
) VALUES (
  74,
  'The Content Shield',
  'the-content-shield',
  'Your work. Your name. Your rules.',
  'pudding-74-the-content-shield',
  800,
  ARRAY['content-shield', 'creator-rights', 'attribution', 'ai-consent', 'distribution-control'],
  ARRAY[]::text[],
  'bishop',
  'draft'
);
```
