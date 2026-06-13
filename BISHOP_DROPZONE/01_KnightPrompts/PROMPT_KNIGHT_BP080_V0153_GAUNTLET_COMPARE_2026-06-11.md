# Knight Yoke — v0.1.53 · BP080 · 2026-06-11
# GAUNTLET COMPARISON — AI Selector · Re-run · Comparison Table · API Key Entry · Preset Reference Data
# Status: DRAFT — awaiting Founder explicit ratify before any ship action
# §2 Truth-Always · §3 Sonnet 4.6 ALL SEGs (hard binding) · Bishop orchestrator-only

---

## WAKE-UP PROMPT (paste to Knight before anything else)

> Knight, this is a v0.1.53 Yoke from Bishop, BP080, 2026-06-11.
> Founder wants to pick an AI on the Gauntlet result page, re-run the Gauntlet,
> and watch a comparison table build row-by-row — free local models next to
> paid subscriptions — to see the value of MnemosyneC substrate with his own eyes.
> Five SEGs. All Sonnet 4.6. Read every section of this file before writing one
> line of source. Statutes §2 and §3 apply. DRAFT until Founder says "ship it"
> in his own words.

---

## HARD BINDINGS (read before every SEG)

1. **§3 — ALL SEGs use Sonnet 4.6 verbatim.** Not Sonnet 3.7, not Haiku, not Opus. Sonnet 4.6.
2. **Bishop orchestrator-only** — Knight does ALL src edits, builds, and deploys. Bishop does not touch source files.
3. **Runtime evidence required** before marking any SEG complete (`feedback_actual_runtime_verify_for_runtime_bugs_bp078`).
4. **Every click gives visible feedback** — every button, every row action, the re-run button, the model selector — all must produce immediate visible feedback (`feedback_every_click_visible_feedback_canon_bp078`).
5. **Long-running progress + heartbeat** — the Gauntlet re-run is >3 s wall-clock; must show real progress or animated heartbeat while running — silence = broken (`feedback_long_running_progress_heartbeat_canon_bp078`).
6. **UX SEG mandatory screenshot capture** — every UX-touching SEG captures screenshot of affected surface on packaged-build install and embeds in yoke-return (`feedback_ux_seg_screenshot_mandatory_bp078`).
7. **DRAFT until Founder explicit ratify** — forward-pressure "ship it so we can move forward" ≠ GREEN (`feedback_forward_pressure_ratify_is_not_verified_ratify_bp080`).
8. **3 SHIP gates required** — bump firebase.json headers + 4 sweep files + deploy + HEAD verify + anon download verify (HTTP 200, >100 MB) (`reference_cephas_hugo_every_time_ship_rule_bp079`).
9. **Secrets canon §4** — API keys NEVER written to plaintext disk files. NEVER returned from IPC as values. Renderer sees status only (`AgentProbeStatus` pattern). Windows Credential Manager via `safeStorage` (Electron built-in). Mirror `lb_auth.ts` + `agent_probe.ts` patterns already in the codebase.
10. **Cost display = Cost + 20%** — any paid-model pricing shown to user is actual rate × 1.20. This is the cost canon. Do NOT show raw vendor rates.
11. **§4.6 Doctrine** — Ollama local is always the default selection; cloud AI = explicit opt-in. Never silently default to a paid model.

---

## CONTEXT — what Bishop found in the codebase

Read these summaries. Do NOT re-read files unless extending them.

### Gauntlet architecture (already in v0.1.52)

- **`src/renderer/components/GauntletTab.tsx`** — main Gauntlet component.
  - `GauntletPhase` type: `'idle' | 'mode-select' | 'running' | 'results'`
  - `stageResults: StageResult[]` — 6 stage rows rendered by `StageRow`
  - `totalBM` (cumulative Banyan Metric) shown in headline block at phase === `'results'`
  - `runGauntlet(mode)` — async loop over STAGE_DEFS, simulates each stage with `setTimeout`
  - `selectedModel: string` — current string (free text/not typed yet). This is the hook point for the AI selector.
  - **The result area (phase === `'results'`)** is where AI selector + re-run button + comparison table attach. They go BELOW the `totalBM` headline block and ABOVE (or after) the `BatteryDispatchShareToggle`.

- **`src/renderer/components/LeanGauntletTab.tsx`** — wraps `GauntletTab` inside `LeanFederationPanel`. The comparison feature sits inside `GauntletTab`, not in `LeanGauntletTab` — no changes needed to `LeanGauntletTab.tsx` itself unless passing props.

### MultiAISelector — existing component (DO NOT reuse directly)

