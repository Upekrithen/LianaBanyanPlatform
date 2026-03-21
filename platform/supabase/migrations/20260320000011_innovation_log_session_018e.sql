-- =============================================================================
-- INNOVATION LOG — Bishop Session 018E — 5 innovations #1801-#1805
-- Two-Pass Delivery, Klaus Spotters, $5/Week Monitoring, Political Classification,
-- Sequence Security Paper
-- =============================================================================
-- Source: BISHOP_DROPZONE/AA_SESSION_018E_FOUNDER_RESPONDS_2.md
-- Count after: 1,805

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1801, 'Two-Pass Delivery Route (Optimized First, Tardies Second)', 'Primary route stays optimized with 30+ day advance bookings. Secondary pass after primary completes picks up all tardies (under-30-day bookings). Tardies pay surcharges AND get served on less-optimal route. Creates two Multiplier slots: Primary Driver + Secondary Driver. Primary reliability builds trust.', 'Logistics / Scheduling', 'Bag 9', 'pending'),
  (1802, 'Klaus Spotters — Whole Nother Level Covert Observer Network', 'Three Spotters per Elf deployment from three different vantage points. Covert: walk, jog, take kids to park. Paid same as Elves (standing bounty + activation pay). On record during deployments. Three-vantage redundancy: if one angle blocked, two compensate. Triangulated documentation.', 'Safety / Surveillance', 'Bag 9', 'pending'),
  (1803, '$5/Week Defense Klaus Monitoring Subscription — I Need a Hero', 'Personal safety subscription: active monitoring, Elf + Spotter activation access, reputation safety score. Minimum deployment: 3 points of contact + 3 Klaus Spotters = 6 people minimum. Never respond alone. Tagline: I Need a Hero. Subscription funds standing bounty for local Elves and Spotters.', 'Safety / Subscription', 'Bag 9', 'pending'),
  (1804, 'Political Initiative Classification (Three-Layer + Time Gate)', 'Who decides if a proposed initiative is political? Layer 1: Reputation + Shirley Temple automated voting. Layer 2: Founder veto (can elevate or demote). Layer 3: Default to Political Expedition unless elevated. Bishop suggestion: 90-day survival rule before Sweet Sixteen elevation.', 'Governance / Classification', 'Bag 9', 'pending'),
  (1805, 'Sequence Security Paper — Behavioral Authentication for Accessibility', 'Academic paper: Your Morning Routine Is Your Password. Traditional passwords exclude people with memory challenges, low digital literacy, cognitive disabilities. Sequence Security replaces remember-a-string with follow-your-routine. Not less secure, differently secure, MORE accessible. Skipping Stones format. Publishable in HCI journals.', 'Security / Accessibility / Academic', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
