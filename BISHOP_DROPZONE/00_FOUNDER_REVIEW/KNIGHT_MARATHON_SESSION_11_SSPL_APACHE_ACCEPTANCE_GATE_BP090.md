# Knight Marathon Session 11 — SSPL/Apache License Acceptance Gate
## BP090 · 2026-06-21 · STAGED FOR FOUNDER REVIEW — DO NOT EXECUTE UNTIL RATIFIED

**REFACTORED 2026-06-21 (first pass):** Added Block 1 (Hugo /licensing page, Edit 11) and Block 2 (Installer click-through, Edit 9) from BP087 prior-spec work previously omitted from the greenfield draft. Prior Block 1 (download modal) is now Block 3; prior Block 3 (Supabase) is now Block 4. Founder ratified this refactor.

**REFACTORED 2026-06-21 ~22:00 Central:** Founder-direct BP090 ratify session. Point #3 replaced with soft-launch + 5-window decay structure (calendar-date-absolute, not letter-relative). Blocks 1, 2, and 4 revised. T7-T10 gates added. `[CLOSER_RELATIONSHIP_PERK]` placeholder flagged. Wall-clock revised.

**REFACTORED 2026-06-22 morning Central:** Founder-direct BP090 ratify session (three changes):
1. Component G replaced with Founding Licensee Discount Pool model (Change #1). T10 RESOLVED — `[CLOSER_RELATIONSHIP_PERK]` placeholder removed, Discount Pool table is the canonical perk.
2. Mnemosynec.org single-CTA simplification (Change #2). Block 5 added.
3. T11 server-side download gate added — direct .exe URL must 403/redirect without valid session (Change #3 reinforce).

**REFACTORED 2026-06-22 ~10:50 Central:** Founder-direct BP090 ratify session — FINAL two-axis Founding Licensee model (Change #4):
1. Discount Pool model ($20M pool / 60%/40%/20% of pool remaining) SUPERSEDED by two-axis model: Axis 1 = amount paid → discount % (5%–50%); Axis 2 = adoption-milestone-tier at signing → duration (2–5 years). Program closes at 10,000 platform users.
2. T19 NEW: Supabase `platform_user_count` query must execute at Hugo build time AND at edge function call time; both surfaces must show the same phase HTML.
3. Block 4 schema: two new columns added: `founding_licensee_amount_paid integer nullable` and `founding_licensee_tier text nullable`.
4. Wall-clock revised to 15-21 hours (+1h for T19 platform_user_count Supabase query work).

**BP087 source files cited verbatim throughout:**
- Edit 9 (installer click-through): `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNEC_ORG_COPY_EDITS_BP087.md`
- Edit 11 (/licensing page recipe): `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\MNEMOSYNEC_ORG_COPY_EDITS_BP087.md`
- Android-of-AI canon: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087.eblet.md`
- 30-day offer canon (source of 5-window decay table verbatim): `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087.eblet.md`
- Folder-tier canon: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_folder_tier_licensing_free_for_non_profits_licensed_for_all_others_android_of_ai_content_layer_refinement_bp087.eblet.md`
- Pawn licensing brief: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\PAWN_BRIEF_LICENSING_SUMMARY_FOR_DESIGN_ADJUSTMENT_BP087.md`

---

## FOUNDER RATIFY POINTS (all ratified 2026-06-21 ~22:00 Central unless noted)

| # | Point | Status |
|---|---|---|
| 1 | `oneClick: false` — wizard installer | RATIFIED |
| 2 | Single dual-EULA installer (SSPL + Apache, user picks at install time) | RATIFIED |
| 3 | Soft-launch bonus window + 5-window calendar-date decay (calendar-date-absolute, not letter-relative) | RATIFIED |
| 4 | Let Knight verify Tower canonical (Cephas-only or also amplify-computer) | RATIFIED |
| 5 | Supabase prod direct with `CREATE TABLE IF NOT EXISTS` (idempotent) | RATIFIED |
| 6 | Brick wall — Edit 9 + Edit 11 verbatim ratified; can amend later | RATIFIED |
| 7 | Founding Licensee Discount Pool model replaces 5-seat scarcity placeholder (Change #1) | RATIFIED 2026-06-22 |
| 10 | Two-axis Founding Licensee model supersedes Discount Pool model (Change #4) — Axis 1 amount→%, Axis 2 milestone-tier→duration; program closes at 10,000 users | RATIFIED 2026-06-22 ~10:50 Central |
| 8 | Mnemosynec.org single-CTA simplification — one turn-key $5 join path (Change #2) | RATIFIED 2026-06-22 |
| 9 | T11 server-side .exe gate — direct URL must 403/redirect without valid session (Change #3 reinforce) | RATIFIED 2026-06-22 |

### Point #3 — Soft-Launch + 5-Window Decay Structure (Founder-direct BP090, 2026-06-21 ~22:00 Central)

**IMPORTANT:** These dates are calendar-absolute, NOT letter-relative. The table below replaces the abstract "days from letter" framing from the prior 30-day offer canon §3.5 for all public-facing surfaces and installer builds. The underlying canon §3.5 decay table is the structural source; this table is its calendar instantiation.

| Phase | Dates | Deal |
|---|---|---|
| **Soft-Launch Window** (Founder bonus) | Mon 2026-06-22 → Tue 2026-06-30 (~9 days) | Window 1 terms (50% off, 5-yr) **+ extra 10% off** + Founding Licensee Discount Pool (T10 RESOLVED — see Component G below) |
| Window 1 | Wed 2026-07-01 → Thu 2026-07-30 (30 days) | 50% off, 5-year term |
| Window 2 | Fri 2026-07-31 → Sat 2026-08-29 (30 days) | 50% off, 4-year term |
| Window 3 | Sun 2026-08-30 → Mon 2026-09-28 (30 days) | 50% off, 3-year term |
| Window 4 | Tue 2026-09-29 → Wed 2026-10-28 (30 days) | 50% off, 2-year term |
| Window 5 | Thu 2026-10-29 → Fri 2026-11-27 (30 days) | 50% off, 1-year term |
| **FRAND-only** | Sat 2026-11-28+ | Full FRAND rate, no discount — amber block REMOVED programmatically |

**Source:** `canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087` §3.5 (6-row decay table verbatim, calendar-date-mapped for this Marathon).

**T10 STATUS: RESOLVED.** `[CLOSER_RELATIONSHIP_PERK]` placeholder is retired. The Founding Licensee Discount Pool (ratified 2026-06-22) is the canonical closer-relationship perk. Soft-launch Phase A amber block may now proceed. No remaining T10 blocker.

---

## SCOPE SUMMARY

Marathon 11 adds a **license acceptance gate** across five surfaces in sequential execution order:

1. **Hugo /licensing page** — canonical public licensing reference for all acceptance surfaces to link to (Edit 11 from BP087 MNEMOSYNEC_ORG_COPY_EDITS_BP087.md) — NOW INCLUDES 3-phase programmatic gate: soft-launch banner → 5-window decay table → FRAND-only. Component G is the Founding Licensee Two-Axis Model (FINAL — Ratified 2026-06-22 ~10:50 Central; supersedes Discount Pool model).
2. **Electron NSIS installer** — click-through screen with 5 text blocks, single checkbox, disabled Continue button (Edit 9 from BP087 MNEMOSYNEC_ORG_COPY_EDITS_BP087.md) — NOW INCLUDES 3-phase amber programmatic gate tied to build date. Amber soft-launch block now references Two-Axis Model (supersedes Discount Pool).
3. **Hugo Tower download page** — click-through modal (SSPL v1 + Pledge #2260 OR Apache 2.0 per folder-tier canon) before `.exe` download activates — NOW INCLUDES T11 server-side gate: direct .exe URL must 403/redirect-to-modal without valid session token.
4. **Supabase `license_acceptances` audit table** — canonical acceptance log; INSERT endpoint via RPC; INCLUDES `phase_at_acceptance` column + CHECK constraint + server-side date validation (anti-spoof). Schema unchanged from prior version.
5. **Mnemosynec.org Hugo content** — single turn-key join CTA. Remove or de-emphasize alternate join paths. One "Join the Cooperative · $5/year" button in header (and one in-body) pointing to lianabanyan.com/join.

**Truth-Always invariant:** download button and installer MUST NOT proceed without acceptance. Gate is additive; existing v0.5.16 peer installs are not retroactively affected (gate applies to NEW CDN downloads only).

**Recommended execution order: Block 4 (Supabase) → Block 1 (Hugo page) → Block 2 (installer) → Block 3 (download modal + T11) → Block 5 (Mnemosynec.org) → test all gates**

---

## BLOCK 1 — Hugo /licensing Page (Edit 11 Implementation + 3-Phase Programmatic Gate)

### Source
Edit 11 from `MNEMOSYNEC_ORG_COPY_EDITS_BP087.md`. Full HTML skeleton in `MNEMOSYNEC_ORG_DESIGN_SYSTEM_AND_CONCRETE_EXAMPLES_BP087.md` §7C. This block is the REQUIRED build target before any other surface can link to `mnemosynec.org/licensing`.

### Where it lives
New Hugo content file: `content/licensing/_index.md` (or `content/licensing.md`) in the Cephas Hugo repo (`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`). Layout file: `layouts/licensing/single.html` (or `layouts/_default/licensing.html`).

### Front matter (verbatim from Edit 11)

```yaml
---
title: "Licensing"
description: "MnemosyneC is licensed under SSPL v1 for personal and cooperative use, Apache 2.0 for library extractions, and commercially via Upekrithen LLC. Pledge #2260 covers patent peace for all users."
aliases: ["/license"]
layout: "licensing"
---
```

### Page sections (9 sections from Edit 11 — source of truth for table contents is the three BP087 canons above)

**Section 1 — Hero**
- Eyebrow: "Licensing."
- Headline: "How MnemosyneC is licensed."
- One-liner verbatim from Edit 11: "Free under SSPL for everyone. Apache for library extractions. Patent peace via Pledge #2260. Trademarks held by Upekrithen LLC."

**Section 2 — 4-layer table**
Source of truth: Android-of-AI canon §2 (four layers). Columns: Layer, License, Who it serves, What it requires.

| Layer | License | Who it serves | What it requires |
|---|---|---|---|
| Substrate node + installer | SSPL v1 | Everyone: personal, cooperative, research, non-profit | SaaS providers must open-source full service stack under SSPL per Section 13, OR obtain commercial license |
| Library extractions (Apache path) | Apache 2.0 | For-profit AI companies forking selected reference implementations | Attribution; no copyleft on the fork; Pledge #2260 patent peace conditional on not suing cooperative members |
| Patent floor | Cooperative Defensive Patent Pledge #2260 | All users (Tier A automatic; Tier B conditional on valid commercial license) | Do not initiate patent litigation against any cooperative member |
| Trademarks | Upekrithen LLC TUP | All parties | MnemosyneC, Dr. Mnemosynec, Liana Banyan, Cephas are non-licensable without written permission to licensing@lianabanyan.com |

No additions, no removals without Founder ratify.

**Section 3 — Android-of-AI flip card (Component A)**
- Front: "We use the Android licensing model." with four-part mapping (SSPL = AOSP-equivalent + cooperative substrate, Apache = library extraction fork path, Pledge #2260 = patent cross-license floor, TUP = trademark control)
- Back: link to canon slug `canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087`

**Section 4 — SSPL Section 13 callout (Component F)**
- Title: "What Section 13 means in practice."
- Body verbatim from SEG-Y T1 §7C Section 4. Summary: any party offering MnemosyneC or a derivative as a service must release their ENTIRE service stack under SSPL. The three structural options for for-profit AI vendors are: (A) do not integrate, (B) open-source entire AI stack under SSPL, (C) license commercially. Section 13 is the forcing function that converts the cooperative-vs-extractive choice into an explicit commercial conversation.

**Section 5 — Commercial offer card (Component G) — FOUNDING LICENSEE TWO-AXIS MODEL (FINAL)**
**[CHANGE #1 — Ratified 2026-06-22: Discount Pool replaces 5-seat scarcity placeholder. T10 RESOLVED.]**
**[CHANGE #4 — Ratified 2026-06-22 ~10:50 Central: Two-axis model SUPERSEDES Discount Pool model. Program closes at 10,000 platform users, NOT on a calendar date. T19 NEW: Supabase platform_user_count query at build time + edge function runtime; both surfaces serve same phase HTML.]**

Component G renders one of three mutually exclusive states based on **platform_user_count** (queried from Supabase at Hugo build time AND at edge function call time per T19) AND current date for soft-launch window. Knight MUST NOT show more than one phase at a time.

**T19 — Supabase platform_user_count Gate (NEW):**
- At Hugo build time: Knight queries `SELECT COUNT(*) FROM platform_users WHERE status = 'active'` (or canonical equivalent table/view) and injects the result as a Hugo data variable. The build produces phase HTML based on this count.
- At edge function call time: the same query executes server-side so that the served HTML reflects current count regardless of last build date.
- Both surfaces (static build + live edge function) must serve identical phase HTML for the same user_count range.
- If `platform_user_count >= 10000`: Component G is FRAND-only (Phase C). Amber block absent from DOM.
- If `platform_user_count < 10000` AND date is within soft-launch window (2026-06-22 through 2026-06-30): Phase A.
- If `platform_user_count < 10000` AND date is 2026-07-01 through 2026-11-27: Phase B (5-window decay).
- If `platform_user_count < 10000` AND date is 2026-11-28+: Phase C (FRAND-only).

---

**PHASE A — Soft-Launch Banner**
Visible: 2026-06-22 through 2026-06-30 ONLY (9 days) AND platform_user_count < 10,000
Style: amber banner + emphasized (visually distinct from standard decay table)

The soft-launch amber block presents the Founding Licensee Two-Axis Model in full. Verbatim content:

```
[SOFT-LAUNCH BANNER — amber, prominent]
Eyebrow: "SOFT-LAUNCH EXCLUSIVE — Available 2026-06-22 to 2026-06-30 only."
Headline: "60 percent off commercial licensing, 5-year term."
Subheadline: "Window 1 terms (50% off) plus an extra 10% off — our thank-you for being first."

--- FOUNDING LICENSEE PROGRAM — TWO-AXIS MODEL ---

Liana Banyan Corporation is offering Founding Licensee terms to AI companies whose products
materially benefit from cooperative substrate integration. The program is structured on two
independent axes: amount paid determines the discount percentage; adoption-milestone-tier-at-signing
determines how long that discount lasts.

Minimum participation: $1,000,000 USD. Below $1M, standard FRAND only.

AXIS 1 — AMOUNT PAID → DISCOUNT PERCENTAGE (locked at signing):

Amount Paid | Discount on Annual License
------------|---------------------------
$1M         | 5%
$2M         | 12%
$5M         | 25%
$10M        | 40%
$20M        | 50% (maximum)

(Linear interpolation for intermediate amounts. 50% is the discount ceiling; no amount
above $20M increases the rate.)

AXIS 2 — ADOPTION-MILESTONE TIER AT SIGNING → DISCOUNT DURATION:

The clock starts the moment the FIRST Founding Licensee executes. Tiers close permanently
as Liana Banyan's adoption milestones hit — no calendar deadlines apply.

Milestone at Signing       | Discount Duration
---------------------------|------------------
Tier 1: 0–250 users        | 5 years (maximum)
Tier 2: 251–1,000 users    | 4 years
Tier 3: 1,001–5,000 users  | 3 years
Tier 4: 5,001–10,000 users | 2 years
After 10,000 users         | Standard FRAND, program closed

Same-day rule: Founding Licensees executing within 24 hours of each other share the same
milestone tier, regardless of strict ordering.

FOUNDING LICENSEE STATUS (All Founding Licensees):
- Named placement in launch communications
- Listed on lianabanyan.com/companies-joining-in
- Named in the Founder's first published Substack on the cooperative substrate

PROGRAM CLOSURE: When Liana Banyan reaches 10,000 platform users, the Founding Licensee
program closes permanently. Subsequent licensing is standard FRAND at Cost+20% margin only.

CTA: mailto:hello@upekrithen.com — "Claim Soft-Launch Rate"
Fine print: "This rate expires 2026-06-30 at midnight Central. After that, standard Window 1
(50% off, 5-year term) applies through 2026-07-30."
```

**NOTE — T10 RESOLVED:** The `[CLOSER_RELATIONSHIP_PERK]` placeholder is retired. The Founding Licensee Two-Axis Model above is the canonical perk. Phase A may now be built and deployed without Founder-supplied perk copy. Knight proceeds without blocker.

---

**PHASE B — 5-Window Decay Table**
Visible: 2026-07-01 through 2026-11-27 (150 days)
Style: amber left-border box (Component G standard style); countdown badge dynamic; current window row highlighted amber; closed windows progressively dimmed

Block A: OFFER WINDOW eyebrow, "50 percent off commercial licensing" headline, "Term decays from 5 years to 1 year as you wait" subheadline

Block B: Canonical calendar-date decay table (source of truth: 30-day offer canon §3.5, calendar-mapped per Point #3 above):

| Window | Calendar dates | Discount term if accepted |
|---|---|---|
| Soft-Launch (closed) | 2026-06-22 to 2026-06-30 | — (closed; strikethrough) |
| 1 | 2026-07-01 to 2026-07-30 | 50% off for 5 years |
| 2 | 2026-07-31 to 2026-08-29 | 50% off for 4 years |
| 3 | 2026-08-30 to 2026-09-28 | 50% off for 3 years |
| 4 | 2026-09-29 to 2026-10-28 | 50% off for 2 years |
| 5 | 2026-10-29 to 2026-11-27 | 50% off for 1 year |

The currently active window row: amber highlight. Closed windows: strikethrough + dimmed. Future windows: standard dimming.

Countdown badge: dynamic, renders remaining days in current window at visit time (NOT static).

CTA button: `mailto:hello@upekrithen.com`

Saladin-mercy pill: present (per Pawn brief "stays the same").

**Phase B Founding Licensee Two-Axis note:** The Founding Licensee program was available during the Soft-Launch window. Phase B renders a brief reference: "The Founding Licensee Two-Axis program was available during the Soft-Launch window (June 22-30, 2026) for platforms under 10,000 users. Standard Window {N} discount terms apply." This ensures continuity without re-presenting the full two-axis table after it has closed.

---

**PHASE C — FRAND-Only State**
Visible: (a) 2026-11-28 and beyond regardless of user count, OR (b) platform_user_count >= 10,000 at any time
Style: NO amber block, NO decay table. Only plain text.

```
Commercial licensing is available at full FRAND rate. Contact hello@upekrithen.com.
```

The amber Component G block is REMOVED from the DOM entirely (not hidden, not collapsed — absent). Programmatic gate ensures this. T19 requires that both the Hugo static build and the edge function runtime agree on Phase C when platform_user_count >= 10,000.

---

**Component G programmatic JS gate (inline in layout, runs at page render):**

NOTE: `PLATFORM_USER_COUNT` is injected by the Hugo build (via T19 Supabase query at build time) as a Hugo template variable rendered into the page as a JS constant. The edge function also injects it at runtime for the live-count path. Both must agree.

```javascript
(function() {
  // T19: platform_user_count injected by Hugo build + edge function (both must agree)
  var PLATFORM_USER_COUNT = {{ .Site.Data.platform_user_count | default 0 }};  // Hugo template injection
  var PROGRAM_CLOSED_USER_THRESHOLD = 10000;

  // Phase date boundaries (UTC midnight — adjust to Central by offsetting +5/+6 hours as needed)
  var SOFT_LAUNCH_START = new Date('2026-06-22T00:00:00-05:00');
  var SOFT_LAUNCH_END   = new Date('2026-06-30T23:59:59-05:00');
  var DECAY_END         = new Date('2026-11-27T23:59:59-06:00');
  var now = new Date();

  var phaseA = document.getElementById('component-g-soft-launch');
  var phaseB = document.getElementById('component-g-decay-table');
  var phaseC = document.getElementById('component-g-frand-only');

  // Default: hide all
  if (phaseA) phaseA.style.display = 'none';
  if (phaseB) phaseB.style.display = 'none';
  if (phaseC) phaseC.style.display = 'none';

  // T19: if platform >= 10,000 users, program is closed regardless of date
  if (PLATFORM_USER_COUNT >= PROGRAM_CLOSED_USER_THRESHOLD) {
    // Phase C: program closed by adoption milestone
    if (phaseC) phaseC.style.display = '';
  } else if (now >= SOFT_LAUNCH_START && now <= SOFT_LAUNCH_END) {
    // Phase A: soft-launch banner with Two-Axis Model table
    if (phaseA) phaseA.style.display = '';
  } else if (now > SOFT_LAUNCH_END && now <= DECAY_END) {
    // Phase B: 5-window decay table
    if (phaseB) phaseB.style.display = '';
    // Highlight current window and update countdown badge
    highlightCurrentWindow(now);
  } else if (now > DECAY_END) {
    // Phase C: FRAND-only (calendar-based)
    if (phaseC) phaseC.style.display = '';
  }
  // Before SOFT_LAUNCH_START (2026-06-22): none of the three blocks render (Section 5 absent entirely)
})();

function highlightCurrentWindow(now) {
  var windows = [
    { id: 'w1', start: new Date('2026-07-01T00:00:00-05:00'), end: new Date('2026-07-30T23:59:59-05:00') },
    { id: 'w2', start: new Date('2026-07-31T00:00:00-05:00'), end: new Date('2026-08-29T23:59:59-05:00') },
    { id: 'w3', start: new Date('2026-08-30T00:00:00-05:00'), end: new Date('2026-09-28T23:59:59-05:00') },
    { id: 'w4', start: new Date('2026-09-29T00:00:00-05:00'), end: new Date('2026-10-28T23:59:59-05:00') },
    { id: 'w5', start: new Date('2026-10-29T00:00:00-05:00'), end: new Date('2026-11-27T23:59:59-06:00') }
  ];
  windows.forEach(function(w) {
    var row = document.getElementById('decay-row-' + w.id);
    if (!row) return;
    if (now >= w.start && now <= w.end) {
      row.classList.add('decay-row--active');
      // Update countdown badge
      var badge = document.getElementById('countdown-badge');
      if (badge) {
        var daysLeft = Math.ceil((w.end - now) / (1000 * 60 * 60 * 24));
        badge.textContent = daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' remaining in this window';
      }
    } else if (now > w.end) {
      row.classList.add('decay-row--closed');
    }
  });
}
```

**Truth-Always gate T7:** Phase A soft-launch banner MUST NOT appear before 2026-06-22 or after 2026-06-30. Knight verifies by setting system clock to 2026-06-21 (absent), 2026-06-22 (present), 2026-06-30 (present), 2026-07-01 (absent, Phase B active instead).

**Truth-Always gate T8:** Active window row highlight and countdown badge MUST auto-shift on date boundaries — programmatic, not manual. Knight verifies by setting system clock to boundary dates for each window transition.

**Truth-Always gate T9:** After 2026-11-27, amber block and decay table are absent from DOM. Knight verifies by setting system clock to 2026-11-28.

**Section 6 — Pledge #2260 callout (Component F, green variant)**
- Title: "Patent peace, conditional."
- Body verbatim from SEG-Y T1 §7C Section 6. Key claims: Upekrithen LLC + Liana Banyan Corporation hold 2,700+ patent claims across 19+ USPTO provisional filings. Peace is automatic for cooperatives, individuals, research, non-profits (Tier A). For-profit commercial licensees (Tier B) receive peace conditional on holding a valid commercial license. Revocation is immediate and irrevocable on initiation of patent litigation against any cooperative member.

**Section 7 — Trademarks callout (Component F, teal/info variant)**
- Title: "Trademarks belong to Upekrithen LLC."
- Body verbatim from SEG-Y T1 §7C Section 7. Four trademarks as of BP087: MnemosyneC, Dr. Mnemosynec, Liana Banyan, Cephas. Non-licensable without written permission. Do not add or remove trademarks from this list without Founder ratify.

**Section 8 — FAQ (3 Component A flip cards)**
Questions and answers verbatim from SEG-Y T1 §7C Section 8. All three flip cards must flip and return correctly on click (acceptance criterion 5).

**Section 9 — Contact + liturgy footer**
- Contact CTA: `hello@upekrithen.com`
- Closing liturgy 4-line block verbatim (per Edit 11 + SEG-Z closing block)
- FounderDenken/Crewman #6 byline
- Footer links including "Licensing" self-link

### Acceptance criteria (9, verbatim from Edit 11 — DO NOT mark Block 1 complete until all 9 pass)

1. `mnemosynec.org/licensing` loads and serves the page content above.
2. `mnemosynec.org/license` redirects to or serves identical content (Hugo alias confirmed).
3. The "Licensing" anchor appears in the footer of every cooperative-class page: homepage, about, join, download. (Not required on: API docs, settings, error pages.)
4. Component G countdown badge is dynamic, not static. Renders the correct remaining days at visit time.
5. All three FAQ flip cards flip and return correctly on click.
6. The Android-of-AI flip card (Section 3) flips and returns correctly on click.
7. The commercial offer notice in the installer (Block 2) links to this page at `mnemosynec.org/licensing`.
8. Zero em-dashes in rendered page copy.
9. All canon eblet slugs cited in flip card back faces are correct as of SEG-AA and SEG-BB.

**Acceptance criterion 10 (NEW — Change #1, UPDATED Change #4):** Component G Phase A amber block contains the Founding Licensee Two-Axis Model table verbatim: $1,000,000 minimum, Axis 1 amount→% table (5 rows, $1M–$20M, 5%–50%), Axis 2 milestone-tier→duration table (5 rows + after-10K row), same-day rule, Founding Licensee Status perks, and program closure at 10,000 users. Knight verifies against verbatim from this yoke.

**Acceptance criterion 11 (NEW — T19):** platform_user_count is queried from Supabase at Hugo build time AND at edge function call time. Both surfaces serve the same phase HTML for the same user_count range. Knight verifies by: (a) confirming Hugo build data file contains current count; (b) confirming edge function query executes and matches; (c) testing Phase C trigger by simulating count >= 10,000 (mock or staging).

### Estimated effort: 4-5 hours (Hugo page authoring + 3-phase programmatic gate JS + Component G soft-launch banner with Two-Axis Model table + decay table + FRAND-only state + design tokens + T19 platform_user_count Supabase query at build time + edge function runtime parity)

---

## BLOCK 2 — Electron NSIS Installer: Click-Through Screen (Edit 9 + 3-Phase Amber Gate)

### Source
Edit 9 (revised) from `MNEMOSYNEC_ORG_COPY_EDITS_BP087.md`. Canon refs: `canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087` (SEG-AA), `canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087` (SEG-BB).

### Where it lives
`C:\Users\Administrator\Documents\LianaBanyanPlatform\lb-test-frame\electron\electron-builder.yml`
And the matching MnemosyneC Electron build config in the amplify-computer repo. Knight must locate the correct amplify-computer path at execution time.

### electron-builder.yml change (RATIFIED — Point #1)

```yaml
nsis:
  oneClick: false                               # RATIFIED Point #1: wizard installer
  allowToChangeInstallationDirectory: false
  deleteAppDataOnUninstall: false
  installerHeaderIcon: build-resources/icon.ico
  installerIcon: build-resources/icon.ico
  uninstallerIcon: build-resources/icon.ico
  shortcutName: "MnemosyneC"
  license: build-resources/LICENSE_SCREEN_BP087.rtf  # NEW: custom click-through screen (RTF or txt)
```

**RATIFIED behavioral change:** `oneClick: false` changes the install flow from single-click-silent to wizard-with-click-through. This is a user-visible behavioral change that MUST appear in v0.6.x release notes. (Truth-Always gate T6.)

**RATIFIED Point #2:** Single dual-EULA installer — SSPL + Apache 2.0, user picks at install time. No separate Apache build artifact. The installer presents both license paths and records the user's selection.

### Single click-through screen — 5 text blocks

This is installer UI prose. Single screen, not two. All text verbatim from Edit 9 except Block 3 (amber commercial-offer notice) which is now 3-phase gated by BUILD_DATE.

**Block 1 — Header (top of screen):**
```
Welcome to MnemosyneC. Dr. Mnemosynec is here to give your AI memory.
```

**Block 2 — Body (mid-screen, standard text):**
```
This software is free under the Server Side Public License (SSPL v1) for personal and cooperative use. If you wrap it as a service for paying customers, SSPL Section 13 requires you to open-source your service stack OR obtain a commercial license. Library extractions are available under Apache 2.0 for for-profit AI integrations.
```

**Block 3 — Commercial offer notice (amber left-border box) — 3-PHASE BUILD-DATE GATE:**
**[CHANGE #1 applied — Discount Pool replaces 5-seat scarcity placeholder in Phase A. T10 RESOLVED.]**
**[CHANGE #4 applied — Two-Axis Model SUPERSEDES Discount Pool in Phase A. Ratified 2026-06-22 ~10:50 Central.]**

Block 3 content is determined at NSIS compile time by the `BUILD_DATE` environment variable. Knight implements a build-time conditional (NSIS preprocessor `!if` or a script that generates the RTF block before compile). Three states:

**Phase A — Soft-Launch (BUILD_DATE 2026-06-22 through 2026-06-30):**
```
[AMBER BOX — SOFT-LAUNCH EXCLUSIVE]
Commercial AI vendors: a SOFT-LAUNCH rate of 60 percent off commercial licensing
(Window 1 50% + extra 10%) for a 5-year term is available through June 30, 2026.

FOUNDING LICENSEE PROGRAM — TWO-AXIS MODEL

Liana Banyan Corporation is offering Founding Licensee terms to AI companies whose
products materially benefit from cooperative substrate integration. Two independent
axes: amount paid determines discount %; adoption-milestone-tier at signing determines
how long that discount lasts.

Minimum participation: $1,000,000 USD. Below $1M, standard FRAND only.

Axis 1 — Amount Paid to Discount %:
- $1M: 5%
- $2M: 12%
- $5M: 25%
- $10M: 40%
- $20M: 50% (maximum; linear interpolation for intermediate amounts)

Axis 2 — Adoption Milestone Tier at Signing to Duration:
- Tier 1 (0-250 users): 5 years (maximum)
- Tier 2 (251-1,000 users): 4 years
- Tier 3 (1,001-5,000 users): 3 years
- Tier 4 (5,001-10,000 users): 2 years
- After 10,000 users: standard FRAND, program closed

Same-day rule: licensees executing within 24 hours share the same milestone tier.

Founding Licensee Status: named in launch communications, listed on
lianabanyan.com/companies-joining-in, named in the Founder's first Substack.

Program closes permanently when Liana Banyan reaches 10,000 platform users.

See mnemosynec.org/licensing for full terms.
Contact: hello@upekrithen.com
```

**T10 STATUS: RESOLVED.** No placeholder remains. Phase A NSIS compile may proceed.

**Phase B — 5-Window Decay (BUILD_DATE 2026-07-01 through 2026-11-27):**

The amber notice text references the CURRENT window at build time. Knight uses `BUILD_DATE` to compute the active window from the Point #3 table and inserts the correct copy:

```
[AMBER BOX — WINDOW {N} OF 5]
Commercial AI vendors: a 50 percent discount on commercial licensing for a {TERM}-year term is available through {WINDOW_END_DATE}. Each additional 30-day delay reduces the discount term by 1 year.
See mnemosynec.org/licensing for the full schedule.
```

Where `{N}`, `{TERM}`, and `{WINDOW_END_DATE}` are substituted at build time per the Point #3 table:
- Window 1 build (2026-07-01 to 2026-07-30): N=1, TERM=5, END=July 30, 2026
- Window 2 build (2026-07-31 to 2026-08-29): N=2, TERM=4, END=August 29, 2026
- Window 3 build (2026-08-30 to 2026-09-28): N=3, TERM=3, END=September 28, 2026
- Window 4 build (2026-09-29 to 2026-10-28): N=4, TERM=2, END=October 28, 2026
- Window 5 build (2026-10-29 to 2026-11-27): N=5, TERM=1, END=November 27, 2026

**Phase C — FRAND-Only (BUILD_DATE 2026-11-28 and beyond):**
Block 3 is OMITTED ENTIRELY from the compiled installer. Not present in RTF, not present in NSIS page. The 4 permanent blocks (1, 2, 4, 5) remain.

**Implementation note:** Knight should use a build script (Node.js or Python) that accepts `BUILD_DATE` as env var, determines the phase, generates the correct `LICENSE_SCREEN_BP087.rtf` content, and passes it to NSIS compile. Hardcoded dates in the script must match Point #3 table verbatim.

**Block 4 — Patent notice (below offer notice — PERMANENT):**
```
Patent Pledge #2260: by installing, you acknowledge that any patent litigation against a cooperative member revokes your patent peace.
```

**Block 5 — Warranty disclaimer (bottom of body, smaller text, muted color — PERMANENT, cannot be hidden):**
```
This software is provided as-is, without warranty of any kind. Use at your own discretion.
```

### Checkbox and button (verbatim from Edit 9)

**Checkbox label (single checkbox, required before Continue is enabled):**
```
I have read and agree to the license terms above.
```

**Continue button:** Enabled ONLY after the checkbox is checked. Label: "Continue". Must be `disabled` (grayed out, not clickable) until checkbox is checked. Hard requirement per SEG-W canon section 4.

**Link below Continue button:**
```
Read the full SSPL, Apache 2.0 extractions list, Pledge #2260, and TUP at mnemosynec.org/licensing.
```
Link must open in system browser, not in an embedded view.

### Installer implementation constraints (verbatim from Edit 9, extended for Point #2 + 3-phase gate)

- No "I Decline" button that exits silently. If the user does not check the checkbox, Continue remains disabled. If the user wants to cancel, they close the installer window.
- Warranty disclaimer must be visually distinct (smaller text, muted color) but still readable. Cannot be hidden.
- The offer notice text must remain verbatim per phase — do not paraphrase or round percentages.
- After 2026-11-27 (Phase C), amber block is absent from compiled installer. Verified via T9-equivalent build test.
- **Dual-EULA (Point #2):** the installer presents both SSPL v1 and Apache 2.0 license texts. User selects their path via radio (same UX pattern as Block 3 modal) before the single checkbox and Continue button. Selection is passed to the Supabase RPC `log_license_acceptance` at first network opportunity post-install (or queued locally if offline at install time).

### Estimated effort: 2-3 hours (NSIS custom page + electron-builder.yml + dual-EULA radio + build-date 3-phase script + license text packaging)

---

## BLOCK 3 — Hugo Tower Download Page: License Acceptance Modal + T11 Server-Side Gate

### Source
New block (no prior BP087 spec). Designed from folder-tier canon (SSPL vs Apache path distinction) and Android-of-AI canon (structural path rationale).

**[CHANGE #3 — T11 server-side gate added. Ratified 2026-06-22.]**

### Where it lives
`C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\download\list.html`

Verify at execution: if `amplify-computer` repo also serves a `/download` route, Knight must add the same modal there. Knight confirms the canonical Tower location at execution time. (Founder ratified Point #4: let Knight verify.)

### T11 — Server-Side Download Gate (NEW — HARD GATE)

**The SSPL or Apache license choice during download is a necessity. This is a HARD gate.**

**T11:** Direct `.exe` URL must return **403** (or **401**, or redirect-to-modal) if accessed without a valid recent `license_acceptances` row associated with the requesting session. Knight implements via **signed-URL or cookie-gated redirect**:

**Implementation options (Knight selects most appropriate at execution time):**

**Option A — Signed URL (preferred):**
- Accept button fires Supabase RPC `log_license_acceptance` → RPC returns `acceptance_id` (uuid)
- Server-side edge function (Supabase Edge Function or Cephas Hugo serverless) generates a **time-limited signed URL** (`/download/signed?token=<JWT>&expires=<unix_ts>`) valid for 15 minutes, single-use
- Direct `.exe` CDN path is NOT the public URL — the signed URL wraps it
- Anyone hitting the raw CDN `.exe` URL without a valid JWT gets 403

**Option B — Session cookie gate (fallback):**
- Accept button fires RPC → server sets a short-lived `lba_accepted` cookie (HttpOnly, SameSite=Strict, 15-min TTL, scoped to download domain)
- Download endpoint checks cookie; absent cookie = 301 redirect to modal anchor
- JS-disabled fallback: form POST sets cookie server-side before serving download

**Knight implements whichever option is technically feasible given the current CDN/Hugo/Supabase stack. Both options are acceptable. Knight documents chosen approach in return-to-Bishop.**

**T11 verification:** Knight verifies by:
1. Attempting to `curl -I <direct_exe_url>` without a valid token/cookie — must receive 403, 401, or 3xx redirect (NOT 200)
2. Completing the modal Accept flow → downloading successfully via signed/gated URL
3. Attempting to reuse a spent signed URL (if Option A) — must receive 403

### What to build

A JavaScript-driven modal that intercepts all `.tp-dl-btn` and `.tp-dl-link` click events. The modal presents:

**Radio select — two paths (source: folder-tier canon §2)**
- `SSPL` — "Cooperative path (SSPL v1 + Cooperative Patent Pledge #2260) — Free to use, free to share. If you modify MnemosyneC and run it as a public service, you open-source the full modified stack. [Read SSPL v1] [Read Pledge #2260]"
- `Apache` — "Enterprise / fork path (Apache 2.0) — Free to use and modify. No open-source obligation. For commercial deployments, enterprise integrations, and forks outside the cooperative. [Read Apache 2.0]"

**Folder-tier distinction note (source: folder-tier canon §2, Tier A vs Tier B):**
- SSPL path = Tier A (cooperative, non-profit, research, individual): full access to all 16 substrate folders
- Apache path = Tier B (for-profit, commercial deployment): commercial license required for Folders 01-14 and 16; `manifest.json` `license_tier` field governs Frame-level access check

**Checkbox:** "I have read and accept the terms of the selected license." (required to proceed)

**Accept button:** disabled until both radio selected AND checkbox checked. Label: "Accept and Download". On accept: POST to Supabase RPC `log_license_acceptance` (Block 4) → receive `acceptance_id` → exchange for signed URL or await cookie → trigger download.

### Copy (verbatim lock — Founder may edit before ratify)

**Modal title:** "Before you download -- choose your path"

**SSPL radio label:**
> Cooperative path -- SSPL v1 + Pledge #2260
> Free to use, free to share. If you modify MnemosyneC and run it as a public service, you open-source the full modified stack. [Read SSPL v1] [Read Pledge #2260]

**Apache 2.0 radio label:**
> Enterprise / fork path -- Apache 2.0
> Free to use and modify. No open-source obligation. For commercial deployments, enterprise integrations, and forks outside the cooperative. [Read Apache 2.0]

**Checkbox label:** "I have read and accept the terms above."

**Accept button:** "Accept and Download"

**Fine print below button:** "Your choice is logged for our records. You can re-read both licenses at mnemosynec.org/licensing."

### Technical spec

```javascript
// Intercept download links on page load
document.querySelectorAll('.tp-dl-btn, .tp-dl-link').forEach(link => {
  const originalHref = link.getAttribute('href');
  const originalDownload = link.getAttribute('download');
  link.removeAttribute('href');
  link.removeAttribute('download');
  link.style.cursor = 'pointer';
  link.addEventListener('click', () => openLicenseModal(originalHref, originalDownload));
});

// On Accept: fire to Supabase RPC (non-blocking), then trigger download via signed URL or cookie gate
async function onAccept(href, filename, pathChosen, phaseAtAcceptance) {
  let downloadUrl = href; // fallback
  try {
    const acceptanceId = await supabase.rpc('log_license_acceptance', {
      p_path_chosen: pathChosen,             // 'SSPL' or 'Apache'
      p_phase_at_acceptance: phaseAtAcceptance, // server validates against current date
      p_user_agent: navigator.userAgent,
      p_referrer_url: document.referrer,
      p_notes: 'tower_download',
      p_version_downloaded: downloadedVersion
    });
    // T11: Exchange acceptance_id for signed download URL
    const signedResp = await fetch('/api/download/signed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptance_id: acceptanceId, filename })
    });
    if (signedResp.ok) {
      const { signed_url } = await signedResp.json();
      downloadUrl = signed_url;
    }
  } catch (e) {
    // RPC or signing failure: log best-effort
    // T11: if signed URL unavailable, do NOT fall back to raw CDN URL
    // Instead: show error message asking user to retry
    console.error('license acceptance or signing failed:', e);
    showDownloadError();
    return;
  }
  // Trigger download via signed URL
  const a = document.createElement('a');
  a.href = downloadUrl;
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

**T11 note in technical spec:** Unlike prior version where RPC failure was non-blocking (download proceeded anyway), T11 requires that RPC failure BLOCKS the download. The raw CDN `.exe` URL is not the public-facing download link. If signing fails, user sees error + retry prompt. This is the hard gate.

**`phaseAtAcceptance` is computed client-side from current date using the same Point #3 boundary logic, then server-validated in the RPC against `now()` (anti-spoof — see Block 4).**

**JS-disabled fallback:** plain HTML form POST + server-side signed URL generation (not a "requires JavaScript" dead end). Show a static form with radio and checkbox that POSTs to a server-side endpoint, validates acceptance, issues signed URL, and serves download.

**DEPENDENCY:** Block 4 (Supabase RPC `log_license_acceptance`) must exist before Block 3 JS fires. Knight implements Block 4 first. Additionally, T11 requires a `/api/download/signed` server-side endpoint (Supabase Edge Function or equivalent) that accepts `acceptance_id`, validates it, and returns a time-limited signed URL.

**Truth-Always gate:** Accept button has `disabled` attribute until both radio AND checkbox are satisfied. Direct `.exe` URL does NOT serve the file without a valid signed token or session cookie — verified by T11.

### Estimated effort: 3-5 hours (Hugo template + inline JS + Supabase client integration + signed-URL edge function + T11 server-side gate + JS-disabled fallback form) — increased by 1 hour for T11 server-side gate

---

## BLOCK 4 — Supabase `license_acceptances` Table + RPC (SCHEMA UNCHANGED)

### Source
Additive to Block 3 of the original greenfield yoke. Schema extended: added `build_date` column (prior revision) + `phase_at_acceptance` column (BP090 2026-06-21 ~22:00 revision). **UPDATED 2026-06-22 ~10:50 Central (Change #4):** Two new columns added: `founding_licensee_amount_paid integer nullable` and `founding_licensee_tier text nullable` (e.g., 'tier_1' / 'tier_2' / 'tier_3' / 'tier_4' / 'standard_frand').

### Migration file to create
`C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260621000001_license_acceptances_bp090.sql`

**Supabase target: PRODUCTION (Founder ratified Point #5). Use `CREATE TABLE IF NOT EXISTS` throughout (idempotent).**

### SQL (Postgres only — no SQLite primitives — BP089 Knight SQL Target canon)

```sql
-- BP090 Marathon 11: License acceptance audit table
-- Records every explicit SSPL/Apache license acceptance from the Tower download page
-- and the Electron installer (Block 2 + Block 3 surfaces).
-- Canon anchor: canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086
-- "No silent install. Ever."
-- REVISED BP090 2026-06-21 ~22:00 Central: added phase_at_acceptance column + CHECK constraint.
-- SCHEMA UNCHANGED 2026-06-22: Block 4 schema is stable. T11 gate lives in Block 3 + edge function.

CREATE TABLE IF NOT EXISTS public.license_acceptances (
  id                    uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  accepted_at           timestamptz   NOT NULL DEFAULT now(),
  path_chosen           text          NOT NULL CHECK (path_chosen IN ('SSPL', 'Apache')),
  phase_at_acceptance   text          NOT NULL CHECK (phase_at_acceptance IN (
                                        'soft_launch',
                                        'window_1',
                                        'window_2',
                                        'window_3',
                                        'window_4',
                                        'window_5',
                                        'frand_only'
                                      )),
  ip_hash_optional      text,         -- SHA-256 of client IP, server-computed only, NULLABLE
  user_agent            text,
  mnemo_session_id      text,         -- nullable: peer session_id if user is logged-in peer
  referrer_url          text,         -- where they came from (Tower page, installer, etc.)
  notes                 text,         -- surface identifier: 'tower_download' | 'installer' | etc.
  version_downloaded              text,         -- nullable: e.g. '0.5.17' if derivable from download href
  build_date                      date,         -- nullable: installer build date (for campaign-close gate)
  founding_licensee_amount_paid   integer,      -- nullable: USD amount paid by Founding Licensee (e.g., 1000000, 5000000)
  founding_licensee_tier          text          -- nullable: 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4' | 'standard_frand'
);

-- RLS: anon INSERT only via RPC; service_role SELECT
ALTER TABLE public.license_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_can_insert_acceptance" ON public.license_acceptances
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_can_read_acceptances" ON public.license_acceptances
  FOR SELECT USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_license_acceptances_path
  ON public.license_acceptances(path_chosen);
CREATE INDEX IF NOT EXISTS idx_license_acceptances_accepted_at
  ON public.license_acceptances(accepted_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_acceptances_session
  ON public.license_acceptances(mnemo_session_id)
  WHERE mnemo_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_license_acceptances_phase
  ON public.license_acceptances(phase_at_acceptance);
```

### RPC: `log_license_acceptance` (SECURITY DEFINER — anon-safe — revised with phase validation)

```sql
-- RPC: log_license_acceptance
-- Called from Tower page JS and installer acceptance surface (anon-safe).
-- Server-side validates that p_phase_at_acceptance matches current date per Point #3 table.
-- Anti-spoof: client cannot claim a phase that does not match server-side now().
CREATE OR REPLACE FUNCTION public.log_license_acceptance(
  p_path_chosen           text,
  p_phase_at_acceptance   text,
  p_ip_hash               text    DEFAULT NULL,
  p_user_agent            text    DEFAULT NULL,
  p_mnemo_session_id      text    DEFAULT NULL,
  p_referrer_url          text    DEFAULT NULL,
  p_notes                 text    DEFAULT NULL,
  p_version_downloaded    text    DEFAULT NULL,
  p_build_date            date    DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as postgres, bypasses RLS for insert
AS $$
DECLARE
  v_id            uuid;
  v_server_phase  text;
  v_now           date := CURRENT_DATE AT TIME ZONE 'America/Chicago';
BEGIN
  -- Validate path_chosen
  IF p_path_chosen NOT IN ('SSPL', 'Apache') THEN
    RAISE EXCEPTION 'Invalid path_chosen: %', p_path_chosen;
  END IF;

  -- Validate p_phase_at_acceptance is a known value
  IF p_phase_at_acceptance NOT IN (
    'soft_launch', 'window_1', 'window_2', 'window_3',
    'window_4', 'window_5', 'frand_only'
  ) THEN
    RAISE EXCEPTION 'Invalid phase_at_acceptance: %', p_phase_at_acceptance;
  END IF;

  -- Server-side compute current phase from Point #3 calendar table (anti-spoof)
  v_server_phase := CASE
    WHEN v_now BETWEEN '2026-06-22' AND '2026-06-30' THEN 'soft_launch'
    WHEN v_now BETWEEN '2026-07-01' AND '2026-07-30' THEN 'window_1'
    WHEN v_now BETWEEN '2026-07-31' AND '2026-08-29' THEN 'window_2'
    WHEN v_now BETWEEN '2026-08-30' AND '2026-09-28' THEN 'window_3'
    WHEN v_now BETWEEN '2026-09-29' AND '2026-10-28' THEN 'window_4'
    WHEN v_now BETWEEN '2026-10-29' AND '2026-11-27' THEN 'window_5'
    ELSE 'frand_only'
  END;

  -- Anti-spoof: reject if client-supplied phase does not match server-computed phase
  IF p_phase_at_acceptance != v_server_phase THEN
    RAISE EXCEPTION 'phase_at_acceptance mismatch: client claims %, server computes % for date %',
      p_phase_at_acceptance, v_server_phase, v_now;
  END IF;

  INSERT INTO public.license_acceptances (
    path_chosen,
    phase_at_acceptance,
    ip_hash_optional,
    user_agent,
    mnemo_session_id,
    referrer_url,
    notes,
    version_downloaded,
    build_date
  ) VALUES (
    p_path_chosen,
    v_server_phase,     -- always use server-computed phase, not client-supplied
    p_ip_hash,
    p_user_agent,
    p_mnemo_session_id,
    p_referrer_url,
    p_notes,
    p_version_downloaded,
    p_build_date
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Grant anon execution (Tower page uses anon key)
GRANT EXECUTE ON FUNCTION public.log_license_acceptance TO anon;
```

**Note:** The inserted `phase_at_acceptance` value is always `v_server_phase` (server-computed), never the client-supplied value. This prevents any client-side spoof of the phase field. The client-supplied value is validated only for format and then compared — the canonical record uses the server clock.

### Estimated effort: 2-3 hours (migration file + test psql apply on prod + verify RLS + phase validation test + first 10 SELECT test rows covering all 7 phases)

---

## BLOCK 5 — Mnemosynec.org Single-CTA Join Simplification (NEW — Change #2)

**[NEW BLOCK — Ratified 2026-06-22 morning Central. Founder direct: "While there are multiple doorways into the $5 membership, we need to make it NOT COMPLICATED. One turn-key pay $5 to join needs to be IT for Mnemosynec.org."]**

### What this block is

Mnemosynec.org's role: **one single, turn-key membership path.** Visitor lands on mnemosynec.org → sees "Join the Cooperative · $5/year" → clicks → redirects to lianabanyan.com/join (canonical signup) → completes there. The Stripe flow, the form, the account creation — all of it lives at lianabanyan.com. Mnemosynec.org is the marketing redirect, not the transaction surface.

### Where it lives

Hugo content repo: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`

Affected files (Knight identifies exact paths at execution time):
- `layouts/partials/header.html` (or site-wide nav partial) — add single Join CTA
- `layouts/index.html` or `content/_index.md` — homepage in-body CTA
- Any Hugo content page that currently has a `/membership`, `/red-carpet`, `/signup`, or other alternate join path CTA — Knight identifies all via `grep -r "join\|membership\|signup\|red-carpet" content/` and `layouts/`

### What to build

**1. Header CTA (site-wide, persistent):**

Every page on mnemosynec.org must have this single button in the navigation header:

```html
<a href="https://lianabanyan.com/join" class="btn btn-primary join-cta">
  Join the Cooperative &middot; $5/year
</a>
```

Label verbatim: "Join the Cooperative · $5/year"
Destination verbatim: `https://lianabanyan.com/join`

This is the ONLY join button in the header. No secondary CTAs, no alternate paths in the nav.

**2. In-body CTA (homepage only — one instance):**

Homepage (`content/_index.md` or equivalent) gets one in-body "Join" block, positioned at the primary call-to-action section:

```html
<a href="https://lianabanyan.com/join" class="btn btn-primary btn-large join-cta-hero">
  Join the Cooperative &middot; $5/year
</a>
```

Same label, same destination. One instance. Not repeated below the fold.

**3. Remove or de-emphasize alternate paths:**

Knight runs `grep -rn "membership\|red-carpet\|/signup\|/join" content/ layouts/` in the Cephas Hugo repo and inventories all occurrences. For each:
- If it is a `/membership` or `/red-carpet` or `/signup` Hugo route: Knight does NOT delete the page (may still serve as destination or be linked from lianabanyan.com), but removes any prominent CTA pointing to it from Mnemosynec.org page bodies and navigation
- If it is a secondary "Join" button below a primary one: remove the secondary
- If it is informational text explaining the $5/year membership (not a button): leave in place — content is fine; CTAs are the thing to simplify

**4. What Knight does NOT touch:**
- lianabanyan.com routing or join flow — that is out of scope for this block
- The `/licensing` page "Contact" CTA — that is a licensing inquiry, not a membership join
- Footer links to `lianabanyan.com/join` — footer links are fine and do not count as "alternate paths"

### Acceptance criteria (Block 5)

1. Every page on mnemosynec.org has exactly ONE "Join the Cooperative · $5/year" button in the header, linking to `https://lianabanyan.com/join`.
2. The homepage has exactly ONE in-body join CTA, linking to the same destination.
3. No Hugo page on mnemosynec.org has a prominent join CTA pointing to a path other than `https://lianabanyan.com/join`.
4. Knight verifies via `curl` on 3 representative pages (homepage, /licensing, /about or equivalent): count of join CTA elements per page is 1 (header) or 2 (header + in-body on homepage only). Zero on pages that have no in-body CTA.
5. Knight's `grep` inventory of alternate join paths is documented in the return-to-Bishop log (what was found, what was removed or de-emphasized).

### Estimated effort: 1-2 hours (Hugo partial edit + grep inventory + CTA audit + curl verification)

---

## TRUTH-ALWAYS GATES (MANDATORY — Knight must verify each before return-to-Bishop)

| Gate | Check |
|---|---|
| T1 | `mnemosynec.org/licensing` resolves AND `mnemosynec.org/license` alias resolves to same content (Block 1) |
| T2 | Installer Continue button is disabled until checkbox is checked -- not clickable before check (Block 2) |
| T3 | Download modal Accept button is disabled until BOTH radio selected AND checkbox checked (Block 3) |
| T4 | Every Accept event INSERTs a row in `license_acceptances` -- verified via post-test SELECT returning at least 1 row (Blocks 3 and 4) |
| T5 | Commercial offer amber block is absent from installer builds with BUILD_DATE on or after 2026-11-28 -- build-date gate confirmed in test build (Block 2) |
| T6 | `oneClick: false` change is explicitly documented in v0.6.x release notes as a user-visible behavioral change (Block 2) |
| T7 | **[UNCHANGED]** Soft-launch amber banner (Phase A) does NOT appear before 2026-06-22 or after 2026-06-30. Verified by clock-set test at 2026-06-21 (absent), 2026-06-22 (present), 2026-07-01 (absent -- Phase B active). (Block 1) |
| T8 | **[UNCHANGED]** 5-window decay table active-window highlight and countdown badge auto-shift on date boundaries -- programmatic, not manual. Verified by clock-set test at each window boundary date. (Block 1) |
| T9 | **[UNCHANGED]** After 2026-11-27 (Phase C), amber block and decay table are absent from DOM entirely (not hidden, not collapsed -- absent). Only FRAND copy remains. Verified by clock-set test at 2026-11-28. (Blocks 1 + 2) |
| T10 | **[RESOLVED 2026-06-22]** `[CLOSER_RELATIONSHIP_PERK]` placeholder is RETIRED. Founding Licensee Discount Pool is the canonical perk. Phase A soft-launch build is unblocked. Knight confirms no remaining `[CLOSER_RELATIONSHIP_PERK]` string in any build artifact or Hugo content. |
| T11 | **[NEW -- Change #3 -- HARD GATE]** Direct `.exe` URL must return 403, 401, or 3xx redirect when accessed without a valid signed token or session cookie. Knight verifies by: (1) `curl -I <direct_exe_url>` without token -- must NOT be 200; (2) complete Accept flow -- download succeeds via signed URL; (3) reuse spent signed URL (Option A) -- must return 403. Knight documents implementation approach (signed URL vs cookie gate) in return-to-Bishop. |
| T12 | Existing peer running v0.5.16 sees NO change in their app (gate applies to new downloads only) |
| T13 | JS-disabled browsers: Tower download page shows plain HTML form fallback, NOT a silent fail (Block 3) |
| T14 | `phase_at_acceptance` in `license_acceptances` always reflects server-computed phase, not client-supplied value. Verified by attempting to INSERT with mismatched phase -- RPC raises exception. (Block 4) |
| T15 | **[NEW -- Block 5]** Every page on mnemosynec.org has exactly one join CTA in the header pointing to `https://lianabanyan.com/join`. Verified by Knight via `curl` on at minimum homepage, /licensing, and one additional page. Count of join CTA elements per page = 1 header (all pages) + 1 in-body (homepage only). |
| T16 | **[NEW -- Block 5]** Knight's `grep` inventory of alternate join paths documents all found instances and their disposition (removed, de-emphasized, or left as informational text). Inventory present in return-to-Bishop log. |
| T17 | **[NEW -- Change #1, UPDATED Change #4]** Block 1 Component G Phase A amber block contains Two-Axis Model table verbatim: $1M minimum, Axis 1 amount→% table (5 rows), Axis 2 milestone-tier→duration table, same-day rule, Founding Licensee Status perks, program closure at 10,000 users. Knight verifies against Block 1 spec above. |
| T18 | **[NEW -- Change #1, UPDATED Change #4]** Block 2 Phase A NSIS amber box contains Two-Axis Model content verbatim as specified in Block 2 Phase A above. Knight verifies compiled RTF against spec. |
| T19 | **[NEW -- Change #4]** Supabase `platform_user_count` query executes at Hugo build time AND at edge function call time. Both surfaces serve the same Component G phase HTML for the same user_count range. Knight verifies: (a) Hugo build data file contains current count; (b) edge function query executes; (c) Phase C triggers correctly when count >= 10,000 (staging/mock test). Both surfaces show Phase C (FRAND-only, program closed) when count >= 10,000 regardless of calendar date. |

---

## DEPENDENCIES

| Dependency | Status | Notes |
|---|---|---|
| Supabase RPC `log_license_acceptance` | NEW -- Block 4 | Must ship before Block 3 JS fires |
| Hugo /licensing page live at /licensing and /license | NEW -- Block 1 | Must be live before installer link (Block 2 T1-class check) and download modal fine print link (Block 3) go live |
| `oneClick: false` in NSIS config | RATIFIED (Point #1) | Wizard installer confirmed |
| Dual-EULA installer | RATIFIED (Point #2) | Single installer, SSPL + Apache radio at install time |
| Soft-launch + 5-window decay calendar dates | RATIFIED (Point #3) | See Point #3 table. Canonical for all surfaces. |
| `[CLOSER_RELATIONSHIP_PERK]` copy | RESOLVED 2026-06-22 | Founding Licensee Discount Pool is the canonical perk. T10 unblocked. |
| Tower at `Cephas/cephas-hugo/layouts/download/list.html` | Ratified: Knight verifies (Point #4) | Knight confirms whether amplify-computer also needs Block 3 modal |
| Supabase project target | RATIFIED (Point #5) | PRODUCTION with idempotent `CREATE TABLE IF NOT EXISTS` |
| Campaign close date | RESOLVED (Point #3) | 2026-11-27 is last day of Window 5; 2026-11-28 is FRAND-only start |
| SSPL v1 full text | Source: https://www.mongodb.com/licensing/server-side-public-license | For Block 1 /licensing page and Block 2 installer link |
| Edit 9 + Edit 11 verbatim | RATIFIED (Point #6) | Both BP087 edits ratified; Founder can amend later |
| Founding Licensee Two-Axis Model | RATIFIED 2026-06-22 ~10:50 Central | Supersedes Discount Pool; verbatim from this yoke; present in Block 1 Phase A + Block 2 Phase A |
| T19 platform_user_count Supabase query | NEW -- Change #4 | Query at Hugo build time (data file) + edge function runtime; both surfaces must agree on phase HTML |
| T11 signed-URL or cookie-gate edge function | NEW -- Block 3 | Knight implements; documents chosen approach in return |
| Mnemosynec.org join CTA simplification | NEW -- Block 5 | Knight grep-inventories + implements single-CTA pattern |

---

## RETURN-TO-BISHOP SPEC

Knight Marathon 11 returns on completion:

1. Each block's commit hash (5 commits minimum, one per block)
2. Verification log per Truth-Always gate (T1-T18 pass/fail table with evidence)
3. URLs of live /licensing page (both /licensing and /license alias verified)
4. SHA256 of new installer build containing Block 2 click-through screen (Phase A soft-launch build with Two-Axis Model content -- T10 unblocked, Change #4 applied)
5. First 10 SELECT rows from `license_acceptances` test inserts (showing both 'SSPL' and 'Apache' path_chosen rows, at least 3 distinct phase_at_acceptance values, both 'tower_download' and 'installer' notes; at least 1 row with founding_licensee_tier populated if test data available)
6. Confirmation that no `[CLOSER_RELATIONSHIP_PERK]` string remains in any build artifact or Hugo content (T10 resolved); confirmation that no Discount Pool ($20M pool / 60%/40%/20%) language appears on any public surface (Change #4 supersede)
7. T11 implementation approach documented (signed URL vs cookie gate -- which was used and why)
8. Result of `curl -I <direct_exe_url>` without token (must show non-200 status)
9. Block 5 grep inventory of alternate join paths (what was found, what was done)
10. Any deviations from this spec (with reasoning) flagged to Bishop before shipping

---

## ESTIMATED WALL-CLOCK (revised 2026-06-22 ~10:50 Central — Change #4 + T19)

| Block | Description | Est. Time |
|---|---|---|
| Block 4 | Supabase migration + `phase_at_acceptance` column + two new columns (`founding_licensee_amount_paid`, `founding_licensee_tier`) + RPC with server-side date validation + RLS + test on prod | 2-3 hours |
| Block 1 | Hugo /licensing page authoring + 3-phase programmatic gate JS + Component G Phase A with Two-Axis Model table + decay table + FRAND-only state + design tokens + T19 platform_user_count Supabase query at build time + edge function runtime parity | 4-5 hours |
| Block 2 | NSIS custom dual-EULA page + electron-builder.yml + 3-phase build-date script + Phase A Two-Axis Model amber content + license text packaging | 2-3 hours |
| Block 3 | Download modal JS + Supabase RPC client integration + phase param + T11 server-side gate (signed-URL edge function or cookie gate) + JS-disabled fallback | 4-5 hours |
| Block 5 | Mnemosynec.org single-CTA simplification: grep inventory + header CTA + homepage in-body CTA + de-emphasize alternates + curl verification | 1-2 hours |
| Testing + Truth-Always gate verification | All 19 gates (T1-T19) | 2-3 hours |
| **Total** | | **15-21 hours** |

Single Knight session. Sequential blocks recommended: Block 4 first (Supabase), then Block 1 (Hugo /licensing page), then Block 2 (installer), then Block 3 (download modal + T11), then Block 5 (Mnemosynec.org CTA), then test all gates.

**NOTE: Soft-launch Phase A (Block 1 + Block 2) is NOW UNBLOCKED. T10 is resolved. Founding Licensee Two-Axis Model (Change #4 FINAL) is the canonical perk content. Knight may compile and deploy Phase A immediately. Discount Pool model is SUPERSEDED — do not use it on any public surface.**

---

## CANON ANCHORS

This Marathon is grounded in (BP087 prior-spec additions in **bold**; BP090 additions in ***bold italic***):

- **`canon_android_of_ai_licensing_model_sspl_base_apache_library_pledge_2260_patent_upekrithen_llc_bp087` -- the four-layer licensing structure governing Block 1 table content, Block 2 text, and Block 3 radio distinction**
- **`canon_30_day_50_percent_commercial_license_offer_letter_campaign_ai_companies_sspl_section_13_forcing_function_bp087` -- the 5-window decay schedule (§3.5) driving Block 1 Component G and Block 2 amber notice verbatim; calendar-instantiated per Point #3**
- **`canon_folder_tier_licensing_free_for_non_profits_licensed_for_all_others_android_of_ai_content_layer_refinement_bp087` -- the Tier A / Tier B distinction governing Block 3 radio path language**
- **`MNEMOSYNEC_ORG_COPY_EDITS_BP087.md` Edit 9 (installer click-through) -- verbatim source for all Block 2 text blocks, checkbox label, and Continue button behavior**
- **`MNEMOSYNEC_ORG_COPY_EDITS_BP087.md` Edit 11 (/licensing page) -- verbatim source for Block 1 front matter, 9 sections, and 9 acceptance criteria**
- `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086` -- "No silent install. Ever." The license gate is the download-time and install-time equivalent of the MIC consent model.
- `canon_cai_bonfire_project_spinout_17_standalone_above_sweet_16_sspl_ollama_bp086` -- SSPL v1 + Pledge #2260 is the canonical cooperative license; Apache 2.0 is the explicit enterprise fork path.
- `canon_join_modal_benefits_over_barrier_copy_bp085` -- "Just let me join." Single $5/year path. Mnemosynec.org Block 5 simplification is the public site instantiation of this canon.
- §15 BLOOD (Bishop's §15 Supabase-direct authority): Bishop composes the SQL spec; Knight executes psql.
- KNIGHT SQL TARGET canon (BP089): all SQL is Postgres-only. `gen_random_uuid()`, `TIMESTAMPTZ`, no SQLite primitives.

---

**BP090 · 2026-06-22 · BISHOP_DROPZONE -- REFACTORED (FOURTH PASS, ~10:50 Central) · DO NOT EXECUTE WITHOUT FOUNDER RATIFY**
**Changes in this pass:** Change #1 (Discount Pool model in Block 1 Component G + Block 2 Phase A), Change #2 (Block 5 Mnemosynec.org single-CTA), Change #3 (T11 server-side .exe gate in Block 3), T10 RESOLVED; Change #4 (Two-Axis Model SUPERSEDES Discount Pool, T19 NEW, Block 4 schema two new columns, wall-clock 15-21h).
**Source:** Prior 3-pass yoke + Founder-direct ratified changes 2026-06-22 morning Central + Founder-direct ratified Change #4 2026-06-22 ~10:50 Central.
**T10 STATUS: RESOLVED. No remaining `[CLOSER_RELATIONSHIP_PERK]` placeholder. Soft-launch Phase A is unblocked.**
**CHANGE #4 STATUS: RATIFIED. Discount Pool model is SUPERSEDED. Two-Axis Model is FINAL. Program closes at 10,000 platform users.**
