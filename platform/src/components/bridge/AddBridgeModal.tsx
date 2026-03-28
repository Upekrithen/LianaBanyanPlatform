import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useManageBridge, type CreatorBridge } from '@/hooks/useCreatorBridges';
import { useToast } from '@/hooks/use-toast';

const SERVICE_OPTIONS = [
  { value: 'etsy', label: 'Etsy' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'square', label: 'Square' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'website', label: 'Personal Website' },
  { value: 'instagram_shop', label: 'Instagram Shop' },
  { value: 'facebook_marketplace', label: 'Facebook Marketplace' },
];

interface AddBridgeModalProps {
  open: boolean;
  onClose: () => void;
  existingBridge?: CreatorBridge | null;
}

export function AddBridgeModal({ open, onClose, existingBridge }: AddBridgeModalProps) {
  const [serviceType, setServiceType] = useState('');
  const [serviceUrl, setServiceUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const { createBridge, updateBridge } = useManageBridge();
  const { toast } = useToast();

  const isEditing = !!existingBridge;
  const isPending = createBridge.isPending || updateBridge.isPending;

  useEffect(() => {
    if (existingBridge) {
      setServiceType(existingBridge.service_type);
      setServiceUrl(existingBridge.service_url);
      setDisplayName(existingBridge.display_name || '');
      setIsPrimary(existingBridge.is_primary);
    } else {
      setServiceType('');
      setServiceUrl('');
      setDisplayName('');
      setIsPrimary(false);
    }
  }, [existingBridge, open]);

  const handleSubmit = async () => {
    if (!serviceType || !serviceUrl.trim()) return;

    try {
      if (isEditing && existingBridge) {
        await updateBridge.mutateAsync({
          id: existingBridge.id,
          service_url: serviceUrl,
          display_name: displayName || undefined,
          is_primary: isPrimary,
        });
        toast({ title: 'Updated', description: 'Service connection updated.' });
      } else {
        await createBridge.mutateAsync({
          service_type: serviceType,
          service_url: serviceUrl,
          display_name: displayName || undefined,
          is_primary: isPrimary,
        });
        toast({ title: 'Connected', description: 'Service connected successfully.' });
      }
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Could not save connection.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Connection' : 'Connect a Service'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType} disabled={isEditing}>
              <SelectTrigger><SelectValue placeholder="Choose a service" /></SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>URL</Label>
            <Input
              placeholder="https://www.etsy.com/shop/YourShop"
              value={serviceUrl}
              onChange={e => setServiceUrl(e.target.value)}
            />
          </div>

          <div>
            <Label>Display Name (optional)</Label>
            <Input
              placeholder="My Leather Workshop"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="primary-switch">Primary shop</Label>
            <Switch id="primary-switch" checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !serviceType || !serviceUrl.trim()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {isEditing ? 'Save Changes' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
