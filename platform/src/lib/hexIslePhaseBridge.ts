/**
 * HEXISLE PHASE BRIDGE
 * ====================
 * Connects HexIsle's 3D world to the Phase MimicTrunk system.
 *
 * In HexIsle, Phase MimicTrunks manifest as:
 *   - Guild Towers that glow when a Phase is active
 *   - Keep buildings that can BE Phases (personal server instances)
 *   - The First Guild Tower in Verdana as the portal to Phase management
 *   - Golden Key planes discovered in-game can become new Phases
 *
 * The Founder's principle: "Your ship, Captain — your rules."
 * Each Phase operates under LB rules but is YOUR instance.
 *
 * Innovation #1511: HexIsle Phase MimicTrunk Bridge
 */

import {
  type PhaseMimicTrunk,
  type PhaseConnectionStatus,
  type PhaseOwnerType,
  type SpecialDeckCardLink,
  canConnect,
  hasValidAccess,
  getTrunkSummary,
} from '@/lib/discourse/phaseMimicTrunks';
import { type CityBuilding, type HexCell, hexToWorld } from '@/lib/hexIsleWorldData';

// ─── Phase Portal Types ──────────────────────────────────────────────────────

/** A point in HexIsle that connects to a Phase MimicTrunk */
export interface PhasePortal {
  id: string;
  name: string;
  /** Hex position in the island grid */
  hexPosition: { q: number; r: number };
  /** Which island this portal is on */
  islandId: number;
  /** The linked Phase MimicTrunk ID (null = unlinked / available) */
  linkedTrunkId: string | null;
  /** The building this portal is attached to (e.g., Guild Tower, Keep) */
  buildingName: string;
  buildingType: 'guild_tower' | 'keep' | 'hexagon';
  /** Visual state */
  glowColor: string;
  isActive: boolean;
  /** Access level required */
  requiredLevel: number;
}

/** A Keep that has been converted into a Phase */
export interface PhaseKeep {
  keepId: string;
  keepName: string;
  trunkId: string;
  ownerName: string;
  ownerType: PhaseOwnerType;
  connectionStatus: PhaseConnectionStatus;
  /** Monthly cost in Credits */
  monthlyCost: number;
  /** Special Deck Card required for entry */
  deckCardId: string;
  /** How many members can access simultaneously */
  maxConcurrent: number;
  /** Keep's hex footprint */
  hexPositions: Array<{ q: number; r: number }>;
  islandId: number;
}

/** Phase overlay data for the 3D world */
export interface PhaseOverlay {
  /** Active phase portals visible in the world */
  portals: PhasePortal[];
  /** Keeps that are Phase instances */
  phaseKeeps: PhaseKeep[];
  /** Whether the player is currently inside a Phase */
  isInPhase: boolean;
  /** Current phase info (if inside one) */
  currentPhase: PhaseMimicTrunk | null;
}

// ─── Portal Definitions ──────────────────────────────────────────────────────

/**
 * Default Phase portals in Verdana — The Port City.
 * These are static portal locations that can be linked to Phases.
 */
export const VERDANA_PHASE_PORTALS: PhasePortal[] = [
  {
    id: 'portal-first-guild',
    name: 'First Guild Portal',
    hexPosition: { q: 1, r: 0 },
    islandId: 1,
    linkedTrunkId: null,
    buildingName: 'First Guild Tower',
    buildingType: 'guild_tower',
    glowColor: '#b8860b',
    isActive: false,
    requiredLevel: 0,
  },
  {
    id: 'portal-hexagon',
    name: 'The Hexagon Portal',
    hexPosition: { q: 2, r: 2 },
    islandId: 1,
    linkedTrunkId: null,
    buildingName: 'The Hexagon',
    buildingType: 'hexagon',
    glowColor: '#d4a855',
    isActive: false,
    requiredLevel: 5,
  },
  {
    id: 'portal-example-keep',
    name: 'Example Keep Portal',
    hexPosition: { q: -1, r: -1 },
    islandId: 1,
    linkedTrunkId: null,
    buildingName: 'Example Keep',
    buildingType: 'keep',
    glowColor: '#7a6d5e',
    isActive: false,
    requiredLevel: 0,
  },
];

