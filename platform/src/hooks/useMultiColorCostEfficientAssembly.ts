import { useState, useCallback } from 'react';

// MISS-014 — Multi-Color Cost-Efficient Assembly
// Each Hexel component color-coded by function.
// Single-color-per-piece enables cost-efficient multi-cavity injection molding.

export type ComponentFunction = 'water' | 'terrain' | 'mechanism' | 'constraint';

export interface HexelComponent {
  id: string;
  name: string;
  function: ComponentFunction;
  color: string;       // hex color string
  colorName: string;   // human label
  moldCavity: number;  // which cavity in the mold (1–4)
  partNumber: string;
  isAssembled: boolean;
  quantity: number;
}

export interface MoldSpec {
  cavityCount: number;
  colorPerCavity: Record<number, { color: string; function: ComponentFunction; colorName: string }>;
  cycleTimeSec: number;
  partsPerShot: number;
}

export interface ColorAssemblyState {
  components: HexelComponent[];
  mold: MoldSpec;
  assembledCount: number;
  totalParts: number;
  costEfficiencyScore: number;  // 0–100
  activeFunction: ComponentFunction | 'all';
}

export interface ColorAssemblyControls {
  init: () => void;
  assembleComponent: (componentId: string) => void;
  assembleAll: () => void;
  disassembleAll: () => void;
  setActiveFilter: (fn: ComponentFunction | 'all') => void;
  reset: () => void;
}

const FUNCTION_PALETTE: Record<ComponentFunction, { color: string; colorName: string; cavity: number }> = {
  water:     { color: '#3b82f6', colorName: 'Ocean Blue',    cavity: 1 },
  terrain:   { color: '#22c55e', colorName: 'Forest Green',  cavity: 2 },
  mechanism: { color: '#f59e0b', colorName: 'Golden Amber',  cavity: 3 },
  constraint:{ color: '#ef4444', colorName: 'Signal Red',    cavity: 4 },
};

const DEFAULT_COMPONENTS: Omit<HexelComponent, 'isAssembled'>[] = [
  { id: 'c01', name: 'Water Channel A',     function: 'water',      color: '#3b82f6', colorName: 'Ocean Blue',   moldCavity: 1, partNumber: 'HX-W-001', quantity: 4 },
  { id: 'c02', name: 'Water Channel B',     function: 'water',      color: '#3b82f6', colorName: 'Ocean Blue',   moldCavity: 1, partNumber: 'HX-W-002', quantity: 2 },
  { id: 'c03', name: 'Tide Valve Seat',     function: 'water',      color: '#3b82f6', colorName: 'Ocean Blue',   moldCavity: 1, partNumber: 'HX-W-003', quantity: 1 },
  { id: 'c04', name: 'Hexel Base Plate',    function: 'terrain',    color: '#22c55e', colorName: 'Forest Green', moldCavity: 2, partNumber: 'HX-T-001', quantity: 1 },
  { id: 'c05', name: 'Terrain Cap',         function: 'terrain',    color: '#22c55e', colorName: 'Forest Green', moldCavity: 2, partNumber: 'HX-T-002', quantity: 1 },
  { id: 'c06', name: 'Shore Ring',          function: 'terrain',    color: '#22c55e', colorName: 'Forest Green', moldCavity: 2, partNumber: 'HX-T-003', quantity: 1 },
  { id: 'c07', name: 'Rotor Disk',          function: 'mechanism',  color: '#f59e0b', colorName: 'Golden Amber', moldCavity: 3, partNumber: 'HX-M-001', quantity: 1 },
  { id: 'c08', name: 'Gear Rack',           function: 'mechanism',  color: '#f59e0b', colorName: 'Golden Amber', moldCavity: 3, partNumber: 'HX-M-002', quantity: 2 },
  { id: 'c09', name: 'Lotus Petal',         function: 'mechanism',  color: '#f59e0b', colorName: 'Golden Amber', moldCavity: 3, partNumber: 'HX-M-003', quantity: 8 },
  { id: 'c10', name: 'Snap-Fit Pin',        function: 'constraint', color: '#ef4444', colorName: 'Signal Red',   moldCavity: 4, partNumber: 'HX-C-001', quantity: 6 },
  { id: 'c11', name: 'Locking Collar',      function: 'constraint', color: '#ef4444', colorName: 'Signal Red',   moldCavity: 4, partNumber: 'HX-C-002', quantity: 3 },
  { id: 'c12', name: 'Alignment Guide',     function: 'constraint', color: '#ef4444', colorName: 'Signal Red',   moldCavity: 4, partNumber: 'HX-C-003', quantity: 2 },
];

