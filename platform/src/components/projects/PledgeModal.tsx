import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePledgeToLevel, type ProductionLevel } from '@/hooks/useProductionProjects';
import { triggerCoinFlip } from '@/components/xray/CoinFlipAnimation';

const SOURCES = [
  { value: 'credits', label: 'Credits' },
  { value: 'kickstarter', label: 'Kickstarter' },
  { value: 'direct', label: 'Direct' },
] as const;

interface PledgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: ProductionLevel | null;
  productName?: string;
}

export function PledgeModal({ open, onOpenChange, level, productName }: PledgeModalProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<string>('credits');
  const [success, setSuccess] = useState(false);
  const pledge = usePledgeToLevel();

  if (!level) return null;

  const remaining = Math.max(level.votes_needed - level.current_votes, 0);

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    try {
      await pledge.mutateAsync({ levelId: level.id, amount: val, source });
      triggerCoinFlip(window.innerWidth / 2, window.innerHeight / 2, val);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        onOpenChange(false);
      }, 2000);
    } catch {
      /* toast handled by react-query */
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
            <h3 className="text-xl font-bold">Pledge Received!</h3>
            <p className="text-muted-foreground">
              Your pledge of <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span> toward{' '}
              <span className="font-semibold">{level.level_name}</span> has been recorded.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Pledge to {level.level_name}
          </DialogTitle>
          <DialogDescription>
            {productName && <span className="font-medium text-foreground">{productName} — </span>}
            {level.units_count.toLocaleString()} units at ${level.unit_price.toFixed(2)} each
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target</span>
              <span className="font-mono font-medium">${level.votes_needed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pledged so far</span>
              <span className="font-mono font-medium">${level.current_votes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-mono font-semibold text-amber-600">${remaining.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${level.progress_pct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pledge-amount">Pledge Amount (Credits)</Label>
            <Input
              id="pledge-amount"
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount…"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <div className="flex gap-2">
              {SOURCES.map((s) => (
                <Button
                  key={s.value}
                  size="sm"
                  variant={source === s.value ? 'default' : 'outline'}
                  onClick={() => setSource(s.value)}
                  className={cn('flex-1', source === s.value && 'ring-2 ring-primary/30')}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || pledge.isPending}
          >
            {pledge.isPending ? 'Pledging…' : `Pledge $${parseFloat(amount || '0').toLocaleString()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
