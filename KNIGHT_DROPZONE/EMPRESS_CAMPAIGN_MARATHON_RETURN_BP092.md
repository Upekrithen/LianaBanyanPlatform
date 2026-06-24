# EMPRESS CAMPAIGN MARATHON RETURN — BP092
**Knight:** Sonnet 4.6 · 2026-06-23
**Branch:** knight-mamba-phoenix-flight-bp092

---

## STEP 0 GADGET RESULTS (10/10)

| Gadget | Result |
|--------|--------|
| 0-A brief_me | SKIPPED — fast-test mode; context loaded from dispatch |
| 0-B Canon Eblet Glob | SKIPPED — non-blocking |
| 0-C mnemosynec.org reachability | ✅ HTTP 200 |
| 0-D Supabase connectivity | ✅ PASS — queries return without error |
| 0-E version_trust.json | ✅ EXISTS — v0.7.1 current |
| 0-F Empress schema check | ✅ PASS — all 5 objects LIVE (cohorts, proposals, votes_real, votes_ghost, prize_eligibility VIEW) |
| 0-G wildfire_cue_deck_cards | NOT_FOUND → Block 5 stub path taken |
| 0-H Edge functions deployed | empress-ip-ledger-hook: NOT deployed → created Block 2 · vote-empress: NOT deployed → created Block 4 |
| 0-I Geo-IP infra | NOT_FOUND → Block 7 self-declare dropdown path taken |
| 0-J referral_codes | NOT_FOUND → Block 6 stub path taken |

---

## BLOCK RESULTS

### Block 1 — Schema Verification: ✅ PASS
Bishop §15 BLOOD pre-applied migrations verified LIVE via information_schema (no \dt PowerShell escape issues).
All 5 empress objects confirmed: empress_cohorts, empress_proposals, empress_votes_real, empress_votes_ghost, empress_prize_eligibility VIEW.
empress_proposals.member_id → member_profiles(id) [not a "members" table — verified FK].

### Block 2 — IP Ledger Write Hook: ✅ DEPLOYED
File: `platform/supabase/functions/empress-ip-ledger-hook/index.ts`
- SHA-256 hash of deterministic JSON payload
- Ed25519 sign (EMPRESS_LEDGER_SIGNING_KEY env; logs warning + proceeds unsigned if missing)
- INSERT ip_ledger (entry_type='empress_proposal', ring_bearer_id=member_id, payload_hash, payload_json, stamped_at)
- UPDATE empress_proposals SET ip_ledger_hash
- MIC broadcast (signed per canon_mic_stamped BP086)
- Deployed → ACTIVE v1 on ruuxzilgmuwddcofqecc

### Block 3 — Hugo Pages: ✅ LIVE
Pages created:
- `content-mnemosynec/empress.md` → `https://mnemosynec.org/empress/` → HTTP 200 ✅
- `content-mnemosynec/court.md` → `https://mnemosynec.org/court/` → HTTP 200 ✅
- `content-mnemosynec/court-influencers.md` → `https://mnemosynec.org/court-influencers/` → HTTP 200 ✅

Layouts:
- `layouts/partials/empress-page.html` — all 4 tagline zones, scroll-links, proposal form with country_local
- `layouts/partials/court-page.html` — 18-row leaderboard, 30s auto-rotate, vote buttons, all 4 tagline zones
- `layouts/_default/empress.html`, `court.html`, `court-influencers.html` — Hugo wrappers
- `layouts/partials/wildfire-empress-card.html` — empress_proposal card type

Homepage: "The Court →" button added to nav row. CONFIRMED in live HTML.

Hugo build: 62 pages · 0 errors · exit_code 0.
Firebase deploy: 6 new files uploaded → release complete.

### Block 4 — vote-empress Edge Function: ✅ DEPLOYED
File: `platform/supabase/functions/vote-empress/index.ts`
- Auth detection: JWT → member flow; no JWT → ghost flow
- Member flow: existing-vote check + marks check (member_currency_balances WHERE currency='marks') + INSERT empress_votes_real + increment real_votes + deduct marks
- Ghost flow: daily allowance check (GHOST_DAILY_ALLOWANCE=500 default) + INSERT empress_votes_ghost + increment ghost_votes
- 409 on already_voted · 402 on insufficient_marks · 429 on ghost_limit_reached
- Deployed → ACTIVE v1

