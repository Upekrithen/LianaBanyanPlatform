"""
tool_translator.py — MCP ↔ Perplexity Format Translator
KN092 / BP011 Pod W Bean 4

Implements the Pawn-accessible Librarian tools natively (reading from the same
data layer the Librarian uses) and wraps their return values in Perplexity-
expected JSON (OpenAI tool-result format).

Supported tools (read_only tier):
  • mcp__librarian__get_canonical_numbers  — reads canonical_values.yaml
  • mcp__librarian__brief_me               — synthesizes from canonical_values.yaml
                                             + pheromone substrate + wrasse registry
  • mcp__librarian__consult_scribes        — reads pawn_cathedral JSONL scribes
  • read_file                              — Shadow-alpha filesystem proxy

Write-allowed tier:
  • mcp__librarian__scribe_log             — appends to PawnGenerated.jsonl
  • mcp__librarian__log_tidbit             — alias for scribe_log

Streaming / non-streaming: the gateway always returns non-streaming JSON.
MCP response → Perplexity-expected: {"role": "tool", "content": "<json_string>"}
"""
from __future__ import annotations

import json
import textwrap
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
LIBRARIAN_ROOT = WORKSPACE_ROOT / "librarian-mcp"
CANONICAL_YAML = LIBRARIAN_ROOT / "canonical_values.yaml"
PAWN_CATHEDRAL = LIBRARIAN_ROOT / "stitchpunks" / "pawn_cathedral"
PAWN_SCRIBES = PAWN_CATHEDRAL / "scribes"
WRASSE_REGISTRY = LIBRARIAN_ROOT / "stitchpunks" / "wrasse" / "wrasse_registry.jsonl"
PHEROMONE_INDEX = LIBRARIAN_ROOT / "stitchpunks" / "pheromone_substrate" / "index.jsonl"
PAWN_GENERATED = PAWN_SCRIBES / "PawnGenerated.jsonl"


# ── Helpers ────────────────────────────────────────────────────────────────────

def _read_yaml(path: Path) -> dict:
    try:
        with open(path, encoding="utf-8") as fh:
            return yaml.safe_load(fh) or {}
    except Exception as exc:
        return {"error": str(exc)}


def _read_jsonl_tail(path: Path, n: int = 20) -> list[dict]:
    """Read last `n` entries from a JSONL file (header record excluded)."""
    if not path.exists():
        return []
    entries: list[dict] = []
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                    if rec.get("type") != "header":
                        entries.append(rec)
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    return entries[-n:]


def _perplexity_tool_result(tool_call_id: str, content: Any) -> dict:
    """Wrap a native result in Perplexity/OpenAI tool-result format."""
    return {
        "role": "tool",
        "tool_call_id": tool_call_id,
        "content": json.dumps(content, ensure_ascii=False),
    }


# ── Tool implementations ───────────────────────────────────────────────────────

def _tool_get_canonical_numbers(args: dict) -> dict:
    """Return the canonical stats from canonical_values.yaml."""
    data = _read_yaml(CANONICAL_YAML)
    stats = data.get("stats", {})
    return {
        "status": "ok",
        "canonical_numbers": stats,
        "source": "canonical_values.yaml",
        "provenance": "KN092/BP011 Pawn-Librarian gateway",
    }


def _tool_brief_me(args: dict) -> dict:
    """
    Synthesized brief: canonical numbers + latest pheromone + wrasse peek.
    Mirrors the core of the Librarian's brief_me tool with read-only filesystem
    access (no Supabase call — Supabase enrichment is the Librarian server's job).
    """
    task = args.get("task", "")
    data = _read_yaml(CANONICAL_YAML)
    stats = data.get("stats", {})

    # Sniff wrasse registry for latest 3 sessions
    wrasse_entries = _read_jsonl_tail(WRASSE_REGISTRY, n=3)
    wrasse_peek = [
        {
            "session": e.get("session_id", "?"),
            "summary": textwrap.shorten(e.get("summary", ""), width=120),
        }
        for e in wrasse_entries
    ]

    # Sniff pheromone index for latest 3 signals
    pheromone_entries = _read_jsonl_tail(PHEROMONE_INDEX, n=3)
    pheromone_peek = [
        {
            "signal": e.get("signal", "?"),
            "strength": e.get("strength", "?"),
        }
        for e in pheromone_entries
    ]

    return {
        "status": "ok",
        "task": task,
        "canonical_stats": stats,
        "recent_sessions": wrasse_peek,
        "recent_pheromones": pheromone_peek,
        "note": (
            "Pawn-gateway brief_me: filesystem-layer only. "
            "For full Supabase-enriched brief, route via Librarian MCP server."
        ),
        "provenance": "KN092/BP011 Pawn-Librarian gateway",
    }


def _tool_consult_scribes(args: dict) -> dict:
    """Return recent entries from Pawn's Cathedral scribes."""
    scribe_name = args.get("scribe", "")
    n = min(int(args.get("n", 10)), 50)

    scribe_map = {
        "PawnQueue": PAWN_SCRIBES / "PawnQueue.jsonl",
        "PawnHandoffs": PAWN_SCRIBES / "PawnHandoffs.jsonl",
        "PawnGenerated": PAWN_GENERATED,
        "R11_corpus": PAWN_SCRIBES / "R11_corpus.jsonl",
    }

    if scribe_name and scribe_name not in scribe_map:
        return {
            "status": "error",
            "error": f"Unknown scribe '{scribe_name}'. Valid: {list(scribe_map.keys())}",
        }

    if scribe_name:
        targets = {scribe_name: scribe_map[scribe_name]}
    else:
        targets = scribe_map

    result: dict[str, list[dict]] = {}
    for name, path in targets.items():
        result[name] = _read_jsonl_tail(path, n=n)

    return {
        "status": "ok",
        "scribes": result,
        "provenance": "KN092/BP011 Pawn-Librarian gateway",
    }


