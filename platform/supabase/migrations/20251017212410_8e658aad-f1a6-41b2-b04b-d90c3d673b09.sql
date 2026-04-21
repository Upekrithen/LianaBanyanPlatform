-- Pre-beta recruits tracking system
CREATE TABLE pre_beta_recruits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field_category position_category NOT NULL,
  contact_info JSONB DEFAULT '{}', -- email, social, youtube, etc.
  status TEXT DEFAULT 'no_contact' CHECK (status IN ('no_contact', 'contacted', 'responded', 'signed_up', 'endorsed')),
  priority_rank INTEGER CHECK (priority_rank BETWEEN 1 AND 5),
  notes TEXT,
  endorsement_value TEXT, -- what they bring (designs, market access, etc.)
  last_contact_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LB Asset Library for approved designs
CREATE TABLE lb_asset_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'design',
  creator_id UUID REFERENCES profiles(id),
  creator_name TEXT,
  description TEXT,
  file_paths JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  category position_category,
  download_fee_credits NUMERIC DEFAULT 1,
  total_downloads INTEGER DEFAULT 0,
  total_royalties_earned NUMERIC DEFAULT 0,
  is_free_for_personal BOOLEAN DEFAULT TRUE,
  requires_prototyping BOOLEAN DEFAULT TRUE,
  prototype_slots_total INTEGER DEFAULT 3,
  prototype_slots_filled INTEGER DEFAULT 0,
  prototype_requirements JSONB DEFAULT '{"steps": ["Print design", "Take 6 angle photos", "Upload proof", "Submit feedback"]}',
  ip_logged BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'archived')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset downloads for IP tracking
CREATE TABLE asset_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES lb_asset_library(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  download_type TEXT DEFAULT 'personal_use' CHECK (download_type IN ('personal_use', 'prototype_testing', 'commercial')),
  fee_paid NUMERIC DEFAULT 0,
  ip_transaction_logged BOOLEAN DEFAULT TRUE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prototyping contracts (constant, always available)
CREATE TABLE asset_prototyping_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES lb_asset_library(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'completed', 'expired', 'transferred')),
  slot_number INTEGER CHECK (slot_number IN (1, 2, 3)), -- 1=primary, 2=secondary, 3=backup
  credits_reward NUMERIC DEFAULT 10,
  reputation_points INTEGER DEFAULT 5,
  requirements JSONB DEFAULT '{}',
  deadline TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  proof_urls JSONB DEFAULT '[]',
  feedback TEXT,
  is_backup BOOLEAN DEFAULT FALSE,
  backup_compensation_credits NUMERIC DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Position contract backups (for all contract types)
CREATE TABLE position_contract_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID, -- references various contract types
  contract_type TEXT NOT NULL CHECK (contract_type IN ('project_position', 'peer_contract', 'prototyping', 'general')),
  primary_contractor_id UUID REFERENCES profiles(id),
  secondary_contractor_id UUID REFERENCES profiles(id),
  backup_contractor_id UUID REFERENCES profiles(id),
  secondary_compensation_credits NUMERIC DEFAULT 5,
  backup_compensation_credits NUMERIC DEFAULT 2,
  compensation_source TEXT DEFAULT 'project_pot',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE pre_beta_recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE lb_asset_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_prototyping_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE position_contract_backups ENABLE ROW LEVEL SECURITY;

-- Pre-beta recruits policies
CREATE POLICY "Admins can manage recruits"
  ON pre_beta_recruits FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view recruits"
  ON pre_beta_recruits FOR SELECT
  USING (TRUE);

-- Asset library policies
CREATE POLICY "Anyone can view approved assets"
  ON lb_asset_library FOR SELECT
  USING (status IN ('approved', 'active'));

CREATE POLICY "Creators can manage own assets"
  ON lb_asset_library FOR ALL
  USING (creator_id = auth.uid());

CREATE POLICY "Admins can manage all assets"
  ON lb_asset_library FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Asset downloads policies
CREATE POLICY "Users can view own downloads"
  ON asset_downloads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create downloads"
  ON asset_downloads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Creators can view asset downloads"
  ON asset_downloads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM lb_asset_library
    WHERE lb_asset_library.id = asset_downloads.asset_id
    AND lb_asset_library.creator_id = auth.uid()
  ));

-- Prototyping contracts policies
CREATE POLICY "Anyone can view prototyping contracts"
  ON asset_prototyping_contracts FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create prototyping contracts"
  ON asset_prototyping_contracts FOR INSERT
  WITH CHECK (contractor_id = auth.uid());

CREATE POLICY "Contractors can update own contracts"
  ON asset_prototyping_contracts FOR UPDATE
  USING (contractor_id = auth.uid());

-- Backup policies
CREATE POLICY "Anyone can view backups"
  ON position_contract_backups FOR SELECT
  USING (TRUE);

CREATE POLICY "Involved parties can manage backups"
  ON position_contract_backups FOR ALL
  USING (
    primary_contractor_id = auth.uid() OR
    secondary_contractor_id = auth.uid() OR
    backup_contractor_id = auth.uid() OR
    has_role(auth.uid(), 'admin')
  );

-- Indexes for performance
CREATE INDEX idx_pre_beta_recruits_category ON pre_beta_recruits(field_category);
CREATE INDEX idx_pre_beta_recruits_status ON pre_beta_recruits(status);
CREATE INDEX idx_lb_asset_library_category ON lb_asset_library(category);
CREATE INDEX idx_lb_asset_library_status ON lb_asset_library(status);
CREATE INDEX idx_lb_asset_library_creator ON lb_asset_library(creator_id);
CREATE INDEX idx_asset_downloads_asset ON asset_downloads(asset_id);
CREATE INDEX idx_asset_downloads_user ON asset_downloads(user_id);
CREATE INDEX idx_prototyping_contracts_asset ON asset_prototyping_contracts(asset_id);
CREATE INDEX idx_prototyping_contracts_contractor ON asset_prototyping_contracts(contractor_id);
CREATE INDEX idx_prototyping_contracts_status ON asset_prototyping_contracts(status);
