-- Innovation Log: Session 11B Batch 6 — Modular Manufacturing & Crew Call
-- Innovations #1640-#1647 (8 new)
-- Source: Founder's modular manufacturing process path concept, March 14, 2026
-- Threshed by Bishop
-- NOTE: Content moved to migration 000011. This file retained for migration history consistency.

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1640, 'Modular Manufacturing Process Path System', 'Vertically integrated assembly line with modular switch-out modules for different manufacturing processes (slip casting, sand casting, SLS, SLA, injection mold, desktop extrusion). Each process module can be swapped in/out of the production line, allowing makers to pioneer their own process paths without rebuilding infrastructure.', 'Manufacturing', 'Bag 8', 'pending'),
  (1641, 'Crew Call Maker Recruitment Protocol', 'Recruitment system modeled on film production crew calls where makers with specific manufacturing skills are invited to claim roles in cooperative production. "We Need You To Do What You Are Already Good At" — targeted recruitment based on existing maker expertise rather than training from scratch.', 'Manufacturing', 'Bag 8', 'pending'),
  (1642, 'Process Pioneer IP Ledger Recognition', 'First-mover recognition system where makers who pioneer a specific manufacturing process category within the cooperative receive permanent IP ledger entries. Not exclusionary — establishes the pioneer as the recognized expert/originator for that process path within the platform.', 'Manufacturing', 'Bag 8', 'pending'),
  (1643, 'Primary/Secondary/Backup Role Assignment', 'Tiered commitment system for manufacturing process coverage where makers sign up as Primary (lead operator), Secondary (trained backup), or Backup (emergency/overflow) for each process module. Ensures production continuity and creates natural mentorship chains.', 'Manufacturing', 'Bag 7', 'pending'),
  (1644, '"We Need You" Cue Card for Process Recruitment', 'Targeted cue card variant: "We Need You To Do What You Are Already Good At" — surfaces when the platform identifies a gap in manufacturing process coverage. Directs makers to claim Primary/Secondary/Backup roles for specific processes they already have expertise in.', 'Manufacturing', 'Bag 8', 'pending'),
  (1645, '$5/Year Viral Cue Card Deck Membership Benefit', 'Annual $5 membership includes a complete deck of cue cards with viral marketing built in. Each card communicates a platform benefit and doubles as a shareable recruitment tool. The deck itself becomes a product that spreads platform awareness through physical distribution.', 'Marketing', 'Bag 8', 'pending'),
  (1646, 'Benefits Card Red Carpet Integration', 'Personalized Benefits Card displayed on Red Carpet onboarding pages showing the specific benefits available to the invited user based on their creator type, referral source, and available tier rewards. Adapts content dynamically based on URL parameters and referrer context.', 'Onboarding', 'Bag 8', 'pending'),
  (1647, 'Modular Vertical Integration with Substitutable Process Modules', 'Architecture for a complete vertical manufacturing stack where individual process modules (casting, printing, molding) are standardized interfaces that can be substituted without disrupting upstream/downstream steps. Enables cooperative to offer multiple manufacturing paths through the same pipeline infrastructure.', 'Manufacturing', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;

-- Update platform innovation count references
-- New total: 1,647 innovations
