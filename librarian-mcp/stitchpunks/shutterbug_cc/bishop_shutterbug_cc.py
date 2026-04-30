#!/usr/bin/env python3
"""
bishop_shutterbug_cc.py — KN037 Shutterbug Bishop-CC Extension.

#2304 sub-component (Stenographer / Shutterbug / Accountant CheckBook Suite).
Eliminates Founder double-duty of manually screenshotting Bishop CC window.
Auto-captures at every 1pp context-budget threshold crossing.

Fires on: UserPromptSubmit hook (after each Founder prompt — natural % update event).
D.4: Hook trigger = UserPromptSubmit

Flow:
  1. Parse current context % from latest Bishop CC JSONL
  2. Load last-captured-pp from ~/.claude/state/shutterbug/last_pp.json
  3. If floor(current_pct) > floor(last_pp): new integer pp threshold crossed
  4. D.8: Skip if same pp already captured this session (de-dupe by pp value)
  5. Capture screenshot → BeanSprouts root (sweep hook handles folder at SessionEnd)
  6. Update last_pp.json
  7. D.5: Log errors to ~/.claude/state/shutterbug/errors.log; never block UserPromptSubmit

D.6: PowerShell or PIL capture (pick best available).
D.9: Output root = C:/Users/Administrator/Pictures/BeanSprouts/ (loose)
"""

from __future__ import annotations

import json
import math
import sys
import traceback
from pathlib import Path

HOOKS_DIR = Path(__file__).parent
STATE_DIR = Path(r"C:\Users\Administrator\.claude\state\shutterbug")
LAST_PP_FILE = STATE_DIR / "last_pp.json"
ERRORS_LOG = STATE_DIR / "errors.log"


def _log_error(msg: str) -> None:
    """D.5: Log error silently; never block UserPromptSubmit."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        with ERRORS_LOG.open("a", encoding="utf-8") as fh:
            from datetime import datetime, timezone
            ts = datetime.now(timezone.utc).isoformat()
            fh.write(f"[{ts}] {msg}\n")
    except Exception:
        pass


def _import_local(name: str):
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, HOOKS_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _load_last_pp() -> float:
    """Load last captured pp from state file. Bootstrap = 0.0."""
    try:
        if LAST_PP_FILE.is_file():
            data = json.loads(LAST_PP_FILE.read_text(encoding="utf-8"))
            return float(data.get("pp", 0.0))
    except Exception:
        pass
    return 0.0


def _load_captured_this_session() -> set:
    """Load set of pp values already captured this session (D.8 de-dupe)."""
    try:
        if LAST_PP_FILE.is_file():
            data = json.loads(LAST_PP_FILE.read_text(encoding="utf-8"))
            caps = data.get("captured_this_session", [])
            return set(int(x) for x in caps if isinstance(x, (int, float)))
    except Exception:
        pass
    return set()


def _save_last_pp(pp: float, captured_this_session: set) -> None:
    """Persist last pp + session de-dupe set."""
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        data = {
            "pp": pp,
            "captured_this_session": sorted(captured_this_session),
        }
        LAST_PP_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        pass


def main() -> int:
    try:
        # Read hook payload (UserPromptSubmit provides session_id etc.)
        try:
            raw = sys.stdin.read()
            payload = json.loads(raw) if raw.strip() else {}
        except json.JSONDecodeError:
            payload = {}

        session_id = payload.get("session_id") or payload.get("sessionId")

        # Import local modules
        try:
            parser_mod = _import_local("bishop_shutterbug_jsonl_parser")
            capture_mod = _import_local("bishop_shutterbug_capture")
        except Exception as exc:
            _log_error(f"Module import failed: {exc}\n{traceback.format_exc()}")
            return 0  # D.5: never block

        # Get current context %
        current_pct = parser_mod.extract_context_pct_from_session(session_id)
        if current_pct is None:
            # Can't determine pct — silently no-op (session may just be starting)
            return 0

        # D.1: threshold granularity = 1pp; fire on every integer threshold crossing
        last_pp = _load_last_pp()
        captured_set = _load_captured_this_session()

        current_floor = int(math.floor(current_pct))
        last_floor = int(math.floor(last_pp))

        if current_floor <= last_floor:
            # No new integer threshold crossed — no-op
            return 0

        # D.8: De-dupe — skip if this pp was already captured this session
        if current_floor in captured_set:
            return 0

        # New threshold reached — capture screenshot
        result = capture_mod.capture(current_pct)
        captured_set.add(current_floor)
        _save_last_pp(current_pct, captured_set)

        if not result.get("success"):
            _log_error(
                f"Capture fallback to stub at pp={current_pct:.1f}: "
                f"method={result.get('method')} path={result.get('path')}"
            )

        return 0

    except Exception as exc:
        try:
            _log_error(f"Fatal: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        except Exception:
            pass
        return 0  # D.5: never block UserPromptSubmit


if __name__ == "__main__":
    sys.exit(main())
