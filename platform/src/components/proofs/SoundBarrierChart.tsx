/**
 * SoundBarrierChart -- Wave gamma / BP073 γ-W26-A
 * Predict-Then-Test chart: Gemma 4 12B + MnemosyneC Substrate vs BP067 historical anchors.
 *
 * γ-W27 update: wired to loadHarnessResults. When β-W20-W23 results land:
 *   - PENDING verdict: prediction-only chart (original behavior)
 *   - Actual verdict (WINS/PARTIAL/LOSES): dual-bar display -- actual (solid) +
 *     prediction (dashed) side-by-side. Prediction is never removed post-reveal
 *     (predict-then-test discipline).
 *
 * Charting library: recharts (already in project, no new dependency).
 * Layout: horizontal bars (layout="vertical"), substrate ON vs OFF per model.
 * Prediction point: Gemma 4 12B @ 85 ± 3, rendered with a striped dashed pattern.
 * Sound Barrier line: vertical ReferenceLine at x=85.
 * Floor band: ReferenceArea x1=5 x2=25 (substrate-OFF floor across all models).
 */

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getHarnessResults } from "@/lib/benchmark/loadHarnessResults";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface ModelDatum {
  model: string;
  on: number | null;        // substrate ON (measured historical) or prediction
  off: number | null;       // substrate OFF (measured historical)
  isPrediction: boolean;
  actualOn?: number | null; // actual measured score when results land (γ-W27)
  errorBar?: number;
}

const DATA: ModelDatum[] = [
  { model: "GPT Frontier",   on: 93.3, off: 19.3, isPrediction: false },
  { model: "Gemini Frontier",on: 90.7, off: 8,    isPrediction: false },
  { model: "Claude Opus",    on: 89.3, off: 6,    isPrediction: false },
  { model: "Gemma 4 12B",    on: 85,   off: null,  isPrediction: true, errorBar: 3 },
  { model: "Llama 3.x",      on: 78,   off: 6,    isPrediction: false },
  { model: "Gemma 2 2B",     on: 70,   off: 15,   isPrediction: false },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOUND_BARRIER = 85;

const COLOR_ON         = "#059669"; // emerald-600 -- substrate ON (measured)
const COLOR_OFF        = "#94a3b8"; // slate-400   -- substrate OFF (measured)
const COLOR_PREDICTION = "#7c3aed"; // violet-600  -- Gemma 4 12B predicted
const COLOR_ACTUAL     = "#065f46"; // emerald-900 -- Gemma 4 12B actual measured
const COLOR_FLOOR_BAND = "#f1f5f9"; // slate-100   -- floor band fill

// ---------------------------------------------------------------------------
// Custom shapes
// ---------------------------------------------------------------------------

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isPrediction?: boolean;
  errorBar?: number;
}

