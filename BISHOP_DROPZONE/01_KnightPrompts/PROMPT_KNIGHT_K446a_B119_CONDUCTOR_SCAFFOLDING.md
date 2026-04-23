---
knight_session: K446a
bishop_session: B119
bridle_version: 10
status: READY TO DISPATCH after K444 completion
predecessor_gate: K451 baseline (v-migration-baseline-K451, eec98a7) ✓
sibling_session: K446b will hydrate ranking data after K444 R11 lands + Founder ratification
target_tag: v-conductor-scaffold-K446a
task_class: Conductor's Baton architecture scaffolding (routing infra + Cathedral integration, no R11 data)
estimated_model: Sonnet 4.6 (architecture density, no heavy reasoning in this phase)
scope_size: medium (single-session, 3-4 hours)
---

**THE BRIDLE — read this before you respond. Follow all ten rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.
10. **MCP tooling discipline.** Always use `npm run build-guarded` (not raw `npm run build`) when modifying `librarian-mcp/src/`. Always use `npm start` (not raw `node dist/server.js`) to run the MCP server. The guard emits structured `server_rebuilding` errors during build windows; the supervisor auto-restarts on silent crash. Bypassing either returns us to the pre-K448 / pre-K449 silent-hang regime.

**End of BRIDLE. Task follows.**

---

## Context

The Conductor's Baton (Innovation #2277) is a vendor-neutral adaptive model router. Full A&A at `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2277_THE_CONDUCTOR_VENDOR_NEUTRAL_ADAPTIVE_ROUTER_B117.md`. Read it completely before writing a line of code.

K446 is split into two Knight sessions:
- **K446a (this prompt):** architecture scaffolding — classifier, adapters, router, Cathedral integration, toggle mode. Uses a *stub ranking table* so everything wires end-to-end without R11 data.
- **K446b (future):** ranking ingestion (reads R11 output), three-mode UX polish, continuous online benchmarking. Dispatched after K444 R11 lands + Founder ratifies.

**Why this split:** K446a's architecture is independent of empirical ranking data. Building it now (while K444 runs in parallel) lets K446b be a small, focused data-hydration + UX session when R11 lands. Reduces critical path.

**Metaphor layers (both canonical):**
- Orchestra — Conductor cues sections (strings, brass, tympani); instruments = models; Cathedral = sheet music
- Automatic transmission — Conductor = transmission; member = driver; modes = automatic/manual/fixed-gear

Use **orchestra** for variable names, test fixtures, internal docs. Use **automatic-transmission** for end-user-facing strings, logs intended for members, copy.

---

## Scope (Phase 1-2 only — K446b picks up Phase 3+)

### Phase 1.1 — Query classifier

Build `platform/src/lib/conductor/classifier.ts`:

```ts
export type QueryClass =
  | "retrieval_only"
  | "reasoning_required"
  | "creative"
  | "code_generation"
  | "multi_step_planning"
  | "uncertain";

export interface ClassifiedQuery {
  query: string;
  class: QueryClass;
  confidence: number;  // 0..1
  signals: string[];   // which heuristics fired
}

export function classifyQuery(query: string): ClassifiedQuery;
```

**Implementation choice — pick defensibly:**
- **Option A (default):** deterministic heuristics — regex + keyword rules for each class. Cheap, deterministic, no API call.
- **Option B:** call a small-cheap model (Haiku 4.5 or Gemini 2.5 Flash) to classify. Adds latency + cost per query.

Unless you see a strong reason otherwise, pick Option A for K446a. Add a `// TODO(K446b):` comment noting that model-based classification is a future upgrade.

Heuristic starting points (refine as needed):
- `code_generation`: query mentions "write code", "function", named languages ("Python", "TypeScript"), code fence markers
- `retrieval_only`: short queries, question words ("what is", "when", "who"), no verb indicating synthesis
- `creative`: "write a", "brainstorm", "come up with", "imagine"
- `multi_step_planning`: "plan", "strategy", "step by step", "first X then Y"
- `reasoning_required`: default when none of the above fire cleanly and length > threshold
- `uncertain`: no heuristic confident above 0.4 — router falls back

Test with 50 reference queries (mix of clear + borderline). Tests at `platform/src/lib/conductor/__tests__/classifier.test.ts`.

### Phase 1.2 — Vendor adapters

Build `platform/src/lib/conductor/adapters/` with four files:

```ts
// adapters/types.ts
export interface ModelCallResult {
  response: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;  // computed from vendor's published pricing
  vendor: "anthropic" | "openai" | "google" | "perplexity";
  model: string;    // exact model id
}

export interface ModelCallOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  timeoutMs?: number;  // default 60000
}

export type VendorAdapter = (
  modelId: string,
  prompt: string,
  options?: ModelCallOptions
) => Promise<ModelCallResult>;
```

