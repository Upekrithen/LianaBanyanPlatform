# Knight Task Assignment — Session 8J
**Date:** March 10, 2026
**From:** Bishop (Claude Desktop)
**To:** Knight (Cursor / Roo Code)
**Priority:** HIGH

---

## DELIVERABLE

All code changes committed and pushed. Filename for handoff notes: **`KNIGHT_HANDOFF_SESSION_8J.md`** in `BISHOP_DROPZONE/`.

**Rules:**
- Zero TypeScript errors when done (`npx tsc --noEmit`)
- Build must pass (`npm run build`)
- SEC language rules: No "invest", "equity", "ROI", "shares", "dividend", "profit", "ownership" in ANY user-facing text (UI labels, strings, aria-labels, tooltips, placeholders)
- Commit after each task — don't batch everything into one commit

---

## Task 1: Fix Crow's Nest Sweet Sixteen Content (CRITICAL)

**File:** `platform/src/data/crowsNestItems.ts`

**Problem:** The `sweet_sixteen` section contains wrong items. It currently lists:
```
hexisle, c-plus-20, ghost-world, cue-cards, lets-make-dinner,
lets-make-bread, rally-group, jukebox, household-concierge, vsl,
harper-guild, power-to-the-people, family-table, defense-klaus,
health-accords, seed-the-quan
```

**The canonical Sweet Sixteen (from `SWEET_SIXTEEN_CANONICAL.md`) is:**
1. `lets-make-dinner` — Let's Make Dinner (Community Kitchen)
2. `lets-get-groceries` — Let's Get Groceries (Grocery Co-op)
3. `lets-go-shopping` — Let's Go Shopping (Marketplace)
4. `household-concierge` — Household Concierge (Shared Butler)
5. `family-table` — The Family Table (PRIVATE family ops)
6. `health-accords` — Health Accords (Wellness)
7. `msa` — MSA / Medical Savings Accounts
8. `defense-klaus` — Defense Klaus (Legal/Advocacy)
9. `rally-group` — Rally Group (Community Support)
10. `vsl` — VSL / Voucher Short Loans
11. `lets-make-bread` — Let's Make Bread (Business Incubator)
12. `harper-guild` — Harper Guild (Ethics Checkers/Truth-Tellers)
13. `jukebox` — JukeBox (Music Licensing / One Take Wonders)
14. `didasko` — Didasko (Education)
15. `power-to-the-people` — Power to the People (Political Expedition)
16. `brass-tacks` — Brass Tacks (Manufacturing/Hardware)

**Steps:**
1. **Remove these 5 from the `sweet_sixteen` items array:** `hexisle`, `c-plus-20`, `ghost-world`, `cue-cards`, `seed-the-quan`
2. **Add these 5 to the items array:** `lets-get-groceries`, `lets-go-shopping`, `msa`, `didasko`, `brass-tacks`
3. **Create `CrowsNestItem` entries** for the 5 missing initiatives. Each needs:
   - `id`: the key from the list above
   - `title`: initiative name
   - `subtitle`: short tagline
   - `icon`: appropriate Lucide icon name
   - `depths`: at least Glimpse + Peek + Tell Me More levels
   - `tags`: relevant keywords
   - SEC-safe language throughout

**Content guidance for the 5 new items:**

| Initiative | Tagline | Key Points |
|---|---|---|
| **Let's Get Groceries** | "Grocery Co-op" | Bulk purchasing power. Cost+20% on groceries. Member-owned distribution. Same-day local delivery network. Credits/Marks accepted. |
| **Let's Go Shopping** | "The Cooperative Marketplace" | Etsy-style marketplace but cooperative. Creators keep 83.3%. No algorithm manipulation. Quality curation by Harper Guild. Cross-initiative product listings. |
| **MSA** | "Medical Savings Accounts" | NOT insurance — savings accounts for medical expenses. Affordable services at Cost+20%. Community health network. Marks accepted for essential care. Preventive care incentives. |
| **Didasko** | "Education" | Learn and teach on the same platform. Earn Marks while learning (study bounties). Community-driven courses. Skill certification through peer validation. Academic bounties for research. |
| **Brass Tacks** | "Manufacturing & Hardware" | Getting things physically made. Distributed manufacturing network. Connects with HexIsle printers. Quality assurance through test-pilot program. From prototype to production at Cost+20%. |

