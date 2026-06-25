# KNIGHT YOKE · Battery Dispatch Ready-to-Fire · Pre-Morning Verification · BP084

**Session:** BP084
**Date:** 2026-06-15 (overnight)
**Founder ratify:** DIRECT — *"I need you to give knight a prompt to have ALL of battery dispatch ready to run in the morning"*

**Goal:** When Founder wakes up, every Battery Dispatch adapter is DRY-RUN-verified ready. Every content piece is staged with metadata correct. The ONLY thing standing between Founder and publish is his per-piece explicit ratify per BP078 explicit-ratify-before-publish HARD BINDING.

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only · NEVER publish

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

**ABSOLUTE GUARDRAIL — BP078 BLOOD CANON:**
**NOTHING PUBLISHES. NOT A POST. NOT AN EMAIL. NOT A TWEET. NOT A DRAFT-TO-PRODUCTION-WEBHOOK. NOT A SCHEDULED FIRE. ZERO.**

Every adapter must be set to DRY-RUN mode for verification. Knight's job is to VERIFY READINESS, not to publish. Founder fires each piece individually in the morning. Any attempt to publish during this yoke is a HARD violation.

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## SEG-1 — Verify all 6 adapter implementations (Sonnet 4.6 SEG)

Per BP082 canon `canon_battery_dispatch_v030_publish_fanout_bp082` — six adapters in `src/main/dispatch/`:

1. `cephas_adapter.ts` — Hugo + Firebase, full-auto
2. `platform_adapter.ts` — React + Firebase, full-auto
3. `substack_adapter.ts` — browser-fallback primary (FounderDenken)
4. `medium_adapter.ts` — browser-fallback primary
5. `hn_adapter.ts` — semi-auto browser-open only
6. `gmail_adapter.ts` — Gmail API + browser-fallback

