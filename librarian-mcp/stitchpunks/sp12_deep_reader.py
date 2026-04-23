"""
SP-12 DEEP READER

Read every archived content file from data/content_archive/ and classify it
for platform value.  The "actually read everything" sweep.

Usage:
  python sp12_deep_reader.py --all
  python sp12_deep_reader.py --stats
  python sp12_deep_reader.py --section 02_WRITTEN
  python sp12_deep_reader.py --top 500
  python sp12_deep_reader.py --gold-only
  python sp12_deep_reader.py --dry-run
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import traceback
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data"
ARCHIVE_DIR = DATA_DIR / "content_archive"
ARCHIVE_INDEX_PATH = DATA_DIR / "content_archive_index.json"
OUTPUT_PATH = DATA_DIR / "deep_reader_findings.json"

# ── Classification constants ─────────────────────────────────────────────────

# Code signals
CODE_PATTERNS = [
    r"^\s*(import|export|from)\s+",
    r"^\s*(function|const|let|var|interface|type|class|enum)\s+\w+",
    r"^\s*(def |async def |class )\w+",
    r"^\s*CREATE\s+(TABLE|INDEX|FUNCTION|TYPE|TRIGGER)\b",
    r"^\s*ALTER\s+TABLE\b",
    r"^\s*INSERT\s+INTO\b",
    r"<(div|span|script|style|html|body|head)\b",
    r"\{[\s\S]*?:\s*[\s\S]*?\}",  # JSON-like blocks
]

# Innovation signals: novel mechanisms, key LB concepts
INNOVATION_KEYWORDS = [
    r"cost\s*\+\s*20",
    r"three[- ]gear",
    r"star\s+chamber",
    r"medallion",
    r"crown\s+jewel",
    r"closed[- ]loop",
    r"one[- ]way\s+valve",
    r"margin\s+lock",
    r"83\.3\s*%",
    r"creator\s+keeps",
    r"cooperative\s+(economics?|housing|platform|marketplace)",
    r"reciprocal\s+(maintenance|reputation|scoring)",
    r"escrow",
    r"backer\s+election",
    r"content\s+shield",
    r"battery\s+dispatch",
    r"sentinel",
    r"red\s+carpet",
    r"treasure\s+map",
    r"helm\s+content",
    r"design\s+democracy",
    r"wildfire\s+tour",
    r"hex\s*isle",
    r"canister\s+system",
    r"lemon\s+lot",
    r"ghost\s+world",
    r"adapt\s+score",
    r"cue\s+card",
    r"spice\s+rack",
    r"recipe\s+pot",
    r"stone\s+soup",
    r"pudding.*proof|proof.*pudding",
    r"freezer\s+node",
    r"pearl\s+diver",
    r"bounty\s+photograph",
    r"portable\s+reputation",
    r"platform\s+margin",
    r"joule[s]?\b",
    r"marks?\s+(half[- ]life|decay|differential)",
    r"pledged\s+marks",
    r"backed\s+marks",
    r"innovation\s+#\d{3,4}",
    r"method\s+comprising",
    r"novel\s+(mechanism|system|method|architecture|approach)",
]

# Paper signals
PAPER_PATTERNS = [
    r"\babstract\b[:\s]",
    r"\bintroduction\b",
    r"\bconclusion\b",
    r"\bcitations?\b",
    r"\breferences?\b\s*$",
    r"\bbibliography\b",
    r"et\s+al\.\s",
    r"\bpeer[- ]review",
    r"\bfigure\s+\d+",
    r"\btable\s+\d+[:\.]",
]

# Pudding signals
PUDDING_PATTERNS = [
    r"proof\s+is\s+in\s+the\s+pudding",
    r"this\s+is\s+not\s+pudding",
    r"pudding\s+#\d+",
    r"spoonful\s+of\s+cephas",
]

# Letter signals
LETTER_PATTERNS = [
    r"^Dear\s+",
    r"^Dear\s+\w+",
    r"sincerely,?\s*$",
    r"respectfully,?\s*$",
    r"warmly,?\s*$",
    r"with\s+admiration",
    r"crown\s+of\s+",
    r"fleet\s+admiral",
]

# Journal signals
JOURNAL_PATTERNS = [
    r"founder'?s?\s+(journal|log|development)",
    r"journal\s+#?\d+",
    r"session\s+\d+\s+notes?",
    r"operation\s+(chronicle|genie|phoenix)",
]

# Prompt signals
PROMPT_PATTERNS = [
    r"knight\s+session\s+\d+",
    r"pawn\s+batch?\s+\d+",
    r"bishop\s+session\s+\d+",
    r"rook\s+session\s+\d+",
    r"^PROMPT[_\s]",
    r"execute\s+the\s+following",
    r"your\s+deliverables?\s*:",
    r"success\s+criteria\s*:",
    r"dispatch",
]

# Legal signals
LEGAL_PATTERNS = [
    r"\bbylaws?\b",
    r"\boperating\s+agreement\b",
    r"\bterms\s+of\s+(service|use)\b",
    r"\bprivacy\s+policy\b",
    r"\bindemnif",
    r"\bliability\b",
    r"\bwarranty\b",
    r"\bWHEREAS\b",
    r"\bherein(after)?\b",
]

# Business plan signals
BUSINESS_PATTERNS = [
    r"\bfinancial\s+projection",
    r"\bmarket\s+analysis\b",
    r"\bmarket\s+size\b",
    r"\brevenue\s+model\b",
    r"\bunit\s+economics\b",
    r"\bbreakeven\b",
    r"\bcompetitor\s+analysis\b",
    r"\bTAM\b",
    r"\bSAM\b",
    r"\bSOM\b",
    r"\bCOGS\b",
    r"\bburn\s+rate\b",
]

# Campaign signals
CAMPAIGN_PATTERNS = [
    r"\bkickstarter\b",
    r"\bsocial\s+media\s+(campaign|strategy|post)",
    r"\boutreach\s+(campaign|strategy)",
    r"\breward\s+tier",
    r"\bpledge\b",
    r"\bbacker[s]?\b",
    r"\bcampaign\s+(dossier|brief)",
]

# Lore signals
LORE_PATTERNS = [
    r"\bcharacter\s+description\b",
    r"\bfable\b",
    r"\bonce\s+upon\s+a\s+time\b",
    r"\bgame\s+world\b",
    r"\bstitchpunk\b",
    r"\bstone\s+soup\b.*\bfable\b",
    r"\blore\b",
]

# Logistics signals
LOGISTICS_PATTERNS = [
    r"\bhandoff\b",
    r"\bsession\s+context\b",
    r"\bagent\s+sync\b",
    r"\bcontext\s+management\b",
    r"\bmilestone\s+handoff\b",
    r"\bpending\s+work\b",
    r"\bfiles?\s+changed\b",
    r"\bsession_id\b",
]

# SEC-flagged words
SEC_WORDS = [
    r"\bequity\b",
    r"\bsecurities\b",
    r"\bdividend[s]?\b",
    r"\breturn\s+on\s+investment\b",
    r"\binvestment\s+vehicle\b",
    r"\bshareholder[s]?\b",
    r"\bshares\b(?=.*\b(financial|stock|market|invest|capital|fund))",
    r"\bstock\b(?=.*\b(market|option|share|invest|capital|exchange))",
]

# Innovation number pattern
INNOVATION_NUM_RE = re.compile(r"#(\d{3,4})\b")


# ── Helpers ──────────────────────────────────────────────────────────────────

def _load_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _safe_json_dump(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def _content_hash(text: str) -> str:
    """Hash first 500 chars for dedup."""
    snippet = text[:500] if text else ""
    return hashlib.sha256(snippet.encode("utf-8", errors="replace")).hexdigest()[:16]


def _count_pattern_hits(text: str, patterns: List[str], flags: int = re.IGNORECASE | re.MULTILINE) -> int:
    hits = 0
    for pat in patterns:
        try:
            hits += len(re.findall(pat, text, flags))
        except re.error:
            pass
    return hits


def _find_pattern_matches(text: str, patterns: List[str], flags: int = re.IGNORECASE | re.MULTILINE) -> List[str]:
    matches = []
    for pat in patterns:
        try:
            found = re.findall(pat, text, flags)
            matches.extend(str(m) for m in found)
        except re.error:
            pass
    return matches


def _extract_context(text: str, pattern: str, window: int = 80) -> Optional[str]:
    """Extract surrounding context for a pattern match."""
    try:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            start = max(0, m.start() - window)
            end = min(len(text), m.end() + window)
            snippet = text[start:end].replace("\n", " ").strip()
            return snippet
    except re.error:
        pass
    return None


# ── Classification engine ────────────────────────────────────────────────────

def classify_content(
    text: str,
    filename: str,
    path: str,
    section: str,
) -> Tuple[str, List[str]]:
    """
    Classify content into a category and extract concepts for innovation candidates.
    Returns (classification, concepts_list).
    """
    if not text or len(text.strip()) < 10:
        return "other", []

    text_lower = text.lower()
    path_lower = (path or "").lower()
    fname_lower = (filename or "").lower()

    scores: Dict[str, float] = defaultdict(float)

    # -- Code detection --
    code_hits = _count_pattern_hits(text, CODE_PATTERNS)
    # Strong code signals: file extensions
    code_extensions = (".ts", ".tsx", ".js", ".jsx", ".py", ".sql", ".css", ".html", ".json", ".yaml", ".yml")
    if any(fname_lower.endswith(ext) for ext in code_extensions):
        scores["code"] += 3.0
    scores["code"] += min(code_hits * 0.5, 5.0)

    # Check ratio of code-like lines
    lines = text.split("\n")
    if lines:
        code_line_count = sum(
            1 for line in lines
            if re.match(r"^\s*(import|export|from|function|const|let|var|def |class |CREATE |ALTER |INSERT |SELECT |UPDATE |DELETE )", line)
        )
        code_ratio = code_line_count / len(lines)
        if code_ratio > 0.3:
            scores["code"] += 4.0

    # -- Innovation candidate --
    innov_hits = _count_pattern_hits(text, INNOVATION_KEYWORDS)
    scores["innovation_candidate"] += min(innov_hits * 0.7, 8.0)
    # Boost if has innovation numbers
    innov_nums = INNOVATION_NUM_RE.findall(text)
    if innov_nums:
        scores["innovation_candidate"] += min(len(innov_nums) * 0.3, 3.0)
    # Boost if in patent bags or blueprints
    if "patent" in path_lower or "03_patent" in path_lower:
        scores["innovation_candidate"] += 2.0
    if "blueprint" in path_lower or "01_blueprint" in path_lower:
        scores["innovation_candidate"] += 1.5

    # -- Paper --
    paper_hits = _count_pattern_hits(text, PAPER_PATTERNS)
    scores["paper"] += min(paper_hits * 0.8, 6.0)
    if "academic" in path_lower or "paper" in path_lower or "05_academic" in path_lower:
        scores["paper"] += 2.0
    if section == "02_WRITTEN":
        scores["paper"] += 1.0

    # -- Pudding --
    pudding_hits = _count_pattern_hits(text, PUDDING_PATTERNS)
    scores["pudding"] += min(pudding_hits * 2.0, 6.0)
    if "pudding" in fname_lower:
        scores["pudding"] += 4.0

    # -- Letter --
    letter_hits = _count_pattern_hits(text, LETTER_PATTERNS)
    scores["letter"] += min(letter_hits * 1.0, 5.0)
    if "letter" in path_lower or "10_letters" in path_lower.replace("\\", "/"):
        scores["letter"] += 3.0
    if section == "10_LETTERS":
        scores["letter"] += 2.0

    # -- Journal --
    journal_hits = _count_pattern_hits(text, JOURNAL_PATTERNS)
    scores["journal"] += min(journal_hits * 1.2, 5.0)
    if "journal" in path_lower or "08_journals" in path_lower:
        scores["journal"] += 3.0
    if section == "08_JOURNALS":
        scores["journal"] += 2.0

    # -- Prompt --
    prompt_hits = _count_pattern_hits(text, PROMPT_PATTERNS)
    scores["prompt"] += min(prompt_hits * 0.8, 5.0)
    if "prompt_knight" in fname_lower or "prompt_pawn" in fname_lower or "prompt_bishop" in fname_lower:
        scores["prompt"] += 5.0

    # -- Legal --
    legal_hits = _count_pattern_hits(text, LEGAL_PATTERNS)
    scores["legal"] += min(legal_hits * 1.0, 5.0)
    if "bylaws" in fname_lower or "agreement" in fname_lower or "terms" in fname_lower:
        scores["legal"] += 3.0

    # -- Business plan --
    biz_hits = _count_pattern_hits(text, BUSINESS_PATTERNS)
    scores["business_plan"] += min(biz_hits * 1.0, 5.0)
    if "business_plan" in path_lower or "business-plan" in path_lower:
        scores["business_plan"] += 3.0

    # -- Campaign --
    campaign_hits = _count_pattern_hits(text, CAMPAIGN_PATTERNS)
    scores["campaign"] += min(campaign_hits * 1.0, 5.0)
    if "campaign" in path_lower or "06_campaign" in path_lower or "kickstarter" in path_lower:
        scores["campaign"] += 3.0
    if section == "06_CAMPAIGN_MATERIALS":
        scores["campaign"] += 2.0

    # -- Lore --
    lore_hits = _count_pattern_hits(text, LORE_PATTERNS)
    scores["lore"] += min(lore_hits * 1.2, 5.0)
    if "lore" in path_lower or "fable" in path_lower or "character" in path_lower:
        scores["lore"] += 2.0

    # -- Logistics --
    logistics_hits = _count_pattern_hits(text, LOGISTICS_PATTERNS)
    scores["logistics"] += min(logistics_hits * 0.6, 4.0)
    if "handoff" in fname_lower or "context" in fname_lower or "sync" in fname_lower:
        scores["logistics"] += 3.0
    if section == "09_CONTEXT_MANAGEMENT":
        scores["logistics"] += 2.0

    # Pick the winner
    if not scores or max(scores.values()) < 1.0:
        classification = "other"
    else:
        classification = max(scores, key=scores.get)

    # Extract concepts for innovation candidates
    concepts: List[str] = []
    if classification == "innovation_candidate" or scores.get("innovation_candidate", 0) >= 3.0:
        concepts = _find_pattern_matches(text, INNOVATION_KEYWORDS)
        # Deduplicate and clean
        seen = set()
        clean_concepts = []
        for c in concepts:
            c_clean = c.strip().lower()
            if c_clean and c_clean not in seen:
                seen.add(c_clean)
                clean_concepts.append(c.strip())
        concepts = clean_concepts[:20]  # Cap at 20

    return classification, concepts


def check_sec_flags(text: str, filename: str) -> List[Dict[str, str]]:
    """Check for SEC-flagged words and return matches with context."""
    flags = []
    for pattern in SEC_WORDS:
        try:
            for m in re.finditer(pattern, text, re.IGNORECASE):
                start = max(0, m.start() - 60)
                end = min(len(text), m.end() + 60)
                context = text[start:end].replace("\n", " ").strip()
                flags.append({
                    "filename": filename,
                    "word": m.group(0),
                    "context": context,
                })
        except re.error:
            pass
    return flags


def extract_innovation_numbers(text: str) -> List[int]:
    """Extract all #NNNN innovation number references."""
    matches = INNOVATION_NUM_RE.findall(text)
    nums = []
    for m in matches:
        try:
            n = int(m)
            if 1 <= n <= 9999:
                nums.append(n)
        except ValueError:
            pass
    return sorted(set(nums))


