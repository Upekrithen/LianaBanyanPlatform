"""
sample_corpus_facts.py — K535 Phase A deep audit
Examine full corpus text for sample EG vs MJ facts and question/answer matching.
"""
import json
import re
from pathlib import Path

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp")
CORPUS_PATH = REPO / "r10_cross_vendor" / "r11v2_canonical_corpus_100k.md"
QB_PATH = REPO / "r10_cross_vendor" / "R11v2_QUESTION_BANK_SEALED_K528.json"
SCRIBE_PATH = REPO / "stitchpunks" / "scribes" / "scribe_R11.jsonl"

def parse_facts(text):
    heading_re = re.compile(
        r"^### (?P<fact_id>(CS|AM|EG|MJ|RC|HP)-\d{2})\s*[^\n]*$",
        re.MULTILINE,
    )
    matches = list(heading_re.finditer(text))
    facts = {}
    for i, m in enumerate(matches):
        fact_id = m.group("fact_id")
        section_start = m.end()
        section_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[section_start:section_end]
        facts[fact_id] = section
    return facts

def get_bold_canonical(fact_id, section):
    bold_marker = f"**{fact_id}.**"
    idx = section.find(bold_marker)
    if idx < 0:
        return "(NOT FOUND)"
    rest = section[idx + len(bold_marker):]
    pb = rest.find("\n\n")
    return rest[:pb].strip() if pb >= 0 else rest.strip()

def get_scribe_observation(fact_id):
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
    return "(NOT FOUND IN SCRIBE)"

def load_questions():
    with open(QB_PATH, 'r', encoding='utf-8') as f:
        qb = json.load(f)
    if isinstance(qb, list):
        return qb
    elif isinstance(qb, dict):
        qs = []
        for cat, items in qb.items():
            if isinstance(items, list):
                for q in items:
                    if isinstance(q, str):
                        qs.append({'category': cat, 'question': q})
                    elif isinstance(q, dict):
                        q.setdefault('category', cat)
                        qs.append(q)
        return qs
    return []

def main():
    text = CORPUS_PATH.read_text(encoding='utf-8')
    facts = parse_facts(text)
    questions = load_questions()

    # Index questions by category
    by_cat = {}
    for q in questions:
        cat = q.get('category', '?')
        by_cat.setdefault(cat, []).append(q.get('question', str(q)[:200]))

    # Deep-compare EG vs MJ — first 5 facts each
    for cat_prefix, cat_name in [('EG', 'economic_governance'), ('MJ', 'member_journey'), ('RC', 'regulatory_compliance'), ('HP', 'historical_precedent')]:
        print(f"\n{'='*70}")
        print(f"CATEGORY: {cat_prefix} / {cat_name}")
        print(f"{'='*70}")

        # Sample questions
        qs = by_cat.get(cat_name, [])
        print(f"\nSample questions ({len(qs)} total):")
        for q in qs[:5]:
            print(f"  Q: {q}")

        # Sample facts
        fact_ids = [f"{cat_prefix}-{str(i).zfill(2)}" for i in range(1, 6)]
        for fid in fact_ids:
            if fid not in facts:
                continue
            section = facts[fid]
            canonical = get_bold_canonical(fid, section)
            scribe_obs = get_scribe_observation(fid)
            total_words = len(section.split())

            print(f"\n  [{fid}] corpus_words={total_words}")
            print(f"    BOLD CANONICAL ({len(canonical.split())} words):")
            print(f"      {canonical[:300]}")
            print(f"    SCRIBE OBS ({len(scribe_obs.split())} tokens):")
            print(f"      {scribe_obs[:300]}")

            # Check if any sample question could be answered from bold canonical
            print(f"    QUESTION MATCH CHECK:")
            for q in qs[:3]:
                # Simple keyword overlap
                q_words = set(q.lower().split())
                obs_words = set(canonical.lower().split())
                overlap = q_words & obs_words - {'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'is', 'are', 'that', 'which', 'what', 'how', 'many'}
                print(f"      Q overlap_words({len(overlap)}): {list(overlap)[:8]}")

if __name__ == "__main__":
    main()
