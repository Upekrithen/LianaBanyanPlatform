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
 * Comprehensive letter mapping: LAUNCH_DOCUMENTS_MASTER → Cephas Hugo paths.
 * Covers all 94+ letters across 9 categories.
 */
export const LETTER_SYNC_MAP: Record<string, string> = {
  // ─── Circle 1: Backers (11 letters) ──────────────────────────
  'LETTER-CRAIG-NEWMARK': 'letters/circle-1-backers/craig-newmark.md',
  'LETTER-MACKENZIE-SCOTT': 'letters/circle-1-backers/mackenzie-scott.md',
  'LETTER-MACKENZIE-SCOTT-CARDBOARD-BOOTS': 'letters/circle-1-backers/mackenzie-scott-cardboard-boots.md',
  'LETTER-WARREN-BUFFETT': 'letters/circle-1-backers/warren-buffett.md',
  'LETTER-MICHAEL-SEIBEL': 'letters/circle-1-backers/michael-seibel.md',
  'LETTER-TOM-SIMON': 'letters/circle-1-backers/tom-simon.md',
  'LETTER-MELINDA-FRENCH-GATES': 'letters/circle-1-backers/melinda-french-gates.md',
  'LETTER-ANAND-GIRIDHARADAS': 'letters/circle-1-backers/anand-giridharadas.md',
  'LETTER-HOWARD-MARKS': 'letters/circle-1-backers/howard-marks.md',
  'LETTER-LI-JIN': 'letters/circle-1-backers/li-jin.md',
  'LETTER-MAJORA-CARTER': 'letters/circle-1-backers/majora-carter.md',
  'LETTER-SETH-GODIN': 'letters/circle-1-backers/seth-godin.md',

  // ─── Circle 2: Media (14 letters) ─────────────────────────────
  'LETTER-CASEY-NEWTON': 'letters/circle-2-media/casey-newton.md',
  'LETTER-TAYLOR-SWIFT': 'letters/circle-2-media/taylor-swift.md',
  'LETTER-TAYLOR-SWIFT-V02': 'letters/circle-2-media/taylor-swift-v02.md',
  'LETTER-TAYLOR-SWIFT-V03': 'letters/circle-2-media/taylor-swift-v03.md',
  'LETTER-HANK-GREEN': 'letters/circle-2-media/hank-green.md',
  'LETTER-KARA-SWISHER': 'letters/circle-2-media/kara-swisher.md',
  'LETTER-EZRA-KLEIN': 'letters/circle-2-media/ezra-klein.md',
  'LETTER-TIM-INGHAM': 'letters/circle-2-media/tim-ingham.md',
  'LETTER-BRIAN-MERCHANT': 'letters/circle-2-media/brian-merchant.md',
  'LETTER-DOUGLAS-RUSHKOFF': 'letters/circle-2-media/douglas-rushkoff.md',
  'LETTER-ED-ZITRON': 'letters/circle-2-media/ed-zitron.md',
  'LETTER-NILAY-PATEL': 'letters/circle-2-media/nilay-patel.md',
  'LETTER-PARIS-MARX': 'letters/circle-2-media/paris-marx.md',
  'LETTER-SIMON-SINEK': 'letters/circle-2-media/simon-sinek.md',

  // ─── Circle 3: Academics (14 letters) ─────────────────────────
  'LETTER-TREBOR-SCHOLZ': 'letters/circle-3-academics/trebor-scholz.md',
  'LETTER-NATHAN-SCHNEIDER': 'letters/circle-3-academics/nathan-schneider.md',
  'LETTER-ERIK-BRYNJOLFSSON': 'letters/circle-3-academics/erik-brynjolfsson.md',
  'LETTER-TATIANA-SCHLOSSBERG': 'letters/circle-3-academics/tatiana-schlossberg.md',
  'LETTER-TATIANA-SCHLOSSBERG-CEPHAS': 'letters/circle-3-academics/tatiana-schlossberg-cephas.md',
  'LETTER-TATIANA-SCHLOSSBERG-SHORT': 'letters/circle-3-academics/tatiana-schlossberg-short.md',
  'LETTER-ARUN-SUNDARARAJAN': 'letters/circle-3-academics/arun-sundararajan.md',
  'LETTER-DARON-ACEMOGLU': 'letters/circle-3-academics/daron-acemoglu.md',
  'LETTER-ESTHER-PEREL': 'letters/circle-3-academics/esther-perel.md',
  'LETTER-JULIET-SCHOR': 'letters/circle-3-academics/juliet-schor.md',
  'LETTER-KATE-RAWORTH': 'letters/circle-3-academics/kate-raworth.md',
  'LETTER-MARIANA-MAZZUCATO': 'letters/circle-3-academics/mariana-mazzucato.md',
  'LETTER-SHOSHANA-ZUBOFF': 'letters/circle-3-academics/shoshana-zuboff.md',
  'LETTER-YOCHAI-BENKLER': 'letters/circle-3-academics/yochai-benkler.md',

  // ─── Crown Initiative (22 letters) ────────────────────────────
  'LETTER-MANEET-CHAUHAN': 'letters/crown-initiative/maneet-chauhan.md',
  'LETTER-JOSE-ANDRES': 'letters/crown-initiative/jose-andres.md',
  'LETTER-MARY-BETH-LAUGHTON': 'letters/crown-initiative/mary-beth-laughton.md',
  'LETTER-MARIE-KONDO': 'letters/crown-initiative/marie-kondo.md',
  'LETTER-ASHTON-APPLEWHITE': 'letters/crown-initiative/ashton-applewhite.md',
  'LETTER-MARC-FREEDMAN': 'letters/crown-initiative/marc-freedman.md',
  'LETTER-ALEX-OSHMYANSKY': 'letters/crown-initiative/alex-oshmyansky.md',
  'LETTER-CATHIE-MAHON': 'letters/crown-initiative/cathie-mahon.md',
  'LETTER-SALLIE-KRAWCHECK': 'letters/crown-initiative/sallie-krawcheck.md',
  'LETTER-JESSICA-JACKLEY': 'letters/crown-initiative/jessica-jackley.md',
  'LETTER-DALE-DOUGHERTY': 'letters/crown-initiative/dale-dougherty.md',
  'LETTER-MOLLY-HEMSTREET': 'letters/crown-initiative/molly-hemstreet.md',
  'LETTER-SAL-KHAN-CHANCELLOR': 'letters/crown-initiative/sal-khan-chancellor.md',
  'LETTER-KIMBERLY-WILLIAMS': 'letters/crown-initiative/kimberly-williams.md',
  'LETTER-RUTH-GLENN': 'letters/crown-initiative/ruth-glenn.md',
  'LETTER-ROBERT-KAISER': 'letters/crown-initiative/robert-kaiser.md',
  'LETTER-BRENE-BROWN': 'letters/crown-initiative/brene-brown.md',
  'LETTER-AI-JEN-POO': 'letters/crown-initiative/ai-jen-poo.md',
  'LETTER-TAYLOR-SWIFT-CROWN': 'letters/crown-initiative/taylor-swift.md',
  'LETTER-MICHAEL-SEIBEL-CEO': 'letters/crown-initiative/michael-seibel-ceo.md',
  'LETTER-MARIAELENA-HUAMBACHANO': 'letters/crown-initiative/mariaelena-huambachano.md',
  'LETTER-MUHAMMAD-YUNUS': 'letters/crown-initiative/muhammad-yunus.md',

  // ─── Crown Letters (at root) ──────────────────────────────────
  'CROWN-LETTER-AOC': 'letters/crown-letter-aoc.md',
  'CROWN-LETTER-KEANU-REEVES': 'letters/crown-letter-keanu-reeves.md',
  'CROWN-LETTER-SANDRA-BULLOCK': 'letters/crown-letter-sandra-bullock.md',
  'CROWN-LETTER-SCHWARZENEGGER': 'letters/crown-letter-schwarzenegger.md',

  // ─── Pitches (17 letters) ─────────────────────────────────────
  'PITCH-ARS-TECHNICA': 'letters/pitches/ars-technica.md',
  'PITCH-HACKER-NEWS': 'letters/pitches/hacker-news.md',
  'PITCH-INVESTOPEDIA': 'letters/pitches/investopedia.md',
  'PITCH-KAISER-HEALTH-NEWS': 'letters/pitches/kaiser-health-news.md',
  'PITCH-MIT-MEDIA-LAB': 'letters/pitches/mit-media-lab.md',
  'PITCH-NERDWALLET': 'letters/pitches/nerdwallet.md',
  'PITCH-PENNY-HOARDER': 'letters/pitches/penny-hoarder.md',
  'PITCH-PODCAST-TEMPLATE': 'letters/pitches/podcast-template.md',
  'PITCH-PRODUCT-HUNT': 'letters/pitches/product-hunt.md',
  'PITCH-SHAREABLE': 'letters/pitches/shareable.md',
  'PITCH-SSIR': 'letters/pitches/ssir.md',
  'PITCH-STAT-NEWS': 'letters/pitches/stat-news.md',
  'PITCH-TECHCRUNCH': 'letters/pitches/techcrunch.md',
  'PITCH-THE-VERGE': 'letters/pitches/the-verge.md',
  'PITCH-WSJ-FEATURE': 'letters/pitches/wsj-feature-611-patents.md',
  'PITCH-WSJ-OPED-IMPACT': 'letters/pitches/wsj-oped-contribution-impact.md',
  'PITCH-YES-MAGAZINE': 'letters/pitches/yes-magazine.md',

  // ─── Partnerships (5 letters) ─────────────────────────────────
  'PARTNERSHIP-BAMBU-LAB': 'letters/partnerships/bambu-lab.md',
  'PARTNERSHIP-KALLISTRA': 'letters/partnerships/kallistra.md',
  'PARTNERSHIP-LORESCAPE': 'letters/partnerships/lorescape.md',
  'PARTNERSHIP-OPENWARHEX': 'letters/partnerships/openwarhex.md',
  'PARTNERSHIP-TERRATILES': 'letters/partnerships/terratiles.md',

  // ─── Blessing (3 letters) ─────────────────────────────────────
  'BLESSING-DOLLY-PARTON': 'letters/blessing/dolly-parton.md',
  'BLESSING-JIMMY-KIMMEL': 'letters/blessing/jimmy-kimmel.md',
  'BLESSING-PITBULL': 'letters/blessing/pitbull.md',

  // ─── Health (3 letters) ───────────────────────────────────────
  'HEALTH-FACEBOOK-FRIEND': 'letters/health/facebook-friend-impossible-choice.md',
  'HEALTH-JIMMY-KIMMEL': 'letters/health/jimmy-kimmel-healthcare.md',
  'HEALTH-PET-STORE': 'letters/health/pet-store-consideration.md',

  // ─── Professional (1 letter) ──────────────────────────────────
  'PROFESSIONAL-LEGAL-COUNSEL': 'letters/professional/legal-counsel-request.md',
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
