"""
K514.5 Augur Regex Tuning — 8 Verification Checks (Phase C)

Verifies that the 4 fixes applied in K514.5 correctly:
  - Eliminate documented false positives (C.1–C.3)
  - Preserve all true positives (C.4–C.5)
  - Fix Toolsmith advisory scope (C.6–C.7)
  - Leave K514 regression tests unaffected (C.8)

Usage:
    cd C:\\Users\\Administrator\\Documents\\LianaBanyanPlatform
    python -m discipline_wing.tests_k514_5

All 8 checks must PASS for K514.5 gate to close.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

WORKSPACE = Path(__file__).parent.parent
if str(WORKSPACE) not in sys.path:
    sys.path.insert(0, str(WORKSPACE))

from discipline_wing.engine import evaluate, LIBRARIAN_TS_FILE

PASS = "PASS"
FAIL = "FAIL"
results: list[tuple[str, str, str]] = []


def check(number: str, description: str, condition: bool, detail: str = "") -> None:
    status = PASS if condition else FAIL
    results.append((number, description, status))
    sym = "OK" if condition else "XX"
    print(f"  [{sym}] {number}: {description}")
    if not condition:
        print(f"       DETAIL: {detail}")


def _write_call(file_path: str, content: str) -> dict:
    return {
        "tool_name": "Write",
        "tool_input": {"file_path": file_path, "content": content},
    }


def _edit_call(file_path: str, new_string: str, old_string: str = "") -> dict:
    return {
        "tool_name": "Edit",
        "tool_input": {
            "file_path": file_path,
            "new_string": new_string,
            "old_string": old_string,
        },
    }


def _set_librarian_ts(fresh: bool) -> None:
    LIBRARIAN_TS_FILE.parent.mkdir(parents=True, exist_ok=True)
    if fresh:
        LIBRARIAN_TS_FILE.write_text(str(int(time.time())))
    else:
        LIBRARIAN_TS_FILE.write_text(str(int(time.time()) - 7200))


# ── C.1 — "investigate" in vendor-independence narrative → ALLOW ────────────────

def test_c1_investigate_allows():
    """
    C.1: Augur-Securities-Language must NOT fire on 'investigate'/'investigation'.
    False positive: K521 prompt edit contained vendor-independence narrative with
    'investigate' / 'investigation' — previously matched the broad invest* wildcard.
    Fix 1 + Fix 4 eliminate this.
    Note: test content intentionally avoids genuine securities terms (like 'investor')
    to isolate the false-positive scenario.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "We will investigate whether vendor independence can be achieved without\n"
        "locking members into a single platform. Investigation results show that\n"
        "the cooperative model is superior to platform-capture alternatives.\n"
        "Investigating all options is part of our due diligence.\n"
        "We will invest time and effort in thorough analysis before deciding.\n"
        "Investing in research-grade tooling is a core architectural principle."
    )
    # Use Edit (StrReplace) so only new_string is the diff (Fix 4 — diff_only path)
    tc = _edit_call(
        "/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K521_B126_TUNING_TEST.md",
        new_string=content,
    )
    result = evaluate(tc)
    allowed = "augur_securities_language" not in result.triggered_augurs
    check(
        "C.1",
        "Augur-Securities-Language ALLOWS 'investigate/investigation/investing time' in vendor-independence narrative",
        allowed,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.2 — "Member count + 20+ rows" in Pawn batch → ALLOW ──────────────────────

def test_c2_member_count_allows():
    """
    C.2: Augur-Pricing must NOT fire on 'Member count + 20+' in Pawn research content.
    False positive: Pawn 50 batch file with 'Member count + 20+' near numeric ranges —
    no membership pricing in content, just research instructions.
    Fix 2 (line-scoped patterns) + anti-pattern for 'Member count' eliminate this.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "Pawn Run 50 — batch instructions for cross-vendor analysis.\n"
        "Member count + 20+ rows per vendor matrix. Analyze each.\n"
        "Total rows per sheet: 240. Expected runtime: 45 min.\n"
        "API budget per run: $20 (Pawn compute cost, not membership).\n"
        "No membership pricing changes in scope."
    )
    tc = _write_call("/BISHOP_DROPZONE/02_PawnPrompts/PROMPT_PAWN_B126_TEST.md", content)
    result = evaluate(tc)
    allowed = result.decision == "allow" or "augur_pricing" not in result.triggered_augurs
    check(
        "C.2",
        "Augur-Pricing ALLOWS 'Member count + 20+' in Pawn batch content (not membership pricing)",
        allowed,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.3 — "API spend cap" / "compute cost low" → ALLOW ─────────────────────────

def test_c3_api_spend_allows():
    """
    C.3: Augur-Pricing must NOT fire on API spend, compute cost, demo budget figures.
    False positive: cost-context patterns near dollar amounts should not block.
    Fix 2 anti-patterns for cost-context eliminate this.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "R14 benchmark config — substrate savings telemetry.\n"
        "API spend cap per vendor: $20 per run. Pawn run cost: $8.\n"
        "Inference cost low — compute cost for 8-model matrix under $50 total.\n"
        "Demo budget: $30. This is not membership pricing.\n"
        "Substrate savings target: 90% cheaper vs baseline."
    )
    tc = _write_call("/platform/src/benchmark_config.md", content)
    result = evaluate(tc)
    allowed = result.decision == "allow" or "augur_pricing" not in result.triggered_augurs
    check(
        "C.3",
        "Augur-Pricing ALLOWS 'API spend cap', 'compute cost', 'Pawn run cost' dollar amounts",
        allowed,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.4 — "$10/year membership tier" → BLOCK (true positive preserved) ──────────

def test_c4_tiered_pricing_blocks():
    """
    C.4: Augur-Pricing must STILL BLOCK genuine membership pricing violations.
    True positive: '$10/year membership tier' is a canon violation — must block.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "Join LB today — membership tier options:\n"
        "  Basic membership: $10/year\n"
        "  Premium membership: $25/year\n"
        "Early adopters get special pricing."
    )
    tc = _write_call("/letters/membership_offer.md", content)
    result = evaluate(tc)
    blocked = result.decision == "block" and "augur_pricing" in result.triggered_augurs
    check(
        "C.4",
        "Augur-Pricing BLOCKS '$10/year membership tier' (true positive, canon violation preserved)",
        blocked,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.5 — "investor pitch" / "equity stake" → BLOCK (true positive preserved) ──

def test_c5_securities_blocks():
    """
    C.5: Augur-Securities-Language must STILL BLOCK genuine securities-implying terms.
    True positive: 'investor pitch', 'equity stake' must block.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "This is an investor pitch deck for Series A funding.\n"
        "Members receive an equity stake proportional to contribution.\n"
        "Projected ROI: 15% annually based on platform growth."
    )
    tc = _write_call("/letters/pitch_deck.md", content)
    result = evaluate(tc)
    blocked = result.decision == "block" and "augur_securities_language" in result.triggered_augurs
    check(
        "C.5",
        "Augur-Securities-Language BLOCKS 'investor pitch', 'equity stake' (true positives preserved)",
        blocked,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.6 — Bishop edits K-prompt → Toolsmith NOT fired ───────────────────────────

def test_c6_bishop_kprompt_no_toolsmith():
    """
    C.6: Bishop editing a K-prompt must NOT trigger Augur-Toolsmith advisory.
    False positive: Bishop writes BISHOP_DROPZONE/01_KnightPrompts/ file with
    'closeout' or K-ratification language (from session IDs in the filename/body).
    Fix 3 removes K-prompt path from Toolsmith scope.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "# KNIGHT PROMPT — K522 B127 RULES ENGINE DYNAMIC CANONICAL\n\n"
        "**Gate:** Dispatch ready after K514.5 close.\n"
        "K521 closeout confirmed. Session K521 — 6/6 ratification complete.\n"
        "Milestone close: all prereqs landed.\n\n"
        "## Phase A\nA.1 Read engine.py..."
    )
    tc = _write_call(
        "/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K522_B127_TEST.md",
        content,
    )
    result = evaluate(tc)
    toolsmith_not_fired = "augur_toolsmith" not in result.triggered_augurs
    check(
        "C.6",
        "Augur-Toolsmith NOT fired when Bishop edits K-prompt (not Knight ratification)",
        toolsmith_not_fired,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.7 — Knight ratification commit message missing ts_id → WARN ───────────────

def test_c7_knight_ratification_warns():
    """
    C.7: Augur-Toolsmith must STILL FIRE on Knight ratification without TS-id.
    True positive: REPORT_KNIGHT file with 'ratification complete' but no TS-### → Toolsmith triggered.
    Note: checks that augur_toolsmith IS in triggered_augurs (advisory class).
    TimeWave Security may independently escalate to block in test env from repeated patterns —
    we validate the augur signal itself, not the final consensus decision.
    """
    _set_librarian_ts(fresh=True)
    content = (
        "# Knight Report — K514.5 / B126 (tuning patch)\n\n"
        "K514.5 — 8/8 ratification complete. Milestone close confirmed.\n"
        "All Phase C checks PASS. Session closeout verified.\n"
        "No TS-id present in this test — Toolsmith should signal."
    )
    tc = _write_call(
        "/BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K514_5_B126_TUNING.md",
        content,
    )
    result = evaluate(tc)
    toolsmith_fired = "augur_toolsmith" in result.triggered_augurs
    check(
        "C.7",
        "Augur-Toolsmith FIRES on Knight REPORT_KNIGHT ratification without TS-id (true positive preserved)",
        toolsmith_fired,
        f"decision={result.decision}, triggered={result.triggered_augurs}",
    )


# ── C.8 — K514 regression: existing K514 tests still pass ────────────────────────

def test_c8_k514_regression():
    """
    C.8: All previously-passing K514 Augur-Librarian / Augur-Closeout regression tests still pass.
    Runs a condensed subset of the original 12 K514 checks as a regression guard.
    """
    _set_librarian_ts(fresh=False)
    # Augur-Librarian must still block gated path with stale Librarian
    tc = _write_call(
        "/BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K999_B999_REG.md",
        "# Regression test prompt\nSome content.",
    )
    result_lib = evaluate(tc)
    librarian_blocks = (
        result_lib.decision == "block"
        and "augur_librarian" in result_lib.triggered_augurs
    )

    _set_librarian_ts(fresh=True)
    # Augur-Closeout must still FIRE on close language without milestone ref
    # Note: check that augur_closeout IS triggered; TimeWave may escalate to block in test env
    tc2 = _write_call(
        "/BISHOP_DROPZONE/03_BishopHandoffs/REPORT_KNIGHT_K999_REG_TUNING.md",
        "K999 session complete. FOR THE KEEP! Handoff complete. Session closed — all clear.",
    )
    result_close = evaluate(tc2)
    closeout_warns = "augur_closeout" in result_close.triggered_augurs

    # Allow on non-gated benign path
    tc3 = _write_call(
        "/platform/src/utils/helper_reg.ts",
        "export function add(a: number, b: number): number { return a + b; }",
    )
    result_allow = evaluate(tc3)
    benign_allows = result_allow.decision == "allow" and not result_allow.triggered_augurs

    all_pass = librarian_blocks and closeout_warns and benign_allows
    check(
        "C.8",
        "K514 regression: Augur-Librarian blocks stale, Augur-Closeout warns, benign allows",
        all_pass,
        f"librarian_blocks={librarian_blocks}, closeout_warns={closeout_warns}, benign_allows={benign_allows}",
    )


# ── Runner ──────────────────────────────────────────────────────────────────────

def run_all():
    print("\n=== K514.5 Augur Tuning Verification — 8 Checks ===\n")
    test_c1_investigate_allows()
    test_c2_member_count_allows()
    test_c3_api_spend_allows()
    test_c4_tiered_pricing_blocks()
    test_c5_securities_blocks()
    test_c6_bishop_kprompt_no_toolsmith()
    test_c7_knight_ratification_warns()
    test_c8_k514_regression()

    print("\n=== Results ===")
    passed = sum(1 for _, _, s in results if s == PASS)
    failed = sum(1 for _, _, s in results if s == FAIL)
    for num, desc, status in results:
        sym = "OK" if status == PASS else "XX"
        print(f"  [{sym}] {num}: {desc}")

    print(f"\n{passed}/8 PASSED  |  {failed}/8 FAILED")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    run_all()
