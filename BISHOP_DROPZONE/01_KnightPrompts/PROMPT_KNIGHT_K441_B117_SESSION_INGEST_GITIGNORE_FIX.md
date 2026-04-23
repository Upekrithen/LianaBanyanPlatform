---
knight_session: K441
bishop_session: B117
complexity_tier: COMPLEX
estimated_duration_hours: 2.5
recommended_model: opus-4.7
escalation_trigger: "If buildIndex.ts pipeline changes cascade into schema migrations or token-budget rewrites, stop and checkpoint with Bishop"
---
# Knight K441 — Session-Closeout Auto-Ingest + Librarian Gitignore Reproducibility Fix
## B117, April 23, 2026 — DISPATCH-READY

**Status:** Dispatch-ready. Dependencies: K429 merged (`e797320`) ✓, K436 merged (`6c47d9b`) ✓. Independent of K437.

**Prerequisite reads:** Follow BRIDLE Rules 1–7. Minimum: `PROMPT_KNIGHT_K429_B113_LIBRARIAN_REINDEX_AUTORECONCILE.md`, `MILESTONE_B116_CLOSEOUT.md`, `librarian-mcp/src/indexer/buildIndex.ts`, `librarian-mcp/index/overview.json`, `.gitignore`. Call `mcp__librarian__brief_me` first if available.

**Priority:** High. Two distinct latent risks landing in one Knight session because both touch `librarian-mcp/` hygiene.

**Estimated Knight session:** 2–3 hours.

---

## Why this Knight — two problems

### Problem 1 — Session pointer stuck at B113 despite K429 landing

K429 shipped SHA-256 fingerprint + incremental rebuild (`e797320`) and works correctly for *content* ingestion: after rebuild, `search_knowledge("MILESTONE_B116_CLOSEOUT")` finds the B116 closeout file. But `overview.json.lastSession` is still pinned at `B113`, and `get_session_context` returns B113 as the latest session. The session-pointer update is not wired into the rebuild pipeline — K429 Knight ingested B108–B113 one-shot during its build but did not add session-closeout ingestion as a pass inside `buildIndex.ts`.

Consequence: every Bishop/Knight session-start reads `lastSession: "B113"` even though we're now 3 milestones past that (B114, B115, B116 all closed with full closeout files in `BISHOP_DROPZONE/03_BishopHandoffs/`). The rebuild runs but the session index stays frozen.

### Problem 2 — `librarian-mcp/` reproducibility bomb

K436 Knight discovered during commit that `librarian-mcp/package.json`, `librarian-mcp/tsconfig.json`, `librarian-mcp/stitchpunks/scribes/registry.yaml`, and the SP-21/22/23 spec `.md` files are all **gitignored** by the root `.gitignore`:

- `.gitignore:214: *.json` — matches package.json + tsconfig.json globally
- `*.yaml` — matches registry.yaml
- `*.md` rule under librarian-mcp — matches spec files

K436 Knight force-added `registry.yaml` to keep the Cathedral runnable, but `package.json` and `tsconfig.json` are still untracked. A fresh clone of LianaBanyanPlatform cannot build librarian-mcp. If Founder's machine is lost, the internal librarian MCP server is **unreproducible** — Knight would have to reconstruct dependencies + TS config from scratch.

These are not files we want gitignored for privacy reasons. The root `.gitignore *.json` rule was likely written to avoid committing transient result JSONL/JSON files in `r10_cross_vendor/results/`. The pattern is too broad.

---

## Scope — two halves, dispatchable independently

### Half A — Session-closeout auto-ingest (durable fix for Problem 1)

