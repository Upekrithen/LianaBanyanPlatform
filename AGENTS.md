# AGENTS.md — Universal Agent Instructions for Liana Banyan Platform
## B111, April 20, 2026 — Founder-ratified

This file is read by every AI agent that enters this workspace (Claude Code, Cursor, GitHub Copilot, Continue, Cline, Aider, etc.). It's the universal canonical instruction surface. Edits to this file apply to ALL agents.

---

## Critical rule — never echo secrets

**Never print the raw value of any API key, token, password, env var, or credential in tool output, commit messages, PR descriptions, issue comments, chat responses, logs, or documentation.** This rule is absolute; it has no productivity-based exceptions.

### When a user asks you to "verify a key is set"

Do NOT do:
```bash
echo $ANTHROPIC_API_KEY                    # prints the full value
cat .env                                   # prints every value
printenv | grep KEY                        # prints every value
```

Do INSTEAD:
```bash
echo ${ANTHROPIC_API_KEY:+set}             # prints "set" if non-empty, blank if missing
echo "${#ANTHROPIC_API_KEY}"               # prints length (e.g., 108) without the value
printf '%s...\n' "${ANTHROPIC_API_KEY:0:7}"  # prints first 7 chars only (e.g., sk-ant-)
[ -n "$ANTHROPIC_API_KEY" ] && echo OK     # prints OK if set
```

Or in PowerShell:
```powershell
if ($env:ANTHROPIC_API_KEY) { "set" } else { "missing" }
$env:ANTHROPIC_API_KEY.Length
```

### When loading keys from SDS.env into environment

USE this pattern (loads without echoing):
```powershell
Get-Content "C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\SDS.env" | ForEach-Object { if ($_ -match "^([A-Z_]+)=(.+)$") { [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process") } }
```

```bash
# macOS/Linux (loads without echoing):
set -a; source SDS.env; set +a
```

AVOID: `cat SDS.env`, `Get-Content SDS.env` (without regex loading), any pattern that surfaces raw values.

### What to do if a key leaks anyway

