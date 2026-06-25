# KNIGHT YOKE · Homepage Hero Inline SUBSTRATE Link · BP084 follow-up

**Session:** BP084
**Date:** 2026-06-16
**Founder ratify:** DIRECT — *"Quick fix follow-up Knight yoke needed: add the inline [substrate](/how-to-read-the-substrate/) link in the homepage Amnesia hero paragraph"* — Founder ratify "YES"

---

## 🩸 PREAMBLE — Sonnet 4.6 SEGs exclusively

**Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.**

---

## The fix

The earlier Gemma + Comments + SUBSTRATE combined yoke restored the blue SUBSTRATE link in the **"How it works"** section. But the **Amnesia hero body paragraph** on the homepage still has no inline link on the word "substrate."

Per Founder screenshot of `mnemosynec.ai/` (and the same content at `mnemosynec.org/`), the hero paragraph reads something like:

> *"Every time you start a new session, your AI forgets everything. Your projects, your preferences, your past conversations, gone. Dr. MnemosyneC™ gives your AI a permanent, private memory that actually stays."*

There is no inline link on any of the "substrate"-class words.

---

## SEG-1 — Locate the hero source file (Sonnet 4.6 SEG)

The homepage serves from Cephas Hugo's `content-mnemosynec/_index.md` (or whichever file actually renders mnemosynec.ai / mnemosynec.org homepage). Verify which file is canonical for the Amnesia hero body. Likely candidates:
- `Cephas\cephas-hugo\content-mnemosynec\_index.md`
- `Cephas\cephas-hugo\layouts\index.html` (if hero is in layout not content)
- `Cephas\cephas-hugo\content-mnemosynec\amnesia\_index.md` (if hero is in a sub-page)

Verify with: `grep -rni "permanent, private memory that actually stays" Cephas/cephas-hugo/`

---

## SEG-2 — Restore Founder's canonical three-sentence hero (Sonnet 4.6 SEG)

**Founder direct correction — RESTORE the previously-canonical hero structure:**

> **Your AI has Amnesia. Dr. MnemosyneC has the Cure. [Substrate](/how-to-read-the-substrate/).**

Three sentences. The third sentence is the single word **"Substrate."** rendered as a blue link to `/how-to-read-the-substrate/` — a punchy hyper-link punchline that makes "the cure" land.

**This is a structural revert, not a paragraph rewrite.** If the current hero is a multi-line paragraph ("Every time you start a new session..."), that paragraph moves to the SECONDARY body BELOW the three-sentence hero — or stays out entirely if it conflicts visually.

**Visual rendering target:**
- Sentence 1: *"Your AI has Amnesia."*
- Sentence 2: *"Dr. MnemosyneC has the Cure."*
- Sentence 3: just the word **Substrate.** rendered as a blue link
- All three with the same hero typography (large display type)

**Verify against Founder's prior intent** by grepping the Stone Tablets archive and Cephas git history:
```bash
git log --all --oneline --grep="Substrate" -- Cephas/cephas-hugo/content-mnemosynec/
git show <commit>:content-mnemosynec/_index.md
```
The three-sentence hero existed in prior canon; this is restoration, not invention.

**Load-bearing requirements:**
- The exact word **Substrate.** (capital S, period) appears as the third sentence
- It is rendered as a blue link to `/how-to-read-the-substrate/`
- The first two sentences are restored verbatim
- Same hero typography across all three sentences
- No horizontal scroll (BP081 canon)

---

## SEG-3 — Deploy + Truth-Always Sharps (Sonnet 4.6 SEG)

Use `scripts/deploy-atomic.ps1`.

**Sharps:**
- Sharp 1: `curl -s https://mnemosynec.ai/` body grep `href="/how-to-read-the-substrate/"` returns ≥1
- Sharp 2: `curl -s https://mnemosynec.ai/` body grep `>substrate<` (as link text) returns ≥1
- Sharp 3: Same checks against `https://mnemosynec.org/` (mirror) — both URLs must serve the updated hero
- Sharp 4: `curl -sI` returns HTTP/1.1 200 on both hosts
- Sharp 5: Screenshot the rendered hero on both URLs — Knight confirms the blue link is visible in body paragraph

NO COSMETIC-GREEN. HONEST RED if the link doesn't render or hosts disagree.

---

## SEG-4 — Yoke-return (Sonnet 4.6 SEG)

Standard yoke-return at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_HOMEPAGE_HERO_SUBSTRATE_LINK_BP084.md` with commits + Sharps + screenshots + verbatim "Sonnet 4.6". Send pearl.

---

**FOR THE KEEP.**

The hero now points to the explanation. The cycle of curiosity closes.
