-- ═══════════════════════════════════════════════════════════════════════════════
-- INNOVATION LOG — Session 7B Additions (#1498-#1510)
-- March 8, 2026
-- ═══════════════════════════════════════════════════════════════════════════════
-- Treasure Key Content System + Battery Campaign + Content Pipeline
-- Cascade Trigger: "Treasure Keys should be in ALL content"
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1498, 'Treasure Key Content Embedding System',
   'Auto-embedding hidden treasure keys across all content types with path-based registry mapping. Content creators define key placements via CONTENT_KEY_MAP, and the system automatically associates hiding methods (embedded, hidden_text, cipher, puzzle) with document paths.',
   'Content/Gamification', 'TK-001', 'new'),

  (1499, 'Content Key Registry Architecture',
   'Static compile-time path-to-key mapping using TypeScript Record type. Each content path maps to an array of KeyPlacement objects specifying keyWord, method, position, and optional CSS class. Components query the registry at render time.',
   'Architecture', 'TK-002', 'new'),

  (1500, 'TreasureKeyIndicator Drop-in Component',
   'Three-variant React component (floating/inline/minimal) for treasure key discovery and submission. Floating variant: bottom-right pulsing golden key with expandable drawer. Inline variant: collapsible section within content. Minimal variant: single-line indicator. All variants support real-time key submission with toast feedback.',
   'UX/Gamification', 'TK-003', 'new'),

  (1501, 'Acrostic Phrase Generator for Cipher Keys',
   'Algorithmic generation of natural-sounding phrases where the first letter of each word spells the hidden key word. Uses a word bank organized by letter with contextually appropriate words (e.g., C=Communities/Creating/Collective). Enables automated cipher key creation for any content.',
   'Gamification/Encryption', 'TK-004', 'new'),

  (1502, 'Multi-Campaign Battery Dispatch Architecture',
   'Extensible union type campaign system that scales from 2 to N campaigns. CampaignType union type, CAMPAIGNS array, and dynamic rendering/preview logic all extend automatically when new campaigns are added. Single TheBattery component handles all campaign types.',
   'Architecture/Social', 'TK-005', 'new'),

  (1503, 'Tonal Arc Day Theming for Social Campaigns',
   'Named day themes with color-coded visual progression for multi-day social media campaigns. Each day has a theme name (e.g., Broken Petitions, Effort Democracy) and associated color. The arc tells a narrative story across the campaign duration.',
   'Social/UX', 'TK-006', 'new'),

  (1504, 'Grassroots Intelligence 5-Day Campaign',
   '15-post civic engagement Battery dispatch across Twitter, LinkedIn, Bluesky, Reddit, Medium, and Hacker News. 5-day tonal arc from "Broken Petitions" through "Join the Expedition". Content draws from 4 academic papers on civic engagement and effort-weighted democracy.',
   'Civic/Social', 'TK-007', 'new'),

  (1505, 'Three-Tier Reading Level Content Pipeline',
   'Academic/freshman/sixth-grade source path system for all papers. Each EconomicPaper object carries academicSource, tldrSource, and sixthGradeSource paths pointing to markdown files. ReadingLevelSelector component switches between tiers with appropriate icons.',
   'Content/Education', 'TK-008', 'new'),

  (1506, 'Paper Cross-Referencing via relatedPapers',
   'Bidirectional paper linking in the EconomicPaper data model. Each paper carries a relatedPapers array of IDs. The PaperPage component resolves related papers and displays them as navigable cards at the bottom of each paper view.',
   'Data Architecture', 'TK-009', 'new'),

  (1507, 'Social Post Key Challenge Generation',
   'Treasure key challenges appended to Battery campaign posts. generateKeyChallenge() produces a teaser line with hint text, directing readers to the Golden Key Quest page. Adds gamification layer to social media content without disrupting the post message.',
   'Gamification/Social', 'TK-010', 'new'),

  (1508, 'Content-Aware Key Difficulty Calibration',
   'Circle/tier/feather scaling by content type. Academic papers get higher-difficulty keys (circle 2-3, epic/legendary, 100-300 feathers). Sixth-grade versions get easier keys (circle 1, common, 25 feathers). Campaign posts get medium difficulty. Calibration ensures appropriate challenge for each audience.',
   'Gamification/Design', 'TK-011', 'new'),

  (1509, 'Canal Quarter Walk Path Key Integration',
   'Golden keys hidden on winding walk paths to gondola-only venues in HexIsle Canal Quarter. Players choosing the walk route (vs paying for gondola) discover keys along the path. Incentivizes exploration over convenience.',
   'Gaming/Gamification', 'TK-012', 'new'),

  (1510, 'Pipe Portal Subway Key Discovery',
   'Treasure keys embedded in the Pipe Portal transit system exploration. Keys discovered at pipe stations, on transit between stops, or by learning the skill required for free passage. Connects the subway navigation system to the treasure hunt.',
   'Gaming/Gamification', 'TK-013', 'new')

ON CONFLICT (innovation_number) DO NOTHING;

-- Update the table comment
COMMENT ON TABLE public.innovation_log IS 'Complete verified innovation registry. Contains 1,510 innovations. Sources: Original Behemoth (1-53), Bags 5-10, BATCH files, filings, Feb-Mar 2026 sessions. RANGE: #1-#1510. Next: #1511.';
