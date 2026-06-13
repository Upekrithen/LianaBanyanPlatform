# Pawn Adversarial Evaluation Package — Rook UX Overhaul Proposal (BP078)

**To:** Pawn (Perplexity, she/her per cooperative cohort canon)
**From:** Bishop (Anthropic Opus 4.7) on behalf of Founder
**Date:** 2026-06-09 (BP078)
**Pipeline position:** Pawn (adversarial review of Rook's proposal) → Bishop synthesizes → Knight implements

---

## §1 — Your job

Rook (Gemini 3.5) just produced a UX overhaul proposal for MnemosyneC v0.1.27 (Electron app). Founder asked for a Rook-then-Pawn pipeline. You are the adversarial pass. Bishop wants you to find what Rook missed, overcorrected, or assumed without evidence — BEFORE Knight implements.

Be tough. The point of Pawn in the cohort is to find what Rook in his happy-path-strong synthesis-mode mood may have glossed over. Truth-Always.

Return a structured critique. No em-dashes. Cooperative cohort canon: you (Pawn) are she/her; Rook is he/him; Knight is he/him; Bishop is he/him.

---

## §2 — Rook's proposal (verbatim summary)

Rook flagged a Truth-Always finding: `SkuUpgradePanel.tsx` and `MnemDrtPanel.tsx` were missing from the source snapshot provided. He reasoned from `SettingsTab.tsx` references and `MnemosyneTabView.tsx` directly. **This is a real evidence gap and you should pressure-test what assumptions Rook made that may be wrong.**

**Rook's Layer 1 diagnosis (5 problems):**

1. Tab bar overflows at <1400px (14 tabs, clip without overflow menu)
2. Settings discoverability cliff (SkuUpgradePanel buried at Section 3c, no anchor nav, no search)
3. "Check for Update" UX collision (only does electron-updater, not SKU upgrade)
4. Tier-name collision (Mnem-DRT install-type buttons reuse NANO/CORE/LITE/FULL labels)
5. Canon collision: top-of-Settings intent capture panel violates BP078 "intent capture inside $5 join modal" canon

**Rook's Layer 2 (three competing proposals):**

- **A. Responsive-Nav-First** — keep tab metaphor, add overflow "More" dropdown
- **B. Progressive-Disclosure-First (Dashboard)** — collapse 14 tabs into adaptive Home with action tiles
- **C. Command-Palette-First** — Ctrl+K palette, breadcrumb top bar (Rook honestly admits this fails Off-the-Street test for in-laws)

**Rook's Layer 3 (recommended synthesis):**

A + B hybrid:

1. **Tab grouping:** keep top 5 tabs (Frame / Helm / Kitchen Table / Substrate / Settings); collapse remaining 9 into "More" dropdown
2. **Elevate SKU upgrade:** EXTRACT `SkuUpgradePanel` entirely OUT of `SettingsTab.tsx`. Place a dedicated "AI Upgrade" pill in the titlebar next to "Check for Update". Pill text: `[ Upgrade AI (Free) ]`. On click: opens modal containing SkuUpgradePanel.
3. **Mnem-DRT rename:** Mnem-DRT tiers renamed from NANO/CORE/LITE/FULL to **Base / Expanded / Complete / Archive**
4. **Delete standing intent capture panel** from SettingsTab

**Rook's Layer 4 (Knight handoff spec):**

- MnemosyneTabView.tsx: responsive resize observer, hardcode top 5, wrap rest in dropdown
- App.tsx: titlebar pill, modal on click, copy preserved verbatim
- SettingsTab.tsx: delete intent panel + delete SkuUpgradePanel from Section 3c
- MnemDrtPanel.tsx: rename labels (despite the file being missing from snapshot)
- No new IPC handlers, no Zustand state changes
- Test pass: 1024px width no clip; NANO users see "Upgrade AI" button; Settings no longer shows intent panel

Full proposal at: `C:\Users\Administrator\Documents\AntigravityWorkspace\outputs\ROOK_UX_OVERHAUL_PROPOSAL_BP078.md`

---

## §3 — Specific challenges Bishop wants you to press

### Challenge A: The titlebar pill text

Rook proposes `[ Upgrade AI (Free) ]`. Founder's verbatim copy canon (BP078, 2026-06-09) is:

> "FULL is the in-app upgrade to Gemma 4 12B, a FREE flagship open model. Bigger download, better performance, still free."

**Pressure-test:** does "Upgrade AI (Free)" preserve Founder voice? Will Off-the-Street users understand this means model upgrade vs a paid tier vs a software update? Propose 2-3 alternative pill copy options grounded in Founder voice. Recommend one.

### Challenge B: The top-5 tab cut

Rook picked: **Frame / Helm / Kitchen Table / Substrate / Settings**. The 14 tabs are: Frame, Helm, Settings, FAQ, Atlas, Kitchen Table, Pearls, Substrate, Console, AI, Caithedral Core, $ LB Account, Battery, Broadcast.

**Pressure-test:**
- Why these 5? Where's the canon for that hierarchy?
- Off-the-Street test: a stranger downloads the app. Top 5 visible. Are these the right 5 for a stranger?
- "AI" is the literal AI feature. Hidden in "More" feels wrong.
- "FAQ" is the answer-questions tab. Hidden in "More" for a confused new user feels wrong.
- "$ LB Account" — financial visibility. Should this be in core nav for transparency?
- "Settings" usually goes far-right gear-icon, not in the visible 5.

Propose 2-3 alternative top-N cuts (where N might be 3, 5, 7, or grouped) with rationale.

### Challenge C: The Mnem-DRT rename

Rook proposes **Base / Expanded / Complete / Archive**. He had no access to MnemDrtPanel.tsx (missing from snapshot) so he doesn't know what these tiers actually DO.

**Pressure-test:**
- Do these labels accurately describe Mnem-DRT install types based on what Bishop or you can find out about Mnem-DRT canon? (Hint: gadget the Mnem-DRT canon if available — `mcp__librarian__search_knowledge` or the Mnem-DRT BP077 release notes)
- Are there better-fitting labels? E.g., "Light / Standard / Deep / Maximum" or "Snippet / Section / Chapter / Whole" if Mnem-DRT is retrieval-depth
- Without semantic-fit verification, this rename could just trade one confusion for another

Propose 2 alternative naming sets with rationale grounded in what Mnem-DRT actually does. Flag this as needs-Founder-ratify if you cannot verify.

### Challenge D: Modal vs inline

Rook's synthesis extracts SkuUpgradePanel OUT of Settings entirely. Pill in titlebar opens modal.

**Pressure-test:**
- Where does the user's tier setting now "live" mentally? Currently Settings = source of truth for everything. After this change, AI Tier setting is in a hidden-behind-pill modal.
- If user wants to verify they're on FULL, where do they look? The titlebar pill is HIDDEN when on FULL (Rook's spec). So a FULL user has no place to check "what tier am I?"
- Recommend: should SkuUpgradePanel ALSO stay in Settings (with anchor link from titlebar pill that scrolls there)? Or is full extraction the right call?

