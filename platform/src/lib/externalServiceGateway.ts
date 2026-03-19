/**
 * External Service Gateway
 * 
 * Unified interface for connecting to external funding platforms.
 * LB is the coordination layer - these platforms handle the money.
 * 
 * "Platform, not a fund"
 */

// =============================================================================
// TYPES
// =============================================================================

export type FundingPlatform = 
  | 'kickstarter' 
  | 'gofundme' 
  | 'givebutter' 
  | 'wefunder' 
  | 'givesendgo'
  | 'indiegogo'
  | 'patreon';

export type CampaignType = 
  | 'product'      // Physical products, manufacturing (Kickstarter, Indiegogo)
  | 'medical'      // Medical/crisis support (GoFundMe, GiveSendGo)
  | 'donation'     // General charitable (GiveButter)
  | 'participation' // Cooperative participation (Wefunder integration)
  | 'recurring';   // Ongoing support (Patreon, GiveButter)

export type CampaignStatus = 
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'funded'
  | 'failed'
  | 'closed';

export interface CampaignData {
  title: string;
  description: string;
  goalAmount: number;
  currency: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  endDate?: Date;
  recipientName?: string;
  recipientRelationship?: string;
}

export interface CampaignLink {
  platform: FundingPlatform;
  externalId: string;
  externalUrl: string;
  embedCode?: string;
  createdAt: Date;
}

export interface FundingProgress {
  platform: FundingPlatform;
  externalId: string;
  goalAmount: number;
  currentAmount: number;
  donorCount: number;
  percentFunded: number;
  lastSynced: Date;
  status: CampaignStatus;
}

// =============================================================================
// ADAPTER INTERFACE
// =============================================================================

export interface ExternalFundingAdapter {
  platform: FundingPlatform;
  displayName: string;
  logoUrl: string;
  
  // What this platform supports
  supportedTypes: CampaignType[];
  
  // API capabilities
  hasAPI: boolean;
  canCreateCampaign: boolean;  // Some only allow linking existing
  canSyncProgress: boolean;
  
  // Core operations
  createCampaignLink(projectId: string, data: CampaignData): Promise<CampaignLink>;
  getCampaignStatus(externalId: string): Promise<CampaignStatus>;
  syncProgress(externalId: string): Promise<FundingProgress>;
  
  // Optional operations
  getEmbedCode?(externalId: string): string;
  validateUrl?(url: string): boolean;
  extractIdFromUrl?(url: string): string | null;
}

// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================

export const PLATFORM_CONFIG: Record<FundingPlatform, {
  displayName: string;
  logoUrl: string;
  baseUrl: string;
  supportedTypes: CampaignType[];
  hasAPI: boolean;
  canCreateCampaign: boolean;
  canSyncProgress: boolean;
  fees: string;
  bestFor: string;
}> = {
  kickstarter: {
    displayName: 'Kickstarter',
    logoUrl: '/images/platforms/kickstarter.svg',
    baseUrl: 'https://www.kickstarter.com',
    supportedTypes: ['product'],
    hasAPI: false, // Limited API, mostly scraping
    canCreateCampaign: false, // Must create on their site
    canSyncProgress: true,
    fees: '5% + payment processing (3-5%)',
    bestFor: 'Product launches, manufacturing projects, creative works'
  },
  gofundme: {
    displayName: 'GoFundMe',
    logoUrl: '/images/platforms/gofundme.svg',
    baseUrl: 'https://www.gofundme.com',
    supportedTypes: ['medical', 'donation'],
    hasAPI: true,
    canCreateCampaign: false, // Must create on their site
    canSyncProgress: true,
    fees: '0% platform fee + 2.9% + $0.30 payment processing',
    bestFor: 'Medical expenses, crisis support, personal causes'
  },
  givebutter: {
    displayName: 'GiveButter',
    logoUrl: '/images/platforms/givebutter.svg',
    baseUrl: 'https://givebutter.com',
    supportedTypes: ['donation', 'recurring'],
    hasAPI: true,
    canCreateCampaign: true,
    canSyncProgress: true,
    fees: '0% platform fee (tip-based) + payment processing',
    bestFor: 'Nonprofit fundraising, recurring donations, events'
  },
  wefunder: {
    displayName: 'Wefunder',
    logoUrl: '/images/platforms/wefunder.svg',
    baseUrl: 'https://wefunder.com',
    supportedTypes: ['equity'],
    hasAPI: true,
    canCreateCampaign: false, // Requires approval process
    canSyncProgress: true,
    fees: '7.5% of funds raised',
    bestFor: 'Regulation crowdfunding, contribution rounds, startup backing'
  },
  givesendgo: {
    displayName: 'GiveSendGo',
    logoUrl: '/images/platforms/givesendgo.svg',
    baseUrl: 'https://www.givesendgo.com',
    supportedTypes: ['medical', 'donation'],
    hasAPI: false,
    canCreateCampaign: false,
    canSyncProgress: true,
    fees: '0% platform fee + payment processing',
    bestFor: 'Medical expenses, faith-based causes, alternative to GoFundMe'
  },
  indiegogo: {
    displayName: 'Indiegogo',
    logoUrl: '/images/platforms/indiegogo.svg',
    baseUrl: 'https://www.indiegogo.com',
    supportedTypes: ['product'],
    hasAPI: true,
    canCreateCampaign: false,
    canSyncProgress: true,
    fees: '5% + payment processing (3-5%)',
    bestFor: 'Product launches, flexible funding, international projects'
  },
  patreon: {
    displayName: 'Patreon',
    logoUrl: '/images/platforms/patreon.svg',
    baseUrl: 'https://www.patreon.com',
    supportedTypes: ['recurring'],
    hasAPI: true,
    canCreateCampaign: false,
    canSyncProgress: true,
    fees: '5-12% depending on plan + payment processing',
    bestFor: 'Ongoing creator support, membership programs'
  }
};

