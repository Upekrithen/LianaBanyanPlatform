-- Helm Actions: Founder portfolio pitch/checklist/script system
-- Innovation references: #1921 (Guided Discovery)

CREATE TABLE IF NOT EXISTS helm_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'pitch',
  content JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE helm_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own helm actions" ON helm_actions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users manage own helm actions" ON helm_actions
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX idx_helm_actions_user ON helm_actions(user_id);
CREATE INDEX idx_helm_actions_type ON helm_actions(action_type);

-- Seed: La Capital del Sabor pitch
INSERT INTO helm_actions (user_id, title, action_type, content, tags)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'La Capital del Sabor — Restaurant Pitch',
  'pitch',
  '{
    "target": "La Capital del Sabor",
    "target_type": "restaurant",
    "status": "ready",
    "sections": [
      {
        "title": "The 30-Second Pitch",
        "type": "script",
        "body": "Hi, I''m Jonathan with Liana Banyan — a cooperative platform here in San Antonio. I saw Polly Anna Rocha''s article about your lunch specials — congratulations, that''s great press. I''d like to build you a free online ordering page so offices on Bandera Road can pre-order your $6.99 specials by 10 AM and have them delivered by noon. You keep 83.3% of every sale. No DoorDash fees. No Uber cut. We handle the delivery. You make exactly what''s ordered — zero waste. Can I stop by this week to show you how it works?"
      },
      {
        "title": "If They Ask Questions",
        "type": "faq",
        "body": "",
        "items": [
          {"q": "What''s the catch?", "a": "There is no catch. Your first store is free — costs us six cents a month to host. You set your own prices. You keep 83.3% of every dollar. Our platform takes a flat Cost+20% — that''s locked, can never go up. Compare that to DoorDash taking 15-30%."},
          {"q": "Who handles delivery?", "a": "We do. We already have a vehicle assigned to this area. My son will be your delivery driver. He picks up, delivers, takes a photo on arrival. You cook, we move it."},
          {"q": "How does ordering work?", "a": "Customers go to your page on our site, pick their items, pay online. You get a notification with exactly what to make. No phone tag, no miscounts. Orders close at 10 AM for noon delivery — you know exactly what you''re making before you start."},
          {"q": "What if I want to cancel?", "a": "Cancel anytime. No contract. No penalty. Your menu, your prices, your decision."},
          {"q": "How do I get paid?", "a": "Direct to your account. Every sale, 83.3% is yours. We settle weekly or daily — your choice."},
          {"q": "What about my existing customers?", "a": "This doesn''t replace your walk-in business. This ADDS office delivery customers who weren''t coming to you before. New revenue on top of what you already do."}
        ]
      },
      {
        "title": "Leave-Behind",
        "type": "document",
        "body": "**Liana Banyan Cooperative — Restaurant Partner Program**\n\n| | DoorDash | Uber Eats | Liana Banyan |\n|---|---------|-----------|-------------|\n| Your cut | 70-85% | 70-85% | **83.3%** |\n| Their fee | 15-30% | 15-30% | **16.7% (locked forever)** |\n| Can fee increase? | Yes | Yes | **No — constitutionally locked** |\n| Delivery driver | Gig worker | Gig worker | **Dedicated local driver** |\n| Setup cost | $0 | $0 | **$0** |\n| Monthly fee | Varies | Varies | **$0** |\n| Contract | Yes | Yes | **No contract** |\n\n**Your next step**: We build your page this week. You review it. If you like it, we go live. If not, no hard feelings.\n\n**Contact**: Jonathan Jones | lianabanyan.com"
      },
      {
        "title": "Preparation Checklist",
        "type": "checklist",
        "body": "Complete before walking in.",
        "items": [
          {"text": "Know their menu (check Facebook/Google for current specials)", "checked": false},
          {"text": "Know the Polly Anna Rocha article details (specific dishes mentioned)", "checked": false},
          {"text": "Have the leave-behind printed (one page, color if possible)", "checked": false},
          {"text": "Ambassador son is with you (introduce as your delivery partner)", "checked": false},
          {"text": "Phone ready to show the platform (ColdStartDashboard or a demo storefront)", "checked": false},
          {"text": "Know your ask: Can I build you a free ordering page this week?", "checked": false}
        ]
      },
      {
        "title": "After The Visit",
        "type": "checklist",
        "body": "Follow-up actions based on response.",
        "items": [
          {"text": "If YES: Build storefront immediately (Commerce Engine). Get menu items, prices, photos.", "checked": false},
          {"text": "Post Local Wheels delivery bounty (Slingshot auto-trigger)", "checked": false},
          {"text": "Ambassador son claims the delivery position", "checked": false},
          {"text": "First test order within 48 hours", "checked": false},
          {"text": "If MAYBE: Leave the one-pager. Follow up in 3 days.", "checked": false},
          {"text": "If NO: Thank them. Ask if they know another restaurant that might be interested.", "checked": false}
        ]
      }
    ]
  }'::jsonb,
  ARRAY['restaurant', 'san-antonio', 'let-s-make-dinner', 'cold-start']
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);
