import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Hammer, Package, Star, CheckCircle2, XCircle, Clock, Loader2, DollarSign } from 'lucide-react';

interface ProductionOrder {
  id: string;
  quantity: number;
  unit_cost_cents: number;
  total_cost_cents: number;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  catalog_products: { title: string; slug: string; images: any[] } | null;
}

interface MakerInfo {
  id: string;
  business_name: string;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'New Request', color: 'bg-blue-500' },
  accepted: { label: 'Accepted', color: 'bg-cyan-500' },
  printing: { label: 'Printing', color: 'bg-purple-500' },
  quality_check: { label: 'QC', color: 'bg-amber-500' },
  shipped: { label: 'Shipped', color: 'bg-green-500' },
  delivered: { label: 'Delivered', color: 'bg-emerald-600' },
  disputed: { label: 'Disputed', color: 'bg-red-500' },
};

export default function MakerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: maker } = useQuery({
    queryKey: ['my-maker-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('makers')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as MakerInfo | null;
    },
    enabled: !!user,
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['maker-orders', maker?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_orders')
        .select('*, catalog_products(title, slug, images)')
        .eq('maker_id', maker!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProductionOrder[];
    },
    enabled: !!maker?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('production_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maker-orders'] });
      toast({ title: 'Order updated' });
    },
  });

  const incoming = orders.filter(o => o.status === 'pending');
  const active = orders.filter(o => ['accepted', 'printing', 'quality_check'].includes(o.status));
  const completed = orders.filter(o => ['shipped', 'delivered'].includes(o.status));
  const totalEarned = completed.reduce((sum, o) => sum + o.total_cost_cents, 0);

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Please sign in to access your maker dashboard.</p>
        <Button className="mt-4" onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  if (!maker) {
    return (
      <div className="p-8 text-center space-y-4">
        <Hammer className="w-16 h-16 mx-auto text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">You're not registered as a maker yet</h2>
        <p className="text-muted-foreground">Register your shop to start receiving production orders.</p>
        <Button onClick={() => navigate('/register-maker')}>Register as Maker</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Hammer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Your Forge — {maker.business_name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{Number(maker.rating).toFixed(1)}</span>
              {maker.is_verified && <Badge className="bg-blue-500 text-white text-[10px]">Verified</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{incoming.length}</p><p className="text-xs text-muted-foreground">Incoming</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{active.length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold flex items-center justify-center gap-1"><DollarSign className="w-5 h-5" />{(totalEarned / 100).toLocaleString()}</p><p className="text-xs text-muted-foreground">Earned</p></CardContent></Card>
      </div>

      {/* Incoming Orders */}
      {incoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Incoming Orders ({incoming.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {incoming.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="w-8 h-8 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{o.catalog_products?.title || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">×{o.quantity} — ${(o.total_cost_cents / 100).toLocaleString()}</p>
                    {o.due_date && <p className="text-xs text-muted-foreground">Due: {new Date(o.due_date).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => updateStatusMutation.mutate({ orderId: o.id, newStatus: 'accepted' })}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ orderId: o.id, newStatus: 'disputed' })}>
                    <XCircle className="w-4 h-4 mr-1" />Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Orders */}
      {active.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Active Production ({active.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {active.map(o => {
              const cfg = STATUS_CONFIG[o.status] || { label: o.status, color: 'bg-gray-500' };
              const nextStatus = o.status === 'accepted' ? 'printing' : o.status === 'printing' ? 'quality_check' : 'shipped';
              return (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3 min-w-0">
                    <Package className="w-8 h-8 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{o.catalog_products?.title || 'Product'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`${cfg.color} text-white text-[10px]`}>{cfg.label}</Badge>
                        <span className="text-sm text-muted-foreground">×{o.quantity}</span>
                        {o.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />{new Date(o.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ orderId: o.id, newStatus: nextStatus })}>
                    Advance
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      <Card>
        <CardHeader><CardTitle className="text-base">Completed ({completed.length})</CardTitle></CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No completed orders yet.</p>
          ) : (
            <div className="space-y-2">
              {completed.slice(0, 10).map(o => {
                const cfg = STATUS_CONFIG[o.status] || { label: o.status, color: 'bg-gray-500' };
                return (
                  <div key={o.id} className="flex items-center justify-between p-2 text-sm">
                    <span className="truncate">{o.catalog_products?.title || 'Product'}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span>×{o.quantity}</span>
                      <Badge className={`${cfg.color} text-white text-[10px]`}>{cfg.label}</Badge>
                      <span className="font-medium">${(o.total_cost_cents / 100).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
