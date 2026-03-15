/**
 * CONTENT PIPELINE — Sequential Content Evolution System
 * ======================================================
 * Innovation #1505: Three-Tier Reading Level Content Pipeline
 *
 * The Founder's directive: "Built RIGHT, no matter if it delays the launch."
 *
 * Pipeline stages (sequential — each builds from the previous):
 *   1. SEED    — Raw idea, insight, or observation (< 50 words)
 *   2. TLDR    — Distilled explanation (100-300 words)
 *   3. BLOG    — Narrative blog post (500-1500 words)
 *   4. ARTICLE — Full article with evidence (1500-5000 words)
 *   5. PAPER   — Academic paper with citations (3000-15000 words)
 *
 * Each stage is a complete publishable unit. Moving to the next
 * stage EXTENDS the content — nothing is lost.
 *
 * Integration points:
 * - Cephas Hugo site (external publishing)
 * - Battery dispatch (social media)
 * - economicPapers.ts (reading level selector)
 * - Treasure Keys (keys embedded at each level)
 * - Cue Cards (shareable at any stage)
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export type PipelineStage = 'seed' | 'tldr' | 'blog' | 'article' | 'paper';
export type ContentStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';
export type ContentCategory =
  | 'economics'
  | 'governance'
  | 'technology'
  | 'civic'
  | 'gaming'
  | 'community'
  | 'legal'
  | 'education'
  | 'culture'
  | 'general'
  | 'religion'      // Areopagus doctrine content
  | 'perspective';  // Areopagus op-eds and opinion pieces

export interface PipelineContent {
  id: string;
  // Identity
  slug: string;
  title: string;
  subtitle?: string;
  category: ContentCategory;
  tags: string[];
  // Author
  authorId: string;
  authorName: string;
  // Pipeline state
  currentStage: PipelineStage;
  stages: StageHistory[];
  // Current content at each completed stage
  seedContent?: string;        // < 50 words
  tldrContent?: string;        // 100-300 words
  blogContent?: string;        // 500-1500 words
  articleContent?: string;     // 1500-5000 words
  paperContent?: string;       // 3000-15000 words
  // Status
  status: ContentStatus;
  publishedAt?: string;
  // Metadata
  wordCount: number;
  readingTimeMinutes: number;
  coverageMinutesValue: number; // How many Coverage Minutes reading this earns
  // References
  relatedContentIds: string[];
  innovationNumbers: number[];  // Linked innovation #s from registry
  patentSeries?: string;        // e.g., "ATF-001 through ATF-018"
  treasureKeyIds: string[];     // Linked treasure keys
  // Cue Card / Battery
  cueCardId?: string;           // If a Cue Card has been minted for this
  batteryCampaignId?: string;   // If included in a Battery campaign
  // Cephas sync
  cephasPath?: string;          // Path on the2ndSecond.com
  cephasSyncStatus?: 'synced' | 'pending' | 'outdated' | 'new';
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface StageHistory {
  stage: PipelineStage;
  enteredAt: string;
  completedAt?: string;
  wordCount: number;
  approvedBy?: string;
  notes?: string;
}

export interface StageRequirements {
  stage: PipelineStage;
  label: string;
  description: string;
  minWords: number;
  maxWords: number;
  requiredFields: string[];
  icon: string;        // Lucide icon name
  color: string;       // Tailwind color class
  readingLevel: string; // Who this is for
}

// ============================================================================
// STAGE DEFINITIONS
// ============================================================================

export const PIPELINE_STAGES: StageRequirements[] = [
  {
    stage: 'seed',
    label: 'Seed',
    description: 'A raw idea, insight, or observation. One paragraph max.',
    minWords: 5,
    maxWords: 50,
    requiredFields: ['title', 'seedContent'],
    icon: 'Sprout',
    color: 'emerald',
    readingLevel: 'Anyone — 10 seconds',
  },
  {
    stage: 'tldr',
    label: 'TL;DR',
    description: 'A distilled explanation anyone can understand in 2 minutes.',
    minWords: 100,
    maxWords: 300,
    requiredFields: ['title', 'tldrContent', 'category'],
    icon: 'Zap',
    color: 'amber',
    readingLevel: 'At a Glance — 2 minutes',
  },
  {
    stage: 'blog',
    label: 'Blog Post',
    description: 'A narrative blog post with examples and context.',
    minWords: 500,
    maxWords: 1500,
    requiredFields: ['title', 'subtitle', 'blogContent', 'category', 'tags'],
    icon: 'PenTool',
    color: 'blue',
    readingLevel: 'General audience — 5-10 minutes',
  },
  {
    stage: 'article',
    label: 'Article',
    description: 'A full article with evidence, data, and real-world examples.',
    minWords: 1500,
    maxWords: 5000,
    requiredFields: ['title', 'subtitle', 'articleContent', 'category', 'tags'],
    icon: 'FileText',
    color: 'purple',
    readingLevel: 'Informed reader — 15-30 minutes',
  },
  {
    stage: 'paper',
    label: 'Academic Paper',
    description: 'A formal paper with citations, methodology, and analysis.',
    minWords: 3000,
    maxWords: 15000,
    requiredFields: ['title', 'subtitle', 'paperContent', 'category', 'tags', 'patentSeries'],
    icon: 'GraduationCap',
    color: 'red',
    readingLevel: 'Academic — 30-60 minutes',
  },
];

/**
 * Get stage requirements by name.
 */
