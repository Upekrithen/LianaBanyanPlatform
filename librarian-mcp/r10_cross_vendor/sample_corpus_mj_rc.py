"""
sample_corpus_mj_rc.py — K535 Phase A: MJ/RC/HP fact deep-dive
Print full corpus sections for MJ-01..05, RC-01..03, HP-01..03 to understand why bold-only fails.
"""
import json
import re
import sys
from pathlib import Path

# Force utf-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp")
CORPUS_PATH = REPO / "r10_cross_vendor" / "r11v2_canonical_corpus_100k.md"
QB_PATH = REPO / "r10_cross_vendor" / "R11v2_QUESTION_BANK_SEALED_K528.json"
SCRIBE_PATH = REPO / "stitchpunks" / "scribes" / "scribe_R11.jsonl"

def parse_facts(text):
    heading_re = re.compile(r"^### (?P<fact_id>(CS|AM|EG|MJ|RC|HP)-\d{2})\s*[^\n]*$", re.MULTILINE)
    matches = list(heading_re.finditer(text))
    facts = {}
    for i, m in enumerate(matches):
        fact_id = m.group("fact_id")
        section_start = m.end()
        section_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        facts[fact_id] = text[section_start:section_end]
    return facts

def get_bold_canonical(fact_id, section):
    bold_marker = f"**{fact_id}.**"
    idx = section.find(bold_marker)
    if idx < 0:
        return "(NOT FOUND)"
    rest = section[idx + len(bold_marker):]
    pb = rest.find("\n\n")
    return rest[:pb].strip() if pb >= 0 else rest.strip()

def get_scribe_obs(fact_id):
    with open(SCRIBE_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                if rec.get('fact_id') == fact_id:
                    return rec.get('observation', '')
            except:
                pass
    return "(NOT FOUND)"

def load_questions_by_cat(cat_name):
    with open(QB_PATH, 'r', encoding='utf-8') as f:
        qb = json.load(f)
    qs = []
    if isinstance(qb, list):
        qs = [q for q in qb if q.get('category') == cat_name]
    elif isinstance(qb, dict):
        for cat, items in qb.items():
            if cat == cat_name and isinstance(items, list):
                for q in items:
                    if isinstance(q, str):
                        qs.append({'question': q})
                    elif isinstance(q, dict):
                        qs.append(q)
    return qs

def main():
    text = CORPUS_PATH.read_text(encoding='utf-8')
    facts = parse_facts(text)

    for cat_prefix, cat_name in [
        ('MJ', 'member_journey'),
        ('RC', 'regulatory_compliance'),
        ('HP', 'historical_precedent'),
    ]:
        qs = load_questions_by_cat(cat_name)
        print(f"\n{'='*70}")
        print(f"CATEGORY: {cat_prefix}/{cat_name}  ({len(qs)} questions)")
        print(f"Sample questions:")
        for q in qs[:5]:
            print(f"  Q: {q.get('question', str(q)[:200])}")

        # Show first 5 facts
        for i in range(1, 6):
            fid = f"{cat_prefix}-{str(i).zfill(2)}"
            if fid not in facts:
                continue
            section = facts[fid]
            canonical = get_bold_canonical(fid, section)
            scribe_obs = get_scribe_obs(fid)

            # Count words in each section part
            bold_idx = section.find(f"**{fid}.**")
            pre_context = section[:bold_idx].strip() if bold_idx >= 0 else ""
            remaining = section[bold_idx + len(f"**{fid}.**"):] if bold_idx >= 0 else ""
            pb = remaining.find("\n\n")
            post_context = remaining[pb:].strip() if pb >= 0 else ""

            print(f"\n  [{fid}] total_words={len(section.split())}")
            print(f"    SCRIBE OBS ({len(scribe_obs.split())} tokens): {scribe_obs[:400]}")
            print(f"    PRE-CONTEXT ({len(pre_context.split())} words): {pre_context[:200]!r}")
            print(f"    BOLD ({len(canonical.split())} words): {canonical[:400]}")
            print(f"    POST-CONTEXT ({len(post_context.split())} words): {post_context[:200]!r}")

if __name__ == "__main__":
    main()
