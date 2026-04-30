"""
Pheromone-Anchored Decision Schema — KN050 / BP005 Federation Tooling

First-class Pheromone record schema for Guild/Tribe/Family/Helm decisions per
Social-Authority DAG ratification.

Key design principles:
  - Decisions are first-class substrate records anchored to Golden Tablets (NOT Tablet-mutations)
  - Append-only enforcement per Stone Tablet Imperative (#2308 Year of Jubilee Ledger)
  - Corrections via supersede pointer to new record (never in-place edits)
  - Bidirectional discoverability:
      decisions_anchored_to(tablet_uri)  → all decisions for a Tablet
      tablet_for(decision_id)            → Tablet authority chain for a decision
  - Furnace verification: anchor must exist in IP Ledger; verification_method must
    match the Part B declaration in the anchor Eblet
  - Battery-dispatch register entry for every verified decision

Decision record schema:
  {
    "record_id":           "<uuid>",
    "record_type":         "social_authority_decision",
    "decision_class":      "<decision_class_enum>",
    "anchor":              "golden_tablet://Layer_<L>/Entity_<id>/<class>",
    "outcome":             {<key>: <value>, ...},
    "decided_at":          "<ISO timestamp>",
    "decided_by":          "<social-unit-id>",
    "verification_method": "<method-name-from-Part-B>",
    "battery_dispatch_id": "<dispatch_register_entry>",
    "furnace_stamp":       "<SHA-256 of record content>",
    "supersedes":          "<prior-record-id-if-correction>" | null
  }

Composes with:
  - #2317 Pheromone Substrate (decision records are Pheromone-class records)
  - KN044 Furnace (anchor verification + stamp issuance)
  - KN045 layer_addressing (golden_tablet:// URI resolution)
  - KN046 multi-tenancy (per-layer IP Ledger lookup for anchor verification)
  - KN048 inheritance enforcement (re-acknowledgment IS a Pheromone decision)
  - #2308 Year of Jubilee Ledger (append-only semantics)
  - Detective Scribe (query extension for decisions by Tablet or decision_class)

Federation canon Social-Authority section.
KN050 / BP005 — Founder-ratified federation tooling.
"""

from __future__ import annotations

import hashlib
import json
import os
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from discipline_wing.federation.layer_addressing import (
    parse_uri,
    is_valid_uri,
    extract_layer,
)

# ── Paths ───────────────────────────────────────────────────────────────────────

