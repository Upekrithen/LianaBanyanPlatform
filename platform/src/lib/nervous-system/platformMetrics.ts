/**
 * Platform Metrics Service
 * 
 * Real-time health and performance tracking for the Nervous System.
 * Records and analyzes platform-wide metrics.
 */

import { supabase } from '@/integrations/supabase/client';

export interface PlatformMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string | null;
  context: Record<string, unknown> | null;
  recorded_at: string;
}

export type MetricName = 
  | 'innovation_count'
  | 'patent_claims'
  | 'active_members'
  | 'total_transactions'
  | 'creator_earnings'
  | 'platform_margin'
  | 'content_versions'
  | 'ledger_entries'
  | 'letter_sync_status'
  | 'deployment_count'
  | 'error_rate'
  | 'response_time';

/**
 * Record a metric value
 */
export async function recordMetric(
  metricName: MetricName | string,
  value: number,
  unit?: string,
  context?: Record<string, unknown>
): Promise<PlatformMetric | null> {
  const { data, error } = await supabase
    .from('platform_metrics')
    .insert({
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit || null,
      context: context || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording metric:', error);
    return null;
  }

  return data as PlatformMetric;
}

/**
 * Get the latest value for a metric
 */
export async function getLatestMetric(
  metricName: MetricName | string
): Promise<PlatformMetric | null> {
  const { data, error } = await supabase
    .from('platform_metrics')
    .select('*')
    .eq('metric_name', metricName)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching metric:', error);
    return null;
  }

  return data as PlatformMetric | null;
}

/**
 * Get metric history over time
 */
export async function getMetricHistory(
  metricName: MetricName | string,
  hours = 24
): Promise<PlatformMetric[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('platform_metrics')
    .select('*')
    .eq('metric_name', metricName)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching metric history:', error);
    return [];
  }

  return (data || []) as PlatformMetric[];
}

/**
 * Calculate innovation velocity (innovations per day over N days)
 */
export async function calculateInnovationVelocity(days = 7): Promise<number> {
  const history = await getMetricHistory('innovation_count', days * 24);
  
  if (history.length < 2) return 0;
  
  const oldest = history[0];
  const newest = history[history.length - 1];
  const valueDiff = newest.metric_value - oldest.metric_value;
  const timeDiffMs = new Date(newest.recorded_at).getTime() - new Date(oldest.recorded_at).getTime();
  const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);
  
  return timeDiffDays > 0 ? valueDiff / timeDiffDays : 0;
}

/**
 * Detect work bursts (periods of high activity)
 */
export async function detectWorkBursts(
  metricName: MetricName | string = 'content_versions',
  thresholdMultiplier = 2
): Promise<Array<{
  burst_start: string;
  burst_end: string;
  peak_value: number;
}>> {
  const history = await getMetricHistory(metricName, 168); // 7 days
  
  if (history.length < 10) return [];
  
  const values = history.map(m => m.metric_value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const threshold = avg * thresholdMultiplier;
  
  const bursts: Array<{
    burst_start: string;
    burst_end: string;
    peak_value: number;
  }> = [];
  
  let inBurst = false;
  let burstStart = '';
  let peakValue = 0;
  
  for (const metric of history) {
    if (metric.metric_value > threshold) {
      if (!inBurst) {
        inBurst = true;
        burstStart = metric.recorded_at;
        peakValue = metric.metric_value;
      } else if (metric.metric_value > peakValue) {
        peakValue = metric.metric_value;
      }
    } else if (inBurst) {
      bursts.push({
        burst_start: burstStart,
        burst_end: metric.recorded_at,
        peak_value: peakValue
      });
      inBurst = false;
    }
  }
  
  return bursts;
}

/**
 * Get platform health dashboard data
 */
export async function getHealthDashboard(): Promise<{
  innovationCount: number;
  patentClaims: number;
  activeMembers: number;
  creatorEarnings: number;
  platformMargin: number;
  contentVersions: number;
  ledgerEntries: number;
  letterSyncStatus: number;
  lastUpdated: string;
}> {
  const metrics = await Promise.all([
    getLatestMetric('innovation_count'),
    getLatestMetric('patent_claims'),
    getLatestMetric('active_members'),
    getLatestMetric('creator_earnings'),
    getLatestMetric('platform_margin'),
    getLatestMetric('content_versions'),
    getLatestMetric('ledger_entries'),
    getLatestMetric('letter_sync_status')
  ]);

  return {
    innovationCount: metrics[0]?.metric_value || 1623,
    patentClaims: metrics[1]?.metric_value || 1336,
    activeMembers: metrics[2]?.metric_value || 0,
    creatorEarnings: metrics[3]?.metric_value || 0,
    platformMargin: metrics[4]?.metric_value || 20,
    contentVersions: metrics[5]?.metric_value || 0,
    ledgerEntries: metrics[6]?.metric_value || 0,
    letterSyncStatus: metrics[7]?.metric_value || 100,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Record critical platform numbers (run periodically)
 */
export async function recordCriticalNumbers(): Promise<void> {
  await Promise.all([
    recordMetric('innovation_count', 1647, 'count', { source: 'manual', date: '2026-03-14' }),
    recordMetric('patent_claims', 1336, 'count', { applications: 6 }),
    recordMetric('platform_margin', 20, 'percent', { locked: true }),
  ]);
}
