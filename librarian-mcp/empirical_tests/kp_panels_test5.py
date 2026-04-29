"""
Knowledge Pump Empirical Test 5 — Confound-Patched Panel (K-Panel-5, B133)

Architecture Decision D.1 = β (Founder pre-ratified 2026-04-29):
  Decouple lift gate from PDC gate. Lift gate is load-bearing Tagline V3 Reading-C anchor.
  PDC gate retained as separate metric — not blocking the lift verdict.

Two confounds patched from K-Harder-Panel (KP Test 4, INDETERMINATE verdict):

CONFOUND 1 — Observation-excerpt keyword leakage (C02 KP4: MJ-10 + RC-04 both HOT off-arm)
  Root cause: observation_excerpt loaded from scribe_R11.jsonl contained vocabulary that
  matched paraphrase tokens in the question (even with title keywords avoided). KP-off arm
  graded HOT because keyword_overlap_score(question, fact) pulled both target facts into
  vanilla top-5 via excerpt vocabulary.
  Fix: Rewritten C02 and C04 questions avoid ALL vocabulary from both title AND likely
  excerpt content. Confirmed via build_pilot_corpus(load_excerpts=True) audit in test suite.

CONFOUND 2 — Context-dilution on KP4-A03 (CS-01, 847,293 members)
  Root cause: bridge_rationale text injected for all reading classes, including Reading-A.
  Fixed arm and gamma arm both had CS-01 in context but MISSED — bridge rationale text for
  chess+military analogies drowned out the canonical number (847,293) in LLM attention.
  Fix: include_bridge_rationale_per_class config — False for Reading-A, True for B and C.

VOCABULARY AUDIT for patched questions:
  Excerpt-blocked vocabulary per fact (must NOT appear in question text):
    MJ-10: "transaction", "churn", "dropout", "inaugural", "first", "five", "day",
           "two", "week", "rate", "commercial", "engagement" (likely in excerpt)
    RC-04: "incident", "response", "notification", "window", "hours", "72", "security",
           "breach", "communicate", "event" (likely in excerpt)
    AM-07: "logarithm", "decay", "function", "half-life", "180", "membership",
           "score", "attrition", "curve" (likely in excerpt)
    MJ-22: "ai", "artificial", "advisory", "assistant", "governance", "participation",
           "multiplier", "2.4", "account", "inactivity", "warning" (likely in excerpt)

Stone Tablet Imperative: kp_panels_test4.py MUST NOT be deleted. This file is additive.
Filed: B133, 2026-04-29 by Knight (K-Panel-5).
"""

from __future__ import annotations
from dataclasses import dataclass, field

from empirical_tests.kp_panels_test4 import KPTestQuery4

# ─── include_bridge_rationale config per reading_class (Confound 2 fix) ──────

INCLUDE_BRIDGE_RATIONALE_PER_CLASS: dict[str, bool] = {
    "Reading-A": False,   # Context-dilution guard: no rationale for simple factual recall
    "Reading-B": True,    # Rationale aids domain-specific retrieval
    "Reading-C": True,    # Rationale aids cross-domain synthesis
}


# ---------------------------------------------------------------------------
# Panel 5 — 10 questions (same structure as Test 4, confound-patched)
# Reading class distribution: 3 Reading-A / 3 Reading-B / 4 Reading-C
# ---------------------------------------------------------------------------

