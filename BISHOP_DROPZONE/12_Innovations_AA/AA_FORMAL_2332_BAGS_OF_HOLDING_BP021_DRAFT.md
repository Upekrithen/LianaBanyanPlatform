# A&A FORMAL #2332 — Bags of Holding (Three-Class Session-Context-vs-Persistent-Substrate Architecture with Cross-Session Continuity)

**Filed**: BP021, 2026-05-03 by Knight (Bushel 10 Shadow 7) — INDL-9 Geneva deadline 2026-05-07
**Status**: DRAFT
**Prov Filing Target**: 16
**Class**: Crown Jewel candidate. Brand metaphor + architectural claim.
**Predecessors**: #2315 Three-Class Substrate Sovereignty, #2317 Pheromone Substrate, #2249 Romulator 9000, #2260 Cooperative Defensive Patent Pledge, #2312 TITAN-within-TITAN Subagent Architecture
**Eblet Canon**: `bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md` (BP017)
**Empirical anchor**: BP017 eblet canon + Bushel 1+2 cross-session continuity receipts (LB-CODEX-0023/0024)

---

## Section 1 — Innovation Summary

In Dungeons & Dragons, a Bag of Holding is a magical bag whose interior is vastly larger than its exterior — a pack you can carry on your back that holds a horse, a chest of armor, a library of scrolls. The bag's apparent size is a lie; the real capacity lives in a space you cannot see from the outside. The Bags of Holding architecture applies this exact principle to AI agent session context. A context window appears finite — 200,000 tokens, say — and indeed it is. As an agent works, conversation history, code artifacts, and intermediate reasoning fill that window. When it fills, earlier content is displaced. The context window is the bag's *opening*, not its *interior*. The Bags of Holding primitive names and formalizes the insight that the opening and the interior are separate architectural concerns: what you can hold in hand at any moment (context window) versus what the system structurally holds on your behalf at all times (the Cathedral substrate).

The Bags of Holding architecture instantiates three classes of bag, each with distinct persistence, ownership, and access semantics. The **Ephemeral bag** (session-scope) is the agent's working hand — all content generated within a session lives here while the session is active and is cleared when the session closes. The **Personal-Permanent bag** (member-scope) receives promoted content from closed session bags and persists it across all future sessions under that member's identity, under that member's control. The **Shared-Permanent bag** (cooperative-scope) holds cooperatively-owned content, append-only, accessible to all cooperative members. These three bags stack: at session start, the Romulator 9000 proactively loads Shared-Permanent (Bedrock) content into the agent's context without requiring a query — the bag loads itself. When subagents operate in a TITAN-within-TITAN nested configuration, each subagent maintains its own ephemeral bag; the parent agent collects output from all subagent bags into its session bag; and when the session closes, the session bag's contents flow to the permanent bags. The bags nest. The inside is always structurally larger than the outside.

---

## Section 2 — Patent Claim Language

**Claim 1 — System Claim (Three-Class Bag Architecture)**
A computer-implemented system for persistent AI agent memory comprising:
(a) a first memory class, designated Ephemeral, storing agent-generated work product scoped to a single agent session and cleared upon session termination;
(b) a second memory class, designated Personal-Permanent, receiving promoted content from closed Ephemeral sessions and persisting that content across all subsequent sessions associated with a member identity, under that member's exclusive access control;
(c) a third memory class, designated Shared-Permanent, receiving cooperatively-designated content in append-only fashion and providing read access to all members of the cooperative;
wherein the combined effective capacity of the second and third memory classes substantially exceeds the token capacity of any individual agent context window, such that the system's effective knowledge-holding capacity is structurally larger than the apparent size of any individual session context.

