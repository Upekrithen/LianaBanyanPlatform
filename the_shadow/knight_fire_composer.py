"""
KnightFireComposer — KN-R3 / BP018
=====================================
Composes the paste-text sent to Knight per BP017 Founder-mandatory format:

  - bare-filename inline-block (no bullets, no markdown links, no code-fences)
  - ends with "Bishop runs in parallel — X (advance-permissions: just begin)"

Reference: feedback_knight_fire_format_paste_ready_paths_bp017.md
"""

from __future__ import annotations

from pathlib import Path


def compose_paste_text(
    k_prompt_path: str,
    bishop_parallel_note: str = "Stalk 2 + Stalk 3 K-prompt drafting",
) -> str:
    """
    Build the bare-filename inline-block paste-text for Knight.

    Format (BP017-mandatory):
        PROMPT_KNIGHT_<basename>

        Bishop runs in parallel — <bishop_parallel_note> (advance-permissions: just begin)

    Returns the full paste-text string.
    """
    basename = Path(k_prompt_path).name

    lines = [
        basename,
        "",
        f"Bishop runs in parallel — {bishop_parallel_note} (advance-permissions: just begin)",
    ]
    return "\n".join(lines)


def validate_paste_text(paste_text: str) -> list[str]:
    """
    Returns a list of violation strings (empty = valid).
    Checks BP017 constraints:
      - no markdown bullets (leading -)
      - no markdown links ([text](url))
      - no code-fences (```)
      - must end with advance-permissions footer
    """
    violations: list[str] = []

    lines = paste_text.splitlines()
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("- "):
            violations.append(f"line {i+1}: markdown bullet detected")
        if "```" in line:
            violations.append(f"line {i+1}: code-fence detected")
        if "](" in line:
            violations.append(f"line {i+1}: markdown link detected")

    if "advance-permissions: just begin" not in paste_text:
        violations.append("missing advance-permissions footer")

    return violations
