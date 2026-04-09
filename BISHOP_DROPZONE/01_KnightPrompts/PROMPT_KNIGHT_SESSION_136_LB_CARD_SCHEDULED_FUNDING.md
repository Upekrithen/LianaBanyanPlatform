# KNIGHT SESSION 136 — Scheduled LB Card Funding
## Stripe Billing → Stripe Issuing Pipeline
**Innovations:** #2008, #2009 | **Bishop:** 035 | **Date:** March 27, 2026

---

## CONTEXT
The LB Card is a Stripe Issuing prepaid card. This session adds the ability for ANYONE (parent, employer, sponsor, guild, self) to set up RECURRING payments that fund a specific LB Card on a configurable schedule.

**CRITICAL RULE:** LB Card is funded with REAL MONEY via Stripe Issuing. NOT from Credits. Credits NEVER cash out to fiat. These are two completely separate systems.

Migration `20260327000007_scheduled_lb_card_funding.sql` should already exist (Bishop created it). If not, create it.

## DELIVERABLES

### Deliverable 1: Migration (if not exists)
`20260327000007_scheduled_lb_card_funding.sql`:
- lb_card_funding_schedules (funder, recipient, card_serial, stripe_subscription_id, amount, frequency, purpose, status)
- lb_card_funding_transactions (per-payment records with stripe IDs)
- lb_card_funding_sources (authorization: card owner approves who can fund their card)
- RLS + indexes

### Deliverable 2: Hooks
Create `platform/src/hooks/useLBCardFunding.ts`:
- useFundingSchedules(role: 'funder' | 'recipient') — list schedules where I'm funder or recipient
- useFundingSchedule(id) — single schedule detail
- useCreateFundingSchedule() — create new recurring funding (calls Stripe Billing API via edge function)
- usePauseFundingSchedule() — pause/resume
- useCancelFundingSchedule() — cancel
- useFundingTransactions(scheduleId?) — transaction history
- useAuthorizedFunders() — who can fund my card
- useAuthorizeFunder() — authorize someone to fund my card
- useRevokeFunder() — revoke authorization

### Deliverable 3: Edge Function — create-funding-schedule
Create `platform/supabase/functions/create-funding-schedule/index.ts`:
- Receives: funder_id, recipient_id, amount, frequency, purpose
- Validates: recipient has authorized this funder (check lb_card_funding_sources)
- Creates Stripe Billing subscription with appropriate interval
- Stores schedule in lb_card_funding_schedules
- Returns schedule + Stripe subscription details

### Deliverable 4: Edge Function — process-scheduled-funding
Create `platform/supabase/functions/process-scheduled-funding/index.ts`:
- Triggered by Stripe webhook (invoice.payment_succeeded)
- Looks up schedule by stripe_subscription_id
- Calls existing `fund-lb-card` edge function to top up the recipient's card
- Records transaction in lb_card_funding_transactions
- Updates schedule totals

### Deliverable 5: Fund My Card Page
Create `platform/src/pages/FundMyCard.tsx` at `/dashboard/fund-card`:
- **Protected route**
- Two tabs: "Fund Someone" | "My Card Funding"
- **Fund Someone tab:**
  - Search/select recipient (by name or card serial)
  - Amount input ($1-$10,000)
  - Frequency selector (daily/weekly/biweekly/monthly)
  - Purpose dropdown (rent/food/transportation/education/childcare/tools/general/other)
  - Optional note
  - "Start Funding" button → calls create-funding-schedule
- **My Card Funding tab:**
  - List of incoming funding schedules (who's funding me, how much, what for)
  - Authorize/revoke funders
  - Total monthly incoming funding summary
  - Transaction history

### Deliverable 6: Funding Dashboard Widget
Create `platform/src/components/helm/FundingWidget.tsx`:
- Compact card showing: total monthly funding (in/out), active schedules count, next funding date
- Wire into the Creator Dashboard / Helm page

### Deliverable 7: Routes + Navigation
- `/dashboard/fund-card` — FundMyCard (ProtectedRoute)
- Add "Card Funding" to Helm nav section (CreditCard icon)

### Deliverable 8: Canonical Stats
- No innovation count change (implementing existing #2008-#2009)
- productionSystems stays at 27

## RULES
- **Credits NEVER cash out to fiat. One-way valve. Irrevocable.**
- **LB Card funded SEPARATELY from Credits. REAL MONEY on prepaid card.**
- No securities language.
- C+20 constitutional floor.
- Card identified by: member account (authenticated) WITH serial number (physical ID)
- Purpose tags are informational — the card works everywhere regardless of purpose tag

## BUILD ORDER
1. Migration (verify/create) → 2. Edge Functions → 3. Hooks → 4. FundMyCard page → 5. FundingWidget → 6. Routes → 7. Stats → Build → Deploy

FOR THE KEEP!
