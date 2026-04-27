# K525 Phase D — Conductor's Baton Rollout Plan
**Status:** BUILT, NOT PUBLISHED. Strict publication hold until Prov 14 trigger.
**Filed:** B129, 2026-04-27, Knight (K525 close).
**A&A coverage:** Innovation #2277 (Conductor's Baton) launch + #2272 (Cost-Slasher) closure.
**Tag:** v-conductors-baton-launch-K525.

---

## 1. Publication hold — what is gated until Prov 14

The following artifacts exist in code/storage but MUST NOT surface publicly until the Prov 14 trigger fires AND Founder issues an explicit "publish" greenlight:

| Surface | State | Gate |
|---|---|---|
| Helm Conductor tab | Code shipped | `feature_flags.CONDUCTOR_BATON_ENABLED = false` |
| Public Cost-Slasher receipt URLs | Code shipped | `feature_flags.CONDUCTOR_RECEIPT_PUBLIC_SHARE = false` |
| Pledge tagline change ("Vendor-Neutral by Default") | Documented in `rolloutWaves.ts` | Apply on Pledge surface only after public-share flips |
| Wave 1 enrollment dispatcher | Member list locked B129 (`WAVE_1_MEMBERS`) | Founder explicit "fire Wave 1" |
| Crown Letter inclusion | NO mention until trigger | Founder direction B129 |
| Federation broadcast | NO push until trigger | Founder direction B129 |
| Battery Dispatch | NO mention until trigger | Founder direction B129 |
| Glass Door publication | NO posting of routing data | Founder direction B129 |

The platform-wide `CONDUCTOR_BATON_ENABLED` flag is the single kill switch. Flipping it back to `false` rolls everyone back to single-vendor (Anthropic) routing on next render.

---

## 2. Wave structure

### Wave 0 — Founder dogfood (post-Prov-14 ratification, pre-public-launch)

- Founder flips `CONDUCTOR_BATON_ENABLED = true` for the Founder's own member row only. No platform-wide flip yet.
- 7-day soak period. Measure: zero crash reports, zero "Conductor picked something dumb" complaints, telemetry shows non-zero savings vs Opus baseline.
- **Pass criteria:** all routing decisions served, scribe records intact, cost ticker accurate (Founder spot-check), at least 100 routed queries in window.
- **Fail trigger:** any single decision crashes the Companion, Cost Ticker shows negative savings (we paid more than baseline), or scribe writes drop > 1%. Roll back immediately.

### Wave 1 — Locked candidate list (B129)

Per Founder ratification at B129 — the 10 candidates locked in `platform/src/lib/conductor/rolloutWaves.ts::WAVE_1_MEMBERS`:

1. **Cory Doctorow** — anti-enshittification advocate (the framework Liana Banyan is built against)
2. **Ethan Mollick** — AI-augmented work researcher (Wharton)
3. **Trebor Scholz** — platform cooperativism founder (the field)
4. **Andrew McAfee** — *Second Machine Age* co-author (centrist/business credibility)
5. **Vigil family member** — Founder picks specific family member at outreach time
6. **Nathan Schneider** — cooperative-economy scholar (*Everything for Everyone*)
7. **MacKenzie Scott (via team)** — Yield-Lab philanthropy
8. **Anil Dash** — web independence advocate (Glitch founder)
9. **Yancey Strickler** — Bento-box / Metalabel founder (Kickstarter alum)
10. **Casey Newton** — Platformer (tech-policy journalist)

