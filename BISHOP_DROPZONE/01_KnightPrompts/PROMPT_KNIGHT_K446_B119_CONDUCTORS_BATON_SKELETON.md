---
knight_session: K446
bishop_session: B119
bridle_version: 10
status: SKELETON — hydrate with R11 ranking data after K444 lands
predecessor_gates:
  - K451 baseline cutover (v-migration-baseline-K451, eec98a7) ✓
  - K438b Cathedral MCP substrate (v-member-cathedral-K438a + K438b landings) ✓
  - K444 R11 cross-vendor memory benchmark — REQUIRED, not yet run
dispatch_gate: DO NOT DISPATCH until K444 R11 data has landed AND Founder ratifies R11 results
target_tag: v-conductors-baton-K446
task_class: core routing infrastructure + Cathedral integration
estimated_model: Opus 4.7 (architectural density); Sonnet 4.6 acceptable for Phase 1-2 only
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

## Context (read in full before starting)

**Innovation #2277** — The Conductor's Baton (Vendor-Neutral Adaptive Model Router). Full A&A at `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2277_THE_CONDUCTOR_VENDOR_NEUTRAL_ADAPTIVE_ROUTER_B117.md`. Read it completely before writing a line of code.

The Conductor routes member queries across Anthropic / OpenAI / Google / Perplexity based on empirical performance for each query class, with three toggle modes: **auto-route** (default, automatic transmission), **manual** (member picks per query), **vendor-lock** (single-vendor audit/regulatory use case).

