# Knight's Cathedral

**Instantiated K461/B121 — 2026-04-23**

Knight's Cathedral is the second member-Cathedral in the Liana Banyan Platform, sibling to Bishop's Cathedral at `librarian-mcp/stitchpunks/scribes/`. It is the first empirical reduction-to-practice of:

- **#2268 Member-Owned Cathedrals** — Knight (Cursor-instantiated) is a member-class entity with his own persistent corpus.
- **#2275 AI Companion Vendor-Neutral Bridge** — Knight (Cursor) and Bishop (Claude Code) each maintain their own Cathedral; this is the reference client pattern for external members.
- **A&A #2278 The Cathedral Effect, claim 8 (cooperative-corpus flywheel)** — two Cathedrals running the same benchmark produce a replication measurement stronger than one.

---

## Scribe Inventory

| Scribe | File | Primary Domain |
|--------|------|----------------|
| KnightQueue | `scribes/KnightQueue.jsonl` | Task queue — NEXT / QUEUED / LANDED state |
| KnightHandoffs | `scribes/KnightHandoffs.jsonl` | Landed session reports + commit/tag provenance |
| KnightBRIDLEMemory | `scribes/KnightBRIDLEMemory.jsonl` | BRIDLE-invocation patterns + discipline observations |
| KnightArchitecture | `scribes/KnightArchitecture.jsonl` | Code surfaces touched + architectural decisions |

Schema: `schema.json` (extends Bishop's tablet format with Knight-specific fields).

---

## Tablet Format

Each `.jsonl` file:
- **Line 1:** Cathedral header record (`"type": "header"`)
- **Subsequent lines:** Tablet entries, append-only

Required entry fields (per `schema.json`):
```json
{
  "observation": "what this tablet records",
  "category": "primary domain tag",
  "timestamp": "2026-04-23T20:00:00Z",
  "source_session": "K461",
  "source_document": "path/to/artifact",
  "tokens": 42
}
```

Optional Knight-specific fields:
- `bridle_rule_invoked` (KnightBRIDLEMemory): which BRIDLE rule was exercised
- `commit_hash`: git commit hash if applicable
- `git_tag`: tag name if applicable
- `supersedes`: prior tablet ID if correcting an earlier entry

---

## Courier Maintenance Contract

The SP-7 Courier (running as part of `npm run rebuild`) auto-populates this Cathedral on every build:

1. Scans `BISHOP_DROPZONE/01_KnightPrompts/` → syncs `KnightQueue.jsonl`
2. Scans `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_*.md` → syncs `KnightHandoffs.jsonl`
3. Scans git tags matching `v-*-K[0-9]*` → adds landed-status entries to `KnightHandoffs.jsonl`

**Append-only invariant:** existing tablets are never modified or deleted. New observations are appended with new timestamps. Idempotent: running twice on unchanged artifacts produces zero new tablets.

---

## Derived View

`KNIGHT_QUEUE.md` at the workspace root is auto-rendered from this Cathedral's Scribes on every rebuild via `librarian-mcp/scripts/render-knight-queue.mjs`. The NEXT/QUEUED/LANDED sections are Scribe-derived; the CONTEXT section is Bishop-maintained manually.

---

## Phase Boundary

This is Phase 2 of the multi-Cathedral dogfood architecture. Phase 3 (cross-Cathedral MCP consultation, Knight querying Bishop's Cathedral via MCP client-from-Cursor) is K455c and is explicitly out of scope here.

*Knight's Cathedral — opened K461/B121, 2026-04-23*
