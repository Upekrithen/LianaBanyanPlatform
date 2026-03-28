import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Handshake, Plus, Users, Store, ArrowRight, ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react';

type Alliance = {
  id: string;
  name: string;
  description: string | null;
  alliance_type: string;
  creator_id: string;
  max_members: number;
  discount_tier: string;
  is_active: boolean;
  created_at: string;
  member_count?: number;
  creator_name?: string;
};

type CoalitionMember = {
  id: string;
  storefront_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  storefront_name?: string;
  owner_name?: string;
};

type Storefront = {
  id: string;
  name: string;
};

const TIER_COLORS: Record<string, { bg: string; text: string; hex: string; pct: string }> = {
  bronze:   { bg: 'bg-amber-700/10', text: 'text-amber-700', hex: '#CD7F32', pct: '5%' },
  silver:   { bg: 'bg-gray-400/10',  text: 'text-gray-500',  hex: '#C0C0C0', pct: '10%' },
  gold:     { bg: 'bg-yellow-500/10', text: 'text-yellow-600', hex: '#FFD700', pct: '15%' },
  platinum: { bg: 'bg-slate-300/10',  text: 'text-slate-500',  hex: '#E5E4E2', pct: '23%' },
};

const TYPE_LABELS: Record<string, string> = {
  local: 'Local',
  industry: 'Industry',
  regional: 'Regional',
  custom: 'Custom',
};

