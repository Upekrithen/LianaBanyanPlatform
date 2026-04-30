"""
Tests for KN024 — Augur-Pricing Post-Promotion Exemption Fix
Target: 10+ tests covering path-exemption + real-violation regression.

Tests use the augur_pricing evaluator in isolation (not full Wing engine)
since augur_librarian independently gates /memory/ paths — KN024 only fixes
the augur_PRICING false positive.

Run:
    python discipline_wing/tests_kn024.py
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

_WORKSPACE = Path(__file__).parent.parent
if str(_WORKSPACE) not in sys.path:
    sys.path.insert(0, str(_WORKSPACE))

from discipline_wing.engine import _evaluate_single_augur, ToolCall

AUGUR_PRICING_PATH = Path.home() / ".claude" / "state" / "wing_augurs" / "augur_pricing.json"


def _load_augur_pricing() -> dict:
    return json.loads(AUGUR_PRICING_PATH.read_text(encoding="utf-8"))


def _evaluate_pricing(file_path: str, content: str) -> str:
    """Evaluate ONLY augur_pricing (not the full Wing) against a tool call."""
    cfg = _load_augur_pricing()
    tc = ToolCall(
        tool_name="Write",
        file_path=file_path,
        content=content,
        diff_text=content,  # For Write, diff_text = full content
    )
    result = _evaluate_single_augur(cfg, tc)
    return result.signal or "allow"  # signal=None means no-signal (allow)


# ── Canon content with comparison pricing (realistic Eblet content) ───────────
_CANON_CONTENT_WITH_COMPARISON = """
# Project Canon — Sprint Operational Mode

The platform charges $5/year membership for all members.

Compare with SaaS alternatives for context:
- Slack Pro: $7.25/month ($87/year)
- Notion: $10/month ($120/year)
- Claude Pro: $240/yr equivalent compute cost

Members keep 83.3% on every transaction. Membership pricing unchanged.
"""

# ── Real pricing violation (non-$5/year membership change) ───────────────────
_REAL_VIOLATION_CONTENT = """
# Pricing Update

