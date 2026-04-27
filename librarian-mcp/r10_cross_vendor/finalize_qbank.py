#!/usr/bin/env python3
import json
from pathlib import Path
BANK_PATH = Path(__file__).parent / "R11v2_QUESTION_BANK_SEALED_K528.json"
CORPUS_PATH = Path(__file__).parent / "r11v2_canonical_corpus_100k.md"
corpus = CORPUS_PATH.read_text(encoding="utf-8")
bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))

extras = [
    {
        "id": "R11v2-CS-22b",
        "category": "canonical_statistics",
        "source_fact_id": "CS-22",
        "question": "What fraction of cooperative sector platforms have achieved full CPSF certification?",
        "ground_truth": "One-third of the cooperative sector platforms.",
        "canonical_answer": "One-third of the cooperative sector platforms.",
        "hot_required_elements": ["one-third"],
        "hit_required_elements": ["one-third"],
        "hallucination_risk": "medium",
        "rubric": {
            "correct": "Contains one-third in context of CPSF certification",
            "partial": "Contains a fraction without CPSF context",
            "incorrect": "Does not contain the correct fraction"
        }
    },
    {
        "id": "R11v2-MJ-24b",
        "category": "member_journey",
        "source_fact_id": "MJ-24",
        "question": "What percentage of members at platforms with a Cooperative Health Score above 80 rate their platform as trustworthy?",
        "ground_truth": "91% of members rate their platform as trustworthy.",
        "canonical_answer": "91%.",
        "hot_required_elements": ["91%"],
        "hit_required_elements": ["91"],
        "hallucination_risk": "high",
        "rubric": {
            "correct": "Contains 91% in context of trustworthiness at high-CHS platforms",
            "partial": "Contains 91 without % or trust context",
            "incorrect": "Does not contain the correct percentage"
        }
    },
    {
        "id": "R11v2-HP-24b",
        "category": "historical_precedent",
        "source_fact_id": "HP-24",
        "question": "Where and when was the Nordic Cooperative AI Observatory established, and how many Nordic cooperative platforms provided founding funding?",
        "ground_truth": "Established in Oslo, Norway, in 2019, with founding funding from nine Nordic cooperative platforms.",
        "canonical_answer": "Oslo, Norway, 2019; nine founding cooperative platforms.",
        "hot_required_elements": ["Oslo, Norway", "nine Nordic"],
        "hit_required_elements": ["Oslo", "Norway", "2019", "nine"],
        "hallucination_risk": "medium",
        "rubric": {
            "correct": "Contains Oslo, Norway and nine Nordic platforms",
            "partial": "Contains the location or the count but not both",
            "incorrect": "Does not contain the correct location or founding platform count"
        }
    }
]

failures = []
for qu in extras:
    for el in qu["hot_required_elements"]:
        if el.lower() not in corpus.lower():
            failures.append((qu["id"], el))

if failures:
    print("FAILURES:", failures)
else:
    bank["questions"].extend(extras)
    total = len(bank["questions"])
    from collections import Counter
    counts = Counter(q["category"] for q in bank["questions"])
    print(f"Total: {total}")
    print("Per category:", dict(counts))
    bank["bank_status"] = f"SEALED - {total} questions, 6 categories. K528 R11-v2."
    bank["category_counts"] = dict(counts)
    BANK_PATH.write_text(json.dumps(bank, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Written to {BANK_PATH}")
    print("ALL HOT ELEMENTS VERIFIED. SEALED and ready for Phase B execution.")
