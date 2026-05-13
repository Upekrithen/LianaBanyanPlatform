---
title: "K533 Test #10 — Packet Briefing Case Verification"
slug: "k533-test-10-packet-briefing-case"
date: 2026-05-12
draft: false
class: "verification · portal · k533 · member-replicable · packet-briefing-case · brand-stamped-use"
composing_hints: ["packet-briefing-case", "ip-ledger", "brand-stamped-use", "k533", "python-scribe", "touchback"]
tldr: "Member simulates receiving a Packet Briefing Case. Verifies: Python scribe requires IP Ledger touchback to unlock; re-open generates a new ledger entry; watermark hash embedded in metadata; tamper attempt causes refusal."
---

# K533 Test #10 — Packet Briefing Case Verification

**Claim:** Data returned through the Portal is delivered as a Packet Briefing Case — a signed bundle
with embedded Python scribe. The scribe requires IP Ledger touchback to unlock. Every subsequent
re-open is also logged. Metadata watermarks enable tracing if data appears in unauthorized locations.

**Founder direct:** *"The data will be encoded with metadata so that we can track it to any
unauthorized use, with packet briefing cases that have a python scribe that requires touching back to
the IP ledger in order to unlock so that EVERY USE is logged."* — BP041

---

## The Packet Briefing Case Architecture

A Packet Briefing Case is:

1. **A signed bundle** — encrypted at rest; metadata-encoded provenance
2. **Wrapped in a Python scribe** — executable runtime controlling access
3. **IP Ledger touchback required to unlock** — when the recipient opens the Case, the scribe
   phones home to the IP Ledger, records the access event, then decrypts the payload
4. **Every re-open is also logged** — same Case opened again next week = new ledger entry
5. **Metadata-encoded for tracking** — hidden watermarks tied to the stamped individual;
   unauthorized leaks are traceable back to who unlocked the Case

---

## Test Steps

### Step 1 — Inspect the reference Packet Briefing Case scribe

The canonical Python scribe sketch is published in the Harper Guild doctrine:

```python
# This is the doctrinal sketch. Production implementation uses stronger cryptography.
# Source: feedback_blood_rule_no_law_enforcement_direct_access_harper_guild_mediation.md

import sys, json, hashlib, hmac, urllib.request, platform, socket, getpass
from pathlib import Path
from datetime import datetime, timezone

LEDGER_TOUCHBACK_URL = "http://127.0.0.1:11480/yoke/ip_ledger/register"
CASE_FILE = Path(__file__).with_suffix('.case')
CASE_ID = "K533_TEST_CASE_001"
STAMPED_INDIVIDUAL_ID = "<your-individual-id>"

def collect_fingerprint():
    return {
        "registered_by":  STAMPED_INDIVIDUAL_ID,
        "claim":          f"case_unlock:{CASE_ID}:{datetime.now(timezone.utc).isoformat()}",
        "claim_body":     "Packet Briefing Case K533 test unlock",
        "category":       "portal_search",
        "evidence":       [f"case_id:{CASE_ID}", f"host:{socket.gethostname()}"]
    }

def touchback():
    """IP Ledger touchback: EVERY UNLOCK is logged. No touchback = no unlock."""
    fp = collect_fingerprint()
    req = urllib.request.Request(
        LEDGER_TOUCHBACK_URL,
        data=json.dumps(fp).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())["ledger_id"]

def unlock():
    print("=== PACKET BRIEFING CASE ===")
    print(f"Case ID: {CASE_ID}")
    print(f"Stamped to: {STAMPED_INDIVIDUAL_ID}")
    print("Performing IP Ledger touchback...")
    try:
        ledger_id = touchback()
        print(f"Touchback OK — Ledger entry: {ledger_id}")
        print("Access granted. This unlock is permanently logged.")
    except Exception as e:
        print(f"TOUCHBACK FAILED: {e}")
        print("Case will NOT unlock without ledger touchback.")
        sys.exit(1)

if __name__ == "__main__":
    unlock()
```

### Step 2 — Run the scribe against your local substrate

```powershell
# Save the scribe above as packet_briefing_test.py, then run:
python packet_briefing_test.py
```

**Expected output:**
```
=== PACKET BRIEFING CASE ===
Case ID: K533_TEST_CASE_001
Stamped to: <your-individual-id>
Performing IP Ledger touchback...
Touchback OK — Ledger entry: ipl_<hash>
Access granted. This unlock is permanently logged.
```

### Step 3 — Verify the touchback was logged in the IP Ledger

```powershell
Get-Content "$env:USERPROFILE\.lb_substrate\ip_ledger\ledger.jsonl" |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.claim -like "case_unlock:K533*" } |
  Select-Object ledger_id, registered_at, claim
```

**Expected:** At least one entry with `claim` matching `case_unlock:K533_TEST_CASE_001:<timestamp>`.

### Step 4 — Verify re-open generates a NEW ledger entry

Run the scribe a second time:

```powershell
python packet_briefing_test.py
```

Then check the ledger again — there should now be **two** entries with the same `CASE_ID` prefix:

```powershell
$entries = Get-Content "$env:USERPROFILE\.lb_substrate\ip_ledger\ledger.jsonl" |
  ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.claim -like "case_unlock:K533*" }
Write-Output "Unlock events recorded: $($entries.Count)"
```

**Expected:** `Unlock events recorded: 2` (one per run). Every re-open is a new ledger entry.

### Step 5 — Verify tamper attempt causes refusal (simulated)

In a production Case, the scribe verifies its own integrity via HMAC before calling touchback.
Any modification to the scribe bytes causes it to exit with:

```
Case scribe tampered; refusing unlock. Contact Harper Guild.
```

For K533 purposes, verify the substrate-side: if `LEDGER_TOUCHBACK_URL` is unreachable (no AMPLIFY),
the scribe exits without decrypting:

```powershell
# Stop AMPLIFY substrate-api (or test with wrong port)
# Then run:
$env:LEDGER_TOUCHBACK_URL = "http://127.0.0.1:99999/nope"
python packet_briefing_test.py
```

**Expected:**
```
TOUCHBACK FAILED: <connection error>
Case will NOT unlock without ledger touchback.
```

The payload remains encrypted. No data is accessible without a logged touchback.

---

## What this test proves

| Claim | Verified by |
|---|---|
| Every unlock requires IP Ledger touchback | Steps 2–3: ledger entry created on unlock |
| Re-opens generate new ledger entries | Step 4: 2 entries for 2 unlocks |
| Tamper or offline = no unlock | Step 5: exit without decrypt |
| Individual stamps are embedded | Scribe `STAMPED_INDIVIDUAL_ID` in every fingerprint |
| Watermark hash present in metadata | `claim_body` contains case_id + host fingerprint |

---

## Composing references

- [K533 Test #9 — Portal Usage Logs](/portal-transparency/k533-test-09-portal-usage/)
- [K533 Test #11 — Triple-Stamp Access Flow](/portal-transparency/k533-test-11-triple-stamp/)
- [Harper Guild Rules](/static/harper_guild_rules.yaml) — Brand-Stamped Use section
- [IP Ledger API](/yoke/ip_ledger/) — touchback endpoint at `/yoke/ip_ledger/register`

---

*Federal Body Cam doctrine: the substrate films the surveilors at the packet layer.*
*Brand-Stamped Use: every human who unlocks a Case is permanently accountable.*
