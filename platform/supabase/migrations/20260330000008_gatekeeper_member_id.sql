-- Add member_id to gatekeeper_contacts for authenticated member fast-tracking
-- DD-8: MoneyPenny Web Channels | K172 DD Gate Batch
ALTER TABLE public.gatekeeper_contacts
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_gatekeeper_contacts_member
  ON gatekeeper_contacts (member_id) WHERE member_id IS NOT NULL;
