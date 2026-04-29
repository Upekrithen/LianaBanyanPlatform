"""
ingest_r11v2_rich_facts_to_scribe_K535.py

K535 Rich-Fact Ingestion — push MJ/RC/HP from ~30% to 90%+ HOT
===============================================================
Architecture: Option α — single observation field, full-section content.
Replaces the bold-canonical-only (~43 token) observations ingested by:
  - Original K444 R11-v1 ingest (first 50 facts, v1 corpus text)
  - B131 ingest script (new 100 facts, v2 corpus bold-canonical-only)

New observation = full corpus section text (all paragraphs):
  [FACT_ID — Title]

  [pre-context paragraphs — fact-specific setup]

  **FACT_ID.** [bold canonical sentence]

  [post-context paragraphs — derivation, evidence, outcomes]

Expected token count: ~250–400 tokens per fact (vs 43 avg previously).
Expected HOT% lift: MJ/RC/HP from ~30% → 75–90% (per K535 hypothesis).

Why Option α (not β/γ):
  - No substrate code changes required (buildPheromoneIndex already indexes
    all string fields of each JSONL record via Object.values().join(" "))
  - No adapter changes required (lb_cathedral_adapter already renders
    'observation' field to model)
  - Single observation field keeps retrieval semantics unchanged
  - Simplest implementation = least risk of introducing new bugs

Corpus version: R11v3-RICH-FACT-K535
Corpus source: r11v2_canonical_corpus_100k.md (150 facts, 6 categories)
Scribe target: stitchpunks/scribes/scribe_R11.jsonl (REPLACES all 150 facts)
Idempotent: running again re-writes the same content.
"""

import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform")
CORPUS_PATH = REPO_ROOT / "librarian-mcp" / "r10_cross_vendor" / "r11v2_canonical_corpus_100k.md"
SCRIBE_PATH = REPO_ROOT / "librarian-mcp" / "stitchpunks" / "scribes" / "scribe_R11.jsonl"
BACKUP_PATH = SCRIBE_PATH.parent / "scribe_R11_pre_K535_backup.jsonl"

CORPUS_ID = "R11v3-RICH-FACT-K535v2"
SESSION_ID = "K535"
INGEST_TS = datetime.now(timezone.utc).isoformat()

CATEGORY_BY_PREFIX = {
    "CS": "canonical_statistics",
    "AM": "architecture_mechanics",
    "EG": "economic_governance",
    "MJ": "member_journey",
    "RC": "regulatory_compliance",
    "HP": "historical_precedent",
}

# K535 diagnostic finding: RC intro paragraph lists ALL 3 frameworks for every fact,
# creating framework-attribution confusion (model can't tell which framework governs
# which requirement). HP intro/post-context frames facts as "background context" rather
# than specific recall targets. Both categories regressed to ~3% HOT with full-section.
# Fix: RC and HP use bold-canonical-only observations (matches B131 pattern for these
# categories). CS/AM/EG/MJ use full-section (confirmed 85-100% HOT in diagnostic run).
BOLD_CANONICAL_ONLY_CATEGORIES = {"regulatory_compliance", "historical_precedent"}

EXPECTED_TOTAL = 150


# ─── Corpus parser ──────────────────────────────────────────────────────────

