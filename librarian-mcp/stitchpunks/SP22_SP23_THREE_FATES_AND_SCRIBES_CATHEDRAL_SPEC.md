# SP-22 Three Fates + SP-23 Scribes Cathedral — Combined Spec

**Authored:** Bishop B116, 2026-04-22.
**Requested by:** Founder during B116 evening exchange after SP-21 Tidbit Scribe shipped.
**Status:** MVP structures live (`stitchpunks/scribes/` directory + 4 Scribe tablets + `fates_log.jsonl`). Formal MCP tools + hook integration = future Knight dispatch.
**Predecessor:** SP-21 Tidbit Scribe (single generalist verify-action observer). SP-22/23 is the generalization.

---

## Concept

### Scribes Cathedral (SP-23)

A cathedral of small domain-specialist note-takers, each with:
- **One primary field** (Level 1 — PhD-deep, canonical keeper for that field)
- **Up to 12 adjacent fields** at decreasing expertise levels (2–3 PhD-adjacent, 4–6 junior-adjacent, 7–12 ancillary)
- **An append-only tablet** (`stitchpunks/scribes/scribe_<id>.jsonl`) — stone tablets, durable, immutable
- **A keyword library + activation threshold** — the Scribe listens for load-bearing mentions in its domain

Every topic in the knowledge graph should be covered by **at least three** Scribes via overlapping adjacents. That triply-redundant witness is error-correcting: if one tablet disagrees with two others on a shared fact, drift is detectable without extra audit tooling — like Reed-Solomon parity for knowledge.

**Canonical phrasing (Founder-approved B116):**
> *"Domain-indexed working memory with triply-redundant witness."*

### Three Fates (SP-22)

Active listener pipeline that routes session traffic to the sleeping Scribes.

| Fate | Role | Behavior |
|---|---|---|
| **Clotho** (the Spinner) | Spins out themes | Scans recent session text, extracts candidate themes/keywords |
| **Lachesis** (the Measurer) | Measures relevance | Scores candidate themes against registered Scribes' primary + adjacent fields; picks which Scribes wake |
| **Atropos** (the Cutter) | Cuts the assignment | Writes the specific directive to each awakened Scribe ("log this observation to your tablet"), closes the routing record |

The pipeline hands off to awakened Scribes, who append to their own tablets. The Fates do NOT write to Scribe tablets directly; they only dispatch.

---

## Why this shape?

1. **RAM analogy refined.** Founder's "this is the RAM" intuition captured the access pattern correctly. Precise label: *indexed write-through cache with 3× redundancy.* Fast (consult-by-domain, O(1)), partitioned (one tablet per Scribe), durable (append-only), redundant (3+ witnesses per topic).
2. **The Fates are NOT the Scribes.** Separation of concerns — one Scribe per domain, one Fates pipeline for all routing. Adding a Scribe is cheap (new tablet file + registry entry); the Fates stay constant.
3. **Cathedral scale.** Script files are small. A cathedral of 1,000 Scribes is <100 MB. The overhead is in the Fates' routing decisions, not in storing the tablets.
4. **Precursor survives successor.** File-append MVP today becomes the backing store when MCP tools + hooks ship. Same pattern SP-21 established.

---

## MVP ship (B116)

| Artifact | Status |
|---|---|
| `scribes/registry.yaml` | ✅ — registers R9, BRIDLE, Landing, Prov14 with primary + adjacents + keyword libraries |
| `scribes/scribe_R9.jsonl` | ✅ — header + opening entry |
| `scribes/scribe_BRIDLE.jsonl` | ✅ — header + opening entry |
| `scribes/scribe_Landing.jsonl` | ✅ — header + 4 seed entries from B116 session |
| `scribes/scribe_Prov14.jsonl` | ✅ — header + B110 inventory + B111-B116 A&A candidates + Founder's member-facing insight |
| `data/fates_log.jsonl` | ✅ — header + first dispatch record for the current exchange |
| Feedback memory | ✅ — `feedback_three_fates_scribe_routing.md` (enforces Bishop-plays-Fates discipline until hooks ship) |

Cathedral opens with **4 Scribes**; 6 more queued in registry.yaml comments as future-on-first-trigger (Letters, Pedestal, Canonical, Sweet Sixteen, Librarian MCP, Stitchpunk Corps).

---

## Formal build (future Knight dispatch — call it K438 or later)

### Tools to add to `librarian-mcp/src/server.ts`

```ts
// Fates routing
server.addTool({
  name: "fates_route",
  description: "Run the Three Fates over a chunk of session text. Clotho extracts themes, Lachesis scores against registered Scribes, Atropos dispatches directives. Returns routing record + list of awakened Scribe IDs.",
  inputSchema: {
    type: "object",
    properties: {
      session_id: { type: "string" },
      text: { type: "string", minLength: 20 },
      agent: { type: "string", enum: ["BISHOP","KNIGHT","ROOK","PAWN"] }
    },
    required: ["session_id","text","agent"]
  }
});

// Scribe append
server.addTool({
  name: "scribe_log",
  description: "Append an entry to a specific Scribe's tablet. Typically called by Atropos' dispatch; can be called directly by agents for high-confidence domain observations.",
  inputSchema: {
    type: "object",
    properties: {
      scribe_id: { type: "string" },
      session_id: { type: "string" },
      observation: { type: "string", minLength: 10, maxLength: 500 },
      source: { type: "string", enum: ["founder_dialogue","bishop_ship","knight_ship","bishop_read","bishop_thresh","scribe_thresh"] },
      canonical_ref: { type: "string" }
    },
    required: ["scribe_id","session_id","observation","source"]
  }
});

// Scribe consult (RAM-access pattern)
server.addTool({
  name: "consult_scribes",
  description: "Query one or more Scribes for recent entries on a topic. Returns last N entries from primary-scribe + any Scribes with matching adjacents. Use this when you need fast domain-indexed context retrieval mid-session.",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string" },
      max_entries: { type: "number", default: 20 },
      since_ts: { type: "string", description: "ISO-8601; only return entries newer than this" }
    },
    required: ["topic"]
  }
});
```

