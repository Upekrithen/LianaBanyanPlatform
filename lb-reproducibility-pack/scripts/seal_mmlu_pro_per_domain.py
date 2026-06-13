"""
SEG-B3: Seal canonical Q banks with sha256 receipts.
BP081 · Wave B · Disk-backed canon enforcement
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DOMAINS = [
    "math",
    "physics",
    "chemistry",
    "biology",
    "computer_science",
    "engineering",
    "history",
    "philosophy",
    "law",
    "business",
    "economics",
    "psychology",
    "health",
    "other",
]

OUT_BASE = Path(__file__).parent.parent / "datasets" / "mmlu_pro_per_domain"
RECEIPT_PATH = Path(__file__).parent.parent / "BP081_MMLU_PRO_PER_DOMAIN_SEALED_RECEIPT.md"
MIN_QS = 20
SEAL_METHOD = "BP081-Wave-B-structural-check"
SOURCE_DATASET = "TIGER-Lab/MMLU-Pro"

FINAL_SCHEMA_KEYS = {"question", "options", "correct_answer", "source_id", "source_category"}


def sha256_of_questions(questions: list) -> str:
    """Compute sha256 over the canonical JSON representation."""
    canonical = json.dumps(questions, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def seal_domain(domain: str) -> dict:
    """Seal one domain: read curated, emit questions.json + SEAL.sha256 + META.json."""
    curated_file = OUT_BASE / domain / "questions_curated.json"
    sealed_file = OUT_BASE / domain / "questions.json"
    seal_file = OUT_BASE / domain / "SEAL.sha256"
    meta_file = OUT_BASE / domain / "META.json"

    if not curated_file.exists():
        print(f"  ERROR: {curated_file} not found — skipping '{domain}'")
        return {"domain": domain, "q_count": 0, "sha256": "MISSING", "skipped": True}

    with open(curated_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    is_stub = payload.get("_stub", False)
    all_qs = payload.get("questions", [])

    # Filter to curation_pass=True only
    passed = [q for q in all_qs if q.get("curation_pass") is True]

    # Strip to final schema (drop curation metadata)
    final_qs = []
    for q in passed:
        final_qs.append({
            "question": q["question"],
            "options": q["options"],
            "correct_answer": q["correct_answer"],
            "source_id": q.get("source_id", ""),
            "source_category": q.get("source_category", ""),
        })

    # Write sealed questions.json
    with open(sealed_file, "w", encoding="utf-8") as f:
        json.dump(final_qs, f, ensure_ascii=False, indent=2)

    # Compute sha256
    digest = sha256_of_questions(final_qs)

    # Write SEAL.sha256
    with open(seal_file, "w", encoding="utf-8") as f:
        f.write(f"sha256:{digest}  questions.json\n")

    # Build and write META.json
    seal_ts = datetime.now(timezone.utc).isoformat()
    shortfall = len(final_qs) < MIN_QS
    meta = {
        "total_qs": len(all_qs),
        "curation_pass_count": len(final_qs),
        "seal_timestamp": seal_ts,
        "seal_method": SEAL_METHOD,
        "source_dataset": SOURCE_DATASET,
        "domain": domain,
        "shortfall": shortfall,
        "is_stub": is_stub,
    }
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    stub_tag = " [STUB]" if is_stub else ""
    shortfall_tag = " *** SHORTFALL ***" if shortfall else ""
    print(f"  {domain}: {len(final_qs)} Qs sealed | sha256:{digest[:16]}...{stub_tag}{shortfall_tag}")

    return {
        "domain": domain,
        "q_count": len(final_qs),
        "sha256": digest,
        "seal_timestamp": seal_ts,
        "shortfall": shortfall,
        "is_stub": is_stub,
        "skipped": False,
    }


def emit_receipt(seal_results: list):
    """Write BP081_MMLU_PRO_PER_DOMAIN_SEALED_RECEIPT.md."""
    now = datetime.now(timezone.utc).isoformat()
    lines = [
        "# BP081 MMLU-Pro Per-Domain Sealed Receipt",
        "",
        f"**Seal timestamp:** {now}",
        f"**Seal method:** {SEAL_METHOD}",
        f"**Source dataset:** {SOURCE_DATASET}",
        f"**Wave:** B",
        "",
        "## Domain Q Bank Summary",
        "",
        "| Domain | Q Count | sha256 (first 32 chars) | Seal Timestamp | Shortfall |",
        "|--------|---------|------------------------|----------------|-----------|",
    ]

    shortfall_domains = []
    for r in seal_results:
        if r.get("skipped"):
            lines.append(f"| {r['domain']} | SKIPPED | — | — | ⚠ SKIPPED |")
            continue
        short_hash = r["sha256"][:32] + "..."
        shortfall_flag = "⚠ YES" if r["shortfall"] else "No"
        stub_tag = " [STUB]" if r.get("is_stub") else ""
        lines.append(
            f"| {r['domain']}{stub_tag} | {r['q_count']} | `{short_hash}` | {r['seal_timestamp']} | {shortfall_flag} |"
        )
        if r["shortfall"]:
            shortfall_domains.append(r["domain"])

    lines += [
        "",
        "## Full sha256 Hashes",
        "",
    ]
    for r in seal_results:
        if r.get("skipped"):
            continue
        lines.append(f"**{r['domain']}:** `sha256:{r['sha256']}`")
    lines.append("")

    if shortfall_domains:
        lines += [
            "## Shortfall Domains",
            "",
            f"The following domains have fewer than {MIN_QS} curated questions:",
            "",
        ]
        for d in shortfall_domains:
            lines.append(f"- `{d}`")
        lines.append("")
        lines.append("> ⚠ Shortfall domains require additional question sourcing before use in production benchmarks.")
        lines.append("")
    else:
        lines += [
            "## Shortfall Domains",
            "",
            f"None — all domains have ≥ {MIN_QS} curated questions. ✓",
            "",
        ]

    lines += [
        "---",
        "*Auto-generated by SEG-B3 seal_mmlu_pro_per_domain.py · BP081 Wave B*",
        "",
    ]

    with open(RECEIPT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"\nReceipt written -> {RECEIPT_PATH}")


def main():
    print("=" * 60)
    print("SEG-B3 · BP081 Wave B · MMLU-Pro seal + sha256 receipts")
    print("=" * 60)

    results = []
    for domain in DOMAINS:
        r = seal_domain(domain)
        results.append(r)

    total_sealed = sum(r["q_count"] for r in results if not r.get("skipped"))
    shortfall_list = [r["domain"] for r in results if r.get("shortfall") and not r.get("skipped")]

    print()
    print("--- Seal Summary ---")
    print(f"Total Qs sealed: {total_sealed}")
    if shortfall_list:
        print(f"SHORTFALL DOMAINS: {shortfall_list}")
    else:
        print("No shortfall domains -- all 14 banks sealed with >= 20 Qs. OK")

    emit_receipt(results)
    print("\n--- SEG-B3 complete ---")


if __name__ == "__main__":
    main()
