-- K368: Media Publication Pitch Contacts — Opening Gambit Artillery
-- Session: K368 / B087 | April 7, 2026
-- 18 media pitches (13 publications + 5 podcasts) loaded into dispatch queue

INSERT INTO letter_dispatch_queue (
  recipient_name, recipient_email, backup_contact, phase, letter_category,
  subject_line, status, dispatch_method, notes, created_at
) VALUES
-- ═══════════════════════════════════════════════════════
-- Publication Pitches (13)
-- ═══════════════════════════════════════════════════════
('NYT Opinion Desk', 'oped@nytimes.com', NULL, 3, 'pitch',
 'Guest Essay Submission: A Considered Approach to Sustained Universal Economic Prosperity', 'draft', 'email',
 'Guest essay. 3-day response window per NYT policy. Attach trimmed "Considered Approach" paper.', now()),

('NYT Technology Desk', 'technology@nytimes.com', NULL, 3, 'pitch',
 '40,000 entrepreneurs lost their startup visas. A veteran in Texas built them a cooperative platform.', 'draft', 'email',
 'Canada 40K hook. Attach ARTICLE_CANADA_40K_RESCUE_FLEET.md.', now()),

('NYT Business Desk (Tip)', 'technology@nytimes.com', 'CC business desk', 3, 'pitch',
 'Tip: A Texas veteran has been writing letters to Warren Buffett about cooperative platform economics', 'draft', 'email',
 'Tip format. Attach LETTER_BUFFETT_FRENCH_FLEET_SEC_SAFE_V2.md.', now()),

('Joshua Rothman — The New Yorker', 'jrothman@newyorker.com', NULL, 3, 'pitch',
 'Pitch: A veteran father of eight, four AI agents named after chess pieces, and a cooperative platform built from a garage in Texas', 'draft', 'email',
 'Character-driven narrative. Attach Cardboard Boots letter + One Take Founder Office YouTube link. MUST be deeply narrative.', now()),

('Matteo Wong — The Atlantic', NULL, 'Direct pitch via LinkedIn or editorial contact', 3, 'pitch',
 'What if platforms had constitutions with immutable economic laws?', 'draft', 'email',
 'Attach ARTICLE_NOT_LEFT_OR_RIGHT_FORWARD.md + economic laws section.', now()),

('Wired Opinion Desk', 'opinion@wired.com', NULL, 3, 'pitch',
 'Complete draft: 12 Patents, Zero Investors — How Four AI Agents Built a Cooperative Platform', 'draft', 'email',
 'Wired requires complete drafts for op-eds. Send full piece.', now()),

('Rachel Courtland — MIT Tech Review', 'rachel.courtland@technologyreview.com', NULL, 3, 'pitch',
 'PITCH: The Three-Currency Cooperative — A Non-Speculative Digital Economy Architecture', 'draft', 'email',
 'Include PITCH in subject. Body of email, not attachment for initial pitch. Three-currency technical deep-dive.', now()),

('Fast Company Impact', 'submissions@fastcompany.com', 'Alt: arawlins@fastcompany.com', 3, 'pitch',
 'Impact Story: The 83.3% Platform — Where Every Transaction Shows the Math', 'draft', 'email',
 'Complete article attached, 700-1000 words as FC requires.', now()),

('Forbes Contributor Portal', NULL, 'forbes.com/contact portal', 3, 'pitch',
 '2,224 Innovations, 12 Patents — The Most Prolific Solo Founder in Cooperative Tech', 'draft', 'form',
 'Apply through contributor network. Data-backed article attached.', now()),

('Amanda Peacher — NPR Marketplace', 'apeacher@marketplace.org', NULL, 3, 'pitch',
 'Story Pitch: $5/Year Membership in a $500/Year Subscription World', 'draft', 'email',
 'Audio story angle. Sound elements: 3D printers, family dinner, AI agents. Available for in-home visit Converse TX.', now()),

('The Guardian US Tech', 'us-tech@theguardian.com', 'Alt: poppy.noor@theguardian.com (Opinion)', 3, 'pitch',
 'Hood Uber proves the need. A Texas veteran built the cooperative fix.', 'draft', 'email',
 'Guardian has cooperative ownership (Scott Trust). Natural alignment. Attach Pudding #23 + Kiko Martinez letter.', now()),

('Bloomberg Tech/Opinion', 'tech@bloomberg.net', 'Alt: bview@bloomberg.net', 3, 'pitch',
 'The economics of cooperative manufacturing: COGS $81.46/unit, Cost + 20% margin, 12 patents', 'draft', 'email',
 'Numbers-driven. Canister System COGS, patent portfolio, $525K personal commitment.', now()),

('NPR Planet Money', 'planetmoney@npr.org', NULL, 3, 'pitch',
 'Episode Pitch: Credits, Marks, and Joules — A Three-Currency Family Dinner', 'draft', 'email',
 'Audio narrative pitch. Family dinner as entry point to three-currency architecture.', now()),

('Rolling Stone Music Desk', NULL, 'tips@rollingstone.com (Pawn B61 follow-up needed)', 3, 'pitch',
 'A New Kind of Garage Band: JukeBox, the platform where artists keep 83.3%', 'draft', 'email',
 'JukeBox + One Take Wonders. Attach Taylor Swift letter + YouTube video + garage wall photo. Tim Ingham connection.', now()),

('Kaiser Health News / STAT News', NULL, 'Update with B61 contacts', 3, 'pitch',
 'A cooperative care economy platform — where caregivers keep 83.3% and the math is public', 'draft', 'email',
 'Healthcare angle. Jimmy Kimmel ACA advocacy + Ai-jen Poo NDWA. Attach Kimmel letter.', now()),

-- ═══════════════════════════════════════════════════════
-- Podcast Pitches (5)
-- ═══════════════════════════════════════════════════════
('Hard Fork (NYT Podcast)', 'hardfork@nytimes.com', NULL, 3, 'pitch',
 'Episode pitch: One founder, four AI agents, 2,224 innovations in five months', 'draft', 'email',
 'Best path is through Casey Newton engagement first. Reference his letter.', now()),

('Pivot — Kara Swisher', 'kara.swisher@wsj.com', 'Alt: doctorarzt@gmail.com', 3, 'pitch',
 '12 patents, $525K personal, zero investors — the anti-VC cooperative platform', 'draft', 'email',
 'Pitch Kara directly, not the show. She is also receiving a Phase 3 letter. Galloway platform monopoly work relevant.', now()),

('The Daily (NYT Podcast)', 'thedaily@nytimes.com', NULL, 3, 'pitch',
 '40,000 entrepreneurs lost their startup visas. A Texas veteran says: come build here.', 'draft', 'email',
 'Canada 40K news hook. Attach ARTICLE_CANADA_40K_RESCUE_FLEET.md.', now())

ON CONFLICT (recipient_name) DO UPDATE SET
  recipient_email = COALESCE(EXCLUDED.recipient_email, letter_dispatch_queue.recipient_email),
  backup_contact = COALESCE(EXCLUDED.backup_contact, letter_dispatch_queue.backup_contact),
  phase = EXCLUDED.phase,
  letter_category = EXCLUDED.letter_category,
  subject_line = EXCLUDED.subject_line,
  notes = EXCLUDED.notes,
  dispatch_method = EXCLUDED.dispatch_method,
  updated_at = now();

-- Note: Paris Marx and Douglas Rushkoff already exist in dispatch queue from K366
-- (Phase 3 as letter recipients). Their podcast pitches are SEPARATE from their letters.
-- The letters and podcast pitches should both be sent — letter first, podcast pitch as follow-up.
