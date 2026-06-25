# PROV_22 BP085 Threshing Addendum · 6 New Claim Groups (31-36) · 19 new claims · ~19-20 pages estimated

**Status:** FOUNDER RATIFIED CG31-36 · ready to file · CG35 + CG36 spec details confirmed by Founder direct BP085
**Composed by:** Sonnet 4.6 SEG · Bishop dispatch · BP085
**Date:** 2026-06-17
**Source canon:** `MNEMOSYNEC_AS_INTERFACE_ROADMAP_BP085.md` (primary) · Tasks 72-73 eblets (minted this session)
**Target:** `PROV_22_DRAFT_v02.md` → will become v05 after this addendum integrates (v03=TIC, v04=CodeBreakers+UnseenTax per BP084)
**Pledge #2260:** Defensive patent use only. All claims in this addendum are filed pursuant to Pledge #2260 (cooperative member defensive covenant).

---

## §1 · Threshing Inventory

### INCLUDED in this addendum (patentable architectural innovations)

| Canon | Claim Group | Disposition |
|-------|-------------|-------------|
| Dr. MnemosyneC Brain-Swap · Pluggable Cognitive Core · Hot-Swappable AI Orchestrator (`canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085.eblet.md`) | CG36 | INCLUDED |
| MnemosyneC-as-Interface · persistent host architecture (`canon_mnemosynec_as_interface_persistent_host_vendor_resilient_bp085.eblet.md`) | CG31 | INCLUDED |
| Persistent Active Memory Crown Jewel · multi-vendor continuity lift (`canon_persistent_active_memory_crown_jewel_bp085` — within roadmap §1) | CG31 | INCLUDED (sub-claim) |
| Continuity-lift across vendor churn · second-order value claim (Substrate Theorem extension, roadmap §1) | CG31 | INCLUDED (sub-claim) |
| MedLab · eblet-stored AI-connection-fix recipes (`canon_medlab_eblet_recipes_ai_connection_fixes_bp085.eblet.md`) | CG32 | INCLUDED |
| Concoctions · typed-ingredient recipe schema (`canon_concoctions_medlab_ingredients_recipe_anatomy_bp085.eblet.md`) | CG32 | INCLUDED |
| Reins Assignment Per Category · dynamic AI domain assignment (`canon_mnemosynec_assigns_reins_per_category_bp085.eblet.md`) | CG32 | INCLUDED |
| Dedicated Sub-Agent ONE Role · Comptroller pattern (`canon_dedicated_sub_agent_one_role_comptroller_pattern_bp085.eblet.md`) | CG32 | INCLUDED (sub-claim) |
| NetLinkWebNode · MIC · peer-vendor borrowing with consent + Marks (`canon_netlinkwebnode_mic_vendor_resilient_peer_cluster_bp085.eblet.md`) | CG33 | INCLUDED |
| "Consult, don't Rent" · task-class AI cost-routing (`canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085.eblet.md`) | CG33 | INCLUDED |
| Many Doors One Cooperative · multi-entrance unified membership (roadmap §3 + Cue Deck Card architecture) | CG34 | INCLUDED |
| Captain's Ship Wheel · orchestrator pattern with persistent state (implicit in roadmap §7-§9 Wrasse Foreman/Comptroller composition) | CG34 | INCLUDED (sub-claim) |

### DEFERRED — non-patentable or duplicative

| Item | Reason deferred |
|------|-----------------|
| 1,000-Signup Community Threshold mesh gate | Operational business rule, not an architectural method. Not patentable as framed. May be cited as context in CG33 background. |
| Wrasse Foreman / Quartermaster Captain name pick | Name selection pending Founder decision. The underlying architecture (sub-agent manager managing reminder scribes) is a minor extension of existing Wrasse Quartermaster canon (BP056b). Deferred until the role is operationally defined. |
| Trust algorithm formula (installs×2 + eblets×1 + zero_issue_days×1 − open_issues×10) | This was disclosed in BP082/BP083 and appears in PROV_22 v02 Claim Group infrastructure sections. Not a new BP085 innovation. |
| Substrate component architecture (Eblets · Eblits · Pheromones · Pearls · Thorax · Scrambler) | These are BP083/BP084 disclosures already in PROV_22 v02 Claim Groups 1-27. Not new. Cited as prior context only. |
| NOIDs (Noble Order of Idea Developers) | Branding and community identity construct. Not patentable. |
| Captain's Cue Card / Rosario Cue Card format | Marketing/outreach format, not an architectural system. The Cue Deck Card software system architecture is absorbed into CG34. |

---

## §2 · Claim Group 31 — MnemosyneC-as-Interface · Persistent Host · Continuity-Lift

### Innovation Area 38: Vendor-Resilient Persistent AI Interface Host

