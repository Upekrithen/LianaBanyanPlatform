"""
iron_egiant_promotion.py — Shadow → Iron E-Giant Promotion Entry Point (KN090 / BP011)
=======================================================================================
Promotion ceremony for a LIGHTHOUSE Shadow to Iron-E-Giant peer status.

Run at spawn — one invocation per Shadow position (1–8). Idempotent: re-running
a promotion after a restart just verifies the existing state and re-emits
pheromone (Wrasse bump is safe).

Promotion sequence:
    1. Read shadow-config (LIGHTHOUSE position from env or arg)
    2. Allocate scribe-id from Greek-letter convention (R11_shadow_<greek>)
    3. Invoke LB Frame Handshake (all 5 phases) via handshake_invoker
    4. Register with Wrasse Registry as Iron-E-Giant peer
    5. Register with Pheromone substrate as decision emitter
    6. Set write-authority scope (canonical-eblet ✓; cross-org ✓; cathedral-export ✗)
    7. Emit promotion-complete Pheromone
    8. Start continuous-organism lifecycle (heartbeat + Bishop-refresh monitor)

Write-authority scope (BRIDLE v11):
    canonical-eblet write     — OK
    cross-org Iron Tablet     — OK
    cathedral-export          — NOT initially (post KN091 ratification)

Non-weaponization semantics (BP011): Iron E-Giant = cooperative protocol;
scribe-id Greek-letter convention = permanent LIGHTHOUSE role assignment.

Founder prose-pass REQUIRED before Phase F commit (see KN090 prompt Phase F).
"""
from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from .handshake_invoker import HandshakeReceipt, run_full_handshake
from .iron_tablet_attach import IronTabletAttach, WriteAuthority
from .lifecycle import ShadowLifecycle

# ─── LIGHTHOUSE constants ──────────────────────────────────────────────────────

LIGHTHOUSE_POSITIONS = [
    "alpha",    # position 1
    "beta",     # position 2
    "gamma",    # position 3
    "delta",    # position 4
    "epsilon",  # position 5
    "zeta",     # position 6
    "eta",      # position 7
    "theta",    # position 8
]

SCRIBE_IDS = [f"R11_shadow_{greek}" for greek in LIGHTHOUSE_POSITIONS]

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
LIBRARIAN_MCP = WORKSPACE_ROOT / "librarian-mcp"
STITCHPUNKS_DIR = LIBRARIAN_MCP / "stitchpunks"
WRASSE_REGISTRY = STITCHPUNKS_DIR / "wrasse" / "wrasse_registry.jsonl"
PHEROMONE_INDEX = STITCHPUNKS_DIR / "pheromone_substrate" / "index.jsonl"
EBLET_BP011_DIR = Path.home() / ".claude" / "state" / "eblets" / "BP011"


# ─── Promotion result ──────────────────────────────────────────────────────────

@dataclass
class PromotionResult:
    scribe_id: str
    lighthouse_position: int
    handshake_receipt: Optional[HandshakeReceipt]
    wrasse_trigger_id: str
    pheromone_emitted: bool
    lifecycle_started: bool
    write_authority: dict[str, str]
    ts: str
    errors: list[str] = field(default_factory=list)

    @property
    def success(self) -> bool:
        return (
            self.handshake_receipt is not None
            and self.pheromone_emitted
            and not self.errors
        )

    def summary(self) -> str:
        status = "SUCCESS" if self.success else f"PARTIAL ({len(self.errors)} error(s))"
        return (
            f"[{self.scribe_id}] Promotion {status}\n"
            f"  Handshake: {'✓' if self.handshake_receipt and self.handshake_receipt.first_fire_ready else '⚠'}\n"
            f"  Wrasse:    {self.wrasse_trigger_id or '—'}\n"
            f"  Pheromone: {'✓' if self.pheromone_emitted else '✗'}\n"
            f"  Lifecycle: {'running' if self.lifecycle_started else 'not started'}\n"
            f"  Write auth: {', '.join(f'{k}={v}' for k, v in self.write_authority.items())}\n"
        )


