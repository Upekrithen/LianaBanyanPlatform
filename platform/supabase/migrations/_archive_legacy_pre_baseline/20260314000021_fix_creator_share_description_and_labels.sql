-- Fix CREATOR_SHARE_PERCENT description: "Creator" → "Creators/Workers"
-- Also constitutionally locked and cannot be changed.
-- This makes clear the 83.3% applies to ALL members who create or work, not just "idea people."

UPDATE public.dna_lock
SET description = 'Creators/Workers keep 83.3% of every transaction. This number is constitutionally locked and cannot be changed.'
WHERE parameter_key = 'CREATOR_SHARE_PERCENT';
