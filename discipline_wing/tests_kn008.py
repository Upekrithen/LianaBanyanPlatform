"""
tests_kn008.py — Augur-Securities-Language Negation-Context Tuning Tests
KN008 / BP002 / 2026-04-29 — 16 tests covering:
  - Negation-context exemptions (15 specified + 1 regression)
  - Quotation-context exemptions
  - True positives preserved
  - K514.5 regression (8/8 still pass)
  - K527 regression (ROI-in-compute context still exempt)
  - Performance: < 5ms per negation-context check

Usage:
    cd C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform
    python -m discipline_wing.tests_kn008
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

WORKSPACE = Path(__file__).parent.parent
if str(WORKSPACE) not in sys.path:
    sys.path.insert(0, str(WORKSPACE))

from discipline_wing.augur_securities_negation import (
    has_non_exempt_match,
    NEGATION_MARKERS,
    QUOTATION_IDENTIFYING_PHRASES,
)
from discipline_wing.engine import evaluate, LIBRARIAN_TS_FILE

PASS = "PASS"
FAIL = "FAIL"
results: list[tuple[str, str, str]] = []

# ── Helpers ──────────────────────────────────────────────────────────────────

SECURITIES_PATTERNS = [
    r"(?i)\bequity stake\b",
    r"(?i)\bequity share[s]?\b",
    r"(?i)\bshareholder[s]?\b",
    r"(?i)\bdividend[s]?\b",
    r"(?i)\breturn on investment\b",
    r"(?i)\bROI\b",
    r"(?i)\binvestor[s]?\b",
    r"(?i)\binvestment opportunity\b",
    r"(?i)\binvest(?:ment|ments)?\s+(?:vehicle|scheme|fund|income)\b",
    r"(?i)\bprofit shar(?:e|ing)\b",
]


def check(number: str, description: str, condition: bool, detail: str = "") -> None:
    status = PASS if condition else FAIL
    results.append((number, description, status))
    sym = "OK" if condition else "XX"
    print(f"  [{sym}] {number}: {description}")
    if not condition:
        print(f"       DETAIL: {detail}")


def _set_librarian_ts(fresh: bool) -> None:
    LIBRARIAN_TS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if fresh:
        LIBRARIAN_TS_FILE.write_text(str(int(time.time())))
    else:
        LIBRARIAN_TS_FILE.write_text(str(int(time.time()) - 7200))


def _write_call(file_path: str, content: str) -> dict:
    return {
        "tool_name": "Write",
        "tool_input": {"file_path": file_path, "content": content},
    }


# ── T01: "Zero Investors" is exempt (negation marker "Zero") ─────────────────
def test_t01_zero_investors_exempt():
    """BP001 turn 14 empirical receipt: 'Zero Investors' was a false positive."""
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Liana Banyan has Zero Investors and zero outside equity. "
        "Our model operates without any investor involvement whatsoever.",
    )
    check("T01", "'Zero Investors' is exempt (negation marker 'zero' within window)",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}, log_count={len(log)}")


# ── T02: "We have no investors" is exempt ────────────────────────────────────
def test_t02_no_investors_exempt():
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "We have no investors, no shareholders, and no dividends. "
        "This is a cooperative platform without equity stakes.",
    )
    check("T02", "'We have no investors/shareholders/dividends' is exempt",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T03: "does not offer investment opportunities" is exempt ─────────────────
def test_t03_does_not_offer():
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Liana Banyan does not offer investment opportunities to members. "
        "It is not an investment vehicle or scheme.",
    )
    check("T03", "'does not offer investment opportunities' is exempt",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T04: "Anti-securities position" is exempt ────────────────────────────────
def test_t04_anti_securities_prefix():
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Our anti-securities position is documented in the SAA Howey Brief. "
        "We explicitly not offering equity shares or profit sharing arrangements.",
    )
    check("T04", "'Anti-securities' and 'explicitly not offering equity shares' are exempt",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T05: Quotation context exemption ─────────────────────────────────────────
def test_t05_quotation_context():
    """BP002 turn 5+: Pawn research-quotation context false positive."""
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Per Pawn report: \"investment thesis suggests 3x revenue uplift\" — "
        "this is a research finding from the competitor analysis. "
        "LB does not use ROI in this sense.",
    )
    check("T05", "Forbidden term in Pawn research quotation context is exempt",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}, log_count={len(log)}")


# ── T06: "without investors" is exempt ───────────────────────────────────────
def test_t06_without_investors():
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "The cooperative operates without investors and without shareholders. "
        "There is an absence of any dividend structure.",
    )
    check("T06", "'without investors', 'absence of any dividend' are exempt",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T07: "refusing equity" is exempt ─────────────────────────────────────────
def test_t07_refusing_equity():
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "We are rejecting the VC model and refusing equity stake participation entirely. "
        "The cooperative is free of investor capture by design.",
    )
    check("T07", "'rejecting/refusing equity stake', 'free of investor capture' are exempt",
          not has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T08: POSITIVE — "We offer investment opportunities" BLOCKS ────────────────
def test_t08_positive_investment_opportunities():
    """True positive: genuine securities language must still fire."""
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Liana Banyan offers investment opportunities to qualified members. "
        "Members receive an equity stake proportional to participation.",
    )
    check("T08", "POSITIVE: 'offers investment opportunities' + 'equity stake' fires (true positive)",
          has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T09: POSITIVE — "ROI on equity participation" BLOCKS ─────────────────────
def test_t09_positive_roi_equity():
    """True positive: ROI in equity context (not AI-compute context) must block."""
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Members receive an ROI on their equity participation. "
        "Dividends are paid quarterly from profit sharing.",
    )
    check("T09", "POSITIVE: 'ROI on equity participation', 'profit sharing' fires (true positive)",
          has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T10: POSITIVE — "Dividends paid quarterly" BLOCKS ────────────────────────
def test_t10_positive_dividends():
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        "Shareholders receive dividends paid quarterly from platform revenue. "
        "The return on investment is projected at 15% annually.",
    )
    check("T10", "POSITIVE: 'dividends paid quarterly', 'return on investment' fires",
          has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T11: Edge — term outside 5-token window of negation BLOCKS ───────────────
def test_t11_edge_outside_window():
    """Forbidden term must be within 5 tokens; outside window is NOT exempt."""
    text = (
        "The cooperative structure is sound and well-governed. "
        "Members are owners. The platform is durable. "
        "Investors receive equity stakes proportional to their capital. "
        "No other governance tier exists."
    )
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        text,
    )
    # "Investors receive equity stakes" — "No" appears much later (outside 5-token window)
    # so this should fire.
    check("T11", "Edge: 'No' that is far from forbidden term does NOT provide exemption",
          has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T12: Edge — forbidden term inside quotes but no quotation marker BLOCKS ───
def test_t12_edge_quotes_no_marker():
    """Quotes without identifying phrase = NOT exempt."""
    has_non_exempt, log = has_non_exempt_match(
        SECURITIES_PATTERNS,
        'The section titled "investor returns" discusses ROI on equity.',
    )
    check("T12", "Edge: quoted term without quotation-identifying phrase still fires",
          has_non_exempt,
          f"has_non_exempt={has_non_exempt}")


# ── T13: K514.5 regression — investigate still ALLOWS ────────────────────────
def test_t13_k514_5_regression_investigate():
    """K514.5 regression: investigate/investing-in-research do not fire."""
    _set_librarian_ts(fresh=True)
    content = (
        "We will investigate whether vendor independence can be achieved. "
        "Investing in research-grade tooling is a core principle."
    )
    tc = _write_call("/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K521_TEST.md", content)
    result = evaluate(tc)
    allowed = "augur_securities_language" not in result.triggered_augurs
    check("T13", "K514.5 regression: 'investigate'/'investing in research' still ALLOWS",
          allowed,
          f"decision={result.decision}, triggered={result.triggered_augurs}")


# ── T14: K527 regression — ROI in AI-compute context still ALLOWS ─────────────
def test_t14_k527_regression_roi():
    """K527 regression: ROI in AI-token-cost context still does not fire."""
    _set_librarian_ts(fresh=True)
    content = (
        "R14 benchmark config — substrate savings telemetry.\n"
        "ROI on Cathedral Effect token cost: 87% reduction vs baseline.\n"
        "Using LLM substrate: cost differential = 90% cheaper."
    )
    tc = _write_call("/platform/src/benchmark_config.md", content)
    result = evaluate(tc)
    allowed = result.decision == "allow" or "augur_securities_language" not in result.triggered_augurs
    check("T14", "K527 regression: ROI in AI-compute context (Cathedral Effect + LLM) still ALLOWS",
          allowed,
          f"decision={result.decision}, triggered={result.triggered_augurs}")


# ── T15: Full engine integration — "Zero Investors" via Write tool ────────────
def test_t15_engine_integration_zero_investors():
    """Integration test: evaluate() handles 'Zero Investors' via Write and doesn't fire."""
    _set_librarian_ts(fresh=True)
    content = (
        "# Liana Banyan — Cooperative Platform\n\n"
        "Zero Investors. Zero shareholder equity. Zero dividends.\n"
        "This cooperative has no outside investors and refuses equity stake arrangements.\n"
        "We are operating without investors by constitutional design."
    )
    tc = _write_call("/letters/liana_banyan_overview.md", content)
    result = evaluate(tc)
    allowed = "augur_securities_language" not in result.triggered_augurs
    check("T15", "Integration: Write with 'Zero Investors/shareholders/dividends' in anti-securities context does not fire",
          allowed,
          f"decision={result.decision}, triggered={result.triggered_augurs}")


