-- Treasure Maps: per-craft mini-business plans (K118)
-- Separate from existing treasure_map_progress (quiz-based) in 20260322000010

CREATE TABLE IF NOT EXISTS craft_treasure_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  craft_type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🗺️',

  steps JSONB NOT NULL DEFAULT '[]',

  cue_card_slug TEXT,
  recommended_products JSONB DEFAULT '[]',

  startup_cost_low INT,
  startup_cost_high INT,
  first_sale_timeline TEXT,
  projected_monthly_low INT,
  projected_monthly_high INT,

  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  time_commitment TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE craft_treasure_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view craft treasure maps" ON craft_treasure_maps FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS craft_treasure_map_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  treasure_map_id UUID REFERENCES craft_treasure_maps(id) ON DELETE CASCADE NOT NULL,
  current_step INT DEFAULT 0,
  completed_steps JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, treasure_map_id)
);

ALTER TABLE craft_treasure_map_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own craft map progress" ON craft_treasure_map_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view craft map progress counts" ON craft_treasure_map_progress FOR SELECT USING (true);

INSERT INTO craft_treasure_maps (craft_type, title, slug, tagline, icon, difficulty, time_commitment, startup_cost_low, startup_cost_high, first_sale_timeline, projected_monthly_low, projected_monthly_high, steps) VALUES
('terrain', 'Terrain Maker''s Treasure Map', 'terrain-maker', 'From foam to funded: your path to selling custom terrain', '🏔️', 'beginner', '5-10 hours/week', 50, 300, '2-3 weeks', 200, 1500,
 '[{"order":1,"title":"Gather Materials","description":"Foam, paint, flocking, glue. Start with what you have.","link":"/marketplace?category=terrain","time_estimate":"1 day","cost_estimate":"$50-100"},{"order":2,"title":"Build Your First Piece","description":"Pick a terrain type. Build one hero piece. Photograph it.","link":"/cue-cards/campaigns/terrain-tiles","time_estimate":"2-3 days","cost_estimate":"$0"},{"order":3,"title":"Launch Your Turn-Key Project","description":"Use the Terrain Cue Card to set up your project in under 10 minutes.","link":"/projects/create?cue_card=terrain-tiles","time_estimate":"10 min","cost_estimate":"$0"},{"order":4,"title":"Share on r/TerrainBuilding","description":"Post your piece. Link to your project page. Let the community react.","link":"https://reddit.com/r/TerrainBuilding","time_estimate":"15 min","cost_estimate":"$0"},{"order":5,"title":"Hit 50 Backers","description":"Your Early Adopter tier. Once you hit 50, production pricing kicks in.","link":"/projects","time_estimate":"1-2 weeks","cost_estimate":"$0"}]'),
('leather', 'Leather Crafter''s Treasure Map', 'leather-crafter', 'From hide to hustle: turn leather skills into a funded product line', '🧵', 'intermediate', '10-15 hours/week', 200, 800, '3-4 weeks', 500, 3000,
 '[{"order":1,"title":"Source Your Leather","description":"Find your supplier. Tandy, local tannery, or wholesale.","link":"/marketplace?category=leather","time_estimate":"2-3 days","cost_estimate":"$200-500"},{"order":2,"title":"Create a Sample","description":"Make one finished piece. Photograph from multiple angles.","link":"/cue-cards/campaigns/leather-goods","time_estimate":"3-5 days","cost_estimate":"$50-100"},{"order":3,"title":"Set Up Your Turn-Key Project","description":"Use the Leather Cue Card. Add photos, set backing tiers.","link":"/projects/create?cue_card=leather-goods","time_estimate":"10 min","cost_estimate":"$0"},{"order":4,"title":"Connect Your Existing Shop","description":"Link your Etsy, website, or social. Bridge-to-Local brings customers.","link":"/network","time_estimate":"15 min","cost_estimate":"$0"},{"order":5,"title":"Hit Your First Tier","description":"50 backers = production pricing. 500 = wholesale rates.","link":"/projects","time_estimate":"2-4 weeks","cost_estimate":"$0"}]'),
('kitchen', 'Kitchen Creator''s Treasure Map', 'kitchen-creator', 'From recipe to revenue: launch your food product', '🍳', 'beginner', '8-12 hours/week', 100, 500, '2-3 weeks', 300, 2000,
 '[{"order":1,"title":"Perfect Your Recipe","description":"Nail down the recipe. Test it. Get feedback from friends.","link":"/cue-cards/campaigns/kitchen-crafts","time_estimate":"1 week","cost_estimate":"$50-100"},{"order":2,"title":"Check Local Regulations","description":"Cottage food laws vary by state. Know what you can sell.","link":"/network","time_estimate":"1-2 days","cost_estimate":"$0-50"},{"order":3,"title":"Package and Photograph","description":"Simple, clean packaging. Good photos sell food.","link":"/marketplace","time_estimate":"2-3 days","cost_estimate":"$50-200"},{"order":4,"title":"Launch Your Turn-Key Project","description":"Kitchen Crafts Cue Card walks you through it.","link":"/projects/create?cue_card=kitchen-crafts","time_estimate":"10 min","cost_estimate":"$0"},{"order":5,"title":"Hit 50 Pre-Orders","description":"Early Adopter milestone. Proof your product has demand.","link":"/projects","time_estimate":"1-2 weeks","cost_estimate":"$0"}]'),
