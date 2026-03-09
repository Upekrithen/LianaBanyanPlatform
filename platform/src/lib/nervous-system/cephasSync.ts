/**
 * Cephas Sync Service
 * 
 * Tracks synchronization status between LAUNCH_DOCUMENTS_MASTER and Cephas.
 * Part of the Nervous System for ensuring content consistency.
 * 
 * NOTE: Actual file sync is manual (human-gated releases).
 * This service tracks WHAT needs syncing and WHEN it was last synced.
 */

import { supabase } from '@/integrations/supabase/client';

export interface SyncTarget {
  id: string;
  source_path: string;
  target_path: string;
  content_type: string;
  last_synced_at: string | null;
  last_synced_version: string | null;
  sync_status: SyncStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type SyncStatus = 'synced' | 'pending' | 'outdated' | 'conflict' | 'new';

/**
 * Letter mapping from LAUNCH_DOCUMENTS_MASTER to Cephas
 */
export const LETTER_SYNC_MAP: Record<string, string> = {
  // Circle 1 - Investors
  'LETTER-MACKENZIE-SCOTT': 'letters/circle-1-investors/mackenzie-scott.md',
  'LETTER-WARREN-BUFFETT': 'letters/circle-1-investors/warren-buffett.md',
  'LETTER-CRAIG-NEWMARK': 'letters/circle-1-investors/craig-newmark.md',
  'LETTER-MICHAEL-SEIBEL': 'letters/circle-1-investors/michael-seibel.md',
  'LETTER-TOM-SIMON': 'letters/circle-1-investors/tom-simon.md',
  'LETTER-MELINDA-FRENCH-GATES': 'letters/circle-1-investors/melinda-french-gates.md',
  'LETTER-ANAND-GIRIDHARADAS': 'letters/circle-1-investors/anand-giridharadas.md',
  
  // Circle 2 - Media
  'LETTER-CASEY-NEWTON': 'letters/circle-2-media/casey-newton.md',
  'LETTER-TAYLOR-SWIFT': 'letters/circle-2-media/taylor-swift.md',
  'LETTER-HANK-GREEN': 'letters/circle-2-media/hank-green.md',
  'LETTER-KARA-SWISHER': 'letters/circle-2-media/kara-swisher.md',
  'LETTER-EZRA-KLEIN': 'letters/circle-2-media/ezra-klein.md',
  'LETTER-TIM-INGHAM': 'letters/circle-2-media/tim-ingham.md',
  
  // Circle 3 - Academics
  'LETTER-TREBOR-SCHOLZ': 'letters/circle-3-academics/trebor-scholz.md',
  'LETTER-NATHAN-SCHNEIDER': 'letters/circle-3-academics/nathan-schneider.md',
  'LETTER-ERIK-BRYNJOLFSSON': 'letters/circle-3-academics/erik-brynjolfsson.md',
  'LETTER-TATIANA-SCHLOSSBERG': 'letters/circle-3-academics/tatiana-schlossberg.md',
};

/**
 * Get all sync targets
 */
export async function getAllSyncTargets(): Promise<SyncTarget[]> {
  const { data, error } = await supabase
    .from('sync_targets')
    .select('*')
    .order('content_type', { ascending: true });

  if (error) {
    console.error('Error fetching sync targets:', error);
    return [];
  }

  return (data || []) as SyncTarget[];
}

/**
 * Get sync targets by status
 */
export async function getSyncTargetsByStatus(
  status: SyncStatus
): Promise<SyncTarget[]> {
  const { data, error } = await supabase
    .from('sync_targets')
    .select('*')
    .eq('sync_status', status)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching sync targets by status:', error);
    return [];
  }

  return (data || []) as SyncTarget[];
}

/**
 * Update sync status for a target
 */
export async function updateSyncStatus(
  sourcePath: string,
  status: SyncStatus,
  version?: string,
  notes?: string
): Promise<SyncTarget | null> {
  const updateData: Record<string, unknown> = {
    sync_status: status,
    updated_at: new Date().toISOString()
  };

  if (status === 'synced') {
    updateData.last_synced_at = new Date().toISOString();
    if (version) updateData.last_synced_version = version;
  }

  if (notes) updateData.notes = notes;

  const { data, error } = await supabase
    .from('sync_targets')
    .update(updateData)
    .eq('source_path', sourcePath)
    .select()
    .single();

  if (error) {
    console.error('Error updating sync status:', error);
    return null;
  }

  return data as SyncTarget;
}

/**
 * Register a new sync target
 */
export async function registerSyncTarget(
  sourcePath: string,
  targetPath: string,
  contentType: string
): Promise<SyncTarget | null> {
  const { data, error } = await supabase
    .from('sync_targets')
    .insert({
      source_path: sourcePath,
      target_path: targetPath,
      content_type: contentType,
      sync_status: 'new'
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering sync target:', error);
    return null;
  }

  return data as SyncTarget;
}

/**
 * Get sync status summary
 */
export async function getSyncStatusSummary(): Promise<{
  total: number;
  synced: number;
  pending: number;
  outdated: number;
  conflict: number;
  new: number;
  lastSyncCheck: string;
}> {
  const targets = await getAllSyncTargets();
  
  const summary = {
    total: targets.length,
    synced: 0,
    pending: 0,
    outdated: 0,
    conflict: 0,
    new: 0,
    lastSyncCheck: new Date().toISOString()
  };

  for (const target of targets) {
    switch (target.sync_status) {
      case 'synced': summary.synced++; break;
      case 'pending': summary.pending++; break;
      case 'outdated': summary.outdated++; break;
      case 'conflict': summary.conflict++; break;
      case 'new': summary.new++; break;
    }
  }

  return summary;
}

/**
 * Mark letter as synced (call after manual sync)
 */
export async function markLetterSynced(
  letterName: string,
  version: string
): Promise<boolean> {
  const sourcePath = `LAUNCH_DOCUMENTS_MASTER/letters/${letterName}`;
  const result = await updateSyncStatus(sourcePath, 'synced', version);
  return result !== null;
}

/**
 * Get letters needing sync
 */
export async function getLettersNeedingSync(): Promise<string[]> {
  const pendingTargets = await getSyncTargetsByStatus('pending');
  const outdatedTargets = await getSyncTargetsByStatus('outdated');
  const newTargets = await getSyncTargetsByStatus('new');
  
  const allNeedingSync = [...pendingTargets, ...outdatedTargets, ...newTargets];
  
  return allNeedingSync
    .filter(t => t.content_type === 'letter')
    .map(t => t.source_path);
}

/**
 * Initialize letter sync targets from mapping
 */
export async function initializeLetterSyncTargets(): Promise<number> {
  let count = 0;
  
  for (const [letterPrefix, cephasPath] of Object.entries(LETTER_SYNC_MAP)) {
    const sourcePath = `LAUNCH_DOCUMENTS_MASTER/letters/${letterPrefix}`;
    const targetPath = `Cephas/cephas-hugo/content/${cephasPath}`;
    
    const result = await registerSyncTarget(sourcePath, targetPath, 'letter');
    if (result) count++;
  }
  
  return count;
}