For EACH adapter:
- Verify file exists at canonical path
- Verify exports the standard interface (`prepare()`, `dryRun()`, `fire()` — or whatever the actual API surface is — match what's there)
- Verify `fire()` is GATED by an explicit-ratify-token argument (BP078 enforcement at the code level)
- Verify it accepts the standard `DispatchPayload` shape
- Run `prepare()` against a test piece — confirm no exceptions
- Run `dryRun()` against a test piece — confirm it returns a preview without side effects

If ANY adapter is missing the explicit-ratify gate at the code level, FLAG IT IMMEDIATELY and do not proceed with that adapter's verification.

---

## SEG-2 — Verify credential state (Sonnet 4.6 SEG)

Read `BISHOP_DROPZONE\BATTERY_DISPATCH_FOUNDER_CREDENTIALS_BP082.md`. For each platform, check current state:

| Platform | Required cred | State to verify |
|---|---|---|
| Cephas Hugo | Firebase service account (already in env) | `firebase use lianabanyan-403dc` returns OK |
| lianabanyan.com React | Firebase service account | same |
| Substack | session cookie | check `dispatch_state.json` or wherever Substack auth state lives |
| Medium | integration token OR browser fallback config | check token file or fallback config |
| Gmail | OAuth refresh token | check `WORKING_KEYS.env` for `GMAIL_OAUTH_REFRESH_TOKEN` (canonical) OR `22May2026.env` if migrated |
| HN | username (semi-auto only) | check config |

Truth-Always report per platform:
- ✅ READY — credential present + verified
- ⏳ NEEDS_FOUNDER — Founder must complete one-time setup (state exactly what Founder must do in 1-2 sentences)
- 🟡 PARTIAL — present but expired/unverified
- ❌ MISSING — not present

DO NOT ATTEMPT TO SET CREDENTIALS. Knight has no business touching those (HARD BINDING per BP081 secrets blood-statute).

---

## SEG-3 — Stage Wave 1 content for ratify (Sonnet 4.6 SEG)

Per `librarian-mcp-public\preload\outreach\opening_gambit_v2.md` + the Canada 40K yoke-return — Wave 1 now leads with Canada 40K open letter, followed by Crown Letters.

For EACH Wave 1 piece, verify:
- Content file exists at canonical path
- Frontmatter present and correct
- `status: founder-ratify-pending` set (no surprise auto-publishes)
- `mimic-trunk-eligible: true` flag present where applicable
- All required template variables filled (no `{{FIRST_NAME}}` placeholders left)
- Sender identity correct per BP080 member-id canon (canonical Founder signature, no Wyoming tail per §5)

Items to verify (in canonical Wave 1 order):

1. Canada 40K open letter (NEW FIRST ANCHOR — public broadcast)
2. MacKenzie Scott Crown Letter (Apr 22-23 window per Opening Gambit v2)
3. Muhammad Yunus Blessing Letter
4. Craig Newmark Crown Letter (v4)
5. Dale Dougherty Crown Letter
6. Ruth Glenn Crown Letter
7. Robert Kaiser Crown Letter
8. Sal Khan Crown Letter
9. Michael Seibel Crown Letter
10. Trebor Scholz Crown Letter (V13)
11. Tom Simon CFO candidate Crown Letter
12. Kimberly Williams Crown Letter
13. Olaf Scholz Crown Letter
14. Warren Buffett Letter
15. Melinda French Gates Crown Letter
16. Cory Doctorow Letter (V03 or V04 per canon)
17. Tatiana Schlossberg Memorial Lane Letter

For Canada 40K V02 Play/Stage + Companion: flag `founder-ratify-pending` honestly — these were reconstructed from V01 + transcript per Canada 40K yoke return, NOT verbatim from BP064.

---

## SEG-4 — Stage Substrate Awakens 7 marketing drafts for ratify (Sonnet 4.6 SEG)

Per the Substrate Awakens yoke return — 7 marketing drafts at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\SUBSTRATE_AWAKENS_MARKETING_WAVE\`:

1. Substack/FounderDenken T-7 anchor post
2. Medium T-7 cross-publish (canonical-link footer to Substack)
3. Cephas + lianabanyan.com banner
4. Show HN T-5
5. Reddit r/LocalLLaMA T-5
6. Reddit r/MachineLearning T-5
7. Battery Dispatch T-1 reminder fanout

For each: verify file exists, `status: founder-ratify-pending` set, "Saturday-ish — we ship when she wakes up clean" framing present per canon.

---

## SEG-5 — Wire each piece into the Battery Dispatch UI queue (Sonnet 4.6 SEG)

For each piece from SEGs 3 + 4:
- Register in the dispatch queue (the data structure Battery Dispatch reads at fire time)
- Mark `ratify_state: pending` so the UI shows it as "awaiting Founder"
- Mark dispatch channels per content type:
  - Open letters (Canada 40K) → Cephas + Substack + Medium (sequential per `reference-substack-anchored-sequential-publish-order-bp083`)
  - Crown Letters → Gmail (single recipient) + Cephas mirror
  - Substack post → Substack only
  - Show HN → HN only
  - Reddit → r/LocalLLaMA + r/MachineLearning (separately)
  - Battery Dispatch T-1 → all of the above as a final reminder fanout

DO NOT fire. Stage only.

---

## SEG-6 — DRY-RUN smoke test EVERY piece end-to-end (Sonnet 4.6 SEG)

For each piece in queue, exercise `adapter.dryRun(piece)` — which should:
- Render the post against the target's template
- Return the rendered output as text/JSON to a dry-run inspection file at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\DISPATCH_DRY_RUNS\{piece_id}__{platform}.txt`
- Confirm no errors, no missing template variables, no broken links
- NEVER hit the live platform endpoint

Founder can read each dry-run file in the morning, see EXACTLY what would publish, and ratify.

---

## SEG-7 — Build the Pre-Fire Checklist for Founder (Sonnet 4.6 SEG)

Single canonical file: `BISHOP_DROPZONE\00_FOUNDER_REVIEW\BATTERY_DISPATCH_PRE_FIRE_CHECKLIST_BP084.md`

Sections:
1. **Adapter state matrix** (table from SEG-1)
2. **Credential state matrix** (table from SEG-2)
3. **Wave 1 content roster** (table from SEG-3 — green/yellow/red per piece)
4. **Substrate Awakens marketing drafts roster** (table from SEG-4)
5. **Dry-run inspection links** (one row per piece → dry-run file path)
6. **5 open Canada 40K ratify gates** (G1-G5 from Canada 40K yoke-return)
7. **What Founder must do before ANY fire** (numbered checklist):
   - Read each `status: founder-ratify-pending` piece
   - For each, inspect the dry-run file
   - For each, mark `ratify_state: approved` in the Battery Dispatch UI
   - For each, click "Fire this piece" individually
8. **What is BLOCKED right now** (anything that NEEDS Founder action before firing)

Bottom of the file: a one-line summary: *"X pieces ready / Y pieces blocked. First fire candidate: <piece>. Estimated full Wave 1 fire time: <minutes if all approved>."*

---

## SEG-8 — Truth-Always Sharps (Sonnet 4.6 SEG)

- Sharp 1: All 6 adapters import without error
- Sharp 2: `fire()` on each adapter requires an explicit `ratifyToken` argument (compile-time check via grep)
- Sharp 3: Zero pieces have `status: published` or `ratify_state: approved` after this yoke (Knight DID NOT publish anything)
- Sharp 4: Every Wave 1 piece has a `*__dry_run.txt` file in BISHOP_DROPZONE
- Sharp 5: Every Substrate Awakens marketing draft has a `*__dry_run.txt` file
- Sharp 6: Pre-Fire Checklist exists at canonical path and renders without errors
- Sharp 7: No live network calls to Substack, Medium, HN, Gmail send endpoints during yoke (grep dispatch_log)
- Sharp 8: No git push of any auto-publish content (the only commits Knight makes are dry-run files + checklist)

---

## SEG-9 — Final yoke-return + bedside read (Sonnet 4.6 SEG)

Yoke-return at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_BATTERY_DISPATCH_READY_TO_FIRE_BP084.md` with:
- All SEG statuses + commits + verbatim "Sonnet 4.6"
- Pre-Fire Checklist file path
- One-paragraph bedside read: *"Good morning Founder. Battery Dispatch is staged. X pieces are GREEN-ready (you just ratify + fire). Y pieces are YELLOW (need {specific Founder action}). Z pieces are RED (need {specific blocker resolved}). Recommended first fire: <piece>. Recommended fire order today: <ordered list>. Truth-Always: nothing published overnight."*

Send yoke-return pearl to Bishop via bridge.

---

## Bishop reminder

When Founder wakes:
- Open the Pre-Fire Checklist
- Read the bedside read
- For each piece he wants to publish: read its dry-run file → if good, ratify + fire individually
- If anything looks wrong, paste the issue to Bishop and we fix before firing

Per BP078 BLOOD: NOTHING fires without his explicit per-piece ratify. Even Knight asking "should I fire all GREEN pieces?" violates the canon. Founder fires.

---

**FOR THE KEEP.**

Battery Dispatch staged. Founder fires. Truth-Always.
