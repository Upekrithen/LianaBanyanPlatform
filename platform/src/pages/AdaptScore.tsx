import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdaptScoreCard, FRIENDLY_NAMES } from '@/components/adapt/AdaptScoreCard';
import { AdaptRadarChart } from '@/components/adapt/AdaptRadarChart';
import { SOPPipeline } from '@/components/adapt/SOPPipeline';
import { BountyCard } from '@/components/adapt/BountyCard';
import { runConstitutionalCheck } from '@/lib/constitutionalCheck';
import { BarChart3, ExternalLink, X, Globe, Shield, Coins, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Baseline {
  id: string;
  system_id: string;
  initiative_id: number | null;
  baseline_config: Record<string, unknown>;
}

interface ScoreRow {
  system_id: string;
  dimension: string;
  score: number;
}

interface SOPRow {
  id: string;
  node_id: string | null;
  system_id: string;
  title: string;
  modification_description: string;
  status: string;
  constitutional_violation: boolean;
  initiative_violation: boolean;
  adapt_impact: number | null;
  approved_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface PartnerRow {
  id: string;
  name: string;
  type: string;
  tier: string;
  adapt_score: number | null;
  website: string | null;
  contact_info: Record<string, unknown>;
  created_at: string;
}

interface BountyRow {
  id: string;
  partner_id: string;
  title: string;
  description: string | null;
  reward_credits: number;
  status: string;
  claimed_by: string | null;
  completed_at: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DIMENSIONS = ['effectiveness', 'adaptability', 'durability', 'alignment', 'participation', 'transmission'] as const;

function computeComposite(scores: Record<string, number>): number {
  const vals = DIMENSIONS.map((d) => scores[d] ?? 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function getTierInfo(composite: number) {
  if (composite >= 90) return { label: 'Platinum', color: 'bg-gray-300 text-gray-800', barColor: 'bg-gray-300' };
  if (composite >= 75) return { label: 'Gold', color: 'bg-yellow-400 text-yellow-900', barColor: 'bg-yellow-400' };
  if (composite >= 60) return { label: 'Silver', color: 'bg-gray-400 text-gray-900', barColor: 'bg-gray-400' };
  if (composite >= 40) return { label: 'Bronze', color: 'bg-orange-400 text-orange-900', barColor: 'bg-orange-400' };
  return { label: 'Red Flag', color: 'bg-red-600 text-white', barColor: 'bg-red-500' };
}

const SOP_STATUSES = ['all', 'proposed', 'constitutional_check', 'initiative_check', 'approved', 'rejected', 'monitoring', 'promoted', 'rolled_back'];

const PARTNER_TYPES: Record<string, string> = {
  credit_union: 'Credit Union',
  food_coop: 'Food Co-op',
  housing_coop: 'Housing Co-op',
  worker_coop: 'Worker Co-op',
  agricultural_coop: 'Agricultural Co-op',
  other: 'Other',
};

const TIER_DISPLAY: Record<string, { label: string; color: string }> = {
  data_mirror: { label: 'Data Mirror', color: 'bg-gray-200 text-gray-700' },
  credit_bridge: { label: 'Credit Bridge', color: 'bg-blue-200 text-blue-800' },
  full_mesh: { label: 'Full Mesh', color: 'bg-green-200 text-green-800' },
};

/* ------------------------------------------------------------------ */
/*  Data Hooks                                                         */
/* ------------------------------------------------------------------ */

function useBaselines() {
  return useQuery({
    queryKey: ['adapt-baselines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adapt_baselines' as never)
        .select('*') as { data: Baseline[] | null; error: unknown };
      if (error) throw error;
      return (data ?? []) as Baseline[];
    },
  });
}

function useLatestScores() {
  return useQuery({
    queryKey: ['adapt-scores-latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adapt_scores' as never)
        .select('system_id, dimension, score')
        .order('measured_at', { ascending: false }) as { data: ScoreRow[] | null; error: unknown };
      if (error) throw error;
      const map: Record<string, Record<string, number>> = {};
      for (const row of data ?? []) {
        if (!map[row.system_id]) map[row.system_id] = {};
        if (map[row.system_id][row.dimension] === undefined) {
          map[row.system_id][row.dimension] = Number(row.score);
        }
      }
      return map;
    },
  });
}

function useSOPs() {
  return useQuery({
    queryKey: ['local-sops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('local_sop' as never)
        .select('*')
        .order('created_at', { ascending: false }) as { data: SOPRow[] | null; error: unknown };
      if (error) throw error;
      return (data ?? []) as SOPRow[];
    },
  });
}

function usePartners() {
  return useQuery({
    queryKey: ['integration-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_partners' as never)
        .select('*')
        .order('created_at', { ascending: false }) as { data: PartnerRow[] | null; error: unknown };
      if (error) throw error;
      return (data ?? []) as PartnerRow[];
    },
  });
}

function useBounties() {
  return useQuery({
    queryKey: ['integration-bounties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_bounties' as never)
        .select('*')
        .order('created_at', { ascending: false }) as { data: BountyRow[] | null; error: unknown };
      if (error) throw error;
      return (data ?? []) as BountyRow[];
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdaptScore() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') ?? 'dashboard';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto" data-xray-id="adapt-score-page">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">ADAPT Score</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Measuring what matters. Adapting what works.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="local-sop">Local SOP</TabsTrigger>
          <TabsTrigger value="partners">Integration Partners</TabsTrigger>
          <TabsTrigger value="bounties">Bounties</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="local-sop"><LocalSOPTab /></TabsContent>
        <TabsContent value="partners"><PartnersTab /></TabsContent>
        <TabsContent value="bounties"><BountiesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TAB 1: Dashboard                                                   */
/* ------------------------------------------------------------------ */

function DashboardTab() {
  const { data: baselines = [] } = useBaselines();
  const { data: scoresMap = {} } = useLatestScores();
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  const systemScores = baselines.map((b) => {
    const scores = scoresMap[b.system_id] ?? {};
    const composite = computeComposite(scores);
    return { ...b, scores, composite };
  });

  const platformComposite =
    systemScores.length > 0
      ? systemScores.reduce((s, sys) => s + sys.composite, 0) / systemScores.length
      : 0;
  const platformTier = getTierInfo(platformComposite);

  const tierCounts = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0, 'Red Flag': 0 };
  systemScores.forEach((s) => {
    const t = getTierInfo(s.composite);
    tierCounts[t.label as keyof typeof tierCounts]++;
  });
  const total = systemScores.length || 1;

  const hasScores = Object.keys(scoresMap).length > 0;

  return (
    <div className="space-y-6">
      {/* Platform-wide banner */}
      <Card>
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">Platform-Wide ADAPT Score</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-bold">{platformComposite.toFixed(0)}</span>
              <Badge className={cn('text-sm', platformTier.color)}>{platformTier.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{systemScores.length} systems measured</p>
          </div>

          {/* Tier distribution bar */}
          <div className="flex-1 w-full">
            <p className="text-xs text-muted-foreground mb-1">Tier Distribution</p>
            <div className="flex h-5 rounded overflow-hidden w-full">
              {Object.entries(tierCounts).map(([label, count]) => {
                const pct = (count / total) * 100;
                if (pct === 0) return null;
                const info = getTierInfo(
                  label === 'Platinum' ? 95 : label === 'Gold' ? 80 : label === 'Silver' ? 65 : label === 'Bronze' ? 50 : 20
                );
                return (
                  <div
                    key={label}
                    className={cn('flex items-center justify-center text-[10px] font-bold', info.barColor)}
                    style={{ width: `${pct}%` }}
                    title={`${label}: ${count}`}
                  >
                    {count > 0 && count}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
              <span>Platinum</span><span>Gold</span><span>Silver</span><span>Bronze</span><span>Red Flag</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasScores && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            ADAPT measurements begin when members start using the platform. Scores update automatically based on participation data.
          </CardContent>
        </Card>
      )}

      {/* System grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemScores.map((sys) => (
          <div key={sys.system_id}>
            <AdaptScoreCard
              systemId={sys.system_id}
              systemName={FRIENDLY_NAMES[sys.system_id] ?? sys.system_id}
              route={(sys.baseline_config as Record<string, string>)?.route ?? undefined}
              scores={sys.scores}
              onClick={() => setExpanded(expanded === sys.system_id ? null : sys.system_id)}
            />

            {expanded === sys.system_id && (
              <Card className="mt-2 border-primary/30">
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">{FRIENDLY_NAMES[sys.system_id] ?? sys.system_id}</h4>
                    <button onClick={() => setExpanded(null)}><X className="h-4 w-4" /></button>
                  </div>

                  <div className="flex justify-center">
                    <AdaptRadarChart
                      scores={{
                        effectiveness: sys.scores.effectiveness ?? 0,
                        adaptability: sys.scores.adaptability ?? 0,
                        durability: sys.scores.durability ?? 0,
                        alignment: sys.scores.alignment ?? 0,
                        participation: sys.scores.participation ?? 0,
                        transmission: sys.scores.transmission ?? 0,
                      }}
                      size="lg"
                    />
                  </div>

                  {(sys.baseline_config as Record<string, string>)?.route && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate((sys.baseline_config as Record<string, string>).route)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Go to {FRIENDLY_NAMES[sys.system_id]}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TAB 2: Local SOP                                                   */
/* ------------------------------------------------------------------ */

function LocalSOPTab() {
  const { data: sops = [] } = useSOPs();
  const { data: baselines = [] } = useBaselines();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formSystem, setFormSystem] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const pipelineCounts: Record<string, number> = {};
  sops.forEach((s) => { pipelineCounts[s.status] = (pipelineCounts[s.status] ?? 0) + 1; });

  const filtered = sops.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (systemFilter !== 'all' && s.system_id !== systemFilter) return false;
    return true;
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      if (formDesc.length < 50) throw new Error('Description must be at least 50 characters');

      const baseline = baselines.find((b) => b.system_id === formSystem);
      const check = runConstitutionalCheck(formSystem, formDesc, baseline?.baseline_config as { constitutional_rules?: string[] } | null);

      let finalStatus = 'proposed';
      if (check.constitutionalViolation) finalStatus = 'rejected';
      else if (!check.autoApproved) finalStatus = 'constitutional_check';
      else finalStatus = 'approved';

      const { data: inserted, error } = await supabase
        .from('local_sop' as never)
        .insert({
          system_id: formSystem,
          title: formTitle,
          modification_description: formDesc,
          status: finalStatus,
          constitutional_violation: check.constitutionalViolation,
          initiative_violation: check.initiativeViolation,
          adapt_impact: check.autoApproved ? 0 : null,
          approved_at: finalStatus === 'approved' ? new Date().toISOString() : null,
          created_by: user.id,
        } as never)
        .select()
        .single() as { data: SOPRow | null; error: unknown };

      if (error) throw error;

      await supabase.from('sop_adaptations' as never).insert({
        local_sop_id: inserted!.id,
        proposed_change: formDesc,
        constitutional_check_passed: !check.constitutionalViolation,
        initiative_check_passed: !check.initiativeViolation,
        auto_approved: check.autoApproved,
        adapt_delta: check.autoApproved ? 0 : null,
      } as never);

      return { check, finalStatus };
    },
    onSuccess: ({ check, finalStatus }) => {
      qc.invalidateQueries({ queryKey: ['local-sops'] });
      setShowForm(false);
      setFormSystem('');
      setFormTitle('');
      setFormDesc('');

      if (check.constitutionalViolation) {
        toast({ title: 'Rejected', description: check.reason, variant: 'destructive' });
      } else if (!check.autoApproved) {
        toast({ title: 'Sent for Review', description: check.reason ?? 'Flagged for manual review.' });
      } else {
        toast({ title: 'Auto-Approved', description: 'Adaptation approved and entering 30-day monitoring.' });
      }
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      <SOPPipeline
        counts={pipelineCounts}
        onStageClick={(status) => setStatusFilter(status)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {SOP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter system" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            {baselines.map((b) => (
              <SelectItem key={b.system_id} value={b.system_id}>
                {FRIENDLY_NAMES[b.system_id] ?? b.system_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Adaptation
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-sm">Propose Adaptation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>System</Label>
              <Select value={formSystem} onValueChange={setFormSystem}>
                <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
                <SelectContent>
                  {baselines.map((b) => (
                    <SelectItem key={b.system_id} value={b.system_id}>
                      {FRIENDLY_NAMES[b.system_id] ?? b.system_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Brief title" />
            </div>
            <div>
              <Label>Modification Description (min 50 chars)</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Describe the proposed adaptation..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">{formDesc.length}/50 characters minimum</p>
            </div>
            <Button
              disabled={!formSystem || !formTitle || formDesc.length < 50 || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No SOP adaptations found. Be the first to propose one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((sop) => (
            <Card key={sop.id} data-xray-id={`sop-${sop.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm">{sop.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {FRIENDLY_NAMES[sop.system_id] ?? sop.system_id} &middot; {new Date(sop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sop.constitutional_violation && <Badge variant="destructive" className="text-xs">Constitutional</Badge>}
                    {sop.initiative_violation && <Badge variant="destructive" className="text-xs">Initiative</Badge>}
                    <Badge className={cn(
                      'text-xs',
                      sop.status === 'approved' && 'bg-green-100 text-green-800',
                      sop.status === 'rejected' && 'bg-red-100 text-red-800',
                      sop.status === 'proposed' && 'bg-blue-100 text-blue-800',
                      sop.status === 'monitoring' && 'bg-yellow-100 text-yellow-800',
                      sop.status === 'promoted' && 'bg-purple-100 text-purple-800',
                      sop.status === 'rolled_back' && 'bg-orange-100 text-orange-800',
                    )}>
                      {sop.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{sop.modification_description}</p>
                {sop.adapt_impact !== null && (
                  <p className="text-xs mt-1">ADAPT Impact: <span className="font-bold">{sop.adapt_impact > 0 ? '+' : ''}{sop.adapt_impact}</span></p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TAB 3: Integration Partners                                        */
/* ------------------------------------------------------------------ */

function PartnersTab() {
  const { data: partners = [] } = usePartners();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addPartner = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('integration_partners' as never).insert({
        name: formName,
        type: formType,
        tier: 'data_mirror',
        website: formWebsite || null,
        contact_info: formNotes ? { note: formNotes } : {},
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-partners'] });
      setShowForm(false);
      setFormName(''); setFormType(''); setFormWebsite(''); setFormNotes('');
      toast({ title: 'Partner Added', description: 'Integration partner proposed at Data Mirror tier.' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Integration Partners</h2>
        {user && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> Propose Partnership
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Partner Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Organization name" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PARTNER_TYPES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Website</Label>
              <Input value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional context..." rows={2} />
            </div>
            <Button disabled={!formName || !formType || addPartner.isPending} onClick={() => addPartner.mutate()}>
              {addPartner.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </CardContent>
        </Card>
      )}

      {partners.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No integration partners yet. As Liana Banyan grows, cooperatives in your area can connect their systems to share resources.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => {
            const tierInfo = TIER_DISPLAY[p.tier] ?? TIER_DISPLAY.data_mirror;
            return (
              <Card key={p.id} data-xray-id={`partner-${p.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm">{p.name}</h3>
                    <Badge className={cn('text-xs', tierInfo.color)}>{tierInfo.label}</Badge>
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {PARTNER_TYPES[p.type] ?? p.type}
                  </Badge>
                  {p.adapt_score !== null && (
                    <p className="text-xs text-muted-foreground">ADAPT: {p.adapt_score}</p>
                  )}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-2">
                      <Globe className="h-3 w-3" /> Website
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs"
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    {expandedId === p.id ? 'Hide Details' : 'View Details'}
                  </Button>
                  {expandedId === p.id && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(p.contact_info, null, 2)}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TAB 4: Bounties                                                    */
/* ------------------------------------------------------------------ */

function BountiesTab() {
  const { data: bounties = [] } = useBounties();
  const { data: partners = [] } = usePartners();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPartner, setNewPartner] = useState('');
  const [newReward, setNewReward] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const partnerMap: Record<string, string> = {};
  partners.forEach((p) => { partnerMap[p.id] = p.name; });

  const active = bounties.filter((b) => !['completed', 'cancelled'].includes(b.status));
  const completed = bounties.filter((b) => b.status === 'completed');

  const claimBounty = useMutation({
    mutationFn: async (bountyId: string) => {
      const { error } = await supabase
        .from('integration_bounties' as never)
        .update({ status: 'claimed', claimed_by: user?.id } as never)
        .eq('id', bountyId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-bounties'] });
      toast({ title: 'Bounty Claimed', description: 'Good luck!' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ bountyId, newStatus }: { bountyId: string; newStatus: string }) => {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'completed') updates.completed_at = new Date().toISOString();
      const { error } = await supabase
        .from('integration_bounties' as never)
        .update(updates as never)
        .eq('id', bountyId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-bounties'] });
      toast({ title: 'Status Updated' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const createBounty = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('integration_bounties' as never).insert({
        partner_id: newPartner,
        title: newTitle,
        description: newDesc,
        reward_credits: parseFloat(newReward),
        status: 'open',
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integration-bounties'] });
      setShowCreateForm(false);
      setNewTitle(''); setNewDesc(''); setNewPartner(''); setNewReward('');
      toast({ title: 'Bounty Created' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Coins className="h-5 w-5" /> Integration Bounties
        </h2>
        {user && (
          <Button size="sm" variant="outline" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-1" /> Create Bounty
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Partner</Label>
              <Select value={newPartner} onValueChange={setNewPartner}>
                <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
                <SelectContent>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Bounty title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What needs to be built..." rows={3} />
            </div>
            <div>
              <Label>Reward (Credits)</Label>
              <Input type="number" value={newReward} onChange={(e) => setNewReward(e.target.value)} placeholder="500" />
            </div>
            <Button disabled={!newPartner || !newTitle || !newReward || createBounty.isPending} onClick={() => createBounty.mutate()}>
              {createBounty.isPending ? 'Creating...' : 'Create Bounty'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Bounties */}
      {active.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No active bounties. Check back soon or create one above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {active.map((b) => (
            <BountyCard
              key={b.id}
              bounty={{
                ...b,
                description: b.description ?? '',
                partner_name: partnerMap[b.partner_id] ?? 'Unknown',
                claimed_by: b.claimed_by ?? undefined,
                completed_at: b.completed_at ?? undefined,
              }}
              currentUserId={user?.id}
              isAdmin={true}
              onClaim={(id) => claimBounty.mutate(id)}
              onStatusChange={(id, status) => updateStatus.mutate({ bountyId: id, newStatus: status })}
            />
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {showCompleted ? '▾' : '▸'} Completed Bounties ({completed.length})
          </button>
          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {completed.map((b) => (
                <BountyCard
                  key={b.id}
                  bounty={{
                    ...b,
                    description: b.description ?? '',
                    partner_name: partnerMap[b.partner_id] ?? 'Unknown',
                    claimed_by: b.claimed_by ?? undefined,
                    completed_at: b.completed_at ?? undefined,
                  }}
                  currentUserId={user?.id}
                  isAdmin={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
