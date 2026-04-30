"""
Sandbox State — KN035 / A&A #2303 / Persistent-Bishop / Thanksgiving Dinner

Manifest schema + read/write API + Chronos signing for cross-session state.

The Persistent-Bishop sandbox externalizes Bishop state for cross-session
attachment by Knight sessions. Per D.1 storage decision:
  librarian-mcp/stitchpunks/persistent_bishop/sandbox_state/<beanpole_id>/

Sandbox manifest structure (D.2):
  {
    beanpole_id:                 str       — unique beanpole identifier
    opened_at:                   str       — ISO timestamp of beanpole open
    owner_session:               str       — session that opened the beanpole
    attached_sessions:           list[str] — all sessions that attached
    canonical_context_snapshot:  dict      — brief_me output at last open
    MEMORY_md_snapshot:          str       — MEMORY.md content at last open
    recent_canon_eblets:         list[str] — last N eblet IDs promoted
    last_updated:                str       — ISO timestamp
    chronos_signature:           dict      — Chronos-signed hash of body
  }

Foundation only (D.7): this bean ships SCHEMA + read/write + signing.
Multi-vendor + auto-fire deferred to BP004+ Knight K-prompts.

Toolsmith log: TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_SANDBOX_STATE_ROOT = _HERE / "sandbox_state"

SCHEMA_VERSION = "1.0"
TOOLSMITH_LOG = "TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(body: Dict[str, Any]) -> Dict[str, Any]:
    canonical = json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    ch_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {
        "chronicler_hash": ch_hash,
        "temporal_anchor": _iso_now(),
        "verify_method": "sha256(json.dumps(body_no_sig, sort_keys=True))",
        "toolsmith": TOOLSMITH_LOG,
    }


def _verify_chronos_sig(signed: Dict[str, Any]) -> bool:
    sig = signed.get("chronos_signature", {})
    stored = sig.get("chronicler_hash", "")
    if not stored:
        return False
    body = {k: v for k, v in signed.items() if k != "chronos_signature"}
    canonical = json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    computed = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return stored == computed


# ── Manifest helpers ──────────────────────────────────────────────────────────

def _manifest_path(beanpole_id: str) -> Path:
    return _SANDBOX_STATE_ROOT / beanpole_id / "manifest.json"


def create_manifest(
    beanpole_id: str,
    owner_session: str,
    canonical_context_snapshot: Optional[Dict[str, Any]] = None,
    memory_md_snapshot: str = "",
    recent_canon_eblets: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Create a new sandbox manifest for a beanpole.
    Writes to Stone Tablet (manifest.json). Returns signed manifest.
    """
    body: Dict[str, Any] = {
        "schema_version": SCHEMA_VERSION,
        "beanpole_id": beanpole_id,
        "opened_at": _iso_now(),
        "owner_session": owner_session,
        "attached_sessions": [],
        "canonical_context_snapshot": canonical_context_snapshot or {},
        "MEMORY_md_snapshot": memory_md_snapshot,
        "recent_canon_eblets": recent_canon_eblets or [],
        "last_updated": _iso_now(),
        "toolsmith": TOOLSMITH_LOG,
    }
    signed = {**body, "chronos_signature": _chronos_sign(body)}

    manifest_path = _manifest_path(beanpole_id)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(signed, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())

    return signed


def read_manifest(beanpole_id: str) -> Optional[Dict[str, Any]]:
    """
    Load a beanpole manifest from disk. Returns None if not found.
    Does NOT verify signature automatically — call verify_manifest() if needed.
    """
    path = _manifest_path(beanpole_id)
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def verify_manifest(beanpole_id: str) -> bool:
    """Verify Chronos signature on a stored manifest."""
    manifest = read_manifest(beanpole_id)
    if manifest is None:
        return False
    return _verify_chronos_sig(manifest)


def update_manifest(
    beanpole_id: str,
    delta: Dict[str, Any],
    session_id: str = "",
) -> Dict[str, Any]:
    """
    Apply a state delta to an existing manifest and re-sign.
    Records the session_id as an attached_session.
    Uses Stone Tablet (append) semantics: old manifest is archived, new one written.
    """
    current = read_manifest(beanpole_id)
    if current is None:
        raise FileNotFoundError(f"No manifest for beanpole {beanpole_id!r}")

    body = {k: v for k, v in current.items() if k != "chronos_signature"}

    # Apply delta
    for key, value in delta.items():
        if key == "attached_sessions" and isinstance(value, list):
            existing = set(body.get("attached_sessions", []))
            existing.update(value)
            body["attached_sessions"] = sorted(existing)
        else:
            body[key] = value

    if session_id and session_id not in body.get("attached_sessions", []):
        body.setdefault("attached_sessions", []).append(session_id)

    body["last_updated"] = _iso_now()

    signed = {**body, "chronos_signature": _chronos_sign(body)}

    # Archive old manifest, write new
    manifest_path = _manifest_path(beanpole_id)
    ts = _iso_now()[:19].replace(":", "-")
    ms = int(time.monotonic_ns() // 1_000_000) % 100_000
    archive_name = f".{ts}.{ms:05d}.bak.json"
    archive_path = manifest_path.with_suffix(archive_name)
    if manifest_path.exists():
        manifest_path.rename(archive_path)

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(signed, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())

    return signed


def list_beanpoles() -> List[str]:
    """List all beanpole IDs with existing manifests."""
    if not _SANDBOX_STATE_ROOT.exists():
        return []
    return [
        d.name for d in _SANDBOX_STATE_ROOT.iterdir()
        if d.is_dir() and (d / "manifest.json").exists()
    ]
