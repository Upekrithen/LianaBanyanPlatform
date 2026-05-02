"""
iron_tablet_attach.py — Python-native Iron Tablet Attach (KN090 / BP011)
=========================================================================
Connects to the KN089 Iron Tablet substrate for Shadow scribe-ids.

Implements the Iron Tablet protocol directly in Python (JSONL ledger + content-
addressed Eblet files), byte-for-byte compatible with the TypeScript iron_tablet
module (KN089 LANDED @ 8380701).

Protocol:
  Stone layer  — append-only JSONL ledger at <eblet_dir>/iron_tablet_ledger.jsonl
  Eblet layer  — content-addressed file at the eblet path (atomic rename)
  Concurrency  — Stone mutex via .lock file; Eblet hash-divergence detection

Write authority scopes per BRIDLE v11:
    canonical-eblet write     — OK (primary Shadow right)
    cross-org Iron Tablet     — OK (cross-scribe ledger sharing)
    cathedral-export          — NOT (initially; elevated post KN091 ratification)

Subscribes to ConcurrencyConflict events relevant to this scribe-id's eblet roots.
"""
from __future__ import annotations

import hashlib
import json
import os
import platform
import tempfile
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# ─── Paths ────────────────────────────────────────────────────────────────────

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
LIBRARIAN_MCP = WORKSPACE_ROOT / "librarian-mcp"
STITCHPUNKS_DIR = LIBRARIAN_MCP / "stitchpunks"
EBLET_CANON_ROOT = Path.home() / ".claude" / "state" / "eblets"

LEDGER_FILENAME = "iron_tablet_ledger.jsonl"
LOCK_FILENAME = ".iron_tablet.lock"
LOCK_TIMEOUT_S = 10.0


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class ProvenanceReceipt:
    scribe_id: str
    eblet_path: str
    hash: str
    sequence: int
    ts: str
    session: str
    decision_id: Optional[str] = None


@dataclass
class ConcurrencyConflict:
    type: str = "hash_divergence"
    caller_hash: str = ""
    existing_hash: str = ""
    scribe_id: str = ""
    ts: str = ""


@dataclass
class WriteResult:
    stone_receipt: ProvenanceReceipt
    eblet_hash: str
    conflict: Optional[ConcurrencyConflict] = None


@dataclass
class ReadResult:
    content: str
    eblet_hash: str
    stone_provenance: list[ProvenanceReceipt] = field(default_factory=list)


# ─── Write-authority scopes ────────────────────────────────────────────────────

class WriteAuthority:
    """Per-Shadow write-authority scope (BRIDLE v11)."""

    CANONICAL_EBLET = "canonical_eblet"       # OK
    CROSS_ORG_IRON_TABLET = "cross_org_iron"  # OK
    CATHEDRAL_EXPORT = "cathedral_export"     # NOT initially

    _allowed: frozenset = frozenset([CANONICAL_EBLET, CROSS_ORG_IRON_TABLET])
    _denied: frozenset = frozenset([CATHEDRAL_EXPORT])

    @classmethod
    def is_allowed(cls, scope: str) -> bool:
        return scope in cls._allowed

    @classmethod
    def check(cls, scope: str) -> None:
        if scope in cls._denied:
            raise PermissionError(
                f"Shadow write authority: scope '{scope}' is NOT permitted at KN090 level. "
                f"Elevated permission required (post KN091 ratification)."
            )
        if not cls.is_allowed(scope):
            raise PermissionError(f"Unknown scope '{scope}'.")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def _expand_path(path: str | Path) -> Path:
    return Path(os.path.expanduser(str(path))).resolve()


def _ledger_path(eblet_path: Path) -> Path:
    return eblet_path.parent / LEDGER_FILENAME


def _lock_path(eblet_path: Path) -> Path:
    return eblet_path.parent / LOCK_FILENAME


