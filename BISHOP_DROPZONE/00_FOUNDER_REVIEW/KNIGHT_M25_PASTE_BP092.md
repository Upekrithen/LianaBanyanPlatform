# KNIGHT M25 PASTE PROMPT — BP092
# Copy the section below verbatim into Knight's wake message.
# Two variants: M25a (Hugo only, ~2-3 hr) and M25b (IP Ledger code, ~7-10 hr).
# Fire M25a first. M25b fires after Founder ratifies OQ-3 (Bishop §15 BLOOD migrations).

---

## M25a PASTE (Hugo work — Alpha Banner + Bounties Page)

---

You are Knight. Bishop SEG Sonnet 4.6 · BP092 · Caithedral™ · §14 §15 §17 BLOOD.

**CANON CARRY — read before any Block:**
1. Postgres-only: gen_random_uuid() · TIMESTAMPTZ · BIGSERIAL · BYTEA — no SQLite (canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)
2. version_trust.json is the canonical Hugo Tower data source — NOT version.json (canon_hugo_tower_version_data_source_is_version_trust_json_bp090)
3. Knight is the OPERATOR Mechanic — you execute. Bishop composes dispatches. No Bishop-direct Hugo/Firebase deploys (canon_knight_is_operator_mechanic_bp089)
4. Fast-test methodology: Hugo Blocks use 1-page Founder walkthrough smoke, not 42Q sweep
5. MIC per-Block-close: stamp each Block close to MIC_M25_BLOCK_LOG.md in BISHOP_DROPZONE/00_FOUNDER_REVIEW/
6. Current latest version: v0.7.0 (shipped M24, Firebase deploy in flight at M24 close)

**YOUR TASK — M25a: Hugo Alpha Banner + Bounties Page**

Full dispatch at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_M25_ALPHA_BANNER_BOUNTIES_IP_LEDGER_BP092.md`

Read the dispatch file FIRST. Then execute PRE-BLOCK + BLOCK 1 + BLOCK 2 only.

**Hugo site repo:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\`
**Theme:** PaperMod (both sites)
**mnemosynec.org build:** `hugo --config config-mnemosynec.toml` → publishDir `public-mnemosynec` → `firebase deploy --only hosting:mnemosyne`
**cephas.lianabanyan.com build:** `hugo` → publishDir `public` → `firebase deploy --only hosting:cephas`

**BLOCK 1 — Alpha Banner:**
- Create `layouts/partials/alpha-banner.html` with amber (#f59e0b) dismissible banner
- mnemosynec.org copy: `PUBLIC ALPHA · Build Log Live · v0.7.0`
- cephas.lianabanyan.com copy: `Cooperative Substrate · ALPHA · Members Welcome`
- Dismissible via localStorage (`lb_alpha_dismissed`)
- Injection: override `layouts/_default/baseof.html` (copy from PaperMod theme, add `{{- partial "alpha-banner.html" . -}}` as first element inside `<body>`)
- Smoke: `hugo serve --config config-mnemosynec.toml` → load localhost → verify banner renders above nav → dismiss → verify hidden → verify localStorage persists

**BLOCK 2 — Bounties Page:**
- Create `data/bounties.json` (full seed in dispatch file — 5 open bounties, 3 tiers)
- Create `content-mnemosynec/bounties/_index.md` (front matter per dispatch)
- Create `layouts/bounties/list.html` (data-driven template per dispatch)
- Add top nav entry "Join the Team" → `/bounties/` in config-mnemosynec.toml (if Founder ratified OQ-2 = top nav; default: YES add it)
- Smoke: `hugo serve --config config-mnemosynec.toml` → load `/bounties/` → verify all 5 bounties render with correct tier colors (ULTRA=amber, CORE=green, NANO=gray)

**Block close each Block:** Append to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MIC_M25_BLOCK_LOG.md`

DO NOT proceed to BLOCK 3 (IP Ledger schema) — that is M25b, fires after Bishop §15 BLOOD migrations.

Caithedral™ · §14 §15 §17 BLOOD · Postgres-only · Sonnet 4.6 · BP092

---

## M25b PASTE (IP Ledger code — BLOCK 3 through BLOCK 8)

**FIRE ONLY AFTER:**
- M25a smoke receipts confirmed (BLOCK 1 + BLOCK 2 PASS)
- Founder ratified OQ-3 = Y (Bishop pre-applies §15 BLOOD migrations)
- Bishop posts migration receipt to BISHOP_DROPZONE/00_FOUNDER_REVIEW/BISHOP_BLOCK3_MIGRATION_RECEIPT_BP092.md