#### Background and Problem Statement

Current AI assistant architectures couple the user workspace to a specific vendor: users open Cursor, Claude.ai, ChatGPT, or another vendor-specific interface, and their workspace session — context, history, tool access, and state — is owned and persisted by that vendor. When the vendor's API is unavailable, when a subscription lapses, when an MCP server malfunctions, or when a new vendor offers superior capability, the user must migrate manually: export history, reconfigure tools, re-establish context, and begin a new session in a new environment. The workspace does not survive vendor churn. Continuity is the vendor's property, not the user's. This architectural coupling creates structural dependency on any single vendor, prevents seamless multi-vendor routing, and means that vendor-API instability directly breaks the user's working environment.

#### Summary of the Invention

Claim Group 31 discloses a vendor-resilient persistent AI interface host architecture in which a local application (MnemosyneC) serves as the persistent workspace and continuity layer for a user's AI-assisted work, while AI vendor services (Claude, GPT, Gemini, Llama, local models, or others) are treated as interchangeable substrate workers routable by the host. User context, history, preferences, domain knowledge, and session state persist in the host application's local substrate (eblet store), not in any vendor's cloud. When one vendor becomes unavailable, the host routes equivalent work to an available vendor without workspace interruption. The second-order value claim (Continuity-Lift) is that the user's accumulated substrate knowledge compounds with every session regardless of vendor used, because knowledge is recorded in vendor-agnostic eblets rather than in any vendor's conversation history.

#### Detailed Description

**Claim 31.1 (independent) — Vendor-Resilient Persistent AI Host Architecture**

A system for persistent-host vendor-resilient artificial intelligence interface, comprising: a local application instance constituting a user's primary AI workspace; a local substrate store of vendor-agnostic knowledge records persisting user context, domain assignments, history, and preferences independent of any specific AI vendor; a vendor health monitor that polls registered AI vendor endpoints and maintains a current availability registry; a substrate worker routing layer that, upon receiving a user task, selects a healthy vendor from the availability registry, dispatches the task to the selected vendor via the substrate worker API, and records the task result in the local substrate store; and a continuity guarantee such that workspace state persists across vendor unavailability events without requiring user re-initialization, migration, or context re-establishment. (Source: `canon_mnemosynec_as_interface_persistent_host_vendor_resilient_bp085.eblet.md`; roadmap §1)

**Claim 31.2 (dependent on 31.1) — Persistent Active Memory Crown Jewel**

The system of Claim 31.1, wherein the local substrate store maintains a Persistent Active Memory record designated as the Crown Jewel, comprising: a current-session context summary updated after each task dispatch; a domain-assignment registry mapping subject domains to currently assigned AI substrate workers; a cross-vendor continuity record such that knowledge recorded during sessions using Vendor A is accessible and applicable during subsequent sessions using Vendor B; and a memory keyhole index enabling rapid context rehydration at session start without requiring vendor-side conversation history retrieval. (Source: roadmap §1, Task 73 crown-jewel memory canon)

**Claim 31.3 (dependent on 31.1) — Continuity-Lift Second-Order Value**

The system of Claim 31.1, wherein each task dispatched through the routing layer produces a substrate knowledge record that compounds the user's accumulated domain knowledge independently of which vendor performed the task, such that: the user's effective AI capability increases monotonically with usage regardless of vendor substitution events; and the departure or unavailability of any single vendor does not reduce the user's accumulated substrate knowledge, creating a continuity-lift property wherein the persistent host application provides compounding second-order value exceeding the first-order value of any single vendor session. (Source: Substrate Theorem BP061 extension; roadmap §1 "she IS the continuous host")

---

## §3 · Claim Group 32 — MedLab · Concoctions · Reins Assignment · Comptroller

### Innovation Area 39: Eblet-Stored Executable AI-Connection-Fix Recipe System

#### Background and Problem Statement

AI-assisted software environments suffer recurring classes of connection failures, configuration drift, authentication errors, and behavioral anomalies in AI substrate workers (MCP servers, API connections, agent orchestrators). Currently, practitioners diagnose and repair these failures by manual investigation each time they recur, with no persistent encoding of the diagnosis-and-repair procedure. When the same failure recurs in a different session, a different operator, or after a version update, the repair knowledge must be reconstructed from scratch. No existing system encodes AI-connection-fix procedures as executable, typed, versioned, peer-verifiable records that can be shared, improved, and run by any system instance encountering the same failure condition.

#### Summary of the Invention