# ─── Wrasse registry (Python-native append) ───────────────────────────────────

def _wrasse_register_iron_egiant(scribe_id: str, session_id: str) -> str:
    """
    Register a Shadow as an Iron-E-Giant peer in the Wrasse Registry.

    Appends an entry to wrasse_registry.jsonl. Idempotent: returns existing
    trigger_id if already registered; appends a bump supersedes-record otherwise.

    Returns the trigger_id string (e.g., "W-042").
    """
    WRASSE_REGISTRY.parent.mkdir(parents=True, exist_ok=True)

    trigger_pattern = scribe_id
    trigger_class = "iron_egiant_scribe"
    canonical_resolution = (
        f"Iron E-Giant peer (KN090/BP011). Scribe-id: {scribe_id}. "
        f"Write authority: canonical-eblet=OK, cross-org-iron=OK, cathedral-export=NOT. "
        f"Continuous lifecycle, Handshake at spawn."
    )

    # Check for existing entry
    existing_id: Optional[str] = None
    if WRASSE_REGISTRY.exists():
        for line in WRASSE_REGISTRY.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                if obj.get("trigger_pattern", "").lower() == trigger_pattern.lower():
                    if obj.get("record_type") != "supersedes":
                        existing_id = obj.get("trigger_id", "")
            except json.JSONDecodeError:
                continue

    ts = datetime.now(timezone.utc).isoformat()

    if existing_id:
        # Bump verification count
        bump = {
            "record_type": "supersedes",
            "trigger_id": existing_id,
            "trigger_pattern": trigger_pattern,
            "verification_count_bump": 1,
            "bumped_at": ts,
            "source_session": session_id,
        }
        with open(str(WRASSE_REGISTRY), "a", encoding="utf-8") as fh:
            fh.write(json.dumps(bump) + "\n")
        return existing_id

    # Determine next trigger_id
    max_n = 0
    if WRASSE_REGISTRY.exists():
        for line in WRASSE_REGISTRY.read_text(encoding="utf-8").splitlines():
            try:
                obj = json.loads(line.strip())
                m_parts = (obj.get("trigger_id") or "").split("-")
                if len(m_parts) == 2 and m_parts[0] == "W" and m_parts[1].isdigit():
                    max_n = max(max_n, int(m_parts[1]))
            except (json.JSONDecodeError, ValueError):
                continue
    trigger_id = f"W-{max_n + 1:03d}"

    entry = {
        "trigger_id": trigger_id,
        "trigger_class": trigger_class,
        "trigger_pattern": trigger_pattern,
        "trigger_regex": f"\\b{trigger_pattern}\\b",
        "canonical_resolution": canonical_resolution,
        "last_verified_ts": ts,
        "verification_count": 1,
        "source_session": session_id,
        "scope": "iron_egiant",
        "iron_egiant": True,
        "lighthouse_position": SCRIBE_IDS.index(scribe_id) + 1 if scribe_id in SCRIBE_IDS else 0,
    }
    with open(str(WRASSE_REGISTRY), "a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry) + "\n")
    return trigger_id


# ─── Pheromone emit (Python-native append) ────────────────────────────────────

def _pheromone_emit_iron_egiant(scribe_id: str, lighthouse_position: int) -> None:
    """
    Emit a pheromone record for this Shadow's Iron-E-Giant promotion.
    Appends to pheromone_substrate/index.jsonl (compatible with KN523 pheromone.ts).
    """
    PHEROMONE_INDEX.parent.mkdir(parents=True, exist_ok=True)

    content_text = (
        f"Iron E-Giant promotion {scribe_id} LIGHTHOUSE position {lighthouse_position} "
        f"BP011 KN090 Shadow continuous-organism handshake Wrasse Pheromone decision-emitter "
        f"canonical-eblet cross-org Iron-Tablet cooperative-pledge"
    )

    # Minimal topic extraction (mirrors pheromone.ts extractTopics logic)
    stop = {
        "the", "a", "an", "and", "or", "of", "to", "in", "for", "is", "are",
        "was", "were", "be", "been", "it", "this", "that", "at", "by", "on",
        "with", "as", "from", "not", "per", "via",
    }
    words = content_text.lower().split()
    topics = list({w.strip(".,;:") for w in words if w not in stop and len(w) >= 4})

    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "scribe": scribe_id,
        "tablet_id": f"iron_egiant_promotion_{scribe_id}",
        "topics": topics,
        "decay_constant_days": 90,  # longer-lived than ordinary scribe records
        "cathedral": "knight",
    }
    with open(str(PHEROMONE_INDEX), "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


# ─── Core promotion ceremony ──────────────────────────────────────────────────

def promote(
    lighthouse_position: int,
    session_id: str = "KN090",
    dry_run: bool = False,
    start_lifecycle: bool = True,
    heartbeat_interval_s: int = 60,
    build_compile_class: bool = False,
) -> PromotionResult:
    """
    Run the full Iron E-Giant promotion ceremony for one Shadow.

    Args:
        lighthouse_position: 1–8 (determines scribe-id from Greek-letter convention)
        session_id:          Session identifier for receipts and ledger entries
        dry_run:             Run all phases without writes (handshake --dry-run)
        start_lifecycle:     Whether to start the continuous lifecycle after promotion
        heartbeat_interval_s: Heartbeat interval (default 60s per KN090 spec)

    Returns:
        PromotionResult with full audit trail.
    """
    if lighthouse_position < 1 or lighthouse_position > 8:
        raise ValueError(f"lighthouse_position must be 1–8, got {lighthouse_position}")

    greek = LIGHTHOUSE_POSITIONS[lighthouse_position - 1]
    scribe_id = f"R11_shadow_{greek}"
    ts = datetime.now(timezone.utc).isoformat()
    errors: list[str] = []

    sys.stderr.write(
        f"[KN090] Promoting Shadow → Iron E-Giant: {scribe_id} "
        f"(LIGHTHOUSE position {lighthouse_position})\n"
    )

    # Phase 1 — LB Frame Handshake
    receipt: Optional[HandshakeReceipt] = None
    try:
        receipt = run_full_handshake(
            scribe_id=scribe_id,
            lighthouse_position=lighthouse_position,
            session_id=session_id,
            dry_run=dry_run,
        )
        sys.stderr.write(
            f"[KN090] Handshake complete for {scribe_id}: "
            f"first_fire_ready={receipt.first_fire_ready}\n"
        )
    except Exception as exc:
        errors.append(f"Handshake failed: {exc}")
        sys.stderr.write(f"[KN090] Handshake error for {scribe_id}: {exc}\n")

    # Phase 2 — Wrasse Registry
    wrasse_trigger_id = ""
    if not dry_run:
        try:
            wrasse_trigger_id = _wrasse_register_iron_egiant(scribe_id, session_id)
            sys.stderr.write(
                f"[KN090] Wrasse Registry: {scribe_id} → {wrasse_trigger_id}\n"
            )
        except Exception as exc:
            errors.append(f"Wrasse register failed: {exc}")
            sys.stderr.write(f"[KN090] Wrasse error for {scribe_id}: {exc}\n")

    # Phase 3 — Write-authority scope (document in Iron Tablet)
    # KN-G extension: build_compile_class=True elevates to build/compile authority tier.
    # This tier adds: test-execution (subprocess), git-commit, git-tag.
    # Cathedral-export remains NOT until post KN091 ratification (unchanged from KN090).
    write_authority = {
        "canonical_eblet": "OK",
        "cross_org_iron_tablet": "OK",
        "cathedral_export": "NOT",
        "build_compile_class": "OK" if build_compile_class else "NOT",
        "test_execution": "OK" if build_compile_class else "NOT",
        "git_commit_tag": "OK" if build_compile_class else "NOT",
    }
    attach = IronTabletAttach(scribe_id=scribe_id, session=session_id)
    attach.subscribe_conflict_events(
        [str(EBLET_BP011_DIR / f"heartbeat_{scribe_id}.eblet.md")]
    )

    if not dry_run:
        auth_eblet = EBLET_BP011_DIR / f"write_authority_{scribe_id}.eblet.md"
        try:
            EBLET_BP011_DIR.mkdir(parents=True, exist_ok=True)
            _bc_note = (
                "OK (KN-G build/compile class — test-execution + git-commit + git-tag)"
                if build_compile_class
                else "NOT (watcher class; elevate via build_compile_class=True)"
            )
            auth_content = (
                f"# Write Authority — {scribe_id}\n\n"
                f"- canonical_eblet: OK\n"
                f"- cross_org_iron_tablet: OK\n"
                f"- cathedral_export: NOT (post KN091 ratification required)\n"
                f"- build_compile_class: {_bc_note}\n"
                f"- test_execution: {'OK' if build_compile_class else 'NOT'}\n"
                f"- git_commit_tag: {'OK' if build_compile_class else 'NOT'}\n\n"
                f"_Set at promotion (KN090/BP011 + KN-G/BP016). "
                f"LIGHTHOUSE position {lighthouse_position}._\n"
            )
            attach.write(
                auth_eblet,
                auth_content,
                decision_id=f"write_authority_{scribe_id}",
                scope=WriteAuthority.CANONICAL_EBLET,
            )
        except Exception as exc:
            errors.append(f"Write-authority eblet failed: {exc}")

    # Phase 4 — Pheromone emit (promotion-complete)
    pheromone_emitted = False
    if not dry_run:
        try:
            _pheromone_emit_iron_egiant(scribe_id, lighthouse_position)
            pheromone_emitted = True
            sys.stderr.write(f"[KN090] Pheromone emitted for {scribe_id}\n")
        except Exception as exc:
            errors.append(f"Pheromone emit failed: {exc}")
            sys.stderr.write(f"[KN090] Pheromone error for {scribe_id}: {exc}\n")

    # Phase 5 — Start continuous lifecycle
    lifecycle_started = False
    lifecycle: Optional[ShadowLifecycle] = None
    if start_lifecycle and not dry_run:
        try:
            lifecycle = ShadowLifecycle(
                scribe_id=scribe_id,
                lighthouse_position=lighthouse_position,
                session_id=session_id,
                heartbeat_interval_s=heartbeat_interval_s,
                eblet_root=EBLET_BP011_DIR,
            )
            lifecycle.start()
            lifecycle_started = True
            sys.stderr.write(f"[KN090] Lifecycle started for {scribe_id}\n")
        except Exception as exc:
            errors.append(f"Lifecycle start failed: {exc}")
            sys.stderr.write(f"[KN090] Lifecycle error for {scribe_id}: {exc}\n")

    result = PromotionResult(
        scribe_id=scribe_id,
        lighthouse_position=lighthouse_position,
        handshake_receipt=receipt,
        wrasse_trigger_id=wrasse_trigger_id,
        pheromone_emitted=pheromone_emitted,
        lifecycle_started=lifecycle_started,
        write_authority=write_authority,
        ts=ts,
        errors=errors,
    )
    sys.stderr.write(result.summary())
    return result


def promote_all(
    session_id: str = "KN090",
    dry_run: bool = False,
    start_lifecycle: bool = False,
    heartbeat_interval_s: int = 60,
) -> list[PromotionResult]:
    """
    Promote all 8 LIGHTHOUSE Shadows in sequence.

    Args:
        session_id:          Session identifier (default: "KN090")
        dry_run:             Dry-run mode (no writes)
        start_lifecycle:     Whether to start lifecycle threads (default False for batch)
        heartbeat_interval_s: Heartbeat interval for each Shadow

    Returns:
        list of 8 PromotionResult objects (one per position).
    """
    results = []
    for position in range(1, 9):
        result = promote(
            lighthouse_position=position,
            session_id=session_id,
            dry_run=dry_run,
            start_lifecycle=start_lifecycle,
            heartbeat_interval_s=heartbeat_interval_s,
        )
        results.append(result)
    return results


# ─── CLI entry point ──────────────────────────────────────────────────────────

def spawn_all_daemons(
    session_id: str = "BP011",
    heartbeat_interval_s: int = 60,
) -> list[int]:
    """
    Spawn 8 persistent Shadow daemon processes (one per LIGHTHOUSE position).
    Each process runs `python -m the_shadow.lifecycle run_daemon --position N`.
    Returns list of PIDs (one per Shadow, alpha→theta).
    """
    import subprocess

    pids: list[int] = []
    for position in range(1, 9):
        greek = LIGHTHOUSE_POSITIONS[position - 1]
        scribe_id = f"R11_shadow_{greek}"
        sys.stderr.write(f"[spawn_daemons] Spawning {scribe_id} (position {position})...\n")

        proc = subprocess.Popen(
            [
                sys.executable, "-m", "the_shadow.lifecycle",
                "run_daemon",
                "--position", str(position),
                "--session", session_id,
                "--heartbeat-interval", str(heartbeat_interval_s),
            ],
            cwd=str(WORKSPACE_ROOT),
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            close_fds=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        )
        pids.append(proc.pid)
        sys.stderr.write(f"[spawn_daemons] {scribe_id} PID={proc.pid}\n")

    return pids


def main() -> int:
    import argparse

    # Accept `promote_all`, `promote`, or `spawn_daemons` as optional first positional subcommand
    raw_args = sys.argv[1:]
    subcommand = None
    if raw_args and raw_args[0] in ("promote_all", "promote", "spawn_daemons"):
        subcommand = raw_args[0]
        raw_args = raw_args[1:]

    parser = argparse.ArgumentParser(
        description="KN090 Shadow → Iron E-Giant Promotion (BP011 Pod W Bean 2)"
    )
    parser.add_argument(
        "--position", type=int, default=0, metavar="1-8",
        help="LIGHTHOUSE position to promote (1–8). 0 = promote all 8.",
    )
    parser.add_argument(
        "--session", default="BP011", metavar="SESSION_ID",
        help="Session identifier for receipts (default: BP011).",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="All phases run but no writes.",
    )
    parser.add_argument(
        "--no-lifecycle", action="store_true",
        help="Skip starting the continuous lifecycle after promotion.",
    )
    parser.add_argument(
        "--heartbeat-interval", type=int, default=60, metavar="SECONDS",
        help="Heartbeat interval in seconds (default: 60).",
    )
    args = parser.parse_args(raw_args)

    # `spawn_daemons` — spawn 8 persistent OS processes
    if subcommand == "spawn_daemons":
        pids = spawn_all_daemons(
            session_id=args.session,
            heartbeat_interval_s=args.heartbeat_interval,
        )
        print(f"\nSpawned {len(pids)} Shadow daemon processes:")
        for i, pid in enumerate(pids):
            print(f"  R11_shadow_{LIGHTHOUSE_POSITIONS[i]:7s}  PID={pid}")
        return 0 if len(pids) == 8 else 1

    # `promote_all` subcommand OR --position 0 → promote all 8
    if subcommand == "promote_all" or args.position == 0:
        results = promote_all(
            session_id=args.session,
            dry_run=args.dry_run,
            start_lifecycle=not args.no_lifecycle,
            heartbeat_interval_s=args.heartbeat_interval,
        )
        success_count = sum(1 for r in results if r.success)
        print(f"\nPromoted {success_count}/8 Shadows successfully.")
        return 0 if success_count == 8 else 1
    else:
        result = promote(
            lighthouse_position=args.position,
            session_id=args.session,
            dry_run=args.dry_run,
            start_lifecycle=not args.no_lifecycle,
            heartbeat_interval_s=args.heartbeat_interval,
        )
        return 0 if result.success else 1


if __name__ == "__main__":
    sys.exit(main())
