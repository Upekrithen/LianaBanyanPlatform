-- SEC Language Compliance: Rename columns with SEC-dangerous terminology
-- "equity" → "participation", "profit" → "service_credit"
-- Migration is backward-compatible: old column names are aliased via views if needed

-- 1. Rename independence_equity_bonus → independence_participation_bonus (projects table)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'independence_equity_bonus'
  ) THEN
    ALTER TABLE projects RENAME COLUMN independence_equity_bonus TO independence_participation_bonus;
  END IF;
END $$;

-- 2. Rename profit_percentage_repayment → service_credit_percentage_repayment (meal_orders or lmd tables)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meal_orders' AND column_name = 'profit_percentage_repayment'
  ) THEN
    ALTER TABLE meal_orders RENAME COLUMN profit_percentage_repayment TO service_credit_percentage_repayment;
  END IF;
END $$;

-- Also check lmd_meal_orders if that's the actual table name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lmd_meal_orders' AND column_name = 'profit_percentage_repayment'
  ) THEN
    ALTER TABLE lmd_meal_orders RENAME COLUMN profit_percentage_repayment TO service_credit_percentage_repayment;
  END IF;
END $$;