Claim Group 32 discloses: (a) MedLab, a dedicated module within the persistent host application for storing, browsing, and executing AI-connection-fix recipes; (b) Concoctions, a typed-ingredient recipe schema defining trigger conditions, ingredients (classified as chocolates/configuration values, fruits/log evidence, cheeses/environment variable names), execution procedures, and ratify gates; (c) a Reins Assignment registry enabling the host application to dynamically assign AI domain authority to different substrate workers by subject domain; and (d) a Dedicated Sub-Agent One Role pattern instantiated as a Comptroller sub-agent assigned exclusively to financial catalog monitoring.

#### Detailed Description

**Claim 32.1 (independent) — MedLab Executable AI-Fix Recipe Module**

A system for eblet-stored executable AI-connection-fix recipes, comprising: a MedLab module within a persistent AI host application; a library of Concoction records, each Concoction comprising a machine-readable trigger condition defining the failure state that activates the recipe, a typed ingredient manifest classifying required inputs as configuration-value ingredients, log-evidence ingredients, or environment-variable-name ingredients, an ordered execution procedure defining discrete steps to resolve the failure condition, and a ratify gate defining an empirical success criterion that must be confirmed before the Concoction is marked as successfully applied; a Concoction browser interface enabling the host application to surface matching Concoctions when a failure condition is detected; and a Concoction execution audit log recording trigger event, applied Concoction identifier, ingredient values used, procedure steps completed, ratify gate outcome, and session timestamp. (Source: `canon_medlab_eblet_recipes_ai_connection_fixes_bp085.eblet.md`; `canon_concoctions_medlab_ingredients_recipe_anatomy_bp085.eblet.md`; roadmap §4)

**Claim 32.2 (dependent on 32.1) — Concoction Peer Contribution and Verification**

The system of Claim 32.1, wherein Concoction records are contributed by cooperative members via a Package Store submission pathway, and wherein each contributed Concoction undergoes adversarial verification by Code Breaker Guild members per the GOLD_REFINED_BY_FIRE tier progression of Claim Group 29 before the Concoction is designated as trusted for automatic execution; such that the Concoction library compounds in accuracy and coverage as the cooperative membership grows, and members earn cooperative Marks denominations for contributing and adversarially verifying Concoctions. (Source: roadmap §4; composition with Code Breakers CG29)

**Claim 32.3 (independent) — Reins Assignment Per-Category Dynamic AI Domain Registry**

A method for dynamic artificial intelligence domain assignment in a persistent AI host application, comprising: maintaining a Reins Registry comprising records each associating a subject domain with an assigned AI substrate worker, a ratify gate defining criteria for valid assignment, and a timestamp of last assignment; upon initiating a task belonging to a registered domain, routing the task to the domain's currently assigned substrate worker rather than to a default worker; recording the outcome of each domain task as a substrate eblet associated with the domain assignment; and upon reassigning a domain to a new substrate worker, logging the prior holder, the reassignment timestamp, and a rationale note, such that domain expertise accumulated in prior assignments remains accessible in the substrate store irrespective of which substrate worker currently holds the domain assignment. (Source: `canon_mnemosynec_assigns_reins_per_category_bp085.eblet.md`; roadmap §6)

**Claim 32.4 (dependent on 32.3) — Dedicated Sub-Agent One Role · Comptroller Pattern**

The method of Claim 32.3, wherein a substrate worker is instantiated as a Dedicated Sub-Agent assigned exclusively to one persistent domain role, the Comptroller role comprising: periodic polling of an external financial catalog API to retrieve current product and pricing records; comparison of the retrieved records against a prior-state catalog eblet to produce a delta report identifying created, modified, or archived items; generation of an escalation notification upon detection of any delta; and dispatch of the delta report to the host application's session-start report queue; wherein the Comptroller sub-agent does not retain or transmit financial API credential values, references environment variable names only, and operates within the zero-credential-exposure discipline of the persistent host's secrets-handling canon. (Source: `canon_dedicated_sub_agent_one_role_comptroller_pattern_bp085.eblet.md`; roadmap §7)

---

## §4 · Claim Group 33 — NetLinkWebNode · MIC · Consult-Don't-Rent

### Innovation Area 40: Consent-Based Peer AI-Connection Borrowing with Marks Settlement

#### Background and Problem Statement

Individual users of AI-assisted applications may have their AI vendor subscriptions expire, have API credits exhausted, or experience localized vendor outages while neighboring nodes in a peer cooperative mesh have active, healthy vendor connections. No existing system enables cooperative-class peer-to-peer borrowing of AI vendor access with explicit user consent, usage-metered Marks settlement, and accountability through cooperative governance. Similarly, no existing AI routing architecture distinguishes between task classes suitable for free local models and task classes requiring premium vendor capability, and no existing system enforces a default-to-cheapest-capable model selection with escalation-delta disclosure as a cooperative-class norm.

#### Summary of the Invention

