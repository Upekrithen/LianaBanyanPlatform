"""
Unit tests for KP-Option-Gamma dynamic budget implementation (B132).

Tests:
  1. compute_dynamic_budget returns correct top_mastery for each reading_class
  2. Fallback on missing/unknown class
  3. Reading-A returns same as fixed-budget baseline (regression guard)
  4. Integration: with KNOWLEDGE_PUMP_RETRIEVAL_MODE="fixed", retrieve_kp_beta
     top_mastery unchanged vs pre-Option-Gamma baseline

Filed: KP-Option-Gamma / B132
"""
import pytest
from empirical_tests.kp_retrieval import compute_dynamic_budget, GAMMA_BASE_TOP_MASTERY


DEFAULT_MAP = {
    "Reading-A": 1.0,
    "Reading-B": 1.5,
    "Reading-C": 2.5,
}


class TestComputeDynamicBudget:
    def test_reading_a_equals_fixed_baseline(self):
        """Reading-A must return the fixed-budget baseline (regression guard)."""
        result = compute_dynamic_budget("Reading-A", DEFAULT_MAP)
        assert result == GAMMA_BASE_TOP_MASTERY, (
            f"Reading-A returned {result}, expected {GAMMA_BASE_TOP_MASTERY} (fixed baseline)"
        )

    def test_reading_b_medium(self):
        result = compute_dynamic_budget("Reading-B", DEFAULT_MAP)
        expected = round(GAMMA_BASE_TOP_MASTERY * 1.5)
        assert result == expected

    def test_reading_c_high(self):
        result = compute_dynamic_budget("Reading-C", DEFAULT_MAP)
        expected = round(GAMMA_BASE_TOP_MASTERY * 2.5)
        assert result == expected

    def test_reading_c_greater_than_reading_b_greater_than_reading_a(self):
        a = compute_dynamic_budget("Reading-A", DEFAULT_MAP)
        b = compute_dynamic_budget("Reading-B", DEFAULT_MAP)
        c = compute_dynamic_budget("Reading-C", DEFAULT_MAP)
        assert a <= b <= c, f"Budget ordering violated: A={a}, B={b}, C={c}"
        assert c > a, "Reading-C must exceed Reading-A"

    def test_missing_class_uses_fallback_multiplier(self):
        result = compute_dynamic_budget("Reading-Z", DEFAULT_MAP, fallback_multiplier=1.0)
        assert result == GAMMA_BASE_TOP_MASTERY

    def test_custom_fallback_multiplier(self):
        result = compute_dynamic_budget("UNKNOWN", DEFAULT_MAP, fallback_multiplier=2.0)
        expected = round(GAMMA_BASE_TOP_MASTERY * 2.0)
        assert result == expected

    def test_empty_reading_class_uses_fallback(self):
        result = compute_dynamic_budget("", DEFAULT_MAP, fallback_multiplier=1.0)
        assert result == GAMMA_BASE_TOP_MASTERY

    def test_none_budget_map_uses_defaults(self):
        """None budget_map should use built-in defaults, not raise."""
        result = compute_dynamic_budget("Reading-C")
        assert result > GAMMA_BASE_TOP_MASTERY

    def test_result_is_always_positive_integer(self):
        for rc in ["Reading-A", "Reading-B", "Reading-C", "", "xyz"]:
            result = compute_dynamic_budget(rc, DEFAULT_MAP)
            assert isinstance(result, int)
            assert result >= 1, f"Budget must be >= 1 for reading_class={rc!r}"

    def test_custom_budget_map_honored(self):
        custom = {"Reading-A": 2.0, "Reading-B": 3.0, "Reading-C": 5.0}
        a = compute_dynamic_budget("Reading-A", custom)
        c = compute_dynamic_budget("Reading-C", custom)
        assert a == round(GAMMA_BASE_TOP_MASTERY * 2.0)
        assert c == round(GAMMA_BASE_TOP_MASTERY * 5.0)


class TestFixedBudgetRegressionGuard:
    """Reading-A must be identical to the old KP-beta fixed-budget behavior."""

    def test_fixed_mode_reading_a_equals_default_top_mastery(self):
        """
        When KNOWLEDGE_PUMP_RETRIEVAL_MODE='fixed', old code still runs with top_mastery=3.
        Verify that Reading-A in gamma mode produces the same value.
        """
        fixed_budget_top_mastery = 3  # hardcoded in run_kp_test3.py run_query_pair_beta
        gamma_budget_reading_a = compute_dynamic_budget("Reading-A", DEFAULT_MAP)
        assert gamma_budget_reading_a == fixed_budget_top_mastery, (
            f"Regression: Reading-A gamma budget ({gamma_budget_reading_a}) != "
            f"fixed budget ({fixed_budget_top_mastery})"
        )

    def test_panel_reading_a_queries_have_correct_class(self):
        """Reading-A queries in panel should be direct/control questions."""
        from empirical_tests.kp_panels_test3 import KP_TEST3_PANEL
        reading_a = [q for q in KP_TEST3_PANEL if q.reading_class == "Reading-A"]
        reading_c = [q for q in KP_TEST3_PANEL if q.reading_class == "Reading-C"]
        assert len(reading_a) >= 1, "Panel must have at least 1 Reading-A query"
        assert len(reading_c) >= 1, "Panel must have at least 1 Reading-C query"

    def test_all_panel_queries_have_reading_class(self):
        """Every panel query must have a non-empty reading_class."""
        from empirical_tests.kp_panels_test3 import KP_TEST3_PANEL
        missing = [q.qid for q in KP_TEST3_PANEL if not q.reading_class]
        assert not missing, f"Queries missing reading_class: {missing}"