- **`src/renderer/components/MultiAISelector.tsx`** — full multi-panel AI selector (Quick-Pick / Court / Single-Use / Rules / Parallel). This is the session-wide AI selector.
- **For the Gauntlet comparison, do NOT reuse this component.** The Gauntlet needs a stripped-down inline dropdown (just a `<select>` + label), not the full panel. Create a `GauntletModelSelect` sub-component inside `GauntletTab.tsx`. Keep it minimal.
- You may reuse the `MODELS` type pattern and the `§4.6 Doctrine` banner pattern from `MultiAISelector.tsx` as design reference for the dropdown styling.

### API key storage pattern — existing in codebase

- **`src/main/agent_probe.ts`** — `AgentProbeStatus` type, `KEYS_FILE` at `~/.lb_substrate/api_keys.json`, AES-256 via Node `crypto`. R16 blood rule: key values NEVER logged, NEVER returned to renderer.
- **`src/main/lb_auth.ts`** — `safeStorage`-encrypted session at `~/.mnemosyne/lb_session.enc`. Reference for Electron `safeStorage` usage pattern.
- **`src/main/index.ts` lines 1607–1648** — existing `prefs.apiKey` path sets `ANTHROPIC_API_KEY` via `envLoader.setRuntimeKey`. This is the pattern to extend for OpenAI + Google keys.
- The new IPC channel for Gauntlet key-set should be `gauntlet-set-api-key` and return `{ success: boolean; vendor: string }` — never the key value.

### Ollama model discovery

- **`src/main/index.ts`** — `OllamaManager` already exposes `listModels()`. Wire it via a new IPC channel `gauntlet-list-models` that returns `string[]` (model tag names) or `[]` on error.
- Minimum guaranteed models for the dropdown if `listModels()` fails or returns empty: `gemma4:12b`, `mistral:7b`, `qwen2.5:7b`, `llama3.1:8b`. These are the floor — show them grayed out as "(not detected)" but still selectable so the UI is never empty.
- "Ollama (no substrate)" sentinel: model id = `__ollama_base__`. This is a special entry meaning: run on Ollama without MnemosyneC substrate injection. Useful for honest COLD vs HOT A/B. Always present regardless of `listModels()` result.

### CADRE benchmark reference data

- **`librarian-mcp/r10_cross_vendor/results/CADRE_BENCHMARK_RESULTS_BP067.md`** — source of truth for pre-populated reference rows.
- Also: **`CADRE_BIG4_RESULTS_BP067_20260531_2224.md`** at project root — same data set.
- SEG-V0153-P1 reads this file and maps it into `ComparisonRow[]` format with `source: 'reference'`.
- Notes column for reference rows: `"Reference · BP067 · 2026-05-30 · kappa=0.936"`.

---

## SEG SPECIFICATIONS

---

### SEG-V0153-P0-AI-SELECTOR (Sonnet 4.6)

**Task:** Add an AI-selector dropdown to the Gauntlet result page (phase === `'results'`).

**Location:** `src/renderer/components/GauntletTab.tsx` — inside the `GauntletTab` function, rendered in the results phase BELOW the `totalBM` headline block.

**What to build — `GauntletModelSelect` sub-component (define inside `GauntletTab.tsx`):**

```
interface GauntletModelOption {
  id: string;          // e.g. "gemma4:12b" | "__ollama_base__" | "claude-opus-4" | "gpt-4o" | "gemini-15-pro"
  label: string;       // display label
  vendor: 'local' | 'anthropic' | 'openai' | 'google';
  costPer1k: number;   // USD · 0 for local · post-20%-markup for paid
  requiresKey: boolean;
  available: boolean;  // false = not detected / key missing → show grayed
}
```

**Model list (hardcoded initial set; auto-detected Ollama models appended via IPC):**

Local models (always shown):
- `{ id: '__ollama_base__', label: 'Ollama (no substrate — COLD baseline)', vendor: 'local', costPer1k: 0, requiresKey: false, available: true }`
- `{ id: 'gemma4:12b', label: 'gemma4:12b (Ollama)', vendor: 'local', costPer1k: 0, requiresKey: false, available: false }` — mark available=true only if detected via IPC
- `{ id: 'mistral:7b', label: 'mistral:7b (Ollama)', vendor: 'local', costPer1k: 0, requiresKey: false, available: false }`
- `{ id: 'qwen2.5:7b', label: 'qwen2.5:7b (Ollama)', vendor: 'local', costPer1k: 0, requiresKey: false, available: false }`
- `{ id: 'llama3.1:8b', label: 'llama3.1:8b (Ollama)', vendor: 'local', costPer1k: 0, requiresKey: false, available: false }`
- `{ id: 'llama3.3:70b', label: 'llama3.3:70b (Ollama)', vendor: 'local', costPer1k: 0, requiresKey: false, available: false }`