Claim Group 33 discloses: (a) NetLinkWebNode, a cooperative peer AI-connection lending-and-borrowing architecture; (b) Mesh Interconnect Coordinator (MIC), an election algorithm selecting the highest-reputation active node to coordinate peer cluster requests; and (c) "Consult, don't Rent" task-class routing, enforcing default-to-cheapest-capable model selection with per-escalation cost-delta disclosure.

#### Detailed Description

**Claim 33.1 (independent) — Peer AI-Connection Borrowing · NetLinkWebNode**

A system for consent-based peer artificial intelligence connection lending and borrowing within a cooperative node mesh, comprising: a Constellation Switchboard maintaining peer node presence records including connection health state for each registered node; a connection-lending consent interface through which a node operator may designate their active AI vendor connections as available for cooperative peer borrowing; a borrowing request pathway through which a node lacking a healthy vendor connection may request temporary access to a consenting lender node's connection; a usage metering component recording connection-borrowing events with duration and task count attributed to the borrowing node; and a Marks settlement layer crediting the lending node and debiting the borrowing node in cooperative Marks denominations proportional to measured usage, such that AI vendor access is redistributed within the cooperative mesh according to member consent and settled through the cooperative's three-currency economy without requiring the lender to expose vendor API credential values to the borrower. (Source: `canon_netlinkwebnode_mic_vendor_resilient_peer_cluster_bp085.eblet.md`; roadmap §3 v0.7.x)

**Claim 33.2 (dependent on 33.1) — Mesh Interconnect Coordinator Election Algorithm**

The system of Claim 33.1, further comprising a Mesh Interconnect Coordinator (MIC) election algorithm that: among all nodes in the active state within the Constellation Switchboard, selects the node having the highest reputation-weighted Marks balance as the cluster coordinator; assigns the coordinator responsibility for routing peer connection-borrowing requests to available lending nodes; reelects a new coordinator upon coordinator node departure or state change to inactive; and records each coordinator election event as a substrate eblet with node identifier, election timestamp, reputation score at election, and predecessor coordinator identifier. (Source: `canon_netlinkwebnode_mic_vendor_resilient_peer_cluster_bp085.eblet.md`; roadmap §3 v1.0)

**Claim 33.3 (independent) — Consult-Don't-Rent Task-Class AI Cost Routing**

A method for task-class-based artificial intelligence model selection in a persistent AI host application, comprising: maintaining a task-class routing table associating task categories with a minimum-capable model tier selected from at minimum a free-local-model tier and a premium-vendor tier; upon receiving a user task, classifying the task into a task class and selecting the minimum-capable tier from the routing table; dispatching the task to a model in the selected tier; recording a per-task cost receipt comprising the task class, model selected, and a cost delta expressing the difference between the selected model's cost and the next-tier premium model's cost; accumulating cost receipts into a running session total visible to the user throughout the session; and requiring a demonstrated-insufficiency event or explicit user override before escalating a task to a higher-cost tier, wherein escalation generates an escalation-delta disclosure stating the incremental cost and machine-generated rationale, composing with the Unseen Tax anti-pattern disclosure of Claim Group 30. (Source: `canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085.eblet.md`; roadmap §8)

---

## §5 · Claim Group 34 — Many Doors One Cooperative · Cue Deck Card System

### Innovation Area 41: Multi-Entrance Unified Membership Architecture with Personalized Cue Deck Cards

#### Background and Problem Statement

Cooperative and platform membership systems typically present a single enrollment pathway: a homepage, a single sign-up form, or a single product page. Users who enter the cooperative through different social channels, invitation sources, community events, or domain-specific landing pages encounter the same generic enrollment experience regardless of context. No existing cooperative membership system enables: (a) an arbitrary number of distinct entrance pathways, each presenting domain-specific value propositions, personalized invitations, and contextually appropriate membership framing; (b) attribution of member enrollment to the specific entrance pathway and inviting member; and (c) unification of all members enrolled through any entrance into a single cooperative membership with identical rights, governance access, and cooperative economics, such that the diversity of entrances strengthens rather than fragments the cooperative's membership base.

#### Summary of the Invention

Claim Group 34 discloses: (a) Many Doors One Cooperative, an architectural pattern enabling an unbounded set of entrance pathways to a single cooperative membership; (b) the Cue Deck Card system, a per-person or per-role personalized shareable invitation card encoding a domain-specific value proposition, journey fork, and attribution identifier; and (c) a Captain's Ship Wheel orchestrator pattern enabling node captains to manage their Door's enrollment journey and member roster while remaining within the cooperative's unified governance structure.

#### Detailed Description

**Claim 34.1 (independent) — Many Doors One Cooperative Multi-Entrance Membership Architecture**

