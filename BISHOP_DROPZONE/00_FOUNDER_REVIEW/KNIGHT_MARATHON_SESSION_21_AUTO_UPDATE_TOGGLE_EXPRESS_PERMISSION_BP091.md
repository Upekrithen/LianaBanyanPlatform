# Knight Marathon Session 21 — MnemosyneC Auto-Update Toggle (Express-Permission)
## BP091 · 2026-06-22 · STAGED FOR FOUNDER RATIFY

**Model:** Sonnet 4.6 (Knight execution). Bishop strategist composed.

---

## FOUNDER DIRECT (verbatim · BP091 2026-06-22 ~16:00 Central)

> *"I want a toggle so that I can have my Mnemosynec updated automatically, with my express permission. Like windows update."*

## CANON BINDING

Per `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086.eblet.md`:

- **"No silent install. Ever."** — every install requires user approval
- **Circle of Influence (Brick Wall opt-in) auto-approves trusted signers**
- **The TOGGLE existing IS the express permission.** Toggling ON = perpetual consent for the LB-signed v0.5.x → v0.5.y patch stream. Toggling OFF = manual approval per update.

This Marathon implements the toggle. The signed-by-LB requirement composes with existing Ed25519 release signing (per `release-sign.yml` workflow in the platform repo).

---

## EMPIRICAL STATE (gadget-confirmed by Bishop 2026-06-22 ~16:00 Central)

| Surface | Current state |
|---|---|
| MnemosyneC v0.5.17 update mechanism | Manual "Check for Updates" button (top-right of Settings) — Founder screenshot Screenshot 2026-06-22 160503.png |
| Existing partial: `Auto-install on quit` toggle | Already present + ON by default. ONLY triggers install on quit IF an update was manually downloaded. Does NOT auto-check or auto-download. |
| Version source-of-truth | `version_trust.json` (canonical Tower data) at `https://mnemosynec.org/version_trust.json` per `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090` |
| Release signing | Ed25519 via `release-sign.yml` GitHub workflow — every .exe signed by LB key |
| Current version on M0 | v0.5.17 (banner: "up to date") |
| Active peers all on v0.5.17 | 5 of 5 ✅ (Bishop gadget BP091 ~16:00) |

---

## SCOPE — Two-toggle auto-update mechanism

### Toggle 1 — "Automatic Updates"

| State | Behavior |
|---|---|
| **OFF (default)** | Existing v0.5.16 behavior — manual "Check for Updates" button. Notify only when user clicks check. |
| **ON** | Auto-check on launch + every 6 hours · auto-download in background · install per Toggle 2 schedule |

When user flips ON, show a one-time consent modal:
> "Enable automatic updates? MnemosyneC will check for new versions every 6 hours and download them in the background. Updates will install on your chosen schedule. All updates are cryptographically signed by Liana Banyan Corporation — no third party can push updates to your machine. You can disable this at any time. [Enable] [Cancel]"

User must click [Enable]. The click is the canonical express permission per `canon_mic_stamped_user_approval`. Bishop notes: this single click is consent for the perpetual v0.5.x → v0.5.y patch stream, NOT major version jumps (v0.5.x → v1.0.x would re-prompt).

### Toggle 2 — Install Timing (visible only when Toggle 1 ON)

Radio buttons (one of):
- **On next launch** — install when user closes-and-relaunches
- **On quit** *(default — composes with existing `Auto-install on quit` toggle)* — install during clean shutdown
- **At a scheduled time** — daily window picker (e.g., 3 AM local), with skip-if-busy fallback to next launch
- **Approve each** — auto-download but require user "Install Now" click per update

### Toggle 3 *(NEW, optional)* — "Major version jumps still require explicit approval"

Default ON. Checkbox under Toggle 2. Distinguishes patch (v0.5.x → v0.5.y) from major (v0.5.x → v1.0.x). The major-version-explicit-approval is a safety rail per "no silent install" canon.

---

## BLOCK 1 — Settings UI (Knight)