// ─── Phase Status Colors ─────────────────────────────────────────────────────

export const PHASE_STATUS_COLORS: Record<PhaseConnectionStatus, string> = {
  active: '#10b981',            // Green glow
  suspended: '#f59e0b',         // Amber warning
  validation_failed: '#ef4444', // Red danger
  initializing: '#3b82f6',      // Blue pulse
  offline: '#6b7280',           // Gray dim
};

export const PHASE_STATUS_LABELS: Record<PhaseConnectionStatus, string> = {
  active: 'Active — DNA Chain Validated',
  suspended: 'Suspended — Validation Pending',
  validation_failed: 'Disconnected — Integrity Check Failed',
  initializing: 'Initializing — First Validation',
  offline: 'Offline — Local Only',
};

// ─── Bridge Functions ────────────────────────────────────────────────────────

/**
 * Get the 3D world position of a Phase portal.
 */
export function getPortalWorldPosition(
  portal: PhasePortal,
  islandWorldPosition: { x: number; z: number }
): { x: number; y: number; z: number } {
  const local = hexToWorld(portal.hexPosition.q, portal.hexPosition.r);
  return {
    x: islandWorldPosition.x + local.x,
    y: 3, // Floating above building
    z: islandWorldPosition.z + local.z,
  };
}

/**
 * Link a Phase MimicTrunk to a portal in the world.
 */
export function linkTrunkToPortal(
  portals: PhasePortal[],
  portalId: string,
  trunkId: string,
  glowColor?: string,
): PhasePortal[] {
  return portals.map(p => {
    if (p.id !== portalId) return p;
    return {
      ...p,
      linkedTrunkId: trunkId,
      isActive: true,
      glowColor: glowColor || p.glowColor,
    };
  });
}

/**
 * Unlink a Phase from a portal.
 */
export function unlinkTrunkFromPortal(
  portals: PhasePortal[],
  portalId: string,
): PhasePortal[] {
  return portals.map(p => {
    if (p.id !== portalId) return p;
    return {
      ...p,
      linkedTrunkId: null,
      isActive: false,
    };
  });
}

/**
 * Get all active portals (those linked to a running Phase).
 */
export function getActivePortals(portals: PhasePortal[]): PhasePortal[] {
  return portals.filter(p => p.isActive && p.linkedTrunkId);
}

/**
 * Check if a player can enter a Phase portal.
 */
export function canEnterPortal(
  portal: PhasePortal,
  playerLevel: number,
  trunk: PhaseMimicTrunk | null,
  deckCardLinks: SpecialDeckCardLink[],
  memberId: string,
): {
  allowed: boolean;
  reason?: string;
} {
  // Level gate
  if (playerLevel < portal.requiredLevel) {
    return {
      allowed: false,
      reason: `Requires level ${portal.requiredLevel} (you are level ${playerLevel})`,
    };
  }

  // No trunk linked
  if (!portal.linkedTrunkId || !trunk) {
    return {
      allowed: false,
      reason: 'No Phase is linked to this portal. Create or link one first.',
    };
  }

  // Check trunk connection status
  const connectionCheck = canConnect(trunk);
  if (!connectionCheck.allowed) {
    return connectionCheck;
  }

  // Check access (owner or valid deck card)
  const isOwner = trunk.ownerId === memberId;
  const hasDeckCard = hasValidAccess(deckCardLinks, memberId, trunk.id);

  if (!isOwner && !hasDeckCard) {
    return {
      allowed: false,
      reason: 'You need a Special Deck Card to enter this Phase.',
    };
  }

  return { allowed: true };
}

/**
 * Convert a Keep building into a Phase Keep.
 */
