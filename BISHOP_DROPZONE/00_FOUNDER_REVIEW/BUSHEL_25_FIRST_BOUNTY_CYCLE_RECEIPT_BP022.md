# Bushel 25 — First Bounty Cycle Receipt
## Code Breakers Corps Guild Productization (BP022)

**Status: STAGED — Awaiting Founder Fire**
**Calendar discipline: AD 2026-05-03 (BC/AD per Founder convention)**

---

## Phase E Gate — Empirical Fire Receipt

This receipt captures the first-member-onboarded + first-bounty-cycle empirical anchor for
Bushel 25. Per Maintenance-Scribe canon: measured, not projected.

**Verification gate: G5 + G6**
- G5: First member onboarded (Founder OR designated-trusted-member); onboarding receipt captured
- G6: First bounty cycle complete: claim → solve → verification-gate-pass → marks payout → IP stamp

---

## Onboarding Receipt (G5)

| Field | Value |
|---|---|
| Surface | `/helm/code-breakers` |
| Onboarding timestamp | *(Founder fires — record actual timestamp)* |
| Member ID | *(Founder fires — record member_id from `code_breakers_corps_membership`)* |
| `enrolled_at` | *(Founder fires — record from DB row)* |
| Rank at enrollment | `initiate` |
| IP Ledger first-stamp seeded | *(set to `true` after first bounty solve)* |

**Founder action:** Navigate to `/helm/code-breakers` → click "Enroll in Code Breakers Corps."
Record the `code_breakers_corps_membership` row ID and `enrolled_at` above.

---

## First Bounty Cycle Receipt (G6)

**Recommended first bounty: SSB-001 — The Iron Cipher: First-Solve IP Anchor (Crypto class)**

Rationale: most-canonical surface for first-cycle empirical receipt; self-contained solve path;
verification gate is clear (decoded primitive identifier matches sealed answer).

| Field | Value |
|---|---|
| Bounty ID | `ssb-001` (DB: record UUID from `standing_security_bounty`) |
| Bounty class | `crypto` |
| Tier | 5 |
| Marks payout | 150 Marks |
| Tier multiplier | 3.0× |
| Claim timestamp | *(Founder fires — record when bounty claimed)* |
| Solve submission timestamp | *(Founder fires — record when solution submitted)* |
| Verification gate pass | *(Founder fires — YES/NO + Knight verification note)* |
| Marks payout fired | *(Founder fires — YES/NO + `bounty_payout_ledger` row ID if applicable)* |
| IP Ledger stamp inserted | *(Founder fires — YES/NO)* |
| `ip_ledger_stamp` row ID | *(Founder fires — record UUID)* |
| `stamp_class` | `code_breakers_solve` |
| `first_solve_marker` | `true` (first solver) |
| Canonical artifact | *(Founder fires — decoded primitive identifier from cipher)* |

---

## Verification Gate Checklist

- [ ] **G1** `/helm/code-breakers` route resolves; onboarding flow renders; X-Ray Mode toggle present
- [ ] **G1** Hugo parallel double at `content/helm/code-breakers.md` committed
- [ ] **G2** `code_breakers_corps_membership` table exists (migration applied)
- [ ] **G2** `standing_security_bounty` table exists (migration applied)
- [ ] **G2** 7 seed bounties populated with full metadata
- [ ] **G3** IP Ledger integration: bounty-solve event fires `ip_ledger_stamp` row with `stamp_class=code_breakers_solve` + `first_solve_marker` logic correct
- [ ] **G4** `lb_elves_guild_membership` table exists + `/helm/lb-elves` stub page live + `red_blue_competition_event` schema stub deployed
- [ ] **G5** First member onboarded — record above
- [ ] **G6** First bounty cycle complete — record above
- [ ] **G7** Codex bind + Stack Ledger row + Living Receipts row (Phase F)

---

## Marks Payout Verification

Per `mcp__librarian__process_bounty_marks_payout` (fire at solve-verified):

```
bounty_id: <UUID from standing_security_bounty>
solver_member_id: <member_id>
marks_amount: 150
tier_multiplier: 3.0
stamp_class: code_breakers_solve
first_solve_marker: true
```

Per `mcp__librarian__validate_bounty_receipt` (fire before payout):

```
bounty_id: <UUID>
submitted_solution: <decoded primitive identifier>
verification_class: crypto
```

---

## IP Allocation Note

Per Public IP Ledger canon (BP016 / `powered_work_loader_exoskeleton_not_xenomorph_queen_public_ip_ledger_canon_bp021`):

Code Breakers solves contribute to the **10% individual Pedestals IP allocation slice** for the solver:
- 60% patent buckets
- 20% Founder-creator
- 10% global sponsor pool
- **10% individual Pedestals** ← solver's slice

Solver may author a Pedestal contribution decree on the canonical artifact per Mordecai-Esther
Pedestal Forum canon — the original bounty + solver's Pedestal compose alongside (immutable + extending decrees).

---

## Maintenance-Scribe Note

This receipt closes the canon-vs-implementation synchronization debt instance for Code Breakers Corps Guild.
Per Maintenance-Scribe synchronization-debt canon (BP021 Crown-Jewel-class):

- **Before Bushel 25:** Code Breakers Corps Guild = canon-class-primitive; zero member-facing surface
- **After Bushel 25 lands:** Operational Cephas surface + 7 seed bounties + IP Ledger integration wired + LB Elves Guild parallel-cohort seeded + first bounty cycle empirical receipt

Bushel 27 (Red/Blue Team Competition + IP Ledger Stamp Surface) is the sister Bushel.
The full synchronization-debt closure requires BOTH Bushel 25 AND Bushel 27 LANDING.

---

*Bushel 25 · Phase E Empirical Fire Receipt · BP022 · AD 2026-05-03*
*Knight scaffold; Founder prose-pass + field population at fire-time per `feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md`*