We are updating membership pricing. New members will pay $15/year starting Q3.
Early adopters get special pricing at $8/year.
"""

# ── Edge: content with only anti-patterns (should allow) ─────────────────────
_API_COST_CONTENT = """
The API spend for this inference run is $0.025 per 1K tokens.
Compute budget for Pawn runs: $50/month.
Model cost: $0.003/token.
"""


def test_canon_path_project_beans_exempt_from_pricing() -> None:
    """D.1: project_beans_beanpods_canon.md path is exempt from augur_pricing."""
    canonical = "C:/Users/Administrator/.claude/projects/test/memory/project_beans_beanpods_canon.md"
    signal = _evaluate_pricing(canonical, _CANON_CONTENT_WITH_COMPARISON)
    assert signal != "block", (
        f"Canon Eblet path should not trigger augur_pricing. Got signal: {signal}"
    )


def test_canon_path_chandelier_exempt() -> None:
    """D.1: project_chandelier_tower_of_peace_bedrock_canon.md path exempt."""
    canonical = "C:/Users/Administrator/.claude/projects/test/memory/project_chandelier_tower_of_peace_bedrock_canon.md"
    signal = _evaluate_pricing(canonical, _CANON_CONTENT_WITH_COMPARISON)
    assert signal != "block", f"Got: {signal}"


def test_canon_path_magic_beans_exempt() -> None:
    """D.1: project_magic_beans_paper_004_canon.md path exempt."""
    canonical = "C:/Users/Administrator/.claude/projects/test/memory/project_magic_beans_paper_004_canon.md"
    signal = _evaluate_pricing(canonical, _CANON_CONTENT_WITH_COMPARISON)
    assert signal != "block", f"Got: {signal}"


def test_canon_path_sprint_exempt() -> None:
    """D.1: project_the_sprint_operational_mode_canon.md path exempt."""
    canonical = "C:/Users/Administrator/.claude/projects/test/memory/project_the_sprint_operational_mode_canon.md"
    signal = _evaluate_pricing(canonical, _CANON_CONTENT_WITH_COMPARISON)
    assert signal != "block", f"Got: {signal}"


def test_canon_path_slice_of_pie_exempt() -> None:
    """D.1: project_slice_of_pie_rd_battery_call_to_action_tagline_canon.md exempt."""
    canonical = "C:/Users/Administrator/.claude/projects/test/memory/project_slice_of_pie_rd_battery_call_to_action_tagline_canon.md"
    signal = _evaluate_pricing(canonical, _CANON_CONTENT_WITH_COMPARISON)
    assert signal != "block", f"Got: {signal}"


def test_real_violation_non_canon_still_blocks() -> None:
    """D.3: Real pricing change in non-canon memory file still BLOCKS."""
    non_canon = "C:/Users/Administrator/.claude/projects/test/memory/pricing_policy_update.md"
    signal = _evaluate_pricing(non_canon, _REAL_VIOLATION_CONTENT)
    assert signal == "block", (
        f"Non-canon pricing violation should BLOCK. Got: {signal}"
    )


def test_synthetic_pricing_change_non_canon_path_blocks() -> None:
    """D.5: Synthetic test fixture — real violation in non-canon path blocks."""
    path = "C:/docs/synthetic_pricing_change_attempt.md"
    signal = _evaluate_pricing(path, _REAL_VIOLATION_CONTENT)
    assert signal == "block", f"Got: {signal}"


def test_existing_amplifier_exemption_still_green() -> None:
    """D.3: Amplifier AA Formal path exemption still works."""
    amp_path = "BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2318_amplifier.md"
    signal = _evaluate_pricing(amp_path, _REAL_VIOLATION_CONTENT)
    assert signal != "block", f"Amplifier exemption broken. Got: {signal}"


def test_existing_bridle_exemption_still_green() -> None:
    """D.3: BRIDLE_RULES/ path exemption still works."""
    bridle_path = "BRIDLE_RULES/rule_v11.md"
    signal = _evaluate_pricing(bridle_path, _REAL_VIOLATION_CONTENT)
    assert signal != "block", f"BRIDLE exemption broken. Got: {signal}"


def test_canon_path_pattern_matches_subdirectory() -> None:
    """D.1: Pattern matches regardless of directory depth."""
    deep_path = "C:/any/nested/path/project_some_topic_canon_v2.md"
    signal = _evaluate_pricing(deep_path, _CANON_CONTENT_WITH_COMPARISON)
    assert signal != "block", f"Deep nested canon path should be exempt. Got: {signal}"


def test_augur_pricing_json_has_canon_exemption() -> None:
    """Verify augur_pricing.json contains the new canon-class exclusion pattern."""
    cfg = _load_augur_pricing()
    exclusions = cfg["trigger"]["exclusion_path_patterns"]
    canon_patterns = [p for p in exclusions if "canon" in p]
    assert len(canon_patterns) >= 1, (
        f"No canon-class exemption found. Current exclusions: {exclusions}"
    )


def test_api_cost_content_still_allows() -> None:
    """D.3: API cost content (no membership mention) still allows."""
    regular_path = "BISHOP_DROPZONE/03_BishopHandoffs/report.md"
    signal = _evaluate_pricing(regular_path, _API_COST_CONTENT)
    assert signal != "block", f"API cost content should not block. Got: {signal}"


if __name__ == "__main__":
    tests = [
        test_canon_path_project_beans_exempt_from_pricing,
        test_canon_path_chandelier_exempt,
        test_canon_path_magic_beans_exempt,
        test_canon_path_sprint_exempt,
        test_canon_path_slice_of_pie_exempt,
        test_real_violation_non_canon_still_blocks,
        test_synthetic_pricing_change_non_canon_path_blocks,
        test_existing_amplifier_exemption_still_green,
        test_existing_bridle_exemption_still_green,
        test_canon_path_pattern_matches_subdirectory,
        test_augur_pricing_json_has_canon_exemption,
        test_api_cost_content_still_allows,
    ]

    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL {t.__name__}: {e}")
            failed += 1

    print(f"\n{passed}/{passed+failed} tests passed")
    if failed:
        sys.exit(1)
