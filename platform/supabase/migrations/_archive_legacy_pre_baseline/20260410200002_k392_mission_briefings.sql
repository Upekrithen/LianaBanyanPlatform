-- Mission Briefings: Role-Specific Informational Tours
-- Innovation #2238 (Crown Jewel #211)
-- Session B093
-- Depends on: catapult_metrics (K391)

-- Briefing templates: one per role, defines page structure
CREATE TABLE IF NOT EXISTS public.briefing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  page_sequence jsonb NOT NULL DEFAULT '[]',
  catapult_entity_types text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Member briefing instances
CREATE TABLE IF NOT EXISTS public.mission_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  role_name text NOT NULL,
  briefing_pages jsonb NOT NULL DEFAULT '[]',
  last_viewed_at timestamptz,
  auto_refresh boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, role_name)
);

-- Indexes
CREATE INDEX idx_briefing_templates_role ON public.briefing_templates (role_slug);
CREATE INDEX idx_mission_briefings_member ON public.mission_briefings (member_id);
CREATE INDEX idx_mission_briefings_member_role ON public.mission_briefings (member_id, role_name);

-- RLS for briefing_templates
ALTER TABLE public.briefing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read briefing templates"
  ON public.briefing_templates
  FOR SELECT
  USING (true);

-- RLS for mission_briefings
ALTER TABLE public.mission_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own briefings"
  ON public.mission_briefings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can insert own briefings"
  ON public.mission_briefings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update own briefings"
  ON public.mission_briefings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed 3 briefing templates
INSERT INTO public.briefing_templates (role_slug, title, description, page_sequence, catapult_entity_types) VALUES
(
  'photographer',
  'Photographer Mission Briefing',
  'Your lens on the platform. Photo bounties, studio campaigns, and open calls — see what needs your eye.',
  '[
    {
      "page_number": 1,
      "title": "Active Photo Bounties",
      "description": "Bounties seeking photographer contributions. Push these toward escape velocity.",
      "icon": "camera"
    },
    {
      "page_number": 2,
      "title": "Studio Campaigns",
      "description": "Campaigns requiring visual assets. Your photos fuel their launch.",
      "icon": "image"
    },
    {
      "page_number": 3,
      "title": "Open Calls & Opportunities",
      "description": "New requests for photography across the platform.",
      "icon": "megaphone"
    }
  ]'::jsonb,
  ARRAY['campaign', 'submission']
),
(
  'pearl_diver',
  'Pearl Diver Mission Briefing',
  'Dive into deal discovery. Resource intelligence, subscription trends, and hidden opportunities.',
  '[
    {
      "page_number": 1,
      "title": "Deal Discovery Pipeline",
      "description": "Resources and deals currently being tracked. See what is close to surfacing.",
      "icon": "search"
    },
    {
      "page_number": 2,
      "title": "Subscription Trends",
      "description": "Active subscriptions and resource feeds in your domain.",
      "icon": "trending-up"
    },
    {
      "page_number": 3,
      "title": "New Resources",
      "description": "Recently discovered resources awaiting your evaluation.",
      "icon": "gem"
    }
  ]'::jsonb,
  ARRAY['project', 'initiative']
),
(
  'home_teacher',
  'Home Teacher Mission Briefing',
  'Your classroom command center. Student signups, scheduling, and cooperative learning progress.',
  '[
    {
      "page_number": 1,
      "title": "Classroom Signups",
      "description": "Classes building toward their enrollment threshold. Help them launch.",
      "icon": "users"
    },
    {
      "page_number": 2,
      "title": "Student Progress",
      "description": "Current student engagement and completion metrics.",
      "icon": "graduation-cap"
    },
    {
      "page_number": 3,
      "title": "Scheduling & Availability",
      "description": "Open time slots and upcoming class sessions.",
      "icon": "calendar"
    }
  ]'::jsonb,
  ARRAY['initiative', 'campaign']
);
