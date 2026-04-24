# Plan — Proactive Scribe Auto-Surfacing ("Ears Perk Up")

**Bishop session:** B121, 2026-04-23
**Filed for execution:** post-Prov-14 filing, post-K455 series (K455c → K455a → K455b), likely K466+ or later
**Status:** PLAN ONLY (Founder directive B121: *"Make a plan to make that happen, after we finish what we came to do, please."*)

---

## The problem this solves

**B121 use case — Harper Guild miss.** Bishop scaffolded a memory file for "Harper Guild" based on Founder invoking the term. Bishop ASSUMED Harper Guild was a new-coinage writers Guild. It was not — Harper Guild has existing LB canon (HR/ethics role, 0.6×0.6 compensation, HarperReviewDashboardPage) dating back to the Business Plan pre-launch. Founder corrected with a separate message pointing Bishop at the canon. Bishop grep-found the answer quickly, but the discipline failure was real: **the Cathedral had the knowledge; Bishop didn't know to ask.**

**The root architectural gap:** Scribes are currently PULL-based. Bishop / Knight / Pawn must explicitly call `consult_scribes` or `search_knowledge` to retrieve content. The Cathedral is silent unless queried. When an agent isn't aware a domain already has canon, the agent generates new-but-wrong content, and correction happens downstream through operator intervention.

**Founder's vision (B121 quote):** *"We really do need the processing and collecting by scribes of all that such information, so that when 'Harper' is uttered, that assigned Scribe's ears perk up, and the well of knowledge they possess is ready to be shared."*

The mechanism he's describing: Scribes have declared domains; when a domain keyword appears in agent context, the relevant Scribe proactively surfaces its canon before the agent commits to a response.

---

## Vision

**Active-surface Cathedral.** Scribes are no longer silent archives waiting for queries — they are attentive listeners. Each Scribe maintains a domain watchlist; when a watched term appears in agent conversation, tool use, or file edits, the Scribe's relevant tablets are injected into the agent's context automatically, BEFORE the agent generates its response.

**User experience target:** Bishop / Knight / Pawn should never again write "Harper Guild is a Guild of writers" when Harper Guild canon already exists. The relevant Scribe intercepts: "You're writing about the Harper Guild — here's the existing canon (HR/ethics role, 0.6×0.6 compensation, etc.). Reconcile before continuing."

**Not a query tool — a reflex.** Agents don't have to remember to ask. The Cathedral speaks when spoken to, without being asked.

---

## Four-phase roadmap

### Phase 1 — Scribe Watchlists (MVP, ~K466-K467)

**Scope:** small. ~2-3 hours Knight work.

Each Scribe gains a `watchlist.json` file alongside its tablets, declaring domain keywords and phrases. Initial seed populated by analyzing existing tablet content (if KnightArchitecture Scribe has 10 tablets that all reference "Supabase", then "Supabase" is on its watchlist). Manual additions allowed.

Format:
```json
{
  "scribe": "KnightArchitecture",
  "watchlist": [
    {"term": "Supabase", "weight": 1.0, "source": "derived-from-tablets"},
    {"term": "canonical discipline", "weight": 0.8, "source": "manual"},
    {"term": "Harper Guild", "weight": 1.0, "source": "manual", "notes": "cross-Scribe reference"}
  ],
  "last_updated": "2026-04-24T..."
}
```

Watchlists live in each Cathedral's Scribe directory (`librarian-mcp/stitchpunks/scribes/` and `librarian-mcp/stitchpunks/knight_cathedral/scribes/`).

**Deliverables:**
- Watchlist schema + README
- Auto-derivation script that populates initial watchlists from existing tablet corpus
- Tests

### Phase 2 — Keyword-Match Auto-Surface (~K468-K469)

**Scope:** medium. ~4-5 hours Knight work. Core feature.

A new Stitchpunk — **SP-25 "The Herald"** — scans agent context (last N messages, pending tool calls, open file-edit buffers) for watchlist term matches across all local Cathedral Scribes. On match, Herald:

