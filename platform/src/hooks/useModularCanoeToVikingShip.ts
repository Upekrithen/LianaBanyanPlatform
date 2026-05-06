import { useState, useCallback, useRef, useEffect } from 'react';

// STUB-004 — Modular Canoe-to-Viking Ship Transform (#19)
// Ships grow by snapping additional hull segments each tide cycle.
// Start as canoe (1 segment), grow to Viking longship (5 segments) over 4 tide turns.
// Each segment adds speed and cargo capacity.

export type ShipStage = 'canoe' | 'rowboat' | 'knarr' | 'longship' | 'drakkar';

export interface HullSegment {
  id: number;
  name: string;
  addedOnTurn: number;
  speedBonus: number;       // knots added
  cargoCapacityKg: number;  // kg cargo added
  isSnapped: boolean;
  snapProgress: number;     // 0–1 during snap animation
}

export interface ShipState {
  stage: ShipStage;
  segments: HullSegment[];
  segmentCount: number;
  totalSpeed: number;         // knots
  totalCargoKg: number;       // total cargo capacity
  tideTurn: number;
  tickCount: number;
  isRunning: boolean;
  tickMs: number;
  snapAnimating: boolean;
  maxSegments: number;
}

export interface ShipControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  addSegment: () => void;
  setTickMs: (ms: number) => void;
}

const SHIP_STAGES: ShipStage[] = ['canoe', 'rowboat', 'knarr', 'longship', 'drakkar'];

const SEGMENT_DEFINITIONS: Omit<HullSegment, 'addedOnTurn' | 'isSnapped' | 'snapProgress'>[] = [
  { id: 1, name: 'Bow Section',    speedBonus: 2, cargoCapacityKg: 50 },
  { id: 2, name: 'Mid Hull A',     speedBonus: 1, cargoCapacityKg: 120 },
  { id: 3, name: 'Mid Hull B',     speedBonus: 1, cargoCapacityKg: 120 },
  { id: 4, name: 'Stern Section',  speedBonus: 2, cargoCapacityKg: 80 },
  { id: 5, name: 'Dragon Prow',    speedBonus: 3, cargoCapacityKg: 30 },
];

function buildInitialSegments(): HullSegment[] {
  return [{ ...SEGMENT_DEFINITIONS[0], addedOnTurn: 0, isSnapped: true, snapProgress: 1 }];
}

function computeShipStage(count: number): ShipStage {
  return SHIP_STAGES[Math.min(count - 1, SHIP_STAGES.length - 1)];
}

export function useModularCanoeToVikingShip(initialTickMs = 1000): {
  state: ShipState;
  controls: ShipControls;
} {
  const [state, setState] = useState<ShipState>({
    stage: 'canoe',
    segments: buildInitialSegments(),
    segmentCount: 1,
    totalSpeed: 2,
    totalCargoKg: 50,
    tideTurn: 0,
    tickCount: 0,
    isRunning: false,
    tickMs: initialTickMs,
    snapAnimating: false,
    maxSegments: 5,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const tickCount = prev.tickCount + 1;
      // Every 12 ticks = 1 tide turn
      const tideTurn = Math.floor(tickCount / 12);
      // Auto-add segment at each new tide turn if not at max
      if (tideTurn > prev.tideTurn && prev.segmentCount < prev.maxSegments) {
        const nextSegDef = SEGMENT_DEFINITIONS[prev.segmentCount];
        const newSeg: HullSegment = { ...nextSegDef, addedOnTurn: tideTurn, isSnapped: true, snapProgress: 1 };
        const segments = [...prev.segments, newSeg];
        const segmentCount = segments.length;
        const totalSpeed = segments.reduce((s, seg) => s + seg.speedBonus, 0);
        const totalCargoKg = segments.reduce((s, seg) => s + seg.cargoCapacityKg, 0);
        return { ...prev, segments, segmentCount, stage: computeShipStage(segmentCount), totalSpeed, totalCargoKg, tideTurn, tickCount, snapAnimating: true };
      }
      return { ...prev, tideTurn, tickCount, snapAnimating: false };
    });
  }, []);

  const addSegment = useCallback(() => {
    setState(prev => {
      if (prev.segmentCount >= prev.maxSegments) return prev;
      const nextSegDef = SEGMENT_DEFINITIONS[prev.segmentCount];
      const newSeg: HullSegment = { ...nextSegDef, addedOnTurn: prev.tideTurn, isSnapped: true, snapProgress: 1 };
      const segments = [...prev.segments, newSeg];
      const segmentCount = segments.length;
      const totalSpeed = segments.reduce((s, seg) => s + seg.speedBonus, 0);
      const totalCargoKg = segments.reduce((s, seg) => s + seg.cargoCapacityKg, 0);
      return { ...prev, segments, segmentCount, stage: computeShipStage(segmentCount), totalSpeed, totalCargoKg, snapAnimating: true };
    });
  }, []);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      stage: 'canoe',
      segments: buildInitialSegments(),
      segmentCount: 1,
      totalSpeed: 2,
      totalCargoKg: 50,
      tideTurn: 0,
      tickCount: 0,
      isRunning: false,
      snapAnimating: false,
    }));
  }, []);

  const setTickMs = useCallback((ms: number) => setState(prev => ({ ...prev, tickMs: ms })), []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, state.tickMs);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isRunning, state.tickMs, tick]);

  return { state, controls: { start, pause, reset, tick, addSegment, setTickMs } };
}