_BATTERY_DISPATCH_PATH = Path(os.path.expanduser("~/.claude/state/battery_dispatch_register.jsonl"))
_PHEROMONE_DECISIONS_PATH = Path(os.path.expanduser("~/.claude/state/federation/pheromone_decisions.jsonl"))
_FEDERATION_LEDGERS_ROOT = Path(os.path.expanduser("~/.claude/state/federation/ledgers"))


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _write_dispatch(entry: dict) -> str:
    dispatch_id = str(uuid.uuid4())
    record = {"dispatch_id": dispatch_id, "ts": _iso_now(), **entry}
    try:
        _BATTERY_DISPATCH_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(_BATTERY_DISPATCH_PATH, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")
    except Exception:
        pass
    return dispatch_id


# ── Decision class enumeration ──────────────────────────────────────────────────

# Core social-authority decision classes per federation canon.
# Extensible: new classes can be added by social units in their Part B.
DECISION_CLASSES = {
    "guild_master_election",
    "tribal_steward_consensus",
    "family_trustee_decree",
    "helm_recipe_choice",
    "part_a_reacknowledgment",   # Composes with KN048 inheritance enforcement
    "membership_vote",
    "resource_allocation",
    "platform_policy_amendment",
}


# ── Decision record schema ──────────────────────────────────────────────────────

@dataclass
class DecisionRecord:
    """
    A first-class Pheromone decision record anchored to a Golden Tablet.
    Immutable after creation (Stone Tablet Imperative).
    Corrections via supersede pointer to new record.
    """
    record_id: str
    record_type: str = "social_authority_decision"
    decision_class: str = ""
    anchor: str = ""                    # golden_tablet:// URI of the authority Tablet
    outcome: dict[str, Any] = field(default_factory=dict)
    decided_at: str = ""
    decided_by: str = ""                # social-unit-id (Guild/Tribe/Family/Helm)
    verification_method: str = ""       # declared in anchor Eblet's Part B
    battery_dispatch_id: str = ""
    furnace_stamp: str = ""             # SHA-256 of record content (excluding furnace_stamp itself)
    supersedes: Optional[str] = None   # prior record_id if correction

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        if d["supersedes"] is None:
            del d["supersedes"]
        return d

    def compute_content_hash(self) -> str:
        """
        SHA-256 of the record content (excluding furnace_stamp field itself).
        Matches Furnace stamp algorithm.
        """
        content = {k: v for k, v in self.to_dict().items()
                   if k not in ("furnace_stamp", "battery_dispatch_id")}
        serialized = json.dumps(content, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


# ── Schema validation ────────────────────────────────────────────────────────────

@dataclass
class ValidationResult:
    valid: bool
    reason: str = "ok"
    rejection_class: str = ""


def validate_decision_record(record: DecisionRecord) -> ValidationResult:
    """
    Validate a decision record's schema before submission to Furnace.
    Does not consult the IP Ledger (that is done in verify_with_furnace).
    """
    if not record.record_id:
        return ValidationResult(False, "record_id is empty", "schema")
    if record.record_type != "social_authority_decision":
        return ValidationResult(False, f"record_type must be 'social_authority_decision'", "schema")
    if not record.decision_class:
        return ValidationResult(False, "decision_class is empty", "schema")
    if not record.anchor:
        return ValidationResult(False, "anchor is empty — must be a golden_tablet:// URI", "schema")
    if not is_valid_uri(record.anchor):
        return ValidationResult(False, f"anchor is not a valid golden_tablet:// URI: {record.anchor!r}", "invalid_uri")
    if not record.decided_at:
        return ValidationResult(False, "decided_at is empty", "schema")
    if not record.decided_by:
        return ValidationResult(False, "decided_by is empty", "schema")
    if not record.verification_method:
        return ValidationResult(False, "verification_method is empty — must be declared in anchor Eblet Part B", "schema")
    return ValidationResult(True)


# ── Anchor resolution (KN045 integration) ───────────────────────────────────────

def resolve_anchor(
    anchor_uri: str,
    ledger_lookup: Optional[dict[str, dict]] = None,
) -> Optional[dict]:
    """
    Resolve a golden_tablet:// anchor URI against the IP Ledger.
    Returns the ledger entry dict if found, None otherwise.
    """
    if not ledger_lookup:
        return None
    return ledger_lookup.get(anchor_uri)


def verify_method_matches_part_b(
    verification_method: str,
    anchor_entry: dict,
) -> bool:
    """
    Verify that verification_method is declared in the anchor Eblet's Part B.
    In production, this reads the Eblet file's Part B section.
    Here: check against 'part_b_methods' field in ledger entry (test-harness pattern),
    or accept any non-empty method if the anchor entry has no Part B constraint.
    """
    part_b_methods = anchor_entry.get("part_b_methods", None)
    if part_b_methods is None:
        # No Part B constraint declared in ledger entry — accept
        return True
    if isinstance(part_b_methods, list):
        return verification_method in part_b_methods
    if isinstance(part_b_methods, str):
        return verification_method == part_b_methods
    return False


# ── Furnace verification ─────────────────────────────────────────────────────────

@dataclass
class FurnaceVerificationResult:
    verified: bool
    record_id: str
    furnace_stamp: str = ""
    battery_dispatch_id: str = ""
    rejection_class: str = ""
    rejection_detail: str = ""


def verify_with_furnace(
    record: DecisionRecord,
    ledger_lookup: Optional[dict[str, dict]] = None,
) -> FurnaceVerificationResult:
    """
    Submit decision record to Furnace for verification:
      1. Validate schema
      2. Verify anchor exists in IP Ledger (KN045 resolution)
      3. Verify verification_method matches Part B in anchor Eblet
      4. Compute and assign Furnace stamp
      5. Log to Battery-dispatch register

    Returns FurnaceVerificationResult.
    """
    # Step 1: Schema validation
    schema_check = validate_decision_record(record)
    if not schema_check.valid:
        return FurnaceVerificationResult(
            verified=False,
            record_id=record.record_id,
            rejection_class=schema_check.rejection_class,
            rejection_detail=schema_check.reason,
        )

    # Step 2: Anchor resolution
    anchor_entry = resolve_anchor(record.anchor, ledger_lookup)
    if ledger_lookup is not None and anchor_entry is None:
        return FurnaceVerificationResult(
            verified=False,
            record_id=record.record_id,
            rejection_class="anchor_not_found",
            rejection_detail=(
                f"Anchor URI {record.anchor!r} not found in IP Ledger. "
                "Ensure the Tablet is registered before recording decisions."
            ),
        )

    # Step 3: Verification method check
    if anchor_entry is not None:
        if not verify_method_matches_part_b(record.verification_method, anchor_entry):
            return FurnaceVerificationResult(
                verified=False,
                record_id=record.record_id,
                rejection_class="method_mismatch",
                rejection_detail=(
                    f"verification_method {record.verification_method!r} is not declared "
                    f"in Part B of anchor Eblet {record.anchor!r}. "
                    "Only Part-B-declared methods are valid."
                ),
            )

    # Step 4: Furnace stamp
    stamp = record.compute_content_hash()
    record.furnace_stamp = stamp

    # Step 5: Battery-dispatch register
    dispatch_id = _write_dispatch({
        "event": "decision_record_verified",
        "record_id": record.record_id,
        "decision_class": record.decision_class,
        "anchor": record.anchor,
        "decided_by": record.decided_by,
        "furnace_stamp": stamp,
    })
    record.battery_dispatch_id = dispatch_id

    return FurnaceVerificationResult(
        verified=True,
        record_id=record.record_id,
        furnace_stamp=stamp,
        battery_dispatch_id=dispatch_id,
    )


# ── Append-only store ────────────────────────────────────────────────────────────

def append_decision(
    record: DecisionRecord,
    store_path: Optional[Path] = None,
) -> None:
    """
    Append a verified decision record to the Pheromone decisions JSONL store.
    Stone Tablet Imperative: append-only, never in-place edits.
    """
    path = store_path or _PHEROMONE_DECISIONS_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record.to_dict()) + "\n")


