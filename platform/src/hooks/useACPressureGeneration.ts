import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-006 — AC Pressure Generation (Crown Jewel #11)
// Paired Golden Lotus chambers operating 180° out of phase create alternating
// push/pull pressure waves (AC wave). Frequency governed by Ouralis cycle. No external pumps.

export type ACPhase = 'push_A' | 'neutral' | 'push_B' | 'neutral_B';

export interface GoldenLotusState {
  id: 'A' | 'B';
  angle: number;       // 0–360 degrees
  pressure: number;    // -1.0 to 1.0 (negative = push, positive = pull)
  flowRate: number;    // 0–1
}

export interface ACPressureState {
  phase: ACPhase;
  cycleStep: number;         // 0–11 (tracks Ouralis cycle)
  waveFrequency: number;     // Hz equivalent (cycles per game turn)
  peakPressure: number;      // PSI at current step
  acAmplitude: number;       // 0–1, combined AC wave amplitude
  chamberA: GoldenLotusState;
  chamberB: GoldenLotusState;
  totalCycles: number;
  gameTurn: number;
  isRunning: boolean;
  tickMs: number;
}

export interface ACPressureControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setTickMs: (ms: number) => void;
}

function buildChamber(id: 'A' | 'B', offset: number): GoldenLotusState {
  return { id, angle: offset, pressure: 0, flowRate: 0 };
}

function derivePhase(step: number): ACPhase {
  if (step <= 2) return 'push_A';
  if (step <= 5) return 'neutral';
  if (step <= 8) return 'push_B';
  return 'neutral_B';
}

export function useACPressureGeneration(initialTickMs = 700): {
  state: ACPressureState;
  controls: ACPressureControls;
} {
  const [state, setState] = useState<ACPressureState>({
    phase: 'neutral',
    cycleStep: 0,
    waveFrequency: 1,
    peakPressure: 0,
    acAmplitude: 0,
    chamberA: buildChamber('A', 0),
    chamberB: buildChamber('B', 180),
    totalCycles: 0,
    gameTurn: 0,
    isRunning: false,
    tickMs: initialTickMs,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const nextStep = (prev.cycleStep + 1) % 12;
      const total = prev.totalCycles + 1;
      const gameTurn = Math.floor(total / 12);
      const phase = derivePhase(nextStep);

      // Chamber A leads; Chamber B is 180° offset
      const angleA = (prev.chamberA.angle + 30) % 360;
      const angleB = (prev.chamberB.angle + 30) % 360;

      const sinA = Math.sin((angleA * Math.PI) / 180);
      const sinB = Math.sin((angleB * Math.PI) / 180);

      // AC amplitude is combination — chambers push/pull alternately
      const acAmplitude = Math.abs(sinA - sinB) / 2;
      const peakPressure = parseFloat((acAmplitude * 2.17).toFixed(3)); // max 2.17 PSI

      return {
        ...prev,
        phase,
        cycleStep: nextStep,
        totalCycles: total,
        gameTurn,
        acAmplitude,
        peakPressure,
        waveFrequency: parseFloat((1 / (12 * (prev.tickMs / 1000))).toFixed(3)),
        chamberA: { ...prev.chamberA, angle: angleA, pressure: sinA, flowRate: Math.max(0, sinA) },
        chamberB: { ...prev.chamberB, angle: angleB, pressure: sinB, flowRate: Math.max(0, sinB) },
      };
    });
  }, []);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      phase: 'neutral',
      cycleStep: 0,
      totalCycles: 0,
      gameTurn: 0,
      acAmplitude: 0,
      peakPressure: 0,
      chamberA: buildChamber('A', 0),
      chamberB: buildChamber('B', 180),
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isRunning, state.tickMs, tick]);

  return { state, controls: { start, pause, reset, tick, setTickMs } };
}
