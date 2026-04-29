"""
Wrasse Scribe Inject — K540/B132

Generates Stone Tablet pre-injection blocks from registry matches.
Implements Phase C.2 of the Wrasse Scribe MVP.

Architecture decision D.2:
  - Bishop: hook-injected-context (see wrasse_hook_ext.py)
  - Knight: prepend-to-prompt (WRASSE PRE-INJECTION section in K-prompt)
  - Pawn: prepend-to-prompt (pawn_with_substrate.py wrapper)

Usage (standalone):
    python wrasse_inject.py "K461 BRIDLE canonical_values.yaml" [--format=knight|bishop|pawn]

Usage (import):
    from wrasse_inject import generate_knight_prelude, generate_pawn_prelude
    prelude = generate_knight_prelude(["K461", "BRIDLE"])
"""

import sys
from typing import List, Optional
from wrasse_lookup import lookup, lookup_for_session

WRASSE_VERSION = "1.0.0"
WRASSE_SESSION = "K540/B132"

# Maximum characters per canonical_resolution in injection output
# Keeps injection compact while preserving substance
MAX_RESOLUTION_CHARS = 400

# Injection size cap (Phase E condition 2 — K-Wrasse-Wiring-Hardening)
# Uses len(text)//4 token-estimate convention matching wrasse_hook_ext.py.
# When the assembled block exceeds this cap, whole entries are dropped
# (oldest-verified first — sort descending by last_verified_ts so oldest
# are at the end, then pop from end) until the block fits.
MAX_INJECTION_TOKENS = 2000


def _truncate(text: str, max_chars: int = MAX_RESOLUTION_CHARS) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars - 3] + "..."


def _estimate_tokens(text: str) -> int:
    """Estimate token count using the len//4 convention."""
    return len(text) // 4


def _apply_size_cap(
    matches: List[dict],
    header_lines: List[str],
    footer_lines: List[str],
    entry_formatter,
    cap: int = MAX_INJECTION_TOKENS,
) -> tuple:
    """
    Enforce MAX_INJECTION_TOKENS on an assembled injection block.

    Strategy: sort matches descending by last_verified_ts (newest first),
    so oldest entries are at the END of the list.  Pop from end until the
    assembled text fits within cap.  Whole entries only — never mid-truncate
    canonical_resolution.

    Returns (final_matches, n_dropped).
    """
    working = list(matches)
    # Sort descending by last_verified_ts so oldest are at the tail
    working.sort(key=lambda m: m.get("last_verified_ts", ""), reverse=True)

    def _assemble(mlist):
        lines = list(header_lines)
        for m in mlist:
            lines.extend(entry_formatter(m))
        lines.extend(footer_lines)
        return "\n".join(lines)

    n_dropped = 0
    while working:
        assembled = _assemble(working)
        if _estimate_tokens(assembled) <= cap:
            break
        working.pop()  # drop oldest (tail of descending sort)
        n_dropped += 1

    return working, n_dropped


def generate_knight_prelude(
    terms: List[str],
    max_matches: int = 20,
    session_id: Optional[str] = None,
) -> str:
    """
    Generate the standard WRASSE PRE-INJECTION section for Knight K-prompts.
    Prepend this to the prompt BEFORE Knight's first reasoning step.

    Returns empty string if no matches found.
    """
    matches = lookup(terms, max_matches=max_matches)
    if not matches:
        return ""

    sid = session_id or "K-?"

    header_lines = [
        "=" * 70,
        f"WRASSE PRE-INJECTION v{WRASSE_VERSION} ({WRASSE_SESSION})",
        f"Session: {sid} | Matches: {len(matches)} | Read BEFORE first reasoning step.",
        "Pre-resolved triggers -- no need to re-derive these from scratch.",
        "=" * 70,
        "",
    ]
    footer_lines = [
        "=" * 70,
        "END WRASSE PRE-INJECTION -- proceed with task.",
        "=" * 70,
    ]

    def _format_entry(m):
        return [
            f"[{m['trigger_id']}] {m['trigger_class'].upper()}: {m['trigger_pattern']}",
            f"  {_truncate(m['canonical_resolution'])}",
            "",
        ]

    final_matches, n_dropped = _apply_size_cap(matches, header_lines, footer_lines, _format_entry)

    lines = list(header_lines)
    for m in final_matches:
        lines.extend(_format_entry(m))
    if n_dropped > 0:
        lines.append(f"[Wrasse: dropped {n_dropped} entries to fit MAX_INJECTION_TOKENS={MAX_INJECTION_TOKENS}]")
        lines.append("")
    lines.extend(footer_lines)
    return "\n".join(lines)


