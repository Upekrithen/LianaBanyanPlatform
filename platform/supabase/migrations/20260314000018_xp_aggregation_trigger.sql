-- XP rollup: when xp_transactions are inserted, recalculate xp_scores (Session 18)

CREATE OR REPLACE FUNCTION public.recalculate_xp_scores()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.xp_scores (user_id, total_xp, bounties_completed, average_accomplishment_score, highest_single_xp, updated_at)
  SELECT
    NEW.user_id,
    COALESCE(SUM(xp_earned), 0)::INTEGER,
    COUNT(*)::INTEGER,
    COALESCE(AVG(accomplishment_score), 0),
    COALESCE(MAX(xp_earned), 0)::INTEGER,
    NOW()
  FROM public.xp_transactions
  WHERE user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = EXCLUDED.total_xp,
    bounties_completed = EXCLUDED.bounties_completed,
    average_accomplishment_score = EXCLUDED.average_accomplishment_score,
    highest_single_xp = EXCLUDED.highest_single_xp,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_xp_transaction_rollup ON public.xp_transactions;
CREATE TRIGGER trg_xp_transaction_rollup
  AFTER INSERT ON public.xp_transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.recalculate_xp_scores();
