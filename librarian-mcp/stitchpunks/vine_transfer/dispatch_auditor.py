"""
Component 8 — Dispatch Readiness Auditor (KN023)

Scans Bishop-2 / ShadowBishop / Pawn dropzones for paste-ready dispatches.
"""

from __future__ import annotations

from pathlib import Path

_DROPZONE_BASE = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/BISHOP_DROPZONE"
)
_PAWN_DROPZONE = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/PAWN_DROPZONE"
)

# Subpaths within BISHOP_DROPZONE that contain dispatch-ready items
_DISPATCH_SUBDIRS = {
    "Bishop-2": "02_PawnPrompts",
    "ShadowBishop": "05_ShadowBishopQueue",
    "Letters": "04_LetterQueue",
    "Handoffs": "03_BishopHandoffs",
}


def _count_paste_ready(directory: Path, pattern: str = "*.md") -> list[dict]:
    """Return list of paste-ready files in a directory."""
    items = []
    if not directory.exists():
        return items
    for f in sorted(directory.glob(pattern)):
        if f.name.startswith("_") or f.name.startswith("."):
            continue
        items.append({
            "name": f.name,
            "path": str(f),
            "size_bytes": f.stat().st_size,
        })
    return items


def audit_dispatches(
    dropzone_base: Path = _DROPZONE_BASE,
    pawn_dropzone: Path = _PAWN_DROPZONE,
) -> dict:
    """
    Scan all dispatch queues for paste-ready items.

    Returns {
        by_queue, total_dispatches, formatted_summary
    }
    """
    by_queue = {}

    for queue_name, subdir in _DISPATCH_SUBDIRS.items():
        queue_path = dropzone_base / subdir
        items = _count_paste_ready(queue_path)
        by_queue[queue_name] = {
            "path": str(queue_path),
            "count": len(items),
            "items": items[:5],  # Top 5 per queue
        }

    # Pawn dropzone
    pawn_items = _count_paste_ready(pawn_dropzone)
    by_queue["Pawn"] = {
        "path": str(pawn_dropzone),
        "count": len(pawn_items),
        "items": pawn_items[:5],
    }

    total = sum(q["count"] for q in by_queue.values())

    lines = ["**Dispatch Readiness Audit**"]
    for qname, qdata in by_queue.items():
        marker = "📬" if qdata["count"] > 0 else "  "
        lines.append(f"  {marker} {qname}: {qdata['count']} item(s)")
        for item in qdata["items"][:2]:
            lines.append(f"      - {item['name'][:60]}")
    lines.append(f"  TOTAL: {total} paste-ready dispatches")

    return {
        "by_queue": by_queue,
        "total_dispatches": total,
        "formatted_summary": "\n".join(lines),
    }
