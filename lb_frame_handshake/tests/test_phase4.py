"""
test_phase4.py — Phase 4 (Verify) unit tests (KN086/BP009)
===========================================================
"""

import json
import tempfile
import unittest
from pathlib import Path

from lb_frame_handshake.host_context import HostContext
from lb_frame_handshake.phases.phase1_discover import phase1_discover
from lb_frame_handshake.phases.phase2_familiarize import phase2_familiarize
from lb_frame_handshake.phases.phase3_set import phase3_set
from lb_frame_handshake.phases.phase4_verify import phase4_verify, VerifyResults


def _full_run(tmp: Path, dry_run: bool = False):
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
    return host, inv, state, applied, verify


class TestPhase4Verify(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_returns_verify_results(self):
        _, _, _, _, verify = _full_run(self.tmp)
        self.assertIsInstance(verify, VerifyResults)

    def test_permissions_smoke_test_passes_after_phase3(self):
        _, _, _, _, verify = _full_run(self.tmp)
        # smoke_test_1 verifies permissions persisted in settings.json
        self.assertEqual(verify.smoke_test_1, "pass")

    def test_env_smoke_test_passes(self):
        _, _, _, _, verify = _full_run(self.tmp)
        # smoke_test_2 verifies env defaults persisted
        self.assertEqual(verify.smoke_test_2, "pass")

    def test_tests_list_populated(self):
        _, _, _, _, verify = _full_run(self.tmp)
        self.assertGreater(len(verify.tests), 0)

    def test_permissions_and_env_pass_in_synthetic_host(self):
        """Permissions and env checks must pass after Phase 3 even in a minimal synthetic host."""
        _, _, _, _, verify = _full_run(self.tmp)
        # These two smoke tests verify settings.json was written correctly by Phase 3
        # and must pass even in a synthetic host with no librarian or registry.
        t_perm = next((t for t in verify.tests if t.name == "permissions_persisted"), None)
        t_env = next((t for t in verify.tests if t.name == "env_defaults_persisted"), None)
        if t_perm:
            self.assertEqual(t_perm.status, "pass", f"permissions_persisted failed: {t_perm}")
        if t_env:
            self.assertEqual(t_env.status, "pass", f"env_defaults_persisted failed: {t_env}")

    def test_librarian_not_built_warns(self):
        _, _, _, _, verify = _full_run(self.tmp)
        # librarian dist not present in synthetic host → smoke_test_3 is fail/warn
        t3 = next((t for t in verify.tests if t.name == "librarian_reachable"), None)
        self.assertIsNotNone(t3)
        self.assertIn(t3.status, ("fail", "warn"))

    def test_mcp_live_tests_skipped_warning_present(self):
        _, _, _, _, verify = _full_run(self.tmp)
        combined_warnings = " ".join(verify.warnings).lower()
        self.assertIn("live mcp", combined_warnings)

    def test_smoke_test_result_str_repr(self):
        from lb_frame_handshake.phases.phase4_verify import SmokeTestResult
        t = SmokeTestResult("test_name", "pass", "all good")
        self.assertIn("✓", str(t))
        t2 = SmokeTestResult("test_name", "fail", "broken")
        self.assertIn("✗", str(t2))


if __name__ == "__main__":
    unittest.main()
