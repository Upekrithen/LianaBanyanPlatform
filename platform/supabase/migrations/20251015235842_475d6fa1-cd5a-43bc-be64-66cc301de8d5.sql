-- Fix create_default_medallion function to not insert into generated column
CREATE OR REPLACE FUNCTION public.create_default_medallion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _medallion_id UUID;
BEGIN
  -- Create the Medallion product as the first product
  INSERT INTO public.products (
    project_id,
    name,
    product_sku,
    description,
    details
  ) VALUES (
    NEW.id,
    'Medallion',
    CONCAT(NEW.project_sku, '-MEDALLION-001'),
    'Hexagonal medallion token representing your stake in this project',
    'The Medallion is your proof of membership and stake in this project. It serves as a physical token that connects to the blockchain ledger via QR code, tracking your equity, credits, and voting power. This must be funded first before the project can proceed to other products.'
  )
  RETURNING id INTO _medallion_id;

  -- Create default production levels for the Medallion (votes_needed is now generated)
  INSERT INTO public.production_levels (
    product_id,
    level_number,
    level_name,
    units_count,
    unit_price
  ) VALUES
    (_medallion_id, 1, 'Seed Funding', 100, 5.00),
    (_medallion_id, 2, 'Early Supporter', 250, 4.50),
    (_medallion_id, 3, 'Community Builder', 500, 4.00),
    (_medallion_id, 4, 'Project Champion', 1000, 3.50);

  RETURN NEW;
END;
$function$;

-- Fix update_member_project_count to handle NULL owner_id
CREATE OR REPLACE FUNCTION public.update_member_project_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _project_count INTEGER;
BEGIN
  -- Only update if owner_id is not NULL
  IF NEW.owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count completed projects
  SELECT COUNT(*) INTO _project_count
  FROM projects
  WHERE owner_id = NEW.owner_id;

  -- Update milestone tracking
  INSERT INTO member_project_milestones (user_id, project_count, first_10_completed)
  VALUES (
    NEW.owner_id,
    _project_count,
    _project_count >= 10
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    project_count = _project_count,
    first_10_completed = _project_count >= 10,
    physical_badge_reminder_sent = CASE
      WHEN _project_count >= 3 AND NOT member_project_milestones.physical_badge_reminder_sent
      THEN false
      ELSE member_project_milestones.physical_badge_reminder_sent
    END,
    updated_at = now();

  RETURN NEW;
END;
$function$;

-- Update GimmeFive to Let's Make Dinner
UPDATE projects
SET name = 'Let''s Make Dinner'
WHERE id = '7c39f3af-d076-4dd7-a622-7bc30c7f11ca';

-- Insert LifeLine Medications project with valid owner_id
INSERT INTO projects (name, description, owner_id)
VALUES (
  'LifeLine Medications',
  'Curing One Worry At A Time',
  '790d4c44-134a-4550-bf44-dc44ad37ea7e'
);
