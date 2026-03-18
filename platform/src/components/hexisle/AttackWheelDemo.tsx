import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, TreePine, RotateCw, ChevronDown, Info } from 'lucide-react';

/**
 * CANONICAL Attack Wheel patterns — DO NOT DEVIATE.
 * Each level has a fixed hit/miss sequence that repeats.
 * "Luck" is actually deterministic sequence position.
 */
const LEVEL_PATTERNS: Record<number, { sequence: boolean[]; cost: number; description: string }> = {
  1: { sequence: [false, false, true],                cost: 1, description: 'Miss, Miss, Hit' },
  2: { sequence: [false, true],                       cost: 2, description: 'Miss, Hit' },
  3: { sequence: [true, false, true, false],           cost: 3, description: 'Hit, Miss, Hit, Miss' },
  4: { sequence: [true, true, false, false],           cost: 4, description: 'Hit, Hit, Miss, Miss' },
  5: { sequence: [true, true, false],                  cost: 5, description: 'Hit, Hit, Miss' },
  6: { sequence: [true, true, true, false],            cost: 6, description: 'Hit, Hit, Hit, Miss' },
};

const LEVEL_COLORS: Record<number, string> = {
  1: '#6ee7b7', // green
  2: '#93c5fd', // blue
  3: '#fbbf24', // amber
  4: '#f97316', // orange
  5: '#ef4444', // red
  6: '#a855f7', // purple
};

interface HistoryEntry {
  level: number;
  position: number;
  isHit: boolean;
  cost: number;
}

