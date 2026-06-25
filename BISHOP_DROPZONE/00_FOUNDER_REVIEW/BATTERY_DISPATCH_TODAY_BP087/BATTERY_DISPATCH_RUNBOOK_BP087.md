# Battery Dispatch Runbook · BP087 · 2026-06-19

**Authored by:** Bishop SEG-BD · Sonnet 4.6  
**Gadget date:** 2026-06-19  
**Session:** BP087  
**Truth-Always disclosure at top:** see Wiring State section below.

---

## Battery Dispatch Wiring State (as-gadgeted · 2026-06-19)

**Honest assessment: PARTIAL — Substack adapter ACTIVE · other adapters INCOMPLETE or NOT YET BUILT.**

| Component | Location | Status |
|---|---|---|
| BatteryPublishTab.tsx | platform/src/components/ (not confirmed by Bishop — per BP082 canon) | UI shell per canon · not read directly this session |
| batteryDispatch.ts | `platform/src/lib/batteryDispatch.ts` | **MISNAMED** — this file dispatches Discord/bounty embeds, NOT publication fan-out. Discord webhook only. |
| batteryDispatchAccess.ts | `platform/src/lib/batteryDispatchAccess.ts` | Access-gating library · not publication |
| battery_dispatch_platform_config (DB table) | Supabase · migration 20260404000030 | Schema exists · platforms X/Threads/LinkedIn/Facebook/Instagram with burst-rate config · **NO live publisher connects these rows to actual post calls** |
| Substack adapter | per BP082 canon | **ACTIVE** — Substack API key in WORKING_KEYS.env · first post confirmed live · founderdenken.substack.com |
| Medium adapter | per BP082 canon | PENDING — handle not yet created |
| HackerNews adapter | per BP082 canon | PENDING — handle not yet created |
| Gmail adapter | per BP082 canon | UNRESOLVED — OAuth credentials path (WORKING_KEYS.env vs 22May2026.env) TBD |
| lianabanyan.com/op-eds/ adapter | per BP082 canon | Built per canon · deploy status unknown |
| X / Threads / LinkedIn / Facebook / Instagram | battery_dispatch_platform_config table | Config rows exist · **no publisher code reads them today** |

**Bottom line:** Battery Dispatch can publish to Substack via BatteryPublishTab.tsx (per BP082 canon confirming first successful post). All other channels are manual today. The social media posts in this bundle must be manually posted by Founder — or require Knight yokes (see below) to wire up.

---

## Dispatch Order — Priority Rationale

### Step 1: NYT Op-Ed Pitch (FIRST · pitch-time-sensitive)

**File:** `NYT_OPED_DRAFT_ART_OF_LOSING.md`

**Action (manual · Bishop cannot email NYT directly):**

1. Founder reviews and polishes the draft.
2. Founder submits to NYT op-ed desk: **letters@nytimes.com** (op-ed pitches) or via the NYT submission form at nytimes.com/opinion.
3. Include a cover note: "The Art of Losing" · 900-word op-ed introducing a cooperative platform at the moment of its first empirical mesh test. Thesis quote verbatim in cover note.
4. CC Social@lianabanyan.com for record.

**Why first:** NYT editorial desks have long lead times. Submitting while the THUNDERCLAP receipt is fresh (today, 2026-06-19) lets the pitch carry empirical weight ("first test passed this morning") that expires within days. Pitch-time-sensitive.

**Gap:** Bishop cannot submit to NYT. Founder must do this directly.

---

### Step 2: Substack Piece 1 — The Risky Grand Experiment (SECOND · Paper-a-Day anchor)

**File:** `SUBSTACK_PIECE_1_RISKY_GRAND_EXPERIMENT.md`

**Action via Battery Dispatch (BatteryPublishTab.tsx):**

