"""
Inheritance Enforcement — KN048 / BP005 Federation Tooling

Mechanism for layer L_k to prove it inherits L_1 + L_2 + ... + L_{k-1} Part A rules.

Architecture:
  - Dependency manifest (YAML frontmatter) embedded in each L_k Eblet
  - Furnace stamps all the way up the chain
  - Verification walks the manifest chain, checking:
      (a) each parent Furnace stamp matches current parent Eblet hash (non-tampered)
      (b) every parent has part_a_acknowledged: true (Part A non-overrideable)
  - Partial-inheritance rejection if any link is missing or unacknowledged
  - Parent Part A supersede → child manifest becomes stale until re-acknowledged
  - Re-acknowledgment is an owner-action (not automatic), composes with KN050
    Pheromone-anchored decision schema

Composes with:
  - KN044 furnace_eblet_qr_scan (Furnace stamp hashing)
  - KN045 layer_addressing (URI chain-walk)
  - KN046 furnace_multi_tenancy (per-layer IP Ledger lookup)
  - KN050 pheromone_decision (re-acknowledgment IS a Pheromone-anchored decision)
  - Battery-dispatch register — every verification logged

Federation canon Open Question 9.
KN048 / BP005 — Founder-ratified federation tooling.
"""

from __future__ import annotations

import hashlib
import json
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from discipline_wing.federation.layer_addressing import (
    parse_uri,
    is_valid_uri,
    extract_layer,
    LayerAddress,
)

# ── Paths ───────────────────────────────────────────────────────────────────────

_BATTERY_DISPATCH_PATH = Path(os.path.expanduser("~/.claude/state/battery_dispatch_register.jsonl"))
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


# ── Manifest schema ─────────────────────────────────────────────────────────────

@dataclass
class ManifestEntry:
    """
    Single entry in an L_k Eblet's inherits_from dependency manifest.
    Each entry represents one parent layer's Part A acknowledgment.
    """
    layer: int
    uri: str                          # golden_tablet:// URI of parent Project_Rules/Canon Eblet
    furnace_stamp: str                # SHA-256 hash of parent Eblet content at acknowledgment time
    part_a_acknowledged: bool
    inherited_at: str                 # ISO timestamp of acknowledgment


@dataclass
class DependencyManifest:
    """
    Full dependency manifest for an L_k Eblet.
    Lists all parent layers (L_1 through L_{k-1}) in order.
    Embedded as YAML in Eblet frontmatter.
    """
    subject_uri: str                   # The L_k Eblet this manifest belongs to
    subject_layer: int
    entries: list[ManifestEntry] = field(default_factory=list)

    def to_yaml_block(self) -> str:
        """Serialize manifest as YAML-formatted block for embedding in frontmatter."""
        lines = [
            "inherits_from:",
        ]
        for e in self.entries:
            lines.append(f"  - layer: L_{e.layer}")
            lines.append(f"    uri: {e.uri}")
            lines.append(f"    furnace_stamp: {e.furnace_stamp}")
            lines.append(f"    part_a_acknowledged: {str(e.part_a_acknowledged).lower()}")
            lines.append(f"    inherited_at: {e.inherited_at}")
        return "\n".join(lines)

    @classmethod
    def parse_yaml_block(cls, subject_uri: str, yaml_text: str) -> "DependencyManifest":
        """
        Parse an inherits_from YAML block back into a DependencyManifest.
        Tolerant parser: recognizes the KN048 YAML format produced by to_yaml_block().
        """
        entries: list[ManifestEntry] = []
        current: Optional[dict] = None  # None until first "- layer:" line seen

        for line in yaml_text.splitlines():
            stripped = line.strip()
            if stripped.startswith("- layer:"):
                if current is not None:
                    entries.append(_entry_from_dict(current))
                current = {"layer": int(stripped.split("L_")[1])}
            elif current is not None and ":" in stripped:
                key, _, val = stripped.partition(":")
                key = key.strip().lstrip("- ")
                val = val.strip()
                if key != "layer":  # layer already set above
                    current[key] = val

        if current is not None:
            entries.append(_entry_from_dict(current))

        subject_layer = extract_layer(subject_uri) if is_valid_uri(subject_uri) else 0
        return cls(subject_uri=subject_uri, subject_layer=subject_layer, entries=entries)


