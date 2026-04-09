-- B083: Register 5 new Circle 2 academic letters + 1 response
-- All DRAFT status — awaiting Founder review + lock
-- Session: B083 | Date: 2026-04-06

INSERT INTO cephas_content_registry (
  slug, title, category, subcategory, style, source_path,
  implementation_status, bishop_session, content_markdown
)
VALUES
  (
    'letter-andrew-mcafee',
    'Letter to Andrew McAfee — The Geek Way Applied to Cooperative Economics',
    'outreach_letter',
    'circle-3-academics',
    'pudding',
    'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-ANDREW-MCAFEE.md',
    'planned',
    'B083',
    'Draft — full content in BISHOP_DROPZONE/06_Letters/LETTER_ANDREW_MCAFEE_B083.md. Pending Founder review.'
  ),
  (
    'letter-chad-jones',
    'Letter to Chad Jones — Weak Links as Value Creation Locus',
    'outreach_letter',
    'circle-3-academics',
    'pudding',
    'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-CHAD-JONES.md',
    'planned',
    'B083',
    'Draft — full content in BISHOP_DROPZONE/06_Letters/LETTER_CHAD_JONES_B083.md. Pending Founder review.'
  ),
  (
    'letter-christopher-tonetti',
    'Letter to Christopher Tonetti — Non-Rival Ideas in Cooperative Architecture',
    'outreach_letter',
    'circle-3-academics',
    'pudding',
    'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-CHRISTOPHER-TONETTI.md',
    'planned',
    'B083',
    'Draft — full content in BISHOP_DROPZONE/06_Letters/LETTER_CHRISTOPHER_TONETTI_B083.md. Pending Founder review.'
  ),
  (
    'letter-daniel-rock',
    'Letter to Daniel Rock — AI Productivity Data from One-Founder Production',
    'outreach_letter',
    'circle-3-academics',
    'pudding',
    'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-DANIEL-ROCK.md',
    'planned',
    'B083',
    'Draft — full content in BISHOP_DROPZONE/06_Letters/LETTER_DANIEL_ROCK_B083.md. Pending Founder review.'
  ),
  (
    'letter-ethan-mollick',
    'Letter to Ethan Mollick — Keep AI Weird Applied to Platform Architecture',
    'outreach_letter',
    'circle-3-academics',
    'pudding',
    'Cephas/cephas-hugo/content/letters/circle-3-academics/LETTER-ETHAN-MOLLICK.md',
    'planned',
    'B083',
    'Draft — full content in BISHOP_DROPZONE/06_Letters/LETTER_ETHAN_MOLLICK_B083.md. Pending Founder review.'
  ),
  (
    'response-mcafee-newsletter',
    'Public Response to McAfee Newsletter — This Week in Putting AI to Work',
    'outreach_letter',
    'circle-3-academics',
    'pudding',
    'Cephas/cephas-hugo/content/letters/circle-3-academics/RESPONSE-MCAFEE-NEWSLETTER.md',
    'planned',
    'B083',
    'Draft — full content in BISHOP_DROPZONE/06_Letters/RESPONSE_MCAFEE_NEWSLETTER_B083.md. Pending Founder review.'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  style = EXCLUDED.style,
  source_path = EXCLUDED.source_path,
  implementation_status = EXCLUDED.implementation_status,
  bishop_session = EXCLUDED.bishop_session,
  content_markdown = EXCLUDED.content_markdown,
  updated_at = now();

-- Update letter count in canonical
UPDATE platform_canonical SET value = '108', updated_at = now()
WHERE key = 'letter_count';
