/**
 * Documentation Marketplace Service
 *
 * Marketplace for community-contributed hints, walkthroughs, and step-by-step guides.
 *
 * Contributors earn:
 * - Reputation from helpful votes
 * - Icing from purchases (70% to contributor, 30% to LB)
 * - Featured placement for high-quality content
 */

import { supabase } from '@/integrations/supabase/client';

export type DocType = 'hint' | 'walkthrough' | 'step_by_step' | 'guide' | 'faq';
export type DocCategory = 'cottage_law' | 'technique' | 'safety' | 'business' | 'platform' | 'equipment';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type DocStatus = 'draft' | 'review' | 'published' | 'featured' | 'archived';

export interface DocumentationItem {
  id: string;
  doc_type: DocType;
  category: DocCategory;
  subcategory?: string;
  title: string;
  summary?: string;
  content: string;
  media_urls: string[];
  tags: string[];
  applicable_states: string[];
  applicable_initiatives: string[];
  skill_level?: SkillLevel;
  contributor_id: string;
  price_credits: number;
  contributor_share: number;
  vote_count: number;
  average_rating?: number;
  helpful_count: number;
  not_helpful_count: number;
  times_purchased: number;
  times_viewed: number;
  total_revenue: number;
  contributor_earnings: number;
  status: DocStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  featured_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentationPurchase {
  id: string;
  doc_id: string;
  user_id: string;
  price_paid: number;
  contributor_earned: number;
  lb_earned: number;
  purchased_at: string;
  rating?: number;
  was_helpful?: boolean;
  review?: string;
  rated_at?: string;
}

export interface ContributorStats {
  user_id: string;
  total_items_published: number;
  total_hints: number;
  total_walkthroughs: number;
  total_guides: number;
  total_sales: number;
  total_revenue: number;
  total_earnings: number;
  icing_earned: number;
  average_rating?: number;
  total_helpful_votes: number;
  last_payout_at?: string;
  pending_payout: number;
}

// Constants
export const CONTRIBUTOR_SHARE = 0.70; // 70%
export const LB_SHARE = 0.30; // 30%
export const FEATURED_THRESHOLD_RATING = 4.5;
export const FEATURED_THRESHOLD_HELPFUL = 50;

// Category labels
export const DOC_CATEGORIES: Record<DocCategory, string> = {
  cottage_law: 'Cottage Food Law',
  technique: 'Cooking Techniques',
  safety: 'Food Safety',
  business: 'Business Tips',
  platform: 'Platform Help',
  equipment: 'Equipment & Tools',
};

// Type labels
export const DOC_TYPES: Record<DocType, { label: string; description: string }> = {
  hint: {
    label: 'Hint',
    description: 'Quick tip or trick (1-2 sentences)',
  },
  walkthrough: {
    label: 'Walkthrough',
    description: 'Guided explanation of a process',
  },
  step_by_step: {
    label: 'Step-by-Step',
    description: 'Detailed numbered instructions',
  },
  guide: {
    label: 'Comprehensive Guide',
    description: 'In-depth coverage of a topic',
  },
  faq: {
    label: 'FAQ',
    description: 'Frequently asked questions',
  },
};

// Skill level labels
export const SKILL_LEVELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

/**
 * Search documentation items
 */
export async function searchDocumentation(
  query: string,
  filters?: {
    type?: DocType;
    category?: DocCategory;
    skill_level?: SkillLevel;
    state?: string;
    initiative?: string;
    free_only?: boolean;
    min_rating?: number;
  }
): Promise<DocumentationItem[]> {
  try {
    // In production, query documentation_items with filters
    return [];
  } catch (error) {
    console.error('Error searching documentation:', error);
    return [];
  }
}

/**
 * Get documentation item by ID
 */
export async function getDocumentationItem(
  docId: string
): Promise<DocumentationItem | null> {
  try {
    // In production, query documentation_items
    return null;
  } catch (error) {
    console.error('Error getting documentation item:', error);
    return null;
  }
}

/**
 * Get featured documentation
 */
export async function getFeaturedDocumentation(): Promise<DocumentationItem[]> {
  try {
    // In production, query documentation_items where status = 'featured'
    return [];
  } catch (error) {
    console.error('Error getting featured documentation:', error);
    return [];
  }
}

/**
 * Get documentation by category
 */
export async function getDocumentationByCategory(
  category: DocCategory
): Promise<DocumentationItem[]> {
  try {
    // In production, query documentation_items by category
    return [];
  } catch (error) {
    console.error('Error getting documentation by category:', error);
    return [];
  }
}

/**
 * Check if user owns a documentation item
 */
export async function userOwnsDocument(
  docId: string
): Promise<boolean> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return false;

    // In production, check documentation_purchases
    return false;
  } catch (error) {
    console.error('Error checking document ownership:', error);
    return false;
  }
}

/**
 * Purchase a documentation item
 */
