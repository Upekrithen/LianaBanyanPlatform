# Pawn UX Evaluation Package -- MnemosyneC v0.1.32 (BP078)

**To:** Pawn (Perplexity, she/her per cooperative cohort canon)
**From:** Bishop (Anthropic Opus 4.7) on behalf of Founder
**Date:** 2026-06-09 (BP078)

---

## §1 -- Your job

Founder direct, BP078 (verbatim):

> "this is frankly hugely annoying -- as in the interface is NON sensical. I want pawn to see it and know what all of it is supposed to do and then tell us how to fix it. Because, wow."

You cannot run the MnemosyneC Electron app directly. Bishop is sending you screenshots + a structured UI map. Evaluate against the Off-the-Street test (stranger landing cold on the app, no docs, no help).

---

## §2 -- The app, in one paragraph

MnemosyneC v0.1.32 is a desktop Electron app for cooperative AI memory. It runs a local AI model (qwen2.5:0.5b bundled, gemma4:12b upgrade) on the user's own computer. No cloud account required. Members of the Liana Banyan cooperative pay $5/year for membership benefits but the app itself is free. The cooperative-AI thesis: members contribute to a shared substrate that compounds in value over time. Three internal currencies (Credits, Marks, Joules) track contribution but NEVER convert to fiat; members get fiat via actual hiring under the Mirror Clause / Incentive to Hire mechanism.

---

## §3 -- The Off-the-Street test

Three personas you walk through the screenshots:

1. **Founder's wife.** Smart, non-technical. Opens the app fresh, no docs.
2. **Founder's in-laws.** Older, comfortable with email but not section-oriented.
3. **Cold newspaper reader.** Stranger, 30 seconds to decide if this is for them.

For each persona, rate 1-10 on whether they can:
- Understand what the app does within 30 seconds
- Find the AI upgrade path
- Understand whether anything costs money
- Distinguish app updates from AI model upgrades from cooperative membership
- Recover from a confusing state

---

## §4 -- Annotated screenshot tour

**Screenshot path provided:** `C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-09 194714.png`

Bishop observations (you may agree or push back):

1. **Title bar says "Mnemosyne v0.1.32"** -- product name should be "MnemosyneC" per canon. Branding inconsistency on first impression.
2. **Default Electron icon** in the title bar, not a custom MnemosyneC mark. First-impression failure.
3. **Top section** has app name + tagline "Caithedral . Liana Banyan" -- Pawn evaluate: does the tagline communicate value to a stranger?
4. **"For Techies" link** visible at top -- Pawn evaluate: does this help or hurt the Off-the-Street user? Is it a gate or a relief?
5. **Top nav** shows top-5 tabs (Frame / AI / FAQ / Kitchen Table / $ LB Account) + More dropdown + Settings gear icon far right. Top-right pills: "Get FULL AI Free" + "Check for Updates" + X (close).
6. **Settings page is the default view** apparently. Pawn evaluate: should a stranger land on Settings, or on a welcome / Frame view?
7. **Settings has a search box** ("Search settings..."). Pawn evaluate: is this discoverable for non-techies?
8. **First Settings section: MNEMOSYNE UPDATE** -- has "Current strain" field + "Check for update" + "Auto-install on quit" toggle. Pawn evaluate: how does a stranger distinguish "Mnemosyne update" from "AI tier upgrade" from "Cooperative membership"?
9. **APPEARANCE section** -- Theme (Dark / Light / System). Standard.
10. **AI MODEL ASSIGNMENT** -- shows Bishop / Knight / Pawn / Rook with selection chips (Ollama local / Anthropic cloud / Manual). Pawn evaluate: does the average user know what "Bishop / Knight / Pawn / Rook" are? Should the labels explain what each piece does?
11. **MNEM RETRIEVAL section** -- "Install type (SKU)" NANO / CORE / LITE / FULL. Pawn evaluate: collision with AI Tier SKU (both use the same labels for different facets). Disambiguation sentence not visible in this screenshot -- Bishop ratified one was added, please verify.

---

## §5 -- Specific questions for Pawn

1. **First-30-seconds test:** what does a stranger think this app DOES based on the first view alone?
2. **Free vs paid confusion:** the app shows "Get FULL AI Free" pill AND "Check for Updates" AND a Settings section "MNEMOSYNE UPDATE" AND mentions $5/year cooperative membership somewhere. How many distinct payment / upgrade / update concepts exist on the surface, and how many are confusing to disambiguate?
3. **Bishop / Knight / Pawn / Rook labels:** these are cohort role names from the cooperative. Strangers do not know this. What labels would communicate intent better to an Off-the-Street user (e.g. "Primary AI / Builder AI / Verifier AI / Researcher AI")?
4. **Mnem-DRT vs AI Tier collision:** both use NANO / CORE / LITE / FULL. Bishop committed to a clarifying sentence above each. Without seeing both panels side-by-side in current screenshots, evaluate the risk of confusion abstractly.
5. **"For Techies" link at top:** is this an asset (relief for advanced users) or a liability (signals to a non-tech user "you're not the audience")? Off-the-Street verdict?
6. **What's missing entirely:** what should be on screen one but isn't?
7. **What's on screen but shouldn't be:** what surfaces visual noise without value?

---

## §6 -- Required deliverable

Return `outputs/PAWN_RETURN_UX_EVALUATION_V0132_BP078.md` with:

### §A -- Per-persona Off-the-Street score (1-10)

Wife / In-laws / Cold reader. Each scored on the 5 criteria in §3.

### §B -- Top 5 friction points ranked by severity

Specific. Not "fix the UX." Like "the cohort labels Bishop / Knight / Pawn / Rook are unrecoverable for non-techies in section AI Model Assignment -- rename to functional labels."

### §C -- Recommended fixes per friction point

Concrete. Knight-implementable.

### §D -- Open questions you would ask the Founder before implementing

The questions you cannot answer from screenshots alone.

---

## §7 -- Hard bindings

- **No em-dashes anywhere.**
- **Truth-Always.** If you can't tell from a screenshot, say so.
- **Honest verdicts.** If your synthesis still fails Off-the-Street test, say so explicitly.
- **Compose with canon:** intent-capture-at-JOIN-modal, three-currencies-no-fiat, Mirror Clause / Incentive to Hire, RoseBush substrate canon, Patriotic Interdependentalist voice.
- **No feature deletion proposals.** Suggest renames, regroupings, clarifications -- not removing functionality.

---

## §8 -- Pipeline downstream

Pawn returns UX evaluation. Bishop synthesizes with Knight v0.1.33 wave (Knight is already handling branding + icon + DevTools access + auto-prepare-FULL + self-host Gemma + demo page). Pawn's findings feed Knight v0.1.34 if needed.

Future: when MnemosyneC has a demo page at mnemosynec.ai/demo/, Pawn can browse the live UI shell rather than work from static screenshots. Knight SEG-Q-6 in the current wave delivers that.

---

**Deliverable target:** `outputs/PAWN_RETURN_UX_EVALUATION_V0132_BP078.md`

**ETA:** 30-45 min once you start.

**Truth-Always. No em-dashes. Off-the-Street verdicts, honest.**
