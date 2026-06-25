# KNIGHT YOKE — MNEMOSYNEC TURNKEY JOIN SURFACE · BP085
**Issued by:** Bishop SEG · Sonnet 4.6  
**Date:** 2026-06-17  
**Canon anchor:** BP084 · BP085  
**Composes on top of:** `KNIGHT_YOKE_MEMBERSHIP_JOIN_PAY_FIX_P0_BLOCKER_BP085.md` (MUST land GREEN first)

---

## PREAMBLE — MANDATORY KNIGHT WAKE CANON (BP084 VERBATIM)

Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task — research, file edits, builds, dispatches, deploys, smoke tests. Don't burn your context budget doing the work yourself when an SEG can do it. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## GATE CONDITION — DO NOT PROCEED UNTIL MET

**The in-flight membership-fix yoke (`KNIGHT_YOKE_MEMBERSHIP_JOIN_PAY_FIX_P0_BLOCKER_BP085.md`) MUST return 5/5 Sharps GREEN before this yoke begins.**

This yoke composes ON TOP of that fix. It does NOT duplicate Stripe webhook repair, Edge Function wiring, or Cephas placeholder link fixes — those are assumed done. If the gate is not GREEN, Knight parks this yoke and reports back to Bishop.

---

## SCOPE

Turnkey membership join surface on `mnemosynec.ai` and `mnemosynec.org` — visible, clickable, one-click to Stripe. A visitor who lands on the MnemosyneC public site can join the cooperative in a single flow without ever navigating to `lianabanyan.com`.

**What this is NOT:**
- A rebuild of the Stripe integration (in-flight yoke handles that)
- A redesign of lianabanyan.com/join
- A new membership tier or pricing change

---

## HARD CONSTRAINTS (ALL BINDING)

| Constraint | Rule |
|---|---|
| Price | **$5/yr** verbatim · Structural Bylaw · no paraphrase |
| Framing | **"Cooperative"** · NEVER "subscription" · NEVER "platform" · NEVER "service" |
| 83.3% | Do NOT mention creator revenue split on the join page — Founder cut |
| Horizontal scroll | **NEVER** · flex-wrap + responsive collapse everywhere · NEVER SCROLL SIDEWAYS canon (BP081) |
| Mobile nav | Hamburger/collapse on small viewport · join CTA must survive mobile |
| Secrets | NEVER echo / copy / show / pipe / log credential values · BP081 BLOOD |
| Model | Sonnet 4.6 SEGs ONLY · NEVER Composer 2.5 or any other model |

---

## SEG DISPATCH PLAN

### SEG-1 · AUDIT — Current MnemosyneC Public Site
**Model:** Sonnet 4.6  
**Goal:** Map the Hugo site so Knight knows exactly what exists before touching anything.