// =============================================================================
// INITIATIVE → PLATFORM ROUTING
// =============================================================================

export const INITIATIVE_PLATFORM_MAP: Record<string, {
  primary: FundingPlatform;
  fallback: FundingPlatform[];
  campaignType: CampaignType;
}> = {
  'lets-make-bread': {
    primary: 'kickstarter',
    fallback: ['indiegogo', 'wefunder'],
    campaignType: 'product'
  },
  'do-the-swoop': {
    primary: 'gofundme',
    fallback: ['givesendgo', 'givebutter'],
    campaignType: 'medical'
  },
  'rally-group': {
    primary: 'givebutter',
    fallback: ['gofundme'],
    campaignType: 'donation'
  },
  'brass-tacks': {
    primary: 'wefunder',
    fallback: ['givebutter'],
    campaignType: 'equity'
  },
  'jukebox': {
    primary: 'patreon',
    fallback: ['givebutter'],
    campaignType: 'recurring'
  },
  'hexisle': {
    primary: 'kickstarter',
    fallback: ['indiegogo'],
    campaignType: 'product'
  }
};

// =============================================================================
// GATEWAY CLASS
// =============================================================================

export class ExternalServiceGateway {
  private adapters: Map<FundingPlatform, ExternalFundingAdapter> = new Map();
  
  constructor() {
    // Adapters are registered at runtime
  }
  
  registerAdapter(adapter: ExternalFundingAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }
  
  /**
   * Get the best platform for a given campaign type
   */
  selectPlatform(
    type: CampaignType, 
    initiativeSlug?: string,
    preferredPlatform?: FundingPlatform
  ): FundingPlatform {
    // If preferred and supports type, use it
    if (preferredPlatform) {
      const config = PLATFORM_CONFIG[preferredPlatform];
      if (config.supportedTypes.includes(type)) {
        return preferredPlatform;
      }
    }
    
    // If initiative has a mapping, use it
    if (initiativeSlug && INITIATIVE_PLATFORM_MAP[initiativeSlug]) {
      return INITIATIVE_PLATFORM_MAP[initiativeSlug].primary;
    }
    
    // Otherwise, find best platform for type
    const platforms = Object.entries(PLATFORM_CONFIG)
      .filter(([_, config]) => config.supportedTypes.includes(type))
      .sort((a, b) => {
        // Prefer platforms with APIs
        if (a[1].hasAPI && !b[1].hasAPI) return -1;
        if (!a[1].hasAPI && b[1].hasAPI) return 1;
        return 0;
      });
    
    return platforms[0]?.[0] as FundingPlatform || 'gofundme';
  }
  
  /**
   * Create a campaign link (or instructions to create one)
   */
  async createCampaignLink(
    projectId: string,
    type: CampaignType,
    data: CampaignData,
    preferredPlatform?: FundingPlatform
  ): Promise<CampaignLink | { platform: FundingPlatform; instructions: string }> {
    const platform = this.selectPlatform(type, undefined, preferredPlatform);
    const config = PLATFORM_CONFIG[platform];
    const adapter = this.adapters.get(platform);
    
    // If we can create via API, do it
    if (adapter && config.canCreateCampaign) {
      return adapter.createCampaignLink(projectId, data);
    }
    
    // Otherwise, return instructions
    return {
      platform,
      instructions: this.getCreationInstructions(platform, type, data)
    };
  }
  
