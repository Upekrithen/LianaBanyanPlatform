# KNIGHT YOKE -- BLACK MAMBA -- GEMMA BRAIN SWAP AND TRIAL -- BP087

## §0 Header

**Stream:** BLACK MAMBA -- Gemma Brain-Swap + Gemma-only Trial Mode
**Session:** BP087
**Class:** BLACK MAMBA -- empirical-proof event (Statutes §7 qualified)
**Model:** Sonnet 4.6 verbatim (Statutes §3 -- NEVER "4.5" per BP079) -- **use segs** on every stream
**Brick Wall pre-authorized scope:**
- Brain Registry file + schema + 5 seed entries persisted to electron-store
- BrainSwapSelector UI component (dropdown + smoke-test button + cost preview)
- SEG dispatcher routing bifurcation: flagship path via vendor API / local path via Ollama HTTP
- validate-relay.mjs `--flagship-tier` flag (gemma / claude / qwen / mistral)
- Receipt pair template scaffold (Pass A + Pass B side-by-side)
- Smoke pair-Trial dry-run: both passes captured

**NOT pre-authorized (requires Founder ratify):**
- Changing canonical numbers: 83.3% / Cost+20% / $5/yr -- these are Statutes §5 bylaws
- Production THUNDERCLAP fire (70Q live fleet -- gates on Founder ratify per A16)
- Publishing any receipt externally (paper / Substack / social)

**Statutes binding this yoke:** §2 IMMUTABLES (always-convenient, fix-as-we-go, build-for-the-long-haul) -- §3 Sonnet 4.6 verbatim -- §4 absolute paths only -- §14 gadget-first before asking Founder -- §15 Bishop-direct-Supabase (SEGs ship .sql only; Bishop applies via psql)

---

## §1 Context

Founder ratified that a Gemma-only Trial mode is INTEGRAL to MnemosyneC: orchestrator brain AND all SEG fan-outs use gemma4:12b exclusively, zero outbound API calls, so any user can run a full mesh benchmark with no spend. The companion canon being minted in SEG-J is `canon_gemma_only_mesh_trial_integral_to_mnemosynec_free_tier_flagship_comparison_bp087`.

The parent doctrine is `canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085`: orchestrator's own reasoning engine is hot-swappable per-task or per-session via a Brain Registry and CCI contract. That canon is currently doctrine spec -- NOT yet wired. This BLACK MAMBA wires it, starting with the Brain Registry, the Selector UI, the SEG dispatcher bifurcation, and the validate-relay flag that enables a paired Pass A (claude) + Pass B (gemma) Trial run under a single Trial ID.

Pre-flight gadget checks Knight MUST run before any SEG dispatches:
1. `curl http://127.0.0.1:11434/api/tags` -- confirm gemma4:12b is in the local Ollama model list
2. Read electron-store directly (or inspect the packaged app data path) to confirm no stale brain_registry key exists before seeding
3. Confirm `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs` exists (it does -- gadget-verified by Bishop)
4. Confirm dispatcher target file: `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ai_dispatch_ipc.ts` (confirmed exists) -- read routing logic before editing

---

## §2 SEG Fan-Out

Knight: **use segs Sonnet 4.6 verbatim** for ALL implementation work. Do not implement inline. Fan out immediately on receipt of this yoke.

**WAVE 1 -- five parallel SEGs:**

**SEG-A1: Brain Registry -- brain_registry.ts**
- Task: create `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\brain_registry\brain_registry.ts`
- TypeScript. ESM-compatible. `tsc -p tsconfig.main.json` must exit 0.
- Schema (export as TypeScript interface `BrainEntry`):
  ```
  brain_id: string        -- unique slug e.g. "claude-opus-4-7"
  vendor: string          -- "anthropic" | "google" | "ollama"
  model_id: string        -- exact model identifier sent to the API or Ollama
  kind: "flagship" | "local"
  api_endpoint: string    -- full base URL; for Ollama: "http://127.0.0.1:11434"
  cost_per_1k_tokens: number   -- USD; 0 for local
  capability_tier: number      -- 1 (lowest) to 5 (highest)
  status: "available" | "unavailable" | "unknown"
  ```
