# Knight Report — K520.5 — First-Consult Edict MVP

**Session**: K520.5 / B127  
**Knight**: Cursor Sonnet 4.6  
**Filed**: 2026-04-26  
**Tag**: v-first-consult-edict-mvp-K520-5  
**Status**: LANDED  

---

## Summary

K520.5 implements the MVP slice of A&A #2310 (First-Consult Edict). The Bishop Wing Gate hook is extended from Write/Edit coverage to also gate **Bash** and **MCP-tool** calls — the two largest bypass paths. A persistent substrate cache (`~/.lb-session/substrate_cache.json`) eliminates per-call MCP re-queries: `brief_me` writes the cache once, subsequent tool calls read it.

**8/8 Phase C verification checks pass.**

---

## Phase A — Audit Results

- **A.0 git check-ignore**: No planned files ignored.
- **A.0a Toolsmith consult**: Scribe entries for session-start hooks, MCP_TIMEOUT boundary (K429), and rate-limit architecture reviewed. Key friction: MCP_TIMEOUT needed to be 600000ms to avoid borderline timeouts on first call. Already set.
- **A.1 Gate script**: `bishop_librarian_gate.py` — 70 lines, delegates Write/Edit/StrReplace to Wing engine, early-exits for other tool types. No existing Bash/MCP coverage.
- **A.2 settings.json**: PreToolUse covers `Write|Edit` only. PostToolUse writes timestamp on brief_me/consult_scribes/run_session_start.
- **A.3 Session ID**: Cache uses flat path `~/.lb-session/substrate_cache.json` (no per-session subdirectory). Session window = 8h. Eliminates session-ID-lookup problem in hook subprocess.

---

## Phase B — What Was Built

### B.1 + B.2: Extended hook + substrate cache (`~/.claude/hooks/bishop_librarian_gate.py`)

New behavior:
- **MCP tools** (`mcp__*`): if in `MCP_SUBSTRATE_TOOLS` frozenset → always allow. Otherwise, check cache freshness.
- **Bash**: check cache freshness. Block with actionable error if stale/absent.
- **Write/Edit/StrReplace**: unchanged — delegated to `discipline_wing.engine.evaluate()`.

Cache check:
```python
SUBSTRATE_CACHE_PATH = Path("~/.lb-session/substrate_cache.json")
SESSION_WINDOW_SECONDS = 8 * 3600  # 8 hours

def _check_substrate_cache_fresh() -> bool:
    data = json.loads(SUBSTRATE_CACHE_PATH.read_text(encoding="utf-8-sig"))
    age = int(time.time()) - int(data["ts"])
    return 0 <= age <= SESSION_WINDOW_SECONDS
```

`utf-8-sig` encoding handles BOM-prefixed files written by PowerShell `Set-Content -Encoding UTF8`.

### B.3: `mcp__librarian__refresh_substrate_cache` (new MCP tool in `server.ts`)

- Calls `buildBriefing()` with provided task (or reads `session_task` from existing cache if omitted)
- Writes fresh cache via `writeSubstrateCache(task, text)`
- Returns briefing text + cache metadata footer
- Registered in PostToolUse hook so legacy timestamp also updates

### B.4: `~/.claude/settings.json` updates

Three PreToolUse matchers now active:
- `Write|Edit` → gate script
- `Bash` → gate script (NEW)
- `mcp__.*` → gate script (NEW)

PostToolUse matcher extended to include `mcp__librarian__refresh_substrate_cache`.

### `writeSubstrateCache()` in `server.ts`

```typescript
const SUBSTRATE_CACHE_DIR = resolve(homedir(), ".lb-session");
const SUBSTRATE_CACHE_FILE = resolve(SUBSTRATE_CACHE_DIR, "substrate_cache.json");

function writeSubstrateCache(task: string, briefingText: string): void {
  mkdirSync(SUBSTRATE_CACHE_DIR, { recursive: true });
  writeFileSync(SUBSTRATE_CACHE_FILE, JSON.stringify({
    ts: Math.floor(Date.now() / 1000),
    session_task: task,
    briefing: briefingText,
    cached_at: new Date().toISOString(),
  }, null, 2), "utf-8");
}
```

Called at end of `brief_me` handler.

---

## Phase C — Verification (8/8 PASS)

| # | Check | Result |
|---|---|---|
| C.1 | Bash without cache → BLOCKS (exit 2) | PASS |
| C.2 | Bash after cache written → ALLOWS (exit 0) | PASS |
| C.3 | MCP-tool without cache → BLOCKS (exit 2) | PASS |
| C.4 | MCP-tool after cache → ALLOWS (exit 0) | PASS |
| C.5 | Write still works (regression) | PASS |
| C.6 | Edit still works (regression) | PASS |
| C.7 | Cache at expected path `~/.lb-session/substrate_cache.json` | PASS |
| C.8 | `mcp__librarian__brief_me` always allows without cache | PASS |

**Friction encountered**: Windows VM clock skew — PowerShell `([datetime]::UtcNow - epoch).TotalSeconds` returns ~6h ahead of Python `time.time()`. Both Node.js `Date.now()` and Python `time.time()` read the same Windows system clock (consistent in production). Test harness writes cache via Python to avoid skew. Hook uses `0 <= age <= SESSION_WINDOW_SECONDS` to reject future timestamps.

---

## Phase D — Documentation

- `project_first_consult_edict_b127.md` — "K520.5 SHIPPED" section added with what landed, clock skew note, deferred items.
- `synapse_K520.5.jsonl` — 8 synapse entries filed.

---

## Fix-Along-the-Way items

1. **BOM tolerance**: `utf-8-sig` encoding added to cache read, handles both BOM and non-BOM files.
2. **Positive age guard**: `0 <= age` ensures future-timestamped caches don't pass the gate.
3. **PostToolUse refresh sync**: `refresh_substrate_cache` added to PostToolUse timestamp matcher so legacy Wing gate stays in sync.

---

## Files Modified

| File | Change |
|---|---|
| `~/.claude/hooks/bishop_librarian_gate.py` | Extended to Bash + MCP gating; substrate cache read; MCP_SUBSTRATE_TOOLS allowlist |
| `librarian-mcp/src/server.ts` | `homedir` import; `writeSubstrateCache()`; cache write in `brief_me`; new `refresh_substrate_cache` tool |
| `~/.claude/settings.json` | Bash + `mcp__.*` PreToolUse hooks; `refresh_substrate_cache` in PostToolUse |
| `project_first_consult_edict_b127.md` | K520.5 SHIPPED section |

## Files Created

| File | Purpose |
|---|---|
| `librarian-mcp-helm-pwa/synapse_K520.5.jsonl` | 8 synapse entries |
| `BISHOP_DROPZONE/04_KnightReports/REPORT_KNIGHT_K520.5_B127.md` | This report |

---

## Deferred (follow-up tasks)

- Knight-side Cursor hook (Cursor harness equivalent of bishop_librarian_gate.py)
- Pawn equivalent (paste-back template enforcing substrate-first at template level)
- BRIDLE Rule 12 live edit in BRIDLE_V10.md (post Founder ratification of wording)
- Operational Gotchas Scribe class + 10-15 seed tablets (K520.6 or K521 pre-work)
- K514.5 residual: false-positives on Augur-Pricing scan of new-file Write for memory/markdown files

---

*Filed 2026-04-26 by Knight (Cursor Sonnet 4.6). Long Haul AND Fix Along the Way.*