### Challenge E: Window size assumption

Rook says "Below 1400px window width, tabs clip." Test:
- 14 tabs × average tab width (say 100px) = 1400px. Math checks for the BREAKPOINT but...
- 1080p displays are 1920px wide (common)
- 1366×768 laptops are still common
- 4K (3840px) — way more room than needed
- Ultrawide (3440px) — also fine
- Tablet/touchscreen Electron — different breakpoint entirely

**Pressure-test:** what's the responsive breakpoint strategy? Just <1400px → overflow? What if the user opens DevTools or has a side panel docked? Recommend a breakpoint approach that's robust.

### Challenge F: Truth-Always evidence gaps

Rook flagged `SkuUpgradePanel.tsx` and `MnemDrtPanel.tsx` were missing from his snapshot. He proposed changes to both anyway.

**Pressure-test:** what specific Knight-implementable changes did Rook propose to those files that you cannot verify will actually work? List them. Recommend whether Bishop should fetch the live files for re-evaluation before Knight implements, OR whether Rook's reasoning from SettingsTab references is sufficient.

### Challenge G: The intent capture deletion

Rook says delete the standing top-of-Settings intent capture panel. Canon-compliant.

**Pressure-test:** what was that panel DOING for the user that needs to be replaced? The four options were "Use Free Forever / Join the cooperative — $5/year / Enable Developer Mode / Check for Updates." If those are deleted from Settings entirely, where do users discover those four paths? Specifically:
- "Join the cooperative" is the $5/year membership — high-value action. How does a member find it after this change?
- "Enable Developer Mode" — niche but important. Where does it live?

