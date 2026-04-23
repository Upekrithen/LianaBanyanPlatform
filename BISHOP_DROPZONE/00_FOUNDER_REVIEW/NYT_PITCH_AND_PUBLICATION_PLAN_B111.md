# NYT Op-Ed Pitch + Publication Plan — B111
## April 20, 2026 — Jonathan Jones / Liana Banyan Corporation

**Premise:** You cannot be certain a cold-submitted op-ed to `opinion@nytimes.com` will be read. The op-ed desk triages by known byline and referral; unknown-author drafts have a low read-through rate regardless of quality. So the plan has two arms: **(1) pitch, don't submit** (3–4 sentence email to named editors, not a finished draft blind-submit); **(2) engineer guaranteed readership elsewhere first**, so the NYT pitch arrives with referral weight already behind it.

---

## Arm 1 — The NYT Pitch Email (3–4 sentences, not a draft)

**What editors actually read:** NYT op-ed submissions are triaged by a pitch, not by the prose. A pitch is 3–4 sentences: *"Here is the claim, here is why now, here is why me, here is the draft length."* If the pitch hits, they ask for the full draft.

### Proposed pitch email — v1 draft

**Subject:** Pitch — The Invisible Tax Every AI Company Is Paying (measurable, reproducible, installable in 30 seconds)

> **Ms. [Editor] —**
>
> I ran a benchmark eight days ago on a piece of AI architecture we've been building for a decade. Three frontier models, 225 questions, every question asked twice — once with our memory-packet preload, once without. **With the preload: 93–97% accuracy. Without: roughly 8%.** The architecture ships as an open-source server any reader of yours can install in thirty seconds (`pip install librarian-mcp`) and run the meter against their own AI usage. No registration, no account. It shows them, in real dollars, what their sessions cost with and without — their number, not mine.
>
> I want to place a ~1,000-word op-ed on this because the measurement has a political shape: the industry is spending on the order of a billion dollars a year on AI inference that a memory-packet layer would eliminate, and the Sanders/AOC datacenter-moratorium hearings give the piece a news peg. I'm pledging 80% of our patents into a cooperative commons before the **November 26, 2026** conversion deadline; that deadline is the why-now.
>
> I'm an Army National Guard veteran and founder of a cooperative infrastructure project called Liana Banyan. Not a known byline. My credibility is the reproducible measurement — any editor on your desk can check the number themselves before deciding. Full draft is ready; happy to send on your word.
>
> **Jonathan Jones**
> Founder & General Manager, Liana Banyan Corporation
> Founder@LianaBanyan.com | 406-578-1232
> Repo (verifiable): github.com/Upekrithen/librarian-mcp

### Named editors to target (in priority order)

1. **Farhad Manjoo** — NYT Opinion columnist, writes about tech/platforms, Pluralistic-adjacent. Most likely to actually read and respond. **Pitch to him directly as columnist, not as desk submission.** If he bites, he can commission the piece or write one himself citing the repo.
2. **Julia Angwin** — NYT Opinion contributing writer on tech accountability. Strong enshittification-vocabulary overlap. Same pitch, adapted one line for her investigative-accountability angle.
3. **Ezra Klein** — Opinion columnist / Ezra Klein Show podcast. Has covered AI policy heavily. If op-ed doesn't land, podcast invitation is a higher-certainty alternative for similar audience.
4. **NYT Opinion desk general** (`opinion@nytimes.com`) — **last resort, not first move.** Only submit here after personal pitches to 1-2-3 have been in play for 7-10 days with no response.

### Pitch hygiene
- **Subject line is load-bearing.** The "installable in 30 seconds" clause is what separates this pitch from every other AI op-ed pitch in their inbox that week.
- **Never attach the full draft to the first pitch.** Attaching the draft signals a blind-submission, which triages to the bottom of the queue. Offer the draft; don't send it unrequested.
- **One pitch per editor.** Parallel-pitching all four in the same week reads as shotgun; wait 5-7 days between sends so only one is active at a time.
- **Give the repo URL.** It is the differentiator and the credibility-substitute for the unknown byline.

---

## Arm 2 — Engineered-Readership Sequence (things we control)

The op-ed being read by *anyone* is the actual goal. The NYT is one delivery path. The following paths are fully under our control and have near-certain readership within their respective audiences.

### Publication sequence (recommended order)

**Day 0 (today, B111 session):** Finalize v2 Founder voice-pass + all three Founder hooks landed. Article is publication-ready when Founder says "as you wish."

