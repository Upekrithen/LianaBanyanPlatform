"""
Layer Instantiation Tooling — KN047 / BP005 Federation Tooling

Substrate-provided onboarding flow for project owners adopting the Ring of Three
Golden Eblets template at L3.  Steward-card-class operation — Steward Level 2+
unlocks the Ring Instantiation Recipe.

Onboarding wizard (CLI) pipeline:
  Step 1  Collect project owner identity + confirm LB membership
  Step 2  Generate L3 layer URI per KN045 (golden_tablet://Layer_3/Entity_<uuid>/...)
  Step 3  Create empty IP Ledger entry for new L3 (per KN046 multi-tenancy)
  Step 4  Clone LB-source Ring of Three template Eblets to project's CANON dir
  Step 5  Project owner customizes Part B of Project Rules Golden Eblet
  Step 6  Project owner provides brand/stamp/QR-target for non-source Eblets
  Step 7  Enforce Marked Exception — source Eblet QR locked to Canon/Lore/Rules

Composes with:
  - KN044 furnace_eblet_qr_scan (stamp issuance)
  - KN045 layer_addressing (URI generation + validation)
  - KN046 furnace_multi_tenancy (per-layer IP Ledger creation)
  - KN049 dag_validation (cycle prevention before instantiation)
  - Deck Card system (B089) — Steward Level 2+ progression gate
  - Steward Recruitment Cold-Start Bounty

Federation canon Open Question 8.
KN047 / BP005 — Founder-ratified federation tooling.
"""

from __future__ import annotations

import json
import os
import shutil
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from discipline_wing.federation.layer_addressing import (
    LayerAddress,
    parse_uri,
    is_valid_uri,
    extract_layer,
)
from discipline_wing.federation.dag_validation import (
    validate_dag_write,
    DAGValidationResult,
)
from discipline_wing.furnace_eblet_qr_scan import (
    load_ip_ledger,
    IP_LEDGER_PATH,
    BATTERY_DISPATCH_PATH,
    _write_battery_dispatch,
)


def _iso_now() -> str:
    """Return current UTC time as ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()

# ── Paths ───────────────────────────────────────────────────────────────────────

_WORKSPACE = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
_FEDERATION_STATE = Path(os.path.expanduser("~/.claude/state/federation"))
_LAYER_LEDGERS_ROOT = _FEDERATION_STATE / "ledgers"
_RING_TEMPLATES_DIR = _WORKSPACE / "discipline_wing" / "federation" / "ring_of_three_template"

# LB membership price — immutable per Founder-mandatory canon
LB_MEMBERSHIP_PRICE_USD = 5.0

# Steward level required to unlock Ring instantiation
STEWARD_RING_LEVEL_REQUIRED = 2

# Canonical Ring of Three Eblet classes
RING_EBLET_CLASSES = ["Canon", "Lore", "Project_Rules"]

# Marked Exception: source QR always routes to this path suffix
MARKED_EXCEPTION_QR_SUFFIX = "Canon"


# ── Data types ──────────────────────────────────────────────────────────────────

@dataclass
class ProjectOwnerIdentity:
    """Identity of a project owner requesting L3 Ring instantiation."""
    lb_member_id: str                    # LB membership ID (verifies $5/year membership)
    lb_member_verified: bool             # Membership confirmed
    steward_level: int                   # Deck Card progression level (must be ≥ 2)
    project_name: str                    # Human display name for the project
    project_uuid: Optional[str] = None  # Set by Step 2 if not provided


@dataclass
class RingSlots:
    """Project owner's customization slots for the Ring of Three at L3."""
    project_owner_brand: str        # Brand name / display label
    project_ip_ledger_url: str      # URL/path to project's IP Ledger
    project_canon_emblem: str       # Emblem or badge identifier
    project_part_b_rules: str       # Part B rules content (project-owner-sovereign)
    # Non-source Eblet QR targets (project-owner-sovereign per federation canon Part B)
    lore_qr_target: str = ""
    rules_qr_target: str = ""


