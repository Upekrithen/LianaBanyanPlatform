#!/usr/bin/env python3
"""
bishop_shutterbug_capture.py — KN037 dual-monitor screenshot capture.

Captures BOTH monitors at session boundaries (SessionStart + SessionEnd):
  - bishop: the monitor containing the "Claude" window (Bishop CC)
  - cursor: the monitor containing the "- Cursor" window (Knight/Cursor IDE)

Full monitor capture (not just the window) so OS taskbar + clock are visible.
Two files written per capture event, labeled with agent and event.

Filename format: "Screenshot YYYY-MM-DD HHMMSS_<event>_<agent>.png"
  e.g. "Screenshot 2026-04-30 150832_SessionStart_cursor.png"
       "Screenshot 2026-04-30 150832_SessionStart_bishop.png"

Sweep hook (bishop_screenshot_sweep.py) moves loose PNGs to BeanSprouts/NNN/ at SessionEnd.
"""

from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

BEANSPROUTS = Path(r"C:\Users\Administrator\Pictures\BeanSprouts")


def _ts_display() -> str:
    """Timestamp safe for filenames: 'YYYY-MM-DD HHMMSS' (UTC)."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H%M%S")


def _build_filename(event: str, agent: str) -> str:
    """e.g. 'Screenshot 2026-04-30 150832_SessionStart_cursor.png'"""
    return f"Screenshot {_ts_display()}_{event}_{agent}.png"


# ── Window / monitor discovery ────────────────────────────────────────────────

def _find_monitor_rect_for_title(title_fragment: str, end_match: bool = False) -> Optional[tuple]:
    """
    Find the first visible window matching title_fragment and return the
    bounding rect of the monitor that contains it: (left, top, right, bottom).

    If end_match=True, the window title must END with title_fragment.
    Falls back to primary monitor if window not found.
    """
    try:
        import win32gui
        import win32api
        import win32con

        found_hwnd = None

        def _cb(hwnd, _):
            nonlocal found_hwnd
            if found_hwnd or not win32gui.IsWindowVisible(hwnd):
                return
            title = win32gui.GetWindowText(hwnd)
            if not title:
                return
            if end_match:
                if title.endswith(title_fragment) and not title.startswith("Setup"):
                    found_hwnd = hwnd
            else:
                if title_fragment.lower() in title.lower() and not title.startswith("Setup"):
                    found_hwnd = hwnd

        win32gui.EnumWindows(_cb, None)

        if found_hwnd is None:
            return None

        monitor = win32api.MonitorFromWindow(found_hwnd, win32con.MONITOR_DEFAULTTONEAREST)
        info = win32api.GetMonitorInfo(monitor)
        return tuple(info["Monitor"])  # (left, top, right, bottom)

    except Exception:
        return None


def find_cursor_monitor_rect() -> Optional[tuple]:
    """Monitor rect for the Cursor IDE window (title ends with '- Cursor')."""
    return _find_monitor_rect_for_title("- Cursor", end_match=True)


def find_bishop_monitor_rect() -> Optional[tuple]:
    """Monitor rect for the Claude Code / Bishop window (title == 'Claude')."""
    return _find_monitor_rect_for_title("Claude", end_match=False)


# ── Single-monitor capture ────────────────────────────────────────────────────

def _capture_monitor(rect: Optional[tuple], output_path: Path) -> bool:
    """
    Capture the given monitor rect (or primary if None) using PIL.ImageGrab.
    Returns True on success.
    """
    try:
        from PIL import ImageGrab  # type: ignore[import]
        if rect:
            img = ImageGrab.grab(bbox=rect, all_screens=True)
        else:
            img = ImageGrab.grab()
        img.save(str(output_path))
        return True
    except Exception:
        pass

    # PowerShell fallback
    if rect:
        left, top, right, bottom = rect
        w, h = right - left, bottom - top
    else:
        left, top, w, h = 0, 0, 1920, 1080

    escaped = str(output_path).replace("\\", "\\\\")
    script = (
        "Add-Type -AssemblyName System.Drawing; "
        f"$bmp=New-Object System.Drawing.Bitmap({w},{h}); "
        "$g=[System.Drawing.Graphics]::FromImage($bmp); "
        f"$g.CopyFromScreen({left},{top},0,0,[System.Drawing.Size]::new({w},{h})); "
        f"$bmp.Save('{escaped}'); "
        "$g.Dispose(); $bmp.Dispose()"
    )
    try:
        result = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True, timeout=15,
        )
        return result.returncode == 0 and output_path.exists()
    except Exception:
        return False


def _write_stub(output_path: Path, agent: str, event: str, reason: str) -> Path:
    """Audit-trail stub when all capture methods fail."""
    stub_path = output_path.with_suffix(".stub.json")
    try:
        stub_path.write_text(
            json.dumps({
                "type": "shutterbug_capture_stub",
                "intended_png": str(output_path),
                "agent": agent,
                "event": event,
                "reason": reason,
            }, indent=2),
            encoding="utf-8",
        )
    except Exception:
        pass
    return stub_path


# ── Public API ────────────────────────────────────────────────────────────────

def capture_both(event: str) -> list[dict]:
    """
    Capture both monitors for the given session event label ("SessionStart" or "SessionEnd").

    Returns a list of two result dicts (cursor first, then bishop):
        [{"agent": "cursor"|"bishop", "success": bool, "path": str, "filename": str}, ...]
    """
    BEANSPROUTS.mkdir(parents=True, exist_ok=True)
    results = []

    for agent, rect_fn in [("cursor", find_cursor_monitor_rect),
                            ("bishop", find_bishop_monitor_rect)]:
        rect = rect_fn()
        filename = _build_filename(event, agent)
        output_path = BEANSPROUTS / filename

        ok = _capture_monitor(rect, output_path)
        if ok:
            results.append({
                "agent": agent, "success": True,
                "path": str(output_path), "filename": filename,
                "monitor_rect": rect,
            })
        else:
            stub = _write_stub(output_path, agent, event, "all capture methods failed")
            results.append({
                "agent": agent, "success": False,
                "path": str(stub), "filename": stub.name,
                "monitor_rect": rect,
            })

    return results


# Legacy single-capture entry point (kept for compatibility with existing tests)
def capture(pp: float) -> dict:
    """Single-capture shim — grabs Cursor monitor only. Used by 1pp threshold path."""
    BEANSPROUTS.mkdir(parents=True, exist_ok=True)
    filename = f"Screenshot {_ts_display()}_pp{int(pp):02d}.png"
    output_path = BEANSPROUTS / filename
    rect = find_cursor_monitor_rect()
    ok = _capture_monitor(rect, output_path)
    if ok:
        return {"success": True, "path": str(output_path), "method": "pil_cursor_monitor",
                "pp": pp, "filename": filename}
    stub = _write_stub(output_path, "cursor", f"pp{int(pp):02d}", "capture failed")
    return {"success": False, "path": str(stub), "method": "stub", "pp": pp, "filename": stub.name}
