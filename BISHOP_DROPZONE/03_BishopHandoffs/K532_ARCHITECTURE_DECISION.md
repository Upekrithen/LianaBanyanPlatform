# K532 — Architecture Decision: Pawn-via-Librarian Dispatch Channel

**Decision Filed**: B130A, 2026-04-27
**Filed by**: Knight (K532) on Bishop recommendation (B130A)
**Status**: DECIDED — Architecture A selected
**Founder Ratification**: Required before Phase B implementation; K532 proceeds under Founder direction "I still want the pawn validation, just after we hard-wire it" (B130A)

---

## Decision Summary

**Architecture A (MCP-tool-direct-Perplexity-API) is selected as primary.** Architecture B (Comet Bridge sibling extension) documented as optional fallback. Architecture C (hybrid) deferred pending empirical cost evidence from Phase E live dispatches.

---

## Options Evaluated

| # | Architecture | Pros | Cons | Selected? |
|---|---|---|---|---|
| **A** | **MCP tool wiring** — `dispatch_pawn` + `check_pawn_dispatch` + `cancel_pawn_dispatch` + `list_pending_pawn_dispatches` MCP tools that hit Perplexity API directly with prompt content; bypasses browser entirely | Cleanest; audited by default; no browser dependency; deterministic; ledgerable per-call; async-friendly (dispatch returns dispatch_id; poll for result); integrates with existing `registerTool()` pattern in server.ts; PERPLEXITY_API_KEY already in vault (K499 empirical proof that it works) | Per-call API cost (~$0.04–0.24/dispatch per K528 perplexity_spaces empirical); requires PERPLEXITY_API_KEY + cost-cap discipline | ✅ **PRIMARY — SELECTED** |
| **B** | **Comet Bridge sibling extension** — new `lb-pawn-bridge-extension/` that auto-injects prompt into Pawn's chat at perplexity.ai, polls for response, writes return | Leverages K530 substrate; no API cost; uses Founder's existing Perplexity browser session | Requires Founder's Comet/Perplexity browser open + extension running; flakier (DOM scraping for response; brittle to Perplexity UI changes); browser-bound; harder to audit; ERR_FILE_NOT_FOUND class failure still possible if paths not resolved | ⬜ **FALLBACK — documented but not implemented in K532** |
| **C** | **Hybrid** — A as primary; B as fallback when API quota exhausted or cost ceiling hit | Resilient to API quota; preserves option-value | Doubled implementation; harder to test; harder to maintain; premature before empirical cost data from 5-10 real dispatches | ⬜ **DEFERRED — revisit after Phase E telemetry** |

---

## Rationale for Architecture A

1. **K499 proof-of-API**: PERPLEXITY_API_KEY is confirmed present in vault (length 53), and R13 empirically called sonar-pro via the OpenAI-compatible API endpoint successfully (K499 Phase A API verification, 8/8 models pass). The API path is not theoretical.

2. **K528 cost anchor**: Perplexity sonar-pro empirical cost at 94.6% HOT rate was $0.239 per HOT answer in the benchmark run (100-200 question scale). A single Pawn research dispatch (Keirsey validation, ~25 recipients) is a bounded task — estimated $0.07–0.25 per dispatch at 4,000-token response cap. Well within the $1.00 per-dispatch hard ceiling.

3. **ERR_FILE_NOT_FOUND class failure closed**: The architecture A tool inlines prompt content directly; no local file paths are ever transmitted to Perplexity's browser-sandboxed environment. The file-path failure mode that prompted this K-session is architecturally eliminated.

4. **Audit discipline**: Every dispatch creates: (a) `dispatches/pawn/<dispatch_id>.dispatch.json`, (b) `dispatches/pawn/<dispatch_id>.return.json`, (c) ledger entry in `dispatch_ledger.jsonl`, (d) telemetry entry in `telemetry/pawn_dispatch_costs.jsonl`. Total auditability per K525 publication-gate + K528 hook-discipline patterns.

5. **K525 cost-cap + circuit-breaker pattern reused**: Per-dispatch cap $1.00, daily cap $10.00, configurable in `config/pawn_dispatch_caps.json`. Same mechanical-publication-gate pattern as K525 (`PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=false` ships as default; Founder flips to `true` after Phase E validation).

6. **Three-Class Substrate Sovereignty honored**: Pawn dispatches are Bishop-side internal research. They live entirely in Cathedral substrate's audit/ledger. Never published, never cited externally, never attributed to letter recipients (per the Pawn prompt's discretion clause, consistent with A&A #2315).

---

## Architecture B — Fallback Path (not implemented in K532)

Architecture B remains viable if:
- API cost proves unacceptable after first 5–10 dispatches (telemetry in `pawn_dispatch_costs.jsonl` provides the evidence)
- API quota limits Founder's dispatch cadence (Architecture B uses existing Perplexity Pro browser session, no API credit consumed)

Implementation path (K533-class, if triggered): new `lb-pawn-bridge-extension/` sibling to `lb-omnibox-extension/`. Would reuse K530 `content.js` injection pattern, adapt for perplexity.ai chat interface, poll for response completion via DOM observation, write result to a shared file path that the MCP server can read. Higher implementation complexity; lower per-dispatch cost.

---

## Architecture C — Hybrid (deferred)

Revisit after 20+ real dispatches provide empirical cost telemetry. If daily cost cap ($10.00) is routinely approached, a hybrid where API handles small research prompts and Comet Bridge handles large-corpus dispatches may be warranted. Not warranted at K532 scope.

---

## Implementation Scope (Phase B)

Per selection of Architecture A:

- **New file**: `librarian-mcp/src/pawn_dispatch.ts` — dispatch business logic
- **New config**: `librarian-mcp/config/pawn_dispatch_caps.json` — feature flag + cost caps
- **New directories**: `librarian-mcp/dispatches/pawn/`, `librarian-mcp/telemetry/`
- **New tools in server.ts**: `dispatch_pawn`, `check_pawn_dispatch`, `cancel_pawn_dispatch`, `list_pending_pawn_dispatches`
- **New script**: `librarian-mcp/scripts/verify-pawn-dispatch.mjs`
- **.gitignore exception**: `!librarian-mcp/config/pawn_dispatch_caps.json`

---

## Cost Authorization

Per K528 economics ($0.04–0.24/dispatch) and the Keirsey validation prompt scope (~25 recipients, structured research task):
- Projected cost for integration-test dispatch: **~$0.07–0.15**
- Projected cost for full Keirsey research dispatch: **~$0.15–0.40**
- Both well within $1.00 per-dispatch hard ceiling

**Founder authorization**: implied by Founder direction "I still want the pawn validation, just after we hard-wire it" (B130A). Explicit `founder_authorized: true` flag required in `dispatch_metadata` when calling the tool for production dispatches.

---

*Decision artifact filed K532/B130A. Architecture A selected. Build proceeds under publication gate (`PAWN_VIA_LIBRARIAN_DISPATCH_ENABLED=false`). Founder flips gate to `true` only after Phase E validation + ledger discipline confirmed.*
