-- Innovation Log: Session 11B Batch 7 — HexIsle/Tereno Compatibility Certification System
-- Innovations #1648-#1653 (6 new)
-- Source: Founder's HexIsle Compatible vs Tereno Certified concept, March 14, 2026
-- Threshed by Bishop

INSERT INTO public.innovation_log (innovation_number, title, description, category, patent_bag, status)
VALUES
  (1648, 'HexIsle/Tereno Six-Tier Compatibility Certification System', 'Six-level product certification hierarchy distinguishing between Tereno Certified (gold standard requiring lithographic manufacturing, compliant mechanisms, cost ceiling, correct dimensions, water safety, and full stack compatibility) and HexIsle Compatible (broader ecosystem of third-party products that work with the system but do not meet all Tereno requirements). Tiers: Crown Standard, Approved, Official, Compatible, Adaptable, Inspired.', 'HexIsle', 'Bag 9', 'pending'),
  (1649, 'Piggy-Back Ancillary Product Lines Protocol', 'Structured system for third-party makers to create ancillary products that integrate with the core Hexel system at various certification tiers. Makers submit designs, self-declare tier, receive validation, get IP ledger entry and appropriate tier sticker/badge. Revenue participation scales with certification tier. Prevents system-breaking additions (electronics near water) while encouraging innovation.', 'HexIsle', 'Bag 9', 'pending'),
  (1650, 'HexIsle Manufacturing Pipeline Crew Call Integration', 'Direct connection between modular manufacturing Crew Call system and the 27-piece Hexel Grammar, where each manufacturing process module maps to specific certification tiers it can produce (SLA/injection → Tier 1 Tereno Certified, FDM → Tier 3-4 HexIsle Official/Compatible). Makers claiming Crew Call roles automatically qualify to produce parts at the tier their process supports.', 'HexIsle', 'Bag 8', 'pending'),
  (1651, 'Tereno Certified Gold Standard Specification', 'Formal specification defining the requirements for Tereno Certified status: (1) lithographic single-piece manufacturing, (2) compliant mechanisms only — no magnets, no electronics, no separate moving parts, (3) cost per part under cooperative-set ceiling, (4) 60mm flat-to-flat dimensions, (5) water-safe materials, (6) full mechanical stack compatibility including hydraulic/pneumatic channels. Only parts meeting all six criteria qualify.', 'HexIsle', 'Bag 9', 'pending'),
  (1652, 'Tier-Scaled IP Ledger and Revenue Participation', 'IP recognition and revenue share system where maker compensation scales with their product certification tier. Tereno Certified (Tier 1) designs receive highest co-marketing and revenue participation. Each tier down receives proportionally less, but all tiers get permanent IP ledger entries. Includes tier upgrade path — refining a Tier 4 design to meet Tier 1 specs earns the higher designation and increased revenue share.', 'HexIsle', 'Bag 8', 'pending'),
  (1653, 'Anti-Breaking Certification Exclusion Rules', 'Formal exclusion criteria preventing certification at any tier for designs that: (1) include electronic components near water systems, (2) use water-soluble materials, (3) could physically damage other players certified pieces, (4) block or obstruct hydraulic/pneumatic channels. Protects system integrity while clearly communicating boundaries to third-party makers.', 'HexIsle', 'Bag 8', 'pending')
ON CONFLICT (innovation_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  patent_bag = EXCLUDED.patent_bag,
  status = EXCLUDED.status;

-- Update platform innovation count references
-- New total: 1,653 innovations
