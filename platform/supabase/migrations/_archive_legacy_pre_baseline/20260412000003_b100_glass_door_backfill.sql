-- K412 Glass Door: Backfill existing Crown letters into outreach_letters
-- Run once after K412 migration applied. B100.

INSERT INTO outreach_letters (slug, recipient_name, recipient_category, recipient_tier, state, full_text, what_we_are_asking, voting_mode, scheduled_dispatch, dispatched_at, source_letter_file)
SELECT
    -- Generate slug from recipient_name
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(recipient_name), '[^a-zA-Z0-9\s-]', '', 'g'), '[\s]+', '-', 'g')),
    recipient_name,
    -- Map letter_category to valid recipient_category enum
    CASE
        WHEN letter_category IN ('crown', 'Crown Leadership', 'blessing') THEN 'crown_letter'
        WHEN letter_category IN ('academic', 'Academic Partnership') THEN 'research_invitation'
        WHEN letter_category IN ('media', 'Press & Media') THEN 'media_pitch'
        WHEN letter_category IN ('partnership', 'Strategic Partnership') THEN 'partnership_ask'
        WHEN letter_category IN ('investor', 'pitch') THEN 'patron_outreach'
        WHEN letter_category IN ('Family', 'Family / Pioneer') THEN 'other'
        ELSE 'crown_letter'
    END,
    COALESCE(phase, 1),
    CASE
        WHEN status = 'draft' THEN 'draft'
        WHEN status = 'queued' THEN 'scheduled'
        ELSE 'dispatched'
    END,
    COALESCE(letter_body, custom_intro, '(Full text in letter_dispatch_queue)'),
    'A personal letter from the Founder of Liana Banyan to ' || recipient_name || '.',
    'advisory',
    created_at,
    sent_at,
    'letter_dispatch_queue.id=' || id::text
FROM letter_dispatch_queue
WHERE status IN ('draft', 'queued', 'sent', 'bounced')
ON CONFLICT (slug) DO NOTHING;