def generate_pawn_prelude(
    terms: List[str],
    max_matches: int = 15,
) -> str:
    """
    Generate WRASSE PRE-INJECTION for Pawn dispatch wrappers.
    More compact than Knight prelude -- Pawn context window is smaller.
    """
    matches = lookup(terms, max_matches=max_matches)
    if not matches:
        return ""

    header_lines = [
        f"[WRASSE v{WRASSE_VERSION}] Pre-resolved context ({len(matches)} items):",
        "",
    ]
    footer_lines = [""]

    def _format_entry(m):
        return [f"  {m['trigger_pattern']}: {_truncate(m['canonical_resolution'], 200)}"]

    final_matches, n_dropped = _apply_size_cap(matches, header_lines, footer_lines, _format_entry)

    lines = list(header_lines)
    for m in final_matches:
        lines.extend(_format_entry(m))
    if n_dropped > 0:
        lines.append(f"[Wrasse: dropped {n_dropped} entries to fit MAX_INJECTION_TOKENS={MAX_INJECTION_TOKENS}]")
    lines.extend(footer_lines)
    return "\n".join(lines)


def generate_bishop_hook_block(
    recent_session_context: str,
    max_matches: int = 10,
) -> str:
    """
    Generate compact WRASSE block for Bishop SessionStart hook injection.
    Called by wrasse_hook_ext.py when reading bishop_last_* state files.

    Returns empty string if no matches found (hook should skip silently).
    """
    matches = lookup_for_session(recent_session_context, max_matches=max_matches)
    if not matches:
        return ""

    header_lines = [f"[Wrasse/{WRASSE_SESSION}] {len(matches)} pre-resolved context items:"]
    footer_lines = []

    def _format_entry(m):
        return [f"  [{m['trigger_id']}] {m['trigger_pattern']}: {_truncate(m['canonical_resolution'], 150)}"]

    final_matches, n_dropped = _apply_size_cap(matches, header_lines, footer_lines, _format_entry)

    lines = list(header_lines)
    for m in final_matches:
        lines.extend(_format_entry(m))
    if n_dropped > 0:
        lines.append(f"[Wrasse: dropped {n_dropped} entries to fit MAX_INJECTION_TOKENS={MAX_INJECTION_TOKENS}]")
    return "\n".join(lines)


def inject_into_prompt_file(
    prompt_file_path: str,
    session_id: str,
    extra_terms: Optional[List[str]] = None,
    dry_run: bool = True,
) -> str:
    """
    Read an existing K-prompt file and inject the Wrasse prelude after the
    MANDATORY FIRST ACTION section (or at the very top if not found).

    Args:
        prompt_file_path: Path to the PROMPT_KNIGHT_K*.md file
        session_id: e.g. "K540"
        extra_terms: Additional terms to look up (beyond file content)
        dry_run: If True, return modified content without writing to disk

    Returns the modified content string.
    """
    with open(prompt_file_path, "r", encoding="utf-8") as fh:
        original = fh.read()

    # Extract terms from prompt content + extra_terms
    terms = [original]
    if extra_terms:
        terms.extend(extra_terms)

    prelude = generate_knight_prelude(terms, session_id=session_id)
    if not prelude:
        return original  # No matches; leave file unchanged

    # Insert prelude after first heading or at start
    import re
    heading_match = re.search(r"(^#[^\n]+\n)", original, re.MULTILINE)
    if heading_match:
        insert_at = heading_match.end()
        modified = original[:insert_at] + "\n" + prelude + "\n\n" + original[insert_at:]
    else:
        modified = prelude + "\n\n" + original

    if not dry_run:
        with open(prompt_file_path, "w", encoding="utf-8") as fh:
            fh.write(modified)

    return modified


if __name__ == "__main__":
    fmt = "knight"
    args = [a for a in sys.argv[1:] if not a.startswith("--format=")]
    for a in sys.argv[1:]:
        if a.startswith("--format="):
            fmt = a.split("=", 1)[1]

    if not args:
        print("Usage: python wrasse_inject.py '<query>' [--format=knight|bishop|pawn]")
        sys.exit(1)

    query = " ".join(args)

    if fmt == "knight":
        output = generate_knight_prelude([query], session_id="K?")
    elif fmt == "pawn":
        output = generate_pawn_prelude([query])
    elif fmt == "bishop":
        output = generate_bishop_hook_block(query)
    else:
        print(f"Unknown format: {fmt}. Use knight, bishop, or pawn.")
        sys.exit(1)

    if output:
        print(output)
    else:
        print("No registry matches found for that query.")