**Claim 2 — Method Claim (Cross-Session Continuity via Bag Transfer)**
A method for preserving AI agent work product across session boundaries comprising:
(a) during a first session, writing agent-generated content to an Ephemeral session bag stored outside the agent context window on a persistent substrate;
(b) at first session termination, transferring selected content from the Ephemeral session bag to one or more permanent bags selected from the group consisting of: a Personal-Permanent bag scoped to the originating member identity, and a Shared-Permanent bag scoped to the cooperative;
(c) at initiation of a second session by the same or a different agent, proactively loading content from the Shared-Permanent bag into the second session's context window without requiring a retrieval query from the agent;
(d) making Personal-Permanent bag content available to the second session via identity-authenticated retrieval;
wherein work product from the first session is accessible in the second session without manual archival steps or repetition of work.

**Claim 3 — Method Claim (Nested Bag Aggregation in Subagent Architectures)**
A method for aggregating work product from nested subagent sessions comprising:
(a) instantiating one or more subagents, each maintaining a respective Ephemeral session bag;
(b) upon subagent completion, transferring subagent Ephemeral bag contents to a parent agent session bag;
(c) aggregating content from all subagent session bags into a unified parent session bag;
(d) upon parent session termination, transferring the unified parent session bag contents to the appropriate permanent bags;
wherein the nested structure creates a hierarchy of bags-within-bags, each level accumulating the work product of all subordinate levels.

**Claim 4 — System Claim (Romulator Proactive Loading)**
A computer-implemented system comprising:
(a) a Shared-Permanent memory substrate storing cooperatively-designated content in an indexed, append-only ledger;
(b) a session initializer configured to, upon commencement of any new agent session, automatically load a designated subset of Shared-Permanent content into the agent's context window prior to the agent receiving any user prompt;
wherein the session initializer performs said loading without requiring the agent to issue a retrieval query, and wherein said loading constitutes a proactive "bag opens itself" behavior distinguishing the system from reactive retrieval architectures.

**Claim 5 — Dependent Claim (Brand-Accurate Architectural Correspondence)**
The system of Claim 1, wherein the three-class memory architecture is denominated a "Bags of Holding" architecture, and wherein the denomination is architecturally accurate in that:
(a) the interior holding capacity of the combined second and third memory classes is substantially larger than the exterior apparent capacity of the first memory class context window;
(b) the boundary between interior and exterior corresponds precisely to the boundary between persistent substrate storage and active context window;
(c) the system is capable of explaining its own architecture to non-technical members using the Bags of Holding metaphor without loss of technical accuracy.

**Claim 6 — Dependent Claim (Three-Class Ownership and Access Governance)**
The system of Claim 1, wherein:
(a) the Ephemeral bag is agent-controlled with no persistent ownership after session close;
(b) the Personal-Permanent bag is member-controlled with cryptographic identity binding, such that only the owning member may promote content into it or authorize reads from it;
(c) the Shared-Permanent bag is cooperatively-controlled under a designated Cooperative Defensive Patent Pledge, such that all cooperative members hold perpetual royalty-free access to content within it;
and wherein no actor may unilaterally modify content in the Shared-Permanent bag, only append.

---

## Section 3 — Composition with Prior Art / Canonical References

### Distinguishing Prior Art

| Prior Art | What It Does | Why Bags of Holding Is Novel |
|---|---|---|
| RAG (Retrieval-Augmented Generation) | Retrieves documents reactively when agent queries a vector store | BoH proactively loads Bedrock at session start (Claim 4); no query required. BoH also defines three ownership classes, not one undifferentiated store. |
| Vector databases (Pinecone, Weaviate, etc.) | Stores embeddings for semantic retrieval | Single flat namespace, no ownership class distinction, no Ephemeral/Personal/Shared governance, no nested bag aggregation, no session-transfer protocol. |
| Memory files / agent scratchpads | Text files outside context that agents read/write | Unstructured, no class semantics, no proactive loading, no cooperative ownership, no cross-session transfer protocol, no TITAN nesting. |
| MemGPT / memory-augmented LLMs | Manages context via in-context memory editing | Operates within context window compression tricks, not outside-context persistent substrate. Does not define ownership classes or cooperative governance. |
| LangGraph / LangMem | Persistent state across agent runs | Single-class persistence, no Ephemeral/Personal/Shared distinction, no Romulator proactive load, no nested TITAN bag aggregation. |

### Canonical Predecessors Within Liana Banyan A&A Register