function buildComponents(): HexelComponent[] {
  return DEFAULT_COMPONENTS.map(c => ({ ...c, isAssembled: false }));
}

function computeCostEfficiency(components: HexelComponent[]): number {
  const colorGroups = new Set(components.map(c => c.moldCavity)).size;
  const assembledRatio = components.filter(c => c.isAssembled).length / components.length;
  // 4 cavities = max efficiency (one color per function = one mold run per color)
  const cavityScore = (1 - (colorGroups - 1) / 8) * 60;
  const assemblyScore = assembledRatio * 40;
  return Math.min(100, cavityScore + assemblyScore);
}

export function useMultiColorCostEfficientAssembly(): {
  state: ColorAssemblyState;
  controls: ColorAssemblyControls;
} {
  const [state, setState] = useState<ColorAssemblyState>({
    components: buildComponents(),
    mold: {
      cavityCount: 4,
      colorPerCavity: {
        1: { color: '#3b82f6', function: 'water',      colorName: 'Ocean Blue' },
        2: { color: '#22c55e', function: 'terrain',    colorName: 'Forest Green' },
        3: { color: '#f59e0b', function: 'mechanism',  colorName: 'Golden Amber' },
        4: { color: '#ef4444', function: 'constraint', colorName: 'Signal Red' },
      },
      cycleTimeSec: 18,
      partsPerShot: 12,
    },
    assembledCount: 0,
    totalParts: DEFAULT_COMPONENTS.length,
    costEfficiencyScore: 60,
    activeFunction: 'all',
  });

  const init = useCallback(() => {
    setState(prev => ({
      ...prev,
      components: buildComponents(),
      assembledCount: 0,
      costEfficiencyScore: 60,
    }));
  }, []);

  const assembleComponent = useCallback((componentId: string) => {
    setState(prev => {
      const components = prev.components.map(c =>
        c.id === componentId ? { ...c, isAssembled: true } : c
      );
      return {
        ...prev,
        components,
        assembledCount: components.filter(c => c.isAssembled).length,
        costEfficiencyScore: computeCostEfficiency(components),
      };
    });
  }, []);

  const assembleAll = useCallback(() => {
    setState(prev => {
      const components = prev.components.map(c => ({ ...c, isAssembled: true }));
      return { ...prev, components, assembledCount: components.length, costEfficiencyScore: computeCostEfficiency(components) };
    });
  }, []);

  const disassembleAll = useCallback(() => {
    setState(prev => {
      const components = prev.components.map(c => ({ ...c, isAssembled: false }));
      return { ...prev, components, assembledCount: 0, costEfficiencyScore: computeCostEfficiency(components) };
    });
  }, []);

  const setActiveFilter = useCallback((fn: ComponentFunction | 'all') => {
    setState(prev => ({ ...prev, activeFunction: fn }));
  }, []);

  const reset = useCallback(() => {
    setState({
      components: buildComponents(),
      mold: {
        cavityCount: 4,
        colorPerCavity: {
          1: { color: '#3b82f6', function: 'water',      colorName: 'Ocean Blue' },
          2: { color: '#22c55e', function: 'terrain',    colorName: 'Forest Green' },
          3: { color: '#f59e0b', function: 'mechanism',  colorName: 'Golden Amber' },
          4: { color: '#ef4444', function: 'constraint', colorName: 'Signal Red' },
        },
        cycleTimeSec: 18,
        partsPerShot: 12,
      },
      assembledCount: 0,
      totalParts: DEFAULT_COMPONENTS.length,
      costEfficiencyScore: 60,
      activeFunction: 'all',
    });
  }, []);

  return { state, controls: { init, assembleComponent, assembleAll, disassembleAll, setActiveFilter, reset } };
}

export { FUNCTION_PALETTE };
