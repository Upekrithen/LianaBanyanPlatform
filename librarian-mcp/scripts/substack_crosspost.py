#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
substack_crosspost.py — K478/B122 Substack Cross-Post Pipeline Scaffolding
==========================================================================
Reads a Pudding source file (markdown) from BISHOP_DROPZONE/09_Articles/
and emits a Substack-ready variant with:

  1. Editorial-voice normalization (walled-garden → user-sovereignty framing)
  2. A linked list of Spoonful candidates for Substack Notes in the same week
  3. A metadata header with Substack publication fields ready to fill

This script SCAFFOLDS only. Founder reviews and posts personally.
Nothing is auto-published. Publication hold is IN FORCE until Prov 14 receipt.

Usage:
  python substack_crosspost.py <input_article.md> [--out <output.md>] [--dry-run]

Arguments:
  input_article.md   Path to source Pudding article (markdown)
  --out PATH         Output path (default: <input_stem>_substack.md next to input)
  --dry-run          Print report only; do not write output file

Voice normalization rules (from SUBSTACK_EDITORIAL_VOICE.md):
  - Replace walled-garden framings with user-sovereignty equivalents
  - Flag unsubstantiated empirical claims (numbers without methodology citations)
  - Flag Keystone drift (known Keystones stripped or watered)
  - Suggest Spoonful Notes candidates from H2/H3 sections