1. Add a session-ingestion pass to `librarian-mcp/src/indexer/buildIndex.ts`. The pass reads `BISHOP_DROPZONE/03_BishopHandoffs/MILESTONE_B*_CLOSEOUT.md` (glob), extracts:
   - Session ID (from filename: `MILESTONE_B116_CLOSEOUT.md` → `B116`)
   - Date (from the top-of-file frontmatter or explicit date line; B116 closeout uses `**Session:** Bishop B116, 2026-04-22` — use that pattern)
   - Summary (first 300–500 chars after `## Headline` or top paragraph if no Headline)
   - Files changed list (extract from `## Artifacts shipped` section — file path patterns)
   - Pending work (from `## Founder actions pending` and `## Handoff to B117` sections)
2. Pick the session with the highest B-number as the `lastSession` value and write to `overview.json`.
3. For Knight sessions (K-sessions), add an analogous pass if Knight reports exist in a known folder; if not, document the gap so a future Knight can address.
4. Run `npm run rebuild` and verify:
   - `overview.json.lastSession` → `"B116"` (or whichever is highest on disk at run time)
   - `get_session_context` returns B116 summary
   - `get_session_context({session_id: "B115"})` returns B115 summary (not just the latest)
5. Preserve incremental-rebuild speed. Session files are small and only ~3–5 new per session; the pass should add well under 1s to rebuild time.

### Half B — Gitignore reproducibility fix (durable fix for Problem 2)

1. Edit `.gitignore` to add **explicit negations** for librarian-mcp critical files. Append a block:

   ```
   # librarian-mcp reproducibility — these MUST be tracked despite *.json / *.yaml / *.md ignore rules
   !librarian-mcp/package.json
   !librarian-mcp/package-lock.json
   !librarian-mcp/tsconfig.json
   !librarian-mcp/stitchpunks/scribes/registry.yaml
   !librarian-mcp/stitchpunks/SP*.md
   !librarian-mcp/stitchpunks/README.md
   !librarian-mcp/README.md
   !librarian-mcp/src/**/*.ts
   ```

   (Add the `src/**/*.ts` line only if `.gitignore` currently ignores TS files in librarian-mcp; verify first.)

2. `git add -f librarian-mcp/package.json librarian-mcp/package-lock.json librarian-mcp/tsconfig.json` — then confirm they're now tracked: `git ls-files librarian-mcp/ | grep -E "package\.json|tsconfig"` should return both files.
3. Audit for other critical-but-ignored files in `librarian-mcp/`. Run `git ls-files --others --ignored --exclude-standard librarian-mcp/ | head -50` and flag anything that looks runtime-critical (NOT `results/`, `dist/`, `node_modules/`, or `.env` variants — those should stay ignored).
4. **Do NOT commit** `DOUBLESECRET.env`, `SDS.env`, `LockBox.env`, or any file that could plausibly contain a secret. Run gitleaks via the pre-commit hook (it will fire automatically; if it fails, investigate rather than force-commit).
5. Document the policy in `librarian-mcp/README.md` (create if missing): a short paragraph stating "This directory's files are explicitly un-ignored in the root .gitignore; do not re-ignore them without updating both places."

### Optional polish — also flag but don't fix without Founder approval

- The `.gitignore *.json` rule at line 214 is the ROOT cause. A targeted fix for librarian-mcp closes this Knight's scope. The broader question "should `*.json` be globally ignored across the repo?" is a repo-wide audit question — **do not attempt in K441**. Flag it in the Knight report so Bishop can scope a follow-on if needed.

### Half D — MCP server index-reload on rebuild (added B117)

Observed B117: after `npm run rebuild` successfully wrote new content to `index/dropzones.json` and `index/overview.json` on disk, `search_knowledge` tool calls from a running MCP server continued to return stale results. The server caches its index in memory at startup and does not re-read disk on subsequent tool calls. Only a full Claude Code / Cursor restart picks up the new index — which is a bad default (every Bishop session that rebuilds the index then has to restart the agent to see the result).

