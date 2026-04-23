"""
SP-20 POLLINATOR (K425 / B111-B113)
====================================
Propagation-forward stitchpunk. Takes ratified canonical sentences from Bishop
memory + Founder-reviewed docs and ensures they appear, unchanged, in every
target surface that thematically requires them.

Pollen = ratified canonical text
Flowers = target surfaces (docs, blueprints, scoreboards, preload files)
Bees = this script's propagation mechanism

Unlike SP-15 (extraction from transcripts) or SP-16 (creative recombination),
SP-20 is directed pollination: Bishop specifies what goes where.

Usage (CLI):
    python sp20_pollinator.py --dry-run              # default: show plan, change nothing
    python sp20_pollinator.py --apply                 # write changes to auto-safe surfaces
    python sp20_pollinator.py --surface blueprints    # limit to one surface
    python sp20_pollinator.py --verify                # drift-check only, no writes
    python sp20_pollinator.py --backlog               # print current backlog

Surfaces with human-review gates (Crown Letters, public papers) get pollination
REQUEST artifacts, never auto-written changes. Bishop reviews before propagation.

Author: Knight K425 (Cursor), April 21, 2026. Founder-ratified B111.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = SCRIPT_DIR / "data"

STATE_FILE = DATA_DIR / "pollination_state.json"
BACKLOG_FILE = DATA_DIR / "pollination_backlog.md"

BISHOP_MEMORY = Path.home() / ".claude" / "projects" / "C--Users-Administrator-Documents" / "memory"
FOUNDER_REVIEW = PROJECT_ROOT / "BISHOP_DROPZONE" / "00_FOUNDER_REVIEW"
CANONICAL_REFS = PROJECT_ROOT / "BISHOP_DROPZONE" / "14_CanonicalReferences"
PRELOAD_VOICE = PROJECT_ROOT / "librarian-mcp-public" / "preload" / "founder_voice"
BLUEPRINTS_DIR = PROJECT_ROOT / "docs" / "blueprints"
AI_TUNING_DIR = PROJECT_ROOT / "docs" / "ai_tuning"
POLLINATION_REQUESTS_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "16_POLLINATION_REQUESTS"

SURFACE_AUTO = "auto"
SURFACE_REVIEW = "review"

SURFACE_REGISTRY: dict[str, dict] = {
    "blueprints": {
        "path": BLUEPRINTS_DIR,
        "gate": SURFACE_AUTO,
        "description": "Platform blueprints and design docs",
    },
    "ai_tuning": {
        "path": AI_TUNING_DIR,
        "gate": SURFACE_AUTO,
        "description": "AI Tuning documentation",
    },
    "preload_voice": {
        "path": PRELOAD_VOICE,
        "gate": SURFACE_AUTO,
        "description": "Public preload founder_voice files (librarian-mcp-public)",
    },
    "canonical_refs": {
        "path": CANONICAL_REFS,
        "gate": SURFACE_AUTO,
        "description": "Canonical references in BISHOP_DROPZONE",
    },
    "crown_letters": {
        "path": FOUNDER_REVIEW,
        "gate": SURFACE_REVIEW,
        "description": "Crown Letters and public papers (REQUIRES Bishop review)",
    },
}


@dataclass
class PollenItem:
    """A canonical sentence/concept eligible for pollination."""

    id: str
    text: str
    source_file: str
    source_context: str
    target_surfaces: list[str]
    keystone_number: Optional[int] = None


@dataclass
class PollinationRecord:
    """Tracks that a specific pollen item has been propagated to a surface."""

    pollen_id: str
    surface: str
    target_file: str
    text_hash: str
    timestamp: str
    status: str = "applied"


@dataclass
class DriftReport:
    """Report on detected drift for a pollen item at a surface."""

    pollen_id: str
    surface: str
    target_file: str
    expected_text: str
    found_text: Optional[str]
    drift_type: str  # "missing", "mutated", "ok"


def _text_hash(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text.strip().lower())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]


def _fuzzy_contains(haystack: str, needle: str, threshold: float = 0.85) -> tuple[bool, Optional[str]]:
    """Check if haystack contains needle (fuzzy). Returns (found, matched_text)."""
    needle_norm = re.sub(r"\s+", " ", needle.strip())
    if needle_norm in haystack:
        return True, needle_norm

    needle_words = needle_norm.lower().split()
    if len(needle_words) < 4:
        return needle_norm.lower() in haystack.lower(), needle_norm

    haystack_lower = haystack.lower()
    window = len(needle_norm) + 50
    for i in range(0, max(1, len(haystack_lower) - window + 1), 10):
        chunk = haystack_lower[i : i + window]
        matches = sum(1 for w in needle_words if w in chunk)
        if matches / len(needle_words) >= threshold:
            return True, haystack[i : i + window].strip()

    return False, None


class PollinationState:
    """Persistent state tracking which items have been pollinated where."""

    def __init__(self, state_file: Path = STATE_FILE):
        self.state_file = state_file
        self.records: list[PollinationRecord] = []
        self._load()

    def _load(self):
        if self.state_file.exists():
            try:
                data = json.loads(self.state_file.read_text(encoding="utf-8"))
                self.records = [PollinationRecord(**r) for r in data.get("records", [])]
            except (json.JSONDecodeError, TypeError):
                self.records = []

    def save(self):
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        data = {"records": [asdict(r) for r in self.records], "last_updated": _now_iso()}
        self.state_file.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    def is_pollinated(self, pollen_id: str, surface: str, text_hash: str) -> bool:
        return any(
            r.pollen_id == pollen_id and r.surface == surface and r.text_hash == text_hash
            for r in self.records
        )

    def record(self, pollen_id: str, surface: str, target_file: str, text_hash: str):
        self.records.append(
            PollinationRecord(
                pollen_id=pollen_id,
                surface=surface,
                target_file=target_file,
                text_hash=text_hash,
                timestamp=_now_iso(),
            )
        )


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def build_day1_backlog() -> list[PollenItem]:
    """Day-1 pollination backlog per B111 stub + B113 addendum."""
    items: list[PollenItem] = []

    items.append(
        PollenItem(
            id="collaboration-sentence-b111",
            text=(
                "Your correction simplified the legal story, clarified the two-track economy, "
                "and gave me the language to describe the cooperative's actual shape. The mistake "
                "was mine for assuming; the correction was quick because you were specific."
            ),
            source_file=str(BISHOP_MEMORY / "project_founder_bishop_collaboration_dynamic.md"),
            source_context="Founder-ratified B111 canonical sentence on Bishop-Founder collaboration",
            target_surfaces=["ai_tuning", "blueprints"],
        )
    )

    items.append(
        PollenItem(
            id="wellspring-keystone-14",
            text=(
                "A rising tide lifts all boats. And I think I've built a system of wells."
            ),
            source_file=str(PRELOAD_VOICE / "rhetorical_keystones.md"),
            source_context="Keystone #14 — Economic-sovereignty anchor (Wellspring Model)",
            target_surfaces=["preload_voice", "crown_letters"],
            keystone_number=14,
        )
    )

    items.append(
        PollenItem(
            id="thermometer-keystone-16",
            text=(
                "A tool that measures its own value and shows only you, unless you agree "
                "to share it anonymously, or publicly."
            ),
            source_file=str(PRELOAD_VOICE / "rhetorical_keystones.md"),
            source_context="Keystone #16 — Anti-enshittification anchor (Thermometer). Verify alignment: NYT v2, Doctorow V04, Scott v014h.",
            target_surfaces=["crown_letters"],
            keystone_number=16,
        )
    )

    items.append(
        PollenItem(
            id="inversion-principle-b109",
            text=(
                "Major Liana Banyan innovations are structurally inversions of the conventional "
                "wisdom they replace, not improvements on it. Where the conventional solution adds "
                "more of the same thing, the Liana Banyan solution inverts the load-bearing "
                "assumption and removes the need for the thing entirely."
            ),
            source_file=str(FOUNDER_REVIEW / "CANONICAL_LAWS_B109_ADDITIONS_TWO_NEW_LAWS.md"),
            source_context="Inversion Principle — B109 canonical finding. Not yet in public preload.",
            target_surfaces=["blueprints", "ai_tuning"],
        )
    )

    items.append(
        PollenItem(
            id="anachronism-principle-b110",
            text=(
                "An ancient, disciplined practice you personally learned teaches a specific mode "
                "of modern structured thinking, and you reach for that practice when you design."
            ),
            source_file=str(PRELOAD_VOICE / "anachronism_principle.md"),
            source_context="Anachronism Principle — B110 canonical finding. Already in preload. Cross-pollinate to blueprints.",
            target_surfaces=["blueprints"],
        )
    )

    return items


def _scan_surface_for_pollen(pollen: PollenItem, surface_name: str) -> list[DriftReport]:
    """Scan a surface's files for the presence/absence of a pollen item's text."""
    surface = SURFACE_REGISTRY.get(surface_name)
    if not surface:
        return [
            DriftReport(
                pollen_id=pollen.id,
                surface=surface_name,
                target_file="(unknown surface)",
                expected_text=pollen.text,
                found_text=None,
                drift_type="missing",
            )
        ]

    surface_path: Path = surface["path"]
    if not surface_path.exists():
        return [
            DriftReport(
                pollen_id=pollen.id,
                surface=surface_name,
                target_file=str(surface_path),
                expected_text=pollen.text,
                found_text=None,
                drift_type="missing",
            )
        ]

    reports: list[DriftReport] = []
    found_anywhere = False

    for md_file in sorted(surface_path.rglob("*.md")):
        try:
            content = md_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue

        found, matched = _fuzzy_contains(content, pollen.text)
        if found:
            found_anywhere = True
            if matched and matched.strip().lower() != re.sub(r"\s+", " ", pollen.text.strip().lower()):
                reports.append(
                    DriftReport(
                        pollen_id=pollen.id,
                        surface=surface_name,
                        target_file=str(md_file.relative_to(PROJECT_ROOT)),
                        expected_text=pollen.text,
                        found_text=matched,
                        drift_type="mutated",
                    )
                )
            else:
                reports.append(
                    DriftReport(
                        pollen_id=pollen.id,
                        surface=surface_name,
                        target_file=str(md_file.relative_to(PROJECT_ROOT)),
                        expected_text=pollen.text,
                        found_text=matched,
                        drift_type="ok",
                    )
                )

    if not found_anywhere:
        reports.append(
            DriftReport(
                pollen_id=pollen.id,
                surface=surface_name,
                target_file=str(surface_path),
                expected_text=pollen.text,
                found_text=None,
                drift_type="missing",
            )
        )

    return reports


def _verify_keystone_in_letters(pollen: PollenItem) -> list[DriftReport]:
    """Verify a keystone appears in specific Crown Letters (drift check)."""
    reports: list[DriftReport] = []

    if pollen.id == "thermometer-keystone-16":
        target_letters = [
            "NYT_OPED_INVISIBLE_TAX_B111_v2_SCAFFOLD.md",
            "DOCTOROW_LETTER_V04_B111_THERMOMETER.md",
            "CROWN_LETTER_MACKENZIE_SCOTT_v014h_THERMOMETER_ADDENDUM.md",
        ]
    elif pollen.keystone_number == 14:
        target_letters = [
            "CROWN_LETTER_MACKENZIE_SCOTT_v014f_CARDBOARD_BOOTS_FINAL.md",
        ]
    else:
        return reports

    for letter_name in target_letters:
        letter_path = FOUNDER_REVIEW / letter_name
        if not letter_path.exists():
            reports.append(
                DriftReport(
                    pollen_id=pollen.id,
                    surface="crown_letters",
                    target_file=f"BISHOP_DROPZONE/00_FOUNDER_REVIEW/{letter_name}",
                    expected_text=pollen.text,
                    found_text=None,
                    drift_type="missing",
                )
            )
            continue

        try:
            content = letter_path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue

        found, matched = _fuzzy_contains(content, pollen.text)
        if not found:
            reports.append(
                DriftReport(
                    pollen_id=pollen.id,
                    surface="crown_letters",
                    target_file=f"BISHOP_DROPZONE/00_FOUNDER_REVIEW/{letter_name}",
                    expected_text=pollen.text,
                    found_text=None,
                    drift_type="missing",
                )
            )
        else:
            reports.append(
                DriftReport(
                    pollen_id=pollen.id,
                    surface="crown_letters",
                    target_file=f"BISHOP_DROPZONE/00_FOUNDER_REVIEW/{letter_name}",
                    expected_text=pollen.text,
                    found_text=matched,
                    drift_type="ok",
                )
            )

    return reports


def _ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def _write_auto_surface(pollen: PollenItem, surface_name: str, dry_run: bool) -> Optional[str]:
    """Write pollen to an auto-pollinatable surface. Returns target file path or None."""
    surface = SURFACE_REGISTRY[surface_name]
    surface_path: Path = surface["path"]

    if not dry_run:
        _ensure_dir(surface_path)

    target_file = surface_path / f"pollinated_{pollen.id.replace('-', '_')}.md"

    content = f"""# {pollen.source_context}

