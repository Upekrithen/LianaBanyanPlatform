"""
test_phase3.py — Phase 3 (Set) unit tests (KN086/BP009)
========================================================
Tests idempotency: running Phase 3 twice must not duplicate permissions.
Tests dry_run: no settings.json written when dry_run=True.
"""

import json
import tempfile
import unittest
from pathlib import Path

from lb_frame_handshake.host_context import HostContext
from lb_frame_handshake.phases.phase1_discover import phase1_discover
from lb_frame_handshake.phases.phase2_familiarize import phase2_familiarize
from lb_frame_handshake.phases.phase3_set import phase3_set, _load_safe_mcp_tools


def _make_host(tmp: Path, dry_run: bool = False) -> HostContext:
    host = HostContext(
        workspace_root=tmp / "workspace",
        claude_root=tmp / "claude",
        lb_session_dir=tmp / "lb-session",
        dry_run=dry_run,
    )
    for d in [host.workspace_root, host.claude_root, host.lb_session_dir]:
        d.mkdir(parents=True, exist_ok=True)
    return host


class TestPhase3Set(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _run_all(self, host):
        inv = phase1_discover(host)
        state = phase2_familiarize(host)
        return phase3_set(host, inv, state)

    def test_creates_settings_json(self):
        host = _make_host(self.tmp)
        self.assertFalse(host.settings_json_path.exists())
        self._run_all(host)
        self.assertTrue(host.settings_json_path.exists())

    def test_settings_json_has_permissions(self):
        host = _make_host(self.tmp)
        self._run_all(host)
        data = json.loads(host.settings_json_path.read_text(encoding="utf-8"))
        allow = data.get("permissions", {}).get("allow", [])
        self.assertIn("mcp__librarian__brief_me", allow)
        self.assertIn("mcp__librarian__scribe_log", allow)

    def test_settings_json_has_env_defaults(self):
        host = _make_host(self.tmp)
        self._run_all(host)
        data = json.loads(host.settings_json_path.read_text(encoding="utf-8"))
        self.assertEqual(data.get("env", {}).get("MCP_TIMEOUT"), "300000")
        self.assertEqual(data.get("env", {}).get("MCP_TOOL_TIMEOUT"), "600000")

    def test_idempotent_permissions(self):
        """Running Phase 3 twice must not duplicate permissions entries."""
        host = _make_host(self.tmp)
        self._run_all(host)
        # Read allow list after first run
        data1 = json.loads(host.settings_json_path.read_text(encoding="utf-8"))
        allow1 = data1["permissions"]["allow"]

        # Run again
        self._run_all(host)
        data2 = json.loads(host.settings_json_path.read_text(encoding="utf-8"))
        allow2 = data2["permissions"]["allow"]

        self.assertEqual(len(allow1), len(allow2), "Duplicate permissions on second run")
        self.assertEqual(sorted(allow1), sorted(allow2))

    def test_idempotent_env(self):
        """Running Phase 3 twice must not change env values."""
        host = _make_host(self.tmp)
        self._run_all(host)
        data1 = json.loads(host.settings_json_path.read_text(encoding="utf-8"))

        self._run_all(host)
        data2 = json.loads(host.settings_json_path.read_text(encoding="utf-8"))

        self.assertEqual(data1["env"], data2["env"])

    def test_dry_run_no_write(self):
        """dry_run=True: settings.json must NOT be written."""
        host = _make_host(self.tmp, dry_run=True)
        self.assertFalse(host.settings_json_path.exists())
        self._run_all(host)
        self.assertFalse(host.settings_json_path.exists(), "settings.json written in dry_run mode")

    def test_load_safe_mcp_tools_not_empty(self):
        tools = _load_safe_mcp_tools()
        self.assertGreater(len(tools), 5, "Expected at least 5 safe MCP tools in config")
        self.assertIn("mcp__librarian__brief_me", tools)

    def test_applied_reports_added(self):
        host = _make_host(self.tmp)
        inv = phase1_discover(host)
        state = phase2_familiarize(host)
        applied = phase3_set(host, inv, state)
        self.assertGreater(len(applied.permissions_added), 0)

    def test_second_run_nothing_added(self):
        host = _make_host(self.tmp)
        self._run_all(host)
        # Second run — everything already present
        inv = phase1_discover(host)
        state = phase2_familiarize(host)
        applied = phase3_set(host, inv, state)
        self.assertEqual(len(applied.permissions_added), 0)
        self.assertEqual(applied.permissions_diff.startswith("All"), True)


if __name__ == "__main__":
    unittest.main()