Paid models (shown only when key is present; otherwise shown with "(API key needed)" suffix):
- `{ id: 'claude-opus-4', label: 'Claude Opus 4 (Anthropic)', vendor: 'anthropic', costPer1k: 18.00, requiresKey: true, available: false }`
  — costPer1k = $15.00/1K output × 1.20 = $18.00
- `{ id: 'claude-sonnet-46', label: 'Claude Sonnet 4.6 (Anthropic)', vendor: 'anthropic', costPer1k: 4.80, requiresKey: true, available: false }`
  — $4.00/1K × 1.20 = $4.80
- `{ id: 'gpt-4o', label: 'GPT-4o (OpenAI)', vendor: 'openai', costPer1k: 6.00, requiresKey: true, available: false }`
  — $5.00/1K × 1.20 = $6.00
- `{ id: 'gemini-15-pro', label: 'Gemini 1.5 Pro (Google)', vendor: 'google', costPer1k: 4.20, requiresKey: true, available: false }`
  — $3.50/1K × 1.20 = $4.20

**On mount (useEffect):**
1. Call `window.amplify?.gauntletListModels?.()` → returns `string[]` of detected Ollama model tags. For each returned tag that matches a hardcoded id, set `available: true`. For tags not in the hardcoded list, append as new local entry.
2. Call `window.amplify?.gauntletGetKeyStatus?.()` → returns `{ anthropic: boolean; openai: boolean; google: boolean }`. For each vendor with `true`, set matching paid models to `available: true`.

**Render:**
- A `<select>` dropdown. Groups: `<optgroup label="Local (Free)">` and `<optgroup label="Paid API">`.
- Unavailable options: label suffixed with ` — not detected` (local) or ` — API key needed` (paid). Not disabled; user can still select them (triggers key-entry flow).
- `§4.6 Doctrine` note beneath: `"Local models are always free · Paid models require an API key · cost shown is per 1K tokens + 20%"`
- Default selected: current active Ollama model if detected, else `__ollama_base__`.
- On change: call `onModelSelect(option)` prop — parent `GauntletTab` stores as `compareModel: GauntletModelOption`.

**§4.6 visual indicator:** if a paid model is selected, show a warning badge: `"⚠ Paid API · ${formatCost(option.costPer1k)}/1K tokens"` in amber (`#fbbf24`). If local: `"✓ Free local · $0"` in green (`#6ee7b7`).

**Every-click feedback:** dropdown itself is native — no issue. The §4.6 indicator must update immediately on selection change (no delay).

**IPC channels to add (`src/main/index.ts`):**

```typescript
// gauntlet-list-models → string[]
ipcMain.handle('gauntlet-list-models', async () => {
  try {
    return await ollamaManager.listModels(); // already exists
  } catch { return []; }
});

// gauntlet-get-key-status → { anthropic: boolean; openai: boolean; google: boolean }
ipcMain.handle('gauntlet-get-key-status', async () => ({
  anthropic: !!process.env.ANTHROPIC_API_KEY,
  openai:    !!process.env.OPENAI_API_KEY,
  google:    !!process.env.GOOGLE_API_KEY,
}));
```

**Preload bridge additions (`src/main/preload.ts`):**
```typescript
gauntletListModels: () => ipcRenderer.invoke('gauntlet-list-models'),
gauntletGetKeyStatus: () => ipcRenderer.invoke('gauntlet-get-key-status'),
```

**Type declaration additions (`src/renderer/amplify.d.ts`):**
```typescript
gauntletListModels?: () => Promise<string[]>;
gauntletGetKeyStatus?: () => Promise<{ anthropic: boolean; openai: boolean; google: boolean }>;
```

**Acceptance:** Dropdown renders on the Gauntlet result page. Local detected models show as available (green). Paid models show "(API key needed)" when no key is set. Selecting a paid model with no key shows amber cost warning. Screenshot required.

---

### SEG-V0153-P0-RERUN-AND-APPEND (Sonnet 4.6)

**Task:** Add a "Re-run with this AI" button next to the selector. On click: run the same Gauntlet sequence on the selected model, then append a new row to the comparison table.

**Location:** `src/renderer/components/GauntletTab.tsx` — inside `GauntletTab`, results phase, below the `GauntletModelSelect` dropdown.

**Button:**
```tsx
<button onClick={handleCompareRun} disabled={isCompareRunning || !compareModel}>
  {isCompareRunning ? 'Running…' : 'Re-run with this AI ⚔️'}
</button>
```
- Disabled when: no model selected, or a compare run is already in progress.
- Style: matches existing `'Run Again'` button style (rgba(110,231,183,0.1) background, green border, green text).
- Visible feedback on click: button text changes to "Running…", spinner or animated dots.

