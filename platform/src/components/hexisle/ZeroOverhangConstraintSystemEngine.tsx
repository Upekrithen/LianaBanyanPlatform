/**
 * ZeroOverhangConstraintSystemEngine
 * =====================================
 * STUB-006 — Zero-Overhang Constraint System
 * Wave 2 / Old One: urIm / Bushel 29 (BP025)
 *
 * Standalone — no dependencies.
 *
 * RootLockSystem embodies the constraint.
 * Surfaces:
 *   - Overhang-angle visualization overlay
 *   - Constraint-violation highlight in 3D view
 *   - POCF (Print Once Connect Forever) compliance analysis
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useZeroOverhangConstraintSystem, type HexelFace, type OverhangAnalysis } from '@/hooks/useZeroOverhangConstraintSystem';
import { AlertTriangle, CheckCircle2, RotateCcw, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ZeroOverhangConstraintSystemEngineProps {
  initialFaces?: HexelFace[];
  className?: string;
}

// ── Severity color helpers ────────────────────────────────────────────────────

function severityColor(a: OverhangAnalysis): string {
  if (!a.isViolation) return '#22c55e';      // green
  if (a.isBorderline) return '#f59e0b';       // amber
  return '#ef4444';                            // red
}

function severityBg(a: OverhangAnalysis): string {
  if (!a.isViolation) return 'bg-green-950 border-green-800';
  if (a.isBorderline) return 'bg-amber-950 border-amber-800';
  return 'bg-red-950 border-red-800';
}

// ── 2D Overhang overlay ───────────────────────────────────────────────────────

const OverhangOverlay: React.FC<{
  analyses: OverhangAnalysis[];
  selected: string | null;
  onSelect: (id: string) => void;
  rotation: number;
  elevation: number;
  pullDirection: 'up' | 'down';
}> = ({ analyses, selected, onSelect, rotation, elevation, pullDirection }) => {
  const cx = 140;
  const cy = 100;
  const r = 60;
  const sides = 6;

  // Build hexagon vertices
  const hexPts = Array.from({ length: sides }, (_, i) => {
    const angleDeg = 60 * i - 30 + rotation;
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  // Side faces (indices 0-5 correspond to side-a through side-f)
  const sideAnalyses = analyses.filter(a =>
    ['side-a','side-b','side-c','side-d','side-e','side-f'].includes(a.faceId)
  );

  return (
    <svg viewBox="0 0 280 200" className="w-full bg-slate-900 rounded-lg">
      {/* Pull direction arrow */}
      <text x="10" y="15" fontSize="8" fill="#94a3b8">MOLD PULL: {pullDirection.toUpperCase()}</text>
      {pullDirection === 'up' ? (
        <polygon points="20,25 24,18 28,25" fill="#60a5fa" />
      ) : (
        <polygon points="20,18 24,25 28,18" fill="#60a5fa" />
      )}

      {/* Elevation indicator */}
      <text x="200" y="15" fontSize="8" fill="#94a3b8">EL: {elevation}°</text>

      {/* Hexagon faces */}
      {hexPts.map((pt, i) => {
        const nextPt = hexPts[(i + 1) % sides];
        const midX = (pt.x + nextPt.x) / 2;
        const midY = (pt.y + nextPt.y) / 2;
        const analysis = sideAnalyses[i];
        if (!analysis) return null;
        const color = severityColor(analysis);
        const isSelected = selected === analysis.faceId;

        return (
          <g key={analysis.faceId} onClick={() => onSelect(analysis.faceId)} style={{ cursor: 'pointer' }}>
            <line
              x1={pt.x} y1={pt.y} x2={nextPt.x} y2={nextPt.y}
              stroke={color}
              strokeWidth={isSelected ? 4 : 2}
              strokeDasharray={analysis.isViolation ? '4,2' : 'none'}
            />
            {/* Angle label */}
            <text x={midX} y={midY - 5} textAnchor="middle" fontSize="7" fill={color}>
              {analysis.angleFromVerticalDeg}°
            </text>
          </g>
        );
      })}

      {/* Top/bottom faces */}
      {(() => {
        const topA = analyses.find(a => a.faceId === 'top');
        const botA = analyses.find(a => a.faceId === 'bottom');
        return (
          <>
            {/* Top circle */}
            <circle cx={cx} cy={cy - 55} r={12}
              fill="none" stroke={topA ? severityColor(topA) : '#22c55e'} strokeWidth={2}
              onClick={() => topA && onSelect(topA.faceId)} style={{ cursor: 'pointer' }} />
            <text x={cx} y={cy - 51} textAnchor="middle" fontSize="6" fill="#94a3b8">TOP</text>

            {/* Bottom circle */}
            <circle cx={cx} cy={cy + 60} r={12}
              fill="none" stroke={botA ? severityColor(botA) : '#22c55e'} strokeWidth={2}
              onClick={() => botA && onSelect(botA.faceId)} style={{ cursor: 'pointer' }} />
            <text x={cx} y={cy + 64} textAnchor="middle" fontSize="6" fill="#94a3b8">BASE</text>
          </>
        );
      })()}

      {/* Hexagon fill */}
      <polygon
        points={hexPts.map(p => `${p.x},${p.y}`).join(' ')}
        fill="#1e293b"
        stroke="none"
        onClick={() => {}}
      />

      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="#64748b" fontWeight="bold">Hexel</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7" fill="#475569">Zero-Overhang</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="6" fill="#334155">Constraint View</text>

      {/* Legend */}
      <g transform="translate(200, 30)">
        {[['#22c55e','Compliant (0°)'],['#f59e0b','Borderline (1-45°)'],['#ef4444','Violation (>45°)']].map(([color, label], i) => (
          <g key={label} transform={`translate(0, ${i * 14})`}>
            <rect x={0} y={0} width={10} height={8} fill={color as string} rx={1} />
            <text x={13} y={7} fontSize="6" fill="#94a3b8">{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// ── Face detail panel ─────────────────────────────────────────────────────────

const FaceDetail: React.FC<{
  analysis: OverhangAnalysis;
  face: HexelFace;
  onAngleChange: (id: string, deg: number) => void;
}> = ({ analysis, face, onAngleChange }) => (
  <div className={`rounded-lg border p-3 space-y-2 ${severityBg(analysis)}`}>
    <div className="flex items-center justify-between">
      <span className="font-medium text-sm">{face.label}</span>
      <Badge
        style={{ backgroundColor: severityColor(analysis) }}
        className="text-white text-xs"
      >
        {analysis.severity.toUpperCase()}
      </Badge>
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-mono">{analysis.angleFromVerticalDeg}° from vertical</span>
      <span>|</span>
      <span>Pull: {face.pullDirection}</span>
    </div>
    <p className="text-xs text-slate-400">{analysis.remediationNote}</p>
    <div className="space-y-1">
      <Slider
        min={0}
        max={90}
        step={1}
        value={[analysis.angleFromVerticalDeg]}
        onValueChange={([v]) => onAngleChange(face.id, v)}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0° (vertical)</span>
        <span>45° (print limit)</span>
        <span>90° (horizontal)</span>
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const ZeroOverhangConstraintSystemEngine: React.FC<ZeroOverhangConstraintSystemEngineProps> = ({
  initialFaces,
  className,
}) => {
  const {
    state,
    setSelectedFaceId,
    setShowViolationsOnly,
    setViewRotationDeg,
    setViewElevationDeg,
    setMoldPullDirection,
    setFaceAngle,
    resetToDefault,
    PRINT_THRESHOLD_DEG,
    MOLD_THRESHOLD_DEG,
  } = useZeroOverhangConstraintSystem(initialFaces);

  const {
    faces,
    analyses,
    selectedFaceId,
    showViolationsOnly,
    viewRotationDeg,
    viewElevationDeg,
    moldPullDirection,
    violationCount,
    borderlineCount,
    compliantCount,
  } = state;

  const displayedAnalyses = showViolationsOnly
    ? analyses.filter(a => a.isViolation)
    : analyses;

  const selectedFace = faces.find(f => f.id === selectedFaceId);
  const selectedAnalysis = analyses.find(a => a.faceId === selectedFaceId);

  const overallCompliant = violationCount === 0 && borderlineCount === 0;

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              STUB-006 — Zero-Overhang Constraint System
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">Wave 2</Badge>
              <Badge variant="outline" className="text-purple-400 border-purple-400">urIm</Badge>
              <Badge className={overallCompliant ? 'bg-green-600' : violationCount > 0 ? 'bg-red-600' : 'bg-amber-600'}>
                {overallCompliant ? 'All Compliant' : violationCount > 0 ? `${violationCount} Violations` : `${borderlineCount} Borderline`}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Constraint: <strong>zero overhang in any mold-pull direction</strong>. Every face must be ≤{MOLD_THRESHOLD_DEG}° from vertical for injection-mold compliance (POCF).
            RootLockSystem embodies this constraint physically.
          </p>
        </CardHeader>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-950 border border-green-800 rounded-lg p-3 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="font-mono text-2xl font-bold text-green-400">{compliantCount}</div>
          <div className="text-xs text-muted-foreground">Compliant faces</div>
        </div>
        <div className="bg-amber-950 border border-amber-800 rounded-lg p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="font-mono text-2xl font-bold text-amber-400">{borderlineCount}</div>
          <div className="text-xs text-muted-foreground">Borderline (≤{PRINT_THRESHOLD_DEG}°)</div>
        </div>
        <div className="bg-red-950 border border-red-800 rounded-lg p-3 text-center">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="font-mono text-2xl font-bold text-red-400">{violationCount}</div>
          <div className="text-xs text-muted-foreground">Hard violations (&gt;{PRINT_THRESHOLD_DEG}°)</div>
        </div>
      </div>

      {/* 3D view + controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overhang Angle Visualization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <OverhangOverlay
              analyses={analyses}
              selected={selectedFaceId}
              onSelect={setSelectedFaceId}
              rotation={viewRotationDeg}
              elevation={viewElevationDeg}
              pullDirection={moldPullDirection}
            />

            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>View Rotation</span>
                  <span className="font-mono">{viewRotationDeg}°</span>
                </div>
                <Slider min={0} max={360} step={5} value={[viewRotationDeg]} onValueChange={([v]) => setViewRotationDeg(v)} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>View Elevation</span>
                  <span className="font-mono">{viewElevationDeg}°</span>
                </div>
                <Slider min={0} max={90} step={5} value={[viewElevationDeg]} onValueChange={([v]) => setViewElevationDeg(v)} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Mold Pull:</Label>
                <Button
                  size="sm" variant={moldPullDirection === 'up' ? 'default' : 'outline'}
                  onClick={() => setMoldPullDirection('up')}
                  className="h-7 px-2"
                >
                  <ArrowUp className="w-3 h-3 mr-1" />Up
                </Button>
                <Button
                  size="sm" variant={moldPullDirection === 'down' ? 'default' : 'outline'}
                  onClick={() => setMoldPullDirection('down')}
                  className="h-7 px-2"
                >
                  <ArrowDown className="w-3 h-3 mr-1" />Down
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Face Analysis</CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  id="violations-only"
                  checked={showViolationsOnly}
                  onCheckedChange={setShowViolationsOnly}
                />
                <Label htmlFor="violations-only" className="text-xs flex items-center gap-1">
                  {showViolationsOnly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Violations only
                </Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {displayedAnalyses.map(analysis => {
                const face = faces.find(f => f.id === analysis.faceId);
                if (!face) return null;
                const isSelected = selectedFaceId === analysis.faceId;
                return (
                  <div
                    key={analysis.faceId}
                    className={`rounded-lg border p-2 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''} ${severityBg(analysis)}`}
                    onClick={() => setSelectedFaceId(isSelected ? null : analysis.faceId)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{face.label}</span>
                      <span className="font-mono text-xs" style={{ color: severityColor(analysis) }}>
                        {analysis.angleFromVerticalDeg}°
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-1 text-xs text-slate-400">{analysis.remediationNote}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected face detail editor */}
      {selectedFace && selectedAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Edit Face: {selectedFace.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <FaceDetail
              analysis={selectedAnalysis}
              face={selectedFace}
              onAngleChange={setFaceAngle}
            />
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={resetToDefault}>
          <RotateCcw className="w-3 h-3 mr-1" />Reset Faces
        </Button>
      </div>

      {/* Spec reference */}
      <div className="text-xs text-muted-foreground bg-slate-900 rounded p-2 space-y-1">
        <div><strong>Patent ref:</strong> Innovation #29 (Manufacturing) — Zero-Overhang Constraint System.</div>
        <div>Constraint: 0° overhang from mold pull direction. Enables Lithographic Dual-Process (#28): same CAD file prints AND molds.</div>
        <div>Physical embodiment: RootLockSystem — all root pegs, sockets, and snap tabs comply via POCF separation strategy.</div>
        <div className="text-slate-500">Print threshold: {PRINT_THRESHOLD_DEG}° (FDM/SLA without supports). Mold threshold: {MOLD_THRESHOLD_DEG}° (injection mold release).</div>
      </div>
    </div>
  );
};
