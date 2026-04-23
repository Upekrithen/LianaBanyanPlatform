# librarian-mcp

The internal MCP server that powers the in-repo Liana Banyan working memory.
Indexes the workspace, exposes ~30 tools (`brief_me`, `search_knowledge`,
`get_session_context`, `consult_scribes`, …) over stdio, and writes the
on-disk index that every other agent consults.

This directory is the *internal* twin of the public `librarian-mcp-public/`
PyPI package. The public package is what members install; this code is what
runs against the full LianaBanyanPlatform repo.

---

## Reproducibility policy (K441, B117)

Several files in this directory are caught by broad ignore rules in the
repo-root `.gitignore` (`*.json`, `*.yaml`, `*.md`). Without explicit
negations a fresh clone could not `npm install` and the Cathedral could not
start. The negations live in **the root `.gitignore`** under a clearly
labelled `# K441 — librarian-mcp reproducibility carve-outs` block.

**The following files MUST stay tracked. If you change the root .gitignore,
keep them tracked or update this list.**

| File                                                                    | Why it must be tracked                                       |
|-------------------------------------------------------------------------|--------------------------------------------------------------|
| `package.json`                                                          | npm dependency manifest                                      |
| `package-lock.json`                                                     | Reproducible install graph                                   |
| `tsconfig.json`                                                         | Required for `npm run build`                                 |
| `README.md` *(this file)*                                               | Policy documentation                                         |
| `stitchpunks/scribes/registry.yaml`                                     | Cathedral runtime registry; loaded at server startup         |
| `stitchpunks/SP*.md`                                                    | SP-2x Cathedral spec files, single source of truth for tools |
| `r10_cross_vendor/README.md`, `scrambler/README.md`, `touchstone/README.md` | Subsystem entry-point docs                              |

All `.ts` files under `src/` are unaffected — `*.ts` is not in the root
ignore list — so they don't need explicit negation.

### What stays ignored (deliberately)

- `index/*.json`, `index/*.jsonl` — regenerable via `npm run rebuild`,
  ~10–15 MB total. Bloating git history serves nothing.
- `stitchpunks/sp*_state.json` — runtime checkpoint state for SP pipelines.
- `node_modules/`, `dist/` — derived artifacts.
- `r10_cross_vendor/results*/` — empirical test outputs (kept as `.gz` if needed).

### Known gap (flagged for Bishop, NOT fixed in K441)

`librarian-mcp/stitchpunks/sp*.py` (SP-1 through SP-20 implementations) are
caught by the root `*.py` ignore and are **currently un-tracked**. They look
runtime-critical to the Stitchpunk pipeline, but K441's scope was the
explicit list above; the broader audit needs Bishop disposition. If those
need to be tracked, add `!librarian-mcp/stitchpunks/sp*.py` to the K441 block
and the table above.

---

## Quick start (fresh clone)

```bash
cd librarian-mcp
npm install
npm run build
npm run rebuild   # builds the index from scratch (~30s incremental, ~90s full)
npm start         # boots the MCP server over stdio
```

---

## Commands

| Command              | What it does                                                       |
|----------------------|--------------------------------------------------------------------|
| `npm run build`      | TypeScript → `dist/`                                               |
| `npm run rebuild`    | Re-parses workspace into `index/*.json` (incremental by default)   |
| `npm start`          | Boots stdio MCP server (run from `dist/server.js`)                 |
| `npm test`           | Runs the test suite                                                |

After `npm run rebuild`, **already-running MCP servers** automatically
re-read on the next tool call (K441 Half D — fingerprint-based cache
invalidation). No client restart required.

---

## Layout

```
librarian-mcp/
├── src/
│   ├── server.ts                MCP server, ~30 tool handlers
│   ├── indexer/                 buildIndex.ts + ~14 parser modules
│   ├── scribes/                 Cathedral (K436): registry, consult, fates
│   ├── router/                  MoneyPenny briefing/debrief/checklist
│   ├── predicates/              Letter-system predicate runners
│   └── types.ts                 Shared TS types
├── stitchpunks/                 SP specs + scribe tablets + registry
├── index/                       Generated; regenerable via `npm run rebuild`
├── r10_cross_vendor/            Eyewitness benchmark + SCEV-1 runners
├── scrambler/                   Triple Scrambler verification
└── touchstone/                  (subsystem)
```