**Progress during run (heartbeat canon):**
- While `isCompareRunning === true`, show an animated progress bar below the button. Minimum: a pulsing bar that fills over the estimated run duration (use 5 s as a safe estimate). Stages: show "Running Stage N of 6…" as each stage executes.
- Do NOT show a silent spinner. The progress bar must visually move.

**`handleCompareRun` async function:**
1. Set `isCompareRunning = true`.
2. Set `compareProgress: { stage: number; total: number }` state for the progress bar.
3. Run `runGauntletForCompare(compareModel)` — a variant of `runGauntlet` that:
   - Runs all 6 stages (or the same stage set as the original run)
   - Accepts `modelId: string` and passes it to the stage simulation
   - Derives COLD score (without substrate) and HOT score (with substrate) — see score note below
   - Returns `{ coldScore: number; hotScore: number; totalBM: number; durationMs: number }`
4. On completion: call `appendComparisonRow(result)` — appends a new `ComparisonRow` to the comparison table state.
5. Set `isCompareRunning = false`.

**COLD vs HOT scores:**
- In the current `runGauntlet`, `simulateBanyanMetric(stage)` returns stage-level BM scores. The comparison table needs a COLD (no substrate) and HOT (with substrate) reading.
- COLD score: run the stage simulation WITHOUT substrate boost applied (Stage 1 = raw baseline).
- HOT score: run WITH substrate boost (Stages 2–6 with their deltas applied).
- For the scaffolded simulation: COLD = `simulateBanyanMetric(1)` (Stage 1 BM only, as baseline); HOT = `totalBM` across all stages.
- These are placeholders — when real substrate calls replace `setTimeout`, COLD and HOT become real measurements.
- Lift = HOT − COLD (percentage points).

**State additions to `GauntletTab`:**
```typescript
const [compareModel, setCompareModel] = useState<GauntletModelOption | null>(null);
const [isCompareRunning, setIsCompareRunning] = useState(false);
const [compareProgress, setCompareProgress] = useState<{ stage: number; total: number } | null>(null);
const [comparisonRows, setComparisonRows] = useState<ComparisonRow[]>([]);
```

**`appendComparisonRow`:** prepends a `ComparisonRow` object with:
```typescript
{
  id: `run-${Date.now()}`,
  vendor: compareModel.vendor,
  modelId: compareModel.id,
  modelLabel: compareModel.label,
  costPer1k: compareModel.costPer1k,
  coldScore: result.coldScore,
  hotScore: result.hotScore,
  lift: result.hotScore - result.coldScore,
  timestamp: new Date().toISOString(),
  notes: '',
  source: 'user',
}
```
Then: persist updated rows to localStorage (see SEG-V0153-P0-COMPARISON-TABLE).

**Acceptance:**
- Click "Re-run with this AI" → visible "Running…" + animated progress bar with stage counter.
- On completion → new row appended to comparison table below.
- Original rows remain visible — accumulating comparison.
- All previous runs persist on app refresh.
- Screenshot required: mid-run state AND post-run table with new row.

---

### SEG-V0153-P0-COMPARISON-TABLE (Sonnet 4.6)

**Task:** Create `GauntletComparisonTable.tsx`. Render a comparison table below the re-run button in the Gauntlet results phase.

**New file:** `src/renderer/components/GauntletComparisonTable.tsx`

**`ComparisonRow` type:**
```typescript
export interface ComparisonRow {
  id: string;
  vendor: 'local' | 'anthropic' | 'openai' | 'google';
  modelId: string;
  modelLabel: string;
  costPer1k: number;       // 0 for local; paid = actual × 1.20
  coldScore: number;       // COLD BM — no substrate
  hotScore: number;        // HOT BM — with substrate
  lift: number;            // hotScore − coldScore (pp)
  timestamp: string;       // ISO 8601
  notes: string;
  source: 'user' | 'reference';
}
```

**Columns:**

| Vendor | Model | Cost/1K | COLD | HOT (with substrate) | Lift | Timestamp | Notes |
|--------|-------|---------|------|----------------------|------|-----------|-------|