A system for multi-entrance unified cooperative membership, comprising: a cooperative membership platform defining a single canonical membership class with uniform rights including governance participation, cooperative economics, and substrate access; an entrance pathway registry storing an unbounded set of named entrance pathways, each pathway comprising a domain-specific value proposition, a contextually adapted membership framing, an optional inviting-member attribution identifier, and a journey-fork configuration defining the enrollment sequence presented to prospective members arriving at that pathway; a membership enrollment processor that, upon a prospective member completing enrollment through any registered pathway, creates a single canonical cooperative membership record irrespective of which entrance pathway was used; and an attribution ledger recording the entrance pathway identifier and inviting-member identifier associated with each enrolled member, wherein attribution persists permanently in the member record and qualifies the inviting member for cooperative Marks earnings as defined by the cooperative's attribution economy. (Source: roadmap §3 composition; Cue Deck Card system; Many Doors One Cooperative canon)

**Claim 34.2 (dependent on 34.1) — Cue Deck Card Personalized Invitation System**

The system of Claim 34.1, wherein each entrance pathway is associated with a Cue Deck Card record comprising: a recipient identifier or role designation; a personal message composed by the inviting member or cooperative administrator; a value-proposition narrative adapted to the recipient's domain context, geographic context, or demonstrated need; one or more journey-fork options presented to the recipient enabling selection of a cooperative initiative aligned with the recipient's context; a unique short-code or URL resolving to the entrance pathway; and a share configuration specifying language, sender attribution, and journey-fork set; such that a prospective member receiving a Cue Deck Card encounters a cooperative membership invitation that references their specific context, names their qualification as a community asset rather than a credential, and routes them to the most contextually relevant cooperative initiative. (Source: Cue Deck Card system `cue_card_system.sql`; Captain First Node Cue Card B107; roadmap §3)

**Claim 34.3 (dependent on 34.1) — Captain's Ship Wheel Node Orchestrator Pattern**

The system of Claim 34.1, wherein a node captain role is defined as a cooperative member who: manages one or more entrance pathways associated with a geographic node or domain-specific initiative; views a node dashboard displaying enrolled members, active journey forks, and attribution earnings; earns Captain Marks denominations for each member enrolled through pathways they manage; holds a permanent governance seat in the node's local governance upon the node reaching a defined membership threshold; and operates within the cooperative's unified bylaws without requiring a separate legal entity, cooperative charter, or fee structure, such that the Captain's authority is architecturally scoped to their node's entrance pathways while their members' cooperative rights are governed by the platform's unified membership class. (Source: roadmap §3; Captain First Node architecture B107; Many Doors One Cooperative canon)

---

## §5b · Claim Group 35 — Hexadecimal Machine Code · AI-to-AI Compact Wire Format

### Innovation Area 42: Vendor-Resilient Compact Wire Format for Substrate Worker Dispatch

#### Background and Problem Statement

Current AI orchestration systems dispatch tasks to AI substrate workers (agent sub-processes, API-backed workers, or local models) using natural-language prompts formatted in markdown or structured JSON. Both formats carry significant overhead: markdown includes human-legibility formatting characters that serve no machine-parse function; JSON is verbose in key-name repetition and nesting. Neither format is designed to be vendor-agnostic at the encoding layer — both carry implicit assumptions about the dispatcher's prompt-engineering conventions, and both require the receiving model to parse human-language structure before extracting the task parameters. No existing AI orchestration system defines a compact, hexadecimal-encoded wire format for AI-to-AI task dispatch in which the frame structure is designed for programmatic decode rather than human readability, with human-readable overlays generated separately for logging and audit purposes.

#### Summary of the Invention

Claim Group 35 discloses a Hexadecimal Machine Code wire format for dispatch of tasks from a persistent AI host application (MnemosyneC) to Callable Substrate Workers (Bishop, Knight, Rook, Pawn, or any AI substrate worker assigned reins by the host). The format is: (a) compact — significantly smaller payload than equivalent markdown or JSON task prompts; (b) vendor-resilient — the frame structure carries no markdown-flavored encoding assumptions and is decodable by any substrate worker receiving the format specification; (c) machine-readable-first — frame fields are structured for programmatic parse with human-readable overlays generated on demand for logging and audit; and (d) composable with the existing Stitchpunk Sock Puppet Speak (SSPS) wire-format protocol, serving as the binary encoding substrate for SSPS frames.

#### Detailed Description

**Claim 35.1 (independent) — Hexadecimal Machine Code Compact Dispatch Frame**

