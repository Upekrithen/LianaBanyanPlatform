-- BP071 Scope 2: VSL Initiative Name Fix
-- Founder-authoritative name: "VSL (Vouch Short Loans)"
-- Previous variants found on-disk: "Vouched Short Loans", "Voucher Short Loans", "VSL"
-- Column is `initiative_slug` (verified from baseline schema at line 19786)
-- Slug verified as 'vsl' from seed_data.sql and baseline index idx_initiatives_slug

UPDATE public.initiatives
SET name = 'VSL (Vouch Short Loans)'
WHERE initiative_slug = 'vsl'
  AND name IS DISTINCT FROM 'VSL (Vouch Short Loans)';

-- Verification:
-- SELECT initiative_number, initiative_slug, name FROM public.initiatives WHERE initiative_slug = 'vsl';
-- Expected: 10 | vsl | VSL (Vouch Short Loans)
