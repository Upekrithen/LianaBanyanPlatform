#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os; os.environ.setdefault("PYTHONIOENCODING", "utf-8")
"""
test_prov16_spec.py — KN071 Phase D test suite for PROV_16 specification.

Tests:
  T01 — Markdown parses without fatal errors (pandoc stdout empty = no fatal errors)
  T02 — HTML output exists and is non-empty
  T03 — PDF output exists and is non-empty
  T04 — Claims numbered correctly (Claim 1 through Claim N, no gaps ≤28)
  T05 — Cross-references to Prov 13/14/15 are present and cite correct USPTO numbers
  T06 — Canonical numbers match MEMORY.md / eblet canon (2270+ innovations, 15 provisionals, etc.)
  T07 — Pawn Q2 enabling-disclosure self-check (each major claim cites empirical anchor)
  T08 — Pawn Q1 variation-coverage self-check (scope-wedge variations present)
  T09 — Cooperative Defensive Patent Pledge (#2260) framing present throughout
  T10 — Path B discipline statement present
  T11 — Walkaround (BP006 ratification) section present
  T12 — FIRE-TODAY gate statement present (USPTO_SUBMISSION_AUTHORIZED=false)

Run: python legal/provisionals/test_prov16_spec.py
"""

import re
import sys
from pathlib import Path

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform")
SPEC_MD = REPO / "legal/provisionals/PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION_DRAFT.md"
SPEC_HTML = REPO / "legal/provisionals/PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION.html"
SPEC_PDF = REPO / "legal/provisionals/PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION.pdf"

RESULTS = []
PASSED = 0
FAILED = 0
WARNED = 0


def record(test_id, verdict, detail):
    global PASSED, FAILED, WARNED
    RESULTS.append((test_id, verdict, detail))
    if verdict == "PASS":
        PASSED += 1
    elif verdict == "FAIL":
        FAILED += 1
    else:
        WARNED += 1
    print(f"  [{verdict:4s}] {test_id}: {detail}")


