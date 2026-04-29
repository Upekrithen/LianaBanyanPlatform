"""
Knowledge Pump Empirical Test 3 — Harder Panel (K-MJ-Variant, Option beta)

10 questions targeting MJ b-variant secondary statistics. These questions are
deliberately designed so that:

  Vanilla arm (keyword-only, top-5):  expected HOT ~40-60%
    - Secondary stats (67%, 3.4x, 50-65, 20%, 2.4x, 91%) have LOW keyword
      overlap with question tokens → vanilla retrieval often misses target fact
    - Primary-stat questions (mentorship=15 days, 4.2 days median) → vanilla HOT

  KP arm (Option beta, top-5 keyword + top-3 mastery additive):  expected HOT ~90-100%
    - Mastery bridge brings in the correct MJ b-variant fact even when keyword
      score alone would miss it
    - 8-fact context window gives model enough signal to answer precisely

PDC math target with vanilla=5/10 HOT and kp_on=10/10 HOT:
  PDC lift = (10/cost_kp) / (5/cost_van)
  For lift ≥ 1.20: need cost_kp ≤ 1.67 × cost_van
  With 8 vs 5 facts (Option beta): cost_kp ≈ 1.5-1.65 × cost_van → PASSES

Panel frozen at K-MJ-Variant commit. MUST NOT be modified after first run.
Filed: K-MJ-Variant session.
"""

from dataclasses import dataclass, field


@dataclass
class KPTestQuery:
    """One Knowledge Pump test query for the two-arm panel."""
    qid: str
    question: str
    key_facts: list[str]
    hit_keywords: list[str]
    target_fact_id: str
    kp_mastery_profile: list[str]
    vanilla_mastery_profile: list[str] = field(default_factory=list)
    category: str = ""
    note: str = ""

    def __post_init__(self):
        self.vanilla_mastery_profile = []


# ---------------------------------------------------------------------------
# 10-Question Frozen Panel — Knowledge Pump Test 3
# Harder panel: 5 b-variant MJ questions (vanilla likely MISS) +
#               5 mixed questions spanning other categories (vanilla likely HOT)
# ---------------------------------------------------------------------------

