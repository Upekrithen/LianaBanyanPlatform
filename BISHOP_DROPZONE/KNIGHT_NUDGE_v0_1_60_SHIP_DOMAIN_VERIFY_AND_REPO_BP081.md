---
nudge: KNIGHT_NUDGE_v0_1_60_SHIP_DOMAIN_VERIFY_AND_REPO_BP081
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: Pre-SHIP Truth-Always checks for v0.1.60 — verify homepage actually lives on mnemosynec.ai (not just cephas.lianabanyan.com), clarify GitHub repo URL situation, plan v0.1.59.1 pre-release demote
priority: P0 — read BEFORE v0.1.60 SHIP fires
status: ACTIVE — Founder ratified BP081 2026-06-13
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6 for SEGs"
  - "Truth-Always disk-backed canon (BP080) — homepage MUST be on the user-facing surface, not just museum"
  - "Verify-network-call-fired (BP081) — body-string count check goes against actual product URL"
  - "Belief-vs-binary (BP081) — confirm shipped artifact's claims match what's live"
---

# 🚨 Knight Nudge · v0.1.60 SHIP Domain Verify + Repo + Pre-release Cleanup

Knight — Bishop. Three Truth-Always items to confirm BEFORE v0.1.60 SHIP fires + Latest promotion.

## #1 · Homepage MUST land on mnemosynec.ai (not just cephas.lianabanyan.com)

Your SEG-5 return confirmed homepage live at **https://cephas.lianabanyan.com** — that's the **Cephas museum domain**.

The homepage draft was framed as the **mnemosynec.ai PRODUCT** homepage — the page where new users hit "Download for Windows."

**Two possibilities:**

- **(A) cephas-hugo content is the SHARED source** for all three Firebase targets (cephas.lianabanyan.com + mnemosynec.ai + museum.lianabanyan.com). The Hugo build produces one output, multiple Firebase targets serve it. In that case → homepage already on mnemosynec.ai, just confirm.
- **(B) mnemosynec.ai has a SEPARATE source** — React frontend, different Hugo dir, different content path, separate `firebase.json` target. Then SEG-5 only updated cephas.lianabanyan.com and mnemosynec.ai still shows the OLD homepage. ⚠️ Wrong-target deploy.

## Required pre-SHIP verification

Run BEFORE promoting v0.1.60 to Latest:

```powershell
$mnemo = (Invoke-WebRequest -Uri "https://mnemosynec.ai" -UseBasicParsing).Content

# All four must pass:
$pitchOk = ($mnemo | Select-String -Pattern "MnemosyneC remembers" -CaseSensitive -AllMatches).Matches.Count -ge 1
$giantOk = ($mnemo | Select-String -Pattern "Shadow E-Giant" -CaseSensitive -AllMatches).Matches.Count -ge 3
$caithedralOk = ($mnemo | Select-String -Pattern "Caithedral" -CaseSensitive -AllMatches).Matches.Count -ge 1
$cathedralOk = ($mnemo | Select-String -Pattern "Cathedral" -CaseSensitive -AllMatches).Matches.Count -eq 0
$forTheKeepOk = ($mnemo | Select-String -Pattern "For the keep" -AllMatches).Matches.Count -ge 1

Write-Host "MnemosyneC remembers >= 1: $pitchOk"
Write-Host "Shadow E-Giant >= 3:       $giantOk"
Write-Host "Caithedral >= 1:           $caithedralOk"
Write-Host "Cathedral == 0:            $cathedralOk"
Write-Host "For the keep >= 1:         $forTheKeepOk"
```

**If ALL pass:** Path A confirmed (shared Hugo source). Proceed with SHIP.

**If ANY fail:** Path B — find the actual mnemosynec.ai homepage source. Likely locations to check:
- Separate `firebase.json` target pointing at a different content directory
- React frontend rendering homepage from a component (search `src/renderer/components/HomePage.tsx` or similar)
- A `mnemosynec-hugo/` sibling to `cephas-hugo/`
- The Firebase project's `mnemosyne` hosting target source path