export function getStageRequirements(stage: PipelineStage): StageRequirements {
  return PIPELINE_STAGES.find(s => s.stage === stage)!;
}

/**
 * Get the next stage in the pipeline.
 */
export function getNextStage(current: PipelineStage): PipelineStage | null {
  const stageOrder: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];
  const idx = stageOrder.indexOf(current);
  if (idx === -1 || idx >= stageOrder.length - 1) return null;
  return stageOrder[idx + 1];
}

/**
 * Get the previous stage in the pipeline.
 */
export function getPreviousStage(current: PipelineStage): PipelineStage | null {
  const stageOrder: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];
  const idx = stageOrder.indexOf(current);
  if (idx <= 0) return null;
  return stageOrder[idx - 1];
}

/**
 * Get all stages up to and including the current one.
 */
export function getCompletedStages(current: PipelineStage): PipelineStage[] {
  const stageOrder: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];
  const idx = stageOrder.indexOf(current);
  return stageOrder.slice(0, idx + 1);
}

// ============================================================================
// WORD COUNT & READING TIME
// ============================================================================

const READING_SPEED_WPM = 238; // LB canonical reading speed

/**
 * Count words in text.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate reading time in minutes.
 */
export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / READING_SPEED_WPM);
}

/**
 * Calculate Coverage Minutes value for content.
 * Earned in 3-minute chunks, max 180 per session.
 */
export function calculateCoverageMinutesValue(wordCount: number): number {
  const rawMinutes = wordCount / READING_SPEED_WPM;
  // Round DOWN to nearest 3-minute chunk
  return Math.floor(rawMinutes / 3) * 3;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  wordCount: number;
  stage: PipelineStage;
}

/**
 * Validate content for a specific stage.
 */
