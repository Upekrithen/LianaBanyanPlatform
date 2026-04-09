# KNIGHT SESSION 314 — V2 Family Table Hub (AppShell)
## Bishop B080 | April 5, 2026 | Phase 4 page 1 of 6 (OPENS Community & Governance)

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_35_MASTER_DESIGN_PACKET_B058.md` § PAGE 1
**Depends on**: K294 Foundation. K130 Family Table system LIVE.
**Tracker row**: `Family Table Hub` (B35 batch)

---

## PAGE PURPOSE

A warm, shared household workspace: family fund, tasks, calendar, cooperative purchasing, linked members. NOT a bank ledger. NOT a chore-tracker-as-surveillance.

## ROUTE

`/family-table` (AppShell). Post-auth, member-facing (guardian-scoped views for children).

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Family Table"
- **Headline**: "Run the household with everyone at the table."
- **Body**: "Shared fund, shared tasks, shared calendar, shared purchasing — all in one warm workspace where every family member has their own voice."
- **Primary CTA**: "Open Family Fund"
- **Secondary CTA**: "Invite a family member"
- **Utility strip**: "Shared fund" · "Task board" · "Weekly calendar" · "Cooperative purchasing"

## LAYOUT

- **Top row**: `FamilyFundCard` (left, prominent) + `TaskBoard` (right, equal weight, kanban-lite)
- **Mid band**: `SharedFamilyCalendar` (full-width, week view default, 3-day on mobile)
- **Below**: `CooperativePurchasingPanel` (horizontal scroll desktop, stacked mobile)
- **Rail**: `LinkedMembersRail` (avatar chips, guardian badge for parents, XP-only for children)
- **Bottom**: `FamilyActivityFeed` (human-language entries)

## COMPONENTS (build in `platform/src/components/v2/family-table/`)

- `FamilyFundCard.tsx` — warm savings-jar aesthetic, NOT bank ledger
- `TaskBoard.tsx` — kanban-lite (To Do / Doing / Done)
- `TaskCard.tsx` — individual task with assignee chip
- `SharedFamilyCalendar.tsx` — week default / 3-day mobile
- `CooperativePurchasingPanel.tsx` — horizontal rail of shared buys
- `LinkedMembersRail.tsx` — avatar chips with role badges
- `FamilyActivityFeed.tsx` — human-language entries

## CRITICAL DESIGN RULES

- **Fund card = savings-jar warmth**, NOT ledger accounting. Show amount, goal, contributors as chips.
- **Overdue tasks = amber**, NEVER red. No "failed" / "missed" language. Use "waiting" / "still open".
- **Children display XP only** — NEVER ADAPT score. ADAPT on kids is BANNED.
- **Activity feed uses human language**: "Maya completed [Task]" / "Fund received $20 from Dad" — NEVER "user_id 42 updated record".
- **Guardian badge** on parent chips. Children chips show XP only.

## MOBILE

- Stack vertical: Hero → FamilyFundCard → TaskBoard → Calendar (3-day) → Purchasing → Members → Activity
- StickyMobileCTA: "Open Family Fund"

## DATA

- Use existing K130 Family Table schema (`families`, `family_members`, `family_tasks`, `family_fund_entries`, `family_calendar_events`)
- XP on child accounts pulls from existing XP system
- Guardian status from `family_members.role = 'guardian'`

## BANNED (pre-completion check)

- NO ADAPT display on child members
- NO red states / failure language
- NO bank-ledger aesthetic on Family Fund
- NO surveillance framing on task board
- NO "upgrade/premium/unlock"
- NO LLC / CEO / invest language
- NO demographic intake beyond existing guardian/child role

## ACCEPTANCE

- [ ] Route `/family-table` wired in AppSidebar
- [ ] Hero copy matches spec EXACTLY
- [ ] Fund card uses savings-jar aesthetic
- [ ] Task board is kanban-lite (3 columns)
- [ ] Calendar defaults to week (desktop) / 3-day (mobile)
- [ ] Children show XP ONLY, never ADAPT
- [ ] Activity feed uses human-language entries
- [ ] Overdue tasks are amber, never red
- [ ] Guardian badges render on parent chips
- [ ] `data-tour-target="family-table"` anchor placed
- [ ] Mobile: vertical stack, StickyMobileCTA
- [ ] `npm run build` passes
- [ ] Tracker: `assignee='K314'`, `in_progress` → `review`
- [ ] Librarian `update_session` K314
- [ ] Screenshots → `BISHOP_DROPZONE/99_Misc/PHASE_4_VISUAL_REVIEW_B080/`

## DO NOT

- Do not show ADAPT on child accounts under any circumstance
- Do not use red for overdue anything
- Do not create new database tables (K130 schema is complete)
- Do not expose full financial ledger mechanics

---

*Bishop B080 — Phase 4 page 1 of 6 — Family Table Hub — OPENS Community & Governance*
*Warm household workspace. XP-only for kids. Human-language activity feed.*
*FOR THE KEEP!*