def run_tests():
    if not SPEC_MD.exists():
        print(f"[FATAL] Spec not found: {SPEC_MD}")
        sys.exit(1)

    text = SPEC_MD.read_text(encoding="utf-8")
    lines = text.splitlines()
    line_count = len(lines)

    print(f"\n=== KN071 Phase D Test Suite — PROV_16 Specification ===")
    print(f"  Input: {SPEC_MD.name} ({line_count} lines)\n")

    # T01 — Markdown parses (pandoc produces HTML without crash)
    try:
        import subprocess
        result = subprocess.run(
            ["pandoc", str(SPEC_MD), "-o", "-", "--to=plain"],
            capture_output=True, timeout=30
        )
        if result.returncode == 0:
            stdout_text = result.stdout.decode("utf-8", errors="replace")
            word_count = len(stdout_text.split())
            record("T01", "PASS", f"pandoc plain-text parse clean; {word_count} words")
        else:
            stderr_txt = (result.stderr or b"").decode("utf-8", errors="replace")[:200]
            record("T01", "FAIL", f"pandoc exit {result.returncode}: {stderr_txt}")
    except Exception as e:
        record("T01", "FAIL", f"pandoc error: {e}")

    # T02 — HTML output exists and non-empty
    if SPEC_HTML.exists() and SPEC_HTML.stat().st_size > 10_000:
        record("T02", "PASS", f"HTML exists, {SPEC_HTML.stat().st_size:,} bytes")
    elif SPEC_HTML.exists():
        record("T02", "WARN", f"HTML exists but small ({SPEC_HTML.stat().st_size} bytes)")
    else:
        record("T02", "FAIL", "HTML output missing")

    # T03 — PDF output exists and non-empty
    if SPEC_PDF.exists() and SPEC_PDF.stat().st_size > 50_000:
        record("T03", "PASS", f"PDF exists, {SPEC_PDF.stat().st_size:,} bytes")
    elif SPEC_PDF.exists():
        record("T03", "WARN", f"PDF exists but small ({SPEC_PDF.stat().st_size} bytes) — check rendering")
    else:
        record("T03", "FAIL", "PDF output missing")

    # T04 — Claims numbered Claim 1 through Claim N, contiguous, minimum 20
    claim_matches = re.findall(r'^\*\*Claim (\d+)\*\*', text, re.MULTILINE)
    claim_nums = [int(x) for x in claim_matches]
    if not claim_nums:
        record("T04", "FAIL", "No numbered claims found")
    else:
        max_claim = max(claim_nums)
        expected = list(range(1, max_claim + 1))
        if claim_nums == expected and max_claim >= 20:
            record("T04", "PASS", f"{max_claim} claims, numbered 1-{max_claim}, contiguous, >=20 minimum MET")
        elif max_claim >= 20:
            missing = sorted(set(expected) - set(claim_nums))
            record("T04", "WARN", f"{max_claim} claims but gaps at: {missing}")
        else:
            record("T04", "FAIL", f"Only {max_claim} claims found — minimum 20 required")

    # T05 — Cross-references to Prov 13/14/15 with correct USPTO numbers
    prov13_ok = "64/036,646" in text
    prov14_ok = "64/052,602" in text
    prov15_ok = "64/052,618" in text
    if prov13_ok and prov14_ok and prov15_ok:
        record("T05", "PASS", "All three USPTO cross-reference numbers present (Prov 13/14/15)")
    else:
        missing_provs = []
        if not prov13_ok: missing_provs.append("Prov13=64/036,646")
        if not prov14_ok: missing_provs.append("Prov14=64/052,602")
        if not prov15_ok: missing_provs.append("Prov15=64/052,618")
        record("T05", "FAIL", f"Missing cross-references: {', '.join(missing_provs)}")

    # T06 — Canonical numbers present
    checks = {
        "2,270 innovations (or 2270)": bool(re.search(r'2,?270', text)),
        "15 provisionals": bool(re.search(r'15 provisional', text, re.IGNORECASE)),
        "$5/year membership": "$5/year" in text,
        "97.2% savings (empirical)": "97.2%" in text,
        "35.72x savings": "35.72" in text,
        "EIN 41-2797446": "41-2797446" in text,
        "Wyoming C-Corporation": "Wyoming C-Corporation" in text,
    }
    passed_canonical = sum(1 for v in checks.values() if v)
    total_canonical = len(checks)
    if passed_canonical == total_canonical:
        record("T06", "PASS", f"All {total_canonical} canonical numbers/facts verified")
    else:
        failed_checks = [k for k, v in checks.items() if not v]
        record("T06", "WARN", f"{passed_canonical}/{total_canonical} canonical checks; missing: {failed_checks}")

    # T07 — Pawn Q2 enabling-disclosure: each Cluster A section cites empirical anchor
    empirical_anchors = {
        "#2336 KN042": "KN042" in text and "0696f31" in text,
        "#2337 Ring of Three evidence": "282" in text and "450+" in text,
        "#2338 KN046/KN045/KN049": "34/34" in text,
        "#2339 KN050": "27/27" in text,
        "#2340 KN057": "50/50" in text and "97.2%" in text,
        "#2341 Pod T/Y/AA": "35/35" in text and "36/36" in text,
        "#2342 KN037/KN067": "13/13" in text and "19/19" in text,
        "#2343 KN038": "18/18" in text and "98d1745" in text,
        "#2344 KN036": "41/41" in text,
        "#2345 KN037": "ba2131f" in text,
        "#2346 KN043": "8/8" in text and "7701c84" in text,
        "#2347 Walkaround": "26 PASS" in text,
    }
    anchor_passed = sum(1 for v in empirical_anchors.values() if v)
    anchor_total = len(empirical_anchors)
    if anchor_passed == anchor_total:
        record("T07", "PASS", f"All {anchor_total} enabling-disclosure empirical anchors present")
    elif anchor_passed >= int(0.8 * anchor_total):
        missing_anchors = [k for k, v in empirical_anchors.items() if not v]
        record("T07", "WARN", f"{anchor_passed}/{anchor_total} anchors; review: {missing_anchors}")
    else:
        missing_anchors = [k for k, v in empirical_anchors.items() if not v]
        record("T07", "FAIL", f"Only {anchor_passed}/{anchor_total} anchors; missing: {missing_anchors}")

    # T08 — Pawn Q1 variation coverage: scope-wedge variations present
    variation_checks = {
        "A1 variations (Variation 1/2/3)": text.count("Variation 1:") >= 1,
        "A2 variations (Ring of Two/N)": "Ring of Two" in text,
        "A5 variations (price/license)": "Variation: Membership fee" in text,
        "General scope-wedge present": text.count("Variation:") >= 6 or text.count("Variation 1:") >= 2,
    }
    var_passed = sum(1 for v in variation_checks.values() if v)
    var_total = len(variation_checks)
    if var_passed == var_total:
        record("T08", "PASS", f"All {var_total} Pawn Q1 variation-coverage checks met")
    else:
        record("T08", "WARN", f"{var_passed}/{var_total} variation checks; gaps: {[k for k,v in variation_checks.items() if not v]}")

    # T09 — Cooperative Defensive Patent Pledge (#2260) framing throughout
    pledge_mentions = len(re.findall(r'#2260|Cooperative Defensive Patent Pledge', text))
    if pledge_mentions >= 5:
        record("T09", "PASS", f"#2260 Pledge framing found {pledge_mentions} times (≥5 required)")
    else:
        record("T09", "WARN", f"#2260 Pledge framing only found {pledge_mentions} times; recommend ≥5")

    # T10 — Path B discipline statement present
    path_b_present = "Path B" in text and "Proof Before Claim" in text
    if path_b_present:
        record("T10", "PASS", "Path B Proof Before Claim discipline statement present")
    else:
        record("T10", "FAIL", "Path B discipline statement missing")

    # T11 — Walkaround (BP006) section present with ratification reference
    walkaround_bp006 = "BP006" in text and "Walkaround" in text and "BP006 turn 4" in text
    if walkaround_bp006:
        record("T11", "PASS", "Walkaround BP006 ratification section present")
    else:
        record("T11", "WARN", "Walkaround BP006 reference — check ratification turn reference")

    # T12 — USPTO gate flag present (FIRE-TODAY override acknowledges gate)
    gate_present = "USPTO_SUBMISSION_AUTHORIZED=false" in text
    if gate_present:
        record("T12", "PASS", "USPTO_SUBMISSION_AUTHORIZED=false gate present (Fire Control compliant)")
    else:
        record("T12", "FAIL", "Fire Control gate flag missing")

    # Summary
    print(f"\n{'='*60}")
    print(f"  RESULTS: {PASSED} PASS  |  {WARNED} WARN  |  {FAILED} FAIL")
    print(f"  Total tests: {PASSED + WARNED + FAILED}")
    print(f"  Spec MD: {line_count} lines")
    print(f"  Claims: {max(claim_nums) if claim_nums else 0}")
    print(f"{'='*60}")

    if FAILED > 0:
        print(f"\n[TEST SUITE] FAILED — {FAILED} test(s) failed. Review before filing.")
        return 1
    elif WARNED > 0:
        print(f"\n[TEST SUITE] WARN — {WARNED} warning(s). Review recommended before filing.")
        return 0
    else:
        print(f"\n[TEST SUITE] ALL PASS — spec ready for Founder review and USPTO filing.")
        return 0


if __name__ == "__main__":
    sys.exit(run_tests())
