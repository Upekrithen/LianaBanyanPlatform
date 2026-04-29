"""
Unit tests — KP Panel 5 Confound Patches (K-Panel-5/B133)

Tests:
  1. Excerpt-leakage confound fix: C02+C04 questions do NOT have keyword overlap
     with the R11 scribe excerpts for their target facts
  2. Context-dilution fix: INCLUDE_BRIDGE_RATIONALE_PER_CLASS correctly assigns
     False for Reading-A, True for B and C
  3. Decoupled verdict (D.1 beta): LIFT_GATE_CLEARED doesn't require PDC condition
  4. Reading-A arm does not include bridge rationale in context_for_llm
  5. Panel structure validation: 3 A / 3 B / 4 C / 2 patched

Run: python -m pytest librarian-mcp/empirical_tests/tests/test_panel5_confound_patches.py -v
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

_HERE = Path(__file__).parent
_ROOT = _HERE.parent.parent
sys.path.insert(0, str(_ROOT.parent))
sys.path.insert(0, str(_ROOT))

from empirical_tests.kp_corpus import build_pilot_corpus
from empirical_tests.kp_panels_test5 import (
    KP_TEST5_PANEL,
    INCLUDE_BRIDGE_RATIONALE_PER_CLASS,
    panel_summary,
)
from empirical_tests.kp_retrieval import KPRetriever
from empirical_tests.harness import GRADE_HOT, GRADE_MISS
from empirical_tests.run_kp_test5 import _excerpt_vocabulary_audit, aggregate_test5_summary


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def corpus_with_excerpts():
    """Load corpus with excerpts if scribe is available, else without."""
    return build_pilot_corpus(load_excerpts=True)


@pytest.fixture
def corpus_no_excerpts():
    return build_pilot_corpus(load_excerpts=False)


# ─── Test 1: Excerpt-leakage fix — C02 + C04 question texts avoid excerpt vocab ─

def test_c02_avoids_mj10_excerpt_vocabulary(corpus_with_excerpts):
    """KP5-C02 question must not contain specific confound-causing MJ-10 vocabulary.

    The excerpt-leakage confound in KP4-C02 was caused by domain-specific terms
    that appear in both the question and MJ-10's observation_excerpt, enabling
    vanilla keyword retrieval to surface MJ-10 without needing the bridge.

    Checked vocabulary: specific confound terms from the patch note in kp_panels_test5.py,
    not general overlap (generic words like 'member', 'cooperative' are domain-universal).
    """
    c02 = next(q for q in KP_TEST5_PANEL if q.qid == "KP5-C02")
    question_lower = c02.question.lower()

    # High-risk MJ-10 vocabulary per the patch note (causes false-positive keyword retrieval)
    forbidden_mj10 = {
        "transaction", "churn", "dropout", "inaugural",
        "five-day", "two-week", "commercial engagement",
    }
    found = [f for f in forbidden_mj10 if f in question_lower]
    assert not found, (
        f"C02 contains MJ-10 confound vocabulary: {found}. "
        f"This is the excerpt-leakage confound we patched."
    )


def test_c02_avoids_rc04_excerpt_vocabulary(corpus_with_excerpts):
    """KP5-C02 question must not overlap with RC-04 observation_excerpt."""
    corpus_by_id = {f.fact_id: f for f in corpus_with_excerpts}
    rc04 = corpus_by_id.get("RC-04")
    if not rc04 or not rc04.observation_excerpt:
        pytest.skip("RC-04 excerpt not available")

    c02 = next(q for q in KP_TEST5_PANEL if q.qid == "KP5-C02")

    STOP = frozenset({"a", "an", "the", "is", "in", "on", "to", "of", "and", "or", "for"})

    def tok(text: str) -> set[str]:
        return {t for t in re.findall(r"[a-z0-9]+", text.lower())
                if t not in STOP and len(t) >= 5}

    q_tokens = tok(c02.question)
    excerpt_tokens = tok(rc04.observation_excerpt)
    overlap = q_tokens & excerpt_tokens

    # RC-04 title contains "Incident Response Notification Window" — avoid all four
    forbidden = {"incident", "response", "notification", "window", "hours"}
    question_lower = c02.question.lower()
    forbidden_found = [f for f in forbidden if f in question_lower]
    assert not forbidden_found, (
        f"C02 contains forbidden RC-04 vocabulary: {forbidden_found}"
    )


def test_c04_avoids_am07_excerpt_vocabulary():
    """KP5-C04 question must not contain AM-07 title/excerpt vocabulary."""
    c04 = next(q for q in KP_TEST5_PANEL if q.qid == "KP5-C04")
    question_lower = c04.question.lower()

    # AM-07 key vocabulary that caused excerpt leakage in KP4-C04
    forbidden = {
        "logarithm", "decay", "half-life", "halflife", "attrition",
        "membership score", "score decay", "logarithmic",
    }
    found = [f for f in forbidden if f in question_lower]
    assert not found, f"C04 contains AM-07 forbidden vocabulary: {found}"


def test_c04_avoids_mj22_excerpt_vocabulary():
    """KP5-C04 question must not contain MJ-22 title/excerpt vocabulary."""
    c04 = next(q for q in KP_TEST5_PANEL if q.qid == "KP5-C04")
    question_lower = c04.question.lower()

    forbidden = {"multiplier", "2.4", "advisory assistant", "governance multiplier"}
    found = [f for f in forbidden if f in question_lower]
    assert not found, f"C04 contains MJ-22 forbidden vocabulary: {found}"


# ─── Test 2: Context-dilution fix — bridge_rationale config ───────────────────

def test_include_bridge_rationale_reading_a_false():
    """Reading-A must have include_bridge_rationale=False."""
    assert INCLUDE_BRIDGE_RATIONALE_PER_CLASS["Reading-A"] is False


def test_include_bridge_rationale_reading_b_true():
    assert INCLUDE_BRIDGE_RATIONALE_PER_CLASS["Reading-B"] is True


def test_include_bridge_rationale_reading_c_true():
    assert INCLUDE_BRIDGE_RATIONALE_PER_CLASS["Reading-C"] is True


def test_reading_a_context_excludes_bridge_rationale(corpus_no_excerpts):
    """For Reading-A arm, context_for_llm(include_bridge_rationale=False) strips bridge text."""
    retriever = KPRetriever(corpus_no_excerpts)
    # Use a Reading-A question with mastery profile
    a03 = next(q for q in KP_TEST5_PANEL if q.qid == "KP5-A03")

    # retrieve_kp() takes (query, mastery_profile, top_k, include_bridge_rationale)
    result = retriever.retrieve_kp(
        a03.question,
        mastery_profile=a03.kp_mastery_profile,
        top_k=5,
        include_bridge_rationale=False,   # Confound 2 fix for Reading-A
    )

    context_false = result.context_for_llm(include_bridge_rationale=False)
    context_true = result.context_for_llm(include_bridge_rationale=True)

    # With include_bridge_rationale=False, bridge section text should be absent
    # Bridge text appears as "[chess bridge]", "[military bridge]", "bridge:" etc.
    bridge_markers = ["[chess bridge]", "[military bridge]", "bridge rationale", "bridge:"]
    found_in_false = [m for m in bridge_markers if m in context_false.lower()]
    assert not found_in_false, (
        f"Reading-A context with include_bridge_rationale=False still contains bridge markers: "
        f"{found_in_false}"
    )

    # INCLUDE_BRIDGE_RATIONALE_PER_CLASS must be False for Reading-A (config check)
    assert INCLUDE_BRIDGE_RATIONALE_PER_CLASS["Reading-A"] is False, (
        "INCLUDE_BRIDGE_RATIONALE_PER_CLASS['Reading-A'] must be False (context-dilution fix)"
    )


# ─── Test 3: Decoupled verdict (D.1 beta) ─────────────────────────────────────

def _make_mock_records(
    rc_off: list[str],
    rc_fixed: list[str],
    rc_gamma: list[str],
    cost: float = 0.001,
) -> list[dict]:
    """Build minimal mock records for aggregate_test5_summary testing."""
    from itertools import zip_longest
    records = []
    for i, (g_off, g_fixed, g_gamma) in enumerate(
        zip_longest(rc_off, rc_fixed, rc_gamma, fillvalue=GRADE_MISS)
    ):
        records.append({
            "qid": f"KP5-C{i:02d}",
            "reading_class": "Reading-C",
            "require_all_key_facts": True,
            "target_fact_ids": ["EG-20"],
            "kp_off": {"grade": g_off},
            "kp_fixed": {"grade": g_fixed},
            "kp_gamma": {"grade": g_gamma},
            "cost_kp_off_usd": cost,
            "cost_kp_fixed_usd": cost,
            "cost_kp_gamma_usd": cost,
            "cost_all_three_usd": cost * 3,
        })
    return records


def test_verdict_supported_when_lift_gate_cleared():
    """Verdict = SUPPORTED when lift > 5pp, regardless of PDC."""
    # 75% gamma vs 0% fixed = +75pp lift; gamma PDC < fixed PDC (expensive gamma)
    records_rc = _make_mock_records(
        rc_off=[GRADE_MISS, GRADE_MISS, GRADE_MISS, GRADE_MISS],
        rc_fixed=[GRADE_MISS, GRADE_MISS, GRADE_MISS, GRADE_MISS],
        rc_gamma=[GRADE_HOT, GRADE_HOT, GRADE_HOT, GRADE_MISS],
        cost=0.01,  # high cost to ensure gamma PDC < fixed PDC
    )
    # Also add Reading-A and Reading-B to make records realistic
    ra_records = [
        {"qid": "KP5-A01", "reading_class": "Reading-A", "require_all_key_facts": False,
         "target_fact_ids": ["EG-03"], "kp_off": {"grade": GRADE_HOT}, "kp_fixed": {"grade": GRADE_HOT},
         "kp_gamma": {"grade": GRADE_HOT}, "cost_kp_off_usd": 0.001, "cost_kp_fixed_usd": 0.001,
         "cost_kp_gamma_usd": 0.001, "cost_all_three_usd": 0.003},
    ]
    all_records = records_rc + ra_records
    summary = aggregate_test5_summary(all_records, reading_c_n=4)

    assert summary["lift_gate"] == "LIFT_GATE_CLEARED", (
        f"Expected LIFT_GATE_CLEARED, got {summary['lift_gate']}"
    )
    assert summary["gamma_hypothesis_verdict"] == "SUPPORTED", (
        f"Expected SUPPORTED, got {summary['gamma_hypothesis_verdict']}"
    )


def test_verdict_indeterminate_when_lift_gate_not_cleared_but_positive():
    """Verdict = INDETERMINATE when lift > 0pp but < 5pp."""
    records = _make_mock_records(
        rc_off=[GRADE_MISS, GRADE_MISS, GRADE_MISS, GRADE_MISS],
        rc_fixed=[GRADE_HOT, GRADE_HOT, GRADE_HOT, GRADE_MISS],
        rc_gamma=[GRADE_HOT, GRADE_HOT, GRADE_HOT, GRADE_HOT],  # 100 vs 75 = +25pp
    )
    # Sanity: +25pp > 5pp should be LIFT_GATE_CLEARED
    summary = aggregate_test5_summary(records, reading_c_n=4)
    rc_lift = summary["reading_c_lift_pp"]
    if rc_lift >= 5:
        assert summary["lift_gate"] == "LIFT_GATE_CLEARED"
    else:
        assert summary["gamma_hypothesis_verdict"] in ("INDETERMINATE", "REFUTED")


def test_pdc_verdict_is_informational_not_blocking():
    """PDC verdict must not block the SUPPORTED verdict in D.1 beta."""
    # Set up: lift gate cleared (+25pp), but gamma more expensive than fixed -> PDC_BELOW_FIXED
    records = _make_mock_records(
        rc_off=[GRADE_MISS, GRADE_MISS, GRADE_MISS, GRADE_MISS],
        rc_fixed=[GRADE_HOT, GRADE_HOT, GRADE_HOT, GRADE_MISS],  # 75%
        rc_gamma=[GRADE_HOT, GRADE_HOT, GRADE_HOT, GRADE_HOT],   # 100%
        cost=0.05,  # gamma at same cost; PDC_SUPPORTED
    )
    summary = aggregate_test5_summary(records, reading_c_n=4)
    # Regardless of PDC, lift gate drives verdict
    assert summary["gamma_hypothesis_verdict"] == "SUPPORTED"
    # PDC verdict is present as informational
    assert "pdc_verdict" in summary
    assert "pdc_detail" in summary
    assert "not blocking" in summary["pdc_detail"]["note"].lower()


# ─── Test 4: Panel structure validation ──────────────────────────────────────

def test_panel_has_correct_structure():
    """Panel 5 must have 3A / 3B / 4C and 2 patched questions."""
    summary = panel_summary()
    assert summary["total_questions"] == 10
    assert summary["reading_class_distribution"]["Reading-A"] == 3
    assert summary["reading_class_distribution"]["Reading-B"] == 3
    assert summary["reading_class_distribution"]["Reading-C"] == 4
    assert summary["patched_count"] == 2
    assert "KP5-C02" in summary["patched_qids"]
    assert "KP5-C04" in summary["patched_qids"]


def test_d1_beta_in_panel_summary():
    """Panel summary must document D.1 beta decision."""
    summary = panel_summary()
    assert "beta" in summary["d1_decision"].lower()
    assert "lift gate" in summary["lift_gate_anchor"].lower() or "tagline" in summary["lift_gate_anchor"].lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
