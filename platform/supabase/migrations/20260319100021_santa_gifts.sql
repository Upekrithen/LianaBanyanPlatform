-- Session 47A: Santa Ever After — Gift Delivery System
-- "Giving Without Getting Caught"

CREATE TABLE IF NOT EXISTS santa_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_name text NOT NULL,
  recipient_contact text NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id),
  product_id uuid,
  gift_description text NOT NULL,
  amount_paid numeric NOT NULL,
  currency_type text NOT NULL DEFAULT 'credits' CHECK (currency_type IN ('credits', 'marks', 'joules')),
  captain_user_id uuid REFERENCES auth.users(id),
  captain_marks_staked numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'delivered', 'oops_code', 'completed', 'cancelled')),
  oops_code_used boolean NOT NULL DEFAULT false,
  sender_confirmed boolean NOT NULL DEFAULT false,
  captain_confirmed boolean NOT NULL DEFAULT false,
  recipient_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS captain_collateral_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  display_name text NOT NULL,
  total_staked numeric NOT NULL DEFAULT 0,
  total_released numeric NOT NULL DEFAULT 0,
  deliveries_completed integer NOT NULL DEFAULT 0,
  deliveries_failed integer NOT NULL DEFAULT 0,
  success_rate numeric NOT NULL DEFAULT 100,
  rating numeric NOT NULL DEFAULT 5.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if table already existed with different schema (nullable to handle existing rows)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'sender_user_id') THEN
    ALTER TABLE santa_gifts ADD COLUMN sender_user_id uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'captain_user_id') THEN
    ALTER TABLE santa_gifts ADD COLUMN captain_user_id uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'recipient_user_id') THEN
    ALTER TABLE santa_gifts ADD COLUMN recipient_user_id uuid REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'recipient_name') THEN
    ALTER TABLE santa_gifts ADD COLUMN recipient_name text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'recipient_contact') THEN
    ALTER TABLE santa_gifts ADD COLUMN recipient_contact text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'gift_description') THEN
    ALTER TABLE santa_gifts ADD COLUMN gift_description text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'amount_paid') THEN
    ALTER TABLE santa_gifts ADD COLUMN amount_paid numeric NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'currency_type') THEN
    ALTER TABLE santa_gifts ADD COLUMN currency_type text NOT NULL DEFAULT 'credits';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'santa_gifts' AND column_name = 'status') THEN
    ALTER TABLE santa_gifts ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- RLS
ALTER TABLE santa_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_collateral_profiles ENABLE ROW LEVEL SECURITY;

-- santa_gifts: sender CRUD own
DO $$ BEGIN
  CREATE POLICY "sender_select_own_gifts" ON santa_gifts FOR SELECT USING (sender_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "sender_insert_gifts" ON santa_gifts FOR INSERT WITH CHECK (sender_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "sender_update_own_gifts" ON santa_gifts FOR UPDATE USING (sender_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "captain_select_assigned" ON santa_gifts FOR SELECT USING (captain_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "captain_update_assigned" ON santa_gifts FOR UPDATE USING (captain_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "recipient_select_delivered" ON santa_gifts FOR SELECT USING (recipient_user_id = auth.uid() AND status IN ('delivered', 'completed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin_all_gifts" ON santa_gifts FOR ALL USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- captain_collateral_profiles
DO $$ BEGIN
  CREATE POLICY "owner_select_captain" ON captain_collateral_profiles FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "owner_update_captain" ON captain_collateral_profiles FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "all_browse_captains" ON captain_collateral_profiles FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "admin_all_captains" ON captain_collateral_profiles FOR ALL USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed data skipped: requires valid auth.users entries
-- INSERT seed data via the application layer or admin panel
