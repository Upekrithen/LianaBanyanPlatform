-- K366: Opening Gambit Contact Database Load
-- Session: K366 / B087 | April 7, 2026
-- 43 verified contacts across 4 phases for letter dispatch

-- Add columns not in original K362 schema
ALTER TABLE letter_dispatch_queue ADD COLUMN IF NOT EXISTS backup_contact TEXT;
ALTER TABLE letter_dispatch_queue ADD COLUMN IF NOT EXISTS notes TEXT;

-- Expand dispatch_method CHECK to include 'form'
ALTER TABLE letter_dispatch_queue DROP CONSTRAINT IF EXISTS letter_dispatch_queue_dispatch_method_check;
ALTER TABLE letter_dispatch_queue ADD CONSTRAINT letter_dispatch_queue_dispatch_method_check
  CHECK (dispatch_method IN ('email', 'physical', 'both', 'form'));

-- Upsert 43 contacts organized by Opening Gambit phases
-- ON CONFLICT uses recipient_name — create unique index if not present
CREATE UNIQUE INDEX IF NOT EXISTS idx_ldq_recipient_name_unique
  ON letter_dispatch_queue (recipient_name);

INSERT INTO letter_dispatch_queue (
  recipient_name, recipient_email, backup_contact, phase, letter_category,
  subject_line, status, dispatch_method, notes, created_at
) VALUES
-- ═══════════════════════════════════════════════════════
-- Phase 1: The Board Table (9 contacts)
-- ═══════════════════════════════════════════════════════
('Melinda French Gates', 'info@pivotalventures.org', 'LinkedIn: linkedin.com/in/melindagates', 1, 'crown',
 'Liana Banyan — Global Women''s Initiative', 'draft', 'email', 'Pivotal Ventures contact form. Scott philanthropy overlap.', now()),

('Craig Newmark', 'craig.newmark@gmail.com', 'X: @craignewmark', 1, 'crown',
 'Liana Banyan — Infrastructure Partnership', 'draft', 'email', 'Public Gmail. Direct email.', now()),

('Erik Brynjolfsson', 'info@brynjolfsson.com', 'Assistant Matt Smith: erik.assistant@gmail.com', 1, 'academic',
 'Liana Banyan — Cooperative Platform Architecture', 'draft', 'email', 'WorkHelix co-founder. Mention McAfee (one-degree). LinkedIn active.', now()),

('Nathan Schneider', 'nathan.schneider@colorado.edu', 'Mastodon: @ntnsndr, Bluesky', 1, 'academic',
 'Liana Banyan — Platform Cooperativism', 'draft', 'email', 'CU Boulder. Mention Scholz. Mastodon active.', now()),

('Trebor Scholz', 'scholzt@newschool.edu', 'LinkedIn (Founder follows him)', 1, 'crown',
 'Liana Banyan — Crown Letter: Platform Cooperativism', 'draft', 'email', 'Crown Letter recipient. Founder follows on LinkedIn. The New School.', now()),

('Cory Doctorow', 'doctorow@craphound.com', 'Mastodon: @pluralistic, Pluralistic newsletter reply', 1, 'academic',
 'Liana Banyan — Anti-Extractive Platform Architecture', 'draft', 'email', 'Reply to Pluralistic newsletter is highest-probability channel.', now()),

('Daron Acemoglu', 'daron@mit.edu', 'Assistant Lauren Fahey via MIT Econ', 1, 'academic',
 'Liana Banyan — Institutional Economics of Cooperative Platforms', 'draft', 'email', '2024 Nobel laureate. Go through assistant.', now()),

('Yochai Benkler', 'ybenkler@law.harvard.edu', 'Alt: ybenkler@cyber.harvard.edu', 1, 'academic',
 'Liana Banyan — Commons-Based Peer Production', 'draft', 'email', 'Harvard Law / Berkman Klein Center.', now()),

('Julian Posada', 'julian.posada@yale.edu', 'LinkedIn active', 1, 'academic',
 'Liana Banyan — Digital Labor and Cooperative Economics', 'draft', 'email', 'Yale. Digital labor research.', now()),

-- ═══════════════════════════════════════════════════════
-- Phase 2: The Validators (14 contacts)
-- ═══════════════════════════════════════════════════════
('Antonio Casilli', 'antonio.casilli@telecom-paris.fr', 'Mastodon: @casilli', 2, 'academic',
 'Liana Banyan — INDL Conference Connection', 'draft', 'email', 'Telecom Paris. Mention INDL-9 Geneva.', now()),

('Paola Ricaurte Quijano', 'pricaurtequijano@cyber.harvard.edu', 'Alt: pricaurt@tec.mx', 2, 'academic',
 'Liana Banyan — Digital Labor and Global South', 'draft', 'email', 'Harvard Berkman Klein. Mention Posada + Benkler.', now()),

