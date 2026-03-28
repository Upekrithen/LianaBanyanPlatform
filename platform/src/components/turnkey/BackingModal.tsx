import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackProject } from '@/hooks/useBackProject';
import { toast } from 'sonner';

interface BackingModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  unitPriceCredits: number;
  hasStl: boolean;
}

export function BackingModal({ open, onClose, projectId, projectTitle, unitPriceCredits, hasStl }: BackingModalProps) {
  const [fulfillment, setFulfillment] = useState<'shipped' | 'print_yourself'>('shipped');
  const backMutation = useBackProject();

  const displayPrice = fulfillment === 'print_yourself' ? Math.ceil(unitPriceCredits * 0.6) : unitPriceCredits;

  async function handleConfirm() {
    try {
      await backMutation.mutateAsync({
        projectId,
        tier: 'early_adopter',
        creditsPaid: displayPrice,
        fulfillmentType: fulfillment,
      });
      toast.success('You backed this project!');
      onClose();
    } catch {
      toast.error('Failed to back project. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Back "{projectTitle}"</DialogTitle>
          <DialogDescription>Choose how you want to receive your item.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-sm font-medium mb-2 block">Tier</Label>
            <div className="px-3 py-2 rounded-md bg-muted text-sm">Early Adopter</div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Fulfillment</Label>
            <div className="grid grid-cols-2 gap-2">
              {hasStl && (
                <button
                  className={`p-3 rounded-lg border text-sm text-left transition-colors ${fulfillment === 'print_yourself' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-muted hover:border-foreground/20'}`}
                  onClick={() => setFulfillment('print_yourself')}
                >
                  <div className="font-medium">Print It Yourself</div>
                  <div className="text-xs text-muted-foreground mt-1">Download STL file</div>
                  <div className="text-primary font-bold mt-2">{Math.ceil(unitPriceCredits * 0.6).toLocaleString()} Credits</div>
                </button>
              )}
              <button
                className={`p-3 rounded-lg border text-sm text-left transition-colors ${fulfillment === 'shipped' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-muted hover:border-foreground/20'}`}
                onClick={() => setFulfillment('shipped')}
              >
                <div className="font-medium">Get It Shipped</div>
                <div className="text-xs text-muted-foreground mt-1">Production + shipping</div>
                <div className="text-primary font-bold mt-2">{unitPriceCredits.toLocaleString()} Credits</div>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{displayPrice.toLocaleString()} Credits</span>
          </div>

          <Button onClick={handleConfirm} disabled={backMutation.isPending} className="w-full">
            {backMutation.isPending ? 'Processing...' : 'Confirm Backing'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
