-- Migration: Switch user-scoped views from SECURITY DEFINER to SECURITY INVOKER
--
-- The Supabase Security Advisor flagged 28 views using SECURITY DEFINER.
-- Views that only need to show a user their OWN data should use security_invoker
-- so that RLS policies are evaluated against the querying user, not the view owner.
--
-- Views KEPT as SECURITY DEFINER (aggregate/public stats that need cross-user access):
--   - v_current_transparency_metrics  (public transparency dashboard)
--   - initiative_stats                (public initiative stats)
--   - lmd_demand_summary              (public demand data)
--   - node_status_dashboard           (public node status)
--   - defense_klaus_cold_start_stats  (admin stats)
--   - defense_klaus_daisy_chain_stats (admin stats)
--
-- Views changed to SECURITY INVOKER (user-scoped, RLS should apply):
--   - gift_list_items_for_owner       (user's own gift list)
--   - gift_list_items_for_family      (user's family gift list)
--   - member_reputation_stability     (user's own reputation)
--   - sponsorship_cascade_view        (user's sponsorship data)
--   - gate_lintels                    (user's gate/access data)

ALTER VIEW public.gift_list_items_for_owner SET (security_invoker = on);

ALTER VIEW public.gift_list_items_for_family SET (security_invoker = on);

ALTER VIEW public.member_reputation_stability SET (security_invoker = on);

ALTER VIEW public.sponsorship_cascade_view SET (security_invoker = on);

ALTER VIEW public.gate_lintels SET (security_invoker = on);
