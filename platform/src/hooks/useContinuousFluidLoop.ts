import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-011 — Continuous Fluid Loop (#17)
// Water recirculates without external pumps.
// Uses height differential + Sawtooth60 directional flow + Golden Lotus timing
// to create a perpetual loop. Flow rate tracks with game turn.

export type LoopSegment = 'reservoir' | 'descent' | 'sawtooth' | 'golden_lotus' | 'ascent';

export interface FluidSegmentState {
  segment: LoopSegment;
  label: string;
  flowRateL: number;      // liters per minute
  pressureBar: number;
  waterLevel: number;     // 0–1 fill fraction
  isBottleneck: boolean;
}

export interface ContinuousFluidLoopState {
  segments: FluidSegmentState[];
  loopFlowRate: number;         // overall loop L/min
  heightDifferentialCm: number; // driving head
  lotusPhaseAngle: number;      // Golden Lotus angle (0–360)
  sawtoothPosition: number;     // 0–60 tooth position
  totalLoopCompletions: number;
  gameTurn: number;
  tickCount: number;
  isRunning: boolean;
  tickMs: number;
  efficiency: number;           // 0–1, loop efficiency
}

export interface FluidLoopControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  setTickMs: (ms: number) => void;
}

function buildSegments(): FluidSegmentState[] {
  return [
    { segment: 'reservoir',    label: 'Reservoir',      flowRateL: 0, pressureBar: 0, waterLevel: 0.85, isBottleneck: false },
    { segment: 'descent',      label: 'Gravity Descent', flowRateL: 0, pressureBar: 0, waterLevel: 0.5,  isBottleneck: false },
    { segment: 'sawtooth',     label: 'Sawtooth60',      flowRateL: 0, pressureBar: 0, waterLevel: 0.3,  isBottleneck: false },
    { segment: 'golden_lotus', label: 'Golden Lotus',    flowRateL: 0, pressureBar: 0, waterLevel: 0.4,  isBottleneck: false },
    { segment: 'ascent',       label: 'Return Ascent',   flowRateL: 0, pressureBar: 0, waterLevel: 0.2,  isBottleneck: false },
  ];
}

export function useContinuousFluidLoop(initialTickMs = 650): {
  state: ContinuousFluidLoopState;
  controls: FluidLoopControls;
} {
  const [state, setState] = useState<ContinuousFluidLoopState>({
    segments: buildSegments(),
    loopFlowRate: 0,
    heightDifferentialCm: 91.44, // 3-foot head in cm
    lotusPhaseAngle: 0,
    sawtoothPosition: 0,
    totalLoopCompletions: 0,
    gameTurn: 0,
    tickCount: 0,
    isRunning: false,
    tickMs: initialTickMs,
    efficiency: 0.87,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      const tickCount = prev.tickCount + 1;
      const gameTurn = Math.floor(tickCount / 12);

      const lotusPhaseAngle = (prev.lotusPhaseAngle + 30) % 360;
      const sawtoothPosition = (prev.sawtoothPosition + 1) % 60;

      // Gravity-driven flow from height differential
      const gravityFlow = (prev.heightDifferentialCm / 100) * 1.2; // L/min
      // Sawtooth adds directional boost (peaks every 5 teeth)
      const sawtoothBoost = sawtoothPosition % 5 === 0 ? 0.3 : 0.1;
      // Golden Lotus converts flow to rotation — phase amplifies or damps
      const lotusAmplitude = 0.8 + 0.2 * Math.sin((lotusPhaseAngle * Math.PI) / 180);
      const loopFlowRate = parseFloat((gravityFlow * lotusAmplitude * prev.efficiency + sawtoothBoost).toFixed(3));

      const segments: FluidSegmentState[] = prev.segments.map((s, i) => {
        const phaseOffset = (i * 72); // 5 segments, 360/5 = 72°
        const phaseFlow = loopFlowRate * (0.7 + 0.3 * Math.sin(((lotusPhaseAngle + phaseOffset) * Math.PI) / 180));
        const pressure = parseFloat(((prev.heightDifferentialCm - i * 15) / 100 * 0.094).toFixed(4)); // PSI→bar per segment
        const wl = Math.max(0.05, Math.min(0.95, s.waterLevel + (i === 0 ? -0.02 : i === 4 ? 0.02 : 0)));
        return {
          ...s,
          flowRateL: parseFloat(Math.max(0, phaseFlow).toFixed(3)),
          pressureBar: Math.max(0, pressure),
          waterLevel: wl,
          isBottleneck: phaseFlow < loopFlowRate * 0.5,
        };
      });

      const completions = sawtoothPosition === 0 ? prev.totalLoopCompletions + 1 : prev.totalLoopCompletions;

      return { ...prev, segments, loopFlowRate, lotusPhaseAngle, sawtoothPosition, totalLoopCompletions: completions, gameTurn, tickCount };
    });
  }, []);

  const start = useCallback(() => setState(prev => ({ ...prev, isRunning: true })), []);
  const pause = useCallback(() => setState(prev => ({ ...prev, isRunning: false })), []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      segments: buildSegments(),
      loopFlowRate: 0,
      lotusPhaseAngle: 0,
      sawtoothPosition: 0,
      totalLoopCompletions: 0,
      gameTurn: 0,
      tickCount: 0,
      isRunning: false,
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

  return { state, controls: { start, pause, reset, tick, setTickMs } };
}