Four adapters:
- `adapters/anthropic.ts` — uses `@anthropic-ai/sdk`, reads `ANTHROPIC_API_KEY` from env
- `adapters/openai.ts` — uses `openai` package
- `adapters/google.ts` — uses `@google/genai` package
- `adapters/perplexity.ts` — uses `openai`-compat Sonar endpoint at `https://api.perplexity.ai`

**API keys source:** Supabase edge-function secrets are the single source of truth for keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `PERPLEXITY_API_KEY` — all present per B119 secrets-list audit). For local dev, keys come from `.env` as usual. Never hardcode.

**Cost computation:** include per-vendor/per-model pricing table in `adapters/pricing.ts`. Initial entries — Haiku 4.5, Sonnet 4.6, Opus 4.7, GPT-4o-mini, Gemini 2.5 Flash, Sonar Pro. Document source (`// Pricing as of 2026-04-23 from <vendor>.com/pricing`) and note that prices may shift.

Tests: one end-to-end real call per adapter (skippable in CI, marked `@integration`), plus unit tests for cost computation.

### Phase 1.3 — Routing decision layer

Build `platform/src/lib/conductor/router.ts`:

```ts
export type ConductorMode = "auto" | "manual" | "vendor-lock";

export interface RouterInputs {
  classified: ClassifiedQuery;
  mode: ConductorMode;
  memberOverride?: {
    vendor?: "anthropic" | "openai" | "google" | "perplexity";
    model?: string;
  };
}

export interface RoutingDecision {
  vendor: "anthropic" | "openai" | "google" | "perplexity";
  model: string;
  rationale: string;
  fallbackUsed: boolean;
  rankingAgeDays: number | null;  // null if no ranking data yet
}

export function route(inputs: RouterInputs): RoutingDecision;
```

**Ranking data injection:** the router reads from `getRankingForClass(queryClass) → ModelVendorPair[]` exported by `platform/src/lib/conductor/rankings.ts`. **In K446a, that file is a STUB** — returns an empty array OR a hand-coded conservative default (Sonnet 4.6 for everything) marked as `source: "stub", rankingAgeDays: null`. K446b replaces the stub with real R11 data.

**Fallback rules (K446a-baked):**
- `mode === "vendor-lock"` + `memberOverride.vendor`: lock to that vendor, pick default model for that vendor, `fallbackUsed: false`
- `mode === "manual"` + `memberOverride` present: honor the override, `fallbackUsed: false`
- `mode === "auto"` + ranking available: pick top-ranked, `fallbackUsed: false`
- `mode === "auto"` + stub / no ranking: use Sonnet 4.6 as conservative default, `fallbackUsed: true, rationale: "No ranking data available; defaulting to conservative middle option."`
- `classified.class === "uncertain"`: same fallback path as "no ranking available"

Tests: 12 scenarios covering all mode × ranking-state combos.

### Phase 1.4 — Toggle mode UI hook

Build `platform/src/hooks/useConductorMode.ts`:

```ts
export function useConductorMode(): {
  mode: ConductorMode;
  setMode: (m: ConductorMode) => void;
  override: MemberOverride | null;
  setOverride: (o: MemberOverride | null) => void;
  clearOverride: () => void;
};
```

Persist `mode` to the member preferences table (add a column `conductor_mode TEXT DEFAULT 'auto'` via a new migration `20260423XXXXXX_k446a_conductor_mode_column.sql`). Default = `"auto"`. `override` is per-query-session state, not persisted.

No UI component is built in K446a — just the hook. Surface in member preferences is K446b.

### Phase 2.1 — MCP tool `conductor_route`

Add to `librarian-mcp/src/server.ts` a new MCP tool via the existing `registerTool` wrapper:

```
name: conductor_route
description: Classify a query and return the routing decision (vendor, model, rationale). Does not execute the query.
inputs: { query: string, mode?: "auto"|"manual"|"vendor-lock", override?: {vendor?, model?} }
outputs: { classified: {...}, decision: {...} }
```

This tool EXPOSES the router logic for Bishop/Knight workflows + the Member Companion (K445). The tool does NOT execute the model call — that's a separate future tool (`conductor_execute`). K446a ships the routing decision only.

Build-guarded per BRIDLE Rule 10. Test locally with `npm start` before pushing.

### Phase 2.2 — Scribe Cathedral routing trace

