"""
augur_securities_negation.py — Negation-Context + Quotation-Context Exemption
KN008 / BP002 / 2026-04-29

Adds per-match context analysis to Augur-Securities-Language:
  - Negation-context exemption: forbidden term preceded/followed by negation marker
    within N tokens → match is exempt (does not fire Augur)
  - Quotation-context exemption: forbidden term inside literal quotes with surrounding
    identifying phrase → match is exempt

Empirical receipts:
  - BP001 turn 14: "Zero Investors" (anti-securities prose) fired false positive
  - BP002 turn 5+: PW001 Pawn-report with literal forbidden terms in research-quotation
    context fired false positive

All exemptions emit provenance (which marker matched, which window) for audit.

Algorithm:
  1. Tokenize text into words (whitespace + punctuation split)
  2. For each pattern in text_patterns, find all regex matches in text
  3. For each match:
     a. Find token position of match start/end in tokenized stream
     b. Check negation-window: any negation marker in [match_token_pos - window, match_token_pos + window]?
     c. Check quotation-context: match inside paired quotes with identifying phrase nearby?
     d. If EITHER check passes → match is exempt; record provenance
  4. If ALL matches are exempt → augur does NOT fire; return False + exemption log
  5. If ANY match is NOT exempt → augur fires; return True

Preserved behaviors (K514.5 / K527):
  - investigate/investigation/investing-in-research still exempt via upstream fix
  - ROI in AI-compute context still exempt via text_anti_patterns (document-level)
  - This module adds FINER-GRAINED per-match context; does NOT replace document-level anti-patterns

Toolsmith log: TS-AUGUR-NEGATION-CONTEXT-KN008-BP002
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple

# ── Negation markers (D.1 pre-ratified) ─────────────────────────────────────
# Start broader; prune false-negatives in v2 per Founder direction.
NEGATION_MARKERS: List[str] = [
    "zero",
    "no",
    "without",
    "anti-",
    "anti",      # handles "anti-securities" and "antisecurities" style
    "non-",
    "non",
    "never",
    "not",
    "free of",
    "absence of",
    "rejecting",
    "refusing",
    "explicitly not",
    "do not have",
    "we don't",
    "we do not",
    "doesn't",
    "does not",
    "isn't",
    "is not",
    "are not",
    "aren't",
]

# ── Quotation identifying phrases (D.3 pre-ratified) ─────────────────────────
QUOTATION_IDENTIFYING_PHRASES: List[str] = [
    "per source",
    "as quoted",
    "pawn return",
    "pawn report",
    "research finding",
    "research result",
    "cited by",
    "according to",
    "quoting",
    "verbatim",
    "per report",
    "from the paper",
    "from the study",
    "the author wrote",
    "they said",
]

# Default negation window: negation marker within 5 tokens of forbidden term
DEFAULT_NEGATION_WINDOW = 5


# ── Tokenizer ────────────────────────────────────────────────────────────────

def _tokenize(text: str) -> List[Tuple[int, int, str]]:
    """
    Tokenize text into (start_char, end_char, token_text) tuples.
    Tokens are whitespace-separated words with leading/trailing punctuation stripped.
    This produces a character-offset stream usable for window checking.
    """
    tokens = []
    for m in re.finditer(r"\S+", text):
        word = m.group(0)
        # Strip punctuation for the actual token text (but keep char offsets to the raw match)
        clean = re.sub(r"^[^a-zA-Z0-9#]+|[^a-zA-Z0-9]+$", "", word).lower()
        tokens.append((m.start(), m.end(), clean))
    return tokens


def _char_pos_to_token_idx(tokens: List[Tuple[int, int, str]], char_pos: int) -> int:
    """
    Find the token index whose range contains char_pos (or is closest to it).
    Returns -1 if tokens is empty.
    """
    if not tokens:
        return -1
    for i, (start, end, _) in enumerate(tokens):
        if start <= char_pos <= end:
            return i
    # If no exact match, find nearest token by distance
    nearest = min(range(len(tokens)), key=lambda i: abs(tokens[i][0] - char_pos))
    return nearest


# ── Negation-context check ────────────────────────────────────────────────────

def _check_negation_window(
    text: str,
    tokens: List[Tuple[int, int, str]],
    match_start: int,
    match_end: int,
    negation_markers: List[str],
    window: int = DEFAULT_NEGATION_WINDOW,
) -> Tuple[bool, str]:
    """
    Check if any negation marker is within `window` tokens of the forbidden-term match.
    Returns (is_exempt: bool, provenance: str).
    """
    match_token_idx = _char_pos_to_token_idx(tokens, match_start)
    if match_token_idx < 0:
        return False, ""

    window_start = max(0, match_token_idx - window)
    window_end   = min(len(tokens) - 1, match_token_idx + window)
    window_tokens = tokens[window_start:window_end + 1]

    # Build window text for multi-word marker matching
    window_text = " ".join(t for _, _, t in window_tokens)

    # Check each negation marker
    for marker in negation_markers:
        marker_clean = marker.rstrip("-").lower()
        # Check in window token text
        if marker_clean in window_text:
            return True, f"Negation marker '{marker}' found within {window}-token window of forbidden term."
        # Also check in raw text window (preserves prefix-attach like "anti-")
        raw_window = text[max(0, tokens[window_start][0] - 5) : tokens[window_end][1] + 5].lower()
        if marker.rstrip("-").lower() in raw_window:
            return True, f"Negation marker '{marker}' found in raw text window of forbidden term."

    return False, ""


# ── Quotation-context check ───────────────────────────────────────────────────

def _check_quotation_context(
    text: str,
    match_start: int,
    match_end: int,
    quotation_phrases: List[str],
    context_window_chars: int = 200,
) -> Tuple[bool, str]:
    """
    Check if the forbidden-term match is inside paired quotes (", ', `) AND
    a quotation-identifying phrase is within `context_window_chars` chars.
    Returns (is_exempt: bool, provenance: str).
    """
    # 1. Check if match is inside paired quotes
    # Strategy: look for balanced quote pairs that contain the match position
    for quote_char in ('"', "'", "`"):
        # Find all quote positions
        quote_positions = [i for i, c in enumerate(text) if c == quote_char]
        # Look for pairs where match is between them
        for i in range(0, len(quote_positions) - 1, 2):
            q_open  = quote_positions[i]
            q_close = quote_positions[i + 1]
            if q_open < match_start and match_end <= q_close:
                # Match is inside this quote pair — check for identifying phrase nearby
                surround_start = max(0, q_open - context_window_chars)
                surround_end   = min(len(text), q_close + context_window_chars)
                surrounding    = text[surround_start:surround_end].lower()
                for phrase in quotation_phrases:
                    if phrase.lower() in surrounding:
                        return True, (
                            f"Forbidden term inside quoted block ('{quote_char}...{quote_char}') "
                            f"with identifying phrase '{phrase}' within {context_window_chars} chars."
                        )

    return False, ""


# ── Main per-match exemption check ───────────────────────────────────────────

def check_match_exempt(
    text: str,
    tokens: List[Tuple[int, int, str]],
    match_start: int,
    match_end: int,
    negation_markers: List[str] = NEGATION_MARKERS,
    quotation_phrases: List[str] = QUOTATION_IDENTIFYING_PHRASES,
    negation_window: int = DEFAULT_NEGATION_WINDOW,
) -> Tuple[bool, str]:
    """
    Check if a single forbidden-term match is exempt via negation or quotation context.
    Returns (is_exempt: bool, provenance: str).
    """
    # Try negation-context first
    exempt, prov = _check_negation_window(text, tokens, match_start, match_end,
                                          negation_markers, negation_window)
    if exempt:
        return True, prov

    # Try quotation-context
    exempt, prov = _check_quotation_context(text, match_start, match_end, quotation_phrases)
    if exempt:
        return True, prov

    return False, ""


# ── Primary API: scan text for non-exempt securities matches ─────────────────

def has_non_exempt_match(
    text_patterns: List[str],
    text: str,
    negation_markers: Optional[List[str]] = None,
    quotation_config: Optional[Dict[str, Any]] = None,
    negation_window: int = DEFAULT_NEGATION_WINDOW,
) -> Tuple[bool, List[dict]]:
    """
    Scan `text` against all `text_patterns`.
    For each match, check if it is exempt via negation or quotation context.

    Returns:
        (has_non_exempt: bool, exemption_log: list[dict])

    has_non_exempt is True → at least one match is NOT exempt → Augur should fire.
    has_non_exempt is False → all matches are exempt → Augur should NOT fire.
    exemption_log records all exempt matches with provenance for audit.
    """
    if negation_markers is None:
        negation_markers = NEGATION_MARKERS
    if quotation_config is None:
        quotation_config = {}

    quotation_phrases = quotation_config.get("identifying_phrases", QUOTATION_IDENTIFYING_PHRASES)

    # Pre-tokenize text once (shared across all patterns)
    tokens = _tokenize(text)

    exemption_log: List[dict] = []
    found_any_match = False
    found_non_exempt = False

    for pattern in text_patterns:
        try:
            for m in re.finditer(pattern, text, re.IGNORECASE | re.DOTALL):
                found_any_match = True
                is_exempt, prov = check_match_exempt(
                    text, tokens,
                    m.start(), m.end(),
                    negation_markers, quotation_phrases, negation_window,
                )
                if is_exempt:
                    exemption_log.append({
                        "pattern": pattern,
                        "matched_text": m.group(0)[:50],
                        "match_start": m.start(),
                        "exempt": True,
                        "provenance": prov,
                    })
                else:
                    found_non_exempt = True
                    exemption_log.append({
                        "pattern": pattern,
                        "matched_text": m.group(0)[:50],
                        "match_start": m.start(),
                        "exempt": False,
                        "provenance": "No negation or quotation context found — match stands.",
                    })
        except re.error:
            continue  # Invalid pattern → skip (fail-safe)

    return found_non_exempt, exemption_log
