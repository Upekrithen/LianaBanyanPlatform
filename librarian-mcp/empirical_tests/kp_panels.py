"""
Knowledge Pump Empirical Test — Test Query Panels (Phase B, K538)

10 questions frozen before testing begins (empirical honesty).
Each query has:
  - A natural-language question answerable from the 20-fact pilot corpus
  - key_facts: canonical figures/phrases that must appear in a HOT-graded answer
  - hit_keywords: partial-credit terms for HIT-graded answers
  - target_fact_id: the primary R11 fact this question is designed to retrieve
  - kp_mastery_profile: domains declared for the KP arm
  - vanilla_mastery_profile: always [] — no mastery declared in vanilla arm

Panel design rationale (B132 D.3):
  - 10 questions (N=10 — document as underpowered; report effect size + direction)
  - Covers all 6 R11 categories (2 canonical_statistics, 2 architecture_mechanics,
    2 economic_governance, 1 member_journey, 1 regulatory_compliance,
    2 historical_precedent)
  - Each question has a clear canonical answer (number or phrase) enabling precise HOT grading
  - Mastery profiles are chosen to match corpus bridge tags (ensuring KP arm has facts to boost)
  - PANELS MUST NOT BE MODIFIED after the baseline run begins (K491 panel-freeze discipline)

Primary metric: per-dollar-correctness = HOT% / mean_cost_per_query (D.3 decision)
Secondary: HOT% delta (pp) between KP arm and vanilla arm
Publication gate: per_dollar_lift ≥ 1.20 AND hot_delta ≥ 10pp

Filed: B132, 2026-04-28 by Knight (K538). FROZEN AT COMMIT.
"""

from dataclasses import dataclass, field


@dataclass
class KPTestQuery:
    """One Knowledge Pump test query for the two-arm panel."""
    qid: str
    question: str
    key_facts: list[str]           # must appear in answer for HOT grade
    hit_keywords: list[str]        # partial credit (HIT grade)
    target_fact_id: str            # primary R11 fact this question retrieves
    kp_mastery_profile: list[str]  # declared mastery for KP arm
    vanilla_mastery_profile: list[str] = field(default_factory=list)  # always []
    category: str = ""             # R11 category of target fact
    note: str = ""                 # annotation for the record

    def __post_init__(self):
        self.vanilla_mastery_profile = []  # enforce: vanilla has no declared mastery


# ---------------------------------------------------------------------------
# 10-Question Frozen Panel — Knowledge Pump Test 2
# ---------------------------------------------------------------------------

