#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
medium_adapter.py -- Medium Re-Post Pipeline (BP072 Wave 3 / Scope 2)
======================================================================
Prepares Substack articles for re-post on Medium with:
  1. Canonical-link header so Medium does NOT index ahead of Substack/Cephas
     (avoids SEO duplicate penalty).
  2. Author byline normalized to LB editorial voice.
  3. Tag generation from the article's front-matter.
  4. Import-API payload structure (ready to paste into Medium's Import URL tool
     OR submit via the unofficial Medium Import API endpoint).

HOLD: Nothing is auto-published. Founder posts manually.
SEO DOCTRINE: Every Medium post MUST include:
  - canonicalUrl pointing to the Substack/Cephas original
  - notifyFollowers: true (default for cross-posts)
  - publishStatus: 'draft' (Founder promotes to 'public')

Usage:
  python medium_adapter.py <substack_ready.md> [--canonical-url URL] [--out OUTPUT]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Constants ─────────────────────────────────────────────────────────────────

SUBSTACK_BASE = "https://lianabanyan.substack.com"
CEPHAS_BASE = "https://lianabanyan.com/cephas"

# Tags to prepend for all LB Medium posts
BASE_TAGS = ["Cooperative Economics", "Platform Design", "Tech Policy"]

# Medium Import API endpoint (unofficial -- Founder must supply integration token)
MEDIUM_IMPORT_URL = "https://medium.com/p/import"

# ── Data structures ───────────────────────────────────────────────────────────


@dataclass
class MediumPayload:
    """Structured payload for a Medium cross-post."""
    title: str
    content_html: str          # HTML body (Medium ingests markdown via import URL)
    canonical_url: str         # REQUIRED -- points back to Substack/Cephas original
    tags: list[str] = field(default_factory=list)
    publish_status: str = "draft"   # always draft -- Founder promotes manually
    notify_followers: bool = True
    license: str = "all-rights-reserved"


@dataclass
class MediumCrosspostReport:
    source_file: Path
    canonical_url: str
    title: str
    tags: list[str] = field(default_factory=list)
    content_lines: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


# ── Core functions ────────────────────────────────────────────────────────────

def _strip_substack_scaffold(lines: list[str]) -> list[str]:
    """Remove the Substack crosspost scaffold comments and voice-report block."""
    out: list[str] = []
    in_voice_report = False
    for line in lines:
        if "## 📌 Substack Notes Candidates" in line:
            break  # everything from here is Substack-specific; stop
        if "## 🔍 Voice Normalization Report" in line:
            in_voice_report = True
        if in_voice_report:
            continue
        if line.startswith("<!-- SUBSTACK CROSSPOST SCAFFOLD") or line.startswith("<!--"):
            continue
        if line.strip() == "-->":
            continue
        out.append(line)
    return out


def _extract_title(lines: list[str]) -> tuple[str, list[str]]:
    """Extract the first H1 heading as the title, returning remaining lines."""
    for i, line in enumerate(lines):
        if line.startswith("# "):
            title = line[2:].strip()
            return title, lines[:i] + lines[i + 1:]
    # No H1 found
    return "Untitled", lines


def _extract_tags_from_frontmatter(lines: list[str]) -> list[str]:
    """Extract tags from a YAML-like front-matter block (if present)."""
    tags: list[str] = []
    in_fm = False
    for line in lines:
        stripped = line.strip()
        if stripped == "---":
            in_fm = not in_fm
            continue
        if in_fm and stripped.startswith("tags:"):
            raw = stripped[5:].strip()
            parts = [t.strip().strip('"').strip("'") for t in raw.strip("[]").split(",")]
            tags = [p for p in parts if p]
    return tags


def _inject_canonical_header(lines: list[str], canonical_url: str) -> list[str]:
    """
    Prepend a canonical-link notice at the top of the body.
    This is rendered on Medium and signals to search engines that the
    canonical source is on Substack/Cephas.
    """
    header = [
        f"*Originally published at [{canonical_url}]({canonical_url}). "
        "This cross-post includes a canonical link back to the original.",
        "",
    ]
    return header + lines


def _add_medium_cta_footer(lines: list[str]) -> list[str]:
    """Add a non-promotional footer pointing readers to the Substack list."""
    footer = [
        "",
        "---",
        "",
        "*Liana Banyan is a cooperative platform corporation. "
        "The Substack newsletter is the home base for long-form updates -- "
        "no comment replies, no DMs required. "
        "Membership is $5/year at [lianabanyan.com](https://lianabanyan.com).*",
    ]
    return lines + footer


