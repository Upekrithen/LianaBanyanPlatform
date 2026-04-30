#!/usr/bin/env python3
"""
augur_living_gate.py — Augur Living Gate (KN038 / #2314 Prov 16)

Replaces the Augur-Librarian's TTL-based freshness check with
Pheromone-substrate-event-driven freshness.

Gate Logic (Founder-ratified BP004 turn 14):
  gate_open  if (last_pheromone_write_ts <= last_consult_ts)
             OR ((now - last_consult_ts) < HARD_CEILING_SECONDS)
  gate_fire  otherwise (re-consult required)

Hard ceiling = 86400 s (24 hours) — safety net for Pheromone substrate outage.
Normal operation: substrate-event-driven; clock used only as graceful-degrade.

Per-agent state isolation (D.5):
  ~/.claude/state/augur_living_gate/<agent>_last_consult_ts.json
  Agents: bishop | knight | pawn

Stone Tablet Imperative (D.8):
  last_consult_ts.json is append-only (new line per session-update call).
  Last line wins for current state; full file = historical record.

Failure mode (D.4):
  Pheromone read fails → fall back to TTL (3600 s default) so no legitimate
  work is ever blocked due to a substrate query failure.

CheckBook (D.9):
  gate_open / gate_fire events are emitted as Liner Notes entries for
  Stenographer + Accountant reconciliation.

Filed: KN038 / BP004, 2026-04-30. The gate watches the substrate, not the clock.
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ── Constants (D.1) ────────────────────────────────────────────────────────────

HARD_CEILING_SECONDS: int = 86400          # 24 hours — graceful-degrade ceiling
TTL_FALLBACK_SECONDS: int = 3600           # 60 min — Brick Wall fallback if Pheromone unavailable
AGENT_NAMES = ("bishop", "knight", "pawn")

# ── Paths ───────────────────────────────────────────────────────────────────────

_STATE_ROOT = Path(os.path.expanduser("~/.claude/state/augur_living_gate"))
_LEGACY_TS_FILE = Path(os.path.expanduser("~/.claude/state/bishop_last_librarian_consult.ts"))

# Pheromone substrate reader (D.2)
_HERE = Path(__file__).parent
_REPO_ROOT = _HERE.parent
_PHEROMONE_READER_PATH = (
    _REPO_ROOT / "librarian-mcp" / "stitchpunks" / "pheromone_substrate" / "pheromone_reader.py"
)


# ── Pheromone import (lazy, Brick Wall) ────────────────────────────────────────

def _get_latest_pheromone_ts() -> Optional[float]:
    """
    Import pheromone_reader at call-time (lazy) and return latest write ts.
    Brick Wall: any failure returns None → caller activates TTL fallback.
    """
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "pheromone_reader", _PHEROMONE_READER_PATH
        )
        if spec is None or spec.loader is None:
            return None
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        return mod.get_latest_write_ts()  # type: ignore[attr-defined]
    except Exception:  # noqa: BLE001 — Brick Wall
        return None


# ── State file helpers ─────────────────────────────────────────────────────────

def _state_file(agent: str) -> Path:
    """Return path for <agent>_last_consult_ts.json."""
    return _STATE_ROOT / f"{agent}_last_consult_ts.json"


def _pheromone_cache_file() -> Path:
    """Return path for the per-gate-run Pheromone ts cache."""
    return _STATE_ROOT / "last_pheromone_write_ts.json"


def _ensure_state_root() -> None:
    _STATE_ROOT.mkdir(parents=True, exist_ok=True)


def read_last_consult_ts(agent: str = "bishop") -> Optional[float]:
    """
    Read the most-recent last_consult_ts for the given agent.
    Stone Tablet: last line of the JSONL wins.
    Falls back to legacy bishop ts file on first call (migration D.3).
    Returns None if no record exists.
    """
    _ensure_state_root()
    state_file = _state_file(agent)

    if state_file.exists():
        try:
            last_ts: Optional[float] = None
            for line in state_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    if "last_consult_ts" in obj:
                        last_ts = float(obj["last_consult_ts"])
                except (json.JSONDecodeError, ValueError):
                    pass
            if last_ts is not None:
                return last_ts
        except Exception:  # noqa: BLE001
            pass

    # Migration (D.3): bootstrap from legacy file on first use
    if agent == "bishop" and _LEGACY_TS_FILE.exists():
        try:
            val = int(_LEGACY_TS_FILE.read_text(encoding="utf-8").strip())
            # Write it into the new format (but don't block if write fails)
            _append_consult_ts(agent, float(val), migrated=True)
            return float(val)
        except Exception:  # noqa: BLE001
            pass

    return None


def _append_consult_ts(
    agent: str,
    ts: float,
    session_id: str = "",
    migrated: bool = False,
) -> None:
    """
    Append a new consult timestamp to the agent's Stone Tablet.
    Append-only: existing records are never modified.
    Brick Wall: any write failure is silently swallowed.
    """
    try:
        _ensure_state_root()
        record: dict[str, Any] = {
            "last_consult_ts": ts,
            "iso": datetime.fromtimestamp(ts, tz=timezone.utc).isoformat(),
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }
        if session_id:
            record["session_id"] = session_id
        if migrated:
            record["migrated_from_legacy"] = True

        with _state_file(agent).open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")
            fh.flush()
            os.fsync(fh.fileno())
    except Exception:  # noqa: BLE001 — Brick Wall
        pass


def record_consult(agent: str = "bishop", session_id: str = "") -> float:
    """
    Record a successful Librarian consult for the given agent.
    Call this immediately after brief_me / consult_scribes succeeds.
    Returns the recorded timestamp (Unix float).
    """
    ts = time.time()
    _append_consult_ts(agent, ts, session_id=session_id)
    return ts


def _read_pheromone_cache() -> Optional[float]:
    """Read the cached Pheromone write ts (from previous gate run)."""
    try:
        f = _pheromone_cache_file()
        if f.exists():
            obj = json.loads(f.read_text(encoding="utf-8"))
            return float(obj.get("last_pheromone_write_ts", 0)) or None
    except Exception:  # noqa: BLE001
        pass
    return None


def _write_pheromone_cache(ts: float) -> None:
    """Cache the latest Pheromone write ts (avoids repeated JSONL scans)."""
    try:
        _ensure_state_root()
        record = {
            "last_pheromone_write_ts": ts,
            "iso": datetime.fromtimestamp(ts, tz=timezone.utc).isoformat(),
            "cached_at": datetime.now(timezone.utc).isoformat(),
        }
        # Overwrite (this is a cache, not a Stone Tablet)
        _pheromone_cache_file().write_text(json.dumps(record), encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass


# ── Liner Notes / CheckBook (D.9) ─────────────────────────────────────────────

def _emit_liner_note(
    event: str,
    agent: str,
    last_consult_ts: Optional[float],
    last_pheromone_ts: Optional[float],
    age_s: float,
    reason: str,
) -> None:
    """
    Emit a Liner Notes entry for Stenographer / Accountant (D.9).
    Brick Wall: never blocks gate decision.
    """
    try:
        liner_notes_path = Path(os.path.expanduser(
            "~/.claude/state/augur_living_gate/liner_notes.jsonl"
        ))
        _ensure_state_root()
        record = {
            "event": event,       # "gate_open" | "gate_fire"
            "agent": agent,
            "last_consult_ts": last_consult_ts,
            "last_pheromone_write_ts": last_pheromone_ts,
            "age_since_consult_s": round(age_s, 1),
            "reason": reason,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
        with liner_notes_path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")
    except Exception:  # noqa: BLE001 — Brick Wall
        pass


# ── Core gate decision ─────────────────────────────────────────────────────────

def is_gate_open(agent: str = "bishop") -> bool:
    """
    Primary API. Returns True (gate_open = consult still fresh) or
    False (gate_fire = re-consult required).

    Algorithm (Founder-ratified BP004 turn 14):
      1. Read last_consult_ts for agent.
      2. If None → gate_fire (no consult on record).
      3. Read latest Pheromone write ts.
         a. If readable → substrate-event-driven decision:
            gate_open  if last_pheromone_ts <= last_consult_ts   (no new writes since consult)
            gate_open  if age_since_consult < HARD_CEILING_SECONDS  (emergency fallback)
            gate_fire  otherwise
         b. If unreadable (D.4 Brick Wall) → TTL fallback:
            gate_open  if age_since_consult < TTL_FALLBACK_SECONDS
            gate_fire  otherwise
    """
    now = time.time()
    last_consult = read_last_consult_ts(agent)

    if last_consult is None:
        _emit_liner_note(
            "gate_fire", agent, None, None, float("inf"),
            "no_consult_on_record"
        )
        return False

    age_s = now - last_consult

    # Attempt Pheromone substrate read
    pheromone_ts = _get_latest_pheromone_ts()

    if pheromone_ts is not None:
        # Update cache (convenience; not gate-critical)
        _write_pheromone_cache(pheromone_ts)

        # Primary substrate-event-driven check
        if pheromone_ts <= last_consult:
            # No new Pheromone writes since last consult — gate stays open
            _emit_liner_note(
                "gate_open", agent, last_consult, pheromone_ts, age_s,
                "no_pheromone_drift_since_consult"
            )
            return True

        # New Pheromone write found since consult — but check hard ceiling
        if age_s < HARD_CEILING_SECONDS:
            # Pheromone wrote something new; the ceiling hasn't expired yet.
            # Gate should FIRE because the substrate has new data since consult.
            _emit_liner_note(
                "gate_fire", agent, last_consult, pheromone_ts, age_s,
                "pheromone_write_since_consult"
            )
            return False

        # Both: new pheromone write AND past hard ceiling → definitely fire
        _emit_liner_note(
            "gate_fire", agent, last_consult, pheromone_ts, age_s,
            "pheromone_write_since_consult_and_hard_ceiling_exceeded"
        )
        return False

    # Pheromone unreadable — D.4 TTL fallback (Brick Wall)
    if age_s < TTL_FALLBACK_SECONDS:
        _emit_liner_note(
            "gate_open", agent, last_consult, None, age_s,
            "pheromone_unavailable_ttl_fallback"
        )
        return True

    _emit_liner_note(
        "gate_fire", agent, last_consult, None, age_s,
        "pheromone_unavailable_ttl_expired"
    )
    return False


def gate_status(agent: str = "bishop") -> dict[str, Any]:
    """
    Return a full status dict for debug / status-script use.
    Does NOT emit a Liner Notes entry (read-only diagnostic).
    """
    now = time.time()
    last_consult = read_last_consult_ts(agent)
    pheromone_ts = _get_latest_pheromone_ts()
    cached_pheromone = _read_pheromone_cache()

    age_s = (now - last_consult) if last_consult else None
    hard_ceiling_remaining = (
        max(0.0, HARD_CEILING_SECONDS - age_s) if age_s is not None else None
    )

    open_decision = is_gate_open(agent)

    return {
        "gate_state": "open" if open_decision else "fire",
        "agent": agent,
        "last_consult_ts": last_consult,
        "last_consult_iso": (
            datetime.fromtimestamp(last_consult, tz=timezone.utc).isoformat()
            if last_consult else None
        ),
        "age_since_consult_s": round(age_s, 1) if age_s is not None else None,
        "last_pheromone_write_ts": pheromone_ts,
        "last_pheromone_write_iso": (
            datetime.fromtimestamp(pheromone_ts, tz=timezone.utc).isoformat()
            if pheromone_ts else None
        ),
        "cached_pheromone_ts": cached_pheromone,
        "hard_ceiling_seconds": HARD_CEILING_SECONDS,
        "hard_ceiling_seconds_remaining": (
            round(hard_ceiling_remaining, 1) if hard_ceiling_remaining is not None else None
        ),
        "ttl_fallback_seconds": TTL_FALLBACK_SECONDS,
        "pheromone_readable": pheromone_ts is not None,
    }