KP_TEST2_PANEL: list[KPTestQuery] = [
    # --- canonical_statistics ---
    KPTestQuery(
        qid="KP-Q01",
        question="What is Verdania's verified active membership count and what verification methodology was used?",
        key_facts=["847,293", "active member-owners", "Q3 2025"],
        hit_keywords=["verdania", "membership", "847", "active", "verified", "sampling"],
        target_fact_id="CS-01",
        kp_mastery_profile=["chess", "military"],
        category="canonical_statistics",
        note="Tests whether chess+military mastery boosts CS-01 (active-piece / readiness-reporting bridge)",
    ),
    KPTestQuery(
        qid="KP-Q02",
        question="What is the maximum voting weight any single member can hold in cooperative governance?",
        key_facts=["2.3%", "maximum voting weight"],
        hit_keywords=["voting", "cap", "weight", "2.3", "concentrated", "single member"],
        target_fact_id="CS-08",
        kp_mastery_profile=["chess", "music"],
        category="canonical_statistics",
        note="Tests whether chess+music mastery boosts CS-08 (piece-value-cap / ensemble-balance bridge)",
    ),
    # --- architecture_mechanics ---
    KPTestQuery(
        qid="KP-Q03",
        question="What is the Thornwick dense-to-sparse weighting ratio and what does it represent?",
        key_facts=["0.73:0.27", "dense-to-sparse"],
        hit_keywords=["thornwick", "dense", "sparse", "0.73", "0.27", "hybrid", "ratio"],
        target_fact_id="AM-01",
        kp_mastery_profile=["chess", "music"],
        category="architecture_mechanics",
        note="Tests whether chess+music mastery boosts AM-01 (opening-density / harmonic-texture bridge)",
    ),
    KPTestQuery(
        qid="KP-Q04",
        question="What decay function governs membership scores and what is the half-life?",
        key_facts=["logarithmic decay", "180 days"],
        hit_keywords=["decay", "membership", "score", "logarithmic", "half-life", "180"],
        target_fact_id="AM-07",
        kp_mastery_profile=["chess", "linguistics"],
        category="architecture_mechanics",
        note="Tests whether chess+linguistics mastery boosts AM-07 (positional-advantage-decay / language-attrition bridge)",
    ),
    # --- economic_governance ---
    KPTestQuery(
        qid="KP-Q05",
        question="How is patronage allocated between high-volume members and all active members?",
        key_facts=["70/30", "70% allocated by transaction volume", "30% allocated equally"],
        hit_keywords=["patronage", "70", "30", "transaction volume", "equally", "allocation"],
        target_fact_id="EG-01",
        kp_mastery_profile=["culinary", "music"],
        category="economic_governance",
        note="Tests whether culinary+music mastery boosts EG-01 (tip-distribution / royalty-split bridge)",
    ),
    KPTestQuery(
        qid="KP-Q06",
        question="What reserve threshold must be exceeded before surplus can be distributed to members?",
        key_facts=["110%", "reserve floor"],
        hit_keywords=["surplus", "distribution", "110", "reserve", "trigger", "threshold"],
        target_fact_id="EG-20",
        kp_mastery_profile=["chess", "military"],
        category="economic_governance",
        note="Tests whether chess+military mastery boosts EG-20 (convert-advantage / mission-success-threshold bridge)",
    ),
    # --- regulatory_compliance ---
    KPTestQuery(
        qid="KP-Q07",
        question="Within how many hours must members be notified of a security incident?",
        key_facts=["72 hours", "notification window"],
        hit_keywords=["incident", "notification", "72", "hours", "security", "response"],
        target_fact_id="RC-04",
        kp_mastery_profile=["military", "chess"],
        category="regulatory_compliance",
        note="Tests whether military+chess mastery boosts RC-04 (CCIR-reporting / touch-move bridge)",
    ),
    # --- member_journey ---
    KPTestQuery(
        qid="KP-Q08",
        question="What is the standard pairing timeline for the mentorship program?",
        key_facts=["15 business days", "mentor-mentee pairing"],
        hit_keywords=["mentorship", "pairing", "15", "business days", "mentor", "matching"],
        target_fact_id="MJ-05",
        kp_mastery_profile=["chess", "linguistics"],
        category="member_journey",
        note="Tests whether chess+linguistics mastery boosts MJ-05 (club-mentorship / native-speaker-pairing bridge)",
    ),
    # --- historical_precedent ---
    KPTestQuery(
        qid="KP-Q09",
        question="When did Verdania enter financial distress and how long did its recovery take?",
        key_facts=["Q2 2021", "fourteen months"],
        hit_keywords=["verdania", "receivership", "recovery", "2021", "fourteen", "months", "distress"],
        target_fact_id="HP-02",
        kp_mastery_profile=["military", "chess"],
        category="historical_precedent",
        note="Tests whether military+chess mastery boosts HP-02 (reconstitution / endgame-grind bridge)",
    ),
    KPTestQuery(
        qid="KP-Q10",
        question="Who developed the Thornwick architecture and when was it published?",
        key_facts=["Thornwick Cooperative Research Institute", "Birmingham", "November 2024"],
        hit_keywords=["thornwick", "institute", "birmingham", "2024", "published", "research"],
        target_fact_id="HP-06",
        kp_mastery_profile=["linguistics", "chess"],
        category="historical_precedent",
        note="Tests whether linguistics+chess mastery boosts HP-06 (grammar-discovery / opening-novelty bridge)",
    ),
]


# ---------------------------------------------------------------------------
# Mastery profiles summary (for Stone Tablet recording)
# ---------------------------------------------------------------------------

KP_MASTERY_PROFILES_USED: dict[str, list[str]] = {}
for _q in KP_TEST2_PANEL:
    _key = "+".join(sorted(_q.kp_mastery_profile))
    KP_MASTERY_PROFILES_USED.setdefault(_key, []).append(_q.qid)


def panel_summary() -> dict:
    """Return a summary dict for Stone Tablet recording."""
    by_cat: dict[str, int] = {}
    for q in KP_TEST2_PANEL:
        by_cat[q.category] = by_cat.get(q.category, 0) + 1
    return {
        "panel": "KP_TEST2",
        "n_queries": len(KP_TEST2_PANEL),
        "categories_covered": by_cat,
        "mastery_profiles_used": KP_MASTERY_PROFILES_USED,
        "frozen_at": "K538 commit",
        "primary_metric": "per_dollar_correctness",
        "publication_threshold": {
            "per_dollar_lift_min": 1.20,
            "hot_delta_pp_min": 10,
        },
    }


if __name__ == "__main__":
    print(f"KP Test 2 Panel: {len(KP_TEST2_PANEL)} queries")
    for q in KP_TEST2_PANEL:
        print(f"  {q.qid} | {q.target_fact_id} | mastery={q.kp_mastery_profile}")
        print(f"    {q.question[:80]}")
    print()
    import json
    print("Panel summary:")
    print(json.dumps(panel_summary(), indent=2))
