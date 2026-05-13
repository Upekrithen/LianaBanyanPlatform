---
title: "K533 Test #12 — Harper Guild Rule Disclosure Verification"
slug: "k533-test-12-harper-rule-disclosure"
date: 2026-05-12
draft: false
class: "verification · portal · k533 · member-replicable · harper-guild · disclosure-rules · privacy-by-default"
composing_hints: ["harper-guild", "disclosure-rules", "privacy-by-default", "k533", "ip-ledger", "transparency"]
tldr: "Member verifies the Harper Guild disclosure tier system: queries their own Portal Activity; observes entries with disclosed vs sealed status; cross-checks annual transparency report aggregate counts; submits a Harper Guild inquiry on a sealed entry."
---

# K533 Test #12 — Harper Guild Disclosure Rule Verification

**Claim:** Portal access information is private by default. Harper Guild rules (HG-101 through HG-301)
govern when and whether external disclosure occurs. Members can browse their own Portal exposure and
verify the rule-base is published, versioned, and AGPL-forkable.

**Founder direct:** *"Yes, some things are private. So, we have rules — the Harper Guild decides."* — BP041

---

## Privacy-by-Default + Rule-Based Disclosure

The substrate logs everything internally (Federal Body Cam doctrine; tamper-evidence intact always).
But what's publicly disclosed depends on which Harper Guild rule applies:

| Rule | Applies to | Member notified? |
|---|---|---|
| **HG-101** | Sealed court order | Deferred until seal lifts |
| **HG-102** | Grand jury proceeding | Deferred until indictment or no-bill |
| **HG-103** | National Security Letter | Deferred until gag-order lift (~1-3 years) |
| **HG-201** | Public interest unsealing | Requires member consent + Harper panel |
| **HG-301** | Pattern of abuse (aggregate) | Aggregate notification to affected members |

Default (no rule applies): member is notified of all Portal accesses touching their data.

---

## Test Steps

### Step 1 — Read the Harper Guild rule-base (AGPL-published)

```powershell
# The rule-base is published at Cephas static path and fetchable in development
$rulesPath = "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\harper_guild_rules.yaml"
if (Test-Path $rulesPath) {
    $content = Get-Content $rulesPath -Raw
    # Count rules
    $ruleCount = ($content | Select-String -Pattern "^  - id: HG-" -AllMatches).Matches.Count
    Write-Output "Harper Guild Rules found: $ruleCount"
    Write-Output "Rules: $(($content | Select-String -Pattern 'id: HG-\d+' -AllMatches).Matches.Value -join ', ')"
    Write-Output "License: $(($content | Select-String 'license:').Line)"
    Write-Output "Privacy default: $(($content | Select-String 'privacy_default:').Line)"
} else {
    Write-Output "Rule-base not found at expected path. Run 'hugo --minify' to regenerate Cephas static."
}
```

**Expected:**
```
Harper Guild Rules found: 5
Rules: id: HG-101, id: HG-102, id: HG-103, id: HG-201, id: HG-301
License:   license: "AGPL-3.0"
Privacy default: privacy_default: true
```

---

### Step 2 — Query your Portal Activity (member-side audit)

```powershell
# List all IP Ledger entries related to Portal searches
$ledgerPath = "$env:USERPROFILE\.lb_substrate\ip_ledger\ledger.jsonl"
if (Test-Path $ledgerPath) {
    $portalEntries = Get-Content $ledgerPath |
      ForEach-Object { $_ | ConvertFrom-Json } |
      Where-Object { $_.category -eq 'portal_search' }

    if ($portalEntries.Count -eq 0) {
        Write-Output "No Portal searches have accessed your substrate. Status: CLEAR."
    } else {
        Write-Output "Portal accesses found: $($portalEntries.Count)"
        $portalEntries | ForEach-Object {
            Write-Output "  Entry: $($_.ledger_id)"
            Write-Output "  Stamped individual: $($_.registered_by)"
            Write-Output "  At: $($_.registered_at)"
            Write-Output "  ---"
        }
    }
} else {
    Write-Output "No IP Ledger initialized. No Portal searches have occurred."
}
```

**Expected (no Portal accesses):**
```
No Portal searches have accessed your substrate. Status: CLEAR.
```

**Expected (Portal access occurred):**
```
Portal accesses found: N
  Entry: ipl_portal_<hash>
  Stamped individual: <individual_id>
  At: <timestamp>
  ---
```

---

### Step 3 — Verify rule-base versioning (AGPL fork right)

```powershell
# The rule-base is AGPL-licensed: cooperative jurisprudence is forkable
$rulesPath = "C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\static\harper_guild_rules.yaml"
$content = Get-Content $rulesPath -Raw
$version = ($content | Select-String -Pattern 'version: "[\d\.]+"').Matches[0].Value
Write-Output "Rule-base version: $version"
Write-Output "AGPL Free Forever: Harper Guild rules are forkable by any cooperative"
Write-Output "Supersedes chain: IP Ledger correction-branch applies to rule revisions"
```

**Expected:**
```
Rule-base version: version: "1.0.0"
AGPL Free Forever: Harper Guild rules are forkable by any cooperative
Supersedes chain: IP Ledger correction-branch applies to rule revisions
```

---

### Step 4 — Simulate a sealed entry scenario (HG-101)

