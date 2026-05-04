# A&A Formal #2292 — Cathedral Federation Protocol (CFP)

**Status:** DRAFT — Bishop scaffolding for Founder rewrite. Leave in FOUNDER_REVIEW; do not move to FOUNDER_APPROVED without Founder's direct say-so.

**Session opened:** B122 / 2026-04-24
**Innovation class:** Crown Jewel candidate, Prov 14 (filing window extended; open per Founder direction)
**Founder-voice keystone anchor:** *"Basically TCP/IP."* (Founder, B122)
**Related CJs (prior thresh):** #2278 The Cathedral Effect, #2279-2281 Hounds, #2290 The Loom, #2291 Self-Indexing Scribes. CFP is the unifying federation layer.
**Pledge status:** Cooperative Defensive Patent Pledge (#2260) eligible — the commons-pledge posture is structurally aligned with this class of protocol IP.

---

## § 1 — Innovation Statement

*[Founder rewrite expected; skeleton below preserves structural skeleton and Bishop's best articulation.]*

The Cathedral Federation Protocol (CFP) is a transport-layer standard enabling heterogeneous AI memory architectures ("Cathedrals") to interoperate without a central gatekeeper. Just as TCP/IP separated *transport* (how packets move between networks) from *application* (what the packets mean), CFP separates Cathedral-to-Cathedral *transport* (addressing, routing, reliable delivery, session management) from *content semantics* (what the retrieved tablets mean, how they are composed into a user's knowledge workflow). The separation is the novelty: it permits any CFP-compliant Cathedral — operated by any party, hosted on any infrastructure, curated under any domain expertise — to participate in a shared federation without requiring content-level coordination, without a central authority, and without forcing participants to adopt a common vocabulary, ontology, or schema.

The protocol is pledged to the commons under the Cooperative Defensive Patent Pledge. Commercial value is realized in *implementations* (user-agents such as the Helm PWA, hosted federation services, integration tooling, support relationships) rather than in gatekeeping the standard.

**What CFP is not:**
- Not a single Cathedral or a single curated corpus
- Not a walled-garden platform; participation is open to any party implementing the protocol
- Not a browser; the Helm PWA is ONE user-agent implementation of CFP, analogous to Mosaic/Netscape/Chrome being user-agent implementations of HTTP — other user-agents may be built
- Not a content-layer agreement; Cathedrals may contain entirely different vocabularies, structures, and contents and still interoperate at the transport layer

---

## § 2 — Prior Art Acknowledgment

*[Founder-voice pass expected; Bishop draft below.]*

Network-layer protocols with separation of transport and application (TCP/IP, 1974-1983) are well-established and form the foundation of the modern Internet. CFP's novelty is the application of this architectural pattern to *federated AI memory architectures*, which is a distinct domain with distinct constraints and distinct value-propositions:

- **Addressing semantics differ**: IP addresses route packets to hosts; CFP addresses route queries to Cathedrals with specific domain scope and permissions
- **Reliable delivery semantics differ**: TCP acknowledges byte-streams; CFP acknowledges tablet-sets with provenance guarantees
- **End-to-end principle applies but with different endpoints**: TCP/IP's endpoints are hosts; CFP's endpoints are Cathedrals, which are knowledge-scoped entities with membership, provenance, and expertise properties
- **Permissioning at the protocol layer**: CFP incorporates Cathedral-scope permissioning (which parts of a Cathedral are shareable with which peers), which has no direct TCP/IP analog

Related work in federated retrieval (federated search, distributed search indexes, cross-language information retrieval) addresses related problems but at the application/query level, not at the transport/protocol level. CFP's distinctive contribution is the protocol-layer abstraction.

Federated learning frameworks (e.g. federated gradient descent, federated analytics) federate *model training*, not *retrieval-time memory*. The problems are structurally different — federated learning needs privacy-preserving aggregation of gradients; CFP needs scope-aware cross-Cathedral query routing with semantic provenance.

---

## § 3 — Embodiment / Implementation Layers

CFP's primitives already exist in the LB codebase as pre-threshed innovations; CFP is the unifying protocol that composes them:

| Layer | CFP function | LB implementation (existing) | Prior CJ |
|---|---|---|---|
| **Transport / routing** | Reliable packet-equivalent delivery between Cathedrals; addressing; retry; guard rules | **Hounds** — 6 capabilities (carry/howl/bark/bury/dig up/guard), 3 Fate classes, bilateral Guard rule ("every time, both sides, sometimes all three"), scope-parameterized, named packs (Baskerville Hounds, Harper Guild) | #2279-2281 |
| **Content contribution** | Application-layer vocabulary emission into routing; how a Scribe declares its distinctive content to the federation | **The Loom** — domain Scribe participation, vocabulary contribution mechanics | #2290 |
| **Retrieval quality** | Ensuring the routing layer's decisions produce retrievable content | **Self-Indexing Scribes** (auto-extractor, K474) — corpus-derived distinctiveness keywords, architecturally-earned routing | #2291 |
| **User-agent surface** | The layer where a human (or other agent) interacts with the federation | **Helm PWA** (K475+ roadmap) — progressive web app, load-your-own-Cathedral + federate-with-others | (this CJ + implementation sessions ahead) |
| **Protocol itself** | The glue that makes all of the above interoperable across independent parties | **CFP (this CJ)** — addressing scheme, session semantics, permission model, handshake, end-to-end principle | **#2292** |

**Protocol layers in isolation are NOT the IP claim.** The IP is the specific combination: the protocol-layer *abstraction* (transport vs application separation) applied to the *federated AI memory architecture* domain, with the specific affordances (Cathedral-scope permissioning, provenance preservation, user-sovereignty of endpoint content).

---

## § 4 — Exhibits

### Exhibit A — Protocol Stack Diagram

*[Founder: diagram to be sketched or commissioned. Skeleton description below.]*

Seven-layer stack showing CFP at layers 3-4 (transport/protocol), Hounds at layers 2-3 (routing/delivery), Loom at layers 5-6 (session/presentation), Helm PWA at layer 7 (application/user). Parallel to OSI model with Cathedral-specific affordances at each layer.

### Exhibit B — User-Sovereignty Guarantees

*[Founder-voice expected; Bishop skeleton:]*

CFP guarantees to the user-endpoint:
1. **Content sovereignty** — user controls which Cathedrals they participate in, which parts of their own Cathedral are federated, and which peer Cathedrals they query
2. **Discovery sovereignty** — user controls which queries are routed where; protocol does not force disclosure of queries to the federation as a whole
3. **Provenance sovereignty** — retrieved tablets carry Cathedral-of-origin provenance; user controls how/whether to trust each source
4. **Departure sovereignty** — user can leave any federation at any time, retaining their Cathedral and their content; no protocol-layer lock-in

These map to the Founder-stated product posture: *"We hand them the reins of our very fast horse."*

### Exhibit C — Empirical Validation Placeholder

*[To be appended post-K475 results and post-Helm-PWA implementation.]*

R12-Pawn-Comet benchmark (K475, B122) validates the single-Cathedral mechanism. Federation-layer empirical validation will follow from the first multi-party CFP deployment (Helm PWA v1 + federation peer onboarding). Projected: the federation value-proposition is a *network effect* — each new Cathedral added to a federation increases the value of federation participation for all existing members. This is the distinctive value of CFP over single-Cathedral architectures.

### Exhibit D — Competitive Landscape

*[Bishop skeleton; Founder to evaluate.]*

- **Centralized AI providers (OpenAI, Anthropic, Google)**: offer single-vendor retrieval; no federation with user's own memory, no cross-vendor interoperability
- **RAG-as-a-service providers**: offer single-Cathedral tooling (vectordb + retrieval) but no federation protocol
- **Federated learning providers**: different problem (training, not retrieval)
- **Browser vendors (Perplexity/Comet, Arc, Chrome)**: application-layer only; no protocol-level federation

CFP's claim space is the protocol-layer abstraction; no prior art appears to occupy this position in the federated AI memory architecture domain.

---

## § 5 — Claim Skeleton

*[6 claims drafted below for counsel refinement and Founder editorial pass. Claim structure mirrors #2278 and #2291 patterns.]*

**Claim 1.** A method for federated retrieval from heterogeneous AI memory architectures, comprising: (a) representing each memory architecture as a Cathedral with an addressable identity; (b) routing retrieval requests between Cathedrals via a transport-layer protocol that is content-agnostic; (c) preserving content-origin provenance end-to-end through the protocol layer; (d) permitting each Cathedral's operator to scope which contents are federated and which remain local; (e) executing the routing without reference to a central authority or common ontology.

**Claim 2.** The method of claim 1 wherein the transport-layer protocol implements reliable ordered delivery of retrieval-result tablets between source and destination Cathedrals, with retry semantics in the event of transient failure and idempotent re-delivery semantics in the event of repeated request.

**Claim 3.** The method of claim 1 wherein Cathedrals participate in federation under pledge to a defensive patent commons, such that the protocol itself is non-proprietary and the commercial value is realized in user-agent implementations rather than in protocol gatekeeping.

**Claim 4.** The method of claim 1 wherein each Cathedral's distinctive content is exposed to the routing layer via corpus-derived distinctiveness keywords produced by a deterministic automatic extraction process, without requiring operator hand-curation of routing keywords.

**Claim 5.** The method of claim 1 wherein a user-agent implementation provides a progressive web application surface through which end-users: (a) load their own Cathedral, (b) federate with peer Cathedrals under user-controlled permissions, (c) issue retrieval queries that the protocol layer routes across the federation, and (d) receive composed result-sets with Cathedral-of-origin provenance for each tablet.

**Claim 6.** The method of claim 5 wherein the user-agent preserves user sovereignty through explicit controls for content sovereignty, discovery sovereignty, provenance sovereignty, and departure sovereignty, as detailed in Exhibit B.

*[Additional claims may be drafted by counsel based on prior-art search and strategic claim-scope decisions.]*

---

## § 6 — Commercial Value Proposition

CFP's IP value is *defensive commons* — the protocol itself is pledged. Commercial value is realized in:

- **Helm PWA** (LB's user-agent implementation) — subscription tier with zero-friction federation, Cathedral hosting, LB-canonical preloads
- **Hosted federation services** — for organizations that want CFP participation without operating their own Cathedral infrastructure
- **Integration tooling** — enterprise connectors, compliance-grade logging, federated-search analytics
- **Support relationships** — deployment consulting, schema migration, federation onboarding

This is directly parallel to TCP/IP's commercialization: the protocol is commons; the routers, network equipment, and ISPs are where the commercial value sat.

---

## § 7 — Open Questions for Founder

*[Bishop notes; Founder to answer or defer.]*

1. **Naming**: "Cathedral Federation Protocol (CFP)" is Bishop's working name. Founder-voice alternatives worth considering? ("Interchange Protocol," "Cathedral Transit," etc.) Is CFP the Founder-approved name, or working placeholder?
2. **Scope of exhibits**: which exhibits should be full-drafted vs deferred to post-K475 / post-Helm-implementation? Claim 1-6 + Exhibit A-D structure is proposed but provisional.
3. **Coupling to other CJs**: CFP currently references #2279-2281, #2290, #2291. Should CFP be drafted as a *dependent* claim (i.e., building on those prior innovations) or as an *independent* claim (with its own full stack)? Counsel guidance likely useful.
4. **Timing**: file CFP with Prov 14 as-currently-open, or accumulate more threshing before file? (Founder's "I have learned to wait" keystone applies.)
5. **Helm PWA as separate CJ**: is the Helm PWA itself a separate CJ candidate (as an implementation surface), or encompassed as one implementation under CFP Claim 5? Bishop's lean: separate the IP and keep Helm PWA as its own future CJ to be filed when the implementation has meaningful empirical backing; CFP stands on the protocol alone.

---

*End of CJ #2292 skeleton. Awaiting Founder rewrite and ratification.*
