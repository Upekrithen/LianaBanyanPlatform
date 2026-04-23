# TouchStone v1 — Deterministic Coordinator

**K402 · Phase 1 of The Chessboard · Liana Banyan Platform**

TouchStone is the deterministic task coordination system for the four chess pieces (Bishop, Knight, Rook, Pawn). It holds a manifest of deliverables, dispatches tasks to agents, and verifies completion using falsifiable predicates. **Zero AI. Zero heuristics. Correct and cheap.**

## Quick Start

```bash
# Verify all deliverables
python librarian-mcp/touchstone/verify.py

# Verify a specific deliverable
python librarian-mcp/touchstone/verify.py B096-pudding-182

# Dispatch pending tasks to agent dropzones
python librarian-mcp/touchstone/dispatch.py

# Log an event
python librarian-mcp/touchstone/ledger.py started B096-pudding-184

# Run tests
python librarian-mcp/touchstone/tests/test_verify.py
python librarian-mcp/touchstone/tests/test_dispatch.py
```

## MCP Tools

Four MCP tools are available when the Librarian MCP server is running:

| Tool | Description |
|------|-------------|
| `touchstone_list` | List deliverables, filtered by owner/status |
| `touchstone_verify` | Run predicates on one or all deliverables |
| `touchstone_claim` | Claim a pending deliverable (sets in_progress) |
| `touchstone_complete` | Submit completion; predicates run; pass = completed, fail = rejected |

## Manifest Structure

`manifest.json` contains an array of deliverables:

```json
{
  "id": "B096-pudding-182",
  "title": "Pudding #182: The Shop That Fixed My Son's Car",
  "owner": "bishop",
  "depends_on": [],
  "verification": [
    { "predicate": "file_exists", "args": { "path": "BISHOP_DROPZONE/..." } },
    { "predicate": "count_matches", "args": { "file": "...", "min_bytes": 8000 } }
  ],
  "status": "completed",
  "completed_at": "2026-04-10T18:30:00Z",
  "notes": "..."
}
```

Status values: `pending | in_progress | completed | blocked | failed`.

## Adding a Predicate

1. Create `librarian-mcp/touchstone/predicates/your_predicate.py`
2. Implement: `def check(args: dict) -> dict:` returning `{ "passed": bool, "observed": any, "message": str }`
3. Register in `predicates/__init__.py`
4. All predicates must be side-effect-free (except git_committed which shells out to git)

## Available Predicates

| Predicate | Description |
|-----------|-------------|
| `file_exists` | Path exists and is non-empty |
| `git_committed` | File is tracked and clean in git |
| `supabase_row_exists` | Read-only SELECT returns >= 1 row |
| `librarian_index_contains` | Librarian index JSON has a key or substring |
| `count_matches` | File meets byte/line count threshold |
| `hash_matches` | SHA-256 of file matches expected hash |

## Adding a Deliverable

Edit `manifest.json` directly. Add a new object to the `deliverables` array with all required fields. Run `verify.py` to confirm the predicates are correctly wired.

## Ledger

`ledger.jsonl` is append-only. Event types: `created`, `assigned`, `started`, `predicate_run`, `completed`, `failed`, `blocked`, `escalated_to_founder`.

## Dispatch

`dispatch.py` writes task files to agent dropzones:
- `bishop` → `BISHOP_DROPZONE/TOUCHSTONE_TASKS/`
- `knight` → `KNIGHT_DROPZONE/TOUCHSTONE_TASKS/`
- `rook` → `ROOK_DROPZONE/TOUCHSTONE_TASKS/`
- `pawn` → `PAWN_DROPZONE/TOUCHSTONE_TASKS/`
- `founder` → `FOUNDER_ACTION_QUEUE/`

## Architecture Note

TouchStone is deterministic by design. Predicate conflicts mean something is actually broken — the system halts and surfaces the failure instead of guessing. This is load-bearing infrastructure.
