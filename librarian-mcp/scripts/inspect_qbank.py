"""Inspect the R11v2 question bank."""
import json

bpath = "r10_cross_vendor/R11v2_QUESTION_BANK_SEALED_K528.json"
bank = json.load(open(bpath))
print(f"Type: {type(bank).__name__}, keys or len: {list(bank.keys())[:5] if isinstance(bank, dict) else len(bank)}")

if isinstance(bank, dict):
    # Might be {category: [questions]} or {qid: question}
    for k in list(bank.keys())[:3]:
        val = bank[k]
        print(f"  key={k}: type={type(val).__name__}")
        if isinstance(val, list):
            print(f"    first item: {str(val[0])[:120]}")
elif isinstance(bank, list):
    print(f"Total questions: {len(bank)}")
    cats = {}
    for q in bank:
        c = q.get("category", "?")
        cats[c] = cats.get(c, 0) + 1
    print("Categories:", cats)
    mj = [q for q in bank if q.get("category") == "member_journey"]
    print(f"MJ questions: {len(mj)}")
    for q in mj[:5]:
        qid = q.get("qid", "?")
        question = q.get("question", "")[:80]
        required = q.get("required_elements", [])[:2]
        print(f"  {qid}: {question}")
        print(f"    required: {required}")
