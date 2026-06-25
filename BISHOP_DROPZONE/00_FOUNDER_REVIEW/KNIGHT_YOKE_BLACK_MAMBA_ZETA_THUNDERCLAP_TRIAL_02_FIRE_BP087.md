# KNIGHT YOKE -- BLACK MAMBA ZETA -- THUNDERCLAP TRIAL 02 FIRE SCAFFOLD -- BP087

## §0 Header

**Stream:** BLACK MAMBA MAMBA-zeta -- THUNDERCLAP Trial 02 fire scaffold + staggered-then-connected receipt (Row 8 of 8-capability matrix)
**Session:** BP087
**Status at intake:** HELD -- MAMBA-zeta held on fleet readiness; gates_check.mjs does not exist; fire-trial-02.ps1 does not exist; staggered-then-connected flag not wired in validate-relay.mjs; receipt template not scaffolded
**Brick Wall pre-authorized scope (verbatim):**
- Pre-fire gate-check script `gates_check.mjs` verifies 7/7 conditions GREEN before permitting fire
- Staggered-then-connected mode: discrete `--routing=staggered-then-connected` flag in validate-relay.mjs; one-domain-at-a-time sequence then full-connect; receipt confirms the pattern fired
- `fire-trial-02.ps1` orchestrator script: runs gates_check, then auto-fires validate-relay.mjs with full unfair-advantage flag stack
- Receipt template auto-populated from Trial run output; minted at `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\`
- Acceptance: gate-check 7/7 GREEN; validate-relay completes 70/70; receipt .md + .json minted

**Statutes binding this yoke:** §2 IMMUTABLES · §3 Sonnet 4.6 verbatim · §4 absolute paths only · §14 gadget-first before asking Founder · §15 Bishop-direct-Supabase (no SEG applies DB schema; SEGs ship .sql files only)

---

## §1 Context

MAMBA-zeta was held at WAVE 1 close (commit 80cd33a) because fleet readiness had not been confirmed: not all 5 peers were confirmed on v0.5.12, gemma4:12b homogenization was not verified, fleet_warmup keep_alive=24h had not fired, noop_test had not returned 4/5 GREEN from an automated gate, and all 5 SQL migrations had not been gadget-verified. Without those gates, firing validate-relay.mjs would produce a receipt with soft dependencies unconfirmed, which violates the Ascending Andon discipline.

Additionally, Row 8 of the 8-capability matrix (staggered-then-connected empirical receipt per `canon_staggered_single_domains_14_domain_methodology_bp085`) requires a discrete `--routing=staggered-then-connected` flag in validate-relay.mjs that does not yet exist. The flag causes the validator to test one domain at a time in sequence, then run the full connected mesh, confirming that the staggered-then-connected pattern fired and reporting the per-domain result breakdown in the receipt.

This yoke wires: the gate-check script, the staggered-then-connected flag, the fire orchestrator, and the receipt template. When all 7 gates pass and validate-relay returns 70/70 with a minted receipt at the Trial_02 path, MAMBA-zeta flips GREEN and THUNDERCLAP Trial 02 is complete.

---

## §2 Required SEG Fan-out

Knight: **use segs Sonnet 4.6 verbatim** for ALL implementation work. Do not implement inline. Fan out immediately.

**WAVE 1 -- three parallel SEGs:**

**SEG-A: gates_check.mjs -- pre-fire gate verification script**
- Task: create `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\gates_check.mjs`
- Script is ESM (`.mjs`), runnable as `node gates_check.mjs`
- Checks all 7 gates in sequence; prints `GATE N: GREEN/AMBER/RED -- [description]` for each
- Exits with code 0 only if all 7 gates are GREEN; exits with code 1 if any gate is AMBER or RED
- Gate definitions:

  **Gate 1 -- All 5 peers on v0.5.12:**
  Query `peer_presence` table via Supabase REST: `SELECT peer_id, version FROM peer_presence WHERE last_seen > NOW() - INTERVAL '10 minutes'`
  GREEN: 5 rows, all with version='v0.5.12'

  **Gate 2 -- gemma4:12b homogenized on all peers:**
  For each active peer, query the peer's reported model via capabilities JSON: `capabilities->>'active_model'`
  GREEN: 5/5 peers report 'gemma4:12b'

  **Gate 3 -- fleet_warmup keep_alive=24h confirmed:**
  Query `fleet_warmup_log` table (or equivalent): most recent warmup event within last 25 hours with keep_alive=24h
  GREEN: 1 row found within window

  **Gate 4 -- noop_test 4/5 GREEN:**
  Query `noop_test_results` table (or equivalent): most recent noop_test batch with result_count >= 4 GREEN out of 5
  GREEN: confirmed_green_count >= 4

  **Gate 5 -- all 5 SQL migrations applied:**
  Query `supabase_migrations` or equivalent: confirm migration timestamps 20260619120001 through 20260619120006 all present
  GREEN: 5 or more migrations in range confirmed

  **Gate 6 -- relay.lianabanyan.com reachable:**
  HTTP GET `https://relay.lianabanyan.com/health` or equivalent
  GREEN: HTTP 200

  **Gate 7 -- validate-relay.mjs exists and is executable:**
  File exists at `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs`
  GREEN: file present + readable

