import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Printer, RotateCcw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLithographicDualProcess } from '@/hooks/useLithographicDualProcess';
import type { ProcessStep, MaterialType, PatternType } from '@/hooks/useLithographicDualProcess';

export interface LithographicDualProcessEvent {
  type: 'STEP_ADVANCE' | 'PIECE_COMPLETE' | 'DEFECT_DETECTED';
  payload: {
    currentStep: ProcessStep;
    stepProgress: number;
    completedPieces: number;
    ts: number;
  };
}

interface LithographicDualProcessEngineProps {
  onEvent?: (event: LithographicDualProcessEvent) => void;
  className?: string;
}

const STEP_LABELS: Record<ProcessStep, string> = {
  idle:              '—  Idle',
  mold_prep:         '1. Mold Preparation',
  pattern_layer:     '2. Pattern Layer Pour',
  cure_pattern:      '3. Cure Pattern',
  material_cast:     '4. Functional Cast',
  cure_functional:   '5. Cure Functional',
  demold:            '6. De-mold',
  complete:          '✓ Complete',
};

const STEP_COLORS: Record<ProcessStep, string> = {
  idle:              '#475569',
  mold_prep:         '#94a3b8',
  pattern_layer:     '#22d3ee',
  cure_pattern:      '#0ea5e9',
  material_cast:     '#f59e0b',
  cure_functional:   '#d97706',
  demold:            '#a78bfa',
  complete:          '#34d399',
};

const MATERIAL_LABELS: Record<MaterialType, string> = {
  resin_standard:  'Standard Resin',
  resin_flexible:  'Flexible Resin',
  resin_rigid:     'Rigid Resin',
  polymer_clear:   'Clear Polymer',
  polymer_tinted:  'Tinted Polymer',
  nylon_sls:       'Nylon SLS',
};

const PATTERN_LABELS: Record<PatternType, string> = {
  hexel_base:       'Hexel Base',
  terrain_surface:  'Terrain Surface',
  channel_lock:     'ChannelLock',
  character_detail: 'Character Detail',
  text_glyph:       'Text Glyph',
};

const MATERIALS: MaterialType[] = ['resin_standard', 'resin_flexible', 'resin_rigid', 'polymer_clear', 'polymer_tinted', 'nylon_sls'];
const PATTERNS: PatternType[] = ['hexel_base', 'terrain_surface', 'channel_lock', 'character_detail', 'text_glyph'];

const STEP_ORDER: ProcessStep[] = [
  'idle', 'mold_prep', 'pattern_layer', 'cure_pattern',
  'material_cast', 'cure_functional', 'demold', 'complete',
];

