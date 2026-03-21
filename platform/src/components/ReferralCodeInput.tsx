import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

interface ReferralCodeInputProps {
  onCodeApplied: (code: string) => void;
  disabled?: boolean;
}

export function ReferralCodeInput({ onCodeApplied, disabled }: ReferralCodeInputProps) {
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (code.trim()) {
      onCodeApplied(code.trim().toUpperCase());
      setApplied(true);
    }
  };

  if (applied) {
    return (
      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Gift className="w-4 h-4" />
          Referral code applied! You may earn matched credits.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="referralCode" className="flex items-center gap-2">
        <Gift className="w-4 h-4" />
        Have a referral code?
      </Label>
      <div className="flex gap-2">
        <Input
          id="referralCode"
          placeholder="REF-XXXXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={disabled}
        />
        <Button onClick={handleApply} disabled={!code || disabled} size="sm">
          Apply
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Using a referral code? Both you and your referrer earn matched credits!
      </p>
    </div>
  );
}
