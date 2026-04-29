"""Audit KP test2 detail JSONL for retrieval composition and PDC analysis."""
import json

DETAIL = "empirical_tests/results/kp_test2_detail_2026-04-29T01-58-47.jsonl"

records = [json.loads(l) for l in open(DETAIL)]

print(f"KP Test2 Detail — {len(records)} queries\n")
print("=" * 70)

total_hot_van = 0
total_hot_kp = 0
total_cost_van = 0.0
total_cost_kp = 0.0

for r in records:
    van = r["vanilla"]
    kp = r["kp_on"]

    van_grade = van.get("grade", "?")
    kp_grade = kp.get("grade", "?")
    van_cost = van.get("cost_usd", 0.0) or 0.0
    kp_cost = kp.get("cost_usd", 0.0) or 0.0

    if van_grade == "HOT":
        total_hot_van += 1
    if kp_grade == "HOT":
        total_hot_kp += 1
    total_cost_van += van_cost
    total_cost_kp += kp_cost

    van_facts = van.get("top_k_facts", [])
    kp_facts = kp.get("top_k_facts", [])

    print(f"QID: {r['qid']} | cat={r['category']}")
    print(f"  Q: {r['question'][:100]}")
    print(f"  mastery_profile: {r.get('kp_mastery_profile', [])}")
    print(f"  vanilla: grade={van_grade} cost=${van_cost:.5f} facts={len(van_facts)}")
    print(f"  kp_on:   grade={kp_grade} cost=${kp_cost:.5f} facts={len(kp_facts)}")

    # Fact composition
    print(f"  vanilla retrieved: {[f['fact_id'] for f in van_facts]}")
    for f in van_facts:
        print(f"    {f['fact_id']} kw={f.get('keyword_score',0):.2f} bridge={f.get('bridge_score',0):.2f} total={f.get('total_score',0):.2f}")

    print(f"  kp_on retrieved:   {[f['fact_id'] for f in kp_facts]}")
    for f in kp_facts:
        print(f"    {f['fact_id']} kw={f.get('keyword_score',0):.2f} bridge={f.get('bridge_score',0):.2f} total={f.get('total_score',0):.2f}")

    # Retrieval diff info
    rdiff = r.get("retrieval_diff", {})
    print(f"  retrieval_diff: {rdiff}")
    print()

print("=" * 70)
n = len(records)
print(f"SUMMARY: {n} queries")
print(f"  vanilla HOT: {total_hot_van}/{n} = {total_hot_van/n*100:.1f}%")
print(f"  kp_on   HOT: {total_hot_kp}/{n} = {total_hot_kp/n*100:.1f}%")
print(f"  HOT delta: {(total_hot_kp - total_hot_van)/n*100:+.1f}pp")
print(f"  vanilla total cost: ${total_cost_van:.4f}")
print(f"  kp_on   total cost: ${total_cost_kp:.4f}")
if total_cost_van > 0:
    pdc = total_cost_kp / total_cost_van
    print(f"  PDC (kp_on / vanilla): {pdc:.3f}x  (gate >= 1.20)")
else:
    print("  PDC: N/A (vanilla cost=0)")
