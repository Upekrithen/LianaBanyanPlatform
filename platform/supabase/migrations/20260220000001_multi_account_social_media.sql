-- ═══════════════════════════════════════════════════════════════════════════
-- MULTI-ACCOUNT SOCIAL MEDIA MIGRATION
-- Applied: Feb 20, 2026 to ruuxzilgmuwddcofqecc (LianaBanyan direct Supabase)
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Add missing columns
ALTER TABLE public.member_social_accounts 
  ADD COLUMN IF NOT EXISTS platform_user_id TEXT,
  ADD COLUMN IF NOT EXISTS account_nickname TEXT,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- STEP 2: Set existing accounts as default (one per user/platform)
UPDATE public.member_social_accounts msa
SET is_default = true
WHERE is_active = true
  AND id = (
    SELECT id FROM public.member_social_accounts sub
    WHERE sub.user_id = msa.user_id 
      AND sub.platform = msa.platform
      AND sub.is_active = true
    ORDER BY sub.created_at ASC
    LIMIT 1
  );

-- STEP 3: Create function to enforce 6 account limit per platform
CREATE OR REPLACE FUNCTION check_social_account_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.member_social_accounts 
      WHERE user_id = NEW.user_id 
        AND platform = NEW.platform 
        AND is_active = true
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
     ) >= 6 THEN
    RAISE EXCEPTION 'Maximum 6 accounts per platform allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Create trigger for account limit
DROP TRIGGER IF EXISTS enforce_social_account_limit ON public.member_social_accounts;
CREATE TRIGGER enforce_social_account_limit
  BEFORE INSERT OR UPDATE ON public.member_social_accounts
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION check_social_account_limit();

-- STEP 5: Create function to ensure only one default per platform
CREATE OR REPLACE FUNCTION ensure_single_default_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.member_social_accounts
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND platform = NEW.platform
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Create trigger for single default
DROP TRIGGER IF EXISTS enforce_single_default_account ON public.member_social_accounts;
CREATE TRIGGER enforce_single_default_account
  BEFORE INSERT OR UPDATE ON public.member_social_accounts
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_account();

-- STEP 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform 
  ON public.member_social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_default 
  ON public.member_social_accounts(user_id, platform, is_default) 
  WHERE is_default = true;

-- STEP 8: Add comments
COMMENT ON COLUMN public.member_social_accounts.platform_user_id IS 
  'Unique ID from the platform (e.g., Twitter user ID) to prevent duplicate connections';
COMMENT ON COLUMN public.member_social_accounts.account_nickname IS 
  'User-friendly name for the account (e.g., "Official", "Personal", "Silly")';
COMMENT ON COLUMN public.member_social_accounts.is_default IS 
  'If true, this is the default account for this platform when posting';
COMMENT ON COLUMN public.member_social_accounts.display_order IS 
  'Order in which accounts appear in the UI (0 = first)';