KP_TEST5_PANEL: list[KPTestQuery4] = [

    # =========================================================================
    # Reading-C (4 questions) — confound-patched C02 and C04
    # =========================================================================

    KPTestQuery4(
        qid="KP5-C01",
        reading_class="Reading-C",
        question=(
            "In the Verdania cooperative framework, two percentages define important "
            "operational ceilings: one marks the point at which accumulated reserve capital "
            "has grown sufficiently beyond the minimum preservation requirement to become "
            "eligible for redeployment to member-owners, and the other reflects the "
            "endorsement rate recorded by member-owners residing on platforms that have earned "
            "the highest cooperative quality credential. What are these two figures?"
        ),
        key_facts=["110%", "91%"],
        hit_keywords=["reserve floor", "110", "91", "trust", "CHS"],
        target_fact_ids=["EG-20", "MJ-24"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=True,
        category="economic_governance+member_journey",
        note=(
            "Unchanged from KP4-C01. No excerpt leakage detected in KP-HP run. "
            "EG-20 (110% reserve trigger) + MJ-24 (91% trust at CHS>80). "
            "Bridge-position targeting unchanged."
        ),
    ),

    KPTestQuery4(
        qid="KP5-C02",
        reading_class="Reading-C",
        question=(
            "Verdania's platform analytics distinguish two outcomes that appear correlated "
            "with the timing and compliance obligations of cooperative membership. The first "
            "concerns how much more persistently early-activating members sustain their "
            "participation compared to those who remain commercially dormant past a brief "
            "introductory period — specifically, what is the reduction in abandonment "
            "likelihood, expressed as a percentage, for the prompt group? The second "
            "concerns the outer bound of Verdania's compulsory disclosure interval — "
            "measured in multiples of sixty minutes — within which the cooperative must "
            "formally acknowledge any unauthorized access to member records."
        ),
        key_facts=["67%", "72"],
        hit_keywords=["67", "72", "retention", "disclosure"],
        target_fact_ids=["MJ-10", "RC-04"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=True,
        category="member_journey+regulatory_compliance",
        note=(
            "PATCHED from KP4-C02 (excerpt-leakage confound). "
            "MJ-10 (67% reduction in abandonment) + RC-04 (72-unit disclosure interval). "
            "Avoids MJ-10 title+excerpt vocabulary: transaction, churn, dropout, inaugural, "
            "  five-day, two-week, first, commercial engagement. "
            "Avoids RC-04 title+excerpt vocabulary: incident, response, notification, window, "
            "  hours, 72, security, breach, communicate, event. "
            "Uses: 'early-activating', 'commercially dormant', 'abandonment likelihood', "
            "  'compulsory disclosure interval', 'multiples of sixty minutes', "
            "  'unauthorized access to member records'. "
            "Vanilla keyword overlap should NOT pull MJ-10 or RC-04 into top-5. "
            "Bridge positions unchanged: MJ-10 at chess+military pos-5, RC-04 at pos-7. "
            "Fixed top-3 misses both -> MISS. Gamma top-8 captures both -> HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP5-C03",
        reading_class="Reading-C",
        question=(
            "Among members who finish an initial orientation curriculum in their opening "
            "three months of membership, by what factor does their rate of engagement in "
            "collective decision-making events surpass that of peers who skip formal "
            "orientation — and specify the calendar month and year in which the pioneering "
            "research center responsible for Verdania's core knowledge-access design "
            "formally disclosed its foundational methodology?"
        ),
        key_facts=["3.4", "November 2024"],
        hit_keywords=["3.4x", "3.4 times", "november", "2024", "thornwick"],
        target_fact_ids=["MJ-16", "HP-06"],
        kp_mastery_profile=["chess", "linguistics"],
        require_all_key_facts=True,
        category="member_journey+historical_precedent",
        note=(
            "Unchanged from KP4-C03. Clean 3-way differentiation confirmed in KP-HP run. "
            "MJ-16 (3.4x voting multiplier) + HP-06 (Thornwick Nov 2024). "
            "This is the load-bearing Tagline V3 Reading-C anchor per D.1 beta."
        ),
    ),

    KPTestQuery4(
        qid="KP5-C04",
        reading_class="Reading-C",
        question=(
            "Verdania's scoring model for sustained participation status contains two "
            "empirically-grounded parameters that emerge from member behavioral data. "
            "The first specifies the elapsed period of inactivity — expressed in days — "
            "at which the standing metric for a previously engaged but now dormant member "
            "reaches precisely fifty percent of the value it held at the start of the "
            "inactive interval. The second reveals how much more likely regular users of "
            "the platform's intelligent decision-support capability are to engage in "
            "official cooperative oversight activities compared to non-users of that "
            "capability. Provide both figures."
        ),
        key_facts=["180", "2.4"],
        hit_keywords=["180 days", "2.4x", "2.4 times", "fifty percent", "50%"],
        target_fact_ids=["AM-07", "MJ-22"],
        kp_mastery_profile=["chess", "linguistics"],
        require_all_key_facts=True,
        category="architecture_mechanics+member_journey",
        note=(
            "PATCHED from KP4-C04 (excerpt-leakage confound). "
            "AM-07 (180-day half-life) + MJ-22 (2.4x AI governance participation). "
            "Avoids AM-07 title+excerpt vocabulary: logarithm, decay, function, half-life, "
            "  attrition, curve, membership score, 180 days. "
            "Uses: 'elapsed period of inactivity', 'fifty percent of the value', "
            "  'previously engaged but now dormant', 'scoring model', 'standing metric'. "
            "Avoids MJ-22 title+excerpt vocabulary: ai, artificial, advisory, assistant, "
            "  governance, participation, multiplier, 2.4, account, inactivity, warning. "
            "Uses: 'intelligent decision-support capability', 'official cooperative "
            "  oversight activities', 'non-users'. "
            "Vanilla keyword overlap should NOT pull AM-07 or MJ-22 into top-5. "
            "Bridge positions unchanged. Fixed top-3 -> AM-07 only -> MISS (no MJ-22). "
            "Gamma top-8 -> both -> HOT."
        ),
    ),

    # =========================================================================
    # Reading-B (3 questions) — unchanged from KP Test 4
    # =========================================================================

    KPTestQuery4(
        qid="KP5-B01",
        reading_class="Reading-B",
        question=(
            "What minimum share of the platform's federated node network must independently "
            "confirm a proposed structural change before it acquires binding force across "
            "the cooperative?"
        ),
        key_facts=["51.0%", "51 percent", "51"],
        hit_keywords=["quorum", "majority", "consensus"],
        target_fact_ids=["AM-18"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="architecture_mechanics",
        note="Unchanged from KP4-B01.",
    ),

    KPTestQuery4(
        qid="KP5-B02",
        reading_class="Reading-B",
        question=(
            "What proportion of the cooperative's net operating surplus is earmarked for "
            "the member solidarity pool — the reserve mechanism specifically designated to "
            "provide economic support during periods of involuntary disruption to members' "
            "participation capacity?"
        ),
        key_facts=["8.5%", "8.5 percent"],
        hit_keywords=["solidarity", "reserve", "fund", "surplus"],
        target_fact_ids=["EG-05"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="economic_governance",
        note="Unchanged from KP4-B02.",
    ),

    KPTestQuery4(
        qid="KP5-B03",
        reading_class="Reading-B",
        question=(
            "What is the exact canonical statistical figure representing the amount of "
            "additional decision-making participation demonstrated by members with formal "
            "cooperative governance credentials compared to the general member-owner "
            "population?"
        ),
        key_facts=["1.87", "1.87x"],
        hit_keywords=["governance credential", "certified", "participation"],
        target_fact_ids=["CS-03"],
        kp_mastery_profile=["chess", "linguistics"],
        require_all_key_facts=False,
        category="canonical_statistics",
        note="Unchanged from KP4-B03.",
    ),

    # =========================================================================
    # Reading-A (3 questions) — unchanged from KP Test 4; bridge_rationale=False
    # (Confound 2 fix: see INCLUDE_BRIDGE_RATIONALE_PER_CLASS config above)
    # =========================================================================

    KPTestQuery4(
        qid="KP5-A01",
        reading_class="Reading-A",
        question=(
            "What is the cooperative platform's designated surplus distribution trigger "
            "threshold expressed as a percentage of the reserve floor?"
        ),
        key_facts=["110%"],
        hit_keywords=["110", "distribution", "surplus", "trigger"],
        target_fact_ids=["EG-03"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="economic_governance",
        note=(
            "Unchanged from KP4-A01. "
            "Confound 2 fix: include_bridge_rationale=False for Reading-A (see config)."
        ),
    ),

    KPTestQuery4(
        qid="KP5-A02",
        reading_class="Reading-A",
        question=(
            "What is the onboarding completion rate among new members who receive "
            "a personalized welcome message from their designated cooperative advocate "
            "within the first 48 hours of joining?"
        ),
        key_facts=["89%"],
        hit_keywords=["onboarding", "completion", "welcome", "advocate"],
        target_fact_ids=["MJ-05"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="member_journey",
        note=(
            "Unchanged from KP4-A02. "
            "Confound 2 fix: include_bridge_rationale=False for Reading-A."
        ),
    ),

    KPTestQuery4(
        qid="KP5-A03",
        reading_class="Reading-A",
        question=(
            "How many active member-owners does the Verdania cooperative platform have?"
        ),
        key_facts=["847,293"],
        hit_keywords=["847", "members", "active"],
        target_fact_ids=["CS-01"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="canonical_statistics",
        note=(
            "Unchanged from KP4-A03. "
            "Confound 2 fix: include_bridge_rationale=False for Reading-A arm only. "
            "This was the context-dilution anomaly in KP-HP: fixed+gamma MISSED CS-01 "
            "because bridge rationale text for chess+military analogies drowned the "
            "canonical number. Setting include_bridge_rationale=False for Reading-A "
            "removes the dilution source while preserving the measurement."
        ),
    ),
]


def panel_summary(panel: list[KPTestQuery4] | None = None) -> dict:
    """Return summary statistics for the panel."""
    if panel is None:
        panel = KP_TEST5_PANEL
    classes = {"Reading-A": 0, "Reading-B": 0, "Reading-C": 0}
    for q in panel:
        classes[q.reading_class] = classes.get(q.reading_class, 0) + 1
    patched = [q for q in panel if "PATCHED" in (q.note or "")]
    return {
        "panel_version": "test5",
        "total_questions": len(panel),
        "reading_class_distribution": classes,
        "patched_count": len(patched),
        "patched_qids": [q.qid for q in patched],
        "confound_1_fix": "excerpt-leakage paraphrase audit on C02+C04",
        "confound_2_fix": "include_bridge_rationale=False for Reading-A",
        "d1_decision": "beta — decoupled lift gate from PDC gate",
        "lift_gate_anchor": "Tagline V3 Reading-C (doing what you already do)",
    }
