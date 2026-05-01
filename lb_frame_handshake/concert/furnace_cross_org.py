"""
KN091 In-Concert Protocol — Cross-Org Furnace Verification
===========================================================
Wraps existing Furnace verification (KN044/KN046) for cross-organism contexts.

Cross-org gear-tooth-fit rubric:
  Does the proposing organism's Eblet engage with the consuming organism's
  substrate correctly?

Scoring breakdown (0.0–1.0 total):
  Component 1 — Organism compatibility (0.0–0.4)
    Same class (both primes / both shadows): 0.4
    Cross-class (prime ↔ shadow):             0.3
    Unknown organism:                          0.0

  Component 2 — Hash prefix match length (0.0–0.4)
    Lightweight plausibility check: how many leading hex chars match?
    Normalized to 0.4 at full 64-char match; partial credit for partial match.
    Not a security control — divergent hashes naturally share some prefix chars.

  Component 3 — Federation membership (0.0–0.2)
    Both organisms in 11-member federation: 0.2
    One known, one unknown:                 0.1
    Both unknown:                           0.0

Pass threshold: 0.65 (mid-tier per KN088 Bounty Furnace pattern).
On fail: do NOT consume; emit ConflictReport; fall back to Stone Tablet ledger.

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
    ConflictReport,
    ORGANISM_BISHOP,
    ORGANISM_KNIGHT,
    ORGANISM_PAWN,
    SHADOW_SCRIBE_IDS,
)

FURNACE_PASS_THRESHOLD = 0.65

_CONFLICT_LOG_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/concert_conflict_reports.jsonl"
))
_STONE_LEDGER_PATH = Path(os.path.expanduser(
    "~/.claude/state/federation/concert_stone_ledger.jsonl"
))


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Gear-tooth-fit scoring ────────────────────────────────────────────────────

def _gear_tooth_fit_score(
    proposing_organism: str,
    consuming_organism: str,
    anchor_hash: str,
    canonical_hash: str,
) -> float:
    """
    Compute cross-org gear-tooth-fit score (0.0–1.0).

    Three components: organism compatibility + hash proximity + federation membership.
    """
    primes = {ORGANISM_BISHOP, ORGANISM_KNIGHT, ORGANISM_PAWN}
    shadows = set(SHADOW_SCRIBE_IDS)
    known = primes | shadows

    # Component 1: Organism compatibility
    prop_known = proposing_organism in known
    cons_known = consuming_organism in known
    if prop_known and cons_known:
        prop_class = "prime" if proposing_organism in primes else "shadow"
        cons_class = "prime" if consuming_organism in primes else "shadow"
        org_score = 0.4 if prop_class == cons_class else 0.3
    else:
        org_score = 0.0

    # Component 2: Hash prefix match (plausibility check)
    prefix_match = 0
    for a, b in zip(anchor_hash, canonical_hash):
        if a == b:
            prefix_match += 1
        else:
            break
    # SHA-256 hex is 64 chars; normalize to 0.0–0.4
    hash_score = min(prefix_match / 64.0, 1.0) * 0.4

    # Component 3: Federation membership
    if prop_known and cons_known:
        fed_score = 0.2
    elif prop_known or cons_known:
        fed_score = 0.1
    else:
        fed_score = 0.0

    return org_score + hash_score + fed_score


# ── Conflict report emission ──────────────────────────────────────────────────

def emit_conflict_report(
    report: ConflictReport,
    log_path: Optional[Path] = None,
) -> None:
    """Append a ConflictReport to the conflict log (append-only)."""
    path = log_path or _CONFLICT_LOG_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps({
            "audit_id": report.audit_id,
            "scribe_id": report.scribe_id,
            "eblet_path": report.eblet_path,
            "local_hash": report.local_hash,
            "canonical_hash": report.canonical_hash,
            "stone_sequence": report.stone_sequence,
            "resolution": report.resolution,
            "detected_at": report.detected_at,
            "surface_at_session_open": report.surface_at_session_open,
        }) + "\n")


def load_conflict_reports(
    log_path: Optional[Path] = None,
) -> list[ConflictReport]:
    """Load all ConflictReports from the conflict log."""
    path = log_path or _CONFLICT_LOG_PATH
    reports: list[ConflictReport] = []
    if not path.exists():
        return reports
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
                reports.append(ConflictReport(
                    audit_id=d.get("audit_id", ""),
                    scribe_id=d.get("scribe_id", ""),
                    eblet_path=d.get("eblet_path", ""),
                    local_hash=d.get("local_hash", ""),
                    canonical_hash=d.get("canonical_hash", ""),
                    stone_sequence=d.get("stone_sequence", 0),
                    resolution=d.get("resolution", "stone_canonical"),
                    detected_at=d.get("detected_at", ""),
                    surface_at_session_open=d.get("surface_at_session_open", True),
                ))
            except (json.JSONDecodeError, TypeError):
                pass
    return reports


def _stone_sequence_for_eblet(
    eblet_path: str,
    stone_ledger_path: Optional[Path] = None,
) -> int:
    """
    Query the concert Stone Tablet ledger for the highest sequence number for an
    Eblet path. Returns 0 if not found.
    """
    ledger = stone_ledger_path or _STONE_LEDGER_PATH
    if not ledger.exists():
        return 0
    max_seq = 0
    with open(ledger, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                if entry.get("eblet_path") == eblet_path:
                    max_seq = max(max_seq, entry.get("sequence", 0))
            except (json.JSONDecodeError, TypeError):
                pass
    return max_seq


# ── Public API ────────────────────────────────────────────────────────────────

def run_cross_org_furnace(
    envelope: DecisionEnvelope,
    consuming_organism: str,
    canonical_hash: str,
    stone_ledger_path: Optional[Path] = None,
    conflict_log_path: Optional[Path] = None,
) -> FurnaceReceipt:
    """
    Run cross-org Furnace verification for a decision envelope with a divergent hash.

    If score >= 0.65 → PASS; return FurnaceReceipt(passed=True).
    If score < 0.65  → FAIL; emit ConflictReport; signal Stone Tablet fallback;
                       return FurnaceReceipt(passed=False, fallback_to_stone=True).
    """
    score = _gear_tooth_fit_score(
        proposing_organism=envelope.decider_scribe_id,
        consuming_organism=consuming_organism,
        anchor_hash=envelope.anchor_hash,
        canonical_hash=canonical_hash,
    )
    passed = score >= FURNACE_PASS_THRESHOLD

    if not passed:
        stone_seq = _stone_sequence_for_eblet(
            eblet_path=envelope.payload.get("eblet_path", ""),
            stone_ledger_path=stone_ledger_path,
        )
        report = ConflictReport(
            audit_id=str(uuid.uuid4()),
            scribe_id=envelope.decider_scribe_id,
            eblet_path=envelope.payload.get("eblet_path", ""),
            local_hash=envelope.anchor_hash,
            canonical_hash=canonical_hash,
            stone_sequence=stone_seq,
            resolution="stone_canonical",
            detected_at=_iso_now(),
            surface_at_session_open=True,
        )
        emit_conflict_report(report, log_path=conflict_log_path)

    return FurnaceReceipt(
        decision_id=envelope.decision_id,
        proposing_organism=envelope.decider_scribe_id,
        consuming_organism=consuming_organism,
        score=score,
        passed=passed,
        rejection_reason=(
            "" if passed
            else f"gear_tooth_fit score {score:.3f} < threshold {FURNACE_PASS_THRESHOLD}"
        ),
        verified_at=_iso_now(),
        fallback_to_stone=not passed,
    )