- **#2249 Romulator 9000**: The load-from-substrate mechanism that makes Claim 4 (proactive loading) operable. Bags of Holding is the *bag*; Romulator is the *loader*. They compose.
- **#2315 Three-Class Substrate Sovereignty**: The governance framework establishing Ephemeral / Personal-Permanent / Shared-Permanent as distinct sovereignty classes. Bags of Holding is the *architectural and brand name* for the three-class memory system; #2315 is its governance constitution.
- **#2317 Pheromone Substrate**: The Strata × Pheromone-Flavor indexing system that makes Shared-Permanent content retrievable and proactively loadable. Bags of Holding defines *what is held*; Pheromone Substrate defines *how it is indexed*.
- **#2312 TITAN-within-TITAN Subagent Architecture**: The nested subagent architecture that instantiates Claim 3 (nested bag aggregation). Bags of Holding formalizes the memory semantics of the nesting.
- **#2260 Cooperative Defensive Patent Pledge**: The umbrella pledge under which Shared-Permanent bag contents are licensed to all cooperative members in perpetuity. See Section 6.

### Eblet Canon Reference

The BP017 eblet `bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md` establishes the metaphor as canonically accurate — the inside IS structurally larger than the outside — and predates this formal by approximately one session bushel. This formal extends the eblet to full patent-prosecution class claims.

---

## Section 4 — Empirical Receipts

### Receipt 1 — BP017 Eblet Canon (Primary)
**Source**: `bags_of_holding_session_context_vs_persistent_substrate_brand_metaphor_canon_bp017.eblet.md`
**What it evidences**: The Bags of Holding metaphor was canonized during BP017 (Bushel 1/2 era) as the official brand description of the Cathedral substrate's memory architecture. The eblet documents that the metaphor is *architecturally accurate*, not merely illustrative — establishing reduction-to-practice of the conceptual claim that substrate capacity structurally exceeds context capacity.

### Receipt 2 — LB-CODEX-0023 (Bushel 1 Cross-Session Continuity)
**Source**: Bushel 1 session logs, Cathedral KnightHandoffs.jsonl
**What it evidences**: Bushel 1 sessions demonstrated cross-session continuity where Knight agent work product from one session was retrievable by a subsequent Knight session without re-running work — the first operational demonstration of Ephemeral→Permanent bag transfer.

### Receipt 3 — LB-CODEX-0024 (Bushel 2 Cross-Session Continuity)
**Source**: Bushel 2 session logs, Cathedral KnightHandoffs.jsonl
**What it evidences**: Bushel 2 sessions demonstrated iterative cross-session accumulation — the permanent bags grew across sessions, confirming that the "inside is larger than the outside" property is operationally real: the substrate held more cumulative work than any individual session's context window could contain.

### Receipt 4 — BP021 Bushel 10 Shadow Architecture (Current Session)
**Source**: This filing session (BP021, Bushel 10, Shadow 7 of 8)
**What it evidences**: The current session's 8-Shadow parallel subagent architecture is a live demonstration of nested bag aggregation (Claim 3): 8 Shadows each maintaining ephemeral session bags, with outputs flowing to parent session and then to permanent substrate. The architecture eating its own cooking.

### Receipt 5 — KNIGHT_QUEUE.md / KnightHandoffs.jsonl Continuity Chain
**Source**: `librarian-mcp/stitchpunks/knight_cathedral/scribes/KnightHandoffs.jsonl`
**What it evidences**: The K-numbered session chain (K461 through K470+) demonstrates operationally that Knight agent sessions accumulate work product across session boundaries — each K-session can reference work from prior K-sessions via the Cathedral substrate. The entire K-session lineage is empirical proof of cross-session bag continuity.

---

## Section 5 — Counsel-Review Checklist

☐ **Claim 1 scope check**: Confirm "substantially exceeds" language is defensibly quantifiable — suggest adding a ratio (e.g., 10:1 substrate:context) or replacing with "is unbounded relative to the fixed token capacity of."