def process_for_medium(
    source_path: Path,
    canonical_url: str,
) -> MediumCrosspostReport:
    text = source_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    report = MediumCrosspostReport(
        source_file=source_path,
        canonical_url=canonical_url,
        title="Untitled",
    )

    # 1. Strip Substack scaffold artifacts
    lines = _strip_substack_scaffold(lines)

    # 2. Extract article-level tags from front-matter
    fm_tags = _extract_tags_from_frontmatter(lines)
    report.tags = (BASE_TAGS + fm_tags)[:5]  # Medium allows up to 5 tags

    # 3. Extract H1 title
    report.title, lines = _extract_title(lines)

    # 4. Inject canonical header
    lines = _inject_canonical_header(lines, canonical_url)

    # 5. Append CTA footer
    lines = _add_medium_cta_footer(lines)

    # 6. Warn if any placeholder text remains
    for i, line in enumerate(lines, 1):
        if "[FILL IN]" in line or "[FLAG" in line or "[NEEDS MEASUREMENT" in line:
            report.warnings.append(f"Line {i}: unresolved placeholder -- {line.strip()[:80]}")

    report.content_lines = lines
    return report


def build_medium_payload(report: MediumCrosspostReport) -> MediumPayload:
    content_md = "\n".join(report.content_lines)
    return MediumPayload(
        title=report.title,
        content_html=content_md,  # Medium Import tool accepts markdown
        canonical_url=report.canonical_url,
        tags=report.tags,
        publish_status="draft",
        notify_followers=True,
    )


def write_output(report: MediumCrosspostReport, output_path: Path) -> None:
    # Write the cleaned markdown
    md_path = output_path.with_suffix(".md")
    md_path.write_text("\n".join(report.content_lines), encoding="utf-8")

    # Write the Medium payload JSON (for the Import API)
    payload = build_medium_payload(report)
    json_path = output_path.with_suffix(".medium_payload.json")
    json_path.write_text(json.dumps(asdict(payload), indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\n[medium_adapter] Markdown  -> {md_path}")
    print(f"[medium_adapter] Payload   -> {json_path}")
    print(f"[medium_adapter] Canonical -> {report.canonical_url}")
    print(f"[medium_adapter] Tags      -> {report.tags}")
    if report.warnings:
        print(f"\n[medium_adapter] WARNINGS ({len(report.warnings)}):")
        for w in report.warnings:
            print(f"  - {w}")
    print("\nFOUNDER: Import the .md via Medium's Import URL tool OR paste payload JSON")
    print("         into the Medium API. Promote from 'draft' to 'public' manually.")
    print("         canonical_url MUST remain set to avoid SEO duplicate penalty.")


def print_summary(report: MediumCrosspostReport) -> None:
    print(f"\n{'='*60}")
    print(f"MEDIUM CROSS-POST REPORT: {report.source_file.name}")
    print(f"{'='*60}")
    print(f"  Title:        {report.title}")
    print(f"  Canonical:    {report.canonical_url}")
    print(f"  Tags:         {', '.join(report.tags)}")
    print(f"  Lines:        {len(report.content_lines)}")
    print(f"  Warnings:     {len(report.warnings)}")
    if report.warnings:
        for w in report.warnings[:3]:
            print(f"    - {w}")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Medium Re-Post Adapter -- LB BP072 Wave 3 Scope 2"
    )
    parser.add_argument("input_file", metavar="FILE",
                        help="Substack-ready .md file (output of substack_crosspost.py)")
    parser.add_argument("--canonical-url", metavar="URL", default=None,
                        help="Canonical URL for the original Substack/Cephas post (REQUIRED for SEO)")
    parser.add_argument("--out", metavar="OUTPUT", default=None,
                        help="Output base path (default: <input_stem>_medium next to input)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print report only; do not write output")

    args = parser.parse_args()

    source_path = Path(args.input_file).resolve()
    if not source_path.exists():
        print(f"ERROR: File not found: {source_path}", file=sys.stderr)
        sys.exit(1)

    if not args.canonical_url:
        stem = source_path.stem.replace("_substack", "")
        canonical_url = f"{SUBSTACK_BASE}/p/{stem}"
        print(f"[medium_adapter] No --canonical-url provided; defaulting to: {canonical_url}")
        print(f"[medium_adapter] Verify this URL is correct before publishing.")
    else:
        canonical_url = args.canonical_url

    if args.out:
        output_path = Path(args.out).resolve()
    else:
        stem = source_path.stem.replace("_substack", "")
        output_path = source_path.parent / f"{stem}_medium"

    report = process_for_medium(source_path, canonical_url)
    print_summary(report)

    if args.dry_run:
        print("\n[dry-run] No output written.")
    else:
        write_output(report, output_path)


if __name__ == "__main__":
    main()
