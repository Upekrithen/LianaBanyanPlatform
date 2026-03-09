/**
 * IP Ledger Service
 * 
 * Immutable, hash-chained records for critical platform data.
 * Every innovation, medallion mint, and governance decision is logged
 * with cryptographic integrity.
 */

import { supabase } from '@/integrations/supabase/client';

export interface IPLedgerEntry {
  id: string;
  sequence_number: number;
  entry_type: IPLedgerEntryType;
  entry_data: Record<string, unknown>;
  previous_hash: string | null;
  current_hash: string;
  created_at: string;
}

export type IPLedgerEntryType = 
  | 'innovation.registered'
  | 'medallion.minted'
  | 'governance.decision'
  | 'content.created'
  | 'content.updated'
  | 'patent.filed'
  | 'patent.granted'
  | 'sponsor.allocated'
  | 'metric.recorded';

/**
 * Generate SHA-256 hash for ledger entry
 */
async function generateHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get the latest entry from the IP Ledger
 */
export async function getLatestEntry(): Promise<IPLedgerEntry | null> {
  const { data, error } = await supabase
    .from('ip_ledger')
    .select('*')
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching latest IP Ledger entry:', error);
    return null;
  }

  return data as IPLedgerEntry | null;
}

/**
 * Add a new entry to the IP Ledger with hash chain integrity
 */
export async function addToIPLedger(
  entryType: IPLedgerEntryType,
  entryData: Record<string, unknown>
): Promise<IPLedgerEntry | null> {
  try {
    const latestEntry = await getLatestEntry();
    const previousHash = latestEntry?.current_hash || null;
    const sequenceNumber = (latestEntry?.sequence_number || 0) + 1;

    const dataToHash = JSON.stringify({
      sequence_number: sequenceNumber,
      entry_type: entryType,
      entry_data: entryData,
      previous_hash: previousHash,
      timestamp: new Date().toISOString()
    });

    const currentHash = await generateHash(dataToHash);

    const { data, error } = await supabase
      .from('ip_ledger')
      .insert({
        sequence_number: sequenceNumber,
        entry_type: entryType,
        entry_data: entryData,
        previous_hash: previousHash,
        current_hash: currentHash
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to IP Ledger:', error);
      return null;
    }

    return data as IPLedgerEntry;
  } catch (err) {
    console.error('Exception adding to IP Ledger:', err);
    return null;
  }
}

/**
 * Verify the integrity of the IP Ledger chain
 */
export async function verifyLedgerIntegrity(): Promise<{
  valid: boolean;
  brokenAt?: number;
  message: string;
}> {
  const { data: entries, error } = await supabase
    .from('ip_ledger')
    .select('*')
    .order('sequence_number', { ascending: true });

  if (error) {
    return { valid: false, message: `Error fetching ledger: ${error.message}` };
  }

  if (!entries || entries.length === 0) {
    return { valid: true, message: 'Ledger is empty' };
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as IPLedgerEntry;
    
    if (i === 0 && entry.previous_hash !== null) {
      return { 
        valid: false, 
        brokenAt: entry.sequence_number,
        message: 'First entry should have null previous_hash' 
      };
    }

    if (i > 0) {
      const previousEntry = entries[i - 1] as IPLedgerEntry;
      if (entry.previous_hash !== previousEntry.current_hash) {
        return {
          valid: false,
          brokenAt: entry.sequence_number,
          message: `Hash chain broken at sequence ${entry.sequence_number}`
        };
      }
    }
  }

  return { 
    valid: true, 
    message: `Ledger verified: ${entries.length} entries, chain intact` 
  };
}

/**
 * Get ledger entries by type
 */
export async function getLedgerEntriesByType(
  entryType: IPLedgerEntryType,
  limit = 100
): Promise<IPLedgerEntry[]> {
  const { data, error } = await supabase
    .from('ip_ledger')
    .select('*')
    .eq('entry_type', entryType)
    .order('sequence_number', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching ledger entries:', error);
    return [];
  }

  return (data || []) as IPLedgerEntry[];
}

/**
 * Get ledger statistics
 */
export async function getLedgerStats(): Promise<{
  totalEntries: number;
  entriesByType: Record<string, number>;
  latestSequence: number;
  chainValid: boolean;
}> {
  const { data: entries, error } = await supabase
    .from('ip_ledger')
    .select('entry_type, sequence_number');

  if (error || !entries) {
    return {
      totalEntries: 0,
      entriesByType: {},
      latestSequence: 0,
      chainValid: false
    };
  }

  const entriesByType: Record<string, number> = {};
  let latestSequence = 0;

  for (const entry of entries) {
    const type = (entry as { entry_type: string }).entry_type;
    entriesByType[type] = (entriesByType[type] || 0) + 1;
    const seq = (entry as { sequence_number: number }).sequence_number;
    if (seq > latestSequence) latestSequence = seq;
  }

  const integrity = await verifyLedgerIntegrity();

  return {
    totalEntries: entries.length,
    entriesByType,
    latestSequence,
    chainValid: integrity.valid
  };
}

/**
 * Log an innovation registration
 */
export async function logInnovation(
  innovationNumber: number,
  title: string,
  category: string,
  description?: string
): Promise<IPLedgerEntry | null> {
  return addToIPLedger('innovation.registered', {
    innovation_number: innovationNumber,
    title,
    category,
    description,
    registered_at: new Date().toISOString()
  });
}

/**
 * Log a medallion mint
 */
export async function logMedallionMint(
  medallionId: string,
  userId: string,
  tier: string,
  value: number
): Promise<IPLedgerEntry | null> {
  return addToIPLedger('medallion.minted', {
    medallion_id: medallionId,
    user_id: userId,
    tier,
    value,
    minted_at: new Date().toISOString()
  });
}

/**
 * Log a governance decision
 */
export async function logGovernanceDecision(
  decisionType: string,
  description: string,
  votingResult?: Record<string, unknown>
): Promise<IPLedgerEntry | null> {
  return addToIPLedger('governance.decision', {
    decision_type: decisionType,
    description,
    voting_result: votingResult,
    decided_at: new Date().toISOString()
  });
}
