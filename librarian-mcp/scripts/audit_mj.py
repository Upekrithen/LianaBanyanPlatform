"""Audit MJ (maker_journey) b-variant questions in the haiku JSONL for K-MJ-Variant."""
import json
import collections

HAIKU = "r10_cross_vendor/results_r11v2_K535_v3_max200/lb_cathedral_haiku.jsonl"
ALL = "r10_cross_vendor/results_r11v2_K535_v3_max200/all_graded.jsonl"

records = [json.loads(l) for l in open(HAIKU)]

# --- Category distribution ---
print("=== CATEGORY DISTRIBUTION (haiku) ===")
cats = collections.Counter(r["category"] for r in records)
for cat, count in sorted(cats.items()):
    print(f"  {cat}: {count}")

# --- Grade by category ---
print()
print("=== GRADE BY CATEGORY (haiku) ===")
cat_grades = collections.defaultdict(lambda: collections.Counter())
for r in records:
    cat_grades[r["category"]][r["grade"]] += 1
for cat in sorted(cat_grades.keys()):
    g = cat_grades[cat]
    total = sum(g.values())
    hot_pct = g.get("HOT", 0) / total * 100
    print(f"  {cat}: HOT={g.get('HOT',0)}, HIT={g.get('HIT',0)}, MISS={g.get('MISS',0)} => {hot_pct:.1f}% HOT")

# --- Focus on MJ (maker_journey) ---
print()
MJ_CATS = ["maker_journey", "mj", "MJ"]
# Find the actual category label for MJ
mj_cats_found = [c for c in cats if any(sub in c.lower() for sub in ["maker", "mj"])]
print(f"MJ-related categories found: {mj_cats_found}")

mj_records = [r for r in records if r["category"] in mj_cats_found]
print(f"MJ record count: {len(mj_records)}")

non_hot = [r for r in mj_records if r["grade"] != "HOT"]
print(f"MJ non-HOT (MISS or HIT): {len(non_hot)}")

# --- Identify b-variant questions ---
# b-variants typically have "b" suffix in qid or differ in phrasing
print()
print("=== MJ NON-HOT QUESTIONS ===")
for r in non_hot:
    print(f"  qid={r['qid']} grade={r['grade']}")
    print(f"  question: {r['question'][:120]}")
    print(f"  required: {r['required_elements']}")
    resp_preview = r["response_text"][:200].replace("\n", " ")
    print(f"  response: {resp_preview}")
    print()

# --- All-vendor summary for MJ ---
print()
print("=== ALL-VENDOR MJ GRADE SUMMARY ===")
try:
    all_records = [json.loads(l) for l in open(ALL)]
    mj_all = [r for r in all_records if r["category"] in mj_cats_found]
    by_vendor = collections.defaultdict(lambda: collections.Counter())
    for r in mj_all:
        vendor_key = r.get("condition", r.get("vendor", "unknown"))
        by_vendor[vendor_key][r["grade"]] += 1
    for vk in sorted(by_vendor.keys()):
        g = by_vendor[vk]
        total = sum(g.values())
        hot_pct = g.get("HOT", 0) / total * 100 if total else 0
        print(f"  {vk}: HOT={g.get('HOT',0)}, HIT={g.get('HIT',0)}, MISS={g.get('MISS',0)} => {hot_pct:.1f}% HOT")
except Exception as e:
    print(f"  (all_graded.jsonl error: {e})")
