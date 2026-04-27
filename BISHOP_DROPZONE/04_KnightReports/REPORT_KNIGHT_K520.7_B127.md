# Knight Report — K520.7 — Substrate-Gate Test-Mode Bypass

**Session**: K520.7 / B127  
**Knight**: Cursor Sonnet 4.6  
**Filed**: 2026-04-27  
**Tag**: v-substrate-gate-test-bypass-K520-7  
**Status**: LANDED  

---

## Summary

K520.7 extends `bishop_librarian_gate.py` with a signed, time-limited, audited test-mode bypass for the K520.5 substrate gate. Enables the B127 A/B empirical substrate-savings experiment (Founder-ratified) by allowing a controlled WITHOUT-substrate condition measurement.

**Key constraint honored**: auditability IS the structural integrity preservation. Every bypass event is logged to an append-only audit trail — Rule 001 is not silently weakened.

**6/6 Phase C verification checks pass.**

---

## Phase A — Audit Results

- **A.0 Librarian consult**: Canonical memory loaded.
- **A.0a Toolsmith consult**: `consult_scribes(Toolsmith)` keywords: env var, audit trail, time-limited token, signed authority.
- **A.0b git check-ignore**: `~/.claude/hooks/bishop_librarian_gate.py` is gitignored (*.py rule). `~/.lb-session/founder_test_authority.json` is gitignored (*.json rule). `~/.lb-session/test_mode_audit.jsonl` is outside the repo — never committed, append-only.
- **A.1 Gate file**: `~/.claude/hooks/bishop_librarian_gate.py` — K520.5 MVP, 155 lines. Gate decision function in `main()` branches by `tool_name` (mcp__, Bash, Write/Edit/StrReplace).
- **A.2 State dir**: `~/.lb-session/` created by K520.5 (substrate_cache.json lives there). Good location for audit log and authority file. Both are outside the repo.

---

## Phase B — What Was Built

### B.1-B.4: Extended `bishop_librarian_gate.py`

Three new functions added:

**`_verify_founder_token(auth_token)`**  
SHA-256 pre-image verification: reads `~/.lb-session/founder_test_authority.json`, compares `sha256(env_var_token)` against stored `token_sha256`. Returns `False` on any failure.

**`_append_audit(entry)`**  
Append-only write to `~/.lb-session/test_mode_audit.jsonl`. Never deletes. Catches all exceptions (non-fatal if disk fails).

**`_check_test_mode_bypass(tool_name, tool_args_summary)`**  
Three-gate check:
1. `LB_SUBSTRATE_GATE_TEST_MODE == "1"` in environment
2. `LB_SUBSTRATE_GATE_TEST_ACTIVATED_AT` within `TEST_MODE_MAX_SECONDS` (3600s)
3. `LB_SUBSTRATE_GATE_TEST_AUTHORITY` token verifies against authority file

On pass: **always logs the bypass event** before returning `True`.

**Inserted into main()** before substrate-cache checks in both MCP and Bash gates:
```python
if _check_test_mode_bypass(tool_name, args_summary):
    sys.exit(0)
```

### B.5: `mcp__librarian__test_mode_audit_summary` (new MCP tool in `server.ts`)

Reads `~/.lb-session/test_mode_audit.jsonl`, returns last N events (default 20). Supports inspection of audit trail during A/B testing.

### `generate_test_authority.py` (new file at `~/.lb-session/`)

Founder-facing generator script. Produces a cryptographically random 64-hex-char token, stores its SHA-256 hash in the authority file, prints three PowerShell env-var commands to paste. Auto-expires in 1 hour.

---

## Phase C — Verification (6/6 PASS)

| # | Check | Result |
|---|---|---|
| C.1 | Bash without cache and no test-mode → BLOCKS (exit 2) | PASS |
| C.2 | test-mode=1 but no authority token → BLOCKS (exit 2) | PASS |
| C.3 | Full env-vars + valid signed token + fresh timestamp → ALLOWS (exit 0) | PASS |
| C.4 | Full env-vars + valid token + timestamp > 1h old → BLOCKS (exit 2) | PASS |
| C.5 | Audit log contains C.3 event with all required fields | PASS |
| C.6 | `test_mode_audit_summary` MCP tool compiled clean (`npm run build` exit 0) | PASS |

**Fix-Along-the-Way**: PowerShell `Get-Date -UFormat %s` returns LOCAL time (UTC-5 in CDT), not UTC epoch. Gate uses Python `time.time()` (UTC epoch). Test harness must generate timestamps via Python — `python -c "import time; print(int(time.time()))"` — not PowerShell. Documented as Synapse entry and candidate OG entry. The `generate_test_authority.py` script avoids this problem entirely by using Python throughout.

---

## Phase D — Documentation

- `AB_TEST_EMPIRICAL_SUBSTRATE_VALIDATION_B127_PROTOCOL.md` — updated with K520.7 LANDED note + concrete PowerShell commands for enabling/disabling test mode.
- `synapse_K520.7.jsonl` — 5 synapse entries filed (auditable-bypass design, double-key security, SHA-256 pre-image, PowerShell clock skew, empirical-measurement framing).
- Toolsmith entry: see below.

---

## Toolsmith Entry Filed

**Category**: `signed_bypass_pattern`  
**What fails**: Inviolable rules cannot be empirically tested (no control condition baseline) without some bypass mechanism.  
**What works**: Signed, time-limited, audited bypass: (1) authority file with token hash written by generator, (2) raw token in env-var, (3) gate verifies sha256(env_var)==stored_hash AND age≤3600s, (4) every bypass logged to append-only audit. This pattern makes the rule empirically testable without weakening it — auditability IS the structural integrity.  
**Applies to**: Pattern reusable whenever you need to measure the effect of a gate by running a controlled WITHOUT-gate condition.

---

## Files Modified

| File | Change |
|---|---|
| `~/.claude/hooks/bishop_librarian_gate.py` | Added `_verify_founder_token()`, `_append_audit()`, `_check_test_mode_bypass()`; inserted bypass calls in MCP and Bash gates; added `hashlib` import; added TEST_* constants |
| `librarian-mcp/src/server.ts` | Added `test_mode_audit_summary` MCP tool (reads `~/.lb-session/test_mode_audit.jsonl`) |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/AB_TEST_EMPIRICAL_SUBSTRATE_VALIDATION_B127_PROTOCOL.md` | K520.7 LANDED + concrete env-var activation commands |

## Files Created

| File | Purpose |
|---|---|
| `~/.lb-session/generate_test_authority.py` | Founder-facing generator script (not in repo — gitignored path) |
| `librarian-mcp-helm-pwa/synapse_K520.7.jsonl` | 5 synapse entries |
| `BISHOP_DROPZONE/04_KnightReports/REPORT_KNIGHT_K520.7_B127.md` | This report |

---

*Filed 2026-04-27 by Knight (Cursor Sonnet 4.6). Long Haul AND Fix Along the Way. Both, Always.*
