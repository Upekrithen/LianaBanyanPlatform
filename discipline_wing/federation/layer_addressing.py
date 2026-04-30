"""
Layer Addressing Scheme — KN045 / BP005 Federation Infrastructure

URI scheme for L1→L_n authority entity identification in the IP Ledger.

Grammar:
    golden_tablet://Layer_<L>/Entity_<id>/<tablet_class>[#anchor]

Examples:
    golden_tablet://Layer_1/Entity_LBCorp/Canon
    golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules
    golden_tablet://Layer_3/Entity_uuid-abc123/Project_Rules#section-2
    golden_tablet://Layer_5/Entity_helm-uuid/Canon#paragraph-4

Fields:
    Layer       integer ≥ 1 (L1 = LB Corp root, L2 = Upekrithen, L3 = project owner, ...)
    Entity_id   opaque identifier within the layer
    tablet_class  Canon | Platform_Rules | Project_Rules  (forward-compatible)
    anchor      optional fragment (e.g., a section reference within the Eblet)

Hash-of-parent-pointer:
    Each Layer L_k Eblet stores:
        parent_anchor_hash = SHA-256(parent_eblet_content + ":" + parent_uri)
    This creates a cryptographic chain from leaf to L1 root.

Spec persisted to: ~/.claude/state/federation/layer_addressing_scheme.md
Hash algorithm: SHA-256 (matches Furnace stamps per D.2).

Composes with:
  - KN044 (Furnace accepts golden_tablet:// URIs as eblet_id via D.4)
  - KN046 (per-layer-tenant lookup parses URI to extract layer)
  - KN049 (chain-builder + cycle detection consume this module)

KN045 / BP005 — Founder-ratified federation infrastructure.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ── URI scheme constants ────────────────────────────────────────────────────────

SCHEME = "golden_tablet"
KNOWN_TABLET_CLASSES = {"Canon", "Platform_Rules", "Project_Rules"}

# Forward-compat: we accept any tablet_class that matches this pattern
_TABLET_CLASS_PATTERN = re.compile(r"^[A-Za-z][A-Za-z0-9_]*$")

# Full URI regex: golden_tablet://Layer_<int>/Entity_<id>/<class>[#anchor]
_URI_RE = re.compile(
    r"^golden_tablet://"
    r"Layer_(?P<layer>\d+)"
    r"/Entity_(?P<entity_id>[A-Za-z0-9_\-\.]+)"
    r"/(?P<tablet_class>[A-Za-z][A-Za-z0-9_]*)"
    r"(?:#(?P<anchor>[A-Za-z0-9_\-\.]+))?$"
)

# ── Data types ─────────────────────────────────────────────────────────────────

@dataclass
class LayerAddress:
    """Parsed golden_tablet:// URI."""
    layer: int
    entity_id: str
    tablet_class: str
    anchor: Optional[str] = None
    raw_uri: str = ""

    def to_uri(self) -> str:
        base = f"golden_tablet://Layer_{self.layer}/Entity_{self.entity_id}/{self.tablet_class}"
        if self.anchor:
            return f"{base}#{self.anchor}"
        return base

    def is_lb_root(self) -> bool:
        """True if this is the L1 LB Corp root."""
        return self.layer == 1


@dataclass
class ChainEntry:
    """One hop in the parent-anchor chain."""
    address: LayerAddress
    parent_anchor_hash: Optional[str]  # None at L1 root
    content_hash: Optional[str]        # SHA-256 of this entry's content + URI


@dataclass
class ChainValidationResult:
    valid: bool
    chain: list[LayerAddress] = field(default_factory=list)
    reason: str = ""


# ── URI parser ─────────────────────────────────────────────────────────────────

def parse_uri(uri: str) -> LayerAddress:
    """
    Parse a golden_tablet:// URI into a LayerAddress.

    Raises ValueError on invalid format (not a golden_tablet:// URI or malformed).
    Forward-compatible: unknown tablet_class values are accepted (D.1).
    """
    if not isinstance(uri, str):
        raise ValueError(f"URI must be a string, got {type(uri).__name__}")
    uri = uri.strip()
    m = _URI_RE.match(uri)
    if not m:
        raise ValueError(
            f"Invalid golden_tablet URI: {uri!r}\n"
            f"Expected format: golden_tablet://Layer_<int>/Entity_<id>/<tablet_class>[#anchor]"
        )
    layer = int(m.group("layer"))
    if layer < 1:
        raise ValueError(f"Layer must be ≥ 1, got {layer}")

    return LayerAddress(
        layer=layer,
        entity_id=m.group("entity_id"),
        tablet_class=m.group("tablet_class"),
        anchor=m.group("anchor"),
        raw_uri=uri,
    )


def is_valid_uri(uri: str) -> bool:
    """True if the URI is a syntactically valid golden_tablet:// address."""
    try:
        parse_uri(uri)
        return True
    except ValueError:
        return False


