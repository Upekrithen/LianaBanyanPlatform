"""
Claude CLI Vendor Adapter — KN035 / A&A #2303 / Persistent-Bishop

First vendor adapter for cross-vendor context pre-injection (D.5).

Converts Persistent-Bishop sandbox context_preinjection payload
into Claude Code CLI format (system prompt pre-injection via MEMORY.md pattern).

Per D.7: this bean ships ONE vendor adapter (claude_cli for self-test).
Full multi-vendor (cursor, comet, direct_api) deferred to BP004+.

Adapter interface:
  format_preinjection(context_preinjection: dict) -> dict
    Returns: {
      "vendor": "claude_cli",
      "injection_method": "system_prompt_prefix" | "MEMORY_md",
      "payload": str,
      "token_estimate": int,
    }

Toolsmith log: TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003
"""

from __future__ import annotations

import json
from typing import Any, Dict

VENDOR = "claude_cli"
ADAPTER_VERSION = "1.0"
TOOLSMITH_LOG = "TS-PERSISTENT-BISHOP-SANDBOX-FOUNDATION-KN035-BP003"

# Typical Claude CLI MEMORY.md injection overhead (tokens)
_BASE_OVERHEAD_TOKENS = 50
_TOKENS_PER_100_CHARS = 25


def format_preinjection(context_preinjection: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a Persistent-Bishop context pre-injection for Claude CLI.

    The Claude CLI reads MEMORY.md from the project root at session start.
    This adapter produces a MEMORY.md-compatible pre-injection block.

    Parameters
    ----------
    context_preinjection : dict
        Output from attachment_protocol.attach(...) context_preinjection field.
        Keys: canonical_context_snapshot, memory_md_summary, recent_canon_eblets,
              beanpole_id, owner_session, opened_at.

    Returns
    -------
    dict
        {
            vendor: "claude_cli",
            injection_method: "MEMORY_md",
            payload: str (markdown block for MEMORY.md prepend),
            token_estimate: int,
        }
    """
    beanpole_id = context_preinjection.get("beanpole_id", "unknown")
    owner_session = context_preinjection.get("owner_session", "unknown")
    opened_at = context_preinjection.get("opened_at", "unknown")
    canonical = context_preinjection.get("canonical_context_snapshot", {})
    memory_summary = context_preinjection.get("memory_md_summary", "")
    recent_eblets = context_preinjection.get("recent_canon_eblets", [])

    # Build MEMORY.md-compatible block
    lines = [
        f"## Persistent-Bishop Sandbox Context",
        f"*Beanpole: {beanpole_id} | Owner: {owner_session} | Opened: {opened_at[:10]}*",
        "",
    ]

    if canonical:
        lines.append("### Canonical Snapshot")
        for key, value in canonical.items():
            lines.append(f"- **{key}:** {value}")
        lines.append("")

    if recent_eblets:
        lines.append("### Recent Canon Eblets")
        for eblet_id in recent_eblets[-5:]:
            lines.append(f"- `{eblet_id}`")
        lines.append("")

    if memory_summary:
        lines.append("### MEMORY.md Excerpt")
        lines.append(memory_summary[:300])
        lines.append("")

    lines.append("*This block auto-injected by Persistent-Bishop sandbox adapter.*")

    payload = "\n".join(lines)
    token_estimate = _BASE_OVERHEAD_TOKENS + (len(payload) // 4)

    return {
        "vendor": VENDOR,
        "adapter_version": ADAPTER_VERSION,
        "injection_method": "MEMORY_md",
        "payload": payload,
        "token_estimate": token_estimate,
        "beanpole_id": beanpole_id,
    }


def self_test(beanpole_id: str = "test-beanpole-kn035") -> Dict[str, Any]:
    """
    Self-test: create a synthetic context_preinjection and format it.
    Used in tests and vendor-adapter validation.
    Returns formatted output with success flag.
    """
    synthetic_context = {
        "beanpole_id": beanpole_id,
        "owner_session": "BP003-PodL",
        "opened_at": "2026-04-30T00:00:00Z",
        "canonical_context_snapshot": {
            "innovations": "2267",
            "crown_jewels": "225",
            "creator_keeps": "83.3%",
        },
        "memory_md_summary": "Knight session context: Anjin Phase 3 close. Pod L: KN032-KN035.",
        "recent_canon_eblets": ["BP003-KN032", "BP003-KN033", "BP003-KN034"],
    }
    result = format_preinjection(synthetic_context)
    return {
        "success": True,
        "vendor": VENDOR,
        "beanpole_id": beanpole_id,
        "payload_length": len(result["payload"]),
        "token_estimate": result["token_estimate"],
        "injection_method": result["injection_method"],
        "sample_payload_head": result["payload"][:200],
    }