('jewelry', 'Jewelry Maker''s Treasure Map', 'jewelry-maker', 'From bench to business: your handcrafted jewelry path', '💎', 'intermediate', '10-15 hours/week', 300, 1500, '3-4 weeks', 500, 4000,
 '[{"order":1,"title":"Set Up Your Bench","description":"Tools, materials, workspace. Start small, grow into it.","link":"/marketplace?category=jewelry","time_estimate":"3-5 days","cost_estimate":"$300-1000"},{"order":2,"title":"Create a Collection","description":"3-5 pieces that tell a story. Photograph each beautifully.","link":"/cue-cards/campaigns/artisan-jewelry","time_estimate":"1-2 weeks","cost_estimate":"$100-300"},{"order":3,"title":"Launch With a Cue Card","description":"Artisan Jewelry template sets up everything.","link":"/projects/create?cue_card=artisan-jewelry","time_estimate":"10 min","cost_estimate":"$0"},{"order":4,"title":"Share Your Story","description":"People buy stories, not just jewelry. Share your process.","link":"/marketplace","time_estimate":"30 min","cost_estimate":"$0"},{"order":5,"title":"Scale Through Tiers","description":"50 → 500 → 5K. Each tier unlocks better production rates.","link":"/projects","time_estimate":"2-4 weeks","cost_estimate":"$0"}]'),
('board_games', 'Board Game Designer''s Treasure Map', 'board-game-designer', 'From prototype to production: launch your tabletop game', '🎲', 'advanced', '15-20 hours/week', 500, 3000, '4-8 weeks', 300, 5000,
 '[{"order":1,"title":"Finalize Your Prototype","description":"Rules, components, balance. Playtest until it sings.","link":"/cue-cards/campaigns/board-game-components","time_estimate":"2-4 weeks","cost_estimate":"$100-500"},{"order":2,"title":"Get Art and Layout","description":"Box art, card layouts, board design. Hire or DIY.","link":"/marketplace?category=design","time_estimate":"2-4 weeks","cost_estimate":"$500-2000"},{"order":3,"title":"Set Up Your Turn-Key Project","description":"Board Game Components Cue Card handles campaign structure.","link":"/projects/create?cue_card=board-game-components","time_estimate":"15 min","cost_estimate":"$0"},{"order":4,"title":"Build Hype on BGG","description":"BoardGameGeek page, Reddit r/tabletopgamedesign, Discord servers.","link":"https://boardgamegeek.com","time_estimate":"1-2 weeks","cost_estimate":"$0"},{"order":5,"title":"Fund Through Cascade","description":"Matched funding means your backers'' Credits go further.","link":"/projects","time_estimate":"4-8 weeks","cost_estimate":"$0"}]'),
('woodworking', 'Woodworker''s Treasure Map', 'woodworker', 'From workshop to warehouse: scale your woodcraft', '🪵', 'intermediate', '10-20 hours/week', 500, 2000, '3-4 weeks', 500, 5000,
 '[{"order":1,"title":"Set Up Your Shop","description":"Table saw, router, clamps. Safety first, always.","link":"/marketplace?category=woodworking","time_estimate":"1 week","cost_estimate":"$500-2000"},{"order":2,"title":"Build a Hero Product","description":"One signature piece. Something people share.","link":"/cue-cards/campaigns/woodworking-projects","time_estimate":"3-7 days","cost_estimate":"$50-200"},{"order":3,"title":"Launch Your Project","description":"Woodworking Projects Cue Card sets up your campaign.","link":"/projects/create?cue_card=woodworking-projects","time_estimate":"10 min","cost_estimate":"$0"},{"order":4,"title":"Film the Process","description":"Build videos sell. Instagram Reels, TikTok, YouTube Shorts.","link":"/marketplace","time_estimate":"1-2 hours","cost_estimate":"$0"},{"order":5,"title":"Scale Production","description":"Factory Node for batch production. Matched funding accelerates.","link":"/projects","time_estimate":"2-4 weeks","cost_estimate":"$0"}]'),
('digital', 'Digital Creator''s Treasure Map', 'digital-creator', 'From design file to download store: monetize your digital craft', '💻', 'beginner', '5-10 hours/week', 0, 200, '1-2 weeks', 200, 3000,
 '[{"order":1,"title":"Prepare Your Files","description":"STLs, SVGs, templates, fonts. Package them cleanly.","link":"/cue-cards/campaigns/digital-designs","time_estimate":"1-3 days","cost_estimate":"$0"},{"order":2,"title":"Create Preview Images","description":"Renders, mockups, in-use photos. Show the finished product.","link":"/marketplace","time_estimate":"1-2 days","cost_estimate":"$0-50"},{"order":3,"title":"Launch Your Project","description":"Digital Designs Cue Card. Zero startup cost.","link":"/projects/create?cue_card=digital-designs","time_estimate":"10 min","cost_estimate":"$0"},{"order":4,"title":"Seed Your Community","description":"Share on relevant subreddits, Discord servers, maker forums.","link":"/marketplace","time_estimate":"1-2 hours","cost_estimate":"$0"},{"order":5,"title":"Bundle and Upsell","description":"Starter packs, premium bundles, custom commissions.","link":"/projects","time_estimate":"1-2 weeks","cost_estimate":"$0"}]')
ON CONFLICT (slug) DO NOTHING;
