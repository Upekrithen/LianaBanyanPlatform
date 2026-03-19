-- Add launch conditions for initiative pages not covered in the original seed
-- Session 36 — March 19, 2026

INSERT INTO public.launch_conditions (initiative_slug, condition_type, label, current_value, target_value, unit) VALUES
  -- Let's Get Groceries
  ('lets-get-groceries', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('lets-get-groceries', 'members', 'Shoppers', 0, 100, 'people'),
  ('lets-get-groceries', 'funding', 'Funding', 0, 5000, '$'),
  -- Rally Group
  ('rally-group', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('rally-group', 'members', 'Responders', 0, 50, 'people'),
  ('rally-group', 'funding', 'Funding', 0, 8000, '$'),
  -- LifeLine Medications
  ('lifeline-medications', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('lifeline-medications', 'members', 'Members', 0, 200, 'people'),
  ('lifeline-medications', 'funding', 'Funding', 0, 15000, '$'),
  -- Health Accords
  ('health-accords', 'leadership', 'Leadership', 0, 1, 'roles filled'),
  ('health-accords', 'members', 'Participants', 0, 100, 'people'),
  ('health-accords', 'funding', 'Funding', 0, 10000, '$')
ON CONFLICT DO NOTHING;