File: locate the React Settings component (probably under `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\components\Settings\` or similar)

Add new section **AUTOMATIC UPDATES** below existing **APP VERSION** section. Three toggles per above. Visual style matches existing toggle components.

State persistence: write to existing user-config store (the same place that holds the `Auto-install on quit` boolean). Persisted across launches.

---

## BLOCK 2 — Auto-Check Polling (Electron main process)

File: locate the existing update-check logic (probably triggered by the "Check for Updates" button). Wrap it in a polling scheduler:

```ts
const AUTO_UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

let autoUpdateTimer: NodeJS.Timer | null = null;

function startAutoUpdateLoop() {
  if (autoUpdateTimer) return;
  // initial check ~30s after launch (don't slam network on startup)
  setTimeout(checkAndMaybeDownload, 30_000);
  autoUpdateTimer = setInterval(checkAndMaybeDownload, AUTO_UPDATE_CHECK_INTERVAL_MS);
}

function stopAutoUpdateLoop() {
  if (autoUpdateTimer) { clearInterval(autoUpdateTimer); autoUpdateTimer = null; }
}

async function checkAndMaybeDownload() {
  const cfg = await loadUserConfig();
  if (!cfg.autoUpdates) return;
  const trust = await fetchVersionTrust(); // GET https://mnemosynec.org/version_trust.json
  const latest = trust.versions.find(v => v.tier === 'latest');
  const currentVer = app.getVersion();
  if (semverGt(latest.version, currentVer)) {
    // Major version jump? Honor Toggle 3.
    if (isMajorJump(currentVer, latest.version) && cfg.majorVersionRequiresApproval) {
      notifyUserMajorAvailable(latest.version);  // notification only, no auto-download
      return;
    }
    await downloadInBackground(latest.url, latest.sha256);
    await verifySignature(latest);  // Ed25519 LB key
    notifyUserPatchDownloaded(latest.version);  // ready per Toggle 2 schedule
  }
}
```

When user flips Toggle 1 OFF → call `stopAutoUpdateLoop()`. When flipped ON → `startAutoUpdateLoop()`. Also call on app boot if persisted config says ON.

---

## BLOCK 3 — Background Download + Signature Verification

When auto-check finds a new version:

1. Download .exe to a staging path (e.g., `C:\Users\<user>\AppData\Roaming\MnemosyneC\updates\MnemosyneC-Setup-X.Y.Z.exe.staged`)
2. Compute SHA-256 of downloaded file
3. Compare to `version_trust.json.versions[].sha256` for that version
4. Verify Ed25519 signature using public key bundled in MnemosyneC at build time (LB release signer pubkey)
5. If any of (3) or (4) fails → DELETE staged file, log incident, notify user "Update download failed signature check — automatic update paused" (security event, surface immediately)
6. If pass → rename .staged → .ready, notify user per Toggle 2 schedule

---

## BLOCK 4 — Install Trigger Per Toggle 2

| Toggle 2 setting | Trigger |
|---|---|
| On next launch | When app starts AND .ready file present → spawn installer + quit current app |
| On quit | When app shuts down cleanly AND .ready file present → spawn installer (existing behavior) |
| At scheduled time | At configured time, IF app is running AND .ready file present → notify user + countdown 60s before install. If user is mid-task, snooze 1 hour, retry. |
| Approve each | Show OS notification "Update v0.5.X ready — Install Now / Later" |

---

## BLOCK 5 — Telemetry + Audit Trail

Every auto-update event writes to `~/.mnemosynec/update-history.jsonl`:

```json
{"ts":"2026-06-22T20:00:00Z","event":"check","result":"already_current","version":"0.5.17"}
{"ts":"2026-06-22T20:00:00Z","event":"check","result":"new_available","current":"0.5.17","latest":"0.5.18"}
{"ts":"2026-06-22T20:00:00Z","event":"download_started","version":"0.5.18","url":"https://mnemosynec.org/download/MnemosyneC-Setup-0.5.18.exe"}
{"ts":"2026-06-22T20:00:00Z","event":"download_complete","version":"0.5.18","sha256":"<hash>","signature_valid":true}
{"ts":"2026-06-22T20:00:00Z","event":"install_scheduled","trigger":"on_quit"}
{"ts":"2026-06-22T20:00:00Z","event":"install_complete","new_version":"0.5.18","previous_version":"0.5.17"}
```

User can review history in Settings → Automatic Updates → "View Update History" button. Cooperative-class transparency.

---

## BLOCK 6 — Composition with existing `Auto-install on quit` toggle

The existing `Auto-install on quit` toggle becomes a CHILD of the new Auto Updates section. It's the default value of Toggle 2 when Toggle 1 is ON. If user had `Auto-install on quit` = ON pre-upgrade (which is the default), then:
- Toggle 1 (Automatic Updates) starts OFF (requires explicit opt-in)
- When user opts in to Toggle 1, Toggle 2 defaults to "On quit" (honoring their existing preference)

NO existing config is destroyed. Migration is additive only.

---

## VERIFICATION GATES (T1-T10)

| # | Gate | Pass criteria |
|---|---|---|
| T1 | New Settings section renders | Founder sees "AUTOMATIC UPDATES" section below "APP VERSION" |
| T2 | Toggle 1 OFF behavior | Existing manual flow unchanged |
| T3 | Toggle 1 ON consent modal | Modal appears + requires explicit [Enable] click |
| T4 | Auto-check polls every 6 hrs | `update-history.jsonl` shows periodic `event:check` entries |
| T5 | Auto-download verifies SHA + signature | Tampered .exe → DELETE + user notification |
| T6 | Toggle 2 "On quit" install | App close triggers installer for .ready files |
| T7 | Toggle 2 "Scheduled" install | 3 AM (configurable) install runs cleanly |
| T8 | Toggle 3 major-version-requires-approval | v0.5.x → v1.0.x triggers notification, NOT auto-install |
| T9 | Update history surface | Settings → "View Update History" shows JSONL prettily |
| T10 | Disable + re-enable | Toggle 1 OFF stops polling; toggle ON resumes cleanly |

---

## OUT OF SCOPE

- Rollback (downgrade auto-flow). Manual reinstall of older version still works via direct .exe download.
- Update notes / changelog display in-app. Defer to future Marathon.
- Differential / delta updates. v1 ships full .exe each time. Bandwidth optimization is later.
- Auto-update for self-hosted / sideloaded peers. Only applies to peers using the canonical mnemosynec.org download.

---

## DEPENDENCIES + COMPOSITION

- `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086` — express permission via toggle
- `canon_hugo_tower_version_data_source_is_version_trust_json_not_version_json_bp090` — version source-of-truth
- Existing `release-sign.yml` Ed25519 release signing
- Existing `Auto-install on quit` toggle (becomes child of new section)

---

## ESTIMATED WALL CLOCK

6-9 hrs single Knight session. Block 1 (UI) ~2hrs · Block 2 (polling) ~1.5hr · Block 3 (sig verify) ~1.5hr · Block 4 (timing) ~1hr · Block 5 (audit) ~0.5hr · Block 6 (composition) ~0.5hr · T1-T10 verification ~1hr.

---

## RATIFICATION GATES (Founder)

| # | Gate | Status |
|---|---|---|
| R1 | Two-toggle structure (Toggle 1 = auto-on-off, Toggle 2 = install timing) | PENDING |
| R2 | Default Toggle 1 = OFF (opt-in) per "no silent install" canon | PENDING |
| R3 | One-time consent modal text on Toggle 1 enable | PENDING |
| R4 | 6-hour check interval default | PENDING |
| R5 | Toggle 3 = major-version-requires-approval (default ON) | PENDING |
| R6 | Update history surface as JSONL with UI viewer | PENDING |
| R7 | Existing `Auto-install on quit` becomes child of new section (no destructive migration) | PENDING |

Ratify R1-R7 + I send M21 to Knight as next Brick Wall.

---

## ANTICIPATED RETURN ARTIFACTS

Knight's KniPr return MUST include:
1. Settings UI screenshot showing new section
2. Toggle ON → consent modal screenshot
3. Sample `update-history.jsonl` from empirical smoke test (Knight bumps a test version locally)
4. Signature verification empirical test (tampered .exe rejected)
5. T1-T10 gate pass/fail table
6. Build commit hash + version bump (v0.5.18 if shipping this same Marathon, else staged for next release)

— Bishop Opus 4.7 · BP091 · 2026-06-22 ~16:05 Central · Sonnet 4.6 SEG composed · Knight Sonnet 4.6 executes
