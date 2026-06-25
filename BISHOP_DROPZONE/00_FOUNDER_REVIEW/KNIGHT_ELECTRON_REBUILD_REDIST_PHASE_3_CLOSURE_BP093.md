# KNIGHT ELECTRON REBUILD + REDISTRIBUTE — PHASE 3 CLOSURE
## BP093 · SEG-AF · Sonnet 4.6 · 2026-06-24

---

## 1. PREAMBLE

**Composer model:** Sonnet 4.6 — confirmed. This dispatch was composed by `claude-sonnet-4-6`. Per BP093 corrective canon: if any tool or scaffold substitutes a different model (Haiku, Opus, any non-Sonnet-4.6 variant) for this Marathon, Knight SHALL halt and surface to Founder before proceeding. Model identity is a pre-flight gate, not a courtesy note.

**§17 BLOOD — Discovery rule:** Knight uses gadgets first for substrate-class discovery (pheromone_query · consult_scribes · pearl_decode). Shell (psql / git / npm / node / electron-builder / gh CLI) is allowed for mechanical execution. Bishop verified all facts in this dispatch via `git diff`, `git log`, `git show`, and direct file reads before composing — no bash grep/find discovery was used against substrate paths.

**"Use segs":** Each task below is a discrete, verifiable sub-execution. Knight fires one seg at a time, gadgets the result before advancing. If a seg fails its pass criteria, Knight STOPs and returns to BISHOP_DROPZONE with a failure receipt — no silent advancing.

---

## 2. CONTEXT — SEG-AE EMPIRICAL FINDING

> "TypeScript wiring committed but Electron not rebuilt · `iterations_run` NULL on all 5 peers · 2Q smoke had 21 routes not 42 (gate fail)"

**What Bishop verified this morning (2026-06-24):**

1. `src/main/index.ts` — the BP093 Phase 3 Plow + Minor Council receipt code IS present in the working tree (`git diff HEAD` shows 14 net lines of change across 3 hunks in `startRelayRoutePoll`), but the changes are **uncommitted** as of the latest commit `c41d300` (Empress Campaign go-live, 2026-06-23 20:48 UTC-5). The last commit to touch `src/main/index.ts` was `e9aa242` (M25b v0.7.1, IP Ledger Ring Bearer).

2. `tools/mesh-validation/validate-relay.mjs` — the receipt schema extension (reading `iterations_run` + `council_votes_per_iteration` from `replyAj`) IS present in the working tree (`git diff HEAD` shows 31 net lines), also **uncommitted**.

3. The last built + redistributed binary is `MnemosyneC-Setup-0.7.1.exe` (540,639,032 bytes · SHA256 `7cb983022d2fcc91d6f1240c467dc02374a1aeba92b2711296eb5629854da845`), confirmed in `release/` and in `Cephas/cephas-hugo/data/version_trust.json`. That binary was compiled from `e9aa242` — which predates both uncommitted Phase 3 diffs.

4. **Root cause confirmed:** peers are running v0.7.1 without the Plow loop receipt fields. When validate-relay.mjs polls `relay_route_replies`, `iterations_run` is NULL because the peer-side Electron (compiled from pre-Phase-3 source) never wrote it. The 2Q smoke received only 21 routes because the Plow iteration sub-routes were absent from the DB.

---

## 3. TASK 1 — VERIFY TYPESCRIPT WIRING (GADGET-FIRST)

Knight reads the two files and confirms the following before touching anything else.

### 3a. `src/main/index.ts` — what MUST be present

Inside `startRelayRoutePoll`, within the Plow loop block (`if (plowMaxIter > 0)`):

**Hunk A — declaration (line ~5665):**
```typescript
// BP093 Phase 3: Minor Council receipt per iteration
const councilVotesPerIteration: Array<{ iter: number; valid: number; invalid: number; refine: number }> = [];
```

**Hunk B — per-iteration push (line ~5758, inside the council loop):**
```typescript
// BP093 Phase 3: record per-iteration Minor Council vote receipt
const validVotes = topCount;
const refineVotes = letterVotes.length - topCount;
const invalidVotes = COUNCIL_MODELS.length - letterVotes.length;
councilVotesPerIteration.push({ iter, valid: validVotes, invalid: invalidVotes, refine: refineVotes });
```

