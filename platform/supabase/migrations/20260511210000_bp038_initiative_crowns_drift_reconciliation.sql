-- BP038 Initiative Crowns Drift Reconciliation
-- Author: Knight (Cursor) executing PROMPT_KNIGHT_B_INITIATIVE_CROWNS_DRIFT_RECONCILIATION_BP038
-- Purpose: Write 5 canon-locked Crown assignments to live substrate
-- Result after this migration: 14/16 Initiatives have Crown rows
--   Remaining without: #2 Let's Get Groceries (TBD), #6 Tatiana Schlossberg (TRIBUTE-class)
-- Date: 2026-05-11

-- ===========================================================================
-- Write 1: #4 Household Concierge ← Marie Kondo (NEW BP038 lock)
-- Source: Founder direct BP038 — KonMari method; household transformation
-- ===========================================================================
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Marie Kondo', 'Crown (Household Transformer)', 'pending', 1
FROM public.initiatives i WHERE i.initiative_number = 4
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status;

-- ===========================================================================
-- Write 2: #7 MSA ← Cathie Mahon (BP035 OVERNIGHT lock)
-- Source: BP035 OVERNIGHT FINAL REPORT line 19 — MSA = Medical Savings Accounts
-- Mahon: CEO, National Federation of Community Development Credit Unions
-- ===========================================================================
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Cathie Mahon', 'Crown', 'pending', 1
FROM public.initiatives i WHERE i.initiative_number = 7
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status;

-- ===========================================================================
-- Write 3: #10 VSL ← Jessica Jackley (BP035 OVERNIGHT lock; Mahon moves to #7)
-- Step A: Remove Mahon from #10 (she is now correctly placed at #7 MSA)
-- Source: BP035 OVERNIGHT FINAL REPORT line 19; Jackley = Kiva co-founder;
--         VSL = Village Savings & Loan = peer-to-peer cooperative finance
-- ===========================================================================
DELETE FROM public.initiative_crowns
WHERE initiative_id IN (SELECT id FROM public.initiatives WHERE initiative_number = 10)
  AND crown_name = 'Cathie Mahon';

-- Step B: Insert Jackley at #10
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Jessica Jackley', 'Crown', 'pending', 1
FROM public.initiatives i WHERE i.initiative_number = 10
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status;

-- ===========================================================================
-- Write 4: #11 Let's Make Bread ← Muhammad Yunus (NEW BP038 lock)
-- Source: Founder direct BP038 — "Bread" = money; Grameen Bank; microfinance
-- Yunus = Nobel Laureate; cooperative finance macro-institutional counterpart
-- to Jackley's peer-to-peer model at #10 VSL
-- ===========================================================================
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Muhammad Yunus', 'Crown (Cooperative Finance Founder)', 'pending', 1
FROM public.initiatives i WHERE i.initiative_number = 11
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET crown_status = EXCLUDED.crown_status;

-- ===========================================================================
-- Write 5: #13 JukeBox ← Taylor Swift (LOCKED Cephas Crown letter)
-- Source: Cephas Crown letter live since B041 (2026-03-29); status = 'offered'
--         (letter IS the offer); unlocks CROWN-JUKEBOX-001 golden key
-- Substrate has been canon-lagging since B041 — closing the gap now
-- ===========================================================================
INSERT INTO public.initiative_crowns (initiative_id, crown_name, crown_title, crown_status, crown_order)
SELECT i.id, 'Taylor Swift', 'Maestro Mentor, Lady Banyan of the Stage, First Voice of the JukeBox Initiative', 'offered', 1
FROM public.initiatives i WHERE i.initiative_number = 13
ON CONFLICT (initiative_id, crown_name) DO UPDATE SET
  crown_status = EXCLUDED.crown_status,
  crown_title = EXCLUDED.crown_title;
