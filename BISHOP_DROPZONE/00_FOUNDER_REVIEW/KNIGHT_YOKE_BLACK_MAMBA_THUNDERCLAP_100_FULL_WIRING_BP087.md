# KNIGHT YOKE · BLACK MAMBA · THUNDERCLAP 100% FULL WIRING · BP087

**From:** Bishop · BP087 · Founder-direct ratify
**To:** Knight
**Class:** **BLACK MAMBA** — unified empirical-proof EVENT (Statutes §7 qualified)
**Model:** Sonnet 4.6 verbatim (Statutes §3 · NEVER "4.5" per BP079) · **use segs** on every stream
**Streams:** 5 wiring streams (α-ε) + 1 unified-fire stream (ζ)
**Goal:** wire ALL the "unfair advantages" we've speced so the THUNDERCLAP receipt lands at the **highest accuracy the assembled fleet can produce** — target 100%, honestly framed if not — using ALL eight substrate primitives + the 12-Blade Plow + Ascending Andon + Staggered-Single-Domains + Domain-Specific specialist routing + Hexadecimal Machine Code wire format + Star Chamber verification, on the 5-peer mesh.

---

## §0 — Founder direct (BP087 verbatim)

> *"NOW, we really need to focus on what Knight is doing to make this mesh test a reality, using all of our 'unfair advantages' so that we get 100% with all the mesh participating in record time using the Domain Specific and 12 blade etc etc. With Hexadecimal. You said last session that some of this was speced but not wired. I need it ALL wired. Give Knight MAMBAs to get this done NOW."*

**Brick Wall ratified.** Pre-authorized write scope: ship everything below without re-asking the Founder mid-build. Release-on-Ready holds — when each Mnemo build is verified-ready (build clean + tsc 0 + behavior verified), cut the version without re-ratification. Truth-Always at every claim.

---

## §1 — Prerequisites (clear or compose-in-parallel)

