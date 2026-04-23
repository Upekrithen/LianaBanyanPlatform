-- ============================================================================
-- Migration: 20260319000016_crew_call_roles.sql
-- Session 43 Task B: Crew Call manufacturing roles
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_call_roles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name       text NOT NULL,
  category        text NOT NULL,
  description     text,
  commitment_tier text NOT NULL CHECK (commitment_tier IN ('primary','secondary','backup')),
  claimed_by      uuid REFERENCES auth.users(id),
  process_pioneer uuid REFERENCES auth.users(id),
  claimed_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE crew_call_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccr_select_auth" ON crew_call_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "ccr_update_claim" ON crew_call_roles FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

INSERT INTO crew_call_roles (role_name, category, description, commitment_tier) VALUES
  ('Lead Printer',      '3d_printing',      'Manage FDM/FFF print queue, maintain quality standards',              'primary'),
  ('Support Printer',   '3d_printing',      'Run secondary prints, assist with post-processing',                   'secondary'),
  ('Backup Printer',    '3d_printing',      'Available when primary and secondary are at capacity',                 'backup'),
  ('Lead Machinist',    'cnc',              'Program and operate CNC mills and lathes',                            'primary'),
  ('Support Machinist', 'cnc',              'Assist with fixtures, tooling, and secondary operations',             'secondary'),
  ('Lead Operator',     'laser_cutting',    'Run CO2 and fiber laser cutting operations',                          'primary'),
  ('Support Operator',  'laser_cutting',    'Material prep, engravings, and secondary cuts',                       'secondary'),
  ('Lead Caster',       'slip_casting',     'Manage mold library and casting schedules',                           'primary'),
  ('Support Caster',    'slip_casting',     'Assist with slip prep and mold maintenance',                          'secondary'),
  ('Lead Caster',       'sand_casting',     'Pattern making and foundry operations',                               'primary'),
  ('Backup Caster',     'sand_casting',     'Assist with molding and finishing operations',                         'backup'),
  ('Lead Technician',   'sls_sla',          'Operate SLS/SLA printers, manage resin and powder inventory',         'primary'),
  ('Support Technician','sls_sla',          'Post-curing, support removal, quality inspection',                    'secondary'),
  ('Lead Molder',       'injection_molding','Set up and run injection molding machines, manage mold library',       'primary'),
  ('Support Molder',    'injection_molding','Assist with material drying, color changes, and part inspection',      'secondary'),
  ('Lead Extruder',     'desktop_extrusion','Operate desktop extrusion lines for custom filament and profiles',    'primary'),
  ('Backup Extruder',   'desktop_extrusion','Available to run extrusion when lead is offline',                      'backup');
