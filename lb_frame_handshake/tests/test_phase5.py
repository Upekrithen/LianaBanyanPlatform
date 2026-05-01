"""
test_phase5.py — Phase 5 (Report) unit tests (KN086/BP009)
===========================================================
"""

import tempfile
import unittest
from pathlib import Path

from lb_frame_handshake.host_context import HostContext
from lb_frame_handshake.phases.phase1_discover import phase1_discover
from lb_frame_handshake.phases.phase2_familiarize import phase2_familiarize
from lb_frame_handshake.phases.phase3_set import phase3_set
from lb_frame_handshake.phases.phase4_verify import phase4_verify
from lb_frame_handshake.phases.phase5_report import phase5_report


def _run_all_phases(tmp: Path, session_id: str = "KN086", dry_run: bool = False):
    host = HostContext(
        workspace_root=tmp / "workspace",
        claude_root=tmp / "claude",
        lb_session_dir=tmp / "lb-session",
        dry_run=dry_run,
    )
    for d in [host.workspace_root, host.claude_root, host.lb_session_dir]:
        d.mkdir(parents=True, exist_ok=True)
    inv = phase1_discover(host)
    state = phase2_familiarize(host)
    applied = phase3_set(host, inv, state)
    verify = phase4_verify(host, applied)
    receipt_path = phase5_report(host, inv, state, applied, verify, session_id=session_id)
    return host, receipt_path


class TestPhase5Report(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_receipt_file_written(self):
        _, receipt = _run_all_phases(self.tmp)
        self.assertTrue(receipt.exists(), f"Receipt not written: {receipt}")

    def test_receipt_filename_contains_session(self):
        _, receipt = _run_all_phases(self.tmp, session_id="KN086")
        self.assertIn("KN086", receipt.name)

    def test_receipt_contains_session_id(self):
        _, receipt = _run_all_phases(self.tmp, session_id="KN086")
        content = receipt.read_text(encoding="utf-8")
        self.assertIn("KN086", content)

    def test_receipt_contains_phase_headers(self):
        _, receipt = _run_all_phases(self.tmp)
        content = receipt.read_text(encoding="utf-8")
        self.assertIn("Phase 1", content)
        self.assertIn("Phase 2", content)
        self.assertIn("Phase 3", content)
        self.assertIn("Phase 4", content)

    def test_receipt_contains_first_fire_signal(self):
        _, receipt = _run_all_phases(self.tmp)
        content = receipt.read_text(encoding="utf-8")
        self.assertTrue(
            "FIRST-FIRE READY" in content or "NOT FIRST-FIRE READY" in content
        )

    def test_dry_run_no_receipt_on_disk(self):
        """In dry_run mode, receipt should NOT actually be written to disk."""
        host, receipt_path = _run_all_phases(self.tmp, dry_run=True)
        # receipt_path is computed but file is not written
        self.assertFalse(
            receipt_path.exists(),
            f"Receipt written in dry_run mode: {receipt_path}"
        )

    def test_receipt_does_not_contain_unrendered_placeholders(self):
        """Verify template substitution is complete — no {key} left unrendered."""
        import re
        _, receipt = _run_all_phases(self.tmp)
        content = receipt.read_text(encoding="utf-8")
        unrendered = re.findall(r"\{[a-z_\.]+\}", content)
        self.assertEqual(
            unrendered, [],
            f"Unrendered template placeholders found: {unrendered}"
        )


if __name__ == "__main__":
    unittest.main()