A system for compact vendor-resilient artificial intelligence substrate worker dispatch, comprising: a persistent AI host application maintaining a registry of active Callable Substrate Workers each identified by a role designator and a connection endpoint; a Hexadecimal Machine Code frame encoder that, upon receiving a task from the host application's orchestration layer, produces a compact binary-encoded dispatch frame comprising: a fixed-width frame header encoding the source host identifier, target substrate worker role designator, task class identifier, and a frame sequence number in hexadecimal notation; a variable-length task payload field encoding task parameters in a typed schema defined by the task class; a ratify-gate field specifying the empirical success criterion the substrate worker must confirm upon task completion; and a frame checksum field; a frame decoder in each registered substrate worker that resolves the frame header to the worker's assigned task handler, extracts typed task parameters from the payload field, and returns a response frame in the same compact encoding; and a human-readable overlay generator that, upon request, renders the frame contents as structured log text for audit purposes without requiring that the transmission format itself be human-readable. (Source: Founder direct BP085 session c9afad17; `canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085.eblet.md`)

**Claim 35.2 (dependent on 35.1) — SSPS Encoding Substrate Composition**

The system of Claim 35.1, wherein the Hexadecimal Machine Code frame format serves as the binary encoding substrate for the Stitchpunk Sock Puppet Speak (SSPS) wire-format protocol, such that: SSPS defines the schema of task-dispatch messages exchanged between cooperative substrate workers; and Hexadecimal Machine Code provides the compact binary encoding of those messages, replacing the verbose markdown encoding used in prior SSPS versions; wherein the combination of SSPS schema and Hexadecimal Machine Code encoding produces a dispatch protocol that is simultaneously schema-validated (SSPS layer) and payload-compact (Hexadecimal Machine Code layer), reducing per-dispatch token consumption relative to markdown-formatted equivalents while maintaining full schema compatibility with the SSPS cooperative substrate worker communication standard. (Source: SSPS canon BP055; `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085.eblet.md`; Founder direct BP085)

**Claim 35.3 (dependent on 35.1) — Substrate Address Composition via Hexadecimal Coordinate Space**

The system of Claim 35.1, wherein the frame header's target substrate worker role designator is resolved through a hexadecimal coordinate address drawn from the Soccerball DAG addressing space, comprising nine hexadecimal digits per coordinate face, such that: each registered substrate worker is assigned a unique Soccerball DAG coordinate as its persistent network address; the dispatch frame header encodes the target address in the same hexadecimal digit vocabulary used throughout the cooperative substrate's peer-to-peer mesh routing layer; and the frame's source identifier similarly encodes the dispatching host's Soccerball DAG address, enabling end-to-end traceability of dispatch frames through the cooperative mesh without requiring a separate address translation layer. (Source: Soccerball DAG recursive substrate addressing BP060; `canon_pocket_universe_soccerball_dag_recursive_substrate_addressing_bp060.eblet.md`; Founder direct BP085)

---

## §5c · Claim Group 36 — Hot-Swappable Cognitive Core · Vendor-Resilient AI Orchestrator

### Innovation Area 43: Pluggable Cognitive Core Interface for Persistent AI Orchestrator

#### Background and Problem Statement

Current AI orchestrator architectures couple the orchestrator's reasoning capability to a specific vendor's model: MnemosyneC, AutoGPT, or similar persistent-host applications are built against one AI API and depend on that vendor's availability, pricing, terms of service, and API stability for their own core reasoning function. When the vendor changes pricing, modifies or deprecates their API, experiences sustained outage, or is acquired, the orchestrator itself is compromised — not merely a worker it delegates to, but the orchestrator's own cognitive function. No existing persistent AI host architecture defines a formal Cognitive Core Interface (CCI) contract enabling the orchestrator's own reasoning engine to be substituted at runtime — per task, per session, or mid-session — with full state preservation via substrate re-weave, such that the user experiences no continuity loss when the orchestrator switches from one AI vendor's model to another.

#### Summary of the Invention

Claim Group 36 discloses a hot-swappable cognitive core architecture for a vendor-resilient persistent AI orchestrator (MnemosyneC). The innovation comprises: (a) a formal Cognitive Core Interface (CCI) contract specifying the minimum capability any AI reasoning engine must satisfy to serve as the orchestrator's cognitive core; (b) a Brain Registry cataloging available cognitive cores with per-vendor adapter shims, capability metadata, and runtime health state; (c) a substrate-re-weave state preservation mechanism enabling mid-session cognitive core substitution with no continuity loss to the user; and (d) per-task and per-session swap policies routing cognitive core selection through the cost-routing discipline of "Consult, don't Rent." The orchestrator's chassis (persistent host, substrate store, tool integrations) persists independently of which AI vendor's model currently serves as the cognitive core.

#### Detailed Description

**Claim 36.1 (independent) — Method for Hot-Swap of Cognitive Core with State Preservation via Substrate Re-Weave**

