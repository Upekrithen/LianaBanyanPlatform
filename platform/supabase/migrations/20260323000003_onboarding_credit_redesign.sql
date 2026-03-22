-- Onboarding Credit Redesign: passive income -> allocation authority (Backed Marks)
-- Innovation reference: #1897 (A&A 020A)

ALTER TABLE onboarding_credits
  ADD COLUMN IF NOT EXISTS backed_marks_earned DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saa_accumulated DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allocation_rate DECIMAL(4,2) DEFAULT 3.00;

COMMENT ON COLUMN onboarding_credits.credit_percentage IS
  'DEPRECATED: Use allocation_rate instead. This percentage generates Backed Marks, not cash.';
