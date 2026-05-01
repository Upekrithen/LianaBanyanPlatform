"""
handshake.py — LB Frame Handshake Main Orchestrator (KN086/BP009)
===================================================================
Five-phase bootstrap ritual for LB substrate installs.

Usage:
    python -m lb_frame_handshake                        # full Handshake
    python -m lb_frame_handshake --probe-only           # Phase 1 only, no changes
    python -m lb_frame_handshake --dry-run              # all phases, no writes
    python -m lb_frame_handshake --session KN086        # set session id in receipt
    python -m lb_frame_handshake --federation MyProject # Federation member mode

Crown-Jewel-class primitive (Prov-16 candidate, BP009 ratification).
Composes with Mechanical Computer canon — the Handshake is the install
ritual that wires the Mechanical Computer before AI electricity flows.
"""

from __future__ import annotations
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

from .host_context import HostContext
from .phases import (
    phase1_discover, EnvironmentInventory,
    phase2_familiarize, SubstrateState,
    phase3_set, AppliedDefaults,
    phase4_verify, VerifyResults,
    phase5_report,
)


@dataclass
class HandshakeResult:
    """Full result of a Handshake run."""
    first_fire_ready: bool
    receipt_path: Optional[Path]
    inventory: Optional[EnvironmentInventory] = None
    state: Optional[SubstrateState] = None
    applied: Optional[AppliedDefaults] = None
    verify: Optional[VerifyResults] = None
    warnings: List[str] = field(default_factory=list)
    dry_run: bool = False


def handshake(
    host: Optional[HostContext] = None,
    session_id: str = "manual",
    probe_only: bool = False,
) -> HandshakeResult:
    """
    Run the full LB Frame Handshake.

    Args:
        host: HostContext (defaults to standard LB Windows install).
        session_id: Session identifier for the receipt artifact.
        probe_only: When True, run only Phase 1 (read-only probe).

    Returns:
        HandshakeResult with first_fire_ready signal and receipt_path.
    """
    if host is None:
        host = HostContext()

    print(f"[Handshake] Session: {session_id}  dry_run={host.dry_run}")
    print("[Handshake] Phase 1 — Discovery...")
    inventory = phase1_discover(host)
    _print_phase_summary("Phase 1 complete", inventory.warnings)

    if probe_only:
        print("[Handshake] --probe-only: stopping after Phase 1.")
        return HandshakeResult(
            first_fire_ready=False,
            receipt_path=None,
            inventory=inventory,
            warnings=inventory.warnings,
        )

    print("[Handshake] Phase 2 — Familiarize...")
    state = phase2_familiarize(host)
    _print_phase_summary("Phase 2 complete", state.warnings)

    print("[Handshake] Phase 3 — Set defaults...")
    applied = phase3_set(host, inventory, state)
    _print_phase_summary("Phase 3 complete", applied.warnings)

    print("[Handshake] Phase 4 — Verify...")
    verify = phase4_verify(host, applied)
    _print_phase_summary("Phase 4 complete", verify.warnings)

    print("[Handshake] Phase 5 — Report...")
    receipt_path = phase5_report(
        host, inventory, state, applied, verify, session_id=session_id
    )
    if host.dry_run:
        print(f"[Handshake] [DRY-RUN] Receipt would be written to: {receipt_path}")
    else:
        print(f"[Handshake] Receipt artifact: {receipt_path}")

    all_warnings = (
        inventory.warnings + state.warnings + applied.warnings + verify.warnings
    )

    first_fire = verify.all_passed()
    banner = "✓ FIRST-FIRE READY" if first_fire else "⚠ NOT FIRST-FIRE READY"
    print(f"\n[Handshake] {banner}")

    if not first_fire:
        failing = [t for t in verify.tests if t.status not in ("pass", "skip")]
        for t in failing:
            print(f"  {t}")

    if all_warnings:
        print(f"\n[Handshake] {len(all_warnings)} warning(s):")
        for w in all_warnings:
            print(f"  ⚠ {w}")

    return HandshakeResult(
        first_fire_ready=first_fire,
        receipt_path=receipt_path,
        inventory=inventory,
        state=state,
        applied=applied,
        verify=verify,
        warnings=all_warnings,
        dry_run=host.dry_run,
    )


def _print_phase_summary(label: str, warnings: List[str]) -> None:
    status = "ok" if not warnings else f"{len(warnings)} warning(s)"
    print(f"  [{status}] {label}")


def _build_host_from_args(args) -> HostContext:
    host = HostContext()
    host.dry_run = args.dry_run
    if args.federation:
        host.is_federation_member = True
        host.federation_project_name = args.federation
    return host


def main() -> int:
    import argparse
    parser = argparse.ArgumentParser(
        description="LB Frame Handshake — substrate-install first-class bootstrap ritual (KN086/BP009)"
    )
    parser.add_argument(
        "--probe-only", action="store_true",
        help="Phase 1 only: probe environment, make no changes."
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="All phases run but no settings.json edits / no file writes."
    )
    parser.add_argument(
        "--session", default="manual", metavar="SESSION_ID",
        help="Session identifier for the receipt artifact (default: manual)."
    )
    parser.add_argument(
        "--federation", default="", metavar="PROJECT_NAME",
        help="Run in Federation member mode for the given project name."
    )
    args = parser.parse_args()

    host = _build_host_from_args(args)
    result = handshake(host=host, session_id=args.session, probe_only=args.probe_only)
    return 0 if result.first_fire_ready or args.probe_only or args.dry_run else 1