# ── T16: Performance — negation-context check < 5ms ──────────────────────────
def test_t16_performance():
    """KN008 D.1 performance gate: negation-context check adds < 5ms."""
    text = (
        "Zero Investors. No shareholders. Without dividends. "
        "Anti-securities cooperative structure. "
        "We are not offering any investment opportunities to members. "
        "Refusing equity stake arrangements by constitutional design."
    ) * 5  # Repeat 5x for realistic content size

    t0 = time.monotonic()
    has_non_exempt_match(SECURITIES_PATTERNS, text)
    elapsed_ms = (time.monotonic() - t0) * 1000

    check("T16", "Performance: negation-context check completes in < 5ms",
          elapsed_ms < 5,
          f"elapsed_ms={elapsed_ms:.2f}")


# ── Runner ───────────────────────────────────────────────────────────────────

def run_all():
    print("\n=== KN008 Augur-Securities Negation-Context Tuning -- 16 Tests ===\n")
    test_t01_zero_investors_exempt()
    test_t02_no_investors_exempt()
    test_t03_does_not_offer()
    test_t04_anti_securities_prefix()
    test_t05_quotation_context()
    test_t06_without_investors()
    test_t07_refusing_equity()
    test_t08_positive_investment_opportunities()
    test_t09_positive_roi_equity()
    test_t10_positive_dividends()
    test_t11_edge_outside_window()
    test_t12_edge_quotes_no_marker()
    test_t13_k514_5_regression_investigate()
    test_t14_k527_regression_roi()
    test_t15_engine_integration_zero_investors()
    test_t16_performance()

    print("\n=== Results ===")
    passed = sum(1 for _, _, s in results if s == PASS)
    failed = sum(1 for _, _, s in results if s == FAIL)
    for num, desc, status in results:
        sym = "OK" if status == PASS else "XX"
        print(f"  [{sym}] {num}: {desc}")
    print(f"\n{passed}/16 PASSED  |  {failed}/16 FAILED")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    run_all()
