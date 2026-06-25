# 🔗 KNIGHT QUEUED AMENDMENT — CT Bounty Copy Apply + E5 Hooks Gap Fix

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Queue position:** Drop into ACTIVE Knight session AFTER Stream B (PROV_22) and the F1-F8 base-tier amendment have drained. Do NOT spawn a new Knight session. §2 BLOOD.

**Knight preamble (BP084 HARD BINDING):** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §4 secrets BLOOD.

---

## Scope

Two parallelizable streams. Both are low-priority but worth shipping while Knight is alive.

### Stream G · CT Bounty Wall real-copy apply
**Source files (Bishop pre-staged):** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\CT_BOUNTY_WALL_REAL_COPY_BP086\`

7 card drafts ready to paste into CerosTechnology.com Hugo partials:
- `chapter_12_cities_project.md`
- `chapter_mnemosynec_next_generation.md`
- `chapter_noids_noble_order_of_idea_developers.md`
- `bounty_mac_port.md`
- `bounty_linux_port.md`
- `bounty_youtube_tutorial.md`
- `bounty_public_provisional_1.md` (NOT PROV_23 — Public Provisional #1 per BP086 canon)

**Target repo:** `C:\Users\Administrator\Documents\CerosTechnology\layouts\partials\sections\`

SEGs G1-G3:
- **G1** Recon current placeholder content in `become-boss.html` + `bounties.html` partials; identify exactly which `<div class="bounty-card-back">` blocks need refresh
- **G2** Apply 7 card drafts — front face + back face per draft, preserve card-flip mechanic + tabindex/role/aria-pressed accessibility, NEVER SCROLL SIDEWAYS preserved
- **G3** Hugo build + Firebase deploy `firebase deploy --only hosting:cerostechnology` + live verify all 7 cards flip and render real content

**Sharps:** G1_RECON_DONE · G2_CARDS_APPLIED · G3_LIVE_VERIFIED (forbidden-word scan clean, card-flip still works, mobile responsive)

### Stream H · E5 Hooks gap (firebase deploy health-check)
**Origin:** Knight's BLACK MAMBA E5 verdict — `.cursor/hooks/` directory exists but empty; no firebase deploy health-check hook is firing.

**Goal:** Wire a post-deploy health-check hook that runs after every `firebase deploy --only hosting:*` to confirm the deployed surface returns 200.

SEGs H1-H2:
- **H1** Recon the existing settings.json hook pattern (`PostToolUse Bash if firebase deploy*`) in `~/.claude/settings.json` — confirm what's already there and what's missing
- **H2** Add a PostToolUse hook (matcher: `Bash`, `if: "Bash(firebase deploy*)"`) that runs a simple PowerShell health-check script. Script should:
  - Parse the deploy command for the hosting target name
  - HTTP HEAD the target's canonical URL (cerostechnology.com / mnemosynec.ai / mnemosynec.org / lianabanyan.com depending on target)
  - Emit JSON `{"systemMessage": "✅ Post-deploy health check: 200"}` on success or `{"systemMessage": "🔴 Post-deploy health check: <status>"}` on failure
  - Write script to `C:\Users\Administrator\.claude\hooks\bp086_post_deploy_health_check.ps1`
- Verify hook fires correctly with a dry-run echo test (don't fire a real deploy)

**Sharps:** H1_RECON_DONE · H2_HOOK_LIVE

---

## Composition note

Both streams can fan in parallel — they touch entirely disjoint files. Stream G writes to `CerosTechnology/layouts/`; Stream H writes to `~/.claude/hooks/` + `~/.claude/settings.json`.

Per §15 BLOOD: Knight's main thread does NOT do the file edits. Spawn G1-G3 and H1-H2 as Sonnet 4.6 SEGs.

**Total SEG count for this amendment:** 5 (G1-G3 + H1-H2). Cheap.

---

## Sharps return (Knight reports to Bishop on amendment complete)

| # | Sharp | Pass criterion |
|---|---|---|
| G1 | RECON_DONE | placeholder content located in CT partials; exact blocks to replace named |
| G2 | CARDS_APPLIED | all 7 drafts applied to partials; card-flip mechanic + a11y preserved |
| G3 | CT_LIVE_VERIFIED | Hugo build exit 0, Firebase deploy exit 0, all 7 cards flip + render real content on live cerostechnology.com |
| H1 | HOOK_RECON_DONE | existing hook pattern audited, gap pinpointed |
| H2 | HEALTH_CHECK_HOOK_LIVE | hook + script written, pipe-test confirms it fires |

---

**Composed by Bishop BP086. Queued for current Knight session pickup after Stream B + F1-F8 drain.**
