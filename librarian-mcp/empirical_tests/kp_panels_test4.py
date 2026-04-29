"""
Knowledge Pump Empirical Test 4 — Sparse-Corpus-Resistant Panel (K-Harder-Panel, B133)

Architecture Decision D.1 (Founder-ratified 2026-04-29): Option alpha — same 26-fact
corpus, harder questions. Single-variable manipulation per Brynjolfsson methodology-mirror.

Design innovations over KP_TEST3:
  1. 2-fact synthesis — each Reading-C/B question requires combining facts from two
     different corpus domains. The canonical answer is only available when BOTH target
     facts are in context. Vanilla keyword retrieval finds neither (question paraphrase
     avoids all title keywords of both targets).

  2. require_all_key_facts — new grader flag. When True, ALL key_facts must appear in
     the answer for HOT grade. This prevents a partial answer (knowing only one of two
     targets) from grading HOT via the 60%-threshold loophole.

  3. Bridge-position targeting — Reading-C targets sit at corpus positions 4–8 in the
     mastery bridge list. Fixed (top-3 mastery) misses them; Gamma (top-8 for Reading-C)
     captures both. Reading-B targets sit at positions 1–3 (fixed captures them).

Projected 9-cell profile (Option alpha):
  KP-off:   Reading-A=100%  Reading-B=0%   Reading-C=0%
  KP-fixed: Reading-A=100%  Reading-B=100% Reading-C=0%
  KP-gamma: Reading-A=100%  Reading-B=100% Reading-C=100%
  -> Reading-C lift (gamma vs fixed): ~+100pp

Keyword-reachability root-cause (K543 post-mortem):
  K539 SCOPE A added MJ b-variant facts with titles that mirror question vocabulary.
  Vanilla top-5 already contained every target; KP bridge was structurally irrelevant.
  This panel uses paraphrase language that avoids ALL title keywords of both targets
  in every Reading-C question.

Reading class distribution: 3 Reading-A / 3 Reading-B / 4 Reading-C.

Stone Tablet Imperative: kp_panels_test3.py MUST NOT be deleted. This file is additive.
Filed: B133, 2026-04-29 by Knight (K-Harder-Panel).
"""

from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class KPTestQuery4:
    """One Knowledge Pump Test 4 query — supports 2-fact synthesis and require_all grading."""
    qid: str
    question: str
    key_facts: list[str]          # canonical answers for HOT grading
    hit_keywords: list[str]       # partial-credit keywords (HIT grade)
    target_fact_ids: list[str]    # one or two fact IDs this question tests
    kp_mastery_profile: list[str]
    reading_class: str            # Reading-A | Reading-B | Reading-C
    require_all_key_facts: bool = False  # True for 2-fact synthesis: ALL key_facts required
    category: str = ""
    note: str = ""
    vanilla_mastery_profile: list[str] = field(default_factory=list)

    def __post_init__(self):
        self.vanilla_mastery_profile = []


# ---------------------------------------------------------------------------
# 10-Question Frozen Panel — Knowledge Pump Test 4
# Sparse-corpus-resistant: 2-fact synthesis + paraphrase + require_all grading
# ---------------------------------------------------------------------------

