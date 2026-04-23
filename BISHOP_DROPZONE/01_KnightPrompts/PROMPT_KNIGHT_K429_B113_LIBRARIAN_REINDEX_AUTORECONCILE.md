# Knight K429 — Internal Librarian Reindex + Auto-Reconcile Mechanism
## B113, April 21, 2026 — STUB (pending Founder ratification + K425 sequencing decision)

**Status:** Stub. Dispatch after Founder confirms sequencing vs K425 (secrets canonicalization + SP-20 Pollinator). K429 is not blocked by K425; either can run first.

**Prerequisite:** K424 complete ✓ (preload staged in `librarian-mcp-public/` won't be affected by this Knight — K429 operates on `librarian-mcp/` internal TypeScript tool).

**Priority:** High. Recurring gap: internal librarian index has drifted enough that `search_knowledge` returned zero results for "Canada 40K letter," "Play Stage," "Mirror Mirror," and the B108–B113 session run did not surface in `brief_me`. We shell-grepped to find content that should have been indexed. Every session that hits this gap loses time we shouldn't lose again.

**Estimated Knight session:** 4–6 hours.

---

## Why this Knight

The internal TypeScript librarian (`LianaBanyanPlatform/librarian-mcp/`) is the 37-tool suite Bishop uses daily via MCP. Its corpus index drives `brief_me`, `search_knowledge`, `query_domain`, `get_session_context`, and others. The index drifts when:

1. New files are added to `BISHOP_DROPZONE/` without running `npm run rebuild`.
2. Bishop external memory (`~/.claude/projects/.../memory/`) changes but isn't pulled into the librarian's corpus (by design — memory is per-session; but some items should be).
3. Canonical numbers change (e.g., the B112 R10 lock moved HOT accuracy from 94.3% to 94.8% and mean lift from 82.4pp to 86.1pp) without `canonical_values.yaml` being updated in sync.
4. New content surfaces (09_Articles/, 10_MediaPitches/, 14_CanonicalReferences/) aren't in the indexer's scan paths.

B113 observed all four failure modes in a single session. The fix is not "rebuild once" — it's "make rebuild automatic and scoped correctly."

---

## Scope — three halves, dispatchable independently

### Half A — Full reindex NOW (one-shot)

1. Run `npm run rebuild` inside `librarian-mcp/` — compiles TS via `tsc`, then runs `dist/indexer/buildIndex.js`.
2. Verify the indexer's scan paths include: `BISHOP_DROPZONE/09_Articles/`, `BISHOP_DROPZONE/10_MediaPitches/`, `BISHOP_DROPZONE/14_CanonicalReferences/`, `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` (with recursion). If any of these are excluded, add them.
3. Update `librarian-mcp/canonical_values.yaml` to reflect B112 locked numbers: HOT 94.8%, COLD 8.7%, mean lift 86.1pp, 8-model × 4-vendor × 1,200 calls, κ 0.883/0.850. Replace old B111 values (94.3/11.9/82.4pp).
4. Verify post-rebuild: `search_knowledge("Canada 40K")` returns the Rescue Fleet article + the Play/Stage V02 + companion. `search_knowledge("Mirror Mirror")` returns K373. `search_knowledge("Play Stage")` returns PITCH_NYT_TECH + Canada 40K V02. If any of these still miss, the indexer has a scope or tokenization bug.
5. Ingest the B108–B113 session closeouts (or a representative subset) so `get_session_context` returns correct last-session state instead of falling back to B101 or earlier.

### Half B — Auto-reconcile on session-start (durable fix)

This is what the session-boundary feedback already called for (see `feedback_touchstone_must_reconcile.md` — same principle applied to content index, not just deliverable manifest).

1. At every Bishop/Knight session-start hook (`run_session_start`), check: *does the dropzone content fingerprint match what the index saw last build?*
2. **Fingerprint mechanism:** hash the tree `BISHOP_DROPZONE/` (or specific subfolders) at last-build time, store in `librarian-mcp/index/last_build_fingerprint.json`. On session-start, recompute fingerprint. If mismatch, trigger rebuild automatically OR warn the agent loudly (depending on how fast the rebuild is — if <60s, auto-run; else warn).
3. The session-start hook already returns a briefing to the agent. Add a line: `Librarian index last rebuilt: <timestamp>. Dropzone fingerprint: <match / drift>.` Agents read this and know whether to trust their search results.

### Half C — Scoped ingest, not full sweep (performance fix)

1. Full tree-walk rebuild is O(files) and slow at the platform's growth rate. Replace with incremental-index: on session-start, diff `BISHOP_DROPZONE/` file-mtimes against last-build mtime, reindex only changed files.
2. Provide manual `npm run rebuild:full` as an escape hatch when the incremental index corrupts.
3. Preserve the current `npm run rebuild` alias to whichever mode is the default (incremental after Half C lands).

---

## Acceptance criteria

- [ ] After Half A: `search_knowledge("Canada 40K")`, `search_knowledge("Play Stage")`, `search_knowledge("Mirror Mirror")`, `search_knowledge("Bridle")`, `search_knowledge("librarian preload")` all return relevant hits
- [ ] `canonical_values.yaml` shows 86.1pp / 94.8 HOT / 8.7 COLD / 8-model × 4-vendor × 1,200 calls / κ 0.883/0.850
- [ ] `get_system_overview()` returns B113 as last session (or later), not B101
- [ ] After Half B: session-start hook reports index staleness status to every new agent
- [ ] After Half C: incremental rebuild completes in <30s for typical daily-churn dropzone

---

## Non-goals

- **Do NOT touch `librarian-mcp-public/`.** That's the Python public repo. K424 already shipped its index (baked-at-build-time preload). K429 is strictly about the internal TypeScript librarian.
- **Do NOT auto-ingest Bishop external memory** (`~/.claude/projects/.../memory/`). That's session-scoped context; merging it into the shared index would leak agent-specific state. Memory gets pulled into the public librarian *manually* via `librarian-mcp-public/preload/founder_voice/*.md` curation, not automatically.
- **Do NOT auto-pollinate secrets.** Secrets canonicalization is K425 Workstream A. Keep index and secrets separate; the index should index *public* content only.

---

## Dependencies + sequencing

- **K424 complete** ✓ (preload in public repo shipped; internal librarian unchanged)
- **K429 vs K425:** independent. Can run either order. Recommend K429 first because the secrets audit (K425-A) is easier to do cleanly when the librarian can actually search for all the places secrets currently live.

---

## Reporting requirements

1. Pre-rebuild state: last build timestamp, last-indexed session ID, representative "missing" search query that fails
2. Post-rebuild state: same queries now returning hits, last-indexed session ID is current
3. Incremental vs full rebuild wall-clock comparison
4. Any files that failed to index (encoding, size, permissions) — surface for Bishop review
5. Commit SHA of the indexer changes + any `scripts/` additions

---

*Stub drafted B113, April 21, 2026. Bishop (Claude Opus 4.7, 1M context). Dispatch after Founder sequencing call vs K425.*
