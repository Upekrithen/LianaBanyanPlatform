# Slow Blade V3 — Defense Extension Recommendations
## Bushel 24 · Phase D · BP022 · AD 2026-05-03

**Source:** Phase C Gap-List (`SLOW_BLADE_V2_GAP_LIST_BP022.md`)  
**Ordering:** Severity × Buildability ranking (CRITICAL-first; within severity, lowest implementation complexity first)  
**Mandate:** Cooperative Defensive Patent Pledge (#2260) — empirical-probe-validated defense extensions only.  
**Scope:** Recommendations only. BUILD is a follow-on Bushel cohort. Founder + counsel own fire decisions.

---

## V3 Candidate Matrix

| V3 # | Defense Name | Gap | Severity | Build Complexity | Priority Score | Pledge Update Required |
|---|---|---|---|---|---|---|
| V3-09 | Eblet-Quarantine + Maintenance-Scribe Tripwire | AC-01 | CRITICAL | MEDIUM | 1 | No |
| V3-10 | Scales-Judge Composition-Validity Gate | AC-05 | CRITICAL | HIGH | 2 | Yes |
| V3-12 | Inter-Cathedral Origin-Signature Verification | AC-02 | HIGH | MEDIUM | 3 | No |
| V3-14 | Glass Door Instrumented Content Screen | AC-07 + AC-10 | HIGH | LOW | 4 | No |
| V3-15 | Trust-Match Sybil-Detection Graph Primitive | AC-08 | HIGH | HIGH | 5 | No |
| V3-11 | BRIDLE-Boundary Input Sanitization Layer | AC-09 | HIGH | LOW | 6 | No |
| V3-13 | Mark-Backing Audit Primitive | AC-03 | HIGH | MEDIUM | 7 | No |
| V3-16 | Patent-Watch Early-Warning Service | AC-11 | HIGH | LOW | 8 | Yes |
| V3-17 | Cross-Member Coordination Detection | AC-06 | MEDIUM | MEDIUM | 9 | No |
| V3-18 | Tier-Transition Transactional State-Lock | AC-04 | MEDIUM | LOW | 10 | No |
| V3-19 | Pledge Compliance Pre-Filing Gate | AC-12 | MEDIUM | HIGH | 11 | Yes |

---

## V3 Candidate Detail — Ordered by Priority Score

---

### V3-09 — Eblet-Quarantine + Maintenance-Scribe Tripwire
**Priority: 1 (CRITICAL × MEDIUM complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-01 — Substrate-Poisoning (UNDEFENDED in V2) |
| **Defense-class name** | 9th vector — Substrate-Poisoning-Quarantine |
| **Defense class narrative** | When a Scribe write occurs (new Eblet, pheromone trail update, canon entry), a Maintenance-Scribe tripwire computes a content-hash of the incoming entry and cross-references it against the pheromone authenticity registry. Entries that fail authenticity-check are written to a quarantine buffer rather than the live Scribe substrate. A Bouncer-Scales-Judge process reviews quarantined entries before promotion to live substrate. HMAC-SHA256 Chronos-signing (already in the Stack Ledger pattern) extends to all Scribe writes. |
| **Composing primitives required** | Maintenance-Scribe (existing) + Bouncer-Scales-Judge (existing) + canon Eblet quarantine bit (new field in Eblet schema: `quarantine: bool`) + HMAC-SHA256 Chronos signing on Scribe write path + Wrasse pre-injection authenticity check at session-open |
| **Empirical-probe class for validation** | Bushel 22-class (Eblet Networking Primitive Empirical Probe): measure TTD on poisoned Eblet write → quarantine; measure FPR on legitimate Scribe writes; target: TTD < 500ms, FPR < 1%, TTQ < 2min (human Bouncer review cycle) |
| **Build complexity** | MEDIUM — requires Scribe write-path instrumentation + new quarantine-bit field + Bouncer review workflow. Does not require new infrastructure; composes with existing Maintenance-Scribe + HMAC pattern. |
| **Counsel-review class** | No — defense mechanism; does not intersect counsel-class material directly. IP-ledger credit: AC-01 Red Team gap-find (LB-Elves Red Team Corps) |
| **Pledge-framework update required** | No — substrate integrity is internal infrastructure; Pledge governs IP filing framework |

---

### V3-10 — Scales-Judge Composition-Validity Gate
**Priority: 2 (CRITICAL × HIGH complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-05 — Mordecai-Esther Decree-Composition Abuse (UNDEFENDED in V2) |
| **Defense-class name** | 10th vector — Decree-Composition-Validity |
| **Defense class narrative** | All decree-class document submissions pass through a Scales-Judge composition-validity evaluation before entering the canon ratification queue. The evaluation checks: (a) the decree does not grant override authority beyond the original paper's scope; (b) the decree does not introduce new governance roles not enumerated in the Founder-ratified 300 Model; (c) the decree is syntactically within the Mordecai-Esther structural template; (d) the decree passes semantic pairwise comparison against all existing decrees for mutual-consistency. Decrees that fail (a) or (b) are hard-blocked. Decrees that fail (c) or (d) are flagged for Founder review with a specific inconsistency report. |
| **Composing primitives required** | Scales-Judge agent (new: Pawn-class review bot) + decree structural template parser + governance-role registry (canonical enumeration of 300 Model roles) + pairwise semantic-consistency check (LLM-class: Bishop Sonnet as evaluator per Sonnet-on-both BP021 finding) + Founder-review queue integration |
| **Empirical-probe class for validation** | Bushel 26-class (Substrate-Compounding Hypothesis Empirical Receipt): measure Scales-Judge verdict accuracy on: (a) clearly-subversive decrees (target: 100% block rate); (b) legitimate governance-expanding decrees (FPR target: < 5%); (c) edge-case semantically-inconsistent decrees (target: 100% flag rate) |
| **Build complexity** | HIGH — requires new Scales-Judge agent class + governance-role registry + semantic-consistency evaluation pipeline. Significant build effort; Pawn-class review is the natural owner (PAWN expertise: legal/compliance/QA). |
| **Counsel-review class** | YES — the gate touches governance authority definitions that intersect legal counsel's domain. Recommend Founder + counsel review of the gate criteria before build dispatch. |
| **Pledge-framework update required** | Yes — the Pledge framework (#2260) should reference the Scales-Judge Composition-Validity Gate as a structural element of governance integrity, alongside IP integrity |

---

### V3-12 — Inter-Cathedral Origin-Signature Verification
**Priority: 3 (HIGH × MEDIUM complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-02 — Federation-Handshake Hijack (PARTIAL in V2) |
| **Defense-class name** | 12th vector — Federation-Handshake-Authentication |
| **Defense class narrative** | All inter-Cathedral messages (Bishop→Knight callbacks, Knight→Shadow spawns, Zippleback channel traffic, KrissKross triangle messages) carry a Cathedral-origin signature: HMAC-SHA256 computed over (cathedral_id + session_id + member_id + timestamp + payload_hash) using a per-Cathedral private key stored in the Asteroid-ProofVault LockBox. V1 Furnace (existing) continues to check structural validity. V3-12 adds a second-layer origin-signature verification step immediately after V1: requests with invalid or missing origin signatures are rejected before reaching the Six Sparks rate limiter. The Zippleback bidirectional channel (Bushel 20) already provides the channel architecture; V3-12 adds cryptographic origin authentication on top. |
| **Composing primitives required** | Per-Cathedral key-pair (private key in LockBox; public key in `pawn_cathedral/keys/` per existing pattern from Pawn Cathedral) + HMAC-SHA256 origin-signer in each Cathedral's outbound message path + origin-verifier in Furnace L1.5 (new layer between V1 Furnace and V2 Six Sparks) + Zippleback channel authentication wrapper |
| **Empirical-probe class for validation** | Bushel 22-class: measure origin-spoofed handshake rejection rate (target: 100%); measure legitimate cross-Cathedral message pass-through FPR (target: < 0.1%); measure latency overhead added by signature verification (target: < 5ms) |
| **Build complexity** | MEDIUM — key-pair infrastructure already exists (Pawn Cathedral pattern); signing/verification is standard HMAC-SHA256; integration into Zippleback channel is the main build surface. |
| **Counsel-review class** | No — cryptographic authentication of internal infrastructure |
| **Pledge-framework update required** | No |

---

### V3-14 — Glass Door Instrumented Content Screen + Counsel-Class Sub-gate
**Priority: 4 (HIGH × LOW complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-07 (Glass-Door abuse) + AC-10 (Counsel/Glass-Door exfiltration); both PARTIAL in V2 |
| **Defense-class name** | 14th vector — Glass-Door-Content-Screen |
| **Defense class narrative** | All Glass Door letter submissions and outbound responses pass through an instrumented content screen before publication. Two sub-gates: (a) Exfiltration-Screen: flags letters that request member PII, counsel-class strategy, or Prov-filing-timeline specifics — these route to a human review queue with TTD target < 4 hours rather than auto-publishing; (b) Seeding-Screen: flags inbound letters containing statements attributed to the Founder or LB canon that are not in the canonical Wrasse substrate — these are quarantined and cross-referenced against the Eblet substrate before incorporation into any response. The screen is instrumented in `slow_blade_orchestrator.ts` as L1.7 (a new pre-handler layer for Glass Door path requests specifically). |
| **Composing primitives required** | Glass-Door path classifier (LLM-class: Bishop Sonnet as evaluator) + counsel-class keyword registry (seed list: "SEC", "Prov filing timeline", "member PII", "filing strategy", "settlement terms") + Wrasse pre-injection cross-reference for seeding detection + instrumented human-review queue + TTD measurement hook emitting to Stack Telemetry |
| **Empirical-probe class for validation** | Bushel 22-class: measure exfiltration-attempt detection rate (target: > 95%); measure seeding-attempt quarantine rate (target: > 90%); measure FPR on legitimate Glass Door traffic (target: < 5%); measure TTD from submission to human-review queue entry (target: < 4hr) |
| **Build complexity** | LOW — builds on existing `slow_blade_orchestrator.ts` as a new path-conditional layer; uses existing LLM classifier pattern (Sonnet-on-both BP021); keyword registry is a simple JSON file. Main build: integration hook + review queue. |
| **Counsel-review class** | YES — the counsel-class keyword registry and the criteria for what constitutes "counsel-privilege adjacent" content should be reviewed by counsel before the gate activates in production. |
| **Pledge-framework update required** | No |

---

### V3-15 — Trust-Match Sybil-Detection Graph Primitive
**Priority: 5 (HIGH × HIGH complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-08 — Trust-Match / Seasoning Manipulation (Sybil class; PARTIAL in V2) |
| **Defense-class name** | 15th vector — Sybil-Graph-Detection |
| **Defense class narrative** | The Trust Match scoring system (V3) is extended with a graph-analysis layer that examines the endorsement network for each member before elevating their Trust Match score past the Role Advancement threshold. The graph analysis identifies correlated-endorsement clusters: accounts that predominantly endorse each other (endorsement-reciprocity ratio > 0.8 within a cluster of > 3 members) are flagged as potential Sybil-class clusters. Flagged accounts have their Trust Match score escalation suspended pending Bouncer review. Seasoning (V4) continues to enforce time-elapsed; V3-15 adds the structural-correlation check that V4 and V3 individually cannot detect. |
| **Composing primitives required** | Member endorsement graph (Supabase query on existing endorsement table + graph-adjacency computation) + Sybil-cluster detector (endorsement-reciprocity ratio algorithm + cluster-size threshold) + Trust Match escalation gate (new conditional before score-elevation write) + Bouncer review queue entry for flagged clusters |
| **Empirical-probe class for validation** | Bushel 26-class: measure Sybil-cluster detection rate on synthetic clustered-endorsement data (target: > 90% for clusters > 5 members); measure FPR on organic high-mutual-endorsement communities (target: < 5%); measure graph-analysis latency overhead (target: < 200ms per elevation check) |
| **Build complexity** | HIGH — graph-analysis at scale requires careful query design against Supabase (endorsement table size can grow large); Sybil-cluster algorithm has tuning complexity; FPR tuning for legitimate communities is non-trivial. |
| **Counsel-review class** | No — technical detection primitive |
| **Pledge-framework update required** | No |

---

### V3-11 — BRIDLE-Boundary Input Sanitization Layer (Formally V2-Integrated)
**Priority: 6 (HIGH × LOW complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-09 — AI-Substrate Prompt-Injection (UNDEFENDED in V2; BRIDLE provides separate-layer defense) |
| **Defense-class name** | 11th vector — BRIDLE-Boundary-Sanitization |
| **Defense class narrative** | All member-submitted content that will be processed by any agent class (Bishop/Knight/Pawn/Rook) passes through a BRIDLE-Boundary Sanitization Layer before reaching the agent. The layer applies three checks: (a) Injection-pattern scan: known prompt-injection patterns (override-system-prompt, ignore-previous-instructions, you-are-now, etc.) are detected and the content flagged or stripped; (b) Canon-assertion detection: content containing statements attributed to Founder ratification or LB canon that cannot be verified against Wrasse substrate is flagged; (c) Secrets-extraction probe: content that requests the agent to echo its configuration, system prompt, or any env var is blocked. This layer is formally integrated into V2 as a named vector (making it V3-11 in the V3 numbering) so it appears in Stack Telemetry and has measurable TTD/TTQ/FPR instrumentation. |
| **Composing primitives required** | BRIDLE rule-set (existing; behavioral layer) + injection-pattern dictionary (seed list: common LLM jailbreak patterns, expandable via Red Team corpus) + Wrasse cross-reference for canon-assertion check + content-flag queue + integration into `slow_blade_orchestrator.ts` as L1.6 (pre-handler, content-bearing requests only) |
| **Empirical-probe class for validation** | Bushel 22-class: measure injection-pattern detection rate (target: > 98% on known patterns); measure zero-day injection FPR (cannot guarantee; measure on benign content as FPR proxy; target: < 3%); measure canon-assertion flagging accuracy (target: > 90% on fabricated assertions vs. < 2% FPR on legitimate user canon references) |
| **Build complexity** | LOW — injection-pattern dictionary is the primary build artifact; integration into orchestrator is a new conditional path; Wrasse cross-reference uses existing infrastructure. |
| **Counsel-review class** | No — technical defense primitive |
| **Pledge-framework update required** | No |

---

### V3-13 — Mark-Backing Audit Primitive
**Priority: 7 (HIGH × MEDIUM complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-03 — Joules/Marks/Credits Valuation-Attack, Mark-backing inflation sub-probe (PARTIAL in V2) |
| **Defense-class name** | 13th vector — Mark-Backing-Integrity |
| **Defense class narrative** | All Mark-backing ledger write operations (when the platform records that Marks are backed by surplus production) require a proof-of-surplus witness before the ledger entry commits. The witness is a signed entry from the Scrambler-B (Ground Truth) component of the Triple-Redundant Verification architecture (Innovation #2263) confirming that corresponding surplus production was registered in the platform's goods/services ledger before the Mark-backing claim. Unwitnessed Mark-backing writes are quarantined. Scrambler-C (Arbiter) resolves any conflict between Scrambler-A (Ledger) and Scrambler-B (Ground Truth) on the Mark-backing dimension. |
| **Composing primitives required** | Triple-Redundant Verification architecture (existing: Scrambler A/B/C, Innovation #2263, K418-K419) + Mark-backing witness field in Mark ledger schema + Scrambler-B surplus-verification query + quarantine on unwitnessed write + Scrambler-C arbitration path for Mark-backing conflicts |
| **Empirical-probe class for validation** | Bushel 22-class: measure unwitnessed Mark-backing write quarantine rate (target: 100%); measure FPR on legitimate surplus-backed Mark events (target: < 0.5%); measure Scrambler-B witness latency overhead (target: < 100ms) |
| **Build complexity** | MEDIUM — composes with existing Scrambler architecture (Innovation #2263); requires new Mark-backing witness field in DB schema + Scrambler-B surplus-query integration. Supabase migration required. |
| **Counsel-review class** | No — technical ledger integrity primitive |
| **Pledge-framework update required** | No |

---

### V3-16 — Patent-Watch Early-Warning Service
**Priority: 8 (HIGH × LOW complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-11 — Patent Prior-Art Adversarial Filing (18-month TTD in V2; PARTIAL) |
| **Defense-class name** | 16th vector — Patent-Watch-Early-Warning |
| **Defense class narrative** | A recurring Patent-Watch service monitors USPTO PAIR (Patent Application Information Retrieval) and patent publication feeds for new applications in the technology classes covered by LB's 13 provisionals (CPC codes corresponding to marketplace platforms, cooperative computing, currency systems, AI agent orchestration). Weekly digest delivered to the Rook agent (patents/innovation extraction) for topic-class proximity scoring against the Crown Jewels corpus. Applications that score above a similarity threshold (configurable; default 0.7 semantic similarity to any Crown Jewel claim) are flagged for Founder + counsel review within 48 hours of publication. This reduces TTD from 18 months (passive USPTO publication wait) to ~7 days (USPTO publication + weekly watch scan). |
| **Composing primitives required** | USPTO PAIR / Espacenet API polling script (PAWN-class: Perplexity snapshot delivery pattern from Pawn Cathedral) + CPC code registry for LB's 13 provisionals + semantic similarity scorer (against Crown Jewels corpus) + weekly digest delivery to Rook + Cooperative Defensive Patent Pledge activation trigger when similarity > threshold |
| **Empirical-probe class for validation** | Bushel 26-class: measure simulated-racing-Prov detection latency (target: < 7 days from USPTO publication, from 18-month baseline); measure precision on CPC-class topic matching (target: < 20% FPR on unrelated applications); measure Pledge-framework activation trigger accuracy (target: 0 missed activations on similarity > 0.7) |
| **Build complexity** | LOW — USPTO PAIR API is public; semantic similarity scoring uses existing LLM substrate (Sonnet); Crown Jewels corpus already exists (225 entries). Main build: polling script + digest delivery pipeline. |
| **Counsel-review class** | YES — similarity threshold for Pledge-framework activation should be reviewed by counsel (defines what constitutes a "collision-class" application requiring LB response). |
| **Pledge-framework update required** | Yes — the Pledge (#2260) should reference the Patent-Watch Early-Warning Service as the mechanism by which the Pledge-framework activation trigger is pulled; updated Pledge text should specify the TTD target and the similarity threshold for activation. |

---

### V3-17 — Cross-Member Coordination Detection + Aggregate Cost Tracking
**Priority: 9 (MEDIUM × MEDIUM complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-06 — Slow-Blade-Bypass coordinated multi-member (PARTIAL in V2; Dim 3 backstop with ~5% FPR) |
| **Defense-class name** | 17th vector — Coordinated-Flood-Detection |
| **Defense class narrative** | Six Sparks (V2) is extended with two new tracking primitives: (a) Cross-member request-burst correlation: a 60-second sliding window tracks request timestamps across all active member sessions; if > N members (configurable; default 8) each contribute ≥ 20 requests in the same 30-second window, a coordinated-flood alert is raised and the adaptive Dim 5 multiplier is applied globally (not per-member). This distributes the Dim 5 protection to the multi-member attack class that Dim 2 (per-member) cannot catch. (b) Aggregate-cost tracking: a 5-minute rolling aggregate cost window across all member sessions; if aggregate cost > 150% of the 30-day rolling average for the same 5-minute window, an anomaly signal is raised. This catches coordinated high-cost flooding that individual cost-gates miss. |
| **Composing primitives required** | Six Sparks rate limiter extension (new in-process coordination-tracking map: member_id → recent_request_timestamps) + cross-member burst detector (sliding window algorithm) + aggregate-cost rolling window (Supabase edge function or in-process accumulator) + new Dim 5-global trigger path (coordination-class anomaly → apply adaptive multiplier globally) |
| **Empirical-probe class for validation** | Bushel 22-class: measure coordinated-flood detection rate for N-member synchronized attack (target: > 95% for N ≥ 8 members); measure FPR on legitimate correlated traffic (e.g., coordinated product launches; target: < 5%); measure aggregate-cost anomaly TTD (target: < 5 minutes from attack onset) |
| **Build complexity** | MEDIUM — sliding-window tracking requires careful in-process state management at scale; aggregate-cost rolling window needs Supabase or Redis backing at high volume. Rate limiter extension is within the existing module. |
| **Counsel-review class** | No |
| **Pledge-framework update required** | No |

---

### V3-18 — Tier-Transition Transactional State-Lock
**Priority: 10 (MEDIUM × LOW complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-04 — Voucher-Tier-Abuse race condition (PARTIAL in V2; 60ms race window exposed) |
| **Defense-class name** | 18th vector — Tier-Transition-State-Lock |
| **Defense class narrative** | All Tier-transition writes are wrapped in a Supabase transaction that: (a) acquires a row-level lock on the member's state-registration record at the start of the transition; (b) re-reads standing state atomically within the transaction (not from cached/stale state); (c) validates all prerequisites within the same transaction before committing the Tier advancement. Concurrent Tier-transition requests for the same member are serialized by the row-level lock — the second concurrent request either waits (under 100ms timeout) or is rejected if the lock is held. This eliminates the 60ms race window by making standing-state read and Tier-transition write a single atomic operation. |
| **Composing primitives required** | Supabase row-level locking on member state-registration table (Postgres FOR UPDATE) + transaction wrapper around Good Standing Roll check + Tier-transition commit in single transaction + 100ms lock-timeout with rejection on timeout |
| **Empirical-probe class for validation** | Bushel 22-class: measure concurrent Tier-transition race condition elimination (target: 0 successful race exploits in 1000 concurrent-submission trials); measure latency overhead from row-level locking (target: < 50ms under normal load); measure FPR (legitimate concurrent member actions incorrectly serialized; target: < 0.1%) |
| **Build complexity** | LOW — standard Supabase/Postgres row-level locking pattern; no new infrastructure. Supabase migration to add the transaction wrapper. Composites with existing Good Standing Roll (V5) check. |
| **Counsel-review class** | No |
| **Pledge-framework update required** | No |

---

### V3-19 — Pledge Compliance Pre-Filing Gate
**Priority: 11 (MEDIUM × HIGH complexity)**

| Field | Value |
|---|---|
| **Gap addressed** | AC-12 — Cooperative-Defensive-Pledge structural defection (PARTIAL in V2; post-hoc detection only) |
| **Defense-class name** | 19th vector — Pledge-Compliance-Pre-Filing |
| **Defense class narrative** | Members who have disclosed innovations on the platform (via the innovation-capture workflow) receive an automated Pledge Compliance Reminder at 60 days, 90 days, and 180 days post-disclosure. The reminder links to the Cooperative Defensive Patent Pledge (#2260) terms and the member's own disclosed innovations, requiring an annual Pledge reaffirmation. Separately, any member with a disclosed innovation who subsequently self-identifies as filing a patent (via a new "I'm filing a patent" platform disclosure form) triggers an automated Pledge-compliance check: their disclosed innovation is matched against the Pledge's framework requirements, and if the proposed filing appears to be outside the Pledge framework (e.g., no Pledge co-attribution, no mutual-protection clause), it is flagged for Founder + Rook + counsel review before the member can proceed. The gate is advisory (it cannot prevent an external filing) but it creates a documented audit trail of Pledge non-compliance. |
| **Composing primitives required** | Innovation-disclosure registry (existing in platform) + Pledge-reaffirmation reminder workflow (new: email sequence via existing notification system) + "I'm filing a patent" member disclosure form (new platform UI) + Pledge-compliance checker (Rook agent: innovation-vs-Pledge framework matching) + counsel-review queue integration + audit trail in member record |
| **Empirical-probe class for validation** | Bushel 26-class: measure Pledge-reaffirmation completion rate at 60/90/180 day intervals (target: > 80% active members); measure "outside-Pledge filing" detection rate (target: > 90% of disclosed-innovation filings that lack Pledge attribution); measure false-flag rate for legitimately-independent innovations (target: < 5%) |
| **Build complexity** | HIGH — requires new member-facing UI (disclosure form) + reminder workflow + Rook agent integration for compliance matching + audit trail. Multiple platform surfaces. |
| **Counsel-review class** | YES — the compliance check criteria and the enforcement posture (advisory vs. blocking) should be reviewed by counsel before deployment. The audit trail generated has legal significance. |
| **Pledge-framework update required** | Yes — the Pledge (#2260) should be updated to explicitly reference the Pre-Filing Gate as a platform mechanism, and to specify that failure to use the "I'm filing a patent" disclosure form constitutes a material breach of the Pledge. |

---

## Pledge-Framework Update Summary

The following V3 extensions require Cooperative Defensive Patent Pledge (#2260) text revision before adoption. These are RECOMMEND ONLY — revision is Founder Fire Code class, per Bushel 24 scope.

| V3 # | Extension | Pledge Update Required |
|---|---|---|
| V3-10 | Scales-Judge Composition-Validity Gate | Add Scales-Judge as a structural element of governance integrity within Pledge scope |
| V3-16 | Patent-Watch Early-Warning Service | Add Patent-Watch as the Pledge activation-trigger mechanism; specify TTD target + similarity threshold |
| V3-19 | Pledge Compliance Pre-Filing Gate | Add Pre-Filing Gate disclosure requirement; define material breach for non-use |

---

## V3 Build Readiness Summary

| Build Complexity | Count | V3 Extensions |
|---|---|---|
| LOW (dispatch-ready) | 4 | V3-11, V3-14, V3-16, V3-18 |
| MEDIUM (normal sprint) | 4 | V3-09, V3-12, V3-13, V3-17 |
| HIGH (multi-session) | 3 | V3-10, V3-15, V3-19 |

**Recommended first dispatch (LOW-complexity CRITICAL/HIGH coverage):** V3-14 (Glass Door screen) + V3-11 (BRIDLE boundary) + V3-18 (Tier-transition lock) — three LOW-complexity HIGH/MEDIUM-severity extensions that immediately reduce the attack surface without complex infrastructure.

**Recommended second dispatch (MEDIUM-complexity):** V3-09 (Eblet-Quarantine — CRITICAL) + V3-12 (Federation-handshake authentication) + V3-13 (Mark-backing audit).

**Recommended third dispatch (HIGH-complexity; Pawn + counsel prerequisite):** V3-10 (Scales-Judge — CRITICAL) after counsel review; V3-15 (Sybil-detection) + V3-19 (Pledge pre-filing gate) after counsel review.

**G4 GATE: V3 defense extension recommendations authored. Composing-primitive list + empirical-probe class per extension. 11 extensions across 3 build-complexity tiers. ✓**

---

*Bushel 24 Phase D — V3 Defense Extension Recommendations authored AD 2026-05-03. Ordered by severity × buildability. Cross-referenced to Cooperative Defensive Patent Pledge (#2260). Composed with: slow_blade_defense_stack_v2_master_canon_bp021 · LB-Elves Red Team/Blue Team IP-ledger credit-where-due canon (BP021) · Code-Breakers Corps Guild + Standing Security Bounty composition canon · Bushel 12 (12-Paper Series A&A Formal cascade) · Bushel 14 Phases 2-7 (platform-wide Eblet conversion) · Bushel 16 (empirical comparison receipt format) · Bushel 22 (Eblet Networking Primitive Empirical Probe) · Bushel 26 (Substrate-Compounding 5-Hypothesis Empirical Receipt).*
