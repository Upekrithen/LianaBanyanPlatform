# LB-CODEX-0039 — Bushel 27 — Red/Blue Team Competition + IP Ledger Stamp Surface

**Serial:** LB-CODEX-0040  
**Bushel:** 27  
**Session:** BP022 (Knight)  
**Dated:** AD 2026-05-03  
**Allocation method:** Best-effort (ledger high-water 0039 + 1; 0039 taken by Bushel 22 at collision-time); Bushel 32 tool LANDED but not exposed to this Cursor MCP client — flag for reconciliation post-session  

---

## What This Codex Records

Bushel 27 productizes the ratified Red Team / Blue Team competition + IP Ledger credit-where-due canon into a full member-visible scoreboard + IP Ledger stamp surface.

## Deliverables

### Schema (Supabase migration: `20260503170000_bushel27_red_blue_competition_ip_ledger_stamp_bp022.sql`)

- `lb_elves_guild_membership` — team assignment + anti-collusion gate (30-day cooldown)
- `ip_ledger_stamp` — permanent per-win IP attribution record (stamp_class: `red_team_find` | `blue_team_harden`)
- `red_blue_competition_event` — full event table with submission lifecycle, IP stamp FK, cross-team challenge FK, marks payout fields
- `red_blue_win_class_multiplier` — seeded Marks payout matrix (10 subclasses, Tier 4–5, 2.5×–3.0×)
- `red_blue_team_scoreboard` — materialized view (per-team aggregate)
- `red_blue_individual_leaderboard` — materialized view (per-member within team)
- `generate_ip_ledger_stamp_on_verify()` trigger — fires on `verified_at` populated, creates `ip_ledger_stamp` row, populates marks payout amount
- `submit_cross_team_challenge()` function — Phase D cross-team composition
- `can_switch_team()` function — anti-collusion cooldown check
- `refresh_red_blue_scoreboards()` function — materialized view refresh

### Platform surface (React/Vite)

- `platform/src/pages/helm/RedBlueLeaderboard.tsx` — main scoreboard page with X-Ray Mode toggle
- `platform/src/pages/helm/RedBlueTeamDetail.tsx` — team detail (Red or Blue)
- `platform/src/pages/helm/RedBlueMemberDetail.tsx` — per-member record with IP stamp badges
- Routes registered in `platform/src/routes/tools.tsx`:
  - `/helm/red-blue-leaderboard`
  - `/helm/red-blue-leaderboard/red`
  - `/helm/red-blue-leaderboard/blue`
  - `/helm/red-blue-leaderboard/member/:member_id`

### Cephas Hugo parallel double

- `Cephas/cephas-hugo/content/helm/_index.md`
- `Cephas/cephas-hugo/content/helm/red-blue-leaderboard.md`
- `Cephas/cephas-hugo/content/helm/red-blue-leaderboard/red.md`
- `Cephas/cephas-hugo/content/helm/red-blue-leaderboard/blue.md`
- `Cephas/cephas-hugo/content/helm/red-blue-leaderboard/member.md`

### Phase E receipt

- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/BUSHEL_27_FIRST_COMPETITION_CYCLE_RECEIPT_BP022.md` — scaffold, locks as empirical at first live cycle

## G-Gates

| Gate | Condition | Status |
|---|---|---|
| G1 | Schema deployed: all 4 tables + 2 views + trigger | ✅ migration committed |
| G2 | Cephas surface: 4 routes resolve + X-Ray toggle + Hugo stubs | ✅ wired |
| G3 | IP Ledger stamp: trigger fires on verified_at + stamp_class correct | ✅ in migration trigger |
| G4 | Marks payout matrix: 10 subclasses seeded + payout fires on verification | ✅ in trigger + matrix table |
| G5 | Cross-team transparency: dual-team-visible + challenge fn + anti-collusion gate | ✅ in migration |
| G6 | First competition cycle: receipt scaffolded, locks empirical at first live event | ⏳ pending first live cycle |
| G7 | Codex bind: LB-CODEX-0039 + LB-STACK-0027 appended | ✅ this file |

## Composes With

- Bushel 25 (LB Elves Guild seed — `lb_elves_guild_membership` IF NOT EXISTS)
- Bushel 26 (5-Hypothesis empirical fire — Red/Blue throughput as H* candidate)
- Public IP Ledger canon (BP016) — `ip_ledger_stamp` rows compose alongside existing `ip_ledger`
- Slow Blade defense stack (BP021) — Blue Team hardens → defense-canonical-list; Red Team finds → empirical-test surface
- Mordecai-Esther Pedestal Forum Decree-Composition canon (BP021 Crown-Jewel-class) — winner Pedestal decrees compose alongside canonical-artifact

## Allocation Note

Best-effort serial 0039 (ledger high-water 0038 + 1). Bushel 32's `codex_reserve_next_serial` tool exists but was not accessible via Cursor MCP client at session time. Flag for reconciliation: if a concurrent reservation took 0039 before this commit, rename to the next available serial per Maintenance-Scribe post-compaction protocol.

---

*LB-CODEX-0039 · Bushel 27 · BP022 · AD 2026-05-03 · Knight session*