- Seed 5 entries in a constant `DEFAULT_BRAINS: BrainEntry[]`:
  ```
  { brain_id: "claude-opus-4-7",    vendor: "anthropic", model_id: "claude-opus-4-7",    kind: "flagship", api_endpoint: "https://api.anthropic.com", cost_per_1k_tokens: 0.015, capability_tier: 5, status: "available" }
  { brain_id: "claude-sonnet-4-6",  vendor: "anthropic", model_id: "claude-sonnet-4-6",  kind: "flagship", api_endpoint: "https://api.anthropic.com", cost_per_1k_tokens: 0.003, capability_tier: 4, status: "available" }
  { brain_id: "gemma4-12b",         vendor: "ollama",    model_id: "gemma4:12b",          kind: "local",    api_endpoint: "http://127.0.0.1:11434",    cost_per_1k_tokens: 0,     capability_tier: 2, status: "unknown"   }
  { brain_id: "qwen2-5-7b",         vendor: "ollama",    model_id: "qwen2.5:7b",          kind: "local",    api_endpoint: "http://127.0.0.1:11434",    cost_per_1k_tokens: 0,     capability_tier: 2, status: "unknown"   }
  { brain_id: "mistral-7b",         vendor: "ollama",    model_id: "mistral",             kind: "local",    api_endpoint: "http://127.0.0.1:11434",    cost_per_1k_tokens: 0,     capability_tier: 2, status: "unknown"   }
  ```
- Persistence: use `electron-store` (already a project dependency -- confirm via package.json before importing). Store key: `brain_registry`. On app init, if key absent, write DEFAULT_BRAINS. Expose: `getBrainRegistry(): BrainEntry[]` / `setBrainRegistry(entries: BrainEntry[]): void` / `getActiveBrainId(): string` / `setActiveBrainId(id: string): void`.
- Default active brain: "claude-sonnet-4-6".
- No em-dashes. Absolute import paths or relative to the new directory.

**SEG-A2: Brain Selector UI -- BrainSwapSelector.tsx**
- Task: create `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\BrainSwapSelector.tsx`
- React + TypeScript. Must match the existing renderer component conventions (inspect one neighboring component before writing for import style and CSS approach).
- UI elements:
  1. Dropdown listing all 5 registered brains. Each option shows: `{brain_id} [{kind}] -- ${cost_per_1k_tokens}/1k tokens` (0 shown as "$0.00/1k (free)")
  2. "Current orchestrator brain" badge next to the active selection
  3. Cost-per-1k preview line below the dropdown (updates on selection change)
  4. "Test this brain" button: fires a single smoke question against MMLU-Pro (question text hardcoded: "What is the speed of light in a vacuum? A) 3x10^8 m/s B) 3x10^6 m/s C) 3x10^10 m/s D) 3x10^4 m/s") via IPC call to main process; displays raw response or error inline
  5. If selection changes mid-session (active_brain_id changes from current runtime value): show a banner "Brain swap will take effect on next session restart." Do NOT force-quit.
- On selection write: call IPC to set active brain id; update electron-store via SEG-A1 exported setter.
- `tsc -p tsconfig.renderer.json` must exit 0 (or the project equivalent -- Knight reads tsconfig files to confirm the correct config name).
- No em-dashes.

**SEG-B: SEG Dispatcher Routing Bifurcation**
- Task: read `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ai_dispatch_ipc.ts` fully before editing
- Add routing bifurcation: when `getActiveBrainId()` resolves to a brain with `kind: "local"`, dispatch via local Ollama HTTP instead of the Anthropic/vendor API path
- Local Ollama path: POST to `http://127.0.0.1:11434/api/chat` with body:
  ```json
  { "model": "{model_id}", "messages": [{...}], "stream": false }
  ```
- Normalize both paths to a shared `SEGResultEnvelope`:
  ```typescript
  interface SEGResultEnvelope {
    brain_id: string
    kind: "flagship" | "local"
    model_id: string
    content: string
    input_tokens: number | null   -- null for local (Ollama does not always report)
    output_tokens: number | null
    latency_ms: number
    error: string | null
  }
  ```
- Flagship path returns the same envelope, populated from the vendor API response.
- No breaking change to existing callers: wrap the return type additively; if existing callers destructure `content` only, they still get `content`.
- Surface any type conflicts INLINE in the return template -- do NOT silently suppress.
- `tsc -p tsconfig.main.json` exit 0.
- No em-dashes.

