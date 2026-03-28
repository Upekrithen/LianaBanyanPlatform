import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Hammer, Star, Search, MapPin, Loader2, Plus } from 'lucide-react';

type CapabilityFilter = 'all' | '3d_printing' | 'cnc' | 'laser' | 'woodwork' | 'metalwork' | 'electronics' | 'resin';

interface Maker {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  capabilities: string[];
  equipment: { name: string; type: string }[];
  location_city: string | null;
  location_state: string | null;
  capacity_weekly: number | null;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
  is_accepting_orders: boolean;
  portfolio_images: { url: string; alt: string }[];
}

const CAPABILITIES: { value: CapabilityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '3d_printing', label: '3D Printing' },
  { value: 'cnc', label: 'CNC' },
  { value: 'laser', label: 'Laser' },
  { value: 'woodwork', label: 'Woodwork' },
  { value: 'metalwork', label: 'Metalwork' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'resin', label: 'Resin' },
];

function MakerCard({ maker, onClick }: { maker: Maker; onClick: () => void }) {
  const caps = (maker.capabilities as string[]) || [];
  const location = [maker.location_city, maker.location_state].filter(Boolean).join(', ');

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5" onClick={onClick}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
            <Hammer className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">{maker.business_name}</h3>
              {maker.is_verified && <Badge className="bg-blue-500 text-white text-[10px] shrink-0">Verified</Badge>}
            </div>
            {location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{location}
              </p>
            )}
          </div>
        </div>

        {maker.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{maker.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {caps.map(c => (
            <Badge key={c} variant="secondary" className="text-[10px]">{c.replace(/_/g, ' ')}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {Number(maker.rating).toFixed(1)} ({maker.completed_orders})
          </span>
          {maker.capacity_weekly && (
            <span className="text-muted-foreground">{maker.capacity_weekly}/wk capacity</span>
          )}
          {maker.is_accepting_orders ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[10px]">Accepting Orders</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">Full</Badge>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
          <Button size="sm" className="flex-1" disabled={!maker.is_accepting_orders}>Hire</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MakerDirectory() {
  const navigate = useNavigate();
  const [capability, setCapability] = useState<CapabilityFilter>('all');
  const [search, setSearch] = useState('');

  const { data: makers = [], isLoading } = useQuery({
    queryKey: ['makers', capability, search],
    queryFn: async () => {
      let q = supabase
        .from('makers')
        .select('*')
        .order('is_verified', { ascending: false })
        .order('rating', { ascending: false });

      if (search) q = q.ilike('business_name', `%${search}%`);
      if (capability !== 'all') q = q.contains('capabilities', [capability]);

      const { data, error } = await q.limit(50);
      if (error) throw error;
      return (data || []) as Maker[];
    },
  });

  return (
    <PortalPageLayout title="The Forge — Maker Directory" subtitle="Skilled makers ready to bring your designs to life. All pricing at Cost+20%.">
      <div className="space-y-6">
        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search makers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => navigate('/register-maker')}>
              <Plus className="w-4 h-4 mr-2" />Register
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CAPABILITIES.map(c => (
              <Button
                key={c.value}
                variant={capability === c.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCapability(c.value)}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Maker Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : makers.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30" />
            <h3 className="text-lg font-medium">Be the first maker in your area</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Register your 3D printer, CNC, laser cutter, or workshop and start taking production orders.
            </p>
            <Button onClick={() => navigate('/register-maker')}>
              <Plus className="w-4 h-4 mr-2" />Register as a Maker
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {makers.map(m => (
              <MakerCard key={m.id} maker={m} onClick={() => navigate(`/makers/${m.slug}`)} />
            ))}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