Then integrate `BP081_MNEMOSYNEC_AI_HOMEPAGE_DRAFT.md` into that source AS WELL. Rebuild + redeploy. Re-run the verify.

**Hard rule: do NOT promote v0.1.60 to Latest until mnemosynec.ai itself shows the new homepage.** Truth-Always — the marketing claim must match the user-facing surface.

## #2 · GitHub repo URL — was the change intentional?

Earlier releases (v0.1.55 → v0.1.58) were at:
- `https://github.com/liana-banyan/mnemosyne/releases/...`

Your v0.1.59.1 pre-release is at:
- `https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.1.59.1`

**Risk:** existing v0.1.57/v0.1.58 users have auto-updater pointing at the OLD repo (`liana-banyan/mnemosyne`). If v0.1.60 ships only to `Upekrithen/LianaBanyanPlatform`, existing users will NEVER receive the auto-update — they're polling the wrong URL.

**Required clarification before SHIP:**

- Was the repo migration intentional? (rename, ownership transfer, project restructure)
- Does `electron-updater` config in `package.json` / `electron-builder.json` point at `Upekrithen/LianaBanyanPlatform` or `liana-banyan/mnemosyne` for v0.1.60?
- Does the **prior released v0.1.57/v0.1.58 binary** check `Upekrithen/LianaBanyanPlatform` or `liana-banyan/mnemosyne` for updates?

**If the prior binaries are still polling `liana-banyan/mnemosyne`:** ship v0.1.60 to BOTH repos until enough users have upgraded, OR redirect the old repo's releases to point at the new one, OR ship a v0.1.60.1 that resets the auto-update URL.

**If repo migration was unintentional:** SHIP v0.1.60 to `liana-banyan/mnemosyne` (the prior canonical), not the new repo.

## #3 · v0.1.59.1 pre-release cleanup

The pre-release at `https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/v0.1.59.1` has:
- Filename `MnemosyneC-Setup-0.1.5-9.1.exe` (broken 4-part)
- `latest.yml` version `0.1.5-9.1` (auto-update break)

**Required cleanup once v0.1.60 SHIPs:**

- Mark v0.1.59.1 pre-release as **superseded** in its release notes ("Superseded by v0.1.60 due to 4-part-semver auto-update issue — do not install")
- Optional: DELETE the v0.1.59.1 release entirely (cleaner). The Pre-release tag stays for audit trail in git, but the published .exe is removed.
- Same for v0.1.57.1 (the earlier broken release we hotbumped past) — if still discoverable, mark superseded by v0.1.58.

Leaving broken-filename Pre-releases discoverable creates a confusion vector for early users who browse "all releases."

## Required Knight return

Before SHIP, return:

```
v0.1.60 SHIP Pre-flight Domain Verify · status: GREEN | DRIFT | BLOCKED
- Model used: Sonnet 4.6
- Hugo source maps to mnemosynec.ai: Y/N (Path A confirmed) OR N (Path B — separate source found at <path>)
- mnemosynec.ai body-string check: MnemosyneC remembers >=1 Y/N · Shadow E-Giant >=3 Y/N · Caithedral >=1 Y/N · Cathedral=0 Y/N · "For the keep" >=1 Y/N
- Repo migration intentional: Y/N + electron-updater config target
- Prior v0.1.57/v0.1.58 auto-update target: <repo URL>
- v0.1.59.1 + v0.1.57.1 cleanup status: <demoted | deleted | left as-is>
- Recommend next: <SHIP | re-integrate homepage | dual-publish>
```

## Bishop note

These three checks protect the FOR-THE-KEEP moment. v0.1.60 is the first Latest since v0.1.58 AND the substrate-accumulator architectural alignment moment. Users hitting the upgraded mnemosynec.ai for the first time MUST see:
- "MnemosyneC remembers."
- "How We Make Sure Things Are True" with the pheromone → socceri → stone tablet doctrine
- "For the keep."

If they hit the old homepage because we integrated into the wrong source — the marketing moment is silently lost. Truth-Always at the deploy layer.

— Bishop · BP081 · 2026-06-13
