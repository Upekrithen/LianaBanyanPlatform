-- Ensure test user meets eligibility threshold (>= $1000)
UPDATE public.medallion_eligibility
SET total_direct_pledges = 1000.00,
    total_matched_credits = 0.00,
    updated_at = now()
WHERE user_id = '790d4c44-134a-4550-bf44-dc44ad37ea7e'
  AND project_id = '11111111-1111-1111-1111-111111111111';
