-- ═══════════════════════════════════════════════════════════════════════════════
-- INNOVATION LOG — Hexel Component Map (March 8, 2026)
-- Innovation #1536
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO innovation_log (innovation_number, title, description, category, session_tag) VALUES
(1536, 'Hexel Component Map & Power Transmission Architecture',
 'Complete CAD-to-code registry mapping Fusion 360 components to Hexel system roles. 27 identified components across structural, power transmission, seal, interface, mechanism, signal, terrain, valve, and anchor roles. Power transmission chain documented: Adjacent Hexel cavities → RingOfPower (seal) → oneWay (valve) → goldenLotus (toothed ring, inverse hydraulic → rotation) → Helical Gear (24R@30 m=2.15) → rotor12 → ouralis15 (wave driver) → BTHU_WATERFALL (sea level output). Power is REPURPOSABLE: same hydraulic energy can drive monster mechanisms, siege engines, drawbridges, or any custom mechanic instead of waves. CAD component families: checkIt05 (v112 complete assembly), WORKINGairPump (v19 pump assembly), FlyingButtress (v40 Slotted Top), threeSisters05 (rotor/ouralis/snapCap/sawtooth/goldenLotus). Canonical candidate tracking: currently 20 candidates, target ~18 pieces from 1200+ CAD models winnowed over 9 years.',
 'Architecture/Physical', 'Session 7E')

ON CONFLICT (innovation_number) DO NOTHING;

COMMENT ON TABLE public.innovation_log IS 'Complete verified innovation registry. Contains 1,536 innovations. Sources: Original Behemoth (1-53), Bags 5-10, BATCH files, filings, Feb-Mar 2026 sessions. RANGE: #1-#1536. Next: #1537.';
