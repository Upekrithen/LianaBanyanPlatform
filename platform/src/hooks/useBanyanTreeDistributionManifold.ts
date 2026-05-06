import { useState, useCallback } from 'react';

// MISS-007 — Banyan Tree Distribution Manifold
// Stub with interface — depends on MISS-001 (Wave 3). Implemented as standalone.
// Water distributes like banyan tree root from HollowLog to 6 ChannelLock branches per Hexel.
// Flow rate per branch governed by Tesla valve orientation.

export type TeslaValveOrientation = 'open' | 'closed' | 'partial';
export type BranchStatus = 'flowing' | 'blocked' | 'idle';

export interface ChannelLockBranch {
  id: string;              // e.g. 'branch-0' through 'branch-5'
  angle: number;           // 0, 60, 120, 180, 240, 300 degrees
  teslaOrientation: TeslaValveOrientation;
  flowRate: number;        // 0–1 normalized
  status: BranchStatus;
  pressureKPa: number;
}

export interface HollowLogNode {
  id: string;
  pressureKPa: number;    // inlet pressure from water table
  branches: ChannelLockBranch[];
}

export interface BanyanManifoldState {
  hollowLog: HollowLogNode;
  totalFlowRate: number;  // sum of all branch flow rates
  manifoldPressure: number;
  isInitialized: boolean;
  // MISS-001 stub interface — wired when Wave 3 delivers
  miss001Connected: false;
}

export interface BanyanManifoldControls {
  init: (inletPressureKPa?: number) => void;
  setValve: (branchId: string, orientation: TeslaValveOrientation) => void;
  setAllValves: (orientation: TeslaValveOrientation) => void;
  tick: () => void;
  reset: () => void;
}

function buildBranches(): ChannelLockBranch[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `branch-${i}`,
    angle: i * 60,
    teslaOrientation: 'open' as TeslaValveOrientation,
    flowRate: 0,
    status: 'idle' as BranchStatus,
    pressureKPa: 0,
  }));
}

function valveFlowFactor(orientation: TeslaValveOrientation): number {
  switch (orientation) {
    case 'open': return 1.0;
    case 'partial': return 0.4;
    case 'closed': return 0.0;
  }
}

function computeFlowRate(inletPressure: number, valveFactor: number): number {
  // Simplified Hagen-Poiseuille inspired: Q ∝ ΔP * valve aperture
  const raw = (inletPressure / 100) * valveFactor;
  return Math.min(1, Math.max(0, raw));
}

export function useBanyanTreeDistributionManifold(): {
  state: BanyanManifoldState;
  controls: BanyanManifoldControls;
} {
  const [state, setState] = useState<BanyanManifoldState>({
    hollowLog: {
      id: 'hollow-log-center',
      pressureKPa: 0,
      branches: buildBranches(),
    },
    totalFlowRate: 0,
    manifoldPressure: 0,
    isInitialized: false,
    miss001Connected: false,
  });

  const init = useCallback((inletPressureKPa = 80) => {
    setState(prev => {
      const branches = prev.hollowLog.branches.map(b => {
        const factor = valveFlowFactor(b.teslaOrientation);
        const branchPressure = inletPressureKPa * (factor * 0.85); // manifold loss
        const flowRate = computeFlowRate(inletPressureKPa, factor);
        return {
          ...b,
          pressureKPa: branchPressure,
          flowRate,
          status: (flowRate > 0 ? 'flowing' : 'blocked') as BranchStatus,
        };
      });
      const totalFlowRate = branches.reduce((sum, b) => sum + b.flowRate, 0) / 6;
      return {
        ...prev,
        hollowLog: { ...prev.hollowLog, pressureKPa: inletPressureKPa, branches },
        totalFlowRate,
        manifoldPressure: inletPressureKPa * 0.9,
        isInitialized: true,
      };
    });
  }, []);

  const setValve = useCallback((branchId: string, orientation: TeslaValveOrientation) => {
    setState(prev => {
      const branches = prev.hollowLog.branches.map(b => {
        if (b.id !== branchId) return b;
        const factor = valveFlowFactor(orientation);
        const flowRate = computeFlowRate(prev.hollowLog.pressureKPa, factor);
        return {
          ...b,
          teslaOrientation: orientation,
          flowRate,
          pressureKPa: prev.hollowLog.pressureKPa * factor * 0.85,
          status: (flowRate > 0 ? 'flowing' : 'blocked') as BranchStatus,
        };
      });
      const totalFlowRate = branches.reduce((sum, b) => sum + b.flowRate, 0) / 6;
      return { ...prev, hollowLog: { ...prev.hollowLog, branches }, totalFlowRate };
    });
  }, []);

  const setAllValves = useCallback((orientation: TeslaValveOrientation) => {
    setState(prev => {
      const branches = prev.hollowLog.branches.map(b => {
        const factor = valveFlowFactor(orientation);
        const flowRate = computeFlowRate(prev.hollowLog.pressureKPa, factor);
        return {
          ...b,
          teslaOrientation: orientation,
          flowRate,
          pressureKPa: prev.hollowLog.pressureKPa * factor * 0.85,
          status: (flowRate > 0 ? 'flowing' : 'blocked') as BranchStatus,
        };
      });
      const totalFlowRate = branches.reduce((sum, b) => sum + b.flowRate, 0) / 6;
      return { ...prev, hollowLog: { ...prev.hollowLog, branches }, totalFlowRate };
    });
  }, []);

  // Simulate slight pressure fluctuation each tick
  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.isInitialized) return prev;
      const jitter = (Math.random() - 0.5) * 4;
      const newPressure = Math.max(10, prev.hollowLog.pressureKPa + jitter);
      const branches = prev.hollowLog.branches.map(b => {
        const factor = valveFlowFactor(b.teslaOrientation);
        const flowRate = computeFlowRate(newPressure, factor);
        return { ...b, flowRate, pressureKPa: newPressure * factor * 0.85 };
      });
      const totalFlowRate = branches.reduce((sum, b) => sum + b.flowRate, 0) / 6;
      return {
        ...prev,
        hollowLog: { ...prev.hollowLog, pressureKPa: newPressure, branches },
        manifoldPressure: newPressure * 0.9,
        totalFlowRate,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      hollowLog: { id: 'hollow-log-center', pressureKPa: 0, branches: buildBranches() },
      totalFlowRate: 0,
      manifoldPressure: 0,
      isInitialized: false,
      miss001Connected: false,
    });
  }, []);

  return { state, controls: { init, setValve, setAllValves, tick, reset } };
}
