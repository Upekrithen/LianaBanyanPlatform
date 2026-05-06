import { useState, useCallback } from 'react';

// STUB-007 — Airtight Hydraulic Snap-Fit Assembly
// Stub implementation — depends on MISS-001 (Wave 3).
// RootLockSystem snap-fit; airtight simulation not wired.
// Requires: pressure-seal-integrity indicator + snap-force feedback at connection points.

export type SnapFitStatus = 'unconnected' | 'engaging' | 'snapped' | 'sealed' | 'leak';
export type SealIntegrity = 'none' | 'partial' | 'airtight' | 'pressurized';

export interface ConnectionPoint {
  id: string;
  label: string;             // e.g. 'N', 'NE', 'SE', 'S', 'SW', 'NW'
  snapStatus: SnapFitStatus;
  sealIntegrity: SealIntegrity;
  snapForceN: number;        // Newtons — snap force feedback
  pressureBarAtPoint: number;
  leakRateML: number;        // mL/min — 0 if sealed
}

export interface RootLockSnapState {
  connectionPoints: ConnectionPoint[];
  systemPressureBar: number;
  overallSealIntegrity: SealIntegrity;
  snapCount: number;            // how many points are snapped
  sealedCount: number;          // how many are fully sealed
  isAirtight: boolean;
  // MISS-001 dependency stub — not wired
  miss001Connected: false;
  // Note: full airtight simulation pending MISS-001 hydraulic root system
  simulationStubNote: string;
}

export interface SnapFitControls {
  init: () => void;
  snapPoint: (pointId: string) => void;
  snapAll: () => void;
  pressurize: (targetBar: number) => void;
  releasePoint: (pointId: string) => void;
  releaseAll: () => void;
  reset: () => void;
}

const HEX_DIRECTIONS = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];

function buildConnectionPoints(): ConnectionPoint[] {
  return HEX_DIRECTIONS.map((label, i) => ({
    id: `cp-${label.toLowerCase()}`,
    label,
    snapStatus: 'unconnected',
    sealIntegrity: 'none',
    snapForceN: 0,
    pressureBarAtPoint: 0,
    leakRateML: 0,
  }));
}

function snapForceForStatus(status: SnapFitStatus): number {
  switch (status) {
    case 'unconnected': return 0;
    case 'engaging':    return 12;
    case 'snapped':     return 35;
    case 'sealed':      return 42;
    case 'leak':        return 28;
    default: return 0;
  }
}

function computeOverallIntegrity(points: ConnectionPoint[]): SealIntegrity {
  const sealedAll = points.every(p => p.sealIntegrity === 'airtight' || p.sealIntegrity === 'pressurized');
  const anyPartial = points.some(p => p.sealIntegrity === 'partial');
  const anyPressurized = points.some(p => p.sealIntegrity === 'pressurized');
  if (anyPressurized && sealedAll) return 'pressurized';
  if (sealedAll) return 'airtight';
  if (anyPartial) return 'partial';
  return 'none';
}

export function useAirtightHydraulicSnapFitAssembly(): {
  state: RootLockSnapState;
  controls: SnapFitControls;
} {
  const [state, setState] = useState<RootLockSnapState>({
    connectionPoints: buildConnectionPoints(),
    systemPressureBar: 0,
    overallSealIntegrity: 'none',
    snapCount: 0,
    sealedCount: 0,
    isAirtight: false,
    miss001Connected: false,
    simulationStubNote: 'STUB-007: Airtight hydraulic simulation pending MISS-001 (Wave 3). Snap-fit geometry and force feedback are implemented; pressure seal sim is stubbed.',
  });

  const init = useCallback(() => {
    setState(prev => ({ ...prev, connectionPoints: buildConnectionPoints(), systemPressureBar: 0, overallSealIntegrity: 'none', snapCount: 0, sealedCount: 0, isAirtight: false }));
  }, []);

  const snapPoint = useCallback((pointId: string) => {
    setState(prev => {
      const points = prev.connectionPoints.map(p => {
        if (p.id !== pointId) return p;
        if (p.snapStatus === 'unconnected' || p.snapStatus === 'engaging') {
          return {
            ...p,
            snapStatus: 'snapped' as SnapFitStatus,
            sealIntegrity: 'partial' as SealIntegrity,
            snapForceN: snapForceForStatus('snapped'),
            leakRateML: 2.5,
          };
        }
        if (p.snapStatus === 'snapped') {
          return {
            ...p,
            snapStatus: 'sealed' as SnapFitStatus,
            sealIntegrity: 'airtight' as SealIntegrity,
            snapForceN: snapForceForStatus('sealed'),
            leakRateML: 0,
          };
        }
        return p;
      });
      const overallSealIntegrity = computeOverallIntegrity(points);
      const snapCount = points.filter(p => p.snapStatus !== 'unconnected').length;
      const sealedCount = points.filter(p => p.snapStatus === 'sealed').length;
      return { ...prev, connectionPoints: points, overallSealIntegrity, snapCount, sealedCount, isAirtight: sealedCount === 6 };
    });
  }, []);

  const snapAll = useCallback(() => {
    setState(prev => {
      const points = prev.connectionPoints.map(p => ({
        ...p,
        snapStatus: 'sealed' as SnapFitStatus,
        sealIntegrity: 'airtight' as SealIntegrity,
        snapForceN: snapForceForStatus('sealed'),
        leakRateML: 0,
      }));
      return { ...prev, connectionPoints: points, overallSealIntegrity: 'airtight', snapCount: 6, sealedCount: 6, isAirtight: true };
    });
  }, []);

  const pressurize = useCallback((targetBar: number) => {
    setState(prev => {
      if (!prev.isAirtight) return prev; // can't pressurize if not sealed
      const points = prev.connectionPoints.map(p => ({
        ...p,
        sealIntegrity: 'pressurized' as SealIntegrity,
        pressureBarAtPoint: targetBar * (0.85 + Math.random() * 0.1),
      }));
      return { ...prev, connectionPoints: points, systemPressureBar: targetBar, overallSealIntegrity: 'pressurized' };
    });
  }, []);

  const releasePoint = useCallback((pointId: string) => {
    setState(prev => {
      const points = prev.connectionPoints.map(p =>
        p.id === pointId
          ? { ...p, snapStatus: 'unconnected' as SnapFitStatus, sealIntegrity: 'none' as SealIntegrity, snapForceN: 0, pressureBarAtPoint: 0, leakRateML: 0 }
          : p
      );
      const overallSealIntegrity = computeOverallIntegrity(points);
      const snapCount = points.filter(p => p.snapStatus !== 'unconnected').length;
      const sealedCount = points.filter(p => p.snapStatus === 'sealed').length;
      return { ...prev, connectionPoints: points, overallSealIntegrity, snapCount, sealedCount, isAirtight: false, systemPressureBar: 0 };
    });
  }, []);

  const releaseAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      connectionPoints: buildConnectionPoints(),
      systemPressureBar: 0,
      overallSealIntegrity: 'none',
      snapCount: 0,
      sealedCount: 0,
      isAirtight: false,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      connectionPoints: buildConnectionPoints(),
      systemPressureBar: 0,
      overallSealIntegrity: 'none',
      snapCount: 0,
      sealedCount: 0,
      isAirtight: false,
      miss001Connected: false,
      simulationStubNote: 'STUB-007: Airtight hydraulic simulation pending MISS-001 (Wave 3). Snap-fit geometry and force feedback are implemented; pressure seal sim is stubbed.',
    });
  }, []);

  return { state, controls: { init, snapPoint, snapAll, pressurize, releasePoint, releaseAll, reset } };
}
