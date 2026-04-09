# KNIGHT SESSION 218 — v2 Guild Domain Migration
## Priority: MEDIUM | Source: Bishop B057 Domain Audit
## Prerequisite: K209 (Currency — Marks staking for guild membership)
## Note: Guild = professional. Tribe = personal. MANY of each per member.

---

## CONTEXT

Guild is the 11th v2 domain — professional communities. Guilds are professional organizations where members share a trade, skill, or industry. Tribes are personal communities (family, neighborhood, interest group). Members can belong to MANY Guilds and MANY Tribes. This domain includes guild formation, staking, the Harper Guild (governance oversight), and tribe formation. Family-type Tribes connect to the Family Table.

**KEY RULES:**
- Guild = professional. Tribe = personal. Never confuse them.
- MANY Guilds per member. MANY Tribes per member. Not one-to-one.
- Guild stake = Marks commitment (one-time, non-refundable)
- Harper Guild = special governance guild that provides oversight for Areopagus

---

## V1 INVENTORY (from B056 deep audit)

### Tables (11+ across 14 migrations)
- `guilds` (30 cols) — guild definitions
- `guild_members` (5 cols) — member ↔ guild link
- `guild_memberships` (8 cols) — membership tracking with tribe FK
- `guild_membership_history` (9 cols) — audit trail
- `guild_representatives` — elected guild reps
- `guild_charters` — guild founding documents
- `guild_connections` — inter-guild relationships
- `guild_name_types` — naming taxonomy
- `user_guild_progression` — advancement tracking
- `guild_stake_payments` — Marks staking records
- `guild_investment_fund` — guild treasury
- `guild_sponsorship_records` — sponsorship tracking
- Plus tribe tables: `tribes`, `tribe_memberships`

### Edge Functions (2)
- `verify-guild-stake-payment` — verify Marks stake
- `create-guild-stake-checkout` — Stripe checkout for guild stake

### Pages (6)
Guilds (listing), GuildDetail, GuildHub, GuildPhaseManager, GuildStakeSuccess, HarperGuildPage

### Components (7)
GuildCreationDialog, GuildFormationWizard, GuildReentryCalculator, GuildStakeProgression, TribeGuildContextualPrompt, TribeFormationWizard, NavigateToGuilds

### Hooks (1)
useGuilds

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/guild/
├── pages/
│   ├── GuildsPage.tsx              # Guild directory + search (AppShell)
│   ├── GuildDetailPage.tsx         # Individual guild view (AppShell)
│   ├── GuildHubPage.tsx            # Member's guild management (AppShell)
│   ├── GuildFormationPage.tsx      # Create a new guild (AppShell)
│   ├── HarperGuildPage.tsx         # Harper Guild governance (AppShell)
│   ├── TribesPage.tsx              # Tribe directory (AppShell)
│   └── TribeDetailPage.tsx         # Individual tribe view (AppShell)
├── components/
│   ├── GuildCard.tsx               # Guild listing card
│   ├── GuildFormationWizard.tsx    # Multi-step guild creation
│   ├── GuildStakeForm.tsx          # Marks staking for membership
│   ├── GuildStakeProgression.tsx   # Stake progress visualization
│   ├── GuildCharter.tsx            # Charter display/editor
│   ├── GuildRepresentatives.tsx    # Elected rep display
│   ├── TribeCard.tsx               # Tribe listing card
│   ├── TribeFormationWizard.tsx    # Multi-step tribe creation
│   └── GuildTribeContextPrompt.tsx # Contextual "join a guild/tribe" prompt
├── hooks/
│   ├── useGuilds.ts               # Guild listing + search
│   ├── useGuildDetail.ts          # Single guild state
│   ├── useGuildStake.ts           # Staking flow
│   ├── useTribes.ts               # Tribe listing + search
│   └── useGuildProgression.ts     # Member advancement tracking
├── lib/
│   ├── guildTypes.ts              # Types (Guild, Tribe, GuildMembership, TribeMembership)
│   ├── guildFormation.ts          # Formation requirements + rules
│   ├── stakeRules.ts              # Marks staking rules (one-time, non-refundable)
│   └── harperGuild.ts             # Harper Guild special rules
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

1. **Guilds AND Tribes in one domain.** They share the same membership pattern (many-to-many), formation wizard pattern, and directory pattern. The distinction is purpose: Guild = professional, Tribe = personal.

2. **Guild stake = Marks commitment.** One-time, non-refundable. Creates skin-in-the-game for guild membership. Checkout via Stripe (create-guild-stake-checkout).

3. **Harper Guild is special.** It provides governance oversight for the Areopagus dispute resolution system. It has unique rules and elevated responsibilities.

4. **Family-type Tribe connects to Family Table.** If a tribe is type "family," it links to the family domain's tables (family_members, family_events, etc.).

5. **Guild Reentry Calculator.** If a member leaves a guild, the calculator shows what it costs to rejoin (stake penalty).

6. **All pages AppShell** — guilds/tribes are member-facing operations.

---

## BUILD STEPS

1. Use Librarian: `get_schema("guilds")`, `get_schema("guild_members")`, `get_schema("guild_memberships")`
2. Build GuildsPage directory first, then GuildDetailPage
3. Port formation wizards for both guilds and tribes
4. Build staking flow connected to currency domain
5. Wire routes, export API, register in AppRouter

---

## IMPORTS FROM OTHER DOMAINS

```tsx
import { useMembership } from '../membership';
import { useMarks } from '../currency';
// Guild staking requires Marks balance check
```

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/guilds` shows directory with search
3. `/guilds/:id` shows guild detail with members + charter
4. `/guilds/new` shows formation wizard
5. Guild stake form checks Marks balance
6. `/tribes` shows tribe directory
7. `get_migration_status("guild")` shows v2 pages > 0
8. Librarian indexes rebuilt

---

*Bishop B057 — v2 Guild Domain*
*Professional Guilds + Personal Tribes + Harper Guild oversight*
*MANY of each per member. Never one-to-one.*
*FOR THE KEEP!*