@dataclass
class InstantiationReceipt:
    """Signed receipt from a successful Ring instantiation."""
    receipt_id: str
    project_owner: str                  # lb_member_id
    l3_uri: str                         # golden_tablet://Layer_3/Entity_<uuid>/...
    entity_uuid: str
    ip_ledger_entry_id: str
    cloned_eblet_paths: list[str]
    furnace_stamps: dict[str, str]      # eblet_class → furnace_stamp_hash
    marked_exception_enforced: bool
    battery_dispatch_id: str
    instantiated_at: str
    status: str = "complete"
    error: Optional[str] = None


@dataclass
class InstantiationError:
    """Structured error for rejected instantiation attempts."""
    reason: str
    rejection_class: str   # unauthenticated | insufficient_steward_level | cycle_detected |
                           # uri_invalid | ip_ledger_write_failure | marked_exception_violation
    details: Optional[str] = None


# ── Membership verification ─────────────────────────────────────────────────────

def verify_lb_membership(owner: ProjectOwnerIdentity) -> bool:
    """
    Verify LB membership.  Per D.2: if unauthenticated/unmembered → REJECT
    with clear path to LB membership signup ($5/year, identical for all members).
    In production, this delegates to the Supabase members table.
    Here: accept if lb_member_verified is True (test-harness override-able).
    """
    return bool(owner.lb_member_id and owner.lb_member_verified)


def verify_steward_level(owner: ProjectOwnerIdentity) -> bool:
    """Steward must be Level 2+ to unlock Ring instantiation (Deck Card gate)."""
    return owner.steward_level >= STEWARD_RING_LEVEL_REQUIRED


# ── Step 2: Generate L3 URI ─────────────────────────────────────────────────────

def generate_l3_entity_uuid(owner: ProjectOwnerIdentity) -> str:
    """
    Generate a stable entity UUID for the new L3.
    Uses provided project_uuid if already set, otherwise generates fresh UUID4.
    """
    if owner.project_uuid:
        return owner.project_uuid
    return str(uuid.uuid4())


def build_l3_uris(entity_uuid: str) -> dict[str, str]:
    """
    Build all three Ring URI targets for the new L3 entity.
    Returns {eblet_class: uri_string} for Canon, Lore, Project_Rules.
    """
    return {
        cls: f"golden_tablet://Layer_3/Entity_{entity_uuid}/{cls}"
        for cls in RING_EBLET_CLASSES
    }


# ── Step 3: Create IP Ledger entry ──────────────────────────────────────────────

def create_ip_ledger_entry(
    entity_uuid: str,
    l3_uris: dict[str, str],
    layer_ledger_path: Optional[Path] = None,
) -> str:
    """
    Create the initial IP Ledger entry for the new L3 entity.
    Validates against the DAG (KN049 cycle prevention).
    Returns the new entry's tablet_id.
    """
    primary_uri = l3_uris["Canon"]
    ledger_path = layer_ledger_path or (_LAYER_LEDGERS_ROOT / "layer_3" / "ip_ledger.jsonl")
    ledger_path.parent.mkdir(parents=True, exist_ok=True)

    # Load existing ledger for DAG validation
    existing_entries: list[dict] = []
    if ledger_path.exists():
        with open(ledger_path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    try:
                        existing_entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass

    # KN049 cycle prevention: validate before writing
    dag_result = validate_dag_write(
        proposed_uri=primary_uri,
        proposed_parent_uri="golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
        existing_entries=existing_entries,
    )
    if not dag_result.accepted:
        raise ValueError(
            f"DAG validation rejected L3 instantiation: {dag_result.reason} "
            f"[{dag_result.rejection_class}]"
        )

    import hashlib
    content_seed = f"{entity_uuid}:{primary_uri}:{_iso_now()}"
    entry_hash = hashlib.sha256(content_seed.encode()).hexdigest()

    entry = {
        "tablet_id": primary_uri,
        "entity_uuid": entity_uuid,
        "layer": 3,
        "ring_uris": l3_uris,
        "current_hash": entry_hash,
        "parent_uri": "golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules",
        "created_at": _iso_now(),
        "status": "active",
    }

    with open(ledger_path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry) + "\n")

    return primary_uri


