-- Commerce Engine: Add commerce columns to storefronts + create storefront_items + menu_orders
-- Extends the existing storefronts table (Session 38) with ordering infrastructure

-- Add commerce columns to existing storefronts
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS business_location TEXT;
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS order_cutoff_time TIME DEFAULT '00:00:00';
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS delivery_window_start TIME DEFAULT '07:00:00';
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS delivery_window_end TIME DEFAULT '08:00:00';
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE storefronts ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 2.00;

-- Allow public/anon to view active storefronts (for guest menu browsing)
DROP POLICY IF EXISTS "storefronts_select_anon" ON storefronts;
CREATE POLICY "storefronts_select_anon" ON storefronts
  FOR SELECT TO anon USING (is_open = true);

-- Menu items (separate from storefront_products which tracks credits/marks)
CREATE TABLE IF NOT EXISTS storefront_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  photo_url TEXT,
  category TEXT DEFAULT 'general',
  available_days TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'],
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE storefront_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active items" ON storefront_items
  FOR SELECT USING (is_active = true);
CREATE POLICY "Storefront owners manage items" ON storefront_items
  FOR ALL USING (
    storefront_id IN (SELECT id FROM storefronts WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin manages all items" ON storefront_items
  FOR ALL USING (public.is_admin());

-- Menu orders
CREATE TABLE IF NOT EXISTS menu_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  customer_id UUID REFERENCES auth.users(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  items JSONB NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 2.00,
  subtotal DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_status TEXT DEFAULT 'pending',
  delivery_date DATE NOT NULL,
  delivery_status TEXT DEFAULT 'pending',
  stamp_photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE menu_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own orders" ON menu_orders
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Storefront owners view their orders" ON menu_orders
  FOR SELECT USING (
    storefront_id IN (SELECT id FROM storefronts WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin manages all orders" ON menu_orders
  FOR ALL USING (public.is_admin());
CREATE POLICY "System can insert orders" ON menu_orders
  FOR INSERT WITH CHECK (true);

-- Onboarding credits: passive income for the member who brought a business onto LB
CREATE TABLE IF NOT EXISTS onboarding_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarder_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  qualification_date DATE,
  credit_percentage DECIMAL(4,2) DEFAULT 3.00,
  is_qualified BOOLEAN DEFAULT false,
  orders_count INT DEFAULT 0,
  first_order_date DATE,
  is_active BOOLEAN DEFAULT true,
  paused_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Steward agreements: ongoing management fee for digital operations
CREATE TABLE IF NOT EXISTS steward_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  steward_id UUID NOT NULL REFERENCES auth.users(id),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  management_fee_percentage DECIMAL(4,2) DEFAULT 2.00,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Storefront transfers
CREATE TABLE IF NOT EXISTS storefront_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storefront_id UUID NOT NULL REFERENCES storefronts(id),
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id UUID NOT NULL REFERENCES auth.users(id),
  transfer_date DATE NOT NULL,
  reason TEXT,
  onboarding_credit_preserved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onboarding_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE steward_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Onboarders view own credits" ON onboarding_credits
  FOR SELECT USING (auth.uid() = onboarder_id);
CREATE POLICY "Stewards view own agreements" ON steward_agreements
  FOR SELECT USING (auth.uid() = steward_id);
CREATE POLICY "Transfer participants view transfers" ON storefront_transfers
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Admin manages credits" ON onboarding_credits
  FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manages agreements" ON steward_agreements
  FOR ALL USING (public.is_admin());
CREATE POLICY "Admin manages transfers" ON storefront_transfers
  FOR ALL USING (public.is_admin());
