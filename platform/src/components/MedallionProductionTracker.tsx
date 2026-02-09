import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FileText 
} from 'lucide-react';

interface MedallionProductionTrackerProps {
  projectId: string;
}

export function MedallionProductionTracker({ projectId }: MedallionProductionTrackerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productionOrders, isLoading } = useQuery({
    queryKey: ['medallion-production', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medallion_production_orders')
        .select(`
          *,
          projects:project_id (
            name,
            project_sku
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('medallion_production_orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medallion-production', projectId] });
      toast({
        title: 'Status Updated',
        description: 'Production status has been updated successfully',
      });
    },
  });

  const statusConfig = {
    pending: {
      label: 'Pending',
      icon: Clock,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
      progress: 0,
    },
    design_approval: {
      label: 'Design Approval',
      icon: FileText,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      progress: 20,
    },
    die_creation: {
      label: 'Die Creation',
      icon: Package,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      progress: 40,
    },
    production: {
      label: 'In Production',
      icon: Package,
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      progress: 60,
    },
    quality_check: {
      label: 'Quality Check',
      icon: CheckCircle2,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
      progress: 80,
    },
    shipping: {
      label: 'Shipping',
      icon: Truck,
      color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
      progress: 90,
    },
    delivered: {
      label: 'Delivered',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      progress: 100,
    },
    cancelled: {
      label: 'Cancelled',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      progress: 0,
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Clock className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!productionOrders || productionOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Production Orders
          </CardTitle>
          <CardDescription>Track your medallion production status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No production orders yet. Create a medallion design to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Production Orders
        </CardTitle>
        <CardDescription>
          Track your medallion production status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {productionOrders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;

          return (
            <div key={order.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </h4>
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.projects?.name} • {order.quantity} units
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">
                    {order.estimated_completion_date
                      ? new Date(order.estimated_completion_date).toLocaleDateString()
                      : 'TBD'}
                  </p>
                  <p className="text-muted-foreground">Est. Completion</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{status.progress}%</span>
                </div>
                <Progress value={status.progress} className="h-2" />
              </div>

              {order.tracking_number && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Tracking:</span>{' '}
                  <span className="font-mono font-medium">{order.tracking_number}</span>
                </div>
              )}

              {order.notes && (
                <div className="text-sm p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Notes: {order.notes}</p>
                </div>
              )}

              {order.status !== 'delivered' && order.status !== 'cancelled' && user && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const statuses = Object.keys(statusConfig);
                      const currentIndex = statuses.indexOf(order.status);
                      if (currentIndex < statuses.length - 2) { // -2 to exclude delivered and cancelled
                        updateStatusMutation.mutate({
                          orderId: order.id,
                          newStatus: statuses[currentIndex + 1],
                        });
                      }
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    Advance Status
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
