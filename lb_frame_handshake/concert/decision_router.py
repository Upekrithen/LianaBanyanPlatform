"""
KN091 In-Concert Protocol — Decision Router
=============================================
Multi-organism Pheromone-Anchored Decision routing across the 11+ organism federation.

Each organism emits decisions as DecisionEnvelopes onto the shared Pheromone substrate
(a JSONL append-only file).  Cross-org consumers read the substrate and MUST validate
the anchor_hash via Iron Tablet read (KN089) before acting on any decision.

If anchor_hash matches canonical Iron Tablet hash → consume directly.
If anchor_hash diverges → route to cross-org Furnace verification (threshold 0.65).
  Furnace PASS → consume.
  Furnace FAIL → do NOT consume; ConflictReport emitted; fallback to Stone Tablet ledger.

Meta-decisions (cross-org consensus agreements) are emitted with meta_decision=True
and carry the full dependency chain of the contributing decisions.

Stone Tablet Imperative: substrate is append-only.  No in-place edits.

KN091 / BP011 Pod W Bean 3.
"""

from __future__ import annotations

import hashlib
import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from lb_frame_handshake.concert.types import (
    DecisionEnvelope,
    FurnaceReceipt,
    ALL_ORGANISM_IDS,
)
from lb_frame_handshake.concert.furnace_cross_org import run_cross_org_furnace


# ── Paths ─────────────────────────────────────────────────────────────────────

_SUBSTRATE_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/concert_pheromone_substrate.jsonl"
))


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# ── Substrate helpers ─────────────────────────────────────────────────────────

def emit_envelope(
    envelope: DecisionEnvelope,
    substrate_path: Optional[Path] = None,
) -> None:
    """Append a DecisionEnvelope to the Pheromone substrate (append-only)."""
    path = substrate_path or _SUBSTRATE_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(envelope.to_dict()) + "\n")


def load_substrate(
    substrate_path: Optional[Path] = None,
) -> list[DecisionEnvelope]:
    """Load all DecisionEnvelopes from the Pheromone substrate (chronological)."""
    path = substrate_path or _SUBSTRATE_PATH
    envelopes: list[DecisionEnvelope] = []
    if not path.exists():
        return envelopes
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
                envelopes.append(DecisionEnvelope(
                    decision_id=d.get("decision_id", ""),
                    decider_scribe_id=d.get("decider_scribe_id", ""),
                    anchor_hash=d.get("anchor_hash", ""),
                    dependencies=d.get("dependencies", []),
                    payload=d.get("payload", {}),
                    emitted_at=d.get("emitted_at", ""),
                    meta_decision=d.get("meta_decision", False),
                ))
            except (json.JSONDecodeError, TypeError):
                pass
    return envelopes


def organisms_in_substrate(
    substrate_path: Optional[Path] = None,
) -> set[str]:
    """Return the set of organism scribe-ids that have emitted decisions."""
    envelopes = load_substrate(substrate_path)
    return {e.decider_scribe_id for e in envelopes}


# ── Iron Tablet anchor verification (Python-side) ─────────────────────────────

def _read_iron_tablet_hash(eblet_path: str) -> Optional[str]:
    """
    Read the latest content-hash for an Iron Tablet Eblet from the KN089 Stone ledger.
    Returns None if no ledger record found.

    Reads iron_tablet_ledger.jsonl co-located with the Eblet file (written by TS KN089).
    Falls back to direct file hash if no ledger entry exists.
    """
    eblet = Path(os.path.expanduser(eblet_path))
    ledger_path = eblet.parent / "iron_tablet_ledger.jsonl"

    if ledger_path.exists():
        latest_hash: Optional[str] = None
        latest_seq = -1
        with open(ledger_path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    if (
                        entry.get("ebletPath") == str(eblet)
                        and entry.get("sequence", -1) > latest_seq
                    ):
                        latest_hash = entry.get("hash")
                        latest_seq = entry.get("sequence", -1)
                except (json.JSONDecodeError, TypeError):
                    pass
        if latest_hash:
            return latest_hash

    # Fallback: hash the Eblet file directly
    if eblet.exists():
        return _content_hash(eblet.read_text(encoding="utf-8"))

    return None


# ── Factory ───────────────────────────────────────────────────────────────────

def create_envelope(
    decider_scribe_id: str,
    anchor_hash: str,
    payload: dict,
    dependencies: Optional[list[str]] = None,
    meta_decision: bool = False,
) -> DecisionEnvelope:
    """Factory: create a new DecisionEnvelope with a fresh UUID."""
    return DecisionEnvelope(
        decision_id=str(uuid.uuid4()),
        decider_scribe_id=decider_scribe_id,
        anchor_hash=anchor_hash,
        dependencies=dependencies or [],
        payload=payload,
        emitted_at=_iso_now(),
        meta_decision=meta_decision,
    )


# ── Routing ───────────────────────────────────────────────────────────────────

def route_decision(
    envelope: DecisionEnvelope,
    consuming_organism: str,
    eblet_path: str,
    substrate_path: Optional[Path] = None,
    stone_ledger_path: Optional[Path] = None,
) -> tuple[bool, Optional[FurnaceReceipt]]:
    """
    Route a cross-org decision to a consuming organism.

    Pre-consumption check:
      1. Read canonical Iron Tablet hash for the eblet_path.
      2. If no canonical record → cannot verify; do not consume.
      3. If hashes match → consume (return True, None).
      4. If hashes diverge → route to cross-org Furnace.
         Furnace PASS → consume (return True, receipt).
         Furnace FAIL → do not consume (return False, receipt).

    Returns: (consumed: bool, furnace_receipt: FurnaceReceipt | None)
    """
    canonical_hash = _read_iron_tablet_hash(eblet_path)

    if canonical_hash is None:
        receipt = FurnaceReceipt(
            decision_id=envelope.decision_id,
            proposing_organism=envelope.decider_scribe_id,
            consuming_organism=consuming_organism,
            score=0.0,
            passed=False,
            rejection_reason="anchor_not_found: Iron Tablet has no record for this Eblet path",
            verified_at=_iso_now(),
            fallback_to_stone=True,
        )
        return False, receipt

    if canonical_hash == envelope.anchor_hash:
        return True, None

    receipt = run_cross_org_furnace(
        envelope=envelope,
        consuming_organism=consuming_organism,
        canonical_hash=canonical_hash,
        stone_ledger_path=stone_ledger_path,
    )
    return receipt.passed, receipt


# ── Meta-decision emission ────────────────────────────────────────────────────

def emit_meta_decision(
    decider_scribe_id: str,
    dependency_decisions: list[str],
    payload: dict,
    anchor_hash: str,
    substrate_path: Optional[Path] = None,
) -> DecisionEnvelope:
    """
    Emit a higher-order meta-decision (cross-org consensus agreement).

    Meta-decisions are emitted with meta_decision=True and carry the full
    dependency chain of the contributing organism-level decisions.
    """
    env = create_envelope(
        decider_scribe_id=decider_scribe_id,
        anchor_hash=anchor_hash,
        payload=payload,
        dependencies=dependency_decisions,
        meta_decision=True,
    )
    emit_envelope(env, substrate_path)
    return env
