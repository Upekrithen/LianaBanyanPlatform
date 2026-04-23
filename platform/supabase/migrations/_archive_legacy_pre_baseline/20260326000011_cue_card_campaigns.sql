-- Cue Card Campaign System (#1945)
CREATE TABLE IF NOT EXISTS cue_card_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  craft_type TEXT NOT NULL,
  description_template TEXT NOT NULL,
  icon TEXT DEFAULT '🎨',

  -- Default pricing
  recommended_backing_min INT DEFAULT 100,
  recommended_backing_max INT DEFAULT 1000,
  early_adopter_slots INT DEFAULT 50,

  -- Production path
  default_production_path TEXT NOT NULL,

  -- Template fields
  suggested_categories TEXT[] DEFAULT '{}',
  marketing_copy_template TEXT,
  tip_text TEXT,

  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cue_card_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active cue cards" ON cue_card_campaigns FOR SELECT USING (is_active = true);

-- Add foreign key to turnkey_projects
ALTER TABLE turnkey_projects
  ADD CONSTRAINT fk_cue_card
  FOREIGN KEY (cue_card_id) REFERENCES cue_card_campaigns(id);

-- Seed: 7 Cue Cards
INSERT INTO cue_card_campaigns (title, slug, craft_type, icon, description_template, default_production_path, recommended_backing_min, recommended_backing_max, suggested_categories, marketing_copy_template, tip_text, sort_order) VALUES
(
  'Terrain for Fun & Profit',
  'terrain-fun-profit',
  'Tabletop Terrain',
  '🏰',
  'I make [TERRAIN TYPE] for tabletop gaming. My design features [KEY FEATURE] and is compatible with [GAME SYSTEM / SCALE].',
  'SLA prototype → SLS mold → injection mold',
  200, 1000,
  ARRAY['tabletop', 'terrain', '3d-printing', 'gaming'],
  'Level up your tabletop with handcrafted terrain. Each piece is designed for easy printing and built to last.',
  'Upload your STL — Early Adopters can print it themselves while you build toward injection molding.',
  1
),
(
  'Knife Sheaths & Leather',
  'knife-sheaths-leather',
  'Leather Goods',
  '🔪',
  'I craft [LEATHER ITEM TYPE] using [LEATHER TYPE]. Each piece is [HAND-STITCHED / TOOLED / MOLDED] and designed for [USE CASE].',
  'Hand prototype → pattern template → batch production',
  50, 500,
  ARRAY['leather', 'knives', 'handmade', 'edc'],
  'Handcrafted leather goods made to order. Quality materials, honest pricing, built to last a lifetime.',
  'Your dad''s knife sheaths are the proof-of-concept story. Start with what you already make.',
  2
),
(
  'Local Kitchen to Market',
  'local-kitchen-market',
  'Food & Kitchen',
  '🍳',
  'I make [FOOD PRODUCT] using [KEY INGREDIENTS / METHOD]. Available for [LOCAL DELIVERY / PICKUP / SHIPPING].',
  'Recipe development → health permit → storefront listing',
  100, 500,
  ARRAY['food', 'local', 'kitchen', 'meal-prep'],
  'From our kitchen to your table. Fresh, local, made with care.',
  'Check local cottage food laws — many states allow home kitchen sales under a certain revenue threshold.',
  3
),
(
  'Custom Jewelry',
  'custom-jewelry',
  'Jewelry & Accessories',
  '💎',
  'I create [JEWELRY TYPE] using [MATERIALS]. Each piece is [HANDMADE / CAST / 3D-PRINTED] and features [SIGNATURE STYLE].',
  'Wax prototype → casting → small batch',
  100, 750,
  ARRAY['jewelry', 'accessories', 'handmade', 'custom'],
  'Unique jewelry designed and crafted by hand. No two pieces are exactly alike.',
  'Wax carving or 3D-printed wax models let you prototype fast before committing to casting.',
  4
),
(
  'Board Game Launch',
  'board-game-launch',
  'Tabletop Games',
  '🎲',
  'I designed [GAME NAME], a [GAME TYPE] game for [PLAYER COUNT] players. It features [CORE MECHANIC] and plays in [TIME].',
  'PnP prototype → offset print run → fulfillment',
  300, 2000,
  ARRAY['board-games', 'tabletop', 'card-games', 'gaming'],
  'A new tabletop experience from an independent designer. Playtested, refined, ready for your table.',
  'Start with a Print-and-Play version for Early Adopters — it validates demand AND gives you playtest feedback.',
  5
),
(
  'Woodworking Workshop',
  'woodworking-workshop',
  'Wood Products',
  '🪵',
  'I build [WOOD PRODUCT] from [WOOD TYPE]. Each piece is [CNC-CUT / HAND-CARVED / TURNED] and finished with [FINISH TYPE].',
  'Shop prototype → CNC template → batch production',
  150, 1000,
  ARRAY['woodworking', 'furniture', 'handmade', 'cnc'],
  'Solid wood, honest craftsmanship. Built in my shop, shipped to your door.',
  'CNC templates let other makers in the network reproduce your design at scale — you earn from every unit.',
  6
),
(
  'Digital Design',
  'digital-design',
  'Digital Assets',
  '🎨',
  'I create [DIGITAL PRODUCT TYPE] for [USE CASE]. Formats include [FILE FORMATS]. [LICENSE TYPE] license included.',
  'Create → list → deliver (no physical production)',
  25, 200,
  ARRAY['digital', 'design', 'templates', 'assets'],
  'Professional digital assets ready to download. Created by an independent designer, priced fairly.',
  'Digital products have zero production cost after creation — your Early Adopter tier is pure margin.',
  7
);
