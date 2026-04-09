# KNIGHT SESSION 229-230 — v2 Admin + Initiatives Domains
## Priority: LOW | Complexity: LOW-MEDIUM (2-3 sessions each)
## Combined into one prompt — both are small supporting domains

---

## DOMAIN: ADMIN (K229)

### V1 INVENTORY
- **Tables (2)**: admin_notifications (event_type, severity, actor_id, read status), transaction_ledger (shared with financial)
- **Edge Functions (2)**: admin-notify (7 event types — new_user, dispute, campaign_complete, rls_violation, founder_override, edge_function_error, high_value_transaction; email for high/critical), admin-notifications (CRUD)
- **Pages (7)**: AdminEscrowDashboard, AdminAnalytics (privacy-first, Innovation #1548), AdminServiceReview, SwoopAdminPage, XRayFeedbackAdmin, ShowcaseAdminPage, AdminProject
- **Components (2)**: SocialMediaAdmin, SwoopAdminDashboard

### V2 STRUCTURE
```
platform-v2/src/domains/admin/
├── pages/
│   ├── AdminDashboardPage.tsx      # Main admin hub (AppShell)
│   ├── AdminEscrowPage.tsx         # Escrow holds/releases
│   ├── AdminAnalyticsPage.tsx      # Privacy-first analytics
│   ├── AdminServiceReviewPage.tsx  # Flagged content review
│   └── AdminNotificationsPage.tsx  # Notification management
├── components/
│   ├── NotificationCard.tsx, EscrowHoldPanel.tsx, ServiceReviewCard.tsx
├── hooks/
│   ├── useAdminNotifications.ts, useAdminEscrow.ts, useAdminAnalytics.ts
├── lib/
│   ├── adminTypes.ts, notificationRules.ts (7 event types, 4 severity levels)
├── routes.tsx
└── index.ts
```

### KEY RULES
- Privacy-first analytics (Innovation #1548) — no individual tracking
- 7 notification event types with 4 severity levels (low/med/high/critical)
- Email sent automatically for high/critical severity
- All pages AppShell, admin-gated

---

## DOMAIN: INITIATIVES (K230)

### V1 INVENTORY
- **Tables**: 0 (initiatives are metadata over other domain tables)
- **Pages (3+)**: InitiativePage, InitiativeProjectsPage, JukeboxInitiative
- **Components**: cephas/InitiativeCard, the300/PedestalCard, cold-start/LocalColdStartDashboard

### V2 STRUCTURE
```
platform-v2/src/domains/initiatives/
├── pages/
│   ├── InitiativesPage.tsx         # Initiative listing (AppShell)
│   ├── InitiativeDetailPage.tsx    # Individual initiative view
│   └── JukeboxPage.tsx             # Jukebox initiative
├── components/
│   ├── InitiativeCard.tsx, InitiativeGrid.tsx, InitiativeProgress.tsx
├── hooks/
│   ├── useInitiatives.ts
├── lib/
│   ├── initiativeTypes.ts, initiativeRegistry.ts (16 initiatives)
├── routes.tsx
└── index.ts
```

### KEY RULES
- 16 initiatives (Let's Make Dinner, Ghost World, HexIsle, Treasure Map, etc.)
- Initiatives are orchestration over other domain tables — no own tables
- This domain contains listing/routing, NOT implementations (those live in their respective domains)
- Initiative registry maps to domain routes

## MANDATORY FOR BOTH: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
