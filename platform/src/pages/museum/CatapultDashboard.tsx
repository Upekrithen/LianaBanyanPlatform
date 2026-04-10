import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CatapultGauge } from '@/components/catapult/CatapultGauge';

interface CatapultMetric {
  id: string;
  entity_type: string;
  label: string;
  current_value: number;
  target_value: number;
  cp_score: number;
  launched_at: string | null;
}

const entityTypeColors: Record<string, string> = {
  project: 'bg-blue-900/30 border-blue-700/50',
  petition: 'bg-purple-900/30 border-purple-700/50',
  vote: 'bg-green-900/30 border-green-700/50',
  campaign: 'bg-amber-900/30 border-amber-700/50',
  initiative: 'bg-teal-900/30 border-teal-700/50',
  submission: 'bg-rose-900/30 border-rose-700/50',
  deck_card_print: 'bg-orange-900/30 border-orange-700/50',
};

const entityTypeLabels: Record<string, string> = {
  project: 'Project',
  petition: 'Petition',
  vote: 'Vote',
  campaign: 'Campaign',
  initiative: 'Initiative',
  submission: 'Submission',
  deck_card_print: 'Card Print',
};

export default function CatapultDashboard() {
  const [metrics, setMetrics] = useState<CatapultMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const { data, error } = await supabase
        .from('catapult_metrics')
        .select('id, entity_type, label, current_value, target_value, cp_score, launched_at')
        .is('launched_at', null)
        .order('cp_score', { ascending: false });

      if (error) {
        console.error('Failed to fetch catapult metrics:', error);
      } else {
        setMetrics((data as CatapultMetric[]) || []);
      }
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Catapult Power Dashboard</h1>
          <p className="text-gray-400">
            Universal momentum metric. 100 CP = escape velocity. Sorted by closest to launch.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
          </div>
        )}

        {!loading && metrics.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No active catapult metrics</p>
            <p className="mt-2">Nothing is currently building toward escape velocity.</p>
          </div>
        )}

        {!loading && metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className={`rounded-xl border p-4 ${entityTypeColors[metric.entity_type] || 'bg-gray-900/30 border-gray-700/50'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    {entityTypeLabels[metric.entity_type] || metric.entity_type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {metric.current_value.toLocaleString()} / {metric.target_value.toLocaleString()}
                  </span>
                </div>

                <CatapultGauge
                  currentCP={metric.cp_score}
                  label={metric.label}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center text-gray-600 text-xs">
          Innovation #2237 — Catapult Power (Crown Jewel #210) — Liana Banyan CORPORATION
        </div>
      </div>
    </div>
  );
}
