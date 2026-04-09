-- K349: Morpheus path beacon seed for Snow Gate walk-around route

INSERT INTO public.beacons (
  name,
  beacon_color,
  beacon_type,
  location_type,
  location_path,
  page_title,
  notes,
  user_id
)
SELECT
  'Morpheus Path',
  'purple',
  'system',
  'page',
  '/northern/overlook',
  'Northern Province Overlook',
  'Follow this beacon to see what waits beyond the Snow Gate.',
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM public.beacons b
  WHERE b.name = 'Morpheus Path'
    AND b.location_path = '/northern/overlook'
);

