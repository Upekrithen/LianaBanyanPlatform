-- BP039 Part 4: Initiative #6 Name Drift Reconciliation
-- Canonical: "Tatiana Schlossberg Health Accords"
-- Corrects any drift from legacy "Lifeline Medications Access" references

-- ============================================================================
-- UPDATE: initiative_name column
-- ============================================================================
UPDATE public.initiatives
SET initiative_name = 'Tatiana Schlossberg Health Accords'
WHERE initiative_number = 6
  AND initiative_name IS DISTINCT FROM 'Tatiana Schlossberg Health Accords';

-- ============================================================================
-- CONDITIONAL UPDATE: display_name column (if exists)
-- ============================================================================
DO $$
BEGIN
    -- Check if display_name column exists and update if present
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'initiatives'
          AND column_name = 'display_name'
    ) THEN
        UPDATE public.initiatives
        SET display_name = 'Tatiana Schlossberg Health Accords'
        WHERE initiative_number = 6
          AND display_name IS DISTINCT FROM 'Tatiana Schlossberg Health Accords';

        RAISE NOTICE 'Updated display_name for initiative #6';
    ELSE
        RAISE NOTICE 'Column display_name does not exist, skipping';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the update:
-- SELECT initiative_number, initiative_name, display_name
-- FROM public.initiatives
-- WHERE initiative_number = 6;

-- ============================================================================
-- FRONTEND CODE SEARCH SNIPPET (PowerShell)
-- ============================================================================
-- Execute in PowerShell from workspace root to find any lingering references:
--
-- Get-ChildItem -Path "platform\src" -Recurse -Include *.ts,*.tsx,*.js,*.jsx,*.vue,*.svelte |
--   Select-String -Pattern "lifeline.medications|Lifeline.Medications" -CaseSensitive:$false |
--   Select-Object -Property Path, LineNumber, Line |
--   Format-Table -AutoSize
--
-- Also check for initiative #6 references by old name:
--
-- Get-ChildItem -Path "platform\src" -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
--   Select-String -Pattern "initiative.?(?:name|title|label).*lifeline|lifeline.*access" -CaseSensitive:$false |
--   Select-Object -Property Path, LineNumber, Line |
--   Format-Table -AutoSize
--
-- Recommended: Also grep coalition configuration files:
--
-- Get-ChildItem -Path "platform\src" -Recurse -Include *coalition*.ts,*coalition*.tsx,*initiative*.ts |
--   Select-String -Pattern "^\s*6\s*[:|]|initiative_number.*6" |
--   Select-Object -Property Path, LineNumber, Line
