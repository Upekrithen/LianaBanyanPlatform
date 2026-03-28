-- Auto-qualification trigger for onboarding credits
-- When a menu_order gets stripe_payment_status='paid', increment the orders_count
-- on matching onboarding_credits and auto-qualify when thresholds are met.

CREATE OR REPLACE FUNCTION public.fn_onboarding_credit_order_tick()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when payment status transitions to 'paid'
  IF NEW.stripe_payment_status = 'paid'
     AND (OLD IS NULL OR OLD.stripe_payment_status IS DISTINCT FROM 'paid') THEN

    -- Set first_order_date if not yet set
    UPDATE onboarding_credits
    SET first_order_date = CURRENT_DATE
    WHERE storefront_id = NEW.storefront_id
      AND first_order_date IS NULL
      AND is_active = true;

    -- Increment orders_count
    UPDATE onboarding_credits
    SET orders_count = orders_count + 1
    WHERE storefront_id = NEW.storefront_id
      AND is_active = true
      AND is_qualified = false;

    -- Auto-qualify: 10+ orders AND 30+ days since first order
    UPDATE onboarding_credits
    SET is_qualified = true,
        qualification_date = CURRENT_DATE
    WHERE storefront_id = NEW.storefront_id
      AND is_active = true
      AND is_qualified = false
      AND orders_count >= 10
      AND first_order_date IS NOT NULL
      AND (CURRENT_DATE - first_order_date) >= 30;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_onboarding_credit_order_tick ON menu_orders;
CREATE TRIGGER trg_onboarding_credit_order_tick
  AFTER INSERT OR UPDATE OF stripe_payment_status ON menu_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_onboarding_credit_order_tick();