# ── Hash-of-parent-pointer ─────────────────────────────────────────────────────

def compute_parent_anchor_hash(
    parent_content: str,
    parent_uri: str,
) -> str:
    """
    Compute hash-of-parent-pointer per KN045 spec.
    hash = SHA-256(parent_content + ":" + parent_uri)
    Algorithm: SHA-256, hex-encoded (matches Furnace stamps, D.2).
    """
    material = f"{parent_content}:{parent_uri}"
    return hashlib.sha256(material.encode("utf-8")).hexdigest()


def verify_parent_anchor_hash(
    parent_content: str,
    parent_uri: str,
    claimed_hash: str,
) -> bool:
    """
    Verify that claimed_hash matches the computed hash-of-parent-pointer.
    Returns True on match, False on mismatch or tamper.
    """
    expected = compute_parent_anchor_hash(parent_content, parent_uri)
    return expected == claimed_hash


# ── Chain builder ──────────────────────────────────────────────────────────────

def build_chain_from_ledger(
    leaf_uri: str,
    ledger_entries: list[dict],
) -> ChainValidationResult:
    """
    Walk parent-anchors from a leaf URI to the L1 root.
    Uses ledger_entries (IP Ledger JSONL records) to resolve each hop.

    A valid chain: L_k.parent_anchor_hash == hash(L_{k-1}.content + L_{k-1}.uri)

    Returns ChainValidationResult with:
        valid=True  + chain=[leaf→...→L1root] on success
        valid=False + reason on failure
    """
    try:
        leaf_addr = parse_uri(leaf_uri)
    except ValueError as e:
        return ChainValidationResult(valid=False, reason=str(e))

    # Build lookup tables from ledger
    by_uri: dict[str, dict] = {}
    by_tablet_id: dict[str, dict] = {}
    for entry in ledger_entries:
        if entry.get("event_type") != "mine_tablet":
            continue
        uri_field = entry.get("golden_tablet_uri", "")
        if uri_field:
            by_uri[uri_field] = entry
        tid = entry.get("tablet_id", "")
        if tid:
            by_tablet_id[tid] = entry

    chain: list[LayerAddress] = [leaf_addr]
    current_uri = leaf_uri
    visited_uris: set[str] = {leaf_uri}
    max_depth = 20  # safety cap (chains can't realistically be deeper)

    for _ in range(max_depth):
        current_entry = by_uri.get(current_uri)
        if current_entry is None:
            # Try to find by tablet_id parsed from URI anchor
            addr = parse_uri(current_uri) if is_valid_uri(current_uri) else None
            if addr and addr.anchor:
                current_entry = by_tablet_id.get(addr.anchor)
            if current_entry is None:
                # We've reached the root (no ledger entry = this IS the root)
                # or we genuinely can't find the entry
                break

        current_layer = parse_uri(current_uri).layer if is_valid_uri(current_uri) else 1
        if current_layer <= 1:
            # Reached L1 root — chain complete
            break

        parent_uri = current_entry.get("parent_uri", "")
        if not parent_uri:
            # No parent pointer — treat as root
            break

        if parent_uri in visited_uris:
            return ChainValidationResult(
                valid=False,
                chain=chain,
                reason=f"Cycle detected: {parent_uri!r} already in chain",
            )

        try:
            parent_addr = parse_uri(parent_uri)
        except ValueError as e:
            return ChainValidationResult(
                valid=False,
                chain=chain,
                reason=f"Invalid parent URI {parent_uri!r}: {e}",
            )

        chain.append(parent_addr)
        visited_uris.add(parent_uri)
        current_uri = parent_uri

    return ChainValidationResult(valid=True, chain=chain)


def validate_hash_chain(
    chain_entries: list[dict],
) -> ChainValidationResult:
    """
    Validate the hash-of-parent-pointer for an explicit list of chain entries.

    Each entry dict must have:
        uri: str                  — this entry's golden_tablet:// URI
        content: str              — Eblet content (for hash computation)
        parent_anchor_hash: str   — claimed hash of parent (None for L1 root)
        parent_uri: str           — parent's URI (None for L1 root)

    Validates from leaf (index 0) toward root (last index).
    """
    if not chain_entries:
        return ChainValidationResult(valid=True, chain=[], reason="Empty chain (trivially valid)")

    chain_addresses: list[LayerAddress] = []
    for i, entry in enumerate(chain_entries):
        uri = entry.get("uri", "")
        try:
            addr = parse_uri(uri)
        except ValueError as e:
            return ChainValidationResult(
                valid=False,
                reason=f"Entry {i}: invalid URI {uri!r}: {e}",
            )
        chain_addresses.append(addr)

        # Validate hash-of-parent-pointer (skip for L1 root which has no parent)
        if i > 0:
            parent_entry = chain_entries[i - 1]
            parent_content = parent_entry.get("content", "")
            parent_uri = parent_entry.get("uri", "")
            claimed_hash = entry.get("parent_anchor_hash", "")

            if claimed_hash:
                if not verify_parent_anchor_hash(parent_content, parent_uri, claimed_hash):
                    return ChainValidationResult(
                        valid=False,
                        chain=chain_addresses,
                        reason=(
                            f"Hash-of-parent-pointer mismatch at entry {i} "
                            f"(URI={uri!r}). "
                            f"Claimed={claimed_hash!r}. Chain may be tampered."
                        ),
                    )

    return ChainValidationResult(valid=True, chain=chain_addresses)


