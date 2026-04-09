import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Globe, CreditCard, Clock, ArrowRight } from 'lucide-react';
import { useCreateBounty, RUSH_TIERS, BOUNTY_PRICING } from '@/hooks/useBrandBounties';
import { useCreateSponsorship } from '@/hooks/useBountySponsorship';
import { BountyPaymentToggle, type PaymentMethod } from '@/components/BountyPaymentToggle';
import { toast } from 'sonner';

interface BrandBountyPanelProps {
  onRemindLater?: () => void;
}

const BOUNTY_TYPES = [
  { id: 'logo' as const, label: 'Custom Logo', desc: 'A real designer creates YOUR logo.', icon: Palette, color: 'text-violet-400' },
  { id: 'domain_email' as const, label: 'Domain + Business Email', desc: 'yourbusiness.com + you@yourbusiness.com', icon: Globe, color: 'text-blue-400' },
  { id: 'designed_card' as const, label: 'Designed Calling Card', desc: 'Your branded card with QR code, ready to hand out.', icon: CreditCard, color: 'text-amber-400' },
] as const;

export function BrandBountyPanel({ onRemindLater }: BrandBountyPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rushTier, setRushTier] = useState(6);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("marks");
  const [ownershipTransfer, setOwnershipTransfer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createBounty = useCreateBounty();
  const createSponsorship = useCreateSponsorship();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalMarks = Array.from(selected).reduce((sum, type) => {
    return sum + (BOUNTY_PRICING[type]?.[rushTier] || 0);
  }, 0);

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    try {
      for (const type of selected) {
        const price = BOUNTY_PRICING[type]?.[rushTier] || 0;
        const bounty = await createBounty.mutateAsync({
          bounty_type: type as 'logo' | 'domain_email' | 'designed_card',
          rush_tier: rushTier,
          paid_in_credits: paymentMethod === "credits",
        });
        const sponsorPaymentMethod = paymentMethod === "fiat" ? "fiat_stripe" as const
          : paymentMethod === "credits" ? "credits" as const
          : "credits" as const;
        await createSponsorship.mutateAsync({
          bounty_type: "brand_bounty",
          bounty_id: (bounty as { id: string }).id,
          amount_credits: price,
          amount_marks_equivalent: price,
          payment_method: sponsorPaymentMethod,
          ownership_transfer: ownershipTransfer,
        });
      }
      toast.success(`${selected.size} bounties posted!`);
      setSelected(new Set());
    } catch {
      toast.error('Failed to post bounties');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-5 space-y-5">
        <div className="text-center">
          <Palette className="w-8 h-8 text-violet-400 mx-auto mb-2" />
          <h3 className="text-white font-bold text-lg">Look Professional from Day 1</h3>
          <p className="text-white/50 text-sm">Real designers. Real results. Cooperative pricing.</p>
        </div>

        {/* Bounty type checkboxes */}
        <div className="space-y-2">
          {BOUNTY_TYPES.map((bt) => {
            const price = BOUNTY_PRICING[bt.id]?.[rushTier] || 0;
            const isChecked = selected.has(bt.id);
            return (
              <button
                key={bt.id}
                onClick={() => toggle(bt.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isChecked
                    ? 'bg-violet-900/30 border-violet-600/50'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked ? 'bg-violet-600 border-violet-600' : 'border-white/30'
                  }`}>
                    {isChecked && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">{bt.label}</span>
                      <Badge variant="outline" className="border-white/20 text-white/60 text-[10px]">
                        {price} Marks
                      </Badge>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{bt.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Rush tier selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-sm font-medium">How fast?</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {RUSH_TIERS.map((rt) => (
              <button
                key={rt.tier}
                onClick={() => setRushTier(rt.tier)}
                className={`p-2 rounded-lg text-center border text-xs transition-colors ${
                  rushTier === rt.tier
                    ? `${rt.color} border-white/30 text-white font-bold`
                    : 'bg-white/[0.02] border-white/5 text-white/50 hover:border-white/15'
                }`}
              >
                <div className="font-medium">T{rt.tier}</div>
                <div className="text-[10px] opacity-70">{rt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment method — BountyPaymentToggle (K151) */}
        <BountyPaymentToggle
          priceMarks={totalMarks}
          onPaymentChange={setPaymentMethod}
          onOwnershipChange={setOwnershipTransfer}
          showFiatOption={true}
          compact
        />

        {/* Summary + submit */}
        {selected.size > 0 && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-white text-sm font-medium">
              {selected.size} {selected.size === 1 ? 'bounty' : 'bounties'} — {totalMarks} {paymentMethod === "fiat" ? `($${totalMarks})` : paymentMethod === "credits" ? "Credits" : "Marks"}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={selected.size === 0 || submitting}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
          >
            {submitting ? 'Posting...' : 'Post My Bounties'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          {onRemindLater && (
            <Button variant="ghost" onClick={onRemindLater} className="text-white/40 hover:text-white/70">
              Later
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