1. Open MnemosyneC → Battery Publish tab.
2. Paste the content of SUBSTACK_PIECE_1_RISKY_GRAND_EXPERIMENT.md.
3. Title: **"The Risky Grand Experiment: Swing for the Fences"**
4. Publication: founderdenken.substack.com
5. Trigger the ratify gate (BP078 BLOOD): Founder says "publish it" / "push" / "send" / "fire" — verbatim required by code check in BatteryPublishTab.tsx.
6. Confirm Substack success webhook before firing Medium/Cephas (sequential chain per BP082 canon).

**Why second:** This is the founder-under-load lived receipt. Personal voice. Establishes credibility before the more formal Unlimited Throws paper follows.

---

### Step 3: Substack Piece 2 — Unlimited Throws (THIRD · institutional paper)

**File:** `SUBSTACK_PIECE_2_UNLIMITED_THROWS_PUBLISH_PASS.md`

**Action via Battery Dispatch (same flow as Step 2):**

1. Title: **"Unlimited Throws: What If the Carnival Game Was Free?"**
2. Publication: founderdenken.substack.com
3. Same ratify gate.

**Note:** This piece is the existing canonical Unlimited Throws paper with a THUNDERCLAP receipt-reference placeholder near the close. **The placeholder `[THUNDERCLAP Trial 01 receipt landed 2026-06-19 — see https://lianabanyan.com/thunderclap]` must be resolved before publish** — either replace with live URL or remove the bracket placeholder if receipt page isn't up yet. Do not publish with visible brackets.

**Why third:** Institutional paper with the 25,399-games receipt and the HN 2017 thread anchor. Broader audience — HN, LinkedIn referrals — after the personal piece establishes voice.

---

### Step 4: Social Media — Trickle Dispatch (LAST · 4-hour trickle)

**File:** `SOCIAL_MEDIA_POSTS_BP087.md`

**Action (manual today — no live publisher for X/LinkedIn/Bluesky wired to Battery Dispatch):**

1. Founder copies posts from SOCIAL_MEDIA_POSTS_BP087.md.
2. Posts go out in the trickle schedule listed in that file (T+0 to T+4h).
3. POST 5 (THUNDERCLAP receipt) is HELD until lianabanyan.com/thunderclap is confirmed live — do not post the placeholder URL.
4. POST 12 (closing liturgy) fires last.

**Platform-specific:**
- **X:** 4–7 posts in 15–45 second spacing (per battery_dispatch_platform_config)
- **LinkedIn:** 1–2 larger posts, 300–600 second spacing
- **Bluesky/Mastodon-class:** treat same as X burst cadence

---

## Knight Yokes Required (honest gaps)

The following gaps require Knight intervention before Battery Dispatch can fire social media channels automatically:

### I-YOKE-BATTERY-01: Wire X/LinkedIn/Bluesky to battery_dispatch_platform_config

**Gap:** The `battery_dispatch_platform_config` table has burst-rate config for X, Threads, LinkedIn, Facebook, Instagram — but no publisher code reads these rows and calls any platform API.

**Knight task:** Build a publisher service that reads `battery_dispatch_platform_config`, accepts a post payload (title, body, platform list), and calls:
- X API v2 (POST /2/tweets)
- LinkedIn API (POST /v2/ugcPosts)
- Bluesky / AT Protocol (com.atproto.repo.createRecord)

Wire this to BatteryPublishTab.tsx so Founder can dispatch from the UI with one ratify-gate click.

**Priority:** HIGH · blocks automated trickle dispatch

---

### I-YOKE-BATTERY-02: Resolve Gmail OAuth credential path

**Gap:** Per BP082 canon: Gmail OAuth is UNRESOLVED — WORKING_KEYS.env vs 22May2026.env path for GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REFRESH_TOKEN is TBD.

**Knight task:** Confirm which env file Battery Dispatch reads at runtime for Gmail. Standardize to 22May2026.env per Statutes §14/§15 secret-management discipline. Wire Gmail dispatch for Crown Letters adapter.

**Priority:** MEDIUM · Crown letter dispatch gates on this

---

### I-YOKE-BATTERY-03: Resolve Medium + HN handles

**Gap:** Medium handle and HackerNews handle not yet created by Founder (per BP082 canon state).