- **Vendor:** pill badge — `Local` (green `#6ee7b7`), `Anthropic` (purple `#a78bfa`), `OpenAI` (blue `#60a5fa`), `Google` (amber `#fbbf24`)
- **Model:** `modelLabel` — truncate at 32 chars with ellipsis
- **Cost/1K:** `$0.00` for local · `$X.XX` for paid (already ×1.20 stored) · show `"+20% margin"` tooltip on hover
- **COLD:** `X.X BM` · color `#94a3b8`
- **HOT:** `X.X BM` · color `#6ee7b7` (substrate green)
- **Lift:** `+X.X pp` · color: green if > 0, neutral if 0, red if negative (shouldn't happen but defensive)
- **Timestamp:** `HH:MM:SS · YYYY-MM-DD` local time
- **Notes:** plain text; reference rows show "Reference · BP067 · 2026-05-30 · kappa=0.936" in `#475569`

**Sorting:** default = newest first (most recent timestamp at top). Reference rows always at bottom, below all user runs.

**Empty state:** if no rows, show: `"Run the Gauntlet with different AIs above to build your comparison table."` in `#334155`.

**Header:** `"AI Comparison Table"` with sub-label `"Your runs accumulate here. Local free = no cost. Paid = API rate +20%. Substrate HOT score vs raw COLD."`.

**Persistence:**
```typescript
const LS_COMPARE_ROWS = 'mnemo_gauntlet_compare_rows';
// On mount: load from localStorage, parse, set state.
// On row append: serialize updated array to localStorage.
// Max 50 rows: oldest user rows pruned first (reference rows exempt from pruning).
```

**Row delete:** each row has a `×` delete button (right-aligned). Click → removes row from state + persists. Per every-click-feedback: button must visually confirm deletion (brief flash red before row disappears).

**Export button:** `"Export CSV"` button in the table header. On click → generates CSV of all visible rows and triggers download via `URL.createObjectURL(new Blob(...))`. File name: `gauntlet_comparison_${new Date().toISOString().slice(0,10)}.csv`. Visible feedback: button flashes "Downloading…" for 1 second.

**Props:**
```typescript
interface GauntletComparisonTableProps {
  rows: ComparisonRow[];
  onDeleteRow: (id: string) => void;
}
```
State is owned by `GauntletTab`. Table is a pure display component.

**Import in `GauntletTab.tsx`:**
```typescript
import { GauntletComparisonTable, ComparisonRow } from './GauntletComparisonTable';
```

**Acceptance:**
- Table renders correctly with columns as specified.
- Rows accumulate across re-runs.
- Table persists after app restart.
- Delete button removes row with visible feedback.
- Export CSV works and downloads a valid CSV file.
- Screenshot required.

---

### SEG-V0153-P0-API-KEY-ENTRY (Sonnet 4.6)

**Task:** When the user selects a paid model that has no API key set, show a key-entry modal. Store the key in Windows Credential Manager via Electron `safeStorage`. Never write plaintext to disk.

**Trigger:** user selects a paid model option where `available === false` AND `requiresKey === true`. After selection, `GauntletTab` immediately opens the key-entry modal for that vendor.

**New sub-component `GauntletApiKeyModal` (inside `GauntletTab.tsx`):**

```tsx
interface GauntletApiKeyModalProps {
  vendor: 'anthropic' | 'openai' | 'google';
  onSave: (vendor: string, keyStatus: boolean) => void;  // keyStatus = true if save succeeded
  onCancel: () => void;
}
```

**Modal content:**
- Header: `"Enter ${vendorName} API Key"`
- Sub-label: `"Your key is stored in Windows Credential Manager — never written to disk in plaintext."`
- Password `<input type="password">` field — label: `"API Key (starts with ${keyPrefix})"`
  - Anthropic: prefix `"sk-ant-"`
  - OpenAI: prefix `"sk-"`
  - Google: prefix `"AI"`
- "Save Key" button — disabled when field is empty.
- "Cancel" button — closes modal, reverts selector to previous selection.
- "Use without saving" link — allows one-shot use; key held in memory only for this run.
- Small note: `"Rate: ${formatCost(costPer1k)}/1K tokens (+20% shown). Key used only for Gauntlet runs on this machine."`

**On "Save Key" click:**
1. Visible feedback: button changes to "Saving…".
2. Call `window.amplify?.gauntletSetApiKey?.({ vendor, key: inputValue })`.
3. IPC handler `gauntlet-set-api-key` on main side:
   - Validate: key is non-empty string, starts with expected prefix (soft check — log warning if mismatch, do NOT block).
   - Store via `safeStorage.encryptString(key)` → write encrypted bytes to `~/.lb_substrate/gauntlet_keys/${vendor}.enc`. Directory created if absent.
   - Set `process.env[envVarName]` via `envLoader.setRuntimeKey(envVarName, key)`.
   - Return `{ success: true, vendor }`. NEVER return the key itself.
4. On success: modal closes, model option sets `available: true`, selector updates, toast: `"${vendorName} key saved — model ready"`.
5. On failure: toast: `"Key save failed — check the key and try again"` in red.

**"Edit / clear my keys" entry point:**
- Add a small `"Manage API keys →"` link in the Gauntlet comparison section header (visible only when at least one paid model has been configured). On click → opens the `GauntletApiKeyModal` for the configured vendor, but pre-filled with `"••••••••"` placeholder and a "Clear key" button instead of "Save Key".
- "Clear key": calls `window.amplify?.gauntletClearApiKey?.({ vendor })` → IPC deletes the `.enc` file and unsets `process.env[envVarName]`.

**IPC channels to add (`src/main/index.ts`):**

```typescript
// gauntlet-set-api-key
ipcMain.handle('gauntlet-set-api-key', async (_e, { vendor, key }: { vendor: string; key: string }) => {
  // 1. Validate prefix (soft)
  // 2. safeStorage.encryptString(key) → write to ~/.lb_substrate/gauntlet_keys/${vendor}.enc
  // 3. envLoader.setRuntimeKey(ENV_VARS[vendor], key)
  // 4. return { success: true, vendor }  — NEVER return key value
});

// gauntlet-clear-api-key
ipcMain.handle('gauntlet-clear-api-key', async (_e, { vendor }: { vendor: string }) => {
  // 1. Delete ~/.lb_substrate/gauntlet_keys/${vendor}.enc if exists
  // 2. delete process.env[ENV_VARS[vendor]]
  // 3. return { success: true, vendor }
});
```

ENV_VARS map:
```typescript
const ENV_VARS: Record<string, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai:    'OPENAI_API_KEY',
  google:    'GOOGLE_API_KEY',
};
```

**On app startup** (`src/main/index.ts` main init block): load all three `.enc` files if present → decrypt → `envLoader.setRuntimeKey(...)`. This restores keys across sessions without ever touching plaintext.

**Preload bridge additions:**
```typescript
gauntletSetApiKey: (args: { vendor: string; key: string }) => ipcRenderer.invoke('gauntlet-set-api-key', args),
gauntletClearApiKey: (args: { vendor: string }) => ipcRenderer.invoke('gauntlet-clear-api-key', args),
```

**Type declaration additions (`src/renderer/amplify.d.ts`):**
```typescript
gauntletSetApiKey?: (args: { vendor: string; key: string }) => Promise<{ success: boolean; vendor: string }>;
gauntletClearApiKey?: (args: { vendor: string }) => Promise<{ success: boolean; vendor: string }>;
```

**Acceptance:**
- Selecting Claude/GPT/Gemini with no key → modal appears immediately with correct vendor name and key prefix hint.
- Entering a key and saving → toast confirms, model available in selector.
- App restart → key is restored from encrypted store.
- "Clear key" removes the key; model reverts to "(API key needed)".
- Screenshot required: modal open state, and post-save state.

---

### SEG-V0153-P1-PRESET-COMPARISON-DATA (Sonnet 4.6)

**Task:** Pre-populate the comparison table on first paint with CADRE benchmark reference data so the table is "warm" rather than empty.

**Source files to read:**
- `librarian-mcp/r10_cross_vendor/results/CADRE_BENCHMARK_RESULTS_BP067.md`
- Fallback: `CADRE_BIG4_RESULTS_BP067_20260531_2224.md` at project root

**What to extract:** For each AI vendor tested in the CADRE results (Opus/Claude, GPT, Gemini, Ollama), extract:
- Model name / label
- COLD score (raw, no substrate — look for Stage 1 or "baseline" figures)
- HOT score (with substrate — look for "with substrate" or final BM figures)
- Date of test

**Map to `ComparisonRow[]`:**
```typescript
// Example mapping (adapt from actual CADRE data):
{
  id: 'ref-bp067-ollama',
  vendor: 'local',
  modelId: 'ollama-bp067',
  modelLabel: 'Ollama (gemma2:2b · BP067)',
  costPer1k: 0,
  coldScore: /* from CADRE data */,
  hotScore: /* from CADRE data */,
  lift: /* hotScore - coldScore */,
  timestamp: '2026-05-30T22:24:00.000Z',
  notes: 'Reference · BP067 · 2026-05-30 · kappa=0.936',
  source: 'reference',
}
```

**Storage key:** `mnemo_gauntlet_ref_rows` (separate from user rows). On mount, if this key is not set in localStorage, write the hardcoded reference rows. If already set, do NOT overwrite (user may have cleared them intentionally).

**In `GauntletTab`:** merge `refRows + userRows` for display. Reference rows appear at bottom, clearly distinguished by the "Reference" badge in the Notes column and a faint amber `#fbbf24` left-border on each reference row.

**Override guard:** if user runs a test with a model matching a reference row's `modelId`, their user row appears ABOVE the reference row, naturally showing the comparison. Do not auto-delete the reference row.

**Acceptance:**
- First-ever Gauntlet result page shows comparison table already populated with CADRE reference rows.
- Reference rows are visually distinct (amber left-border, "Reference" note badge).
- Running a new comparison adds a user row above reference rows.
- Screenshot required.

---

### SEG-V0153-VERIFY (Sonnet 4.6)

**Task:** Full clean-install verification sequence. Runtime evidence required for every step.

**Sequence:**

**(a) Baseline state — selector and table visible on result page**
1. Build packaged installer (NSIS `.exe`, standard release build).
2. Install on clean Windows machine (or fresh Windows user account with no prior MnemosyneC state).
3. Open app → navigate to Gauntlet tab → run a Gauntlet → reach results phase.
4. Confirm: AI selector dropdown is visible below the BM headline. Comparison table is visible with CADRE reference rows pre-populated.
5. Screenshot: result page with selector + pre-populated table.

**(b) Local model re-run → row appended**
1. Select `gemma4:12b` from the dropdown.
2. Click "Re-run with this AI".
3. Confirm: "Running…" state is visible with progress bar and stage counter.
4. Confirm: on completion, new row appears at top of table above reference rows.
5. Screenshot: mid-run progress AND post-run table.

**(c) Second model → another row**
1. Select `mistral:7b` from dropdown.
2. Click "Re-run with this AI".
3. Confirm: second new row appended above previous user row.
4. Screenshot: table with two user rows + reference rows.

**(d) Paid model (Claude API key entry)**
1. Select `Claude Sonnet 4.6 (Anthropic)` from dropdown.
2. Confirm: API key modal appears immediately (not after clicking "Re-run").
3. Enter a valid Anthropic API key.
4. Click "Save Key".
5. Confirm: toast "Anthropic key saved — model ready" visible.
6. Click "Re-run with this AI".
7. Confirm: cost-per-1K shown in the new row as `$4.80`.
8. Screenshot: key modal, then post-run row with cost displayed.

**(e) App refresh → table persists**
1. Close app completely.
2. Reopen app → navigate to Gauntlet → run Gauntlet again to reach results.
3. Confirm: all previous user rows are still visible (loaded from localStorage).
4. Screenshot: persisted table.

**(f) Key restore across sessions**
1. Confirm: without re-entering the API key, the Anthropic model still shows as `available: true` in the dropdown (key was restored from `.enc` file on startup).
2. Screenshot: dropdown with Anthropic model shown as available.

**Runtime evidence required for each step:** DevTools console output, screenshots, or Diagnostic log entries. Do NOT mark VERIFY complete on source inspection alone.

---

### SEG-V0153-SHIP (Sonnet 4.6)

**DRAFT. Knight does NOT self-stamp this gate.**

Three SHIP gates required per `reference_cephas_hugo_every_time_ship_rule_bp079`:

1. **Build gate:** clean `npm run build` (or equivalent), no TypeScript errors, no build warnings that weren't present before this yoke.
2. **Installer gate:** NSIS `.exe` installer builds and installs on target Windows machine; app launches; Gauntlet tab accessible.
3. **Cephas/Hugo deploy gate** (if web assets updated):
   - Bump `firebase.json` headers (cache-busting version bump)
   - Run all 4 sweep files
   - Deploy via Firebase CLI wrapper (not raw `gcloud`)
   - HEAD verify (HTTP 200, Content-Length > 0)
   - Anon download verify (no-auth HEAD, HTTP 200, >100 MB if applicable)

**Knight stages DRAFT only.** Returns yoke receipt with:
- Build log excerpt (last 20 lines)
- Screenshot of Gauntlet result page with comparison table populated
- File list of all changed/added files

Founder explicit "ship it" required before any public deploy.

---

## SCOPE BOUNDARIES — what this yoke does NOT include

- **Real API calls to paid models during Gauntlet run:** the Gauntlet `runGauntlet()` function currently uses `setTimeout` simulation. This yoke adds the selector, table, and key storage infrastructure — it does NOT wire live API calls. Live API call wiring is a separate future yoke. The comparison table will show simulated BM scores for paid model runs in this version; notes column should say `"Simulated · live API wiring in v0.1.5x"`.
- **Cross-platform secret storage (macOS/Linux):** the key storage uses Windows `safeStorage` + `.enc` file pattern. macOS/Linux compatibility is deferred — note in code comment: `// TODO: macOS = Keychain API via safeStorage; Linux = libsecret; scoped to v0.1.5x+`.
- **Rate-limit handling for paid APIs:** when live wiring lands, rate limiting becomes relevant. Out of scope for this yoke.
- **Pioneer Bonus for paid-model rows:** the comparison table shows Pioneer Bonus eligibility in the `notes` field as a passive indicator only — no modal fires from a comparison re-run. Pioneer flow remains triggered only from the main `runGauntlet()` Stage 3.

---

## BLACK MAMBA DISPATCH BLOCK

```
Knight — BP080 v0.1.53 · 2026-06-11 · GAUNTLET COMPARISON

You are Knight. This is a Bishop-issued Yoke. Use Sonnet 4.6 SEGs for ALL work.
No exceptions. Source edits, builds, deploys — all Knight. Bishop orchestrates only.

TARGET VERSION: v0.1.53
YOKE FILE: LianaBanyanPlatform/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_BP080_V0153_GAUNTLET_COMPARE_2026-06-11.md

READ THE FULL YOKE FILE before writing any source. Then execute in this order:

1. SEG-V0153-P0-AI-SELECTOR      — GauntletModelSelect dropdown + IPC channels
2. SEG-V0153-P0-COMPARISON-TABLE — GauntletComparisonTable.tsx new file + types
3. SEG-V0153-P0-RERUN-AND-APPEND — re-run button + progress + row append
4. SEG-V0153-P0-API-KEY-ENTRY    — key modal + safeStorage IPC + startup restore
5. SEG-V0153-P1-PRESET-COMPARISON-DATA — CADRE reference rows pre-populate
6. SEG-V0153-VERIFY              — clean-install runtime evidence sequence
7. SEG-V0153-SHIP                — DRAFT stage only. Do NOT self-stamp. Await Founder ratify.

HARD BINDINGS that override everything:
- Sonnet 4.6 for ALL SEGs — verbatim, no substitution
- Runtime evidence before marking any SEG complete
- Every click gives visible feedback (including re-run button, delete button, export button)
- Long-running Gauntlet run must show heartbeat progress — silence = broken
- API keys: safeStorage only, NEVER plaintext disk, NEVER returned from IPC as values
- Cost display = rate × 1.20 (Cost+20% canon)
- §4.6 Doctrine: Ollama local = default, paid = explicit opt-in
- DRAFT until Founder explicit "ship it" in his own words

RETURN a yoke receipt with:
- All changed/new files listed with absolute paths
- Build log excerpt (last 20 lines)
- Screenshots: (a) selector + pre-populated table, (b) mid-run progress, (c) post-run table with rows, (d) API key modal, (e) table after app restart
- Any anomalies encountered (rate-limit walls, safeStorage cross-platform gaps, simulated vs live API distinction)

STATUS: DRAFT. Await Founder ratify.
```

---

## KNOWN ANOMALIES (Bishop pre-identified — Knight confirm or escalate)

1. **API rate-limit risk on first live-wiring pass:** Anthropic/OpenAI/Google APIs all have per-minute token limits. When live API wiring lands (future yoke), the Gauntlet's 6-stage run could hit rate limits if stages fire in tight succession. Architecture note: add a `GAUNTLET_API_MIN_INTERVAL_MS = 500` constant as a future hook point. Not blocking for v0.1.53 (simulated runs).

2. **`safeStorage` Windows-only scope:** Electron's `safeStorage.encryptString` is available on Windows (uses DPAPI), macOS (uses Keychain), and Linux (uses libsecret if available). The `.enc` file approach works cross-platform for the encrypted bytes; the decryption is OS-bound. If the app is run on macOS by the Founder's son during mesh testing, the key file written on Windows is NOT portable. Add a note in code and yoke receipt. Not a blocker — keys re-enter per machine.

3. **`ollamaManager.listModels()` method name:** Bishop found `listModels()` referenced in the main process context. If the exact method name differs (e.g., `getModels()` or `modelList()`), Knight must discover the actual method name from `src/main/index.ts` or the OllamaManager class before writing the IPC handler. Do NOT guess — find and use the real method.

4. **GauntletTab phase state reset on compare run:** when Knight adds `isCompareRunning` state, ensure that triggering a compare run does NOT reset `phase` to `'running'`. The compare run is a parallel operation — the main Gauntlet result display must remain visible. The `runGauntletForCompare` function must be a fully separate code path from `runGauntlet`.

5. **`__ollama_base__` sentinel vs real Ollama model:** the `__ollama_base__` sentinel simulates "Ollama without substrate." When real substrate wiring lands, this sentinel must bypass the pheromone/substrate injection layer. For v0.1.53 (simulated), simply treat it as a model that returns slightly lower BM scores than gemma4:12b to make the comparison meaningful. Note in code: `// TODO: route __ollama_base__ through raw Ollama call, bypass substrate injection, when real wiring lands`.

---

*Bishop — BP080 · 2026-06-11 · §2 Truth-Always · Founder ratify required before ship.*
