import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-010 — Cascading Hexagonal Containers (#16)
// Water cascades between nested hex containers at different elevations.
// Each container overflows into the next level when threshold reached.
// Gravity-driven cascade chain.

export type CascadeLevel = 0 | 1 | 2 | 3 | 4;

export interface HexContainer {
  level: CascadeLevel;
  elevationCm: number;
  capacityL: number;       // liters
  currentL: number;        // current fill
  overflowThreshold: number; // fraction 0–1
  isOverflowing: boolean;
  overflowRate: number;    // L per tick
}

export interface CascadeState {
  containers: HexContainer[];
  activeCascades: number;  // how many containers currently overflowing
  totalVolumeProcessed: number; // cumulative liters moved
  gameTurn: number;
  tickCount: number;
  isRunning: boolean;
  tickMs: number;
  fillRate: number;        // liters per tick added to top container
}

export interface CascadeControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setFillRate: (rate: number) => void;
  setTickMs: (ms: number) => void;
}

function buildContainers(): HexContainer[] {
  return [
    { level: 0, elevationCm: 100, capacityL: 2.0,  currentL: 0, overflowThreshold: 0.9, isOverflowing: false, overflowRate: 0 },
    { level: 1, elevationCm: 75,  capacityL: 3.5,  currentL: 0, overflowThreshold: 0.9, isOverflowing: false, overflowRate: 0 },
    { level: 2, elevationCm: 50,  capacityL: 5.0,  currentL: 0, overflowThreshold: 0.9, isOverflowing: false, overflowRate: 0 },
    { level: 3, elevationCm: 25,  capacityL: 7.0,  currentL: 0, overflowThreshold: 0.9, isOverflowing: false, overflowRate: 0 },
    { level: 4, elevationCm: 0,   capacityL: 10.0, currentL: 0, overflowThreshold: 1.0, isOverflowing: false, overflowRate: 0 },
  ];
}

export function useCascadingHexagonalContainers(initialTickMs = 600): {
  state: CascadeState;
  controls: CascadeControls;
} {
  const [state, setState] = useState<CascadeState>({
    containers: buildContainers(),
    activeCascades: 0,
    totalVolumeProcessed: 0,
    gameTurn: 0,
    tickCount: 0,
    isRunning: false,
    tickMs: initialTickMs,
    fillRate: 0.3, // L per tick
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const containers = prev.containers.map(c => ({ ...c }));
      let totalProcessed = prev.totalVolumeProcessed;

      // Add water to top container
      containers[0].currentL = Math.min(containers[0].currentL + prev.fillRate, containers[0].capacityL);

      // Cascade downward
      for (let i = 0; i < containers.length - 1; i++) {
        const c = containers[i];
        const fillFraction = c.currentL / c.capacityL;
        if (fillFraction >= c.overflowThreshold) {
          const overflow = c.currentL - c.capacityL * c.overflowThreshold;
          const rate = Math.min(overflow, 0.5); // max 0.5L overflow per tick
          c.currentL -= rate;
          containers[i + 1].currentL = Math.min(containers[i + 1].currentL + rate, containers[i + 1].capacityL);
          c.isOverflowing = true;
          c.overflowRate = rate;
          totalProcessed += rate;
        } else {
          c.isOverflowing = false;
          c.overflowRate = 0;
        }
      }

      const activeCascades = containers.filter(c => c.isOverflowing).length;
      const tickCount = prev.tickCount + 1;
      const gameTurn = Math.floor(tickCount / 12);

      return { ...prev, containers, activeCascades, totalVolumeProcessed: parseFloat(totalProcessed.toFixed(2)), tickCount, gameTurn };
    });
  }, []);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      containers: buildContainers(),
      activeCascades: 0,
      totalVolumeProcessed: 0,
      gameTurn: 0,
      tickCount: 0,
      isRunning: false,
    }));
  }, []);

  const setFillRate = useCallback((rate: number) => {
    setState(prev => ({ ...prev, fillRate: rate }));
  }, []);

  const setTickMs = useCallback((ms: number) => {
    setState(prev => ({ ...prev, tickMs: ms }));
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, state.tickMs);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isRunning, state.tickMs, tick]);

  return { state, controls: { start, pause, reset, tick, setFillRate, setTickMs } };
}