## Canonical Text

> {pollen.text}

## Provenance

- **Source:** `{pollen.source_file}`
- **Pollen ID:** `{pollen.id}`
{"- **Keystone #" + str(pollen.keystone_number) + "**" if pollen.keystone_number else ""}
- **Pollinated by:** SP-20 Pollinator, {_now_iso()}
- **Context:** {pollen.source_context}

---
*Auto-pollinated by SP-20. Canonical text must not be altered without Founder ratification.*
"""

    if dry_run:
        return str(target_file.relative_to(PROJECT_ROOT))

    target_file.write_text(content, encoding="utf-8")
    return str(target_file.relative_to(PROJECT_ROOT))


def _write_review_request(pollen: PollenItem, surface_name: str, drift_reports: list[DriftReport], dry_run: bool) -> Optional[str]:
    """Write a pollination request artifact for review-gated surfaces."""
    _ensure_dir(POLLINATION_REQUESTS_DIR) if not dry_run else None

    target_file = POLLINATION_REQUESTS_DIR / f"PR_{pollen.id}_{surface_name}.md"

    drift_section = ""
    for dr in drift_reports:
        if dr.drift_type == "missing":
            drift_section += f"- **MISSING** in `{dr.target_file}`\n"
        elif dr.drift_type == "mutated":
            drift_section += f"- **MUTATED** in `{dr.target_file}`\n  Found: \"{dr.found_text}\"\n"
        elif dr.drift_type == "ok":
            drift_section += f"- **OK** in `{dr.target_file}`\n"

    content = f"""# Pollination Request — {pollen.id}