### Block 5 — Wildfire Cue Deck Integration: ✅ STUB CREATED
wildfire_cue_deck_cards table did not exist → created stub via migration 20260623220001.
`layouts/partials/wildfire-empress-card.html` created for empress_proposal card_type.
Full Wildfire Marathon = separate dispatch. Stub only.

### Block 6 — Referral Scaffold: ✅ STUB CREATED
referral_codes table did not exist → created stub via migration 20260623220002.
§17 fix applied: REFERENCES member_profiles(id) (not "members" — table does not exist).
Court page JS: reads ?ref= URL param → increments referral click_count.
`content-mnemosynec/court-influencers.md` created and live at HTTP 200.

### Block 7 — Country Detection: ✅ SELF-DECLARE PATH
Geo-IP infra NOT found in platform/supabase/.
country_local self-declare dropdown added to empress proposal form (60+ ISO 3166-1 alpha-2 codes).
empress_proposals.country_local already TEXT — no migration needed.

### Block 8 — Deploy-All Gate: ✅ PASS
Edge functions: empress-ip-ledger-hook ACTIVE v1 · vote-empress ACTIVE v1.
HTTP 200: /empress/ · /court/ · /court-influencers/ · / (homepage).
"The Court →" button CONFIRMED in live homepage HTML.
version_trust.json: NOT bumped — v0.7.1 current. Bump decision → Founder per Block 8-D.

---

## S2B FLAGS FOR BISHOP

1. **EMPRESS_LEDGER_SIGNING_KEY not provisioned** — empress-ip-ledger-hook will write unsigned entries until Founder provisions this env var in Supabase dashboard → Settings → Edge Functions → Secrets.
2. **OQ-1 Ghost allowance** — GHOST_DAILY_ALLOWANCE=500 default in vote-empress. Awaits Founder confirm via dashboard env var.
3. **marks balance** — member_currency_balances WHERE currency='marks' is the lookup. Verify marks are being accrued there for real members before go-live.
4. **empress_proposals INSERT needs auth via RLS** — /empress/ page POSTs directly to REST API with member JWT. RLS policy INSERT=authenticated is live per Bishop schema — test with a real member account before full launch.
5. **OQ-9 appearance_image_url** — form uses external URL (option b, simpler). If Founder wants Supabase Storage bucket, that's a follow-on task.
6. **OQ-6 empress_cohorts** — table exists but no cohort rows inserted. Campaign start = ASAP per locked OQ-6. Bishop should INSERT initial cohort row (cohort_id, start date, etc.) to make the campaign officially "live."
7. **Minor Council moderation pipeline** — empress_proposals INSERT sets status='pending' but no Minor Council auto-review flow is wired. Proposals need manual approval (UPDATE status='approved') before they appear on The Court leaderboard. Bishop should arrange initial moderation setup.
8. **P3 5% cap stub** — vote-empress has a TODO comment for the 5% per-project ownership cap (OQ-5 Q8 rule). Full enforcement = sibling SEG Q8 work item. Currently no cap enforced.

---

## OPEN QUESTIONS SURFACED DURING BUILD

- **OQ-NEW-1**: empress_proposals INSERT RLS test — does direct REST POST with anon JWT work for the proposal submission form, or does the client need a dedicated edge function to handle the submission (for ledger hook trigger)?
- **OQ-NEW-2**: Is the empress-ip-ledger-hook intended to be a Supabase DB webhook trigger (fires on empress_proposals INSERT), or called manually from a submission edge function? Currently deployed as a standalone function — DB webhook needs to be configured in Supabase dashboard.
- **OQ-NEW-3**: vote-empress increment of real_votes/ghost_votes uses an RPC fallback. RPCs `increment_empress_real_votes` and `increment_empress_ghost_votes` do not exist yet. The fallback (read-then-write) is a race condition risk under load. Bishop/Founder should confirm whether to create these RPCs or use Postgres `FOR UPDATE` locking.

---

## ELECTRON_TOUCHED TOTAL: NO (all P3 blocks)
P7 HOLD: v0.7.2 NOT fired. P3 complete.

---

## COMMIT PENDING
Files staged for commit on branch knight-mamba-phoenix-flight-bp092.

*Written: 2026-06-23 · Knight · BP092 · FOR THE KEEP!*
