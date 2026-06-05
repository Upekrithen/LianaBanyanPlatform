/**
 * MarathonRetrospectiveChart -- BP074 Sound Barrier Marathon Retrospective
 * 3-card carousel (7s auto-advance, loops): Chart -> Anchors -> Prove It -> Chart
 * Palette: violet / indigo / emerald. Recharts ComposedChart vertical layout.
 * Matches SoundBarrierChart.tsx pattern.
 */

import { useEffect, useRef, useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C_KNIGHT   = "#7c3aed"; // violet-600
const C_BISHOP   = "#4f46e5"; // indigo-600
const C_WORKS    = "#059669"; // emerald-600
const C_BARRIER  = "#f59e0b"; // amber-400
const C_BM       = "#0891b2"; // cyan-600

// ---------------------------------------------------------------------------
// Chart data
// ---------------------------------------------------------------------------
interface MarathonDatum {
  label: string;
  value: number;
  color: string;
}

const CHART_DATA: MarathonDatum[] = [
  { label: "Knight SEGs",   value: 26,   color: C_KNIGHT },
  { label: "Bishop SEGs",   value: 15,   color: C_BISHOP },
  { label: "WORKS rate",    value: 95,   color: C_WORKS  },
  { label: "Sound Barrier", value: 100,  color: C_BARRIER },
  { label: "BM score",      value: 90,   color: C_BM     },
  { label: "Canon eblets",  value: 5,    color: "#d97706" },
  { label: "ADDs",          value: 5,    color: "#7c3aed" },
  { label: "Truth-Always",  value: 3,    color: "#be185d" },
];

// ---------------------------------------------------------------------------
// Stat pill
// ---------------------------------------------------------------------------
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white/70 border border-violet-200 rounded-lg px-3 py-2 min-w-[80px]">
      <span className="text-[11px] font-mono text-violet-600 font-bold leading-none">{value}</span>
      <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat badge (for card 2)
// ---------------------------------------------------------------------------
function StatBadge({ label, value, color = "violet" }: { label: string; value: string; color?: string }) {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-100 text-violet-800 border-violet-300",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-300",
    amber: "bg-amber-100 text-amber-800 border-amber-400",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-300",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-300",
  };
  return (
    <div className={`flex flex-col items-center rounded-lg border px-3 py-2 ${colorMap[color] ?? colorMap.violet}`}>
      <span className="text-sm font-bold font-mono">{value}</span>
      <span className="text-[10px] mt-0.5 text-center leading-tight opacity-80">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom bar shape with individual fill
// ---------------------------------------------------------------------------
interface BarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: MarathonDatum;
}

function ColoredBar(props: BarProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (width <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={payload?.color ?? C_KNIGHT}
      rx={3}
      opacity={0.85}
    />
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
interface TooltipItem {
  payload?: MarathonDatum;
  value?: number;
}
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs font-mono">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-violet-700">{payload[0]?.value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CARD 1 -- Chart
// ---------------------------------------------------------------------------
function CardChart() {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-violet-900 text-center mb-2">
        BP074 Sound Barrier Marathon -- At a Glance
      </h3>
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        <StatPill label="Wall-clock" value="~75 min" />
        <StatPill label="Total SEGs" value="~41" />
        <StatPill label="WORKS rate" value="~95%" />
        <StatPill label="Kappa" value="1.000" />
        <StatPill label="Transport cost" value="$0" />
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart
          layout="vertical"
          data={CHART_DATA}
          margin={{ top: 4, right: 24, left: 110, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <ReferenceLine
            x={85}
            stroke={C_BARRIER}
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{ value: "Sound Barrier (85)", position: "top", fontSize: 9, fill: "#b45309" }}
          />
          <XAxis
            type="number"
            domain={[0, 110]}
            tickCount={12}
            tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={105}
            tick={{ fontSize: 10, fill: "#334155", fontFamily: "monospace" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" barSize={14} shape={<ColoredBar />} />
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-slate-400 text-center mt-1 font-mono">
        Bishop SEG count approx. Sound Barrier = 100% WINS (25/25) this marathon.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CARD 2 -- Empirical Anchors
// ---------------------------------------------------------------------------
function CardAnchors() {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-violet-900 text-center mb-3">
        Empirical Anchors
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        <StatBadge label="Sound Barrier WINS" value="100.0%" color="emerald" />
        <StatBadge label="25 of 25 SEGs" value="25/25" color="emerald" />
        <StatBadge label="Above upper bound +12pp" value="+12pp" color="violet" />
        <StatBadge label="Kappa" value="1.000" color="indigo" />
        <StatBadge label="BM score" value="90.45" color="cyan" />
        <StatBadge label="Canon eblets" value="5" color="violet" />
        <StatBadge label="ADDs (ADD-23..ADD-28)" value="5" color="indigo" />
        <StatBadge label="Truth-Always corrections" value="3" color="amber" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
          <span className="text-amber-600 font-bold text-xs mt-0.5">!</span>
          <p className="text-[11px] text-amber-800 font-mono leading-tight">
            Bishop SEG count approx -- not yet formally tallied
          </p>
        </div>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
          <span className="text-amber-600 font-bold text-xs mt-0.5">!</span>
          <p className="text-[11px] text-amber-800 font-mono leading-tight">
            Grading cost metered, pending close-stamp
          </p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
        NEVER +15pp above sealed prediction band. kappa 1.000 = perfect inter-rater agreement.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CARD 3 -- Prove It Yourself
// ---------------------------------------------------------------------------
function CardProveIt() {
  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-violet-900 text-center mb-3">
        Prove It Yourself
      </h3>
      <div className="flex flex-col gap-2 mb-3">
        <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
          <p className="text-[11px] font-semibold text-violet-800 mb-1">Receipts (Asteroid-ProofVault/)</p>
          <ul className="text-[10px] font-mono text-violet-700 space-y-0.5">
            <li>BP074_SOUND_BARRIER_RECEIPT.md</li>
            <li>BP074_PFP_AUDIT_REPORT.md</li>
            <li>KNIGHT_BISHOP_MESSAGES.md</li>
            <li>BP074_MARATHON_SESSION_FORENSIC_TIMELINE.md</li>
          </ul>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
          <p className="text-[11px] font-semibold text-indigo-800 mb-1">Harness re-run</p>
          <code className="text-[10px] font-mono text-indigo-700 break-all">
            python -m pytest tests/benchmark/ -v --kappa
          </code>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <p className="text-[11px] font-semibold text-emerald-800 mb-1">Kappa verification</p>
          <code className="text-[10px] font-mono text-emerald-700">
            from sklearn.metrics import cohen_kappa_score
            <br />
            cohen_kappa_score(y1, y2)  # expect 1.000
          </code>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <p className="text-[11px] font-semibold text-slate-700 mb-1">Canon eblet search</p>
          <code className="text-[10px] font-mono text-slate-600">
            grep -r "canon_bp074" Asteroid-ProofVault/
          </code>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 text-center font-mono">
        Clone repo, run harness, read receipts. Member-reproducible by design.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carousel dots
// ---------------------------------------------------------------------------
function NavDots({
  count,
  active,
  onDotClick,
}: {
  count: number;
  active: number;
  onDotClick: (i: number) => void;
}) {
  return (
    <div className="flex gap-2 justify-center mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          aria-label={`Card ${i + 1}`}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
            i === active
              ? "bg-violet-600 scale-110"
              : "bg-violet-200 hover:bg-violet-400"
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export: MarathonRetrospectiveCarousel
// ---------------------------------------------------------------------------
const CARDS = [CardChart, CardAnchors, CardProveIt];
const AUTO_ADVANCE_MS = 7000;

export function MarathonRetrospectiveCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = () => {
    setActive((prev) => (prev + 1) % CARDS.length);
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const handleDotClick = (i: number) => {
    setPaused(true);
    setActive(i);
  };

  const ActiveCard = CARDS[active];

  return (
    <div className="w-full">
      <div
        style={{ transition: "opacity 0.3s ease" }}
        className="opacity-100"
        key={active}
      >
        <ActiveCard />
      </div>
      <NavDots count={CARDS.length} active={active} onDotClick={handleDotClick} />
      {paused && (
        <p className="text-[10px] text-center text-slate-400 mt-1 font-mono">
          Auto-advance paused.{" "}
          <button
            className="underline hover:text-violet-600"
            onClick={() => setPaused(false)}
          >
            Resume
          </button>
        </p>
      )}
    </div>
  );
}
