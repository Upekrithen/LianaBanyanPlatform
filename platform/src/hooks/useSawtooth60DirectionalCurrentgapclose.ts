import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CurrentDirection = 'forward' | 'reverse' | 'neutral';
export type OuralisPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface HexelEdgeForce {
  edgeIndex: number; // 0–5 for hex edges
  direction: CurrentDirection;
  force: number; // 0.0 – 1.0 normalised
}

export interface Sawtooth60gapcloseState {
  toothCount: number;          // always 60
  channelDepth: number;        // mm (spec: 36mm)
  grooveDepth: number;         // mm (spec: 18mm)
  currentDirection: CurrentDirection;
  flowVelocity: number;        // 0.0 – 1.0
  ouralisPhase: OuralisPhase;
  edgeForces: HexelEdgeForce[];
  reversed: boolean;           // reversed placement = opposing current
  efficiency: number;          // % (sawtooth: ~85–95%)
  isActive: boolean;
}

export interface OuralisTidalMechanismEngineInterface {
  phase: OuralisPhase;
  tidalVelocity: number;
  onPhaseChange?: (phase: OuralisPhase) => void;
}

// ─── Sawtooth geometry helpers ───────────────────────────────────────────────

function computeEdgeForces(
  direction: CurrentDirection,
  flowVelocity: number,
  reversed: boolean,
): HexelEdgeForce[] {
  return Array.from({ length: 6 }, (_, edgeIndex) => {
    const baseAngle = (edgeIndex * Math.PI) / 3;
    // 60-tooth sawtooth enforces primary flow at edges 0 and 3 (opposite faces)
    const isPrimaryEdge = edgeIndex === 0 || edgeIndex === 3;
    const scalar = isPrimaryEdge ? flowVelocity : flowVelocity * 0.35;
    const effectiveDirection = reversed
      ? direction === 'forward' ? 'reverse' : direction === 'reverse' ? 'forward' : 'neutral'
      : direction;
    return { edgeIndex, direction: effectiveDirection, force: Math.round(scalar * 100) / 100 };
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useSawtooth60DirectionalCurrentgapclose
 *
 * Bridges the Ouralis Tidal Mechanism Engine (MISS-002) with the
 * Sawtooth60 directional-current gap-close implementation (MISS-015).
 * Accepts an optional Ouralis interface so the two systems can share
 * phase state without tight coupling.
 */
export function useSawtooth60DirectionalCurrentgapclose(
  ouralis?: OuralisTidalMechanismEngineInterface,
) {
  const [state, setState] = useState<Sawtooth60gapcloseState>({
    toothCount: 60,
    channelDepth: 36,
    grooveDepth: 18,
    currentDirection: 'forward',
    flowVelocity: 0,
    ouralisPhase: ouralis?.phase ?? 0,
    edgeForces: computeEdgeForces('forward', 0, false),
    reversed: false,
    efficiency: 90,
    isActive: false,
  });

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());

  // Sync Ouralis phase when provided externally
  useEffect(() => {
    if (ouralis === undefined) return;
    setState(prev => ({ ...prev, ouralisPhase: ouralis.phase }));
  }, [ouralis?.phase]);

  // Internal tide simulation when Ouralis is not wired
  useEffect(() => {
    if (ouralis !== undefined) return;

    let phaseTimer = 0;
    const PHASE_MS = 4000; // one Ouralis rotation = 4 s in simulation
    const interval = setInterval(() => {
      phaseTimer += PHASE_MS;
      const phase = (Math.floor(phaseTimer / PHASE_MS) % 12) as OuralisPhase;
      setState(prev => ({ ...prev, ouralisPhase: phase }));
      ouralis?.onPhaseChange?.(phase);
    }, PHASE_MS);

    return () => clearInterval(interval);
  }, [ouralis]);

  // Animation loop — sawtooth-wave velocity envelope
  useEffect(() => {
    if (!state.isActive) return;

    const animate = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // Sawtooth wave: ramp up fast, reset — 60-tooth geometry period
      const period = 1.5; // seconds per tooth cycle (visual)
      const sawPhase = (elapsed % period) / period;
      const velocity = state.currentDirection === 'neutral' ? 0 : sawPhase;

      setState(prev => ({
        ...prev,
        flowVelocity: Math.round(velocity * 100) / 100,
        edgeForces: computeEdgeForces(prev.currentDirection, velocity, prev.reversed),
      }));

      animFrameRef.current = requestAnimationFrame(animate);
    };

    startTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state.isActive, state.currentDirection]);

  const setDirection = useCallback((direction: CurrentDirection) => {
    setState(prev => ({
      ...prev,
      currentDirection: direction,
      edgeForces: computeEdgeForces(direction, prev.flowVelocity, prev.reversed),
    }));
  }, []);

  const toggleReversed = useCallback(() => {
    setState(prev => {
      const next = !prev.reversed;
      return {
        ...prev,
        reversed: next,
        edgeForces: computeEdgeForces(prev.currentDirection, prev.flowVelocity, next),
      };
    });
  }, []);

  const setActive = useCallback((active: boolean) => {
    setState(prev => ({ ...prev, isActive: active, flowVelocity: active ? prev.flowVelocity : 0 }));
  }, []);

  return { state, setDirection, toggleReversed, setActive };
}