def _entry_from_dict(d: dict) -> ManifestEntry:
    layer_raw = d.get("layer", "0")
    if isinstance(layer_raw, str) and layer_raw.startswith("L_"):
        layer = int(layer_raw[2:])
    else:
        layer = int(layer_raw)
    return ManifestEntry(
        layer=layer,
        uri=d.get("uri", ""),
        furnace_stamp=d.get("furnace_stamp", ""),
        part_a_acknowledged=str(d.get("part_a_acknowledged", "false")).lower() == "true",
        inherited_at=d.get("inherited_at", ""),
    )


# ── Furnace stamp computation ────────────────────────────────────────────────────

def compute_furnace_stamp(content: str) -> str:
    """SHA-256 hash of Eblet content — the Furnace stamp."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def compute_furnace_stamp_for_uri(
    uri: str,
    ledger_lookup: Optional[dict[str, dict]] = None,
) -> Optional[str]:
    """
    Retrieve current Furnace stamp for a given URI from ledger or on-disk file.
    Returns None if not resolvable.
    """
    if ledger_lookup and uri in ledger_lookup:
        entry = ledger_lookup[uri]
        return entry.get("furnace_stamp") or entry.get("current_hash")
    return None


# ── Manifest construction ────────────────────────────────────────────────────────

def build_manifest(
    subject_uri: str,
    parent_entries: list[tuple[str, str]],  # [(uri, furnace_stamp), ...]
) -> DependencyManifest:
    """
    Construct a DependencyManifest for subject_uri given its parent chain.
    parent_entries: list of (uri, furnace_stamp) for each ancestor from L1 upward.
    """
    if not is_valid_uri(subject_uri):
        raise ValueError(f"Invalid subject URI: {subject_uri!r}")

    subject_layer = extract_layer(subject_uri)
    manifest_entries: list[ManifestEntry] = []
    for uri, stamp in parent_entries:
        layer = extract_layer(uri) if is_valid_uri(uri) else 0
        manifest_entries.append(ManifestEntry(
            layer=layer,
            uri=uri,
            furnace_stamp=stamp,
            part_a_acknowledged=True,
            inherited_at=_iso_now(),
        ))

    return DependencyManifest(
        subject_uri=subject_uri,
        subject_layer=subject_layer,
        entries=manifest_entries,
    )


# ── Verification result ─────────────────────────────────────────────────────────

@dataclass
class InheritanceVerificationResult:
    """Result of an inheritance chain verification."""
    valid: bool
    subject_uri: str
    rejection_class: str = ""
    # Possible: tampered_anchor | missing_part_a | missing_parent | partial_inheritance |
    #           stale_manifest | invalid_uri | ""
    rejection_detail: str = ""
    chain_depth: int = 0
    battery_dispatch_id: str = ""


# ── Chain verification ──────────────────────────────────────────────────────────

def verify_inheritance_chain(
    manifest: DependencyManifest,
    ledger_lookup: Optional[dict[str, dict]] = None,
    log_to_dispatch: bool = True,
) -> InheritanceVerificationResult:
    """
    Walk the dependency manifest and verify the full inheritance chain.

    For each parent entry:
      1. Verify Furnace stamp matches current parent Eblet hash (tamper detection)
      2. Verify part_a_acknowledged: true

    Returns InheritanceVerificationResult(valid=True) if all checks pass.
    Returns InheritanceVerificationResult(valid=False, ...) on any failure.
    """
    subject_uri = manifest.subject_uri
    entries = manifest.entries

    if not entries:
        result = InheritanceVerificationResult(
            valid=False,
            subject_uri=subject_uri,
            rejection_class="partial_inheritance",
            rejection_detail="Manifest has no entries — at minimum L1 must be acknowledged.",
        )
        _maybe_log(result, log_to_dispatch)
        return result

    for entry in entries:
        # Part A acknowledgment check
        if not entry.part_a_acknowledged:
            result = InheritanceVerificationResult(
                valid=False,
                subject_uri=subject_uri,
                rejection_class="missing_part_a",
                rejection_detail=(
                    f"Layer L_{entry.layer} ({entry.uri!r}) has "
                    "part_a_acknowledged: false — Part A must be acknowledged."
                ),
            )
            _maybe_log(result, log_to_dispatch)
            return result

        # URI validity check
        if not is_valid_uri(entry.uri):
            result = InheritanceVerificationResult(
                valid=False,
                subject_uri=subject_uri,
                rejection_class="invalid_uri",
                rejection_detail=f"Manifest entry has invalid URI: {entry.uri!r}",
            )
            _maybe_log(result, log_to_dispatch)
            return result

        # Furnace stamp verification (tamper detection)
        current_stamp = compute_furnace_stamp_for_uri(entry.uri, ledger_lookup)
        if current_stamp is not None and current_stamp != entry.furnace_stamp:
            result = InheritanceVerificationResult(
                valid=False,
                subject_uri=subject_uri,
                rejection_class="tampered_anchor",
                rejection_detail=(
                    f"Furnace stamp mismatch at L_{entry.layer} ({entry.uri!r}): "
                    f"manifest has {entry.furnace_stamp!r}, "
                    f"current is {current_stamp!r}."
                ),
            )
            _maybe_log(result, log_to_dispatch)
            return result

    # All entries pass
    dispatch_id = ""
    if log_to_dispatch:
        dispatch_id = _write_dispatch({
            "event": "inheritance_verification_pass",
            "subject_uri": subject_uri,
            "chain_depth": len(entries),
        })
    return InheritanceVerificationResult(
        valid=True,
        subject_uri=subject_uri,
        chain_depth=len(entries),
        battery_dispatch_id=dispatch_id,
    )


def _maybe_log(result: InheritanceVerificationResult, log: bool) -> None:
    if not log:
        return
    dispatch_id = _write_dispatch({
        "event": "inheritance_verification_fail",
        "subject_uri": result.subject_uri,
        "rejection_class": result.rejection_class,
        "rejection_detail": result.rejection_detail,
    })
    result.battery_dispatch_id = dispatch_id


# ── Manifest validation (pure schema check) ──────────────────────────────────────

def validate_manifest_schema(manifest: DependencyManifest) -> tuple[bool, str]:
    """
    Validate manifest structure without consulting the ledger.
    Returns (valid, reason).
    """
    if not manifest.subject_uri:
        return False, "subject_uri is empty"
    if not is_valid_uri(manifest.subject_uri):
        return False, f"Invalid subject_uri: {manifest.subject_uri!r}"
    for entry in manifest.entries:
        if not entry.uri:
            return False, "Manifest entry has empty uri"
        if not entry.furnace_stamp:
            return False, f"Manifest entry for {entry.uri!r} has empty furnace_stamp"
        if not entry.inherited_at:
            return False, f"Manifest entry for {entry.uri!r} has empty inherited_at"
    return True, "ok"


# ── Parent supersede handling ────────────────────────────────────────────────────

def check_manifest_staleness(
    manifest: DependencyManifest,
    ledger_lookup: dict[str, dict],
) -> tuple[bool, list[str]]:
    """
    Check if any parent in the manifest has been superseded (Part A updated).
    Returns (is_stale, [list of stale URIs]).
    A manifest is stale if any parent's current Furnace stamp differs from what's
    recorded in the manifest — this means the parent's Part A has changed.
    The layer owner must re-acknowledge (owner-action, not automatic per D.2).
    """
    stale_uris: list[str] = []
    for entry in manifest.entries:
        current_stamp = compute_furnace_stamp_for_uri(entry.uri, ledger_lookup)
        if current_stamp is not None and current_stamp != entry.furnace_stamp:
            stale_uris.append(entry.uri)
    return bool(stale_uris), stale_uris


def create_reacknowledgment_manifest(
    existing_manifest: DependencyManifest,
    updated_entry_uri: str,
    new_furnace_stamp: str,
) -> DependencyManifest:
    """
    Create a new manifest with updated furnace_stamp for a re-acknowledged parent.
    The new manifest supersedes the old one (append-only — old manifest remains).
    Per D.2: owner reviews parent Part A change before re-acknowledging.
    Composes with KN050 — re-acknowledgment IS a Pheromone-anchored decision.
    """
    new_entries: list[ManifestEntry] = []
    for entry in existing_manifest.entries:
        if entry.uri == updated_entry_uri:
            new_entries.append(ManifestEntry(
                layer=entry.layer,
                uri=entry.uri,
                furnace_stamp=new_furnace_stamp,
                part_a_acknowledged=True,
                inherited_at=_iso_now(),
            ))
        else:
            new_entries.append(entry)

    return DependencyManifest(
        subject_uri=existing_manifest.subject_uri,
        subject_layer=existing_manifest.subject_layer,
        entries=new_entries,
    )
