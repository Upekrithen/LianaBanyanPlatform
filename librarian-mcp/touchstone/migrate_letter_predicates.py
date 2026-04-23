"""
K442 (B117) — Letter Predicate Ladder Migration
================================================
Walks the TouchStone manifest and proposes / applies the 3-state ladder
refactor for every Founder-owned letter deliverable.

Usage:
    python migrate_letter_predicates.py --dry-run      # default — no writes
    python migrate_letter_predicates.py --apply        # write changes
    python migrate_letter_predicates.py --report PATH  # write report markdown to PATH

What changes per deliverable (when title matches "Crown letter to *" / "Wave *
letter to *" / "Outreach letter to *" and owner == "founder"):

  + adds  letter_recipient   (extracted from the title)
  + adds  predicate_ladder   = ["letter_drafted", "letter_locked",
                               "letter_dispatched", "response_received_within:14d"]
  - empties  verification    (the legacy single-predicate path)

Special cases (always proposed, even on dry-run):
  - crown-letter-bill-gates         -> CREATE with status="blocked",
                                       blocked_reason set per MEMORY (Epstein hold).
  - crown-letter-melinda-french-gates -> standard ladder; ensure it exists
                                       and is NOT conflated with Bill.

The dry-run report lists every proposed change with a per-row diff so
Founder can ratify before --apply.
"""

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

TOUCHSTONE_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = TOUCHSTONE_DIR / "manifest.json"
REPO_ROOT = TOUCHSTONE_DIR.parents[1]

DEFAULT_LADDER = [
    "letter_drafted",
    "letter_locked",
    "letter_dispatched",
    "response_received_within:14d",
]

LETTER_TITLE_RE = re.compile(
    r"^(?:crown\s+letter|wave\s+\d+\s+letter|outreach\s+letter|letter)\s+to\s+(.+?)\s*$",
    re.IGNORECASE,
)

BILL_GATES_BLOCKED_REASON = (
    "Indefinite hold per MEMORY: Epstein-associations preclude outreach "
    "until further Founder direction. Do NOT auto-dispatch."
)


def extract_recipient(title: str) -> str | None:
    m = LETTER_TITLE_RE.match(title.strip())
    if m:
        return m.group(1).strip().rstrip(".")
    return None


def is_founder_letter(d: dict) -> bool:
    return d.get("owner") == "founder" and bool(extract_recipient(d.get("title", "")))


def propose_change(d: dict) -> dict | None:
    """Return a change-record dict for this deliverable, or None if no change needed."""
    if not is_founder_letter(d):
        return None

    recipient = extract_recipient(d["title"])
    current_recipient = d.get("letter_recipient")
    current_ladder = d.get("predicate_ladder")
    current_verification = d.get("verification", [])

    # Trivially-already-migrated check
    if (
        current_ladder == DEFAULT_LADDER
        and current_recipient == recipient
        and current_verification == []
    ):
        return None

    return {
        "id": d["id"],
        "title": d["title"],
        "before": {
            "letter_recipient": current_recipient,
            "predicate_ladder": current_ladder,
            "verification": current_verification,
        },
        "after": {
            "letter_recipient": recipient,
            "predicate_ladder": list(DEFAULT_LADDER),
            "verification": [],
        },
        "kind": "modify",
    }


def bill_gates_change_or_none(manifest: dict) -> dict | None:
    """Propose creation of crown-letter-bill-gates if absent (status=blocked)."""
    for d in manifest["deliverables"]:
        if d["id"] == "crown-letter-bill-gates":
            return None  # already present — leave as is

    now_iso = datetime.now(timezone.utc).isoformat()
    proposed = {
        "id": "crown-letter-bill-gates",
        "title": "Crown letter to Bill Gates",
        "owner": "founder",
        "depends_on": [],
        "letter_recipient": "Bill Gates",
        "predicate_ladder": list(DEFAULT_LADDER),
        "verification": [],
        "status": "blocked",
        "blocked_reason": BILL_GATES_BLOCKED_REASON,
        "completed_at": None,
        "notes": f"K442 migration B117 — created {now_iso}. Distinct from crown-letter-melinda-french-gates.",
    }
    return {
        "id": "crown-letter-bill-gates",
        "title": proposed["title"],
        "before": None,
        "after": proposed,
        "kind": "create",
    }


