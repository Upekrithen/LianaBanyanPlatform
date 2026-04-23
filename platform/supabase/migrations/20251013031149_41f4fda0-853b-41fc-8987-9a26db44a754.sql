-- Create test eligible user for Medallion minting demonstration
-- Using your existing authenticated user
-- K450a fix: guard with IF EXISTS so this no-ops in CI/local environments
-- where the production user UUID 790d4c44-... is not present in auth.users.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '790d4c44-134a-4550-bf44-dc44ad37ea7e') THEN
    INSERT INTO public.medallion_eligibility (
      user_id,
      project_id,
      total_direct_pledges,
      total_matched_credits,
      medallion_minted,
      token_id,
      wallet_address
    ) VALUES (
      '790d4c44-134a-4550-bf44-dc44ad37ea7e', -- Your user ID
      '11111111-1111-1111-1111-111111111111', -- HexIsle project
      50.00, -- $50 direct pledge
      10.00, -- $10 matched credits
      false, -- Not yet minted
      3, -- Tier 3: Community Builder
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7' -- Test wallet address
    )
    ON CONFLICT (user_id, project_id) DO UPDATE
    SET
      total_direct_pledges = 50.00,
      total_matched_credits = 10.00,
      token_id = 3,
      wallet_address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
      medallion_minted = false,
      updated_at = now();
  END IF;
END $$;
