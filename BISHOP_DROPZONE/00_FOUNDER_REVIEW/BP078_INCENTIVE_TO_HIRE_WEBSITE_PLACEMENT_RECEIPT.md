# BP078 Incentive to Hire -- Website Placement Receipt

**Status: READY FOR FOUNDER RATIFY**
**Branch:** `bp078-incentive-to-hire-website`
**Commit:** `ec41e01`
**Hugo build:** CLEAN -- 1005 pages, 0 errors, 0 warnings
**Timestamp:** 2026-06-09T00:00:00Z (BP078)

---

## Placement Map

| Surface | Tier | File Path | What Was Added | Snippet Preview |
|---|---|---|---|---|
| **Dedicated page** `/incentive-to-hire/` | **TIER 1 -- MUST** | `content/incentive-to-hire/_index.md` | New 700-word explainer page | "When a large AI company installs MnemosyneC, the license includes an Incentive to Hire..." |
| **Home page** `/_index.md` | **TIER 1 -- MUST** | `content/_index.md` | Blue info block between "Three Ways to Work" and initiative table | "Big AI Company? See the Incentive to Hire." + link |
| **Download page** `/download/` | **TIER 1 -- MUST** | `content/download/_index.md` | New section above closing tagline | "Big AI Company Reading This?" + enterprise hiring block |
| **Patents page** `/patents/` | **TIER 2 -- SHOULD** | `content/patents/_index.md` | New subsection "Incentive to Hire: The Enterprise Carrot" before Key Resources | Composes Upekrithen + Apache 2.0 + hiring covenant |
| **Letters index** `/letters/` | **TIER 2 -- SHOULD** | `content/letters/_index.md` | One-line callout at bottom of page | "If you represent a large AI company: the license for MnemosyneC includes an Incentive to Hire..." |

---

## Tier Ranking

**Tier 1 -- MUST (this deploy):**
- `/incentive-to-hire/` dedicated page (the canonical destination all other pages link to)
- Home page block (highest traffic, first impression)
- Download page block (enterprise evaluators land here)

**Tier 2 -- SHOULD (this deploy -- included in this commit):**
- Patents page subsection (composes naturally with Upekrithen dual-license)
- Letters index callout (AI executives reading Crown letters will see it)

**Tier 3 -- NICE TO HAVE (future deploy, NOT in this commit):**
- Initiatives index: per-initiative note tying each initiative's jobs to the Incentive to Hire pipeline
- Cold-start page: mention as a front door for new members
- Crown letters (individual): a footer note for Big AI recipients
- Cooperative Compact page: mention in the licensing section

**FOUNDER DECISION NEEDED (Tier 3):** Should individual Crown letters (e.g., the AOC letter) each carry a footer note pointing Big AI recipients to the Incentive to Hire? This is a narrative decision -- the letters are personal outreach, adding an enterprise note could feel off-register. Bishop surfaced, Founder decides.

---

## Copy Guardrails Applied

All copy in this commit:
- No em-dashes anywhere in user-facing copy (checked)
- "Doubled as an estimate" preserved verbatim on dedicated page
- Mirror covenant framed as "encourages, does not compel" -- word "requires" never used
- Three currencies: no fiat conversion language present; members get fiat through actual hiring + payment
- "Doubled as an estimate" is not a precise actuarial claim -- stated explicitly on the dedicated page

---

## Landmines / Contradictions Found

**Home page §4 "Designed to be Copied":** mentions SSPL and patent pledge but no Apache/Upekrithen path. The Incentive to Hire block added in §1 (initiatives section) links to the dedicated page where the Upekrithen path is explained. No direct contradiction -- but the §4 text could be expanded in a future pass to explicitly name the enterprise fork path.

**Patents page (_index.md):** the existing content references only the Cooperative Defensive Patent Pledge. The new "Incentive to Hire: The Enterprise Carrot" subsection added here is the first mention of the Upekrithen Apache 2.0 path on this page. No contradiction -- it composes cleanly.

**Download page:** existing FAQ says "Free forever under SSPL." The new enterprise block is additive, not contradictory -- it targets a different reader (enterprise evaluator, not end user). No conflict.

---

## Branch + Commit

```
Branch: bp078-incentive-to-hire-website
Commit: ec41e01
Files changed: 5
Insertions: 140
New file: content/incentive-to-hire/_index.md
Modified: content/_index.md
Modified: content/download/_index.md
Modified: content/patents/_index.md
Modified: content/letters/_index.md
```

Hugo build verified: `hugo --minify` completed in 2584ms, 1005 pages, exit code 0.

---

## Compose With SEG-BX

If SEG-BX has a page-fix deploy staged on a separate branch, this branch can be merged into it (or both can be merged into main) and deployed in a SINGLE Firebase deploy pass. Recommended approach:

1. Founder ratifies both this branch AND the SEG-BX page-fix branch.
2. One of:
   - Merge `bp078-incentive-to-hire-website` into the SEG-BX branch, then deploy once.
   - Or merge both into main, then fire the deploy script below once.

This avoids two sequential Firebase deploys and keeps the deploy log clean.

---

## Deploy Script (fire AFTER Founder ratify)

See: `BP078_INCENTIVE_TO_HIRE_DEPLOY.ps1` (staged alongside this receipt)

---

*Bishop preps maximum. Founder fires the deploy after explicit ratify. HARD BINDING.*
