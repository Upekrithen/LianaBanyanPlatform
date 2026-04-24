# K476 Handoff — KISS CLI Subcommands for Mass-Market Customer Journey

**Session:** K476  
**Bishop session:** B122  
**Landed:** 2026-04-24  
**Tags:** `v0.4.0`, `v-kiss-cli-subcommands-K476`  
**Repo:** `librarian-mcp-public/`

---

## Summary

Ships the mass-market tier of the three-tier product structure. `pip install librarian-mcp` now delivers a standalone `librarian` CLI that lets any user (no MCP client required) ingest their own content and query it with Cathedral-enhanced retrieval, then paste the result into Comet, ChatGPT, Claude.ai, or any LLM.

## Porting Decision

The public package had only intent-keyed preload bundles — no Scribe/Cathedral infrastructure. Per K476's decision gate, the minimum Cathedral surface was ported fresh into `src/librarian_mcp/cathedral.py`:
- Registry loader (`registry.yaml` — with pyyaml if available, hand-rolled parser fallback)
- Tablet I/O (`scribe_<name>.jsonl` — stdlib json only)
- Auto-keyword extraction (stdlib tokenizer + frequency scoring, no external deps)
- Keyword-based retrieval scoring (`_tablet_score`)
- Output formatters (comet, raw, markdown)

**Not ported:** full BRIDLE memory, Bishop/Knight/Pawn Cathedral topology, consult.ts routing, Fates system. These remain in the private `librarian-mcp/`. The public `cathedral.py` is a mass-market surface designed for local single-user use.

## Final CLI Surface

```
librarian init [--with-preload {minimal,full}] [--cathedral-dir PATH]
librarian ingest FILE --scribe-name NAME [--mode {corpus,observational}] [--cathedral-dir PATH]
librarian query TOPIC [--format {comet,raw,markdown}] [--k N] [--cathedral-dir PATH]
```

## Three-Command Walkthrough (tested end-to-end)

```bash
pip install librarian-mcp

# Bootstrap Cathedral
librarian init

# Ingest a markdown file
librarian ingest my-notes.md --scribe-name MyNotes
# → "2 tablets ingested, 47 auto-keywords extracted, Top 5 terms: ..."

# Query it
librarian query "what did I write about bridge design?" --format comet
# → "Context:\n[retrieved tablets]\n\nQuestion: what did I write about bridge design?"
# → Paste into Comet / ChatGPT / Claude.ai
```

Optional clipboard: `pip install "librarian-mcp[clipboard]"` — auto-copies on `--format comet`.

## Files Delivered

| File | Change |
|---|---|
| `src/librarian_mcp/cathedral.py` | NEW — 320 lines, stdlib-only Cathedral surface |
| `src/librarian_mcp/cli.py` | UPDATED — added `librarian_main()`, three subcommands |
| `tests/test_cli_subcommands.py` | NEW — 40 tests, all green |
| `pyproject.toml` | v0.3.0 → v0.4.0, added `librarian` script, `clipboard` extra |
| `README.md` | Added "Quick start (no MCP client required)" section |
| `CHANGELOG.md` | v0.4.0 entry |

## Test Results

```
78 passed in 3.08s  (38 existing + 40 new)
```

## Version Notes

- v0.4.0 tagged and ready for Founder's PyPI push (`twine upload`)
- NOT published to PyPI per K476 constraint
- Existing `librarian-mcp` MCP server entry point untouched (developer tier still works)
- Publication hold: still IN FORCE per K476 header

## Unlocks

K477 (Injection-Pathway Iterations) — the customer-journey benchmark is now technically possible since the customer journey itself (`librarian query --format comet`) is implemented.

---

*Knight K476. Sonnet 4.6. B122, 2026-04-24.*
