export type InitiativeTier = 'spark' | 'ember' | 'wildfire';
export type ApplicationStatus = 'pending' | 'ai_review' | 'human_review' | 'approved' | 'rejected';
export type PledgeStatus = 'pledged' | 'escrowed' | 'released' | 'forfeited';
export type NavalRank = 'captain' | 'commodore' | 'rear_admiral' | 'vice_admiral' | 'admiral' | 'fleet_admiral';

export interface InitiativeCareUnit {
  id: string;
  initiative_id: string;
  geographic_area: string;
  tier: InitiativeTier;
  families_count: number;
  captains_count: number;
  created_at: string;
  updated_at: string;
}

export interface StewardshipApplication {
  id: string;
  user_id: string;
  initiative_id: string;
  geographic_area: string;
  status: ApplicationStatus;
  ai_advisor_recommendation?: string;
  human_decision?: string;
  created_at: string;
  updated_at: string;
}

export interface StewardshipBacker {
  id: string;
  application_id: string;
  backer_user_id: string;
  pledge_amount: number;
  status: PledgeStatus;
  created_at: string;
}

export interface StewardPledge {
  id: string;
  steward_user_id: string;
  initiative_id: string;
  amount_escrowed: number;
  status: 'active' | 'released' | 'forfeited';
  created_at: string;
}

export interface CommandPath {
  id: string;
  parent_steward_id?: string;
  child_steward_id: string;
  initiative_id: string;
  rank_level: NavalRank;
  created_at: string;
}

// AI Advisor Profiles for the Stewardship System
export type AIAdvisorProfile = 
  | 'Red Queen' 
  | 'Judge Dredd' 
  | 'The Oracle' 
  | 'Morpheus' 
  | 'MirrorMirror' 
  | 'Moneypenny' 
  | 'Jarvis' 
  | 'HAL' 
  | 'Daneel';

export interface AIAdvisorRecommendation {
  advisor: AIAdvisorProfile;
  recommendation: 'approve' | 'reject' | 'flag_for_review';
  reasoning: string;
  confidence_score: number;
}