### Hook integration (auto-Fates, the "listening")

Two options to make Fates-routing automatic instead of discipline-driven:

**Option 1 (Claude Code hook):** UserPromptSubmit hook + Stop hook in `~/.claude/settings.json`. The hook posts the message content to `fates_route` after each exchange. Transparent to the agent; works across sessions.

**Option 2 (MCP server post-processing):** `mcp__librarian__run_session_start` and `mcp__librarian__session_end` wrap a routing pass over session text. Less automatic (needs explicit session boundaries) but no settings.json change needed.

Both options preserve the Scribe tablets in their current form; the difference is only WHERE the dispatch trigger lives.

### Session-end summary

Extend `sp6_scribe` session-end to print a Cathedral status:
> *SP-22/23 Cathedral: 4 Scribes active, 47 tablet entries this session (12 Prov14, 9 Landing, 4 BRIDLE, 22 R9). Fates dispatched 13 times. Hottest Scribe: Prov14.*

---

## Member-facing deployment (NEW — Founder insight B116)

> *The Scribes Cathedral is not only Bishop-internal. It is a member-product — a huge LB membership value-driver, especially for R9 users.*

### Value proposition

- Each Liana Banyan member gets their own Cathedral — a durable, domain-indexed, triply-redundant working memory across their workflows.
- As the member's Cathedral grows, their personal preload (feeding R9 retrieval) gets richer — accuracy and cost-slasher gains compound over time.
- Cathedrals persist across sessions, computer restarts, new projects. Leaving LB = leaving your Cathedral (but it's consent-gated and exportable — member-friendly stickiness, not lock-in).
- Optional consent-gated Scribe-sharing across Guild / Tribe / commons under #2260 Cooperative Defensive Patent Pledge — a member's Scribe of [their profession] can seed the Guild's collective Scribe at their discretion.

### Implications

- Membership sales pitch: *"You keep paying $5/yr because your Cathedral is worth more every month."*
- Ecosystem à-la-carte pledge (memory `project_ecosystem_a_la_carte_pledge.md`): *"Using R9 + your Cathedral, saving $X/month. Add Mellon, save $Y more."*
- Infrastructure: Cathedrals per-member scale fine — tablet files are small and append-only; a 10-year-old Cathedral is <1 GB. Standard Supabase row-level-security pattern for privacy.
- Patent angle: **Member-Owned Scribes Cathedral** is a fresh A&A candidate for Prov 14. See `scribe_Prov14.jsonl` entry for 2026-04-22T21:07Z.

### Open questions for Founder

1. Private-by-default or opt-in-share-by-default? (My proposal: private, with one-click share-to-Guild/Tribe.)
2. Does the $5/yr tier include unlimited Scribe tablets, or is there a premium tier for power users with 50+ Scribes? (My proposal: unlimited for $5; Cathedrals are cheap.)
3. Is a member's Cathedral exportable on membership close? (My proposal: yes, explicitly. Part of member-friendly anti-lock-in.)

---

## Open questions for Founder (cross-cutting)

1. **Confirm levels.** Six formal levels (1=primary PhD, 2–3 PhD-adjacent, 4–6 junior-adjacent), extensible to 12 for ancillary. Matches your request. OK?
2. **Auto-Fates hook vs. session-end sweep.** Option 1 (always-on) or Option 2 (session-boundary) for the listening trigger? Default proposal: Option 1 once Claude Code hooks are set up — until then, Bishop-discipline via feedback memory.
3. **Cathedral naming convention.** `scribe_<id>.jsonl` uses simple IDs (R9, BRIDLE, Landing, Prov14). When we add member-facing Cathedrals, proposed namespace: `scribes/member_<member_id>/<scribe_id>.jsonl` so the global cathedral and member cathedrals don't collide.
4. **Prov 14 threshing scope.** The first task for Scribe Prov14 beyond passive listening: retrospectively thresh B111-B116 session material for A&A candidates. Is that Bishop-B117 work or Pawn research?

---

## Mapping to "How to Bake AI Cake" paper

- Example #1 (B116): SP-21 Tidbit Scribe origin — single-observer MVP. *Previously captured.*
- Example #2 (B116 same evening): SP-22 Three Fates + SP-23 Scribes Cathedral — the generalization from one observer to a cathedral of specialists with triply-redundant witness, and the member-product extension. *Captured in the paper file this session.*
- Example candidate #3 (pending Founder pick): Prov 14 Scribe as a specialization with its own internal three-phase pipeline (thresh / describe / finalize) — Fates pattern applied recursively inside one Scribe.

---

*MVP Cathedral opened B116 2026-04-22. Next review at B117 session start: how many new tablet entries accumulated? Is Scribe Prov14 catching A&A candidates in real time, or does discipline need tightening?*
