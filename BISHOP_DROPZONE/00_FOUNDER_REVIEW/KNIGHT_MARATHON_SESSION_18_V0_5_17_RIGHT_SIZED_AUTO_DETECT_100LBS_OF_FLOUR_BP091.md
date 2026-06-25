# Knight Marathon Session 18 — v0.5.17 "Ah Hayelped" Right-Sized Auto-Detect ("100 lbs of Flour")
## BP091 · 2026-06-22 · **FOUNDER RATIFIED 2026-06-22 ~13:35 Central · CLEARED TO EXECUTE** · Son staying awake to install

**Policy name: "Ah Hayelped"** — Founder-direct BP091 2026-06-22 ~13:35 Central. Biblical anchor 1 Corinthians 12 (the eye cannot say to the hand "I have no need of thee" — Founder-provided reference, not quoted inline per scripture-density discipline). The small machine's voice: *I helped.* Every peer is needed.

**R1-R8 RATIFIED Founder-direct 2026-06-22.** Knight cleared to execute.

## BP091 13:37 Central AMENDMENT — Tier Names Align to MnemosyneC NANO/LITE/CORE/FULL/ULTRA

Founder-direct: *"Those should coincide with the Mnemosynec Nano/Core/Lite/Full sections — I don't like 'coming soon', and instead could be just the different versions so that you can use what fits for your machine. Or run the Brick Wall and challenge Destiny with FULL on only 16GB. Up to you."*

**Knight: please replace any internal-naming (premium-gpu, standard-cpu, etc.) in the lookup table with the canonical user-facing tile names: ULTRA / FULL / CORE / LITE / NANO.** Internal-naming can remain in code as `ramTier` field values if needed, but UI surfaces show ONLY the tile names.

Settings UI changes from the original M18 spec:
1. **Retire all "COMING SOON" labels on the CORE and LITE tiles** — they are now real, shipping in v0.5.17. Each tile carries its tagline + default model.
2. **Auto-selected tile shows green "ACTIVE" tag** (existing UX preserved).
3. **Tiles ABOVE auto-recommendation are NOT dimmed — they are clickable with a "Challenge Destiny" amber-warning modal** instead of a hard-block. Original spec said dim/lock; revised per BP091 Brick Wall ratify: user MAY override up to any tier they want. UI says "This tile may OOM on your machine — Challenge Destiny? [Yes, I accept risk] [Back to auto]".
4. **Auto-selection banner at top of section:** "Ah Hayelped picked **CORE (Gemma 2 9B)** for your machine · 15.8 GB RAM. [Why?] [Change tile]" — the [Why?] expands to show RAM/VRAM detected + the canon §3.1 row that applied.

Canon table updated to the 5-tile names — re-read the canon for the authoritative lookup.

**Model:** Sonnet 4.6 (Knight execution). Bishop strategist composed.

---

## IMPLEMENTATION STATUS — 2026-06-22 ~13:49 Central

- Block 1 (hardware detect — VRAM + 5-tier NANO/LITE/CORE/FULL/ULTRA) — ✅ COMPLETE
- Block 2 (auto-select on launch + peer_presence alignment + IPC handlers) — ✅ COMPLETE
- Block 3 (Settings UI — "Ah Hayelped" caption + "Challenge Destiny" modal + auto-selected banner) — ✅ COMPLETE
- SkuUpgradePanel.tsx (LITE/CORE comingSoon retired, ULTRA added, order corrected) — ✅ COMPLETE
- version bump 0.5.17 (package.json + version_trust.json) — ✅ COMPLETE
- Block 4 (mesh tier-aware routing) — 🔲 PENDING next session
- Block 5 (THUNDERCLAP receipt fleet_composition) — 🔲 PENDING next session
- Block 6 (installer build + Tower deploy + curl verify) — ✅ COMPLETE · commit dfce433
  - Canonical: https://mnemosynec.org/download/MnemosyneC-Setup-0.5.17.exe · HTTP 200
  - Mirror: https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.17.exe · HTTP 200
  - SHA-256: f5d7eac8d7ea6173f8544747185ba627c8046fbc0aa348efebd7217d28bd4278 · 515.0 MB
  - config-mnemosynec.toml baseURL updated to https://mnemosynec.org/ (canonical domain migration complete)

---

## URGENCY

Founder's son is awake and waiting to install v0.5.17 the moment it ships. M13 fleet test depends on this build. Ship target: tonight, Central time.

## FOUNDER DIRECT (verbatim · BP091 2026-06-22 ~13:15-13:30 Central)

> *"Mnemosynec should 1. choose the best option for that particular computer and 2. Be able to run with rightsized assignments per."*
>
> *"I would not give my daughter a 100lbs bag of flour to carry, but I would carry it myself. And we can both help."*
>
> *"He is staying awake to install the next version so we can test it. Make Knight prompt NOW for .5.17 that has all that in there?"*

