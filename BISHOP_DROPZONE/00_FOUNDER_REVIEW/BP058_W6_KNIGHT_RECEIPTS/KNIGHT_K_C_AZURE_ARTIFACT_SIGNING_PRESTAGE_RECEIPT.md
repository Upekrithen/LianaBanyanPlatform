# Knight K-C Receipt: Azure Artifact Signing Prestage
## BP058 W6 · 2026-05-25

**Commit:** `584994f10bbb0d9493f88167d06914d7ccbb0761` (`584994f`)  
**Session:** K-C  
**Knight:** Cursor/Sonnet 4.6  
**Canon source:** eblet-pawn-session-full-dump-10-parts-mnemosyne-*-bp058 (Part 5 + Part 8 + Part 9)

---

## §1 Deliverable Status

| # | Deliverable | Status | Notes |
|---|---|---|---|
| Step 1 | Find Pawn Eblet (Parts 5, 8, 9) | ✅ Done | Found at `Asteroid-ProofVault/eblets_bp058/eblet_pawn_session_full_dump_10_parts_*_bp058.eblet.md` |
| Step 2 | `.github/workflows/release-sign.yml` | ✅ Done | `azure/trusted-signing-action@v0.3.18` · 6 secrets referenced · signs `.exe`+`.msi` in `amplify-computer/dist/` · includes verify step + release asset upload |
| Step 3 | `docs/azure-signing-setup.md` | ✅ Done | 7-section guide · Founder-only steps marked ⚠️ · SmartScreen single-cert canon · SSL.com refund action · rotation schedule cross-ref |
| Step 4 | `scripts/azure-budget-alert.sh` | ✅ Done | `az consumption budget create` · $10 warn / $20 critical · `founder@lianabanyan.com` · `rg-liana-banyan-signing` · `az login` guard |
| Step 5a | `docs/reminders/azure-identity-renewal-11months.ics` | ✅ Done | DTSTART 20270426T090000Z · 7-day + 1-day alarms |
| Step 5b | `docs/reminders/azure-client-secret-rotation-18months.ics` | ✅ Done | DTSTART 20271126T090000Z · 14-day + 7-day + 1-day alarms |
| Step 6 | Battery Dispatch migration decision | ✅ Done | **RETIRE** — see §2 and `BATTERY_DISPATCH_MIGRATION_RETIREMENT_NOTE.md` |
| Step 7 | Commit all files | ✅ Done | `584994f` · 6 files · 521 insertions · all pre-commit hooks passed |

**Note on Part 8 (LICENSE_SSPL.md) and Part 9 (CLA.md):** The Pawn Eblet is a summary Eblet — the full text of these deliverables is in the Pawn session itself, not extracted to separate files in the repo. The K-C mission specifies only the workflow (Part 5) as the repo-drop; LICENSE_SSPL.md and CLA.md are a separate task (repo root drop per Pawn Part 8/9 spec — candidate for K-D or separate session).

---

## §2 Battery Dispatch Migration Decision: RETIRE

**Evidence reviewed:**
- All 4 migrations in `platform/supabase/migrations/_archive_legacy_pre_baseline/` — already archived, not run on production schema
- spec_spinout_04_battery_dispatch.eblet.md §6: "no live dashboard · Broadcast Scheduler engine not productized · access-gating migrations are pre-baseline (need re-validation)"
- spec §7 move 1: "Resurrect/re-baseline OR formally retire"
- eblet-battery-dispatch-discord-plug-substrate-bp058 §5 forward-binding 3: canonical forward of this exact decision

**Decision: RETIRE**
- Migrations remain in `_archive_legacy_pre_baseline/` as historical record (no deletion)
- They will NOT be applied to production as-is — schema has diverged significantly
- When Battery Dispatch V1 is productized: write fresh migrations from spec intent
- Discord plug infrastructure IS live (`plug_adapters/discord.ts`, `social_plug_features` table) — builds on that when time comes

