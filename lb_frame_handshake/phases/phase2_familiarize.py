"""
phase2_familiarize.py — Phase 2: Load LB Substrate State (KN086/BP009)
=======================================================================
Reads the current state of all LB substrate components and produces a
snapshot. Read-only: no writes; pure introspection.

BRIDLE Rule 1: probe before applying.
"""

from __future__ import annotations
import glob
import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from ..host_context import HostContext


@dataclass
class SubstrateState:
    """Snapshot of LB substrate state after Phase 2."""

    # ── Memory ────────────────────────────────────────────────────────────────
    memory_md_hash: Optional[str] = None
    memory_status: str = "missing"

    # ── Pheromone ─────────────────────────────────────────────────────────────
    pheromone_record_count: int = 0
    pheromone_topic_count: int = 0
    pheromone_status: str = "not_built"

    # ── Wrasse registry ───────────────────────────────────────────────────────
    wrasse_pattern_count: int = 0
    wrasse_status: str = "missing"

    # ── Catechist ─────────────────────────────────────────────────────────────
    catechist_rule_count: int = 0
    catechist_status: str = "unknown"

    # ── Augur Living Gate ─────────────────────────────────────────────────────
    augur_gate_open: bool = False
    augur_last_consult_ts: Optional[str] = None
    augur_status: str = "unknown"
    augur_stale_files: List[str] = field(default_factory=list)

    # ── Shadow daemon ─────────────────────────────────────────────────────────
    shadow_status: str = "unknown"

    # ── CheckBook Suite ───────────────────────────────────────────────────────
    checkbook_status: str = "unknown"

    # ── Stitchpunk Pantheon ───────────────────────────────────────────────────
    stitchpunk_count: int = 0
    missing_stitchpunks: List[str] = field(default_factory=list)

    # ── Ring of Three ─────────────────────────────────────────────────────────
    ring_of_three_status: str = "unknown"
    golden_eblets_present: List[str] = field(default_factory=list)

    # ── CANON Eblets ──────────────────────────────────────────────────────────
    canon_eblet_count: int = 0
    canon_eblets: List[str] = field(default_factory=list)

    # ── Pending Knight prompts ────────────────────────────────────────────────
    pending_knight_prompt_count: int = 0

    # ── Warnings ──────────────────────────────────────────────────────────────
    warnings: List[str] = field(default_factory=list)


def _sha256_first_512(path: Path) -> str:
    """Hash first 512 bytes of a file — lightweight identity check."""
    try:
        data = path.read_bytes()[:512]
        return hashlib.sha256(data).hexdigest()[:16]
    except Exception:
        return "read_error"


