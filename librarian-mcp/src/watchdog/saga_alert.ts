/**
 * Watchdog Alert Threshold Module
 *
 * Monitors saga health signals and generates alerts based on defined thresholds:
 * - Yellow: Wave wall-clock > 240s (saga-anomaly threshold)
 * - Yellow: Saga wall-clock > 25 min (approaching G-Saga-2 ceiling)
 * - Red: Any SEG errored
 * - Red: G-Saga-4 not curated within 48 hours of saga complete
 */

import { SagaHealthSignal } from './saga_monitor.js';

/**
 * Alert severity levels
 */
export type AlertClass = 'yellow' | 'red';

/**
 * Alert trigger types
 */
export type AlertTrigger =
  | 'wave_wall_clock_exceeded'
  | 'saga_wall_clock_warning'
  | 'seg_errored'
  | 'curation_overdue';

/**
 * Saga alert structure
 */
export interface SagaAlert {
  saga_id: string;
  alert_class: AlertClass;
  trigger: AlertTrigger;
  timestamp: string;
  resolved: boolean;
  details?: string;
}

/**
 * Alert thresholds in seconds
 */
const THRESHOLDS = {
  WAVE_WALL_CLOCK: 240, // 4 minutes
  SAGA_WALL_CLOCK: 1500, // 25 minutes
  CURATION_OVERDUE: 172800, // 48 hours
} as const;

/**
 * In-memory alert store
 */
const activeAlerts: Map<string, SagaAlert[]> = new Map();

/**
 * Generate a unique alert key for deduplication
 */
function getAlertKey(saga_id: string, trigger: AlertTrigger): string {
  return `${saga_id}:${trigger}`;
}

/**
 * Check if an alert already exists and is active
 */
function hasActiveAlert(saga_id: string, trigger: AlertTrigger): boolean {
  const alerts = activeAlerts.get(saga_id) || [];
  return alerts.some((alert) => alert.trigger === trigger && !alert.resolved);
}

/**
 * Add a new alert to the store
 */
function addAlert(alert: SagaAlert): void {
  const alerts = activeAlerts.get(alert.saga_id) || [];
  alerts.push(alert);
  activeAlerts.set(alert.saga_id, alerts);
}

/**
 * Check wave wall-clock threshold (Yellow alert: > 240s)
 */
function checkWaveWallClock(signal: SagaHealthSignal): SagaAlert | null {
  if (
    signal.wave_wall_clock > THRESHOLDS.WAVE_WALL_CLOCK &&
    !hasActiveAlert(signal.saga_id, 'wave_wall_clock_exceeded')
  ) {
    return {
      saga_id: signal.saga_id,
      alert_class: 'yellow',
      trigger: 'wave_wall_clock_exceeded',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: `Wave wall-clock exceeded ${THRESHOLDS.WAVE_WALL_CLOCK}s: ${signal.wave_wall_clock}s`,
    };
  }
  return null;
}

/**
 * Check saga wall-clock threshold (Yellow alert: > 25 min)
 */
function checkSagaWallClock(signal: SagaHealthSignal): SagaAlert | null {
  if (
    signal.saga_wall_clock > THRESHOLDS.SAGA_WALL_CLOCK &&
    !hasActiveAlert(signal.saga_id, 'saga_wall_clock_warning')
  ) {
    return {
      saga_id: signal.saga_id,
      alert_class: 'yellow',
      trigger: 'saga_wall_clock_warning',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: `Saga wall-clock approaching limit: ${Math.round(signal.saga_wall_clock / 60)}m`,
    };
  }
  return null;
}

/**
 * Check for errored SEGs (Red alert)
 */
function checkErroredSegs(signal: SagaHealthSignal): SagaAlert | null {
  if (signal.errored_segs > 0 && !hasActiveAlert(signal.saga_id, 'seg_errored')) {
    return {
      saga_id: signal.saga_id,
      alert_class: 'red',
      trigger: 'seg_errored',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: `${signal.errored_segs} SEG(s) in error state`,
    };
  }
  return null;
}

/**
 * Check for overdue curation (Red alert: G-Saga-4 not curated within 48 hours)
 */
