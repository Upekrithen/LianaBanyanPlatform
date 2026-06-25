# BISHOP SYNTHESIS — FRAME-TO-FRAME DOWNLOAD
## BP092 · Caithedral · 1-Page Founder Summary

**Composed by:** Bishop SEG · Sonnet 4.6 · 2026-06-22
**Companion dispatch:** `KNIGHT_MARATHON_FRAME_TO_FRAME_DOWNLOAD_WIRE_UP_BP092.md`

---

## CURRENT STATE (empirical, as of 2026-06-22)

MnemosyneC v0.6.0 is live. Frame-to-frame installer distribution is 80% wired:

- Ring Bearer Ed25519 keypair: LIVE (commit a5e72d7)
- `peer_artifact_server.ts` exists (port 47213) but is NEVER called at startup — Frames do not serve bytes
- `peer_artifact_client.ts` exists (`findPeerWithArtifact` / `downloadFromPeer`) but is NOT wired into `auto_updater.ts`
- `auto_updater.ts` goes straight to mnemosynec.ai server — no peer-first path
- Auth gate on `peer_artifact_server.ts`: ZERO — open relay, any caller gets bytes
- `MyIPLedger.tsx` is built and polished — not routed to any UI tab
- Merkle-diff replication loop: does not exist anywhere in codebase
- `ip_ledger_merkle_diff` table: staged in I12 migration, pending Bishop apply

**Net state:** Every update download goes to the server. Frames cannot distribute to each other.
The security risk is real: the open relay would serve the installer binary to any caller.

---

## THE 5 PIECES (what the Marathon delivers)

| # | Piece | File(s) touched | Risk |
|---|-------|-----------------|------|
| 1 | Call `startPeerArtifactServer()` at app boot | `src/main/index.ts` | LOW — non-fatal, port-conflict guarded |
| 2 | Auth gate: mic_stamped + circle_of_influence + reputation≥0.8 check via service-role REST | `src/main/keys_engines/peer_artifact_server.ts` + `peer_artifact_client.ts` | MEDIUM — fail-closed design |
| 3 | Peer-first download in `auto_updater.ts` + hash verification against quorum hash | `src/main/auto_updater.ts` | MEDIUM — server fallback preserved |
| 4 | Merkle-diff replication loop (15-min, battery-aware) | NEW: `src/main/keys_engines/merkle_replicator.ts` + `src/main/index.ts` | LOW — isolated new file |
| 5 | `MyIPLedger.tsx` section in Settings tab | `src/renderer/components/SettingsTab.tsx` | LOW — additive section |

---

## ESTIMATED TIME

**~6 hours wall-clock** (9 blocks including smoke tests and build/ship)

Breakdown: Pre-block audit (20m) · Server boot wire (25m) · Auth gate (45m) ·
Peer-first download (50m) · Merkle loop (60m) · UI tab (40m) ·
Smoke tests (45m) · Edge fn gate (5m) · Build + ship (60m)

---

## OPEN QUESTIONS — RATIFICATION CHECKLIST

All 5 must be ratified before firing the dispatch.

- [ ] **Q1 — Version:** v0.6.1 (patch) or v0.7.0 (minor)?
  Bishop recommends **v0.6.1** — internal plumbing, no new user-visible capability set.

- [ ] **Q2 — Merkle-diff interval:** 15 min default OK?
  Configurable via `MERKLE_REPLICATION_INTERVAL_MS`. **15 min** recommended.

- [ ] **Q3 — Reputation threshold for byte-serving:** 0.8 (matches _runTrustGate) or higher?
  Bishop recommends **0.8** for consistency — same bar as update verification.

- [ ] **Q4 — MyIPLedger UI placement:** New Settings section (recommended) or new top-level tab?
  Bishop recommends **Settings section** — zero tab-count change, lower blast radius.

- [ ] **Q5 — Battery-aware replication:** Default pause=true or false?
  Bishop recommends **true** — periodic replication is non-urgent; battery matters.

---

## SEQUENCING vs M23 UI DISPATCH

Parallel Knight sessions are permitted under Brick Wall override
(`canon_knight_parallel_sessions_permitted_under_scope_branch_isolation_brick_wall_override_bp089`)
with branch isolation: `bp092/frame-to-frame-download` vs `bp092/m23-ui`.

**Only conflict risk:** if M23 also edits `SettingsTab.tsx`. If it does — sequence this
Marathon first, M23 rebases. If M23 does NOT touch SettingsTab — parallel fire is clean.

**Recommendation:** Fire this Marathon immediately upon ratify. Fire M23 in parallel
if scope is clean; hold M23 until this Marathon merges if scopes collide.

---

*Bishop SEG · Sonnet 4.6 · BP092 · Caithedral*