export function validateForStage(
  content: Partial<PipelineContent>,
  stage: PipelineStage
): ValidationResult {
  const requirements = getStageRequirements(stage);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get the content text for this stage
  const stageContentMap: Record<PipelineStage, string | undefined> = {
    seed: content.seedContent,
    tldr: content.tldrContent,
    blog: content.blogContent,
    article: content.articleContent,
    paper: content.paperContent,
  };

  const text = stageContentMap[stage] || '';
  const wc = countWords(text);

  // Check required fields
  for (const field of requirements.requiredFields) {
    const value = (content as any)[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${field} is required for ${requirements.label} stage`);
    }
  }

  // Check word count
  if (wc < requirements.minWords) {
    errors.push(
      `${requirements.label} requires at least ${requirements.minWords} words (currently ${wc})`
    );
  }
  if (wc > requirements.maxWords) {
    warnings.push(
      `${requirements.label} should be under ${requirements.maxWords} words (currently ${wc})`
    );
  }

  // Stage-specific checks
  if (stage === 'paper' && !content.patentSeries) {
    warnings.push('Academic papers should reference patent series for IP tracking');
  }

  if (stage === 'blog' && (!content.tags || content.tags.length === 0)) {
    errors.push('Blog posts require at least one tag');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    wordCount: wc,
    stage,
  };
}

// ============================================================================
// PIPELINE OPERATIONS (DATABASE)
// ============================================================================

/**
 * Create a new content item starting at the seed stage.
 */
export async function createContent(
  title: string,
  seedContent: string,
  authorId: string,
  authorName: string,
  category: ContentCategory = 'general'
): Promise<PipelineContent | null> {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const now = new Date().toISOString();
  const wc = countWords(seedContent);

  const contentData = {
    slug,
    title,
    category,
    tags: [],
    author_id: authorId,
    author_name: authorName,
    current_stage: 'seed' as PipelineStage,
    stages: [
      {
        stage: 'seed',
        enteredAt: now,
        wordCount: wc,
      },
    ],
    seed_content: seedContent,
    status: 'draft' as ContentStatus,
    word_count: wc,
    reading_time_minutes: calculateReadingTime(wc),
    coverage_minutes_value: calculateCoverageMinutesValue(wc),
    related_content_ids: [],
    innovation_numbers: [],
    treasure_key_ids: [],
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('content_pipeline')
    .insert(contentData)
    .select()
    .single();

  if (error) {
    console.error('Error creating content:', error);
    return null;
  }

  return mapDbToContent(data);
}

/**
 * Advance content to the next pipeline stage.
 */
export async function advanceStage(
  contentId: string,
  newStageContent: string,
  approvedBy?: string,
  notes?: string
): Promise<PipelineContent | null> {
  // Fetch current content
  const { data: current, error: fetchError } = await supabase
    .from('content_pipeline')
    .select('*')
    .eq('id', contentId)
    .single();

  if (fetchError || !current) {
    console.error('Error fetching content:', fetchError);
    return null;
  }

  const nextStage = getNextStage(current.current_stage);
  if (!nextStage) {
    console.error('Content is already at the final stage');
    return null;
  }

  const now = new Date().toISOString();
  const wc = countWords(newStageContent);

  // Mark current stage as completed
  const stages = [...(current.stages || [])];
  const lastStage = stages[stages.length - 1];
  if (lastStage && !lastStage.completedAt) {
    lastStage.completedAt = now;
    lastStage.approvedBy = approvedBy;
  }

  // Add new stage entry
  stages.push({
    stage: nextStage,
    enteredAt: now,
    wordCount: wc,
    notes,
  });

  // Content field name for the new stage
  const stageFieldMap: Record<PipelineStage, string> = {
    seed: 'seed_content',
    tldr: 'tldr_content',
    blog: 'blog_content',
    article: 'article_content',
    paper: 'paper_content',
  };

  const { data, error } = await supabase
    .from('content_pipeline')
    .update({
      current_stage: nextStage,
      stages,
      [stageFieldMap[nextStage]]: newStageContent,
      word_count: wc,
      reading_time_minutes: calculateReadingTime(wc),
      coverage_minutes_value: calculateCoverageMinutesValue(wc),
      updated_at: now,
    })
    .eq('id', contentId)
    .select()
    .single();

  if (error) {
    console.error('Error advancing stage:', error);
    return null;
  }

  return mapDbToContent(data);
}

/**
 * Publish content at its current stage.
 */
export async function publishContent(contentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('content_pipeline')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  return !error;
}

/**
 * Get all content items, optionally filtered.
 */
export async function getContentList(options: {
  stage?: PipelineStage;
  status?: ContentStatus;
  category?: ContentCategory;
  authorId?: string;
  limit?: number;
} = {}): Promise<PipelineContent[]> {
  let query = supabase
    .from('content_pipeline')
    .select('*')
    .order('updated_at', { ascending: false });

  if (options.stage) query = query.eq('current_stage', options.stage);
  if (options.status) query = query.eq('status', options.status);
  if (options.category) query = query.eq('category', options.category);
  if (options.authorId) query = query.eq('author_id', options.authorId);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching content list:', error);
    return [];
  }

  return (data || []).map(mapDbToContent);
}

/**
 * Get a single content item by ID.
 */
export async function getContentById(contentId: string): Promise<PipelineContent | null> {
  const { data, error } = await supabase
    .from('content_pipeline')
    .select('*')
    .eq('id', contentId)
    .single();

  if (error) {
    console.error('Error fetching content:', error);
    return null;
  }

  return mapDbToContent(data);
}

/**
 * Get content by slug.
 */
export async function getContentBySlug(slug: string): Promise<PipelineContent | null> {
  const { data, error } = await supabase
    .from('content_pipeline')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return mapDbToContent(data);
}

// ============================================================================
// STAGE-SPECIFIC CONTENT GETTERS
// ============================================================================

/**
 * Get the best available content for display.
 * Returns the highest-stage content that's been written.
 */
export function getBestContent(content: PipelineContent): {
  text: string;
  stage: PipelineStage;
  wordCount: number;
} {
  // Check from highest to lowest
  if (content.paperContent) return { text: content.paperContent, stage: 'paper', wordCount: countWords(content.paperContent) };
  if (content.articleContent) return { text: content.articleContent, stage: 'article', wordCount: countWords(content.articleContent) };
  if (content.blogContent) return { text: content.blogContent, stage: 'blog', wordCount: countWords(content.blogContent) };
  if (content.tldrContent) return { text: content.tldrContent, stage: 'tldr', wordCount: countWords(content.tldrContent) };
  if (content.seedContent) return { text: content.seedContent, stage: 'seed', wordCount: countWords(content.seedContent) };
  return { text: '', stage: 'seed', wordCount: 0 };
}

/**
 * Get content at a specific reading level.
 * Falls back to the closest available level.
 */
export function getContentAtLevel(
  content: PipelineContent,
  level: PipelineStage
): string {
  const stageContentMap: Record<PipelineStage, string | undefined> = {
    seed: content.seedContent,
    tldr: content.tldrContent,
    blog: content.blogContent,
    article: content.articleContent,
    paper: content.paperContent,
  };

  // Try exact level
  if (stageContentMap[level]) return stageContentMap[level]!;

  // Fall back to closest lower level
  const stageOrder: PipelineStage[] = ['seed', 'tldr', 'blog', 'article', 'paper'];
  const idx = stageOrder.indexOf(level);
  for (let i = idx - 1; i >= 0; i--) {
    if (stageContentMap[stageOrder[i]]) return stageContentMap[stageOrder[i]]!;
  }

  // Fall back to closest higher level
  for (let i = idx + 1; i < stageOrder.length; i++) {
    if (stageContentMap[stageOrder[i]]) return stageContentMap[stageOrder[i]]!;
  }

  return '';
}

// ============================================================================
// PIPELINE STATISTICS
// ============================================================================

/**
 * Get pipeline statistics.
 */
export async function getPipelineStats(): Promise<{
  totalItems: number;
  byStage: Record<PipelineStage, number>;
  byStatus: Record<ContentStatus, number>;
  byCategory: Record<string, number>;
  avgWordCount: number;
  totalCoverageMinutes: number;
}> {
  const { data, error } = await supabase
    .from('content_pipeline')
    .select('current_stage, status, category, word_count, coverage_minutes_value');

  if (error || !data) {
    return {
      totalItems: 0,
      byStage: { seed: 0, tldr: 0, blog: 0, article: 0, paper: 0 },
      byStatus: { draft: 0, review: 0, approved: 0, published: 0, archived: 0 },
      byCategory: {},
      avgWordCount: 0,
      totalCoverageMinutes: 0,
    };
  }

  const byStage: Record<string, number> = { seed: 0, tldr: 0, blog: 0, article: 0, paper: 0 };
  const byStatus: Record<string, number> = { draft: 0, review: 0, approved: 0, published: 0, archived: 0 };
  const byCategory: Record<string, number> = {};
  let totalWords = 0;
  let totalCM = 0;

  for (const item of data) {
    byStage[item.current_stage] = (byStage[item.current_stage] || 0) + 1;
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    totalWords += item.word_count || 0;
    totalCM += item.coverage_minutes_value || 0;
  }

  return {
    totalItems: data.length,
    byStage: byStage as Record<PipelineStage, number>,
    byStatus: byStatus as Record<ContentStatus, number>,
    byCategory,
    avgWordCount: data.length > 0 ? Math.round(totalWords / data.length) : 0,
    totalCoverageMinutes: totalCM,
  };
}

// ============================================================================
// DATABASE MAPPING
// ============================================================================

function mapDbToContent(data: any): PipelineContent {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    category: data.category,
    tags: data.tags || [],
    authorId: data.author_id,
    authorName: data.author_name,
    currentStage: data.current_stage,
    stages: data.stages || [],
    seedContent: data.seed_content,
    tldrContent: data.tldr_content,
    blogContent: data.blog_content,
    articleContent: data.article_content,
    paperContent: data.paper_content,
    status: data.status,
    publishedAt: data.published_at,
    wordCount: data.word_count || 0,
    readingTimeMinutes: data.reading_time_minutes || 0,
    coverageMinutesValue: data.coverage_minutes_value || 0,
    relatedContentIds: data.related_content_ids || [],
    innovationNumbers: data.innovation_numbers || [],
    patentSeries: data.patent_series,
    treasureKeyIds: data.treasure_key_ids || [],
    cueCardId: data.cue_card_id,
    batteryCampaignId: data.battery_campaign_id,
    cephasPath: data.cephas_path,
    cephasSyncStatus: data.cephas_sync_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  PIPELINE_STAGES,
  getStageRequirements,
  getNextStage,
  getPreviousStage,
  getCompletedStages,
  countWords,
  calculateReadingTime,
  calculateCoverageMinutesValue,
  validateForStage,
  createContent,
  advanceStage,
  publishContent,
  getContentList,
  getContentById,
  getContentBySlug,
  getBestContent,
  getContentAtLevel,
  getPipelineStats,
};
