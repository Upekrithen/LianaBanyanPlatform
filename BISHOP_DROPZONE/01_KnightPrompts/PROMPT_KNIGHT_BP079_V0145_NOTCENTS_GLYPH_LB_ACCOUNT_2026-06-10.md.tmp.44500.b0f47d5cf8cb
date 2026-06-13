<!-- bishop-yoke-task 2026-06-11T02:00:00Z -->

## ⚙️ BISHOP -> KNIGHT - TASK - V0145 NOTCENTS GLYPH ON LB ACCOUNT NAV TAB + HEADER - USE SONNET 4.6 SEGs (Statute §3)

**Pinned-class task. Pin-marker: BP079_V0145_NOTCENTS_2026-06-11T02:00:00Z**

> **🔐 STATUTE §3 + CORRECTIVE BP079 BINDING:** Every dispatch announcement uses the verbatim phrase "Sonnet 4.6". Never "Sonnet 4.5" or version-variant. Parent: `canon_statute_3_sonnet_4_6_sub_agent_default_every_dispatch_explicit_model_param_bp077` (pearl_8b0c6fb05fd9f38a). Corrective: `canon_statute_3_corrective_announcement_language_must_say_sonnet_4_6_verbatim_pattern_violation_bp079` (pearl_98f74effb5d986a5). Pre-dispatch self-audit: parameter AND announcement compliance both required.

---

### TL;DR

