"""
Eblet Router — KN001 / B134

Core routing module for the Eblet (Electronic Tablet) system.
Determines whether a file path is an Eblet scratch path, whether a canonical
path is Eblet-scoped, and maps between Eblet ↔ canonical destinations.

Architecture:
  - Eblet scratch root: ~/.claude/state/eblets/<session-id>/<artifact>.eblet.md
  - Canonical destination stored in sidecar: <artifact>.eblet.meta.json
  - Eblet scope config: ~/.claude/state/eblet_config.json

KN001 / B134 — Founder-ratified D.1 Ⓐ / D.2 Ⓐ / D.3 Ⓑ
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Optional

EBLET_CONFIG_PATH = Path(os.path.expanduser("~/.claude/state/eblet_config.json"))
EBLET_ROOT_DEFAULT = Path(os.path.expanduser("~/.claude/state/eblets"))


def load_eblet_config() -> dict:
    """Load Eblet scope configuration. Returns defaults if file missing."""
    try:
        return json.loads(EBLET_CONFIG_PATH.read_text(encoding="utf-8-sig"))
    except Exception:
        return _default_config()


def _default_config() -> dict:
    return {
        "eblet_root": str(EBLET_ROOT_DEFAULT),
        "eblet_scoped_canonical_patterns": [
            "memory/",
            "BISHOP_DROPZONE/",
            "librarian-mcp/stitchpunks/",
            "CONTEXT_MANAGEMENT/",
        ],
        "production_protected_patterns": [
            "platform/src/",
            "platform/supabase/",
            "Cephas/cephas-hugo/content/",
            "USPTO",
        ],
        "auto_cleanup_days": 7,
    }


def _normalize(path: str) -> str:
    return path.replace("\\", "/")


def is_eblet_path(path: str) -> bool:
    """True if this path is an Eblet scratch file (lives under the Eblet root)."""
    n = _normalize(path)
    cfg = load_eblet_config()
    eblet_root = _normalize(cfg.get("eblet_root", str(EBLET_ROOT_DEFAULT)))
    # Match by root prefix OR .eblet.md suffix
    return n.startswith(eblet_root) or n.endswith(".eblet.md")


def is_eblet_scoped_canonical_path(path: str) -> bool:
    """True if this canonical path should be routed through Eblet (D.3 Ⓑ)."""
    n = _normalize(path)
    cfg = load_eblet_config()
    patterns = cfg.get("eblet_scoped_canonical_patterns", [])
    return any(p in n for p in patterns)


def is_production_protected_path(path: str) -> bool:
    """True if this path keeps PreToolUse-blocking Augur (never goes through Eblet)."""
    n = _normalize(path)
    cfg = load_eblet_config()
    patterns = cfg.get("production_protected_patterns", [])
    return any(p in n for p in patterns)


def get_eblet_root() -> Path:
    """Return the Eblet root directory path object."""
    cfg = load_eblet_config()
    return Path(cfg.get("eblet_root", str(EBLET_ROOT_DEFAULT)))


def get_eblet_path(canonical_path: str, session_id: str) -> Path:
    """
    Compute the Eblet scratch path for a given canonical path + session.

    canonical_path: e.g. ~/.claude/memory/foo.md
    session_id:     e.g. B134
    returns:        ~/.claude/state/eblets/B134/foo.eblet.md
    """
    eblet_root = get_eblet_root()
    session_dir = eblet_root / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    canonical = Path(canonical_path)
    stem = canonical.stem
    suffix = canonical.suffix or ".md"
    eblet_name = f"{stem}.eblet{suffix}"
    return session_dir / eblet_name


def write_eblet_meta(eblet_path: Path, canonical_path: str, session_id: str) -> None:
    """Write metadata sidecar alongside the Eblet file."""
    meta = {
        "canonical_path": str(canonical_path),
        "session_id": session_id,
        "created_ts": int(time.time()),
        "created_iso": _iso_now(),
    }
    meta_path = Path(str(eblet_path).replace(".eblet.md", ".meta.json"))
    meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")


def read_eblet_meta(eblet_path: Path) -> Optional[dict]:
    """Read metadata sidecar for an Eblet file. Returns None if not found."""
    meta_path = Path(str(eblet_path).replace(".eblet.md", ".meta.json"))
    if not meta_path.exists():
        # Try standard .meta.json suffix swap
        meta_path = eblet_path.with_suffix("").with_suffix(".meta.json")
    try:
        return json.loads(meta_path.read_text(encoding="utf-8"))
    except Exception:
        return None


def write_augur_findings(eblet_path: Path, findings: str, decision: str) -> Path:
    """
    Write Augur findings to a .augur-findings.md sidecar alongside the Eblet.
    Used by both the PostToolUse informational pass and the promotion blocking pass.
    """
    findings_path = Path(str(eblet_path).replace(".eblet.md", ".augur-findings.md"))
    content = f"""# Augur Findings — {eblet_path.name}
**Decision:** {decision}
**Generated:** {_iso_now()}

---

{findings}
"""
    findings_path.write_text(content, encoding="utf-8")
    return findings_path


def list_pending_eblets(session_id: Optional[str] = None) -> list[dict]:
    """
    List all pending Eblet files (not yet promoted).

    Returns list of dicts with: eblet_path, canonical_path, session_id, created_iso, age_days
    """
    eblet_root = get_eblet_root()
    if not eblet_root.exists():
        return []

    results = []
    now = time.time()

    if session_id:
        search_dirs = [eblet_root / session_id]
    else:
        search_dirs = [d for d in eblet_root.iterdir() if d.is_dir()]

    for session_dir in search_dirs:
        if not session_dir.exists():
            continue
        for f in session_dir.iterdir():
            if not f.name.endswith(".eblet.md"):
                continue
            meta = read_eblet_meta(f)
            canonical = meta.get("canonical_path", "unknown") if meta else "unknown"
            created_ts = meta.get("created_ts", 0) if meta else 0
            age_days = (now - created_ts) / 86400 if created_ts else 0
            results.append({
                "eblet_path": str(f),
                "canonical_path": canonical,
                "session_id": session_dir.name,
                "created_iso": meta.get("created_iso", "unknown") if meta else "unknown",
                "age_days": round(age_days, 1),
            })

    results.sort(key=lambda x: x["age_days"])
    return results


def cleanup_stale_eblets(dry_run: bool = False) -> list[str]:
    """
    Delete Eblet files older than auto_cleanup_days that haven't been promoted.
    Returns list of paths removed (or that would be removed in dry_run mode).
    """
    cfg = load_eblet_config()
    max_days = cfg.get("auto_cleanup_days", 7)
    removed = []

    for entry in list_pending_eblets():
        if entry["age_days"] >= max_days:
            p = Path(entry["eblet_path"])
            if not dry_run:
                p.unlink(missing_ok=True)
                # Also remove sidecar files
                for ext in [".meta.json", ".augur-findings.md"]:
                    sidecar = Path(str(p).rsplit(".eblet.md", 1)[0] + ext)
                    sidecar.unlink(missing_ok=True)
            removed.append(str(p))

    return removed


def _iso_now() -> str:
    import datetime
    return datetime.datetime.utcnow().isoformat() + "Z"