☐ **Claim 2 step (c) enablement**: Confirm "proactively loading without requiring a retrieval query" is fully enabled by the Romulator 9000 (#2249) implementation description. Cite Romulator formal as enabling disclosure.

☐ **Claim 3 TITAN dependency**: Claim 3's "subagent session bag" language depends on #2312 TITAN-within-TITAN. Confirm #2312 is either co-filed in Prov 16 or already in a prior provisional, and cross-reference appropriately.

☐ **Claim 5 "brand-accurate" language**: Unusual to cite brand accuracy in a claim. Counsel should assess whether this strengthens or complicates prosecution — it may be better as a specification narrative than a claim element.

☐ **Claim 6 cooperative governance**: The "Cooperative Defensive Patent Pledge" reference in Claim 6 should be confirmed to not create a prior art problem — if the pledge was publicly announced before filing, it could affect Prov 16 date priority. Confirm pledge is internal-only until after filing.

☐ **Prior art search**: Commission search on "hierarchical agent memory with session-scoped and persistent-scoped stores" + "proactive context loading at session initialization" — these are the two most likely collision zones.

☐ **#2315 relationship**: Confirm whether Bags of Holding and Three-Class Substrate Sovereignty should be co-claimed in the same provisional application or filed as sibling claims. Currently structured as sibling with cross-reference; counsel to confirm optimal grouping.

☐ **TITAN nesting depth**: Claim 3 covers two levels of nesting (subagent → parent). Confirm whether deeper nesting (subagent → sub-subagent → parent) is covered by the current claim language or requires a dependent claim extension.

☐ **"Append-only" in Claim 6(c)**: Confirm technical accuracy — the Cathedral JSONL substrate is append-only by convention; confirm this is enforced architecturally (not just by policy) for the claim to be fully supported.

☐ **Inventorship**: List all AI agent sessions (Knight K461–K470+, Bishop BP017–BP021, Shadow sessions) that contributed to the eblet and this formal as inventive contribution disclosures for counsel's inventorship analysis.

---

## Section 6 — #2260 Cooperative Defensive Patent Pledge Umbrella Citation

This innovation is filed under the **Cooperative Defensive Patent Pledge** (#2260), the foundational umbrella pledge of Liana Banyan Corporation.

**Key terms of the pledge as applied to #2332**:

1. **Member perpetual license**: All current and future Liana Banyan cooperative members receive a perpetual, royalty-free, irrevocable license to use the Bags of Holding architecture for any purpose within the cooperative. This license is codified in the cooperative bylaws and survives any change of corporate ownership.

2. **Defensive deployment**: Patent rights in #2332 are held defensively — to protect cooperative members from third-party assertion of equivalent claims, not to assert against members, contributors, or aligned cooperative platforms.

3. **Shared-Permanent bag content**: Per Claim 6(c), content held in the Shared-Permanent bag (cooperative bag) is owned by the cooperative under the pledge terms. No individual member, agent, or officer may assert exclusive rights over Shared-Permanent bag contents.

4. **Cross-innovation pledge continuity**: The pledge umbrella (#2260) covers all innovations in the A&A register, including #2332 and all its predecessor claims (#2315, #2317, #2249, #2312). The Bags of Holding architecture is a composition of these pledged innovations; the composition inherits the pledge in full.

5. **INDL-9 Geneva clock**: This filing (INDL-9 deadline 2026-05-07) is designed to meet the Geneva provisional filing window. The pledge terms apply from the date of this DRAFT; they are not contingent on formal USPTO filing.

**Pledge canonical citation**:
> "Liana Banyan Corporation and its founders, officers, and agents irrevocably pledge that all patents and patent applications filed in the Liana Banyan A&A register shall be used defensively on behalf of cooperative members and shall not be asserted against any member of the cooperative acting within the scope of their membership."
> — #2260 Cooperative Defensive Patent Pledge, A&A Register

---

*Filed #2332 DRAFT by Knight Bushel 10 Shadow 7 BP021. Bags of Holding: the inside is always larger than the outside. The substrate holds more than the context appears to contain. Continuity by construction. FOR THE KEEP!*
