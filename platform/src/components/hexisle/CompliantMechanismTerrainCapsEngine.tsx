import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mountain, RotateCcw, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompliantMechanismTerrainCaps } from '@/hooks/useCompliantMechanismTerrainCaps';
import type { TerrainCap, TerrainType } from '@/hooks/useCompliantMechanismTerrainCaps';

export interface CompliantMechanismTerrainCapsEvent {
  type: 'SNAP_SUCCESS' | 'SNAP_FAIL' | 'CAP_LOCKED';
  payload: {
    capId: string;
    terrain: TerrainType;
    snapStrengthN: number;
    ts: number;
  };
}

interface CompliantMechanismTerrainCapsEngineProps {
  onEvent?: (event: CompliantMechanismTerrainCapsEvent) => void;
  className?: string;
}

const TERRAIN_ICONS: Record<TerrainType, string> = {
  water:    '🌊',
  land:     '🟫',
  forest:   '🌲',
  mountain: '⛰️',
  desert:   '🏜️',
  swamp:    '🌿',
};

const TERRAIN_COLORS: Record<TerrainType, string> = {
  water:    '#0ea5e9',
  land:     '#92400e',
  forest:   '#16a34a',
  mountain: '#6b7280',
  desert:   '#d97706',
  swamp:    '#4d7c0f',
};

const SNAP_COLORS = {
  unsnapped: 'bg-slate-700 border-slate-600',
  flexing:   'bg-amber-900 border-amber-500',
  snapped:   'bg-green-900 border-green-500',
  locked:    'bg-blue-900 border-blue-500',
};

function HexCapVisual({ cap }: { cap: TerrainCap }) {
  const color = TERRAIN_COLORS[cap.terrain];
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 30) * (Math.PI / 180);
    const r = 22 - (cap.flexAngleDeg * 0.5);
    return `${30 + r * Math.cos(angle)},${30 + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <svg width={60} height={60} className="mx-auto">
      <polygon points={hexPoints} fill={color} opacity={0.75} stroke={color} strokeWidth={2} />
      {cap.snapState === 'snapped' || cap.snapState === 'locked' ? (
        <circle cx={30} cy={30} r={6} fill="white" opacity={0.9} />
      ) : (
        <circle cx={30} cy={30} r={6} fill="none" stroke="white" strokeWidth={1.5} strokeDasharray="2 2" />
      )}
      {cap.snapState === 'locked' && (
        <text x={30} y={34} textAnchor="middle" fontSize={8} fill="#60a5fa">🔒</text>
      )}
    </svg>
  );
}

const ADDABLE_TERRAINS: TerrainType[] = ['water', 'land', 'forest', 'mountain', 'desert', 'swamp'];

export const CompliantMechanismTerrainCapsEngine: React.FC<CompliantMechanismTerrainCapsEngineProps> = ({
  onEvent,
  className,
}) => {
  const { state, controls } = useCompliantMechanismTerrainCaps();

  const handleSnap = (id: string) => {
    const cap = state.caps.find(c => c.id === id);
    controls.snapCap(id);
    if (onEvent && cap) {
      const success = cap.isCompatible;
      onEvent({
        type: success ? 'SNAP_SUCCESS' : 'SNAP_FAIL',
        payload: { capId: id, terrain: cap.terrain, snapStrengthN: cap.snapStrengthN, ts: Date.now() },
      });
    }
  };

  const handleLockAll = () => {
    controls.lockAll();
    if (onEvent) {
      state.caps.filter(c => c.snapState === 'snapped').forEach(cap => {
        onEvent({ type: 'CAP_LOCKED', payload: { capId: cap.id, terrain: cap.terrain, snapStrengthN: cap.snapStrengthN, ts: Date.now() } });
      });
    }
  };

  return (
    <Card className={cn('bg-slate-900 border-slate-700 text-white', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-slate-400" />
            <CardTitle className="text-slate-300">Compliant Mechanism Terrain Caps</CardTitle>
          </div>
          <Badge variant="outline" className="border-slate-500 text-slate-400">STUB-002</Badge>
        </div>
        <CardDescription className="text-slate-400">
          Flexible snap-on terrain covers · Compliant mechanism flexes over irregular terrain
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Active terrain selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Active Terrain:</span>
          <Button size="sm" variant="outline" className="border-slate-600 text-xs h-7 px-2" onClick={controls.cycleTerrain}>
            {TERRAIN_ICONS[state.activeTerrain]} {state.activeTerrain}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-600 text-xs h-7 px-2 ml-auto"
            onClick={() => controls.addCap(state.activeTerrain)}
          >
            + Add Cap
          </Button>
        </div>

        {/* Cap grid */}
        <div className="grid grid-cols-2 gap-3">
          {state.caps.map((cap: TerrainCap) => (
            <div
              key={cap.id}
              className={cn('rounded-lg border p-3 cursor-pointer transition-all', SNAP_COLORS[cap.snapState])}
              onClick={() => controls.selectCap(cap.id)}
            >
              <HexCapVisual cap={cap} />
              <div className="text-center mt-1">
                <div className="text-xs font-semibold" style={{ color: TERRAIN_COLORS[cap.terrain] }}>
                  {TERRAIN_ICONS[cap.terrain]} {cap.terrain}
                </div>
                <div className="text-xs text-slate-400">
                  flex {cap.flexAngleDeg}° · {cap.snapStrengthN}N
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{cap.irregularityMm}mm irregularity</div>
              </div>
              <div className="flex gap-1 mt-2">
                {cap.snapState === 'unsnapped' && (
                  <Button size="sm" className="flex-1 h-6 text-xs bg-green-800 hover:bg-green-700 px-1" onClick={(e) => { e.stopPropagation(); handleSnap(cap.id); }}>
                    Snap
                  </Button>
                )}
                {(cap.snapState === 'snapped' || cap.snapState === 'flexing') && (
                  <Button size="sm" variant="outline" className="flex-1 h-6 text-xs border-slate-600 px-1" onClick={(e) => { e.stopPropagation(); controls.unsnap(cap.id); }}>
                    <Unlock className="h-3 w-3 mr-1" /> Unsnap
                  </Button>
                )}
                {cap.snapState === 'locked' && (
                  <span className="flex-1 text-center text-xs text-blue-400 flex items-center justify-center gap-1">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Snapped</div>
            <div className="font-bold text-green-400">{state.snapSuccessCount}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Hexels Equipped</div>
            <div className="font-bold text-cyan-400">{state.totalHexelsEquipped}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Flex Cycles</div>
            <div className="font-bold text-amber-400">{state.flexCycleCount}</div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-blue-800 hover:bg-blue-700" onClick={handleLockAll}>
            <Lock className="h-4 w-4 mr-1" /> Lock All Snapped
          </Button>
          <Button size="sm" variant="outline" className="border-slate-600" onClick={controls.reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
