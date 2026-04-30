"""
Hot Cross Buns Testing Packet — KN030 / A&A #2304 / #2299 / #2326 / BP003

Publishable participant-export kit bundling the CheckBook Suite:
  - Stenographer Scribe (KN027) — Liner Notes + Brainscan capture
  - Shutterbug Scribe (KN028) — screenshot at context thresholds
  - Accountant Scribe (KN029) — reconciliation → CheckBook ledger

Composes with:
  - #2299 R&D Battery participant-export class (rd_battery/participant_export.py)
  - #2326 Reproducibility Pack lineage

Kit contents:
  hot_cross_buns_kit_<kit_id>/
  ├── README.md                   — instructions for external operators
  ├── requirements.txt            — Python dependencies
  ├── METHODOLOGY.md              — CheckBook process + #2298 pre-reg discipline
  ├── REPRODUCIBILITY_PACK.md     — #2326 lineage + reproducibility standards
  ├── checkbook/
  │   ├── stenographer_scribe.py  — standalone Stenographer
  │   ├── liner_notes_writer.py   — Stone Tablet writer
  │   ├── brainscan_capture.py    — Brainscan utilities
  │   ├── screenshot_engine.py    — screenshot capture
  │   ├── shutterbug_scribe.py    — Shutterbug observer
  │   ├── reconciliation_engine.py — Accountant reconciliation
  │   ├── ledger_writer.py        — CSV/JSONL/Markdown output
  │   ├── accountant_scribe.py    — Accountant orchestration
  │   └── checkbook_orchestrator.py — CheckBook session orchestration
  └── example_receipts/
      └── example_checkbook.md    — sample ledger output

License: Free public package per #2260 Pledge (cooperative-class participants).
Commercial participants: contact info@lianabanyan.com

Toolsmith log: TS-HOT-CROSS-BUNS-TESTING-PACKET-KN030-BP003
"""

from __future__ import annotations

import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_KITS_DIR = _HERE / "participant_kits"
_STITCHPUNKS_DIR = _HERE.parent

_REQUIREMENTS = """\
# Hot Cross Buns CheckBook Suite — Python Requirements
# Compatible with Python 3.10+
# Install: pip install -r requirements.txt

# Core (stdlib only — no external dependencies for basic operation)
# Optional (for real screenshots):
# Pillow>=10.0.0
# mss>=9.0.0

# For running tests:
pytest>=7.0.0
"""