def _tool_read_file(args: dict, shadow_pair: Any = None) -> dict:
    """
    Read a workspace file via Shadow-alpha proxy.
    `shadow_pair` is a ShadowPair instance from shadow_pairing.py.
    If no shadow_pair, falls back to direct read (test/stub mode).
    """
    rel_path = args.get("path", "").lstrip("/").lstrip("\\")
    if not rel_path:
        return {"status": "error", "error": "Missing 'path' argument."}

    abs_path = WORKSPACE_ROOT / rel_path

    if shadow_pair is not None:
        # Deliver via Shadow-alpha cooperative proxy
        return shadow_pair.read_file(str(abs_path))

    # Direct read (no Shadow-alpha — test/stub mode)
    try:
        content = abs_path.read_text(encoding="utf-8")
        return {
            "status": "ok",
            "path": rel_path,
            "content": content,
            "proxy_mode": "direct",
            "note": "No Shadow-alpha pair active; direct read used.",
        }
    except FileNotFoundError:
        return {"status": "error", "error": f"File not found: {rel_path}"}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


def _tool_scribe_log(args: dict, scribe_id: str) -> dict:
    """Append an observation to PawnGenerated.jsonl (write-allowed tier)."""
    observation = args.get("observation", "").strip()
    category = args.get("category", "pawn_generated")
    session = args.get("session", "unknown")
    if not observation:
        return {"status": "error", "error": "Missing 'observation' argument."}

    entry = {
        "observation": observation,
        "category": category,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_session": session,
        "source_cathedral": "pawn_cathedral",
        "operator_mediated_sig": True,
        "scribe_id": scribe_id,
    }

    try:
        PAWN_GENERATED.parent.mkdir(parents=True, exist_ok=True)
        with open(PAWN_GENERATED, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")
        return {"status": "ok", "appended": entry}
    except Exception as exc:
        return {"status": "error", "error": str(exc)}


# ── Dispatch table ─────────────────────────────────────────────────────────────

_TOOL_DISPATCH: dict[str, Any] = {
    "mcp__librarian__get_canonical_numbers": lambda args, **_: _tool_get_canonical_numbers(args),
    "mcp__librarian__brief_me":              lambda args, **_: _tool_brief_me(args),
    "mcp__librarian__consult_scribes":       lambda args, **_: _tool_consult_scribes(args),
    "read_file":                             lambda args, **kw: _tool_read_file(args, kw.get("shadow_pair")),
    "mcp__librarian__scribe_log":            lambda args, **kw: _tool_scribe_log(args, kw.get("scribe_id", "R11_pawn_unknown")),
    "mcp__librarian__log_tidbit":            lambda args, **kw: _tool_scribe_log(args, kw.get("scribe_id", "R11_pawn_unknown")),
}


def translate_and_execute(
    tool_name: str,
    tool_call_id: str,
    args: dict,
    *,
    scribe_id: str = "",
    shadow_pair: Any = None,
) -> dict:
    """
    Execute the named tool and return a Perplexity/OpenAI tool-result dict.

    Raises KeyError if the tool is not in the dispatch table.
    """
    handler = _TOOL_DISPATCH.get(tool_name)
    if handler is None:
        return _perplexity_tool_result(
            tool_call_id,
            {"status": "error", "error": f"Tool '{tool_name}' not implemented in gateway."},
        )

    native_result = handler(args, scribe_id=scribe_id, shadow_pair=shadow_pair)
    return _perplexity_tool_result(tool_call_id, native_result)


def list_available_tools() -> list[dict]:
    """Return OpenAI-function-calling schema for all gateway-implemented tools."""
    return [
        {
            "type": "function",
            "function": {
                "name": "mcp__librarian__get_canonical_numbers",
                "description": "Return canonical platform statistics from canonical_values.yaml.",
                "parameters": {"type": "object", "properties": {}, "required": []},
            },
        },
        {
            "type": "function",
            "function": {
                "name": "mcp__librarian__brief_me",
                "description": "Synthesized brief: canonical stats + recent sessions + pheromone signals.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task": {"type": "string", "description": "Current research task (for context)."},
                    },
                    "required": [],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "mcp__librarian__consult_scribes",
                "description": "Read recent entries from Pawn's Cathedral scribes.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scribe": {
                            "type": "string",
                            "enum": ["PawnQueue", "PawnHandoffs", "PawnGenerated", "R11_corpus"],
                            "description": "Scribe name (omit for all scribes).",
                        },
                        "n": {"type": "integer", "description": "Max entries to return (default 10, max 50)."},
                    },
                    "required": [],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "Read a workspace file via Shadow-alpha cooperative proxy.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "Relative path within workspace root."},
                    },
                    "required": ["path"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "mcp__librarian__scribe_log",
                "description": "Append an observation to PawnGenerated.jsonl (write-allowed; R11_pawn_* scribe only).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "observation": {"type": "string"},
                        "category":    {"type": "string"},
                        "session":     {"type": "string"},
                    },
                    "required": ["observation"],
                },
            },
        },
    ]
