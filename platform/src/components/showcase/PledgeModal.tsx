import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Coins, Shield } from 'lucide-react';
import { usePledgeCredits } from '@/hooks/useShowcaseMutations';

interface PledgeModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  creatorName?: string;
}

export function PledgeModal({ open, onClose, projectId, projectTitle, creatorName }: PledgeModalProps) {
  const [amount, setAmount] = useState(50);
  const pledge = usePledgeCredits(projectId);

  const handleConfirm = () => {
    pledge.mutate({ amount }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            Pledge Credits
          </DialogTitle>
          <DialogDescription>
            Pledge Credits toward <span className="font-medium text-foreground">{projectTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-600">{amount}</div>
            <div className="text-sm text-muted-foreground">Credits</div>
          </div>

          <Slider
            value={[amount]}
            onValueChange={([v]) => setAmount(v)}
            min={5}
            max={500}
            step={5}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5</span>
            <span>250</span>
            <span>500</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your Credits will be held in escrow. If {creatorName || 'the creator'} joins,
                your pledge converts to a pre-order. If they don't join within 90 days,
                your Credits are returned.
              </p>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={pledge.isPending}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3"
          >
            {pledge.isPending ? 'Pledging...' : `Pledge ${amount} Credits`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