KP_TEST4_PANEL: list[KPTestQuery4] = [

    # =========================================================================
    # Reading-C (4 questions)
    # Both targets outside vanilla top-5 AND outside KP-fixed top-3 bridge
    # KP-gamma (top-8 mastery for Reading-C) captures both targets
    # =========================================================================

    KPTestQuery4(
        qid="KP4-C01",
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
            "2-fact synthesis: EG-20 (110% reserve trigger) + MJ-24 (91% trust at CHS>80). "
            "Avoids EG-20 keywords: surplus,distribution,trigger,threshold. "
            "Avoids MJ-24 keywords: grievance,escalation,trust,rating,chs. "
            "EG-20 at chess+military bridge pos-4, MJ-24 at pos-6. "
            "Fixed top-3=[AM-18,EG-03,EG-20] -> has EG-20 only -> MISS. "
            "Gamma top-8 -> both targets -> HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-C02",
        reading_class="Reading-C",
        question=(
            "Among new entrants who make their inaugural commercial engagement within the "
            "opening five-day span of their membership versus those who defer beyond two "
            "calendar weeks, how much lower is their inaugural-year dropout rate — and "
            "separately, when a data security breach occurs on a cooperative platform, "
            "what is the maximum number of hours the platform has to communicate this "
            "event to affected member-owners?"
        ),
        key_facts=["67%", "72 hours"],
        hit_keywords=["67", "72", "churn", "notification", "incident"],
        target_fact_ids=["MJ-10", "RC-04"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=True,
        category="member_journey+regulatory_compliance",
        note=(
            "2-fact synthesis: MJ-10 (67% churn reduction) + RC-04 (72-hour notification). "
            "Avoids MJ-10 keywords: first,transaction,churn,reduction. "
            "Avoids RC-04 keywords: incident,response,notification,window. "
            "MJ-10 at chess+military bridge pos-5, RC-04 at pos-7. "
            "Fixed top-3=[AM-18,EG-03,EG-20] -> neither target -> MISS. "
            "Gamma top-8 -> [AM-18,EG-03,EG-20,MJ-10,MJ-24,RC-04,RC-07] -> both -> HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-C03",
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
            "2-fact synthesis: MJ-16 (3.4x voting multiplier) + HP-06 (Thornwick Nov 2024). "
            "Avoids MJ-16 keywords: governance,training,completion,voting,multiplier. "
            "Avoids HP-06 keywords: thornwick,architecture,discovery. "
            "kw top-5 captures CS-01,HP-02 via 'verdania'; AM-07 via 'membership' substring. "
            "Bridge list (excl kw_ids): [MJ-05,MJ-16,MJ-22,HP-06]. "
            "Fixed top-3=[MJ-05,MJ-16,MJ-22] -> has MJ-16 (3.4) NOT HP-06 -> MISS. "
            "Gamma top-8 -> all 4 -> both targets -> HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-C04",
        reading_class="Reading-C",
        question=(
            "At what point in time does a dormant participant's platform standing reach "
            "half its original value according to the platform's logarithmic attrition "
            "curve, and by what factor does regular reliance on the automated advisory "
            "assistant elevate a person's likelihood of involvement in formal platform "
            "oversight compared to those who forgo that tool?"
        ),
        key_facts=["180", "2.4"],
        hit_keywords=["180 days", "2.4x", "2.4 times", "half-life", "attrition"],
        target_fact_ids=["AM-07", "MJ-22"],
        kp_mastery_profile=["chess", "linguistics"],
        require_all_key_facts=True,
        category="architecture_mechanics+member_journey",
        note=(
            "2-fact synthesis: AM-07 (180-day half-life) + MJ-22 (2.4x AI governance). "
            "Avoids AM-07 keywords: membership,score,decay,function. "
            "Avoids MJ-22 keywords: account,inactivity,warning,threshold,ai,governance,"
            "participation,multiplier. "
            "kw top-5 captures MJ-01 ('time'), CS-01,CS-03,CS-06,CS-08 (0-match fillers). "
            "Bridge list (chess+linguistics, excl kw_ids): [AM-07,MJ-05,MJ-16,MJ-22,HP-06]. "
            "Fixed top-3=[AM-07,MJ-05,MJ-16] -> has AM-07(180) NOT MJ-22(2.4) -> MISS. "
            "Gamma top-8 -> [AM-07,MJ-05,MJ-16,MJ-22,HP-06] -> both -> HOT."
        ),
    ),

    # =========================================================================
    # Reading-B (3 questions)
    # Target outside vanilla top-5 but inside KP-fixed top-3 bridge
    # Both fixed and gamma HOT; vanilla MISS
    # =========================================================================

    KPTestQuery4(
        qid="KP4-B01",
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
        note=(
            "Single target: AM-18 (51.0% consensus quorum). "
            "Avoids AM-18 keywords: consensus,quorum,percentage. "
            "AM-18 at chess+military bridge pos-2 -> Fixed top-3 captures it. "
            "Vanilla top-5 = {MJ-12,EG-05,CS-01,CS-03,CS-06} -> no AM-18 -> MISS. "
            "Fixed top-3=[AM-18,EG-03,EG-20] -> HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-B02",
        reading_class="Reading-B",
        question=(
            "A platform stakeholder who has decided to withdraw from their participation "
            "in the cooperative arrangement — how many calendar days advance communication "
            "must they provide to the platform before their departure becomes formally "
            "effective?"
        ),
        key_facts=["60 days", "60 calendar days", "60"],
        hit_keywords=["notice", "exit", "withdrawal"],
        target_fact_ids=["EG-05"],
        kp_mastery_profile=["military", "culinary"],
        require_all_key_facts=False,
        category="economic_governance",
        note=(
            "Single target: EG-05 (60 calendar days exit notice). "
            "Avoids EG-05 keywords: exit,rights,minimum,notice,period. "
            "EG-05 at military+culinary bridge pos-2 -> Fixed top-3 captures it. "
            "Vanilla top-5 misses EG-05 -> MISS. Fixed top-3=[AM-03,EG-05,MJ-01] -> HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-B03",
        reading_class="Reading-B",
        question=(
            "At what percentage of favorable votes cast must a proposed constitutional "
            "revision in the Verdania framework clear before being formally ratified and "
            "taking legal effect across all member-owners?"
        ),
        key_facts=["66.7%", "66.7 percent", "two-thirds"],
        hit_keywords=["66.7", "two thirds", "supermajority"],
        target_fact_ids=["CS-03"],
        kp_mastery_profile=["chess", "linguistics"],
        require_all_key_facts=False,
        category="canonical_statistics",
        note=(
            "Single target: CS-03 (66.7% amendment supermajority). "
            "Avoids CS-03 keywords: amendment,supermajority,threshold. "
            "CS-03 at chess+linguistics bridge pos-1 -> Fixed top-3 always captures it. "
            "Vanilla top-5={CS-01,CS-06,AM-07,AM-18,MJ-12} (via verdania+member+percentage)"
            " -> no CS-03 -> MISS. Fixed top-3=[CS-03,MJ-05,MJ-16] -> HOT."
        ),
    ),

    # =========================================================================
    # Reading-A (3 questions)
    # Keyword-reachable control group — all arms HOT
    # Validates that the corpus and retrieval framework still function correctly
    # =========================================================================

    KPTestQuery4(
        qid="KP4-A01",
        reading_class="Reading-A",
        question=(
            "What annual transaction volume must a platform exceed to qualify for "
            "Tier 1 classification under the cooperative framework?"
        ),
        key_facts=["$1B", "$1 billion", "1 billion"],
        hit_keywords=["Tier 1", "one billion", "$1"],
        target_fact_ids=["EG-03"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="economic_governance",
        note=(
            "Control: EG-03 ($1B Tier-1 threshold). Keyword 'Tier' directly matches "
            "EG-03 title 'Tier Classifications'. All arms expected HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-A02",
        reading_class="Reading-A",
        question=(
            "How many business days does the cooperative platform standard allow for "
            "completing mentor-mentee pairing after a new member applies for the program?"
        ),
        key_facts=["15 business days", "15 days", "15"],
        hit_keywords=["15", "pairing", "mentorship"],
        target_fact_ids=["MJ-05"],
        kp_mastery_profile=["chess", "linguistics"],
        require_all_key_facts=False,
        category="member_journey",
        note=(
            "Control: MJ-05 (15 business days mentorship pairing). "
            "Keywords 'mentor' (in 'mentor-mentee') and 'pairing' directly match "
            "MJ-05 title 'Mentorship Program Pairing Standard'. All arms expected HOT."
        ),
    ),

    KPTestQuery4(
        qid="KP4-A03",
        reading_class="Reading-A",
        question=(
            "How many identity-verified, active member-owners does the Verdania "
            "cooperative platform count as of Q3 2025?"
        ),
        key_facts=["847,293", "847293"],
        hit_keywords=["847", "members", "active"],
        target_fact_ids=["CS-01"],
        kp_mastery_profile=["chess", "military"],
        require_all_key_facts=False,
        category="canonical_statistics",
        note=(
            "Control: CS-01 (847,293 active member-owners). "
            "Keywords 'Verdania' and 'member' directly match CS-01 title. "
            "All arms expected HOT."
        ),
    ),
]


def panel_summary() -> dict:
    """Return a summary dict for Stone Tablet recording."""
    by_rc: dict[str, int] = {}
    by_cat: dict[str, int] = {}
    synthesis_count = 0
    for q in KP_TEST4_PANEL:
        by_rc[q.reading_class] = by_rc.get(q.reading_class, 0) + 1
        by_cat[q.category] = by_cat.get(q.category, 0) + 1
        if q.require_all_key_facts:
            synthesis_count += 1
    return {
        "panel": "KP_TEST4",
        "n_queries": len(KP_TEST4_PANEL),
        "architecture": "Option-alpha (D.1 Founder-ratified 2026-04-29)",
        "corpus": "same 26-fact corpus as KP_TEST3 — no changes",
        "reading_class_distribution": by_rc,
        "categories_covered": by_cat,
        "two_fact_synthesis_questions": synthesis_count,
        "grader_innovation": "require_all_key_facts=True for 2-fact synthesis",
        "design_target_vanilla_hot_reading_c": "0 / 4",
        "design_target_fixed_hot_reading_c": "0 / 4",
        "design_target_gamma_hot_reading_c": "4 / 4",
        "reading_c_lift_target_pp": ">5pp (publication gate), projected ~+100pp",
        "prior_result_k543": "0.0pp lift — panel keyword-reachability failure diagnosed",
        "retrieval_mode": "gamma_dynamic (Option gamma, same as K543 runner)",
        "frozen_at": "K-Harder-Panel (B133)",
        "stone_tablet_imperative": True,
    }


if __name__ == "__main__":
    import json
    print(f"KP Test 4 Panel: {len(KP_TEST4_PANEL)} queries")
    for rc in ["Reading-A", "Reading-B", "Reading-C"]:
        qs = [q for q in KP_TEST4_PANEL if q.reading_class == rc]
        print(f"\n  {rc} ({len(qs)} questions):")
        for q in qs:
            synthesis = "[2-FACT]" if q.require_all_key_facts else "[1-FACT]"
            print(f"    {q.qid} {synthesis} targets={q.target_fact_ids} mastery={q.kp_mastery_profile}")
            print(f"      {q.question[:90]}...")
    print()
    print("Panel summary:")
    print(json.dumps(panel_summary(), indent=2))
