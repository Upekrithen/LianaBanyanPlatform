import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, RotateCcw, Play, Pause, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContinuousFluidLoop } from '@/hooks/useContinuousFluidLoop';
import type { FluidSegmentState } from '@/hooks/useContinuousFluidLoop';

export interface ContinuousFluidLoopEvent {
  type: 'LOOP_TICK' | 'LOOP_COMPLETE' | 'BOTTLENECK_DETECTED';
  payload: {
    loopFlowRate: number;
    lotusPhaseAngle: number;
    sawtoothPosition: number;
    totalLoopCompletions: number;
    ts: number;
  };
}

interface ContinuousFluidLoopEngineProps {
  onEvent?: (event: ContinuousFluidLoopEvent) => void;
  initialTickMs?: number;
  className?: string;
}

const SEGMENT_COLORS: Record<string, string> = {
  reservoir:    '#0ea5e9',
  descent:      '#22d3ee',
  sawtooth:     '#f59e0b',
  golden_lotus: '#fbbf24',
  ascent:       '#a78bfa',
};

function LoopDiagram({
  segments,
  lotusAngle,
  sawtoothPos,
}: {
  segments: FluidSegmentState[];
  lotusAngle: number;
  sawtoothPos: number;
}) {
  const cx = 90;
  const cy = 85;
  const r = 55;
  const segmentCount = segments.length;

  return (
    <svg width={180} height={175} className="mx-auto">
      {/* Loop ring base */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth={8} />

      {/* Colored segments around ring */}
      {segments.map((seg, i) => {
        const startAngle = (i / segmentCount) * 2 * Math.PI - Math.PI / 2;
        const endAngle = ((i + 1) / segmentCount) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const color = SEGMENT_COLORS[seg.segment] ?? '#94a3b8';
        const strokeW = seg.isBottleneck ? 4 : 8;

        return (
          <path
            key={seg.segment}
            d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            opacity={seg.flowRateL > 0 ? 0.85 : 0.3}
          />
        );
      })}

      {/* Golden Lotus center rotor */}
      <g transform={`rotate(${lotusAngle}, ${cx}, ${cy})`}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60) * (Math.PI / 180);
          const px = cx + 16 * Math.cos(a);
          const py = cy + 16 * Math.sin(a);
          return <ellipse key={i} cx={px} cy={py} rx={7} ry={3.5} transform={`rotate(${i * 60}, ${px}, ${py})`} fill="#fbbf24" opacity={0.9} />;
        })}
        <circle cx={cx} cy={cy} r={6} fill="#f59e0b" />
      </g>

      {/* Sawtooth indicator */}
      <text x={cx} y={cy + r + 22} textAnchor="middle" fill="#94a3b8" fontSize={10}>
        Sawtooth: {sawtoothPos}/60
      </text>

      {/* Flow direction arrows */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = ((i * 72 + lotusAngle * 0.3) * Math.PI) / 180;
        const ax = cx + (r + 14) * Math.cos(angle);
        const ay = cy + (r + 14) * Math.sin(angle);
        return (
          <text key={i} x={ax} y={ay} textAnchor="middle" fill="#64748b" fontSize={9}>›</text>
        );
      })}
    </svg>
  );
}

export const ContinuousFluidLoopEngine: React.FC<ContinuousFluidLoopEngineProps> = ({
  onEvent,
  initialTickMs = 650,
  className,
}) => {
  const { state, controls } = useContinuousFluidLoop(initialTickMs);

  const handleTick = () => {
    controls.tick();
    if (onEvent) {
      const bottleneck = state.segments.some(s => s.isBottleneck);
      onEvent({
        type: bottleneck ? 'BOTTLENECK_DETECTED' : 'LOOP_TICK',
        payload: {
          loopFlowRate: state.loopFlowRate,
          lotusPhaseAngle: state.lotusPhaseAngle,
          sawtoothPosition: state.sawtoothPosition,
          totalLoopCompletions: state.totalLoopCompletions,
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
            <RefreshCw className="h-5 w-5 text-emerald-400" />
            <CardTitle className="text-emerald-400">Continuous Fluid Loop</CardTitle>
          </div>
          <Badge variant="outline" className="border-emerald-500 text-emerald-400">MISS-011</Badge>
        </div>
        <CardDescription className="text-slate-400">
          No external pumps · Height differential + Sawtooth60 + Golden Lotus timing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="bg-slate-800 rounded-lg p-3">
          <LoopDiagram
            segments={state.segments}
            lotusAngle={state.lotusPhaseAngle}
            sawtoothPos={state.sawtoothPosition}
          />
        </div>

        {/* Segment flow bars */}
        <div className="space-y-1.5">
          {state.segments.map((seg: FluidSegmentState) => (
            <div key={seg.segment} className="space-y-0.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: SEGMENT_COLORS[seg.segment] }}>{seg.label}</span>
                <span className={cn('', seg.isBottleneck ? 'text-red-400' : 'text-slate-400')}>
                  {seg.isBottleneck ? '⚠ bottleneck' : ''} {seg.flowRateL.toFixed(3)} L/min
                </span>
              </div>
              <Progress
                value={Math.min(100, (seg.flowRateL / Math.max(state.loopFlowRate, 0.001)) * 100)}
                className="h-1.5 bg-slate-700"
              />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Loop Flow</div>
            <div className="font-bold text-emerald-300">{state.loopFlowRate.toFixed(3)} L/m</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Completions</div>
            <div className="font-bold text-cyan-300">{state.totalLoopCompletions}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Efficiency</div>
            <div className="font-bold text-amber-300">{(state.efficiency * 100).toFixed(0)}%</div>
          </div>
        </div>

        <div className="bg-slate-800 rounded p-2 text-xs text-center">
          <span className="text-slate-400">Head: </span>
          <span className="font-bold text-blue-300">{state.heightDifferentialCm.toFixed(0)} cm</span>
          <span className="text-slate-500 mx-2">·</span>
          <span className="text-slate-400">Game Turn: </span>
          <span className="font-bold text-amber-300">{state.gameTurn}</span>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-emerald-800 hover:bg-emerald-700" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> Start Loop
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
