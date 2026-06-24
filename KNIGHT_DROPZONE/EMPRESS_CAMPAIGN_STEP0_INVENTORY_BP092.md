# EMPRESS CAMPAIGN STEP 0 INVENTORY — BP092
**Knight:** Sonnet 4.6 · 2026-06-23
**Branch:** knight-mamba-phoenix-flight-bp092

---

## STEP 0-A · brief_me
STATUS: SKIPPED — Librarian MCP brief_me call not executed (knight-bishop-bridge checked; using direct dispatch). Context loaded from dispatch.

## STEP 0-B · Canon Eblet Glob
STATUS: NOT EXECUTED — non-blocking; proceeding per dispatch fast-test methodology.

## STEP 0-C · Live Hugo Site Reachability
```
https://mnemosynec.org → HTTP 200 ✅ PASS
https://mnemosynec.ai  → NOT CHECKED (non-blocking per dispatch)
```

## STEP 0-D · Supabase Connectivity
```
psql $SUPABASE_DB_URL -c "SELECT table_name FROM information_schema.tables..."
Result: Query returned rows without error ✅ PASS
```

## STEP 0-E · version_trust.json Current Version
```
File: Cephas/cephas-hugo/data/version_trust.json ✅ EXISTS
Current latest version: 0.7.1 (tier: latest, release_date: 2026-06-23)
Notes: M25: Alpha Banner · Bounties Page · I12 IP Ledger Postgres schema + Stamp-Certify + Ring Bearer + Mesh Diff Loop
```

## STEP 0-F · Empress Schema Check (information_schema — not \dt)
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name LIKE 'empress_%' ORDER BY table_name;
```
Result:
```
empress_cohorts
empress_prize_eligibility
empress_proposals
empress_votes_ghost
empress_votes_real
(5 rows) ✅ PASS — all Bishop pre-applied schema LIVE
```

## STEP 0-G · Wildfire Cue Deck Card Schema
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name='wildfire_cue_deck_cards';
Result: (0 rows) → NOT_FOUND
```
**Block 5 path:** Create stub schema.

## STEP 0-H · Edge Functions Currently Deployed
```
supabase functions list --project-ref ruuxzilgmuwddcofqecc
empress-ip-ledger-hook: NOT DEPLOYED (to be created Block 2)
vote-empress: NOT DEPLOYED (to be created Block 4)
mic-broadcast: ACTIVE ✅ (version 7 — 2026-06-21)
```

## STEP 0-I · Geo-IP Infra Check
```
Grep: platform/supabase/ for geoip|geo_ip|ip_location|country_code
Result: NO MATCHES → NOT_FOUND
```
**Block 7 path:** Add country_local self-declare dropdown to proposal submission form.

## STEP 0-J · Referral Codes Schema Check
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name='referral_codes';
Result: (0 rows) → NOT_FOUND
```
**Block 6 path:** Create stub referral_codes table via migration.

## ADDITIONAL — ip_ledger Postgres Table
```
ip_ledger table: EXISTS ✅
Columns: id (uuid), ring_bearer_id (uuid), entry_type (text), payload_hash (text),
         payload_json (jsonb), ed25519_sig (text), stamp_seq (bigint), stamped_at (timestamptz),
         merkle_node (text), replicated_at (timestamptz)
```
Edge function Block 2 will write to this Postgres ip_ledger table (not the local JSONL store).

---

## BLOCK 1 — SCHEMA VERIFICATION GATE
Bishop pre-applied migrations: CONFIRMED LIVE
- empress_cohorts ✅
- empress_proposals ✅
- empress_votes_real ✅
- empress_votes_ghost ✅
- empress_prize_eligibility ✅ (VIEW)

**BLOCK 1 RESULT: PASS — Proceeding to Block 2**

---

*Written: 2026-06-23 · Knight · BP092*
