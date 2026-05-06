/**
 * useEnergyInnovationCluster2427
 * =================================
 * MISS-013 — Energy Innovation Cluster (#24-27)
 * Wave 2 / Old One: urIm / Bushel 29 (BP025)
 *
 * Depends on MISS-006 (AC Pressure Generation) + MISS-012 (Water Table).
 * Interface stubs provided for both dependencies.
 *
 * Four sub-innovations:
 *   #24 — Solar-Assisted Pump Integration
 *   #25 — Piezoelectric Harvest from Hexel Vibration
 *   #26 — Kinetic-to-Hydraulic from Player Movement
 *   #27 — Battery-Free LED via Flow-Driven Dynamo
 */

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Dependency stubs ──────────────────────────────────────────────────────────

/** MISS-006: AC Pressure Generation interface stub */
export interface ACPressureInterface {
  acFrequencyHz: number;
  peakPressurePsi: number;
  waveformActive: boolean;
}

/** MISS-012: Water Table interface stub */
export interface WaterTableInterface {
  currentLevelMm: number;
  flowRateMlPerSec: number;
  tableTemperatureCelsius: number;
  gravityHeadFt: number;
}

// ── Sub-innovation states ─────────────────────────────────────────────────────

export interface SolarPumpState {
  /** Solar irradiance (0–1000 W/m²) */
  irradianceWm2: number;
  /** Pump boost factor applied to base hydraulic flow */
  pumpBoostFactor: number;
  /** Effective flow rate including solar assist (mL/s) */
  effectiveFlowMlPerSec: number;
  /** Panel tilt angle (degrees) */
  panelTiltDeg: number;
}

export interface PiezoelectricState {
  /** Hexel vibration amplitude (0–1) from player/water activity */
  vibrationAmplitude: number;
  /** Harvested microwatts */
  harvestedMicrowatts: number;
  /** Accumulated energy in mJ */
  accumulatedEnergyMj: number;
  /** Piezo array size */
  arrayCount: number;
}

export interface KineticHydraulicState {
  /** Steps taken by player (simulated) */
  playerSteps: number;
  /** Kinetic energy captured per step (mJ) */
  energyPerStepMj: number;
  /** Hydraulic pressure boost from kinetic capture (psi) */
  hydraulicBoostPsi: number;
  /** Flywheel charge (0–100%) */
  flywheelChargePct: number;
}

export interface FlowDynamoState {
  /** Flow velocity through dynamo (mL/s) */
  flowVelocityMlPerSec: number;
  /** Generated voltage (V) */
  generatedVoltageV: number;
  /** LED illumination level (0–1) */
  ledIlluminationLevel: number;
  /** Dynamos online */
  dynamosOnline: number;
}

export interface EnergyInnovationCluster2427State {
  acPressure: ACPressureInterface;
  waterTable: WaterTableInterface;
  solar: SolarPumpState;
  piezo: PiezoelectricState;
  kinetic: KineticHydraulicState;
  dynamo: FlowDynamoState;
  running: boolean;
  tick: number;
  activeTab: '24' | '25' | '26' | '27';
}

// ── Default values ────────────────────────────────────────────────────────────