_METHODOLOGY_MD = """\
# CheckBook Methodology — Liana Banyan Corporation
## #2304 CheckBook Self-Instrumentation Discipline

**"Help each other help ourselves"** — Liana Banyan Corporation, EIN 41-2797446

---

## The CheckBook Metaphor

> *"There is a true adage when you want to balance your budget or lose weight, the FIRST step
> is to find out what you are already doing, and record it over time, so that you can find
> patterns, see what is ACTUALLY happening, and then make meaningful change."*
> — Founder, BP003 turn 11, 2026-04-30

CheckBook applies this discipline to AI substrate operator-experience:

| Checkbook Step | CheckBook Equivalent |
|----------------|---------------------|
| Record what you spend | Stenographer captures thinking-stream (Liner Notes) |
| Record every receipt | Shutterbug captures screenshots at context thresholds |
| Balance the book | Accountant reconciles → CheckBook ledger per session |
| Find patterns | Compare predicted_pp vs measured_pp → scenario verdict |
| Make change | Adjust bean class mix, session strategy, substrate choices |

---

## The Three Scribes

### Stenographer Scribe (KN027)
Captures continuous thinking-stream as append-only Liner Notes + named Brainscans.

- **Fires at:** agent-spawn boundary (session open)
- **Records:** session_open / bean_start / liner_note / brainscan / phase_change / bean_end / session_close
- **Stone Tablet:** fsync-append to `stenographer/sessions/<session_id>_liner_notes.jsonl`
- **Brainscan naming:** `Brainscan-<bean_id>-<phase>-<slug>`

### Shutterbug Scribe (KN028)
Screenshots the operator's IDE/UI at every context-budget threshold crossing.

- **Fires at:** every threshold crossing in KN012 Cursor Context-Budget Watcher
- **Integration:** Observer pattern on KN012 `snapshot_receipts.jsonl` (non-breaking)
- **Output:** `~/Pictures/BeanSprouts/<session_id>/screenshot_<threshold>pct_<ts>.png`
- **Fallback:** metadata-stub when no display available (headless/server environments)

### Accountant Scribe (KN029)
Reconciles all three sources into the CheckBook ledger.

- **Sources:** Liner Notes (KN027) + Shutterbug manifest (KN028) + KN012 context snapshots
- **Algorithm:** Match by timestamp and bean_id attribution → per-bean cost observation
- **Output (three formats):**
  - CSV: `accountant/sessions/<session_id>_checkbook.csv`
  - JSONL: `accountant/sessions/<session_id>_checkbook.jsonl`
  - Markdown: `accountant/sessions/<session_id>_checkbook.md`

---

## #2298 Pre-Registration Discipline

The CheckBook produces the per-bean receipts that #2298 pre-registrations reconcile against.

Every battery instance MUST follow #2298:
1. **Lock** pre-registration BEFORE running (hypothesis + predictions + falsification criteria)
2. **Execute** test with declared protocol
3. **Reconcile** actual measurements against locked prediction
4. **Submit** both Part 1 (pre-reg) + Part 2 (reconciliation) as signed pair

---

## Scenario Verdicts

| Verdict | Meaning |
|---------|---------|
| **A** | Confirmed — all beans landed, mean_pp within prediction |
| **B** | Partial — some deviation from prediction |
| **C** | Falsified — deferral OR per-bean >25pp OR aggregate >100pp |

---

## License

Hot Cross Buns Testing Packet is a free public package under the Liana Banyan
Cooperative Defensive Patent Pledge (#2260). Cooperative-class participants
may use, adapt, and redistribute for their own substrate instrumentation.
Commercial participants: contact info@lianabanyan.com.

**Patent notice:** CheckBook Suite is covered by Prov 16 Candidate #2304,
ratified BP003 turn 12, 2026-04-30. Liana Banyan Corporation, EIN 41-2797446.
"""

_REPRODUCIBILITY_PACK_MD = """\
# Reproducibility Pack — CheckBook Suite
## #2326 Lineage | Liana Banyan Corporation

---

## Purpose

This pack enables external operators to reproduce Liana Banyan's published
CheckBook receipts using their own substrate. Provenance of every artifact
is cryptographically verifiable via Chronos signing (SHA-256 of canonical JSON body).

---

## What Makes a Receipt Reproducible

A CheckBook receipt is reproducible iff:

1. **Pre-registration locked** — `content_hash_lock` field present and verifiable
2. **Per-bean measurements captured** — context_pct_before + context_pct_after for every bean
3. **Liner Notes JSONL available** — complete bean_start/bean_end sequence
4. **Scenario verdict** — explicit A/B/C per reconciliation methodology
5. **Chronos signature** — `sha256(json.dumps(receipt_body_without_sig, sort_keys=True))`

---

## Running CheckBook on Your Substrate

### Prerequisites
- Python 3.10+
- Cursor IDE (or equivalent) with context% visibility
- KN012 Cursor Context-Budget Watcher running (optional, enhances Shutterbug)

### Quick Start

```python
from checkbook.checkbook_orchestrator import CheckBookSession

# Create session
session = CheckBookSession(
    session_id="YOUR-SESSION-ID",
    pod_id="YOUR-POD-ID",
    bean_sequence=["BEAN1", "BEAN2", "BEAN3"],
)
session.arm()

# Before each bean:
session.start_bean("BEAN1", context_pct=5.0, bean_class="medium", predicted_pp=12.0)

# Record thinking:
session.scribe.record_liner_note("My reasoning here...")
session.scribe.record_brainscan("key-decision", "Full reasoning block...")

# After each bean:
session.end_bean("BEAN1", context_pct=17.3, outcome="landed", files_changed=5)

# At session close:
receipt = session.close(context_pct_final=17.3)
```

---

## Verification

To verify a CheckBook receipt's Chronos signature:

```python
import hashlib, json

def verify_receipt(receipt: dict) -> bool:
    sig_field = receipt.pop("chronos_signature", None)
    if not sig_field:
        return False
    body_hash = hashlib.sha256(
        json.dumps(receipt, sort_keys=True, ensure_ascii=False).encode()
    ).hexdigest()
    return body_hash == sig_field.get("chronicler_hash")
```

---

## Submitting Receipts to Chandelier

Submit signed CheckBook receipts to the Liana Banyan Chandelier registry
(info@lianabanyan.com) for inclusion in the published Federation dataset.

Anonymous submission available — participant_id may be a random UUID.

---

*Liana Banyan Corporation — EIN 41-2797446 — Wyoming C-Corp*
*"Help each other help ourselves"*
"""

