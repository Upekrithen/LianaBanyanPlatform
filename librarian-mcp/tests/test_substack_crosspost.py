"""
test_substack_crosspost.py — K478/B122 Tests for substack_crosspost.py
"""
from __future__ import annotations

import sys
import textwrap
from pathlib import Path

import pytest

# Make the scripts directory importable
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))

from substack_crosspost import (  # type: ignore
    CrosspostReport,
    normalize_line,
    check_keystone_preservation,
    check_empirical_claims,
    extract_spoonful_candidates,
    process_article,
    build_substack_header,
    build_spoonful_notes_block,
    build_voice_report_block,
)


SAMPLE_PUDDING = textwrap.dedent("""\
    # We Built the Best AI For You

    This is a paragraph about how you should come inside our ecosystem.

    ## How much are you overpaying?

    Studies show significantly better results. The accuracy was 86.1% — measured internally.

    ## Why federation matters

    "Nothing about us without us." This is the governance anchor.

    ## Reins and sovereignty

    We hand them the reins of our very fast horse.

    ### A rising tide

    A rising tide lifts all boats. And I think I've built a system of wells.
""")


def make_tmp_article(tmp_path: Path, content: str) -> Path:
    article = tmp_path / "sample_pudding.md"
    article.write_text(content, encoding="utf-8")
    return article


# ─── Anti-pattern normalization ───────────────────────────────────────────────

class TestNormalizeLine:
    def test_best_ai_replaced(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        result = normalize_line("We've built the best AI for you", 1, report)
        assert "best ai for you" not in result.lower()
        assert len(report.anti_pattern_hits) == 1

    def test_walled_garden_replaced(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        result = normalize_line("Come inside our ecosystem today.", 2, report)
        assert "ecosystem" not in result.lower() or "[FLAG" in result or "commons" in result.lower()

    def test_significantly_better_flagged(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        result = normalize_line("Results were significantly better.", 3, report)
        assert "[NEEDS MEASUREMENT" in result
        assert len(report.anti_pattern_hits) == 1

    def test_clean_line_unchanged(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        line = "The architecture routes queries to the optimal model."
        result = normalize_line(line, 4, report)
        assert result == line
        assert len(report.anti_pattern_hits) == 0


# ─── Keystone preservation ────────────────────────────────────────────────────

class TestKeystonePreservation:
    def test_reins_keystone_found(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_keystone_preservation("We hand them the reins of our very fast horse.", report)
        assert "#17 reins" in report.keystone_found

    def test_system_of_wells_found(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_keystone_preservation("I think I've built a system of wells.", report)
        assert "#14 system-of-wells" in report.keystone_found

    def test_nothing_about_us_found(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_keystone_preservation("Nothing about us without us.", report)
        assert "#6 nothing-about-us" in report.keystone_found

    def test_no_keystone_in_clean_line(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_keystone_preservation("The Librarian stores your proprietary knowledge.", report)
        assert len(report.keystone_found) == 0


# ─── Empirical claim flagging ─────────────────────────────────────────────────

class TestEmpiricalClaims:
    def test_uncited_percentage_flagged(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_empirical_claims("The accuracy was 86.1% on our internal test.", 10, report)
        assert len(report.empirical_flags) == 1

    def test_cited_percentage_not_flagged(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_empirical_claims("K475 benchmark: 18% HOT on Cranewell corpus (N=50).", 11, report)
        assert len(report.empirical_flags) == 0

    def test_no_number_not_flagged(self):
        report = CrosspostReport(source_file=Path("dummy.md"))
        check_empirical_claims("The Cathedral routes queries to relevant tablets.", 12, report)
        assert len(report.empirical_flags) == 0


# ─── Spoonful candidates extraction ──────────────────────────────────────────

class TestSpoonfulsExtraction:
    def test_h2_sections_extracted(self):
        lines = SAMPLE_PUDDING.splitlines()
        report = CrosspostReport(source_file=Path("dummy.md"))
        extract_spoonful_candidates(lines, report)
        headings = [h for h, _ in report.spoonful_candidates]
        assert any("overpaying" in h.lower() for h in headings)

    def test_h3_sections_also_extracted(self):
        lines = SAMPLE_PUDDING.splitlines()
        report = CrosspostReport(source_file=Path("dummy.md"))
        extract_spoonful_candidates(lines, report)
        headings = [h for h, _ in report.spoonful_candidates]
        assert any("rising tide" in h.lower() for h in headings)

    def test_at_least_two_candidates(self):
        lines = SAMPLE_PUDDING.splitlines()
        report = CrosspostReport(source_file=Path("dummy.md"))
        extract_spoonful_candidates(lines, report)
        assert len(report.spoonful_candidates) >= 2


# ─── Full pipeline (integration) ─────────────────────────────────────────────

class TestFullPipeline:
    def test_process_article_returns_report(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        assert isinstance(report, CrosspostReport)
        assert report.source_file == article

    def test_process_article_detects_anti_patterns(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        assert len(report.anti_pattern_hits) > 0

    def test_process_article_finds_keystones(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        assert len(report.keystone_found) > 0

    def test_process_article_flags_empiricals(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        assert len(report.empirical_flags) > 0

    def test_normalized_lines_same_count(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        source_lines = SAMPLE_PUDDING.splitlines()
        assert len(report.normalized_lines) == len(source_lines)

    def test_spoonful_block_built(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        block = build_spoonful_notes_block(report.spoonful_candidates)
        block_text = "\n".join(block)
        assert "Substack Notes Candidates" in block_text or "Same-Week Spoonfuls" in block_text

    def test_voice_report_block_includes_publication_hold(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        block = build_voice_report_block(report)
        block_text = "\n".join(block)
        assert "Publication hold" in block_text or "Prov 14" in block_text

    def test_header_includes_source_filename(self, tmp_path):
        article = make_tmp_article(tmp_path, SAMPLE_PUDDING)
        report = process_article(article)
        header = build_substack_header(article)
        header_text = "\n".join(header)
        assert article.name in header_text


# ─── Clean-article regression ─────────────────────────────────────────────────

CLEAN_ARTICLE = textwrap.dedent("""\
    # Here's the Horse — You Drive

    We built infrastructure, not an oracle. The architecture routes.

    ## What the Cathedral does

    K475 benchmark: 18% HOT on Cranewell (N=50, Perplexity-in-Comet, R10 rubric).
    We hand them the reins of our very fast horse.

    ## Nothing about us without us

    The commons architecture is designed by the people who use it.
""")


class TestCleanArticle:
    def test_no_anti_patterns_in_clean_article(self, tmp_path):
        article = make_tmp_article(tmp_path, CLEAN_ARTICLE)
        report = process_article(article)
        assert len(report.anti_pattern_hits) == 0

    def test_keystones_in_clean_article(self, tmp_path):
        article = make_tmp_article(tmp_path, CLEAN_ARTICLE)
        report = process_article(article)
        assert len(report.keystone_found) >= 2

    def test_no_empirical_flags_in_cited_article(self, tmp_path):
        article = make_tmp_article(tmp_path, CLEAN_ARTICLE)
        report = process_article(article)
        assert len(report.empirical_flags) == 0