('Netsaalem Gebrie', 'netsaalem@mnmglobalpartners.com', 'LinkedIn', 2, 'academic',
 'Liana Banyan — Market Systems and Cooperative Economics', 'draft', 'email', 'MNM Global Partners. LinkedIn message as backup.', now()),

('Shoshana Zuboff', 'info@shoshanazuboff.com', 'Agent: cyao@thelavinagency.com', 2, 'academic',
 'Liana Banyan — Surveillance Capitalism Alternative', 'draft', 'email', 'Harvard emerita. Mention Benkler as Harvard peer.', now()),

('Kate Raworth', 'kate@kateraworth.com', 'DEAL form: doughnuteconomics.org/contact', 2, 'academic',
 'Liana Banyan — Doughnut Economics in Practice', 'draft', 'email', 'DEAL contact form preferred. Mention Mazzucato.', now()),

('Mariana Mazzucato', 'm.mazzucato@ucl.ac.uk', 'EA: iipp-director-pa@ucl.ac.uk', 2, 'academic',
 'Liana Banyan — Mission-Oriented Cooperative Economics', 'draft', 'email', 'Through EA. Mention Raworth.', now()),

('Juliet Schor', 'juliet.schor@bc.edu', 'X: @JulietSchor', 2, 'academic',
 'Liana Banyan — After the Gig: Cooperative Alternative', 'draft', 'email', 'Boston College. Mention Scholz/Schneider.', now()),

('Arun Sundararajan', 'asundara@stern.nyu.edu', 'X: @digitalarun', 2, 'academic',
 'Liana Banyan — Platform Economics', 'draft', 'email', 'NYU Stern. NYC + Scholz connection.', now()),

('Douglas Rushkoff', 'drushkoff@qc.cuny.edu', 'Substack: Team Human (reply)', 2, 'media',
 'Liana Banyan — Team Human: Cooperative Platform', 'draft', 'email', 'CUNY. Newsletter reply high-probability. Mention Newmark/CUNY.', now()),

('Howard Marks', 'hmarks@oaktreecapital.com', 'oaktreecapital.com/contact-us', 2, 'investor',
 'Liana Banyan — Differential Economics', 'draft', 'email', 'Reference Buffett + specific investor memos.', now()),

('Seth Godin', 'seth@sethgodin.com', 'sethgodin.com', 2, 'media',
 'Liana Banyan — Tribes in Practice', 'draft', 'email', 'Reads and replies to brief direct emails. Mention Rushkoff.', now()),

('Li Jin', 'li@variant.fund', 'Substack: Li''s Newsletter (reply)', 2, 'investor',
 'Liana Banyan — The Passion Economy, Built', 'draft', 'email', 'Substack reply or email. Mention Seibel/YC ecosystem.', now()),

('Anand Giridharadas', 'anand.giridharadas@gmail.com', 'Substack: The.Ink (reply)', 2, 'media',
 'Liana Banyan — Winners Take All: The Alternative', 'draft', 'email', 'Platform Coop Consortium member alongside Scholz.', now()),

('Esther Perel', 'kelley@estherperel.com', 'Alt: support@estherperel.com', 2, 'media',
 'Liana Banyan — Trust Architecture', 'draft', 'email', 'Through EA Kelley Rose. Mention Godin.', now()),

-- ═══════════════════════════════════════════════════════
-- Phase 3: The Amplifiers (14 contacts)
-- ═══════════════════════════════════════════════════════
('Kara Swisher', 'kara.swisher@wsj.com', 'Alt: doctorarzt@gmail.com, X: @karaswisher', 3, 'media',
 'Liana Banyan — Cooperative Platform vs. Enshittification', 'draft', 'email', 'Reference Casey Newton (one-degree).', now()),

('Ezra Klein', 'ezrakleinshow@nytimes.com', 'X: @ezraklein', 3, 'media',
 'Liana Banyan — Institutional Design for Abundance', 'draft', 'email', 'Show email. Pitch re: Abundance + cooperative institutions.', now()),

('Nilay Patel', 'nilay.patel@theverge.com', 'Alt: ndpatel88@gmail.com, X: @reckless', 3, 'media',
 'Liana Banyan — Platform Economy Architecture', 'draft', 'email', 'Reference Newton (former Verge colleague).', now()),

('Hank Green', 'hank.green@gmail.com', 'TikTok + YouTube (highly active)', 3, 'media',
 'Liana Banyan — Creator Sustainability, Built', 'draft', 'email', 'Direct email. Frame around creator economics.', now()),

