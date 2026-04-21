-- K421 Task 3: Insert innovations #2266 and #2267 (renumbered from B109 drafts)
-- Source: BISHOP_DROPZONE/00_FOUNDER_REVIEW/INNOVATION_2244_2245_DRAFTS_B109.md
-- Founder greenlit B110: "How do I keep all 4?" — all four are distinct; renumber.
-- Original B109 #2244 → #2266 (Opt-In Member Documentation with Benefits)
-- Original B109 #2245 → #2267 (Member-Generated Guide Corpus)
-- B098 #2244 (IP Revenue Waterfall) and #2245 (Patron-Member Proximity Matching) KEPT AS-IS.
--
-- Duplicativeness check for #2267 vs B098 #2245:
--   B098 #2245 = "Patron-Member Proximity Matching" (algorithmic matching system)
--   B109 #2267 = "Member-Generated Guide Corpus" (searchable knowledge base of documented journeys)
--   DISTINCT: one is the matching algorithm, the other is the corpus it draws from.
-- Cluster: Open Water (#2240 parent)
-- CJ status: Candidate (Founder-ratified B110)

INSERT INTO innovation_log (
  innovation_number, title, description, category, status,
  is_crown_jewel, session_id, source_session
)
SELECT * FROM (VALUES
  (2266,
   'Opt-In Member Documentation with Benefits',
   'Members in Open Water engagements (Levels 0-6) are invited to document their journey as it unfolds. Participation is opt-in, never required. Documented journeys earn: Guide contribution credit (SAA on future engagements citing their journey), reputation flag ("Contributes to the commons"), Mark rewards per documented milestone, and priority Patron access. Feeds the Member-Generated Guide Corpus (#2267). Implements the member-side of "No Unwitnessed AI Output" applied to human mentorship.',
   'Member Engagement',
   'canonical',
   true,
   'B109',
   'B097'),
  (2267,
   'Member-Generated Guide Corpus',
   'Aggregated, editorialized, searchable body of documented member journeys fed by #2266 (Opt-In Documentation). Indexed by Level transition (0-1 through 5-6), Cold Start Pathway (Food, Manufacturing, Service, Local Business, Guild, Tribe), industry, and geography. Editorialized by Librarian layer. Tiered access: Pledge-Only (free for nonprofits/cooperatives/academics), Members ($5/yr included), Commercial (per-query subscription). Implements Peer-Proximity Expertise Matching (#2242) at corpus scale.',
   'Commons Infrastructure',
   'canonical',
   true,
   'B109',
   'B097')
) AS new_innovations(innovation_number, title, description, category, status, is_crown_jewel, session_id, source_session)
WHERE NOT EXISTS (
  SELECT 1 FROM innovation_log il
  WHERE il.innovation_number = new_innovations.innovation_number
);
