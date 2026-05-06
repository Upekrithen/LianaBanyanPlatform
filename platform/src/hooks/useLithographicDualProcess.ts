import { useState, useCallback } from 'react';

// STUB-005 — Lithographic Dual-Process Design (#28)
// Two-step lithographic production.
// Step 1: mold impression (pattern layer).
// Step 2: material casting (functional layer).
// Each step can use different materials.
// Enables complex pattern/color combinations without painting.

export type ProcessStep = 'idle' | 'mold_prep' | 'pattern_layer' | 'cure_pattern' | 'material_cast' | 'cure_functional' | 'demold' | 'complete';
export type MaterialType = 'resin_standard' | 'resin_flexible' | 'resin_rigid' | 'polymer_clear' | 'polymer_tinted' | 'nylon_sls';
export type PatternType = 'hexel_base' | 'terrain_surface' | 'channel_lock' | 'character_detail' | 'text_glyph';

export interface LithographicLayer {
  type: 'pattern' | 'functional';
  material: MaterialType;
  pattern: PatternType;
  thicknessMm: number;
  cureTimeMinutes: number;
  isComplete: boolean;
  qualityScore: number;  // 0–100
}

export interface LithographicDualProcessState {
  currentStep: ProcessStep;
  stepProgress: number;          // 0–1
  patternLayer: LithographicLayer | null;
  functionalLayer: LithographicLayer | null;
  selectedPatternMaterial: MaterialType;
  selectedFunctionalMaterial: MaterialType;
  selectedPattern: PatternType;
  moldTemperatureC: number;
  completedPieces: number;
  successRate: number;           // 0–1
  defectCount: number;
  totalProcessTimeMinutes: number;
  isMoldReady: boolean;
}

export interface LithographicControls {
  startProcess: () => void;
  advanceStep: () => void;
  setPatternMaterial: (m: MaterialType) => void;
  setFunctionalMaterial: (m: MaterialType) => void;
  setPattern: (p: PatternType) => void;
  reset: () => void;
}

const STEP_ORDER: ProcessStep[] = [
  'idle', 'mold_prep', 'pattern_layer', 'cure_pattern',
  'material_cast', 'cure_functional', 'demold', 'complete',
];

const MATERIAL_CURE_TIME: Record<MaterialType, number> = {
  resin_standard: 15,
  resin_flexible: 20,
  resin_rigid: 12,
  polymer_clear: 25,
  polymer_tinted: 25,
  nylon_sls: 40,
};

const MATERIAL_QUALITY: Record<MaterialType, number> = {
  resin_standard: 82,
  resin_flexible: 75,
  resin_rigid: 91,
  polymer_clear: 88,
  polymer_tinted: 85,
  nylon_sls: 95,
};

export function useLithographicDualProcess(): {
  state: LithographicDualProcessState;
  controls: LithographicControls;
} {
  const [state, setState] = useState<LithographicDualProcessState>({
    currentStep: 'idle',
    stepProgress: 0,
    patternLayer: null,
    functionalLayer: null,
    selectedPatternMaterial: 'resin_standard',
    selectedFunctionalMaterial: 'polymer_tinted',
    selectedPattern: 'hexel_base',
    moldTemperatureC: 22,
    completedPieces: 0,
    successRate: 0.94,
    defectCount: 0,
    totalProcessTimeMinutes: 0,
    isMoldReady: false,
  });

  const advanceStep = useCallback(() => {
    setState(prev => {
      const currentIdx = STEP_ORDER.indexOf(prev.currentStep);
      if (currentIdx >= STEP_ORDER.length - 1) return prev;
      const nextStep = STEP_ORDER[currentIdx + 1];

      let patternLayer = prev.patternLayer;
      let functionalLayer = prev.functionalLayer;
      let completedPieces = prev.completedPieces;
      let defectCount = prev.defectCount;
      let totalProcessTimeMinutes = prev.totalProcessTimeMinutes;
      let isMoldReady = prev.isMoldReady;

      if (nextStep === 'pattern_layer') {
        patternLayer = {
          type: 'pattern',
          material: prev.selectedPatternMaterial,
          pattern: prev.selectedPattern,
          thicknessMm: 0.8,
          cureTimeMinutes: MATERIAL_CURE_TIME[prev.selectedPatternMaterial],
          isComplete: false,
          qualityScore: MATERIAL_QUALITY[prev.selectedPatternMaterial],
        };
      }
      if (nextStep === 'cure_pattern' && patternLayer) {
        patternLayer = { ...patternLayer, isComplete: true };
        totalProcessTimeMinutes += patternLayer.cureTimeMinutes;
      }
      if (nextStep === 'material_cast') {
        functionalLayer = {
          type: 'functional',
          material: prev.selectedFunctionalMaterial,
          pattern: prev.selectedPattern,
          thicknessMm: 2.4,
          cureTimeMinutes: MATERIAL_CURE_TIME[prev.selectedFunctionalMaterial],
          isComplete: false,
          qualityScore: MATERIAL_QUALITY[prev.selectedFunctionalMaterial],
        };
        isMoldReady = true;
      }
      if (nextStep === 'cure_functional' && functionalLayer) {
        functionalLayer = { ...functionalLayer, isComplete: true };
        totalProcessTimeMinutes += functionalLayer.cureTimeMinutes;
      }
      if (nextStep === 'complete') {
        const isSuccess = Math.random() < prev.successRate;
        completedPieces = isSuccess ? prev.completedPieces + 1 : prev.completedPieces;
        defectCount = isSuccess ? prev.defectCount : prev.defectCount + 1;
      }

      const stepProgress = nextStep === 'complete' ? 1 : (currentIdx + 1) / (STEP_ORDER.length - 1);

      return {
        ...prev,
        currentStep: nextStep,
        stepProgress,
        patternLayer,
        functionalLayer,
        completedPieces,
        defectCount,
        totalProcessTimeMinutes,
        isMoldReady,
        moldTemperatureC: Math.round(22 + Math.random() * 3),
      };
    });
  }, []);

  const startProcess = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 'mold_prep', stepProgress: 0.1, isMoldReady: false }));
  }, []);

  const setPatternMaterial = useCallback((m: MaterialType) => {
    setState(prev => ({ ...prev, selectedPatternMaterial: m }));
  }, []);

  const setFunctionalMaterial = useCallback((m: MaterialType) => {
    setState(prev => ({ ...prev, selectedFunctionalMaterial: m }));
  }, []);

  const setPattern = useCallback((p: PatternType) => {
    setState(prev => ({ ...prev, selectedPattern: p }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'idle',
      stepProgress: 0,
      patternLayer: null,
      functionalLayer: null,
      isMoldReady: false,
      moldTemperatureC: 22,
    }));
  }, []);

  return { state, controls: { startProcess, advanceStep, setPatternMaterial, setFunctionalMaterial, setPattern, reset } };
}