function ProcessPipeline({ currentStep }: { currentStep: ProcessStep }) {
  const activeIdx = STEP_ORDER.indexOf(currentStep);
  const displaySteps = STEP_ORDER.filter(s => s !== 'idle');

  return (
    <svg width={195} height={50} className="mx-auto">
      {displaySteps.map((step, i) => {
        const x = 12 + i * 26;
        const stepIdx = STEP_ORDER.indexOf(step);
        const isPast = stepIdx < activeIdx;
        const isActive = step === currentStep;
        const color = STEP_COLORS[step];

        return (
          <g key={step}>
            {/* Connector */}
            {i > 0 && (
              <line
                x1={x - 13}
                y1={25}
                x2={x - 1}
                y2={25}
                stroke={isPast || isActive ? '#475569' : '#1e293b'}
                strokeWidth={2}
              />
            )}
            {/* Step circle */}
            <circle
              cx={x}
              cy={25}
              r={10}
              fill={isActive ? color : isPast ? '#1e3a5f' : '#0f172a'}
              stroke={isPast || isActive ? color : '#334155'}
              strokeWidth={1.5}
            />
            {isPast && <text x={x} y={29} textAnchor="middle" fill={color} fontSize={9}>✓</text>}
            {isActive && <circle cx={x} cy={25} r={5} fill={color} opacity={0.9} />}
            {/* Step number */}
            {!isPast && !isActive && (
              <text x={x} y={29} textAnchor="middle" fill="#475569" fontSize={8}>{i + 1}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export const LithographicDualProcessEngine: React.FC<LithographicDualProcessEngineProps> = ({
  onEvent,
  className,
}) => {
  const { state, controls } = useLithographicDualProcess();

  const handleAdvance = () => {
    controls.advanceStep();
    if (onEvent) {
      const isComplete = state.currentStep === 'demold';
      onEvent({
        type: isComplete ? 'PIECE_COMPLETE' : 'STEP_ADVANCE',
        payload: {
          currentStep: state.currentStep,
          stepProgress: state.stepProgress,
          completedPieces: state.completedPieces,
          ts: Date.now(),
        },
      });
    }
  };

  const stepColor = STEP_COLORS[state.currentStep];

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-violet-400">Lithographic Dual-Process</CardTitle>
          </div>
          <Badge variant="outline" className="border-violet-500 text-violet-400">STUB-005</Badge>
        </div>
        <CardDescription className="text-slate-400">
          Step 1: Pattern layer · Step 2: Functional cast · Different materials each step
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Process pipeline */}
        <div className="bg-slate-800 rounded-lg p-3">
          <ProcessPipeline currentStep={state.currentStep} />
          <div className="text-center mt-2">
            <span className="text-sm font-semibold" style={{ color: stepColor }}>
              {STEP_LABELS[state.currentStep]}
            </span>
          </div>
        </div>

        {/* Step progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Process Progress</span>
            <span>{(state.stepProgress * 100).toFixed(0)}%</span>
          </div>
          <Progress value={state.stepProgress * 100} className="h-2 bg-slate-700" />
        </div>

        {/* Material selectors */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-cyan-400 font-semibold mb-1">Pattern Material</div>
            <select
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs"
              value={state.selectedPatternMaterial}
              onChange={e => controls.setPatternMaterial(e.target.value as MaterialType)}
            >
              {MATERIALS.map(m => (
                <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-amber-400 font-semibold mb-1">Functional Material</div>
            <select
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs"
              value={state.selectedFunctionalMaterial}
              onChange={e => controls.setFunctionalMaterial(e.target.value as MaterialType)}
            >
              {MATERIALS.map(m => (
                <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pattern selector */}
        <div className="text-xs">
          <div className="text-slate-400 mb-1">Pattern Type</div>
          <div className="flex flex-wrap gap-1">
            {PATTERNS.map(p => (
              <button
                key={p}
                className={cn(
                  'px-2 py-0.5 rounded border text-xs transition-all',
                  state.selectedPattern === p
                    ? 'bg-violet-800 border-violet-500 text-violet-200'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                )}
                onClick={() => controls.setPattern(p)}
              >
                {PATTERN_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Layer details */}
        {(state.patternLayer || state.functionalLayer) && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {state.patternLayer && (
              <div className="bg-slate-800 rounded p-2">
                <div className="text-cyan-400 font-semibold mb-1">Pattern Layer</div>
                <div className="text-slate-300">{MATERIAL_LABELS[state.patternLayer.material]}</div>
                <div className="text-slate-400">{state.patternLayer.thicknessMm}mm thick</div>
                <div className="text-slate-400">Q: {state.patternLayer.qualityScore}%</div>
                {state.patternLayer.isComplete && <div className="text-green-400">✓ Cured</div>}
              </div>
            )}
            {state.functionalLayer && (
              <div className="bg-slate-800 rounded p-2">
                <div className="text-amber-400 font-semibold mb-1">Functional Layer</div>
                <div className="text-slate-300">{MATERIAL_LABELS[state.functionalLayer.material]}</div>
                <div className="text-slate-400">{state.functionalLayer.thicknessMm}mm thick</div>
                <div className="text-slate-400">Q: {state.functionalLayer.qualityScore}%</div>
                {state.functionalLayer.isComplete && <div className="text-green-400">✓ Cured</div>}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Completed</div>
            <div className="font-bold text-green-400">{state.completedPieces}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Defects</div>
            <div className="font-bold text-red-400">{state.defectCount}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Mold Temp</div>
            <div className="font-bold text-amber-300">{state.moldTemperatureC}°C</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.currentStep === 'idle' || state.currentStep === 'complete' ? (
            <Button
              size="sm"
              className="flex-1 bg-violet-800 hover:bg-violet-700"
              onClick={state.currentStep === 'complete' ? controls.reset : controls.startProcess}
            >
              {state.currentStep === 'complete' ? (
                <><CheckCircle2 className="h-4 w-4 mr-1 text-green-400" /> New Piece</>
              ) : (
                <><Printer className="h-4 w-4 mr-1" /> Start Process</>
              )}
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-violet-800 hover:bg-violet-700" onClick={handleAdvance}>
              <ChevronRight className="h-4 w-4 mr-1" /> Next Step
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500">
          Total process time: {state.totalProcessTimeMinutes}min · Success rate: {(state.successRate * 100).toFixed(0)}%
        </div>
      </CardContent>
    </Card>
  );
};