export default function Coalitions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [userStorefronts, setUserStorefronts] = useState<Storefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailMembers, setDetailMembers] = useState<CoalitionMember[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joinDialog, setJoinDialog] = useState<string | null>(null);
  const [selectedStorefront, setSelectedStorefront] = useState<string>('');

  // Create form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('local');
  const [formMax, setFormMax] = useState(10);

  useEffect(() => { loadData(); }, [user]);

  async function loadData() {
    setLoading(true);

    const { data: allianceData } = await supabase
      .from('coalition_alliances' as never)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false }) as { data: Alliance[] | null };

    if (allianceData) {
      const enriched = await Promise.all(
        allianceData.map(async (a) => {
          const { count } = await supabase
            .from('coalition_members' as never)
            .select('id', { count: 'exact', head: true })
            .eq('alliance_id', a.id)
            .eq('is_active', true) as { count: number | null };

          const { data: creator } = await supabase
            .from('member_profiles' as never)
            .select('display_name')
            .eq('user_id', a.creator_id)
            .maybeSingle() as { data: { display_name: string } | null };

          return { ...a, member_count: count || 0, creator_name: creator?.display_name || 'Unknown' };
        })
      );
      setAlliances(enriched);
    }

    if (user) {
      const { data: sfData } = await supabase
        .from('storefronts' as never)
        .select('id, name')
        .eq('owner_id', user.id) as { data: Storefront[] | null };
      setUserStorefronts(sfData || []);
    }

    setLoading(false);
  }

  async function loadAllianceDetail(allianceId: string) {
    if (expandedId === allianceId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(allianceId);
    setDetailLoading(true);

    const { data: members } = await supabase
      .from('coalition_members' as never)
      .select('*')
      .eq('alliance_id', allianceId)
      .eq('is_active', true) as { data: CoalitionMember[] | null };

    if (members) {
      const enriched = await Promise.all(
        members.map(async (m) => {
          const { data: sf } = await supabase
            .from('storefronts' as never)
            .select('name')
            .eq('id', m.storefront_id)
            .maybeSingle() as { data: { name: string } | null };

          const { data: owner } = await supabase
            .from('member_profiles' as never)
            .select('display_name')
            .eq('user_id', m.member_id)
            .maybeSingle() as { data: { display_name: string } | null };

          return { ...m, storefront_name: sf?.name || 'Unnamed', owner_name: owner?.display_name || 'Unknown' };
        })
      );
      setDetailMembers(enriched);
    }

    setDetailLoading(false);
  }

  async function handleCreate() {
    if (!user || !formName.trim()) return;
    if (userStorefronts.length === 0) {
      toast({ title: 'Storefront Required', description: 'Create a storefront first to start an alliance.', variant: 'destructive' });
      return;
    }

    setCreating(true);

    const { data: newAlliance, error } = await supabase
      .from('coalition_alliances' as never)
      .insert({
        name: formName.trim(),
        description: formDesc.trim() || null,
        alliance_type: formType,
        creator_id: user.id,
        max_members: Math.min(Math.max(formMax, 2), 50),
        discount_tier: 'bronze',
      } as never)
      .select('id')
      .single() as { data: { id: string } | null; error: unknown };

    if (error || !newAlliance) {
      toast({ title: 'Error', description: 'Could not create alliance.', variant: 'destructive' });
      setCreating(false);
      return;
    }

    await supabase.from('coalition_members' as never).insert({
      alliance_id: newAlliance.id,
      storefront_id: userStorefronts[0].id,
      member_id: user.id,
      role: 'founder',
    } as never);

    toast({ title: 'Alliance Created!', description: 'Invite other businesses to join.' });
    setShowCreate(false);
    setFormName('');
    setFormDesc('');
    setFormType('local');
    setFormMax(10);
    setCreating(false);
    loadData();
  }

  async function handleJoin(allianceId: string) {
    if (!user || !selectedStorefront) return;

    await supabase.from('coalition_members' as never).insert({
      alliance_id: allianceId,
      storefront_id: selectedStorefront,
      member_id: user.id,
      role: 'member',
    } as never);

    const alliance = alliances.find(a => a.id === allianceId);

    if (alliance) {
      const { data: profile } = await supabase
        .from('member_profiles' as never)
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle() as { data: { display_name: string } | null };

      const sfName = userStorefronts.find(s => s.id === selectedStorefront)?.name || 'A business';

      await supabase.from('notifications' as never).insert({
        user_id: alliance.creator_id,
        type: 'coalition_member_joined',
        title: 'New Alliance Member!',
        message: `${sfName} (${profile?.display_name || 'Someone'}) joined your ${alliance.name} alliance.`,
        link: '/coalitions',
      } as never);
    }

    toast({ title: 'Joined!', description: 'You are now part of this alliance.' });
    setJoinDialog(null);
    setSelectedStorefront('');
    loadData();
  }

  const tierStyle = (tier: string) => TIER_COLORS[tier] || TIER_COLORS.bronze;

  return (
    <PortalPageLayout title="Coalitions" description="Business alliances with shared discount structures" data-xray-id="coalitions-page">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Handshake className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Coalition Alliances</h2>
              <p className="text-sm text-muted-foreground">{alliances.length} active alliances</p>
            </div>
          </div>

          {userStorefronts.length > 0 && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-1" /> Create Alliance</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a Coalition Alliance</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Alliance Name *</Label>
                    <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Downtown Merchants" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="A group of local businesses offering cross-discounts..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label>Alliance Type</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local (geographic cluster)</SelectItem>
                        <SelectItem value="industry">Industry (same business type)</SelectItem>
                        <SelectItem value="regional">Regional (multi-city)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Members</Label>
                    <Input type="number" value={formMax} onChange={e => setFormMax(parseInt(e.target.value) || 10)} min={2} max={50} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Starting discount tier: <strong>Bronze (5%)</strong>. Tier upgrades are managed by the Board.
                  </div>
                  <Button onClick={handleCreate} disabled={creating || !formName.trim()} className="w-full">
                    {creating ? 'Creating...' : 'Create Alliance'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Alliance Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading alliances...</div>
        ) : alliances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Handshake className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No alliances yet. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alliances.map(a => {
              const ts = tierStyle(a.discount_tier);
              const isFull = (a.member_count || 0) >= a.max_members;
              const isExpanded = expandedId === a.id;

              return (
                <Card key={a.id} className="overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{a.name}</h3>
                        <p className="text-sm text-muted-foreground">Created by {a.creator_name}</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <Badge variant="outline">{TYPE_LABELS[a.alliance_type] || a.alliance_type}</Badge>
                        <Badge style={{ backgroundColor: ts.hex + '22', color: ts.hex, borderColor: ts.hex + '44' }}>
                          {a.discount_tier.charAt(0).toUpperCase() + a.discount_tier.slice(1)} ({ts.pct})
                        </Badge>
                      </div>
                    </div>

                    {a.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{a.member_count} of {a.max_members} businesses</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={() => loadAllianceDetail(a.id)}>
                        {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                        {isExpanded ? 'Hide' : 'View Details'}
                      </Button>

                      {user && userStorefronts.length > 0 && !isFull && a.creator_id !== user.id && (
                        <Dialog open={joinDialog === a.id} onOpenChange={open => { setJoinDialog(open ? a.id : null); setSelectedStorefront(''); }}>
                          <DialogTrigger asChild>
                            <Button size="sm"><ArrowRight className="h-3 w-3 mr-1" /> Apply to Join</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Join {a.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <Label>Select your storefront</Label>
                                <Select value={selectedStorefront} onValueChange={setSelectedStorefront}>
                                  <SelectTrigger><SelectValue placeholder="Choose a storefront" /></SelectTrigger>
                                  <SelectContent>
                                    {userStorefronts.map(sf => (
                                      <SelectItem key={sf.id} value={sf.id}>{sf.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={() => handleJoin(a.id)} disabled={!selectedStorefront} className="w-full">
                                Join Alliance
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {user && userStorefronts.length === 0 && !isFull && a.creator_id !== user.id && (
                        <Button size="sm" variant="secondary" onClick={() => navigate('/tools/storefront-builder')}>
                          <Store className="h-3 w-3 mr-1" /> Create Storefront First
                        </Button>
                      )}

                      {isFull && (
                        <Badge variant="secondary">Full</Badge>
                      )}
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="border-t pt-3 mt-2 space-y-3">
                        {detailLoading ? (
                          <p className="text-sm text-muted-foreground">Loading members...</p>
                        ) : detailMembers.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No members yet.</p>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Members</h4>
                            {detailMembers.map(m => (
                              <div key={m.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                                <div className="flex items-center gap-2">
                                  <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="font-medium">{m.storefront_name}</span>
                                  <span className="text-muted-foreground">({m.owner_name})</span>
                                  {m.role === 'founder' && <Badge variant="default" className="text-[10px] px-1.5 py-0">Founder</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(m.joined_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* How the discount works */}
                        <div className="rounded-lg bg-muted/30 p-4 space-y-2">
                          <h4 className="text-sm font-medium flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5" /> How Coalition Discounts Work
                          </h4>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Coalition members offer cross-discounts to each other's customers.</p>
                            <p>When a customer of Business A shops at Business B:</p>
                            <ul className="list-disc list-inside ml-2 space-y-0.5">
                              <li>They get a <strong>{ts.pct}</strong> discount (based on alliance tier)</li>
                              <li>The discount comes from Business B's margin, not from LB</li>
                              <li>Business B gains a new customer through the alliance</li>
                            </ul>
                            <div className="pt-1.5 flex gap-3 flex-wrap">
                              <span>Bronze: 5%</span>
                              <span>Silver: 10%</span>
                              <span>Gold: 15%</span>
                              <span>Platinum: 23% (max)</span>
                            </div>
                            <p className="pt-1">The Hybrid Discount cap of 23% ensures no business gives away more than the Cost+20% margin allows.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
