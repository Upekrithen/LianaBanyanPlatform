import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Anchor, Wind, Navigation } from 'lucide-react';
import { useRudderKeelShipMechanics, RudderKeelMechanicsConfig } from '@/hooks/useRudderKeelShipMechanics';

// MISS-003 — Rudder Keel Ship Mechanics Engine
// Visual simulation: ship + rudder angle controls.
// Sawtooth60 current exerts lateral force proportional to keel depth;
// rudder angle determines turning radius.

export interface RudderKeelShipMechanicsEngineProps {
  config?: Partial<RudderKeelMechanicsConfig>;
  className?: string;
}

const CANVAS_W = 360;
const CANVAS_H = 240;
const SCALE = 30; // pixels per meter

function ShipCanvas({ x, y, heading, rudderAngle, keelDepth, lateralDrift }: {
  x: number; y: number; heading: number;
  rudderAngle: number; keelDepth: number; lateralDrift: number;
}) {
  const cx = CANVAS_W / 2 + (x % 6) * SCALE;
  const cy = CANVAS_H / 2 - (y % 4) * SCALE;
  const headRad = (heading - 90) * (Math.PI / 180);
  const hullLen = 28;
  const hullW = 10;

  // Hull corners (bow-forward rectangle rotated by heading)
  const cos = Math.cos(headRad);
  const sin = Math.sin(headRad);
  const bow  = [cx + cos * (hullLen / 2), cy + sin * (hullLen / 2)];
  const stern = [cx - cos * (hullLen / 2), cy - sin * (hullLen / 2)];

  // Rudder tip (angled from stern)
  const rudRad = headRad + rudderAngle * (Math.PI / 180);
  const rudLen = 10;
  const rudTip = [
    stern[0] - Math.cos(rudRad) * rudLen,
    stern[1] - Math.sin(rudRad) * rudLen,
  ];

  // Keel line (perpendicular under hull, depth shown as opacity)
  const keelOp = keelDepth / 36;

  // Drift arrow
  const driftAngle = heading * (Math.PI / 180) + Math.PI / 2;
  const driftLen = Math.min(40, Math.abs(lateralDrift) * 30);
  const driftDir = lateralDrift >= 0 ? 1 : -1;

  return (
    <svg width={CANVAS_W} height={CANVAS_H} className="rounded-lg bg-blue-950/80 border border-blue-700">
      {/* Current arrows */}
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 4 }).map((__, j) => {
          const ax = 36 + i * 72;
          const ay = 30 + j * 60;
          return (
            <g key={`${i}-${j}`} transform={`translate(${ax},${ay}) rotate(90)`}>
              <line x1={0} y1={-12} x2={0} y2={12} stroke="#38bdf8" strokeWidth={1} strokeOpacity={0.3} markerEnd="url(#arr)" />
            </g>
          );
        })
      )}
      <defs>
        <marker id="arr" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
          <path d="M0,0 L0,4 L4,2 z" fill="#38bdf8" opacity={0.4} />
        </marker>
        <marker id="drift-arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#fbbf24" />
        </marker>
      </defs>

      {/* Keel (depth bar under ship) */}
      <rect
        x={cx - 2}
        y={cy - hullLen / 2}
        width={4}
        height={hullLen}
        fill="#7c3aed"
        opacity={keelOp * 0.7}
        transform={`rotate(${heading}, ${cx}, ${cy})`}
      />

      {/* Hull */}
      <ellipse
        cx={cx} cy={cy}
        rx={hullLen / 2} ry={hullW / 2}
        fill="#1e40af"
        stroke="#60a5fa"
        strokeWidth={1.5}
        transform={`rotate(${heading}, ${cx}, ${cy})`}
      />
      {/* Bow marker */}
      <circle cx={bow[0]} cy={bow[1]} r={3} fill="#93c5fd" />

      {/* Rudder */}
      <line
        x1={stern[0]} y1={stern[1]}
        x2={rudTip[0]} y2={rudTip[1]}
        stroke="#f87171" strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Lateral drift arrow */}
      {Math.abs(lateralDrift) > 0.01 && (
        <line
          x1={cx} y1={cy}
          x2={cx + Math.cos(driftAngle) * driftLen * driftDir}
          y2={cy + Math.sin(driftAngle) * driftLen * driftDir}
          stroke="#fbbf24" strokeWidth={2}
          markerEnd="url(#drift-arr)"
        />
      )}

      {/* Heading label */}
      <text x={6} y={16} fill="#94a3b8" fontSize={10}>HDG {Math.round(heading)}°</text>
      <text x={6} y={28} fill="#94a3b8" fontSize={10}>
        {x.toFixed(1)},{y.toFixed(1)}m
      </text>
    </svg>
  );
}