"""
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── Constants ────────────────────────────────────────────────────────────────

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent

# Anti-pattern framings (walled-garden / platform-centric)
ANTI_PATTERNS: list[tuple[str, str]] = [
    (r"(?i)we'?ve built the best ai", "we built a very fast horse"),
    (r"(?i)best ai for you", "infrastructure you control"),
    (r"(?i)come inside our (platform|ecosystem|walled garden)", "the protocol is in the commons"),
    (r"(?i)our ai (knows|decides|selects)", "the architecture routes"),
    (r"(?i)liana banyan('?s)? ai", "the Librarian / Cathedral"),
    (r"(?i)our ecosystem", "the commons architecture"),
    (r"(?i)our proprietary", "our implementation of the commons protocol"),
    (r"(?i)significantly better", "[NEEDS MEASUREMENT: significantly better → cite delta]"),
    (r"(?i)dramatically improved", "[NEEDS MEASUREMENT: dramatically improved → cite delta]"),
    (r"(?i)amazing features", "[FLAG: adjectives only — cite what the feature does]"),
    (r"(?i)coming soon", "[FLAG: publication hold — confirm Prov 14 receipt before publishing]"),
]

# Rhetorical Keystones — if any of these appear, they must be preserved
KEYSTONES: list[tuple[str, str]] = [
    ("potatoes at the end of a hoe handle", "#3 potatoes"),
    ("i have two suits", "#4 two suits"),
    ("and i have two suits", "#4 two suits"),
    ("especially from friendly fire", "#2 friendly fire"),
    ("nothing about us without us", "#6 nothing-about-us"),
    ("the eighty percent", "#7 eighty percent"),
    ("no plan survives first contact", "#9 no-plan"),
    ("medallions are minted", "#10 medallions"),
    ("help each other help ourselves", "#11 help-each-other"),
    ("i read a lot", "#12 i-read-a-lot"),
    ("affected whether i", "#13 WHETHER"),
    ("system of wells", "#14 system-of-wells"),
    ("trenches of poordom", "#15 poordom"),
    ("measures its own value", "#16 anti-opacity"),
    ("reins of our very fast horse", "#17 reins"),
    ("we hand them the reins", "#17 reins"),
    ("scribes sing together", "#18 harmony"),
    ("basically tcp/ip", "#19 tcpip"),
]

# Empirical claim signals (numbers that should cite methodology)
EMPIRICAL_PATTERN = re.compile(
    r"(\d+\.?\d*\s*%|\d+\.?\d*x|\d+\.?\d*\s*pp|\d+\.?\d*\s*percent|"
    r"accuracy|precision|recall|hot%|hit%|miss%|benchmark|measured)"
    ,re.IGNORECASE
)

METHODOLOGY_CITATIONS = ["K475", "K474", "K473", "K472", "K471", "R10", "R11", "R12",
                          "methodology", "arm", "questions", "grading rubric", "benchmark"]


# ─── Data structures ──────────────────────────────────────────────────────────

@dataclass
class CrosspostReport:
    source_file: Path
    anti_pattern_hits: list[tuple[int, str, str]] = field(default_factory=list)  # (line, original, suggestion)
    keystone_found: list[str] = field(default_factory=list)
    empirical_flags: list[tuple[int, str]] = field(default_factory=list)  # (line, snippet)
    spoonful_candidates: list[tuple[str, str]] = field(default_factory=list)  # (heading, first_sentence)
    normalized_lines: list[str] = field(default_factory=list)


# ─── Core functions ───────────────────────────────────────────────────────────

def normalize_line(line: str, lineno: int, report: CrosspostReport) -> str:
    """Apply voice normalization to a single line."""
    normalized = line

    for pattern, replacement in ANTI_PATTERNS:
        match = re.search(pattern, normalized)
        if match:
            original = match.group(0)
            if "[NEEDS MEASUREMENT" in replacement or "[FLAG" in replacement:
                report.anti_pattern_hits.append((lineno, original, replacement))
                normalized = re.sub(pattern, replacement, normalized, count=1, flags=re.IGNORECASE)
            else:
                report.anti_pattern_hits.append((lineno, original, f"→ {replacement}"))
                normalized = re.sub(pattern, replacement, normalized, count=1, flags=re.IGNORECASE)

    return normalized


def check_keystone_preservation(line: str, report: CrosspostReport) -> None:
    """Check if a known Keystone appears and record it."""
    lower = line.lower()
    for fragment, keystone_id in KEYSTONES:
        if fragment.lower() in lower and keystone_id not in report.keystone_found:
            report.keystone_found.append(keystone_id)


def check_empirical_claims(line: str, lineno: int, report: CrosspostReport) -> None:
    """Flag empirical claims that may lack methodology citations."""
    if EMPIRICAL_PATTERN.search(line):
        has_citation = any(c.lower() in line.lower() for c in METHODOLOGY_CITATIONS)
        if not has_citation:
            snippet = line.strip()[:120]
            report.empirical_flags.append((lineno, snippet))


def extract_spoonful_candidates(lines: list[str], report: CrosspostReport) -> None:
    """Extract H2/H3 section headings as Substack Notes candidates."""
    current_heading = ""
    current_body_lines: list[str] = []

    def flush():
        if current_heading and current_body_lines:
            # First non-empty, non-heading sentence in the section
            for bl in current_body_lines:
                stripped = bl.strip()
                if stripped and not stripped.startswith("#") and not stripped.startswith("---"):
                    first_sentence = stripped[:200]
                    report.spoonful_candidates.append((current_heading, first_sentence))
                    break

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("## ") or stripped.startswith("### "):
            flush()
            current_heading = stripped.lstrip("# ").strip()
            current_body_lines = []
        else:
            if current_heading:
                current_body_lines.append(line)

    flush()


def build_substack_header(source_path: Path) -> list[str]:
    """Build a Substack publication metadata header."""
    stem = source_path.stem
    return [
        "<!-- SUBSTACK CROSSPOST SCAFFOLD — K478/B122 -->",
        "<!-- Founder reviews and publishes manually. Nothing auto-published. -->",
        "<!--",
        f"  SOURCE: {source_path.name}",
        "  PUBLICATION HOLD: IN FORCE until Prov 14 receipt",
        "",
        "  SUBSTACK FIELDS (fill before publishing):",
        "  - Title: [FILL IN]",
        "  - Subtitle: [FILL IN]",
        "  - Section: (optional — if using sections for empirical vs essays)",
        "  - Publish date: [FILL IN — hold until Prov 14 + Founder ratification]",
        "  - Is paid-only?: No (all LB posts are free by default)",
        "  - Cover image: [FILL IN or omit]",
        "  - Audio narration: Not at launch",
        "-->",
        "",
    ]


def build_spoonful_notes_block(candidates: list[tuple[str, str]]) -> list[str]:
    """Build a block of Substack Notes candidates from spoonful sections."""
    if not candidates:
        return []
    lines = [
        "",
        "---",
        "",
        "## 📌 Substack Notes Candidates — Same-Week Spoonfuls",
        "",
        "*(Each of the following can be posted as a Substack Note in the same week "
        "as the main post. Notes drive discovery; the main post is the depth layer.)*",
        "",
    ]
    for i, (heading, first_sentence) in enumerate(candidates[:6], 1):
        lines.append(f"### Note {i}: \"{heading}\"")
        lines.append("")
        lines.append(f"> {first_sentence}")
        if not first_sentence.endswith("..."):
            lines.append("> [...]")
        lines.append("")
        lines.append(f"*→ Full context in the main post. Link in Note body.*")
        lines.append("")

    return lines


def build_voice_report_block(report: CrosspostReport) -> list[str]:
    """Build an editorial voice report appended to the output."""
    lines = [
        "",
        "---",
        "",
        "## 🔍 Voice Normalization Report",
        "*(For Founder's review. Remove this section before publishing.)*",
        "",
    ]

    if report.anti_pattern_hits:
        lines.append("### Anti-Pattern Hits (applied automatically)")
        lines.append("")
        for lineno, original, suggestion in report.anti_pattern_hits:
            lines.append(f"- Line {lineno}: `{original}` → `{suggestion}`")
        lines.append("")
    else:
        lines.append("### Anti-Pattern Hits")
        lines.append("*None detected.*")
        lines.append("")

    if report.keystone_found:
        lines.append("### Keystones Preserved ✓")
        lines.append("")
        for kid in report.keystone_found:
            lines.append(f"- {kid}")
        lines.append("")

    if report.empirical_flags:
        lines.append("### Empirical Claims Needing Methodology Citations ⚠️")
        lines.append("")
        for lineno, snippet in report.empirical_flags[:10]:
            lines.append(f"- Line {lineno}: `{snippet}`")
            lines.append("  → Add methodology citation: which benchmark (K475, R12, etc.), N, arms, rubric")
        lines.append("")
    else:
        lines.append("### Empirical Claims")
        lines.append("*No unsupported empirical claims detected (or none present).*")
        lines.append("")

    lines.append("### Editorial Voice Checklist")
    lines.append("")
    lines.append("- [ ] 'Here's the horse, your reins' framing (not 'come into our platform')")
    lines.append("- [ ] Every number cites its methodology")
    lines.append("- [ ] No Keystones stripped or watered")
    lines.append("- [ ] Pre-empirical content labeled as conceptual (if applicable)")
    lines.append("- [ ] Closing move gives reader something actionable")
    lines.append("- [ ] Publication hold confirmed clear (Prov 14 receipt + Founder ratification)")
    lines.append("")

    return lines


def process_article(source_path: Path) -> CrosspostReport:
    """Full pipeline: read, normalize, analyze, build report."""
    text = source_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    report = CrosspostReport(source_file=source_path)

    normalized_output: list[str] = []
    for i, line in enumerate(lines, 1):
        normalized = normalize_line(line, i, report)
        check_keystone_preservation(line, report)
        check_empirical_claims(line, i, report)
        normalized_output.append(normalized)

    report.normalized_lines = normalized_output
    extract_spoonful_candidates(lines, report)

    return report


def write_output(report: CrosspostReport, output_path: Path) -> None:
    """Write the Substack-ready output file."""
    header = build_substack_header(report.source_file)
    body = report.normalized_lines
    spoonfuls = build_spoonful_notes_block(report.spoonful_candidates)
    voice_report = build_voice_report_block(report)

    all_lines = header + body + spoonfuls + voice_report
    output_path.write_text("\n".join(all_lines), encoding="utf-8")
    print(f"\n✓ Output written to: {output_path}")


def print_summary(report: CrosspostReport) -> None:
    """Print a console summary of the report."""
    print(f"\n{'='*60}")
    print(f"SUBSTACK CROSSPOST REPORT: {report.source_file.name}")
    print(f"{'='*60}")
    print(f"  Anti-pattern hits (normalized): {len(report.anti_pattern_hits)}")
    print(f"  Keystones found + preserved:    {len(report.keystone_found)}")
    print(f"  Empirical flags (needs cite):   {len(report.empirical_flags)}")
    print(f"  Spoonful Notes candidates:      {len(report.spoonful_candidates)}")

    if report.anti_pattern_hits:
        print(f"\n  Anti-pattern corrections:")
        for lineno, original, suggestion in report.anti_pattern_hits[:5]:
            print(f"    L{lineno}: '{original[:50]}' → '{suggestion[:50]}'")
        if len(report.anti_pattern_hits) > 5:
            print(f"    ... and {len(report.anti_pattern_hits) - 5} more")

    if report.empirical_flags:
        print(f"\n  Empirical flags (add methodology citation):")
        for lineno, snippet in report.empirical_flags[:3]:
            print(f"    L{lineno}: {snippet[:80]}")
        if len(report.empirical_flags) > 3:
            print(f"    ... and {len(report.empirical_flags) - 3} more")

    if report.spoonful_candidates:
        print(f"\n  Spoonful Notes candidates:")
        for heading, _ in report.spoonful_candidates[:4]:
            print(f"    - \"{heading}\"")

    print(f"\n  Publication hold: IN FORCE — do not publish without Prov 14 receipt + Founder ratification")
    print(f"{'='*60}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Substack Cross-Post Pipeline — LB K478/B122"
    )
    parser.add_argument(
        "input_file", metavar="FILE",
        help="Source Pudding article (.md) from BISHOP_DROPZONE/09_Articles/"
    )
    parser.add_argument(
        "--out", metavar="OUTPUT", default=None,
        help="Output path (default: <input_stem>_substack.md next to input)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Print report only; do not write output file"
    )
    args = parser.parse_args()

    source_path = Path(args.input_file).resolve()
    if not source_path.exists():
        print(f"ERROR: File not found: {source_path}", file=sys.stderr)
        sys.exit(1)

    if args.out:
        output_path = Path(args.out).resolve()
    else:
        output_path = source_path.parent / f"{source_path.stem}_substack.md"

    print(f"[crosspost] Processing: {source_path.name}")
    report = process_article(source_path)
    print_summary(report)

    if args.dry_run:
        print("\n[dry-run] No output file written.")
    else:
        write_output(report, output_path)


if __name__ == "__main__":
    main()
