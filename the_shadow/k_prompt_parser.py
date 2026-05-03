"""
K-Prompt Parser — KN-R2 / BP018
=================================
Extracts WRASSE PRE-INJECTION block triggers and Phase A REVIEW
items from K-prompt Markdown files.

Used by PreStagingWorkflow to:
  1. Know which Eblet paths to bulk-load for Wrasse pre-injection
  2. Know which Detective TEAM triggers to dispatch for Phase-0 hits
  3. Know what prerequisite artifacts to sample (Phase A REVIEW items)
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class KPromptManifest:
    """Extracted data from a PROMPT_KNIGHT_*.md file."""
    file_path: str
    title: Optional[str] = None

    # WRASSE PRE-INJECTION block
    wrasse_triggers: list[str] = field(default_factory=list)   # trigger phrase strings
    wrasse_eblet_paths: list[str] = field(default_factory=list)  # Eblet file paths

    # Phase A REVIEW items (numbered review steps)
    phase_a_review_items: list[str] = field(default_factory=list)

    # Dependencies detected from text
    prerequisite_pods: list[str] = field(default_factory=list)  # e.g. "Pod-Q LANDED"
    prerequisite_tags: list[str] = field(default_factory=list)  # e.g. "af1cc47"


# ─── Regex patterns ────────────────────────────────────────────────────────────

_TITLE_RE = re.compile(r"^#\s+(.+)", re.MULTILINE)
_WRASSE_TRIGGER_RE = re.compile(r"\*\*Triggers\*\*:\s*(.+?)(?=\n\n|\*\*Pre-inject|$)", re.DOTALL)
_WRASSE_PRE_INJECT_RE = re.compile(r"\*\*Pre-inject\*\*:\s*(.+?)(?=\n---|\n\n##|\Z)", re.DOTALL)
_EBLET_PATH_RE = re.compile(r"`(~/.+?\.(?:eblet\.md|md))`")
_PHASE_A_RE = re.compile(r"##[^\n]*?phase\s+a[^\n]*?review[^\n]*\n(.*?)(?=\n##|\Z)", re.DOTALL | re.IGNORECASE)
_REVIEW_ITEM_RE = re.compile(r"^\s*\d+\.\s+(.+)", re.MULTILINE)
_PREREQ_LANDED_RE = re.compile(r"(Pod-[A-Z](?:\s+\w+)?\s+LANDED\s+`?([0-9a-f]{7,40})`?)")
_PREREQ_POD_RE = re.compile(r"Pod-[A-Z]\s+LANDED")


def parse_k_prompt(file_path: str) -> KPromptManifest:
    """
    Parse a PROMPT_KNIGHT_*.md file and return a KPromptManifest.
    Non-existent file → returns empty manifest with file_path set.
    """
    path = Path(file_path)
    manifest = KPromptManifest(file_path=str(file_path))

    if not path.exists():
        return manifest

    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return manifest

    # Title
    m = _TITLE_RE.search(text)
    if m:
        manifest.title = m.group(1).strip()

    # WRASSE PRE-INJECTION triggers
    m = _WRASSE_TRIGGER_RE.search(text)
    if m:
        trigger_str = m.group(1).strip()
        manifest.wrasse_triggers = [t.strip() for t in trigger_str.split("/") if t.strip()]

    # WRASSE PRE-INJECTION Eblet paths
    m = _WRASSE_PRE_INJECT_RE.search(text)
    if m:
        inject_block = m.group(1)
        manifest.wrasse_eblet_paths = _EBLET_PATH_RE.findall(inject_block)

    # Phase A REVIEW items (all occurrences)
    for match in _PHASE_A_RE.finditer(text):
        block = match.group(1)
        items = _REVIEW_ITEM_RE.findall(block)
        manifest.phase_a_review_items.extend(items)

    # Prerequisite pods + tags
    for m in _PREREQ_LANDED_RE.finditer(text):
        full = m.group(1).strip()
        tag = m.group(2) if m.group(2) else None
        manifest.prerequisite_pods.append(full)
        if tag:
            manifest.prerequisite_tags.append(tag)

    return manifest
