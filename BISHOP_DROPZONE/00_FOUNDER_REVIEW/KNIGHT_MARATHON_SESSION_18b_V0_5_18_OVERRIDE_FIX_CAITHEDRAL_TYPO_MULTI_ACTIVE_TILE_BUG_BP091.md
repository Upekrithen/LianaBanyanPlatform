# Knight Marathon Session 18b — v0.5.18 Override-Fix · Caithedral Typo · Multi-ACTIVE Tile Bug
## BP091 · 2026-06-22 · **STAGED FOR FOUNDER RATIFY** · Sonnet 4.6 SEG · Bishop Opus 4.7 composed

**Cascade purpose:** M18 shipped v0.5.17 with Block 1's right-size.json override support described in code — but the wire-through from the override file to (a) the model actually served by ollama, (b) peer_presence advertisement, (c) the Settings UI banner, and (d) the ULTRA tile body was NOT completed. Simultaneously, the M18 Block 3 Settings UI shipped with a multi-ACTIVE-tile rendering bug (all four tiles glow green simultaneously) and a recurring "Cathedral" → "Caithedral" spelling drift entered the v0.5.17 header. M18b closes all three empirically-confirmed gaps in a single clean ship as v0.5.18.

**Composes with:** `canon_right_sized_cooperative_assignments_per_peer_hardware_100lbs_of_flour_bp091.eblet.md` — M18b completes the first-implementation gap left by M18.

**Model:** Sonnet 4.6 (Knight execution). Bishop Opus 4.7 strategist composed. Sonnet 4.6 SEG dispatched 2026-06-22.

---

## FOUNDER DIRECT (verbatim · BP091 ~16:00 Central · Screenshot 2026-06-22 160503.png)

