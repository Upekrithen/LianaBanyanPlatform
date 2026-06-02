-- Migration: 20260602000021_bp071_taste_maker_subscription_class
-- BP071 · Scope 14 · Taste-Maker Subscription Class Extension
-- Extends excalibur_subscriptions with channel_type and manager_entity_id
-- for creator/taste-maker channels and localized HOW-TO-HUB MANAGER roles.

-- ── Add channel_type to excalibur_subscriptions ──────────────────────────────
-- channel_type: 'business' (default/existing), 'creator', 'taste-maker'
-- A taste-maker is a creator (podcaster/influencer) who owns a subscription
-- channel on LianaBanyanPlatform; supporters subscribe; taste-maker earns
-- via four-currencies pass-through.

ALTER TABLE public.excalibur_subscriptions
  ADD COLUMN IF NOT EXISTS channel_type TEXT
    NOT NULL DEFAULT 'business'
    CHECK (channel_type IN ('business', 'creator', 'taste-maker'));

COMMENT ON COLUMN public.excalibur_subscriptions.channel_type IS
  'BP071/Scope-14 — Subscription channel class. '
  'business: Excalibur commercial slice (default/legacy). '
  'creator: Creator-owned subscription channel. '
  'taste-maker: Podcaster/influencer channel with four-currencies pass-through.';

-- ── Add manager_entity_id to excalibur_subscriptions ─────────────────────────
-- HOW-TO-HUB MANAGER: a localized role (like Founding-300 but local) who earns
-- via tips routed through excalibur_share_back_ledger → manager's own
-- subscription account. Payable as $ OR Marks/Credits/Joules.
-- manager_entity_id references profiles(id) of the managing member.
-- NULL = no assigned manager (valid for business/unmanaged channels).

ALTER TABLE public.excalibur_subscriptions
  ADD COLUMN IF NOT EXISTS manager_entity_id UUID
    REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.excalibur_subscriptions.manager_entity_id IS
  'BP071/Scope-14 — HOW-TO-HUB MANAGER entity. '
  'Localized per-area manager role; earns tips via four-currencies pass-through '
  'routed through excalibur_share_back_ledger → manager subscription account. '
  'Payable as USD, Marks, Credits, or Joules. NULL = no assigned manager.';

-- ── Index for manager lookups ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_excalibur_subscriptions_manager
  ON public.excalibur_subscriptions (manager_entity_id)
  WHERE manager_entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_excalibur_subscriptions_channel_type
  ON public.excalibur_subscriptions (channel_type);

-- ── RLS policy extensions ─────────────────────────────────────────────────────
-- Managers can read subscriptions they manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'excalibur_subscriptions'
      AND policyname = 'excalibur_subscriptions_manager_read'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "excalibur_subscriptions_manager_read"
        ON public.excalibur_subscriptions
        FOR SELECT
        USING (manager_entity_id = auth.uid())
    $p$;
  END IF;
END $$;