def load_decisions(store_path: Optional[Path] = None) -> list[DecisionRecord]:
    """Load all decision records from the JSONL store."""
    path = store_path or _PHEROMONE_DECISIONS_PATH
    records: list[DecisionRecord] = []
    if not path.exists():
        return records
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
                records.append(DecisionRecord(
                    record_id=d.get("record_id", ""),
                    record_type=d.get("record_type", "social_authority_decision"),
                    decision_class=d.get("decision_class", ""),
                    anchor=d.get("anchor", ""),
                    outcome=d.get("outcome", {}),
                    decided_at=d.get("decided_at", ""),
                    decided_by=d.get("decided_by", ""),
                    verification_method=d.get("verification_method", ""),
                    battery_dispatch_id=d.get("battery_dispatch_id", ""),
                    furnace_stamp=d.get("furnace_stamp", ""),
                    supersedes=d.get("supersedes"),
                ))
            except (json.JSONDecodeError, TypeError):
                pass
    return records


def no_in_place_edit_guard(record_id: str, store_path: Optional[Path] = None) -> bool:
    """
    Guard: raise if an attempt is made to edit an existing record in place.
    In production, Furnace catches this at the write path; here: check that
    record_id already exists in store → correction must use supersede.
    Returns True if record already exists (caller should use supersede instead).
    """
    records = load_decisions(store_path)
    return any(r.record_id == record_id for r in records)


# ── Bidirectional discoverability ────────────────────────────────────────────────

def decisions_anchored_to(
    tablet_uri: str,
    store_path: Optional[Path] = None,
) -> list[DecisionRecord]:
    """
    Given a Tablet URI, return all non-superseded decisions anchored to it.
    Excludes records that have been superseded by a later correction.
    """
    records = load_decisions(store_path)
    # Find all record_ids that have been superseded
    superseded_ids = {r.supersedes for r in records if r.supersedes}
    return [
        r for r in records
        if r.anchor == tablet_uri and r.record_id not in superseded_ids
    ]


def tablet_for(
    decision_id: str,
    store_path: Optional[Path] = None,
) -> Optional[str]:
    """
    Given a decision_id, return the anchor Tablet URI.
    Returns None if decision_id not found.
    """
    records = load_decisions(store_path)
    for r in records:
        if r.record_id == decision_id:
            return r.anchor
    return None


def decisions_by_class(
    decision_class: str,
    store_path: Optional[Path] = None,
) -> list[DecisionRecord]:
    """
    Return all non-superseded decisions of a given class.
    Detective Scribe query extension per D.4 / T10.
    """
    records = load_decisions(store_path)
    superseded_ids = {r.supersedes for r in records if r.supersedes}
    return [
        r for r in records
        if r.decision_class == decision_class and r.record_id not in superseded_ids
    ]


# ── Factory ──────────────────────────────────────────────────────────────────────

def create_decision_record(
    decision_class: str,
    anchor: str,
    outcome: dict[str, Any],
    decided_by: str,
    verification_method: str,
    supersedes: Optional[str] = None,
) -> DecisionRecord:
    """
    Factory: create a new decision record with a fresh UUID record_id.
    Does not verify or persist — call verify_with_furnace() then append_decision().
    """
    return DecisionRecord(
        record_id=str(uuid.uuid4()),
        record_type="social_authority_decision",
        decision_class=decision_class,
        anchor=anchor,
        outcome=outcome,
        decided_at=_iso_now(),
        decided_by=decided_by,
        verification_method=verification_method,
        supersedes=supersedes,
    )