Every routing decision produced by the MCP tool above appends an entry to a Scribe for routing history. Scribe name: `scribe_Conductor` (new). Path: `librarian-mcp/stitchpunks/scribes/scribe_Conductor.jsonl`.

Each entry:
```json
{
  "ts": "2026-04-23T17:00:00Z",
  "query_hash": "sha256:...",
  "classified_as": "retrieval_only",
  "confidence": 0.87,
  "mode": "auto",
  "vendor": "anthropic",
  "model": "claude-haiku-4-5-20251001",
  "fallback_used": true,
  "ranking_age_days": null,
  "rationale": "No ranking data available; defaulting to conservative middle option."
}
```

Register the new Scribe in `librarian-mcp/stitchpunks/scribes/registry.yaml` with a description matching the Three Fates categorization taxonomy. Route to `Architecture` + `Decisions` categories by default.

**Do NOT log raw queries.** Only the SHA-256 hash, to avoid member-query leakage into the Scribe Cathedral.

### Phase 2.3 — Touchstone predicate

Add to `librarian-mcp/touchstone/predicates/`:

```python
# conductor_routing_within.py
def conductor_routing_within(max_latency_ms: int, ledger_entry: dict) -> tuple[bool, str]:
    """
    Asserts that the last conductor_route call completed within max_latency_ms.
    Reads from scribe_Conductor.jsonl last entry.
    """
```

Tests: 3 cases — within budget, at budget edge, over budget. Pytest harness per K442 pattern.

---

## Phase 3 — STUB the hydration hook for K446b

Create `platform/src/lib/conductor/rankings.ts` as a stub that returns no data and logs a `// TODO(K446b): replace with R11 data ingestion from librarian-mcp/r10_cross_vendor/results/r11_*` comment. Export the function signature so K446b just swaps the body. Don't build ingestion logic in K446a — that's K446b's job.

---

## Deliverables checklist

| # | Deliverable | Gate |
|---|---|---|
| 1 | `classifier.ts` + 50-query test suite green | Phase 1.1 |
| 2 | 4 vendor adapters + pricing table + integration tests (skippable in CI) | Phase 1.2 |
| 3 | `router.ts` + 12-scenario test suite green | Phase 1.3 |
| 4 | `useConductorMode.ts` + migration for `conductor_mode` column + RLS policy | Phase 1.4 |
| 5 | `conductor_route` MCP tool registered via `registerTool` | Phase 2.1 |
| 6 | `scribe_Conductor.jsonl` + registry.yaml entry + hash-only logging | Phase 2.2 |
| 7 | `conductor_routing_within` Touchstone predicate + 3 pytest cases | Phase 2.3 |
| 8 | `rankings.ts` stub with K446b handoff comment | Phase 3 |
| 9 | Commit + tag `v-conductor-scaffold-K446a` on green | close |
| 10 | Handoff report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K446a_B119_CONDUCTOR_SCAFFOLDING.md` | close |

---

## Non-goals (do not do)

- Do NOT ingest R11 ranking data. That is K446b. The rankings.ts file must remain a stub.
- Do NOT build the three-mode UI (Helm settings selector). That is K446b.
- Do NOT build continuous online benchmarking (Phase 5 of the skeleton). That is K446b or later.
- Do NOT build `conductor_execute` (the model-invocation tool). Only `conductor_route` (decision-only) in K446a.
- Do NOT log raw member queries to the Scribe. SHA-256 hash only, always. Privacy-safe-by-default.
- Do NOT modify pgTAP tests from K447/K451. Add new tests in new files if needed.
- Do NOT invent new query-hint syntax for member overrides — K446a's `memberOverride` is a structured object passed to the hook, not a string. UI surface for it is K446b.

---

## BRIDLE compliance (for your handoff report)

| Rule | How to demonstrate |
|---|---|
| Rule 2 | Classifier confidence numbers are empirical (from your 50-query test), not guessed |
| Rule 5 | Pricing table cites source + date. Model IDs are exact (match vendor docs, not approximations). |
| Rule 6 | Zero R11-ingestion code. Zero UI polish. Zero benchmarking. Strictly Phase 1-2. |
| Rule 10 | `build-guarded` used for all librarian-mcp/src/ edits. `npm start` used to test MCP locally. |

---

## Clarifying-question budget

One permitted. Use on either:
- The classifier heuristic threshold (if 0.4 uncertainty threshold seems wrong for a specific test class); OR
- Pricing source ambiguity (if vendor pricing page moved and you can't find canonical data)

If neither is blocking, pick defensibly and proceed.

---

*Knight K446a authored by Bishop B119, 2026-04-23. Carve-out of K446 skeleton Phase 1-2. K446b follows after K444 lands. FOR THE KEEP.*