**SEG-C: validate-relay.mjs -- flagship-tier flag**
- Task: read `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs` fully before editing
- Add `--flagship-tier=<claude|gemma|qwen|mistral>` flag
- When `--flagship-tier=gemma` (or qwen or mistral):
  - Skip ALL Anthropic API calls (do not call `api.anthropic.com`)
  - Set orchestrator brain to local gemma4:12b (or specified model) for all orchestrator reasoning
  - Set ALL SEG fan-out calls to the same local model via Ollama HTTP
  - Same 70Q domain-affinity routing applies
  - Same Plow-on-mesh path (if wired) applies -- local model only
  - Same Star Chamber escalation applies via local Ollama (mesh_benchmark_verify stays local-only)
  - Receipt `flagship_tier` field: set to the flag value verbatim
- When `--flagship-tier=claude` (or flag absent): existing behavior unchanged -- Anthropic API path active
- Trial ID reuse: when both passes are run, they share a parent Trial ID. The output JSON from each pass includes:
  ```
  { "trial_id": "{TRIAL_ID}", "pass": "A" }   -- Pass A (claude or flagship)
  { "trial_id": "{TRIAL_ID}", "pass": "B" }   -- Pass B (gemma or local)
  ```
- Network inspection note in receipt: when `--flagship-tier=gemma`, script logs `[flagship-tier=gemma] Anthropic API SKIPPED` to stdout on each question that would otherwise have called the Anthropic endpoint. This makes zero-API-call verification possible by grepping the output.
- No em-dashes. Minimal diff to existing validate-relay.mjs structure.

**SEG-D: Receipt Pair Template**
- Task: create `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\receipt_pair_template.md`
- Scaffold for paired Pass A + Pass B receipts under one Trial ID
- Template fields (use `{PLACEHOLDER}` syntax):
  ```markdown
  # THUNDERCLAP Trial {TRIAL_ID} -- Paired Receipt
  ## Pass A: {PASS_A_FLAGSHIP_TIER} (flagship or claude)
  ## Pass B: {PASS_B_FLAGSHIP_TIER} (gemma or local)
  Session: BP087
  Fire date: {FIRE_DATE}

  ## Side-by-Side Comparison

  | Metric                  | Pass A ({PASS_A_MODEL})       | Pass B ({PASS_B_MODEL})       |
  |-------------------------|-------------------------------|-------------------------------|
  | Ensemble accuracy       | {PASS_A_ACCURACY}/70          | {PASS_B_ACCURACY}/70          |
  | Wall-clock total        | {PASS_A_WALL_CLOCK_MIN}m      | {PASS_B_WALL_CLOCK_MIN}m      |
  | Per-token cost (est.)   | ${PASS_A_COST_USD}            | $0.00 (local)                 |
  | TTFT delta (first token)| {PASS_A_TTFT_MS}ms            | {PASS_B_TTFT_MS}ms            |
  | Anthropic API calls     | {PASS_A_API_CALLS}            | 0 (SKIPPED)                   |

  ## Domain Breakdown

  | Domain              | Pass A Score | Pass B Score |
  |---------------------|--------------|--------------|
  | {DOMAIN_01}         | {A_D01}/5    | {B_D01}/5    |
  | {DOMAIN_02}         | {A_D02}/5    | {B_D02}/5    |
  | {DOMAIN_03}         | {A_D03}/5    | {B_D03}/5    |
  | {DOMAIN_04}         | {A_D04}/5    | {B_D04}/5    |
  | {DOMAIN_05}         | {A_D05}/5    | {B_D05}/5    |
  | {DOMAIN_06}         | {A_D06}/5    | {B_D06}/5    |
  | {DOMAIN_07}         | {A_D07}/5    | {B_D07}/5    |
  | {DOMAIN_08}         | {A_D08}/5    | {B_D08}/5    |
  | {DOMAIN_09}         | {A_D09}/5    | {B_D09}/5    |
  | {DOMAIN_10}         | {A_D10}/5    | {B_D10}/5    |
  | {DOMAIN_11}         | {A_D11}/5    | {B_D11}/5    |
  | {DOMAIN_12}         | {A_D12}/5    | {B_D12}/5    |
  | {DOMAIN_13}         | {A_D13}/5    | {B_D13}/5    |
  | {DOMAIN_14}         | {A_D14}/5    | {B_D14}/5    |

  ## Inequality Trinity Check
  Free WITH Substrate > Flagship WITHOUT Substrate
  (Pass B gemma-on-substrate accuracy vs flagship accuracy baseline: see scores above)
  Flagship WITH Substrate = BROKE THE SOUND BARRIER

  ## Peer Topology (LAN-as-WAN per canon)
  Relay: relay.lianabanyan.com
  Peers: M0 -- M1 -- M2 -- M3 -- M4
  All traffic via WAN roundtrip (LAN-direct optimization deferred)

  ## Verdict
  Pass A: {PASS_A_VERDICT}
  Pass B: {PASS_B_VERDICT}
  ```