4. **Relocate displaced items** to appropriate sections:
   - `hexisle` → should already be in "world" section (verify, don't duplicate)
   - `c-plus-20` → should be in "platform_mechanics" or "economics" section
   - `ghost-world` → should be in "getting_started" or "platform_mechanics"
   - `cue-cards` → remove entirely if no matching CrowsNestItem exists, or create one in "getting_started"
   - `seed-the-quan` → should be in "platform_mechanics" or "world"

**CRITICAL:** Do NOT delete the actual `CrowsNestItem` objects for displaced items — just move their IDs to the correct section's items array. If they don't have item objects yet, that's fine — leave the ID and it'll render as a placeholder until content is added.

**Verification:** After changes, the `sweet_sixteen` section should have exactly 16 items matching the canonical list.

---

## Task 2: Remaining Lovable Reference Cleanup

**File:** `platform/public/LIANA_BANYAN_BUSINESS_PLAN.md`

**Problem:** Line 922 still says `**Hosting**: Lovable Cloud`

**Fix:** Change to `**Hosting**: Firebase (8 targets) + Supabase`

**Also verify** these files are already clean (Knight 8H should have fixed them, but confirm):
- `platform/README.md` — should have no "Lovable" mentions
- `platform/docs/DEPLOYMENT_STRATEGY.md` — should have no "Lovable" mentions
- `platform/docs/MULTI_TENANT_SETUP.md` — should have no "Lovable" mentions

**Do NOT touch** (these are intentional):
- `platform/src/utils/subdomainRouter.ts` — `.lovable.app` domain filter (legacy routing)
- `platform/src/integrations/supabase/types.ts` — `lovable_project_url` DB column
- `platform/src/components/MercuryBankBalance.tsx` — historical migration comment
- Any SQL migration files — historical records

---

## Task 3: Internal `participation` → `participation` Variable Rename (PHASE 1: Safe Renames)

**Context:** Rook's 8H audit found 15+ files using `participation` as internal variable/property names. The user-facing labels already say "participation" but the internal code says "participation." This is a defensive cleanup — if any of these values leak to the UI (e.g., in an error message, debug panel, or analytics export), it would be an SEC violation.

**PHASE 1 (this session):** Rename variables that are purely internal (no DB column dependency). **DO NOT** rename anything that is a DB column value or enum — that requires a migration first.

**Safe to rename (variables and object properties only):**

| File | Current | Rename To |
|---|---|---|
| `useRealTimeCalculations.tsx` | `equityPercentages` | `participationPercentages` |
| `ContractCompensationConfigManager.tsx` | `minEquityRatio`, `maxEquityRatio` | `minParticipationRatio`, `maxParticipationRatio` |
| `ContractAssignmentSimulator.tsx` | `equityRatio`, `equityAmount`, `calculatedEquityRatio` | `participationRatio`, `participationAmount`, `calculatedParticipationRatio` |
| `PositionAssignmentDialog.tsx` | `originalEquity`, `adjustedEquity` | `originalParticipation`, `adjustedParticipation` |
| `Simulator.tsx` | `equityPercentage`, `equityValue` | `participationPercentage`, `participationValue` |
| `IPAssetForm.tsx` | `equitySplits` | `participationSplits` |
| `CompanyIndependenceManager.tsx` | `equityBonus` | `participationBonus` |
| `BrowseBusiness.tsx` | `avgEquity` | `avgParticipation` |
| `RealTimeUserStats.tsx` | references to `equityPercentages` | match the hook rename |
| `VotingConfigManager.tsx` | HTML ids `minEquity`/`maxEquity` | `minParticipation`/`maxParticipation` |

**Also update HTML id attributes** that contain "participation" — these can appear in DOM and be seen via browser dev tools.

**DO NOT RENAME (DB-dependent — needs migration first):**
- `compensation_type === 'participation'` comparisons (this is a DB enum value)
- `<SelectItem value="participation">` (sends value to DB)
- XML tag names in `SampleDataXML.tsx` (these are data format definitions)
- `externalServiceGateway.ts` Wefunder `campaign_type: 'participation'` (external API value)
- `CreateDerivativeProjectDialog.tsx` `parent_equity_share` (DB column name)

**For the DB-dependent ones:** Add a comment `// TODO(SEC-RENAME): rename after DB migration` so they're trackable.

**Verification after rename:**
1. `npx tsc --noEmit` — zero errors
2. `npm run build` — succeeds
3. Grep for `participation` — only DB-dependent refs should remain, all tagged with `TODO(SEC-RENAME)`

---

## Task 4: Proteus Anchor System Stub (If Time)

**Context:** Innovation #1553 — the Proteus Anchor System. See `BISHOP_DROPZONE/INNOVATION_1553_PROTEUS_ANCHOR.md` for the full spec.

**If time permits** after Tasks 1-3, create:
- A route at `/proteus-anchor` or integrate into the HexIsle section
- A basic landing page showing the concept (even if just a spec page with diagrams)
- Link it from the Crow's Nest under the "world" or "hexisle" section

This is a stretch goal — Tasks 1-3 are the priority.

---

## Build/Deploy Checklist

After all tasks:
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — succeeds
- [ ] Commit each task separately with descriptive messages
- [ ] Push to origin
- [ ] Deploy: `npx firebase deploy --only hosting` (all 8 targets)
- [ ] Create `KNIGHT_HANDOFF_SESSION_8J.md` in BISHOP_DROPZONE listing what was done

---

## Reference: SEC-Safe Language Rules

| NEVER Use | Use Instead |
|---|---|
| invest | sponsor / contribute / back |
| participation | participation / service allocation |
| contribution impact / returns | service value / utility benefit |
| units / ownership | membership participation / service units |
| profit / distribution | platform benefit / service credit |
| convertible note | REMOVE completely |

---

## Context

- Platform root: `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\`
- Latest commit: `a0aa35c` (March 10, 2026)
- All 23 milestones complete — this is cleanup/hardening work
- Tech stack: React 18 / Vite / TypeScript / shadcn/ui / Supabase / Firebase
- Canonical initiative list: `SWEET_SIXTEEN_CANONICAL.md` in project root
