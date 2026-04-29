# K-Wrasse-Registry-Live-Update — Architecture Decision D.1

**Session:** K-Wrasse-Registry-Live-Update / B133 (K550)
**Decision type:** Registry-update fire-point
**Filed:** 2026-04-29
**Founder pre-ratified:** D.1 = α

---

## D.1 — Registry-update fire-point (RATIFIED α — direct write from Detective)

**Option α (RATIFIED):** Direct write from Detective Scribe — when `detective_investigate` resolves a trigger not in registry, call `appendIfNew` synchronously. Tightest coupling; Detective resolution is synchronous so Wrasse benefits immediately.

**Rationale:**

α provides the tightest correctness guarantee: every successful Detective resolution adds to the registry in the same call path, with no async delay, no queuing, and no missed sessions. The resolution is available for Wrasse pre-injection starting with the *next* session.

β (indirect via Pheromone Substrate inbound channel) would add latency between Detective resolution and Wrasse availability — the registry stays stale within the Pheromone propagation window.

γ (batch via Bishop session-end hook) is simpler but leaves the registry stale for the entire session duration, meaning subsequent K-sessions within the same Bishop session still miss the newly-resolved triggers.

## Implementation summary

**Files created/modified:**
- `librarian-mcp/stitchpunks/wrasse/wrasse_registry_writer.py` — Python implementation (backfill, tests, standalone CLI)
- `librarian-mcp/src/wrasse_auto_register.ts` — TypeScript implementation (server.ts inline integration)
- `librarian-mcp/config/wrasse.json` — Config flag `WRASSE_AUTO_REGISTER_ENABLED` (default: true)
- `librarian-mcp/src/server.ts` — detective_investigate handler extended with `autoRegisterFromDetective()` call on successful resolution
- `librarian-mcp/stitchpunks/wrasse/backfill_post_K540.py` — One-shot backfill for post-K540 commits
- `librarian-mcp/stitchpunks/wrasse/tests/test_registry_writer.py` — Unit tests (append_if_new / bump / concurrency / lock-failure)

**Stone Tablet Imperative:** All writes are append-only via line-buffered open + fsync. Existing entries are never modified; verification bumps go through supersedes-record append.

**Brick Wall:** `WRASSE_AUTO_REGISTER_ENABLED: false` in `config/wrasse.json` disables live-update without code changes. Lock acquisition failure logs and skips; never blocks Detective's primary work.

*Filed by Knight (K-Wrasse-Registry-Live-Update), B133, 2026-04-29*
