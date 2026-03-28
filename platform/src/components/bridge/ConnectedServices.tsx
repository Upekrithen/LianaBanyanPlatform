import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Plus, CheckCircle2, Circle, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreatorBridges, useManageBridge, type CreatorBridge } from '@/hooks/useCreatorBridges';
import { AddBridgeModal } from './AddBridgeModal';
import { useToast } from '@/hooks/use-toast';

const SERVICE_LABELS: Record<string, string> = {
  etsy: 'Etsy', shopify: 'Shopify', square: 'Square', stripe: 'Stripe',
  paypal: 'PayPal', website: 'Personal Website', instagram_shop: 'Instagram Shop',
  facebook_marketplace: 'Facebook Marketplace',
};

const ALL_SERVICE_TYPES = Object.keys(SERVICE_LABELS);

export function ConnectedServices() {
  const { user } = useAuth();
  const { data: bridges = [], isLoading } = useCreatorBridges(user?.id);
  const { deleteBridge, verifyBridge } = useManageBridge();
  const [showAdd, setShowAdd] = useState(false);
  const [editingBridge, setEditingBridge] = useState<CreatorBridge | null>(null);
  const { toast } = useToast();

  const connectedTypes = new Set(bridges.map(b => b.service_type));
  const unconnectedTypes = ALL_SERVICE_TYPES.filter(t => !connectedTypes.has(t));

  const handleDelete = async (bridge: CreatorBridge) => {
    try {
      await deleteBridge.mutateAsync(bridge.id);
      toast({ title: 'Removed', description: `${SERVICE_LABELS[bridge.service_type]} disconnected.` });
    } catch {
      toast({ title: 'Error', description: 'Could not remove connection.', variant: 'destructive' });
    }
  };

  const handleVerify = async (bridge: CreatorBridge) => {
    try {
      await verifyBridge.mutateAsync(bridge.id);
      toast({ title: 'Verified', description: `${SERVICE_LABELS[bridge.service_type]} marked as verified.` });
    } catch {
      toast({ title: 'Error', description: 'Verification failed.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Connected Services
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => { setEditingBridge(null); setShowAdd(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Service
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your existing shop so customers can find you everywhere.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {bridges.map(bridge => (
            <div key={bridge.id} className="flex items-center gap-3 p-3 rounded-lg border">
              {bridge.verified ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{SERVICE_LABELS[bridge.service_type] || bridge.service_type}</span>
                  {bridge.display_name && (
                    <span className="text-sm text-muted-foreground">— &ldquo;{bridge.display_name}&rdquo;</span>
                  )}
                  {bridge.is_primary && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                </div>
                <a href={bridge.service_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate">
                  {bridge.service_url.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!bridge.verified && (
                  <Button size="sm" variant="ghost" onClick={() => handleVerify(bridge)} title="Verify">
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => { setEditingBridge(bridge); setShowAdd(true); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(bridge)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {unconnectedTypes.map(serviceType => (
            <div key={serviceType} className="flex items-center gap-3 p-3 rounded-lg border border-dashed">
              <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">{SERVICE_LABELS[serviceType]}</span>
                <span className="text-xs text-muted-foreground/60 ml-2">Not connected</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditingBridge(null); setShowAdd(true); }}>
                Connect
              </Button>
            </div>
          ))}

          {bridges.length === 0 && unconnectedTypes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No services available.</p>
          )}
        </CardContent>
      </Card>

      <AddBridgeModal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditingBridge(null); }}
        existingBridge={editingBridge}
      />
    </>
  );
}