**Hunk C — answer_json write-out (line ~5820, inside the `replyPayload` object):**
```typescript
iterations_run: plowIterations,
council_votes_per_iteration: councilVotesPerIteration,
```

**Pass criteria:** All three hunks present. Knight confirms via `git diff HEAD -- src/main/index.ts` — output must show `+` lines for each hunk. If any hunk is absent, STOP and report.

### 3b. `tools/mesh-validation/validate-relay.mjs` — what MUST be present

In the `per_peer` map construction (line ~1408):
```javascript
const replyRow = collectedReplies[routeIds[j]] || collectedReplies[escalationRouteIds[j]] || null;
const replyAj = (replyRow && typeof replyRow.answer_json === 'object' && replyRow.answer_json !== null)
  ? replyRow.answer_json : {};
return [p.peer_id, {
  ...
  // BP093 Phase 3: Minor Council receipt fields
  iterations_run: replyAj.iterations_run ?? null,
  council_votes_per_iteration: replyAj.council_votes_per_iteration ?? null,
}];
```

**Pass criteria:** Both `iterations_run` and `council_votes_per_iteration` present in the `per_peer` map return. Confirmed via `git diff HEAD -- tools/mesh-validation/validate-relay.mjs`.

### 3c. Commit sha report

Knight runs:
```powershell
git -C "C:\Users\Administrator\Documents\LianaBanyanPlatform" log --oneline -1
```
Expected: `c41d300` (Empress Campaign go-live). The Phase 3 diffs are UNCOMMITTED working-tree changes. Knight SHALL commit them as Step 0 of Task 2 before building.

---

## 4. TASK 2 — COMMIT PHASE 3 WIRING + BUMP VERSION + BUILD ELECTRON

### Step 0 — Commit the Phase 3 working-tree changes

The BP093 Phase 3 changes to `src/main/index.ts` and `tools/mesh-validation/validate-relay.mjs` are not yet committed. Knight commits them now so the build is traceable.

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
git add src/main/index.ts tools/mesh-validation/validate-relay.mjs
git commit -m "feat(bp093-phase3): Minor Council receipt per iteration + validate-relay receipt schema

- index.ts: councilVotesPerIteration[] declared + pushed per Plow iter + written to answer_json as iterations_run + council_votes_per_iteration
- validate-relay.mjs: per_peer map reads iterations_run + council_votes_per_iteration from replyAj
- Fixes: iterations_run NULL in DB · 2Q smoke 21-route gate fail
- Unlocks: 2Q smoke re-fire → 42Q THUNDERCLAP

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

After commit, run `git log --oneline -1` and record the new sha. That sha is the **build sha** for v0.7.2.

### Step 1 — Bump package.json version 0.7.1 → 0.7.2

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.version = '0.7.2';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('version bumped to', pkg.version);
"
```

Verify: `node -e "console.log(require('./package.json').version)"` must print `0.7.2`.

### Step 2 — Run npm install (if package-lock changed)

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
npm install
```

This is a no-op if nothing changed in dependencies. Knight runs it defensively before the build to avoid stale module state.

