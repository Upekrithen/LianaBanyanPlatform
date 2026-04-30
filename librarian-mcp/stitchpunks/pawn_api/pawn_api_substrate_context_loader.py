"""
Pawn-via-API — Component 1: Substrate Context Loader
KN018 / ShadowBishop Cylinder 7

Pre-injects Librarian substrate context into Pawn API system prompt.
Matches Wrasse Scribe pre-injection pattern: context loaded once at dispatch boundary.

Context sources (in priority order):
  1. MoneyPenny brief_me output (canonical memory packet)
  2. Detective canon-search results (relevant innovation/claim hits)
  3. Relevant project memory files (identified by task keywords)

Returns a context string + provenance hash (reproducible on re-load).
Toolsmith log: TS-PAWN-VIA-API-MCP-WRAPPER-KN018-BP002
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_CONFIG_PATH = _HERE / "pawn_api_config.json"


def _load_config() -> Dict[str, Any]:
    if _CONFIG_PATH.exists():
        return json.loads(_CONFIG_PATH.read_text(encoding="utf-8"))
    return {"substrate_context_max_tokens": 8000}


def _rough_token_count(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return len(text) // 4


def load_substrate_context(
    task: str,
    brief_me_content: Optional[str] = None,
    detective_hits: Optional[List[str]] = None,
    memory_files: Optional[List[Path]] = None,
    max_tokens: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Build the substrate context string for Pawn API system prompt injection.

    Parameters:
      task: the research task (used for keyword extraction)
      brief_me_content: output from MoneyPenny brief_me (canonical memory)
      detective_hits: list of Detective canon-search result snippets
      memory_files: list of Path objects to project memory files to include
      max_tokens: max context tokens (defaults to config value)

    Returns:
      { context_str, context_hash, token_estimate, sources_included, truncated }
    """
    config = _load_config()
    budget = max_tokens or config.get("substrate_context_max_tokens", 8000)
    sources: List[str] = []
    sections: List[str] = []

    # Section 1: MoneyPenny brief_me
    if brief_me_content:
        section = f"## Canonical Memory (MoneyPenny brief_me)\n\n{brief_me_content}"
        sections.append(section)
        sources.append("brief_me")

    # Section 2: Detective hits
    if detective_hits:
        hits_text = "\n".join(f"- {hit}" for hit in detective_hits[:20])
        section = f"## Detective Canon Hits\n\n{hits_text}"
        sections.append(section)
        sources.append("detective")

    # Section 3: Project memory files
    if memory_files:
        for mf in memory_files:
            mf = Path(mf)
            if mf.exists():
                content = mf.read_text(encoding="utf-8")[:2000]
                section = f"## Memory File: {mf.name}\n\n{content}"
                sections.append(section)
                sources.append(str(mf.name))

    context_str = "\n\n---\n\n".join(sections) if sections else "(No substrate context loaded)"

    # Truncation: if over budget, trim gracefully
    truncated = False
    estimated_tokens = _rough_token_count(context_str)
    if estimated_tokens > budget:
        # Trim to budget by truncating context_str
        target_chars = budget * 4
        context_str = context_str[:target_chars] + "\n\n[SUBSTRATE CONTEXT TRUNCATED — budget limit reached]"
        truncated = True

    context_hash = hashlib.sha256(context_str.encode()).hexdigest()[:24]

    return {
        "context_str": context_str,
        "context_hash": context_hash,
        "token_estimate": _rough_token_count(context_str),
        "sources_included": sources,
        "truncated": truncated,
    }
