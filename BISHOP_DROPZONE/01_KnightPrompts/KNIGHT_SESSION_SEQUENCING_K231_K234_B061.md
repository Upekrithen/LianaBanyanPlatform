# KNIGHT SESSION SEQUENCING — K231-K234
## Bishop B061 | April 2, 2026
## Completing the v2 migration + Counter-Vote integration

---

## CURRENT STATE

K224: Defense (COMPLETE)
K225: Vehicle enhancements (COMPLETE)
K226-K230: [Founder-managed sessions — completed]

**Remaining un-migrated domains**: beacon, calendar, political, vehicle (v2 structure)
**Note**: K225 enhanced v1 vehicle pages but did NOT create the v2 domain folder structure. Vehicle still needs v2 migration.

**Also**: admin (cross-cutting, 3 edge functions, 0 pages) and initiatives (empty) — likely don't need domain folders.

---

## K231 — BEACON + CALENDAR V2 DOMAIN MIGRATION

**Priority**: HIGH (19/23 after this session)
**Estimated time**: 60-90 minutes

Full prompt: `BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION_226_BEACON_CALENDAR_V2.md`
*(Note: written as K226 but renumbered to K231)*

**Beacon**: 6 tables, 1 edge function, 4 pages → 4 v2 pages, 4 components, 2 hooks, 2 libs
**Calendar**: 2 tables, 3 edge functions, 1 page → 2 v2 pages, 5 components, 2 hooks, 2 libs

---

## K232 — POLITICAL + VEHICLE V2 DOMAIN MIGRATION

**Priority**: HIGH (21/23 after this session)
**Estimated time**: 60-90 minutes

Full prompt: `BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION_227_POLITICAL_VEHICLE_V2.md`
*(Note: written as K227 but renumbered to K232)*

**Political**: 1 table, 1 edge function, 3 pages → 4 v2 pages, 5 components, 2 hooks, 2 libs
**Vehicle**: 2 tables, 0 edge functions, 3 pages → 4 v2 pages, 6 components, 2 hooks, 2 libs

**ADDITION**: Integrate Counter-Vote (#2130) into Political domain:
- Add `position` column to `member_bill_tracking` table
- Add `trigger_source` column (unsolicited_text, mailer, ad, news, organic)
- Create `bill_position_aggregates` view
- Build `CounterVotePanel.tsx` component — FOR/AGAINST toggle on bill cards
- Wire position-to-letter pipeline in Write Your Rep flow

---

## K233 — LIBRARIAN INDEX REBUILD + MCP RESTART

**Priority**: HIGH
**Estimated time**: 5 minutes

Full prompt: `BISHOP_DROPZONE/PROMPT_KNIGHT_SESSION_225_LIBRARIAN_MCP_RESTART.md`
*(Note: written as K225 but renumbered to K233)*

After K231-K232 complete:
1. Rebuild indexes: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`
2. Restart MCP server (toggle in Claude Desktop settings)
3. Verify: 21/23 migrated, Counter-Vote schema in indexes

---

## K234 — GAMING SESSIONS 2-8 (START)

**Priority**: MEDIUM
**Estimated time**: Multiple sessions

K223 built Gaming Session 1 (6 pages, 17 files, NOT wired). Sessions 2-8 remain. This is 7 sessions of work — start with Session 2 in K234.

---

## POST-K234 LANDSCAPE

| Category | Status |
|----------|--------|
| v2 migrated | 21/23 (admin + initiatives are non-standard) |
| Gaming | Session 2 of 8 complete |
| Counter-Vote | Integrated into Political domain |
| Librarian | Fresh indexes, 21/23 showing |
| Remaining Knight work | Gaming Sessions 3-8, admin assessment, wiring passes |

---

*Knight Session Sequencing K231-K234 — Bishop B061*
*FOR THE KEEP!*