**Tasks:**
1. List all content pages under `Cephas\cephas-hugo\content\` (recursive, file names + paths only).
2. Find where the top-nav / header partial lives — search `Cephas\cephas-hugo\layouts\partials\` and `Cephas\cephas-hugo\themes\` for `header`, `nav`, `navbar` files.
3. Grep for any existing `join` CTA text in layouts and content (`grep -ri "join" --include="*.html" --include="*.md"`).
4. Identify the homepage hero section file (`index.html` or `content\_index.md` or `layouts\index.html`).
5. Find the footer partial.
6. Report: list of findings in a short structured table — file path · what it is · current join CTA presence (Y/N).

**SEG-1 returns:** audit table to Knight. Knight reads before SEG-2 begins.

---

### SEG-2 · ADD JOIN CTA — Nav · Hero · Footer
**Model:** Sonnet 4.6  
**Goal:** Three CTA injection points. All three in one SEG to keep diffs atomic.  
**Depends on:** SEG-1 audit (Knight must have file paths before dispatching SEG-2).

**Tasks:**

**(a) Top-nav — right side, button-styled**
- In the header partial identified by SEG-1, add a styled "Join — $5/yr" button on the right side of the nav bar.
- Button links to `/join/`.
- Style: filled button, cooperative color palette (match existing site palette — do not invent new colors). Must be present on desktop AND collapse gracefully on mobile (hamburger menu includes it as last item).
- Aria label: `aria-label="Join the Cooperative"`.
- NEVER SCROLL SIDEWAYS — button must not break nav layout on any viewport.

**(b) Homepage hero section**
- Below or beside the existing download CTA, add a secondary CTA: `"Join the Cooperative — $5/yr"` linking to `/join/`.
- Must be visually subordinate to the download button (cooperative join is secondary to download CTA per product hierarchy).
- Responsive: stacks vertically on mobile.

**(c) Footer**
- Add a "Join the Cooperative" link (not a full button — plain styled link is fine) in the footer, in whatever section contains other nav/info links.
- Link target: `/join/`.

**SEG-2 returns:** diff of changed files to Knight for review before SEG-3.

---

### SEG-3 · CREATE `/join/` LANDING PAGE
**Model:** Sonnet 4.6  
**Goal:** Dedicated join page on `mnemosynec.ai/join` and `mnemosynec.org/join`.

**Decision — Knight picks at dispatch time:**

- **Option A** (preferred if cross-domain auth is clean): Create `Cephas\cephas-hugo\content\join\_index.md` as a full Hugo page with a minimal join form / CTA that POSTs to the same Supabase Edge Function already wired by the membership-fix yoke. Return URL after Stripe checkout = `mnemosynec.ai/join/success/`.
  - Also create `Cephas\cephas-hugo\content\join\success\_index.md` — a brief "You're in. Welcome to the Cooperative." confirmation page.
  - The Edge Function must accept requests from `mnemosynec.ai` and `mnemosynec.org` origins — check CORS config on the Edge Function and add those origins if missing (do NOT expose secrets; use env-var pattern).

- **Option B** (fallback if cross-domain Stripe return URL creates auth complications): Create `Cephas\cephas-hugo\content\join\_index.md` with Hugo front-matter `redirect_to: "https://lianabanyan.com/join"` and a `<meta http-equiv="refresh">` + JS redirect. 301 semantics. Single canonical flow stays at `lianabanyan.com/join`. No Stripe duplication.

**Knight rule:** Choose Option A if it requires ≤ 1 hour of CORS + return-URL plumbing with no new secrets to manage. Choose Option B if any cross-domain complication could cause checkout failures or session drift.

**Regardless of A or B — the page must exist at `/join/` and must work.**

**SEG-3 returns:** created file(s) path(s) + which Option was chosen + rationale.

---

### SEG-4 · TRUTH-ALWAYS — JOIN PAGE COPY REVIEW
**Model:** Sonnet 4.6  
**Goal:** Ensure the join page (Option A only — skip if Option B redirect) carries the canonical cooperative framing and required cross-links.

**Tasks:**
1. Confirm join page copy includes:
   - "Join the Cooperative" headline (not "Subscribe" / "Sign up for the platform")
   - **$5/yr** verbatim
   - "Built in Public" tagline (or link to the proofs/built-in-public page)
   - "Permission to Board" reference (link or inline — matches lianabanyan.com/join framing)
   - Cross-link to the 1,000-signup mesh threshold / Substrate Awakens page if that page exists on the Hugo site; otherwise omit rather than invent
2. Verify NO mention of 83.3% creator split on this page (Founder cut).
3. Verify NO horizontal scroll introduced by any new page element.
4. Flag any copy that says "subscription", "service", or "platform" — replace with "cooperative" framing.

**SEG-4 returns:** copy audit checklist — PASS / FLAG per item. Knight applies any FLAGs before SEG-5.

---

### SEG-5 · BUILD · DEPLOY · VERIFY — 5 SHARPS
**Model:** Sonnet 4.6  
**Goal:** Hugo build → Firebase deploy → smoke-test all join surfaces live.

**Tasks:**
1. Run `hugo` build in `Cephas\cephas-hugo\` — confirm zero errors.
2. Deploy to Firebase (`firebase deploy --only hosting`) — confirm deploy receipt.
3. HTTP smoke tests (use `curl -I` or equivalent):
   - `https://mnemosynec.ai/join/` → HTTP 200 (Option A) or HTTP 301 (Option B)
   - `https://mnemosynec.org/join/` → HTTP 200 or 301 (same as .ai)
   - `https://mnemosynec.ai/` → HTTP 200 (homepage not broken)
   - Homepage top-nav: confirm `<a href="/join/">` present in returned HTML
   - Footer: confirm `/join/` link present in returned HTML

