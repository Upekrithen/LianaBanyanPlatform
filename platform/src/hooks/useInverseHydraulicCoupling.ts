import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-001 — Inverse Hydraulic Coupling (#2)
// When piston A moves, piston B moves opposite direction.
// Daisy chain linkage enables bidirectional pressure propagation
// through Hexel water channel network.

export type PistonDirection = 'up' | 'down' | 'neutral';

export interface Piston {
  id: string;
  label: string;
  positionMm: number;     // -20 to +20mm from center
  direction: PistonDirection;
  pressureBar: number;    // 0–1.5 bar
  velocityMmPerS: number; // mm per second
  isActive: boolean;
}

export interface CouplingLink {
  fromId: string;
  toId: string;
  transmissionRatio: number; // typically -1.0 for inverse
  linkPressureBar: number;
}

export interface InverseHydraulicState {
  pistons: Piston[];
  links: CouplingLink[];
  daisyChainDepth: number;   // how many pistons in chain
  propagationCycleMs: number; // time for pressure to propagate chain
  totalPressureWork: number;  // cumulative bar·mm
  cycleCount: number;
  gameTurn: number;
  isRunning: boolean;
  tickMs: number;
  activePistonId: string;    // which piston is driven this step
}

export interface InverseHydraulicControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  pushPiston: (id: string) => void;
  setTickMs: (ms: number) => void;
}

function buildPistons(count = 5): Piston[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `P${i + 1}`,
    label: String.fromCharCode(65 + i), // A, B, C, D, E
    positionMm: 0,
    direction: 'neutral',
    pressureBar: 0,
    velocityMmPerS: 0,
    isActive: false,
  }));
}

function buildLinks(pistons: Piston[]): CouplingLink[] {
  return pistons.slice(0, -1).map((p, i) => ({
    fromId: p.id,
    toId: pistons[i + 1].id,
    transmissionRatio: -1.0, // inverse coupling
    linkPressureBar: 0,
  }));
}

export function useInverseHydraulicCoupling(initialTickMs = 500): {
  state: InverseHydraulicState;
  controls: InverseHydraulicControls;
} {
  const pistonBase = buildPistons(5);

  const [state, setState] = useState<InverseHydraulicState>({
    pistons: pistonBase,
    links: buildLinks(pistonBase),
    daisyChainDepth: 5,
    propagationCycleMs: 2500,
    totalPressureWork: 0,
    cycleCount: 0,
    gameTurn: 0,
    isRunning: false,
    tickMs: initialTickMs,
    activePistonId: 'P1',
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      // Advance which piston is driven (oscillate P1 up/down)
      const cycleCount = prev.cycleCount + 1;
      const gameTurn = Math.floor(cycleCount / 12);
      const driveUp = cycleCount % 2 === 0;
      const driveAmp = 18; // mm

      const pistons = prev.pistons.map((p, i) => {
        // Each piston is inverse of the one before it in chain
        const sign = driveUp ? (i % 2 === 0 ? 1 : -1) : (i % 2 === 0 ? -1 : 1);
        const decay = Math.pow(0.85, i); // pressure decays along chain
        const pos = parseFloat((driveAmp * sign * decay).toFixed(2));
        const direction: PistonDirection = pos > 0.5 ? 'up' : pos < -0.5 ? 'down' : 'neutral';
        const pressureBar = parseFloat((Math.abs(pos) / driveAmp * 1.3 * decay).toFixed(3));
        return { ...p, positionMm: pos, direction, pressureBar, velocityMmPerS: Math.abs(pos) * 2, isActive: true };
      });

      const links = prev.links.map((l, i) => ({
        ...l,
        linkPressureBar: parseFloat(((pistons[i].pressureBar + pistons[i + 1].pressureBar) / 2).toFixed(3)),
      }));

      const totalPressureWork = parseFloat(
        (prev.totalPressureWork + pistons.reduce((sum, p) => sum + Math.abs(p.positionMm) * p.pressureBar, 0) / 100).toFixed(3)
      );

      return { ...prev, pistons, links, cycleCount, gameTurn, totalPressureWork };
    });
  }, []);

  const pushPiston = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      activePistonId: id,
    }));
    tick();
  }, [tick]);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const pistonBase = buildPistons(5);
    setState(prev => ({
      ...prev,
      pistons: pistonBase,
      links: buildLinks(pistonBase),
      totalPressureWork: 0,
      cycleCount: 0,
      gameTurn: 0,
      isRunning: false,
      activePistonId: 'P1',
    }));
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

  return { state, controls: { start, pause, reset, tick, pushPiston, setTickMs } };
}
