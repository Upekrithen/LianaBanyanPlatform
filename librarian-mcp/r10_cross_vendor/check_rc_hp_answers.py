import sys, json
sys.stdout.reconfigure(encoding='utf-8')

base = r'C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\r10_cross_vendor\results_r11v2_K535_v2_canonical'

for cond in ['lb_cathedral_haiku', 'lb_cathedral_sonnet']:
    path = f'{base}\\{cond}.jsonl'
    try:
        with open(path) as f:
            rows = [json.loads(l) for l in f if l.strip()]
    except FileNotFoundError:
        print(f"[{cond}] file not found")
        continue

    print(f"\n{'='*60}")
    print(f"CONDITION: {cond}")
    print(f"{'='*60}")
    for cat in ['regulatory_compliance', 'historical_precedent']:
        cat_rows = [r for r in rows if r.get('category') == cat]
        if not cat_rows:
            print(f"  [{cat}] no rows yet")
            continue
        total = len(cat_rows)
        hot = sum(1 for r in cat_rows if r.get('grade') == 'HOT')
        hit = sum(1 for r in cat_rows if r.get('grade') == 'HIT')
        miss = sum(1 for r in cat_rows if r.get('grade') == 'MISS')
        print(f"\n  [{cat}] {total} rows: HOT={hot} HIT={hit} MISS={miss} ({(hot+hit)*100//total if total else 0}% HOT+HIT)")
        for r in cat_rows:
            grade = r.get('grade', '?')
            if grade in ('MISS', 'HIT'):
                print(f"    {r['qid']} [{grade}]")
                print(f"      Q: {r['question'][:90]}")
                req = r.get('required_elements', [])
                print(f"      Required: {req}")
                print(f"      Answer:   {r.get('response_text', '')[:200]}")
                print()