export const RudderKeelShipMechanicsEngine: React.FC<RudderKeelShipMechanicsEngineProps> = ({
  config,
  className = '',
}) => {
  const {
    ship, isSimulating,
    setRudderAngle, setKeelDepth, setSpeed,
    startSimulation, stopSimulation, resetShip,
  } = useRudderKeelShipMechanics(config);

  return (
    <Card className={`bg-slate-900 border-blue-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-blue-200">
          <Anchor className="w-5 h-5 text-blue-400" />
          MISS-003 — Rudder Keel Ship Mechanics
          <Badge className="ml-auto bg-blue-800 text-blue-100 text-xs">Wave 2 · urUtt</Badge>
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1">
          Sawtooth60 current exerts lateral force proportional to keel depth.
          Rudder angle determines turning radius.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ShipCanvas
          x={ship.x} y={ship.y}
          heading={ship.heading}
          rudderAngle={ship.rudderAngle}
          keelDepth={ship.keelDepth}
          lateralDrift={ship.lateralDrift}
        />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Lateral Drift</div>
            <div className="text-yellow-400 font-mono">{ship.lateralDrift.toFixed(3)} m/s</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Turn Radius</div>
            <div className="text-cyan-400 font-mono">
              {Math.abs(ship.turnRadius) > 999 ? '∞' : ship.turnRadius.toFixed(1) + ' m'}
            </div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Heading</div>
            <div className="text-green-400 font-mono">{Math.round(ship.heading)}°</div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Rudder */}
          <div>
            <label className="text-xs text-slate-300 flex items-center gap-1 mb-1">
              <Navigation className="w-3 h-3" />
              Rudder Angle: <span className="text-red-400 font-mono ml-1">{ship.rudderAngle.toFixed(0)}°</span>
            </label>
            <input
              type="range" min={-45} max={45} step={1}
              value={ship.rudderAngle}
              onChange={e => setRudderAngle(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Port -45°</span><span>0°</span><span>Stbd +45°</span>
            </div>
          </div>

          {/* Keel depth */}
          <div>
            <label className="text-xs text-slate-300 flex items-center gap-1 mb-1">
              <Anchor className="w-3 h-3 text-purple-400" />
              Keel Depth: <span className="text-purple-400 font-mono ml-1">{ship.keelDepth.toFixed(0)} mm</span>
            </label>
            <input
              type="range" min={0} max={36} step={1}
              value={ship.keelDepth}
              onChange={e => setKeelDepth(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>Surface 0mm</span><span>Max 36mm</span>
            </div>
          </div>

          {/* Speed */}
          <div>
            <label className="text-xs text-slate-300 flex items-center gap-1 mb-1">
              <Wind className="w-3 h-3 text-green-400" />
              Ship Speed: <span className="text-green-400 font-mono ml-1">{ship.speed.toFixed(2)} m/s</span>
            </label>
            <input
              type="range" min={0} max={5} step={0.1}
              value={ship.speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>
        </div>

        {/* Simulation controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isSimulating ? 'destructive' : 'default'}
            onClick={isSimulating ? stopSimulation : startSimulation}
            className="flex-1"
          >
            {isSimulating ? 'Stop' : 'Simulate'}
          </Button>
          <Button size="sm" variant="outline" onClick={resetShip}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
