"""
smoke_test_retrieval_K535.py — C.5 Smoke test for K535 rich-fact retrieval
Queries consult_scribes against MJ/RC/HP test claims and verifies that the
full-section observations surface in the retrieved entries.
"""
import json
import subprocess
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform/librarian-mcp")
CONSULT_CLI = REPO / "r10_cross_vendor" / "consult_scribes_cli.mjs"

# Test queries — one representative from each of the 6 categories
TEST_QUERIES = [
    # MJ — should now find full context including "Reference Onboarding Framework"
    ("MJ", "Within how many business days must cooperative platforms process membership applications under the Reference Onboarding Framework?"),
    ("MJ", "What minimum score on the Cooperative Principles Assessment must a new member achieve before being granted full voting rights?"),
    # RC — should now find full regulatory compliance context
    ("RC", "On what cycle must AI models deployed in member-facing roles undergo comprehensive third-party audits under the Cooperative AI Governance Charter?"),
    ("RC", "After how many months of member inactivity must platforms delete or fully anonymize personal data under the Cooperative Data Stewardship Standard?"),
    # HP — should now find historical context with locations and dates
    ("HP", "In which city and country was the first Cooperative AI Platform Summit held, and on what date?"),
    ("HP", "In what quarter and year did the Verdania Cooperative Platform enter financial distress, and how long did its receivership last?"),
    # EG — should remain at high accuracy (regression check)
    ("EG", "What is the canonical patronage allocation split used by platforms compliant with the Cooperative Capital Framework?"),
    # CS and AM — regression checks
    ("CS", "What is the total membership count of the Verdania Cooperative Platform?"),
    ("AM", "What is the ratio of dense to sparse retrieval in the Thornwick architecture?"),
]

def consult(query: str, max_entries: int = 150) -> dict:
    proc = subprocess.Popen(
        ["node", str(CONSULT_CLI)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=str(CONSULT_CLI.parent),
        text=True,
        encoding="utf-8",
        bufsize=1,
    )
    inp = json.dumps({"topic": query, "max_entries": max_entries})
    stdout, stderr = proc.communicate(input=inp + "\n", timeout=30)
    if stderr:
        pass  # Ignore stderr noise
    line = stdout.strip().split("\n")[0]
    return json.loads(line)

def main():
    print("=" * 65)
    print("K535 Smoke Test — Rich-Fact Retrieval Verification")
    print("=" * 65)

    if not CONSULT_CLI.exists():
        print(f"ERROR: {CONSULT_CLI} not found", file=sys.stderr)
        sys.exit(1)

    pass_count = 0
    fail_count = 0

    for cat, query in TEST_QUERIES:
        print(f"\n[{cat}] Q: {query[:80]}...")

        result = consult(query)
        if not result.get("ok"):
            print(f"  FAIL: consult returned error: {result}")
            fail_count += 1
            continue

        data = result.get("result", {})
        consulted = data.get("scribes_consulted", [])
        entries = data.get("entries", [])

        # Check R11 was consulted
        r11_consulted = any(c["scribe_id"] == "R11" for c in consulted)
        r11_entries = [e for e in entries if e.get("scribe_id") == "R11"]
        n_r11 = len(r11_entries)

        print(f"  Scribes consulted: {[c['scribe_id'] for c in consulted[:5]]}")
        print(f"  R11 consulted: {r11_consulted} | R11 entries returned: {n_r11}")

        if not r11_consulted or n_r11 == 0:
            print(f"  FAIL: R11 not returned for {cat} question")
            fail_count += 1
            continue

        # Check token count of first R11 entry
        first_obs = r11_entries[0].get("observation", "")
        first_tokens = len(first_obs.split())
        print(f"  First R11 entry: {r11_entries[0].get('fact_id', '?')} | {first_tokens} tokens")
        print(f"  Observation preview: {first_obs[:200].replace(chr(10), ' ')}")

        # Verify rich content: should have >100 tokens (v1 had ~43)
        if first_tokens > 100:
            print(f"  PASS: rich observation confirmed ({first_tokens} > 100 tokens)")
            pass_count += 1
        else:
            print(f"  FAIL: observation too short ({first_tokens} tokens, expected >100)")
            fail_count += 1

    print(f"\n{'='*65}")
    print(f"Smoke test complete: {pass_count} PASS, {fail_count} FAIL out of {len(TEST_QUERIES)} queries")

    if fail_count == 0:
        print("ALL PASS — rich-fact indexing confirmed. Ready for Phase D benchmark.")
    else:
        print(f"WARNING: {fail_count} failures — investigate before running Phase D.")

if __name__ == "__main__":
    main()
