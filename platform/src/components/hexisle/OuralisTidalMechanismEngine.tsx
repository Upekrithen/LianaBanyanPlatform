import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Waves, RotateCcw, Play, Pause, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOuralisTidalMechanism } from '@/hooks/useOuralisTidalMechanism';
import type { TidalState } from '@/hooks/useOuralisTidalMechanism';

// Pheromone-style event shape
export interface OuralisTidalEvent {
  type: 'TIDE_TICK' | 'TURN_COMPLETE' | 'PHASE_CHANGE';
  payload: {
    rotation: number;
    gameTurn: number;
    phase: TidalState['phase'];
    lotusAngle: number;
    ts: number;
  };
}

interface OuralisTidalMechanismEngineProps {
  onEvent?: (event: OuralisTidalEvent) => void;
  initialTickMs?: number;
  className?: string;
}

const PHASE_COLORS: Record<TidalState['phase'], string> = {
  flow:  'bg-blue-500',
  peak:  'bg-cyan-400',
  ebb:   'bg-indigo-500',
  slack: 'bg-slate-500',
};

const PHASE_LABELS: Record<TidalState['phase'], string> = {
  flow:  'Incoming Tide',
  peak:  'High Water',
  ebb:   'Outgoing Tide',
  slack: 'Slack Water',
};

function GoldenLotusRotor({ lotusAngle, rotation }: { lotusAngle: number; rotation: number }) {
  const cx = 80;
  const cy = 80;
  const r = 60;

  return (
    <svg width={160} height={160} className="mx-auto">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke="#d97706" strokeWidth={2} strokeDasharray="4 4" />

      {/* 12 chamber segments */}
      {Array.from({ length: 12 }, (_, i) => {
        const startAngle = (i * 30 - 90) * (Math.PI / 180);
        const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const isFilled = i <= rotation;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
            fill={isFilled ? '#0ea5e9' : '#1e293b'}
            stroke="#d97706"
            strokeWidth={1}
            opacity={isFilled ? 0.85 : 0.4}
          />
        );
      })}

      {/* Golden Lotus petals — rotates */}
      <g transform={`rotate(${lotusAngle}, ${cx}, ${cy})`}>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const petalX = cx + 28 * Math.cos(angle);
          const petalY = cy + 28 * Math.sin(angle);
          return (
            <ellipse
              key={i}
              cx={petalX}
              cy={petalY}
              rx={10}
              ry={5}
              transform={`rotate(${i * 45}, ${petalX}, ${petalY})`}
              fill="#fbbf24"
              opacity={0.9}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={8} fill="#f59e0b" />
      </g>

      {/* Rotation label */}
      <text x={cx} y={cy + r + 22} textAnchor="middle" fill="#94a3b8" fontSize={11}>
        Chamber {rotation + 1}/12
      </text>
    </svg>
  );
}

export const OuralisTidalMechanismEngine: React.FC<OuralisTidalMechanismEngineProps> = ({
  onEvent,
  initialTickMs = 800,
  className,
}) => {
  const { state, controls } = useOuralisTidalMechanism(initialTickMs);

  const handleTick = () => {
    controls.tick();
    if (onEvent) {
      onEvent({
        type: state.rotation === 11 ? 'TURN_COMPLETE' : 'TIDE_TICK',
        payload: {
          rotation: (state.rotation + 1) % 12,
          gameTurn: state.rotation === 11 ? state.gameTurn + 1 : state.gameTurn,
          phase: state.phase,
          lotusAngle: (state.lotusAngle + 30) % 360,
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
            <Waves className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-cyan-400">Ouralis Tidal Mechanism</CardTitle>
          </div>
          <Badge variant="outline" className="border-amber-500 text-amber-400">MISS-002</Badge>
        </div>
        <CardDescription className="text-slate-400">
          12-rotation tide cycle = one game turn · Golden Lotus rotor marks game clock
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Visual rotor */}
        <div className="bg-slate-800 rounded-lg p-4">
          <GoldenLotusRotor lotusAngle={state.lotusAngle} rotation={state.rotation} />
        </div>

        {/* Phase badge + game turn */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-3 w-3 rounded-full', PHASE_COLORS[state.phase])} />
            <span className="text-sm font-semibold">{PHASE_LABELS[state.phase]}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Game Turn</div>
            <div className="text-2xl font-bold text-amber-400">{state.gameTurn}</div>
          </div>
        </div>

        {/* Tide progress within turn */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Tide Cycle Progress</span>
            <span>{state.rotation + 1} / 12 rotations</span>
          </div>
          <Progress value={((state.rotation + 1) / 12) * 100} className="h-2 bg-slate-700" />
        </div>

        {/* Chamber grid */}
        <div className="grid grid-cols-12 gap-0.5">
          {state.chambers.map(ch => (
            <div
              key={ch.index}
              className={cn(
                'h-5 rounded-sm transition-all duration-300',
                ch.index === state.rotation
                  ? 'bg-amber-400 scale-y-110'
                  : ch.filled
                    ? 'bg-blue-500 opacity-80'
                    : 'bg-slate-700 opacity-40'
              )}
              title={`Chamber ${ch.index + 1} — flow: ${(ch.flowRate * 100).toFixed(0)}%`}
            />
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Lotus Angle</div>
            <div className="font-bold text-amber-300">{state.lotusAngle}°</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Total Rotations</div>
            <div className="font-bold text-blue-300">{state.totalRotations}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Flow Rate</div>
            <div className="font-bold text-cyan-300">
              {(state.chambers[state.rotation]?.flowRate * 100 ?? 0).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-cyan-700 hover:bg-cyan-600" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> Run Tide
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