export async function purchaseDocumentation(
  docId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // INFRASTRUCTURE NOTE: This function needs real purchase flow:
    // 1. Get document price from documentation_items table
    // 2. Check user has enough credits via currencyService
    // 3. Deduct credits from user
    // 4. Insert record into documentation_purchases table
    // 5. Credit contributor (70% revenue share)
    // 6. Update document stats (times_purchased, total_revenue)
    return { success: true };
  } catch (error) {
    console.error('Error purchasing documentation:', error);
    return { success: false, error: 'Failed to purchase documentation' };
  }
}

/**
 * Rate a purchased documentation item
 */
export async function rateDocumentation(
  docId: string,
  rating: number,
  wasHelpful: boolean,
  review?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // INFRASTRUCTURE NOTE: This function needs to update documentation_purchases table
    // with the rating, wasHelpful flag, and review text, then recalculate document averages
    return { success: true };
  } catch (error) {
    console.error('Error rating documentation:', error);
    return { success: false, error: 'Failed to rate documentation' };
  }
}

/**
 * Submit new documentation
 */
export async function submitDocumentation(
  doc: {
    doc_type: DocType;
    category: DocCategory;
    subcategory?: string;
    title: string;
    summary?: string;
    content: string;
    media_urls?: string[];
    tags?: string[];
    applicable_states?: string[];
    applicable_initiatives?: string[];
    skill_level?: SkillLevel;
    price_credits?: number;
  }
): Promise<{ docId?: string; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: 'Not authenticated' };
    }

    // Validate content
    if (!doc.title || doc.title.length < 5) {
      return { error: 'Title must be at least 5 characters' };
    }

    if (!doc.content || doc.content.length < 50) {
      return { error: 'Content must be at least 50 characters' };
    }

    // INFRASTRUCTURE NOTE: This function needs to insert into documentation_items table
    // with status 'review' and contributor_id = userData.user.id
    const docId = `doc-${Date.now()}`;

    return { docId };
  } catch (error) {
    console.error('Error submitting documentation:', error);
    return { error: 'Failed to submit documentation' };
  }
}

/**
 * Update documentation (contributor only)
 */
export async function updateDocumentation(
  docId: string,
  updates: Partial<DocumentationItem>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // INFRASTRUCTURE NOTE: This function needs to verify user is the contributor,
    // then update the documentation_items table with the provided updates
    return { success: true };
  } catch (error) {
    console.error('Error updating documentation:', error);
    return { success: false, error: 'Failed to update documentation' };
  }
}

/**
 * Get contributor stats
 */
export async function getContributorStats(
  userId?: string
): Promise<ContributorStats | null> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const targetUserId = userId || userData?.user?.id;
    if (!targetUserId) return null;

    // In production, query documentation_contributor_stats
    return null;
  } catch (error) {
    console.error('Error getting contributor stats:', error);
    return null;
  }
}

/**
 * Get user's purchased documentation
 */
export async function getMyPurchasedDocumentation(): Promise<{
  doc: DocumentationItem;
  purchase: DocumentationPurchase;
}[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return [];

    // In production, join documentation_purchases with documentation_items
    return [];
  } catch (error) {
    console.error('Error getting purchased documentation:', error);
    return [];
  }
}

/**
 * Get user's contributed documentation
 */
export async function getMyContributedDocumentation(): Promise<DocumentationItem[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return [];

    // In production, query documentation_items where contributor_id = user
    return [];
  } catch (error) {
    console.error('Error getting contributed documentation:', error);
    return [];
  }
}

/**
 * Check if documentation qualifies for featured status
 */
export function qualifiesForFeatured(doc: DocumentationItem): boolean {
  return (
    (doc.average_rating ?? 0) >= FEATURED_THRESHOLD_RATING &&
    doc.helpful_count >= FEATURED_THRESHOLD_HELPFUL &&
    doc.status === 'published'
  );
}

/**
 * Calculate earnings from a purchase
 */
export function calculatePurchaseEarnings(price: number): {
  contributorEarns: number;
  lbEarns: number;
} {
  return {
    contributorEarns: Math.round(price * CONTRIBUTOR_SHARE * 100) / 100,
    lbEarns: Math.round(price * LB_SHARE * 100) / 100,
  };
}

/**
 * Format price for display
 */
export function formatDocPrice(price: number): string {
  if (price === 0) return 'Free';
  return `${price} Credits`;
}

/**
 * Get documentation type icon/emoji
 */
export function getDocTypeIcon(type: DocType): string {
  const icons: Record<DocType, string> = {
    hint: '💡',
    walkthrough: '🚶',
    step_by_step: '📋',
    guide: '📚',
    faq: '❓',
  };
  return icons[type];
}

/**
 * Get category icon/emoji
 */
export function getCategoryIcon(category: DocCategory): string {
  const icons: Record<DocCategory, string> = {
    cottage_law: '🏠',
    technique: '👨‍🍳',
    safety: '🛡️',
    business: '💼',
    platform: '🖥️',
    equipment: '🔧',
  };
  return icons[category];
}
