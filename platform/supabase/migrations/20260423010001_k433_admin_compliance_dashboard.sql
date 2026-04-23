-- K433: Admin/compliance dashboard support
-- Staff-side RLS for bad-actor dispositions and admin operations.
-- STAGED ONLY — do NOT apply until Founder is ready.

-- ============================================================================
-- Staff UPDATE policy on pedestal_applications (for dispositions)
-- ============================================================================
CREATE POLICY "app_staff_update" ON upekrithen.pedestal_applications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder')
    )
  );

-- ============================================================================
-- Staff DELETE on pedestal_applications (for rejected/cancelled cleanup)
-- Counsel may request removal of rejected applications.
-- ============================================================================
CREATE POLICY "app_staff_delete" ON upekrithen.pedestal_applications
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'founder')
    )
  );

-- ============================================================================
-- Staff INSERT on issuance_log (for disposition logging from admin panel)
-- The existing issuance_log_system_insert allows any authenticated insert;
-- this is a named policy for clarity. K431 already created the system INSERT
-- policy, so this is additive for explicit staff audit-trail writes.
-- ============================================================================
-- (Already covered by issuance_log_system_insert WITH CHECK (true) from K431)
-- No additional policy needed — staff can already INSERT.

-- ============================================================================
-- Two-track separation: NO changes to public.members or any LB-scoped table.
-- This migration touches ONLY upekrithen.* tables.
-- ============================================================================
