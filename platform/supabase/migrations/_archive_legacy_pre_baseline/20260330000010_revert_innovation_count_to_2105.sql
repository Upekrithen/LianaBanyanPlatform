-- Revert unauthorized innovation count bump.
-- Innovations #2106-#2121 have no A&A formals filed.
-- Canonical count stays at 2,105 until proper documentation is produced.
UPDATE platform_canonical
SET value = 2105, updated_at = now()
WHERE key = 'innovation_count';