- No em-dashes in the template itself.

---

## §3 File Targets

All paths absolute. Knight confirms parent directories exist before creating files.

| Action | Absolute Path |
|--------|---------------|
| CREATE (dir + file) | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\brain_registry\brain_registry.ts` |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\renderer\components\BrainSwapSelector.tsx` |
| EDIT | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\ai_dispatch_ipc.ts` |
| EDIT | `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs` |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\receipt_pair_template.md` |

**WAVE 2 -- one integration SEG (after WAVE 1 complete):**

**SEG-E: Smoke Pair-Trial Dry-Run**
- Task: run both passes back-to-back under a shared Trial ID with `--mode=smoke --questions=5`
- Pass A: `node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs --flagship-tier=claude --mode=smoke --questions=5 --trial-id={SHARED_ID} --pass=A`
- Pass B: `node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs --flagship-tier=gemma --mode=smoke --questions=5 --trial-id={SHARED_ID} --pass=B`
- Verify Pass B output contains the line `[flagship-tier=gemma] Anthropic API SKIPPED` (zero API calls confirmed)
- Populate the receipt pair template with both results and save to:
  `C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_SMOKE_PAIR_{timestamp}\SMOKE_PAIR_RECEIPT.md`
- No em-dashes.

---

## §4 Acceptance Gates

**gadget-first before asking Founder.** Run every gate via gadget and report observed values, not estimates.

**Gate 1 -- Brain Registry seeded:**
```
node -e "const Store = require('electron-store'); const s = new Store(); console.log(JSON.stringify(s.get('brain_registry'), null, 2))"
```
Expected: JSON array with 5 entries; all required fields present; `active_brain_id` key set to "claude-sonnet-4-6"

**Gate 2 -- BrainSwapSelector renders:**
- Launch MnemosyneC app; navigate to settings panel; confirm dropdown lists all 5 brains
- Confirm "Test this brain" button visible; click it with gemma4-12b selected; confirm response or error displays inline within 30s
- Observed: dropdown option count = 5; smoke response: GREEN (HTTP 200 + JSON) or error message surfaced (not silent)

**Gate 3 -- SEG dispatcher routes to gemma4:12b via local Ollama:**
```
# With active brain set to "gemma4-12b" in electron-store, fire a single dispatch via the app's Ask tab
# Observe: response arrives; main.log contains "[brain=gemma4-12b] [kind=local] [endpoint=http://127.0.0.1:11434]"
Get-Content "$env:APPDATA\MnemosyneC\logs\main.log" -Tail 30 | Select-String "brain=gemma4"
```
Expected: at least 1 matching log line; HTTP 200 from Ollama; SEGResultEnvelope returned with `kind: "local"`

**Gate 4 -- validate-relay.mjs --flagship-tier=gemma smoke completes without Anthropic API call:**
```
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\validate-relay.mjs --flagship-tier=gemma --mode=smoke --questions=5
```
Expected: script completes; stdout contains `[flagship-tier=gemma] Anthropic API SKIPPED` on each question (verify by grep); exit code 0 or 1 (content-dependent); NO outbound call to `api.anthropic.com` (confirm by grepping log for any 401/200 from anthropic domain -- expect zero)