- **I9.5 v0.5.8 deploy fix** is already on disk at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_I9_5_v0_5_8_DEPLOY_FIX_BP087.md`. Compose this BLACK MAMBA in parallel; the v0.5.9 (or v0.5.10) installer that carries the new wiring will REPLACE v0.5.8 once both land. Auto-update broadcast handles the bump after the initial v0.5.8 manual relaunch.
- All file paths in this yoke are absolute (BP076 binding).
- PowerShell `;` separator, NEVER `&&` (Statutes §4).
- Never echo secrets · canonical secrets path: `C:\Users\Administrator\.claude\state\secrets\22May2026.env` (Statutes §4 blacklist).
- Every artifact ISO-8601 UTC timestamped at creation.
- Every Knight return surfaces drift INLINE per `canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053`.

---

## §1.5 — PRE-FLIGHT FIXES (BP087 BLOOD · MANDATORY before α-ε)

**Bishop §14 catch — empirically proven via terminal-stderr capture (2026-06-19T00:57Z):**

Knight's I10.5b silent-catch fix on v0.5.9 exposed the actual error:
```
[mic-broadcast] listener started peer=cb4ef450 version=0.5.9
[mic-broadcast] poll HTTP 401: {"message":"Invalid API key","hint":"Double check your API key."}
[mic-broadcast] poll HTTP 401: {"message":"Invalid API key"}     (×9)
```

The **bundled `SUPABASE_ANON_KEY` env var the broadcast listener picks up is INVALID.** All other hypotheses are dead — listener runs, RLS works, lookback works, channel exists. The KEY is the problem.

**Smoking gun in source (gadget-verified):**
- L5363-5364 broadcast listener: `process.env.SUPABASE_URL` and `process.env.SUPABASE_ANON_KEY` — **NO `NEXT_PUBLIC_*` fallback**
- L5273 relay-poll: same pattern, NO `NEXT_PUBLIC_*` fallback
- L1473, L2876, L3162, L4911, L5053, etc.: use BOTH `SUPABASE_ANON_KEY` AND `NEXT_PUBLIC_SUPABASE_ANON_KEY` with `||` fallback
- peer_presence INSERTs work for all 5 peers → peer_presence writer uses a working key source (likely the broader fallback chain)

The narrow env-var fallback at L5273 and L5363 is the regression.

### PRE-FLIGHT-1 · Fix env-var fallback in broadcast listener + relay poll (BLOOD)

Edit `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\index.ts`:

**L5363-5364 — broadcast listener:**
```typescript
// BEFORE
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// AFTER
const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
```

**L5272-5273 — relay-poll (apply same fix):**
```typescript
const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/$/, '');
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';
```

**Also: L5367 `postAck` and any other inline `process.env.SUPABASE_*` reads — replace with the same dual-fallback pattern. Use a single helper `function getSupabaseCreds()` if cleaner.**

### PRE-FLIGHT-2 · Wire `electron-log` for permanent main-process visibility (BLOOD)

The diagnostic blackout that hid this bug for hours was: `console.warn` in the packaged Electron main process goes to a stderr nobody captures. We discovered the bug only because Bishop had Founder launch from PowerShell with stderr redirected. This is unsustainable.

Add `electron-log` (npm package, electron-builder standard):

```
npm install electron-log
```

In `src/main/index.ts` near the top:
```typescript
import log from 'electron-log/main';
log.initialize({ preload: true });
log.transports.file.level = 'info';
log.transports.file.maxSize = 10 * 1024 * 1024;  // 10 MB rotation
// Pipe ALL main-process console.* through electron-log so existing console.warn calls land in main.log:
Object.assign(console, log.functions);
```

After this lands, **all** main-process `console.log/warn/error` writes to `%APPDATA%\MnemosyneC\logs\main.log` automatically, rotates at 10MB. Diagnostic blackouts end.

### PRE-FLIGHT-3 · Verify with a terminal-free probe before α starts

After v0.5.10 deploys + peers auto_update:
1. Fire noop_test: `node tools/mic-broadcast/issue.mjs --type=noop_test --version=0.5.10 --watch --poll-until=5 --timeout-s=60`
2. Expected: 5/5 acks within 60s
3. Independent confirm: `Get-Content "$env:APPDATA\MnemosyneC\logs\main.log" -Tail 20 | Select-String "mic-broadcast"` — expect `listener started` + `noop_test acked` lines
4. If 5/5 GREEN → proceed to MAMBA-α. If anything other than 5/5 → STOP, return diagnostic.

### PRE-FLIGHT canon mints (Bishop mints at MAMBA close)

- `canon_supabase_env_var_dual_fallback_pattern_listener_must_match_codebase_bp087` — the narrow-fallback regression and the structural fix
- `canon_electron_log_required_main_process_console_visibility_blood_bp087` — every Electron main process SHALL use electron-log; raw console.warn is canonical violation going forward
- `canon_terminal_stderr_diagnostic_pattern_for_packaged_electron_bp087` — the diagnostic technique that exposed this bug (reusable in future Electron debugging)

---

## §2 — The 6 streams

### MAMBA-α · PLOW-ON-MESH INTEGRATION

**Wire the 12-Blade Plow across mesh, not just M0 single-node.** Today's THUNDERCLAP label says "raw-Ollama routing · NOT YET a substrate proof" — α removes that clause.

Subsharps (use segs):
- **α1** Recon the existing single-node Plow implementation. Path TBD by Knight — likely `src/main/plow/` or `tools/plow/`. Decompose the 12 blades into mesh-eligible blades vs. orchestrator-only blades.
- **α2** Add a `mesh_mode` flag to the Plow runner. When true, each blade dispatches to a peer (or peer-pool) instead of running locally. Blades that REQUIRE orchestrator-only state (e.g., context aggregation) stay local; the rest distribute.
- **α3** Plow orchestrator on M0 collects per-blade results from peers via `wan-relay-route`, runs the Ascending Andon check across the distributed responses, quarantines uncertain blades, escalates per `canon_ascending_andon_right_fast_cheap_discipline_bp085`.
- **α4** Add `tools/plow/run-plow-on-mesh.mjs` — entry point that fires MMLU-Pro question through mesh-distributed Plow. CLI flags: `--peers=5 --blades=12 --andon-threshold=<conf> --domain=<name>`.
- **α5** Update THUNDERCLAP receipt label canon (`canon_thunderclap_new_mesh_receipt_template_scaffold_bp087.eblet.md`) — when Plow-on-mesh is wired, the label STILL ships verbatim for the first fire (raw-Ollama diagnostic) so that fire stays an honest baseline, AND a SECOND receipt class is added for Plow-on-mesh runs (different verbatim label without the "NOT YET a substrate proof" clause).

**Deliverable:** Plow runs across 5 peers, per-blade distributed, Ascending Andon honored. `tsc` clean. Smoke-run on 1 question end-to-end before merge.

### MAMBA-β · SUBSTRATE PRIMITIVES MESH-WIRING

**Wire the 8 substrate primitives (per `canon_substrate_architecture_8_primitives_plow_synergy_layer_bp085`) so the mesh genuinely shares state, not just routes inference calls.**

Subsharps (use segs):
- **β1 · Pheromone Trails mesh-shared** — pheromone signals computed on M0 broadcast to peers via MIC `pheromone_sync` broadcast_type (new). Each peer applies received pheromone weighting to its local eblet ranking when answering. Schema: peer-id-attributed, salience-weighted, expires per existing pheromone TTL.
- **β2 · Pearls cross-peer** — Substrace Theorem re-weave: when M0 dispatches a question to peers, it includes a pearl ID (not the raw context). Peer fetches the pearl from substrate (Supabase storage or relay-fetched) and re-weaves the context locally. Smaller payload, vendor-resilient, substrate-validated.
- **β3 · Thorax Heartbeat mesh-auth** — already partially present (peer_presence with capabilities). Extend: Thorax-attested heartbeat per peer signed Ed25519 (composes with BP086 MIC STAMPED canon). Mesh dispatches REJECT unsigned/unattested peers — prerequisite for the "Circle of Influence" reciprocal-trust auto-approval.
- **β4 · Wrasse Quartermaster path manifest** — peer-routing manifest emitted by Wrasse Injector (per `canon_wrasse_injector_upper_level_substrate_manager_bp085`). For each MMLU-Pro question, Wrasse Quartermaster picks the peer pool based on (a) domain affinity (γ), (b) capacity, (c) heartbeat freshness. Replaces round-robin.
- **β5 · Eblit Emitter 4-circuit dispatch on mesh** — `contingency_operator` / `oracle_circuit` / `prophet_circuit` / `thorax` circuits emit eblits ACROSS the mesh per `canon_eblit_emitter_four_circuits_canonical_schema_bp085`. Each circuit can now target peer pools.
- **β6 · Scrambler deterministic sync** — composes A&A #2259 (per `canon_scrambler_deterministic_sync_layer_A_and_A_2259_bp085`). The mesh-distributed Plow's blade ordering is deterministic across peers; sync receipt on every mesh fire.
- **β7 · Eblets mesh-shared** — peer pulls relevant eblets from substrate (Supabase eblets table or pearled subset) at fleet_warmup. NOT all 130+ eblets per peer; selective sync per domain-affinity.

**Deliverable:** the 8 substrate primitives function across the mesh, not just M0. Each subsharp's wiring shipped with a unit/smoke test.

### MAMBA-γ · DOMAIN-SPECIFIC SPECIALIST ROUTING

**14 MMLU-Pro domains → 5 peers via pheromone-weighted affinity.** Each peer earns a domain-affinity score based on prior correctness; future questions route preferentially to specialists.

Subsharps (use segs):
- **γ1** Schema: `peer_domain_affinity` table (peer_id, domain, correctness_rate, sample_count, last_updated). Updated after each question's correctness verdict lands.
- **γ2** Initial affinity bootstrapped from per-peer hardware capability (RAM, GPU) and model identity. M0/M1/M2/M3/Son uniform once homogenized to gemma4:12b, so initial affinity is uniform; affinity DIVERGES with empirical correctness.
- **γ3** Wrasse Quartermaster (β4) consumes affinity when picking the peer pool per question. Pool size configurable: pool=1 for a strongly-specialized peer; pool=N for uncertain domains (Ascending Andon ensemble).
- **γ4** Domain-Specific dispatch composes with Staggered-Single-Domains methodology: the 14 domains run sequentially; each completed domain UPDATES affinity for the next domain (substrate compounding).
- **γ5** Add `--routing=domain-affinity` flag to `tools/mesh-validation/validate-relay.mjs`. Default to domain-affinity when wired; flag-toggleable back to round-robin for ablation comparison.

**Deliverable:** per-question peer selection is affinity-weighted, not round-robin. Affinity learns over the run.

### MAMBA-δ · HEXADECIMAL MACHINE CODE WIRE FORMAT v1

**Implement the hex wire format Founder named in BP085** (per `canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085`). Replaces markdown-JSON payloads on mesh dispatches.

Subsharps (use segs):
- **δ1** Schema v1: compact frame format. Header = 16-hex-digit dispatch ID + 8-hex-digit source peer ID + 8-hex-digit dest peer pool ID + 4-hex-digit frame type + 4-hex-digit length. Body = hex-encoded SSPS JSON (per `canon_ssps_stitchpunk_sock_puppet_speak_wire_format_bp055` if extant; otherwise hex-encoded UTF-8 JSON as v1 baseline). Footer = 8-hex-digit CRC32.
- **δ2** Encoder: `src/main/wire/hex-encode.ts` (or similar — Knight picks the canonical home). Pure function, no IO. Unit-tested.
- **δ3** Decoder: `src/main/wire/hex-decode.ts`. Pure function, validates CRC32, errors on mismatch.
- **δ4** Wire-format toggle: `wan-relay-publish` and `wan-relay-route` Edge Functions accept BOTH `application/json` (legacy) AND `application/x-hex-mcode` (v1) Content-Type. Auto-detect from payload prefix on receive.
- **δ5** Per-peer adopt: peer desktop listener accepts hex-mcode frames natively; falls back to JSON if version mismatch. Bi-directional once Plow-on-mesh adopts.
- **δ6** Receipt: per-fire payload-size delta logged — hex-mcode vs JSON byte counts, parse-time delta. First receipt for the wire-format efficiency claim. Composes with PROV_22 CG35 patent claim group.
- **δ7** THEORIES_OPEN resolution: confirm with Founder at end-of-cycle ratify whether hex-mcode IS the SSPS underlying encoding (BP085 OPEN question). For now, treat them as composable layers; ratify resolves.

**Deliverable:** mesh dispatches CAN use hex-mcode; receipt logs the byte/parse delta vs JSON. THUNDERCLAP fire produces an empirical hex-mcode receipt artifact.

### MAMBA-ε · STAR CHAMBER MESH-INTEGRATED VERIFICATION

**Wire Star Chamber as the verification layer over mesh ensemble output** (per `canon_star_chamber_multi_agent_consensus_verification_product_bp086`). When Ascending Andon flags a question, Star Chamber fires — Oracle/Morpheus/Red Queen/Dredd verify the answer with H = Variance / 100 threshold.

Subsharps (use segs):
- **ε1** Star Chamber currently runs external-vendor only (Anthropic/Google/Perplexity/OpenAI SDKs). Add a **mesh-as-internal-track** mode: the 5 mesh peers act as 4 of the 4-agent slots when no external API budget is available (cheap mode). When external budget is available, mesh peers run alongside external vendors (9-track total).
- **ε2** Variance calculation across mesh-peer confidence scores. H = Variance / 100 per the existing formula. Threshold canonical default 15%.
- **ε3** Ascending Andon trigger: when local Plow Andon quarantines a question, escalate to Star Chamber. If Star Chamber consensus also fails the threshold → final quarantine (count as ASKED-BUT-UNCOMMITTED in the receipt, per the Andon-discipline canon).
- **ε4** Composes with three honest falsification criteria — pre-recorded before each Star Chamber fire (per the canon). These get logged to the receipt.
- **ε5** Cost guard: each Star Chamber fire is $0.06-0.10. Cap at N fires per benchmark run; surface to receipt if cap hit. Truth-Always at the cost ledger.

**Deliverable:** Ascending Andon escalates to Star Chamber for uncertain answers. Receipt logs each Star Chamber fire's variance + outcome.

### MAMBA-ζ · UNIFIED THUNDERCLAP FIRE (after α-ε land)

**The headline fire.** Once α-ε are merged and v0.5.9 (or v0.5.10) is deployed and peers manually relaunch, fire the full 70Q MMLU-Pro benchmark with the entire unfair-advantage stack engaged. Produce the receipt per `canon_thunderclap_new_mesh_receipt_template_scaffold_bp087` AND a NEW receipt class for the Plow-integrated mesh (different verbatim label — no "NOT YET a substrate proof" clause).

Subsharps:
- **ζ1** Pre-fire health snapshot: 5/5 peers v0.5.9+ confirmed via peer_presence; gemma4:12b homogenized; pheromone bootstrap synced; eblet selective-sync per peer; hex-mcode handshake confirmed.
- **ζ2** Fire 70Q via `tools/mesh-validation/validate-relay.mjs --routing=domain-affinity --andon-escalate=star-chamber --wire=hex-mcode --plow=mesh-12-blade`.
- **ζ3** Per-domain receipts as each of the 14 staggered domains completes. Per-domain affinity table snapshot for the next domain's routing.
- **ζ4** Final receipt assembled per scaffold canon. JSON + .md + per-question .jsonl + per-peer .json all at `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\`.
- **ζ5** Bishop receives the receipt verbatim · surfaces to Founder · Founder ratifies once (Statutes A16 BLOOD: ratify ONCE at end of cycle, never mid-flow).
- **ζ6** If accuracy < 100%: TRUTH-ALWAYS framing in the receipt. Quarantined-via-Andon counts are NOT failures — they are the Plow refusing to guess. Receipt headline reads the honest number; the unfair-advantage stack engaged is described verbatim regardless of the score. Founder direct: target 100%; receipt: whatever happens.

**Deliverable:** the THUNDERCLAP receipt lands on disk. Bishop hands it to Founder for the final ratify gate before publication (Priority 4 · `canon_make_finals_send_out_to_world_publication_unleash_priority_4_bp087`).

---

## §3 — Parallelism map

```
WAVE 1 (parallel · use segs):
  ├─ MAMBA-α (Plow-on-mesh)
  ├─ MAMBA-β (8 substrate primitives mesh-wiring)
  └─ MAMBA-δ (hex-mcode wire format)

