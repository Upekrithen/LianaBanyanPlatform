-- =============================================================================
-- INNOVATION LOG — Bishop Session 018 — 9 innovations #1758-#1766
-- LB Card System + Stocked Local Larder + Supporting Mechanics
-- =============================================================================
-- Source: BISHOP_DROPZONE/AA_SESSION_018_LB_CARD_AND_LARDER.md
-- Count after: 1,766

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1758, 'LB Replenishable Card System', 'Physical/digital purchase-only card for every member denominated in local currency. Loads via Stripe or attached bank account. Purchase-only (no ATM/cash withdrawal) keeps funds in cooperative economy and sidesteps money transmitter regulations. White-label existing card infrastructure with Node Captains handling local card partnerships.', 'Payment Infrastructure', 'Bag 9', 'pending'),
  (1759, 'Charity Card Linking — Rule-Based Replenishment', 'Members link cards in their Member Portfolio for third parties (homeless, elders, family). Giver sets custom replenishment rules ($X/day, X meals/day, replenish N times before asking). Card serves as introduction to LB for non-members. Money goes to goods/services only (purchase-only constraint). Mutual aid with guardrails.', 'Social Impact / Payment', 'Bag 9', 'pending'),
  (1760, 'Business Card Accounts — Multi-Card Nodes', 'Business bank account through LB tied to several individual cards with per-card spending limits and auto-replenishment. Another way to start a Node. Node Captains, drivers, shoppers each get a linked card. Extends LB Card from individual tool to business infrastructure.', 'Business Infrastructure', 'Bag 9', 'pending'),
  (1761, 'Stocked Local Larder — Cold Start Protocol', 'Decentralized food distribution cold start: (1) Record recipe in The Pantry, (2) Make recipe — now chooseable for LMD/Family Table, (3) Buy 2x at store, (4) Store other half in Freezer/DryGoods at ≤70°F, (5) Anticipate orders via Pickup or Delivery. Solves cold start by recognizing people already buy groceries — marginal cost is just the second set of ingredients.', 'Operations / Cold Start', 'Bag 9', 'pending'),
  (1762, 'Freezer Babysitter (Keeper) Full Bounty', 'People provide garage space + electricity + daily monitoring for 50gal chest freezers. Keepers do NOT get keys — just space, power, and condition monitoring. Compensated at real-money Cost+20% (electricity + space + labor + 20%). Ambient 70°F reduces AC bill. LB pays percentage of house used (IRS home office rules). FULL BOUNTY — make money THIS WEEK.', 'Passive Income / Infrastructure', 'Bag 9', 'pending'),
  (1763, 'Multiplier Slot System', 'Modular role-slot architecture for cooperative Nodes. Required slots: Driver (delivery), Larder (storage/Keeper). Optional slots: Prep Helper, Prep Group, Provenance, Logistics. Each filled slot multiplies Node capacity. Same Crew Call pattern as modular manufacturing — claim roles based on existing expertise.', 'Role Architecture', 'Bag 9', 'pending'),
  (1764, 'Recipe Repository Free Tier — Contribution Conversion Funnel', 'Digital turnable-page cookbooks FREE to all (members and non-members). Linked grocery lists, printable copies with serving multiplier, LMD/Family Table links. Contributing a recipe requires $5/year membership — disclosed UPFRONT at start of contribution flow, never a gotcha. Natural acquisition funnel: browse free → contribute → membership.', 'Content / Acquisition', 'Bag 9', 'pending'),
  (1765, 'The Bridge — Node Captain Command Interface', 'Command interface for Node Captains: incoming order queue (accept/reject/schedule), inventory view across Keeper locations, Multiplier roster and availability, delivery routing, revenue/cost dashboard with Cost+20% verification. Named like a ship bridge — Captain commands from the Bridge.', 'Operations / Command', 'Bag 9', 'pending'),
  (1766, 'Triple Dip Earning Pattern', 'Single Node Captain earns from three simultaneous streams: (1) LGG Provenance (margin on goods), (2) Delivery (fee at Cost+20%), (3) Meal Prep (83.3% creator share). Three distinct services = three payments. Not exploitation — one person doing three jobs gets paid for three jobs. Reduces proportionally when Multipliers fill slots.', 'Economic Model', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