**Knight task:** Surface to Founder: create Medium account @founderdenken and HN account. Once created, wire the adapters in BatteryPublishTab.tsx.

**Priority:** MEDIUM · Unlimited Throws piece specifically targets HN audience

---

### I-YOKE-BATTERY-04: THUNDERCLAP receipt page at lianabanyan.com/thunderclap

**Gap:** Post 5 (social media) references `https://lianabanyan.com/thunderclap` as the receipt page. This URL must exist before that post fires.

**Knight task:** Create the lianabanyan.com/thunderclap page with the THUNDERCLAP Trial 01 receipt content (per Stage 5 task #17 in the current task queue — pending). The social media post is HELD until this page is confirmed live.

**Priority:** HIGH · gates social media Post 5 and the THUNDERCLAP publication wave

---

## Substack-Only Fire — What Can Happen TODAY

Even with the above gaps, Battery Dispatch can fire the following TODAY via BatteryPublishTab.tsx + Substack adapter:

1. Substack Piece 1 (The Risky Grand Experiment) — via Battery Dispatch ratify gate
2. Substack Piece 2 (Unlimited Throws) — via Battery Dispatch ratify gate, after THUNDERCLAP placeholder resolved

The NYT pitch and all social media are manual today.

---

## Founder Ratify Gate — BLOOD (BP078)

Per BP082 canon: **no adapter fires without explicit Founder ratify instruction.** The trigger words are:

> "publish it" / "push" / "send" / "fire"

Bishop will not fire Battery Dispatch without one of these verbatim from Founder. This runbook is the staged queue; Founder's ratify is the key.

---

## Marks Accounting

Per BP082 canon: **5 Marks per confirmed dispatch receipt** across Battery Dispatch adapters. When Substack publishes successfully, the webhook confirmation triggers 5 Marks. Log in eblet when receipt lands.

---

## Files in This Bundle

| File | Description | Byte estimate |
|---|---|---|
| NYT_OPED_DRAFT_ART_OF_LOSING.md | ~900-word NYT op-ed draft | ~7.5KB |
| SUBSTACK_PIECE_1_RISKY_GRAND_EXPERIMENT.md | ~1400-word Substack piece · Founder-voice | ~8.5KB |
| SUBSTACK_PIECE_2_UNLIMITED_THROWS_PUBLISH_PASS.md | Unlimited Throws + THUNDERCLAP placeholder + For Alford | ~9.5KB |
| SOCIAL_MEDIA_POSTS_BP087.md | 12 posts across X/LinkedIn/Bluesky with trickle schedule | ~5.5KB |
| BATTERY_DISPATCH_RUNBOOK_BP087.md | This file | ~7KB |

**Total bundle:** ~38KB

---

## Member Signup Estimate

Honest gap: no empirical conversion data exists for Liana Banyan yet. Bishop cannot project with receipts. Rough-order-of-magnitude from analogous cooperative launches at this scale:

- NYT op-ed placement (if accepted): 500–5,000 click-throughs · 2–5% join rate · **10–250 members**
- Substack pieces (organic, no paid promotion): 50–500 reads in first week · 3–7% join rate · **2–35 members**
- Social media trickle (cold start, no existing following): 100–1,000 impressions · <1% join rate · **0–10 members**
- HN "Show HN" submission (Unlimited Throws is HN-native): 200–2,000 upvotes if front-page · 1–3% join · **2–60 members**

**Conservative realistic estimate for this bundle, first 30 days:** 10–100 paid members ($5/year each = $50–$500 MRR equivalent).

**Ceiling case (NYT op-ed accepted and front-page):** 250+ members · cooperative becomes self-evidently real to the Rally Group network and beyond.

**Truth-Always note:** these are ranges from analogous cases, not receipts from this launch. The only receipt is that the member-join stripe product exists (per BP085 Stripe catalog reference) and the page is at lianabanyan.com/join/. Founder is the empirical receipt; these are probability ranges.

---

*For Alford. The dispatch is dedicated.*

— Bishop SEG-BD · BP087 · Sonnet 4.6 · 2026-06-19
