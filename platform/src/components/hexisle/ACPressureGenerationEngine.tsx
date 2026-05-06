import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, RotateCcw, Play, Pause, Crown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useACPressureGeneration } from '@/hooks/useACPressureGeneration';
import type { ACPressureState } from '@/hooks/useACPressureGeneration';

export interface ACPressureGenerationEvent {
  type: 'PHASE_CHANGE' | 'PRESSURE_PEAK' | 'CYCLE_COMPLETE';
  payload: {
    phase: ACPressureState['phase'];
    peakPressure: number;
    acAmplitude: number;
    gameTurn: number;
    ts: number;
  };
}

interface ACPressureGenerationEngineProps {
  onEvent?: (event: ACPressureGenerationEvent) => void;
  initialTickMs?: number;
  className?: string;
}

function GoldenLotusAC({
  angleA,
  angleB,
  pressureA,
  pressureB,
}: {
  angleA: number;
  angleB: number;
  pressureA: number;
  pressureB: number;
}) {
  const cx = 90;
  const cy = 80;
  const r = 36;

  const renderChamber = (cx: number, cy: number, angle: number, pressure: number, label: string, color: string) => {
    const petals = Array.from({ length: 6 }, (_, i) => {
      const a = ((angle + i * 60) * Math.PI) / 180;
      const px = cx + 18 * Math.cos(a);
      const py = cy + 18 * Math.sin(a);
      return (
        <ellipse
          key={i}
          cx={px}
          cy={py}
          rx={8}
          ry={4}
          transform={`rotate(${angle + i * 60}, ${px}, ${py})`}
          fill={color}
          opacity={0.7 + Math.abs(pressure) * 0.3}
        />
      );
    });
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill="#1e293b" stroke={color} strokeWidth={2} opacity={0.8} />
        {petals}
        <circle cx={cx} cy={cy} r={7} fill={color} />
        <text x={cx} y={cy + r + 14} textAnchor="middle" fill="#94a3b8" fontSize={10}>{label}</text>
        <text x={cx} y={cy - r - 6} textAnchor="middle" fill={color} fontSize={9} fontWeight="bold">
          {pressure > 0 ? '▲' : pressure < 0 ? '▼' : '–'} {Math.abs(pressure).toFixed(2)} bar
        </text>
      </g>
    );
  };

  // AC wave curve
  const wavePoints = Array.from({ length: 40 }, (_, i) => {
    const x = 10 + i * 4.5;
    const t = (i / 40) * 2 * Math.PI;
    const yA = 55 - pressureA * 30 * Math.sin(t);
    return `${x},${yA}`;
  }).join(' ');

  const waveBPoints = Array.from({ length: 40 }, (_, i) => {
    const x = 10 + i * 4.5;
    const t = (i / 40) * 2 * Math.PI + Math.PI;
    const yB = 55 - pressureB * 30 * Math.sin(t);
    return `${x},${yB}`;
  }).join(' ');

  return (
    <svg width={190} height={170} className="mx-auto">
      {/* Chamber A (left) */}
      {renderChamber(52, 80, angleA, pressureA, 'Chamber A', '#22d3ee')}
      {/* Chamber B (right) — 180° out of phase */}
      {renderChamber(138, 80, angleB, pressureB, 'Chamber B', '#f59e0b')}
      {/* Coupling arrow */}
      <path d="M 88 80 L 102 80" stroke="#a78bfa" strokeWidth={2} markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 Z" fill="#a78bfa" />
        </marker>
      </defs>
      {/* AC wave at bottom */}
      <polyline points={wavePoints} fill="none" stroke="#22d3ee" strokeWidth={1.5} opacity={0.7} />
      <polyline points={waveBPoints} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.7} />
      <line x1="10" y1="55" x2="190" y2="55" stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
      <text x={10} y={150} fill="#94a3b8" fontSize={9}>AC Wave (Push/Pull)</text>
    </svg>
  );
}

export const ACPressureGenerationEngine: React.FC<ACPressureGenerationEngineProps> = ({
  onEvent,
  initialTickMs = 700,
  className,
}) => {
  const { state, controls } = useACPressureGeneration(initialTickMs);

  const handleTick = () => {
    controls.tick();
    if (onEvent) {
      onEvent({
        type: state.acAmplitude > 0.8 ? 'PRESSURE_PEAK' : 'PHASE_CHANGE',
        payload: {
          phase: state.phase,
          peakPressure: state.peakPressure,
          acAmplitude: state.acAmplitude,
          gameTurn: state.gameTurn,
          ts: Date.now(),
        },
      });
    }
  };

  const phaseColors: Record<ACPressureState['phase'], string> = {
    push_A:    'bg-cyan-500',
    neutral:   'bg-slate-500',
    push_B:    'bg-amber-500',
    neutral_B: 'bg-slate-600',
  };

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <CardTitle className="text-yellow-400">AC Pressure Generation</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-yellow-500 text-yellow-400 flex items-center gap-1">
              <Crown className="h-3 w-3" /> Crown Jewel
            </Badge>
            <Badge variant="outline" className="border-amber-500 text-amber-400">MISS-006</Badge>
          </div>
        </div>
        <CardDescription className="text-slate-400">
          Paired Golden Lotus chambers 180° out of phase · AC pressure without pumps
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="bg-slate-800 rounded-lg p-3">
          <GoldenLotusAC
            angleA={state.chamberA.angle}
            angleB={state.chamberB.angle}
            pressureA={state.chamberA.pressure}
            pressureB={state.chamberB.pressure}
          />
        </div>

        {/* Phase indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-3 w-3 rounded-full', phaseColors[state.phase])} />
            <span className="text-sm font-semibold capitalize">{state.phase.replace('_', ' ')}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Game Turn</div>
            <div className="text-2xl font-bold text-yellow-400">{state.gameTurn}</div>
          </div>
        </div>

        {/* AC amplitude bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>AC Wave Amplitude</span>
            <span>{(state.acAmplitude * 100).toFixed(1)}%</span>
          </div>
          <Progress value={state.acAmplitude * 100} className="h-2 bg-slate-700" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Peak Pressure</div>
            <div className="font-bold text-cyan-300">{state.peakPressure} PSI</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Frequency</div>
            <div className="font-bold text-amber-300">{state.waveFrequency} Hz</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Cycle Step</div>
            <div className="font-bold text-yellow-300">{state.cycleStep + 1}/12</div>
          </div>
        </div>

        {/* Chamber pressures */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-cyan-400 font-semibold mb-1">Chamber A</div>
            <div className="text-slate-300">Pressure: {state.chamberA.pressure.toFixed(3)}</div>
            <div className="text-slate-300">Flow: {(state.chamberA.flowRate * 100).toFixed(0)}%</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-amber-400 font-semibold mb-1">Chamber B</div>
            <div className="text-slate-300">Pressure: {state.chamberB.pressure.toFixed(3)}</div>
            <div className="text-slate-300">Flow: {(state.chamberB.flowRate * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-yellow-700 hover:bg-yellow-600" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> Generate AC
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