# ── Step 4: Clone Ring of Three template ────────────────────────────────────────

def _get_template_content(eblet_class: str) -> str:
    """Return default template content for an Eblet class."""
    templates = {
        "Canon": (
            "---\n"
            "eblet_class: Canon\n"
            "layer: 3\n"
            "source: LB-Ring-of-Three-Template\n"
            "marked_exception: true\n"
            "qr_routes_to: Canon\n"
            "---\n\n"
            "# Canon\n\n"
            "This Canon Eblet establishes the foundational authority record for this L3 project.\n"
            "Part A (from L1/L2 inheritance) is non-overrideable.\n"
            "Part B (project-owner-sovereign) begins below.\n\n"
            "## Part A — Inherited (from L1+L2, non-overrideable)\n\n"
            "- LB platform rules apply.\n"
            "- $5/year membership fee (identical for all members).\n\n"
            "## Part B — Project-Specific (owner-sovereign)\n\n"
            "<!-- Project owner customizes Part B here -->\n"
        ),
        "Lore": (
            "---\n"
            "eblet_class: Lore\n"
            "layer: 3\n"
            "source: LB-Ring-of-Three-Template\n"
            "marked_exception: false\n"
            "qr_routes_to: PROJECT_OWNER_DEFINED\n"
            "---\n\n"
            "# Lore\n\n"
            "This Lore Eblet contains narrative context for this L3 project.\n"
            "QR target is project-owner-sovereign per federation canon Part B.\n"
        ),
        "Project_Rules": (
            "---\n"
            "eblet_class: Project_Rules\n"
            "layer: 3\n"
            "source: LB-Ring-of-Three-Template\n"
            "marked_exception: false\n"
            "qr_routes_to: PROJECT_OWNER_DEFINED\n"
            "---\n\n"
            "# Project Rules\n\n"
            "This Project Rules Eblet contains binding rules for this L3 project.\n"
            "Part A (from L1+L2) is non-overrideable.\n"
            "Part B (project-owner-sovereign) begins below.\n\n"
            "## Part A — Inherited\n\n"
            "<!-- Filled by inheritance manifest KN048 -->\n\n"
            "## Part B — Project-Sovereign Rules\n\n"
            "<!-- Project owner writes binding rules here -->\n"
        ),
    }
    return templates.get(eblet_class, f"# {eblet_class} Eblet\n")


def clone_ring_template(
    entity_uuid: str,
    l3_uris: dict[str, str],
    output_dir: Optional[Path] = None,
) -> list[str]:
    """
    Clone the LB-source Ring of Three template Eblets to the project's CANON dir.
    Returns list of file paths created.
    Per D.3/D.4: Non-source Eblet QR targets are project-owner-sovereign;
    Canon Eblet QR is Marked Exception (always routes to Canon).
    """
    canon_dir = output_dir or (_FEDERATION_STATE / "projects" / entity_uuid / "CANON")
    canon_dir.mkdir(parents=True, exist_ok=True)

    created: list[str] = []
    for eblet_class in RING_EBLET_CLASSES:
        content = _get_template_content(eblet_class)
        eblet_path = canon_dir / f"{eblet_class}.eblet.md"
        with open(eblet_path, "w", encoding="utf-8") as fh:
            fh.write(content)
        created.append(str(eblet_path))

    return created


# ── Step 5–6: Apply customization ───────────────────────────────────────────────

def apply_owner_customization(
    entity_uuid: str,
    slots: RingSlots,
    eblet_paths: list[str],
) -> list[str]:
    """
    Apply project owner's brand/stamp/Part B customization to cloned Eblets.
    Returns paths of modified Eblets.
    Non-source Eblet QR targets are owner-sovereign (D.3).
    """
    modified: list[str] = []
    for path_str in eblet_paths:
        path = Path(path_str)
        content = path.read_text(encoding="utf-8")

        # Inject brand
        content = content.replace("<!-- Project owner customizes Part B here -->",
                                  f"<!-- Brand: {slots.project_owner_brand} -->\n\n"
                                  f"{slots.project_part_b_rules}")

        # Apply non-source QR targets (owner-sovereign)
        if "Lore" in path.name and slots.lore_qr_target:
            content = content.replace("PROJECT_OWNER_DEFINED", slots.lore_qr_target)
        if "Project_Rules" in path.name and slots.rules_qr_target:
            content = content.replace("PROJECT_OWNER_DEFINED", slots.rules_qr_target)

        path.write_text(content, encoding="utf-8")
        modified.append(str(path))

    return modified


