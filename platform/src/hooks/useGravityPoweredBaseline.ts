import { useState, useCallback, useRef, useEffect } from 'react';

// MISS-009 — Gravity-Powered Baseline
// Standalone — no deps.
// 8-foot column provides gravity-fed pressure (~2.17 psi at 5-foot effective head).
// No pumps, no batteries. Water source: 5-gallon jug on telescoping legs (flat-pack ship).

export interface GravityBaselineState {
  jugVolumeGallons: number;    // current water in jug (0..5)
  columnHeightFt: number;      // physical column height (0..8)
  effectiveHeadFt: number;     // head pressure height (0..8)
  pressurePsi: number;         // computed PSI
  flowRateGPM: number;         // gallons per minute at current pressure
  isFlowing: boolean;
  telescopingLegExtended: boolean;
  elapsedSeconds: number;
}

export interface GravityBaselineConfig {
  maxColumnHeightFt: number;   // default 8
  jugCapacityGallons: number;  // default 5
  outletDiameterInch: number;  // default 0.5
}

const DEFAULT_CONFIG: GravityBaselineConfig = {
  maxColumnHeightFt: 8,
  jugCapacityGallons: 5,
  outletDiameterInch: 0.5,
};

// PSI from head: 1 ft H2O = 0.4335 psi
function computePressure(effectiveHeadFt: number): number {
  return Math.max(0, effectiveHeadFt * 0.4335);
}

// Torricelli-derived flow: Q = Cd * A * sqrt(2 * g * h)
// Simplified to GPM with empirical coefficients matching the spec (~2.17 psi at 5 ft)
function computeFlowGPM(pressurePsi: number, outletDiameterInch: number): number {
  if (pressurePsi <= 0) return 0;
  const area = Math.PI * Math.pow(outletDiameterInch / 2, 2); // in²
  const Cd = 0.61;
  const velocity = Cd * Math.sqrt(2 * 32.2 * (pressurePsi / 0.4335)); // ft/s
  return velocity * area * (1 / 144) * 7.48052 * 60; // GPM
}

export function useGravityPoweredBaseline(config: Partial<GravityBaselineConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const [state, setState] = useState<GravityBaselineState>({
    jugVolumeGallons: cfg.jugCapacityGallons,
    columnHeightFt: cfg.maxColumnHeightFt,
    effectiveHeadFt: 5,
    pressurePsi: computePressure(5),
    flowRateGPM: 0,
    isFlowing: false,
    telescopingLegExtended: true,
    elapsedSeconds: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setColumnHeight = useCallback((heightFt: number) => {
    const h = Math.max(0, Math.min(cfg.maxColumnHeightFt, heightFt));
    setState(prev => {
      const eff = Math.min(h, 5); // effective head capped at 5 ft per spec
      const psi = computePressure(eff);
      return {
        ...prev,
        columnHeightFt: h,
        effectiveHeadFt: eff,
        pressurePsi: psi,
        flowRateGPM: prev.isFlowing ? computeFlowGPM(psi, cfg.outletDiameterInch) : 0,
      };
    });
  }, [cfg]);

  const toggleFlow = useCallback(() => {
    setState(prev => {
      const nowFlowing = !prev.isFlowing;
      return {
        ...prev,
        isFlowing: nowFlowing,
        flowRateGPM: nowFlowing ? computeFlowGPM(prev.pressurePsi, cfg.outletDiameterInch) : 0,
      };
    });
  }, [cfg.outletDiameterInch]);

  const toggleTelescopingLegs = useCallback(() => {
    setState(prev => ({ ...prev, telescopingLegExtended: !prev.telescopingLegExtended }));
  }, []);

  const refillJug = useCallback(() => {
    setState(prev => ({ ...prev, jugVolumeGallons: cfg.jugCapacityGallons }));
  }, [cfg.jugCapacityGallons]);

  // Drain jug when flowing
  useEffect(() => {
    if (state.isFlowing) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.isFlowing) return prev;
          const drained = (prev.flowRateGPM / 60) * 0.5; // per 500ms tick
          const newVol = Math.max(0, prev.jugVolumeGallons - drained);
          const stillFlowing = newVol > 0;
          return {
            ...prev,
            jugVolumeGallons: newVol,
            isFlowing: stillFlowing,
            flowRateGPM: stillFlowing ? prev.flowRateGPM : 0,
            elapsedSeconds: prev.elapsedSeconds + 0.5,
          };
        });
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isFlowing]);

  return {
    state,
    config: cfg,
    setColumnHeight,
    toggleFlow,
    toggleTelescopingLegs,
    refillJug,
  };
}