# ── Main processing ─────────────────────────────────────────────────────────

def load_index() -> List[Dict[str, Any]]:
    """Load the content archive index."""
    data = _load_json(ARCHIVE_INDEX_PATH)
    if not data or "entries" not in data:
        print(f"ERROR: Cannot load index from {ARCHIVE_INDEX_PATH}")
        sys.exit(1)
    return data["entries"]


def load_archive_content(archive_file: str) -> Optional[str]:
    """Load content_markdown from an archive JSON file."""
    path = ARCHIVE_DIR / archive_file
    if not path.exists():
        return None
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            data = json.load(f)
        return data.get("content_markdown", "")
    except (json.JSONDecodeError, UnicodeDecodeError, OSError) as e:
        return None


def process_entries(
    entries: List[Dict[str, Any]],
    dry_run: bool = False,
) -> Dict[str, Any]:
    """Process all entries and return findings."""

    total = len(entries)
    print(f"Processing {total} entries...")

    classifications: Counter = Counter()
    by_section: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "count": 0,
        "innovation_candidates": 0,
        "sec_flags": 0,
        "classifications": Counter(),
    })
    innovation_candidates: List[Dict[str, Any]] = []
    sec_flags: List[Dict[str, str]] = []
    all_innovation_nums: List[int] = []
    hash_map: Dict[str, List[str]] = defaultdict(list)  # hash -> [filenames]
    errors = 0

    for i, entry in enumerate(entries):
        if (i + 1) % 500 == 0:
            print(f"  ... {i + 1}/{total} processed ({len(innovation_candidates)} innovation candidates, {len(sec_flags)} SEC flags)")

        filename = entry.get("filename", "unknown")
        archive_file = entry.get("archive_file", "")
        section = entry.get("section", "uncategorized")
        file_path = entry.get("path", "")

        if dry_run:
            classifications["_dry_run_skipped"] += 1
            by_section[section]["count"] += 1
            continue

        # Load content
        content = load_archive_content(archive_file)
        if content is None:
            errors += 1
            continue

        if not content.strip():
            classifications["other"] += 1
            by_section[section]["count"] += 1
            continue

        # Dedup by hash
        h = _content_hash(content)
        hash_map[h].append(filename)
        if len(hash_map[h]) > 1:
            classifications["duplicate"] += 1
            by_section[section]["count"] += 1
            by_section[section]["classifications"]["duplicate"] += 1
            continue

        # Classify
        try:
            classification, concepts = classify_content(
                content, filename, file_path, section,
            )
        except Exception:
            errors += 1
            traceback.print_exc()
            classification = "other"
            concepts = []

        classifications[classification] += 1
        by_section[section]["count"] += 1
        by_section[section]["classifications"][classification] += 1

        # Innovation candidates
        if classification == "innovation_candidate" or concepts:
            innov_nums = extract_innovation_numbers(content)
            all_innovation_nums.extend(innov_nums)
            candidate = {
                "filename": filename,
                "section": section,
                "content_chars": len(content),
                "concepts": concepts,
                "archive_file": archive_file,
            }
            if innov_nums:
                candidate["innovation_numbers"] = innov_nums
            innovation_candidates.append(candidate)
            by_section[section]["innovation_candidates"] += 1

        # SEC flags
        entry_sec_flags = check_sec_flags(content, filename)
        if entry_sec_flags:
            sec_flags.extend(entry_sec_flags)
            by_section[section]["sec_flags"] += len(entry_sec_flags)

    # Build duplicate clusters (only groups with >1 file)
    duplicate_clusters = []
    for h, files in hash_map.items():
        if len(files) > 1:
            duplicate_clusters.append({
                "hash": h,
                "files": files,
            })

    # Convert by_section counters to plain dicts for JSON
    by_section_out = {}
    for sec, data in by_section.items():
        by_section_out[sec] = {
            "count": data["count"],
            "innovation_candidates": data["innovation_candidates"],
            "sec_flags": data["sec_flags"],
            "classifications": dict(data["classifications"]),
        }

    findings = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "total_processed": total,
        "total_errors": errors,
        "innovation_candidates": innovation_candidates,
        "sec_flags": sec_flags,
        "classifications": dict(classifications),
        "by_section": by_section_out,
        "duplicate_clusters": duplicate_clusters,
        "innovation_numbers_found": sorted(set(all_innovation_nums)),
    }

    return findings


