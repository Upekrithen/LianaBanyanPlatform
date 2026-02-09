-- Create function to auto-create Medallion product when project is created
CREATE OR REPLACE FUNCTION public.create_default_medallion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  
  -- Create default production levels for the Medallion
  INSERT INTO public.production_levels (
    product_id,
    level_number,
    level_name,
    units_count,
    unit_price,
    votes_needed
  ) VALUES
    (_medallion_id, 1, 'Seed Funding', 100, 5.00, 500),
    (_medallion_id, 2, 'Early Supporter', 250, 4.50, 1125),
    (_medallion_id, 3, 'Community Builder', 500, 4.00, 2000),
    (_medallion_id, 4, 'Project Champion', 1000, 3.50, 3500);
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create Medallion on project creation
CREATE TRIGGER auto_create_medallion
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_medallion();

-- Add Medallion funding requirement check function
CREATE OR REPLACE FUNCTION public.check_medallion_funded(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.production_levels pl ON pl.product_id = p.id
    WHERE p.project_id = _project_id
      AND p.name = 'Medallion'
      AND pl.current_votes >= pl.votes_needed
      AND pl.level_number = 1  -- At least first level must be funded
  );
$$;

-- Add column to track if Medallion is funded
ALTER TABLE public.projects
ADD COLUMN medallion_funded BOOLEAN DEFAULT false;

-- Create function to update medallion_funded status
CREATE OR REPLACE FUNCTION public.update_medallion_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _project_id UUID;
BEGIN
  -- Get the project_id from the production level
  SELECT p.project_id INTO _project_id
  FROM public.products p
  WHERE p.id = NEW.product_id;
  
  -- Check if this is a Medallion product
  IF EXISTS (
    SELECT 1 FROM public.products
    WHERE id = NEW.product_id
      AND name = 'Medallion'
  ) THEN
    -- Update project medallion_funded status
    UPDATE public.projects
    SET medallion_funded = public.check_medallion_funded(_project_id)
    WHERE id = _project_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update medallion status when votes change
CREATE TRIGGER update_medallion_funded_status
  AFTER UPDATE OF current_votes ON public.production_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medallion_status();