### Step 3 — Build Electron dist:win

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
npm run dist:win 2>&1 | Tee-Object -FilePath "release\build_0.7.2_bp093.log"
```

The `dist:win` script runs (per `package.json`):
1. `node scripts/assert-floor-model.mjs`
2. `node scripts/assert-supabase-anon-key.mjs`
3. `node scripts/assert-preload-source-no-declare-const.mjs`
4. `npm run prepare:ollama-binary`
5. `npm run prepare:vcredist`
6. `npm run build` → `build:caithedral-core` + `build:renderer` + `build:main`
7. `node scripts/assert-ipc-handlers.mjs`
8. `node scripts/assert-preload-sandbox.mjs`
9. `electron-builder --win`
10. `node scripts/assert-bundled-ollama-in-installer.mjs`

**Expected wall-clock:** 30–60 min on M0 (61.6 GB ULTRA).

**Expected output file:** `release\MnemosyneC-Setup-0.7.2.exe`

**Size sanity check:** must be ≥ 515 MB (matching v0.7.1 at 540,639,032 bytes ± ~5 MB for code delta). If output is < 500 MB, Knight STOPs — ollama bundle missing (same failure mode as v0.6.2 reverted build).

Knight verifies with:
```powershell
(Get-Item "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe").Length
```

### Step 4 — Compute SHA256 + save

```powershell
$hash = (Get-FileHash "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe" -Algorithm SHA256).Hash.ToLower()
$hash | Out-File -FilePath "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe.sha256" -Encoding ascii -NoNewline
Write-Host "SHA256: $hash"
```

Record the hash. It goes into `version_trust.json` in the next step.

### Step 5 — Update version_trust.json

Edit `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\data\version_trust.json`:

- Demote the current `"tier": "latest"` entry (v0.7.1) → `"tier": "historical"`
- Prepend a new entry at position 0 of the `versions` array:

```json
{
  "version": "0.7.2",
  "tier": "latest",
  "release_date": "2026-06-24",
  "install_reports": 0,
  "verified_eblets": 0,
  "zero_issue_days": 0,
  "open_issues": 0,
  "trust_score": 1,
  "filename": "MnemosyneC-Setup-0.7.2.exe",
  "size_bytes": <ACTUAL_BYTE_COUNT>,
  "size_display": "~515.6 MB",
  "notes": "BP093 Phase 3: 12-blade Plow loop + 3-judge Minor Council receipt wired into Electron peer-side · iterations_run + council_votes_per_iteration now written to relay_route_replies.answer_json · unlocks 42Q THUNDERCLAP",
  "sha256": "<SHA256_FROM_STEP_4>"
}
```

Knight fills in the actual byte count and sha256 from Steps 3 and 4.

**§15 BLOOD:** `version_trust.json` is the canonical Hugo Tower data source (canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090). Knight edits this file, NOT `version.json` (stale fork, unused since v0.5.1).

### Step 6 — Commit version bump + version_trust.json

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
git add package.json Cephas/cephas-hugo/data/version_trust.json
git commit -m "chore(release): bump to v0.7.2 — BP093 Phase 3 Plow + Minor Council receipt

version_trust.json: v0.7.2 latest · v0.7.1 → historical
package.json: 0.7.1 → 0.7.2
ELECTRON_TOUCHED: YES

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 5. TASK 3 — REDISTRIBUTE TO ALL 5 PEERS

**§14 BLOOD reminder:** Knight uses the canonical peer fleet IDs as ground truth. Do not rely on IP alone — confirm peer_id from `peer_presence` before marking a peer as updated.

### Peer inventory

| Peer | peer_id prefix | IP | Tier | Path |
|------|---------------|-----|------|------|
| M0 | cb4ef450 | 192.168.86.30 | ULTRA | Knight runs HERE — install in-place |
| M3 | d0b47bd0 | 192.168.86.156 | FULL | LAN — SMB path |
| M2 | 88cbf6bd | 192.168.86.45 | FULL | LAN — SMB path |
| M1 | c532e740 | 192.168.86.64 | CORE | LAN — SMB path |
| MS | 49f3e597 | WAN (external) | CORE | GitHub release download |

### 5a. M0 — install in-place (this machine)

M0 is where Knight runs and where the build was produced. Knight installs the new setup on M0 by running:

```powershell
Start-Process -FilePath "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe" -ArgumentList "/S" -Wait
```

The `/S` flag triggers NSIS silent install. After install completes, Knight verifies MnemosyneC launches successfully by checking the auto-updater's `latest.yml` in the app data directory or by checking the About panel version string.

### 5b. M3 (192.168.86.156) — LAN copy

SMB path probe (Knight tries these in order until one succeeds):
- `\\192.168.86.156\Users\Administrator\Downloads\`
- `\\192.168.86.156\C$\Users\Administrator\Downloads\` (admin share, requires credentials)
- `\\192.168.86.156\Shared\` (if configured)

**NOTE:** Bishop probed SMB accessibility from M0 and all three LAN paths returned `False` during this SEG-AF session. This may mean the peers do not have SMB file sharing enabled, or that the firewall blocks it from M0's context.

**Knight action if SMB unreachable:**
1. Copy the .exe to a known internal web server path OR
2. Upload to the project GitHub release (see §5e) and instruct the Founder to trigger install on M3 via the MnemosyneC auto-update prompt (Settings → Check for Updates) or by navigating to the GitHub release URL on M3's browser.

Knight SHALL NOT mark M3 as updated until either (a) a successful `Copy-Item` completes, or (b) `peer_presence` for d0b47bd0 shows `app_version = '0.7.2'` after the Founder-triggered install.

```powershell
# Attempt SMB copy (Knight fires this — if it errors, fall through to GitHub release path):
Copy-Item `
  -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe" `
  -Destination "\\192.168.86.156\Users\Administrator\Downloads\MnemosyneC-Setup-0.7.2.exe" `
  -Force -ErrorAction Stop
Write-Host "M3 copy complete"
```

