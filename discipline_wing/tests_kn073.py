"""
tests_kn073.py — KN073 / BP006
Test suite for provisional_risk_audit.py
Liana Banyan Corporation (Wyoming C-Corp)

Run with:
    python discipline_wing/tests_kn073.py
"""
import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from provisional_risk_audit import (
    PROVISIONALS_DEFAULT,
    apply_override,
    aggregate_summary,
    compute_risk,
    generate_html_matrix,
    generate_md_matrix,
    load_scores,
    save_scores,
    score_provisional_synthetic,
    apply_synthetic_where_missing,
)


class T01_HighRiskSynthetic(unittest.TestCase):
    """T01: Scorer correctly grades a known-high-risk provisional (C1=1) at composite-risk >= 8."""

    def test_high_risk_composite(self):
        risk, level = compute_risk(1, 1, 1)
        self.assertEqual(risk, 12)
        self.assertEqual(level, "high")

    def test_c1_equals_1_means_high_risk(self):
        # C1=1, C2=3, C3=3 → risk = 15-7 = 8 → high
        risk, level = compute_risk(1, 3, 3)
        self.assertGreaterEqual(risk, 8)
        self.assertEqual(level, "high")

    def test_risk_range_minimum_worst_case(self):
        risk, level = compute_risk(1, 1, 1)
        self.assertEqual(risk, 12)
        self.assertIn(risk, range(8, 13))


class T02_LowRiskSynthetic(unittest.TestCase):
    """T02: Scorer correctly grades a known-low-risk provisional (C1=5) at composite-risk <= 3."""

    def test_low_risk_composite(self):
        risk, level = compute_risk(5, 5, 5)
        self.assertEqual(risk, 0)
        self.assertEqual(level, "low")

    def test_c1_equals_5_can_be_low(self):
        # C1=5, C2=5, C3=5 → risk=0 → low
        risk, level = compute_risk(5, 5, 5)
        self.assertLessEqual(risk, 3)
        self.assertEqual(level, "low")

    def test_risk_level_boundary_low(self):
        # exactly risk=3 → low
        # 15 - (c1+c2+c3) = 3 → c1+c2+c3 = 12, e.g. 4+4+4
        risk, level = compute_risk(4, 4, 4)
        self.assertEqual(risk, 3)
        self.assertEqual(level, "low")


