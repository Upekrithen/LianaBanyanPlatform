import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ValveState = 'open' | 'closed' | 'transitioning';
export type FlowDirection = 'preferred' | 'opposed' | 'none';

export interface ValveJunction {
  id: string;
  hexelQ: number;
  hexelR: number;
  state: ValveState;
  flowDirection: FlowDirection;
  efficiency: number; // per-junction: ~90%
  pressureIn: number; // 0.0 – 1.0 normalised
  pressureOut: number;
}

export interface OneWayValveNetworkState {
  junctions: ValveJunction[];
  networkEfficiency: number;      // compound: efficiency^junctions
  totalFlow: number;              // 0.0 – 1.0
  preferredDirectionActive: boolean;
  blockedDirectionActive: boolean;
  banyanTreeInterfaceActive: boolean; // stub: MISS-007 BanyanTree dependency
}

// ─── Tesla valve geometry model ───────────────────────────────────────────────

const JUNCTION_EFFICIENCY = 0.9; // 90% per junction (spec)

function buildJunctions(count: number): ValveJunction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `valve-${i}`,
    hexelQ: Math.floor(i / 2) - Math.floor(count / 4),
    hexelR: (i % 2) * 2 - 1,
    state: 'closed' as ValveState,
    flowDirection: 'none' as FlowDirection,
    efficiency: JUNCTION_EFFICIENCY,
    pressureIn: 0,
    pressureOut: 0,
  }));
}

function computeNetworkEfficiency(junctionCount: number, flowActive: boolean): number {
  if (!flowActive) return 0;
  return Math.round(Math.pow(JUNCTION_EFFICIENCY, junctionCount) * 10000) / 100;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * useOneWayValveNetwork
 *
 * Tesla valve-inspired no-moving-parts unidirectional flow control.
 * Depends on MISS-007 BanyanTree — wired as a stub interface here;
 * full BanyanTree integration occurs when MISS-007 is active.
 *
 * Geometry alone enforces directionality (~90% efficiency per junction).
 */
export function useOneWayValveNetwork(
  junctionCount = 6,
  banyanTreeActive = false,
) {
  const [state, setState] = useState<OneWayValveNetworkState>(() => ({
    junctions: buildJunctions(junctionCount),
    networkEfficiency: 0,
    totalFlow: 0,
    preferredDirectionActive: false,
    blockedDirectionActive: false,
    banyanTreeInterfaceActive: banyanTreeActive,
  }));

  const animRef = useRef<number | null>(null);
  const startRef = useRef(performance.now());

  // BanyanTree stub sync
  useEffect(() => {
    setState(prev => ({ ...prev, banyanTreeInterfaceActive: banyanTreeActive }));
  }, [banyanTreeActive]);

  // Flow simulation loop
  useEffect(() => {
    if (!state.preferredDirectionActive && !state.blockedDirectionActive) return;

    const animate = (now: number) => {
      const t = (now - startRef.current) / 1000;

      setState(prev => {
        const direction: FlowDirection = prev.preferredDirectionActive
          ? 'preferred'
          : prev.blockedDirectionActive
          ? 'opposed'
          : 'none';

        const baseFlow = prev.preferredDirectionActive
          ? Math.min(1, t * 0.4)     // ramp up
          : Math.max(0, 1 - t * 2.5); // steep block

        const updatedJunctions: ValveJunction[] = prev.junctions.map((j, idx) => {
          const junctionDelay = idx * 0.08;
          const localT = Math.max(0, t - junctionDelay);
          const pIn = prev.preferredDirectionActive
            ? Math.min(1, localT * 0.5)
            : Math.min(0.3, localT * 0.15); // high back-pressure, low pass-through

          const pOut = prev.preferredDirectionActive
            ? pIn * j.efficiency
            : pIn * (1 - j.efficiency); // ~10% leakage in opposed direction

          return {
            ...j,
            state: (pIn > 0.05 ? 'open' : 'closed') as ValveState,
            flowDirection: direction,
            pressureIn: Math.round(pIn * 100) / 100,
            pressureOut: Math.round(pOut * 100) / 100,
          };
        });

        return {
          ...prev,
          junctions: updatedJunctions,
          totalFlow: Math.round(baseFlow * 100) / 100,
          networkEfficiency: computeNetworkEfficiency(junctionCount, prev.preferredDirectionActive),
        };
      });

      animRef.current = requestAnimationFrame(animate);
    };

    startRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [state.preferredDirectionActive, state.blockedDirectionActive, junctionCount]);

  const activatePreferred = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferredDirectionActive: true,
      blockedDirectionActive: false,
    }));
  }, []);

  const activateOpposed = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferredDirectionActive: false,
      blockedDirectionActive: true,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      preferredDirectionActive: false,
      blockedDirectionActive: false,
      totalFlow: 0,
      networkEfficiency: 0,
      junctions: buildJunctions(junctionCount),
    }));
  }, [junctionCount]);

  return { state, activatePreferred, activateOpposed, reset };
}
