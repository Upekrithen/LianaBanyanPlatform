# R9 Pitch Block — Plain English Three-Paragraph — v2 SCAFFOLD
## B110, April 19, 2026

**Purpose:** Reusable plain-English explanation of the R9 architecture. v2 replaces the "needles / haystack" metaphor with Founder-ratified **Librarian = bookstore owner** (¶1) and **Paint / Brush / Can + Flatbed + Stitchpunks** (¶2). ¶3 adds the **ecosystem + à la carte** framing and a **Cardboard Boots** callback.

**Scaffold note:** Per [feedback_drafts_as_scaffolding.md](../../.claude/projects/C--Users-Administrator-Documents/memory/feedback_drafts_as_scaffolding.md), this is structural scaffolding. Expect 60–80% prose rewrite by Founder. Anecdote hooks marked `[FOUNDER HOOK: ...]`.

**Provenance of numbers:** unchanged from v1 (see `R9_PITCH_BLOCK_PLAIN_ENGLISH_B109.md`). Numbers are load-bearing.

**Metaphor ratifications (B110):**
- ¶1 Librarian = small-bookstore-owner: see [project_librarian_bookstore_metaphor.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_librarian_bookstore_metaphor.md)
- ¶2 Paint / Brush / Can + Flatbed + Stitchpunks: see [project_paint_can_metaphor.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_paint_can_metaphor.md)
- ¶3 Ecosystem + à la carte + "add W, save Y more" prompt: see [project_ecosystem_a_la_carte_pledge.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_ecosystem_a_la_carte_pledge.md)

---

## ¶1 — What we built and measured

What we built is a **Librarian**. Not the compressed-summary kind — the kind you meet in a really good small independent bookstore, where the owner has read everything on the shelves and has a sixth sense for connections.

[FOUNDER HOOK: the story from last week — the book your daughter wanted, the two words of the seven-word title you remembered, the owner walking straight to the shelf, naming the same author's earlier and later books plus three adjacent authors in the tradition. Concrete beats abstract every time. That scene *is* the Librarian.]

That's what we built for Liana Banyan. The AI doesn't just have a Librarian sitting beside it — it has one that's actively listening to the conversation, handing the context to our **Stitchpunks** (our zero-cost AI workers), who queue up exactly the facts, decisions, numbers, letters, and people the next question is going to need. It works more like a mind than a database. [FOUNDER HOOK: and we're actively testing a new layer right now — the Librarian's *connection* sense, spotting which facts point to which other facts that no one asked about directly. SP-16 surfaced three such patterns on its first live run.]

To prove it actually works, we gave the Librarian the hardest version of the job: **75 specific questions** about the platform — pricing, patents, the people, the rules — and asked three different AIs, large and small, to answer each question two ways. Once without the Librarian. Once with. **Without the Librarian: about 8 out of 100 correct. With the Librarian: between 93 and 97 out of 100 — across every AI we tested.** The platform has a brain it can keep.

---

## ¶2 — How it compares to Google, Microsoft, Anthropic, and what it's worth

The big AI companies see the same problem we see, and they answer it the same way: **bigger paint**.

The **paintbrush** is the AI. The **paint on the brush** is the current session — what the AI has in hand while it's talking with you. The **paint can** is the body of knowledge it's reaching into.

**Google's** answer is a bigger can. Infini-Attention and a 1-million-token context window — hand the AI a bigger container and tell it to find what it needs in there. Then in March they released **TurboQuant**, a compression trick that squeezes roughly 6× more paint into the same can; the chip stocks dropped on the news. Both are real engineering. But here's what Google's own paying users report about the result: a Gemini AI Pro subscriber filed a public complaint last month that Gemini 3.1 Pro — the one-million-token model — starts "forgetting" critical details from Prompt #1 by **prompt #21 to #25**. The spec says a million; the lived experience is about twenty. **Microsoft's** answer: let Copilot dip into your files and inbox when you ask — a bigger brush, dipping into whatever can is closest. It doesn't decide *which* facts are canonical; you get whatever it grabbed. **Anthropic's** answer: a "memory" feature that remembers a few facts session-to-session, plus prompt caching so the same document isn't paid for twice — a smarter brush, not a smarter system.

All three are pushing on the **paint and the brush**. Same shape, bigger scale.

What we built is different in *shape*, not in scale. We carry the paint we need with us — the tightly-curated Librarian packet — and we tow a **flatbed truck** behind us loaded with everything else, driven by **Stitchpunks** (our zero-cost AI workers) who listen to where the conversation is going and hand up the exact paint needed, right when it's needed. **Librarian up front. Flatbed behind. Stitchpunks driving.** No one paying by the gallon.

**What it's worth, measured:** applying this architecture inside Microsoft's Copilot suite would save roughly **$750 million per year** in inference costs. Inside Anthropic's own developer tools, around **$130 million per year**. Those are the corporate prizes. The bigger prize — the *commons* prize — is what we built it for.

---

## ¶3 — The ask to MacKenzie Scott

That commons prize is what brings us to MacKenzie Scott.

We have **13 provisional patents** on this architecture. We have until **November 26, 2026** to convert them into full utility patents — the legal step that locks the protection in. Conversion is expensive: **$5 to $10 million** in legal fees, which happens to be Scott's normal grant size. So we're asking her to fund a **Patent Prosecution Defense Fund** at that level, for one specific purpose: to file the patents so we can place them inside our **Cooperative Defensive Patent Pledge**.

The Pledge is not a sword. It's a shield. By patenting it ourselves and pledging it into the commons, we make sure no one else can patent it and lock the commons out.

Here's the part that matters: **the Pledge is designed the way a well-run ecosystem works, and also the way an à la carte menu works, at the same time.** You can take just R9 — the Librarian architecture — and save what you save. You can add the next piece, and the next, and get the synergistic benefit that comes from using them together. Or you can stay at one piece forever. Your choice. Nothing is forced, nothing is bundled, nothing is locked in. And the system is built to tell you in plain numbers, every time you use it:

> *"You're already using the Pledged Commons R9 and saving $X per year. If you added W, you'd save or earn $Y more."*

That's it. Transparent, opt-in, and reversible. The synergy is real — layering pieces really does compound. But it's **your** compound, built on **your** decision, not the platform's.

Under the Pledge, every nonprofit, cooperative, and academic institution gets the R9 architecture **free, forever**, on nothing more than an IRS-verified EIN. For Scott specifically, that means every nonprofit her foundation has ever funded — **~2,300 documented grantees, representing ~$17 billion in giving since 2020** — gets the architecture at no cost, structurally, in perpetuity, whether or not she funds the Defense Fund. Measured benefit to her network alone (conservative adoption): **$115 to $280 million per year, recurring.** Across the broader nonprofit and cooperative sector if they adopt under the Pledge: **$1 to $5 billion per year.**

We're not asking for charity. We're asking her to fund the legal step that lets us hand her grantees the infrastructure their work runs on, for free, forever.

[FOUNDER HOOK: Cardboard Boots callback here. v014f anchor line — the unvarnished "this is what we walked in wearing" framing. The ask isn't fancier boots. The ask is the seal that keeps the commons open for everyone who comes after us.]

The corporate prizes are big. The commons prize is bigger. The Pledge is the only one that's free, in perpetuity, for everyone who signs it.

---

*Saved B110 as v2 scaffold. Metaphors Founder-ratified; prose awaits Founder rewrite. Numbers load-bearing — do not edit without re-checking canonical sources.*