A method for hot-swapping the cognitive core of a persistent AI orchestrator application with full session-state preservation, comprising: maintaining a substrate state store comprising vendor-agnostic knowledge records (eblets) encoding the orchestrator's current session context, domain assignments, task history, and user preferences independently of any AI vendor's conversation history or session state; receiving a cognitive core swap instruction specifying a target AI vendor or model from a Brain Registry; serializing the current session state by executing a substrate re-weave operation that produces a context snapshot from the substrate state store sufficient to rehydrate the incoming cognitive core to equivalent session awareness; deactivating the outgoing cognitive core's connection; activating an adapter shim for the incoming cognitive core's vendor API; dispatching the serialized context snapshot to the incoming cognitive core via the adapter shim to rehydrate session context; and resuming orchestrator operation with the incoming cognitive core such that the user session continues without interruption, context loss, or re-initialization requirement, wherein the user's accumulated substrate knowledge remains intact because it resides in the substrate state store rather than in any vendor's conversation history. (Source: Founder direct BP085; `canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085.eblet.md`; composes with Substrace Theorem BP061)

**Claim 36.2 (dependent on 36.1) — Cognitive Core Interface Contract Specification**

The method of Claim 36.1, wherein the Brain Registry qualifies cognitive core candidates against a Cognitive Core Interface (CCI) contract comprising: an input wire format requirement specifying that the cognitive core must accept structured task dispatch frames in the compact encoding defined by the Hexadecimal Machine Code wire format of Claim Group 35, or an equivalent vendor-agnostic structured format; an output wire format requirement specifying that the cognitive core must return structured response frames with ratify-gate confirmation fields; a tool-calling capability requirement specifying that the cognitive core must support the cooperative's MCP tool-calling standard enabling the cognitive core to invoke registered substrate tools; a declared minimum context window sufficient to receive and process a full substrate re-weave context snapshot without truncation; and a swap eligibility declaration indicating whether the cognitive core supports hot-swap mid-session participation; wherein only cognitive cores satisfying all CCI contract requirements are eligible for inclusion in the Brain Registry and selection for cognitive core dispatch, such that the CCI contract enforces vendor-agnostic interoperability at the orchestrator's cognitive layer. (Source: `canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085.eblet.md`; composes with `canon_hexadecimal_machine_code_mnemosynec_wire_format_consolidation_bp085.eblet.md` CG35)

**Claim 36.3 (dependent on 36.1) — Per-Task and Per-Session Swap Policy with Cost Routing per Consult-Don't-Rent**

The method of Claim 36.1, wherein cognitive core swap instructions are generated by one of: (a) a per-task swap policy that classifies each incoming task against a task-class routing table and selects the minimum-capable cognitive core tier sufficient for the task class, consistent with the Consult-Don't-Rent routing discipline of Claim 33.3, restoring the prior cognitive core upon task completion; (b) a per-session swap policy declared at session open by the user or by a rotation policy defined in the orchestrator's configuration, wherein the selected cognitive core persists for the session duration; or (c) a direct user instruction issued mid-session naming a specific cognitive core or vendor; and wherein each cognitive core swap event generates a cost-delta disclosure record stating the incoming cognitive core's per-task cost, the delta relative to the prior cognitive core's cost for equivalent tasks, and the user-visible rationale for the swap, composing with the Unseen Tax anti-pattern disclosure discipline of Claim Group 30, such that the user maintains full visibility into per-swap cost implications without requiring that such visibility be sought in application settings. (Source: `canon_mnemo_brain_swap_pluggable_cognitive_core_hot_swappable_bp085.eblet.md`; composes with `canon_consult_ai_flagships_dont_rent_the_c40_aircraft_bp085.eblet.md` CG33.3; composes with Unseen Tax CG30)

---

## §6 · Estimated Page Count + Integration Notes

### Page Count Estimate

| Section | Estimated word count | Estimated pages (USPTO ~250 words/page) |
|---------|---------------------|----------------------------------------|
| §1 Threshing Inventory | ~650 words | ~2.5 pages |
| §2 Claim Group 31 (3 claims) | ~650 words | ~2.5 pages |
| §3 Claim Group 32 (4 claims) | ~800 words | ~3.5 pages |
| §4 Claim Group 33 (3 claims) | ~700 words | ~3.0 pages |
| §5 Claim Group 34 (3 claims) | ~650 words | ~2.5 pages |
| §5b Claim Group 35 (3 claims) | ~700 words | ~2.5 pages |
| §5c Claim Group 36 (3 claims) | ~700 words | ~2.5-3.0 pages |
| §6-§7 (this section + Founder gates) | ~400 words | ~1.5 pages |
| **Total addendum** | **~5,250 words** | **~19-20 pages** |

### Running PROV_22 Page Count

