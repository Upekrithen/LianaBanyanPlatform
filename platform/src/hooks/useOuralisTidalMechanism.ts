import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-002 — Ouralis Tidal Mechanism
// 12-rotation tide cycle = one game turn. Golden Lotus rotor drives the clock.

export type TidePhase = 'ebb' | 'flow' | 'peak' | 'slack';

export interface RotorChamber {
  index: number;       // 0–11
  angle: number;       // degrees, 0–330
  filled: boolean;
  flowRate: number;    // 0–1
}

export interface TidalState {
  rotation: number;          // 0–11 (current chamber index)
  totalRotations: number;    // total rotations this game
  gameTurn: number;          // increments every 12 rotations
  phase: TidePhase;
  chambers: RotorChamber[];
  lotusAngle: number;        // Golden Lotus visual angle (degrees)
  isRunning: boolean;
  tickMs: number;            // milliseconds per rotation step
}

export interface TidalControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setTickMs: (ms: number) => void;
}

function buildChambers(): RotorChamber[] {
  return Array.from({ length: 12 }, (_, i) => ({
    index: i,
    angle: i * 30,
    filled: false,
    flowRate: 0,
  }));
}

function derivePhase(rotation: number): TidePhase {
  if (rotation <= 2) return 'flow';
  if (rotation <= 5) return 'peak';
  if (rotation <= 8) return 'ebb';
  return 'slack';
}

export function useOuralisTidalMechanism(initialTickMs = 800): {
  state: TidalState;
  controls: TidalControls;
} {
  const [state, setState] = useState<TidalState>({
    rotation: 0,
    totalRotations: 0,
    gameTurn: 0,
    phase: 'slack',
    chambers: buildChambers(),
    lotusAngle: 0,
    isRunning: false,
    tickMs: initialTickMs,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const nextRotation = (prev.rotation + 1) % 12;
      const nextTotal = prev.totalRotations + 1;
      const nextTurn = Math.floor(nextTotal / 12);
      const phase = derivePhase(nextRotation);
      const lotusAngle = (prev.lotusAngle + 30) % 360;

      const chambers = prev.chambers.map(ch => {
        const distFromCurrent = Math.abs(ch.index - nextRotation);
        const dist = Math.min(distFromCurrent, 12 - distFromCurrent);
        const flowRate = Math.max(0, 1 - dist * 0.35);
        return { ...ch, filled: ch.index <= nextRotation, flowRate };
      });

      return { ...prev, rotation: nextRotation, totalRotations: nextTotal, gameTurn: nextTurn, phase, chambers, lotusAngle };
    });
  }, []);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      rotation: 0,
      totalRotations: 0,
      gameTurn: 0,
      phase: 'slack',
      chambers: buildChambers(),
      lotusAngle: 0,
      isRunning: false,
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.tickMs, tick]);

  return { state, controls: { start, pause, reset, tick, setTickMs } };
}