# ── Multi-tenant isolation helpers ─────────────────────────────────────────────

def extract_layer(uri: str) -> Optional[int]:
    """Extract the layer integer from a golden_tablet:// URI. Returns None on error."""
    try:
        return parse_uri(uri).layer
    except ValueError:
        return None


def extract_entity_id(uri: str) -> Optional[str]:
    """Extract the entity_id from a golden_tablet:// URI. Returns None on error."""
    try:
        return parse_uri(uri).entity_id
    except ValueError:
        return None


def same_layer_isolation(uri_a: str, uri_b: str) -> bool:
    """
    True if both URIs belong to the SAME layer (same int).
    Used by multi-tenancy to enforce layer isolation (D.3 multi_tenant_isolation_prep).
    """
    layer_a = extract_layer(uri_a)
    layer_b = extract_layer(uri_b)
    if layer_a is None or layer_b is None:
        return False
    return layer_a == layer_b


def different_entities_same_layer(uri_a: str, uri_b: str) -> bool:
    """
    True if both URIs are in the same layer but belong to DIFFERENT entities.
    Confirms isolation boundary (two L3 entities must not collide).
    """
    try:
        a = parse_uri(uri_a)
        b = parse_uri(uri_b)
        return a.layer == b.layer and a.entity_id != b.entity_id
    except ValueError:
        return False


# ── Spec persistence ───────────────────────────────────────────────────────────

_SPEC_PATH = Path(os.path.expanduser("~/.claude/state/federation/layer_addressing_scheme.md"))

LAYER_ADDRESSING_SPEC = """\
# Layer Addressing Scheme — KN045 / BP005 Federation Infrastructure

**Status:** LIVE (KN045)
**Algorithm:** SHA-256
**Canonical URI scheme:** `golden_tablet://`

---

## URI Grammar

```
golden_tablet://Layer_<L>/Entity_<id>/<tablet_class>[#anchor]
```

| Field | Type | Description |
|---|---|---|
| `<L>` | integer ≥ 1 | Layer number per federation Multi-Layer Authority table |
| `<id>` | alphanumeric+dash+dot | Unique entity identifier within the layer |
| `<tablet_class>` | identifier | One of Canon, Platform_Rules, Project_Rules (forward-compatible) |
| `[#anchor]` | optional fragment | Sub-section reference within the Eblet |

### Layer Assignment

| Layer | Authority |
|---|---|
| L1 | LB Corp (root) |
| L2 | Upekrithen |
| L3 | Project owner |
| L4 | Sub-project |
| L5 | Member Helm |

### Examples

```
golden_tablet://Layer_1/Entity_LBCorp/Canon
golden_tablet://Layer_2/Entity_Upekrithen/Platform_Rules
golden_tablet://Layer_3/Entity_proj-abc123/Project_Rules
golden_tablet://Layer_5/Entity_helm-uuid/Canon#section-4
```

---

## Hash-of-Parent-Pointer

Each Layer L_k Eblet stores a `parent_anchor_hash` field:

```
parent_anchor_hash = SHA-256(parent_content + ":" + parent_uri)
```

This creates a tamper-evident chain from leaf to L1 root.

### Verification

```python
from discipline_wing.federation.layer_addressing import verify_parent_anchor_hash
ok = verify_parent_anchor_hash(parent_content, parent_uri, claimed_hash)
```

---

## Chain Walking

```python
from discipline_wing.federation.layer_addressing import build_chain_from_ledger
result = build_chain_from_ledger(leaf_uri, ledger_entries)
# result.valid: bool
# result.chain: [LayerAddress, ...] leaf → L1 root
```

---

## Forward Compatibility

- Unknown `tablet_class` values matching `[A-Za-z][A-Za-z0-9_]*` are accepted.
- New layers (L_n+1) are accepted without parser changes.

---

*Generated by KN045 / BP005. Hash algorithm: SHA-256 (matches Furnace stamps).*
"""


def persist_spec(path: Optional[Path] = None) -> Path:
    """
    Write the layer addressing scheme spec to disk.
    Default path: ~/.claude/state/federation/layer_addressing_scheme.md
    """
    target = path or _SPEC_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(LAYER_ADDRESSING_SPEC, encoding="utf-8")
    return target
