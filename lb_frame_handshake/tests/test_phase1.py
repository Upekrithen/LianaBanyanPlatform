"""
test_phase1.py — Phase 1 (Discovery) unit tests (KN086/BP009)
=============================================================
Uses a synthetic HostContext pointing to a temp directory so real
system paths are never touched.
"""

import json
import os
import tempfile
import unittest
from pathlib import Path

from lb_frame_handshake.host_context import HostContext
from lb_frame_handshake.phases.phase1_discover import phase1_discover


def _make_synthetic_host(tmp: Path, with_settings: bool = False) -> HostContext:
    host = HostContext(
        workspace_root=tmp / "workspace",
        claude_root=tmp / "claude",
        lb_session_dir=tmp / "lb-session",
    )
    (tmp / "workspace").mkdir(parents=True, exist_ok=True)
    (tmp / "claude").mkdir(parents=True, exist_ok=True)
    (tmp / "lb-session").mkdir(parents=True, exist_ok=True)

    if with_settings:
        settings = {
            "permissions": {"allow": ["mcp__librarian__brief_me", "mcp__librarian__scribe_log"]},
            "mcpServers": {"librarian": {}, "perplexity": {}},
            "hooks": [{"event": "SessionStart"}],
        }
        host.settings_json_path.parent.mkdir(parents=True, exist_ok=True)
        host.settings_json_path.write_text(json.dumps(settings), encoding="utf-8")

    return host


class TestPhase1Discover(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_returns_environment_inventory(self):
        host = _make_synthetic_host(self.tmp)
        inv = phase1_discover(host)
        self.assertIsNotNone(inv)

    def test_os_shell_detected(self):
        host = _make_synthetic_host(self.tmp)
        inv = phase1_discover(host)
        self.assertIn("/", inv.os_shell, "os_shell should contain a slash separator")

    def test_permissions_parsed_from_settings(self):
        host = _make_synthetic_host(self.tmp, with_settings=True)
        inv = phase1_discover(host)
        self.assertIn("mcp__librarian__brief_me", inv.permissions)
        self.assertEqual(inv.permission_count, 2)

    def test_mcp_servers_parsed(self):
        host = _make_synthetic_host(self.tmp, with_settings=True)
        inv = phase1_discover(host)
        self.assertEqual(inv.mcp_server_count, 2)
        self.assertIn("librarian", inv.mcp_servers)

    def test_hooks_parsed(self):
        host = _make_synthetic_host(self.tmp, with_settings=True)
        inv = phase1_discover(host)
        self.assertEqual(inv.hook_count, 1)

    def test_missing_librarian_dist_warns(self):
        host = _make_synthetic_host(self.tmp)
        inv = phase1_discover(host)
        warning_text = " ".join(inv.warnings)
        self.assertIn("librarian-mcp", warning_text.lower())

    def test_missing_settings_json_warns(self):
        host = _make_synthetic_host(self.tmp)
        inv = phase1_discover(host)
        warning_text = " ".join(inv.warnings)
        self.assertIn("settings.json", warning_text.lower())

    def test_filesystem_paths_inventoried(self):
        host = _make_synthetic_host(self.tmp)
        inv = phase1_discover(host)
        self.assertIn("workspace_root", inv.filesystem_paths)
        self.assertTrue(inv.filesystem_paths["workspace_root"]["exists"])

    def test_properties_work(self):
        host = _make_synthetic_host(self.tmp, with_settings=True)
        inv = phase1_discover(host)
        self.assertIsInstance(inv.mcp_servers_list, str)
        self.assertIsInstance(inv.models_summary, str)


if __name__ == "__main__":
    unittest.main()