**Metaphor layers (both canonical):**
- Orchestra — Conductor, instruments (models), sheet music (Cathedral #2270), member = audience + first chair
- Automatic transmission — Conductor = transmission, member = driver, modes = automatic/manual/fixed-gear

Use **orchestra** in technical documentation, tests, variable names. Use **automatic transmission** in user-facing strings, logs intended for end-users, and marketing-adjacent surfaces.

**Dependency on K444 R11 (hard):** The Conductor's routing table is *empirically* derived from the R11 cross-vendor memory benchmark. Until K444 lands + Founder ratifies the R11 ranking report, there is no ranking data to route against. **This prompt will be hydrated post-K444** with the specific model-vendor rankings per query class. Do not guess rankings. Do not hardcode. Treat ranking data as an injected dependency.

---

## Scope

### Phase 1 — Architecture scaffolding (safe to start; no K444 dependency)

**1.1 Query classifier.** Build `platform/src/lib/conductor/classifier.ts` that takes a member query string and returns one of:
- `retrieval_only` — pure factual lookup, answer is in context window
- `reasoning_required` — multi-step inference, may or may not need context
- `creative` — generation task (writing, brainstorming, naming)
- `code_generation` — code, structured DSL output
- `multi_step_planning` — agentic, requires plan-decompose-execute
- `uncertain` — classifier confidence below threshold; triggers routing fallback

Classifier MAY call a small-cheap model (Haiku 4.5 / Gemini Flash) to perform classification, OR use deterministic heuristics for Phase 1. Pick defensibly; leave an internal comment about the choice.

**1.2 Vendor adapter interface.** Build `platform/src/lib/conductor/adapters/` with:
- `anthropic.ts` — wraps `@anthropic-ai/sdk`
- `openai.ts` — wraps `openai`
- `google.ts` — wraps `@google/genai` or equivalent
- `perplexity.ts` — wraps `openai`-compat Sonar endpoint

Each adapter exports a common `callModel(modelId, prompt, options) → { response, latencyMs, tokensIn, tokensOut, costUsd }` interface. Use the service-role keys from Supabase edge-function secrets (already present: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `PERPLEXITY_API_KEY`).

**1.3 Routing decision layer.** Build `platform/src/lib/conductor/router.ts`:
- `route(classifiedQuery, mode, memberOverrides?) → ModelVendorPair`
- Reads the current ranking table (injected — see Phase 3)
- Applies member-level override if `mode === "manual"`
- Locks to `memberOverrides.vendor` if `mode === "vendor-lock"`
- Falls back to a conservative default (Sonnet 4.6) if ranking data is stale (> N days old) or if classifier returned `uncertain`

**1.4 Toggle mode UI hook.** Build `platform/src/hooks/useConductorMode.ts` returning `{ mode, setMode, override, setOverride }`. Mode persists to member preferences table. Default `auto-route`.

### Phase 2 — Cathedral integration

The Conductor is an *integral part of the Cathedral* (Founder requirement B117). That means:

**2.1 MCP tool: `conductor_route`.** Add to `librarian-mcp/src/server.ts`: accepts a query + mode, returns the selected vendor/model + rationale. Exposes the router to Bishop/Knight workflows and to the Member Companion (K445).

**2.2 Scribe Cathedral routing trace.** Every routing decision appends a Fates-routing-style entry to the Cathedral so the router's own choices become queryable history. Schema: `{ query_hash, classified_as, mode, chosen_vendor, chosen_model, fallback_used, ranking_age_days, ts }`. Use the existing Three Fates routing plumbing — do not build a parallel log.

**2.3 Touchstone predicate.** Add a verification predicate `conductor_routing_within(max_latency_ms)` to Touchstone. Lets tests assert that routing decisions complete under a performance budget.

### Phase 3 — Ranking table ingestion (POST-K444)

**DO NOT START until K444 R11 has landed AND Founder has ratified the R11 report.** Bishop will hydrate this section of the prompt with:
- Exact model rankings per query class (R11 table data)
- Cost-per-correct thresholds per class
- Freshness SLA (how many days before ranking is considered stale)
- Re-benchmark cadence (continuous online benchmark — every Nth query parallelizes)

Phase 3 builds `platform/src/lib/conductor/rankings.ts` that reads R11 output and serves `getRankingForClass(queryClass) → ModelVendorPair[]` ordered by empirical quality. Parallel-benchmark sampling (every Nth query) feeds back into the ranking table via Scribe log.

### Phase 4 — Three-mode toggle + member UX

**4.1 Settings UI.** Add a mode selector to the member Helm preferences. Copy the orchestra/transmission metaphor carefully — the automatic-transmission metaphor is for end-user-facing strings.

**4.2 Per-query override.** Any query-input surface (Companion CLI, Cathedral chat box, search bar) accepts an inline vendor-lock override via structured hint syntax. Don't invent new syntax; reuse whatever convention exists for other query hints.

**4.3 Cost visibility.** When auto-route chose a cheaper model, surface the dollar-delta in the member's history ("This query would have cost $0.12 on Opus; Conductor routed to Haiku for $0.006 at equivalent accuracy — you saved $0.114"). This is the Cost-Slasher (#2272) operationalized at runtime.

### Phase 5 — Continuous online benchmarking

Every Nth query (N configurable, default 50) is dispatched to 2-3 vendors in parallel. Outputs are compared via the R10 Eyewitness grading rubric (already in repo). Results append to a rolling-window ranking table that updates Phase 3's rankings continuously. This is the "self-correcting orchestra" that keeps rankings fresh without manual re-benchmark sessions.

Tune parameters in `platform/src/lib/conductor/benchmark.ts`: sample rate, budget cap (don't burn $X/day on parallel runs), escalation rule (if model-A loses 3 consecutive head-to-heads to model-B on class C, demote A on class C).

### Phase 6 — Tests

- Unit: classifier on 50 reference queries (mix of clear + borderline)
- Integration: router with mock rankings, all 3 modes, fallback paths
- End-to-end: one real query through each vendor adapter, assert `costUsd` is non-zero + response is non-empty
- Cathedral integration: `conductor_route` MCP tool reachable + routing trace visible in Scribe after invocation
- pgTAP: RLS on the ranking-history table (members can read their own routing traces; admin can read global telemetry)

### Phase 7 — Handoff

Tag `v-conductors-baton-K446` on green commit. Report at `BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K446_B119_CONDUCTORS_BATON.md` covering:
- Phase completion matrix
- Routing decisions sampled across 20 test queries (classified, mode, chosen vendor, rationale, cost-delta vs. Opus-baseline)
- Any R11 ranking entries that surprised the classifier's defaults
- BRIDLE v10 compliance table

---

## Non-goals (do not do)

- Do NOT implement Phase 5 (continuous benchmarking) before Phase 3 (ranking ingestion). Ordering matters; Phase 3's schema determines Phase 5's output shape.
- Do NOT touch the pgTAP Cathedral tests from K451. Add new tests in new files if needed.
- Do NOT hardcode model rankings, even "obvious" ones. Every ranking comes from R11 data or a runtime benchmark run; never from training data or Claude's opinion.
- Do NOT expose the Conductor's routing decisions to non-authenticated users. Routing telemetry is member-scoped.
- Do NOT invent new query-hint syntax for the vendor-lock override — reuse existing member-preference / query-params convention. Grep first.

---

## Clarifying-question budget (BRIDLE Rule 3)

One permitted question. Use it on EITHER:
- The Phase 3 hydration marker — which specific R11 report section contains the rankings? (Once K444 lands; before it does, this prompt is not dispatched anyway.)
- OR an architectural blocker that would produce the wrong artifact.

If neither is blocking, pick the defensible default and proceed.

---

## What this prompt deliberately defers

- **Prov 14 strategic gating.** The Conductor's Baton is in the Prov 14 provisional filing queue. If Founder has NOT filed Prov 14 by K446 dispatch time, flag it on the first line of Phase 1 and STOP. Public-repo implementation before provisional filing weakens the defensive patent posture.
- **Glass Door + op-ed integration.** The Conductor op-ed (V02 Bishop-scaffolded) will reference this implementation. Op-ed is Founder-authored; no Knight scope.
- **Cost-Slasher dynamic pricing table.** The "live dollar-delta" surface in Phase 4.3 is a UI surface; the economic claims behind it (#2272) remain as-ratified and are out of scope for K446 engineering.

---

## Skeleton status note

This prompt is SKELETON-COMPLETE as of B119 close. Before dispatching K446:
1. K444 must land with R11 ranking data
2. Founder must ratify R11 results
3. Bishop hydrates Phase 3 section with specific ranking data
4. Bishop verifies Prov 14 filing status
5. Then GO K446

Intermediate steps (Phase 1-2) CAN be dispatched earlier as K446a if Founder wants the architecture scaffolding to land while R11 runs. That's a Founder call.

---

*Knight K446 skeleton authored by Bishop B119 (Claude Opus 4.7, 1M context), 2026-04-23. Depends on K444 R11 landing + Founder ratification. Orchestra + Automatic Transmission metaphor canonical. FOR THE KEEP.*
