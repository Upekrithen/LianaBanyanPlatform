# KNIGHT SESSION SEQUENCING — K216 through K220
## Bishop B058 | April 1, 2026
## Updated with K214-K215 completion

---

## STATUS

| Session | Domain | Status | Files | Key Feature |
|---------|--------|--------|-------|-------------|
| K214 | Commerce | ✅ DONE | 37 | 11 pages, Cost+20% hardcoded |
| K215 | Financial | ✅ DONE | 30 | RoleDashboardTemplate (25 roles) |
| **K216** | **Captain** | **NEXT** | ~25 est | Moses model, Priority Queue dashboard |
| K217 | Governance | READY | ~20 est | Backer Elections, Areopagus |
| K218 | Guild | READY | ~15 est | Guild charters, staked Marks, Harper |
| K219 | Reputation | READY | ~12 est | ADAPT scores, XP, badges |
| K220 | Housing | READY | ~20 est | WaterWheel, Roommate, Vacation |

---

## RECOMMENDED ORDER: K216 → K217 → K218 → K219 → K220

### K216: Captain (NEXT)
**Prerequisite**: K209 (Currency) ✅, K215 (Financial/RoleDashboardTemplate) ✅
**Why next**: Captain extends the RoleDashboardTemplate pattern from K215. The Captain role definition already exists — K216 adds the territory/pipeline/intelligence/photo domain logic around it. High impact: Captains are the local business leaders who drive platform adoption.
**Key risk**: Captain Dashboard has a detailed Pawn B30 spec — Knight MUST read it before building.

### K217: Governance
**Prerequisite**: K207 (Membership) ✅, K218 (Guild — soft dependency for Harper Guild)
**Why this order**: Governance needs membership for voter identity. The Harper Guild dependency is soft — governance can stub the Harper integration and K218 fills it in.
**Key feature**: Backer Elections with Marks-weighted voting. Areopagus 4-level dispute resolution.

### K218: Guild
**Prerequisite**: K207 (Membership) ✅, K209 (Currency/Marks) ✅
**Why this order**: Guilds need Marks staking. After governance, guild adds the professional community layer.
**Key feature**: Guild charters, staked Marks for membership, elected representatives, Harper Guild for dispute oversight.

### K219: Reputation
**Prerequisite**: K207 (Membership) ✅
**Why this order**: Reputation is a cross-cutting concern. After Captain/Governance/Guild, reputation ties them together — ADAPT scores affect Captain levels, guild standing, and Crew Call ranking.
**Key feature**: ADAPT 5-pillar scoring, XP accumulation, badge system.

### K220: Housing
**Prerequisite**: K209 (Currency) ✅, K219 (Reputation) for roommate accountability
**Why this order**: Housing is a standalone domain but roommate accountability uses reputation/ADAPT. Building it after reputation means the integration is clean.
**Key feature**: WaterWheel revenue model, Roommate Accountability photo stamps, Vacation Network priority.

---

## AFTER K220: 13/23 DOMAINS MIGRATED

Remaining (K221-K230): Manufacturing, Social, Gaming, Defense, Vehicle, Political, Beacon, Calendar, Admin, Initiatives

---

## SPECIAL KNIGHT TASK: Stats Batch Update (insert before or after K216)

`BISHOP_DROPZONE/PROMPT_KNIGHT_STATS_BATCH_UPDATE_65_LETTERS.md`

65 letters need stats refresh before Opening Gambit. This is a 30-45 min task, can run as a quick session between domain builds. CRITICAL if letters haven't been updated yet.

---

## VELOCITY CHECK

| Sessions | Migrated | Rate |
|----------|----------|------|
| K207-K215 (9 sessions) | 8 domains | ~0.9 domains/session |
| K216-K220 (5 sessions) | 5 domains | projected 1.0 domains/session |
| K221-K230 (10 sessions) | 15 domains | projected 1.5 domains/session (smaller domains) |

At current rate: **all 23 domains migrated by ~K230**, which aligns with the prompt queue. Gaming (K223) and Social (K222) are the largest remaining — may need sub-sessions.

---

*Knight Sequencing K216-K220 — B058*
*Captain → Governance → Guild → Reputation → Housing*
*FOR THE KEEP!*