_EXAMPLE_CHECKBOOK_MD = """\
# Example CheckBook Ledger — EXAMPLE-SESSION-001
_Generated: 2026-04-30T12:00:00Z_

## Per-Bean Table

| bean_id | pod_id | session_id | bean_class | session_position_class | predicted_pp | context_pct_before | context_pct_after | measured_pp | residual_pp | liner_notes_count | brainscans_count | screenshots_count | files_changed | insertions | tests_passed | tests_total | outcome | wall_time_start | wall_time_end | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BEAN1 | Pod-EXAMPLE | EXAMPLE-001 | medium | pod_first | 12.00pp | 5.0% | 17.3% | 12.30pp | +0.30pp | 3 | 1 | 2 | 5 | 80 | 10 | 10 | landed | 2026-04-30T12:00:10Z | 2026-04-30T12:05:30Z | — |
| BEAN2 | Pod-EXAMPLE | EXAMPLE-001 | medium | pod_middle | 12.00pp | 17.3% | 28.9% | 11.60pp | -0.40pp | 2 | 1 | 1 | 4 | 65 | 8 | 8 | landed | 2026-04-30T12:05:35Z | 2026-04-30T12:11:00Z | — |
| BEAN3 | Pod-EXAMPLE | EXAMPLE-001 | small-medium | pod_last | 9.00pp | 28.9% | 37.8% | 8.90pp | -0.10pp | 2 | 0 | 1 | 3 | 40 | 5 | 5 | landed | 2026-04-30T12:11:05Z | 2026-04-30T12:15:20Z | — |

## Pod Summary

| Metric | Value |
|--------|-------|
| total_beans | 3 |
| beans_landed | 3 |
| total_measured_pp | 32.80pp |
| total_predicted_pp | 33.00pp |
| mean_pp_per_bean | 10.93pp |
| total_liner_notes | 7 |
| total_brainscans | 2 |
| total_screenshots | 4 |

**Scenario verdict: A**

| Scenario | Meaning |
|----------|---------|
| A | Confirmed — all beans landed, within prediction |
| B | Partial — some deviation from prediction |
| C | Falsified — deferral or significant over-prediction |
"""


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _copy_scribe_file(src_path: Path, dest_dir: Path) -> bool:
    """Copy a scribe source file to the kit's checkbook/ directory. Returns True on success."""
    if not src_path.exists():
        return False
    try:
        shutil.copy2(str(src_path), str(dest_dir / src_path.name))
        return True
    except Exception:
        return False


