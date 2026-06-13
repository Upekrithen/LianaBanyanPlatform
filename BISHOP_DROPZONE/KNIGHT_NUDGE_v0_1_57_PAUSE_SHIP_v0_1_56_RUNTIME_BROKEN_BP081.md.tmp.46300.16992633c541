---
nudge: KNIGHT_NUDGE_v0_1_57_PAUSE_SHIP_v0_1_56_INSTALL_NOT_COMPLETED_BP081
bp: BP081
composed_at: 2026-06-12
composed_by: Bishop Opus 4.7 (1M)
purpose: v0.1.57 SHIP HOLD — but reason is install-not-completed on Founder machines, NOT v0.1.56 regression. UPDATED 2026-06-12 after Sonnet 4.6 forensic.
priority: P0 → DOWNGRADED to P1 (install verification not regression)
status: ACTIVE — Knight reads BEFORE SHIPping v0.1.57
hard_bindings:
  - "🚨 BP081 BLOOD STATUTE — ONLY Sonnet 4.6"
  - "Actual runtime verify for runtime bugs (BP078) — confirm binary version via diagnostic log BEFORE diagnosing regression"
  - "Forward-pressure ≠ verified-ratify (BP080)"
---

# Knight Nudge · v0.1.57 SHIP HOLD · v0.1.56 install-not-completed (NOT regression)

## TRUTH-ALWAYS CORRECTION (this nudge supersedes the prior alarm)

Founder reported v0.1.56 LEAN Ask broken on 3 machines. Bishop fired a Sonnet 4.6 forensic SEG on Founder's machine (M0).

**Finding: v0.1.56 was NEVER installed.** Founder is still running v0.1.48.

Evidence (full forensic at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\BP081_V0156_ASK_RUNTIME_FORENSIC.md`):
- Most recent diagnostic log dated 2026-06-11 shows `App version: 0.1.48`
- No 2026-06-12 diagnostic log exists despite Founder reporting "I installed v0.1.56 today"
- `C:\Users\Administrator\AppData\Local\Programs\MnemosyneC\` does not exist
- `C:\Users\Administrator\AppData\Local\mnemosynec-updater\installer.exe` (536 MB) sits unrun in the updater cache

The "Could not reach local AI" error Founder observed IS a v0.1.48 issue. v0.1.56's family-match fix has NOT actually been runtime-tested anywhere yet.

## Knight actions

### 1. v0.1.57 SHIP — STAY ON HOLD

Even though the v0.1.56 alarm was a false-positive-of-regression (it was install-not-completed, not a code bug), the rule still holds: **do NOT promote v0.1.57 to Latest until v0.1.56 is empirically verified working on at least one Founder machine.** Latest must be a known-good version.

v0.1.57 STAGING is fine — Founder can smoke from staging URL once v0.1.56 install completes successfully.

### 2. Optional v0.1.56.1 hotfix (P2 — defensive)

Composer: improve the `LeanAskTab.tsx:230` catch message. Currently the same message fires whether:
- IPC bridge missing (preload didn't load)
- `window.amplify.aiDispatch.query` threw
- Ollama unreachable
- Selected model is null

Differentiate. The user-facing error should say WHICH failure mode hit, so future Founder reports come pre-diagnosed.

Specifically:
```typescript
try {
  if (!window.amplify?.aiDispatch?.query) {
    updateLastMsg(aiId, '⚠ Preload bridge missing — reinstall MnemosyneC.');
    return;
  }
  const result = await window.amplify.aiDispatch.query(...);
  // existing ok/error handling
} catch (e) {
  const errMsg = e?.message || String(e);
  updateLastMsg(aiId, `⚠ Ask threw: ${errMsg}. See Diagnostic.`);
}
```

Not blocking v0.1.57. Fold into v0.1.57.1 carry-along OR queue v0.1.58 with the better Ask flow.

### 3. New VERIFY discipline (carry forward to all future runtime-touching waves)

Add to VERIFY checklist (mandatory for any runtime-class SEG):
- Before declaring GREEN, confirm packaged binary actually installs successfully on a clean machine OR document why install isn't possible
- VERIFY logs `Model used: Sonnet 4.6` AND `Binary install verified on: <machine name>` OR `Binary install verify: DEFERRED to Founder`
- If DEFERRED → Bishop's hand-off to Founder MUST include verification step ("after install, check diagnostic log shows App version: 0.1.56 before declaring smoke")

This is the Founder-belief-vs-binary-state gap that bit us today.

### 4. v0.1.57 STAGING-UPLOAD continues as planned

When v0.1.57 VERIFY GREEN + STAGING-UPLOAD GREEN, Founder gets the v0.1.57 pre-release URL. Founder smokes v0.1.57 install. If v0.1.57 install + smoke GREEN → Founder pastes "publish it" → v0.1.57 SHIPs to Latest, skipping v0.1.56's Latest promotion (since v0.1.57 is a superset of v0.1.56).

That's actually the velocity-statement-compliant path: roll forward through v0.1.57 → v0.1.58 → v0.1.60 with each Pre-release as the verification surface, and the first Latest promotion lands on whichever version Founder verifies on real machines.

## Bishop note

The v0.1.56-runtime-broken alarm was wrong but its discipline value was correct: we now have a written canon-candidate that says **"confirm binary version from diagnostic log before diagnosing regression."** This protects the next 100 sessions from the same belief-vs-binary trap.

Truth-Always caught it. Forensic took 5 minutes. Damage prevented.

— Bishop · BP081 · 2026-06-12