Canon: `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md` — read in full, this dispatch is its first implementation.

---

## EMPIRICAL STATE (gadget-confirmed by Bishop 2026-06-22 18:32 UTC)

| Peer | RAM | VRAM | UI tier | Actual ollamaModel | Status |
|---|---|---|---|---|---|
| `d0b47bd08633385b` (Founder) | 31.9 GB | premium-gpu | FULL | `gemma4:12b` | aligned ✅ |
| `88cbf6bdd6f74587` | 31.9 GB | premium-gpu | FULL (assumed) | `gemma4:12b` | aligned ✅ |
| `cb4ef450cc4a18c3` | 61.6 GB | premium-gpu | FULL (assumed) | `gemma4:12b` | aligned ✅ |
| `49f3e5971518a064` (Son) | 15.8 GB | unknown | UI shows FULL | `qwen2.5:7b` | **MISALIGNED — UI lies** |

**Empirical bug confirmed:**
1. Son selected FULL tier in MnemosyneC v0.5.16 settings — UI showed "ACTIVE · Google's Gemma 4 12B".
2. Son fully quit and relaunched MnemosyneC — `capabilities.ollamaModel` stayed `qwen2.5:7b`.
3. Founder ran `ollama run gemma4:12b` from terminal directly on Son's box — "loaded for a second" then dumped to `/?` help prompt = OOM on 16 GB.
4. Founder ran `ollama run gemma2:9b` — model answered "hello" cleanly. gemma2:9b is now resident in ollama on Son's box.
5. MnemosyneC v0.5.16 still reports `qwen2.5:7b` (gadgeted post-test). MnemosyneC's tier picker is decoupled from ollama reality.

---

## SCOPE — v0.5.17 = v0.5.16 + Right-Sized Auto-Detect

### Block 1 — Hardware Detection Module (Electron main process)

New file: `src/main/hardware-detect.ts` (or appropriate path in the Electron app — Knight uses existing conventions).

Function `detectHardwareTier()`:
1. `os.totalmem()` → RAM in bytes → convert to GB.
2. VRAM detection — best-effort cross-platform:
   - Windows: `wmic path win32_VideoController get AdapterRAM` (parses dedicated VRAM)
   - macOS: `system_profiler SPDisplaysDataType -json` → parse `spdisplays_vram`
   - Linux: `nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits` if NVIDIA, else `lspci -v | grep -i vga` fallback
   - If detection fails → `vramGb = null` (treated as "unknown" = assume weak)
3. Return `{ ramGb, vramGb, ramTier, recommendedModel, cooperativeTier }` per canon §3.1 table:

```ts
function rightSize(ramGb: number, vramGb: number | null): RightSize {
  const goodGpu = vramGb !== null && vramGb >= 6;
  if (ramGb >= 48) return { ramTier: 'ultra', model: 'gemma4:12b', coopTier: 'FULL+' };
  if (ramGb >= 24 && goodGpu) return { ramTier: 'premium-gpu', model: 'gemma4:12b', coopTier: 'FULL' };
  if (ramGb >= 24 && !goodGpu) return { ramTier: 'premium-cpu', model: 'gemma2:9b', coopTier: 'MEDIUM-FAST' };
  if (ramGb >= 12 && goodGpu) return { ramTier: 'standard-gpu', model: 'gemma2:9b', coopTier: 'MEDIUM' };
  if (ramGb >= 12 && !goodGpu) return { ramTier: 'standard-cpu', model: 'gemma2:9b', coopTier: 'MEDIUM', note: 'cpu_inference_slow_2_5_tok_per_sec' };
  if (ramGb >= 8) return { ramTier: 'lite', model: 'gemma2:2b', coopTier: 'LITE' };
  return { ramTier: 'nano', model: null, coopTier: 'NANO', readOnly: true };
}
```

Surface a config-override file `~/.mnemosynec/right-size.json` so power users can pin a different model — but UI must show "OVERRIDE ACTIVE · auto would have chosen X" prominently.

### Block 2 — Auto-Select on Launch

In the Electron main process startup sequence:
1. After ollama is confirmed reachable, call `detectHardwareTier()`.
2. Compare result to current persisted tier setting:
   - First launch (no persisted setting) → auto-select recommended model + show "We picked MEDIUM (Gemma 2 9B) for your machine. [Change]" toast on first foreground.
   - Subsequent launch where persisted ≠ recommended:
     - If persisted is HIGHER than recommended (user manually escalated past their hardware) → show **modal block** "Your machine can't safely run [model]. We're falling back to [right-sized model]. [Override anyway · accept risk] [OK]" — modal blocks UI until acknowledged.
     - If persisted is LOWER than recommended → silent allow (user wants to be gentle on their hardware).
