-- K388: Pioneer Proposal Rewards (Innovation #2235, Crown Jewel #208, B093)

CREATE TABLE IF NOT EXISTS public.pioneer_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposed_name text NOT NULL,
  proposed_email text,
  proposed_url text,
  description text NOT NULL DEFAULT '',
  business_plan_json jsonb NOT NULL DEFAULT '{
    "storefront_description": "",
    "target_audience": "",
    "recommended_connections": [],
    "spice_categories": [],
    "cold_start_path": "",
    "estimated_first_month": ""
  }'::jsonb,
  status text NOT NULL CHECK (status IN ('proposed','contacted','joined','expired')) DEFAULT 'proposed',
  proposed_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  joined_user_id uuid REFERENCES public.profiles(id),
  proposal_order int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pioneer_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.pioneer_proposals(id) ON DELETE CASCADE,
  proposer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_marks numeric NOT NULL DEFAULT 0,
  reward_percent numeric NOT NULL DEFAULT 0,
  time_decay_percent numeric NOT NULL DEFAULT 100,
  final_percent numeric NOT NULL DEFAULT 0,
  decay_applied boolean NOT NULL DEFAULT false,
  rewarded_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.calculate_proposal_order()
RETURNS TRIGGER AS $$
DECLARE
  existing_count int;
BEGIN
  SELECT COUNT(*) INTO existing_count
  FROM public.pioneer_proposals
  WHERE (
    (NEW.proposed_email IS NOT NULL AND proposed_email = NEW.proposed_email)
    OR
    (NEW.proposed_url IS NOT NULL AND proposed_url = NEW.proposed_url)
  )
  AND id != NEW.id;

  NEW.proposal_order := existing_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_proposal_order
  BEFORE INSERT ON public.pioneer_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_proposal_order();

CREATE OR REPLACE FUNCTION public.get_order_reward_percent(p_order int)
RETURNS numeric AS $$
BEGIN
  RETURN CASE
    WHEN p_order = 1 THEN 100
    WHEN p_order = 2 THEN 50
    WHEN p_order = 3 THEN 25
    ELSE 10
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.get_time_decay_percent(p_proposed_at timestamptz)
RETURNS numeric AS $$
DECLARE
  days_elapsed int;
BEGIN
  days_elapsed := EXTRACT(DAY FROM (now() - p_proposed_at));
  RETURN CASE
    WHEN days_elapsed <= 7 THEN 100
    WHEN days_elapsed <= 30 THEN 25
    ELSE 10
  END;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.process_pioneer_join(
  p_proposed_email text DEFAULT NULL,
  p_proposed_url text DEFAULT NULL,
  p_joined_user_id uuid DEFAULT NULL,
  p_base_reward numeric DEFAULT 100
)
RETURNS int AS $$
DECLARE
  proposal RECORD;
  order_pct numeric;
  decay_pct numeric;
  final_pct numeric;
  reward_count int := 0;
BEGIN
  FOR proposal IN
    SELECT * FROM public.pioneer_proposals
    WHERE status = 'proposed'
    AND (
      (p_proposed_email IS NOT NULL AND proposed_email = p_proposed_email)
      OR
      (p_proposed_url IS NOT NULL AND proposed_url = p_proposed_url)
    )
    ORDER BY proposal_order ASC
  LOOP
    UPDATE public.pioneer_proposals
    SET status = 'joined',
        joined_at = now(),
        joined_user_id = p_joined_user_id
    WHERE id = proposal.id;

    order_pct := public.get_order_reward_percent(proposal.proposal_order);
    decay_pct := public.get_time_decay_percent(proposal.proposed_at);
    final_pct := LEAST(order_pct, decay_pct);

    INSERT INTO public.pioneer_rewards (
      proposal_id, proposer_id, reward_marks,
      reward_percent, time_decay_percent, final_percent,
      decay_applied
    ) VALUES (
      proposal.id, proposal.proposer_id,
      (p_base_reward * final_pct / 100),
      order_pct, decay_pct, final_pct,
      (decay_pct < 100)
    );

    reward_count := reward_count + 1;
  END LOOP;

  RETURN reward_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.pioneer_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pioneer_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proposals" ON public.pioneer_proposals
  FOR SELECT USING (auth.uid() = proposer_id);
CREATE POLICY "Users can insert own proposals" ON public.pioneer_proposals
  FOR INSERT WITH CHECK (auth.uid() = proposer_id);
CREATE POLICY "Users can update own proposals" ON public.pioneer_proposals
  FOR UPDATE USING (auth.uid() = proposer_id AND status = 'proposed');
CREATE POLICY "Public can view joined proposals" ON public.pioneer_proposals
  FOR SELECT USING (status = 'joined');

CREATE POLICY "Users can view own rewards" ON public.pioneer_rewards
  FOR SELECT USING (auth.uid() = proposer_id);
CREATE POLICY "Public can view all rewards" ON public.pioneer_rewards
  FOR SELECT USING (true);

CREATE INDEX idx_pioneer_proposals_proposer ON public.pioneer_proposals(proposer_id);
CREATE INDEX idx_pioneer_proposals_email ON public.pioneer_proposals(proposed_email) WHERE proposed_email IS NOT NULL;
CREATE INDEX idx_pioneer_proposals_url ON public.pioneer_proposals(proposed_url) WHERE proposed_url IS NOT NULL;
CREATE INDEX idx_pioneer_proposals_status ON public.pioneer_proposals(status);
CREATE INDEX idx_pioneer_rewards_proposer ON public.pioneer_rewards(proposer_id);
CREATE INDEX idx_pioneer_rewards_proposal ON public.pioneer_rewards(proposal_id);
