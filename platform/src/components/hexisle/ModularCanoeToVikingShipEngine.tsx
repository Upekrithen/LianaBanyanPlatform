import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Ship, RotateCcw, Play, Pause, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModularCanoeToVikingShip } from '@/hooks/useModularCanoeToVikingShip';
import type { ShipStage, HullSegment } from '@/hooks/useModularCanoeToVikingShip';

export interface ModularCanoeToVikingShipEvent {
  type: 'SEGMENT_ADDED' | 'STAGE_CHANGE' | 'TIDE_TURN';
  payload: {
    stage: ShipStage;
    segmentCount: number;
    totalSpeed: number;
    totalCargoKg: number;
    ts: number;
  };
}

interface ModularCanoeToVikingShipEngineProps {
  onEvent?: (event: ModularCanoeToVikingShipEvent) => void;
  initialTickMs?: number;
  className?: string;
}

const STAGE_COLORS: Record<ShipStage, string> = {
  canoe:    '#0ea5e9',
  rowboat:  '#22d3ee',
  knarr:    '#34d399',
  longship: '#a78bfa',
  drakkar:  '#fbbf24',
};

const STAGE_LABELS: Record<ShipStage, string> = {
  canoe:    'Canoe',
  rowboat:  'Rowboat',
  knarr:    'Knarr',
  longship: 'Longship',
  drakkar:  'Drakkar',
};

function ShipSVG({ segmentCount, stage }: { segmentCount: number; stage: ShipStage }) {
  const color = STAGE_COLORS[stage];
  const w = 30 + segmentCount * 22;

  // Hull shape
  const hullPoints = `
    ${10},${45}
    ${10 + w},${45}
    ${15 + w},${60}
    ${5},${60}
  `;

  return (
    <svg width={200} height={80} className="mx-auto">
      {/* Water */}
      <rect x={0} y={58} width={200} height={22} fill="#0f172a" rx={3} />
      <path d="M 0 60 Q 25 55 50 60 Q 75 65 100 60 Q 125 55 150 60 Q 175 65 200 60" fill="none" stroke="#0ea5e9" strokeWidth={1} opacity={0.5} />

      {/* Hull */}
      <polygon points={hullPoints} fill={color} opacity={0.85} />

      {/* Segments */}
      {Array.from({ length: segmentCount }, (_, i) => {
        const sx = 12 + i * 22;
        return (
          <g key={i}>
            <rect x={sx} y={32} width={20} height={14} fill={color} opacity={0.6} rx={2} />
            {i === segmentCount - 1 && stage === 'drakkar' && (
              <text x={sx + 10} y={28} textAnchor="middle" fontSize={14}>🐉</text>
            )}
          </g>
        );
      })}

      {/* Mast (for 3+ segments) */}
      {segmentCount >= 3 && (
        <>
          <line x1={10 + w / 2} y1={20} x2={10 + w / 2} y2={46} stroke="#78716c" strokeWidth={2} />
          <polygon
            points={`${10 + w / 2},${22} ${10 + w / 2 + 18},${36} ${10 + w / 2},${36}`}
            fill={color}
            opacity={0.7}
          />
        </>
      )}

      {/* Oars (for 1–2 segments) */}
      {segmentCount < 3 && Array.from({ length: segmentCount }, (_, i) => (
        <line key={i} x1={20 + i * 22} y1={52} x2={20 + i * 22} y2={68} stroke="#92400e" strokeWidth={2} />
      ))}
    </svg>
  );
}

export const ModularCanoeToVikingShipEngine: React.FC<ModularCanoeToVikingShipEngineProps> = ({
  onEvent,
  initialTickMs = 1000,
  className,
}) => {
  const { state, controls } = useModularCanoeToVikingShip(initialTickMs);

  const handleAddSegment = () => {
    const prevCount = state.segmentCount;
    controls.addSegment();
    if (onEvent) {
      onEvent({
        type: 'SEGMENT_ADDED',
        payload: {
          stage: state.stage,
          segmentCount: prevCount + 1,
          totalSpeed: state.totalSpeed,
          totalCargoKg: state.totalCargoKg,
          ts: Date.now(),
        },
      });
    }
  };

  const stageColor = STAGE_COLORS[state.stage];
  const progressPct = ((state.segmentCount - 1) / (state.maxSegments - 1)) * 100;

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-blue-400">Canoe → Viking Ship Transform</CardTitle>
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-400">STUB-004</Badge>
        </div>
        <CardDescription className="text-slate-400">
          Snap hull segments each tide turn · Canoe grows to Drakkar in 4 turns
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Ship visual */}
        <div className="bg-slate-800 rounded-lg p-4">
          <ShipSVG segmentCount={state.segmentCount} stage={state.stage} />
        </div>

        {/* Stage indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: stageColor }} />
            <span className="text-sm font-bold" style={{ color: stageColor }}>{STAGE_LABELS[state.stage]}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Tide Turn</div>
            <div className="text-2xl font-bold text-amber-400">{state.tideTurn}</div>
          </div>
        </div>

        {/* Growth progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Hull Growth</span>
            <span>{state.segmentCount} / {state.maxSegments} segments</span>
          </div>
          <Progress value={progressPct} className="h-2 bg-slate-700" />
        </div>

        {/* Segment list */}
        <div className="space-y-1">
          {state.segments.map((seg: HullSegment) => (
            <div key={seg.id} className="flex items-center justify-between text-xs bg-slate-800 rounded px-2 py-1">
              <span style={{ color: stageColor }}>{seg.name}</span>
              <span className="text-slate-400">+{seg.speedBonus}kt · +{seg.cargoCapacityKg}kg · T{seg.addedOnTurn}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Total Speed</div>
            <div className="font-bold text-blue-300">{state.totalSpeed} kts</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Cargo Cap.</div>
            <div className="font-bold text-amber-300">{state.totalCargoKg}kg</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Segments</div>
            <div className="font-bold" style={{ color: stageColor }}>{state.segmentCount}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {state.isRunning ? (
            <Button size="sm" variant="outline" className="flex-1 border-slate-600" onClick={controls.pause}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          ) : (
            <Button size="sm" className="flex-1 bg-blue-800 hover:bg-blue-700" onClick={controls.start}>
              <Play className="h-4 w-4 mr-1" /> Run Tides
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-slate-600"
            onClick={handleAddSegment}
            disabled={state.segmentCount >= state.maxSegments}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Segment
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