# ── Step 7: Marked Exception enforcement ────────────────────────────────────────

def enforce_marked_exception(
    eblet_paths: list[str],
    l3_uris: dict[str, str],
) -> bool:
    """
    Enforce Marked Exception at write-time: source Eblet QR ALWAYS routes to
    project's Canon path.  Non-source Eblets may have owner-sovereign QR targets.
    Returns True if Canon Eblet has Marked Exception correctly enforced.
    Raises ValueError if Canon Eblet has been tampered to remove Marked Exception.
    """
    canon_uri = l3_uris.get("Canon", "")
    for path_str in eblet_paths:
        path = Path(path_str)
        if "Canon" in path.name:
            content = path.read_text(encoding="utf-8")
            if "marked_exception: true" not in content:
                raise ValueError(
                    f"Marked Exception violation: Canon Eblet at {path_str} "
                    "must have marked_exception: true — QR locked to Canon path."
                )
            if "qr_routes_to: Canon" not in content:
                raise ValueError(
                    f"Marked Exception violation: Canon Eblet at {path_str} "
                    "must have qr_routes_to: Canon (Marked Exception non-overrideable)."
                )
    return True


# ── Furnace stamp issuance (KN044 integration) ──────────────────────────────────

def _compute_eblet_hash(path_str: str) -> str:
    """SHA-256 hash of Eblet file content (mirrors Furnace stamp algorithm)."""
    import hashlib
    content = Path(path_str).read_text(encoding="utf-8")
    return hashlib.sha256(content.encode()).hexdigest()


def issue_furnace_stamps(eblet_paths: list[str]) -> dict[str, str]:
    """
    Issue Furnace stamps for each cloned+customized Eblet at the new L3.
    Returns {eblet_class: furnace_stamp_hash}.
    Composes with KN044 — each stamp = SHA-256(content), logged to Battery-dispatch.
    """
    stamps: dict[str, str] = {}
    for path_str in eblet_paths:
        path = Path(path_str)
        # Infer eblet class from filename (Canon.eblet.md → stem=Canon.eblet → strip)
        stem = path.stem  # Canon.eblet (since path.name = Canon.eblet.md)
        eblet_class = stem[:-6] if stem.endswith(".eblet") else stem
        stamp = _compute_eblet_hash(path_str)
        stamps[eblet_class] = stamp
        _write_battery_dispatch({
            "event": "furnace_stamp_issued",
            "eblet_path": path_str,
            "eblet_class": eblet_class,
            "furnace_stamp": stamp,
        })
    return stamps


# ── Main onboarding flow ─────────────────────────────────────────────────────────

