import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Zap, DollarSign, Clock, CircleDot } from 'lucide-react';

interface SlingshotSlot {
  id: string;
  shepherd_id: string;
  origin_business_id: string;
  service_type: string;
  generation: number;
  is_active: boolean;
  total_jobs_from_slot: number;
  total_earnings_from_slot: number;
  last_job_at: string | null;
  created_at: string;
}

const GENERATION_LABELS: Record<number, { label: string; desc: string; style: string }> = {
  1: { label: 'Direct', desc: "You're the default designer for their customers", style: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  2: { label: 'Recommended', desc: "You appear as 'recommended' for their customers' customers", style: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  3: { label: 'Reach', desc: 'You appear in general pool with ranking boost', style: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
};

const SERVICE_LABELS: Record<string, string> = {
  cue_card: 'Cue Card',
  logo: 'Logo',
  menu_template: 'Menu Template',
  branding: 'Branding',
  general: 'General',
  photography: 'Photography',
};

export default function ShepherdPipeline() {
  const { user } = useAuth();

  const { data: slots } = useQuery({
    queryKey: ['my-slingshot-slots', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('slingshot_slots' as never)
        .select('*')
        .eq('shepherd_id', user.id)
        .order('created_at', { ascending: false }) as { data: SlingshotSlot[] | null };
      return data || [];
    },
    enabled: !!user,
  });

  const { data: businessNames } = useQuery({
    queryKey: ['slot-business-names', slots?.map(s => s.origin_business_id)],
    queryFn: async () => {
      if (!slots || slots.length === 0) return {};
      const ids = [...new Set(slots.map(s => s.origin_business_id))];
      const nameMap: Record<string, string> = {};
      for (const id of ids) {
        const { data } = await supabase
          .from('storefronts' as never)
          .select('name')
          .eq('id', id)
          .maybeSingle() as { data: { name: string } | null };
        if (data) nameMap[id] = data.name;
      }
      return nameMap;
    },
    enabled: !!slots && slots.length > 0,
  });

  const activeSlots = slots?.filter(s => s.is_active) || [];
  const totalJobs = slots?.reduce((sum, s) => sum + (s.total_jobs_from_slot || 0), 0) || 0;
  const totalEarnings = slots?.reduce((sum, s) => sum + Number(s.total_earnings_from_slot || 0), 0) || 0;

  return (
    <PortalPageLayout
      portalKey="marketplace"
      title="Your Cue Card Slingshot Pipeline"
      description="When you design for a business, their customers see you first."
      icon={<GitBranch className="h-6 w-6" />}
    >
      <div className="space-y-6" data-xray-id="shepherd-pipeline">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Slots', value: activeSlots.length, icon: CircleDot, color: 'text-emerald-500' },
            { label: 'Total Jobs', value: totalJobs, icon: Zap, color: 'text-blue-500' },
            { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'text-amber-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Slots */}
        {(!slots || slots.length === 0) ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold">No pipeline slots yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Submit designs in the Design Arena. When approved, you'll automatically
                become the go-to designer for that business's customers.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {slots.map(slot => {
              const gen = GENERATION_LABELS[slot.generation] || GENERATION_LABELS[1];
              const bizName = businessNames?.[slot.origin_business_id] || 'Unknown Business';

              return (
                <Card key={slot.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{bizName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Type: {SERVICE_LABELS[slot.service_type] || slot.service_type}
                        </p>
                      </div>
                      <Badge variant={slot.is_active ? 'default' : 'outline'}>
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${gen.style}`}>
                      Generation {slot.generation}: {gen.label}
                    </div>
                    <p className="text-xs text-muted-foreground">{gen.desc}</p>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Jobs</p>
                        <p className="font-semibold">{slot.total_jobs_from_slot || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Earnings</p>
                        <p className="font-semibold">${Number(slot.total_earnings_from_slot || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Last Job</p>
                        <p className="font-semibold text-xs">
                          {slot.last_job_at
                            ? new Date(slot.last_job_at).toLocaleDateString()
                            : '—'
                          }
                        </p>
                      </div>
                    </div>
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
