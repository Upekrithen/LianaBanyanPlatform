"""
audit_k535_phase_a.py — K535 Phase A Discovery Audit
Audits scribe_R11.jsonl facts, question bank phrasing, and corpus structure.
"""
import json
import re
import collections
from pathlib import Path

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp")
SCRIBE_PATH = REPO / "stitchpunks" / "scribes" / "scribe_R11.jsonl"
QB_PATH = REPO / "r10_cross_vendor" / "R11v2_QUESTION_BANK_SEALED_K528.json"
CORPUS_PATH = REPO / "r10_cross_vendor" / "r11v2_canonical_corpus_100k.md"

CATEGORY_SHORT = {
    "canonical_statistics": "CS",
    "architecture_mechanics": "AM",
    "economic_governance": "EG",
    "member_journey": "MJ",
    "regulatory_compliance": "RC",
    "historical_precedent": "HP",
}

def audit_scribe():
    print("=" * 60)
    print("A.1 — scribe_R11.jsonl audit")
    print("=" * 60)
    facts = []
    with open(SCRIBE_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                facts.append(json.loads(line))

    print(f"Total facts: {len(facts)}")
    cats = collections.Counter(f.get("category", "?") for f in facts)
    print(f"Category breakdown: {dict(cats)}")

    tok_counts = [len(f.get("observation", "").split()) for f in facts]
    print(f"Observation token count: min={min(tok_counts)} max={max(tok_counts)} mean={sum(tok_counts)/len(tok_counts):.1f}")

    # Distribution buckets
    buckets = collections.Counter()
    for t in tok_counts:
        if t < 30: buckets["<30"] += 1
        elif t < 60: buckets["30-59"] += 1
        elif t < 100: buckets["60-99"] += 1
        else: buckets["100+"] += 1
    print(f"Token distribution: {dict(buckets)}")

    by_cat = collections.defaultdict(list)
    for f in facts:
        by_cat[f.get("category", "?")].append(f)

    print("\n--- Sample facts (2 per category) ---")
    for cat in sorted(by_cat.keys()):
        items = by_cat[cat]
        print(f"\n[{cat}] n={len(items)}")
        for item in items[:2]:
            obs = item.get("observation", "")
            print(f"  {item.get('fact_id','?')} | {len(obs.split())} tokens | {obs[:150]!r}")

def audit_question_bank():
    print("\n" + "=" * 60)
    print("A.4 — Question bank phrasing audit (MJ/RC/HP vs EG)")
    print("=" * 60)
    with open(QB_PATH, "r", encoding="utf-8") as f:
        qb = json.load(f)

    # Detect structure
    if isinstance(qb, list):
        questions = qb
    elif isinstance(qb, dict):
        questions = []
        for cat, qs in qb.items():
            if isinstance(qs, list):
                for q in qs:
                    if isinstance(q, str):
                        questions.append({"category": cat, "question": q})
                    elif isinstance(q, dict):
                        q["category"] = q.get("category", cat)
                        questions.append(q)

    print(f"Total questions: {len(questions)}")
    cats = collections.Counter(q.get("category", "?") for q in questions)
    print(f"Per-category count: {dict(cats)}")

    # Print sample questions per category
    by_cat = collections.defaultdict(list)
    for q in questions:
        by_cat[q.get("category", "?")].append(q)

    target_cats = ["member_journey", "regulatory_compliance", "historical_precedent", "economic_governance"]
    for cat in target_cats:
        items = by_cat.get(cat, [])
        print(f"\n[{cat}] n={len(items)}")
        for item in items[:5]:
            qtext = item.get("question", str(item)[:200])
            print(f"  Q: {qtext[:200]}")


def audit_corpus_structure():
    print("\n" + "=" * 60)
    print("A.3 — Corpus context-paragraph structure")
    print("=" * 60)
    text = CORPUS_PATH.read_text(encoding="utf-8")
    print(f"Corpus size: {len(text):,} chars, {len(text.split()):,} words")

    # Find fact sections
    heading_re = re.compile(
        r"^### (?P<fact_id>(CS|AM|EG|MJ|RC|HP)-\d{2})\s*[^\n]*$",
        re.MULTILINE,
    )
    matches = list(heading_re.finditer(text))
    print(f"Fact headings found: {len(matches)}")

    # Analyze a few facts in detail (one per category)
    sample_cats = set()
    for i, m in enumerate(matches):
        fact_id = m.group("fact_id")
        prefix = fact_id.split("-")[0]
        if prefix in sample_cats:
            continue
        sample_cats.add(prefix)

        section_start = m.end()
        section_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[section_start:section_end]

        # Count paragraphs (double-newline separated)
        paragraphs = [p.strip() for p in re.split(r"\n\n+", section) if p.strip()]
        total_words = len(section.split())

        # Find bold canonical marker
        bold_marker = f"**{fact_id}.**"
        bold_idx = section.find(bold_marker)
        if bold_idx >= 0:
            rest = section[bold_idx + len(bold_marker):]
            pb = rest.find("\n\n")
            canonical_para = rest[:pb].strip() if pb >= 0 else rest.strip()
            canonical_words = len(canonical_para.split())
        else:
            canonical_words = 0

        pre_words = len(section[:bold_idx].split()) if bold_idx >= 0 else 0
        post_words = total_words - pre_words - canonical_words

        print(f"\n[{fact_id}] total_words={total_words} paragraphs={len(paragraphs)}")
        print(f"  canonical_words={canonical_words} pre_context_words={pre_words} post_context_words={post_words}")
        if paragraphs:
            print(f"  First para preview: {paragraphs[0][:150]!r}")

    if len(sample_cats) < 6:
        print(f"\nWARN: only got samples for {sample_cats}")


if __name__ == "__main__":
    audit_scribe()
    audit_question_bank()
    audit_corpus_structure()
    print("\n=== Phase A audit complete ===")
