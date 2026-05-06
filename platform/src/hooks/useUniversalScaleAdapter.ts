import { useState, useCallback } from 'react';

// MISS-004 — Universal Scale Adapter (#9)
// 25mm/28mm/32mm compatibility via adapter rings.
// Three concentric adapter rings snap onto Hexel tile base,
// each step adding 1.5mm height.
// Visual snap indicator shows which scale is active.

export type ScaleMode = '25mm' | '28mm' | '32mm';
export type RingState = 'retracted' | 'extending' | 'snapped' | 'locked';

export interface AdapterRing {
  id: number;
  heightAddMm: number;    // 0, 1.5, 3.0
  snapState: RingState;
  isRequired: boolean;    // required for current scale
  snapForceN: number;     // Newtons to engage
  color: string;
}

export interface ScaleAdapterState {
  targetScale: ScaleMode;
  activeScale: ScaleMode;
  rings: AdapterRing[];
  totalHeightMm: number;    // base 25mm + ring additions
  compatibilityScore: number; // 0–100%
  snapComplete: boolean;
  miniatureCount: number;   // how many minis fit current scale
  ringChangeCount: number;
}

export interface ScaleAdapterControls {
  setScale: (scale: ScaleMode) => void;
  snapRings: () => void;
  resetRings: () => void;
  addMiniature: () => void;
}

const SCALE_CONFIG: Record<ScaleMode, { ringsRequired: number; miniatureCount: number }> = {
  '25mm': { ringsRequired: 0, miniatureCount: 6 },
  '28mm': { ringsRequired: 1, miniatureCount: 5 },
  '32mm': { ringsRequired: 2, miniatureCount: 4 },
};

const RING_COLORS = ['#f59e0b', '#22d3ee', '#a78bfa'];

function buildRings(): AdapterRing[] {
  return [
    { id: 1, heightAddMm: 1.5, snapState: 'retracted', isRequired: false, snapForceN: 8.5, color: RING_COLORS[0] },
    { id: 2, heightAddMm: 1.5, snapState: 'retracted', isRequired: false, snapForceN: 9.2, color: RING_COLORS[1] },
    { id: 3, heightAddMm: 1.5, snapState: 'retracted', isRequired: false, snapForceN: 10.0, color: RING_COLORS[2] },
  ];
}

export function useUniversalScaleAdapter(): {
  state: ScaleAdapterState;
  controls: ScaleAdapterControls;
} {
  const [state, setState] = useState<ScaleAdapterState>({
    targetScale: '25mm',
    activeScale: '25mm',
    rings: buildRings(),
    totalHeightMm: 25,
    compatibilityScore: 100,
    snapComplete: true,
    miniatureCount: 6,
    ringChangeCount: 0,
  });

  const setScale = useCallback((scale: ScaleMode) => {
    setState(prev => {
      const config = SCALE_CONFIG[scale];
      const rings = buildRings().map((r, i) => ({
        ...r,
        isRequired: i < config.ringsRequired,
        snapState: ('retracted' as RingState),
      }));
      return { ...prev, targetScale: scale, rings, snapComplete: false, miniatureCount: config.miniatureCount };
    });
  }, []);

  const snapRings = useCallback(() => {
    setState(prev => {
      const config = SCALE_CONFIG[prev.targetScale];
      const rings = prev.rings.map((r, i) => ({
        ...r,
        snapState: (i < config.ringsRequired ? 'snapped' : 'retracted') as RingState,
      }));
      const totalHeightMm = 25 + config.ringsRequired * 1.5;
      const compatibilityScore = Math.round(92 + config.ringsRequired * 3);
      return {
        ...prev,
        rings,
        activeScale: prev.targetScale,
        totalHeightMm,
        compatibilityScore,
        snapComplete: true,
        ringChangeCount: prev.ringChangeCount + 1,
      };
    });
  }, []);

  const resetRings = useCallback(() => {
    setState(prev => ({
      ...prev,
      targetScale: '25mm',
      activeScale: '25mm',
      rings: buildRings(),
      totalHeightMm: 25,
      compatibilityScore: 100,
      snapComplete: true,
      miniatureCount: 6,
    }));
  }, []);

  const addMiniature = useCallback(() => {
    setState(prev => ({
      ...prev,
      miniatureCount: Math.min(prev.miniatureCount + 1, 8),
    }));
  }, []);

  return { state, controls: { setScale, snapRings, resetRings, addMiniature } };
}