def bundle_kit(
    kit_id: str,
    session_id: Optional[str] = None,
    include_example_receipt: bool = True,
    output_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Build a Hot Cross Buns participant kit.

    Args:
        kit_id: Unique identifier for this kit (e.g. "HCB-2026-04-30-001").
        session_id: If provided, include actual CheckBook ledger for this session.
        include_example_receipt: Include example_receipts/example_checkbook.md.
        output_dir: Override kit output directory (default: participant_kits/<kit_id>/).

    Returns:
        Dict with kit_dir, files_written, kit_id, generated_at.
    """
    kit_dir = (output_dir or _KITS_DIR) / kit_id
    checkbook_dir = kit_dir / "checkbook"
    examples_dir = kit_dir / "example_receipts"
    checkbook_dir.mkdir(parents=True, exist_ok=True)
    examples_dir.mkdir(parents=True, exist_ok=True)

    files_written: List[str] = []

    # 1. README
    readme = _build_readme(kit_id)
    (kit_dir / "README.md").write_text(readme, encoding="utf-8")
    files_written.append("README.md")

    # 2. requirements.txt
    (kit_dir / "requirements.txt").write_text(_REQUIREMENTS, encoding="utf-8")
    files_written.append("requirements.txt")

    # 3. METHODOLOGY.md
    (kit_dir / "METHODOLOGY.md").write_text(_METHODOLOGY_MD, encoding="utf-8")
    files_written.append("METHODOLOGY.md")

    # 4. REPRODUCIBILITY_PACK.md
    (kit_dir / "REPRODUCIBILITY_PACK.md").write_text(_REPRODUCIBILITY_PACK_MD, encoding="utf-8")
    files_written.append("REPRODUCIBILITY_PACK.md")

    # 5. Scribe source files (checkbook/)
    source_files = [
        _STITCHPUNKS_DIR / "stenographer" / "stenographer_scribe.py",
        _STITCHPUNKS_DIR / "stenographer" / "liner_notes_writer.py",
        _STITCHPUNKS_DIR / "stenographer" / "brainscan_capture.py",
        _STITCHPUNKS_DIR / "shutterbug" / "screenshot_engine.py",
        _STITCHPUNKS_DIR / "shutterbug" / "shutterbug_scribe.py",
        _STITCHPUNKS_DIR / "accountant" / "reconciliation_engine.py",
        _STITCHPUNKS_DIR / "accountant" / "ledger_writer.py",
        _STITCHPUNKS_DIR / "accountant" / "accountant_scribe.py",
    ]
    # checkbook_orchestrator.py added from KN031 if available
    orchestrator_path = _STITCHPUNKS_DIR / "checkbook" / "checkbook_orchestrator.py"
    if orchestrator_path.exists():
        source_files.append(orchestrator_path)

    for src in source_files:
        if _copy_scribe_file(src, checkbook_dir):
            files_written.append(f"checkbook/{src.name}")

    # Write __init__.py for the checkbook package
    init_content = '"""Hot Cross Buns CheckBook Suite — standalone package."""\n'
    (checkbook_dir / "__init__.py").write_text(init_content, encoding="utf-8")
    files_written.append("checkbook/__init__.py")

    # 6. Example receipt
    if include_example_receipt:
        (examples_dir / "example_checkbook.md").write_text(_EXAMPLE_CHECKBOOK_MD, encoding="utf-8")
        files_written.append("example_receipts/example_checkbook.md")

    # 7. Actual session ledger (if session_id provided)
    if session_id:
        try:
            from accountant.ledger_writer import load_ledger_jsonl, _get_session_stem
            md_path = _get_session_stem(session_id).with_suffix(".md")
            if md_path.exists():
                dest = examples_dir / f"{session_id}_checkbook.md"
                shutil.copy2(str(md_path), str(dest))
                files_written.append(f"example_receipts/{dest.name}")
        except Exception:
            pass

    # 8. Kit manifest
    manifest = {
        "kit_id": kit_id,
        "kit_type": "hot_cross_buns_checkbook_suite",
        "generated_at": _iso_now(),
        "session_id": session_id,
        "composition": ["KN027-Stenographer", "KN028-Shutterbug", "KN029-Accountant"],
        "lineage": ["#2299-R&D-Battery", "#2304-CheckBook", "#2326-Reproducibility-Pack"],
        "license": "Cooperative-class free (#2260 Pledge). Commercial: info@lianabanyan.com",
        "files": files_written,
        "vendor": "Liana Banyan Corporation",
        "ein": "41-2797446",
    }
    manifest_path = kit_dir / "kit_manifest.json"
    with manifest_path.open("w", encoding="utf-8") as fh:
        json.dump(manifest, fh, indent=2, ensure_ascii=False)
    files_written.append("kit_manifest.json")

    print(
        f"[HotCrossBuns] Kit bundled: kit_id={kit_id} "
        f"dir={kit_dir} files={len(files_written)}",
        flush=True,
    )

    return {
        "kit_id": kit_id,
        "kit_dir": str(kit_dir),
        "files_written": files_written,
        "generated_at": manifest["generated_at"],
        "manifest": manifest,
    }


def _build_readme(kit_id: str) -> str:
    return f"""\
# Hot Cross Buns CheckBook Suite
**Kit ID:** {kit_id}
**Generated:** {_iso_now()}
**License:** Free public package — Liana Banyan Corporation, EIN 41-2797446

> *"You Learned Hot Cross Buns For A Reason. Pick Up Your Recorder."*
> — Wisdom Guide W-021, Liana Banyan

---

## What Is This?

The CheckBook Suite is an operator-experience self-instrumentation discipline for AI
agent sessions. It answers the question: *"What am I actually doing, and how much does
it cost?"* — in the same way that balancing a checkbook answers *"What am I actually
spending?"*

## The Three Scribes

| Scribe | What it captures | Output |
|--------|-----------------|--------|
| **Stenographer** | Thinking-stream / Liner Notes / Brainscans | JSONL per session |
| **Shutterbug** | Screenshots at context-budget thresholds | PNG per threshold crossing |
| **Accountant** | Reconciliation → CheckBook ledger | CSV + JSONL + Markdown |

## Quick Start

```bash
# Install optional screenshot dependency (for real PNGs):
pip install Pillow mss

# In your agent session:
python -c "
from checkbook.checkbook_orchestrator import CheckBookSession

session = CheckBookSession('MY-SESSION-001', 'My-Pod', ['BEAN1', 'BEAN2'])
session.arm()
session.start_bean('BEAN1', context_pct=5.0, bean_class='medium', predicted_pp=12.0)
session.scribe.record_liner_note('Working on Bean 1...')
session.end_bean('BEAN1', context_pct=17.3, outcome='landed')
receipt = session.close(context_pct_final=17.3)
print(receipt['checkbook_receipt']['pod_summary'])
"
```

## Files

| File | Purpose |
|------|---------|
| `checkbook/stenographer_scribe.py` | Stenographer Scribe — Liner Notes + Brainscans |
| `checkbook/liner_notes_writer.py` | Stone Tablet JSONL writer |
| `checkbook/brainscan_capture.py` | Brainscan naming + significance |
| `checkbook/screenshot_engine.py` | Screenshot capture engine |
| `checkbook/shutterbug_scribe.py` | Shutterbug observer |
| `checkbook/reconciliation_engine.py` | Accountant reconciliation |
| `checkbook/ledger_writer.py` | CSV/JSONL/Markdown ledger output |
| `checkbook/accountant_scribe.py` | Accountant orchestration |
| `checkbook/checkbook_orchestrator.py` | Session orchestration (if included) |
| `METHODOLOGY.md` | CheckBook process + #2298 pre-reg discipline |
| `REPRODUCIBILITY_PACK.md` | #2326 reproducibility standards |
| `example_receipts/` | Example CheckBook ledgers |

## License

Free public package under the Liana Banyan Cooperative Defensive Patent Pledge (#2260).
Cooperative-class participants may use, adapt, and redistribute freely.
Commercial participants: contact info@lianabanyan.com.

**Patent notice:** CheckBook Suite is covered by Prov 16 Candidate #2304 (Liana Banyan
Corporation, EIN 41-2797446). The implementation is freely available under #2260 Pledge.

---

*Liana Banyan Corporation | Wyoming C-Corp | EIN 41-2797446*
*"Help each other help ourselves"*
"""


def list_kits() -> List[str]:
    """List all available participant kit IDs."""
    if not _KITS_DIR.exists():
        return []
    return [d.name for d in sorted(_KITS_DIR.iterdir()) if d.is_dir()]
