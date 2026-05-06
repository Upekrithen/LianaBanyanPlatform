import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUpDown, RotateCcw, Play, Pause, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInverseHydraulicCoupling } from '@/hooks/useInverseHydraulicCoupling';
import type { Piston } from '@/hooks/useInverseHydraulicCoupling';

export interface InverseHydraulicCouplingEvent {
  type: 'PISTON_PUSH' | 'CHAIN_PROPAGATE' | 'CYCLE_COMPLETE';
  payload: {
    activePistonId: string;
    cycleCount: number;
    totalPressureWork: number;
    ts: number;
  };
}

interface InverseHydraulicCouplingEngineProps {
  onEvent?: (event: InverseHydraulicCouplingEvent) => void;
  initialTickMs?: number;
  className?: string;
}

const PISTON_COLORS = ['#22d3ee', '#f59e0b', '#a78bfa', '#34d399', '#fb7185'];

function PistonViz({ piston, color }: { piston: Piston; color: string }) {
  const barH = Math.abs(piston.positionMm) * 2; // max 40px for 20mm
  const isUp = piston.positionMm > 0;

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Label */}
      <div className="text-xs font-bold" style={{ color }}>{piston.label}</div>
      {/* Cylinder */}
      <div className="relative w-8 h-24 bg-slate-700 rounded border border-slate-600 flex flex-col justify-center">
        {/* Piston rod */}
        <div
          className="absolute left-1 right-1 rounded transition-all duration-300"
          style={{
            height: `${barH}px`,
            bottom: isUp ? '50%' : undefined,
            top: isUp ? undefined : '50%',
            background: color,
            opacity: 0.85,
          }}
        />
        {/* Center mark */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-slate-500" />
      </div>
      {/* Position label */}
      <div className="text-xs text-slate-400">
        {piston.positionMm > 0 ? '+' : ''}{piston.positionMm}mm
      </div>
      <div className="text-xs font-semibold" style={{ color }}>
        {piston.direction === 'up' ? '▲' : piston.direction === 'down' ? '▼' : '–'}
      </div>
    </div>
  );
}

export const InverseHydraulicCouplingEngine: React.FC<InverseHydraulicCouplingEngineProps> = ({
  onEvent,
  initialTickMs = 500,
  className,
}) => {
  const { state, controls } = useInverseHydraulicCoupling(initialTickMs);

  const handleTick = () => {
    controls.tick();
    if (onEvent) {
      onEvent({
        type: 'CHAIN_PROPAGATE',
        payload: {
          activePistonId: state.activePistonId,
          cycleCount: state.cycleCount + 1,
          totalPressureWork: state.totalPressureWork,
          ts: Date.now(),
        },
      });
    }
  };

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-violet-400">Inverse Hydraulic Coupling</CardTitle>
          </div>
          <Badge variant="outline" className="border-violet-500 text-violet-400">MISS-001</Badge>
        </div>
        <CardDescription className="text-slate-400">
          Piston A moves → Piston B moves opposite · Daisy chain propagation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Piston visualization */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex justify-around items-end">
            {state.pistons.map((p: Piston, i: number) => (
              <PistonViz key={p.id} piston={p} color={PISTON_COLORS[i]} />
            ))}
          </div>
          {/* Link lines */}
          <div className="flex justify-around mt-1 px-4">
            {state.links.map((l, i) => (
              <div key={i} className="flex items-center gap-0.5 text-xs">
                <span style={{ color: PISTON_COLORS[i] }}>─</span>
                <span className="text-slate-500">⇄</span>
                <span style={{ color: PISTON_COLORS[i + 1] }}>─</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link pressures */}
        <div className="space-y-1">
          <div className="text-xs text-slate-400 mb-1">Link Pressures (bar)</div>
          {state.links.map((l, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 w-16">{l.fromId}→{l.toId}</span>
              <Progress value={(l.linkPressureBar / 1.3) * 100} className="flex-1 h-1.5 bg-slate-700" />
              <span className="text-slate-300 w-12 text-right">{l.linkPressureBar} bar</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Cycle Count</div>
            <div className="font-bold text-violet-300">{state.cycleCount}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Pressure Work</div>
            <div className="font-bold text-cyan-300">{state.totalPressureWork.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Game Turn</div>
            <div className="font-bold text-amber-300">{state.gameTurn}</div>
          </div>
        </div>

        {/* Chain depth indicator */}
        <div className="bg-slate-800 rounded p-2 text-xs text-center">
          <span className="text-slate-400">Daisy Chain Depth: </span>
          <span className="font-bold text-violet-300">{state.daisyChainDepth} pistons</span>
          <span className="text-slate-500 ml-2">· Propagation: ~{state.propagationCycleMs}ms</span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-violet-800 hover:bg-violet-700" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> Drive Chain
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-slate-600" onClick={handleTick} disabled={state.isRunning}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
