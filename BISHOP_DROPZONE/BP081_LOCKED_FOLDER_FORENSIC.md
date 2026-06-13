---
forensic: BP081_LOCKED_FOLDER_FORENSIC
composed_at: 2026-06-12
composed_by: Bishop SEG (Sonnet 4.6) content; Bishop main thread persisted
purpose: Resolve LOCKED-folder mystery — recoverable, hidden, deleted, or never existed
---

# LOCKED Folder Forensic · BP081

## §1 LOCKED direct enumeration

**Path:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\08_Papers\Academic\LOCKED\`

- ls -la: `total 28` — only `.` and `..`. Zero files.
- Get-ChildItem -Force: no output. No hidden files.
- Attributes: ReadOnly Directory (cosmetic, not blocking reads). NOT a symlink.
- CreationTime: 2026-04-12 09:12 AM
- LastWriteTime: 2026-04-12 09:12 AM (never written)
- Sibling LOCKED folders also empty: Founder_Essays/LOCKED, Outlines/LOCKED, Policy/LOCKED

**Verdict: TRULY-EMPTY.** Created 2026-04-12 as a placeholder shell. Never populated. No hidden content, no symlink, no permissions block.

## §2 Git deletion history

- Total deletion commits touching LOCKED path: **0**
- Total deletion commits touching `08_Papers/Academic/`: **0**
- Total deletion events on any paper/academic/cake/executive/atomo/chaos/four-agent path: **0**
- Only relevant deletion: `0d63d7d` 2026-04-09 "Housekeeping: SEC-clean letter consolidation" — deleted 14 LETTER files (not papers)
- `08_Papers/` git events ever: 1 ADD only (`BP075_HOW_TO_SAVE_THE_WORLD_SIX_EASY_STEPS_SUBSTACK_READY.md` to root)

**Conclusion:** The LOCKED folder was NEVER in git. NEVER deleted. The FOUNDER_PAPER_CANON_INVENTORY_BP035 (written 2026-05-09) which claims papers exist in this path is a **documentation error** — the inventory was aspirational or referenced a non-existent filesystem state. **Actual papers landed in the OFFSITE vault BP035 Forager extractions, NOT in BISHOP_DROPZONE.**

## §3 Recovery candidates per paper

### Executive Pay
- `LianaBanyanOFFSITE\0 Stone Tablets Vault\Forager_Extractions_BP035\06_Hugo_Content\LianaBanyanPlatform\Cephas\cephas-hugo\content\academic\executive-pay-cooperative.md` · 13,437 bytes
- `...\content\articles\executive-pay.md` · 12,133 bytes
- `AntigravityWorkspace\source_snapshot_readonly\Cephas\cephas-hugo\content\articles\executive-pay.md` · 12,288 bytes (newest 2026-06-05)
- Best: `executive-pay-cooperative.md` (13 KB) — likely "In Depth" variant. AT_A_GLANCE / MORE_DETAILS as separately-named files not confirmed.

### Paper 1 — Lighthouse Ladder
- `LianaBanyanOFFSITE\0 Stone Tablets Vault\Forager_Extractions_BP035\06_Hugo_Content\...\academic\lighthouse-ladder-paper.md` · **71,491 bytes** ← largest paper found

### Paper 2 — Invisible Temperament
- `...\academic\invisible-temperament-paper.md` · 27,621 bytes

### Paper 3 — Self-Funding Economics
- `...\academic\self-funding-economics-paper.md` · 51,962 bytes

### Papers 4-7
- 4 Portable Reputation: `portable-reputation-paper.md` · 55,138 bytes
- 5 Contingency Operators: `contingency-operators-paper.md` · 53,146 bytes
- 6 Temporal Content Architecture: NOT found under that slug
- 7 Five Dollar Career: `five-dollar-career.md` · 1,272 bytes (stub)

### Accounts Payable
- `...\academic\accounts-payable-marks-paper.md` · **55,922 bytes** ← full paper
- V1/V2/V3 as distinct files NOT confirmed — likely draft history within single file

### How to Bake AI Cake
- `LianaBanyanPlatform\Upekrithen-Trunk\PLATFORM\Academic_Papers\PAPER_HOW_TO_BAKE_AI_CAKE_FULL.md` · 45,199 bytes (2026-06-10 newest)
- `AntigravityWorkspace\source_snapshot_readonly\Cephas\cephas-hugo\content\academic\how-to-bake-ai-cake-paper.md` · 45,923 bytes
- BP035 Forager copy: 45,376 bytes

### Four Agent Architecture
- Pudding fragments only: `PUDDING_37_FOUR_AGENTS_AND_A_FOUNDER_B060.md` + `PUDDING_78_THE_FOUR_AGENTS_B062.md`
- No standalone paper found platform-wide. **GENUINELY MISSING as paper.**

### No Atomo Superman
- `LianaBanyanOFFSITE\0 Iterative Vault\01_Papers_Foundational\No Atomo Superman\NoAtomoSuperman_v006_BP035_2026-05-10_canonical.md` · 19,487 bytes (canonical v006)
- v001 exhaustive: 35,581 bytes (largest)
- 6-version chain present. **RECOVERED.**

### CAI Remedial Chaos Theory
- `LianaBanyanOFFSITE\0 Iterative Vault\01_Papers_Foundational\CAI Remedial Chaos Theory Catching the Die\CAIRemedialChaosTheory_v001_BP035_draft.md` · 36,602 bytes
- **RECOVERED — draft body exists** (~36 KB substantial)

## §4 Updated missing-items resolution

| Item | Old verdict | New verdict | Best path |
|---|---|---|---|
| No Atomo Superman (3 versions) | STILL MISSING | **RECOVERED — 6 versions** | Iterative Vault v006 canonical |
| CAI Remedial Chaos Theory body | STILL MISSING | **RECOVERED — draft exists** | Iterative Vault v001 draft |
| Executive Pay triple | STILL MISSING | **PARTIAL — Cephas variants** | `executive-pay-cooperative.md` |
| Papers 1-7 numbered series | STILL MISSING | **5 of 7 RECOVERED in BP035** | BP035 academic folder |
| Accounts Payable V1/V2/V3 | STILL MISSING | **RECOVERED — full 56 KB paper** | `accounts-payable-marks-paper.md` |
| How to Bake AI Cake | LOCKED only | **MULTI-COPY confirmed** | Upekrithen-Trunk PLATFORM/Academic_Papers |
| Four Agent Architecture | STILL MISSING | **STILL MISSING as paper** (Puddings have fragments) | None |
| Unlimited Throws MEDIUM | STILL MISSING | STILL MISSING | — |
| RDJ Crown letter | STILL MISSING | STILL MISSING | — |
| Bono Crown letter | STILL MISSING | STILL MISSING | — |

## §5 Recommended recovery actions

1. **Bulk-copy BP035 academic extractions** → ProofVault/PAPERS/. Source: `LianaBanyanOFFSITE\0 Stone Tablets Vault\Forager_Extractions_BP035\06_Hugo_Content\LianaBanyanPlatform\Cephas\cephas-hugo\content\academic\` (37+ papers including all 5 of Papers 1-7 recoverable, Accounts Payable, AI Cake, Executive Pay variant).
2. **Copy Iterative Vault Foundational Papers** → ProofVault/PAPERS/. Source: `LianaBanyanOFFSITE\0 Iterative Vault\01_Papers_Foundational\` (No Atomo, CAI Chaos Theory, others).
3. **Copy Upekrithen-Trunk Academic Papers** → ProofVault/PAPERS/. Source: `LianaBanyanPlatform\Upekrithen-Trunk\PLATFORM\Academic_Papers\` (AI Cake full draft, etc.).
4. **Deep search for Four Agent Architecture** — `Asteroid-ProofVault/00_INBOX_FOR_SYNTHESIS/`, vault session transcripts B058-B062, `Asteroid-ProofVault/_root_archive_b063/`.
5. **Executive Pay triple naming resolution** — promote `executive-pay-cooperative.md` as the canonical In Depth variant; AT_A_GLANCE / MORE_DETAILS may need composing fresh from the in-depth source.
6. **Update FOUNDER_PAPER_CANON_INVENTORY_BP035** — correct the false-LOCKED claims, point to actual OFFSITE paths.
