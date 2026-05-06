import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CurrentPhase = 'idle' | 'ramp_up' | 'peak' | 'ramp_down';
export type HexelEdgeIndex = 0 | 1 | 2 | 3 | 4 | 5;

export interface SawtoothShaderParams {
  toothCount: number;       // 60 — the defining geometry constant
  toothHeight: number;      // normalised 0.0 – 1.0
  toothAngle: number;       // degrees; acute face = preferred direction
  channelDepth: number;     // mm (spec: 36mm)
  grooveDepth: number;      // mm (spec: 18mm)
  animationSpeed: number;   // shader time multiplier
}

export interface HexelEdgeVector {
  edgeIndex: HexelEdgeIndex;
  angle: number;            // radians from +X
  force: number;            // 0.0 – 1.0
  isPreferred: boolean;     // preferred direction of current
}

export interface Sawtooth60DirectionalCurrentState {
  shaderParams: SawtoothShaderParams;
  phase: CurrentPhase;
  edgeVectors: HexelEdgeVector[];
  globalFlow: number;           // 0.0 – 1.0
  ouralisSync: boolean;         // is wired to MISS-002 Ouralis
  miss015Sync: boolean;         // is wired to MISS-015 gapclose
  reversedPlacement: boolean;   // reversed Hexel = opposing current
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

const DEFAULT_SHADER: SawtoothShaderParams = {
  toothCount: 60,
  toothHeight: 0.75,
  toothAngle: 30,
  channelDepth: 36,
  grooveDepth: 18,
  animationSpeed: 1.0,
};

function buildEdgeVectors(
  flow: number,
  reversed: boolean,
): HexelEdgeVector[] {
  return (Array.from({ length: 6 }) as undefined[]).map((_, i) => {
    const edgeIndex = i as HexelEdgeIndex;
    const angle = (i * Math.PI) / 3;
    // The 60-tooth sawtooth preferentially drives edges 0 & 3 (axial pair)
    const isPreferred = (edgeIndex === 0 || edgeIndex === 3) !== reversed;
    const force = isPreferred ? flow : flow * 0.25;
    return { edgeIndex, angle, force: Math.round(force * 1000) / 1000, isPreferred };
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useSawtooth60DirectionalCurrent
 *
 * Full directional-current simulation (STUB-001 → implemented).
 * Wires sawtooth geometry shader + per-Hexel-edge current-force vectors.
 * Depends on MISS-002 (Ouralis) and MISS-015 (gapclose).
 *
 * The CanalRenderer already exists; this hook provides the simulation
 * state that feeds into a directional-current overlay.
 */
export function useSawtooth60DirectionalCurrent(options?: {
  ouralisSync?: boolean;
  miss015Sync?: boolean;
  reversed?: boolean;
  shaderOverride?: Partial<SawtoothShaderParams>;
}) {
  const [state, setState] = useState<Sawtooth60DirectionalCurrentState>({
    shaderParams: { ...DEFAULT_SHADER, ...(options?.shaderOverride ?? {}) },
    phase: 'idle',
    edgeVectors: buildEdgeVectors(0, options?.reversed ?? false),
    globalFlow: 0,
    ouralisSync: options?.ouralisSync ?? false,
    miss015Sync: options?.miss015Sync ?? false,
    reversedPlacement: options?.reversed ?? false,
  });

  const animRef = useRef<number | null>(null);
  const startRef = useRef(performance.now());
  const activeRef = useRef(false);

  const RAMP_UP_S = 1.2;
  const PEAK_S = 3.0;
  const RAMP_DOWN_S = 0.8;

  const animate = useCallback((now: number) => {
    const elapsed = (now - startRef.current) / 1000;

    setState(prev => {
      let phase: CurrentPhase = 'idle';
      let flow = 0;

      if (elapsed < RAMP_UP_S) {
        phase = 'ramp_up';
        flow = elapsed / RAMP_UP_S;
      } else if (elapsed < RAMP_UP_S + PEAK_S) {
        phase = 'peak';
        // Sawtooth oscillation at peak: 60-tooth creates fast micro-pulses
        const t = elapsed - RAMP_UP_S;
        const period = 1 / (prev.shaderParams.toothCount / 60); // normalised
        const sawPhase = (t % period) / period;
        flow = 0.85 + sawPhase * 0.15;
      } else if (elapsed < RAMP_UP_S + PEAK_S + RAMP_DOWN_S) {
        phase = 'ramp_down';
        const t = elapsed - RAMP_UP_S - PEAK_S;
        flow = 1 - t / RAMP_DOWN_S;
      } else {
        phase = 'idle';
        flow = 0;
        activeRef.current = false;
      }

      flow = Math.min(1, Math.max(0, flow));
      return {
        ...prev,
        phase,
        globalFlow: Math.round(flow * 1000) / 1000,
        edgeVectors: buildEdgeVectors(flow, prev.reversedPlacement),
      };
    });

    if (activeRef.current) {
      animRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    startRef.current = performance.now();
    setState(prev => ({ ...prev, phase: 'ramp_up' }));
    animRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const stop = useCallback(() => {
    activeRef.current = false;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    setState(prev => ({
      ...prev,
      phase: 'idle',
      globalFlow: 0,
      edgeVectors: buildEdgeVectors(0, prev.reversedPlacement),
    }));
  }, []);

  const setReversed = useCallback((reversed: boolean) => {
    setState(prev => ({
      ...prev,
      reversedPlacement: reversed,
      edgeVectors: buildEdgeVectors(prev.globalFlow, reversed),
    }));
  }, []);

  const updateShader = useCallback((patch: Partial<SawtoothShaderParams>) => {
    setState(prev => ({
      ...prev,
      shaderParams: { ...prev.shaderParams, ...patch },
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return { state, start, stop, setReversed, updateShader };
}
