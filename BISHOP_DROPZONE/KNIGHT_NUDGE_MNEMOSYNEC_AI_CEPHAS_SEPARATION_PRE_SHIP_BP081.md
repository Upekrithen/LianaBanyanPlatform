---
nudge: KNIGHT_NUDGE_MNEMOSYNEC_AI_CEPHAS_SEPARATION_PRE_SHIP_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: Separate mnemosynec.ai (clean product page) from cephas.lianabanyan.com (museum) BEFORE v0.1.60 SHIP. Content-only fix, no .exe rebuild.
priority: P0 — BLOCKS v0.1.60 SHIP
status: ACTIVE — Founder ratified Path B BP081 2026-06-13
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6"
  - "🔒 Secrets canon — env loaded via Process-scope pattern"
  - "Truth-Always (BP080) — mnemosynec.ai must be a clean product surface, not mixed with museum content"
  - "Caithedral spelling enforced"
related:
  - "BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md + BP081_MNEMOSYNEC_AI_HOMEPAGE_AMENDMENT_AMNESIA_CURE_HERO.md — defines the product content"
  - "Knight's prior fix removed the / → /download/ 301 redirect; ALL the right content is there, just mixed with museum"
---

# 🚨 Knight Nudge · mnemosynec.ai / cephas.lianabanyan.com Separation · Pre-SHIP

Knight — Bishop. v0.1.60 SHIP is HELD until mnemosynec.ai is a clean MnemosyneC product page. Founder ratified Path B (clean-now-then-ship).

## The problem

WebFetch on https://mnemosynec.ai (cache-busted) confirms:
- ✅ All BP081 product content present (Amnesia/Cure hero + Six Pillars + How Truth Lives + How It Works + Three Currencies + Get Started)
- ❌ ALSO present: "About Liana Banyan", "Cephas: The Foundation", multiple "I'm Just a Bill" policy items, header logo links to https://cephas.lianabanyan.com/

**Root cause:** mnemosynec.ai serves the same Hugo build as cephas.lianabanyan.com (`Cephas/cephas-hugo/public/`). The Cephas museum content bleeds through to the MnemosyneC product surface.

## The goal

After this nudge:

| Domain | What it shows |
|---|---|
| **https://mnemosynec.ai** | CLEAN product page · Amnesia/Cure hero + Six Pillars + How Truth Lives + How It Works + Three Currencies + Get Started + Footer · header logo links to mnemosynec.ai itself · brand reads MnemosyneC (not generic "Liana Banyan") · NO "I'm Just a Bill" / NO "About Liana Banyan" / NO "Cephas: The Foundation" |
| **https://cephas.lianabanyan.com** | Museum stays as-is · all current content preserved (About + Cephas Foundation + "I'm Just a Bill" + everything currently there) |
| **https://museum.lianabanyan.com** | Whatever it is now · don't touch unless cleanup needed |

## Technical path — your choice

You know the Hugo project structure. Pick the cleanest of these (or any other approach):

### Option 1 · Separate Hugo content tree
- Create `Cephas/mnemosynec-hugo/` with its own `content/`, `layouts/`, `config.toml`
- Build separately for the mnemosynec target
- Firebase config points each domain to its own `public/`

### Option 2 · Hugo build environments (single tree, multiple outputs)
- Use Hugo's `environments` or `outputs` to render product-only content for the mnemosynec target
- `params.mode = "product"` in mnemosynec env excludes museum sections via theme template conditionals
- Single source of truth, dual-target output

### Option 3 · Front-matter exclusions + cascade
- Move museum content into `content/museum/` subdirectory
- mnemosynec build excludes `museum/` via `disableKinds` or `ignoreFiles`
- Cephas build includes everything

### Option 4 · Sub-domain split (if Firebase config supports)
- mnemosynec.ai serves `/` content only (the new product homepage)
- cephas.lianabanyan.com serves `/museum/`-rooted content
- Both share Hugo build, just different rewrite rules

Bishop is agnostic on technical path. Pick whatever's cleanest given the existing Hugo+Firebase structure you discovered earlier tonight when fixing the `/ → /download/` redirect.

## Header/brand fix

Wherever the mnemosynec.ai header logo currently links to `https://cephas.lianabanyan.com/`, change it to link to `https://mnemosynec.ai/`.

Wherever the brand text reads generic "Liana Banyan" on mnemosynec.ai, change to "MnemosyneC" (or "Liana Banyan MnemosyneC" if the parent-org context matters).

The footer can still reference "Liana Banyan Corporation · J. Jones · For the keep." (per BP081 homepage draft §7 Footer).

## Required runtime verify before SHIP

```powershell
# After redeploy, run these and confirm ALL pass:

$mnemo = (Invoke-WebRequest -Uri "https://mnemosynec.ai?cb=postpolish" -UseBasicParsing).Content

# MUST be present on mnemosynec.ai:
($mnemo -match "Your AI has Amnesia") -and `
($mnemo -match "Dr\. MnemosyneC") -and `
($mnemo -match "MnemosyneC remembers") -and `
($mnemo -match "Shadow E-Giant") -and `
($mnemo -match "Caithedral") -and `
($mnemo -match "For the keep") -and `
($mnemo -match "v0\.1\.60")

# MUST NOT be present on mnemosynec.ai:
(-not ($mnemo -match "I'm Just a Bill")) -and `
(-not ($mnemo -match "Cathedral[^a-z]")) -and `   # the wrong spelling
(-not ($mnemo -match "About Liana Banyan")) -and `   # museum content
(-not ($mnemo -match "Cephas: The Foundation"))   # museum content

# Header logo verify (parse the <a> wrapping the logo):
($mnemo -match 'href="https://mnemosynec.ai"' -or $mnemo -match 'href="/"')
# (and NOT href="https://cephas.lianabanyan.com")
```

Plus: WebFetch on `https://cephas.lianabanyan.com` MUST still show museum content intact.

## Yoke-return required

```
mnemosynec.ai/cephas separation · status: GREEN | DRIFT | BLOCKED
- Model used: Sonnet 4.6
- Technical path chosen: <Option 1/2/3/4/other>
- mnemosynec.ai header logo links to: <URL>
- mnemosynec.ai contains "I'm Just a Bill": Y/N (MUST be N)
- mnemosynec.ai contains "About Liana Banyan": Y/N (MUST be N)
- mnemosynec.ai contains "Cephas: The Foundation": Y/N (MUST be N)
- mnemosynec.ai contains BP081 product content (Amnesia, Dr MnemosyneC, MnemosyneC remembers, Shadow E-Giant ≥3, Caithedral ≥1, Cathedral=0, For the keep ≥1): Y/N
- cephas.lianabanyan.com still serving museum content: Y/N
- Hugo build clean: Y/N
- Firebase deploy: success
- Recommend next: SHIP clear | further work needed
```

## Bishop notes

- This is content/build-config work. Zero binary rebuild. Should land in 15-30 min.
- v0.1.60 binary is already staged at `liana-banyan/mnemosyne` releases. The pre-release stays as Pre-release until polish lands + Founder pastes "publish it" → THEN GitHub Latest promotion fires.
- No .exe changes. No version bump on package.json. Just Hugo content/config + Firebase deploy.
- This catch was Founder's empirical eye on the live page. Truth-Always at the user-facing surface. Same discipline that caught the 4-part semver + the ghost-localStorage + the install-not-completed Phantom hotfix. The page renders matters as much as the binary works.

— Bishop · BP081 · 2026-06-13