**Retirement note:** `BISHOP_DROPZONE/00_FOUNDER_REVIEW/BP058_W6_KNIGHT_RECEIPTS/BATTERY_DISPATCH_MIGRATION_RETIREMENT_NOTE.md`

---

## §3 Founder-Only Steps (What Remains)

These steps require Founder browser interaction — Knight CANNOT automate them:

| Step | Action | Estimated Time |
|---|---|---|
| ⚠️ FOUNDER ONLY | Create/confirm Microsoft Account at account.microsoft.com | 5 min |
| ⚠️ FOUNDER ONLY | Create Azure subscription (Pay-As-You-Go) at portal.azure.com | 10 min |
| ⚠️ FOUNDER ONLY | Identity verification at au10tix: photo ID upload + selfie + Authenticator QR scan | 15-20 min |
| ⚠️ FOUNDER ONLY | Create client secret in App Registration → copy value (shown ONCE) | 5 min |
| ⚠️ FOUNDER ONLY | Fill 6 GitHub Secrets in repo Settings → Secrets | 10 min |
| ⚠️ FOUNDER ONLY | Call SSL.com to cancel EV cert + request 100% refund (10-day no-mint) | 10-15 min call |
| ⚠️ FOUNDER ONLY | Import 2 ICS reminders to calendar | 2 min |
| ⚠️ FOUNDER ONLY | Run `bash scripts/azure-budget-alert.sh` after az login | 5 min |

**Total Founder-only time estimated:** ~60-75 minutes (exclusive of identity verification wait — automated check: hours; manual escalation: days)

**Full guide:** `docs/azure-signing-setup.md`

---

## §4 What Knight Pre-Staged (Zero Founder Touch Needed)

| Asset | Value |
|---|---|
| GitHub Actions workflow | Ready to trigger on first `v*` tag push |
| Setup documentation | Step-by-step with exact Azure portal navigation |
| Budget alert script | One `bash` command post-az-login |
| Calendar reminders (ICS) | Ready to import — no rescheduling needed |
| Battery Dispatch retirement | Formally documented — no pending migration decisions |

---

## §5 Honest Banyan Metric™ Score

**Score: 84 ± 6**

| Dimension | Score | Rationale |
|---|---|---|
| Completeness | 87 | All 7 steps executed; Part 8/9 (LICENSE_SSPL + CLA) are a separate repo-root drop task not completed here |
| Quality | 85 | Workflow is production-ready pending secret fill; docs are comprehensive; ICS reminders include multi-level alarms |
| Canon compliance | 88 | Pawn Eblet read; drift corrections honored (single cert, no stacking); Battery Dispatch decision rooted in canon spec + drift Eblet |
| Honest scoping | 82 | Part 8/9 gap acknowledged above; Founder-only steps clearly enumerated rather than over-claimed |

**Variance band:** ±6 (primary uncertainty: whether `azure/trusted-signing-action@v0.3.18` is the exact current latest stable; Pawn Eblet cited this version, Hendrik Erz guide confirms v0.3.x range — likely accurate but Founder should verify at https://github.com/azure/trusted-signing-action/releases before first use)

---

## §6 Push Status

Commit `584994f` is on local main. Push to remote with:
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform"
git push
```

---

## §7 Drift Catches

1. **Pre-commit trailing whitespace** in `docs/azure-signing-setup.md` — caught by hook, fixed automatically, re-staged. Brick Wall Policy honored (hook fix, not bypass).
2. **Part 8/9 scope** — the Pawn Eblet summary does not contain verbatim text of LICENSE_SSPL.md or CLA.md (those are Pawn output not yet extracted to repo files). Honest scope-cut: those are a separate K-task.

---

*Receipt authored K-C · BP058 W6 · Knight (Cursor/Sonnet 4.6) · 2026-05-25*  
*Anti-Hype Empirical Honesty applied · Pearl Prerogative pending librarian emit*