export function convertKeepToPhase(
  keepBuilding: CityBuilding,
  trunk: PhaseMimicTrunk,
  islandId: number,
): PhaseKeep {
  return {
    keepId: `keep-${keepBuilding.labelQ}-${keepBuilding.labelR}`,
    keepName: keepBuilding.name,
    trunkId: trunk.id,
    ownerName: trunk.name,
    ownerType: trunk.ownerType,
    connectionStatus: trunk.connectionStatus,
    monthlyCost: trunk.monthlyFee,
    deckCardId: trunk.specialDeckCardId,
    maxConcurrent: trunk.ownerType === 'guild' ? 50 : trunk.ownerType === 'tribe' ? 25 : 5,
    hexPositions: keepBuilding.cells.map(c => ({ q: c.q, r: c.r })),
    islandId,
  };
}

/**
 * Get the Phase overlay for the 3D world.
 * This aggregates all Phase-related visual data for the renderer.
 */
export function getPhaseOverlay(
  ownedTrunks: PhaseMimicTrunk[],
  portals: PhasePortal[],
  currentPhase: PhaseMimicTrunk | null,
  keepBuildings: CityBuilding[],
  islandId: number,
): PhaseOverlay {
  // Update portal active states based on owned trunks
  const updatedPortals = portals.map(portal => {
    if (!portal.linkedTrunkId) return portal;
    const trunk = ownedTrunks.find(t => t.id === portal.linkedTrunkId);
    if (!trunk) return { ...portal, isActive: false };
    return {
      ...portal,
      isActive: trunk.connectionStatus === 'active',
      glowColor: PHASE_STATUS_COLORS[trunk.connectionStatus],
    };
  });

  // Convert keeps that are linked to Phases
  const phaseKeeps: PhaseKeep[] = [];
  for (const building of keepBuildings) {
    if (building.type !== 'keep') continue;
    // Check if any owned trunk is linked to this keep
    const linkedTrunk = ownedTrunks.find(t =>
      t.goldenKeyPlaneId === `keep-${building.labelQ}-${building.labelR}`
    );
    if (linkedTrunk) {
      phaseKeeps.push(convertKeepToPhase(building, linkedTrunk, islandId));
    }
  }

  return {
    portals: updatedPortals,
    phaseKeeps,
    isInPhase: currentPhase !== null,
    currentPhase,
  };
}

/**
 * Get a description of what Phase MimicTrunks mean in HexIsle terms.
 * Used for tooltips and UI.
 */
export function getPhaseDescription(ownerType: PhaseOwnerType): string {
  switch (ownerType) {
    case 'member':
      return 'Your personal server instance. Your ship, Captain — your rules. All LB rules apply, but the space is yours.';
    case 'guild':
      return 'A Guild Phase — shared by all guild members. The Guild Steward manages access and governance.';
    case 'tribe':
      return 'A Tribe Phase — a community space within a Guild. Tribe leaders govern under Guild oversight.';
    default:
      return 'A Phase MimicTrunk — a self-contained instance of the LB world.';
  }
}

/**
 * Get the visual glow intensity for a Phase portal based on its status.
 * Returns 0-1 intensity for 3D shaders.
 */
export function getPortalGlowIntensity(portal: PhasePortal): number {
  if (!portal.isActive) return 0.1;
  if (!portal.linkedTrunkId) return 0.2;
  return 0.8; // Full glow for active, linked portals
}

/**
 * Get the portal pulse speed (seconds per cycle) for animation.
 * Active = slow breathe, initializing = fast pulse, failed = no pulse.
 */
export function getPortalPulseSpeed(status: PhaseConnectionStatus): number {
  switch (status) {
    case 'active': return 3.0;        // Slow, calm breathe
    case 'initializing': return 0.8;  // Fast pulse
    case 'suspended': return 1.5;     // Medium
    case 'validation_failed': return 0; // No pulse
    case 'offline': return 0;         // No pulse
    default: return 2.0;
  }
}