**Gate 5 -- Receipt pair template produced:**
```
Test-Path C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\receipt_pair_template.md
```
Expected: True; file contains `{TRIAL_ID}` placeholder; no em-dashes in file content

**Gate 6 -- TSC clean:**
```
cd C:\Users\Administrator\Documents\LianaBanyanPlatform ; npx tsc -p tsconfig.main.json --noEmit
```
Expected: exit code 0; zero errors

**Gate 7 -- Smoke pair-Trial dry-run (WAVE 2 gate):**
- Both Pass A and Pass B complete with `--mode=smoke --questions=5`
- Pass B output contains `[flagship-tier=gemma] Anthropic API SKIPPED`
- Smoke pair receipt MD exists at Asteroid-ProofVault receipts path
- Side-by-side table populated with observed values (not placeholder text)

**Gate 8 -- Assert scripts pass green:**
```
node C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\assert\run-all-asserts.mjs
```
Expected: all assert scripts exit 0 (or Knight notes any pre-existing amber asserts by name -- do not silently swallow new failures)

---

## §5 Drift Surface Protocol (BP053 inline)

If SEG-A1 finds that `electron-store` is not in `package.json` dependencies: surface INLINE, propose the exact `npm install` command, halt until Bishop confirms.

If SEG-A2 finds that the renderer tsconfig name differs from `tsconfig.renderer.json`: read the actual tsconfig files present, use the correct name, log the correction INLINE.

If SEG-B finds that `ai_dispatch_ipc.ts` uses a caller pattern that cannot absorb the `SEGResultEnvelope` additively without breaking existing callers: surface the specific lines, propose a narrowed wrapper approach, do NOT silently restructure existing callers.

If SEG-C finds that `validate-relay.mjs` already has a `--flagship-tier` flag with different semantics: report the existing implementation verbatim and escalate to Knight before overwriting.

If SEG-E finds that Ollama is not running or gemma4:12b is not loaded at smoke time: print `[Gate 4 AMBER] Ollama not reachable at http://127.0.0.1:11434 -- start Ollama and pull gemma4:12b before retrying`; do NOT fabricate a smoke result.

No estimates in return template. Empirical values only.

---

## §6 Composition with Prior Canons

- `canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085` -- parent doctrine; this yoke advances it from spec to wired (Brain Registry + Selector UI + dispatcher routing)
- `canon_gemma_only_mesh_trial_integral_to_mnemosynec_free_tier_flagship_comparison_bp087` -- SEG-J companion canon being minted in parallel; the `--flagship-tier=gemma` flag and receipt pair template are its operational expression
- `canon_free_with_substrate_flagship_inequality_trinity_bp085` -- the paired receipt template includes the Inequality Trinity block verbatim; Pass B is the empirical evidence for the "Free WITH Substrate" claim
- `canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085` -- Brain Registry + cost preview makes the "Consult, don't Rent" routing decision visible and user-controllable in the UI
- `canon_dedicated_sub_agent_one_role_comptroller_pattern_bp085` -- Brain Registry capability_tier and cost_per_1k_tokens fields feed the Comptroller's model-selection routing logic; Comptroller reads the Registry, not hardcoded model names
- `canon_broke_the_sound_barrier_substrate_metaphor_bp085` -- the receipt pair template's Inequality Trinity Check section echoes this canon; Pass A with substrate is the "broke the sound barrier" claim
- `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085` -- SEGs (SEG-A1 through SEG-E) are Callable Substrate Workers dispatched by Knight; this yoke follows the same dispatch pattern
- `canon_every_knight_dispatch_and_paste_prompt_must_say_use_segs_bp063` -- "use segs Sonnet 4.6 verbatim" required in every dispatch; see §2 above

---

## §7 Return Template

Knight returns this block filled with empirical values only. No estimates. No placeholders left unfilled.

