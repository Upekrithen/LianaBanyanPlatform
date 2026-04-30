"""
Wrasse Registry Writer — K550/B133

Implements the Detective→Wrasse live-update path (Phase E.2 of Wrasse Scribe MVP).
Architecture decision D.1 = α: direct write from Detective on resolution success.

Provides:
  append_if_new(trigger_pattern, trigger_class, canonical_resolution, source_session)
    → {"action": "appended"|"bumped"|"unchanged", "trigger_id": "W-<NNN>"}

  bump_verification(trigger_id, source_session)
    → {"action": "bumped", "trigger_id": str}

Stone Tablet Imperative: append-only writes via line-buffered open in 'a' mode + fsync.
NEVER edit existing entries in-place. Bump verification_count via supersedes-record append.

Locking: fcntl on Linux/macOS, msvcrt on Windows, filename-based fallback.
Brick Wall: lock acquisition failure logs and skips; NEVER blocks Detective's primary work.

Filed: K550/B133, 2026-04-29
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

REGISTRY_PATH = Path(__file__).parent / "wrasse_registry.jsonl"

# ─── Trigger-class extraction regexes ────────────────────────────────────────

_K_PREFIX_RX = re.compile(r"\bK(\d+)\b")
_TS_PREFIX_RX = re.compile(r"\bTS-(\d+)\b")
_CALL_SIGN_RX = re.compile(r"v-[\w-]+(?:-K\d+)?")
_FILE_PATH_RX = re.compile(r"(?:librarian-mcp|platform|BISHOP_DROPZONE|stitchpunks)/[\w./\-]+")

_VOCABULARY_TERMS = [
    "Cathedral Effect",
    "Pheromone Substrate",
    "Stone Tablet Imperative",
    "BRIDLE",
    "Brick Wall Discipline",
    "Fire Control",
    "Knowledge Pump",
    "Conductor's Baton",
    "Wrasse Scribe",
    "Glass Door",
    "Tuner",
    "Tagline V3",
    "Cooperative Defensive Patent Pledge",
    "FlutterBy",
    "Synaptic Relay",
    "brief_me",
    "consult_scribes",
    "detective_investigate",
    "moneypenny_debrief",
    "npm run rebuild",
    "canonical_values.yaml",
]


def _classify_trigger(trigger_pattern: str) -> str:
    """Infer trigger_class from trigger_pattern if not provided."""
    if _K_PREFIX_RX.match(trigger_pattern.strip()):
        return "k_prefix"
    if _TS_PREFIX_RX.match(trigger_pattern.strip()):
        return "ts_prefix"
    if _CALL_SIGN_RX.match(trigger_pattern.strip()):
        return "call_sign"
    # eblet_path: paths containing state/eblets/ or ending in .eblet.md (KN042)
    if "state/eblets/" in trigger_pattern or trigger_pattern.endswith(".eblet.md"):
        return "eblet_path"
    if "/" in trigger_pattern or trigger_pattern.endswith(".py") or trigger_pattern.endswith(".ts"):
        return "file_path"
    if re.match(r"^\d{1,4}$", trigger_pattern.strip()):
        return "canonical_number"
    return "vocabulary"


def _build_trigger_regex(trigger_pattern: str, trigger_class: str) -> str:
    """Construct a safe trigger_regex from pattern and class."""
    escaped = re.escape(trigger_pattern)
    if trigger_class == "k_prefix":
        m = _K_PREFIX_RX.search(trigger_pattern)
        if m:
            return rf"\bK{m.group(1)}\b"
    if trigger_class == "ts_prefix":
        m = _TS_PREFIX_RX.search(trigger_pattern)
        if m:
            return rf"\bTS-{m.group(1)}\b"
    if trigger_class == "call_sign":
        # Match the tag without the trailing -K<NNN> to be robust
        base = re.sub(r"-K\d+$", "", trigger_pattern.strip())
        return re.escape(base)
    # Default: word-boundary match
    return rf"\b{escaped}\b"


def _load_existing_patterns(path: Path = REGISTRY_PATH) -> dict[str, str]:
    """Return {trigger_pattern -> trigger_id} for all non-superseded entries."""
    patterns: dict[str, str] = {}
    if not path.exists():
        return patterns
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            if obj.get("type") in ("header", "backfill_report"):
                continue
            if obj.get("record_type") == "supersedes":
                continue
            tp = obj.get("trigger_pattern", "")
            tid = obj.get("trigger_id", "")
            if tp and tid:
                patterns[tp.lower().strip()] = tid
    return patterns


def _next_trigger_id(path: Path = REGISTRY_PATH) -> str:
    """Return next W-NNN id by scanning existing registry."""
    max_n = 0
    if not path.exists():
        return "W-001"
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            tid = obj.get("trigger_id", "")
            m = re.match(r"W-(\d+)", tid)
            if m:
                n = int(m.group(1))
                if n > max_n:
                    max_n = n
    return f"W-{max_n + 1:03d}"


# ─── Cross-platform advisory lock ────────────────────────────────────────────

def _acquire_lock(lock_path: Path, timeout_s: float = 5.0) -> bool:
    """Acquire a filename-based advisory lock. Returns True on success."""
    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        try:
            # Exclusive create — atomic on POSIX; best-effort on Windows
            fd = os.open(str(lock_path), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            return True
        except FileExistsError:
            time.sleep(0.05)
        except OSError as e:
            logger.warning("Wrasse lock acquire error: %s — skipping write", e)
            return False
    logger.warning("Wrasse lock timeout after %.1fs — skipping write", timeout_s)
    return False


def _release_lock(lock_path: Path) -> None:
    try:
        lock_path.unlink(missing_ok=True)
    except OSError as e:
        logger.debug("Wrasse lock release error: %s", e)


def _append_line(path: Path, record: dict[str, Any]) -> None:
    """Append a JSONL record to registry. Stone Tablet: fsync after write."""
    line = json.dumps(record, ensure_ascii=False) + "\n"
    with path.open("a", encoding="utf-8", buffering=1) as fh:
        fh.write(line)
        fh.flush()
        os.fsync(fh.fileno())


# ─── Public API ──────────────────────────────────────────────────────────────

def append_if_new(
    trigger_pattern: str,
    trigger_class: str | None,
    canonical_resolution: str,
    source_session: str,
    path: Path = REGISTRY_PATH,
) -> dict[str, str]:
    """
    Append a new Wrasse registry entry if trigger_pattern is novel.
    If already present, bump verification_count via supersedes-record.

    Returns {"action": "appended"|"bumped"|"unchanged", "trigger_id": str}

    Brick Wall: lock failure logs and skips; never raises or blocks caller.
    """
    trigger_pattern = trigger_pattern.strip()
    if not trigger_pattern or not canonical_resolution:
        return {"action": "unchanged", "trigger_id": ""}

    inferred_class = trigger_class or _classify_trigger(trigger_pattern)
    lock_path = path.parent / ".wrasse_registry.lock"

    try:
        existing = _load_existing_patterns(path)
        key = trigger_pattern.lower()

        if key in existing:
            existing_tid = existing[key]
            # Bump: append supersedes-record (Stone Tablet — never in-place edit)
            locked = _acquire_lock(lock_path)
            if not locked:
                return {"action": "unchanged", "trigger_id": existing_tid}
            try:
                record = {
                    "record_type": "supersedes",
                    "trigger_id": existing_tid,
                    "trigger_pattern": trigger_pattern,
                    "verification_count_bump": 1,
                    "bumped_at": datetime.now(timezone.utc).isoformat(),
                    "source_session": source_session,
                }
                _append_line(path, record)
                return {"action": "bumped", "trigger_id": existing_tid}
            finally:
                _release_lock(lock_path)

        # Novel trigger — append new entry
        locked = _acquire_lock(lock_path)
        if not locked:
            return {"action": "unchanged", "trigger_id": ""}
        try:
            trigger_id = _next_trigger_id(path)
            trigger_regex = _build_trigger_regex(trigger_pattern, inferred_class)
            record: dict[str, Any] = {
                "trigger_id": trigger_id,
                "trigger_class": inferred_class,
                "trigger_pattern": trigger_pattern,
                "trigger_regex": trigger_regex,
                "canonical_resolution": canonical_resolution,
                "last_verified_ts": datetime.now(timezone.utc).isoformat(),
                "verification_count": 1,
                "source_session": source_session,
                "scope": "public",
            }
            _append_line(path, record)
            return {"action": "appended", "trigger_id": trigger_id}
        finally:
            _release_lock(lock_path)

    except Exception as e:  # noqa: BLE001
        logger.error("Wrasse append_if_new failed: %s — skipping", e)
        return {"action": "unchanged", "trigger_id": ""}


def bump_verification(
    trigger_id: str,
    source_session: str,
    path: Path = REGISTRY_PATH,
) -> dict[str, str]:
    """
    Append a verification-bump supersedes-record for an existing trigger_id.
    Stone Tablet: append-only, never modifies existing entries.
    """
    lock_path = path.parent / ".wrasse_registry.lock"
    locked = _acquire_lock(lock_path)
    if not locked:
        return {"action": "unchanged", "trigger_id": trigger_id}
    try:
        record = {
            "record_type": "supersedes",
            "trigger_id": trigger_id,
            "verification_count_bump": 1,
            "bumped_at": datetime.now(timezone.utc).isoformat(),
            "source_session": source_session,
        }
        _append_line(path, record)
        return {"action": "bumped", "trigger_id": trigger_id}
    except Exception as e:  # noqa: BLE001
        logger.error("Wrasse bump_verification failed: %s", e)
        return {"action": "unchanged", "trigger_id": trigger_id}
    finally:
        _release_lock(lock_path)


def extract_triggers_from_claim(claim: str) -> list[tuple[str, str]]:
    """
    Extract (trigger_pattern, trigger_class) tuples from a free-form claim string.
    Used by backfill and Detective integration.
    Returns list of (pattern, class) pairs, deduplicated.
    """
    found: list[tuple[str, str]] = []
    seen: set[str] = set()

    def add(p: str, c: str) -> None:
        k = p.lower()
        if k not in seen:
            seen.add(k)
            found.append((p, c))

    for m in _K_PREFIX_RX.finditer(claim):
        add(m.group(0), "k_prefix")
    for m in _TS_PREFIX_RX.finditer(claim):
        add(m.group(0), "ts_prefix")
    for m in _CALL_SIGN_RX.finditer(claim):
        add(m.group(0), "call_sign")
    for term in _VOCABULARY_TERMS:
        if term.lower() in claim.lower():
            add(term, "vocabulary")
    for m in _FILE_PATH_RX.finditer(claim):
        add(m.group(0), "file_path")

    return found


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Wrasse Registry Writer CLI")
    parser.add_argument("--append", nargs=3,
                        metavar=("TRIGGER_PATTERN", "TRIGGER_CLASS", "CANONICAL_RESOLUTION"),
                        help="Append a new entry")
    parser.add_argument("--session", default="manual", help="Source session tag")
    parser.add_argument("--bump", metavar="TRIGGER_ID", help="Bump verification for trigger_id")
    args = parser.parse_args()

    if args.append:
        result = append_if_new(args.append[0], args.append[1], args.append[2], args.session)
        print(json.dumps(result, indent=2))
    elif args.bump:
        result = bump_verification(args.bump, args.session)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