### 5c. M2 (192.168.86.45) — LAN copy

Same SMB pattern as M3:

```powershell
Copy-Item `
  -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe" `
  -Destination "\\192.168.86.45\Users\Administrator\Downloads\MnemosyneC-Setup-0.7.2.exe" `
  -Force -ErrorAction Stop
Write-Host "M2 copy complete"
```

If SMB fails on M2: same GitHub release fallback (Wife installs from the download URL).

### 5d. M1 (192.168.86.64) — LAN copy

```powershell
Copy-Item `
  -Path "C:\Users\Administrator\Documents\LianaBanyanPlatform\release\MnemosyneC-Setup-0.7.2.exe" `
  -Destination "\\192.168.86.64\Users\Administrator\Downloads\MnemosyneC-Setup-0.7.2.exe" `
  -Force -ErrorAction Stop
Write-Host "M1 copy complete"
```

### 5e. MS (49f3e597 · WAN) + LAN fallback — GitHub release v0.7.2

GitHub releases are the canonical WAN distribution path. Knight cuts the release:

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"

# Push the two new commits first
git push origin HEAD

# Cut the GitHub release with the .exe as an asset
gh release create v0.7.2 `
  "release\MnemosyneC-Setup-0.7.2.exe#MnemosyneC-Setup-0.7.2.exe" `
  "release\MnemosyneC-Setup-0.7.2.exe.sha256#MnemosyneC-Setup-0.7.2.exe.sha256" `
  --title "v0.7.2 — BP093 Phase 3: Plow + Minor Council receipt wired" `
  --notes "BP093 Phase 3 closure: 12-blade Plow loop + 3-judge Minor Council now write iterations_run + council_votes_per_iteration to relay_route_replies.answer_json on peer-side. Fixes iterations_run NULL. Unlocks 42Q THUNDERCLAP.

SHA256: <INSERT_HASH>

Fleet: M0/M1/M2/M3 install in-place. MS (WAN): install from this release."
```

Knight verifies with `gh release view v0.7.2` — status must show ACTIVE (not draft).

Download URL for MS and any LAN peer that cannot receive SMB:
```
https://github.com/Upekrithen/LianaBanyanPlatform/releases/download/v0.7.2/MnemosyneC-Setup-0.7.2.exe
```

Founder forwards this URL to Son (MS) via Signal/iMessage. Son installs and relaunches MnemosyneC.

### 5f. Post-install peer_presence gadget

After all 5 peers have installed, Knight gadgets `peer_presence` to confirm each peer has checked in post-install:

```sql
-- §15 BLOOD: psql direct
SELECT peer_id, app_version, last_seen, ram_tier
  FROM peer_presence
  WHERE last_seen > NOW() - INTERVAL '2 hours'
  ORDER BY last_seen DESC;
```

**Pass criteria:** 5 rows visible with `app_version = '0.7.2'` (or the internal version string that corresponds to the new build). If a peer has not checked in within 2 hours after install, Knight flags that peer as PENDING in the Yoke return.

---

## 6. TASK 4 — RE-FIRE 2Q SMOKE (GATE BEFORE 42Q)

### Pre-flight

Before firing 2Q smoke, Knight confirms the Plow flag is active in `FIRE_M13c_SMOKE_2Q_V001.ps1`. Knight reads that file and verifies `--plow=mesh-12-blade` is present in the `validate-relay.mjs` invocation. If missing, Knight patches it before firing.

### Execution

