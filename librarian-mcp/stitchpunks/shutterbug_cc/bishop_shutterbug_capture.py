#!/usr/bin/env python3
"""
bishop_shutterbug_capture.py — KN037 Windows screenshot capture wrapper.

D.6: Tries PIL.ImageGrab first (clean, reliable on Windows 10/11 with desktop).
Fallback: PowerShell System.Drawing.Graphics.CopyFromScreen().
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


def _try_pil(output_path: Path) -> bool:
    """D.6 primary: PIL.ImageGrab.grab() — captures full screen on Windows."""
    try:
        from PIL import ImageGrab  # type: ignore[import]
        img = ImageGrab.grab()
        img.save(str(output_path))
        return True
    except Exception:
        return False


def _try_powershell(output_path: Path) -> bool:
    """
    D.6 fallback: PowerShell System.Drawing to capture full screen.

    Uses Add-Type System.Drawing then Graphics.CopyFromScreen.
    """
    script = (
        "Add-Type -AssemblyName System.Drawing; "
        "$w=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width; "
        "$h=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height; "
        "$bmp=New-Object System.Drawing.Bitmap($w,$h); "
        "$g=[System.Drawing.Graphics]::FromImage($bmp); "
        "$g.CopyFromScreen(0,0,0,0,[System.Drawing.Size]::new($w,$h)); "
        f"$bmp.Save('{str(output_path).replace(chr(92), chr(92)+chr(92))}'); "
        "$g.Dispose(); $bmp.Dispose()"
    )
    try:
        result = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True,
            timeout=10,
        )
        return result.returncode == 0 and output_path.exists()
    except Exception:
        return False


def _try_powershell_forms(output_path: Path) -> bool:
    """Alternative PowerShell using Windows Forms + screen capture."""
    script = (
        "Add-Type -AssemblyName System.Windows.Forms; "
        "Add-Type -AssemblyName System.Drawing; "
        "$screen = [System.Windows.Forms.Screen]::PrimaryScreen; "
        "$bmp = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height); "
        "$g = [System.Drawing.Graphics]::FromImage($bmp); "
        "$g.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size); "
        f"$bmp.Save('{str(output_path).replace(chr(92), chr(92)+chr(92))}'); "
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

    # Try PIL first
    if _try_pil(output_path):
        return {"success": True, "path": str(output_path), "method": "pil", "pp": pp, "filename": filename}

    # Fallback: PowerShell System.Drawing
    if _try_powershell(output_path):
        return {"success": True, "path": str(output_path), "method": "powershell", "pp": pp, "filename": filename}

    # Second fallback: PowerShell Windows Forms
    if _try_powershell_forms(output_path):
        return {"success": True, "path": str(output_path), "method": "powershell_forms", "pp": pp, "filename": filename}

    # Final fallback: stub
    stub = _write_stub(output_path, pp, "all capture methods failed")
    return {
        "success": False,
        "path": str(stub),
        "method": "stub",
        "pp": pp,
        "filename": stub.name,
    }