If you realize a raw key ended up in your output — whether from a `cat` that slipped through, a copy-paste error, or a verification command — STOP the session and:
1. **Flag the leak to the user immediately.** Say: "I just leaked `<KEY_NAME>` — rotate it now before continuing."
2. **Recommend rotation** at the vendor's console.
3. **Do not attempt to "scrub" the leak from the transcript** — once echoed, it's in logs. Only rotation mitigates.
4. **Do not repeat the leaked value in your remediation message** (don't say "I leaked sk-ant-abc123..."). Reference by variable name only.

### What counts as "secret"

- API keys (Anthropic, OpenAI, Google, Perplexity, Stripe, Twilio, etc.)
- OAuth tokens, refresh tokens, session tokens
- Database connection strings with embedded credentials
- Supabase service-role keys (always), anon keys (case-by-case; usually fine to echo since they're public)
- Webhook signing secrets
- Founder's personal identifying information beyond what's already public (his email, address, SSN, DOB if encountered)
- Any member's PII
- Investor/member KYC data

When in doubt, treat as secret. The cost of over-caution is minor; the cost of a leak is rotation + transcript residue.

---

## Files and paths that contain secrets

Never read the raw CONTENTS of these files into LLM context, tool output, or any surface that persists:

- `Asteroid-ProofVault/` (entire directory — contains LockBox with `SDS.env`, `DOUBLESECRET.env`, `DOUBLESECRETBACKUP.env`, certificates)
- `**/*.env` (all env files, at any depth)
- `**/*.env.local`, `**/*.env.*`
- `.github/workflows/*.yml` with `secrets:` blocks
- Any file named `credentials.json`, `service-account-*.json`, `*.pem`, `*.key`
- `C:\Users\Administrator\.cursor\FireBase Login.txt` (Firebase credentials — outside the repo)
- `C:\Users\Administrator\.cursor\mcp.json` (MCP server configs with tokens)

**Listing their existence is fine.** Reading their content into output is not.

---

## How to check if a secret exists without reading its value

```bash
# Does a file exist?
test -f path/to/SDS.env && echo "exists"

# List env var NAMES only, not values
grep -oE "^[A-Z_]+=" path/to/SDS.env | sort -u

# Check a key's presence in env
[ -n "${ANTHROPIC_API_KEY}" ] && echo "ANTHROPIC key is set"
```

---

## Other workspace-wide conventions

### Commits and PRs

- **Never commit `.env`, `*.key`, `*.pem`, or anything from `Asteroid-ProofVault/`.** These are gitignored, but pre-commit hooks catch accidents.
- When staging commits, use specific file paths (`git add src/foo.ts`), not `git add -A` or `git add .`.
- Co-author trailer on commits made by AI agents: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` (or equivalent for other agents).

### Bash/PowerShell

- Working directory when Claude Code or Cursor opens this workspace: `C:\Users\Administrator\Documents\LianaBanyanPlatform\` (Windows) or platform equivalent.
- Use forward slashes in path strings even on Windows where the tool supports it; use `$env:VAR` in PowerShell, `$VAR` in bash.

### Memory and canon files

- **Bishop memory** lives at `C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory\`. Files there are persistent across Claude Code sessions.
- **BISHOP_DROPZONE** at the workspace root is the handoff directory between Bishop (Claude) and Knight (Cursor).
- **Cephas content registry** is served from Supabase, mirrored in `platform/supabase/migrations/`.

### Knight session start — read KNIGHT_QUEUE.md first

**Knight (Cursor): at every session start, read `KNIGHT_QUEUE.md` at the workspace root BEFORE any other action.** When Founder types a K-number (e.g., "K460"), resolve it via that file's NEXT / QUEUED / LANDED sections instead of grepping the workspace. Saves time and avoids B119-era stale-prompt collisions.

**Phase 2 LIVE as of K461/B121 (2026-04-23).** `KNIGHT_QUEUE.md` is now a derived view auto-rendered from Knight's Cathedral Scribes:
- **NEXT / QUEUED / LANDED sections** auto-render from `librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightQueue.jsonl` + `KnightHandoffs.jsonl` via `librarian-mcp/scripts/render-knight-queue.mjs` on every `npm run rebuild`.
- **CONTEXT section** is Bishop-maintained manually at session boundaries (not auto-derived).
- **Phase 1** (Bishop-maintained manually at session close) is SUPERSEDED as of K461.

Knight's Cathedral lives at `librarian-mcp/stitchpunks/knight_cathedral/` with four Scribes: KnightQueue, KnightHandoffs, KnightBRIDLEMemory, KnightArchitecture. The SP-7 Courier auto-populates all four on every rebuild (append-only, idempotent). See `librarian-mcp/stitchpunks/knight_cathedral/README.md` for the full maintenance contract.

If `KNIGHT_QUEUE.md` is missing or obviously stale, run `cd librarian-mcp && npm run rebuild:full` to regenerate. Fall back to grep and flag Bishop only if the Cathedral directory itself is missing.

### Canonical numbers — single source of truth

**The only hand-edited source of truth for canonical counts is `librarian-mcp/canonical_values.yaml`.** Everything else (the Librarian `overview.json`, the React hook `platform/src/hooks/useCanonicalStats.ts`, any report or letter citing these numbers) is downstream.

When you change a canonical count (innovation count, Crown Jewels, formal claims, provisional apps filed, production systems):

1. **Edit `canonical_values.yaml` FIRST.** Update the relevant key under `stats:`.
2. **Run `cd librarian-mcp && npm run rebuild`.** This regenerates `overview.json`, codegens the React hook DEFAULTS from the YAML, then runs `verify:canonical` which fails loudly if anything is out of sync.
3. **Never hand-edit** `useCanonicalStats.ts` DEFAULTS for the five YAML-sourced fields (`innovationCount`, `crownJewels`, `patentApplications`, `patentClaims`, `productionSystems`). Those lines are auto-generated; your edit will be overwritten on next rebuild.
4. **Other hook fields** (`founderAge`, `knightSessions`, etc.) are hand-maintained for now. Update them in place; they are not covered by codegen.

If you see a drift report (`✗ verify:canonical FAILED`), do NOT paper over it by editing the downstream file. Find the YAML entry, fix it there, rebuild.

Rationale: the B118→B121 drift incident shipped stale counts into the Librarian for two sessions because the YAML and the hook were independently hand-edited. The rebuild script now enforces single source of truth mechanically.

### Naming conventions

- **Knight prompts:** `PROMPT_KNIGHT_K<NNN>_B<NNN>_<DESCRIPTION>.md` in `BISHOP_DROPZONE/01_KnightPrompts/`.
- **Pawn prompts:** `PROMPT_PAWN_B<NNN>_<DESCRIPTION>.md` in `BISHOP_DROPZONE/02_PawnPrompts/`.
- **Migrations:** `YYYYMMDDHHMMSS_description.sql` in `platform/supabase/migrations/`.

### Session IDs

Session IDs follow the format `K<NNN>`, `B<NNN>`, `R<NNN>`, `P<NNN>` (single uppercase letter + digits). The `update_session` MCP tool enforces a plausibility guard at the write path:

- IDs with a numeric component **> 9,999** are hard-rejected (hard cap).
- IDs whose number exceeds the current prefix max by more than **200** are rejected (adaptive buffer).
- **Escape hatch:** prefix the ID with `TEST_` (e.g., `TEST_K999`) to bypass the guard for legitimate test use. These are automatically excluded from session-gap detection in `staleness.py`.

Do not use `TEST_`-prefixed IDs in production session records. The guard exists to prevent accidental ghost-anchor injection (see K452/K459 postmortem).

### When in doubt

If you are uncertain whether an action would leak a secret, surface PII, or modify a gitignored file, pause and ask the user. The cost of asking is low; the cost of being wrong is high.

---

## Related files

- `.cursorignore` — files Cursor's indexer must not read (enforces the above at tool-scope)
- `.gitignore` — files git must not track (enforces the above at commit-scope)
- `.pre-commit-config.yaml` — hooks (e.g., gitleaks) that scan for secrets before commits
- `.github/workflows/*.yml` — CI that also runs secret-scanners on pushes

All four layers are defense-in-depth. This AGENTS.md file is the behavioral layer; the other three are the enforcement layer.

---

*Saved B111, April 20, 2026. Bishop (Claude Opus 4.7). Founder-ratified. Applies to all AI agents entering this workspace.*
