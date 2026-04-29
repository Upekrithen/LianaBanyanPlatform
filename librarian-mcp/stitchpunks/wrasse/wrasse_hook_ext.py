"""
Wrasse Scribe Bishop Hook Extension — K540/B132

Extends the Bishop SessionStart hook to inject Wrasse pre-resolutions
into context at session-spawn boundaries.

Architecture decision D.2 (Bishop): hook-injected-context via the existing
discipline_wing PreToolUse hook infrastructure (K514/B126).

Integration path:
    ~/.claude/hooks/bishop_librarian_gate.py already delegates to
    discipline_wing.engine.evaluate(). This module is called as a
    SEPARATE pre-session action, NOT as a Wing Augur — it's additive
    context, not a gate/block.

Usage (from bishop_librarian_gate.py or session_start.py):
    from wrasse_hook_ext import get_wrasse_injection
    injection = get_wrasse_injection(recent_context)
    # Prepend injection to system prompt or log via MCP tidbit

Usage (standalone diagnostic):
    python wrasse_hook_ext.py [--context="<context string>"]
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

# State file patterns Bishop writes at session end (K453)
BISHOP_STATE_DIR = Path.home() / ".claude" / "state"
BISHOP_LAST_PATTERN = "bishop_last_*.json"

WORKSPACE_ROOT = Path(__file__).resolve().parents[4]  # 4 levels up from wrasse/
WRASSE_DIR = Path(__file__).parent
SESSION_LEDGER = WRASSE_DIR / "session_ledger.jsonl"


def _read_bishop_last_context(state_dir: Path = BISHOP_STATE_DIR) -> str:
    """
    Read recent Bishop session context from bishop_last_* state files.
    Returns concatenated context string for lookup.
    """
    if not state_dir.exists():
        return ""

    context_parts: list = []
    try:
        files = sorted(state_dir.glob("bishop_last_*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
        for fpath in files[:3]:  # Read 3 most recent state files
            try:
                with open(fpath, "r", encoding="utf-8") as fh:
                    data = json.load(fh)
                # Extract session_id, task, triggers from state file
                for field in ("session_id", "task", "recent_triggers", "k_sessions_referenced"):
                    val = data.get(field, "")
                    if isinstance(val, list):
                        context_parts.extend(str(v) for v in val)
                    elif val:
                        context_parts.append(str(val))
            except (json.JSONDecodeError, OSError):
                continue
    except OSError:
        pass

    return " ".join(context_parts)


def get_wrasse_injection(
    explicit_context: Optional[str] = None,
    max_matches: int = 12,
) -> str:
    """
    Main entry point for Bishop SessionStart hook.

    1. If explicit_context provided, use it directly.
    2. Otherwise, read bishop_last_* state files for recent triggers.
    3. Run Wrasse lookup against combined context.
    4. Return injection text (empty string if no matches).

    The returned text is suitable for:
    - Prepending to Bishop's system prompt
    - Logging as a tidbit via the Librarian MCP
    - Writing to a temporary session context file

    Per architecture decision D.2, this is hook-injected-context for Bishop
    (NOT MCP-tool-on-spawn — that would require MCP client changes).
    """
    # Import here to avoid circular imports when called from hook context
    sys.path.insert(0, str(WRASSE_DIR))
    from wrasse_inject import generate_bishop_hook_block

    context = explicit_context or _read_bishop_last_context()
    if not context:
        return ""

    return generate_bishop_hook_block(context, max_matches=max_matches)


def log_session_measurement(
    session_id: str,
    wrasse_matches: int,
    injection_chars: int,
    rote_terms_found: list,
    context_snapshot: str = "",
) -> None:
    """
    Append a measurement record to session_ledger.jsonl.
    Used by Phase D measurement harness.
    """
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "wrasse_matches": wrasse_matches,
        "injection_chars": injection_chars,
        "injection_tokens_estimated": injection_chars // 4,
        "rote_terms_found": rote_terms_found,
        "context_snapshot_chars": len(context_snapshot),
    }
    with open(SESSION_LEDGER, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")


if __name__ == "__main__":
    explicit = None
    for arg in sys.argv[1:]:
        if arg.startswith("--context="):
            explicit = arg.split("=", 1)[1]

    injection = get_wrasse_injection(explicit_context=explicit)
    if injection:
        print("=== WRASSE BISHOP HOOK INJECTION ===")
        print(injection)
        print("=== END ===")
    else:
        # No state files or no matches — this is normal at start of day
        print("[Wrasse] No matches from bishop_last_* state. Injection skipped.")
        print("[Wrasse] To test: python wrasse_hook_ext.py --context='K461 BRIDLE canonical_values.yaml'")
