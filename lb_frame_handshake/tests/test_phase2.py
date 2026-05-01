"""
test_phase2.py — Phase 2 (Familiarize) unit tests (KN086/BP009)
================================================================
"""

import json
import tempfile
import unittest
from pathlib import Path

from lb_frame_handshake.host_context import HostContext
from lb_frame_handshake.phases.phase2_familiarize import phase2_familiarize


def _make_host(tmp: Path) -> HostContext:
    return HostContext(
        workspace_root=tmp / "workspace",
        claude_root=tmp / "claude",
        lb_session_dir=tmp / "lb-session",
    )


class TestPhase2Familiarize(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.host = _make_host(self.tmp)
        # Ensure dirs exist
        for d in [
            self.host.workspace_root,
            self.host.claude_root,
            self.host.lb_session_dir,
        ]:
            d.mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_returns_substrate_state(self):
        state = phase2_familiarize(self.host)
        self.assertIsNotNone(state)

    def test_memory_missing_status(self):
        state = phase2_familiarize(self.host)
        self.assertEqual(state.memory_status, "missing")

    def test_memory_present_status(self):
        mem_path = self.host.memory_md_path
        mem_path.parent.mkdir(parents=True, exist_ok=True)
        mem_path.write_text("# MEMORY\nTest content.", encoding="utf-8")
        state = phase2_familiarize(self.host)
        self.assertEqual(state.memory_status, "present")
        self.assertIsNotNone(state.memory_md_hash)

    def test_pheromone_not_built_status(self):
        state = phase2_familiarize(self.host)
        self.assertEqual(state.pheromone_status, "not_built")

    def test_pheromone_built_status(self):
        pheromone = self.host.lb_session_dir / "pheromone_substrate.json"
        pheromone.write_text(
            json.dumps({"record_count": 42, "topics": ["BRIDLE", "R11"]}),
            encoding="utf-8"
        )
        state = phase2_familiarize(self.host)
        self.assertEqual(state.pheromone_status, "built")
        self.assertEqual(state.pheromone_record_count, 42)
        self.assertEqual(state.pheromone_topic_count, 2)

    def test_ring_of_three_missing(self):
        state = phase2_familiarize(self.host)
        self.assertEqual(state.ring_of_three_status, "missing")

    def test_ring_of_three_complete(self):
        canon = self.host.canon_eblets_dir
        canon.mkdir(parents=True, exist_ok=True)
        for f in [
            "lb_frame_handshake_bp009.eblet.md",
            "mechanical_computer_ai_electricity_meta_cubed_bp009.eblet.md",
            "project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md",
        ]:
            (canon / f).write_text("# test eblet", encoding="utf-8")
        state = phase2_familiarize(self.host)
        self.assertEqual(state.ring_of_three_status, "complete")
        self.assertEqual(len(state.golden_eblets_present), 3)

    def test_canon_eblets_inventoried(self):
        canon = self.host.canon_eblets_dir
        canon.mkdir(parents=True, exist_ok=True)
        (canon / "test.eblet.md").write_text("test", encoding="utf-8")
        state = phase2_familiarize(self.host)
        self.assertGreaterEqual(state.canon_eblet_count, 1)

    def test_pending_knight_prompts_counted(self):
        kp_dir = self.host.bishop_dropzone / "01_KnightPrompts"
        kp_dir.mkdir(parents=True, exist_ok=True)
        (kp_dir / "PROMPT_KNIGHT_KN001_test.md").write_text("test", encoding="utf-8")
        (kp_dir / "PROMPT_KNIGHT_KN002_test.md").write_text("test", encoding="utf-8")
        state = phase2_familiarize(self.host)
        self.assertEqual(state.pending_knight_prompt_count, 2)


if __name__ == "__main__":
    unittest.main()
