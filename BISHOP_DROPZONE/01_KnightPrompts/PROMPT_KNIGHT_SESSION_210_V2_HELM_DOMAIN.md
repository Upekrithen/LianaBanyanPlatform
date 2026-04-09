# KNIGHT SESSION 210 — v2 Helm Domain Migration
## Priority: MEDIUM | Source: Bishop B056 Domain Audit
## Prerequisite: K209 (Currency) complete + K211 (FocusShell) complete
## Design Reference: `platform-v2/src/app/FOCUS_SHELL_DESIGN_SPEC.md` (Pawn's UI/UX audit)

---

## CONTEXT

Helm is the member's personal space — their home dashboard, bookshelf, trail map, and action center. It's the first page a logged-in member sees. In v1, Helm is a thin UI layer over other domain data (membership status, credit balance, recent activity, content queue). In v2, it becomes a proper domain with its own tables, hooks, and orchestration logic.

**Key rule**: One Helm per member, many Bridges per project. Helm = personal. Bridge = project control panel.

---

## V1 INVENTORY (from deep audit)

### Tables (2)
- `helm_card_slots` — configurable dashboard card positions
- `helm_input_preferences` — user input/display preferences

### Pages (4)
HelmPage (main), TheHelm (variant), HelmContentCenter (content review), HelmActionsPage (actions/commands)

### Components (4)
HelmCompact (sidebar widget), HelmContentLibrary (searchable queue), crows-nest/TrailMap (navigation), DiscoveryBookshelf (content discovery)

### Hooks (1)
useHelmCards — card slot data

---

## V2 MODULE STRUCTURE

```
platform-v2/src/domains/helm/
├── pages/
│   ├── HelmPage.tsx              # Main member dashboard (AppShell)
│   ├── TrailMapPage.tsx          # Discovery trail map (AppShell)
│   ├── BookshelfPage.tsx         # Content bookshelf (AppShell)
│   └── HelmActionsPage.tsx       # Quick actions & settings (AppShell)
├── components/
│   ├── HelmDashboard.tsx         # Dashboard layout with card slots
│   ├── HelmCard.tsx              # Individual dashboard card (configurable)
│   ├── HelmCompact.tsx           # Sidebar widget version
│   ├── TrailMap.tsx              # Trail Map visualization
│   ├── Bookshelf.tsx             # Bookshelf browser with categories
│   ├── QuickActions.tsx          # Action buttons panel
│   └── WelcomeWidget.tsx         # Personalized greeting + status
├── hooks/
│   ├── useHelm.ts                # Orchestrates all Helm data from other domains
│   ├── useHelmCards.ts           # Card slot configuration
│   └── useTrailMap.ts            # Trail map progress tracking
├── lib/
│   ├── helmTypes.ts              # Types
│   ├── helmCards.ts              # Default card configurations
│   └── trailMapEngine.ts        # Trail map path calculation
├── routes.tsx
└── index.ts
```

---

## KEY DESIGN DECISIONS

### 1. Helm Orchestrates, Doesn't Own
Helm imports from other domains to build its dashboard:

```tsx
import { useMembership } from '../membership';
import { useWallet } from '../currency';
import { useOnboarding } from '../onboarding';
// Future: import from content, outreach, commerce, etc.
```

The `useHelm()` hook composes these into a single dashboard state.

### 2. Configurable Card Slots
Members can customize which cards appear on their dashboard:
- Wallet balance card (from currency)
- Membership status card (from membership)
- Recent activity card (from helm)
- Content queue card (from content)
- Trail map progress card (from helm)
- Quick actions card (from helm)

Default layout provided; user can reorder/hide.

### 3. Trail Map = Discovery Journey
Shows what the member has explored, what's available, recommended next steps. Pulls from `user_feature_discovery` (content domain) and `treasure_map_progress` (beacon domain).

### 4. Bookshelf = Content Library
Saved articles, papers, letters. Pulls from `cephas_content_registry` (content domain). Categories: Papers, Articles, Pudding, Letters, Innovations, Vault.

### 5. All Pages Use AppShell
Helm is always a logged-in workspace experience. No FocusShell pages.

---

## BUILD STEPS

1. Read schemas: `get_schema("helm_card_slots")`, `get_schema("helm_input_preferences")`
2. Create v2 migration: `00004_v2_helm.sql` (helm_card_slots + helm_preferences)
3. Build `useHelm()` orchestration hook that composes membership + currency + onboarding
4. Build configurable HelmDashboard with draggable card slots
5. Build TrailMap and Bookshelf
6. Wire routes: `/helm`, `/helm/trail-map`, `/helm/bookshelf`, `/helm/actions`
7. Export: `useHelm`, `HelmCompact`, `helmRoutes`

---

## MANDATORY: REBUILD LIBRARIAN INDEXES

**Every session must end with this.** No exceptions.

```bash
cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js
```

---

## VERIFICATION

1. `npm run build` passes
2. `/helm` shows personalized dashboard with card slots
3. Cards pull real data from membership + currency hooks
4. Trail map shows discovery progress
5. Bookshelf shows saved content
6. `get_migration_status("helm")` shows v2 pages > 0
7. Librarian indexes rebuilt

---

*Bishop B056 — v2 Helm Domain*
*One Helm per member. Many Bridges per project.*
*The member's home base.*
*FOR THE KEEP!*