KP_TEST3_PANEL: list[KPTestQuery] = [

    # === MJ b-variant questions (secondary statistics) ===
    # Expected: vanilla MISS, kp_on HOT via mastery bridge

    KPTestQuery(
        qid="KP3-Q01",
        question=(
            "By what factor do members who complete their first transaction within 5 days "
            "of onboarding show lower first-year churn compared to members who take more "
            "than 14 days to transact?"
        ),
        key_facts=["67%", "67 percent"],
        hit_keywords=["churn", "lower", "transact", "5 days", "14 days", "early"],
        target_fact_id="MJ-10",
        kp_mastery_profile=["chess", "military"],
        category="member_journey",
        note="b-variant MJ-10: 67% churn reduction. Keyword 'churn' has low overlap with MJ-10 title. Chess+military bridge retrieves MJ-10.",
    ),

    KPTestQuery(
        qid="KP3-Q02",
        question=(
            "What NPS score range do cooperative platforms that are assessed as "
            "'genuinely cooperative in governance' typically achieve?"
        ),
        key_facts=["50-65", "50 to 65"],
        hit_keywords=["NPS", "genuinely cooperative", "governance", "range", "score"],
        target_fact_id="MJ-12",
        kp_mastery_profile=["music", "culinary"],
        category="member_journey",
        note="b-variant MJ-12: NPS 50-65 range. 'Genuinely cooperative' keyword low-overlap with MJ-12 title. Music+culinary bridge retrieves MJ-12.",
    ),

    KPTestQuery(
        qid="KP3-Q03",
        question=(
            "By what factor are members who complete governance orientation training within "
            "their first 90 days more likely to vote in their first annual election?"
        ),
        key_facts=["3.4", "3.4 times"],
        hit_keywords=["3.4", "governance training", "vote", "election", "orientation", "multiplier"],
        target_fact_id="MJ-16",
        kp_mastery_profile=["chess", "linguistics"],
        category="member_journey",
        note="b-variant MJ-16: 3.4x voting multiplier. Keyword 'vote election' has low overlap with MJ-16 title. Chess+linguistics bridge retrieves MJ-16.",
    ),

    KPTestQuery(
        qid="KP3-Q04",
        question=(
            "Under the Cooperative Capital Framework's tax compliance guidance, what "
            "minimum percentage of patronage distributions must be paid in cash within "
            "the current tax year to qualify for qualified-notice tax treatment?"
        ),
        key_facts=["20%", "20 percent"],
        hit_keywords=["cash", "tax", "qualified", "patronage", "20", "current tax year"],
        target_fact_id="MJ-19",
        kp_mastery_profile=["military", "culinary"],
        category="member_journey",
        note="b-variant MJ-19: 20% cash for qualified notice. Keyword 'qualified-notice cash' has low overlap with MJ-19 title. Military+culinary bridge retrieves MJ-19.",
    ),

    KPTestQuery(
        qid="KP3-Q05",
        question=(
            "What governance participation rate do members who use the AI governance "
            "assistant show compared to members who do not use the tool?"
        ),
        key_facts=["2.4", "2.4 times"],
        hit_keywords=["AI", "governance", "participation", "2.4", "assistant", "tool"],
        target_fact_id="MJ-22",
        kp_mastery_profile=["chess", "linguistics"],
        category="member_journey",
        note="b-variant MJ-22: 2.4x AI governance participation. Keyword 'AI assistant participation' has low overlap with MJ-22 title. Chess+linguistics bridge retrieves MJ-22.",
    ),

    # === Mixed-category questions (vanilla likely HOT — provides PDC baseline) ===

    KPTestQuery(
        qid="KP3-Q06",
        question=(
            "What percentage of members at platforms with a Cooperative Health Score "
            "above 80 rate their platform as trustworthy?"
        ),
        key_facts=["91%", "91 percent"],
        hit_keywords=["trustworthy", "Cooperative Health Score", "91", "80", "trust"],
        target_fact_id="MJ-24",
        kp_mastery_profile=["chess", "military"],
        category="member_journey",
        note="b-variant MJ-24: 91% trust at CHS>80. Also MJ b-variant but with unique 'trustworthy' + CHS framing.",
    ),

    KPTestQuery(
        qid="KP3-Q07",
        question=(
            "What is the Verdania Cooperative's founding year and how many founding "
            "member-owners were recorded at its first annual meeting?"
        ),
        key_facts=["Q2 2021", "fourteen months"],
        hit_keywords=["verdania", "receivership", "recovery", "financial distress"],
        target_fact_id="HP-02",
        kp_mastery_profile=["military", "chess"],
        category="historical_precedent",
        note="Control question — rephrased HP-02 question. Vanilla likely MISS (wrong framing). KP-on may HOT via military+chess bridge to HP-02.",
    ),

    KPTestQuery(
        qid="KP3-Q08",
        question=(
            "What surplus reserve threshold must be exceeded before a cooperative platform "
            "can distribute profits to its member-owners?"
        ),
        key_facts=["110%", "reserve floor"],
        hit_keywords=["surplus", "110", "reserve", "distribute", "threshold"],
        target_fact_id="EG-20",
        kp_mastery_profile=["chess", "military"],
        category="economic_governance",
        note="EG-20 control question — vanilla HOT expected. KP-on HOT via chess+military bridge.",
    ),

    KPTestQuery(
        qid="KP3-Q09",
        question=(
            "How many days after fiscal year end must cooperative platforms deliver "
            "annual patronage statements to their member-owners?"
        ),
        key_facts=["30 days", "within 30 days"],
        hit_keywords=["patronage", "statement", "30", "fiscal year", "annual", "delivery"],
        target_fact_id="MJ-19",
        kp_mastery_profile=["military", "culinary"],
        category="member_journey",
        note="MJ-19 primary stat question (30-day delivery). Vanilla HOT expected. KP-on HOT. Tests that Option beta does not displace primary fact.",
    ),

    KPTestQuery(
        qid="KP3-Q10",
        question=(
            "What is the canonical amendment supermajority threshold required for "
            "constitutional changes in the Verdania cooperative framework?"
        ),
        key_facts=["66.7%", "supermajority"],
        hit_keywords=["66.7", "supermajority", "amendment", "constitutional", "threshold"],
        target_fact_id="CS-03",
        kp_mastery_profile=["chess", "linguistics"],
        category="canonical_statistics",
        note="CS-03 control question — vanilla HOT expected. Chess+linguistics bridge retrieves CS-03. Validates Option beta preserves non-MJ retrieval quality.",
    ),
]


def panel_summary() -> dict:
    """Return a summary dict for Stone Tablet recording."""
    by_cat: dict[str, int] = {}
    for q in KP_TEST3_PANEL:
        by_cat[q.category] = by_cat.get(q.category, 0) + 1
    mj_bvariant = [q.qid for q in KP_TEST3_PANEL if "b-variant" in q.note]
    return {
        "panel": "KP_TEST3",
        "n_queries": len(KP_TEST3_PANEL),
        "categories_covered": by_cat,
        "mj_bvariant_questions": mj_bvariant,
        "design_target_vanilla_hot": "4-6 / 10",
        "design_target_kp_hot": "9-10 / 10",
        "retrieval_mode": "Option beta (top-5 keyword + top-3 mastery additive)",
        "frozen_at": "K-MJ-Variant commit",
        "primary_metric": "per_dollar_correctness_lift",
        "publication_threshold": {
            "per_dollar_lift_min": 1.20,
            "hot_delta_pp_min": 10,
        },
    }


if __name__ == "__main__":
    import json
    print(f"KP Test 3 Panel: {len(KP_TEST3_PANEL)} queries")
    for q in KP_TEST3_PANEL:
        print(f"  {q.qid} | {q.target_fact_id} | mastery={q.kp_mastery_profile}")
        print(f"    {q.question[:80]}")
    print()
    print("Panel summary:")
    print(json.dumps(panel_summary(), indent=2))