1. Retrieves top-K tablets from the matching Scribe for that term
2. Compiles them into a structured context-surface message
3. Injects into agent context via the mechanism available (Claude Code UserPromptSubmit hook writing a system-reminder, or an MCP tool that auto-runs, or a sidecar process that edits the agent's turn-in-progress — implementation detail TBD)

**The Herald is adjacent to Hounds but distinct:** Hounds TRANSPORT tablets between Cathedrals; Herald SURFACES tablets within an agent's own Cathedral. Hounds go; Herald speaks.

**Deliverables:**
- `librarian-mcp/src/stitchpunks/herald.ts` — the Herald module
- Hook integration (Claude Code + Cursor MCP entry points)
- Herald watch/surface log at `librarian-mcp/stitchpunks/data/herald_surface.jsonl` (audit trail — what was surfaced when, whether the agent used it)
- Tests (keyword match, surface injection, idempotence)

### Phase 3 — Semantic Matching (~K470+)

**Scope:** medium-large. ~6-10 hours Knight work.

Replace keyword-match with vector-similarity matching. Each tablet gets embedded (sentence-transformer or local embedding model); Herald computes similarity between agent context and tablet embeddings; top-K surface.

**Why this matters:** keyword-match misses semantic relatives. "HR/ethics person in each business" should surface Harper canon even without the literal word "Harper." Embeddings catch the semantic relationship.

**Deliverables:**
- Embedding generator for tablets (batch + incremental on new tablets)
- Embedding store (probably a local SQLite or JSON index in each Cathedral)
- Herald upgrade to use embeddings-first, keyword-match-fallback

### Phase 4 — Active Fates Routing on Live Context (~K472+, architectural)

**Scope:** large. Multi-session. Architectural.

The Three Fates pipeline extends from "routing tablet writes" to "routing agent context through Cathedrals on every message boundary":

- **Clotho** classifies current agent context by theme (same classifier already used for tablet routing)
- **Lachesis** scores which Scribes have highest-relevance tablets
- **Atropos** dispatches the top-K tablet payloads to Herald for surfacing

This is the full three-Fates-per-Cathedral pipeline operating on LIVE agent context, not just on persistent tablet writes. End-state architecture.

---

## Implementation sequencing

Recommended dispatch order (after K455 series and K464 Hounds MVP land):

1. **K466** — Phase 1 Scribe Watchlists MVP
2. **K467** — Phase 1 extension: auto-derivation + seed watchlists for all existing Scribes (Bishop's + Knight's)
3. **K468** — Phase 2 Herald MVP (keyword-match + surface-injection via hook)
4. **K469** — Phase 2 tests + operator audit trail + session validation
5. **K470** — Phase 3 semantic embedding generation + store
6. **K471** — Phase 3 Herald upgrade to semantic matching
7. **K472+** — Phase 4 Active Fates integration (multi-session)

Phases 1-2 alone resolve the B121 Harper-Guild-miss class of problem. Phases 3-4 are enhancement.

---

## Patent implications

The proactive-Scribe-auto-surfacing mechanism is a **distinct patentable method**, adjacent to but different from:

- #2270 Scribes Cathedral Architecture (the static substrate)
- #2276 Scribe Coverage Discovery (the measurement)
- #2278 The Cathedral Effect (the lift)
- #2279 The Hounds (cross-Cathedral transport)
- #2280 Distributed-Function Coherence
- #2281 Multi-Cathedral Cooperative Member Substrate

**Candidate innovation #2282 (or later):** *Proactive Domain-Aware Context Surfacing in a Cooperative Memory Substrate* — a method by which Scribes declared with domain watchlists automatically inject their canonical content into agent context when watched terms are detected in agent conversation, tool use, or editing activity, such that new content generated by the agent is automatically reconciled with existing canonical content without requiring the agent to explicitly query the substrate.

Claim structure would include: watchlist declaration, keyword / semantic detection, top-K tablet retrieval, context injection via runtime-appropriate hook (claude-code UserPromptSubmit, Cursor MCP tool, or agent-side sidecar), and an audit trail recording what surfaced when with what effect on downstream agent output.

Queue for Prov 15 (Prov 14 is filing within the hour as of this planning doc; #2282 here is forward-looking, not in-scope for Prov 14). Add to innovation registry now so first-use is anchored from this planning doc.

---

## Metaphor alignment (Founder-voice)

- **Scribes** record and preserve
- **Fates** route writes
- **Scrambler** arbitrates between sources
- **Hounds** carry between Cathedrals (with four-to-six capabilities including bury and dig up)
- **Herald** (new, Phase 2) — announces, declares, surfaces. Heralds in medieval courts carried titles, genealogies, heraldic-authority knowledge. Their job was to SPEAK the right context at the right moment — which is exactly what Phase 2 delivers. Naming fits the metaphor family.

"When 'Harper' is uttered, that assigned Scribe's ears perk up" — the Scribe perks up; the Herald is the mechanism by which the Scribe's perked-up attention actually reaches the agent. Scribe listens; Herald speaks for the Scribe.

---

## Acceptance criteria (full plan)

- Bishop / Knight / Pawn never again write canon-conflicting content when the Cathedral already has canon — the Herald intercepts and surfaces
- Operator audit trail shows what was surfaced when, and whether the agent reconciled or ignored
- No performance regression — Herald operates within budget on local Scribe sets, no latency spike on agent responses
- Cross-Cathedral awareness — Knight's Herald can surface Bishop's Scribes on matched terms (via Hounds-delivered snapshot or direct MCP cross-consultation from #2281)
- Patent filing (Prov 15 candidate) describes the method across all four phases

---

## K466 addendum — Corpus mode awareness for Herald Phase 2

**K466/B121** introduced `mode: "observational" | "corpus"` at the Scribe registry level (see `REPORT_KNIGHT_K466_B121_SCRIBE_CORPUS_MODE.md`). Herald Phase 2 implementation must be corpus-mode aware:

- When Herald surfaces entries from a **corpus-mode Scribe** (static reference corpora: R11, canonical_values, rulebooks), the surface should present the full corpus chunk as a canonical block — NOT as "recent observations." Label: *"[Scribe] canonical reference corpus"*.
- When Herald surfaces entries from an **observational-mode Scribe** (session logs, handoffs, memory), the surface should present as recency-relevant context — recent observations that may inform the current task. Label: *"[Scribe] recent observations"*.
- `consult_scribes` now exposes `scribes_consulted[].mode` — Herald can inspect this field directly to determine surface labeling without needing to re-query registry.

Corpus-mode Scribes are always retrieved in full (deterministic order); Herald need not second-guess whether the result set is truncated. Observational-mode Scribes are top-K recency-sliced; Herald should note to agent that more history may exist beyond the surfaced entries.

---

## Reference — B121 triggering incident

This plan was written immediately after Bishop mis-described the LB Harper Guild in a memory file. Founder corrected, pointed Bishop at the existing Business Plan canon (HR/ethics role, 0.6×0.6 compensation, HarperReviewDashboardPage), and said: *"We really do need the processing and collecting by scribes of all that such information, so that when 'Harper' is uttered, that assigned Scribe's ears perk up, and the well of knowledge they possess is ready to be shared. Make a plan to make that happen, after we finish what we came to do, please."*

This plan is the answer to that directive. Execution awaits post-Prov-14 + post-K455-series.