Outreach is operator-mediated by Founder; this document does not contain emails or phone numbers (those live in Founder's outreach playbook). Wave 1 enrollment requires:
- Prov 14 FILED ✅ (gate)
- `CONDUCTOR_BATON_ENABLED = true` platform-wide
- Founder explicit "fire Wave 1" greenlight
- Each Wave-1 member's individual member-row flag flipped on (so they can see the Conductor tab)

**Soak period:** 14 days minimum after the last Wave-1 enrollment. Telemetry measured: vendor mix breadth (≥3 vendors active across the cohort), latency p95 < 4s on R13-measured classes, complaint rate < 5%.

### Wave 2 — Full member rollout

Triggers:
1. Wave 1 telemetry green (above pass criteria)
2. Founder explicit ratification
3. `CONDUCTOR_BATON_ENABLED = true` platform-wide stays on (no rollback during Wave 1)

At Wave 2:
- Every member sees the Helm Conductor tab on next page render
- Default mode = `auto` (already the only mode visible without Nerd Mode)
- Pledge tagline updated to "Vendor-Neutral by Default" on the Pledge surface
- Receipt-share toggle remains OPT-IN (no auto-enrollment)

---

## 3. Rollback plan

Single command: flip `feature_flags.CONDUCTOR_BATON_ENABLED` to `false` in Supabase.

Effect (within ~30s, the in-process cache TTL):
- Helm Conductor tab disappears from every member's view
- Companion routing falls back to single-vendor Anthropic Sonnet 4.6 (the conservative fallback in `router.ts`)
- Cost ticker stops refreshing (telemetry continues recording in case of forensic need)
- No data loss — the scribe + members table data persists

Rollback decision authority: Founder. Any Knight observing critical regression should:
1. Capture the symptom in `BISHOP_DROPZONE/03_BishopHandoffs/`
2. Recommend rollback to Founder
3. NOT flip the flag without explicit Founder authorization (this is a launch-decision surface, not a maintenance one)

---

## 4. Communication drafts (DRAFT — DO NOT SEND UNTIL PROV 14 + EXPLICIT GREENLIGHT)

These are scaffolding only. Per Founder's "drafts as scaffolding" rule, expect 60–80% rewrite before any send.

### 4.1 Wave 1 outreach template (DRAFT)

```text
Subject: Help me test something — vendor-neutral AI for cooperative platforms

[Recipient first name],

Liana Banyan is a member-owned cooperative platform; one of the things we ship is the Conductor's Baton — a vendor-neutral router that picks the best AI model for each question across Anthropic, OpenAI, Google, and Perplexity, by empirical benchmark, not affiliation.

I'd like you in Wave 1 — 10 invited testers, before we open it to the rest of the membership. The full feature is already built and live for me; you'd be the second to use it.

What you'd see:
- A new "Conductor" tab in your member Helm
- Every question you ask the Companion gets auto-routed to whichever vendor's model performs best for that specific question class, at the lowest cost
- A Cost-Slasher receipt that shows how much you saved versus a single-vendor baseline
- Optional: opt in to publicly share your savings receipt (default OFF; nobody sees your numbers unless you flip a switch)

No NDAs. No exclusivity. If you don't like it, you flip Nerd Mode → Fixed Gear → pick your favorite vendor and lock it. Or you ignore the tab and the rest of Liana Banyan keeps working.

If you're in: reply with "in." I'll enroll you and send a one-page walkthrough.

— [Founder name]
```

### 4.2 Crown Letter mention (HOLD until trigger)

NO mention of Conductor / K444 / K446 / K525 in any Crown Letter until Founder's explicit Prov 14 publication greenlight. This is per B129 explicit direction:
> "NO Crown Letter inclusion of K444/K446/K525 deliverables [until Prov 14 trigger]"

When the trigger fires, Bishop drafts a one-paragraph Crown Letter mention; Founder rewrites; sends. Do not pre-stage that letter in `LAUNCH_DOCUMENTS_MASTER/` or `letters/` — that's the publication queue.

### 4.3 Public Pledge surface update (HOLD until trigger)

When `CONDUCTOR_RECEIPT_PUBLIC_SHARE` flips, Knight (separate K-future) updates the Pledge surface to surface the new tagline "Vendor-Neutral by Default" alongside the existing master tagline ("You build the Features — We're building the Board."). The constant `PLEDGE_TAGLINE_V2` in `rolloutWaves.ts` is the canonical text.

---

## 5. Operational checklist

When Founder is ready to fire publication, the sequence is:

1. ✅ Verify Prov 14 FILED.
2. ✅ Verify Wave 0 (Founder dogfood) telemetry green per criteria above.
3. Flip `feature_flags.CONDUCTOR_BATON_ENABLED = true` (platform-wide).
4. Founder personally enrolls Wave 1 members from `WAVE_1_MEMBERS` list (uses operator playbook).
5. 14-day Wave-1 soak with telemetry watch.
6. If green: flip `feature_flags.CONDUCTOR_RECEIPT_PUBLIC_SHARE = true`, update Pledge surface, draft Crown Letter mention.
7. Wave 2 silent rollout (every member's Helm gains the tab on next render).

If any step is RED: flip `CONDUCTOR_BATON_ENABLED = false` and pause. The infrastructure stays intact for re-attempt after fix.

---

## 6. Files in this launch (for completion / audit)

**New code (K525):**
- `platform/src/lib/conductor/circuitBreaker.ts` — A.1 vendor failure handling
- `platform/src/lib/conductor/contextWindows.ts` — A.3 token-budget overflow
- `platform/src/lib/conductor/costCap.ts` + `costCap-pure.ts` — A.2 spend cap
- `platform/src/lib/conductor/telemetry.ts` — A.4 latency + cost telemetry
- `platform/src/lib/conductor/featureFlag.ts` + `useFeatureFlag.ts` — D.1 flag client
- `platform/src/lib/conductor/rolloutWaves.ts` — D.2 wave config + tagline
- `platform/src/components/helm/ConductorTab.tsx` — B.1 Helm tab
- `platform/src/components/helm/ConductorCostTicker.tsx` — B.4
- `platform/src/components/helm/ConductorSpendCap.tsx` — B.5
- `platform/src/components/helm/ConductorTrustSurfaces.tsx` — B.3
- `platform/src/components/helm/ConductorNerdMode.tsx` — B.2
- `platform/src/components/helm/ConductorReceiptCard.tsx` — C.1

**Modified:**
- `platform/src/lib/conductor/router.ts` — wired circuit breaker + token budget + telemetry
- `platform/src/pages/HelmPage.tsx` — added gated Conductor tab

**Migration:**
- `platform/supabase/migrations/20260427120001_k525_conductor_cost_cap_and_flags.sql`
  - Adds `members.monthly_conductor_spend_usd`, `monthly_conductor_cap_usd`, `monthly_conductor_period_start`, `conductor_receipt_share_optin`
  - Creates `feature_flags` table
  - Seeds `CONDUCTOR_BATON_ENABLED = false`, `CONDUCTOR_RECEIPT_PUBLIC_SHARE = false`

**Tests added:** 33 new tests across `circuitBreaker.test.ts`, `contextWindows.test.ts`, `costCap.test.ts`, `telemetry.test.ts`, plus 5 new router integration scenarios (S18–S22). Total: **107 tests passing.**

---

**FOR THE KEEP!**