export default function AttackWheelDemo() {
  const [level, setLevel] = useState(1);
  const [position, setPosition] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [showExplainer, setShowExplainer] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const pattern = LEVEL_PATTERNS[level];
  const segmentCount = pattern.sequence.length;

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const advance = useCallback((isCombat: boolean) => {
    if (spinning) return;
    setSpinning(true);

    setTimeout(() => {
      const isHit = pattern.sequence[position % segmentCount];
      const nextPos = (position + 1) % segmentCount;

      if (isCombat) {
        setHistory(prev => [...prev, {
          level,
          position,
          isHit,
          cost: pattern.cost,
        }]);
        setTotalSpent(prev => prev + pattern.cost);
        if (isHit) setTotalHits(prev => prev + 1);
      } else {
        setHistory(prev => [...prev, {
          level,
          position,
          isHit: false,
          cost: 0,
        }]);
      }

      setPosition(nextPos);
      setSpinning(false);
    }, 400);
  }, [level, position, pattern, segmentCount, spinning]);

  const resetWheel = () => {
    setPosition(0);
    setHistory([]);
    setTotalSpent(0);
    setTotalHits(0);
  };

  const wheelRadius = 120;
  const centerX = 150;
  const centerY = 150;

  const segments = pattern.sequence.map((isHit, i) => {
    const angleStart = (i / segmentCount) * 360 - 90;
    const angleEnd = ((i + 1) / segmentCount) * 360 - 90;
    const startRad = (angleStart * Math.PI) / 180;
    const endRad = (angleEnd * Math.PI) / 180;

    const x1 = centerX + wheelRadius * Math.cos(startRad);
    const y1 = centerY + wheelRadius * Math.sin(startRad);
    const x2 = centerX + wheelRadius * Math.cos(endRad);
    const y2 = centerY + wheelRadius * Math.sin(endRad);

    const largeArc = segmentCount <= 2 ? 1 : 0;
    const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${wheelRadius} ${wheelRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const midAngle = ((angleStart + angleEnd) / 2 * Math.PI) / 180;
    const labelX = centerX + (wheelRadius * 0.65) * Math.cos(midAngle);
    const labelY = centerY + (wheelRadius * 0.65) * Math.sin(midAngle);

    const isCurrent = i === position;

    return (
      <g key={i}>
        <path
          d={d}
          fill={isHit ? '#22c55e' : '#ef4444'}
          stroke={isCurrent ? '#fbbf24' : '#1e293b'}
          strokeWidth={isCurrent ? 3 : 1.5}
          opacity={isCurrent ? 1 : 0.7}
          className="transition-all duration-300"
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="11"
          fontWeight="bold"
        >
          {isHit ? 'HIT' : 'MISS'}
        </text>
      </g>
    );
  });

  const pointerAngle = (position / segmentCount) * 360 - 90;
  const pointerRad = (pointerAngle * Math.PI) / 180;
  const pointerMidRad = (((position + 0.5) / segmentCount) * 360 - 90) * Math.PI / 180;
  const pointerTipX = centerX + (wheelRadius + 15) * Math.cos(pointerMidRad);
  const pointerTipY = centerY + (wheelRadius + 15) * Math.sin(pointerMidRad);

  return (
    <Card className="border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Swords className="h-5 w-5 text-amber-400" />
            Attack Wheel — Deterministic Combat
          </CardTitle>
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        {showExplainer && (
          <p className="text-sm text-slate-300 mt-2">
            HexIsle replaces dice with a fixed sequence wheel. There is no luck — only knowledge.
            Every "random" outcome is actually a predictable position on the wheel.
            Higher levels cost more per shot but have better hit ratios.
          </p>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Wheel */}
          <div className="flex flex-col items-center">
            {/* Level selector */}
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5, 6].map(l => (
                <button
                  key={l}
                  onClick={() => { setLevel(l); setPosition(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    level === l
                      ? 'text-white shadow-lg scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  style={level === l ? { backgroundColor: LEVEL_COLORS[l] } : undefined}
                >
                  L{l}
                </button>
              ))}
            </div>

            {/* SVG Wheel */}
            <div className={`relative transition-transform duration-300 ${spinning ? 'scale-95' : ''}`}>
              <svg width="300" height="300" viewBox="0 0 300 300">
                <circle cx={centerX} cy={centerY} r={wheelRadius + 2} fill="none" stroke="#334155" strokeWidth="2" />
                {segments}
                {/* Pointer indicator */}
                <circle
                  cx={pointerTipX}
                  cy={pointerTipY}
                  r={8}
                  fill="#fbbf24"
                  stroke="#92400e"
                  strokeWidth={2}
                />
                <text
                  x={pointerTipX}
                  y={pointerTipY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#92400e"
                  fontSize="8"
                  fontWeight="bold"
                >
                  ▶
                </text>
                {/* Center label */}
                <circle cx={centerX} cy={centerY} r={28} fill="#0f172a" />
                <text x={centerX} y={centerY - 6} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  Level {level}
                </text>
                <text x={centerX} y={centerY + 8} textAnchor="middle" fill="#fbbf24" fontSize="9">
                  {pattern.cost} coin{pattern.cost > 1 ? 's' : ''}
                </text>
              </svg>
            </div>

            {/* Pattern description */}
            <div className="text-center mb-3">
              <span className="text-xs text-slate-500">Pattern: </span>
              <span className="text-xs font-mono">
                {pattern.sequence.map((h, i) => (
                  <span key={i} className={`${i === position ? 'font-bold underline' : ''} ${h ? 'text-green-600' : 'text-red-500'}`}>
                    {h ? 'H' : 'M'}{i < pattern.sequence.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => advance(true)}
                disabled={spinning}
                className="bg-red-600 hover:bg-red-700 text-white gap-1"
                size="sm"
              >
                <Swords className="h-4 w-4" />
                Attack ({pattern.cost} coin{pattern.cost > 1 ? 's' : ''})
              </Button>
              <Button
                onClick={() => advance(false)}
                disabled={spinning}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <TreePine className="h-4 w-4" />
                Shoot Tree (free)
              </Button>
              <Button
                onClick={resetWheel}
                variant="ghost"
                size="sm"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right: Stats + History */}
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">{totalHits}</div>
                <div className="text-xs text-slate-500">Hits</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-600">{totalSpent}</div>
                <div className="text-xs text-slate-500">Coins Spent</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-600">
                  {totalSpent > 0 ? (totalHits / (history.filter(h => h.cost > 0).length || 1) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-xs text-slate-500">Hit Rate</div>
              </div>
            </div>

            {/* History log */}
            <div className="bg-slate-950 rounded-lg p-3 max-h-64 overflow-y-auto font-mono text-xs">
              <div className="text-slate-500 mb-2">
                {history.length === 0 ? '// Click Attack or Shoot Tree to begin...' : '// Combat Log'}
              </div>
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 py-0.5 ${
                    entry.cost === 0
                      ? 'text-slate-500'
                      : entry.isHit
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  <span className="text-slate-600 w-6 text-right">{i + 1}.</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1 py-0 h-4 ${
                      entry.cost === 0
                        ? 'border-slate-600 text-slate-500'
                        : entry.isHit
                        ? 'border-green-600 text-green-400'
                        : 'border-red-600 text-red-400'
                    }`}
                  >
                    {entry.cost === 0 ? 'TREE' : entry.isHit ? 'HIT' : 'MISS'}
                  </Badge>
                  <span className="text-slate-600">L{entry.level}</span>
                  <span className="text-slate-700">pos[{entry.position}]</span>
                  {entry.cost > 0 && (
                    <span className="text-amber-600">-{entry.cost}c</span>
                  )}
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>

            {/* Level patterns reference */}
            <details className="mt-4">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 flex items-center gap-1">
                <ChevronDown className="h-3 w-3" /> All Level Patterns
              </summary>
              <div className="mt-2 space-y-1">
                {Object.entries(LEVEL_PATTERNS).map(([l, p]) => (
                  <div key={l} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ backgroundColor: LEVEL_COLORS[Number(l)] }}
                    >
                      L{l}
                    </span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{p.description}</span>
                    <span className="text-amber-600 ml-auto">{p.cost}c</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
