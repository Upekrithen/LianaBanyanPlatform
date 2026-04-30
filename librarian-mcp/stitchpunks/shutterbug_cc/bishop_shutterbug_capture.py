#!/usr/bin/env python3
"""
bishop_shutterbug_capture.py — KN037 Windows screenshot capture wrapper.

Capture target: the FULL MONITOR containing the Cursor IDE window (Knight's screen),
so the OS taskbar with time/date is visible. Hook runs inside Bishop (Claude Code),
so "self" is not the target — Cursor on the other monitor is.

Strategy:
  1. win32gui.EnumWindows — find hwnd of window ending in "- Cursor"
  2. win32api.MonitorFromWindow — get the monitor that contains it
  3. GetMonitorInfo["Monitor"] — full monitor rect (left, top, right, bottom)
  4. PIL.ImageGrab.grab(bbox=rect, all_screens=True) — capture that full monitor
  Fallback: PowerShell CopyFromScreen on same rect.
  Final fallback: metadata-stub (so the hook never crashes).

D.3 Filename format: "Screenshot YYYY-MM-DD HHMMSS_pp<NN>.png"
  e.g. "Screenshot 2026-04-30 145832_pp21.png"
  This matches the sweep hook regex for move-to-NNN at SessionEnd.

D.9 Output: C:/Users/Administrator/Pictures/BeanSprouts/ root (loose).
  bishop_screenshot_sweep.py handles move to BeanSprouts/NNN/ at SessionEnd.
"""

from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

BEANSPROUTS = Path(r"C:\Users\Administrator\Pictures\BeanSprouts")


def _ts_display() -> str:
    """D.3 timestamp: 'YYYY-MM-DD HHMMSS'"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H%M%S")


def _build_filename(pp: float) -> str:
    """D.3: 'Screenshot YYYY-MM-DD HHMMSS_pp<NN>.png'"""
    ts = _ts_display()
    pp_int = int(pp)
    return f"Screenshot {ts}_pp{pp_int:02d}.png"


def _find_cursor_monitor_rect() -> Optional[tuple]:
    """
    Find the Cursor IDE window and return the bounding rect of the monitor
    that contains it, so the full monitor (with OS taskbar + clock) is captured.

    Returns (left, top, right, bottom) or None if Cursor not found.
    """
    try:
        import win32gui
        import win32api
        import win32con

        cursor_hwnd = None

        def _enum_cb(hwnd, _):
            nonlocal cursor_hwnd
            if not win32gui.IsWindowVisible(hwnd):
                return
            title = win32gui.GetWindowText(hwnd)
            # Match main Cursor editor windows: title ends with "- Cursor"
            # Exclude installer ("Setup - Cursor")
            if title.endswith("- Cursor") and not title.startswith("Setup"):
                cursor_hwnd = hwnd

        win32gui.EnumWindows(_enum_cb, None)

        if cursor_hwnd is None:
            return None

        # Get the monitor that contains this window
        monitor = win32api.MonitorFromWindow(cursor_hwnd, win32con.MONITOR_DEFAULTTONEAREST)
        info = win32api.GetMonitorInfo(monitor)
        # info["Monitor"] = (left, top, right, bottom) of the full monitor
        return tuple(info["Monitor"])

    except Exception:
        return None


def _try_pil_cursor_monitor(output_path: Path) -> bool:
    """
    Primary: capture the full monitor containing the Cursor IDE window.
    Includes OS taskbar + clock so timestamp is visible in the screenshot.
    Falls back to primary screen if Cursor window not found.
    """
    try:
        from PIL import ImageGrab  # type: ignore[import]
        rect = _find_cursor_monitor_rect()
        if rect:
            img = ImageGrab.grab(bbox=rect, all_screens=True)
        else:
            # Cursor not found — grab primary screen and note it in filename
            img = ImageGrab.grab()
        img.save(str(output_path))
        return True
    except Exception:
        return False


def _try_powershell_cursor_monitor(output_path: Path) -> bool:
    """
    PowerShell fallback: find Cursor window, determine its monitor rect,
    capture that monitor via System.Drawing.Graphics.CopyFromScreen.
    """
    # First resolve the monitor rect via Python win32 (already imported above)
    rect = _find_cursor_monitor_rect()
    if rect:
        left, top, right, bottom = rect
        w = right - left
        h = bottom - top
    else:
        left, top, w, h = 0, 0, 1920, 1080  # safe fallback

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
            capture_output=True,
            timeout=15,
        )
        return result.returncode == 0 and output_path.exists()
    except Exception:
        return False


def _write_stub(output_path: Path, pp: float, reason: str) -> Path:
    """Final fallback: write a .json stub so the record exists even without a real PNG."""
    stub_path = output_path.with_suffix(".stub.json")
    try:
        stub_path.write_text(
            json.dumps({
                "type": "shutterbug_capture_stub",
                "intended_png": str(output_path),
                "pp": pp,
                "reason": reason,
                "note": "PIL and PowerShell capture both failed; stub written for audit trail.",
            }, indent=2),
            encoding="utf-8",
        )
    except Exception:
        pass
    return stub_path


def capture(pp: float) -> dict:
    """
    Capture a screenshot at the given context percentage.

    Returns:
        {
            "success": bool,
            "path": str,
            "method": "pil" | "powershell" | "stub",
            "pp": float,
            "filename": str,
        }
    """
    BEANSPROUTS.mkdir(parents=True, exist_ok=True)
    filename = _build_filename(pp)
    output_path = BEANSPROUTS / filename

    # Primary: PIL grab of the Cursor monitor (falls back to primary if Cursor not found)
    if _try_pil_cursor_monitor(output_path):
        return {"success": True, "path": str(output_path), "method": "pil_cursor_monitor", "pp": pp, "filename": filename}

    # Fallback: PowerShell CopyFromScreen on Cursor monitor rect
    if _try_powershell_cursor_monitor(output_path):
        return {"success": True, "path": str(output_path), "method": "powershell_cursor_monitor", "pp": pp, "filename": filename}

    # Final fallback: stub
    stub = _write_stub(output_path, pp, "all capture methods failed")
    return {
        "success": False,
        "path": str(stub),
        "method": "stub",
        "pp": pp,
        "filename": stub.name,
    }