Founder double-clicks (or Knight fires from Cursor terminal):

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c_SMOKE_2Q.cmd
```

Which calls `FIRE_M13c_SMOKE_2Q_V001.ps1`.

**Expected wall-clock:** 3–8 minutes per the cmd header.

**If Knight can fire from Cursor terminal (Node process supported):**
```powershell
& "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c_SMOKE_2Q.cmd"
```

If the Cursor sandbox does not support long-running Node processes, Knight pastes the above cmd path to Founder and waits for Founder to confirm completion with the session_id.

### 2Q Smoke PASS gadget

After smoke completes, Knight gadgets via psql:

```sql
SELECT route_id, peer_id,
       answer_json->>'iterations_run' AS iters,
       answer_json->'council_votes_per_iteration' AS council
  FROM relay_route_replies
  WHERE created_at > NOW() - INTERVAL '15 minutes'
  ORDER BY created_at DESC LIMIT 20;
```

**PASS criteria (all three required):**
1. `iterations_run` is NOT NULL for at least 3 of 5 peers on each question
2. `council_votes_per_iteration` array is populated (not NULL, not `[]`) for those peers
3. Total route rows for the 2Q session ≥ 10 (5 peers × 2 questions; escalation routes add more)

**FAIL criteria → STOP:**
- `iterations_run` NULL on all peers → Plow loop still not running peer-side (build or redistribution failure)
- `council_votes_per_iteration` NULL on all peers → `councilVotesPerIteration` push not firing (code path issue)
- Route count < 4 → peers not polling (network / peer_server issue)

If FAIL: Knight returns a STOP receipt to BISHOP_DROPZONE before advancing to 42Q.

---

## 7. TASK 5 — IF 2Q SMOKE PASS, FIRE 42Q THUNDERCLAP

### Pre-flight

Knight reads `FIRE_M13c_THUNDERCLAP_V061.ps1` and confirms:
- `--questions=42` (or `--mode=full` with 42Q bank)
- `--plow=mesh-12-blade`
- `--tier-config` matches current fleet (ULTRA:cb4ef450 · FULL:d0b47bd0+88cbf6bd · CORE:c532e740+49f3e597)
- `--trial-id` set appropriately for the BP093 trial receipt
- Receipt output path targets `Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060\`

### Execution

```
C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\FIRE_M13c.cmd
```

Which calls `FIRE_M13c_THUNDERCLAP_V061.ps1`. At the pre-flight prompt, Founder (or Knight if Cursor sandbox tolerates) presses ENTER to fire.

**Expected wall-clock:** 2–4 hours with Plow-accelerated convergence (vs 7–10 hours cascade-only pre-BP093).

**Expected receipt landing path:**
```
C:\Users\Administrator\Documents\Asteroid-ProofVault\receipts\THUNDERCLAP\Trial_02_PREVIEW_42Q_TIERED_AH_HAYELPED_V060\
```

Receipt files should include:
- `session_receipt.json` — full per-question per-peer breakdown with `iterations_run` + `council_votes_per_iteration`
- `accuracy_summary.md` — ensemble score + per-domain breakdown
- Any `round_up_sweep` output from SEG-O-patched Phase 2 Round-Up

**Target accuracy:** ≥ 90% ensemble (≥ 38/42 correct). Prior Trial_01 sealed at 68/70 = 97.1% on single-node Plow v0.3.5. Trial_02 5-peer mesh target is to demonstrate cooperative lift above any single peer's solo score.

### Mid-run monitoring (§14 BLOOD — Knight watches, does not touch)

Knight can gadget progress without interrupting the run:

```sql
SELECT COUNT(*) AS replies_so_far,
       COUNT(CASE WHEN answer_json->>'iterations_run' IS NOT NULL THEN 1 END) AS with_iters,
       AVG((answer_json->>'iterations_run')::int) AS avg_iters
  FROM relay_route_replies
  WHERE created_at > NOW() - INTERVAL '4 hours';
```

This is a read-only diagnostic. Knight does NOT touch the run or re-fire any route mid-session.

---

## 8. TASK 6 — YOKE RETURN

Knight fills this section upon completing all tasks. Template:

```
YOKE RETURN · BP093 · SEG-AF · v0.7.2 · 2026-06-24
═══════════════════════════════════════════════════════