3. Pull the recommended model via `ollama pull <model>` if not already present — show progress UI.
4. Start ollama serving the recommended model (`ollama run <model>` or equivalent API call).
5. **Update peer_presence.capabilities.ollamaModel** to reflect the actual served model, NOT the tier setting. This closes the UI-lies bug.

### Block 3 — Settings UI

Modify the Settings → AI POWER TIER section (Founder + Son's screenshots are reference):

1. Top of section: **"Auto-selected for your hardware: MEDIUM (Gemma 2 9B) · 15.8 GB RAM, weak VRAM"** — large, prominent, green-checkmark style.
2. Below: existing tier tiles (NANO / LITE / MEDIUM / FULL / FULL+) — but tiles that exceed hardware are shown DIMMED with a lock icon and tooltip "Your hardware can't safely run this. [Override anyway]".
3. Clicking a dimmed/locked tile opens the modal from Block 2 step 2.
4. Currently-active tile shows green "ACTIVE" tag (existing UX preserved).
5. If user override is active → show a "warning chip" near the top: "Override active. Auto-recommendation: MEDIUM. [Restore auto]".

### Block 4 — Mesh Orchestrator Tier-Aware Routing (per canon §3.2)

In the Bishop dispatch / MIC fleet broadcast path (Knight identifies the file):
1. Read each peer's `peer_presence.capabilities.ramTier` AND `ollamaModel` at dispatch time.
2. Tag each MMLU-Pro / THUNDERCLAP question with a `difficulty_tier` (HARD / MEDIUM / SHORT) — Knight defines the heuristic based on existing domain metadata or token count.
3. Route HARD/long-context questions only to peers with `coopTier ∈ {FULL+, FULL, MEDIUM-FAST}`.
4. Route MEDIUM questions to `coopTier ∈ {FULL+, FULL, MEDIUM-FAST, MEDIUM}`.
5. Route SHORT/verification questions to any tier including LITE.
6. Never silently exclude a peer — every peer gets work at its tier; receipts log it.

### Block 5 — THUNDERCLAP Receipt Template (per canon §3.3)

Modify the receipt-emit code path (Knight identifies — likely in the THUNDERCLAP orchestrator):
1. Include a `fleet_composition` block in every receipt:
   ```json
   "fleet_composition": [
     { "peer_id": "d0b...85b", "ramTier": "premium-gpu", "model": "gemma4:12b", "questions_handled": 18, "questions_correct": 16 },
     { "peer_id": "49f...064", "ramTier": "standard-cpu", "model": "gemma2:9b", "questions_handled": 12, "questions_correct": 9 },
     ...
   ]
   ```
2. Aggregate scores: per-tier AND fleet-wide.
3. Receipt headline auto-generates: "Free cooperative tiered substrate scored X% on MMLU-Pro 70Q (Y peers across Z tiers — commodity hardware works)."

### Block 6 — Build + Release v0.5.17

1. Version bump: `package.json` + `version_trust.json` (the canonical Tower data source per `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090`).
2. Build NSIS installer per existing pipeline.
3. Upload `.exe` to `mnemosynec.ai/download/MnemosyneC-Setup-0.5.17.exe` (Firebase Hosting).
4. Update `version_trust.json.versions[].latest` to `0.5.17` so Tower download surface reflects it.
5. Re-deploy Hugo: `firebase deploy --only hosting:mnemosyne`.
6. Post-deploy verify: `curl -I https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.17.exe` returns 200, correct size, Content-Disposition: attachment.

### Block 7 — Empirical Smoke (Founder + Son test)

1. Founder downloads + installs v0.5.17 on his machine. Expected: auto-select sticks at FULL (Gemma 4 12B) per 31.9 GB premium-gpu detection. peer_presence shows aligned UI + actual model.
2. Son downloads + installs v0.5.17 on his 16 GB box. Expected: auto-select picks MEDIUM (Gemma 2 9B), UI shows "Auto-selected for your hardware", Son's peer_presence updates to `gemma2:9b` (NOT qwen2.5:7b).
3. Bishop gadgets peer_presence post-install — confirms 4 of 4 peers have aligned UI + actual model.
4. Knight returns KniPr with build SHA, install verification screenshots from both machines, peer_presence snapshot.

---

## VERIFICATION GATES (T1-T15)

| # | Gate | Pass criteria |
|---|---|---|
| T1 | RAM detect | Returns correct GB on Founder + Son machines |
| T2 | VRAM detect (Windows wmic path) | Returns dedicated VRAM or null on each machine |
| T3 | rightSize() function | Unit-test passes for all 7 branches in lookup table |
| T4 | First-launch auto-select | Fresh install on Son's box picks gemma2:9b without UI interaction |
| T5 | Persistent-vs-recommended modal | Modal blocks UI on second launch if persisted > recommended |
| T6 | Lower-than-recommended silent allow | User-selected NANO on a premium box stays NANO without modal |
| T7 | ollama pull on missing model | If gemma2:9b not present, pulls it; progress UI shown |
| T8 | peer_presence alignment | After launch, capabilities.ollamaModel matches active model |
| T9 | Settings UI dimmed tiles | FULL tile is dimmed on Son's box; clicking opens override modal |
| T10 | Override warning chip | Persisted override surfaces "Restore auto" affordance |
| T11 | Tier-aware routing | Dispatcher routes HARD questions only to premium-tier peers |
| T12 | Receipt fleet_composition | THUNDERCLAP receipts contain per-peer model + scores |
| T13 | Tower download serves 0.5.17 | mnemosynec.ai/download/MnemosyneC-Setup-0.5.17.exe HTTP 200 |
| T14 | version_trust.json updated | "latest" entry reflects 0.5.17 |
| T15 | Founder + Son real install | Both machines run v0.5.17 with aligned peer_presence |

---

## OUT OF SCOPE

- M17 join React island — separate Marathon, fires independently.
- M11 license click-through gates — separate Marathon, fires independently.
- Bishop dispatcher full refactor — only the routing-by-tier hook is in scope here; broader dispatcher rewrite deferred.
- Adding new tiers beyond the canon §3.1 table — additions land in a future Marathon.
- Heuristic for question difficulty tier — Knight may use a simple token-count threshold for first ship; refine later.

---

## DEPENDENCIES + COMPOSITION

- **Composes with M17 / M11** — none of these touch the same files. Knight can interleave.
- **Composes with `canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091`** — this Marathon IS the first implementation of that canon.
- **Composes with `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090`** — version bump path uses the canonical data source.
- **Closes the empirical bug surfaced this session** — UI tier picker decoupled from ollama reality.
- **Sonnet 4.6 throughout** per BP091 Founder-direct + ongoing standing order.

---

## ESTIMATED WALL CLOCK

- Block 1 (hardware detect): 1-2 hrs
- Block 2 (auto-select + ollama integration): 2-3 hrs
- Block 3 (Settings UI): 1-2 hrs
- Block 4 (mesh tier-aware routing): 1-2 hrs
- Block 5 (receipt template): 30 min - 1 hr
- Block 6 (build + Tower deploy): 30 min - 1 hr
- Block 7 (Founder + Son empirical smoke): 30 min - 1 hr
- T1-T15 verification: 1 hr
- **Total: 7-12 hrs single Knight session**

If Knight is already loaded with M17 and M11 + this M18 at 46% context, suggest interleave order: M18 Block 1+2+3 first (Son is waiting) → M17 Blocks 1-5 → M11 Blocks 1+2+3+4 → M18 Block 4+5 → M18 Block 6+7 ship.

---

## RATIFICATION GATES (Founder)

| # | Gate | Status |
|---|---|---|
| R1 | Right-size lookup table per canon §3.1 (with kid's VRAM-poor branch added) | **RATIFIED 2026-06-22** |
| R2 | Auto-select on launch + modal warning for hardware-exceed override | **RATIFIED 2026-06-22** |
| R3 | UI tile dimming + "Auto-selected for your hardware" prominence | **RATIFIED 2026-06-22** |
| R4 | Mesh orchestrator tier-aware routing in this same ship | **RATIFIED 2026-06-22** |
| R5 | THUNDERCLAP receipt template change to log per-peer model | **RATIFIED 2026-06-22** |
| R6 | v0.5.17 version bump + Tower upload tonight Central time | **RATIFIED 2026-06-22** |
| R7 | Brick Wall #3 — fires after M17 lands (or interleaves if Knight chooses) | **RATIFIED 2026-06-22** |
| R8 | Policy name "Ah Hayelped" applied to user-facing surfaces (Settings copy, receipt headlines, internal docs) | **RATIFIED 2026-06-22** |

---

## ANTICIPATED RETURN ARTIFACTS

Knight's KniPr return MUST include:
1. SHA-256 of v0.5.17 installer + download URL verified live
2. version_trust.json diff confirming "latest" = 0.5.17
3. Screenshots from BOTH Founder and Son's machines showing aligned UI + peer_presence
4. peer_presence REST snapshot (gadget) showing all 4-5 peers with aligned `capabilities.ollamaModel` matching their actual served model
5. Sample THUNDERCLAP receipt with `fleet_composition` block populated
6. T1-T15 gate pass/fail table
7. Time-to-ship (start/end timestamps)

— Bishop Opus 4.7 · BP091 · 2026-06-22 · Sonnet 4.6 SEG composed · Knight Sonnet 4.6 executes · *Each carries what they can. And we can both help.*