('Paris Marx', 'paris@parismarx.com', 'Alt: marcperrotca@gmail.com', 3, 'media',
 'Liana Banyan — Tech That Actually Saves Us', 'draft', 'email', 'Reference Doctorow. Anti-extractive framing critical.', now()),

('Ed Zitron', 'ed@ezpr.com', 'Bluesky: @edzitron.com, TEXT: 347-844-2149', 3, 'media',
 'Liana Banyan — The Anti-Enshittification Platform', 'draft', 'email', 'Highly accessible. Bluesky DM or text.', now()),

('Brian Merchant', 'briancmerchant@gmail.com', 'Substack: Blood in the Machine (reply)', 3, 'media',
 'Liana Banyan — Labor and Technology', 'draft', 'email', 'Newsletter reply high-probability. Mention Rushkoff.', now()),

('Molly White', 'molly@mollywhite.net', 'Substack: Citation Needed (reply)', 3, 'media',
 'Liana Banyan — Transparent Cooperative Ledger', 'draft', 'email', 'Direct email. Reference Doctorow.', now()),

('Tim Ingham', 'tim@musicbizworld.com', 'Alt: tim@musicbizworldwide.com', 3, 'media',
 'Liana Banyan — JukeBox: Music Industry Architecture', 'draft', 'email', 'MBW founder. JukeBox as structural solution.', now()),

('Kiko Martinez', NULL, 'X: @cinesnobkiko, LinkedIn', 3, 'media',
 'Liana Banyan — A Local Veteran''s Cooperative Platform', 'draft', 'email', 'LOCAL — Hood Uber story. Veteran in Converse, TX.', now()),

('Ai-jen Poo', NULL, 'domesticworkers.org/contact, X: @aijenpoo', 3, 'media',
 'Liana Banyan — Care Economy Infrastructure', 'draft', 'form', 'NDWA contact form. Reference Scott funding of NDWA.', now()),

('Majora Carter', 'majora.carter@gmail.com', 'Alt: info@majoracartergroup.com', 3, 'media',
 'Liana Banyan — Community Infrastructure', 'draft', 'email', 'Reference Newmark community work.', now()),

('Simon Sinek', 'simon@startwithwhy.com', 'Alt: inspireme@simonsinek.com', 3, 'media',
 'Liana Banyan — Purpose-Driven Cooperative Architecture', 'draft', 'email', 'Business form or email. Mention Godin + Guild/Tribe.', now()),

-- ═══════════════════════════════════════════════════════
-- Phase 4: The Stars (6 contacts)
-- ═══════════════════════════════════════════════════════
('Taylor Swift', 'tree.paine@premiumpr.com', 'Alt: info@taylorswift.com (13 Mgmt)', 4, 'blessing',
 'Liana Banyan — JukeBox: The Ownership Endgame', 'draft', 'email', 'Publicist Tree Paine. JukeBox = her master recordings fight.', now()),

('Dolly Parton', 'info@ctkent.com', 'dollywoodfoundation.org/contact', 4, 'blessing',
 'Liana Banyan — Imagination and Cooperation', 'draft', 'email', 'Danny Nozell / CTK Mgmt + Dollywood Foundation. Mention Khan/education.', now()),

('Jimmy Kimmel', NULL, 'Publicist Lewis Kay (Kovert Creative), Agent James Dixon (WME)', 4, 'blessing',
 'Liana Banyan — Healthcare and Cooperative Care', 'draft', 'email', 'Through publicist. Connect to ACA advocacy.', now()),

('Pitbull', 'info@mr305.com', 'slamfoundation.org/contact', 4, 'blessing',
 'Liana Banyan — Latino Entrepreneurship and Education', 'draft', 'email', 'Mr. 305 + SLAM Foundation. SA connection + Latino veteran.', now()),

('Ziwe Fumudoh', 'zfumudoh@gmail.com', 'Agent: CAA', 4, 'blessing',
 'Liana Banyan — Culture and Cooperative Media', 'draft', 'email', 'Direct email. Cultural representation angle.', now()),

('Bambu Lab', 'contact@bambulab.com', 'Austin TX office — local', 4, 'partnership',
 'Liana Banyan — Manufacturing Partnership', 'draft', 'email', 'Austin TX office at 8000 Centre Park Dr. Local to you.', now())

ON CONFLICT (recipient_name) DO UPDATE SET
  recipient_email = COALESCE(EXCLUDED.recipient_email, letter_dispatch_queue.recipient_email),
  backup_contact = EXCLUDED.backup_contact,
  phase = EXCLUDED.phase,
  letter_category = EXCLUDED.letter_category,
  subject_line = EXCLUDED.subject_line,
  notes = EXCLUDED.notes,
  dispatch_method = EXCLUDED.dispatch_method,
  updated_at = now();
