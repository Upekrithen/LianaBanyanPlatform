/**
 * OVERWORLD BEACON NODES
 * ======================
 * Numbered beacon stop data and drawing helpers for the 2D overworld.
 *
 * Beacon stops are the numbered circles that mark key locations on the map.
 * This module provides beacon rendering configuration and helper functions
 * used by the OverworldCanvas render loop.
 *
 * Visual features:
 *   - Numbered circles at beacon stops
 *   - Name label below each
 *   - Pulsing animation for current/next
 *   - Pipe station icon overlay on beacons that have stations
 *   - Special styling for canal quarter beacons
 */

// ─── Beacon Rendering Config ────────────────────────────────────────────────

export const BEACON_CONFIG = {
  /** Normal beacon circle radius */
  radius: 10,
  /** Active (current) beacon color */
  activeColor: "#fbbf24",
  /** Inactive beacon color */
  inactiveColor: "#94a3b8",
  /** Active border color */
  activeBorderColor: "#f59e0b",
  /** Inactive border color */
  inactiveBorderColor: "#64748b",
  /** Glow radius multiplier for current beacon */
  glowMultiplier: 1.6,
  /** Font size for beacon number */
  numberFontSize: 9,
  /** Font size for beacon name */
  nameFontSize: 7,
  /** Pipe station indicator color */
  pipeIndicatorColor: "#22c55e",
  /** Canal quarter beacon accent color */
  canalAccentColor: "#3b82a0",
};

// ─── Beacon Rendering Helpers ───────────────────────────────────────────────

/**
 * Check if a beacon is in the canal quarter area.
 * Canal quarter beacons (harvest-6, harvest-7) get teal accent styling.
 */
export function isCanalBeacon(beaconId: string): boolean {
  return beaconId === "harvest-6" || beaconId === "harvest-7";
}

/**
 * Get the appropriate beacon color based on state and location.
 */
export function getBeaconColor(
  beaconId: string,
  currentBeaconId: string | null,
): string {
  if (beaconId === currentBeaconId) return BEACON_CONFIG.activeColor;
  if (isCanalBeacon(beaconId)) return BEACON_CONFIG.canalAccentColor;
  return BEACON_CONFIG.inactiveColor;
}

/**
 * Calculate pulse scale for animated beacons.
 * Current beacon pulses. Next beacon has a subtle pulse.
 */
export function getBeaconPulseScale(
  beaconId: string,
  currentBeaconId: string | null,
  time: number,
): number {
  if (beaconId === currentBeaconId) {
    return 1.0 + Math.sin(time * 0.004) * 0.15;
  }
  return 1.0;
}

export default BEACON_CONFIG;
