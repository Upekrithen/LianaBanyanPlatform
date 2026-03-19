-- MoneyPenny Social Media Command Center — social_interactions table
-- Admin-only operations tool tracking mentions, comments, DMs across all channels

CREATE TABLE IF NOT EXISTS social_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'discord', 'reddit', 'youtube')),
  interaction_type text NOT NULL CHECK (interaction_type IN ('mention', 'comment', 'dm', 'reply', 'tag', 'review', 'share')),
  author_name text NOT NULL,
  author_handle text NOT NULL,
  author_followers integer NOT NULL DEFAULT 0,
  content text NOT NULL,
  sentiment text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative', 'hostile')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low', 'ignore')),
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('question', 'praise', 'complaint', 'feature_request', 'partnership_inquiry', 'press', 'spam', 'troll', 'general')),
  draft_response text,
  response_status text NOT NULL DEFAULT 'new' CHECK (response_status IN ('new', 'ai_drafted', 'pending_review', 'approved', 'published', 'rejected', 'no_response_needed')),
  ai_notes text,
  related_qa_id uuid REFERENCES qa_entries(id),
  received_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz
);

ALTER TABLE social_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on social_interactions"
  ON social_interactions FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Seed data: 20 sample social interactions spanning channels, sentiments, priorities
INSERT INTO social_interactions (channel, interaction_type, author_name, author_handle, author_followers, content, sentiment, priority, category, draft_response, response_status, ai_notes, received_at) VALUES
('twitter', 'mention', 'Sarah Chen', '@sarahbuilds', 12400, 'Just discovered @LianaBanyan — a cooperative platform that actually gives makers ownership? Thread incoming.', 'positive', 'high', 'praise', 'Welcome to the movement, Sarah! We believe makers should own what they build.', 'pending_review', 'High-follower maker advocate. Organic discovery. Thread could drive awareness.', '2026-03-18T08:15:00Z'),
('twitter', 'reply', 'CryptoMaxi99', '@cryptomaxi99', 340, '@LianaBanyan So this is basically another crypto project? Joules sound like tokens.', 'negative', 'medium', 'question', 'Fair question! Joules are not crypto tokens — they are a closed-loop surplus storage mechanism. No blockchain, no speculation.', 'pending_review', 'Common misconception. The forever stamp analogy works for this audience.', '2026-03-18T09:22:00Z'),
('instagram', 'comment', 'MakerMike', '@makermike3d', 8700, 'Those hexagonal pieces are incredible! Are these 3D printed or injection molded?', 'positive', 'high', 'question', 'Thanks Mike! Tereno Certified pieces use lithographic manufacturing with compliant mechanisms. DM us about HexIsle Compatible tiers!', 'pending_review', 'Active 3D printing creator. Potential Creator Draft Pick candidate.', '2026-03-18T07:45:00Z'),
('linkedin', 'dm', 'Jessica Thornton', 'jessica-thornton-cfo', 3200, 'I am a CFO with cooperative finance experience. Would love to chat about the three-currency system from a regulatory perspective.', 'positive', 'urgent', 'partnership_inquiry', 'Jessica, your cooperative finance expertise is exactly the insight we value. Would you be open to a brief call this week?', 'pending_review', 'URGENT: Potential strategic contact. CFO with cooperative finance background.', '2026-03-18T06:30:00Z'),
('reddit', 'comment', 'cooperativefan42', 'u/cooperativefan42', 0, 'r/cooperatives: Has anyone looked into Liana Banyan? Their academic papers on non-speculative cooperative economics are actually rigorous.', 'positive', 'medium', 'general', 'Thanks for the shout-out! The C+20 reciprocity law is one of our cornerstones.', 'ai_drafted', 'Organic Reddit discussion. Moderate engagement recommended. Keep it informational.', '2026-03-18T10:05:00Z'),
('youtube', 'comment', 'TechReviewDave', '@techreviewdave', 45000, 'I would love to do a deep dive review of this platform. Can someone from the team reach out?', 'positive', 'urgent', 'press', 'Dave, we would be honored! Sending you a DM with details for a full walkthrough.', 'pending_review', 'URGENT: High-follower tech reviewer requesting coverage. 45K followers.', '2026-03-18T11:00:00Z'),
('discord', 'dm', 'Alex Rivera', 'alexr#7721', 0, 'I am a full-stack developer and I love what you are building. Is there a way to contribute?', 'positive', 'high', 'partnership_inquiry', 'Alex, welcome! Our tech stack is React/Vite with Supabase — sounds like a perfect match. Check out our Bounty system.', 'pending_review', 'Potential developer recruit with relevant stack experience.', '2026-03-18T08:50:00Z'),
('facebook', 'comment', 'Linda McCarthy', 'linda.mccarthy.crafts', 1200, 'My daughter told me about this. I make handmade pottery and have been looking for an alternative to Etsy.', 'positive', 'medium', 'question', 'Linda, welcome! We are building specifically for makers like you. Unlike Etsy, you own a share of the platform.', 'ai_drafted', 'Warm lead — maker frustrated with existing platforms. Etsy comparison is common entry.', '2026-03-18T09:45:00Z'),
('twitter', 'mention', 'PlatformWatch', '@platformwatch', 28000, '@LianaBanyan claims to be a cooperative but has zero transparent governance documentation. Show us the bylaws.', 'negative', 'high', 'complaint', 'Valid ask. Our governance structure includes the Star Chamber and Senate/Pnyx voting. We are publishing full bylaws before launch.', 'pending_review', 'HIGH: Influential platform critic. Fair criticism — opportunity to demonstrate transparency.', '2026-03-18T10:30:00Z'),
('tiktok', 'comment', 'CraftQueenBee', '@craftqueenbee', 156000, 'Wait this is actually genius?? A platform where makers set their own prices with a cost+20% floor??', 'positive', 'urgent', 'question', 'Simple version: You make something. You decide what it costs. The platform guarantees at least cost plus 20%. And you own a piece of everything.', 'pending_review', 'URGENT: TikTok creator with 156K followers. ELI5 format perfect for TikTok. Viral potential.', '2026-03-18T11:15:00Z'),
('twitter', 'reply', 'SkepticalSteve', '@skepticalsteve', 890, 'Lmao cooperatives always fail. Give it 6 months.', 'hostile', 'low', 'troll', '', 'no_response_needed', 'Low-follower troll. No engagement value. No response.', '2026-03-18T08:45:00Z'),
('instagram', 'dm', 'Fusion Fox Design', '@fusefoxdesign', 22000, 'Love the hexagonal game pieces. I design tactical board game accessories. Think there could be a collaboration?', 'positive', 'urgent', 'partnership_inquiry', 'We have admired your work! Your designs would fit as HexIsle Compatible Tier 4. Can we schedule a call?', 'pending_review', 'URGENT: @fusefoxdesign (Tactocrat) — top Creator Draft Pick candidate.', '2026-03-18T07:00:00Z'),
('linkedin', 'comment', 'Prof. Maria Santos', 'maria-santos-econ', 5600, 'Fascinating paper on non-speculative cooperative economics. Would be interested in peer reviewing future publications.', 'positive', 'high', 'partnership_inquiry', 'Professor Santos, we would welcome peer review from a cooperative economics specialist.', 'pending_review', 'HIGH: Academic economist offering peer review. Credibility gold.', '2026-03-18T09:00:00Z'),
('reddit', 'comment', 'throwaway_critic', 'u/throwaway_critic_2026', 0, 'r/startups: Liana Banyan is a scam. No product, just papers and promises. Classic vaporware.', 'hostile', 'medium', 'troll', 'We have a live platform in beta, 8 provisional patent filings (1,751 innovations), and a deployed stack. Happy to show receipts.', 'ai_drafted', 'Hostile but on high-traffic subreddit. Should be addressed factually.', '2026-03-18T10:45:00Z'),
('facebook', 'share', 'Veterans Business Network', 'VetsBizNetwork', 34000, 'Shared post: Veteran-founded cooperative building something different. Worth watching.', 'positive', 'high', 'praise', 'Thank you, Veterans Business Network! Building something that serves the community is what it is all about.', 'pending_review', 'HIGH: Veterans organization sharing organically. 34K audience.', '2026-03-18T08:30:00Z'),
('discord', 'comment', 'BuilderBot', 'builderbot#0001', 0, 'FREE NFT DROP! Click here to claim your exclusive founder token! discord.gg/scamlink', 'hostile', 'urgent', 'spam', '', 'no_response_needed', 'SPAM/SCAM: Fake NFT drop impersonating brand. Report and ban.', '2026-03-18T11:30:00Z'),
('youtube', 'comment', 'CoopLearner', '@cooplearner', 2100, 'I am writing my thesis on platform cooperativism. Could you share more about the Coverage Minutes system?', 'positive', 'medium', 'question', 'Great topic! The Coverage Minutes system gates speaking by listening. We have academic papers if you want references.', 'ai_drafted', 'Academic researcher. Good opportunity to share paper series.', '2026-03-18T09:30:00Z'),
('tiktok', 'comment', 'SmallBizSally', '@smallbizsally', 43000, 'How do you actually make money if you are a cooperative? Who pays for the servers?', 'neutral', 'medium', 'question', 'Members buy Credits ($1 = 1 Credit). The cooperative takes a small operational margin. No VC, no ads, no data selling.', 'pending_review', 'Common and important question. TikTok-casual but economically accurate.', '2026-03-18T11:45:00Z'),
('twitter', 'dm', 'Jake from TechCrunch', '@jakefrommedia', 67000, 'I am a reporter at TechCrunch covering cooperative tech. Would your founder be available for an interview?', 'positive', 'urgent', 'press', 'Jake, we would be happy to arrange an interview. Our founder can speak to the cooperative model and three-currency system.', 'pending_review', 'URGENT: TechCrunch reporter requesting founder interview. Tier-1 press.', '2026-03-18T06:00:00Z'),
('instagram', 'tag', 'Greg Dean Mann', '@greg.dean.mann', 15000, 'Tagged @LianaBanyan: When platforms actually respect makers. Keeping an eye on this one.', 'positive', 'high', 'praise', 'Greg, your lamp work is extraordinary! We believe makers like you deserve a platform that respects the craft.', 'pending_review', 'HIGH: Creator Draft Pick target. Organic endorsement.', '2026-03-18T10:15:00Z');
