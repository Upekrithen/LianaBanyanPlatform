"""
ingest_r11v2_facts_to_scribe_b131.py

B131 Cathedral coverage gap fix — Bishop B131, 2026-04-28
Founder direction: "A (ingest 100 new) - do that. bigger is better with more evidence, to a degree."

Reads the R11-v2 canonical corpus (r11v2_canonical_corpus_100k.md, 150 facts) and appends
the 100 missing facts (those NOT already in scribe_R11.jsonl) so the Cathedral coverage
goes 50 -> 150 ahead of the K528 post-ingest re-run (RERUN_CATHEDRAL_POST_INGEST_K528.ps1).

Existing 50 in scribe (left untouched):
  CS-01..09 (9), AM-01..08 (8), EG-01..09 (9), MJ-01..08 (8), RC-01..08 (8), HP-01..08 (8) = 50

Missing 100 to append:
  CS-10..25 (16), AM-09..25 (17), EG-10..25 (16), MJ-09..25 (17), RC-09..25 (17), HP-09..25 (17) = 100

Script is idempotent — re-running won't duplicate. Verifies post-condition (150 total facts) before exit.
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform")
CORPUS_PATH = REPO_ROOT / "librarian-mcp" / "r10_cross_vendor" / "r11v2_canonical_corpus_100k.md"
SCRIBE_PATH = REPO_ROOT / "librarian-mcp" / "stitchpunks" / "scribes" / "scribe_R11.jsonl"
EXPECTED_TOTAL = 150
SESSION_ID = "B131"
INGEST_TS = "2026-04-28T00:00:00.000Z"

CATEGORY_BY_PREFIX = {
    "CS": "canonical_statistics",
    "AM": "architecture_mechanics",
    "EG": "economic_governance",
    "MJ": "member_journey",
    "RC": "regulatory_compliance",
    "HP": "historical_precedent",
}


def existing_fact_ids():
    """Read scribe_R11.jsonl and return set of fact_ids already present."""
    fact_ids = set()
    with open(SCRIBE_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            fid = obj.get("fact_id")
            if fid:
                fact_ids.add(fid)
    return fact_ids


def parse_corpus_facts():
    """
    Parse r11v2_canonical_corpus_100k.md and return list of dicts:
    [{"fact_id": "CS-01", "title": "Verdania Membership", "observation": "..."}, ...]

    Each fact section has structure:
        ### CS-01 — Verdania Membership
        [context paragraph]

        **CS-01.** [bold canonical observation paragraph]

        [more context paragraphs]
        ---

    The canonical observation is the paragraph that starts with **FACT_ID.** (bold marker).
    """
    text = CORPUS_PATH.read_text(encoding="utf-8")

    # Match each "### FACT_ID — Title" heading and capture the fact section up to next "---" or "###"
    heading_re = re.compile(
        r"^### (?P<fact_id>(CS|AM|EG|MJ|RC|HP)-\d{2}) — (?P<title>[^\n]+)$",
        re.MULTILINE,
    )

    matches = list(heading_re.finditer(text))
    facts = []
    for i, m in enumerate(matches):
        fact_id = m.group("fact_id")
        title = m.group("title").strip()
        section_start = m.end()
        section_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[section_start:section_end]

        # Find the bold canonical observation: starts with **FACT_ID.**
        bold_marker = f"**{fact_id}.**"
        idx = section.find(bold_marker)
        if idx == -1:
            print(f"WARN: no bold canonical marker for {fact_id}, skipping", file=sys.stderr)
            continue

        # Observation is from bold_marker through the next double-newline (paragraph break)
        obs_start = idx + len(bold_marker)
        rest = section[obs_start:]
        para_break = rest.find("\n\n")
        if para_break == -1:
            obs_text = rest.strip()
        else:
            obs_text = rest[:para_break].strip()

        # Reconstruct full observation in scribe format: "[FACT_ID — Title] [observation text]"
        observation = f"[{fact_id} — {title}] {obs_text}"

        # Token count (rough: word count)
        token_count = len(obs_text.split())

        facts.append(
            {
                "fact_id": fact_id,
                "title": title,
                "observation": observation,
                "tokens": token_count,
            }
        )

    return facts


def format_scribe_entry(fact):
    """Format a fact dict as a JSONL entry matching scribe_R11.jsonl pattern."""
    prefix = fact["fact_id"].split("-")[0]
    category = CATEGORY_BY_PREFIX[prefix]
    entry = {
        "ts": INGEST_TS,
        "session": SESSION_ID,
        "observation": fact["observation"],
        "source": "bishop_ingest",
        "canonical_ref": "r10_cross_vendor/r11v2_canonical_corpus_100k.md",
        "category": category,
        "fact_id": fact["fact_id"],
        "tokens": fact["tokens"],
        "scope": "public",
        "source_session": SESSION_ID,
        "source_document": "r10_cross_vendor/r11v2_canonical_corpus_100k.md",
    }
    return json.dumps(entry, ensure_ascii=False)


def main():
    print(f"Reading existing scribe at {SCRIBE_PATH}")
    existing = existing_fact_ids()
    print(f"  Existing fact_ids: {len(existing)}")

    print(f"Parsing v2 corpus at {CORPUS_PATH}")
    all_facts = parse_corpus_facts()
    print(f"  Parsed {len(all_facts)} facts from corpus")

    if len(all_facts) != EXPECTED_TOTAL:
        print(
            f"FATAL: expected {EXPECTED_TOTAL} facts in v2 corpus, parsed {len(all_facts)}",
            file=sys.stderr,
        )
        sys.exit(1)

    missing = [f for f in all_facts if f["fact_id"] not in existing]
    print(f"  Missing from scribe: {len(missing)}")

    if not missing:
        print("Nothing to ingest. Scribe already has all facts.")
        # Verify total
        if len(existing) != EXPECTED_TOTAL:
            print(
                f"WARN: scribe has {len(existing)} facts, expected {EXPECTED_TOTAL}",
                file=sys.stderr,
            )
            sys.exit(2)
        sys.exit(0)

    expected_missing_count = EXPECTED_TOTAL - len(existing)
    if len(missing) != expected_missing_count:
        print(
            f"FATAL: expected {expected_missing_count} missing facts, found {len(missing)}",
            file=sys.stderr,
        )
        sys.exit(1)

    # Append the missing facts to scribe
    print(f"Appending {len(missing)} new facts to scribe...")
    appended = 0
    with open(SCRIBE_PATH, "a", encoding="utf-8") as f:
        for fact in missing:
            line = format_scribe_entry(fact)
            f.write(line + "\n")
            appended += 1

    print(f"  Appended {appended} entries")

    # Verify post-condition
    final = existing_fact_ids()
    print(f"  Scribe now has {len(final)} fact_ids")
    if len(final) != EXPECTED_TOTAL:
        print(
            f"FATAL: post-condition failed — expected {EXPECTED_TOTAL}, got {len(final)}",
            file=sys.stderr,
        )
        sys.exit(1)

    # Show sample of newly-appended facts
    print()
    print("Sample of newly-appended facts:")
    for fact in missing[:3]:
        print(f"  {fact['fact_id']} ({fact['tokens']} tokens): {fact['observation'][:100]}...")

    print()
    print(f"SUCCESS: scribe_R11.jsonl now at 150/150 coverage. Ready for Cathedral re-run.")


if __name__ == "__main__":
    main()