## Surface: {surface_name} (REQUIRES Bishop review before propagation)

### Canonical Text

> {pollen.text}

### Source

- **File:** `{pollen.source_file}`
- **Context:** {pollen.source_context}
{"- **Keystone #" + str(pollen.keystone_number) + "**" if pollen.keystone_number else ""}

### Drift Status

{drift_section if drift_section else "- No target files scanned (surface directory missing or empty)"}

### Action Requested

Bishop: Review whether this canonical text should be propagated to the `{surface_name}` surface.
If approved, apply the text to the appropriate files and mark this request as resolved.

---
*Generated by SP-20 Pollinator, {_now_iso()}. Do NOT auto-propagate — human review required.*
"""

    if dry_run:
        return str(target_file.relative_to(PROJECT_ROOT))

    target_file.write_text(content, encoding="utf-8")
    return str(target_file.relative_to(PROJECT_ROOT))


def _write_backlog(backlog: list[PollenItem], all_drift: list[DriftReport], dry_run: bool):
    """Write the human-readable pollination backlog."""
    lines = [
        "# Pollination Backlog — SP-20",
        f"## Generated: {_now_iso()}",
        "",
        "| Pollen ID | Source Context | Target Surfaces | Status |",
        "|---|---|---|---|",
    ]

    for pollen in backlog:
        pollen_drifts = [d for d in all_drift if d.pollen_id == pollen.id]
        missing = sum(1 for d in pollen_drifts if d.drift_type == "missing")
        mutated = sum(1 for d in pollen_drifts if d.drift_type == "mutated")
        ok = sum(1 for d in pollen_drifts if d.drift_type == "ok")

        if missing == 0 and mutated == 0:
            status = "ALL OK"
        elif missing > 0 and mutated > 0:
            status = f"{missing} missing, {mutated} mutated"
        elif missing > 0:
            status = f"{missing} missing"
        else:
            status = f"{mutated} mutated"

        surfaces_str = ", ".join(pollen.target_surfaces)
        lines.append(f"| `{pollen.id}` | {pollen.source_context[:60]}... | {surfaces_str} | {status} |")

    lines.append("")
    lines.append("---")
    lines.append("")

    for pollen in backlog:
        pollen_drifts = [d for d in all_drift if d.pollen_id == pollen.id]
        if not any(d.drift_type != "ok" for d in pollen_drifts):
            continue

        lines.append(f"### `{pollen.id}`")
        lines.append(f"**Text:** \"{pollen.text[:100]}...\"")
        lines.append("")
        for d in pollen_drifts:
            if d.drift_type == "missing":
                lines.append(f"- MISSING at `{d.target_file}`")
            elif d.drift_type == "mutated":
                lines.append(f"- MUTATED at `{d.target_file}`: found \"{(d.found_text or '')[:80]}...\"")
        lines.append("")

    content = "\n".join(lines)

    if not dry_run:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        BACKLOG_FILE.write_text(content, encoding="utf-8")

    return content


def run_pollinator(
    apply: bool = False,
    verify_only: bool = False,
    surface_filter: Optional[str] = None,
    verbose: bool = True,
) -> tuple[list[DriftReport], list[str]]:
    """
    Main pollination run.

    Returns (all_drift_reports, files_written).
    """
    dry_run = not apply
    backlog = build_day1_backlog()
    state = PollinationState()
    all_drift: list[DriftReport] = []
    files_written: list[str] = []

    if verbose:
        mode = "VERIFY" if verify_only else ("APPLY" if apply else "DRY RUN")
        print(f"\n{'='*60}")
        print(f"  SP-20 POLLINATOR — {mode}")
        print(f"  Backlog items: {len(backlog)}")
        print(f"  Surface filter: {surface_filter or 'all'}")
        print(f"{'='*60}\n")

    for pollen in backlog:
        if verbose:
            print(f"[POLLEN] {pollen.id}")
            print(f"  Text: \"{pollen.text[:80]}...\"")

        for surface_name in pollen.target_surfaces:
            if surface_filter and surface_name != surface_filter:
                continue

            surface_info = SURFACE_REGISTRY.get(surface_name)
            if not surface_info:
                if verbose:
                    print(f"  [SKIP] Unknown surface: {surface_name}")
                continue

            if surface_name == "crown_letters" and pollen.keystone_number:
                drift_reports = _verify_keystone_in_letters(pollen)
            else:
                drift_reports = _scan_surface_for_pollen(pollen, surface_name)

            all_drift.extend(drift_reports)

            for dr in drift_reports:
                if verbose:
                    symbol = {"ok": "OK", "missing": "MISS", "mutated": "DRIFT"}[dr.drift_type]
                    print(f"  [{symbol}] {surface_name} → {dr.target_file}")

            if verify_only:
                continue

            needs_action = any(d.drift_type != "ok" for d in drift_reports)
            if not needs_action:
                if verbose:
                    print(f"  [SKIP] Already present and aligned at {surface_name}")
                continue

            thash = _text_hash(pollen.text)
            if state.is_pollinated(pollen.id, surface_name, thash):
                if verbose:
                    print(f"  [SKIP] Already pollinated (idempotency guard)")
                continue

            if surface_info["gate"] == SURFACE_REVIEW:
                target = _write_review_request(pollen, surface_name, drift_reports, dry_run)
                if target:
                    if verbose:
                        action = "Would write" if dry_run else "Wrote"
                        print(f"  [REVIEW] {action} pollination request: {target}")
                    files_written.append(target)
            else:
                target = _write_auto_surface(pollen, surface_name, dry_run)
                if target:
                    if verbose:
                        action = "Would write" if dry_run else "Wrote"
                        print(f"  [AUTO] {action}: {target}")
                    files_written.append(target)

            if not dry_run:
                state.record(pollen.id, surface_name, target or "", thash)

        if verbose:
            print()

    backlog_content = _write_backlog(backlog, all_drift, dry_run)
    if verbose:
        backlog_action = "Would write" if dry_run else "Wrote"
        print(f"[BACKLOG] {backlog_action} pollination_backlog.md")

    if not dry_run:
        state.save()

    missing_count = sum(1 for d in all_drift if d.drift_type == "missing")
    mutated_count = sum(1 for d in all_drift if d.drift_type == "mutated")
    ok_count = sum(1 for d in all_drift if d.drift_type == "ok")

    if verbose:
        print(f"\n{'='*60}")
        print(f"  SUMMARY")
        print(f"  Total checks: {len(all_drift)}")
        print(f"  OK: {ok_count}  |  Missing: {missing_count}  |  Mutated: {mutated_count}")
        print(f"  Files {'would be ' if dry_run else ''}written: {len(files_written)}")
        print(f"{'='*60}\n")

    return all_drift, files_written


def main() -> int:
    parser = argparse.ArgumentParser(
        description="SP-20 Pollinator — propagate ratified canonical text to target surfaces"
    )
    parser.add_argument("--dry-run", action="store_true", default=True,
                        help="Show plan without writing (default)")
    parser.add_argument("--apply", action="store_true",
                        help="Write changes to auto-safe surfaces + review requests for gated surfaces")
    parser.add_argument("--verify", action="store_true",
                        help="Drift-check only, no writes even for auto surfaces")
    parser.add_argument("--surface", type=str, default=None,
                        help="Limit to a single surface (e.g., blueprints, ai_tuning, crown_letters)")
    parser.add_argument("--backlog", action="store_true",
                        help="Print current backlog and exit")
    parser.add_argument("--quiet", action="store_true",
                        help="Suppress per-item output")
    args = parser.parse_args()

    if args.backlog:
        if BACKLOG_FILE.exists():
            print(BACKLOG_FILE.read_text(encoding="utf-8"))
        else:
            print("[INFO] No backlog file yet. Run --dry-run first to generate.")
        return 0

    apply = args.apply and not args.verify
    verify_only = args.verify

    drift_reports, files_written = run_pollinator(
        apply=apply,
        verify_only=verify_only,
        surface_filter=args.surface,
        verbose=not args.quiet,
    )

    has_issues = any(d.drift_type != "ok" for d in drift_reports)
    return 1 if has_issues and verify_only else 0


if __name__ == "__main__":
    sys.exit(main())
