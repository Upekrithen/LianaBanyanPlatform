"""
phase3_set.py — Phase 3: Apply Safe Defaults (KN086/BP009)
===========================================================
Applies the KN085 safe defaults to settings.json and initializes
substrate directories. Idempotent — safe to run multiple times.

BRIDLE Rule 3 (least-privilege): only pre-approve KNOWN-SAFE tools.
BRIDLE Rule 1: inspect settings.json BEFORE editing.
"""

from __future__ import annotations
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import yaml

from ..host_context import HostContext
from .phase1_discover import EnvironmentInventory
from .phase2_familiarize import SubstrateState

# Config files relative to this package's config/ directory
_CONFIG_DIR = Path(__file__).parent.parent / "config"


def _load_safe_mcp_tools() -> List[str]:
    """Load the canonical safe MCP tool list from config/safe_mcp_tools.yaml."""
    path = _CONFIG_DIR / "safe_mcp_tools.yaml"
    if not path.exists():
        return []
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return data.get("safe_tools", [])


def _load_safe_fs_globs() -> List[str]:
    """Load pre-approved Write/Edit filesystem globs."""
    path = _CONFIG_DIR / "safe_filesystem_globs.yaml"
    if not path.exists():
        return []
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return data.get("safe_write_globs", [])


def _load_settings(path: Path) -> dict:
    """Read settings.json; return empty dict if missing or parse error."""
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_settings(path: Path, data: dict, dry_run: bool) -> None:
    """Write settings.json, creating parent dirs as needed."""
    if dry_run:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


@dataclass
class AppliedDefaults:
    """What Phase 3 changed (or would change in dry_run)."""

    permissions_added: List[str] = field(default_factory=list)
    permissions_already_present: List[str] = field(default_factory=list)
    permissions_diff: str = "(none)"

    hooks_added: int = 0
    hooks_already_present: int = 0
    hooks_diff: str = "(none)"

    env_set: dict = field(default_factory=dict)
    env_diff: str = "(none)"

    fs_writability: str = "not_checked"
    session_state_dirs: str = "not_checked"
    librarian_mcp: str = "not_checked"

    federation_applied: bool = False
    ring_of_three_status: str = "n/a"
    project_brand: str = "n/a"
    ip_ledger_anchor: str = "n/a"

    dry_run: bool = False
    warnings: List[str] = field(default_factory=list)


def phase3_set(
    host: HostContext,
    inventory: EnvironmentInventory,
    state: SubstrateState,
) -> AppliedDefaults:
    """
    Phase 3 — Set Environment.
    Applies safe defaults to settings.json and initializes substrate dirs.
    Idempotent.
    """
    applied = AppliedDefaults(dry_run=host.dry_run)

    # ── Load canonical safe lists ─────────────────────────────────────────────
    safe_mcp_tools = _load_safe_mcp_tools()
    safe_fs_globs = _load_safe_fs_globs()
    desired_permissions = safe_mcp_tools + safe_fs_globs

    # ── Merge permissions into settings.json ──────────────────────────────────
    settings_path = host.settings_json_path
    settings = _load_settings(settings_path)

    perms = settings.setdefault("permissions", {})
    allow_list: List[str] = perms.get("allow", [])

    existing_set = set(allow_list)
    new_entries = []
    already_present = []

    for perm in desired_permissions:
        if perm in existing_set:
            already_present.append(perm)
        else:
            new_entries.append(perm)
            existing_set.add(perm)

    applied.permissions_added = new_entries
    applied.permissions_already_present = already_present

    if new_entries:
        allow_list.extend(new_entries)
        perms["allow"] = allow_list
        applied.permissions_diff = (
            f"Added {len(new_entries)} entries: "
            + ", ".join(new_entries[:5])
            + ("..." if len(new_entries) > 5 else "")
        )
    else:
        applied.permissions_diff = f"All {len(already_present)} permissions already present — no change."

    # ── Set environment defaults ───────────────────────────────────────────────
    env_defaults = {
        "MCP_TIMEOUT": "300000",
        "MCP_TOOL_TIMEOUT": "600000",
    }
    env_section = settings.setdefault("env", {})
    env_added = {}
    for k, v in env_defaults.items():
        if k not in env_section:
            env_section[k] = v
            env_added[k] = v

    applied.env_set = env_added
    if env_added:
        applied.env_diff = f"Set: {env_added}"
    else:
        applied.env_diff = "MCP_TIMEOUT + MCP_TOOL_TIMEOUT already set."

    # ── Write updated settings.json ───────────────────────────────────────────
    if new_entries or env_added:
        _write_settings(settings_path, settings, host.dry_run)

    # ── Initialize substrate directories ──────────────────────────────────────
    dirs_to_init = [host.lb_session_dir]
    dirs_created = []
    for d in dirs_to_init:
        if not d.exists():
            if not host.dry_run:
                d.mkdir(parents=True, exist_ok=True)
            dirs_created.append(str(d))

    applied.session_state_dirs = (
        f"Created: {dirs_created}" if dirs_created
        else "All session state dirs already present."
    )

    # ── Verify librarian-mcp is built ─────────────────────────────────────────
    dist_server = host.librarian_dist_dir / "server.js"
    if dist_server.exists():
        applied.librarian_mcp = f"Built — dist/server.js present ({dist_server})"
    else:
        applied.librarian_mcp = "NOT BUILT — run `npm run build` in librarian-mcp/"
        applied.warnings.append(
            "librarian-mcp not built. Smoke tests (Phase 4) will be skipped until built."
        )

    # ── Verify substrate path writability ─────────────────────────────────────
    writability_issues = []
    for name, info in inventory.filesystem_paths.items():
        if info.get("exists") and not info.get("writable"):
            writability_issues.append(name)
    applied.fs_writability = (
        "All writable" if not writability_issues
        else f"NOT writable: {writability_issues}"
    )

    # ── Federation: Ring of Three delivery ────────────────────────────────────
    if host.is_federation_member:
        applied.federation_applied = True
        # For Federation, copy Ring of Three eblets to canon dir if missing
        canon_dir = host.canon_eblets_dir
        if not host.dry_run:
            canon_dir.mkdir(parents=True, exist_ok=True)
        present_count = len(state.golden_eblets_present)
        applied.ring_of_three_status = (
            f"complete ({present_count}/3 present)"
            if present_count == 3
            else f"needs delivery ({present_count}/3 present)"
        )
        applied.project_brand = (
            f"Federation project: {host.federation_project_name}" if host.federation_project_name
            else "Federation member — project name not set"
        )
        applied.ip_ledger_anchor = "IP ledger registration queued (manual Founder ratification required)"
    else:
        applied.ring_of_three_status = state.ring_of_three_status

    return applied