def phase2_familiarize(host: HostContext) -> SubstrateState:
    """
    Phase 2 — Familiarize.
    Loads LB substrate state. Read-only.
    """
    state = SubstrateState()

    # ── MEMORY.md ─────────────────────────────────────────────────────────────
    if host.memory_md_path.exists():
        state.memory_md_hash = _sha256_first_512(host.memory_md_path)
        state.memory_status = "present"
    else:
        state.warnings.append(f"MEMORY.md not found at {host.memory_md_path}")

    # ── Pheromone substrate ───────────────────────────────────────────────────
    pheromone_path = host.lb_session_dir / "pheromone_substrate.json"
    if pheromone_path.exists():
        try:
            data = json.loads(pheromone_path.read_text(encoding="utf-8"))
            state.pheromone_record_count = data.get("record_count", 0)
            state.pheromone_topic_count = len(data.get("topics", []))
            state.pheromone_status = "built" if state.pheromone_record_count > 0 else "empty"
        except Exception:
            state.pheromone_status = "parse_error"
            state.warnings.append("Pheromone substrate JSON parse error — run pheromone:build to rebuild.")
    else:
        state.pheromone_status = "not_built"
        state.warnings.append("Pheromone substrate not found — run `npm run pheromone:build` in librarian-mcp/.")

    # ── Wrasse registry ───────────────────────────────────────────────────────
    wrasse_path = host.lb_session_dir / "wrasse_registry.json"
    if wrasse_path.exists():
        try:
            data = json.loads(wrasse_path.read_text(encoding="utf-8"))
            patterns = data.get("patterns", data) if isinstance(data, dict) else data
            state.wrasse_pattern_count = len(patterns) if isinstance(patterns, list) else 0
            state.wrasse_status = "loaded"
        except Exception:
            state.wrasse_status = "parse_error"
    else:
        state.wrasse_status = "missing"
        state.warnings.append("Wrasse registry not found — substrate context injection may be degraded.")

    # ── Augur Living Gate ─────────────────────────────────────────────────────
    augur_dir = host.augur_living_gate_dir
    if augur_dir.exists():
        consult_ts_file = augur_dir / "bishop_last_consult_ts.json"
        pheromone_ts_file = augur_dir / "last_pheromone_write_ts.json"
        if consult_ts_file.exists():
            try:
                data = json.loads(consult_ts_file.read_text(encoding="utf-8"))
                state.augur_last_consult_ts = data.get("ts") or data.get("timestamp")
                state.augur_gate_open = True
                state.augur_status = "gate_open"
            except Exception:
                state.augur_status = "parse_error"
        else:
            state.augur_status = "no_consult_ts"
            state.warnings.append(
                "Augur bishop_last_consult_ts.json missing — brief_me has not been called yet."
            )
        # Check for stale ts files (BP009 discovery: files can desync)
        for ts_file in augur_dir.glob("*_ts.json"):
            try:
                data = json.loads(ts_file.read_text(encoding="utf-8"))
                ts = data.get("ts") or data.get("timestamp", "")
                if ts and ts < "2026-01-01":
                    state.augur_stale_files.append(ts_file.name)
            except Exception:
                pass
        if state.augur_stale_files:
            state.warnings.append(
                f"Augur stale ts files detected: {state.augur_stale_files}. "
                "Run brief_me to refresh."
            )
    else:
        state.augur_status = "dir_missing"

    # ── Stitchpunk Pantheon ───────────────────────────────────────────────────
    if host.stitchpunks_dir.exists():
        sp_files = list(host.stitchpunks_dir.glob("sp_*.py")) + \
                   list(host.stitchpunks_dir.glob("SP*.py"))
        state.stitchpunk_count = len(sp_files)
        if state.stitchpunk_count < 24:
            state.warnings.append(
                f"Stitchpunk Pantheon: {state.stitchpunk_count}/24 entries found. "
                "Some Stitchpunks may be in subdirectories."
            )
        # Also count from hooks subdirectory
        hooks_dir = host.stitchpunks_dir / "hooks"
        if hooks_dir.exists():
            hook_count = len(list(hooks_dir.glob("*.py")))
            if hook_count > 0 and state.stitchpunk_count == 0:
                state.stitchpunk_count = hook_count
    else:
        state.warnings.append("stitchpunks/ directory not found — Stitchpunk Pantheon unverified.")

    # ── Ring of Three Golden Eblets ───────────────────────────────────────────
    canon_dir = host.canon_eblets_dir
    ring_filenames = [
        "lb_frame_handshake_bp009.eblet.md",
        "mechanical_computer_ai_electricity_meta_cubed_bp009.eblet.md",
        "project_ring_of_three_golden_eblets_deck_card_medallion_federation_canon.md",
    ]
    present = [f for f in ring_filenames if (canon_dir / f).exists()]
    state.golden_eblets_present = present
    if len(present) == 3:
        state.ring_of_three_status = "complete"
    elif len(present) > 0:
        state.ring_of_three_status = f"partial ({len(present)}/3)"
        state.warnings.append(
            f"Ring of Three partial: {len(present)}/3 eblets present. "
            f"Missing: {set(ring_filenames) - set(present)}"
        )
    else:
        state.ring_of_three_status = "missing"

    # ── CANON Eblets inventory ────────────────────────────────────────────────
    if canon_dir.exists():
        eblets = list(canon_dir.glob("*.eblet.md")) + list(canon_dir.glob("*.md"))
        state.canon_eblets = [f.name for f in eblets]
        state.canon_eblet_count = len(state.canon_eblets)
    else:
        state.warnings.append(f"CANON eblets directory not found at {canon_dir}")

    # ── Pending Knight prompts ────────────────────────────────────────────────
    knight_prompts_dir = host.bishop_dropzone / "01_KnightPrompts"
    if knight_prompts_dir.exists():
        state.pending_knight_prompt_count = len(
            list(knight_prompts_dir.glob("PROMPT_KNIGHT_*.md"))
        )

    # ── Shadow daemon (lightweight check) ────────────────────────────────────
    shadow_pid_file = host.lb_session_dir / "shadow_daemon.pid"
    if shadow_pid_file.exists():
        state.shadow_status = "running_pid_file_found"
    else:
        state.shadow_status = "not_running"

    # ── CheckBook Suite ───────────────────────────────────────────────────────
    checkbook_dir = host.lb_session_dir / "checkbook"
    state.checkbook_status = "present" if checkbook_dir.exists() else "not_initialized"

    # ── Catechist ─────────────────────────────────────────────────────────────
    catechist_dir = host.stitchpunks_dir / "catechist" if host.stitchpunks_dir.exists() else None
    if catechist_dir and catechist_dir.exists():
        rules = list(catechist_dir.glob("R*.yaml")) + list(catechist_dir.glob("r*.yaml"))
        state.catechist_rule_count = len(rules)
        state.catechist_status = f"{state.catechist_rule_count} rules loaded"
    else:
        state.catechist_status = "not_found"

    return state