def _read_ledger(ledger: Path) -> list[dict]:
    if not ledger.exists():
        return []
    entries = []
    for line in ledger.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries


def _next_sequence(entries: list[dict], eblet_path_str: str) -> int:
    relevant = [e for e in entries if e.get("ebletPath") == eblet_path_str]
    return len(relevant) + 1


# ─── Lock (filename-based, cross-platform) ────────────────────────────────────

def _try_acquire_lock(lock: Path, timeout_s: float = LOCK_TIMEOUT_S) -> bool:
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        try:
            # O_CREAT | O_EXCL — atomic on all platforms including Windows
            fd = os.open(str(lock), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            return True
        except FileExistsError:
            time.sleep(0.05)
        except OSError:
            return False
    return False


def _release_lock(lock: Path) -> None:
    try:
        if lock.exists():
            lock.unlink()
    except OSError:
        pass


# ─── Core write ───────────────────────────────────────────────────────────────

def _atomic_write_eblet(eblet_path: Path, content: str) -> str:
    """Write content to eblet_path atomically. Returns SHA-256 of content."""
    eblet_path.parent.mkdir(parents=True, exist_ok=True)
    content_hash = _sha256(content)
    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=eblet_path.parent,
        suffix=".tmp",
        delete=False,
    ) as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)
    try:
        # On Windows, rename over existing fails — unlink first
        if eblet_path.exists():
            eblet_path.unlink()
        tmp_path.rename(eblet_path)
    except OSError:
        # Final fallback: direct write
        eblet_path.write_text(content, encoding="utf-8")
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass
    return content_hash


def _append_ledger_entry(ledger: Path, entry: dict) -> None:
    """Append one JSONL entry to the ledger, fdatasync for durability."""
    ledger.parent.mkdir(parents=True, exist_ok=True)
    with open(str(ledger), "a", encoding="utf-8", buffering=1) as fh:
        fh.write(json.dumps(entry) + "\n")
        fh.flush()
        try:
            os.fdatasync(fh.fileno())
        except (AttributeError, OSError):
            pass  # Windows / unavailable — best effort


# ─── Public API ───────────────────────────────────────────────────────────────

