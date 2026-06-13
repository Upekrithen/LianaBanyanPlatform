---
notification: BP081_KNIGHT_NOTIFICATION_SECRETS_ENV_ACTIVE_PATH
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: Knight notification of active secrets/env path. PATH ONLY. Contents are BLOOD STATUTE forbidden.
status: ACTIVE
hard_bindings:
  - "🔒 BP081 BLOOD STATUTE — secrets file contents NEVER exposed. Founder will NOT rotate. Exposure = permanent compromise."
related_canon: feedback_secrets_env_path_active_22may2026_never_expose_bp081
---

# 🔒 Knight Notification — Active Secrets Env Path · BP081

## Active path (USE FOR BUILDS)

`C:\Users\Administrator\.claude\state\secrets\22May2026.env`

## Deprecated path (DO NOT USE)

`C:\Users\Administrator\Documents\Asteroid-ProofVault\LockBox\SDS.env` — does not exist on disk, no longer canonical.

## Required usage pattern (HARD BINDING)

When a build / deploy / API call needs env vars, load WITHOUT printing contents.

### PowerShell pattern (canonical for Knight on Windows)

```powershell
Get-Content "C:\Users\Administrator\.claude\state\secrets\22May2026.env" | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') {
    [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process')
  }
}
firebase deploy --only hosting
```

**Critical:** the env load goes into Process scope, never echoed. The `if ($_ -match ...)` skips comment lines starting with `#`. The values flow directly into env vars, never to stdout.

### Bash pattern (if needed for cross-platform scripts)

```bash
set -a
source "C:/Users/Administrator/.claude/state/secrets/22May2026.env"
set +a
firebase deploy --only hosting
```

### dotenv-cli pattern (if installed)

```
dotenv -e "C:\Users\Administrator\.claude\state\secrets\22May2026.env" -- firebase deploy --only hosting
```

## FORBIDDEN operations (HARD BINDING)

- ❌ `Get-Content "<path>"` → stdout (prints contents)
- ❌ `cat "<path>"` (prints contents)
- ❌ `Write-Host`, `echo`, or any print of env var values after loading
- ❌ Including file contents in yoke-returns, receipts, logs, screenshots, MCP responses
- ❌ Copying the file to any location (Asteroid-ProofVault, BISHOP_DROPZONE, anywhere)
- ❌ Reading the file "just to verify it exists" — use `Test-Path` (boolean only)
- ❌ Echoing key NAMES with VALUES (e.g. `STRIPE_API_KEY=sk_live_...`)
- ❌ "Sanitized" output that shows partial key chars
- ❌ Debug print statements that include `$env:STRIPE_API_KEY`

## ALLOWED operations

- ✅ Reference the PATH in scripts / docs / Yokes (path-only)
- ✅ `Test-Path "<path>"` (returns boolean, no content read)
- ✅ Load env into Process scope via the canonical PowerShell pattern above
- ✅ Pass env-loaded subprocess to authenticated tools (Firebase CLI, Stripe SDK, etc.)
- ✅ Mention that "ENV_VAR_NAME is set" in error messages without revealing value
- ✅ Use `[Environment]::GetEnvironmentVariable('NAME', 'Process')` internally if needed

## Why permanent-class

**Founder direct: "I WILL NOT ROTATE THEM."**

One leak = compromised forever. There is no recovery. The blood-statute applies to:
- Bishop
- Knight
- All SEGs (Sonnet 4.6, Shadow E-Giants, any subagent)
- All Pixie Dust dispatches
- All manual operations
- All build / deploy / CI / debug operations

## Composes with existing canon

- `canon_substrate_blacklist_secrets_folder_no_pixie_dust_bp051` — `.claude/state/secrets/` folder blacklisted from Pixie Dust (existing). This binding EXTENDS to all actors.
- BP081 Statutes §4 — Secrets blacklist (folder-level). This file is the specific active member.

## On VERIFY drift detection

If a Knight VERIFY SEG yoke-return contains anything resembling an env value (sk_*, pk_*, hf_*, sk-proj-*, AIza*, AKIA*, ghp_*, any high-entropy alphanumeric token-shaped string), Bishop must ABORT the relay, redact the yoke-return on disk, and surface to Founder for evaluation. Treat suspected leaks as P0 incidents — even if they turn out to be false positives, the discipline of erring toward redaction is correct.

— Bishop · BP081 · 2026-06-13
