"""Deep audit of member_journey (MJ) non-HOT questions across all conditions."""
import json
import collections

ALL_GRADED = "r10_cross_vendor/results_r11v2_K535_v3_max200/all_graded.jsonl"
HAIKU = "r10_cross_vendor/results_r11v2_K535_v3_max200/lb_cathedral_haiku.jsonl"

# Load all graded
all_records = [json.loads(l) for l in open(ALL_GRADED)]
print(f"Total all_graded records: {len(all_records)}")

# Category distribution in all_graded
cats = collections.Counter(r["category"] for r in all_records)
print("\n=== CATEGORIES IN all_graded ===")
for cat, count in sorted(cats.items()):
    print(f"  {cat}: {count}")

# MJ = member_journey
MJ = "member_journey"
mj_all = [r for r in all_records if r["category"] == MJ]
print(f"\nTotal MJ records across all conditions: {len(mj_all)}")

# By condition
cond_grades = collections.defaultdict(lambda: collections.Counter())
for r in mj_all:
    cond_grades[r["condition"]][r["grade"]] += 1

print("\n=== MJ GRADE BY CONDITION ===")
for cond in sorted(cond_grades.keys()):
    g = cond_grades[cond]
    total = sum(g.values())
    hot_pct = g.get("HOT", 0) / total * 100
    print(f"  {cond}: HOT={g.get('HOT',0)}, HIT={g.get('HIT',0)}, MISS={g.get('MISS',0)} => {hot_pct:.1f}% HOT ({total} Qs)")

# Overall MJ
all_g = collections.Counter(r["grade"] for r in mj_all)
total_mj = len(mj_all)
overall_hot = all_g.get("HOT", 0) / total_mj * 100
print(f"\n  OVERALL MJ: HOT={all_g.get('HOT',0)}, HIT={all_g.get('HIT',0)}, MISS={all_g.get('MISS',0)} => {overall_hot:.1f}% HOT")

# Non-HOT MJ questions — identify patterns
mj_non_hot = [r for r in mj_all if r["grade"] != "HOT"]
print(f"\n=== MJ NON-HOT RECORDS: {len(mj_non_hot)} ===")

# Group by qid to see which questions are consistently wrong
by_qid = collections.defaultdict(list)
for r in mj_non_hot:
    by_qid[r["qid"]].append(r)

print(f"\nDistinct non-HOT QIDs: {len(by_qid)}")
for qid in sorted(by_qid.keys()):
    recs = by_qid[qid]
    grades = [r["grade"] for r in recs]
    conds = [r["condition"] for r in recs]
    print(f"\n  QID: {qid}")
    print(f"  question: {recs[0]['question'][:140]}")
    print(f"  required: {recs[0]['required_elements']}")
    print(f"  grades by cond: {dict(zip(conds, grades))}")
    print(f"  source_fact_id: {recs[0].get('source_fact_id','?')}")

# Haiku-specific non-HOT detail
print("\n\n=== HAIKU MJ NON-HOT — FULL RESPONSE PREVIEW ===")
haiku_records = [json.loads(l) for l in open(HAIKU)]
haiku_mj_nh = [r for r in haiku_records if r["category"] == MJ and r["grade"] != "HOT"]
for r in haiku_mj_nh:
    print(f"\n  QID: {r['qid']} grade={r['grade']} source={r.get('source_fact_id','?')}")
    print(f"  Q: {r['question']}")
    print(f"  required: {r['required_elements']}")
    resp = r["response_text"].replace("\n", " ")[:400]
    print(f"  response: {resp}")
