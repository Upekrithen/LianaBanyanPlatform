/**
 * Nervous System
 *
 * Central monitoring and synchronization layer for the Liana Banyan platform.
 * Tracks changes, maintains version history, and ensures all systems stay in sync.
 *
 * Components:
 * - IP Ledger: Immutable, hash-chained records for critical data
 * - Content Versioning: Full version history for all documents
 * - Platform Metrics: Real-time health and performance tracking
 * - Cephas Sync: Synchronization status between source and public docs
 */

export * from './ipLedger';
export * from './contentVersioning';
export * from './platformMetrics';
export * from './cephasSync';
export * from './knowledgeBase';

import { getLedgerStats, verifyLedgerIntegrity } from './ipLedger';
import { getVersioningStats } from './contentVersioning';
import { getHealthDashboard } from './platformMetrics';
import { getSyncStatusSummary } from './cephasSync';

/**
 * Get complete Nervous System status
 */
export async function getNervousSystemStatus(): Promise<{
  ipLedger: {
    totalEntries: number;
    chainValid: boolean;
    entriesByType: Record<string, number>;
  };
  contentVersioning: {
    totalVersions: number;
    uniqueContent: number;
    recentActivity: number;
  };
  platformMetrics: {
    innovationCount: number;
    patentClaims: number;
    platformMargin: number;
  };
  cephasSync: {
    total: number;
    synced: number;
    pending: number;
    outdated: number;
  };
  overallHealth: 'healthy' | 'warning' | 'critical';
  lastChecked: string;
}> {
  const [ledgerStats, versioningStats, healthDashboard, syncSummary] = await Promise.all([
    getLedgerStats(),
    getVersioningStats(),
    getHealthDashboard(),
    getSyncStatusSummary()
  ]);

  const ledgerIntegrity = await verifyLedgerIntegrity();

  let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (!ledgerIntegrity.valid) {
    overallHealth = 'critical';
  } else if (syncSummary.outdated > 5 || syncSummary.pending > 10) {
    overallHealth = 'warning';
  }

  return {
    ipLedger: {
      totalEntries: ledgerStats.totalEntries,
      chainValid: ledgerStats.chainValid,
      entriesByType: ledgerStats.entriesByType
    },
    contentVersioning: {
      totalVersions: versioningStats.totalVersions,
      uniqueContent: versioningStats.uniqueContent,
      recentActivity: versioningStats.recentActivity
    },
    platformMetrics: {
      innovationCount: healthDashboard.innovationCount,
      patentClaims: healthDashboard.patentClaims,
      platformMargin: healthDashboard.platformMargin
    },
    cephasSync: {
      total: syncSummary.total,
      synced: syncSummary.synced,
      pending: syncSummary.pending,
      outdated: syncSummary.outdated
    },
    overallHealth,
    lastChecked: new Date().toISOString()
  };
}

/**
 * Critical numbers that must be accurate everywhere
 */
export const CRITICAL_NUMBERS = {
  CREATOR_KEEPS: 83.3,
  PLATFORM_MARGIN: 20,
  INNOVATIONS: 2270,
  PATENT_CLAIMS: 2473,
  PATENT_APPLICATIONS: 21,
  CROWN_JEWELS: 228,
  MEMBERSHIP_COST: 5,
  INITIATIVES: 16,
  STRUCTURAL_BYLAWS: 15,
} as const;
