/**
 * WaterWheelDashboard — visualizes the Housing WaterWheel revenue flow.
 * Animated flow diagram, per-property stats, aggregate dashboard, growth chart.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { Zap, Users, TrendingUp, ArrowDown } from 'lucide-react';

interface WaterwheelRow {
  id: string;
  property_id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  airbnb_share: number;
  tenant_subsidy: number;
  maintenance_fund: number;
  cooperative_fund: number;
  jobs_created: number;
  multiplier_effect: number | null;
  notes: string | null;
  property?: { title: string; city: string };
}

const FLOW_BLOCKS = [
  { key: 'airbnb_share', label: 'AirBnB Share', pct: '30%', color: '#f59e0b', desc: 'Mortgage, insurance, taxes' },
  { key: 'tenant_subsidy', label: 'Tenant Subsidy', pct: '40%', color: '#22c55e', desc: 'Keeps housing at Cost+20%' },
  { key: 'maintenance_fund', label: 'Maintenance', pct: '15%', color: '#3b82f6', desc: 'Repairs, cleaning, upkeep' },
  { key: 'cooperative_fund', label: 'Coop Fund', pct: '15%', color: '#a855f7', desc: 'Next property acquisition' },
];

function FlowDiagram({ totalRevenue }: { totalRevenue: number }) {
  return (
    <div className="space-y-4">
      {/* Gross Revenue */}
      <div className="text-center p-3 rounded-xl bg-slate-800 border border-slate-700">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Gross Revenue</p>
        <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
      </div>

      <div className="flex justify-center">
        <ArrowDown className="w-5 h-5 text-muted-foreground animate-bounce" />
      </div>

      {/* Revenue split blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FLOW_BLOCKS.map(block => (
          <div
            key={block.key}
            className="p-3 rounded-xl border text-center relative overflow-hidden"
            style={{ borderColor: `${block.color}40`, backgroundColor: `${block.color}08` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: block.color }} />
            <p className="text-lg font-bold" style={{ color: block.color }}>{block.pct}</p>
            <p className="text-xs font-medium text-foreground mt-0.5">{block.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{block.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <ArrowDown className="w-5 h-5 text-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>

      <div className="text-center p-3 rounded-xl bg-purple-900/20 border border-purple-500/30">
        <p className="text-xs text-purple-400 uppercase tracking-wider">WaterWheel Effect</p>
        <p className="text-sm text-muted-foreground">Cooperative Fund surplus → <span className="text-purple-300 font-semibold">NEXT PROPERTY</span></p>
      </div>
    </div>
  );
}

export default function WaterWheelDashboard() {
  const { data: rows = [] } = useQuery({
    queryKey: ['housing-waterwheel-all'],
    queryFn: async () => {
      const { data } = await supabase
        .from('housing_waterwheel')
        .select('*, property:property_id (title, city)')
        .order('period_start');
      return (data || []).map((r: any) => ({
        ...r,
        property: Array.isArray(r.property) ? r.property[0] : r.property,
      })) as WaterwheelRow[];
    },
  });

  const aggregate = useMemo(() => {
    if (!rows.length) return { totalRevenue: 4000, totalCoop: 300, avgMultiplier: 2.23, totalJobs: 4 };
    const totalRevenue = rows.reduce((s, r) => s + (r.gross_revenue || 0), 0);
    const totalCoop = rows.reduce((s, r) => s + (r.cooperative_fund || 0), 0);
    const totalJobs = rows.reduce((s, r) => s + (r.jobs_created || 0), 0);
    const mults = rows.filter(r => r.multiplier_effect).map(r => r.multiplier_effect!);
    const avgMultiplier = mults.length ? mults.reduce((a, b) => a + b, 0) / mults.length : 2.23;
    return { totalRevenue, totalCoop, avgMultiplier, totalJobs };
  }, [rows]);

  // Build chart data — real + projected
  const chartData = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let cumulative = 0;
    return months.map((m, i) => {
      const realRow = rows[i];
      const isProjected = !realRow;
      const base = realRow || { airbnb_share: 3000, tenant_subsidy: 400, maintenance_fund: 300, cooperative_fund: 300 };
      const coopVal = isProjected ? 300 * (1 + i * 0.05) : (base.cooperative_fund || 0);
      cumulative += coopVal;
      return {
        month: m,
        airbnb: isProjected ? 3000 : (base.airbnb_share || 0),
        subsidy: isProjected ? 400 : (base.tenant_subsidy || 0),
        maintenance: isProjected ? 300 : (base.maintenance_fund || 0),
        cooperative: Math.round(coopVal),
        cumulative: Math.round(cumulative),
        projected: isProjected,
      };
    });
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Aggregate stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">${aggregate.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">${aggregate.totalCoop.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Cooperative Fund</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 text-emerald-400" />
              <p className="text-2xl font-bold text-emerald-400">×{aggregate.avgMultiplier.toFixed(2)}</p>
            </div>
            <p className="text-xs text-muted-foreground">Multiplier Effect</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-5 h-5 text-blue-400" />
              <p className="text-2xl font-bold text-blue-400">{aggregate.totalJobs}</p>
            </div>
            <p className="text-xs text-muted-foreground">Cooperative Jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Flow diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Housing WaterWheel — Revenue Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FlowDiagram totalRevenue={aggregate.totalRevenue} />
        </CardContent>
      </Card>

      {/* Per-property stats */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Per-Property Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rows.map(row => (
              <div key={row.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{row.property?.title || 'Property'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(row.period_start).toLocaleDateString()} — {new Date(row.period_end).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.jobs_created > 0 && (
                      <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">
                        {row.jobs_created} jobs
                      </Badge>
                    )}
                    {row.multiplier_effect && (
                      <Badge className="text-[10px] bg-emerald-900/50 text-emerald-300 border-emerald-500/30">
                        ×{row.multiplier_effect}
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Stacked bar */}
                <div className="flex h-4 rounded-full overflow-hidden">
                  {FLOW_BLOCKS.map(block => {
                    const val = row[block.key as keyof WaterwheelRow] as number || 0;
                    const pct = row.gross_revenue > 0 ? (val / row.gross_revenue) * 100 : 25;
                    return (
                      <div
                        key={block.key}
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: block.color }}
                        title={`${block.label}: $${val.toLocaleString()}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Gross: ${row.gross_revenue.toLocaleString()}</span>
                  <span>Coop Fund: ${(row.cooperative_fund || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Growth chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="airbnb" stackId="a" fill="#f59e0b" name="AirBnB" opacity={0.8} />
                <Bar dataKey="subsidy" stackId="a" fill="#22c55e" name="Subsidy" opacity={0.8} />
                <Bar dataKey="maintenance" stackId="a" fill="#3b82f6" name="Maint." opacity={0.8} />
                <Bar dataKey="cooperative" stackId="a" fill="#a855f7" name="Coop Fund" opacity={0.8} />
                <Line type="monotone" dataKey="cumulative" stroke="#e879f9" strokeWidth={2} dot={false} name="Cumulative Fund" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Projected bars based on Founders House model. Actual data replaces projections as it becomes available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