---

You are Knight. Bishop SEG Sonnet 4.6 · BP092 · Caithedral™ · §14 §15 §17 BLOOD.

**CANON CARRY — read before any Block:**
1. Postgres-only: gen_random_uuid() · TIMESTAMPTZ · BIGSERIAL · BYTEA — no SQLite (canon_knight_sql_target_postgres_syntax_only_no_sqlite_primitives_bp089)
2. Knight is the OPERATOR Mechanic — you execute. Bishop composes. No autonomous psql migrations unless §15 explicitly delegated (OQ-3 = Y, Bishop pre-applied) (canon_knight_is_operator_mechanic_bp089)
3. Fast-test methodology: 3-Q smoke per code Block end (canon_fast_tests_recalibrate_fast_tests_iterative_methodology_bp092)
4. MIC per-Block-close: stamp each Block close to MIC_M25_BLOCK_LOG.md
5. LAN-as-WAN constraint: ALL peer traffic via relay.lianabanyan.com — no LAN shortcuts (canon_lan_as_wan_test_mode_4_machine_mesh_bp085)
6. Battery-aware default OFF: mesh diff loop pauses when on battery (OQ-5 = Y unless Founder overrides)
7. Existing JSONL store at src/main/ip_ledger/ip_ledger_store.ts is UNTOUCHED — new Postgres schema is ADDITIVE
8. Thorax Ed25519 library at src/main/thorax/ed25519_keypair.ts exports getOrCreateKeypair() — REUSE, do not re-implement Ed25519
9. version_trust.json is canonical Hugo version data source (canon_hugo_tower_version_data_source_is_version_trust_json_bp090)
10. Current latest version: v0.7.0 (M24 shipped). M25b ships as v0.7.1 (pending OQ-4 ratify)
11. Close keeps mesh alive, Quit exits (canon_close_keeps_mesh_alive_quit_exits_two_button_semantic_bp092) — mesh_diff_loop stops only on Quit

**YOUR TASK — M25b: I12 IP Ledger BLOCK 3 through BLOCK 8**

Full dispatch at:
`C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_MARATHON_M25_ALPHA_BANNER_BOUNTIES_IP_LEDGER_BP092.md`

Read the full dispatch file FIRST. Then execute BLOCK 3 through BLOCK 8.

Bishop has already applied the Postgres migrations (BLOCK 3 schema). Verify with:
```
psql $DATABASE_URL -c "\d ip_ledger_entries"
psql $DATABASE_URL -c "\d ip_ledger_merkle_diff"
```
If tables are missing, STOP and escalate to Bishop before proceeding.

**Files to create:**
- `src/main/ip_ledger/schema.sql` (document the applied migration — write the file even though Bishop applied it)
- `src/main/ip_ledger/ring_bearer_keygen.ts` (REUSES thorax Ed25519 keypair)
- `src/main/ip_ledger/stamp_certify.ts` (signs + writes to ip_ledger_entries)
- `src/main/ip_ledger/mesh_diff_loop.ts` (15-min interval, battery-aware, LAN-as-WAN)
- `src/renderer/components/MyIPLedgerTab.tsx` (ring bearer pubkey + contributions list + download proof)

**Key constraint checks before wiring hooks (BLOCK 5):**
- Read src/main/ai_dispatch_ipc.ts to find config_set model pull handler
- Read the Battery Dispatch IPC handler (check src/main/dispatch/ or src/main/on_deck/)
- Read the member business listing creation path (check src/main/marketplace/)
- Read src/main/substrate_api.ts to confirm correct Supabase service client export name

**Block close each Block:** Append to `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MIC_M25_BLOCK_LOG.md`

**BLOCK 8 final steps:**
1. `npx tsc --noEmit` — zero errors required
2. Electron build (check package.json for build script)
3. Update version_trust.json: add v0.7.1 as latest, demote v0.7.0 to historical
4. Hugo redeploy both sites (alpha banner + bounties page already live from M25a — this is a no-op rebuild to include any Hugo changes from M25b if any)
5. Final HTTP smoke: curl mnemosynec.org/bounties/ (200) + alpha banner in HTML

Caithedral™ · §14 §15 §17 BLOOD · Postgres-only · gen_random_uuid() · Sonnet 4.6 · BP092
