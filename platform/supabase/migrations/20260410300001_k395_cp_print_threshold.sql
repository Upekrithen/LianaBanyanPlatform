-- K395: Wire Catapult Power to Physical Print Threshold
-- When deck_cards.scan_count changes, sync to catapult_metrics for CP tracking
-- When scan_count reaches 100, auto-create print order
-- Session B093

-- 1A. Add UNIQUE constraint on (entity_type, entity_id) for upsert support
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_catapult_entity') THEN
    ALTER TABLE public.catapult_metrics ADD CONSTRAINT uq_catapult_entity UNIQUE (entity_type, entity_id);
  END IF;
END $$;

-- 1B. Expand entity_type CHECK constraint to include 'deck_card_print'
ALTER TABLE public.catapult_metrics DROP CONSTRAINT IF EXISTS catapult_metrics_entity_type_check;
ALTER TABLE public.catapult_metrics ADD CONSTRAINT catapult_metrics_entity_type_check 
  CHECK (entity_type IN ('project', 'petition', 'vote', 'campaign', 'initiative', 'submission', 'deck_card_print'));

-- 1C. Add deck_card_id to print_orders if not present
ALTER TABLE public.print_orders ADD COLUMN IF NOT EXISTS deck_card_id uuid REFERENCES public.deck_cards(id);

-- 1D. Trigger function: sync scan_count -> catapult_metrics
CREATE OR REPLACE FUNCTION public.sync_deck_card_cp()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.catapult_metrics (entity_type, entity_id, label, current_value, target_value)
  VALUES (
    'deck_card_print', 
    NEW.id, 
    COALESCE(NEW.title, NEW.card_code, 'Deck Card'), 
    COALESCE(NEW.scan_count, 0), 
    100
  )
  ON CONFLICT (entity_type, entity_id) 
  DO UPDATE SET 
    current_value = EXCLUDED.current_value, 
    label = EXCLUDED.label,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deck_card_cp_sync
  AFTER INSERT OR UPDATE OF scan_count ON public.deck_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_deck_card_cp();

-- 1E. Trigger function: auto-create print order when scan_count >= 100
CREATE OR REPLACE FUNCTION public.auto_trigger_print_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scan_count >= 100 AND (OLD.scan_count IS NULL OR OLD.scan_count < 100) THEN
    INSERT INTO public.print_orders (order_type, status, deck_card_id, quantity, created_at)
    VALUES ('medallion_card', 'waitlist', NEW.id, 1, now())
    ON CONFLICT DO NOTHING;
    
    UPDATE public.deck_cards SET status = 'printed' WHERE id = NEW.id AND status = 'generated';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deck_card_print_threshold
  AFTER UPDATE OF scan_count ON public.deck_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_trigger_print_order();

-- 1F. Backfill: seed catapult_metrics for existing cards with scan_count > 0
INSERT INTO public.catapult_metrics (entity_type, entity_id, label, current_value, target_value)
SELECT 
  'deck_card_print', 
  id, 
  COALESCE(title, card_code, 'Deck Card'),
  COALESCE(scan_count, 0), 
  100
FROM public.deck_cards
WHERE COALESCE(scan_count, 0) > 0
ON CONFLICT (entity_type, entity_id) DO NOTHING;