class IronTabletAttach:
    """
    Per-Shadow Iron Tablet attachment point.

    Implements the same protocol as KN089 TypeScript iron_tablet module, so both
    Python Shadows and TypeScript consumers can share the same JSONL ledger.

    Usage:
        attach = IronTabletAttach(scribe_id="R11_shadow_alpha", session="KN090")
        result = attach.write(eblet_path, content)
        data = attach.read(eblet_path)
    """

    def __init__(self, scribe_id: str, session: str = "KN090"):
        self.scribe_id = scribe_id
        self.session = session
        self._subscribed_conflict_paths: list[str] = []

    def subscribe_conflict_events(self, eblet_paths: list[str]) -> None:
        """Subscribe to ConcurrencyConflict events for the given eblet paths."""
        self._subscribed_conflict_paths = list(eblet_paths)

    def write(
        self,
        eblet_path: str | Path,
        content: str,
        decision_id: Optional[str] = None,
        scope: str = WriteAuthority.CANONICAL_EBLET,
    ) -> WriteResult:
        """
        Write content to an Iron Tablet atomically (Stone + Eblet layers).

        Enforces write-authority scope before writing. Returns a WriteResult
        with ProvenanceReceipt and optional ConcurrencyConflict.
        """
        WriteAuthority.check(scope)

        eblet_abs = _expand_path(eblet_path)
        ledger = _ledger_path(eblet_abs)
        lock = _lock_path(eblet_abs)
        ts = datetime.now(timezone.utc).isoformat()

        # Observe pre-write Eblet hash (for conflict detection)
        caller_hash = ""
        if eblet_abs.exists():
            caller_hash = _sha256(eblet_abs.read_text(encoding="utf-8"))

        acquired = _try_acquire_lock(lock)
        conflict: Optional[ConcurrencyConflict] = None

        try:
            # Re-read hash after acquiring lock (concurrent writer may have changed it)
            existing_hash = ""
            if eblet_abs.exists():
                existing_hash = _sha256(eblet_abs.read_text(encoding="utf-8"))

            if caller_hash and existing_hash and caller_hash != existing_hash:
                conflict = ConcurrencyConflict(
                    type="hash_divergence",
                    caller_hash=caller_hash,
                    existing_hash=existing_hash,
                    scribe_id=self.scribe_id,
                    ts=ts,
                )

            # Write Eblet (content-addressed; atomic rename)
            eblet_hash = _atomic_write_eblet(eblet_abs, content)

            # Read current ledger to determine sequence
            entries = _read_ledger(ledger)
            sequence = _next_sequence(entries, str(eblet_abs))

            ledger_entry: dict = {
                "ts": ts,
                "scribeId": self.scribe_id,
                "ebletPath": str(eblet_abs),
                "hash": eblet_hash,
                "sequence": sequence,
                "session": self.session,
            }
            if decision_id:
                ledger_entry["decisionId"] = decision_id
            if conflict:
                ledger_entry["conflict"] = True

            _append_ledger_entry(ledger, ledger_entry)

        finally:
            if acquired:
                _release_lock(lock)

        receipt = ProvenanceReceipt(
            scribe_id=self.scribe_id,
            eblet_path=str(eblet_abs),
            hash=eblet_hash,
            sequence=sequence,
            ts=ts,
            session=self.session,
            decision_id=decision_id,
        )
        return WriteResult(stone_receipt=receipt, eblet_hash=eblet_hash, conflict=conflict)

    def read(self, eblet_path: str | Path) -> Optional[ReadResult]:
        """
        Read an Iron Tablet: current Eblet content + full Stone provenance chain.

        Returns None if the Eblet file does not exist (uninitialized / deleted).
        The Stone provenance chain is always returned if entries exist.
        """
        eblet_abs = _expand_path(eblet_path)
        ledger = _ledger_path(eblet_abs)
        entries = _read_ledger(ledger)

        provenance = [
            ProvenanceReceipt(
                scribe_id=e["scribeId"],
                eblet_path=e["ebletPath"],
                hash=e["hash"],
                sequence=e["sequence"],
                ts=e["ts"],
                session=e["session"],
                decision_id=e.get("decisionId"),
            )
            for e in entries
            if e.get("ebletPath") == str(eblet_abs)
        ]

        if not eblet_abs.exists():
            return None

        content = eblet_abs.read_text(encoding="utf-8")
        eblet_hash = _sha256(content)
        return ReadResult(content=content, eblet_hash=eblet_hash, stone_provenance=provenance)

    def list_directory(self, directory: str | Path) -> list[str]:
        """
        List eblet paths that have Stone Tablet ledger entries in a given directory.
        Compatible with KN089 ironTabletList().
        """
        dir_abs = _expand_path(directory)
        ledger = dir_abs / LEDGER_FILENAME
        entries = _read_ledger(ledger)
        seen: set[str] = set()
        for e in entries:
            seen.add(e.get("ebletPath", ""))
        return [p for p in seen if p]

    def provenance_chain(self, eblet_path: str | Path) -> list[ProvenanceReceipt]:
        """Return the Stone Tablet provenance chain (even if Eblet file is gone)."""
        eblet_abs = _expand_path(eblet_path)
        ledger = _ledger_path(eblet_abs)
        entries = _read_ledger(ledger)
        return [
            ProvenanceReceipt(
                scribe_id=e["scribeId"],
                eblet_path=e["ebletPath"],
                hash=e["hash"],
                sequence=e["sequence"],
                ts=e["ts"],
                session=e["session"],
                decision_id=e.get("decisionId"),
            )
            for e in entries
            if e.get("ebletPath") == str(eblet_abs)
        ]