const DEFAULT_AC: ACPressureInterface = { acFrequencyHz: 0.5, peakPressurePsi: 2.17, waveformActive: true };
const DEFAULT_WT: WaterTableInterface = { currentLevelMm: 380, flowRateMlPerSec: 42, tableTemperatureCelsius: 20, gravityHeadFt: 3 };

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEnergyInnovationCluster2427(
  acPressureOverride?: Partial<ACPressureInterface>,
  waterTableOverride?: Partial<WaterTableInterface>,
) {
  const acPressure: ACPressureInterface = { ...DEFAULT_AC, ...acPressureOverride };
  const waterTableBase: WaterTableInterface = { ...DEFAULT_WT, ...waterTableOverride };

  const [state, setState] = useState<EnergyInnovationCluster2427State>({
    acPressure,
    waterTable: waterTableBase,
    solar: {
      irradianceWm2: 600,
      pumpBoostFactor: 1.0,
      effectiveFlowMlPerSec: waterTableBase.flowRateMlPerSec,
      panelTiltDeg: 35,
    },
    piezo: {
      vibrationAmplitude: 0,
      harvestedMicrowatts: 0,
      accumulatedEnergyMj: 0,
      arrayCount: 12,
    },
    kinetic: {
      playerSteps: 0,
      energyPerStepMj: 2.4,
      hydraulicBoostPsi: 0,
      flywheelChargePct: 0,
    },
    dynamo: {
      flowVelocityMlPerSec: waterTableBase.flowRateMlPerSec,
      generatedVoltageV: 0,
      ledIlluminationLevel: 0,
      dynamosOnline: 6,
    },
    running: false,
    tick: 0,
    activeTab: '24',
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setActiveTab = useCallback((tab: '24' | '25' | '26' | '27') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setIrradiance = useCallback((wm2: number) => {
    setState(prev => {
      const boost = 1 + (wm2 / 1000) * 0.4;
      return {
        ...prev,
        solar: {
          ...prev.solar,
          irradianceWm2: wm2,
          pumpBoostFactor: boost,
          effectiveFlowMlPerSec: prev.waterTable.flowRateMlPerSec * boost,
        },
      };
    });
  }, []);

  const setPanelTilt = useCallback((deg: number) => {
    setState(prev => ({ ...prev, solar: { ...prev.solar, panelTiltDeg: deg } }));
  }, []);

  const triggerPlayerStep = useCallback(() => {
    setState(prev => {
      const steps = prev.kinetic.playerSteps + 1;
      const flywheel = Math.min(prev.kinetic.flywheelChargePct + 3, 100);
      const boost = (flywheel / 100) * 0.8; // up to 0.8 psi boost
      return {
        ...prev,
        kinetic: { ...prev.kinetic, playerSteps: steps, flywheelChargePct: flywheel, hydraulicBoostPsi: boost },
      };
    });
  }, []);

  const setVibrationAmplitude = useCallback((amp: number) => {
    setState(prev => {
      const microwatts = amp * prev.piezo.arrayCount * 18;
      return {
        ...prev,
        piezo: { ...prev.piezo, vibrationAmplitude: amp, harvestedMicrowatts: microwatts },
      };
    });
  }, []);

  const setDynamosOnline = useCallback((count: number) => {
    setState(prev => {
      const voltage = (prev.dynamo.flowVelocityMlPerSec / 100) * count * 0.35;
      const led = Math.min(voltage / 3.3, 1);
      return {
        ...prev,
        dynamo: { ...prev.dynamo, dynamosOnline: count, generatedVoltageV: voltage, ledIlluminationLevel: led },
      };
    });
  }, []);

  const toggleSimulation = useCallback(() => {
    setState(prev => ({ ...prev, running: !prev.running }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState(prev => ({
      ...prev,
      running: false,
      tick: 0,
      solar: { irradianceWm2: 600, pumpBoostFactor: 1.0, effectiveFlowMlPerSec: waterTableBase.flowRateMlPerSec, panelTiltDeg: 35 },
      piezo: { vibrationAmplitude: 0, harvestedMicrowatts: 0, accumulatedEnergyMj: 0, arrayCount: 12 },
      kinetic: { playerSteps: 0, energyPerStepMj: 2.4, hydraulicBoostPsi: 0, flywheelChargePct: 0 },
      dynamo: { flowVelocityMlPerSec: waterTableBase.flowRateMlPerSec, generatedVoltageV: 0, ledIlluminationLevel: 0, dynamosOnline: 6 },
    }));
  }, [waterTableBase.flowRateMlPerSec]);

  // Auto-simulation
  useEffect(() => {
    if (!state.running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setState(prev => {
        const t = prev.tick + 1;
        const sun = 400 + Math.sin(t * 0.05) * 350 + Math.random() * 80;
        const vib = Math.abs(Math.sin(t * 0.12)) * (prev.acPressure.waveformActive ? 0.85 : 0.4);
        const microwatts = vib * prev.piezo.arrayCount * 18;
        const accumulated = prev.piezo.accumulatedEnergyMj + microwatts * 0.12 * 0.001;
        const fly = Math.min(prev.kinetic.flywheelChargePct + (t % 15 === 0 ? 5 : -0.3), 100);
        const solarBoost = 1 + (sun / 1000) * 0.4;
        const flowWithSolar = prev.waterTable.flowRateMlPerSec * solarBoost;
        const dynVoltage = (flowWithSolar / 100) * prev.dynamo.dynamosOnline * 0.35;
        const led = Math.min(dynVoltage / 3.3, 1);

        return {
          ...prev,
          tick: t,
          solar: {
            ...prev.solar,
            irradianceWm2: Math.round(sun),
            pumpBoostFactor: solarBoost,
            effectiveFlowMlPerSec: flowWithSolar,
          },
          piezo: {
            ...prev.piezo,
            vibrationAmplitude: vib,
            harvestedMicrowatts: microwatts,
            accumulatedEnergyMj: accumulated,
          },
          kinetic: { ...prev.kinetic, flywheelChargePct: Math.max(fly, 0), hydraulicBoostPsi: (Math.max(fly, 0) / 100) * 0.8 },
          dynamo: {
            ...prev.dynamo,
            flowVelocityMlPerSec: flowWithSolar,
            generatedVoltageV: dynVoltage,
            ledIlluminationLevel: led,
          },
        };
      });
    }, 150);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.running]);

  return {
    state,
    setActiveTab,
    setIrradiance,
    setPanelTilt,
    triggerPlayerStep,
    setVibrationAmplitude,
    setDynamosOnline,
    toggleSimulation,
    reset,
  };
}
