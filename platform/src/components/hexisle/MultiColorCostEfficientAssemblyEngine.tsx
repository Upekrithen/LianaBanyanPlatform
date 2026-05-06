import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Layers, RotateCcw, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMultiColorCostEfficientAssembly,
  FUNCTION_PALETTE,
} from '@/hooks/useMultiColorCostEfficientAssembly';
import type { ComponentFunction, HexelComponent } from '@/hooks/useMultiColorCostEfficientAssembly';

// Pheromone-style event shape
export interface MultiColorAssemblyEvent {
  type: 'COMPONENT_ASSEMBLED' | 'ALL_ASSEMBLED' | 'RESET';
  payload: {
    componentId?: string;
    assembledCount: number;
    costEfficiencyScore: number;
    ts: number;
  };
}

interface MultiColorCostEfficientAssemblyEngineProps {
  onEvent?: (event: MultiColorAssemblyEvent) => void;
  className?: string;
}

const FUNCTION_LABELS: Record<ComponentFunction, string> = {
  water:      'Water',
  terrain:    'Terrain',
  mechanism:  'Mechanism',
  constraint: 'Constraint',
};

function MoldDiagram({ cavityCount }: { cavityCount: number }) {
  const cavities = Object.entries(FUNCTION_PALETTE);
  return (
    <div className="flex gap-2 justify-center">
      {cavities.map(([fn, spec]) => (
        <div key={fn} className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-14 rounded border-2 border-slate-600 flex items-center justify-center"
            style={{ backgroundColor: spec.color + '33', borderColor: spec.color }}
          >
            <span className="text-[10px] font-bold" style={{ color: spec.color }}>C{spec.cavity}</span>
          </div>
          <span className="text-[9px] text-slate-400">{spec.colorName.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}

function ComponentRow({
  component,
  onAssemble,
}: {
  component: HexelComponent;
  onAssemble: (id: string) => void;
}) {
  const palette = FUNCTION_PALETTE[component.function];
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded px-3 py-1.5 transition-all',
        component.isAssembled ? 'bg-slate-800 opacity-60' : 'bg-slate-800 hover:bg-slate-750'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.color }} />
        <span className="text-xs text-slate-200">{component.name}</span>
        <span className="text-[10px] text-slate-500 font-mono">{component.partNumber}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500">×{component.quantity}</span>
        <button
          onClick={() => !component.isAssembled && onAssemble(component.id)}
          className="text-slate-400 hover:text-white transition-colors"
          disabled={component.isAssembled}
        >
          {component.isAssembled
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <Circle className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  );
}

export const MultiColorCostEfficientAssemblyEngine: React.FC<MultiColorCostEfficientAssemblyEngineProps> = ({
  onEvent,
  className,
}) => {
  const { state, controls } = useMultiColorCostEfficientAssembly();

  const handleAssemble = (id: string) => {
    controls.assembleComponent(id);
    onEvent?.({
      type: 'COMPONENT_ASSEMBLED',
      payload: { componentId: id, assembledCount: state.assembledCount + 1, costEfficiencyScore: state.costEfficiencyScore, ts: Date.now() },
    });
  };

  const handleAssembleAll = () => {
    controls.assembleAll();
    onEvent?.({
      type: 'ALL_ASSEMBLED',
      payload: { assembledCount: state.totalParts, costEfficiencyScore: 100, ts: Date.now() },
    });
  };

  const visibleComponents = state.activeFunction === 'all'
    ? state.components
    : state.components.filter(c => c.function === state.activeFunction);

  const efficiencyColor = state.costEfficiencyScore >= 80 ? 'text-emerald-400' : state.costEfficiencyScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-amber-400">Multi-Color Cost-Efficient Assembly</CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-500 text-amber-400">MISS-014</Badge>
        </div>
        <CardDescription className="text-slate-400">
          Blue=water · Green=terrain · Gold=mechanism · Red=constraint · 4-cavity injection mold
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mold cavity diagram */}
        <div className="bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-500 text-center mb-2">4-Cavity Mold Layout</p>
          <MoldDiagram cavityCount={state.mold.cavityCount} />
          <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-500">
            <span>Cycle: {state.mold.cycleTimeSec}s</span>
            <span>Parts/shot: {state.mold.partsPerShot}</span>
          </div>
        </div>

        {/* Cost efficiency */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Cost Efficiency Score</span>
            <span className={cn('font-bold', efficiencyColor)}>{state.costEfficiencyScore.toFixed(0)}/100</span>
          </div>
          <Progress value={state.costEfficiencyScore} className="h-2 bg-slate-700" />
        </div>

        {/* Assembly progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Assembly Progress</span>
            <span>{state.assembledCount}/{state.totalParts} parts</span>
          </div>
          <Progress value={(state.assembledCount / state.totalParts) * 100} className="h-1.5 bg-slate-700" />
        </div>

        {/* Function filter */}
        <div className="flex flex-wrap gap-1">
          {(['all', 'water', 'terrain', 'mechanism', 'constraint'] as const).map(fn => (
            <button
              key={fn}
              onClick={() => controls.setActiveFilter(fn)}
              className={cn(
                'px-2 py-0.5 rounded text-xs transition-all',
                state.activeFunction === fn ? 'ring-1 ring-white font-bold' : 'opacity-60',
                fn === 'all' ? 'bg-slate-600 text-white' :
                fn === 'water' ? 'bg-blue-600 text-white' :
                fn === 'terrain' ? 'bg-green-600 text-white' :
                fn === 'mechanism' ? 'bg-amber-600 text-white' :
                'bg-red-600 text-white'
              )}
            >
              {fn === 'all' ? 'All' : FUNCTION_LABELS[fn as ComponentFunction]}
            </button>
          ))}
        </div>

        {/* Component list */}
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {visibleComponents.map(c => (
            <ComponentRow key={c.id} component={c} onAssemble={handleAssemble} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-amber-700 hover:bg-amber-600" onClick={handleAssembleAll}>
            Assemble All
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.disassembleAll}>
            Disassemble
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