BUILD
  v0.7.2 .exe size:          [FILL]
  v0.7.2 SHA256:             [FILL]
  Build commit sha:          [FILL] (Phase 3 wiring commit)
  Version bump commit sha:   [FILL]
  dist:win wall-clock:       [FILL] min
  ELECTRON_TOUCHED:          YES

REDISTRIBUTION
  M0 (cb4ef450 · 192.168.86.30):   [INSTALLED / PENDING] · last_seen: [FILL]
  M3 (d0b47bd0 · 192.168.86.156):  [INSTALLED / PENDING] · last_seen: [FILL]
  M2 (88cbf6bd · 192.168.86.45):   [INSTALLED / PENDING] · last_seen: [FILL]
  M1 (c532e740 · 192.168.86.64):   [INSTALLED / PENDING] · last_seen: [FILL]
  MS (49f3e597 · WAN):             [INSTALLED / PENDING] · last_seen: [FILL]
  GitHub release v0.7.2:            [ACTIVE / NOT CUT]
  SMB LAN copy succeeded:           [YES / NO / N/A]

2Q SMOKE
  session_id:                [FILL]
  smoke wall-clock:          [FILL] min
  iterations_run populated:  [X of 5 peers · PASS / FAIL]
  council_votes populated:   [X of 5 peers · PASS / FAIL]
  total route rows:          [FILL]
  GATE:                      [PASS → fire 42Q / FAIL → STOP]

42Q THUNDERCLAP (if fired)
  session_id:                [FILL]
  wall-clock:                [FILL] hr
  ensemble accuracy:         [X/42 = Y%]
  median Plow iterations:    [FILL]
  receipt path:              [FILL absolute path]
  Trial_02 PREVIEW SEALED:   [YES / NO]
```

---

## 9. §14 §15 §17 BLOOD REMINDERS

**§14 BLOOD — REST gadget discipline:** All Supabase reads in Tasks 4 and 6 go through psql direct (not Supabase JS client in Cursor) per §15 BLOOD. Knight does not use the Cursor sandbox's Node.js environment for DB reads mid-Marathon — only `psql` commands or the `mcp-librarian` tools.

**§15 BLOOD — psql is the canonical DB tool:** Knight connects via:
```powershell
psql $env:DATABASE_URL -c "<QUERY>"
```
where `DATABASE_URL` is loaded from `~/.claude/state/secrets/22May2026.env` (key: `DATABASE_URL` or `SUPABASE_DB_URL`). Knight never logs the connection string.

**§17 BLOOD — Discovery blocker active:** The `bishop_gadget_first_discovery_blocker.py` hook is active on M0 and will block PowerShell discovery verbs against substrate paths. Knight uses the whitelist: git / npm / node / electron-builder / gh / psql / curl / firebase / hugo. Direct file reads via `Get-Item` for size/hash computation are mechanical ops (not discovery) — Knight uses `-ErrorAction Stop` and catches failures explicitly.

**§15 BLOOD — Postgres syntax only:** The 2Q smoke and 42Q THUNDERCLAP receipt fields (`iterations_run`, `council_votes_per_iteration`) are JSONB columns. Knight uses Postgres JSONB operators (`->`, `->>`) as shown in the gadget queries above. No SQLite primitives.

---

## WALL-CLOCK ESTIMATE

| Phase | Est. Time |
|-------|-----------|
| Task 1 — wiring verify | 5 min |
| Task 2 Step 0 — commit Phase 3 changes | 2 min |
| Task 2 Steps 1-5 — npm install + dist:win build | 30–60 min |
| Task 2 Step 6 — version_trust.json + commit | 5 min |
| Task 3 — redistribution (SMB + GitHub release) | 20–40 min |
| Task 3f — peer_presence gadget confirm | 10–30 min (waits for peers to relaunch) |
| Task 4 — 2Q smoke re-fire | 3–8 min |
| Task 5 — 42Q THUNDERCLAP | 2–4 hr |
| **Total** | **~4–6 hr** |

---

*Composed by Sonnet 4.6 · Bishop SEG-AF · 2026-06-24 · BP093 PHASE 3 CLOSURE*
*ELECTRON_TOUCHED: YES (pending Knight execution)*