def parse_corpus_facts_rich() -> list[dict]:
    """
    Parse r11v2_canonical_corpus_100k.md and return list of dicts with
    full-section observation (all paragraphs, not just bold canonical).

    Returns:
        [{"fact_id": "CS-01", "title": "...", "observation": "...", "category": "..."}, ...]

    Each section structure:
        ### FACT_ID — Title
        [paragraph 0: generic category intro OR fact-specific setup]
        [paragraph 1: sometimes an additional pre-bold paragraph]

        **FACT_ID.** [bold canonical sentence paragraph]

        [paragraph N: derivation, evidence, outcomes, comparative context]
        ---

    The full observation includes all paragraphs from the section,
    formatted as: "[FACT_ID — Title]\n\n[para0]\n\n[para1]\n\n..."
    """
    text = CORPUS_PATH.read_text(encoding="utf-8")

    heading_re = re.compile(
        r"^### (?P<fact_id>(CS|AM|EG|MJ|RC|HP)-\d{2})\s*[—\-–]\s*(?P<title>[^\n]+)$",
        re.MULTILINE,
    )

    matches = list(heading_re.finditer(text))
    print(f"Found {len(matches)} fact headings in corpus.")

    facts = []
    for i, m in enumerate(matches):
        fact_id = m.group("fact_id")
        title = m.group("title").strip()
        prefix = fact_id.split("-")[0]
        category = CATEGORY_BY_PREFIX.get(prefix, "unknown")

        section_start = m.end()
        section_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section_raw = text[section_start:section_end]

        # Clean the section:
        # 1. Truncate at first "---" separator (marks the end of the fact block).
        #    This handles the last fact in the corpus which otherwise captures
        #    everything to EOF (including appendices, chapter footers, etc.).
        sep_idx = section_raw.find("\n---")
        if sep_idx > 0:
            section_raw = section_raw[:sep_idx]
        # 2. Strip remaining "---" at end and whitespace
        section_clean = re.sub(r"\n---\s*$", "", section_raw.rstrip())
        section_clean = section_clean.strip()

        if not section_clean:
            print(f"WARN: empty section for {fact_id}, skipping", file=sys.stderr)
            continue

        # Split into paragraphs (double-newline separated)
        paragraphs = [p.strip() for p in re.split(r"\n\n+", section_clean) if p.strip()]

        if len(paragraphs) == 0:
            print(f"WARN: no paragraphs for {fact_id}, skipping", file=sys.stderr)
            continue

        # Verify bold canonical marker exists
        bold_marker = f"**{fact_id}.**"
        has_bold = any(bold_marker in p for p in paragraphs)
        if not has_bold:
            print(f"WARN: no bold canonical marker for {fact_id}", file=sys.stderr)

        # Build observation content:
        # For RC and HP: bold canonical only (K535 diagnostic: full-section caused
        #   RC regression from 34%→3% HOT due to multi-framework intro confusion and
        #   HP regression from 29%→MISS due to "background context" framing in intro)
        # For CS/AM/EG/MJ: full section (confirmed 85-100% HOT in diagnostic run)
        prefix_header = f"[{fact_id} — {title}]"

        if category in BOLD_CANONICAL_ONLY_CATEGORIES:
            # Extract only the bold canonical paragraph
            bold_marker = f"**{fact_id}.**"
            bold_para = ""
            for p in paragraphs:
                if bold_marker in p:
                    bold_para = p
                    break
            if not bold_para:
                bold_para = paragraphs[-1] if paragraphs else ""
            full_observation = prefix_header + "\n\n" + bold_para
        else:
            full_observation = prefix_header + "\n\n" + "\n\n".join(paragraphs)

        # Token count estimate (word-split)
        token_estimate = len(full_observation.split())

        facts.append({
            "fact_id": fact_id,
            "title": title,
            "category": category,
            "observation": full_observation,
            "token_estimate": token_estimate,
            "paragraph_count": len(paragraphs),
        })

    return facts


# ─── Existing scribe reader ─────────────────────────────────────────────────

