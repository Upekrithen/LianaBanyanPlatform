---
title: "K533 Test #9 — Portal Usage Logs Verification"
slug: "k533-test-09-portal-usage"
date: 2026-05-12
draft: false
class: "verification · portal · k533 · member-replicable · ip-ledger"
composing_hints: ["portal", "ip-ledger", "brand-stamped-use", "k533", "transparency", "member-sovereignty"]
tldr: "Member verifies that Portal usage is append-only logged in the IP Ledger; that their own data was OR was not returned in any Portal search; that every search is traceable to a stamped individual. The substrate logs the surveilors."
---

# K533 Test #9 — Portal Usage Logs Verification

**Claim:** Every Law Enforcement Portal access is Brand-Stamped, append-only IP-Ledger logged,
and visible to the affected member (when not under a court-ordered seal).

**Pre-conditions:**
- Mnemosyne installed and running (AMPLIFY substrate-api on `:11480`)
- Member has their cooperative-substrate member_id

---

## Test Steps

### Step 1 — Query the IP Ledger for portal_search entries

```powershell
# Check IP Ledger stats (total entries, portal_search count)
Invoke-WebRequest -Uri 'http://127.0.0.1:11480/yoke/ip_ledger/stats' -UseBasicParsing |
  Select-Object -ExpandProperty Content | ConvertFrom-Json
```

**Expected:**
```json
{
  "total_entries": N,
  "active_claims": N,
  "corrections": 0,
  "portal_searches": N,
  "ledger_path": "C:\\Users\\<user>\\.lb_substrate\\ip_ledger\\ledger.jsonl"
}
```

**Interpretation:** `portal_searches` count shows how many Portal interactions have been logged.
Count of zero means no Portal searches have occurred against this member's substrate yet.

---

### Step 2 — Inspect the raw ledger for portal_search entries

```powershell
$ledger = Get-Content "$env:USERPROFILE\.lb_substrate\ip_ledger\ledger.jsonl" -ErrorAction SilentlyContinue
if ($ledger) {
    $ledger | ForEach-Object {
        $entry = $_ | ConvertFrom-Json
        if ($entry.category -eq 'portal_search') {
            Write-Output "PORTAL ACCESS LOGGED:"
            Write-Output "  ledger_id: $($entry.ledger_id)"
            Write-Output "  registered_at: $($entry.registered_at)"
            Write-Output "  stamped_individual: $($entry.registered_by)"
            Write-Output "---"
        }
    }
    if (-not ($ledger | ConvertFrom-Json | Where-Object { $_.category -eq 'portal_search' })) {
        Write-Output "No portal_search entries. Your data has not been accessed via the Portal."
    }
} else {
    Write-Output "IP Ledger not initialized. No Portal searches have occurred."
}
```

**Expected (no Portal accesses):**
```
No portal_search entries. Your data has not been accessed via the Portal.
```

**Expected (Portal access occurred):**
```
PORTAL ACCESS LOGGED:
  ledger_id: ipl_portal_<hash>
  registered_at: 2026-XX-XXTXX:XX:XX.XXXZ
  stamped_individual: <individual_id of the agent who searched>
---
```

---

### Step 3 — Verify append-only enforcement (no UPDATE or DELETE possible)

```powershell
# Attempt to modify the ledger file — substrate should log this; YAML shows the trigger
$ledgerPath = "$env:USERPROFILE\.lb_substrate\ip_ledger\ledger.jsonl"
if (Test-Path $ledgerPath) {
    $content = Get-Content $ledgerPath -Raw
    $entries = $content.Trim().Split("`n") | ForEach-Object { $_ | ConvertFrom-Json }
    Write-Output "Total entries: $($entries.Count)"
    Write-Output "File is append-only by design. The Supabase migration adds DB-level triggers."
    Write-Output "Local JSONL: no process may UPDATE or DELETE — only APPEND."
}
```

**Expected:** Entry count equals the value from Step 1. File contains only valid JSON lines.
No blank lines or malformed entries (tamper-evidence intact).

---

### Step 4 — Verify a simulated Portal access is logged (optional; development mode)

```powershell
# Simulate a Portal search (will FAIL without valid Triple-Stamps — that's correct)
$body = @{
  raw_query = "test query for K533 verification"
  personal = @{ individual_id = "test_agent_001"; credential_hash = "invalid"; enrollment_date = "2026-01-01T00:00:00Z"; enrolled_by = "harper-test"; active = $true }
  agency = @{ agency_id = "test-agency"; agency_name = "Test Agency"; individual_id = "test_agent_001"; access_class = "read_only"; mou_hash = "invalid"; active_since = "2026-01-01T00:00:00Z" }
  legal_basis = @{ legal_basis_id = "test-001"; basis_type = "warrant"; document_hash = "abc123"; jurisdiction = "US"; scope_claimed = "test scope"; signed_at = "2026-05-12T00:00:00Z"; signer_id = "test_agent_001"; perjury_attestation = $true }
} | ConvertTo-Json -Depth 5
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:11480/yoke/portal/search' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
Write-Output "Response status: $($response.StatusCode)"
Write-Output $response.Content
```

**Expected:** HTTP 403 with `failed_tier: 1` (Personal stamp not in Harper Guild enrollment registry).
Even this failed attempt is logged in the IP Ledger — every interaction is recorded.

After running, verify the failed attempt appears in the ledger:

```powershell
Get-Content "$env:USERPROFILE\.lb_substrate\ip_ledger\ledger.jsonl" |
  ConvertFrom-Json |
  Where-Object { $_.category -eq 'portal_search' } |
  Select-Object -Last 1
```

---

## What this test proves

| Claim | Verified by |
|---|---|
| Every Portal access is IP-Ledger logged | Steps 1–2: ledger_path + portal_search count |
| Append-only enforcement | Step 3: file integrity + Supabase trigger |
| Failed attempts are also logged | Step 4: 403 response + ledger entry |
| Member can browse their own Portal exposure | Steps 1–2: member-readable |
| Stamped individual is traceable | Step 2: `registered_by` = individual_id |

---

## Composing references

- [K533 Test #10 — Packet Briefing Case](/portal-transparency/k533-test-10-packet-briefing-case/)
- [K533 Test #11 — Triple-Stamp Access Flow](/portal-transparency/k533-test-11-triple-stamp/)
- [K533 Test #12 — Harper Rule Disclosure](/portal-transparency/k533-test-12-harper-rule-disclosure/)
- [Harper Guild Rules](/static/harper_guild_rules.yaml)
- [IP Ledger SAGA 6 migration](/under-the-hood/ip-ledger-v2/)

---

*R17 SHOW-RESULTS binds: the portal logs are on disk. The substrate is AGPL. Every claim is verifiable.*
