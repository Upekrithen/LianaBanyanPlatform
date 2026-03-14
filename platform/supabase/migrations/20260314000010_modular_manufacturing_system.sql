-- Modular Manufacturing System — Session 16
-- manufacturing_process_modules, crew_call_assignments, process_pioneer_ledger, dna_lock

CREATE TABLE IF NOT EXISTS public.manufacturing_process_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_name TEXT NOT NULL UNIQUE,
  process_type TEXT NOT NULL
    CHECK (process_type IN ('additive', 'subtractive', 'casting', 'molding', 'assembly', 'finishing', 'other')),
  description TEXT,
  equipment_needed TEXT[],
  skill_level TEXT NOT NULL DEFAULT 'intermediate'
    CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.manufacturing_process_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read process modules" ON public.manufacturing_process_modules;
CREATE POLICY "Public read process modules" ON public.manufacturing_process_modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage process modules" ON public.manufacturing_process_modules;
-- Only service role can insert/update/delete; public can read
CREATE POLICY "Service role manage process modules" ON public.manufacturing_process_modules FOR ALL USING (auth.role() = 'service_role');

INSERT INTO public.manufacturing_process_modules (process_name, process_type, description, equipment_needed, skill_level)
VALUES
  ('SLA 3D Printing', 'additive', 'Stereolithography resin printing for high-detail parts', ARRAY['SLA Printer', 'Wash Station', 'Cure Station'], 'intermediate'),
  ('SLS 3D Printing', 'additive', 'Selective Laser Sintering for functional nylon parts', ARRAY['SLS Printer', 'Powder Recovery System'], 'advanced'),
  ('FDM/FFF 3D Printing', 'additive', 'Fused Deposition Modeling for prototypes and functional parts', ARRAY['FDM Printer', 'Build Plate'], 'beginner'),
  ('Slip Casting', 'casting', 'Ceramic slip casting with plaster molds', ARRAY['Molds', 'Slip Mixer', 'Kiln'], 'intermediate'),
  ('Sand Casting', 'casting', 'Metal casting using sand molds', ARRAY['Sand Molds', 'Furnace', 'Safety Equipment'], 'advanced'),
  ('Injection Molding', 'molding', 'Plastic injection molding for production runs', ARRAY['Injection Mold Machine', 'Mold Tooling'], 'expert'),
  ('Desktop Extrusion', 'molding', 'Small-scale plastic extrusion for custom profiles', ARRAY['Desktop Extruder', 'Die Set'], 'intermediate'),
  ('CNC Milling', 'subtractive', 'Computer-controlled milling for precision parts', ARRAY['CNC Mill', 'Tooling Set', 'CAM Software'], 'advanced'),
  ('Laser Cutting', 'subtractive', 'Laser cutting for sheet materials', ARRAY['Laser Cutter', 'Ventilation System'], 'intermediate'),
  ('Hand Assembly', 'assembly', 'Manual assembly of multi-part products', ARRAY['Workbench', 'Hand Tools'], 'beginner')
ON CONFLICT (process_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.crew_call_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_module_id UUID NOT NULL REFERENCES public.manufacturing_process_modules(id) ON DELETE CASCADE,
  role_level TEXT NOT NULL DEFAULT 'backup'
    CHECK (role_level IN ('primary', 'secondary', 'backup')),
  is_process_pioneer BOOLEAN DEFAULT FALSE,
  pioneer_recognized_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, process_module_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_call_user ON public.crew_call_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_call_process ON public.crew_call_assignments(process_module_id);
CREATE INDEX IF NOT EXISTS idx_crew_call_role ON public.crew_call_assignments(role_level);
ALTER TABLE public.crew_call_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own assignments" ON public.crew_call_assignments;
CREATE POLICY "Users view own assignments" ON public.crew_call_assignments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own assignments" ON public.crew_call_assignments;
CREATE POLICY "Users manage own assignments" ON public.crew_call_assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own assignments" ON public.crew_call_assignments;
CREATE POLICY "Users update own assignments" ON public.crew_call_assignments FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public read for crew display" ON public.crew_call_assignments;
CREATE POLICY "Public read for crew display" ON public.crew_call_assignments FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.process_pioneer_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_module_id UUID NOT NULL REFERENCES public.manufacturing_process_modules(id) ON DELETE CASCADE,
  pioneer_type TEXT NOT NULL DEFAULT 'first_mover'
    CHECK (pioneer_type IN ('first_mover', 'innovator', 'scale_pioneer', 'quality_pioneer')),
  recognition_description TEXT,
  recognized_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(process_module_id, pioneer_type)
);

ALTER TABLE public.process_pioneer_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pioneer ledger" ON public.process_pioneer_ledger;
CREATE POLICY "Public read pioneer ledger" ON public.process_pioneer_ledger FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage pioneer ledger" ON public.process_pioneer_ledger;
CREATE POLICY "Service role manage pioneer ledger" ON public.process_pioneer_ledger FOR ALL USING (auth.role() = 'service_role');

INSERT INTO public.dna_lock (parameter_key, parameter_value, data_type, is_locked, locked_by, description, category)
VALUES
  ('crew_call_max_primary_per_process', '3', 'integer', false, 'SYSTEM', 'Maximum Primary operators per process module', 'manufacturing'),
  ('crew_call_max_secondary_per_process', '5', 'integer', false, 'SYSTEM', 'Maximum Secondary operators per process module', 'manufacturing'),
  ('crew_call_backup_unlimited', 'true', 'boolean', false, 'SYSTEM', 'Whether Backup slots are unlimited', 'manufacturing'),
  ('process_pioneer_marks_reward', '25', 'integer', false, 'SYSTEM', 'Marks reward for being recognized as a Process Pioneer', 'manufacturing'),
  ('cue_card_deck_annual_price_credits', '5', 'integer', false, 'SYSTEM', '$5/year Viral Cue Card Deck membership price in Credits', 'marketing')
ON CONFLICT (parameter_key) DO NOTHING;