- If a table does not exist yet (fleet_warmup_log, noop_test_results), gate prints `AMBER -- table not found; confirm manually` and script exits 1
- No em-dashes. ESM JavaScript. Supabase REST via fetch (use SUPABASE_URL and SUPABASE_ANON_KEY from process.env).

**SEG-B: staggered-then-connected flag in validate-relay.mjs**
- Task: read `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs` and add `--routing=staggered-then-connected` flag support
- When flag is present:
  1. Phase 1 (staggered): test each of the 14 domains one at a time in sequence; record per-domain result (GREEN/AMBER/RED + latency)
  2. Phase 2 (connected): run full mesh test with all domains active simultaneously
  3. Receipt output: include per-domain breakdown from Phase 1 + aggregate Phase 2 result
  4. Print marker line: `ROUTING: staggered-then-connected -- Phase 1 complete -- Phase 2 complete` to stdout
- When flag is absent: existing behavior unchanged (no regression)
- No em-dashes. Preserve existing validate-relay.mjs structure; minimal diff.

**SEG-C: receipt template scaffold**
- Task: create directory `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\` if it does not exist
- Create receipt template `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RECEIPT_TEMPLATE.md` with all fields as placeholders
- Template fields:
  ```
  # THUNDERCLAP Trial 02 Receipt
  Session: BP087
  Fire date: {FIRE_DATE}
  Operator: {OPERATOR}

  ## Gate Check (gates_check.mjs)
  Gate 1 v0.5.12 homogenized: {G1}
  Gate 2 gemma4:12b homogenized: {G2}
  Gate 3 fleet_warmup keep_alive=24h: {G3}
  Gate 4 noop_test 4/5 GREEN: {G4}
  Gate 5 SQL migrations applied: {G5}
  Gate 6 relay reachable: {G6}
  Gate 7 validate-relay.mjs present: {G7}
  Gate check result: {GATE_CHECK_RESULT} (7/7 required)

  ## Staggered Phase (--routing=staggered-then-connected)
  {DOMAIN_01}: {D01_RESULT} -- {D01_LATENCY_MS}ms
  {DOMAIN_02}: {D02_RESULT} -- {D02_LATENCY_MS}ms
  {DOMAIN_03}: {D03_RESULT} -- {D03_LATENCY_MS}ms
  {DOMAIN_04}: {D04_RESULT} -- {D04_LATENCY_MS}ms
  {DOMAIN_05}: {D05_RESULT} -- {D05_LATENCY_MS}ms
  {DOMAIN_06}: {D06_RESULT} -- {D06_LATENCY_MS}ms
  {DOMAIN_07}: {D07_RESULT} -- {D07_LATENCY_MS}ms
  {DOMAIN_08}: {D08_RESULT} -- {D08_LATENCY_MS}ms
  {DOMAIN_09}: {D09_RESULT} -- {D09_LATENCY_MS}ms
  {DOMAIN_10}: {D10_RESULT} -- {D10_LATENCY_MS}ms
  {DOMAIN_11}: {D11_RESULT} -- {D11_LATENCY_MS}ms
  {DOMAIN_12}: {D12_RESULT} -- {D12_LATENCY_MS}ms
  {DOMAIN_13}: {D13_RESULT} -- {D13_LATENCY_MS}ms
  {DOMAIN_14}: {D14_RESULT} -- {D14_LATENCY_MS}ms
  Staggered phase score: {STAGGER_SCORE}/14

  ## Connected Phase
  Total tests: {TOTAL_TESTS}
  GREEN: {GREEN_COUNT}
  AMBER: {AMBER_COUNT}
  RED: {RED_COUNT}
  Score: {CONNECTED_SCORE}/70
  Duration: {DURATION_MINUTES}m

  ## Unfair Advantage Stack
  Flags: {FLAGS_VERBATIM}

  ## THUNDERCLAP Trial 02 Verdict
  {VERDICT} (required: 70/70 GREEN)

  ## Peer Topology (LAN-as-WAN per canon)
  Relay: relay.lianabanyan.com
  Peers: M0 · M1 · M2 · M3 · M4
  All traffic via WAN roundtrip (LAN-direct optimization deferred)
  ```
- Also create empty JSON companion: `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RECEIPT_TEMPLATE.json` with matching keys as null values
- No em-dashes.

**WAVE 2 -- one integration SEG (after WAVE 1 complete):**

**SEG-D: fire-trial-02.ps1 -- orchestrator script**
- Task: create `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\fire-trial-02.ps1`
- PowerShell script, runnable as `.\fire-trial-02.ps1` from the `tools\mesh-validation` directory
- Sequence:
  1. Print `THUNDERCLAP Trial 02 -- pre-fire gate check -- {timestamp}`
  2. Run `node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\gates_check.mjs`
  3. If exit code != 0: print `GATE CHECK FAILED -- fire aborted -- review gate output above` and exit 1
  4. If exit code == 0: print `GATE CHECK: 7/7 GREEN -- firing validate-relay.mjs`
  5. Run `node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs --routing=staggered-then-connected --unfair-advantage --peers=5 --domains=14 --output-json=C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RESULT_{timestamp}.json`
  6. Capture exit code and stdout
  7. Print `validate-relay complete -- exit code: {N}`
  8. If output JSON exists: print `Receipt JSON minted: {path}`
  9. Copy `TRIAL_02_RECEIPT_TEMPLATE.md` to `TRIAL_02_RECEIPT_{timestamp}.md` in the same receipt directory
  10. Print `Receipt template copied to: {path}`
  11. Print `THUNDERCLAP Trial 02 fire complete -- fill receipt fields from output above`
- {timestamp} format: `yyyyMMdd_HHmmss` (PowerShell `Get-Date -Format 'yyyyMMdd_HHmmss'`)
- Confirm `--unfair-advantage` is the correct flag name for validate-relay.mjs; if not, SEG-D reads validate-relay.mjs flags section and uses the correct flag verbatim
- No em-dashes. PowerShell 7+ syntax.

---

## §3 File Targets

All paths absolute. Knight confirms these exist or creates them.

| Action | Absolute Path |
|--------|--------------|
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\gates_check.mjs` |
| EDIT | `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs` |
| CREATE (dir + files) | `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RECEIPT_TEMPLATE.md` |
| CREATE | `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RECEIPT_TEMPLATE.json` |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\fire-trial-02.ps1` |

---

## §4 Acceptance Gates

**gadget-first before asking Founder.** Run every gate via gadget before reporting back.

**Gate 1 -- gates_check.mjs dry-run (no live peers needed):**
```
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\gates_check.mjs
```
Expected: script runs without crash; prints 7 gate lines; exits with 0 or 1 (content depends on live peer state)

**Gate 2 -- gates_check gate lines format correct:**
```
# Assert output contains lines matching pattern:
# GATE 1: GREEN/AMBER/RED -- ...
# GATE 2: GREEN/AMBER/RED -- ...
# ...
# GATE 7: GREEN/AMBER/RED -- ...
```
Expected: 7 lines with correct prefix format

**Gate 3 -- validate-relay.mjs accepts staggered-then-connected flag:**
```
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs --routing=staggered-then-connected --help
```
Expected: help output lists `--routing=staggered-then-connected` as a valid option (or script starts Phase 1 without error)

**Gate 4 -- staggered-then-connected marker line fires:**
```
# Run validate-relay.mjs with --routing=staggered-then-connected against any available peer subset
# Assert stdout contains: "ROUTING: staggered-then-connected -- Phase 1 complete -- Phase 2 complete"
```
Expected: marker line present in output

**Gate 5 -- receipt template files exist:**
```
Test-Path C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RECEIPT_TEMPLATE.md
Test-Path C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02\TRIAL_02_RECEIPT_TEMPLATE.json
```
Expected: both True

**Gate 6 -- fire-trial-02.ps1 gate-abort path works:**
```
# Temporarily make gates_check.mjs exit 1 (comment out one check or set env GATES_FORCE_FAIL=1)
# Run .\fire-trial-02.ps1
# Assert output contains "GATE CHECK FAILED -- fire aborted"
# Assert validate-relay.mjs was NOT invoked
```
Expected: abort message present; no validate-relay invocation in output

**Gate 7 -- full fire with 7/7 GREEN gates (live fleet required):**
```
# Confirm all 5 peers on v0.5.12 + gemma4:12b + fleet_warmup + noop_test 4/5 GREEN
# Run .\fire-trial-02.ps1
# Assert gates_check exits 0
# Assert validate-relay runs to completion
# Assert receipt JSON minted at Trial_02 path
# Assert receipt MD copied at Trial_02 path
```
Expected: 70/70 GREEN; both receipt files present; verdict line readable

---

## §5 Drift Surface Protocol (BP053 inline)

If SEG-A finds that `fleet_warmup_log` or `noop_test_results` tables do not yet exist in the Supabase schema, SEG-A marks those gates AMBER (not RED) and prints the table-not-found message. Knight does NOT fabricate a table query; Knight escalates to Founder if the correct table name is unknown.

If SEG-B finds that `validate-relay.mjs` already has a `--routing` flag with a different value than `staggered-then-connected`, SEG-B reports the existing flag name verbatim and either extends the existing routing enum or confirms with Knight before proceeding. Knight does NOT silently rename an existing flag.

If SEG-D finds that `--unfair-advantage` is not a valid validate-relay.mjs flag, SEG-D reads the flags section verbatim and uses the correct flag name. The fire script must use the empirically confirmed flag name.

No estimates in return template. Empirical values only.

---

## §6 Composition with Prior Canons

- `canon_staggered_single_domains_14_domain_methodology_bp085` -- Row 8 of matrix; 14 domains tested one-at-a-time then connected; 97.1% baseline from PROV_23; this yoke wires the discrete flag and receipt
- `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` -- HARD CONSTRAINT: all 5 peers via relay.lianabanyan.com WAN; receipt must state LAN-as-WAN topology verbatim; receipt template includes the peer topology block
- `canon_ascending_andon_right_fast_cheap_discipline_bp085` -- Plow refuses to guess; gate-check enforces the discipline mechanically before fire
- `canon_persistent_active_memory_crown_jewel_bp085` -- receipt minted at Asteroid-ProofVault is a permanent substrate record; never deleted
- `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085` -- SEGs are Callable Substrate Workers dispatched by Knight
- `canon_every_knight_dispatch_and_paste_prompt_must_say_use_segs_bp063` -- use segs Sonnet 4.6 verbatim is mandatory per this canon

---

## §7 Return Template

Knight returns this block filled with empirical values only. No estimates.

```
MAMBA-zeta THUNDERCLAP Trial 02 Fire Scaffold -- BP087 RETURN RECEIPT

