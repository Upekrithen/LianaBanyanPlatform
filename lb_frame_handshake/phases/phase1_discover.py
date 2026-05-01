"""
phase1_discover.py — Phase 1: Probe the Host Environment (KN086/BP009)
======================================================================
Discovers what the host looks like before any Handshake changes are applied.
Read-only: no writes, no settings mutations.

BRIDLE Rule 1: probe environment via reads BEFORE applying any setting.
"""

from __future__ import annotations
import json
import os
import platform
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from ..host_context import HostContext


@dataclass
class EnvironmentInventory:
    """Snapshot of host environment state after Phase 1."""

    surface: str = "unknown"
    """Claude Code surface: 'cli', 'vscode', 'cursor', 'web', 'unknown'"""

    os_shell: str = "unknown"
    """Operating system + shell: 'windows/powershell', 'linux/bash', 'macos/zsh', etc."""

    mcp_servers: List[str] = field(default_factory=list)
    """Names of MCP servers configured in settings.json."""

    hooks: List[dict] = field(default_factory=list)
    """Existing hook entries from settings.json."""

    permissions: List[str] = field(default_factory=list)
    """Existing permissions.allow entries from settings.json."""

    models: List[str] = field(default_factory=list)
    """Available model identifiers (parsed from settings if present)."""

    git_available: bool = False
    """True when `git` is on PATH."""

    filesystem_paths: dict = field(default_factory=dict)
    """Key substrate paths → existence + writability status."""

    warnings: List[str] = field(default_factory=list)
    """Non-fatal issues discovered during Phase 1."""

    @property
    def mcp_server_count(self) -> int:
        return len(self.mcp_servers)

    @property
    def hook_count(self) -> int:
        return len(self.hooks)

    @property
    def permission_count(self) -> int:
        return len(self.permissions)

    @property
    def models_summary(self) -> str:
        return ", ".join(self.models) if self.models else "not specified"

    @property
    def mcp_servers_list(self) -> str:
        return ", ".join(self.mcp_servers) if self.mcp_servers else "none"


def _detect_surface() -> str:
    """Heuristically detect the Claude Code surface."""
    # Check environment variables set by various surfaces
    if os.environ.get("CURSOR_TRACE_ID") or os.environ.get("VSCODE_PID"):
        return "cursor"
    if os.environ.get("TERM_PROGRAM") == "vscode":
        return "vscode"
    if os.environ.get("CLAUDE_CODE_SURFACE"):
        return os.environ["CLAUDE_CODE_SURFACE"]
    # Running under Claude Code CLI: check for claude-specific env
    if os.environ.get("CLAUDE_CODE_SESSION_ID") or os.environ.get("ANTHROPIC_API_KEY"):
        return "cli"
    return "unknown"


def _detect_os_shell() -> str:
    system = platform.system().lower()
    if system == "windows":
        shell = os.environ.get("COMSPEC", "")
        if "powershell" in shell.lower() or os.environ.get("PSModulePath"):
            return "windows/powershell"
        return "windows/cmd"
    if system == "darwin":
        shell = os.environ.get("SHELL", "")
        return f"macos/{Path(shell).name}" if shell else "macos/zsh"
    shell = os.environ.get("SHELL", "")
    return f"linux/{Path(shell).name}" if shell else "linux/bash"


def _parse_settings(settings_path: Path) -> dict:
    """Parse settings.json, returning empty dict on any error."""
    if not settings_path.exists():
        return {}
    try:
        return json.loads(settings_path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _probe_path(p: Path) -> dict:
    """Return existence + writability info for a path."""
    exists = p.exists()
    writable = False
    if exists:
        try:
            test = p / "_handshake_probe_" if p.is_dir() else p.parent / "_handshake_probe_"
            test.touch()
            test.unlink()
            writable = True
        except Exception:
            writable = False
    return {"exists": exists, "writable": writable}


def phase1_discover(host: HostContext) -> EnvironmentInventory:
    """
    Phase 1 — Discovery.
    Probes host environment. Read-only; no settings changes.
    """
    inv = EnvironmentInventory()

    inv.surface = _detect_surface()
    inv.os_shell = _detect_os_shell()

    # ── Git availability ─────────────────────────────────────────────────────
    inv.git_available = shutil.which("git") is not None

    # ── Settings.json parse ──────────────────────────────────────────────────
    # Check user-scope first, then project-scope
    settings = {}
    for candidate in [host.settings_json_path, host.settings_local_json_path]:
        parsed = _parse_settings(candidate)
        if parsed:
            settings = parsed
            break

    inv.hooks = settings.get("hooks", [])
    inv.permissions = settings.get("permissions", {}).get("allow", [])
    inv.models = settings.get("env", {}).get("ANTHROPIC_MODEL_FAMILY", "").split(",") if settings else []
    inv.models = [m.strip() for m in inv.models if m.strip()]

    # MCP server names from mcpServers key
    mcp_servers_raw = settings.get("mcpServers", {})
    inv.mcp_servers = list(mcp_servers_raw.keys()) if isinstance(mcp_servers_raw, dict) else []

    # ── Filesystem inventory ─────────────────────────────────────────────────
    substrate_paths = {
        "workspace_root": host.workspace_root,
        "claude_root": host.claude_root,
        "settings_json": host.settings_json_path,
        "librarian_mcp_dir": host.librarian_mcp_dir,
        "librarian_dist": host.librarian_dist_dir,
        "stitchpunks_dir": host.stitchpunks_dir,
        "bishop_dropzone": host.bishop_dropzone,
        "lb_session_dir": host.lb_session_dir,
        "canon_eblets_dir": host.canon_eblets_dir,
        "memory_md": host.memory_md_path,
    }
    inv.filesystem_paths = {name: _probe_path(p) for name, p in substrate_paths.items()}

    # ── Warnings ─────────────────────────────────────────────────────────────
    if not inv.filesystem_paths.get("librarian_dist", {}).get("exists", False):
        inv.warnings.append(
            "librarian-mcp/dist/ not found — run `npm run build` in librarian-mcp/ before use."
        )
    if not inv.filesystem_paths.get("settings_json", {}).get("exists", False):
        inv.warnings.append(
            "settings.json not found — Phase 3 will create it at the user-scope path."
        )
    if not inv.git_available:
        inv.warnings.append("git not on PATH — Stone Tablet commit anchors will be skipped.")

    return inv