**Day 1–2 (April 21–22):**
- **Publish on Cephas** at `cephas.lianabanyan.com/op-ed/invisible-tax/` with the `pip install librarian-mcp` line in the first screen and a live link to github.com/Upekrithen/librarian-mcp. Glass Door dispatch schedule visible (#2262).
- **Cross-post to Medium** under the Founder's byline. Medium has its own discovery engine and readers who specifically search AI/cooperative-economics topics; it is not a redundancy.
- **Cross-post long-form to LinkedIn** in the Founder's feed. LinkedIn long-form surfaces to the Founder's existing network plus algorithmic amplification for AI/cooperative-economics topics.
- **Thread-ified on Twitter/X**, 8–12 posts per [project_preface_burst_dispatch.md](../../.claude/projects/C--Users-Administrator-Documents/memory/project_preface_burst_dispatch.md) protocol — Preface + Burst. The repo link in the last post is the conversion.

**Day 2–3 (April 22–23):** Dispatch **Doctorow V04** on Wave 2 schedule. V04 references the op-ed (Cephas URL) and the repo; a Pluralistic mention inside Doctorow's next 10-issue window is the single most likely path to NYT editor awareness. [Doctorow V04 file: `DOCTOROW_LETTER_V04_B111_THERMOMETER.md`]

**Day 3–5 (April 23–25):** **Pitch Manjoo** with the 3-4 sentence email above. By this point, the Cephas URL exists, the Medium cross-post exists, and Doctorow is either aware or about to be. The pitch arrives with referral-weight.

**Day 5–7 (April 25–27):** **Pitch Angwin** if Manjoo hasn't responded in 48 hours.

**Day 7 (April 27, Yale Apr 28 eve):** The Yale demo table becomes a fresh publication peg — "measured, installable, reproducible" shown in person to the AI-policy / academic crowd. Photograph the demo. Add the photo as a Cephas update, Medium update, LinkedIn update.

**Day 8–14:** Monitor, no escalation, no follow-up unless asked.

### Audience-coverage math

Conservative estimate of guaranteed readership at each publication layer (independent of NYT):

| Channel | Readership (conservative) | Controlled by us? |
|---|---:|---|
| Cephas | 500–5,000 visits (depends on dispatch amplification) | Yes |
| Medium (fresh post) | 200–3,000 views first week | Yes |
| LinkedIn long-form | 500–10,000 views first week (Founder's network + algorithm) | Yes |
| Twitter/X thread | 1,000–50,000 impressions (viral variance high) | Yes |
| Doctorow / Pluralistic mention (if picked up) | 200,000+ daily readers | No — contingent |
| NYT op-ed (if placed) | 1M–3M readers | No — contingent |
| Yale demo table audience | 50–300 people, high-quality (AI policy) | Yes |
| Sanders/AOC staffer memo (Pawn B70 return pending) | 2–6 staffers, extremely high-quality | Yes |

**Translation:** with no NYT placement and no Doctorow pickup, the op-ed still reaches on the order of **2,000–15,000 readers** through Founder-controlled channels in week one, plus 50-300 of the highest-value AI-policy audience (Yale + staffers). The NYT and Doctorow paths are upside, not dependency.

---

## Why this shape, not the alternative

**Alternative A — cold-submit to `opinion@nytimes.com`, wait.** Expected outcome: no response, no publication, no readership. Sunk cost: the draft. This is the path we reject.

**Alternative B — submit to NYT first, hold publication everywhere else until they respond.** Expected outcome: 2–4 weeks of publication-frozen inventory while the desk triages. By the time a response arrives or fails, the Wave 1 dispatch window is closed and the Yale demo is behind us. This is the path we also reject — NYT's response latency is longer than our near-term deadlines.

**The chosen path — publish everywhere we control on Day 1, let Doctorow/Pluralistic/Yale produce referrals, then pitch NYT editors by name with referral weight.** Expected outcome: guaranteed publication; guaranteed readership of at least thousands; optional upside from any one of three independent NYT entry points (Manjoo/Angwin/Klein) + the Pluralistic secondary-citation route.

---

## Kill-switches

- **If the R10 cross-vendor replication results come in WEAK** (e.g. Gemini + GPT-4o both well below the Anthropic numbers, not partial credit — outright failure): hold the op-ed, revise the numbers, republish from a corrected base. Better to land a quiet apology than to publish a claim we can't defend.
- **If the R10 results come in STRONG across all vendors:** the op-ed becomes one row stronger. Use the cross-vendor table in the pitch instead of the Anthropic-only number. Makes the pitch harder to refute.
- **If Doctorow responds first and asks for an interview or commissions a piece in Pluralistic:** pause the NYT pitch; let Pluralistic run; then re-pitch the NYT with a Pluralistic citation in the pitch email. That is the single strongest signal a cold pitch can carry.

---

## Decision prompts for Founder

1. **Publish on Cephas/Medium/LinkedIn on Day 1 regardless of NYT timeline?** (Recommended: yes.)
2. **Pitch Manjoo first or Angwin first?** (Recommended: Manjoo — he's a columnist who can commission, not just an editor who triages.)
3. **Greenlight R10 cross-vendor benchmark run (~$80 API spend) before op-ed locks?** (Recommended: yes, because a cross-vendor number in the pitch makes the pitch unignorable.)
4. **Any editors to add or remove from the pitch list?**

---

*Saved B111, April 20, 2026. Bishop (Claude Opus 4.7, 1M context). Arm 1 = pitch discipline. Arm 2 = publication independence. NYT is one reader, not the reader.*