  /**
   * Link an existing external campaign to an LB project
   */
  async linkExistingCampaign(
    projectId: string,
    platform: FundingPlatform,
    externalUrl: string
  ): Promise<CampaignLink> {
    const adapter = this.adapters.get(platform);
    
    // Extract ID from URL
    let externalId = externalUrl;
    if (adapter?.extractIdFromUrl) {
      const extracted = adapter.extractIdFromUrl(externalUrl);
      if (extracted) externalId = extracted;
    }
    
    return {
      platform,
      externalId,
      externalUrl,
      createdAt: new Date()
    };
  }
  
  /**
   * Sync funding progress from external platform
   */
  async syncProgress(
    platform: FundingPlatform,
    externalId: string
  ): Promise<FundingProgress | null> {
    const adapter = this.adapters.get(platform);
    const config = PLATFORM_CONFIG[platform];
    
    if (!adapter || !config.canSyncProgress) {
      return null;
    }
    
    return adapter.syncProgress(externalId);
  }
  
  /**
   * Get instructions for creating a campaign on a platform
   */
  private getCreationInstructions(
    platform: FundingPlatform,
    type: CampaignType,
    data: CampaignData
  ): string {
    const config = PLATFORM_CONFIG[platform];
    
    const instructions: Record<FundingPlatform, string> = {
      kickstarter: `
1. Go to ${config.baseUrl}/create
2. Select "Start a project"
3. Use title: "${data.title}"
4. Set goal: $${data.goalAmount}
5. Complete their approval process
6. Once live, come back and paste your campaign URL here
      `.trim(),
      
      gofundme: `
1. Go to ${config.baseUrl}/create
2. Select "Medical" or appropriate category
3. Use title: "${data.title}"
4. Set goal: $${data.goalAmount}
5. Add your story and photos
6. Once live, come back and paste your campaign URL here
      `.trim(),
      
      givebutter: `
1. Go to ${config.baseUrl}
2. Click "Start Fundraising"
3. Use title: "${data.title}"
4. Set goal: $${data.goalAmount}
5. Once live, come back and paste your campaign URL here
      `.trim(),
      
      wefunder: `
1. Go to ${config.baseUrl}/raise
2. Apply for a campaign (requires approval)
3. Use company/project name: "${data.title}"
4. Set funding goal: $${data.goalAmount}
5. Complete their due diligence process
6. Once approved and live, paste your campaign URL here
      `.trim(),
      
      givesendgo: `
1. Go to ${config.baseUrl}/create
2. Select appropriate category
3. Use title: "${data.title}"
4. Set goal: $${data.goalAmount}
5. Add your story
6. Once live, come back and paste your campaign URL here
      `.trim(),
      
      indiegogo: `
1. Go to ${config.baseUrl}/create
2. Select "Start a Campaign"
3. Use title: "${data.title}"
4. Set goal: $${data.goalAmount}
5. Choose Fixed or Flexible funding
6. Once live, come back and paste your campaign URL here
      `.trim(),
      
      patreon: `
1. Go to ${config.baseUrl}/create
2. Set up your creator page
3. Use name: "${data.title}"
4. Define your membership tiers
5. Once live, come back and paste your page URL here
      `.trim()
    };
    
    return instructions[platform] || 'Visit the platform website to create your campaign.';
  }
  
  /**
   * Get all platforms that support a given type
   */
  getPlatformsForType(type: CampaignType): FundingPlatform[] {
    return Object.entries(PLATFORM_CONFIG)
      .filter(([_, config]) => config.supportedTypes.includes(type))
      .map(([platform]) => platform as FundingPlatform);
  }
  
  /**
   * Get platform info for display
   */
  getPlatformInfo(platform: FundingPlatform) {
    return PLATFORM_CONFIG[platform];
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const externalServiceGateway = new ExternalServiceGateway();

// =============================================================================
// DATABASE SCHEMA FOR TRACKING LINKED CAMPAIGNS
// =============================================================================

/*
-- Run this in Supabase SQL editor

CREATE TABLE external_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Link to LB project
  project_id UUID REFERENCES projects(id),
  initiative_slug TEXT,
  
  -- External platform info
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT NOT NULL,
  
  -- Campaign type
  campaign_type TEXT NOT NULL, -- 'product', 'medical', 'donation', 'equity', 'recurring'
  
  -- Synced data
  title TEXT,
  goal_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  donor_count INTEGER DEFAULT 0,
  percent_funded DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  
  -- Sync tracking
  last_synced TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  embed_code TEXT,
  
  UNIQUE(platform, external_id)
);

-- Index for fast lookups
CREATE INDEX idx_external_campaigns_project ON external_campaigns(project_id);
CREATE INDEX idx_external_campaigns_initiative ON external_campaigns(initiative_slug);
CREATE INDEX idx_external_campaigns_platform ON external_campaigns(platform);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_external_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER external_campaigns_updated_at
  BEFORE UPDATE ON external_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_external_campaigns_updated_at();
*/
