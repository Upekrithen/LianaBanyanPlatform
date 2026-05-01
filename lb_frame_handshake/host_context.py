"""
host_context.py — HostContext dataclass for LB Frame Handshake (KN086/BP009)
=============================================================================
Encapsulates the host-specific paths and configuration that vary between
LB substrate installations (Bishop's machine, Federation member's machine, etc.).

Pass a HostContext to every phase function. Default constructor resolves
standard LB paths for Windows; override any field for Federation use.
"""

from __future__ import annotations
import os
from dataclasses import dataclass, field
from pathlib import Path


def _default_workspace() -> Path:
    """Resolve the standard LB Platform workspace root."""
    return Path(os.path.expandvars(r"C:\Users\Administrator\Documents\LianaBanyanPlatform"))


def _default_claude_root() -> Path:
    return Path(os.path.expandvars(r"C:\Users\Administrator\.claude"))


def _default_lb_session() -> Path:
    return Path.home() / ".lb-session"


@dataclass
class HostContext:
    """
    Host-environment context for a single Handshake run.

    All paths default to the canonical LB installation on Windows.
    For Federation members or CI environments, override the relevant fields.
    """

    # ── Core paths ──────────────────────────────────────────────────────────
    workspace_root: Path = field(default_factory=_default_workspace)
    claude_root: Path = field(default_factory=_default_claude_root)
    lb_session_dir: Path = field(default_factory=_default_lb_session)

    # ── Settings paths ───────────────────────────────────────────────────────
    @property
    def settings_json_path(self) -> Path:
        return self.claude_root / "settings.json"

    @property
    def settings_local_json_path(self) -> Path:
        return self.workspace_root / ".claude" / "settings.json"

    # ── Memory paths ─────────────────────────────────────────────────────────
    @property
    def memory_md_path(self) -> Path:
        projects_dir = self.claude_root / "projects"
        pattern = "C--Users-Administrator-Documents"
        for candidate in projects_dir.iterdir() if projects_dir.exists() else []:
            if pattern in candidate.name:
                return candidate / "memory" / "MEMORY.md"
        return projects_dir / pattern / "memory" / "MEMORY.md"

    # ── Eblet paths ──────────────────────────────────────────────────────────
    @property
    def canon_eblets_dir(self) -> Path:
        return self.claude_root / "state" / "eblets" / "CANON"

    @property
    def augur_living_gate_dir(self) -> Path:
        return self.claude_root / "state" / "augur_living_gate"

    # ── Librarian paths ───────────────────────────────────────────────────────
    @property
    def librarian_mcp_dir(self) -> Path:
        return self.workspace_root / "librarian-mcp"

    @property
    def librarian_dist_dir(self) -> Path:
        return self.librarian_mcp_dir / "dist"

    @property
    def stitchpunks_dir(self) -> Path:
        return self.librarian_mcp_dir / "stitchpunks"

    # ── Dropzone paths ────────────────────────────────────────────────────────
    @property
    def bishop_dropzone(self) -> Path:
        return self.workspace_root / "BISHOP_DROPZONE"

    @property
    def knight_dropzone(self) -> Path:
        return self.workspace_root / "KNIGHT_DROPZONE"

    # ── Federation flag ───────────────────────────────────────────────────────
    is_federation_member: bool = False
    """True when this host is a project-owner Federation install (not the Founder's machine)."""

    federation_project_name: str = ""
    """Project name for branding Federation eblets."""

    # ── Dry-run flag ──────────────────────────────────────────────────────────
    dry_run: bool = False
    """When True, Phase 3 computes diffs but makes no actual changes."""

    def __post_init__(self) -> None:
        # Coerce str paths to Path objects to support override convenience
        self.workspace_root = Path(self.workspace_root)
        self.claude_root = Path(self.claude_root)
        self.lb_session_dir = Path(self.lb_session_dir)
