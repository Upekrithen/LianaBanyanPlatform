import { useState, type CSSProperties } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Hammer,
  Handshake,
  Lock,
  Shield,
  Swords,
  TrendingUp,
} from 'lucide-react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const NAVY = '#1A1F36';
const GOLD = '#D4A843';

const marksFmt = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatMarks(n: number): string {
  return marksFmt.format(n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Expanded = 'substitute' | 'sponsor' | 'commission' | null;

type WarChestSummaryRow = {
  user_id?: string;
  total_marks_earned?: number | string | null;
  total_eligible?: number | string | null;
  total_allocated?: number | string | null;
  available_eligible?: number | string | null;
};

type AllocationRow = {
  id: string;
  created_at: string;
  allocation_type: string;
  amount: number | string;
  status: string;
};

type FeatureFlagRow = {
  feature_key: string;
  is_enabled: boolean | null;
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const TYPE_BADGE: Record<string, string> = {
  substitution: 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-200 border-emerald-600/30',
  sponsorship: 'bg-sky-600/15 text-sky-800 dark:text-sky-200 border-sky-600/30',
  commission: 'bg-amber-600/15 text-amber-900 dark:text-amber-100 border-amber-600/30',
};

function allocationTypeBadge(type: string) {
  const t = type?.toLowerCase() ?? '';
  const cls = TYPE_BADGE[t];
  return cls ? (
    <Badge className={cls}>{t.charAt(0).toUpperCase() + t.slice(1)}</Badge>
  ) : (
    <Badge variant="secondary">{type || '—'}</Badge>
  );
}

function statusBadge(status: string) {
  const s = status?.toLowerCase() ?? '';
  if (s === 'completed')
    return (
      <Badge variant="outline" className="border-emerald-600/40 text-emerald-800 dark:text-emerald-200">
        <CheckCircle className="mr-1 h-3 w-3" />
        Completed
      </Badge>
    );
  if (s === 'failed' || s === 'error')
    return (
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {status}
      </Badge>
    );
  return <Badge variant="outline">{status || '—'}</Badge>;
}

export default function WarChestPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Expanded>(null);

  const [subAmount, setSubAmount] = useState('');
  const [sponsorProjectId, setSponsorProjectId] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [commissionProjectId, setCommissionProjectId] = useState('');
  const [commissionBountyId, setCommissionBountyId] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const { data: flags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data } = await supabase.from('founder_feature_flags' as never).select('*');
      return (data || []) as FeatureFlagRow[];
    },
  });

  const isEnabled = (key: string) =>
    flags?.find((f) => f.feature_key === key)?.is_enabled ?? false;

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['war-chest-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('war_chest_summary' as never)
        .select('*')
        .maybeSingle();
      if (error && (error as { code?: string }).code !== 'PGRST116') return null;
      return data as WarChestSummaryRow | null;
    },
  });

  const { data: unfundedRows } = useQuery({
    queryKey: ['war-chest-unfunded-marks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('mark_work_records' as never)
        .select('marks_earned')
        .eq('is_funded', false);
      return data || [];
    },
  });

  const { data: allocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['war-chest-allocations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('war_chest_allocations' as never)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return (data || []) as AllocationRow[];
    },
  });

  const totalMarks = num(summary?.total_marks_earned);
  const totalEligible = num(summary?.total_eligible);
  const allocated = num(summary?.total_allocated);
  const availableEligible = num(summary?.available_eligible);

  const notYetEligible = (unfundedRows ?? []).reduce(
    (s, r) => s + num((r as { marks_earned?: unknown }).marks_earned),
    0,
  );
  const meterSum = allocated + availableEligible + notYetEligible;
  const meterDenominator = meterSum > 0 ? meterSum : totalMarks > 0 ? totalMarks : 1;

  const pct = (part: number) => `${Math.max(0, Math.min(100, (part / meterDenominator) * 100))}%`;

  const substFlag = isEnabled('war_chest_substitution');
  const sponsorFlag = isEnabled('war_chest_sponsorship');
  const commissionFlag = isEnabled('war_chest_commission');

  const substituteMutation = useMutation({
    mutationFn: async (amount: number) => {
      const { data, error } = await supabase.functions.invoke('war-chest-substitute', {
        body: { amount },
      });
      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-chest-summary'] });
      queryClient.invalidateQueries({ queryKey: ['war-chest-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['war-chest-unfunded-marks'] });
      queryClient.invalidateQueries({ queryKey: ['lb-cardholder'] });
      setExpanded(null);
      setSubAmount('');
      setFormError(null);
    },
    onError: (e: Error) => {
      setFormError(e.message || 'Substitution failed');
    },
  });

  const sponsorMutation = useMutation({
    mutationFn: async (payload: { amount: number; target_project_id: string; target_bounty_id?: string }) => {
      const { data, error } = await supabase.functions.invoke('war-chest-sponsor', {
        body: payload,
      });
      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-chest-summary'] });
      queryClient.invalidateQueries({ queryKey: ['war-chest-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['war-chest-unfunded-marks'] });
      setExpanded(null);
      setSponsorAmount('');
      setSponsorProjectId('');
      setFormError(null);
    },
    onError: (e: Error) => {
      setFormError(e.message || 'Sponsorship failed');
    },
  });

  const commissionMutation = useMutation({
    mutationFn: async (payload: { amount: number; target_project_id: string; target_bounty_id?: string }) => {
      const { data, error } = await supabase.functions.invoke('war-chest-commission', {
        body: payload,
      });
      if (error) throw error;
      if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['war-chest-summary'] });
      queryClient.invalidateQueries({ queryKey: ['war-chest-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['war-chest-unfunded-marks'] });
      setExpanded(null);
      setCommissionAmount('');
      setCommissionProjectId('');
      setCommissionBountyId('');
      setFormError(null);
    },
    onError: (e: Error) => {
      setFormError(e.message || 'Commission allocation failed');
    },
  });

  const parsedSubAmount = round2(num(subAmount));
  const subPreviewUsd = round2(parsedSubAmount);

  const parsedSponsorAmount = round2(num(sponsorAmount));
  const sponsorSaaPreview = round2(parsedSponsorAmount * 0.1);

  const parsedCommissionAmount = round2(num(commissionAmount));

  const openSection = (next: Expanded) => {
    setFormError(null);
    setExpanded((prev) => (prev === next ? null : next));
  };

  const onConfirmSubstitute = () => {
    setFormError(null);
    if (!substFlag) {
      setFormError('Substitution is not enabled.');
      return;
    }
    if (availableEligible < 1) {
      setFormError('No eligible Marks available to substitute.');
      return;
    }
    if (parsedSubAmount < 1 || parsedSubAmount > round2(availableEligible)) {
      setFormError(`Enter an amount between 1 and ${formatMarks(round2(availableEligible))} Marks.`);
      return;
    }
    substituteMutation.mutate(parsedSubAmount);
  };

  const onConfirmSponsor = () => {
    setFormError(null);
    if (!sponsorFlag) {
      setFormError('Sponsorship is not enabled.');
      return;
    }
    if (!UUID_RE.test(sponsorProjectId.trim())) {
      setFormError('Enter a valid project UUID for sponsorship.');
      return;
    }
    if (parsedSponsorAmount < 1 || parsedSponsorAmount > round2(availableEligible)) {
      setFormError(`Enter an amount between 1 and ${formatMarks(round2(availableEligible))} Marks.`);
      return;
    }
    sponsorMutation.mutate({
      amount: parsedSponsorAmount,
      target_project_id: sponsorProjectId.trim(),
    });
  };

  const onConfirmCommission = () => {
    setFormError(null);
    if (!commissionFlag) {
      setFormError('Commission is not enabled.');
      return;
    }
    if (!UUID_RE.test(commissionProjectId.trim())) {
      setFormError('Enter a valid project UUID.');
      return;
    }
    const bounty = commissionBountyId.trim();
    if (bounty && !UUID_RE.test(bounty)) {
      setFormError('Bounty ID must be a valid UUID when provided.');
      return;
    }
    if (parsedCommissionAmount < 1 || parsedCommissionAmount > round2(availableEligible)) {
      setFormError(`Enter an amount between 1 and ${formatMarks(round2(availableEligible))} Marks.`);
      return;
    }
    commissionMutation.mutate({
      amount: parsedCommissionAmount,
      target_project_id: commissionProjectId.trim(),
      ...(bounty ? { target_bounty_id: bounty } : {}),
    });
  };

  const emptyMarks = !summaryLoading && totalMarks <= 0;

  return (
    <PortalPageLayout
      title="War Chest"
      subtitle="Cooperative Marks, deployment, and your LB Card."
      maxWidth="xl"
      backButton
    >
      <div className="space-y-10">
        {/* Summary hero */}
        <section
          className="rounded-2xl border p-6 sm:p-8 shadow-lg"
          style={
            {
              backgroundColor: NAVY,
              borderColor: `${GOLD}55`,
            } as CSSProperties
          }
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#D4A843]">
                <Swords className="h-6 w-6" aria-hidden />
                <span className="text-sm font-semibold uppercase tracking-wider">War Chest</span>
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Marks balance</h2>
              <p className="max-w-xl text-sm text-slate-300">
                Marks are earned in the cooperative domain. Eligible Marks can be deployed once underlying work is
                funded.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-[#D4A843]" />
              1 Mark = $1 when substituted to your LB Card (cash domain)
            </div>
          </div>

          {summaryLoading ? (
            <p className="mt-8 text-slate-400">Loading summary…</p>
          ) : emptyMarks ? (
            <div className="mt-8 rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center">
              <p className="text-lg font-medium text-white">Your War Chest is ready</p>
              <p className="mt-2 text-sm text-slate-300">
                Start earning Marks by completing work on projects. Your War Chest fills as your contributions are
                funded.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Marks earned</p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-[#D4A843] sm:text-4xl">
                    {formatMarks(totalMarks)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Eligible</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{formatMarks(totalEligible)}</p>
                  <p className="mt-1 text-xs text-slate-400">Ready to deploy when funded</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Allocated</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-white">{formatMarks(allocated)}</p>
                  <p className="mt-1 text-xs text-slate-400">Already deployed</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Available</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-300">
                    {formatMarks(availableEligible)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Ready to deploy now</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Deployment mix</span>
                  <span className="tabular-nums">
                    Not yet eligible (unfunded work):{' '}
                    <span className="font-medium text-slate-200">{formatMarks(notYetEligible)}</span> Marks
                  </span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-[#D4A843] transition-all"
                    style={{ width: pct(allocated) }}
                    title={`Allocated: ${formatMarks(allocated)}`}
                  />
                  <div
                    className="h-full bg-emerald-500/90 transition-all"
                    style={{ width: pct(availableEligible) }}
                    title={`Available: ${formatMarks(availableEligible)}`}
                  />
                  <div
                    className="h-full bg-slate-500/80 transition-all"
                    style={{ width: pct(notYetEligible) }}
                    title={`Not yet eligible: ${formatMarks(notYetEligible)}`}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-4 rounded-sm bg-[#D4A843]" />
                    Allocated
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-4 rounded-sm bg-emerald-500" />
                    Available
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-4 rounded-sm bg-slate-500" />
                    Not yet eligible
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Deploy */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold tracking-tight">Deploy</h3>
          </div>

          {formError && (
            <div
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Substitution */}
            <Card
              className={cn(
                'border-2 transition-colors',
                substFlag ? 'border-emerald-600/40 bg-emerald-50/40 dark:bg-emerald-950/20' : 'opacity-80',
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base">Substitution</CardTitle>
                </div>
                <CardDescription>Get paid — convert eligible Marks into cash on your LB Card.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Available eligible:{' '}
                  <span className="font-semibold text-foreground">{formatMarks(availableEligible)}</span> Marks
                </p>
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!substFlag || substituteMutation.isPending}
                  onClick={() => openSection('substitute')}
                >
                  Get Paid
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {!substFlag && (
                  <p className="text-xs text-muted-foreground">This deployment path is turned off in feature flags.</p>
                )}

                {expanded === 'substitute' && (
                  <div className="space-y-4 rounded-lg border bg-card p-4 shadow-inner">
                    <label className="block text-sm font-medium" htmlFor="sub-amount">
                      Amount (Marks)
                    </label>
                    <Input
                      id="sub-amount"
                      inputMode="decimal"
                      min={1}
                      max={availableEligible > 0 ? availableEligible : undefined}
                      placeholder="1"
                      value={subAmount}
                      onChange={(e) => setSubAmount(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll receive{' '}
                      <span className="font-semibold text-foreground">${subPreviewUsd.toFixed(2)}</span> on your LB Card
                      (before any issuer limits).
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={onConfirmSubstitute}
                        disabled={substituteMutation.isPending || !substFlag}
                      >
                        {substituteMutation.isPending ? 'Working…' : 'Confirm'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setExpanded(null)} type="button">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sponsorship */}
            <Card
              className={cn(
                'border-2 transition-colors',
                sponsorFlag ? 'border-sky-600/40 bg-sky-50/40 dark:bg-sky-950/20' : 'opacity-80',
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-sky-600" />
                  <CardTitle className="text-base">Sponsorship</CardTitle>
                </div>
                <CardDescription>Earn governance — sponsor other projects. Earn IP governance (SAA).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <span
                    className="inline-flex items-center gap-1 font-semibold text-foreground"
                    title="SAA is non-transferable governance weight in the cooperative domain — not currency."
                  >
                    SAA
                    <Shield className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                  </span>{' '}
                  reflects sponsorship weight, not dollars.
                </p>
                <p className="text-sm text-muted-foreground">
                  Available eligible:{' '}
                  <span className="font-semibold text-foreground">{formatMarks(availableEligible)}</span> Marks
                </p>
                <Button
                  className="w-full gap-2 bg-sky-600 hover:bg-sky-700"
                  disabled={!sponsorFlag || sponsorMutation.isPending}
                  onClick={() => openSection('sponsor')}
                >
                  Sponsor
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {!sponsorFlag && (
                  <p className="text-xs text-muted-foreground">This deployment path is turned off in feature flags.</p>
                )}

                {expanded === 'sponsor' && (
                  <div className="space-y-4 rounded-lg border bg-card p-4 shadow-inner">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="sponsor-project">
                        Project ID
                      </label>
                      <Input
                        id="sponsor-project"
                        placeholder="00000000-0000-0000-0000-000000000000"
                        value={sponsorProjectId}
                        onChange={(e) => setSponsorProjectId(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="sponsor-amt">
                        Amount (Marks)
                      </label>
                      <Input
                        id="sponsor-amt"
                        inputMode="decimal"
                        min={1}
                        value={sponsorAmount}
                        onChange={(e) => setSponsorAmount(e.target.value)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll sponsor{' '}
                      <span className="font-semibold text-foreground">${parsedSponsorAmount.toFixed(2)}</span>. Bounty
                      workers get paid. You earn{' '}
                      <span
                        className="font-semibold text-foreground"
                        title="Governance weight (SAA), not cash."
                      >
                        {formatMarks(sponsorSaaPreview)} SAA
                      </span>
                      .
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={onConfirmSponsor} disabled={sponsorMutation.isPending || !sponsorFlag}>
                        {sponsorMutation.isPending ? 'Working…' : 'Confirm Sponsorship'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setExpanded(null)} type="button">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commission */}
            <Card
              className={cn(
                'border-2 transition-colors',
                commissionFlag
                  ? 'border-amber-600/30 bg-amber-50/30 dark:bg-amber-950/15'
                  : 'border-muted bg-muted/30 opacity-90',
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Hammer className={cn('h-5 w-5', commissionFlag ? 'text-amber-700' : 'text-muted-foreground')} />
                    <Lock
                      className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                  <CardTitle className="text-base">Commission</CardTitle>
                </div>
                <CardDescription>Fund bounties on your own project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!commissionFlag && (
                  <p className="text-sm text-muted-foreground">Coming Soon — Pending Tax Counsel</p>
                )}
                {commissionFlag && (
                  <p className="text-sm text-muted-foreground">
                    Allocate eligible Marks to bounties on a project you own. Subject to program rules.
                  </p>
                )}
                <Button
                  className="w-full"
                  variant={commissionFlag ? 'default' : 'secondary'}
                  disabled={!commissionFlag || commissionMutation.isPending}
                  title={
                    commissionFlag
                      ? 'Fund bounties on your project'
                      : 'Locked until tax counsel clears commission design'
                  }
                  onClick={() => commissionFlag && openSection('commission')}
                >
                  {commissionFlag ? (
                    <>
                      Fund Bounties
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Locked
                    </>
                  )}
                </Button>

                {commissionFlag && expanded === 'commission' && (
                  <div className="space-y-4 rounded-lg border bg-card p-4 shadow-inner">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="com-project">
                        Your project ID
                      </label>
                      <Input
                        id="com-project"
                        placeholder="UUID of a project you own"
                        value={commissionProjectId}
                        onChange={(e) => setCommissionProjectId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="com-bounty">
                        Bounty ID (optional)
                      </label>
                      <Input
                        id="com-bounty"
                        placeholder="Optional UUID"
                        value={commissionBountyId}
                        onChange={(e) => setCommissionBountyId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="com-amt">
                        Amount (Marks)
                      </label>
                      <Input
                        id="com-amt"
                        inputMode="decimal"
                        min={1}
                        value={commissionAmount}
                        onChange={(e) => setCommissionAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={onConfirmCommission}
                        disabled={commissionMutation.isPending}
                      >
                        {commissionMutation.isPending ? 'Working…' : 'Confirm Commission'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setExpanded(null)} type="button">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* History */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">Allocation history</h3>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Amount (Marks)</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {allocationsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : !allocations?.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No allocations yet. Deploy eligible Marks to see history here.
                    </td>
                  </tr>
                ) : (
                  allocations.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 align-middle text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 align-middle">{allocationTypeBadge(row.allocation_type)}</td>
                      <td className="px-4 py-3 align-middle tabular-nums font-medium">{formatMarks(num(row.amount))}</td>
                      <td className="px-4 py-3 align-middle">{statusBadge(row.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PortalPageLayout>
  );
}
