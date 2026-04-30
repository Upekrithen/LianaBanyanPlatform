"""
Tests — KN001 Eblet Post-Hoc Augur Correction System
B134 / 2026-04-29

Coverage:
  D.1: Unit tests for each Augur class in Eblet vs canonical-path mode
  D.2: Integration test — full promotion cycle (Eblet → PostToolUse → promote → canonical)
  D.3: B134 example payloads (securities-language + pricing contexts)
  D.4: Existing Augur regression (no regressions to K514.5 / K527 / TS-092 tunings)
  D.5: Stone Tablet Imperative compliance (promoted Eblets become immutable canonical)
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Ensure workspace is on sys.path
_WORKSPACE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _WORKSPACE not in sys.path:
    sys.path.insert(0, _WORKSPACE)

from discipline_wing.eblet_router import (
    is_eblet_path,
    is_eblet_scoped_canonical_path,
    is_production_protected_path,
    get_eblet_path,
    write_eblet_meta,
    read_eblet_meta,
    write_augur_findings,
    list_pending_eblets,
    cleanup_stale_eblets,
)
from discipline_wing.engine import evaluate


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_tool_call(path: str, content: str, tool: str = "Write") -> dict:
    return {
        "tool_name": tool,
        "tool_input": {"file_path": path, "content": content},
    }


# ── D.1: Unit tests — Eblet path detection ─────────────────────────────────────

class TestEbletPathDetection(unittest.TestCase):
    """Tests for is_eblet_path() and routing functions."""

    def test_eblet_path_by_root(self):
        path = str(Path.home() / ".claude" / "state" / "eblets" / "B134" / "foo.eblet.md")
        self.assertTrue(is_eblet_path(path), "Eblet root path should be detected as Eblet")

    def test_eblet_path_by_suffix(self):
        self.assertTrue(is_eblet_path("/any/random/dir/foo.eblet.md"))

    def test_non_eblet_canonical_path(self):
        self.assertFalse(is_eblet_path("/home/user/.claude/memory/foo.md"))
        self.assertFalse(is_eblet_path("BISHOP_DROPZONE/03_BishopHandoffs/scope.md"))

    def test_eblet_scoped_memory(self):
        self.assertTrue(is_eblet_scoped_canonical_path("/home/user/.claude/memory/foo.md"))
        self.assertTrue(is_eblet_scoped_canonical_path("~/.claude/memory/bar.md"))

    def test_eblet_scoped_dropzone(self):
        self.assertTrue(is_eblet_scoped_canonical_path("BISHOP_DROPZONE/03_BishopHandoffs/scope.md"))
        self.assertTrue(is_eblet_scoped_canonical_path("BISHOP_DROPZONE/01_KnightPrompts/PROMPT.md"))

    def test_eblet_scoped_stitchpunks(self):
        self.assertTrue(is_eblet_scoped_canonical_path("librarian-mcp/stitchpunks/knight_cathedral/scribes/foo.md"))

    def test_eblet_scoped_context_management(self):
        self.assertTrue(is_eblet_scoped_canonical_path("CONTEXT_MANAGEMENT/MILESTONE_HANDOFF.md"))

    def test_production_protected_platform_src(self):
        self.assertTrue(is_production_protected_path("platform/src/App.tsx"))
        self.assertTrue(is_production_protected_path("platform/supabase/migrations/001.sql"))

    def test_production_protected_cephas(self):
        self.assertTrue(is_production_protected_path("Cephas/cephas-hugo/content/letters/foo.md"))

    def test_production_protected_uspto(self):
        self.assertTrue(is_production_protected_path("USPTO_submissions/app_001.md"))

    def test_non_protected_discipline_wing(self):
        self.assertFalse(is_production_protected_path("discipline_wing/engine.py"))


# ── D.1: Unit tests — Augur class behavior on Eblet vs canonical paths ─────────

class TestAugurClassEbletExclusion(unittest.TestCase):
    """
    Verify that Augur configs with state/eblets/ exclusion_path_patterns
    do NOT fire on Eblet scratch paths.
    """

    def _make_securities_content(self) -> str:
        """Content that would normally fire Augur-Securities-Language."""
        return "Members may earn a return on investment through participation."

    def _make_pricing_content(self) -> str:
        """Content that would normally fire Augur-Pricing."""
        return "The membership fee is $10/year for standard members."

    def test_securities_augur_blocked_on_canonical_md(self):
        """Augur-Securities-Language fires on canonical .md path with forbidden term."""
        result = evaluate(_make_tool_call(
            path="/tmp/test_canonical.md",
            content=self._make_securities_content(),
        ))
        # Should fire (warn or block) — not allow
        self.assertNotEqual(result.decision, "allow",
            "Securities term in canonical .md should trigger Augur")

    def test_securities_augur_bypassed_on_eblet_path(self):
        """Augur-Securities-Language must NOT fire on .eblet.md paths (exclusion applied)."""
        result = evaluate(_make_tool_call(
            path=str(Path.home() / ".claude" / "state" / "eblets" / "B134" / "test.eblet.md"),
            content=self._make_securities_content(),
        ))
        self.assertEqual(result.decision, "allow",
            f"Eblet path should be excluded from Augur-Securities-Language. "
            f"Got: {result.decision} / {result.consensus_reason}")

    def test_pricing_augur_blocked_on_canonical_md(self):
        """Augur-Pricing fires on canonical path with wrong membership price."""
        result = evaluate(_make_tool_call(
            path="/tmp/test_canonical.md",
            content=self._make_pricing_content(),
        ))
        self.assertNotEqual(result.decision, "allow",
            "Wrong pricing in canonical .md should trigger Augur-Pricing")

    def test_pricing_augur_bypassed_on_eblet_path(self):
        """Augur-Pricing must NOT fire on .eblet.md paths."""
        result = evaluate(_make_tool_call(
            path="/tmp/test_pricing.eblet.md",
            content=self._make_pricing_content(),
        ))
        self.assertEqual(result.decision, "allow",
            f"Eblet path should be excluded from Augur-Pricing. "
            f"Got: {result.decision} / {result.consensus_reason}")

    def test_closeout_augur_bypassed_on_eblet(self):
        """Augur-Closeout advisory must NOT fire on .eblet.md paths."""
        result = evaluate(_make_tool_call(
            path="/tmp/session.eblet.md",
            content="Session complete. FOR THE KEEP! Ready to hand-off.",
        ))
        # Eblet exclusion should prevent Augur-Closeout from firing on this path
        triggered = [t for t in (result.triggered_augurs or []) if "closeout" in t.lower()]
        self.assertEqual(triggered, [],
            f"Augur-Closeout should not fire on .eblet.md path. Triggered: {triggered}")

    def test_toolsmith_augur_bypassed_on_eblet(self):
        """Augur-Toolsmith advisory must NOT fire on .eblet.md paths."""
        result = evaluate(_make_tool_call(
            path="/tmp/REPORT_KNIGHT_KN001.eblet.md",
            content="KN001 ratified. Session closed. Milestone close.",
        ))
        triggered = [t for t in (result.triggered_augurs or []) if "toolsmith" in t.lower()]
        self.assertEqual(triggered, [],
            f"Augur-Toolsmith should not fire on .eblet.md path. Triggered: {triggered}")


# ── D.2: Integration test — full promotion cycle ────────────────────────────────

_TW_NO_MATCH = {"pattern_detected": False, "pattern_hash": "", "prior_rejection_count": 0, "threshold": 12, "weight_bump": 0.0}


class TestPromotionCycle(unittest.TestCase):
    """Integration test for the complete Eblet → promotion → canonical flow."""

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp(prefix="eblet_test_")
        # Patch TimeWave Security to prevent accumulated cross-test rejection events
        # from interfering with clean-content promotion tests.
        # TimeWave is tested separately (see TestExistingAugurRegression).
        self._tw_patcher = patch(
            "discipline_wing.timewave_security.match_security_pattern",
            return_value=_TW_NO_MATCH,
        )
        self._tw_patcher.start()

    def tearDown(self):
        self._tw_patcher.stop()
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_clean_content_promotes_successfully(self):
        """Clean content (no Augur triggers) should promote to canonical successfully."""
        from discipline_wing.promote_eblet import promote

        # Write a clean Eblet file
        eblet_path = Path(self.tmpdir) / "B134" / "clean_note.eblet.md"
        eblet_path.parent.mkdir(parents=True, exist_ok=True)
        eblet_path.write_text(
            "# Session Notes\nKN001 Eblet system implemented successfully. "
            "Members participate and earn through cooperative contribution.",
            encoding="utf-8",
        )

        canonical_path = str(Path(self.tmpdir) / "canonical" / "clean_note.md")

        result = promote(str(eblet_path), canonical_path, do_commit=False)

        self.assertEqual(result, 0, "Clean content should promote with exit code 0")
        self.assertTrue(Path(canonical_path).exists(), "Canonical file should exist after promotion")
        self.assertFalse(eblet_path.exists(), "Eblet file should be purged after successful promotion")

    def test_dirty_content_blocked_at_promotion(self):
        """Content with forbidden terms should be blocked at promotion, findings written."""
        from discipline_wing.promote_eblet import promote

        eblet_path = Path(self.tmpdir) / "B134" / "dirty.eblet.md"
        eblet_path.parent.mkdir(parents=True, exist_ok=True)
        # Write content with a securities-language trigger (ROI in member context)
        eblet_path.write_text(
            "# Draft\nMembers earn return on investment from the cooperative.",
            encoding="utf-8",
        )

        canonical_path = str(Path(self.tmpdir) / "canonical" / "dirty.md")
        result = promote(str(eblet_path), canonical_path, do_commit=False)

        self.assertEqual(result, 1, "Dirty content should return exit code 1 (blocked)")
        self.assertFalse(Path(canonical_path).exists(), "Canonical file should NOT exist when blocked")
        self.assertTrue(eblet_path.exists(), "Eblet should stay in place when blocked")

        # Check findings file was written
        findings_path = Path(str(eblet_path).replace(".eblet.md", ".augur-findings.md"))
        self.assertTrue(findings_path.exists(), "Augur findings file should be written")
        findings_content = findings_path.read_text(encoding="utf-8")
        self.assertIn("BLOCK", findings_content.upper(), "Findings should mention BLOCK")

    def test_missing_canonical_path_returns_error(self):
        """promote() without canonical path and no sidecar should return exit code 2."""
        from discipline_wing.promote_eblet import promote

        eblet_path = Path(self.tmpdir) / "no_meta.eblet.md"
        eblet_path.write_text("Content without meta.", encoding="utf-8")

        result = promote(str(eblet_path), canonical_path_str="", do_commit=False)
        self.assertEqual(result, 2, "Missing canonical path should return exit code 2")

    def test_sidecar_meta_read_and_write(self):
        """write_eblet_meta and read_eblet_meta round-trip correctly."""
        eblet_path = Path(self.tmpdir) / "foo.eblet.md"
        eblet_path.write_text("test content", encoding="utf-8")

        write_eblet_meta(eblet_path, "~/.claude/memory/foo.md", "B134")
        meta = read_eblet_meta(eblet_path)

        self.assertIsNotNone(meta)
        self.assertEqual(meta["canonical_path"], "~/.claude/memory/foo.md")
        self.assertEqual(meta["session_id"], "B134")

    def test_promote_uses_sidecar_canonical_path(self):
        """promote() reads canonical destination from sidecar when --to not given."""
        from discipline_wing.promote_eblet import promote

        eblet_path = Path(self.tmpdir) / "B134" / "with_meta.eblet.md"
        eblet_path.parent.mkdir(parents=True, exist_ok=True)
        eblet_path.write_text(
            "# Clean note with cooperative framing.\nMembers participate and contribute.",
            encoding="utf-8",
        )

        canonical_path = str(Path(self.tmpdir) / "canonical" / "with_meta.md")
        write_eblet_meta(eblet_path, canonical_path, "B134")

        result = promote(str(eblet_path), canonical_path_str="", do_commit=False)
        self.assertEqual(result, 0, "Sidecar-driven promotion should succeed")
        self.assertTrue(Path(canonical_path).exists())


# ── D.3: B134 example payloads — turn 14-18 friction class ─────────────────────

class TestB134TurnPayloads(unittest.TestCase):
    """
    Verify that B134 turn 14-18 friction payloads pass through Eblet paths without blocking,
    and that the canonical-path Augur still fires correctly (safety preserved).
    """

    def test_symmetric_offer_securities_term_eblet_no_block(self):
        """
        B134 scenario: symmetric offer doc with venture-funding counter-example
        (contained 'investor' as a negative example).
        On Eblet path → should not block.
        """
        content = (
            "The cooperative does not accept venture capital from investors.\n"
            "Unlike investor-driven platforms, Liana Banyan keeps 83.3% with creators.\n"
        )
        result = evaluate(_make_tool_call(
            path="/tmp/symmetric_offer.eblet.md",
            content=content,
        ))
        self.assertEqual(result.decision, "allow",
            f"Eblet path should bypass Augur even with 'investor' in counter-example context. "
            f"Got: {result.decision}")

    def test_symmetric_offer_securities_term_canonical_fires(self):
        """Same content on canonical .md path should still trigger the Augur (safety preserved)."""
        content = (
            "The cooperative does not accept venture capital from investors.\n"
            "Unlike investor-driven platforms, Liana Banyan keeps 83.3% with creators.\n"
        )
        result = evaluate(_make_tool_call(
            path="/tmp/symmetric_offer.md",
            content=content,
        ))
        self.assertNotEqual(result.decision, "allow",
            "Securities term on canonical .md should still trigger Augur — safety preserved")

    def test_pricing_context_eblet_no_block(self):
        """
        B134 scenario: pricing context reference in scope memo.
        On Eblet path → no block.
        """
        content = (
            "Background: some platforms charge $15/month for similar features.\n"
            "LB membership is $5/year — the price differential is part of the argument.\n"
        )
        result = evaluate(_make_tool_call(
            path="/tmp/pricing_context.eblet.md",
            content=content,
        ))
        self.assertEqual(result.decision, "allow",
            f"Pricing-context Eblet should not block. Got: {result.decision}")


# ── D.4: Existing Augur regression — K514.5 / K527 / TS-092 tunings still green ─

class TestExistingAugurRegression(unittest.TestCase):
    """Verify no regression to previously tuned Augur behaviors."""

    def test_k514_5_investigate_does_not_fire(self):
        """K514.5: 'investigate/investigation' in canonical .md should NOT trigger securities."""
        result = evaluate(_make_tool_call(
            path="/tmp/research.md",
            content="We investigate the impact of cooperative models on member wellbeing.",
        ))
        securities_triggered = [t for t in (result.triggered_augurs or []) if "securities" in t.lower()]
        self.assertEqual(securities_triggered, [],
            "investigate/investigation should not trigger Augur-Securities-Language (K514.5)")

    def test_k527_roi_ai_compute_context_does_not_fire(self):
        """K527/TS-092: ROI in AI-compute-economics context should NOT trigger securities."""
        result = evaluate(_make_tool_call(
            path="/tmp/compute_note.md",
            content=(
                "The ROI of using LLMs is measurable: token cost vs result quality. "
                "Cathedral Effect routing reduces API spend by routing low-complexity tasks."
            ),
        ))
        securities_triggered = [t for t in (result.triggered_augurs or []) if "securities" in t.lower()]
        self.assertEqual(securities_triggered, [],
            "ROI in AI-compute-economics context should not fire (K527/TS-092)")

    def test_k527_roi_member_return_still_fires(self):
        """K527: ROI in LB-member-return context should STILL trigger securities."""
        result = evaluate(_make_tool_call(
            path="/tmp/member_return.md",
            content="Members earn a return on investment from the Liana Banyan cooperative fund.",
        ))
        self.assertNotEqual(result.decision, "allow",
            "ROI in LB-member-return context should still trigger Augur-Securities-Language")

    def test_correct_membership_price_does_not_fire(self):
        """Augur-Pricing should not fire when membership is correctly stated as $5/year."""
        result = evaluate(_make_tool_call(
            path="/tmp/pricing.md",
            content="Liana Banyan membership is $5/year for every member, no tiers.",
        ))
        pricing_triggered = [t for t in (result.triggered_augurs or []) if "pricing" in t.lower()]
        self.assertEqual(pricing_triggered, [],
            "Correct $5/year membership should not fire Augur-Pricing")

    def test_python_file_excluded_from_securities_augur(self):
        """Python files (.py) remain excluded from Augur-Securities-Language."""
        result = evaluate(_make_tool_call(
            path="/tmp/test_code.py",
            content='# Test for investor-related patterns\nif "investor" in text: block()',
        ))
        securities_triggered = [t for t in (result.triggered_augurs or []) if "securities" in t.lower()]
        self.assertEqual(securities_triggered, [],
            "Python files should remain excluded from Augur-Securities-Language")


# ── D.5: Stone Tablet Imperative compliance ─────────────────────────────────────

class TestStoneTabletImperative(unittest.TestCase):
    """
    Verify Stone Tablet Imperative: promoted Eblets become immutable canonical;
    pre-promotion Eblet location is scratch only.
    """

    def setUp(self):
        self.tmpdir = tempfile.mkdtemp(prefix="eblet_stone_test_")
        # Patch TimeWave Security for test isolation (same reason as TestPromotionCycle)
        self._tw_patcher = patch(
            "discipline_wing.timewave_security.match_security_pattern",
            return_value=_TW_NO_MATCH,
        )
        self._tw_patcher.start()

    def tearDown(self):
        self._tw_patcher.stop()
        import shutil
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_successful_promotion_purges_eblet(self):
        """After clean promotion, Eblet scratch file must not exist."""
        from discipline_wing.promote_eblet import promote

        eblet_path = Path(self.tmpdir) / "stone_test.eblet.md"
        eblet_path.write_text(
            "Members participate through contribution, not capital.\n"
            "Cooperative framing — no prohibited terms.",
            encoding="utf-8",
        )
        canonical_path = str(Path(self.tmpdir) / "canonical" / "stone_test.md")

        result = promote(str(eblet_path), canonical_path, do_commit=False)

        self.assertEqual(result, 0)
        self.assertFalse(eblet_path.exists(),
            "Stone Tablet Imperative: Eblet MUST be purged after successful promotion")
        self.assertTrue(Path(canonical_path).exists(),
            "Stone Tablet Imperative: Canonical file MUST exist after promotion")

    def test_failed_promotion_leaves_canonical_untouched(self):
        """When promotion is blocked, the canonical path must remain unmodified."""
        from discipline_wing.promote_eblet import promote

        eblet_path = Path(self.tmpdir) / "dirty_stone.eblet.md"
        eblet_path.write_text(
            "Members get a return on investment from the cooperative.",
            encoding="utf-8",
        )
        canonical_path = Path(self.tmpdir) / "canonical" / "dirty_stone.md"
        canonical_path.parent.mkdir(parents=True, exist_ok=True)
        original_content = "ORIGINAL CANONICAL CONTENT — must not change."
        canonical_path.write_text(original_content, encoding="utf-8")

        result = promote(str(eblet_path), str(canonical_path), do_commit=False)

        self.assertEqual(result, 1, "Blocked promotion should return exit code 1")
        # Canonical must be unchanged
        actual_content = canonical_path.read_text(encoding="utf-8")
        self.assertEqual(actual_content, original_content,
            "Stone Tablet Imperative: failed promotion must not modify canonical content")

    def test_list_eblets_shows_pending(self):
        """list_pending_eblets returns pending Eblets correctly."""
        eblet_root = Path(self.tmpdir) / "eblets"
        session_dir = eblet_root / "B134"
        session_dir.mkdir(parents=True)

        eblet_path = session_dir / "pending.eblet.md"
        eblet_path.write_text("pending content", encoding="utf-8")
        write_eblet_meta(eblet_path, "~/.claude/memory/pending.md", "B134")

        with patch("discipline_wing.eblet_router.get_eblet_root", return_value=eblet_root):
            results = list_pending_eblets(session_id="B134")

        self.assertEqual(len(results), 1)
        self.assertIn("pending.eblet.md", results[0]["eblet_path"])
        self.assertEqual(results[0]["canonical_path"], "~/.claude/memory/pending.md")

    def test_cleanup_stale_removes_old_eblets(self):
        """cleanup_stale_eblets removes Eblets older than auto_cleanup_days."""
        eblet_root = Path(self.tmpdir) / "eblets"
        session_dir = eblet_root / "B000"
        session_dir.mkdir(parents=True)

        old_eblet = session_dir / "stale.eblet.md"
        old_eblet.write_text("stale content", encoding="utf-8")
        # Fake old metadata (8 days ago)
        old_meta = {
            "canonical_path": "~/.claude/memory/stale.md",
            "session_id": "B000",
            "created_ts": int(time.time()) - (8 * 86400),
            "created_iso": "2026-04-21T00:00:00Z",
        }
        meta_path = old_eblet.with_suffix("").with_suffix(".meta.json")
        meta_path.write_text(json.dumps(old_meta), encoding="utf-8")

        with patch("discipline_wing.eblet_router.get_eblet_root", return_value=eblet_root):
            with patch("discipline_wing.eblet_router.load_eblet_config",
                       return_value={"auto_cleanup_days": 7, "eblet_root": str(eblet_root)}):
                removed = cleanup_stale_eblets(dry_run=False)

        self.assertEqual(len(removed), 1, "Stale Eblet should be removed")
        self.assertFalse(old_eblet.exists(), "Stale Eblet file should be deleted")


# ── Entry point ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    unittest.main(verbosity=2)
