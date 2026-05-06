import { useState, useCallback } from 'react';

// STUB-002 — Compliant Mechanism Terrain Caps (#8)
// Flexible snap-on terrain covers for HexIsle tiles.
// Compliant mechanism allows caps to flex over irregular terrain while snapping securely.
// Multiple terrain types: water, land, forest, mountain.

export type TerrainType = 'water' | 'land' | 'forest' | 'mountain' | 'desert' | 'swamp';
export type SnapState = 'unsnapped' | 'flexing' | 'snapped' | 'locked';

export interface TerrainCap {
  id: string;
  terrain: TerrainType;
  snapState: SnapState;
  flexAngleDeg: number;      // current flex deflection 0–15°
  snapStrengthN: number;     // snap force in Newtons (0–12)
  irregularityMm: number;    // terrain height variation (0–3mm)
  isCompatible: boolean;     // passes tolerance check
  lockEngaged: boolean;
}

export interface TerrainCapsState {
  caps: TerrainCap[];
  selectedCapId: string | null;
  activeTerrain: TerrainType;
  snapSuccessCount: number;
  snapFailCount: number;
  flexCycleCount: number;
  totalHexelsEquipped: number;
}

export interface TerrainCapsControls {
  selectCap: (id: string) => void;
  snapCap: (id: string) => void;
  unsnap: (id: string) => void;
  cycleTerrain: () => void;
  addCap: (terrain: TerrainType) => void;
  lockAll: () => void;
  reset: () => void;
}

const TERRAIN_CYCLE: TerrainType[] = ['water', 'land', 'forest', 'mountain', 'desert', 'swamp'];

const TERRAIN_PROPERTIES: Record<TerrainType, { irregularity: number; snapStrength: number }> = {
  water:    { irregularity: 0.2, snapStrength: 8 },
  land:     { irregularity: 0.8, snapStrength: 10 },
  forest:   { irregularity: 1.5, snapStrength: 9 },
  mountain: { irregularity: 2.8, snapStrength: 12 },
  desert:   { irregularity: 1.2, snapStrength: 9 },
  swamp:    { irregularity: 2.2, snapStrength: 7 },
};

let capIdCounter = 0;

function createCap(terrain: TerrainType): TerrainCap {
  const props = TERRAIN_PROPERTIES[terrain];
  return {
    id: `cap-${++capIdCounter}`,
    terrain,
    snapState: 'unsnapped',
    flexAngleDeg: 0,
    snapStrengthN: props.snapStrength,
    irregularityMm: parseFloat((props.irregularity + Math.random() * 0.3).toFixed(2)),
    isCompatible: props.irregularity < 3.0,
    lockEngaged: false,
  };
}

function buildInitialCaps(): TerrainCap[] {
  return ['water', 'land', 'forest', 'mountain'].map(t => createCap(t as TerrainType));
}

export function useCompliantMechanismTerrainCaps(): {
  state: TerrainCapsState;
  controls: TerrainCapsControls;
} {
  const [state, setState] = useState<TerrainCapsState>({
    caps: buildInitialCaps(),
    selectedCapId: null,
    activeTerrain: 'land',
    snapSuccessCount: 0,
    snapFailCount: 0,
    flexCycleCount: 0,
    totalHexelsEquipped: 0,
  });

  const selectCap = useCallback((id: string) => {
    setState(prev => ({ ...prev, selectedCapId: id }));
  }, []);

  const snapCap = useCallback((id: string) => {
    setState(prev => {
      const caps = prev.caps.map(c => {
        if (c.id !== id) return c;
        if (c.snapState !== 'unsnapped') return c;
        // Simulate flex then snap
        const canSnap = c.isCompatible && c.irregularityMm < 3.0;
        return {
          ...c,
          snapState: canSnap ? 'snapped' : 'flexing',
          flexAngleDeg: canSnap ? 2 : 12,
          lockEngaged: false,
        };
      });
      const cap = caps.find(c => c.id === id);
      const success = cap?.snapState === 'snapped';
      return {
        ...prev,
        caps,
        snapSuccessCount: success ? prev.snapSuccessCount + 1 : prev.snapSuccessCount,
        snapFailCount: !success ? prev.snapFailCount + 1 : prev.snapFailCount,
        flexCycleCount: prev.flexCycleCount + 1,
        totalHexelsEquipped: success ? prev.totalHexelsEquipped + 1 : prev.totalHexelsEquipped,
      };
    });
  }, []);

  const unsnap = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      caps: prev.caps.map(c => c.id === id
        ? { ...c, snapState: 'unsnapped', flexAngleDeg: 0, lockEngaged: false }
        : c
      ),
    }));
  }, []);

  const cycleTerrain = useCallback(() => {
    setState(prev => {
      const idx = TERRAIN_CYCLE.indexOf(prev.activeTerrain);
      const next = TERRAIN_CYCLE[(idx + 1) % TERRAIN_CYCLE.length];
      return { ...prev, activeTerrain: next };
    });
  }, []);

  const addCap = useCallback((terrain: TerrainType) => {
    setState(prev => ({ ...prev, caps: [...prev.caps, createCap(terrain)] }));
  }, []);

  const lockAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      caps: prev.caps.map(c => c.snapState === 'snapped' ? { ...c, snapState: 'locked', lockEngaged: true } : c),
    }));
  }, []);

  const reset = useCallback(() => {
    capIdCounter = 0;
    setState({
      caps: buildInitialCaps(),
      selectedCapId: null,
      activeTerrain: 'land',
      snapSuccessCount: 0,
      snapFailCount: 0,
      flexCycleCount: 0,
      totalHexelsEquipped: 0,
    });
  }, []);

  return { state, controls: { selectCap, snapCap, unsnap, cycleTerrain, addCap, lockAll, reset } };
}
