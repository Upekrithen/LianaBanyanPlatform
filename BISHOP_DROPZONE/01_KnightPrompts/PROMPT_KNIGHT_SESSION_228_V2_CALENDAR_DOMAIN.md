# KNIGHT SESSION 228 — v2 Calendar Domain Migration
## Priority: LOW | Complexity: LOW (2 sessions)

---

## V1 INVENTORY
- **Tables (2)**: calendar_events (17 cols — 7 types: personal/family/business/coalition/route/defense/education, 6 source_types, recurrence_rule, metadata JSONB), calendar_shares (6 cols — permission levels: view/edit)
- **Edge Functions (3)**: calendar-create-event (recurrence, attendees, reminders), calendar-sync-google (Google Calendar), calendar-sync-commerce (auto-events from orders/cutoffs/delivery)
- **Pages (1)**: Calendar (FullCalendar-powered, Calendar Plug Interface, role-based source activation)
- **Components (1)**: family/FamilyCalendar (Google Calendar integration)
- **Hooks (1)**: useCalendarSources (pluggable source system)

## V2 STRUCTURE
```
platform-v2/src/domains/calendar/
├── pages/
│   └── CalendarPage.tsx            # Full calendar view (AppShell)
├── components/
│   ├── CalendarView.tsx            # FullCalendar wrapper
│   ├── EventCreator.tsx            # Create event (7 types)
│   ├── SourceSelector.tsx          # Pluggable source activation
│   └── FamilyCalendar.tsx          # Family-specific view
├── hooks/
│   ├── useCalendar.ts, useCalendarSources.ts
├── lib/
│   ├── calendarTypes.ts, eventTypes.ts (7 types), sourcePlugins.ts (6 sources)
├── routes.tsx
└── index.ts
```

## KEY RULES
- 7 event types: personal, family, business, coalition, route, defense, education
- 6 source types: storefront, coalition, platform, route, crew, role-based defaults
- Google Calendar sync is optional integration
- Commerce sync auto-creates events from orders
- Calendar Plug Interface: each domain can register event sources

## MANDATORY: `cd librarian-mcp && npx tsc && node dist/indexer/buildIndex.js`

*FOR THE KEEP!*
