/**
 * Housing — Mission TWO: "Everyone Has Shelter"
 * Cooperative housing hub with 4 tabs:
 * Available Properties | My Housing | Contribute | Housing Fund
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Home, Search, DollarSign, Building2, Zap, Check, ArrowRight, Calendar, MapPin } from 'lucide-react';

import PropertyCard, { type HousingProperty } from '@/components/housing/PropertyCard';
import ContributionForm from '@/components/housing/ContributionForm';
import WaterWheelDashboard from '@/components/housing/WaterWheelDashboard';
import VacationNetwork from '@/components/housing/VacationNetwork';

const MISSION_PILLS = [
  { num: 'ONE', label: 'Food', done: true },
  { num: 'TWO', label: 'Shelter', done: false, current: true },
  { num: 'THREE', label: 'Transport', done: true },
];

export default function Housing() {
  const { user } = useAuth();
  const [tab, setTab] = useState('available');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [citySearch, setCitySearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [contributeProperty, setContributeProperty] = useState<HousingProperty | null>(null);

  const { data: properties = [] } = useQuery({
    queryKey: ['housing-properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('housing_properties')
        .select('*')
        .order('created_at', { ascending: false });
      return (data || []) as HousingProperty[];
    },
  });

  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (typeFilter !== 'all') result = result.filter(p => p.property_type === typeFilter);
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (citySearch) {
      const q = citySearch.toLowerCase();
      result = result.filter(p => p.city.toLowerCase().includes(q) || (p.state?.toLowerCase().includes(q)));
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [properties, typeFilter, statusFilter, citySearch, sortBy]);

  // My Housing data
  const { data: myContributions = [] } = useQuery({
    queryKey: ['my-housing-contributions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('housing_contributions')
        .select('*, property:property_id (title)')
        .eq('contributor_id', user!.id)
        .order('created_at', { ascending: false });
      return (data || []).map((c: any) => ({
        ...c,
        property: Array.isArray(c.property) ? c.property[0] : c.property,
      }));
    },
  });

  const { data: myOccupancy } = useQuery({
    queryKey: ['my-housing-occupancy', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('housing_occupancy')
        .select('*, property:property_id (title, city, state)')
        .eq('member_id', user!.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (!data) return null;
      return { ...data, property: Array.isArray(data.property) ? data.property[0] : data.property };
    },
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['my-vacation-bookings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('vacation_bookings')
        .select('*, listing:listing_id (property:property_id (title, city))')
        .eq('guest_id', user!.id)
        .order('check_in', { ascending: false });
      return (data || []).map((b: any) => ({
        ...b,
        listing: Array.isArray(b.listing) ? b.listing[0] : b.listing,
      }));
    },
  });

  // Fund stats
  const { data: fundStats } = useQuery({
    queryKey: ['housing-fund-stats'],
    queryFn: async () => {
      const { data: contribs } = await supabase
        .from('housing_contributions')
        .select('amount')
        .eq('verified', true);
      const totalFund = (contribs || []).reduce((s, c) => s + (c.amount || 0), 0);
      const ownedCount = properties.filter(p => p.status === 'owned').length;
      return { totalFund, ownedCount };
    },
  });

  const myContribTotal = myContributions.reduce((s: number, c: any) => s + (c.amount || 0), 0);
  const waterwheelImpact = myContribTotal * 2.23;

  const handleContribute = (prop: HousingProperty) => {
    setContributeProperty(prop);
    setTab('contribute');
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="housing-mission-two">
      {/* Mission TWO Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-green-900 to-green-700 p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {MISSION_PILLS.map(m => (
            <div
              key={m.num}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                m.current
                  ? 'bg-white/15 border-white/40 text-white ring-2 ring-white/20 ring-offset-1 ring-offset-green-800'
                  : m.done
                    ? 'bg-green-600/30 border-green-400/30 text-green-200'
                    : 'bg-white/5 border-white/10 text-green-300'
              }`}
            >
              {m.done && <Check className="w-3 h-3" />}
              {m.num} {m.current && '←'}
            </div>
          ))}
        </div>
        <p className="text-green-200 text-xs font-medium uppercase tracking-wider mb-1">Mission TWO</p>
        <h1 className="text-3xl font-bold text-white mb-2">Everyone Has Shelter</h1>
        <p className="text-green-100/80 text-sm max-w-xl">
          Cooperative housing — built by members, owned by the cooperative, priced at Cost+20%.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="available">Properties</TabsTrigger>
          <TabsTrigger value="my-housing">My Housing</TabsTrigger>
          <TabsTrigger value="contribute">Contribute</TabsTrigger>
          <TabsTrigger value="fund">Housing Fund</TabsTrigger>
        </TabsList>

        {/* Tab 1: Available Properties */}
        <TabsContent value="available">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="garage">Garage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="acquiring">Acquiring</SelectItem>
                  <SelectItem value="owned">Owned</SelectItem>
                  <SelectItem value="leased">Leased</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  placeholder="Search by city..."
                  className="pl-9"
                />
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No properties yet. Be the first to contribute.</p>
                <Button className="mt-4" onClick={() => setTab('contribute')}>
                  Contribute <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map(p => (
                  <PropertyCard key={p.id} property={p} onContribute={handleContribute} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: My Housing */}
        <TabsContent value="my-housing">
          <div className="space-y-6">
            {/* My Occupancy */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Home className="w-5 h-5" /> My Occupancy</CardTitle></CardHeader>
              <CardContent>
                {myOccupancy ? (
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <Home className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium">{myOccupancy.property?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {myOccupancy.property?.city}{myOccupancy.property?.state ? `, ${myOccupancy.property.state}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{myOccupancy.role}</Badge>
                        <span className="text-xs text-muted-foreground">Since {new Date(myOccupancy.move_in_date).toLocaleDateString()}</span>
                        {myOccupancy.monthly_rate && (
                          <span className="text-xs text-green-400">{myOccupancy.monthly_rate} {myOccupancy.currency}/mo</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No current housing assignment. Browse available properties to get started.</p>
                )}
              </CardContent>
            </Card>

            {/* My Contributions */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5" /> My Contributions</CardTitle></CardHeader>
              <CardContent>
                {myContributions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No contributions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {myContributions.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-sm">
                        <div>
                          <span className="font-medium capitalize">{c.contribution_type.replace(/_/g, ' ')}</span>
                          {c.property && <span className="text-xs text-muted-foreground ml-2">→ {c.property.title}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.amount} {c.currency}</span>
                          <Badge variant="outline" className={`text-[10px] ${c.verified ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'}`}>
                            {c.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* WaterWheel Impact */}
            <Card className="border-emerald-500/20">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-400" /> My WaterWheel Impact</CardTitle></CardHeader>
              <CardContent>
                {myContribTotal > 0 ? (
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-emerald-400">{waterwheelImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-muted-foreground">estimated cooperative value from {myContribTotal.toLocaleString()} in contributions (×2.23)</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Contribute to see your WaterWheel impact.</p>
                )}
              </CardContent>
            </Card>

            {/* My Bookings */}
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="w-5 h-5" /> My Vacation Bookings</CardTitle></CardHeader>
              <CardContent>
                {myBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No bookings yet. Browse the Vacation Network to find a stay.</p>
                ) : (
                  <div className="space-y-2">
                    {myBookings.map((b: any) => {
                      const prop = b.listing?.property;
                      return (
                        <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 text-sm">
                          <div>
                            <p className="font-medium">{prop?.title || 'Property'}</p>
                            <p className="text-xs text-muted-foreground">{b.check_in} → {b.check_out}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{b.total_cost} {b.currency}</span>
                            <Badge variant="outline" className="text-[10px] capitalize">{b.status}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Contribute */}
        <TabsContent value="contribute">
          <div className="space-y-6">
            {/* Context cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">How It Works</p>
                  <p className="text-sm font-medium">Contribute → Acquire → Subsidize</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Pool resources to buy properties. AirBnB revenue subsidizes housing at Cost+20%.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current Fund Balance</p>
                  <p className="text-2xl font-bold text-emerald-400">${(fundStats?.totalFund ?? 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Verified contributions</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Properties Acquired</p>
                  <p className="text-2xl font-bold text-foreground">{fundStats?.ownedCount ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Cooperatively owned</p>
                </CardContent>
              </Card>
            </div>

            <ContributionForm preselectedProperty={contributeProperty} />
          </div>
        </TabsContent>

        {/* Tab 4: Housing Fund */}
        <TabsContent value="fund">
          <div className="space-y-6">
            {/* Pipeline */}
            {properties.filter(p => ['proposed', 'acquiring'].includes(p.status)).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Properties in Pipeline</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.filter(p => ['proposed', 'acquiring'].includes(p.status)).map(p => (
                    <PropertyCard key={p.id} property={p} onContribute={handleContribute} />
                  ))}
                </div>
              </div>
            )}

            {/* Owned */}
            {properties.filter(p => p.status === 'owned').length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Properties Owned</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.filter(p => p.status === 'owned').map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}

            {/* WaterWheel Dashboard */}
            <WaterWheelDashboard />

            {/* Vacation Network */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Member Vacation Network</h3>
              <VacationNetwork />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
