# Pudding #104: Skipping Stones

**Series**: This is Pudding | **Number**: 104 | **Session**: Bishop B072 | **Date**: April 3, 2026
**Innovations Referenced**: #2139 (Skipping Stones Depth Navigation), #2134 (Reading Beacon), #2135 (Deck Card Deep-Link), #2133 (Crewman #6)

---

## The Article

You're standing at the edge of a lake. You pick up a flat stone. You don't throw it straight — you throw it sideways, low, and watch it touch the surface once, twice, three times before it decides whether to skip again or sink.

That's how academic papers should work.

---

Every academic paper on Liana Banyan is organized into sections. Each section contains one complete idea. Most people will never read the whole paper. That's not a failure of the reader — it's a failure of distribution. The paper demands you start at the beginning and commit to the end. The reader wants to touch the surface first and decide if the water is worth diving into.

Skipping Stones fixes this.

---

Every first-level section of every paper becomes its own entry point. A Cue Card with a skipping stone logo, a title, and a one-sentence hook. Physical version: a Deck Card with a QR code. Digital version: shareable on your Cue Card profile. Either way, you touch the surface with zero commitment.

Scan the QR. Click the link. You land on a page that says three words that explain everything:

**The Proof is in the Pudding.**

---

That's not marketing. It's a navigation prompt. Below it, you get two choices:

**"Pudding"** — the accessible version. Five hundred to a thousand words. Written so anyone can understand the idea without the academic scaffolding. This IS Pudding. Smooth, approachable, no jargon. If the stone skipped and you're curious, this is where you wade in ankle-deep.

**"This is NOT Pudding"** — the full academic paper, deep-linked to the exact section the Skipping Stone came from. Dense. Uncompromised. Footnotes and formal claims. If you want to sink all the way to the bottom, this is the path.

---

Your Reading Beacon tracks where you are. Touched the Skipping Stone? Layer 1 — you skipped. Read the Pudding? Layer 3 — you waded in. Finished the full paper section? Layer 4 — you dove deep. The proof that was in the Pudding is now in your Beacon Wallet, recorded as engagement that counts toward vote-gating and tier progression.

You literally proved the pudding. By reading it.

---

The scale is staggering when you see it laid out. Thirty academic papers. Eight to twelve sections each. That's 240 to 360 Skipping Stones — each one a self-contained entry point with its own Deck Card, its own Pudding article, its own deep-link to the source.

Combined with the Blood, Sweat, and Tears episode system (142 episodes and growing), Liana Banyan now has two complete paper discovery systems: one for browsing and one for bingeing. Skipping Stones are spatial — enter any paper at any section. BST episodes are temporal — follow the narrative in order.

Two channels. Same content. Different reading modes. Both feeding into the same Reading Beacon system. Both producing engagement that counts.

---

The name isn't accidental. Skipping stones is what you do when you're not sure if the water is worth jumping into. You test it. You touch the surface. And sometimes — often — the stone skips farther than you expected.

---

```sql
INSERT INTO pudding_articles (
  number, title, subtitle, body_preview, session_id,
  innovations_referenced, word_count, status, created_at
) VALUES (
  104,
  'Skipping Stones',
  'How Academic Papers Learn to Skip',
  'You''re standing at the edge of a lake. You pick up a flat stone.',
  'B072',
  ARRAY[2139, 2134, 2135, 2133],
  680,
  'draft',
  NOW()
);
```
