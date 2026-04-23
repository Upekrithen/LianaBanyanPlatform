-- Session 11B Batch 6: Modular Manufacturing, Crew Call, Cue Card Deck (#1640-#1647)
INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1640, 'Modular Manufacturing Process Path System (Bag 8)', 'Process modules (additive, subtractive, casting, molding, assembly, finishing) with equipment and skill levels for cooperative manufacturing.', 'Manufacturing', 'Bag 8', 'pending'),
  (1641, 'Crew Call Maker Recruitment Protocol (Bag 8)', 'Recruitment protocol for makers to claim Primary/Secondary/Backup roles on manufacturing process modules.', 'Manufacturing', 'Bag 8', 'pending'),
  (1642, 'Process Pioneer IP Ledger Recognition (Bag 8)', 'Recognition ledger for first movers and pioneers on process modules with Marks reward.', 'Manufacturing', 'Bag 8', 'pending'),
  (1643, 'Primary/Secondary/Backup Role Assignment (Bag 7)', 'Role levels for crew call: Primary, Secondary, Backup with configurable limits per process.', 'Manufacturing', 'Bag 7', 'pending'),
  (1644, '"We Need You" Cue Card for Process Recruitment (Bag 8)', 'Cue card for recruiting makers: "We need you to do what you''re already good at." Links to Crew Call.', 'Marketing', 'Bag 8', 'pending'),
  (1645, '$5/Year Viral Cue Card Deck Membership Benefit (Bag 8)', 'Viral Cue Card Deck as $5/year membership benefit in Credits; browsable collection of all cue cards.', 'Marketing', 'Bag 8', 'pending'),
  (1646, 'Benefits Card Red Carpet Integration (Bag 8)', 'Cue cards and benefits cards integrated with Red Carpet referral flow and shareable links.', 'Marketing', 'Bag 8', 'pending'),
  (1647, 'Modular Vertical Integration with Substitutable Process Modules (Bag 9)', 'Vertical integration where process modules can be substituted; modular manufacturing architecture.', 'Manufacturing', 'Bag 9', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;