def collect_changes(manifest: dict) -> list:
    changes = []
    for d in manifest["deliverables"]:
        c = propose_change(d)
        if c:
            changes.append(c)
    bg = bill_gates_change_or_none(manifest)
    if bg:
        changes.append(bg)
    return changes


def apply_changes(manifest: dict, changes: list) -> int:
    """Mutate manifest in place. Return count of mutations."""
    by_id = {d["id"]: d for d in manifest["deliverables"]}
    n = 0
    for c in changes:
        if c["kind"] == "create":
            manifest["deliverables"].append(c["after"])
            n += 1
        elif c["kind"] == "modify":
            d = by_id.get(c["id"])
            if not d:
                continue
            d["letter_recipient"] = c["after"]["letter_recipient"]
            d["predicate_ladder"] = c["after"]["predicate_ladder"]
            d["verification"] = c["after"]["verification"]
            n += 1
    manifest["updated_at"] = datetime.now(timezone.utc).isoformat()
    return n


def render_report(changes: list, manifest_path: Path) -> str:
    lines: list = []
    lines.append("# K442 — Letter Predicate Ladder Migration (Dry-Run Report)")
    lines.append("")
    lines.append(f"**Generated:** {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"**Manifest:** `{manifest_path.relative_to(REPO_ROOT)}`")
    lines.append(f"**Proposed changes:** {len(changes)}")
    lines.append("")
    lines.append("Founder review, then run with `--apply` to commit:")
    lines.append("")
    lines.append("```")
    lines.append("python librarian-mcp/touchstone/migrate_letter_predicates.py --apply")
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")

    creates = [c for c in changes if c["kind"] == "create"]
    modifies = [c for c in changes if c["kind"] == "modify"]

    if creates:
        lines.append(f"## CREATE — {len(creates)} new deliverable(s)")
        lines.append("")
        for c in creates:
            after = c["after"]
            lines.append(f"### `{c['id']}` — {after['title']}")
            lines.append("")
            lines.append("```json")
            lines.append(json.dumps(after, indent=2, ensure_ascii=False))
            lines.append("```")
            lines.append("")

    if modifies:
        lines.append(f"## MODIFY — {len(modifies)} existing deliverable(s)")
        lines.append("")
        lines.append("| Deliverable | Recipient (extracted) | Ladder | Cleared verification |")
        lines.append("|---|---|---|---|")
        for c in modifies:
            ladder = ", ".join(c["after"]["predicate_ladder"])
            had_verif = "yes" if c["before"]["verification"] else "no"
            lines.append(
                f"| `{c['id']}` | {c['after']['letter_recipient']} | {ladder} | {had_verif} |"
            )
        lines.append("")

    if not changes:
        lines.append("_No changes required — all letter deliverables already on the ladder._")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*Generated by `librarian-mcp/touchstone/migrate_letter_predicates.py` for K442 (B117).*")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    parser.add_argument("--dry-run", action="store_true", help="(default) preview changes")
    parser.add_argument("--apply", action="store_true", help="write changes to manifest")
    parser.add_argument("--report", type=str, default=None,
                        help="write the markdown report to this path (relative to repo root)")
    args = parser.parse_args()

    if not args.apply:
        args.dry_run = True

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    changes = collect_changes(manifest)
    report_md = render_report(changes, MANIFEST_PATH)

    if args.report:
        out = REPO_ROOT / args.report
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(report_md, encoding="utf-8")
        print(f"Report written: {out.relative_to(REPO_ROOT)}")

    if args.dry_run and not args.apply:
        print(report_md)
        print(f"DRY-RUN: {len(changes)} change(s) proposed. Re-run with --apply to commit.")
        return 0

    n = apply_changes(manifest, changes)
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"APPLIED: {n} mutation(s) written to {MANIFEST_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