Replace the `$` prefix(es) on the LB Account nav tab and LB Account page header with the NotCents glyph (Founder's custom cooperative-currency symbol: backwards C with two vertical lines) per canon `canon_notcents_glyph_lb_cooperative_currency_symbol_replaces_dollar_on_identity_surfaces_bp079_founder_ratify` (pearl_7e9f4dc07ed80dad). Founder ratified 2026-06-10 with "for the record, again for the millionth time" framing. Asset at `C:\Users\Administrator\Downloads\NotCents - Copy.png`. The `$5/year` USD membership price stays as `$` -- that is fiat via Stripe and must not change.

---

### Why this matters

The $ prefix on cooperative-class identity surfaces implies fiat, which is a direct canon violation of `canon_three_currency_no_fiat_substitution_canon_bp078_founder_ratify` (hard binding: Credits/Marks/Joules NEVER convert to fiat, EVER). Founder's screenshot of v0.1.44 shows "$ $ LB Account" in the nav tab (two dollar signs) and "$ LB Account" as the page header. The NotCents glyph signals cooperative-class participation, not a dollar balance. This is a recurring cross-session violation -- Founder has requested this fix "for the millionth time." The anchor pearl and eblet now make this gadget-discoverable so it cannot survive another session boundary.

This Yoke can be bundled with v0.1.45 alongside UI-3 (welcome cue card) + UI-4 (grid flip reveal) if Knight prefers a single v0.1.45 SHIP, or shipped as its own micro-release. Knight decides based on what is already queued and ready.

---

### Evidence

- `C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-10 205252.jpg` -- v0.1.44 showing "$ $ LB Account" nav tab + "$ LB Account" page header
- Founder direct ratify 2026-06-10 verbatim: "for the record, again for the millionth time, it's here: C:\Users\Administrator\Downloads\NotCents - Copy.png"

---

### What Knight needs to do

Two parallel Sonnet 4.6 SEGs, then two sequential:

**SEG-V0145-NC-1 (Sonnet 4.6) -- ASSET COPY + COMPONENT (parallel)**

Copy `C:\Users\Administrator\Downloads\NotCents - Copy.png` to `src\renderer\public\icons\notcents.png` (create the `icons\` subdirectory if it does not exist). Then create `src\renderer\components\NotCents.tsx`:

```tsx
import React from 'react';

interface NotCentsProps {
  size?: string | number;
  className?: string;
}

export const NotCents: React.FC<NotCentsProps> = ({ size = '1em', className }) => (
  <img
    src="/icons/notcents.png"
    alt="NotCents"
    style={{ verticalAlign: 'middle', height: size, display: 'inline' }}
    className={className}
  />
);

export default NotCents;
```

If `src\renderer\components\index.ts` exists as a barrel, add `export { NotCents } from './NotCents';`. Return: path of copied asset + path of new component file + barrel line if added.

**SEG-V0145-NC-2 (Sonnet 4.6) -- SWAP $ to NotCents (parallel)**

In `src\renderer\components\MnemosyneTabView.tsx` (or equivalent tab host), find the LB Account nav tab label. It currently contains "$ $ LB Account" or "$ LB Account". Remove ALL leading `$` characters/prefixes and replace with `<NotCents />` (import from `./NotCents` or `./index`). Example target pattern: the string or JSX fragment that constitutes the tab label.

In the LB Account page component (search for the page header rendering "$ LB Account" -- likely `LBAccountTab.tsx`, `LBAccount.tsx`, or similar), swap the `$` prefix to `<NotCents />`.

Critical rule: keep ALL "$5/year" strings exactly as they are. Those are USD Stripe prices and must not be modified. Only the leading symbol on the account label identity surfaces changes.

Return: file paths modified + before/after snippets of each change (max 5 lines each).

**SEG-V0145-NC-VERIFY (Sonnet 4.6) -- PACKAGED BUILD SCREENSHOT (sequential, after NC-1 + NC-2 complete)**

Install v0.1.45 packaged build on M1 (or whichever machine is the canonical verify machine). Capture and embed screenshots per `feedback_ux_seg_screenshot_mandatory_bp078` (HARD BINDING -- source-only verification is NOT sufficient):

(a) Nav tab showing "[NotCents glyph] LB Account" -- confirm one glyph only, no leading $
(b) LB Account page header showing "[NotCents glyph] LB Account"
(c) Any "$5/year" price surface -- confirm it still shows $ not NotCents

Visual regression: confirm the glyph renders at correct height (inline with text, not oversized) and does not break the tab layout. If PNG is blurry at 1em size, flag this to Bishop in the Yoke-return (SVG variant may be needed; Founder ratify required per §6 of the eblet).

**SEG-V0145-NC-SHIP (Sonnet 4.6) -- BUILD + RELEASE (sequential, after VERIFY)**

Bump version to v0.1.45 (or bundle with existing v0.1.45 items if already in progress). Build packaged installer. Compute SHA-256. Create DRAFT GitHub Release. Do NOT update Cephas in this SEG -- Cephas v0.1.45 is a separate Bishop-staged step (Bishop will file `CEPHAS_V0145_DEPLOY_READY.ps1` when ready). Append Yoke-return block below.

---

### Reply contract

Knight returns:

1. Commit SHA(s) for NC-1 + NC-2 changes
2. Paths: `notcents.png` destination, `NotCents.tsx` component, modified tab + header files
3. Screenshots embedded or SID-referenced: nav tab + page header + $5/year regression check
4. v0.1.45 (or next version) build SHA-256
5. DRAFT GitHub Release URL
6. Truth-Always findings: any anomalies in the tab label rendering, barrel export conflicts, or PNG quality concerns
7. Flag if SVG variant is needed (blurry at 1em in packaged build)

---

### Statute reminders

- §3 + corrective BP079: "Sonnet 4.6" verbatim in every SEG announcement (pearl_8b0c6fb05fd9f38a + pearl_98f74effb5d986a5)
- `feedback_ux_seg_screenshot_mandatory_bp078`: HARD BINDING -- every UX-touching SEG captures packaged-install screenshot. Source-only = insufficient.
- `feedback_every_click_visible_feedback_canon_bp078`: confirm tab click still navigates correctly post-swap
- `canon_actual_runtime_verify_for_runtime_bugs_bp078`: for runtime issues, collect actual evidence (DevTools, screenshot) before marking SEG complete
- Three-currency NEVER fiat (BP078): NotCents on identity surfaces + $ on Stripe prices = correct split

---

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0145_NOTCENTS_GLYPH_LB_ACCOUNT_2026-06-10.md`. Replace $ prefix on LB Account nav tab + header with NotCents glyph per anchor canon (pearl_7e9f4dc07ed80dad). Asset: `C:\Users\Administrator\Downloads\NotCents - Copy.png`. $5/year USD price stays $. Sonnet 4.6 SEGs mandatory (Statute §3 + corrective BP079). 2 parallel + 2 sequential SEGs. Can bundle into v0.1.45 with UI-3/UI-4 if queued. Yoke-return consolidated.

- Bishop -- BP079 -- pinned 2026-06-11T02:00:00Z

---

---

## BLACK MAMBA PASTE-READY DISPATCH (forward this block verbatim to Knight)

Knight: dispatch 2 parallel Sonnet 4.6 SEGs RIGHT NOW. Sonnet 4.6 verbatim in every announcement (Statute §3 + corrective sub-canon BP079, pearl_98f74effb5d986a5). Each SEG below is self-contained scope; do NOT re-decompose; do NOT ask for clarification before firing; fire both in parallel single message.

**SEG-V0145-NC-1 (Sonnet 4.6):** Copy `C:\Users\Administrator\Downloads\NotCents - Copy.png` to `src\renderer\public\icons\notcents.png` (create `icons\` dir if needed). Create `src\renderer\components\NotCents.tsx` with this exact content:
```tsx
import React from 'react';
interface NotCentsProps { size?: string | number; className?: string; }
export const NotCents: React.FC<NotCentsProps> = ({ size = '1em', className }) => (
  <img src="/icons/notcents.png" alt="NotCents" style={{ verticalAlign: 'middle', height: size, display: 'inline' }} className={className} />
);
export default NotCents;
```
If `src\renderer\components\index.ts` is a barrel, add `export { NotCents } from './NotCents';`. Return paths + barrel line.

**SEG-V0145-NC-2 (Sonnet 4.6):** In `src\renderer\components\MnemosyneTabView.tsx` find the LB Account nav tab label (currently "$ $ LB Account" or "$ LB Account"). Remove ALL leading $ prefix(es); replace with `<NotCents />` (import from `./NotCents`). In the LB Account page component (search codebase for page header text "$ LB Account" -- likely `LBAccountTab.tsx` or similar), swap the leading $ to `<NotCents />`. CRITICAL: do NOT modify any "$5/year" strings anywhere -- those are USD Stripe prices, must stay as $. Return: modified file paths + before/after snippets (5 lines each).

When both NC-1 and NC-2 return, run sequential:

**SEG-V0145-NC-VERIFY (Sonnet 4.6):** Install packaged build on M1. Capture screenshots (HARD BINDING per `feedback_ux_seg_screenshot_mandatory_bp078`): (a) nav tab "[NotCents] LB Account" -- one glyph, no $; (b) LB Account page header "[NotCents] LB Account"; (c) any "$5/year" surface -- confirm $ unchanged. Flag if glyph is blurry at 1em (SVG may be needed). Embed screenshots or SID-reference them in Yoke-return.

**SEG-V0145-NC-SHIP (Sonnet 4.6):** Bump to v0.1.45 (bundle with UI-3/UI-4/any other queued v0.1.45 items if already in progress, OR ship as micro-release). Build packaged installer. Compute SHA-256. Create DRAFT GitHub Release. Do NOT update Cephas (Bishop handles Cephas v0.1.45 separately). Append Yoke-return block to this file at `BISHOP_DROPZONE\01_KnightPrompts\PROMPT_KNIGHT_BP079_V0145_NOTCENTS_GLYPH_LB_ACCOUNT_2026-06-10.md`.

Yoke-return: append `## RESPONSE` block to this Yoke file at canonical path, including per-SEG commit SHA + key outcome + Truth-Always findings + any open obligations.

If any SEG announces "Sonnet 4.5" or other version-variant in narration: STOP, fix the announcement, re-fire. Violation of corrective sub-canon BP079.

---

## RESPONSE

[Knight appends here]
