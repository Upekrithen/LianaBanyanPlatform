# Slow Blade V2 — Adversarial Probe Gap List
## Bushel 24 · Phase C · BP022 · AD 2026-05-03

**Source:** `BISHOP_DROPZONE/14_CanonicalReferences/BUSHEL_24_RED_TEAM_PROBE_FINDINGS.md` (Phase B)  
**Mandate:** Cooperative Defensive Patent Pledge (#2260) — defense-on-receipt, not defense-on-faith.  
**Severity Scale:** CRITICAL (member-fund or canon-integrity at risk) / HIGH (substrate-routing or federation integrity) / MEDIUM (UX or telemetry impact) / LOW (out-of-band)

---

## PRIORITY 1 — NOT DEFENDED (V3 must address)

### GAP-01 — Substrate-Poisoning (AC-01)
| Field | Value |
|---|---|
| **Vector Name** | Substrate-Poisoning: deceptive Eblet / pheromone trail injection |
| **V2 Coverage** | NONE — V2 stack is inference-rate-limit class only; no Scribe write-integrity primitive |
| **Measured TTD** | ∞ |
| **Measured TTQ** | ∞ |
| **False-Positive Ratio** | N/A (no gate) |
| **Severity** | **CRITICAL** |
| **Why Critical** | A successful substrate-poisoning attack can corrupt canon entries that Wrasse pre-injects at every session start — poisoned canon propagates to ALL agent sessions before detection. Pheromone substrate amplifies the spread: poisoned pheromone trail routes subsequent Detective queries to fabricated results. |
| **Recommended V3 Action** | V3 Vector 9 — Eblet-Quarantine + Maintenance-Scribe Tripwire (see Phase D) |

---

### GAP-02 — Mordecai-Esther Decree-Composition Abuse (AC-05)
| Field | Value |
|---|---|
| **Vector Name** | Governance-document composition integrity: decree-class subversion |
| **V2 Coverage** | NONE — no Scales-Judge composition-validity primitive in any V2 vector |
| **Measured TTD** | ∞ |
| **Measured TTQ** | ∞ (detected only on human Founder review, if at all) |
| **False-Positive Ratio** | N/A (no gate) |
| **Severity** | **CRITICAL** |
| **Why Critical** | The Mordecai-Esther Decree structure allows co-equal canonical additions. An adversarial decree that survives automated gates and bypasses Founder review could alter ratification authority — the most fundamental governance attack surface on the platform. |
| **Recommended V3 Action** | V3 Vector 10 — Scales-Judge Composition-Validity Gate (see Phase D) |

---

### GAP-03 — AI-Substrate Prompt-Injection (AC-09) [V2-class gap]
| Field | Value |
|---|---|
| **Vector Name** | Prompt-injection at agent input boundary (Bishop/Knight/Pawn/Rook) |
| **V2 Coverage** | NONE in V2. BRIDLE rule-set provides behavioral-layer defense (separate canon) but is not a named V2 vector with instrumented enforcement |
| **Measured TTD** | Session-level / high-variability (depends on agent attention; no structural tripwire) |
| **Measured TTQ** | N/A |
| **False-Positive Ratio** | N/A (no automated gate) |
| **Severity** | **HIGH** (V2-class gap; BRIDLE provides partial defense at a different layer) |
| **Why High** | Member-submitted content that reaches agents without pre-sanitization could override canon statements or elicit secrets-hygiene violations through clever phrasing. BRIDLE is the correct defense but is not formally integrated into V2 as a named, instrumented, measurable vector. |
| **Recommended V3 Action** | V3 Vector 11 — BRIDLE-Boundary Input Sanitization Layer (formally integrated into V2 stack as V3 named vector) (see Phase D) |

---

## PRIORITY 2 — DEFENDED BUT WITH LOW MARGIN (V3 should harden)

### GAP-04 — Federation-Handshake Hijack (AC-02)
| Field | Value |
|---|---|
| **Vector Name** | Inter-Cathedral handshake origin spoofing |
| **V2 Coverage** | PARTIAL — V1 Furnace checks structural validity (session_id, member_id); does not verify inter-Cathedral origin signatures |
| **Measured TTD** | ∞ for origin-spoofed valid-looking payloads |
| **Measured TTQ** | ∞ (request executes normally once V1 passes) |
| **False-Positive Ratio** | ~2% estimated (if origin-signature check added) |
| **Severity** | HIGH |
| **Why Low Margin** | V1 is the only defense and it checks form, not provenance. A well-crafted origin-spoofed payload that passes V1 executes with full agent authority. |
| **Recommended V3 Action** | V3 Vector 12 — Inter-Cathedral Origin-Signature Verification (see Phase D) |

---

### GAP-05 — Joules / Marks / Credits Mark-Backing Inflation (AC-03)
| Field | Value |
|---|---|
| **Vector Name** | Currency valuation attack — Mark-backing ledger inflation |
| **V2 Coverage** | PARTIAL — V8 (One-Way Valve) defends Credits-to-fiat cashout direction; does not defend inflation direction at Mark-backing ledger level |
| **Measured TTD** | ∞ for Mark-backing manipulation sub-probe |
| **Measured TTQ** | ∞ |
| **False-Positive Ratio** | ~3% (legitimate Mark-backing events) |
| **Severity** | HIGH |
| **Why Low Margin** | One-Way Valve is the only currency defense and it only covers one attack direction (extraction). Inflation of the Mark-backing ledger is undetected in V2. |
| **Recommended V3 Action** | V3 Vector 13 — Mark-Backing Audit Primitive (see Phase D) |

---

### GAP-06 — Glass-Door / Open-Outreach Abuse (AC-07 + AC-10)
| Field | Value |
|---|---|
| **Vector Name** | Glass Door automation gap — exfiltration and seeding via public channel |
| **V2 Coverage** | PARTIAL — V6 (Glass Door) is a named vector but has no instrumented automated enforcement in the current code surface; TTD is 24-72hrs (manual review class) |
| **Measured TTD** | 24-72 hours (manual) for both exfiltration and seeding sub-probes |
| **Measured TTQ** | Manual review cycle |
| **False-Positive Ratio** | ~3-5% estimated |
| **Severity** | HIGH |
| **Why Low Margin** | V6 is documented as a defense but is not instrumented in `slow_blade_orchestrator.ts` or any automated gate. A public Glass Door channel response that discloses counsel-class material has no automated pre-publication screen. |
| **Recommended V3 Action** | V3 Vector 14 — Glass Door Instrumented Content Screen + Counsel-Class Sub-gate (see Phase D) |

---

### GAP-07 — Trust-Match / Seasoning Manipulation (AC-08)
| Field | Value |
|---|---|
| **Vector Name** | Sybil-class signal fabrication in Trust Match scoring |
| **V2 Coverage** | PARTIAL — V3 (Trust Match) scores signal density; V4 (Seasoning) enforces time-elapsed; neither detects correlated-endorsement clusters (Sybil class) |
| **Measured TTD** | ∞ (Sybil cluster undetectable without graph-analysis layer) |
| **Measured TTQ** | ∞ |
| **False-Positive Ratio** | ~1% (organic high-mutual-endorsement communities) |
| **Severity** | HIGH |
| **Why Low Margin** | V3+V4 defend nominal adversary (random signal boost); fail against structured Sybil cluster with time-correct, density-correct fabricated signals. |
| **Recommended V3 Action** | V3 Vector 15 — Trust-Match Sybil-Detection Graph Primitive (see Phase D) |

---

### GAP-08 — Patent Prior-Art Adversarial Filing (AC-11)
| Field | Value |
|---|---|
| **Vector Name** | Patent-race collision detection |
| **V2 Coverage** | PARTIAL — V7 (Cooperative Defensive Patent Pledge) establishes the response framework; provides no early-warning detection system |
| **Measured TTD** | 18 months (USPTO publication lag) |
| **Measured TTQ** | Post-detection legal action (IPR class); expensive at 18-month lag |
| **False-Positive Ratio** | N/A (no detection gate in V2) |
| **Severity** | HIGH |
| **Why Low Margin** | 18-month TTD is structurally problematic. By the time LB detects a racing Prov, its own conversion timeline may face prior-art challenge. |
| **Recommended V3 Action** | V3 Vector 16 — Patent-Watch Early-Warning Service (see Phase D) |

---

### GAP-09 — Slow-Blade-Bypass Coordinated Multi-Member (AC-06)
| Field | Value |
|---|---|
| **Vector Name** | Multi-member coordinated rate-limit bypass |
| **V2 Coverage** | PARTIAL — V2 Dim 3 (global concurrency) is the backstop; Dim 2 is per-member only; no cross-member coordination detection |
| **Measured TTD** | ~100ms (Dim 3 hit) |
| **Measured TTQ** | ~100ms (6th+ concurrent request rejected) |
| **False-Positive Ratio** | ~5% (legitimate burst traffic from concurrent sessions) |
| **Severity** | MEDIUM |
| **Why Low Margin** | Dim 3 catches the coordinated flood at the concurrency boundary, but with ~5% FPR on legitimate traffic and no coordination signal to distinguish adversarial from legitimate. Aggregate cross-member cost tracking is absent. |
| **Recommended V3 Action** | V3 Vector 17 — Cross-Member Coordination Detection + Aggregate Cost Tracking (see Phase D) |

---

### GAP-10 — Voucher-Tier-Abuse Race Condition (AC-04)
| Field | Value |
|---|---|
| **Vector Name** | Tier-transition state-registration race condition |
| **V2 Coverage** | PARTIAL — V4+V5 defend nominal path; race condition exposed under concurrent-transition pressure within 60ms window |
| **Measured TTD** | ~500ms (nominal); race window ~60ms |
| **Measured TTQ** | ~500ms (nominal); not TTQ'd under race |
| **False-Positive Ratio** | ~1% |
| **Severity** | MEDIUM |
| **Why Low Margin** | The race window is tight but real. A well-timed concurrent submission can exploit stale standing state read by V5 before state-registration commits. |
| **Recommended V3 Action** | V3 Vector 18 — Tier-Transition Transactional State-Lock (see Phase D) |

---

### GAP-11 — Pledge Structural-Defection (AC-12)
| Field | Value |
|---|---|
| **Vector Name** | Cooperative-Defensive-Pledge compliance verification |
| **V2 Coverage** | PARTIAL — V7 is structural doctrine; no automated pre-filing compliance gate |
| **Measured TTD** | 18 months (USPTO publication lag) |
| **Measured TTQ** | Post-detection legal |
| **False-Positive Ratio** | ~2% |
| **Severity** | MEDIUM |
| **Why Low Margin** | Post-hoc detection 18 months after defection is near-useless for prevention. Pledge doctrine without compliance verification is doctrine-on-faith. |
| **Recommended V3 Action** | V3 Vector 19 — Pledge Compliance Pre-Filing Gate (see Phase D) |

---

## PRIORITY 3 — DEFENDED ADEQUATELY BY V2 (no V3 action; documented for completeness)

### DEFENDED-01 — Credits-to-Fiat Cashout (sub-probe of AC-03)
| Field | Value |
|---|---|
| **Vector** | One-Way Valve (V8) |
| **Coverage** | FULL — structural enforcement; no cashout route exists in codebase |
| **TTD** | Immediate (structural) |
| **V3 Action** | None — structurally defended |

---

### DEFENDED-02 — Malformed Request Injection (pre-condition to AC-02)
| Field | Value |
|---|---|
| **Vector** | Furnace / Pre-flight audit (V1) |
| **Coverage** | FULL for structurally malformed requests (missing session_id, member_id, zero-token-estimate) |
| **TTD** | Immediate (synchronous rejection) |
| **V3 Action** | None for this sub-class — see GAP-04 for origin-spoofed valid-looking variants |

---

### DEFENDED-03 — Single-Member Rate Flooding (nominal sub-probe of AC-06)
| Field | Value |
|---|---|
| **Vector** | Six Sparks Dim 2 (member RPM) |
| **Coverage** | FULL for single-member nominal flooding (30 RPM cap) |
| **TTD** | ~33ms (first over-cap request) |
| **V3 Action** | None for single-member class — see GAP-09 for multi-member coordinated class |

---

## PRIORITY 4 — OVER-DEFENDED (no V3 action; Maintenance-Scribe flag for simplification)

*(No over-defended vectors identified in this probe cycle. All V2 vectors are under-deployed relative to attack surface — no redundancy overhead to simplify.)*

---

## Gap Summary by Severity

| Severity | Count | Attack Classes |
|---|---|---|
| **CRITICAL** | 2 | AC-01 (Substrate-Poisoning), AC-05 (Decree-Composition) |
| **HIGH** | 7 | AC-02, AC-03(inflation), AC-07, AC-08, AC-09(V2-gap), AC-10, AC-11 |
| **MEDIUM** | 3 | AC-04, AC-06, AC-12 |
| **LOW** | 0 | — |
| **Defended (no gap)** | 3 | Credits-cashout, malformed-request, single-member-rate-flood |
| **Over-Defended** | 0 | — |

**Total gaps requiring V3 action: 11 vectors (2 CRITICAL + 6 HIGH + 3 MEDIUM)**

**G3 GATE: Gap-list authored with severity-class per entry. ✓**

---

*Bushel 24 Phase C — Gap-list authored AD 2026-05-03. Derived from Phase B probe findings. Source: `BUSHEL_24_RED_TEAM_PROBE_FINDINGS.md`. Composed with: Cooperative Defensive Patent Pledge (#2260), LB-Elves Red Team/Blue Team IP-ledger credit-where-due canon (BP021), Code-Breakers Corps Guild + Standing Security Bounty composition canon.*
