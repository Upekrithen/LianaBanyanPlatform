"""
phase1_discover.py — Phase 1: Probe the Host Environment (KN086/BP009)
======================================================================
Discovers what the host looks like before any Handshake changes are applied.
Read-only: no writes, no settings mutations.

BRIDLE Rule 1: probe environment via reads BEFORE applying any setting.

KN-H1 extension (BP017 Three-Tier Resource-Config Installer):
  Step 1.3 — Tier-selection state probe. Reads member's previously chosen
  lb_frame_resource_config_tier from Supabase (via env vars SUPABASE_URL +
  SUPABASE_SERVICE_ROLE_KEY). If tier not yet chosen, sets
  `tier_selection_required=True` so the orchestrator surfaces the picker.
  Orthogonal to cohort-class probe (Step 1.2); both run at Phase 1 Discovery.
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

    # ── KN-H1: Step 1.3 — Tier-selection state ──────────────────────────────
    lb_frame_resource_config_tier: Optional[str] = None
    """
    Member's previously chosen LB Frame resource-config tier.
    None  = tier not yet chosen (tier_selection_required will be True).
    'needs'    = Tier A (default plan, no upgrade)
    'suggests' = Tier B (recommended uplift)
    'founder'  = Tier C (empirical-receipt-source, self-attested)

    KN-H1 / BP017 Three-Tier Resource-Config Installer.
    Orthogonal to cohort_class (Step 1.2).
    """

    tier_selection_required: bool = False
    """True when lb_frame_resource_config_tier is None — Handshake must surface the picker."""

    tier_probe_error: Optional[str] = None
    """Set if tier probe failed (DB unavailable etc.). tier_selection_required will still be True (BRIDLE Rule 4)."""

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

    # ── KN-H1 Step 1.3: Probe existing tier-config choice ────────────────────
    # Read-only: checks if the member has already chosen a tier from a previous
    # Handshake run. If not, sets tier_selection_required=True so the orchestrator
    # surfaces TierSelectionStep before proceeding.
    # Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env (or host.supabase_url/key).
    _probe_tier_config(host, inv)

    return inv


def _probe_tier_config(host: HostContext, inv: EnvironmentInventory) -> None:
    """
    KN-H1 Step 1.3: Probe existing LB Frame resource-config tier from Supabase.
    Read-only; no writes. Falls back gracefully if DB unavailable (BRIDLE Rule 4).

    Sets:
      inv.lb_frame_resource_config_tier — the stored tier enum value, or None
      inv.tier_selection_required       — True if tier not yet chosen
      inv.tier_probe_error              — error string on failure
    """
    import urllib.request
    import urllib.error

    supabase_url = os.environ.get("SUPABASE_URL") or getattr(host, "supabase_url", None)
    supabase_key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_ANON_KEY")
        or getattr(host, "supabase_key", None)
    )
    member_id = os.environ.get("LB_FRAME_MEMBER_ID") or getattr(host, "member_id", None)

    if not supabase_url or not supabase_key or not member_id:
        # No Supabase config or member ID — cannot probe; require selection at UI
        inv.tier_selection_required = True
        inv.tier_probe_error = (
            "Supabase URL/key or LB_FRAME_MEMBER_ID not set — "
            "tier_selection_required=True; surface picker at Step 1.3"
        )
        return

    # Call Supabase RPC via HTTP (no external dependency; avoids import issues)
    rpc_url = f"{supabase_url.rstrip('/')}/rest/v1/rpc/get_lb_frame_resource_config_tier"
    payload = json.dumps({"p_user_id": member_id}).encode("utf-8")
    req = urllib.request.Request(
        rpc_url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        inv.tier_selection_required = True
        inv.tier_probe_error = f"HTTP {e.code} from Supabase RPC — tier_selection_required=True"
        return
    except Exception as e:
        inv.tier_selection_required = True
        inv.tier_probe_error = f"Tier probe exception: {e} — tier_selection_required=True (BRIDLE Rule 4)"
        return

    tier_state = data.get("tier_state", "not_chosen")
    tier = data.get("tier")

    if tier_state == "chosen" and tier in ("needs", "suggests", "founder"):
        inv.lb_frame_resource_config_tier = tier
        inv.tier_selection_required = False
    else:
        inv.tier_selection_required = True