```
BLACK MAMBA GEMMA BRAIN SWAP AND TRIAL -- BP087 RETURN RECEIPT

PHASE A -- Brain Registry
  Gate 1 brain_registry seeded 5 entries:       [ GREEN / AMBER / RED ] -- observed: {N} entries found
  brain_registry.ts created:                    [ GREEN / AMBER / RED ] -- absolute path: {path}
  electron-store key confirmed:                  [ GREEN / AMBER / RED ] -- key: brain_registry / active_brain_id
  Default active brain:                          {observed active_brain_id value}

PHASE A -- BrainSwapSelector UI
  Gate 2 dropdown lists 5 brains:               [ GREEN / AMBER / RED ] -- observed: {N} options
  "Test this brain" smoke response:             [ GREEN / AMBER / RED ] -- observed: {response or error verbatim}
  Mid-session swap banner:                       [ GREEN / AMBER / RED ] -- observed: {shown Y/N}
  BrainSwapSelector.tsx created:               [ GREEN / AMBER / RED ] -- absolute path: {path}

PHASE B -- SEG Dispatcher Routing
  Gate 3 dispatch routes to gemma4:12b Ollama:  [ GREEN / AMBER / RED ] -- observed log line: {verbatim}
  SEGResultEnvelope wired:                       [ GREEN / AMBER / RED ] -- existing callers broken: {Y/N}
  ai_dispatch_ipc.ts edited:                    [ GREEN / AMBER / RED ] -- diff summary: {one line}

PHASE C -- validate-relay.mjs flagship-tier flag
  Gate 4 gemma smoke 5Q completes:              [ GREEN / AMBER / RED ] -- observed exit code: {N}
  [flagship-tier=gemma] SKIPPED lines count:    [ GREEN / AMBER / RED ] -- observed count: {N} (expect 5)
  Anthropic API calls confirmed zero:           [ GREEN / AMBER / RED ] -- method: {grep / network log / key yanked}
  validate-relay.mjs edited:                    [ GREEN / AMBER / RED ] -- diff line count: {N}

PHASE D -- Receipt Pair Template
  Gate 5 template file exists:                  [ GREEN / AMBER / RED ] -- absolute path: {path}
  Em-dashes in template:                        [ GREEN / AMBER / RED ] -- count: 0 required

PHASE E -- Smoke Pair-Trial Dry-Run (WAVE 2)
  Gate 7 Pass A smoke 5Q result:                [ GREEN / AMBER / RED ] -- observed score: {N}/5
  Gate 7 Pass B smoke 5Q result:                [ GREEN / AMBER / RED ] -- observed score: {N}/5
  Pass B SKIPPED lines confirmed:               [ GREEN / AMBER / RED ] -- observed count: {N}
  Smoke pair receipt MD minted:                 [ GREEN / AMBER / RED ] -- absolute path: {path}

TSC / Asserts
  Gate 6 tsc -p tsconfig.main.json exit code:   [ GREEN / AMBER / RED ] -- observed: {0 or error lines}
  Gate 8 assert scripts all green:              [ GREEN / AMBER / RED ] -- observed: {pass count} / {total}

Files created:
  {list with absolute paths and line counts}

Files edited:
  {list with absolute paths and diff line counts}

Commit hash:
  {git commit hash after Knight commits, or PENDING}

Drift surface events:
  {any conflicts or escalations verbatim, or NONE}

BLACK MAMBA GEMMA BRAIN SWAP AND TRIAL: [ GREEN / AMBER / RED ]
```

---

## §8 Statutes Binding Header (echoed at dispatch open)

- **§2 IMMUTABLES:** Always convenient -- fix-as-we-go -- build-for-the-long-haul. Mint a small canon eblet at close. 100%-READ before any eblet write. Fix ONE thing FULLY before moving on.
- **§3 Sonnet 4.6 verbatim:** All SEG dispatches use Sonnet 4.6 verbatim. NEVER "4.5". NEVER substitute another model without Bishop ratify.
- **§4 Absolute paths:** Every file reference in every SEG prompt uses absolute paths. PowerShell `;` separator. Secrets blacklist: never log `C:\Users\Administrator\.claude\state\secrets\22May2026.env` values.
- **§14 gadget-first before asking Founder:** Run every acceptance gate via gadget. Local Ollama check: `curl http://127.0.0.1:11434/api/tags`. Brain Registry state: read electron-store directly. Report empirical results, not assumptions.
- **§15 Bishop-direct-Supabase:** Knight and SEGs do NOT apply DB schema changes. SEGs ship the `.sql` migration file only. Bishop applies via `psql`. No exceptions.

---

-- Bishop -- BP087 -- *Always convenient. Fix as we go. Build for the long haul. Use segs.*