Recommend: do these four paths need to surface anywhere else in the app, or are they covered by other UI surfaces already?

### Challenge H: Accessibility + keyboard nav

Rook's spec barely touches accessibility:
- "More" dropdown — keyboard-accessible? Screen reader announcements?
- Modal containing SkuUpgradePanel — focus trap? Escape closes? Return focus to pill?
- Titlebar pill — tab-able with keyboard? ARIA label?

Score the accessibility coverage of Rook's spec and recommend additions.

### Challenge I: P0 IPC context

Knight just discovered a P0 bug: the `sku-upgrade-to` IPC handler is missing from the compiled v0.1.27 build. Knight is fixing in v0.1.28 with `assert-ipc-handlers.mjs` guardrail.

**Pressure-test:** Rook's spec says "No new IPC handlers required." But the EXISTING IPC has a regression. Is Rook's proposal robust to:
- The case where the existing IPC fails (graceful error in pill modal)?
- The Black Crow Feather earn flow that fires after upgrade — still wires correctly?
- Recommend test pass criteria additions covering IPC failure modes.

### Challenge J: Off-the-Street test — three users

Rook's "Off-the-Street test: Pass" verdict for his synthesis is unsupported by user-walkthrough. Walk through the THREE canonical Off-the-Street users with the proposed synthesis:

1. **Founder's wife.** Smart, non-technical, won't read docs. She opens the app for the first time. What does she see? Where does she click? Does she find Gemma upgrade? Does she succeed?
2. **Her in-laws.** Older, comfortable with email but not "Section 3c." Same walkthrough.
3. **Cold newspaper reader.** Stranger, 30 seconds to understand. Same walkthrough.

Be honest. If any user fails, propose what to add/change.

---

## §4 — Required output format

A single markdown file titled `PAWN_RETURN_ROOK_UX_OVERHAUL_BP078.md`. Place in `BISHOP_DROPZONE\02_PawnReturns\`.

Structure:

```
## §1 — Verdict on Rook's synthesis
ACCEPT / ACCEPT WITH CHANGES / REJECT — one sentence.

## §2 — Per-challenge findings
Address Challenges A through J in order. For each:
- What Rook said
- What you found
- Recommendation

## §3 — Synthesized recommendations for Bishop
The 3-7 concrete changes Bishop should apply when authoring the Knight spec.

## §4 — Truth-Always flags
Anything Bishop must verify (fetch live files, gadget canon, Founder ratify) before Knight implements.
```

---

## §5 — Hard bindings for your output

- **No em-dashes anywhere.**
- **Cite source files / canon names** for each claim you make.
- **Honest verdicts.** If Rook's synthesis is actually strong on a challenge, say so. Don't manufacture critique.
- **Truth-Always.** If you don't know something, say so.
- **Specific.** Not "Rook should consider accessibility" but "Add ARIA label X to component Y at line Z."
- **Pipeline-aware.** You're the adversarial pass before Bishop synthesizes. Don't withhold concerns to be nice — surface them now so they're caught BEFORE Knight implements.

---

## §6 — Founder voice register

Founder is a Patriotic Interdependentalist. Off-the-Street test = real cooperative users (wife, in-laws, cold reader). Voice is plain, direct, Truth-Always. Match that register in your evaluation.

---

**Deliverable:** `BISHOP_DROPZONE\02_PawnReturns\PAWN_RETURN_ROOK_UX_OVERHAUL_BP078.md`

**ETA:** 30-45 min once you start.

**Truth-Always. No em-dashes. Surface everything Rook may have missed.**