function SubstrateOnBar(props: BarShapeProps & { isPrediction?: boolean }) {
  const { x = 0, y = 0, width = 0, height = 0, isPrediction } = props;
  if (width <= 0) return null;

  if (isPrediction) {
    return (
      <g>
        <defs>
          <pattern
            id="sb-prediction-stripe"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="#ede9fe" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={COLOR_PREDICTION}
              strokeWidth="2"
              strokeOpacity="0.5"
            />
          </pattern>
        </defs>
        {/* Prediction bar: striped fill + dashed border */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="url(#sb-prediction-stripe)"
          stroke={COLOR_PREDICTION}
          strokeWidth={2}
          strokeDasharray="5 3"
          rx={3}
        />
        {/* Diamond marker at tip */}
        <polygon
          points={`
            ${x + width},${y + height / 2}
            ${x + width + 7},${y + height / 2 - 5}
            ${x + width + 14},${y + height / 2}
            ${x + width + 7},${y + height / 2 + 5}
          `}
          fill={COLOR_PREDICTION}
          stroke="white"
          strokeWidth={1}
        />
        {/* Error bar: ±3 */}
        <line
          x1={x + width - 3 * (width / 85)}
          y1={y + height / 2}
          x2={x + width + 3 * (width / 85)}
          y2={y + height / 2}
          stroke={COLOR_PREDICTION}
          strokeWidth={2}
        />
        <line
          x1={x + width - 3 * (width / 85)}
          y1={y + height / 2 - 4}
          x2={x + width - 3 * (width / 85)}
          y2={y + height / 2 + 4}
          stroke={COLOR_PREDICTION}
          strokeWidth={2}
        />
        <line
          x1={x + width + 3 * (width / 85)}
          y1={y + height / 2 - 4}
          x2={x + width + 3 * (width / 85)}
          y2={y + height / 2 + 4}
          stroke={COLOR_PREDICTION}
          strokeWidth={2}
        />
      </g>
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={COLOR_ON}
      rx={3}
      opacity={0.85}
    />
  );
}

function SubstrateOffBar(props: BarShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0 } = props;
  if (width <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={COLOR_OFF}
      rx={3}
      opacity={0.55}
    />
  );
}

/** Solid bar for actual measured Gemma 4 12B result post-reveal. */
function ActualOnBar(props: BarShapeProps) {
  const { x = 0, y = 0, width = 0, height = 0 } = props;
  if (width <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={COLOR_ACTUAL}
      rx={3}
      opacity={0.9}
    />
  );
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadItem {
  name: string;
  value: number | null;
  payload: ModelDatum;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload as ModelDatum;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs font-mono max-w-[220px]">
      <p className="font-semibold text-slate-800 mb-1">{label}</p>
      {row.isPrediction ? (
        <>
          <p className="text-violet-700">PREDICTED: {row.on} &plusmn; {row.errorBar}</p>
          {row.actualOn != null && (
            <p className="text-emerald-900 font-semibold">ACTUAL: {row.actualOn}</p>
          )}
          <p className="text-slate-500 mt-0.5">$0 marginal cost (local, Apache 2.0)</p>
          <p className="text-slate-500">Predicted kappa &gt;= 0.85</p>
          <p className="text-slate-500 mt-0.5">BP067 historical kappa: 0.936</p>
        </>
      ) : (
        <>
          {row.on !== null && (
            <p className="text-emerald-700">Substrate ON: {row.on}</p>
          )}
          {row.off !== null && (
            <p className="text-slate-500">Substrate OFF: {row.off}</p>
          )}
          <p className="text-slate-400 mt-0.5">Source: BP067 historical anchor</p>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legend items (hand-crafted to match actual visual)
// ---------------------------------------------------------------------------

function ChartLegend({ showActual }: { showActual: boolean }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center text-xs font-mono mt-1 mb-3">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: COLOR_ON, opacity: 0.85 }}
        />
        <span className="text-slate-700">Substrate ON (measured)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ background: COLOR_OFF, opacity: 0.55 }}
        />
        <span className="text-slate-700">Substrate OFF (measured)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-3 h-3 rounded-sm border-2 border-dashed"
          style={{ borderColor: COLOR_PREDICTION, background: "#ede9fe" }}
        />
        <span className="text-violet-700 font-semibold">Predicted (Gemma 4 12B)</span>
      </div>
      {showActual && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ background: COLOR_ACTUAL, opacity: 0.9 }}
          />
          <span className="text-emerald-900 font-semibold">Actual (Gemma 4 12B)</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-6 border-t-2 border-dashed border-amber-500"
          style={{ marginTop: "6px" }}
        />
        <span className="text-amber-700">Sound Barrier (85)</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shape wrappers (recharts passes all bar props to shape)
// ---------------------------------------------------------------------------

type RechartBarProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ModelDatum;
};

function OnBarShape(props: RechartBarProps) {
  const { payload, ...rest } = props;
  return (
    <SubstrateOnBar
      {...rest}
      isPrediction={payload?.isPrediction ?? false}
    />
  );
}

function OffBarShape(props: RechartBarProps) {
  return <SubstrateOffBar {...props} />;
}

function ActualOnBarShape(props: RechartBarProps) {
  return <ActualOnBar {...props} />;
}

// ---------------------------------------------------------------------------
// Verdict pill (shown when results have landed)
// ---------------------------------------------------------------------------

type Verdict = 'WINS' | 'PARTIAL' | 'LOSES' | 'PENDING';

const VERDICT_STYLES: Record<Verdict, string> = {
  WINS:    "bg-emerald-100 text-emerald-800 border-emerald-400",
  PARTIAL: "bg-amber-100 text-amber-800 border-amber-400",
  LOSES:   "bg-red-100 text-red-800 border-red-400",
  PENDING: "bg-amber-50 text-amber-700 border-amber-300",
};

function VerdictPill({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${VERDICT_STYLES[verdict]}`}
    >
      {verdict}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SoundBarrierChart() {
  const results = getHarnessResults();
  const hasActual = results.soundBarrierVerdict !== 'PENDING';

  // Merge actual score into chart data when results have landed.
  // Prediction bar (on=85, isPrediction=true) always stays visible -- predict-then-test discipline.
  const chartData: ModelDatum[] = DATA.map((d) => {
    if (d.model === "Gemma 4 12B" && hasActual && results.gemma4Score !== null) {
      return { ...d, actualOn: results.gemma4Score };
    }
    return { ...d, actualOn: null };
  });

  return (
    <div className="w-full">
      {/* Chart title + verdict */}
      <div className="text-center mb-1">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-800">
            Predict-Then-Test: Gemma 4 12B + MnemosyneC Substrate
          </h3>
          <VerdictPill verdict={results.soundBarrierVerdict} />
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">
          {hasActual
            ? "Actual measured bars (solid) shown alongside prediction bars (dashed). Prediction is preserved post-reveal."
            : "Horizontal dashed line = Sound Barrier (85). Points above it: the cooperative-class thesis is empirically defensible."}
        </p>
      </div>

      <ChartLegend showActual={hasActual} />

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          layout="vertical"
          data={chartData}
          margin={{ top: 8, right: 32, left: 110, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e2e8f0"
          />

          {/* Floor band: substrate-OFF range across all models (5-25) */}
          <ReferenceArea
            x1={5}
            x2={25}
            fill={COLOR_FLOOR_BAND}
            fillOpacity={0.6}
            label={{
              value: "Substrate-OFF floor",
              position: "insideTopLeft",
              fontSize: 9,
              fill: "#94a3b8",
              dy: 4,
            }}
          />

          {/* Sound Barrier line */}
          <ReferenceLine
            x={SOUND_BARRIER}
            stroke="#f59e0b"
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{
              value: "Sound Barrier (85)",
              position: "top",
              fontSize: 10,
              fill: "#b45309",
              fontWeight: 600,
            }}
          />

          <XAxis
            type="number"
            domain={[0, 100]}
            tickCount={11}
            tick={{ fontSize: 10, fill: "#64748b", fontFamily: "monospace" }}
            label={{
              value: "Score (0-100)",
              position: "insideBottom",
              offset: -2,
              fontSize: 10,
              fill: "#64748b",
            }}
          />
          <YAxis
            type="category"
            dataKey="model"
            width={105}
            tick={{ fontSize: 11, fill: "#334155", fontFamily: "monospace" }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Substrate OFF bars (measured models only) */}
          <Bar
            dataKey="off"
            name="Substrate OFF"
            barSize={8}
            shape={<OffBarShape />}
          />

          {/* Substrate ON / Prediction bars */}
          <Bar
            dataKey="on"
            name="Substrate ON / Predicted"
            barSize={14}
            shape={<OnBarShape />}
          />

          {/* Actual measured bar for Gemma 4 12B -- only renders when actualOn is non-null */}
          {hasActual && (
            <Bar
              dataKey="actualOn"
              name="Actual (Gemma 4 12B)"
              barSize={14}
              shape={<ActualOnBarShape />}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Annotations below chart */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center text-xs font-mono mt-2 text-slate-500">
        <span>
          <span className="text-violet-700 font-semibold">*</span> Gemma 4 12B: $0 marginal cost (local, Apache 2.0)
        </span>
        <span>
          Predicted kappa &gt;= 0.85 (BP067 historical: 0.936)
        </span>
        <span>
          ~227x cost ratio in favor of local (W12 F3 anchor)
        </span>
        {hasActual && results.kappa !== null && (
          <span>
            <span className="text-emerald-900 font-semibold">Actual kappa: {results.kappa}</span>
          </span>
        )}
        {hasActual && (
          <span className="text-slate-500">BM (substrate ON): 90.45</span>
        )}
      </div>

      {/* Ceiling-effect annotation */}
      {hasActual && (
        <p className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 mt-2 leading-snug">
          <span className="font-bold">Ceiling effect:</span> substrate delta 0pp on BP067 4-of-4 harness;
          marginal substrate lift unmeasurable on this question set; see Google-eval rerun (in design) for the substrate-lift test.
        </p>
      )}

      {/* PRE-PUBLISHED PREDICTION HASHES */}
      <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-3 py-1 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wide">
          Pre-Published Prediction Hashes
        </div>
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-3 py-1 text-slate-500 font-semibold">Agent</th>
              <th className="text-left px-3 py-1 text-slate-500 font-semibold">Hash</th>
              <th className="text-left px-3 py-1 text-slate-500 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-3 py-1 text-slate-700">Knight</td>
              <td className="px-3 py-1 text-emerald-800 break-all">
                9839b78b40cd012431035f0d8dc230c0ecbc30f00ff59ea1f9a12a32e570d87b
              </td>
              <td className="px-3 py-1">
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-400 rounded-full px-2 py-0.5 font-bold text-[9px]">
                  LOCKED
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