| Version | Status | Est. pages |
|---------|--------|-----------|
| v02 | On disk | ~50 pages |
| v03 (+ TIC, CG28) | BP084 · awaiting ratify | ~32 pages added → ~82 pages |
| v04 (+ Code Breakers + Unseen Tax, CG29-30) | BP084 · awaiting ratify | included in v03 estimate above |
| v05 (+ this addendum, CG31-36) | This document · awaiting ratify | ~19-20 pages added → **~101-102 pages** |

**~101-102 pages total after v05 integration — slightly over the 95-100 page target per BP083 canon, within filing tolerance. Richer claim set (36 claim groups, 19 new claims) is the correct tradeoff. Founder does NOT need to trim. USPTO fees are per-application, not per-page.**

### Integration Location in PROV_22

After Founder ratify, the integrating Knight (or Bishop) should:

1. Add a new section header after the v04 EXTENDED INNOVATIONS block:
   `## EXTENDED INNOVATIONS (v05 ADDITIONS — CLAIM GROUPS 31-35)`

2. Add five new SUMMARY OF THE INVENTION entries (items 38-42) after item 37 (Unseen Tax).

3. Add Claim Group 31-35 claim language to the CLAIMS section.

4. Add Figures 30-39 entries to BRIEF DESCRIPTION OF DRAWINGS (one block diagram per claim group; approximately 2 figures per group).

5. Update the version line to: `**Version:** v05 · Claim Groups 1-36 · June 2026`

6. Update the footer word count line with BP085 additions.

---

## §7 · Founder Ratify Gates

Founder must ratify each claim group independently before it integrates into PROV_22. Claim groups are independent — partial ratify is valid.

| Claim Group | Ratify question | Blocking issue if not ratified |
|-------------|-----------------|-------------------------------|
| **CG31** — MnemosyneC-as-Interface (Claims 31.1-31.3) | Does Claim 31.1 accurately describe the intended vendor-routing architecture? Does "continuity-lift" in Claim 31.3 match Founder's intended second-order value? | None — can integrate CG32-34 independently |
| **CG32** — MedLab · Concoctions · Reins · Comptroller (Claims 32.1-32.4) | Is the Concoction ingredient taxonomy (chocolates/fruits/cheeses) canonical or still evolving? Should the Comptroller claim reference Stripe explicitly or remain vendor-agnostic? | Ingredient taxonomy — if it changes post-filing, claim may not cover the implementation |
| **CG33** — NetLinkWebNode · MIC · Consult-Don't-Rent (Claims 33.1-33.3) | Legal review gate: has Founder confirmed that peer connection borrowing is not prohibited by vendor ToS of Claude/OpenAI/Google? Note: roadmap §3 explicitly defers this to post-1,000-signup legal review. Filing the claim is defensive; building it requires ToS clearance. | ToS review must occur before v0.7.x build regardless of patent filing |
| **CG34** — Many Doors One Cooperative · Cue Deck Card (Claims 34.1-34.3) | Does the Cue Deck Card claim language accurately reflect the existing `cue_card_system.sql` schema? Should "Captain's Ship Wheel" be the canonical name for Claim 34.3's orchestrator pattern? | Name canonization — "Captain's Ship Wheel" was the task-list term; Founder should confirm it is the intended canonical name |
| **CG35** — Hexadecimal Machine Code wire format (Claims 35.1-35.3) | **FOUNDER RATIFIED BP085.** (1) Hex encoding confirmed: compact binary serialization rendered as hex text (Founder direct). (2) SSPS (BP055) IS the underlying encoding for Hex Machine Code wire format — CONFIRMED. (3) Soccerball DAG hex-coordinate address space IS the canonical address layer — CONFIRMED. All three claims file as ratified. | None — all spec details confirmed. |
| **CG36** — Hot-Swappable Cognitive Core (Claims 36.1-36.3) | **FOUNDER RATIFIED BP085.** (1) CCI contract IS the canonical interface — CONFIRMED. (2) Per-task · per-session · mid-session swap policies all confirmed. (3) State preservation via substrate re-weave (Substrace Theorem BP061) — CONFIRMED canonical term. (4) Adapter shims for Claude · GPT · Gemini · Llama · Mistral · local Ollama — confirmed as v0.6.x scope. All three claims file as ratified. | None — all spec details confirmed. v0.6.x build scope noted. |

---

*PROV_22_BP085_THRESHING_ADDENDUM.md · BP085 · Sonnet 4.6 · 2026-06-17 · CG35 added 2026-06-17 by Hex Machine Code SEG · CG36 added 2026-06-17 by Brain-Swap SEG*
*FOUNDER RATIFY PENDING — DO NOT integrate until gates above are cleared*
*Pledge #2260: Defensive patent use only*
*BP085 BLOOD: No API or secret key values in this document*
*Truth-Always: All "system for" language used for v0.6.x+ roadmap items not yet operationally implemented*