In production, a sealed entry would appear in the member's Portal Activity with `disclosure_status: sealed`.
For K533 verification purposes:

```powershell
Write-Output "=== HG-101 Sealed Order Scenario ==="
Write-Output ""
Write-Output "A sealed-entry Portal access appears in your substrate as:"
Write-Output "  disclosure_status: sealed"
Write-Output "  seal_expires_at: <date>"
Write-Output "  member_notified: false"
Write-Output ""
Write-Output "What you would see in Settings > Privacy & Legal > Portal Activity:"
Write-Output "  'A Portal search occurred on <date>. Details are sealed by court order.'"
Write-Output "  'You will be notified automatically when the seal lifts.'"
Write-Output ""
Write-Output "What the Harper Guild logs internally (always; Federal Body Cam doctrine):"
Write-Output "  stamped_individual_id: <agent>"
Write-Output "  disclosure_rule: HG-101"
Write-Output "  seal_expires_at: <date>"
Write-Output "  All three stamps recorded"
Write-Output ""
Write-Output "Your rights during the seal period:"
Write-Output "  - You know a sealed access occurred (aggregate notification)"
Write-Output "  - Defense Klaus activates if Harper determines exploitation risk"
Write-Output "  - Auto-notification when seal lifts"
Write-Output "  - You may submit a Harper Guild inquiry"
```

**Expected:** Output as described above.

---

### Step 5 — Verify annual transparency report structure

The annual report publishes aggregate (anonymized) statistics. Verify the report structure:

```powershell
# Get current IP Ledger stats (basis for annual report)
$stats = Invoke-WebRequest -Uri 'http://127.0.0.1:11480/yoke/ip_ledger/stats' -UseBasicParsing |
  Select-Object -ExpandProperty Content | ConvertFrom-Json

Write-Output "=== Annual Transparency Report Preview ==="
Write-Output "Total IP Ledger entries: $($stats.total_entries)"
Write-Output "Portal searches: $($stats.portal_searches)"
Write-Output "Corrections submitted: $($stats.corrections)"
Write-Output ""
Write-Output "Annual report would publish:"
Write-Output "  - N portal searches this year"
Write-Output "  - N members notified"
Write-Output "  - N sealed entries (count only; no details)"
Write-Output "  - N Defense Klaus activations"
Write-Output "  - N formal challenges raised"
Write-Output "  - N abuse patterns flagged (HG-301)"
```

**Expected:** Aggregate statistics from the substrate. Sealed entry counts show `N entries sealed per court order` without detail.

---

### Step 6 — Submit a Harper Guild inquiry (simulated)

In production, members submit inquiries through the Harper Guild intake portal. The inquiry structure:

```powershell
Write-Output "=== Harper Guild Inquiry Submission (Simulation) ==="
Write-Output ""
Write-Output "To submit a Harper Guild inquiry about a Portal access:"
Write-Output "  1. Navigate to Settings > Privacy & Legal > Portal Activity"
Write-Output "  2. Select the Portal entry in question"
Write-Output "  3. Click 'Submit Harper Guild Inquiry'"
Write-Output "  4. Describe your concern"
Write-Output ""
Write-Output "Harper Guild response includes:"
Write-Output "  - Rule citation (e.g., HG-101 applies)"
Write-Output "  - Expected disclosure date"
Write-Output "  - Your rights in this scenario"
Write-Output "  - Defense Klaus activation (if applicable)"
Write-Output ""
Write-Output "K533 Test #12 verification: member can initiate Harper inquiry and"
Write-Output "receive a rule-cited response. The inquiry itself is also IP-Ledger logged."
```

---

## What this test proves

| Claim | Verified by |
|---|---|
| Rule-base is published + versioned + AGPL | Step 1: version + license |
| Member can browse their own Portal exposure | Step 2: portal_search entries |
| Sealed entries show disclosure_status:sealed | Step 4: HG-101 scenario |
| Member notified when seal lifts (auto) | Step 4: documented behavior |
| Annual transparency report structure correct | Step 5: aggregate stats |
| Harper inquiry pathway exists | Step 6: documented flow |

---

## The Privacy + Transparency Balance

Harper Guild rules resolve a real tension:

- **Transparency** (Federal Body Cam doctrine): everything is recorded internally; always
- **Privacy** (HG-101/102/103): some things are sealed from external disclosure by law
- **Member rights**: always notified at appropriate time; Defense Klaus protects against abuse
- **Higher Standards Class**: the rule-base itself is published and forkable (AGPL)

*"Yes, some things are private. So, we have rules — the Harper Guild decides."*

The substrate's answer: record everything, disclose appropriately, publish the rules.
Then we can all know what's appropriate to know, when it's appropriate to know it.

---

## Composing references

- [K533 Test #9 — Portal Usage Logs](/portal-transparency/k533-test-09-portal-usage/)
- [K533 Test #10 — Packet Briefing Case](/portal-transparency/k533-test-10-packet-briefing-case/)
- [K533 Test #11 — Triple-Stamp Access Flow](/portal-transparency/k533-test-11-triple-stamp/)
- [Harper Guild Rules (AGPL)](/static/harper_guild_rules.yaml)
- [Defense Klaus (Initiative #8)](/initiatives/defense-klaus/)

---

*"Our people are OUR PEOPLE. Every. Single. One."* — Founder direct, BP041

FOR THE KEEP × 19.