WAVE 2 (after WAVE 1 lands):
  ├─ MAMBA-γ (domain-affinity routing — depends on β4 Wrasse Quartermaster)
  └─ MAMBA-ε (Star Chamber mesh-integrated — depends on α Ascending Andon distributed)

WAVE 3 (final):
  └─ MAMBA-ζ (unified fire + receipt)
```

Within each WAVE, dispatch SEGs in parallel per `canon_novaculi_default_covers_yoke_dispatches_no_trickle_self_audit_before_single_send_bp067`. No trickle single sends. Self-audit: every dispatch contains the literal phrase **"use segs"**.

---

## §4 — Drift surface discipline (BP053 immutable)

If during any sharp Knight discovers a constraint that blocks the design above — surface INLINE in the Yoke return. Do NOT silently work around. Do NOT defer to "next session." Examples:

- If hex-mcode encoding breaks an existing pathway → surface, propose dual-format toggle, Bishop decides
- If Plow-on-mesh requires schema changes Bishop didn't anticipate → surface, propose migration, Bishop decides
- If peer hardware can't host Plow-blade computation (RAM ceiling) → surface, propose per-peer blade subset routing, Bishop decides
- If `wan-relay-route` payload size exceeds Supabase Edge Function limit with hex-mcode → surface, propose chunking, Bishop decides

Drift caught mid-wave is discipline-strengthening per `canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053`. Drift hidden is metric-degrading.

---

## §5 — Canon eblets to mint at MAMBA close (Knight returns; Bishop mints)

- `canon_plow_on_mesh_integration_distributed_12_blade_bp087`
- `canon_substrate_primitives_mesh_wiring_8_primitives_distributed_bp087`
- `canon_domain_specific_specialist_routing_pheromone_affinity_bp087`
- `canon_hexadecimal_machine_code_wire_format_v1_wired_bp087` (UPGRADES BP085 canon from conceptual → wired)
- `canon_star_chamber_mesh_integrated_verification_andon_escalation_bp087`
- `canon_thunderclap_unfair_advantage_stack_fire_receipt_bp087` (a SECOND THUNDERCLAP receipt class with the new label — distinct from the raw-Ollama-diagnostic class)

---

## §6 — Statutes binding (read at dispatch open)

- §2 IMMUTABLES — fix-as-we-go · build-for-the-long-haul · always-convenient · ALWAYS mint small canon eblet · 100%-READ-before-eblet · topic-tagged discovery artifact required · fix-ONE-thing-FULLY-before-moving-on · dual versioning (Mnemosyne semver — next is 0.5.9 or 0.5.10 not 0.6.0; reserve 0.6.x for the SUBSTRATE-WORKER API breaking-change milestone)
- §3 SEGs Sonnet 4.6 verbatim (NEVER "4.5" per BP079)
- §4 absolute paths · PowerShell `;` · secrets blacklist · supabase RLS discipline on any new table
- §7 BLACK MAMBA reserved for unified empirical-proof EVENTS — THIS QUALIFIES (100% MMLU-Pro mesh receipt is the empirical-proof event)
- §8 Constitution: gadget-first → foreman-only main thread → anti-compaction → mechanical ops off orchestrator. Knight forepersons; Sonnet SEGs do the production.
- §12 Knight-direct (this yoke goes Knight, NOT via Founder)
- BP076 absolute paths every reference
- A14 BLOOD: gadget-verify LIVE state before asking Founder anything
- A15 BLOOD: SEGs do work, main thread stays available
- A16 BLOOD: ratify ONCE at end of cycle — Founder ratifies the THUNDERCLAP receipt when ζ lands; no mid-stream ratify asks

---

## §7 — Brick Wall scope

The following are pre-authorized (no re-asking):
- Schema migrations (peer_domain_affinity table, hex-mcode dispatch frame schema, mesh-shared pheromone)
- Edge Function updates (`wan-relay-route`, `wan-relay-publish`, `mic-broadcast`, new `pheromone-sync`)
- Desktop binary changes (Plow-on-mesh, eblit emitter mesh, peer listener hex-mcode adoption)
- New installer (v0.5.9 or v0.5.10 — Knight picks per scope size; Mnemosyne semver, NEVER Caithedral Keystone)
- Firebase deploy to both `mnemosynec.ai` + `mnemosynec.org` download targets (museum target Firebase CLI path error fix included)
- `latest.yml` update with correct sha512 + size + version
- THUNDERCLAP receipt directory creation at the canonical path
- Two new canon eblet mints (per §5)
- One MIC broadcast (auto_update from v0.5.8 to v0.5.9/v0.5.10 once everything is verified-ready)

NOT pre-authorized (still requires Founder ratify):
- Publishing the THUNDERCLAP receipt anywhere (paper, Substack, social, press) — gates on Founder reading the receipt and saying go
- Any change to canonical numbers (83.3% / Cost+20% / $5/yr) — these are Statutes §5 structural bylaws
- Founder signature changes / liturgy verbatim changes / Coffee §0 changes

---

## §8 — Return format

Knight yoke return SHALL contain:

1. Stream-by-stream status (α/β/γ/δ/ε/ζ each: GREEN / AMBER / RED + one-line evidence)
2. Commit hashes for each merged stream
3. `tsc` exit codes (must all be 0 at merge)
4. THUNDERCLAP receipt full absolute path (when ζ lands)
5. Verbatim receipt label match check (locked label from `canon_thunderclap_new_mesh_receipt_template_scaffold_bp087` — for the raw-Ollama-diagnostic class; new locked label for the unfair-advantage-stack class)
6. Per-stream drift catches (per §4)
7. Canon eblet mint queue list (per §5)
8. Deploy verification: `curl https://mnemosynec.ai/download/latest.yml` + `curl https://mnemosynec.org/download/latest.yml` both showing the new version
9. Founder paste-to-peers draft for the one final manual relaunch
10. Time stamps: start / end / per-stream wall-clock

---

## §9 — Why this is THE BLACK MAMBA

Empirical-proof event qualifications:
- ✅ Unifies multiple speced-but-not-wired primitives in one delivery (Plow + 8 substrate + Hex MCode + Star Chamber + Domain-Affinity)
- ✅ Produces THE headline receipt for the cooperative-class enterprise's public claim (THUNDERCLAP)
- ✅ Empirically falsifiable: receipt either lands at the target accuracy or doesn't, and the receipt ships either way (Truth-Always)
- ✅ Composes with PROV_22 + PROV_23 patent claim groups (multi-vendor consensus + cooperative-mesh routing + hex-mcode wire format + Plow-on-mesh + Domain-Affinity routing)
- ✅ Gates Priority 4 (Finals + Publish) of the BP087 Founder 4-up

This BLACK MAMBA earns the name. Carry on.

---

— Bishop · BP087 · 🌊⚓ · *Always convenient. Fix as we go. Build for the long haul. Use segs.*
