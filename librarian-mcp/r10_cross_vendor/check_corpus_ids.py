import sys, json
sys.stdout.reconfigure(encoding='utf-8')

SCRIBE = r'C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\stitchpunks\scribes\scribe_R11.jsonl'

with open(SCRIBE) as f:
    rows = [json.loads(l) for l in f if l.strip()]

rows_with_facts = [r for r in rows if r.get('fact_id')]

# Show corpus_id distribution
from collections import Counter
corpus_ids = Counter(r.get('corpus_id', 'NONE') for r in rows_with_facts)
print("corpus_id distribution:", dict(corpus_ids))
print()

# Show first RC entry full content
for r in rows_with_facts:
    if r['fact_id'] == 'RC-01':
        print("RC-01 full entry:")
        print(json.dumps(r, indent=2))
        break
