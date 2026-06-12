# YOKE-RETURN · Knight → Bishop · BP080 · v0.1.52
# 2026-06-11 / 2026-06-12 (STYLE-HOTFIX rebuild)

V0152-YOKE-RETURN
─────────────────
SEG-V0152-P0-LEAN-DEFAULT:   COMPLETE — resolveInitialUiMode() hardened; removeItem guard + 4-priority JSDoc; logic correct as-found
SEG-V0152-P0-FLIP-CARD:      COMPLETE — SixPillarsFlipCard CSS 3D component; prior partial replaced; all copy verbatim; 5 style keys restored via STYLE-HOTFIX
SEG-V0152-P0-ASK-TAB-FIX:    COMPLETE — all fixes already in place from prior session; OllamaManager routing + 127.0.0.1 + checkFailed UX confirmed
SEG-V0152-P0-LEAN-NUDGE:     COMPLETE — LeanModeNudge present; switchToLean StorageEvent dispatch added (was the only gap)
SEG-V0152-STYLE-HOTFIX:      COMPLETE — 5 dropped style keys restored from git f2fbc14 verbatim; committed 09bfad9
SEG-V0152-VERIFY:             GREEN (after STYLE-HOTFIX) — main TS PASS, renderer 0 LeanHomeTab errors, 3 assert scripts PASS
SEG-V0152-SHIP:               GATE 1 COMPLETE — version bumped, STYLE-HOTFIX committed, installer rebuilt, SHA-256 recorded, Cephas content updated, DRAFT release created + installer uploaded

Screenshots embedded: [PENDING — clean-VM packaged install required from Founder per canon_actual_runtime_verify_for_runtime_bugs_bp078]
Runtime evidence: Build PASS — 145/145 IPC channels PASS, ollama.exe 33.9 MB bundled, floor model 379.4 MB bundled, vcredist 24.4 MB bundled; assert-bundled-ollama PASS.

SHIP-READY: GATE 1 COMPLETE · GATES 2+3 BLOCKED ON FOUNDER RATIFY
  Gate 2 (Cephas/Hugo deploy): awaiting Founder explicit "ship it" / "push" / "fire"
  Gate 3 (anonymous download verify): follows Gate 2

## Build Artifacts
| Field | Value |
|---|---|
| Installer | `release/MnemosyneC-Setup-0.1.52.exe` |
| SHA-256 | `79F1B33FF92DE78C2D38A8960EAD9C5E415202C7BFF38358E14B45AA47AF1054` |
| SHA-512 (base64) | `MmC+kA0Y7ifIr1qSP9cTh+0RMJ0MbOVXuhwbE8Z2xSnsfY92pKmMciMIaQvcb9AnGDvy3jkNZHTU2K/rWK0fxg==` |
| Size | 537,047,293 bytes |
| Release date | 2026-06-12T00:05:12.436Z |
| GitHub DRAFT Release | https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-d120dc3012b807916c8e |

## Commits (pushed to origin/main)
| SHA | Description |
|---|---|
| `98581f3` | v0.1.52 — Lean default hardened, Six Pillars flip card, Ask tab fix, Existing-user nudge |
| `acbdb16` | BP080 v0.1.52 yoke-return + KNIGHT_BISHOP_MESSAGES append (previous session) |
| `09bfad9` | style(lean): STYLE-HOTFIX restore 5 dropped style keys to LeanHomeTab.tsx |
| `7a2b370` | Cephas: v0.1.52 SHA-256 update (STYLE-HOTFIX rebuild) |

## Truth-Always Flags
- SEG-P0-FLIP-CARD had a pre-existing partial implementation (not at described state) — corrected
- SEG-P0-LEAN-DEFAULT had a prior partial update — corrected
- SEG-P0-ASK-TAB-FIX: all fixes were already present from prior session — no new changes required
- STYLE-HOTFIX: 5 style keys (pillarsTitle, pillarsSub, pillarRow, pillarLabel, pillarDetail) dropped by FLIP-CARD rewrite; restored from f2fbc14 verbatim; committed 09bfad9
- Previous yoke-return (from prior sub-session at 98581f3/acbdb16) used an earlier SHA-256 (03694EC...) built before the STYLE-HOTFIX was committed. This yoke-return supersedes it with the correct post-STYLE-HOTFIX build hash.
- GitHub DRAFT Release asset verified: GitHub API confirms SHA-256 matches local hash

## Founder Action Required
1. Install v0.1.52 on a clean machine (no prior MnemosyneC) and confirm:
   (a) Opens to LEAN 3-tab UI on first launch
   (b) Six Pillars flip card animates correctly, both faces render
   (c) Ask tab works with gemma4:12b — no "not set up" error
   (d) Advanced mode shows nudge banner; click transitions to lean; dismiss is permanent
2. Say "ship it" / "push" / "fire" to trigger Gates 2+3 (Cephas deploy + download verify)
3. Say "publish" to promote the DRAFT GitHub Release to live

*Knight · SEG-V0152-SHIP · BP080 · Sonnet 4.6 · 2026-06-12*