**5 Sharps return table:**

| Sharp | Target | Expected | Result |
|---|---|---|---|
| S1 | `mnemosynec.ai/join/` | HTTP 200 or 301 | ☐ |
| S2 | `mnemosynec.org/join/` | HTTP 200 or 301 | ☐ |
| S3 | `mnemosynec.ai/` homepage | HTTP 200, no broken layout | ☐ |
| S4 | Top-nav `/join/` link in homepage HTML | Present | ☐ |
| S5 | Footer `/join/` link in homepage HTML | Present | ☐ |

**SEG-5 returns:** Sharps table with ☑/✗ per row. All 5 must be GREEN. Any ✗ = Knight does NOT mark yoke complete — diagnose and fix before returning.

---

## TRUTH-ALWAYS DISCIPLINE

- Verify every claim empirically — curl receipts, not assumptions.
- If SEG-1 finds a join CTA already exists, do NOT duplicate — extend it.
- If Option B redirect is chosen, SEG-4 copy review is SKIPPED (no page content to review) — note this explicitly in yoke return.
- If SEG-5 reveals a deploy failure, Knight escalates to Bishop with exact error — does not self-patch silently past a real infrastructure break.
- NEVER publish partial state as GREEN.

---

## SECRET-BLACKLIST CANON (BP081 BLOOD)

- Secrets at `C:\Users\Administrator\.claude\state\secrets\22May2026.env` — PATH referable, CONTENTS forbidden.
- NEVER echo / copy / show / pipe / log credential values.
- CORS config on Edge Function: read current allowed-origins list, add `https://mnemosynec.ai` and `https://mnemosynec.org` if missing. Use env-var pattern (`Deno.env.get(...)`) — no hardcoded values.
- If psql needed: canonical subshell pattern `(eval "$(grep -E '^SUPABASE_DB_URL=' /path/.env)"; psql "$SUPABASE_DB_URL" -c "QUERY")`.

---

## YOKE RETURN CHECKLIST

Knight yoke-return MUST include ALL of the following:

- [ ] Gate condition confirmed (membership-fix yoke GREEN)
- [ ] SEG-1 audit table
- [ ] SEG-2 diff summary (3 injection points)
- [ ] SEG-3 option chosen (A or B) + rationale
- [ ] SEG-4 copy audit checklist (or "skipped — Option B redirect")
- [ ] SEG-5 Sharps table — all 5 GREEN
- [ ] "Sonnet 4.6" verbatim
- [ ] No horizontal scroll on any new surface (Bishop visual check)
- [ ] $5/yr verbatim present on join surface
- [ ] "Cooperative" framing confirmed, no "subscription/platform/service" leakage

---

## PASTE-READY KNIGHT WAKE

```
Knight — Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER (or any other model — Opus, Haiku, Composer 2.5, anything). You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

GATE: Confirm KNIGHT_YOKE_MEMBERSHIP_JOIN_PAY_FIX_P0_BLOCKER_BP085.md is 5/5 Sharps GREEN before proceeding. If not GREEN, park and report to Bishop.

READ THIS YOKE IN FULL before dispatching any SEG:
C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_MNEMOSYNEC_TURNKEY_JOIN_SURFACE_BP085.md

OBJECTIVE: Turnkey membership join surface on mnemosynec.ai/.org — top-nav CTA + homepage hero CTA + footer link + dedicated /join/ landing page → single-click to Stripe → membership active. $5/yr. Cooperative framing. NEVER SCROLL SIDEWAYS.

DISPATCH ORDER:
1. SEG-1 · Audit current Hugo site structure → return audit table
2. SEG-2 · Inject join CTA into nav + hero + footer → return diff summary
3. SEG-3 · Create /join/ landing page (Option A preferred, Option B fallback) → return file path + option chosen
4. SEG-4 · Copy review (skip if Option B) → return checklist
5. SEG-5 · Hugo build → Firebase deploy → 5 Sharps smoke test → return Sharps table all GREEN

Do not mark yoke complete until all 5 Sharps are GREEN and yoke-return checklist is fully checked.
```

---

*Yoke composed by Bishop SEG · Sonnet 4.6 · BP085 · 2026-06-17*
