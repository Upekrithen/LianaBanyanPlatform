-- Migration: Category 1: Care Unit & Stewardship System
-- Description: Creates the tables for tracking Spark to Wildfire tiers, stewardship applications, backers, and command paths.

-- 1. initiative_care_units
CREATE TABLE IF NOT EXISTS public.initiative_care_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id TEXT NOT NULL,
    geographic_area TEXT NOT NULL, -- e.g., 'Phoenix, AZ'
    tier TEXT NOT NULL CHECK (tier IN ('spark', 'ember', 'wildfire')),
    families_count INTEGER DEFAULT 0,
    captains_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. stewardship_applications
CREATE TABLE IF NOT EXISTS public.stewardship_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    geographic_area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ai_review', 'human_review', 'approved', 'rejected')),
    ai_advisor_recommendation TEXT,
    human_decision TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. stewardship_backers (The 6-person verification / escrow)
CREATE TABLE IF NOT EXISTS public.stewardship_backers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.stewardship_applications(id) ON DELETE CASCADE,
    backer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pledge_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'escrowed', 'released', 'forfeited')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. steward_pledges (Captain's own pledge)
CREATE TABLE IF NOT EXISTS public.steward_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    steward_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    amount_escrowed NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'forfeited')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. command_paths (Naval Rank hierarchy)
CREATE TABLE IF NOT EXISTS public.command_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_steward_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    child_steward_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    initiative_id TEXT NOT NULL,
    rank_level TEXT NOT NULL CHECK (rank_level IN ('captain', 'commodore', 'rear_admiral', 'vice_admiral', 'admiral', 'fleet_admiral')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies

ALTER TABLE public.initiative_care_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_backers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steward_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_paths ENABLE ROW LEVEL SECURITY;

-- initiative_care_units (Public read, admin write)
CREATE POLICY "initiative_care_units_select_all" ON public.initiative_care_units FOR SELECT USING (true);
CREATE POLICY "initiative_care_units_insert_admin" ON public.initiative_care_units FOR INSERT WITH CHECK ( (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin') );
CREATE POLICY "initiative_care_units_update_admin" ON public.initiative_care_units FOR UPDATE USING ( (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin') );

-- stewardship_applications (Users can read/write their own, admins can read/write all)
CREATE POLICY "stewardship_applications_select_own" ON public.stewardship_applications FOR SELECT USING (user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "stewardship_applications_insert_own" ON public.stewardship_applications FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "stewardship_applications_update_own" ON public.stewardship_applications FOR UPDATE USING (user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin'));

-- stewardship_backers (Users can read/write their own pledges, applicant can read)
CREATE POLICY "stewardship_backers_select_own" ON public.stewardship_backers FOR SELECT USING (backer_user_id = (SELECT auth.uid()) OR application_id IN (SELECT id FROM public.stewardship_applications WHERE user_id = (SELECT auth.uid())) OR (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "stewardship_backers_insert_own" ON public.stewardship_backers FOR INSERT WITH CHECK (backer_user_id = (SELECT auth.uid()));
CREATE POLICY "stewardship_backers_update_own" ON public.stewardship_backers FOR UPDATE USING (backer_user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin'));

-- steward_pledges (Users can read/write their own)
CREATE POLICY "steward_pledges_select_own" ON public.steward_pledges FOR SELECT USING (steward_user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin'));
CREATE POLICY "steward_pledges_insert_own" ON public.steward_pledges FOR INSERT WITH CHECK (steward_user_id = (SELECT auth.uid()));
CREATE POLICY "steward_pledges_update_own" ON public.steward_pledges FOR UPDATE USING (steward_user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin'));

-- command_paths (Public read, admin write)
CREATE POLICY "command_paths_select_all" ON public.command_paths FOR SELECT USING (true);
CREATE POLICY "command_paths_insert_admin" ON public.command_paths FOR INSERT WITH CHECK ( (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin') );
CREATE POLICY "command_paths_update_admin" ON public.command_paths FOR UPDATE USING ( (SELECT auth.uid()) IN (SELECT id FROM public.users WHERE role = 'admin') );