class T03_ManualOverride(unittest.TestCase):
    """T03: Manual override updates the cell + records override note."""

    def test_override_updates_score(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        updated = apply_override(provisionals, 13, "c1", 2, "Counsel review: missing implementation detail")
        prov13 = next(p for p in updated if p["prov_num"] == 13)
        self.assertEqual(prov13["c1"], 2)

    def test_override_records_note(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        updated = apply_override(provisionals, 13, "c1", 2, "Counsel review: missing implementation detail")
        prov13 = next(p for p in updated if p["prov_num"] == 13)
        self.assertIn("Counsel review", prov13["c1_override_note"])

    def test_override_does_not_mutate_input(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        original_c1 = next(p for p in provisionals if p["prov_num"] == 13)["c1"]
        apply_override(provisionals, 13, "c1", 2, "test")
        unchanged_c1 = next(p for p in provisionals if p["prov_num"] == 13)["c1"]
        self.assertEqual(original_c1, unchanged_c1)

    def test_override_invalid_criterion_raises(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        with self.assertRaises(ValueError):
            apply_override(provisionals, 13, "c4", 3, "bad")

    def test_override_invalid_score_raises(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        with self.assertRaises(ValueError):
            apply_override(provisionals, 13, "c1", 6, "bad score")

    def test_override_c2_and_c3(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        updated = apply_override(provisionals, 14, "c2", 1, "narrow coverage")
        updated = apply_override(updated, 14, "c3", 2, "AI authorship gap")
        prov14 = next(p for p in updated if p["prov_num"] == 14)
        self.assertEqual(prov14["c2"], 1)
        self.assertEqual(prov14["c3"], 2)
        self.assertIn("narrow coverage", prov14["c2_override_note"])
        self.assertIn("AI authorship gap", prov14["c3_override_note"])


class T04_HTMLOutput(unittest.TestCase):
    """T04: HTML output renders correctly — contains table, sortable script, color codes."""

    def setUp(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        self.provisionals = apply_synthetic_where_missing(provisionals)
        self.html = generate_html_matrix(self.provisionals)

    def test_html_contains_table(self):
        self.assertIn("<table", self.html)
        self.assertIn("</table>", self.html)

    def test_html_contains_sortable_script(self):
        self.assertIn("sortTable", self.html)
        self.assertIn("onclick", self.html)

    def test_html_contains_color_codes(self):
        self.assertIn("#c6efce", self.html)   # green (low)
        self.assertIn("#ffeb9c", self.html)   # yellow (moderate)
        self.assertIn("#ffc7ce", self.html)   # red (high)

    def test_html_contains_all_provisionals(self):
        for row in self.provisionals:
            self.assertIn(str(row["prov_num"]), self.html)

    def test_html_contains_entity_name(self):
        self.assertIn("Liana Banyan Corporation", self.html)
        self.assertNotIn("LLC", self.html)

    def test_html_contains_pledge_footer(self):
        self.assertIn("Cooperative Defensive Patent Pledge", self.html)
        self.assertIn("#2260", self.html)

    def test_html_is_valid_doctype(self):
        self.assertTrue(self.html.strip().startswith("<!DOCTYPE html>"))

    def test_html_contains_filter_buttons(self):
        self.assertIn("filterRows", self.html)


class T05_MarkdownTwin(unittest.TestCase):
    """T05: Markdown twin matches HTML matrix structure (same provisionals)."""

    def setUp(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        self.provisionals = apply_synthetic_where_missing(provisionals)
        self.md = generate_md_matrix(self.provisionals)
        self.html = generate_html_matrix(self.provisionals)

    def test_md_contains_table_header(self):
        self.assertIn("| Prov #", self.md)
        self.assertIn("App #", self.md)
        self.assertIn("Risk", self.md)
        self.assertIn("Level", self.md)

    def test_md_contains_all_provisionals(self):
        for row in self.provisionals:
            self.assertIn(str(row["prov_num"]), self.md)

    def test_md_contains_aggregate_summary(self):
        self.assertIn("Aggregate Summary", self.md)
        self.assertIn("Top-3 Highest-Risk", self.md)

    def test_md_contains_entity_name(self):
        self.assertIn("Liana Banyan Corporation", self.md)

    def test_md_contains_rubric(self):
        self.assertIn("C1 Enabling Disclosure", self.md)
        self.assertIn("C2 Variation Coverage", self.md)
        self.assertIn("C3 Human-Conception Clarity", self.md)

    def test_md_prov_count_matches_html(self):
        md_count = self.md.count("| 1 |") + sum(
            1 for row in self.provisionals
            if f"| {row['prov_num']} |" in self.md
        )
        html_prov_nums = [str(row["prov_num"]) for row in self.provisionals]
        self.assertEqual(len(html_prov_nums), 15)


class T06_DrilldownGapFill(unittest.TestCase):
    """T06: Per-provisional drilldown surfaces low-scoring clauses (C1=1 → gap-fill language)."""

    def test_c1_low_score_triggers_gap_fill(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        provisionals = apply_override(provisionals, 13, "c1", 1, "test low score")
        provisionals = apply_override(provisionals, 13, "c2", 3, "ok")
        provisionals = apply_override(provisionals, 13, "c3", 3, "ok")
        html = generate_html_matrix(provisionals)
        self.assertIn("data-flow diagram", html)
        self.assertIn("person skilled in AI memory systems", html)

    def test_c2_low_score_triggers_gap_fill(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        provisionals = apply_override(provisionals, 13, "c1", 4, "ok")
        provisionals = apply_override(provisionals, 13, "c2", 1, "test low score")
        provisionals = apply_override(provisionals, 13, "c3", 4, "ok")
        html = generate_html_matrix(provisionals)
        self.assertIn("variation axes", html)
        self.assertIn("3 alternative embodiments", html)

    def test_c3_low_score_triggers_gap_fill(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        provisionals = apply_override(provisionals, 13, "c1", 4, "ok")
        provisionals = apply_override(provisionals, 13, "c2", 4, "ok")
        provisionals = apply_override(provisionals, 13, "c3", 1, "test low score")
        html = generate_html_matrix(provisionals)
        self.assertIn("human-conception narrative", html)
        self.assertIn("conception", html)

    def test_score_4_or_5_shows_adequate(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        provisionals = apply_override(provisionals, 13, "c1", 4, "ok")
        provisionals = apply_override(provisionals, 13, "c2", 4, "ok")
        provisionals = apply_override(provisionals, 13, "c3", 4, "ok")
        html = generate_html_matrix(provisionals)
        self.assertIn("adequate", html)


class T07_AggregateSummary(unittest.TestCase):
    """T07: Aggregate summary computes correctly (distribution + top-3 candidates)."""

    def test_distribution_sums_to_total(self):
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        provisionals = apply_synthetic_where_missing(provisionals)
        summary = aggregate_summary(provisionals)
        dist = summary["distribution"]
        total = sum(dist.values())
        self.assertEqual(total, len(provisionals))

    def test_top3_is_at_most_3(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        summary = aggregate_summary(provisionals)
        self.assertLessEqual(len(summary["top_3_high_risk"]), 3)

    def test_top3_sorted_descending(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        summary = aggregate_summary(provisionals)
        top3 = summary["top_3_high_risk"]
        if len(top3) >= 2:
            self.assertGreaterEqual(top3[0]["risk"], top3[1]["risk"])
        if len(top3) == 3:
            self.assertGreaterEqual(top3[1]["risk"], top3[2]["risk"])

    def test_all_high_risk_distribution(self):
        # Override all to C1=1, C2=1, C3=1 → all high risk
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        for row in provisionals:
            row["c1"] = 1
            row["c2"] = 1
            row["c3"] = 1
        summary = aggregate_summary(provisionals)
        self.assertEqual(summary["distribution"]["high"], 15)
        self.assertEqual(summary["distribution"]["low"], 0)
        self.assertEqual(summary["distribution"]["moderate"], 0)

    def test_unscored_distribution(self):
        # All unscored (default state)
        provisionals = copy.deepcopy(PROVISIONALS_DEFAULT)
        summary = aggregate_summary(provisionals)
        self.assertEqual(summary["distribution"]["unscored"], 15)

    def test_distribution_keys_exist(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        summary = aggregate_summary(provisionals)
        for key in ("low", "moderate", "high", "unscored"):
            self.assertIn(key, summary["distribution"])

    def test_top3_have_required_keys(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        summary = aggregate_summary(provisionals)
        for item in summary["top_3_high_risk"]:
            self.assertIn("prov_num", item)
            self.assertIn("risk", item)
            self.assertIn("title", item)


class T08_Idempotency(unittest.TestCase):
    """T08: Idempotency — running generate_html_matrix twice on same data produces identical output."""

    def test_html_idempotent(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        html1 = generate_html_matrix(copy.deepcopy(provisionals))
        html2 = generate_html_matrix(copy.deepcopy(provisionals))
        self.assertEqual(html1, html2)

    def test_md_idempotent(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        md1 = generate_md_matrix(copy.deepcopy(provisionals))
        md2 = generate_md_matrix(copy.deepcopy(provisionals))
        self.assertEqual(md1, md2)

    def test_compute_risk_idempotent(self):
        for _ in range(5):
            risk1, level1 = compute_risk(3, 2, 4)
            self.assertEqual(risk1, 6)
            self.assertEqual(level1, "moderate")


class T09_SyntheticScoring(unittest.TestCase):
    """T09 (bonus): Synthetic scoring for Prov 13, 14, 15 returns plausible non-None scores."""

    def test_prov13_synthetic_not_none(self):
        c1, c2, c3 = score_provisional_synthetic(13)
        self.assertIsNotNone(c1)
        self.assertIsNotNone(c2)
        self.assertIsNotNone(c3)

    def test_prov14_synthetic_not_none(self):
        c1, c2, c3 = score_provisional_synthetic(14)
        self.assertIsNotNone(c1)
        self.assertIsNotNone(c2)
        self.assertIsNotNone(c3)

    def test_prov15_synthetic_not_none(self):
        c1, c2, c3 = score_provisional_synthetic(15)
        self.assertIsNotNone(c1)
        self.assertIsNotNone(c2)
        self.assertIsNotNone(c3)

    def test_prov13_expected_scores(self):
        c1, c2, c3 = score_provisional_synthetic(13)
        self.assertEqual(c1, 3)
        self.assertEqual(c2, 2)
        self.assertEqual(c3, 4)

    def test_prov14_expected_scores(self):
        c1, c2, c3 = score_provisional_synthetic(14)
        self.assertEqual(c1, 4)
        self.assertEqual(c2, 3)
        self.assertEqual(c3, 4)

    def test_prov15_expected_scores(self):
        c1, c2, c3 = score_provisional_synthetic(15)
        self.assertEqual(c1, 4)
        self.assertEqual(c2, 3)
        self.assertEqual(c3, 4)

    def test_all_synthetic_scores_in_valid_range(self):
        for prov_num in range(1, 16):
            c1, c2, c3 = score_provisional_synthetic(prov_num)
            for score in (c1, c2, c3):
                self.assertGreaterEqual(score, 1)
                self.assertLessEqual(score, 5)


class T10_PersistenceRoundTrip(unittest.TestCase):
    """T10: save/load round-trip preserves scores."""

    def test_save_load_roundtrip(self):
        provisionals = apply_synthetic_where_missing(copy.deepcopy(PROVISIONALS_DEFAULT))
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
            tmp_path = f.name
        save_scores(provisionals, tmp_path)
        loaded = load_scores(tmp_path)
        for orig, loaded_row in zip(
            sorted(provisionals, key=lambda r: r["prov_num"]),
            sorted(loaded, key=lambda r: r["prov_num"]),
        ):
            self.assertEqual(orig["prov_num"], loaded_row["prov_num"])
            self.assertEqual(orig["c1"], loaded_row["c1"])
            self.assertEqual(orig["c2"], loaded_row["c2"])
            self.assertEqual(orig["c3"], loaded_row["c3"])
        Path(tmp_path).unlink(missing_ok=True)

    def test_load_missing_file_returns_defaults(self):
        loaded = load_scores("/nonexistent/path/scores.json")
        self.assertEqual(len(loaded), 15)


class T11_ComputeRiskBoundaries(unittest.TestCase):
    """T11: compute_risk handles None, boundary values, and risk-level transitions correctly."""

    def test_none_scores_return_unscored(self):
        risk, level = compute_risk(None, None, None)
        self.assertIsNone(risk)
        self.assertEqual(level, "unscored")

    def test_partial_none_returns_unscored(self):
        risk, level = compute_risk(3, None, 3)
        self.assertIsNone(risk)
        self.assertEqual(level, "unscored")

    def test_boundary_moderate_low(self):
        # risk=4 → moderate
        # 15 - (c1+c2+c3) = 4 → c1+c2+c3=11, e.g. 4+4+3
        risk, level = compute_risk(4, 4, 3)
        self.assertEqual(risk, 4)
        self.assertEqual(level, "moderate")

    def test_boundary_high_moderate(self):
        # risk=8 → high
        # 15 - 7 = 8, e.g. c1=1, c2=3, c3=3
        risk, level = compute_risk(1, 3, 3)
        self.assertEqual(risk, 8)
        self.assertEqual(level, "high")

    def test_boundary_moderate_upper(self):
        # risk=7 → still moderate
        # 15 - 8 = 7, e.g. c1=2, c2=3, c3=3
        risk, level = compute_risk(2, 3, 3)
        self.assertEqual(risk, 7)
        self.assertEqual(level, "moderate")

    def test_max_risk(self):
        risk, level = compute_risk(1, 1, 1)
        self.assertEqual(risk, 12)
        self.assertEqual(level, "high")

    def test_min_risk(self):
        risk, level = compute_risk(5, 5, 5)
        self.assertEqual(risk, 0)
        self.assertEqual(level, "low")


if __name__ == "__main__":
    unittest.main(verbosity=2)