def instantiate_ring_of_three(
    owner: ProjectOwnerIdentity,
    slots: RingSlots,
    output_dir: Optional[Path] = None,
    layer_ledger_path: Optional[Path] = None,
) -> InstantiationReceipt | InstantiationError:
    """
    Full Ring of Three instantiation flow for a project owner at L3.
    Steps 1–7 per the KN047 spec.
    Returns InstantiationReceipt on success, InstantiationError on rejection.
    """
    # Step 1: Membership + Steward level gates
    if not verify_lb_membership(owner):
        return InstantiationError(
            reason=(
                "LB membership required. Join at lianabanyan.com — "
                f"${LB_MEMBERSHIP_PRICE_USD:.0f}/year, identical for all members."
            ),
            rejection_class="unauthenticated",
        )
    if not verify_steward_level(owner):
        return InstantiationError(
            reason=(
                f"Steward Level {STEWARD_RING_LEVEL_REQUIRED}+ required to unlock "
                "Ring instantiation. Current level: "
                f"{owner.steward_level}. Advance via Deck Card progression."
            ),
            rejection_class="insufficient_steward_level",
        )

    # Step 2: Generate L3 URIs
    entity_uuid = generate_l3_entity_uuid(owner)
    l3_uris = build_l3_uris(entity_uuid)

    # Step 3: Create IP Ledger entry (includes KN049 cycle check)
    try:
        ledger_entry_id = create_ip_ledger_entry(entity_uuid, l3_uris, layer_ledger_path)
    except ValueError as exc:
        return InstantiationError(
            reason=str(exc),
            rejection_class="cycle_detected",
        )

    # Step 4: Clone Ring of Three template
    eblet_paths = clone_ring_template(entity_uuid, l3_uris, output_dir)

    # Step 5+6: Apply owner customization (Part B + brand + QR targets)
    apply_owner_customization(entity_uuid, slots, eblet_paths)

    # Step 7: Enforce Marked Exception
    try:
        enforce_marked_exception(eblet_paths, l3_uris)
    except ValueError as exc:
        return InstantiationError(
            reason=str(exc),
            rejection_class="marked_exception_violation",
        )

    # Issue Furnace stamps for all Eblets
    furnace_stamps = issue_furnace_stamps(eblet_paths)

    # Log the full instantiation to Battery-dispatch
    dispatch_id = _write_battery_dispatch({
        "event": "ring_instantiation_complete",
        "owner_member_id": owner.lb_member_id,
        "entity_uuid": entity_uuid,
        "l3_uris": l3_uris,
        "furnace_stamps": furnace_stamps,
        "marked_exception_enforced": True,
    })

    receipt_id = str(uuid.uuid4())
    return InstantiationReceipt(
        receipt_id=receipt_id,
        project_owner=owner.lb_member_id,
        l3_uri=l3_uris["Canon"],
        entity_uuid=entity_uuid,
        ip_ledger_entry_id=ledger_entry_id,
        cloned_eblet_paths=eblet_paths,
        furnace_stamps=furnace_stamps,
        marked_exception_enforced=True,
        battery_dispatch_id=dispatch_id,
        instantiated_at=_iso_now(),
    )


# ── CLI onboarding wizard ────────────────────────────────────────────────────────

def cli_onboarding_wizard() -> None:
    """
    Interactive CLI onboarding wizard for project owners adopting Ring of Three at L3.
    Per D.1: defaults to CLI; admin UI deferred to follow-up KN.
    """
    print("=== Ring of Three Instantiation Wizard — KN047 ===\n")
    print(f"Membership required: ${LB_MEMBERSHIP_PRICE_USD:.0f}/year at lianabanyan.com\n")

    member_id = input("LB Member ID: ").strip()
    if not member_id:
        print("ERROR: LB membership required.")
        return

    steward_level_str = input("Your Steward Level (from Deck Card): ").strip()
    try:
        steward_level = int(steward_level_str)
    except ValueError:
        print("ERROR: Invalid Steward Level.")
        return

    project_name = input("Project Name: ").strip()
    brand = input("Project Brand Label: ").strip()
    part_b = input("Part B Rules (brief description): ").strip()

    owner = ProjectOwnerIdentity(
        lb_member_id=member_id,
        lb_member_verified=True,  # wizard assumes user is authenticated at session start
        steward_level=steward_level,
        project_name=project_name,
    )
    slots = RingSlots(
        project_owner_brand=brand,
        project_ip_ledger_url="",
        project_canon_emblem="",
        project_part_b_rules=part_b,
    )

    result = instantiate_ring_of_three(owner, slots)
    if isinstance(result, InstantiationError):
        print(f"\nREJECTED [{result.rejection_class}]: {result.reason}")
    else:
        print(f"\nSUCCESS — Ring instantiated!")
        print(f"  Entity UUID : {result.entity_uuid}")
        print(f"  L3 URI      : {result.l3_uri}")
        print(f"  Receipt ID  : {result.receipt_id}")
        print(f"  Eblets      : {', '.join(Path(p).name for p in result.cloned_eblet_paths)}")
        print(f"  Dispatch    : {result.battery_dispatch_id}")


if __name__ == "__main__":
    cli_onboarding_wizard()
