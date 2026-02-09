-- Create credit transactions table for audit trail
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'purchase', 'expenditure', 'refund'
  amount NUMERIC NOT NULL,
  credits_amount NUMERIC NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view own transactions
CREATE POLICY "Users can view own credit transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert transactions
CREATE POLICY "System can insert credit transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);