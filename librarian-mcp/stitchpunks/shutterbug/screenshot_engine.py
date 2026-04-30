"""
Screenshot Engine — KN028 Component 1

Cross-platform screenshot capture with graceful degradation for headless
environments (Windows Server without GUI, CI, etc.).

Primary: PIL.ImageGrab (Windows) → saves real PNG
Fallback: metadata-stub JSON saved as .stub file

Output: ~/Pictures/BeanSprouts/<session_id>/screenshot_<threshold>pct_<ts>.png
         (or .stub if headless)

Toolsmith log: TS-SHUTTERBUG-SCRIBE-KN028-BP003
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _ts_filename() -> str:
    """UTC timestamp safe for filenames: 20260430T175832Z"""
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def get_beansrpouts_dir() -> Path:
    """Root BeanSprouts directory: ~/Pictures/BeanSprouts/"""
    return Path.home() / "Pictures" / "BeanSprouts"


def get_session_dir(session_id: str) -> Path:
    """Per-session screenshot directory."""
    safe = session_id.replace("/", "_").replace("\\", "_").replace(":", "-")
    d = get_beansrpouts_dir() / safe
    d.mkdir(parents=True, exist_ok=True)
    return d


def _build_filename(threshold: float, context_pct: float, ext: str) -> str:
    """e.g. screenshot_020pct_ctx019.7_20260430T175832Z.png"""
    ts = _ts_filename()
    return f"screenshot_{int(threshold):03d}pct_ctx{context_pct:.1f}_{ts}{ext}"


def _try_pil_screenshot(output_path: Path) -> bool:
    """Attempt PIL.ImageGrab screenshot. Returns True on success."""
    try:
        from PIL import ImageGrab  # type: ignore[import]
        img = ImageGrab.grab()
        img.save(str(output_path))
        return True
    except Exception:
        return False


def _try_mss_screenshot(output_path: Path) -> bool:
    """Attempt mss screenshot (fallback). Returns True on success."""
    try:
        import mss  # type: ignore[import]
        import mss.tools  # type: ignore[import]
        with mss.mss() as sct:
            monitor = sct.monitors[0]
            sct_img = sct.grab(monitor)
            mss.tools.to_png(sct_img.rgb, sct_img.size, output=str(output_path))
        return True
    except Exception:
        return False


def _write_stub(
    output_dir: Path,
    filename_stem: str,
    metadata: Dict[str, Any],
) -> Path:
    """Write a metadata stub when screenshot is not possible."""
    stub_path = output_dir / f"{filename_stem}.stub.json"
    stub = {
        **metadata,
        "type": "screenshot_stub",
        "reason": "headless_or_no_display",
        "captured_at": _iso_now(),
    }
    with stub_path.open("w", encoding="utf-8") as fh:
        json.dump(stub, fh, indent=2, ensure_ascii=False)
    return stub_path


def take_screenshot(
    session_id: str,
    threshold: float,
    context_pct: float,
    bean_id: str = "",
    extra_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Capture a screenshot at a context-budget threshold crossing.

    Returns a capture-result dict with:
      - captured: bool — whether a real screenshot was saved
      - path: str — absolute path to PNG or stub file
      - file_type: "png" | "stub"
      - threshold: float
      - context_pct: float
      - session_id: str
      - bean_id: str
      - captured_at: ISO timestamp

    Guaranteed non-raising.
    """
    session_dir = get_session_dir(session_id)
    metadata: Dict[str, Any] = {
        "session_id": session_id,
        "bean_id": bean_id,
        "threshold": threshold,
        "context_pct": context_pct,
        **(extra_metadata or {}),
    }

    png_filename = _build_filename(threshold, context_pct, ".png")
    png_path = session_dir / png_filename
    stem = png_path.stem

    # Try PIL first, then mss, then stub
    if _try_pil_screenshot(png_path):
        return {
            "captured": True,
            "path": str(png_path),
            "file_type": "png",
            "method": "PIL.ImageGrab",
            "threshold": threshold,
            "context_pct": context_pct,
            "session_id": session_id,
            "bean_id": bean_id,
            "captured_at": _iso_now(),
        }

    if _try_mss_screenshot(png_path):
        return {
            "captured": True,
            "path": str(png_path),
            "file_type": "png",
            "method": "mss",
            "threshold": threshold,
            "context_pct": context_pct,
            "session_id": session_id,
            "bean_id": bean_id,
            "captured_at": _iso_now(),
        }

    stub_path = _write_stub(session_dir, stem, metadata)
    return {
        "captured": False,
        "path": str(stub_path),
        "file_type": "stub",
        "method": "metadata_stub",
        "threshold": threshold,
        "context_pct": context_pct,
        "session_id": session_id,
        "bean_id": bean_id,
        "captured_at": _iso_now(),
    }


def list_session_captures(session_id: str) -> list:
    """List all capture files (PNG + stub) for a session."""
    session_dir = get_session_dir(session_id)
    if not session_dir.exists():
        return []
    captures = []
    for f in sorted(session_dir.iterdir()):
        if f.suffix in (".png", ".json") or f.name.endswith(".stub.json"):
            captures.append(str(f))
    return captures
