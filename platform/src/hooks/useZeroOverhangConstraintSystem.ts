/**
 * useZeroOverhangConstraintSystem
 * ==================================
 * STUB-006 — Zero-Overhang Constraint System
 * Wave 2 / Old One: urIm / Bushel 29 (BP025)
 *
 * Standalone — no dependencies.
 *
 * RootLockSystem embodies the constraint. This hook surfaces:
 *   - Overhang-angle visualization state
 *   - Constraint-violation detection in 3D view context
 *   - Mold-compatibility analysis (printable + moldable)
 */

import { useState, useCallback, useMemo } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OverhangSeverity = 'none' | 'borderline' | 'violation';

export interface HexelFace {
  id: string;
  label: string;
  /** Angle from vertical (0° = vertical wall, 90° = horizontal undercut) */
  angleFromVerticalDeg: number;
  /** Pull direction for mold release */
  pullDirection: 'up' | 'down' | 'side';
}

export interface OverhangAnalysis {
  faceId: string;
  angleFromVerticalDeg: number;
  severity: OverhangSeverity;
  /** Maximum printable overhang angle without supports */
  printableThresholdDeg: number;
  /** Maximum moldable angle (0° = must be vertical for injection mold release) */
  moldableThresholdDeg: number;
  isViolation: boolean;
  isBorderline: boolean;
  remediationNote: string;
}

export interface ZeroOverhangConstraintState {
  faces: HexelFace[];
  analyses: OverhangAnalysis[];
  selectedFaceId: string | null;
  showViolationsOnly: boolean;
  /** Global rotation applied to 3D view (degrees) */
  viewRotationDeg: number;
  viewElevationDeg: number;
  moldPullDirection: 'up' | 'down';
  violationCount: number;
  borderlineCount: number;
  compliantCount: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** FDM/SLA typical unsupported overhang limit */
const PRINT_THRESHOLD_DEG = 45;
/** Injection mold release: strictly 0° for zero-overhang constraint */
const MOLD_THRESHOLD_DEG = 0;

// ── Default Hexel face set ────────────────────────────────────────────────────

const DEFAULT_FACES: HexelFace[] = [
  { id: 'top',         label: 'Top Cap',          angleFromVerticalDeg: 0,   pullDirection: 'up' },
  { id: 'side-a',      label: 'Side A',            angleFromVerticalDeg: 2,   pullDirection: 'side' },
  { id: 'side-b',      label: 'Side B',            angleFromVerticalDeg: 5,   pullDirection: 'side' },
  { id: 'side-c',      label: 'Side C (channel)',  angleFromVerticalDeg: 12,  pullDirection: 'side' },
  { id: 'side-d',      label: 'Side D',            angleFromVerticalDeg: 3,   pullDirection: 'side' },
  { id: 'side-e',      label: 'Side E (socket)',   angleFromVerticalDeg: 38,  pullDirection: 'side' },
  { id: 'side-f',      label: 'Side F',            angleFromVerticalDeg: 7,   pullDirection: 'side' },
  { id: 'bottom',      label: 'Base',              angleFromVerticalDeg: 0,   pullDirection: 'down' },
  { id: 'root-peg',    label: 'Root Peg',          angleFromVerticalDeg: 1,   pullDirection: 'down' },
  { id: 'channel-lip', label: 'Channel Lip',       angleFromVerticalDeg: 47,  pullDirection: 'side' },
  { id: 'hollow-log',  label: 'HollowLog Wall',    angleFromVerticalDeg: 0,   pullDirection: 'up' },
  { id: 'snap-tab',    label: 'Snap Tab',          angleFromVerticalDeg: 55,  pullDirection: 'side' },
];

// ── Analysis function ─────────────────────────────────────────────────────────

function analyzeFace(face: HexelFace): OverhangAnalysis {
  const { id, angleFromVerticalDeg } = face;
  const isViolation = angleFromVerticalDeg > MOLD_THRESHOLD_DEG;
  const isBorderline = angleFromVerticalDeg > MOLD_THRESHOLD_DEG && angleFromVerticalDeg <= PRINT_THRESHOLD_DEG;
  const severity: OverhangSeverity = !isViolation ? 'none' : isBorderline ? 'borderline' : 'violation';

  let remediationNote = '';
  if (angleFromVerticalDeg === 0) {
    remediationNote = 'Compliant — zero overhang. ✓';
  } else if (isBorderline) {
    remediationNote = `${angleFromVerticalDeg}° overhang — printable without supports but exceeds mold release constraint. Split into separate POCF piece.`;
  } else {
    remediationNote = `${angleFromVerticalDeg}° overhang — INJECTION MOLD VIOLATION. Must be redesigned or separated as undercut piece.`;
  }

  return {
    faceId: id,
    angleFromVerticalDeg,
    severity,
    printableThresholdDeg: PRINT_THRESHOLD_DEG,
    moldableThresholdDeg: MOLD_THRESHOLD_DEG,
    isViolation,
    isBorderline,
    remediationNote,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useZeroOverhangConstraintSystem(initialFaces?: HexelFace[]) {
  const [faces, setFaces] = useState<HexelFace[]>(initialFaces ?? DEFAULT_FACES);
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [showViolationsOnly, setShowViolationsOnly] = useState(false);
  const [viewRotationDeg, setViewRotationDeg] = useState(0);
  const [viewElevationDeg, setViewElevationDeg] = useState(30);
  const [moldPullDirection, setMoldPullDirection] = useState<'up' | 'down'>('up');

  const analyses = useMemo(() => faces.map(analyzeFace), [faces]);

  const violationCount = useMemo(() => analyses.filter(a => !a.isBorderline && a.isViolation).length, [analyses]);
  const borderlineCount = useMemo(() => analyses.filter(a => a.isBorderline).length, [analyses]);
  const compliantCount = useMemo(() => analyses.filter(a => !a.isViolation).length, [analyses]);

  const setFaceAngle = useCallback((faceId: string, angleDeg: number) => {
    setFaces(prev => prev.map(f => f.id === faceId ? { ...f, angleFromVerticalDeg: angleDeg } : f));
  }, []);

  const addFace = useCallback((face: HexelFace) => {
    setFaces(prev => [...prev, face]);
  }, []);

  const removeFace = useCallback((faceId: string) => {
    setFaces(prev => prev.filter(f => f.id !== faceId));
  }, []);

  const resetToDefault = useCallback(() => {
    setFaces(DEFAULT_FACES);
    setSelectedFaceId(null);
    setViewRotationDeg(0);
    setViewElevationDeg(30);
  }, []);

  const state: ZeroOverhangConstraintState = {
    faces,
    analyses,
    selectedFaceId,
    showViolationsOnly,
    viewRotationDeg,
    viewElevationDeg,
    moldPullDirection,
    violationCount,
    borderlineCount,
    compliantCount,
  };

  return {
    state,
    setSelectedFaceId,
    setShowViolationsOnly,
    setViewRotationDeg,
    setViewElevationDeg,
    setMoldPullDirection,
    setFaceAngle,
    addFace,
    removeFace,
    resetToDefault,
    PRINT_THRESHOLD_DEG,
    MOLD_THRESHOLD_DEG,
  };
}
