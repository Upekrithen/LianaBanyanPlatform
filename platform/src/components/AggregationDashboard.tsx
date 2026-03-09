/**
 * Aggregation Dashboard Component
 * ================================
 * Shows users their active aggregation windows, progress towards thresholds,
 * and options to opt-in/opt-out.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Percent,
  MapPin,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { DemandAggregationExplainer, AggregationMiniExplainer } from '@/components/DemandAggregationExplainer';
import {
  getMyAggregationWindows,
  getMyPendingDemand,
  getAggregatedShoppingList,
  optOutOfAggregation,
  optInToAggregation,
  formatAggregationStatus,
  getThresholdProgress,
  getTimeRemaining,
  type AggregationWindow,
  type AggregationParticipant,
  type AggregatedShoppingItem,
} from '@/lib/demandAggregationService';
import { cn } from '@/lib/utils';

interface AggregationDashboardProps {
  zipCode?: string;
}

export function AggregationDashboard({ zipCode }: AggregationDashboardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedWindow, setSelectedWindow] = useState<AggregationWindow | null>(null);
  const [showOptInDialog, setShowOptInDialog] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Fetch user's aggregation windows
  const { data: windowsData = [], isLoading } = useQuery({
    queryKey: ['my-aggregation-windows'],
    queryFn: getMyAggregationWindows,
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Fetch pending demand
  const { data: pendingDemand = [] } = useQuery({
    queryKey: ['my-pending-demand'],
    queryFn: getMyPendingDemand,
    enabled: !!user,
  });

  // Fetch shopping list for selected window
  const { data: shoppingList = [] } = useQuery({
    queryKey: ['aggregated-shopping-list', selectedWindow?.id],
    queryFn: () => selectedWindow ? getAggregatedShoppingList(selectedWindow.id) : Promise.resolve([]),
    enabled: !!selectedWindow,
  });

  // Opt out mutation
  const optOutMutation = useMutation({
    mutationFn: (windowId: string) => optOutOfAggregation(windowId),
    onSuccess: () => {
      toast.success('Opted out - you can now shop for these items yourself');
      queryClient.invalidateQueries({ queryKey: ['my-aggregation-windows'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-demand'] });
    },
    onError: (error: any) => {
      toast.error('Failed to opt out: ' + error.message);
    },
  });

  // Opt in mutation
  const optInMutation = useMutation({
    mutationFn: (params: { windowId: string; address: string; instructions?: string }) =>
      optInToAggregation(params.windowId, params.address, params.instructions),
    onSuccess: () => {
      toast.success('Opted in! You\'ll be notified when delivery is ready');
      queryClient.invalidateQueries({ queryKey: ['my-aggregation-windows'] });
      setShowOptInDialog(false);
    },
    onError: (error: any) => {
      toast.error('Failed to opt in: ' + error.message);
    },
  });

  const handleOptIn = () => {
    if (!selectedWindow || !deliveryAddress.trim()) return;
    optInMutation.mutate({
      windowId: selectedWindow.id,
      address: deliveryAddress,
      instructions: deliveryInstructions,
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p>Sign in to see aggregated orders in your area</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading your aggregation windows...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Demand Aggregation
          </h2>
          <p className="text-muted-foreground text-sm">
            Your orders combine with neighbors for volume discounts
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExplainer(true)}
          className="gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          How It Works
        </Button>
      </div>

      {/* Explainer Dialog */}
      <DemandAggregationExplainer
        open={showExplainer}
        onOpenChange={setShowExplainer}
        autoExpandSection="flow"
      />

      {/* Mini Explainer for new users */}
      {windowsData.length === 0 && pendingDemand.length === 0 && (
        <AggregationMiniExplainer />
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pendingDemand.length}</div>
              <div className="text-sm text-muted-foreground">Items Needed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{windowsData.length}</div>
              <div className="text-sm text-muted-foreground">Active Windows</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Percent className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {windowsData.length > 0 
                  ? Math.max(...windowsData.map(w => w.window.volume_discount_percent))
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Best Discount</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aggregation Windows */}
      {windowsData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Aggregations</h3>
            <p className="text-muted-foreground mb-4">
              When you order meals or add items to your shopping list, they'll automatically
              be aggregated with neighbors for better deals!
            </p>
            <Button>
              <ArrowRight className="h-4 w-4 mr-2" />
              Browse Meals
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {windowsData.map(({ window, participation }) => (
            <AggregationWindowCard
              key={window.id}
              window={window}
              participation={participation}
              onOptOut={() => optOutMutation.mutate(window.id)}
              onOptIn={() => {
                setSelectedWindow(window);
                setShowOptInDialog(true);
              }}
              onViewDetails={() => setSelectedWindow(window)}
              isOptingOut={optOutMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Shopping List Dialog */}
      {selectedWindow && !showOptInDialog && (
        <Dialog open={!!selectedWindow} onOpenChange={() => setSelectedWindow(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Aggregated Shopping List
              </DialogTitle>
              <DialogDescription>
                Combined items from {selectedWindow.participant_count} households
                {selectedWindow.volume_discount_percent > 0 && (
                  <Badge className="ml-2 bg-emerald-500">
                    {selectedWindow.volume_discount_percent}% Volume Discount
                  </Badge>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Group by category */}
              {Object.entries(
                shoppingList.reduce((acc, item) => {
                  const cat = item.category || 'Other';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(item);
                  return acc;
                }, {} as Record<string, AggregatedShoppingItem[]>)
              ).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div>
                          <span className="font-medium">{item.display_name}</span>
                          <span className="text-muted-foreground ml-2">
                            {item.total_quantity} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {item.requesting_users} {item.requesting_users === 1 ? 'person' : 'people'}
                          </Badge>
                          {item.estimated_total_price && (
                            <span className="text-sm">
                              ~${item.estimated_total_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {shoppingList.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Shopping list will be generated when threshold is met
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Opt-In Dialog */}
      <Dialog open={showOptInDialog} onOpenChange={setShowOptInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery Details</DialogTitle>
            <DialogDescription>
              Provide your delivery address to join this aggregated order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Delivery Address *</Label>
              <Input
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="123 Main St, Apt 4B"
              />
            </div>
            <div>
              <Label htmlFor="instructions">Delivery Instructions</Label>
              <Textarea
                id="instructions"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="Leave at door, ring bell, etc."
                rows={2}
              />
            </div>

            {selectedWindow && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span>Estimated Total:</span>
                  <span className="font-medium">
                    ${(selectedWindow.total_estimated_value / selectedWindow.participant_count).toFixed(2)}
                  </span>
                </div>
                {selectedWindow.volume_discount_percent > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Volume Discount:</span>
                    <span>-{selectedWindow.volume_discount_percent}%</span>
                  </div>
                )}
                <div className="flex justify-between mt-1">
                  <span>Delivery Date:</span>
                  <span>{new Date(selectedWindow.target_delivery_date).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOptInDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleOptIn}
                disabled={!deliveryAddress.trim() || optInMutation.isPending}
              >
                {optInMutation.isPending ? 'Confirming...' : 'Confirm & Join'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AggregationWindowCard({
  window,
  participation,
  onOptOut,
  onOptIn,
  onViewDetails,
  isOptingOut,
}: {
  window: AggregationWindow;
  participation: AggregationParticipant;
  onOptOut: () => void;
  onOptIn: () => void;
  onViewDetails: () => void;
  isOptingOut: boolean;
}) {
  const statusInfo = formatAggregationStatus(window.status);
  const progress = getThresholdProgress(window);
  const timeLeft = getTimeRemaining(window.window_closes);

  return (
    <Card className={cn(
      'transition-all',
      progress.thresholdMet && 'ring-2 ring-emerald-500'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {window.area_name || `Area ${window.zip_code}`}
            </CardTitle>
            <CardDescription>
              Delivery: {new Date(window.target_delivery_date).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              statusInfo.color === 'blue' && 'bg-blue-500',
              statusInfo.color === 'amber' && 'bg-amber-500',
              statusInfo.color === 'purple' && 'bg-purple-500',
              statusInfo.color === 'emerald' && 'bg-emerald-500',
              statusInfo.color === 'green' && 'bg-green-500',
              statusInfo.color === 'red' && 'bg-red-500',
            )}>
              {statusInfo.label}
            </Badge>
            {window.volume_discount_percent > 0 && (
              <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                {window.volume_discount_percent}% off
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        {window.status === 'collecting' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {window.participant_count}/{window.min_participants} households
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                ${window.total_estimated_value.toFixed(0)}/${window.min_value} value
              </span>
            </div>
            <Progress value={progress.overallProgress} className="h-2" />
            
            {!timeLeft.expired && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeLeft.formatted}
              </div>
            )}
          </div>
        )}

        {/* Your items */}
        <div className="flex items-center justify-between text-sm bg-muted/50 rounded-lg p-2">
          <span>Your items in this order:</span>
          <span className="font-medium">{participation.item_count} items (~${participation.estimated_value.toFixed(2)})</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onViewDetails}>
            View Items
          </Button>
          
          {participation.status === 'auto_included' && (
            <>
              <Button className="flex-1" onClick={onOptIn}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Confirm
              </Button>
              <Button 
                variant="ghost" 
                onClick={onOptOut}
                disabled={isOptingOut}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}

          {participation.status === 'opted_in' && (
            <Badge className="bg-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          )}

          {participation.status === 'opted_out' && (
            <Badge variant="secondary">
              Self-fulfilling
            </Badge>
          )}
        </div>

        {/* Threshold message */}
        {window.status === 'collecting' && !progress.thresholdMet && (
          <p className="text-xs text-muted-foreground">
            {progress.neededParticipants > 0 
              ? `Need ${progress.neededParticipants} more household${progress.neededParticipants > 1 ? 's' : ''} `
              : ''}
            {progress.neededValue > 0 
              ? `${progress.neededParticipants > 0 ? 'or ' : 'Need '}$${progress.neededValue.toFixed(0)} more in orders `
              : ''}
            to unlock delivery
          </p>
        )}

        {progress.thresholdMet && window.status === 'collecting' && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm">
            <Truck className="h-4 w-4" />
            Threshold met! Delivery job will be created soon.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
