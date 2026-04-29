"""Show all MJ (member_journey) entries in scribe_R11.jsonl."""
import json

lines = open("stitchpunks/scribes/scribe_R11.jsonl").readlines()
print(f"scribe_R11.jsonl: {len(lines)} entries total")

mj = [json.loads(l) for l in lines if json.loads(l).get("category", "") == "member_journey"]
print(f"MJ entries: {len(mj)}")
print()

for r in mj:
    print(f"=== {r['fact_id']}: {r['title']} ===")
    print(json.dumps(r, indent=2))
    print()
