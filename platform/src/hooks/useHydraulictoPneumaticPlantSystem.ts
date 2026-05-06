/**
 * useHydraulictoPneumaticPlantSystem
 * ====================================
 * MISS-005 — Hydraulic-to-Pneumatic Plant System
 * Wave 2 / Old One: urIm / Bushel 29 (BP025)
 *
 * Depends on MISS-001 (Inverse Hydraulic Coupling).
 * Water pressure at the Hexel base converts to air pressure for above-water
 * plant mechanisms. Differential pressure seal at 5mm lift point enables
 * pneumatic actuation without external pumps.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface InverseHydraulicInterface {
  /** Piston A displacement in mm (positive = extended) */
  pistonADisplacementMm: number;
  /** Piston B displacement in mm (inverse of A) */
  pistonBDisplacementMm: number;
  /** System water pressure in psi */
  waterPressurePsi: number;
  /** Daisy-chain linkage active */
  linkageActive: boolean;
}

export interface PneumaticActuationState {
  /** Air pressure produced above the seal (psi) */
  airPressurePsi: number;
  /** Seal lift height in mm (threshold: 5mm) */
  sealLiftMm: number;
  /** Whether pneumatic actuation is engaged */
  actuationEngaged: boolean;
  /** Plant mechanism angle (0–90°) driven by air pressure */
  plantMechanismAngleDeg: number;
}

export interface HydraulictoPneumaticState {
  inverse: InverseHydraulicInterface;
  pneumatic: PneumaticActuationState;
  /** Simulation running */
  running: boolean;
  /** Elapsed simulation ticks */
  tick: number;
  /** Log of key events */
  eventLog: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SEAL_LIFT_THRESHOLD_MM = 5;
const WATER_PRESSURE_TO_AIR_RATIO = 0.72; // empirical conversion factor for 5mm seal
const MAX_PLANT_ANGLE_DEG = 90;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useHydraulictoPneumaticPlantSystem() {
  const [state, setState] = useState<HydraulictoPneumaticState>({
    inverse: {
      pistonADisplacementMm: 0,
      pistonBDisplacementMm: 0,
      waterPressurePsi: 1.3, // baseline from PHYSICS.operatingPressure
      linkageActive: false,
    },
    pneumatic: {
      airPressurePsi: 0,
      sealLiftMm: 0,
      actuationEngaged: false,
      plantMechanismAngleDeg: 0,
    },
    running: false,
    tick: 0,
    eventLog: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = useCallback((msg: string) => {
    setState(prev => ({
      ...prev,
      eventLog: [`[T${prev.tick}] ${msg}`, ...prev.eventLog].slice(0, 30),
    }));
  }, []);

  /** Drive piston A manually (simulates inverse hydraulic input) */
  const drivePistonA = useCallback((displacementMm: number) => {
    setState(prev => {
      const pistonB = -displacementMm; // inverse coupling
      const linkageActive = Math.abs(displacementMm) > 0.5;
      // Seal lift is proportional to net piston displacement
      const sealLiftMm = Math.min(Math.abs(displacementMm) * 0.6, 12);
      const actuationEngaged = sealLiftMm >= SEAL_LIFT_THRESHOLD_MM;
      const airPressurePsi = actuationEngaged
        ? prev.inverse.waterPressurePsi * WATER_PRESSURE_TO_AIR_RATIO * (sealLiftMm / SEAL_LIFT_THRESHOLD_MM)
        : 0;
      const plantMechanismAngleDeg = Math.min(
        (airPressurePsi / (prev.inverse.waterPressurePsi * WATER_PRESSURE_TO_AIR_RATIO)) * MAX_PLANT_ANGLE_DEG,
        MAX_PLANT_ANGLE_DEG,
      );

      return {
        ...prev,
        inverse: {
          ...prev.inverse,
          pistonADisplacementMm: displacementMm,
          pistonBDisplacementMm: pistonB,
          linkageActive,
        },
        pneumatic: {
          airPressurePsi,
          sealLiftMm,
          actuationEngaged,
          plantMechanismAngleDeg,
        },
      };
    });
  }, []);

  /** Set base water pressure (psi) */
  const setWaterPressure = useCallback((psi: number) => {
    setState(prev => ({ ...prev, inverse: { ...prev.inverse, waterPressurePsi: psi } }));
  }, []);

  /** Toggle auto simulation */
  const toggleSimulation = useCallback(() => {
    setState(prev => ({ ...prev, running: !prev.running }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      running: false,
      tick: 0,
      inverse: { pistonADisplacementMm: 0, pistonBDisplacementMm: 0, waterPressurePsi: 1.3, linkageActive: false },
      pneumatic: { airPressurePsi: 0, sealLiftMm: 0, actuationEngaged: false, plantMechanismAngleDeg: 0 },
      eventLog: [],
    }));
  }, []);

  // Auto-simulation tick
  useEffect(() => {
    if (!state.running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const t = prev.tick + 1;
        const wave = Math.sin(t * 0.18) * 8; // oscillating piston drive
        const pistonB = -wave;
        const sealLiftMm = Math.min(Math.abs(wave) * 0.6, 12);
        const actuationEngaged = sealLiftMm >= SEAL_LIFT_THRESHOLD_MM;
        const airPressurePsi = actuationEngaged
          ? prev.inverse.waterPressurePsi * WATER_PRESSURE_TO_AIR_RATIO * (sealLiftMm / SEAL_LIFT_THRESHOLD_MM)
          : 0;
        const plantMechanismAngleDeg = Math.min(
          (airPressurePsi / (prev.inverse.waterPressurePsi * WATER_PRESSURE_TO_AIR_RATIO)) * MAX_PLANT_ANGLE_DEG,
          MAX_PLANT_ANGLE_DEG,
        );

        const newLog = actuationEngaged && !prev.pneumatic.actuationEngaged
          ? [`[T${t}] Pneumatic seal engaged at ${sealLiftMm.toFixed(1)}mm lift`, ...prev.eventLog]
          : !actuationEngaged && prev.pneumatic.actuationEngaged
          ? [`[T${t}] Seal released — plant retracts`, ...prev.eventLog]
          : prev.eventLog;

        return {
          ...prev,
          tick: t,
          inverse: { ...prev.inverse, pistonADisplacementMm: wave, pistonBDisplacementMm: pistonB, linkageActive: Math.abs(wave) > 0.5 },
          pneumatic: { airPressurePsi, sealLiftMm, actuationEngaged, plantMechanismAngleDeg },
          eventLog: newLog.slice(0, 30),
        };
      });
    }, 120);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.running]);

  return {
    state,
    drivePistonA,
    setWaterPressure,
    toggleSimulation,
    reset,
    SEAL_LIFT_THRESHOLD_MM,
  };
}