def read_existing_scribe() -> list[dict]:
    """Read all existing scribe_R11.jsonl entries."""
    entries = []
    if not SCRIBE_PATH.exists():
        return entries
    with open(SCRIBE_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def existing_non_r11_entries(entries: list[dict]) -> list[dict]:
    """Return scribe entries that are NOT R11 fact entries (preserve header, etc.)."""
    r11_fact_id_pattern = re.compile(r"^(CS|AM|EG|MJ|RC|HP)-\d{2}$")
    non_r11 = []
    for e in entries:
        fid = e.get("fact_id", "")
        if not r11_fact_id_pattern.match(str(fid)):
            non_r11.append(e)
    return non_r11


# ─── Main ingest ────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print(f"K535 Rich-Fact Ingest — {CORPUS_ID}")
    print("=" * 60)

    # Step 1: Parse corpus
    corpus_facts = parse_corpus_facts_rich()
    if len(corpus_facts) != EXPECTED_TOTAL:
        print(f"ERROR: expected {EXPECTED_TOTAL} facts, got {len(corpus_facts)}", file=sys.stderr)
        sys.exit(1)

    # Token count summary
    tok_counts = [f["token_estimate"] for f in corpus_facts]
    print(f"\nCorpus parsed: {len(corpus_facts)} facts")
    print(f"Token count per observation: min={min(tok_counts)} max={max(tok_counts)} mean={sum(tok_counts)/len(tok_counts):.1f}")

    # Category breakdown
    by_cat = {}
    for f in corpus_facts:
        by_cat.setdefault(f["category"], []).append(f)
    print("Category breakdown:")
    for cat, items in sorted(by_cat.items()):
        toks = [i["token_estimate"] for i in items]
        print(f"  {cat}: {len(items)} facts, avg {sum(toks)/len(toks):.0f} tokens")

    # Step 2: Backup existing scribe
    existing = read_existing_scribe()
    print(f"\nExisting scribe_R11.jsonl: {len(existing)} entries")

    if SCRIBE_PATH.exists():
        shutil.copy2(SCRIBE_PATH, BACKUP_PATH)
        print(f"Backed up to: {BACKUP_PATH.name}")

    # Step 3: Preserve non-R11 entries
    non_r11 = existing_non_r11_entries(existing)
    print(f"Non-R11 entries preserved: {len(non_r11)}")

    # Step 4: Build new R11 JSONL entries
    # Preserve metadata from existing entries where possible
    existing_by_id = {}
    for e in existing:
        fid = e.get("fact_id")
        if fid:
            existing_by_id[fid] = e

    new_entries = []
    for f in corpus_facts:
        fact_id = f["fact_id"]
        existing_entry = existing_by_id.get(fact_id, {})

        # Build new entry, preserving original session/ts metadata where available
        # but upgrading observation to rich-fact content and updating corpus_id
        entry = {
            "fact_id": fact_id,
            "title": f["title"],
            "category": f["category"],
            "observation": f["observation"],
            "corpus_id": CORPUS_ID,
            "session": existing_entry.get("session", SESSION_ID),
            "ts": existing_entry.get("ts", INGEST_TS),
            "ingest_session": SESSION_ID,
            "ingest_ts": INGEST_TS,
            "rich_fact_version": "K535",
            # Preserve scope for consult_scribes filter
            "scope": existing_entry.get("scope", "public"),
        }
        new_entries.append(entry)

    # Step 5: Write new scribe_R11.jsonl
    # Order: non-R11 entries first, then all R11 facts in corpus order
    all_entries = non_r11 + new_entries

    print(f"\nWriting {len(all_entries)} entries to scribe_R11.jsonl ({len(non_r11)} non-R11 + {len(new_entries)} R11 facts)...")

    with open(SCRIBE_PATH, "w", encoding="utf-8") as f:
        for entry in all_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    # Step 6: Verify
    verify = read_existing_scribe()
    r11_count = sum(
        1 for e in verify
        if re.match(r"^(CS|AM|EG|MJ|RC|HP)-\d{2}$", str(e.get("fact_id", "")))
    )
    print(f"\nVerification: {len(verify)} total entries, {r11_count} R11 facts")

    if r11_count != EXPECTED_TOTAL:
        print(f"ERROR: expected {EXPECTED_TOTAL} R11 facts, got {r11_count}", file=sys.stderr)
        sys.exit(1)

    # Sample verification — show 2 facts per category
    print("\n--- Sample rich observations (first 2 per category) ---")
    by_cat_out = {}
    for e in verify:
        cat = e.get("category", "?")
        if re.match(r"^(CS|AM|EG|MJ|RC|HP)-\d{2}$", str(e.get("fact_id", ""))):
            by_cat_out.setdefault(cat, []).append(e)

    for cat, items in sorted(by_cat_out.items()):
        print(f"\n  [{cat}]")
        for item in items[:2]:
            obs = item.get("observation", "")
            toks = len(obs.split())
            print(f"    {item.get('fact_id')} | {toks} tokens | {obs[:200]!r}...")

    print(f"\n{'='*60}")
    print(f"K535 rich-fact ingest COMPLETE.")
    print(f"  {EXPECTED_TOTAL} facts re-ingested with full-section observations")
    print(f"  avg token count: {sum(tok_counts)/len(tok_counts):.0f} (was ~43 previously)")
    print(f"  corpus_id: {CORPUS_ID}")
    print(f"  backup: {BACKUP_PATH.name}")
    print(f"\nNext step: cd librarian-mcp && npm run rebuild")
    print("Then: python r10_cross_vendor/smoke_test_retrieval_K535.py")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
