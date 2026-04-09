# Knight Session K357 — 72-Hour Escrow Auto-Release
# Bishop B086 | Priority: HIGH | Depends on: K355 (Luis Test DEPLOYED)

## CONTEXT
The project_escrow_ledger table (migration 20260323000028) holds funds in 'held' status until verification. Currently, release requires manual action. The platform needs a 72-hour auto-release mechanism: if a funder doesn't dispute within 72 hours of deposit, funds auto-release to the project owner.

The roommate escrow system (process-roommate-escrow) already has a cron pattern — follow the same architecture.

## WHAT TO BUILD

### 1. SQL Function: `auto_release_escrow()`
```sql
CREATE OR REPLACE FUNCTION auto_release_escrow()
RETURNS TABLE(escrow_id UUID, project_id UUID, amount_cents INTEGER, action TEXT) AS $$
BEGIN
  RETURN QUERY
  WITH releasable AS (
    SELECT pel.id, pel.project_id, pel.amount_cents, pel.contribution_id,
           p.owner_id as project_owner
    FROM project_escrow_ledger pel
    JOIN projects p ON p.id = pel.project_id
    WHERE pel.status = 'held'
      AND pel.deposited_at < now() - interval '72 hours'
      AND NOT EXISTS (
        SELECT 1 FROM escrow_disputes ed
        WHERE ed.escrow_id = pel.id AND ed.status = 'open'
      )
  )
  UPDATE project_escrow_ledger pel
  SET status = 'released',
      released_at = now(),
      released_to = r.project_owner,
      notes = COALESCE(notes, '') || ' | Auto-released after 72h (no dispute)'
  FROM releasable r
  WHERE pel.id = r.id
  RETURNING pel.id as escrow_id, pel.project_id, pel.amount_cents, 'auto_released' as action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Escrow Disputes Table
```sql
CREATE TABLE IF NOT EXISTS escrow_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES project_escrow_ledger(id),
  disputant_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
```
RLS: disputant can create/read own disputes. Project owner can read disputes on their escrow. Admin manages all.

### 3. Edge Function: `process-escrow-auto-release`
- Calls `auto_release_escrow()` RPC
- Logs results to `cron_job_log` (job_name: 'escrow-auto-release')
- Returns count of released, total amount
- Schedule: every 6 hours via pg_cron (`0 */6 * * *`)

### 4. UI: Escrow Countdown on AdminEscrowDashboard
- For each 'held' escrow entry, show countdown timer: "Auto-releases in X hours"
- "Dispute" button for funders — opens modal, creates escrow_disputes record
- "Force Release" button for admin — immediate release
- Disputes section: list open disputes with resolve/dismiss actions

### 5. Notification on Release
- When escrow auto-releases, insert a notification for the project owner:
  ```sql
  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (project_owner, 'escrow_released', 'Funds Released',
          'Escrow for [project_name] auto-released after 72 hours',
          jsonb_build_object('project_id', project_id, 'amount_cents', amount_cents));
  ```

## FILES TO CREATE/MODIFY
- `platform/supabase/migrations/YYYYMMDDHHMMSS_k357_escrow_auto_release.sql`
- `platform/supabase/functions/process-escrow-auto-release/index.ts`
- Modify `platform/src/pages/AdminEscrowDashboard.tsx` — add countdown + dispute button + force release
- Add dispute modal component if not inline

## CONSTRAINTS
- 72-hour window is HARD — do not make configurable (platform rule)
- Open disputes BLOCK auto-release until resolved
- All releases log to cron_job_log for audit trail
- Follow process-roommate-escrow pattern for Edge Function structure
- Amount display: always show dollar amounts (amount_cents / 100), never raw cents in UI

## DONE WHEN
- [ ] auto_release_escrow() function works correctly
- [ ] escrow_disputes table created with proper RLS
- [ ] Edge Function scheduled and runs every 6 hours
- [ ] AdminEscrowDashboard shows countdown timers
- [ ] Disputes block auto-release
- [ ] Notifications fire on release
- [ ] No held escrow older than 72h remains un-released (unless disputed)