function checkCurationOverdue(signal: SagaHealthSignal): SagaAlert | null {
  // Only check if saga is complete
  if (signal.status !== 'complete') {
    return null;
  }

  // Check if already has active curation overdue alert
  if (hasActiveAlert(signal.saga_id, 'curation_overdue')) {
    return null;
  }

  // Calculate time since completion
  const completedAt = new Date(signal.completed_at || signal.timestamp);
  const now = new Date();
  const timeSinceCompletion = (now.getTime() - completedAt.getTime()) / 1000;

  if (timeSinceCompletion > THRESHOLDS.CURATION_OVERDUE) {
    return {
      saga_id: signal.saga_id,
      alert_class: 'red',
      trigger: 'curation_overdue',
      timestamp: new Date().toISOString(),
      resolved: false,
      details: `Saga completed ${Math.round(timeSinceCompletion / 3600)}h ago without curation`,
    };
  }
  return null;
}

/**
 * Check all alert conditions for given saga health signals
 *
 * @param sagaSignals - Array of saga health signals to evaluate
 * @returns Array of newly generated alerts
 */
export function checkAlerts(sagaSignals: SagaHealthSignal[]): SagaAlert[] {
  const newAlerts: SagaAlert[] = [];

  for (const signal of sagaSignals) {
    // Check wave wall-clock threshold
    const waveAlert = checkWaveWallClock(signal);
    if (waveAlert) {
      addAlert(waveAlert);
      newAlerts.push(waveAlert);
    }

    // Check saga wall-clock threshold
    const sagaAlert = checkSagaWallClock(signal);
    if (sagaAlert) {
      addAlert(sagaAlert);
      newAlerts.push(sagaAlert);
    }

    // Check for errored SEGs
    const errorAlert = checkErroredSegs(signal);
    if (errorAlert) {
      addAlert(errorAlert);
      newAlerts.push(errorAlert);
    }

    // Check for overdue curation
    const curationAlert = checkCurationOverdue(signal);
    if (curationAlert) {
      addAlert(curationAlert);
      newAlerts.push(curationAlert);
    }
  }

  return newAlerts;
}

/**
 * Get all active (unresolved) alerts
 *
 * @returns Array of active alerts across all sagas
 */
export function getActiveAlerts(): SagaAlert[] {
  const allAlerts: SagaAlert[] = [];

  for (const alerts of activeAlerts.values()) {
    allAlerts.push(...alerts.filter((alert) => !alert.resolved));
  }

  return allAlerts;
}

/**
 * Resolve a specific alert for a saga
 *
 * @param saga_id - The saga identifier
 * @param trigger - The alert trigger type to resolve
 */
export function resolveAlert(saga_id: string, trigger: AlertTrigger): void {
  const alerts = activeAlerts.get(saga_id);
  if (!alerts) {
    return;
  }

  for (const alert of alerts) {
    if (alert.trigger === trigger && !alert.resolved) {
      alert.resolved = true;
    }
  }
}

/**
 * Clear all resolved alerts older than the specified age
 *
 * @param maxAgeMs - Maximum age in milliseconds (default: 7 days)
 */
export function pruneResolvedAlerts(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void {
  const cutoffTime = Date.now() - maxAgeMs;

  for (const [saga_id, alerts] of activeAlerts.entries()) {
    const prunedAlerts = alerts.filter((alert) => {
      if (!alert.resolved) {
        return true; // Keep all unresolved alerts
      }
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime > cutoffTime; // Keep recent resolved alerts
    });

    if (prunedAlerts.length === 0) {
      activeAlerts.delete(saga_id);
    } else {
      activeAlerts.set(saga_id, prunedAlerts);
    }
  }
}

/**
 * Get alerts for a specific saga
 *
 * @param saga_id - The saga identifier
 * @returns Array of alerts for the specified saga
 */
export function getAlertsForSaga(saga_id: string): SagaAlert[] {
  return activeAlerts.get(saga_id) || [];
}

/**
 * Clear all alerts (primarily for testing)
 */
export function clearAllAlerts(): void {
  activeAlerts.clear();
}

/**
 * Get alert statistics
 */
export function getAlertStats(): {
  total: number;
  active: number;
  resolved: number;
  byClass: Record<AlertClass, number>;
  byTrigger: Record<AlertTrigger, number>;
} {
  const stats = {
    total: 0,
    active: 0,
    resolved: 0,
    byClass: { yellow: 0, red: 0 } as Record<AlertClass, number>,
    byTrigger: {
      wave_wall_clock_exceeded: 0,
      saga_wall_clock_warning: 0,
      seg_errored: 0,
      curation_overdue: 0,
    } as Record<AlertTrigger, number>,
  };

  for (const alerts of activeAlerts.values()) {
    for (const alert of alerts) {
      stats.total++;
      if (alert.resolved) {
        stats.resolved++;
      } else {
        stats.active++;
      }
      stats.byClass[alert.alert_class]++;
      stats.byTrigger[alert.trigger]++;
    }
  }

  return stats;
}