Gate 1 gates_check.mjs dry-run:              [ GREEN / AMBER / RED ] -- [observed exit code: N]
Gate 2 gate lines format correct:            [ GREEN / AMBER / RED ] -- [observed: 7 lines Y/N]
Gate 3 staggered-then-connected flag accepts: [ GREEN / AMBER / RED ] -- [observed: flag recognized Y/N]
Gate 4 marker line fires:                    [ GREEN / AMBER / RED ] -- [observed log line verbatim]
Gate 5 receipt template files exist:         [ GREEN / AMBER / RED ] -- [observed: both present Y/N]
Gate 6 gate-abort path works:               [ GREEN / AMBER / RED ] -- [observed: abort message present Y/N]
Gate 7 full fire 70/70 (live fleet):        [ GREEN / AMBER / RED ] -- [observed score: N/70 · receipt paths verbatim]

Staggered phase per-domain breakdown (if Gate 7 fired):
  Domain 01: {result} -- {latency_ms}ms
  Domain 02: {result} -- {latency_ms}ms
  [... 14 lines ...]
  Staggered phase score: {N}/14

Files created:
  [list with absolute paths + line counts]

Files edited:
  [list with absolute paths + diff summary]

Drift surface events:
  [any conflicts or escalations verbatim, or NONE]

Commit hash:
  [git commit hash after Knight commits, or PENDING]

Receipt MD path: [absolute path or PENDING]
Receipt JSON path: [absolute path or PENDING]

MAMBA-zeta: [ GREEN / AMBER / RED ]
THUNDERCLAP Trial 02: [ COMPLETE / PARTIAL / PENDING ]
```

---

## §8 Statutes Binding Header (echoed)

- **§2 IMMUTABLES:** Do not alter foundational substrate primitives outside scoped targets above.
- **§3 Sonnet 4.6 verbatim:** All SEG dispatches use Sonnet 4.6 verbatim. No model substitution.
- **§4 Absolute paths:** Every file reference in SEG prompts uses absolute paths. No relative paths.
- **§14 gadget-first before asking Founder:** Run every acceptance gate via gadget. Report results empirically.
- **§15 Bishop-direct-Supabase:** Knight: Bishop will apply migrations directly via psql. Your SEGs do NOT apply DB schema. SEGs ship the .sql file only.