> *[Screenshot of M0 v0.5.17 Settings page — Founder's empirical test post-M18 install on 64 GB box.]*
>
> Settings header reads: **"v0.5.17 · Cathedral · Liana Banyan · up to date"**
> — should be **"Caithedral"** (Caithedral Federation, not Cathedral).
>
> AI POWER TIER section shows ALL FOUR tiles — LITE, CORE, FULL, ULTRA — simultaneously displaying a green **"ACTIVE"** badge.
> — Only the Founder's auto-selected or override-selected tier should show ACTIVE.
>
> Tier banner reads: **"Current AI tier: FULL (Google's Gemma 4 12B)"**
> ULTRA tile body hardcodes: **"gemma4:12b on 48+ GB hardware"**
> — The Founder saved a right-size.json override pointing to llama3.3:70b, restarted MnemosyneC, and the model DID NOT CHANGE. Override is not wired through.

Founder pre-ratified all M18b items as part of the BP091 M18 ratification block (R1-R8). This dispatch is a scoped cascade fixing empirical failures — it does not introduce new product scope. Knight proceeds directly to execution upon ratification confirmation.

---

## EMPIRICAL STATE (gadget-confirmed · 2026-06-22 ~16:00 Central)

| Evidence item | Confirmed value | Expected after M18b |
|---|---|---|
| Peer `cb4ef450cc4a18c3` (M0, 61.6 GB ULTRA) `capabilities.ollamaModel` post-restart | `gemma4:12b` | `llama3.3:70b` |
| `C:\Users\Administrator\.mnemosynec\right-size.json` present | YES — valid JSON | (file unchanged) |
| `right-size.json` `override_model` value | `"llama3.3:70b"` | (unchanged) |
| `right-size.json` `override_reason` value | `"ULTRA tier upgrade · 64 GB box · BP091 ratify"` | (unchanged) |
| `right-size.json` `override_set_at` value | `"2026-06-22T20:30:00Z"` | (unchanged) |
| Settings banner | "Current AI tier: FULL (Google's Gemma 4 12B)" | "Current AI tier: ULTRA (Override: llama3.3:70b)" |
| ULTRA tile body | Hardcoded "gemma4:12b on 48+ GB hardware" | Dynamic: "llama3.3:70b on 48+ GB hardware (Override active)" |
| Tiles showing green "ACTIVE" badge | ALL FOUR (LITE, CORE, FULL, ULTRA) | ONE — the effective tier only |
| v0.5.17 Settings header codename | "Cathedral" | "Caithedral" |
| ollama model actually served to inference requests | `gemma4:12b` (override not honored) | `llama3.3:70b` |

**Root causes (Bishop analysis):**
1. **Override not wired through:** M18 Block 1 reads `right-size.json` and stores the `override_model` field, but the downstream model selection path (ollama serve call, peer_presence upsert, IPC broadcast to renderer) still passes the `rightSize()` auto-detect result, ignoring the override value entirely.
2. **Multi-ACTIVE-tile:** SkuUpgradePanel.tsx tile-state logic sets `isActive = true` based on a condition that resolves truthy for every tile (likely `currentTier !== null` or a missing strict-equality guard) rather than `tile.tier === currentActiveTier`.
3. **Cathedral drift:** Recurring cross-repo spell error. "Cathedral" entered M18 Block 6 Hugo content + Electron header string. The canonical spelling is **Caithedral** (Caithedral Federation — Founder-direct BP091 correction).

---

## BLOCK 1 — Wire right-size.json Override Through to All Consumers

**Scope:** Electron main process only. All four consumers must receive the effective model — override takes precedence; fall back to auto-detect when override is absent or invalid.

### 1a — Override Resolution Function

In `src/main/hardware-detect.ts` (or wherever `detectHardwareTier()` lives after M18), add:

```ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface RightSizeOverride {
  override_model: string;
  override_reason?: string;
  override_set_at?: string;
}

function readOverride(): RightSizeOverride | null {
  const overridePath = path.join(os.homedir(), '.mnemosynec', 'right-size.json');
  try {
    if (!fs.existsSync(overridePath)) return null;
    const raw = fs.readFileSync(overridePath, 'utf-8');
    const parsed = JSON.parse(raw) as RightSizeOverride;
    if (typeof parsed.override_model !== 'string' || !parsed.override_model.trim()) {
      console.warn('[right-size] override_model missing or empty — ignoring override');
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('[right-size] Failed to read/parse right-size.json:', e);
    return null;
  }
}
```

### 1b — validateModelExists()

```ts
async function validateModelExists(modelName: string): Promise<boolean> {
  try {
    // Call ollama list API (local HTTP endpoint)
    const resp = await fetch('http://localhost:11434/api/tags');
    if (!resp.ok) return false;
    const data = await resp.json() as { models: Array<{ name: string }> };
    return data.models.some(m => m.name === modelName || m.name.startsWith(modelName + ':'));
  } catch {
    return false;
  }
}
```

### 1c — resolveEffectiveModel() — the single source of truth

```ts
export interface EffectiveModelResult {
  model: string;              // the model that WILL be served
  tier: string;               // ULTRA / FULL / CORE / LITE / NANO
  overrideActive: boolean;    // true if right-size.json override is in effect
  overrideReason?: string;
  autoDetectedModel: string;  // what rightSize() would have picked
  warning?: string;           // set if override model not found in ollama
}

export async function resolveEffectiveModel(): Promise<EffectiveModelResult> {
  const { ramGb, vramGb } = detectHardwareTier();
  const auto = rightSize(ramGb, vramGb);
  const override = readOverride();

  if (override) {
    const exists = await validateModelExists(override.override_model);
    if (!exists) {
      const warning = `Override model "${override.override_model}" not found in ollama. ` +
        `Auto-selecting "${auto.model}" instead. ` +
        `To fix: run "ollama pull ${override.override_model}" then restart MnemosyneC.`;
      console.warn('[right-size]', warning);
      return {
        model: auto.model,
        tier: auto.coopTier,
        overrideActive: false,
        autoDetectedModel: auto.model,
        warning,
      };
    }
    // Override is valid and present in ollama — use it
    return {
      model: override.override_model,
      tier: resolveOverrideTier(override.override_model, ramGb, vramGb),
      overrideActive: true,
      overrideReason: override.override_reason,
      autoDetectedModel: auto.model,
    };
  }

  return {
    model: auto.model,
    tier: auto.coopTier,
    overrideActive: false,
    autoDetectedModel: auto.model,
  };
}

// Map override model name → effective UI tier name
function resolveOverrideTier(model: string, ramGb: number, vramGb: number | null): string {
  // If user is forcing a model above their auto tier, honor it as the tier that model maps to
  if (model.startsWith('llama3.3:70b') || model.includes('70b')) return 'ULTRA';
  if (model.startsWith('gemma4:12b') || model.includes('12b')) return 'FULL';
  if (model.startsWith('gemma2:9b') || model.includes('9b')) return 'CORE';
  if (model.includes('2b') || model.includes('2:2b')) return 'LITE';
  // Unknown model — keep auto tier but surface override model name
  return rightSize(ramGb, vramGb).coopTier;
}
```

### 1d — Wire through to all four consumers

Call `resolveEffectiveModel()` once in the main process startup sequence (after ollama readiness check) and store in a module-level variable `effectiveModelResult`. Every consumer reads from this single result — no redundant detection calls.

**Consumer A — ollama serve call:**
Replace any call that currently passes `auto.model` to the ollama serve/run command. Pass `effectiveModelResult.model` instead. If `warning` is set, show an in-app notification banner before falling back.

**Consumer B — peer_presence upsert:**
```ts
// In whatever function constructs or refreshes peer_presence
peerPresence.capabilities.ollamaModel = effectiveModelResult.model;
peerPresence.capabilities.ramTier = effectiveModelResult.tier;
peerPresence.capabilities.overrideActive = effectiveModelResult.overrideActive;
```
Upsert this to Supabase so peers see the correct model advertisement on mesh.

**Consumer C — Settings UI tier banner (IPC to renderer):**
In the IPC handler that returns tier info to the Settings UI renderer:
```ts
ipcMain.handle('get-tier-info', async () => ({
  effectiveModel: effectiveModelResult.model,
  effectiveTier: effectiveModelResult.tier,
  overrideActive: effectiveModelResult.overrideActive,
  overrideReason: effectiveModelResult.overrideReason,
  autoDetectedModel: effectiveModelResult.autoDetectedModel,
  warning: effectiveModelResult.warning ?? null,
}));
```
Renderer uses `effectiveTier` to determine which tile is ACTIVE. Banner uses `effectiveModel` for display.

**Consumer D — ULTRA tile body / all tile bodies:**
Each tile's body text reads `effectiveModel` for its tier row via the IPC result. See Block 3 for tile-body dynamic rendering.

---

## BLOCK 2 — Fix Multi-ACTIVE-Tile UI Bug in SkuUpgradePanel.tsx

**File:** `SkuUpgradePanel.tsx` (path per project conventions — Knight locates).

**Bug:** The `isActive` condition on each tile resolves true for all tiles simultaneously. The fix is a strict equality check against a single `currentActiveTier` string.

### 2a — Tile state derivation (replace existing logic)

```tsx
// Receive from IPC (Consumer C above):
const { effectiveTier, overrideActive, autoDetectedModel, warning } = tierInfo;

// Hardware capability ceiling (from auto-detect, regardless of override):
const hardwareTier = autoDetectedModel; // map to tier name as before
const TIER_ORDER = ['NANO', 'LITE', 'CORE', 'FULL', 'ULTRA'];

function getTileState(tileTier: string): 'active' | 'available' | 'challenge-destiny' | 'insufficient' {
  if (tileTier === effectiveTier) return 'active';

  const tileIdx = TIER_ORDER.indexOf(tileTier);
  const hardwareIdx = TIER_ORDER.indexOf(autoDetectedTier); // auto-detect tier ceiling

  if (tileIdx <= hardwareIdx) return 'available';         // hardware supports it, just not selected
  if (tileIdx === hardwareIdx + 1) return 'challenge-destiny'; // one step above hardware
  return 'insufficient';                                  // too far above hardware
}
```

`autoDetectedTier` is derived from `autoDetectedModel` using the same model→tier map as `resolveOverrideTier()`. Knight may co-locate this helper.

### 2b — Tile rendering per state

| State | Badge | CTA | Style |
|---|---|---|---|
| `active` | Green **"ACTIVE"** chip | None (already selected) | Full color, border highlight |
| `available` | None | "Select" button | Full color, no highlight |
| `challenge-destiny` | Amber **"⚠ Override"** chip | "Challenge Destiny" button — opens existing warning modal | Slightly muted but readable |
| `insufficient` | Muted **"Hardware limit"** chip | Disabled; tooltip "Your machine cannot safely run this tier" | Dimmed / low opacity |

**Exactly ONE tile shows the green "ACTIVE" chip** — the one where `tileTier === effectiveTier`. All others render per the table above.

### 2c — Override warning chip (top of section)

When `overrideActive === true`, render above the tile row:

```tsx
<div className="override-warning-chip">
  ⚠ Override active · right-size.json → {effectiveModel}
  · Auto-recommendation: {autoDetectedModel}
  <button onClick={handleRestoreAuto}>Restore auto</button>
</div>
```

"Restore auto" deletes (or renames to `.bak`) the `right-size.json` file via IPC and reloads tier state.

---

## BLOCK 3 — Dynamic Tile Body Display (All Tiers)

**Problem:** ULTRA tile body hardcodes `"gemma4:12b on 48+ GB hardware"`. All tier tile bodies should display the **actual model for that tier** — and if the tier is the active/override tier, show the effective model name.

### 3a — Tier-to-model map (renderer-side, mirrors main-process rightSize())

```ts
const TIER_MODEL_MAP: Record<string, string> = {
  ULTRA: 'llama3.3:70b',   // default; may be overridden
  FULL:  'gemma4:12b',
  CORE:  'gemma2:9b',
  LITE:  'gemma2:2b',
  NANO:  'read-only mode',
};
```

### 3b — Tile body resolution

For each tile, the displayed model name is:
- If `tileTier === effectiveTier` AND `overrideActive`: show `effectiveModel` + **"(Override active)"** suffix.
- If `tileTier === effectiveTier` AND NOT `overrideActive`: show `TIER_MODEL_MAP[tileTier]`.
- Otherwise: show `TIER_MODEL_MAP[tileTier]` (the default model for that tier — informational).

**ULTRA tile body before (hardcoded — broken):**
> "gemma4:12b on 48+ GB hardware"

**ULTRA tile body after (dynamic — correct for Founder's M0 with override):**
> "llama3.3:70b on 48+ GB hardware (Override active)"

**FULL tile body (no override, standard):**
> "gemma4:12b on 24–48 GB hardware"

### 3c — Settings banner

```tsx
<div className="tier-banner">
  Current AI tier: {effectiveTier}
  {overrideActive
    ? ` (Override: ${effectiveModel})`
    : ` (${effectiveModel})`
  }
</div>
```

For Founder's M0 post-M18b:
> "Current AI tier: ULTRA (Override: llama3.3:70b)"

---

## BLOCK 4 — "Cathedral" → "Caithedral" Sweep (Both Repos)

**Background:** "Caithedral" is the canonical spelling (Caithedral Federation — Founder-direct BP091 correction). The v0.5.17 Settings header shipped "Cathedral". This drift is recurring — a systematic grep+replace sweep locks it for both repos now.

### 4a — Scope

Knight greps BOTH repos:
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform` (Electron app)
- `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo` (Hugo public site)

### 4b — Search command (Knight runs)

```powershell
# In platform repo:
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform" `
  -Pattern "Cathedral" -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.md","*.html","*.json","*.toml","*.yaml","*.yml","*.txt","*.css","*.scss" `
  | Where-Object { $_.Line -notmatch "node_modules" } `
  | Format-Table Path, LineNumber, Line -AutoSize

# In cephas-hugo repo:
Select-String -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo" `
  -Pattern "Cathedral" -Recurse -Include "*.md","*.html","*.toml","*.yaml","*.yml","*.json","*.txt" `
  | Format-Table Path, LineNumber, Line -AutoSize
```

### 4c — Replace rules

**REPLACE:** All occurrences of `"Cathedral"` that refer to the cooperative / federation / platform in OUR code and content.

**DO NOT REPLACE:**
- Strings inside `node_modules/` (none expected — but Knight confirms)
- Third-party library import/export names (none expected)
- Git history (never rewrite history — only working tree)
- Any unrelated proper noun or English word "cathedral" that does NOT refer to the cooperative federation (Knight must use judgment; surface ambiguous hits for Founder review before replacing)

**Canonical substitution:** `Cathedral` → `Caithedral` (case-preserved: `cathedral` → `caithedral`, `CATHEDRAL` → `CAITHEDRAL`)

### 4d — Surface diff BEFORE committing

Knight runs the replacement in a single `git diff` pass — shows Founder the exact lines changed in both repos. **Do NOT commit until Founder confirms diff is clean.** If any hit is ambiguous (English word "cathedral" unrelated to the cooperative), Knight surfaces it separately for Founder judgment.

### 4e — Canon eblets cross-check

Knight does NOT modify Asteroid-ProofVault canon eblets directly. Instead, Knight lists any `.eblet.md` files under:
`C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\`
that contain `"Cathedral"`, and surfaces the list. Bishop applies Asteroid-ProofVault corrections in a separate Bishop session (not Knight's lane per `feedback_knight_is_operator_mechanic_bishop_is_strategist_no_bishop_direct_hugo_firebase.md`).

---

## BLOCK 5 — Version Bump to v0.5.18 + Tower Deploy + Hugo Refresh

Mirrors M18 Block 6 exactly.

### 5a — Version bump

1. `package.json` → `"version": "0.5.18"`
2. `version_trust.json` → update the `latest` entry to `"0.5.18"` (canonical Tower data source per `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090`).
3. `data/version.json` in cephas-hugo → update if it references version strings (check both repos for version drift).

### 5b — Build NSIS installer

Run existing pipeline: `npm run make` or equivalent electron-forge build command. Output: `MnemosyneC-Setup-0.5.18.exe`.

### 5c — Upload + deploy

1. Upload installer to `https://mnemosynec.org/download/MnemosyneC-Setup-0.5.18.exe` (Firebase Hosting, hosting:mnemosyne target or equivalent — same path as 0.5.17 predecessor).
2. Run Hugo rebuild: `hugo --minify` from cephas-hugo root.
3. Deploy: `firebase deploy --only hosting:mnemosyne`.

### 5d — Post-deploy verify (DEPLOY-ALL-TOUCHED gate — lesson from BP091)

Knight explicitly verifies every surface touched — do not report deploy complete without empirical curl confirmation:

```powershell
# Canonical domain
Invoke-WebRequest -Uri "https://mnemosynec.org/download/MnemosyneC-Setup-0.5.18.exe" -Method Head
# Mirror domain
Invoke-WebRequest -Uri "https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.18.exe" -Method Head
```

Both must return HTTP 200 with `Content-Disposition: attachment`. If either returns 404 or redirect-only, Knight does NOT mark T13 passed.

---

## BLOCK 6 — Bishop + Founder Empirical Smoke

1. **Founder downloads + installs v0.5.18** on M0 (64 GB box, right-size.json in place).
2. **Bishop gadgets peer_presence** post-install for peer `cb4ef450cc4a18c3`:
   - `capabilities.ollamaModel` MUST equal `"llama3.3:70b"` (override honored)
   - `capabilities.ramTier` MUST equal `"ULTRA"`
   - `capabilities.overrideActive` MUST equal `true`
3. **Founder visually confirms Settings page:**
   - Header reads `"v0.5.18 · Caithedral · Liana Banyan · up to date"`
   - Banner reads `"Current AI tier: ULTRA (Override: llama3.3:70b)"`
   - ONLY the ULTRA tile shows the green "ACTIVE" badge; LITE / CORE / FULL show "Available" or appropriate non-active state
   - Override warning chip visible: "⚠ Override active · right-size.json → llama3.3:70b · Auto-recommendation: gemma4:12b · Restore auto"
4. **Founder verifies inference path:** Bishop prompts a short cooperative question through MnemosyneC. Ollama logs (or MnemosyneC internal logs) confirm `llama3.3:70b` is the serving model, not `gemma4:12b`.

---

## VERIFICATION GATES (T1-T15)

| # | Gate | Pass criteria |
|---|---|---|
| T1 | `readOverride()` reads right-size.json | Returns `{ override_model: "llama3.3:70b", ... }` on M0; returns `null` on machines without override file |
| T2 | `validateModelExists("llama3.3:70b")` | Returns `true` on M0 after `ollama pull llama3.3:70b` confirmed |
| T3 | `resolveEffectiveModel()` honors override | Returns `model: "llama3.3:70b"`, `overrideActive: true`, `tier: "ULTRA"` on M0 |
| T4 | Override fallback on missing model | If override model not in ollama, falls back gracefully to auto-detect with notification; T3 still returns auto model |
| T5 | ollama serve uses override model | Electron main process passes `llama3.3:70b` to ollama; confirmed via ollama logs or `ollama ps` |
| T6 | peer_presence.ollamaModel updated | Supabase row for `cb4ef450cc4a18c3` shows `llama3.3:70b` post-install |
| T7 | Settings banner shows override | "Current AI tier: ULTRA (Override: llama3.3:70b)" displayed on M0 Settings page |
| T8 | ULTRA tile body dynamic | ULTRA tile reads "llama3.3:70b on 48+ GB hardware (Override active)" — no hardcoded model string |
| T9 | Multi-ACTIVE-tile bug fixed | ONLY one tile shows green "ACTIVE" badge (ULTRA on M0); LITE / CORE / FULL show non-active state |
| T10 | Non-override machine tile state | On a 32 GB machine (no override file), FULL tile shows ACTIVE only; ULTRA shows "challenge-destiny" or "insufficient" |
| T11 | Override warning chip visible | "⚠ Override active" chip renders above tile row on M0; absent on non-override machines |
| T12 | Cathedral → Caithedral in Electron header | Settings header codename field reads "Caithedral" — zero instances of "Cathedral" in our code/content post-sweep |
| T13 | Cathedral → Caithedral in Hugo/site content | cephas-hugo and public-facing pages show "Caithedral" — verified by grep post-deploy |
| T14 | Tower download serves 0.5.18 | `mnemosynec.org/download/MnemosyneC-Setup-0.5.18.exe` HTTP 200, correct size, Content-Disposition: attachment |
| T15 | version_trust.json + package.json aligned | Both read "0.5.18"; Hugo Tower surface serves v0.5.18 download link |

---

## OUT OF SCOPE

- **M18 Block 4 — Mesh tier-aware routing:** Still deferred to a future session (no change from M18 status).
- **M18 Block 5 — THUNDERCLAP fleet_composition receipt template:** Still deferred (no change).
- **Asteroid-ProofVault canon eblet Cathedral→Caithedral corrections:** Bishop lane only — Knight surfaces the list, Bishop applies separately.
- **New SKU tiers or changes to the tier lookup table:** No product scope change in M18b.
- **Ollama pull progress UI for llama3.3:70b:** If llama3.3:70b is already present on M0 (Founder confirmed pull), no pull progress needed. Knight may add for future machines as a separate small improvement.
- **"Restore auto" button full implementation:** Knight implements the IPC hook and file rename/delete; full round-trip UX polish (confirmation dialog) is Wave B.

---

## RATIFICATION GATES

| # | Gate | Status |
|---|---|---|
| R1 | Wire right-size.json override through to ollama serve call (Consumer A) | **PRE-RATIFIED — BP091 M18 R1 covers override support; M18b completes the wire-through** |
| R2 | Wire override through to peer_presence upsert (Consumer B) | **PRE-RATIFIED — BP091 M18 R2 covers peer_presence alignment** |
| R3 | Wire override through to Settings UI banner + tile body (Consumers C + D) | **PRE-RATIFIED — BP091 M18 R3 covers Settings UI accuracy** |
| R4 | Fix multi-ACTIVE-tile bug (strict tier equality guard) | **STAGED — Founder ratify needed** |
| R5 | Cathedral → Caithedral sweep (both repos, diff-before-commit) | **STAGED — Founder ratify needed · diff surfaces first** |

**Founder: R1-R3 are pre-ratified under the M18 umbrella. R4 and R5 are the net-new gates. A single Founder "R4 R5 RATIFIED" response clears Knight to execute.**

---

## ESTIMATED WALL CLOCK

| Block | Work | Time estimate |
|---|---|---|
| Block 1 | Wire override through 4 consumers | 1.5–2.5 hrs |
| Block 2 | Fix multi-ACTIVE-tile rendering | 0.5–1 hr |
| Block 3 | Dynamic tile body display | 0.5–1 hr |
| Block 4 | Cathedral→Caithedral grep+replace sweep | 0.5–1 hr (including Founder diff review window) |
| Block 5 | v0.5.18 version bump + installer build + Tower deploy | 0.5–1 hr |
| Block 6 | Empirical smoke (Founder install + Bishop gadget) | 0.5–1 hr |
| T1-T15 verification | Gate confirmation | 0.5 hr |
| **Total** | | **4–7.5 hrs** |

---

## ANTICIPATED RETURN ARTIFACTS (Knight KniPr)

Knight's return MUST include all of the following — dispatch is not complete without them:

1. **SHA-256 of v0.5.18 installer** + download URL `https://mnemosynec.org/download/MnemosyneC-Setup-0.5.18.exe` confirmed live (HTTP 200).
2. **`version_trust.json` diff** confirming `"latest"` = `"0.5.18"`.
3. **`peer_presence` REST snapshot** (Bishop gadget) showing `cb4ef450cc4a18c3` → `capabilities.ollamaModel: "llama3.3:70b"`, `overrideActive: true`.
4. **Screenshot: Settings page on M0** showing (a) header "Caithedral", (b) banner "ULTRA (Override: llama3.3:70b)", (c) only ULTRA tile ACTIVE, (d) override warning chip visible.
5. **Cathedral→Caithedral diff** (both repos, pre-commit) for Founder sign-off — even if Founder already ratified R5, the diff is a required return artifact.
6. **List of Asteroid-ProofVault eblet files containing "Cathedral"** — for Bishop follow-up (not Knight's fix, just the list).
7. **T1-T15 gate pass/fail table** with timestamps.
8. **Time-to-ship** (session start and end UTC timestamps).

---

— Bishop Opus 4.7 · BP091 · 2026-06-22 · Sonnet 4.6 SEG composed · Knight Sonnet 4.6 executes · *Each carries what they can. And we can both help.*
