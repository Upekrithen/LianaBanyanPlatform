"""
test_integration.py — Integration tests for LB Frame Handshake (KN086/BP009)
=============================================================================
Tests the full Handshake orchestrator (handshake.py) against a synthetic host.
Verifies:
  - Full run: all 5 phases execute, receipt artifact lands
  - Dry-run: all phases execute, no files written
  - Idempotent: running Handshake twice yields same settings state
  - Probe-only: only Phase 1 runs
  - Federation mode: federation flags set in result
"""

import json
import tempfile
import unittest
from pathlib import Path

from lb_frame_handshake.host_context import HostContext
from lb_frame_handshake.handshake import handshake


def _make_host(tmp: Path, **kwargs) -> HostContext:
    host = HostContext(
        workspace_root=tmp / "workspace",
        claude_root=tmp / "claude",
        lb_session_dir=tmp / "lb-session",
        **kwargs,
    )
    for d in [host.workspace_root, host.claude_root, host.lb_session_dir]:
        d.mkdir(parents=True, exist_ok=True)
    return host


class TestHandshakeIntegration(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_full_run_returns_result(self):
        host = _make_host(self.tmp)
        result = handshake(host=host, session_id="KN086")
        self.assertIsNotNone(result)
        self.assertIsNotNone(result.inventory)
        self.assertIsNotNone(result.state)
        self.assertIsNotNone(result.applied)
        self.assertIsNotNone(result.verify)

    def test_full_run_receipt_artifact_lands(self):
        host = _make_host(self.tmp)
        # Create bishop_dropzone/03_BishopHandoffs for receipt output
        dropzone = host.bishop_dropzone / "03_BishopHandoffs"
        dropzone.mkdir(parents=True, exist_ok=True)

        result = handshake(host=host, session_id="KN086")
        self.assertIsNotNone(result.receipt_path)
        self.assertTrue(result.receipt_path.exists(), f"Receipt not found: {result.receipt_path}")

    def test_dry_run_no_settings_written(self):
        host = _make_host(self.tmp, dry_run=True)
        self.assertFalse(host.settings_json_path.exists())
        result = handshake(host=host, session_id="KN086")
        self.assertTrue(result.dry_run)
        self.assertFalse(
            host.settings_json_path.exists(),
            "settings.json written during dry_run"
        )

    def test_idempotent_double_run(self):
        """Running the Handshake twice must produce the same settings state."""
        host = _make_host(self.tmp)

        handshake(host=host, session_id="KN086")
        data1 = json.loads(host.settings_json_path.read_text(encoding="utf-8"))
        allow1 = sorted(data1["permissions"]["allow"])

        handshake(host=host, session_id="KN086b")
        data2 = json.loads(host.settings_json_path.read_text(encoding="utf-8"))
        allow2 = sorted(data2["permissions"]["allow"])

        self.assertEqual(allow1, allow2, "Permissions changed on second run — not idempotent")

    def test_probe_only_no_settings_written(self):
        host = _make_host(self.tmp)
        result = handshake(host=host, session_id="KN086", probe_only=True)
        self.assertIsNone(result.receipt_path)
        self.assertFalse(
            host.settings_json_path.exists(),
            "settings.json written in probe_only mode"
        )
        self.assertIsNotNone(result.inventory)

    def test_federation_mode(self):
        host = _make_host(self.tmp, is_federation_member=True, federation_project_name="TestProject")
        result = handshake(host=host, session_id="KN086")
        self.assertTrue(result.applied.federation_applied)
        self.assertIn("TestProject", result.applied.project_brand)


if __name__ == "__main__":
    unittest.main()
