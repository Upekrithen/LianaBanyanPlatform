"""Quick snapshot analysis for K488 Phase B and D planning."""
import json
from collections import Counter
from pathlib import Path

SNAP = Path(__file__).parent.parent / "miner_population_snapshot_K487.jsonl"

ghosts = []
filename_stem_topics = []
topics = []
all_miners = []

with SNAP.open() as f:
    for line in f:
        m = json.loads(line)
        all_miners.append(m)
        topic = m.get("primary_topic") or ""
        topics.append(topic)
        if m.get("tablet_count", 0) == 0:
            ghosts.append(m)
        # filename-stem heuristic: has underscore + digit in topic
        if "_" in topic and any(c.isdigit() for c in topic):
            filename_stem_topics.append({"serial": m["serial"], "topic": topic})

print(f"Total Miners: {len(topics)}")
print(f"Ghost Miners (tablet_count=0): {len(ghosts)}")
print(f"Filename-stem topics: {len(filename_stem_topics)}")
print()

print("Filename-stem Miners:")
for fs in filename_stem_topics:
    print(f"  {fs['serial']:<45} topic={fs['topic']}")
print()

print("Top 20 topics by frequency:")
tc = Counter(topics)
for t, c in tc.most_common(20):
    print(f"  {c:3} x {t!r}")
print()

print(f"Ghost serials ({len(ghosts)} total):")
for g in ghosts[:20]:
    print(f"  {g['serial']:<45} parent={g['parent_serial']} topic={g['primary_topic']}")
if len(ghosts) > 20:
    print(f"  ... and {len(ghosts)-20} more")
