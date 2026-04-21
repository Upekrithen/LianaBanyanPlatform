/**
 * Content Versioning Service
 *
 * Tracks all document, configuration, and data changes with full version history.
 * Part of the Nervous System for platform-wide synchronization.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ContentVersion {
  id: string;
  content_type: ContentType;
  content_id: string;
  version_number: number;
  content_hash: string;
  changes: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

export type ContentType =
  | 'letter'
  | 'article'
  | 'initiative'
  | 'under-the-hood'
  | 'patent'
  | 'innovation'
  | 'bylaw'
  | 'policy'
  | 'configuration';

/**
 * Generate SHA-256 hash for content
 */
async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the latest version of a content item
 */
export async function getLatestVersion(
  contentType: ContentType,
  contentId: string
): Promise<ContentVersion | null> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching content version:', error);
    return null;
  }

  return data as ContentVersion | null;
}

/**
 * Get all versions of a content item
 */
export async function getVersionHistory(
  contentType: ContentType,
  contentId: string
): Promise<ContentVersion[]> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Error fetching version history:', error);
    return [];
  }

  return (data || []) as ContentVersion[];
}

/**
 * Create a new version of content
 */
export async function createVersion(
  contentType: ContentType,
  contentId: string,
  content: string,
  changes?: Record<string, unknown>,
  createdBy?: string
): Promise<ContentVersion | null> {
  try {
    const latestVersion = await getLatestVersion(contentType, contentId);
    const versionNumber = (latestVersion?.version_number || 0) + 1;
    const contentHash = await generateContentHash(content);

    if (latestVersion?.content_hash === contentHash) {
      return latestVersion;
    }

    const { data, error } = await supabase
      .from('content_versions')
      .insert({
        content_type: contentType,
        content_id: contentId,
        version_number: versionNumber,
        content_hash: contentHash,
        changes: changes || null,
        created_by: createdBy || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content version:', error);
      return null;
    }

    return data as ContentVersion;
  } catch (err) {
    console.error('Exception creating content version:', err);
    return null;
  }
}

/**
 * Compare two versions and return differences
 */
export async function compareVersions(
  contentType: ContentType,
  contentId: string,
  versionA: number,
  versionB: number
): Promise<{
  versionA: ContentVersion | null;
  versionB: ContentVersion | null;
  hashMatch: boolean;
}> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .in('version_number', [versionA, versionB]);

  if (error || !data) {
    return { versionA: null, versionB: null, hashMatch: false };
  }

  const versions = data as ContentVersion[];
  const verA = versions.find(v => v.version_number === versionA) || null;
  const verB = versions.find(v => v.version_number === versionB) || null;

  return {
    versionA: verA,
    versionB: verB,
    hashMatch: verA?.content_hash === verB?.content_hash
  };
}

/**
 * Get recently modified content across all types
 */
export async function getRecentChanges(
  limit = 50,
  contentTypes?: ContentType[]
): Promise<ContentVersion[]> {
  let query = supabase
    .from('content_versions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (contentTypes && contentTypes.length > 0) {
    query = query.in('content_type', contentTypes);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching recent changes:', error);
    return [];
  }

  return (data || []) as ContentVersion[];
}

/**
 * Get content versioning statistics
 */
export async function getVersioningStats(): Promise<{
  totalVersions: number;
  uniqueContent: number;
  versionsByType: Record<string, number>;
  recentActivity: number;
}> {
  const { data: versions, error } = await supabase
    .from('content_versions')
    .select('content_type, content_id, created_at');

  if (error || !versions) {
    return {
      totalVersions: 0,
      uniqueContent: 0,
      versionsByType: {},
      recentActivity: 0
    };
  }

  const versionsByType: Record<string, number> = {};
  const uniqueContentIds = new Set<string>();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  let recentActivity = 0;

  for (const version of versions) {
    const v = version as { content_type: string; content_id: string; created_at: string };
    versionsByType[v.content_type] = (versionsByType[v.content_type] || 0) + 1;
    uniqueContentIds.add(`${v.content_type}:${v.content_id}`);
    if (new Date(v.created_at) > oneDayAgo) recentActivity++;
  }

  return {
    totalVersions: versions.length,
    uniqueContent: uniqueContentIds.size,
    versionsByType,
    recentActivity
  };
}
