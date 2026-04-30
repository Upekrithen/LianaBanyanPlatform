"""
Component 7 — Knight Queue Auditor (KN023)

Scans BISHOP_DROPZONE/01_KnightPrompts/ and Eblet directories for
paste-ready beans and bundles. Reports total queue depth.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

_KNIGHT_PROMPTS_DIR = Path(
    "C:/Users/Administrator/Documents/LianaBanyanPlatform/BISHOP_DROPZONE/01_KnightPrompts"
)
_EBLETS_ROOT = Path.home() / ".claude" / "state" / "eblets"


def audit_knight_prompts(
    prompts_dir: Path = _KNIGHT_PROMPTS_DIR,
) -> list[dict]:
    """Scan KnightPrompts dropzone for paste-ready beans."""
    items = []
    if not prompts_dir.exists():
        return items
    for f in sorted(prompts_dir.glob("PROMPT_KNIGHT_KN*.md")):
        items.append({
            "type": "knight_prompt",
            "name": f.name,
            "path": str(f),
            "size_bytes": f.stat().st_size,
        })
    return items


def audit_eblet_beans(
    eblet_root: Path = _EBLETS_ROOT,
    session_filter: Optional[str] = None,
) -> list[dict]:
    """Scan Eblet directories for pending bean Eblets."""
    items = []
    if not eblet_root.exists():
        return items

    search_dirs = (
        [eblet_root / session_filter]
        if session_filter
        else [d for d in eblet_root.iterdir() if d.is_dir()]
    )

    for session_dir in search_dirs:
        if not session_dir.exists():
            continue
        for f in sorted(session_dir.glob("PROMPT_KNIGHT_KN*.eblet.md")):
            items.append({
                "type": "eblet_bean",
                "name": f.name,
                "session": session_dir.name,
                "path": str(f),
                "size_bytes": f.stat().st_size,
            })
        # Also check for BeanPod bundles
        for f in sorted(session_dir.glob("*.eblet.md")):
            if "BEANPOD" in f.name.upper() or "BUNDLE" in f.name.upper():
                items.append({
                    "type": "eblet_bundle",
                    "name": f.name,
                    "session": session_dir.name,
                    "path": str(f),
                    "size_bytes": f.stat().st_size,
                })
    return items


def audit_knight_queue(
    prompts_dir: Path = _KNIGHT_PROMPTS_DIR,
    eblet_root: Path = _EBLETS_ROOT,
) -> dict:
    """
    Full Knight queue audit.

    Returns {
        prompt_count, eblet_bean_count, eblet_bundle_count,
        total_depth, items, formatted_summary
    }
    """
    prompts = audit_knight_prompts(prompts_dir)
    eblet_items = audit_eblet_beans(eblet_root)
    eblet_beans = [e for e in eblet_items if e["type"] == "eblet_bean"]
    eblet_bundles = [e for e in eblet_items if e["type"] == "eblet_bundle"]

    total_depth = len(prompts) + len(eblet_beans) + len(eblet_bundles)

    all_items = prompts + eblet_items
    lines = [f"**Knight Queue Audit**"]
    lines.append(f"  Dropzone prompts: {len(prompts)}")
    lines.append(f"  Pending bean Eblets: {len(eblet_beans)}")
    lines.append(f"  Pending bundle Eblets: {len(eblet_bundles)}")
    lines.append(f"  TOTAL QUEUE DEPTH: {total_depth}")
    if prompts:
        lines.append("  Next in dropzone:")
        for p in prompts[:3]:
            lines.append(f"    - {p['name']}")
    if eblet_bundles:
        lines.append("  Bundle Eblets (high priority):")
        for b in eblet_bundles[:3]:
            lines.append(f"    - [{b['session']}] {b['name']}")

    return {
        "prompt_count": len(prompts),
        "eblet_bean_count": len(eblet_beans),
        "eblet_bundle_count": len(eblet_bundles),
        "total_depth": total_depth,
        "items": all_items,
        "formatted_summary": "\n".join(lines),
    }
