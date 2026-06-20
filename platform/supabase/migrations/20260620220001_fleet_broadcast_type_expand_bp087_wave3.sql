-- BP087 Wave 3 Gap Closure: expand fleet_broadcast broadcast_type CHECK constraint
-- Adds pheromone_sync, eblet_sync, pearl_sync, eblit_emit (Wave 3 primitives)
-- Closes Row 2b enabler: eblit_emit must be in the constraint for mic-broadcast to insert it.
-- Also reconciles pheromone_sync and eblet_sync which were in the function VALID_TYPES
-- but missing from the DB constraint (silent regression path).

ALTER TABLE public.fleet_broadcast
  DROP CONSTRAINT IF EXISTS fleet_broadcast_broadcast_type_check;

ALTER TABLE public.fleet_broadcast
  ADD CONSTRAINT fleet_broadcast_broadcast_type_check
  CHECK (broadcast_type = ANY (ARRAY[
    'auto_update'::text,
    'config_set'::text,
    'fleet_warmup'::text,
    'health_snapshot'::text,
    'benchmark_run'::text,
    'noop_test'::text,
    'pheromone_sync'::text,
    'eblet_sync'::text,
    'pearl_sync'::text,
    'eblit_emit'::text
  ]));

COMMENT ON COLUMN public.fleet_broadcast.broadcast_type IS
  'BP087 Wave 3: added pheromone_sync, eblet_sync, pearl_sync, eblit_emit. '
  'mic-broadcast function VALID_TYPES must stay in sync with this constraint.';
