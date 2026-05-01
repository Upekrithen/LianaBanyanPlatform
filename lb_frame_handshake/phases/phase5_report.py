"""
phase5_report.py — Phase 5: Generate Handshake Receipt Artifact (KN086/BP009)
==============================================================================
Renders the canonical handshake_receipt_<session>.md from the template and
writes it to BISHOP_DROPZONE/03_BishopHandoffs/ (or to lb_session_dir if
the dropzone is unavailable).

BRIDLE Rule 4 (Path B): write empirical receipt FIRST; declare Handshake
operational only after receipt artifact lands.
"""

from __future__ import annotations
import datetime
import os
from pathlib import Path
from typing import Optional

from ..host_context import HostContext
from .phase1_discover import EnvironmentInventory
from .phase2_familiarize import SubstrateState
from .phase3_set import AppliedDefaults
from .phase4_verify import VerifyResults


_TEMPLATE_PATH = Path(__file__).parent.parent / "templates" / "handshake_receipt.md.tpl"


def _render(template: str, **kwargs) -> str:
    """Simple {key} substitution — no dependencies, deterministic."""
    for k, v in kwargs.items():
        template = template.replace("{" + k + "}", str(v))
    return template


def _format_warnings(warnings: list) -> str:
    if not warnings:
        return "None."
    return "\n".join(f"- ⚠ {w}" for w in warnings)


def _format_permissions_diff(applied: AppliedDefaults) -> str:
    lines = [applied.permissions_diff]
    if applied.permissions_added:
        lines.append(f"\nAdded {len(applied.permissions_added)} entries:")
        for p in applied.permissions_added[:10]:
            lines.append(f"  + {p}")
        if len(applied.permissions_added) > 10:
            lines.append(f"  ... and {len(applied.permissions_added) - 10} more")
    return "\n".join(lines)


def _format_federation_section(host: HostContext, applied: AppliedDefaults) -> str:
    if not host.is_federation_member:
        return ""
    return f"""
### Federation Delivery
- Project: {host.federation_project_name or '(unnamed)'}
- Ring of Three: {applied.ring_of_three_status}
- Project brand: {applied.project_brand}
- IP Ledger anchor: {applied.ip_ledger_anchor}
"""


def phase5_report(
    host: HostContext,
    inventory: EnvironmentInventory,
    state: SubstrateState,
    applied: AppliedDefaults,
    verify: VerifyResults,
    session_id: str = "manual",
) -> Path:
    """
    Phase 5 — Report.
    Renders the Handshake receipt and writes it to disk.
    Returns the path to the receipt file.
    """
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    first_fire_ready = verify.all_passed()

    if first_fire_ready:
        first_fire_banner = "✓ FIRST-FIRE READY — all smoke tests passed"
        first_fire_detail = "The LB Frame Handshake completed successfully. AI electricity may now flow."
    else:
        failing = [t for t in verify.tests if t.status not in ("pass", "skip")]
        first_fire_banner = f"⚠ NOT FIRST-FIRE READY — {len(failing)} issue(s)"
        first_fire_detail = "\n".join(f"- {t}" for t in failing)

    # ── All collected warnings ─────────────────────────────────────────────
    all_warnings = (
        inventory.warnings
        + state.warnings
        + applied.warnings
        + verify.warnings
    )

    # ── Render template ────────────────────────────────────────────────────
    template = _TEMPLATE_PATH.read_text(encoding="utf-8")

    # Build smoke test results table rows
    receipt_text = _render(
        template,
        session_id=session_id,
        timestamp_iso=timestamp,
        first_fire_ready="YES" if first_fire_ready else "NO",
        # Phase 1
        **{
            f"environment.{k}": v for k, v in {
                "surface": inventory.surface,
                "os_shell": inventory.os_shell,
                "mcp_server_count": inventory.mcp_server_count,
                "hook_count": inventory.hook_count,
                "permission_count": inventory.permission_count,
                "models_summary": inventory.models_summary,
                "git_available": inventory.git_available,
                "mcp_servers_list": inventory.mcp_servers_list,
            }.items()
        },
        # Phase 2
        **{
            f"substrate_state.{k}": v for k, v in {
                "memory_status": state.memory_status,
                "pheromone_status": state.pheromone_status,
                "pheromone_record_count": state.pheromone_record_count,
                "wrasse_status": state.wrasse_status,
                "catechist_status": state.catechist_status,
                "augur_status": state.augur_status,
                "shadow_status": state.shadow_status,
                "checkbook_status": state.checkbook_status,
                "stitchpunk_count": state.stitchpunk_count,
                "ring_of_three_status": state.ring_of_three_status,
                "canon_eblet_count": state.canon_eblet_count,
                "pending_knight_prompt_count": state.pending_knight_prompt_count,
            }.items()
        },
        # Phase 3
        **{
            f"settings_applied.{k}": v for k, v in {
                "permissions_diff": _format_permissions_diff(applied),
                "hooks_diff": applied.hooks_diff,
                "env_diff": applied.env_diff,
                "fs_writability": applied.fs_writability,
                "session_state_dirs": applied.session_state_dirs,
                "librarian_mcp": applied.librarian_mcp,
            }.items()
        },
        # Phase 4
        **{
            f"smoke_test_results.{k}": v for k, v in {
                "smoke_test_1": verify.smoke_test_1,
                "smoke_test_2": verify.smoke_test_2,
                "smoke_test_3": verify.smoke_test_3,
                "smoke_test_4": verify.smoke_test_4,
                "smoke_test_5": verify.smoke_test_5,
                "catechist_grade": verify.catechist_grade,
                "augur_living_gate_state": verify.augur_living_gate_state,
            }.items()
        },
        # Sections
        federation_section=_format_federation_section(host, applied),
        warnings_section=_format_warnings(all_warnings),
        first_fire_banner=first_fire_banner,
        first_fire_detail=first_fire_detail,
    )

    # ── Determine output path ──────────────────────────────────────────────
    safe_session = session_id.replace("/", "_").replace("\\", "_")
    filename = f"HANDSHAKE_RECEIPT_{safe_session}_{timestamp[:10].replace('-', '')}.md"

    output_dir = host.bishop_dropzone / "03_BishopHandoffs"
    if not output_dir.exists():
        output_dir = host.lb_session_dir
        output_dir.mkdir(parents=True, exist_ok=True)

    receipt_path = output_dir / filename

    if not host.dry_run:
        receipt_path.write_text(receipt_text, encoding="utf-8")

    return receipt_path
