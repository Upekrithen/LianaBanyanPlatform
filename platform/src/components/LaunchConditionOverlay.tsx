import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, ChevronDown, ChevronUp, Rocket, Users, DollarSign, UserCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface LaunchCondition {
  label: string;
  current: number;
  target: number;
  unit?: string;
  conditionType?: string;
}

interface LaunchConditionOverlayProps {
  initiativeSlug: string;
  initiativeName: string;
  conditions?: LaunchCondition[];
  launchMessage?: string;
  children: React.ReactNode;
}

const CONDITION_ICONS: Record<string, React.ReactNode> = {
  leadership: <UserCheck className="h-4 w-4" />,
  members: <Users className="h-4 w-4" />,
  funding: <DollarSign className="h-4 w-4" />,
};

function formatValue(value: number, unit?: string): string {
  if (unit === '$') return `$${value.toLocaleString()}`;
  return value.toLocaleString();
}

function formatTarget(target: number, unit?: string): string {
  if (unit === '$') return `$${target.toLocaleString()}`;
  return target.toLocaleString();
}

function getBarColor(pct: number): string {
  if (pct >= 100) return 'bg-green-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-amber-600';
}

function averageCompletion(conditions: LaunchCondition[]): number {
  if (!conditions.length) return 0;
  const sum = conditions.reduce((acc, c) => acc + Math.min(100, (c.current / c.target) * 100), 0);
  return Math.round(sum / conditions.length);
}

export default function LaunchConditionOverlay({
  initiativeSlug,
  initiativeName,
  conditions: propConditions,
  launchMessage,
  children,
}: LaunchConditionOverlayProps) {
  const [conditions, setConditions] = useState<LaunchCondition[]>(propConditions || []);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(!propConditions);
  const navigate = useNavigate();

  useEffect(() => {
    if (propConditions) {
      setConditions(propConditions);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('launch_conditions')
          .select('*')
          .eq('initiative_slug', initiativeSlug)
          .order('condition_type');
        if (!cancelled && data && !error) {
          setConditions(data.map((r: any) => ({
            label: r.label,
            current: Number(r.current_value),
            target: Number(r.target_value),
            unit: r.unit,
            conditionType: r.condition_type,
          })));
        }
      } catch {
        // silently fall back to empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [initiativeSlug, propConditions]);

  const avg = averageCompletion(conditions);
  const allMet = avg >= 100;

  if (loading || conditions.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Banner — sticky top with z-index below nav */}
      {!dismissed && (
        <div
          className={`sticky top-0 z-30 transition-all duration-300 ${
            allMet
              ? 'bg-gradient-to-r from-green-600 to-emerald-600'
              : 'bg-gradient-to-r from-slate-800 to-slate-900'
          } text-white shadow-lg`}
        >
          <div className="max-w-6xl mx-auto px-4 py-3">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">
                  {allMet
                    ? `${initiativeName} — All Conditions Met!`
                    : `${initiativeName} — Launches When Conditions Met`}
                </span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full font-mono ${
                    allMet ? 'bg-green-500/30' : avg >= 50 ? 'bg-amber-500/30' : 'bg-red-500/30'
                  }`}
                >
                  {avg}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1 hover:bg-white/10 rounded"
                  aria-label={collapsed ? 'Expand' : 'Collapse'}
                >
                  {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="p-1 hover:bg-white/10 rounded"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress bars — collapsible */}
            {!collapsed && (
              <div className="mt-3 space-y-2">
                {conditions.map((c, i) => {
                  const pct = Math.min(100, Math.round((c.current / c.target) * 100));
                  return (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 w-28 sm:w-36 flex-shrink-0 text-white/80">
                        {CONDITION_ICONS[c.conditionType || ''] || <Rocket className="h-4 w-4" />}
                        {c.label}
                      </span>
                      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getBarColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/70 w-24 text-right font-mono flex-shrink-0">
                        {formatValue(c.current, c.unit)} / {formatTarget(c.target, c.unit)}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-white/50">
                    {launchMessage || 'When all bars hit 100%, this initiative goes live in your area.'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-amber-400 hover:text-amber-300 hover:bg-white/10 text-xs h-7 px-2"
                    onClick={() => navigate('/launch-tracker')}
                  >
                    All Initiatives <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimized pill when dismissed */}
      {dismissed && (
        <button
          onClick={() => setDismissed(false)}
          className={`fixed bottom-4 right-4 z-40 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg transition-all hover:scale-105 ${
            allMet ? 'bg-green-600' : avg >= 50 ? 'bg-amber-600' : 'bg-slate-700'
          }`}
        >
          <Rocket className="h-3.5 w-3.5 inline mr-1" />
          {avg}% to launch
        </button>
      )}

      {/* Page content — always fully visible */}
      {children}
    </div>
  );
}

/** Compact card version for LaunchTracker grid */
export function LaunchConditionCard({
  initiativeSlug,
  initiativeName,
  initiativeNumber,
  conditions,
  onClick,
}: {
  initiativeSlug: string;
  initiativeName: string;
  initiativeNumber: number;
  conditions: LaunchCondition[];
  onClick?: () => void;
}) {
  const avg = averageCompletion(conditions);
  const allMet = avg >= 100;

  return (
    <button
      onClick={onClick}
      className={`text-left w-full rounded-xl border p-4 transition-all hover:shadow-lg hover:scale-[1.02] ${
        allMet
          ? 'border-green-500/40 bg-green-50 dark:bg-green-950/20'
          : avg >= 50
          ? 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">#{initiativeNumber}</span>
          <span className="font-semibold text-sm text-slate-900 dark:text-white">{initiativeName}</span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            allMet
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
              : avg >= 50
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
          }`}
        >
          {avg}%
        </span>
      </div>
      <div className="space-y-1.5">
        {conditions.map((c, i) => {
          const pct = Math.min(100, Math.round((c.current / c.target) * 100));
          return (
            <div key={i}>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                <span>{c.label}</span>
                <span className="font-mono">{formatValue(c.current, c.unit)}/{formatTarget(c.target, c.unit)}</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBarColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </button>
  );
}