Fix options (Knight's choice):

1. **Lazy re-read on query.** Each `search_knowledge` / `get_session_context` / `brief_me` tool call re-reads the relevant index JSON from disk. Tradeoff: slower per-call, but no stale data ever. If index JSONs are under 5MB each, this is probably fine.
2. **Fingerprint-based cache invalidation.** The MCP server stores the last seen `last_build_fingerprint.json` value in memory. On each tool call, it reads just that (small) file, compares, and triggers a full in-memory reload only if the fingerprint changed.
3. **Signal-based reload.** `npm run rebuild` writes a sentinel file or sends a SIGUSR1 equivalent that the server watches. Harder to get right cross-platform.

Recommend option 2 (fingerprint-cache-invalidation). Reuses the K429 primitive. Minimal per-query overhead. Never serves stale data after a rebuild.

**Acceptance for Half D:** after `npm run rebuild` completes, a subsequent `search_knowledge` tool call from any already-running MCP client returns the new content WITHOUT requiring a client restart.

---

## Acceptance criteria

**Half A:**
- [ ] `npm run rebuild` completes in ≤30s (incremental) / ≤90s (full) — no performance regression vs K429's 27.5s
- [ ] `overview.json.lastSession` reflects the highest B-number closeout file on disk
- [ ] `get_session_context()` (no args) returns the latest session
- [ ] `get_session_context({session_id: "B115"})` returns B115 summary (not the latest)
- [ ] Session index re-ingests on every rebuild, so adding MILESTONE_B117_CLOSEOUT.md later and rebuilding will advance `lastSession` without manual intervention

**Half B:**
- [ ] `git ls-files librarian-mcp/` includes `package.json`, `package-lock.json`, `tsconfig.json`, `stitchpunks/scribes/registry.yaml`, and SP spec markdown files
- [ ] A simulated fresh clone (`git clone` to `/tmp/fresh-clone-test`, then `cd librarian-mcp && npm install && npm run build`) succeeds without Bishop intervention — verify or note that Knight couldn't test due to lack of network/clone ability, in which case document the expected command sequence
- [ ] Gitleaks pre-commit hook passes (no secrets leaked via force-add)
- [ ] Root `.gitignore` has a clearly-labeled block showing what's un-ignored and why

---

## Non-goals

- **Do NOT rewrite the global `.gitignore *.json` rule.** Targeted negation only. Broader audit is out of scope.
- **Do NOT auto-ingest Bishop external memory** (`~/.claude/projects/.../memory/`) — K429 Non-goal still applies.
- **Do NOT touch `librarian-mcp-public/`** — that's the Python public repo, shipped separately.
- **Do NOT change anything in `librarian-mcp/src/scribes/`** — that's K436's territory; stable at `6c47d9b`.
- **Do NOT attempt to fix the `results/` gitignore pattern** in K441 — that's working correctly; keep results/ ignored.

---

## Dependencies + sequencing

- **K429 merged** ✓ (`e797320`)
- **K436 merged** ✓ (`6c47d9b`)
- **K441 vs K437:** independent. K437 is a long-running Python test; K441 is TypeScript + gitignore. Can run parallel if Founder has two Cursor windows.
- **K441 before any future fresh-clone scenario.** If Founder is planning to onboard a second dev machine or hand off to another engineer, K441 must land first.

---

## Reporting requirements (BRIDLE Rule 7)

1. Pre-Half-A state: `overview.json.lastSession` value, representative `get_session_context` result
2. Post-Half-A state: same queries returning current B-session, wall-clock impact on rebuild
3. Pre-Half-B state: `git ls-files librarian-mcp/ | wc -l` count
4. Post-Half-B state: same count (should increase by at least 3; more if spec files also un-ignored)
5. List of any files flagged as critical-but-ignored that Knight did NOT un-ignore (for Bishop disposition)
6. Commit SHA(s) of both halves (can be one commit or two; Knight's call)
7. Any gitleaks / hook failures and how they were resolved

---

*Drafted B117, April 23, 2026. Bishop (Claude Opus 4.7, 1M context). Follow-on to K429 session-pointer gap observed after K436 commit. Surfaced two latent risks in one Knight to minimize Founder dispatch overhead.*