def show_stats(entries: List[Dict[str, Any]]) -> None:
    """Show section distribution without processing content."""
    section_counts: Counter = Counter()
    section_chars: Dict[str, int] = defaultdict(int)
    for entry in entries:
        section = entry.get("section", "uncategorized")
        section_counts[section] += 1
        section_chars[section] += entry.get("content_chars", 0)

    print(f"\n{'Section':<30} {'Count':>8} {'Total Chars':>14} {'Avg Chars':>10}")
    print("-" * 66)
    for section, count in section_counts.most_common():
        chars = section_chars[section]
        avg = chars // count if count else 0
        print(f"{section:<30} {count:>8,} {chars:>14,} {avg:>10,}")
    print("-" * 66)
    print(f"{'TOTAL':<30} {sum(section_counts.values()):>8,} {sum(section_chars.values()):>14,}")


def main() -> None:
    parser = argparse.ArgumentParser(description="SP-12 Deep Reader: classify all archived content")
    parser.add_argument("--stats", action="store_true", help="Show section distribution only")
    parser.add_argument("--section", type=str, help="Filter to one section name")
    parser.add_argument("--top", type=int, help="Process top N entries by content size")
    parser.add_argument("--gold-only", action="store_true", help="Skip code files and files under 5K chars")
    parser.add_argument("--all", action="store_true", help="Process everything")
    parser.add_argument("--dry-run", action="store_true", help="Preview without loading content")
    args = parser.parse_args()

    # Must specify at least one mode
    if not (args.stats or args.section or args.top or args.gold_only or args.all or args.dry_run):
        parser.print_help()
        print("\nError: specify at least one of --stats, --section, --top, --gold-only, --all, or --dry-run")
        sys.exit(1)

    print("SP-12 DEEP READER")
    print(f"Archive index: {ARCHIVE_INDEX_PATH}")
    print(f"Archive dir:   {ARCHIVE_DIR}")

    entries = load_index()
    print(f"Index loaded: {len(entries)} entries")

    # Stats mode
    if args.stats:
        show_stats(entries)
        return

    # Filter by section
    if args.section:
        entries = [e for e in entries if e.get("section", "") == args.section]
        print(f"Filtered to section '{args.section}': {len(entries)} entries")
        if not entries:
            print("No entries found for that section.")
            return

    # Gold-only: skip code file extensions and small files
    if args.gold_only:
        code_exts = {".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".json", ".yaml", ".yml", ".svg", ".png", ".jpg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".map"}
        before = len(entries)
        entries = [
            e for e in entries
            if not any(e.get("filename", "").lower().endswith(ext) for ext in code_exts)
            and e.get("content_chars", 0) >= 5000
        ]
        print(f"Gold-only filter: {before} -> {len(entries)} entries (skipped code files and <5K)")

    # Sort by content size descending for --top
    if args.top:
        entries.sort(key=lambda e: e.get("content_chars", 0), reverse=True)
        entries = entries[:args.top]
        print(f"Top {args.top} by content size (largest: {entries[0].get('content_chars', 0):,} chars)")

    # Process
    print()
    findings = process_entries(entries, dry_run=args.dry_run)

    # Summary
    print(f"\n{'='*60}")
    print(f"DEEP READER RESULTS")
    print(f"{'='*60}")
    print(f"Total processed:        {findings['total_processed']:,}")
    print(f"Errors:                 {findings['total_errors']:,}")
    print(f"Innovation candidates:  {len(findings['innovation_candidates']):,}")
    print(f"SEC flags:              {len(findings['sec_flags']):,}")
    print(f"Duplicate clusters:     {len(findings['duplicate_clusters']):,}")

    if findings["classifications"]:
        print(f"\nClassifications:")
        for cls, count in sorted(findings["classifications"].items(), key=lambda x: -x[1]):
            print(f"  {cls:<25} {count:>6,}")

    if findings["innovation_numbers_found"]:
        nums = findings["innovation_numbers_found"]
        print(f"\nInnovation numbers referenced: {len(nums)} unique (range #{min(nums)}-#{max(nums)})")

    if findings["duplicate_clusters"]:
        total_dupes = sum(len(c["files"]) - 1 for c in findings["duplicate_clusters"])
        print(f"\nDuplicate files detected: {total_dupes} across {len(findings['duplicate_clusters'])} clusters")

    # Write output
    if not args.dry_run:
        _safe_json_dump(OUTPUT_PATH, findings)
        print(f"\nFindings written to: {OUTPUT_PATH}")
    else:
        print("\n(Dry run — no content processed, no output written)")


if __name__ == "__main__":
    main()
