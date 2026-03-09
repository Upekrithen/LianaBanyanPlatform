/**
 * JOULE TO C+20 CONVERTER
 * =======================
 * Innovation #1349: Joule-to-C20 Conversion
 * 
 * Allows users to convert their Joules into C+20 purchasing power,
 * extending their ability to buy at Cost + 20% pricing.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { convertJoulesToC20Balance, C20_RECIPROCITY_CONSTANTS } from '@/lib/c20ReciprocityService';

import {
  Zap,
  ArrowRight,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';

interface JouleToC20ConverterProps {
  anchorId: string;
  jouleBalance: number;
  c20Balance: number;
  onConversionComplete?: (newC20Balance: number) => void;
}

export function JouleToC20Converter({
  anchorId,
  jouleBalance,
  c20Balance,
  onConversionComplete,
}: JouleToC20ConverterProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const conversionRate = C20_RECIPROCITY_CONSTANTS.JOULE_CONVERSION_RATE;
  const c20Equivalent = amount * conversionRate;
  const maxAmount = jouleBalance;

  const handleConvert = async () => {
    if (amount <= 0 || amount > jouleBalance) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to convert.',
        variant: 'destructive',
      });
      return;
    }

    setIsConverting(true);
    try {
      const newBalance = await convertJoulesToC20Balance(anchorId, amount, 'User-initiated conversion');
      
      if (newBalance > 0) {
        toast({
          title: 'Conversion Successful!',
          description: `Converted ${formatCurrency(amount)} Joules to ${formatCurrency(c20Equivalent)} C+20 purchasing power.`,
        });
        setDialogOpen(false);
        setAmount(0);
        onConversionComplete?.(c20Balance + c20Equivalent);
      } else {
        throw new Error('Conversion failed');
      }
    } catch (error) {
      toast({
        title: 'Conversion Failed',
        description: 'Unable to convert Joules. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const presetAmounts = [25, 50, 100, 250];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
          <Zap className="w-4 h-4 mr-2" />
          Convert Joules to C+20
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Convert Joules to C+20 Balance
          </DialogTitle>
          <DialogDescription>
            Extend your C+20 purchasing power by converting Joules.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                Joule Balance
              </div>
              <p className="text-xl font-bold text-amber-400">{formatCurrency(jouleBalance)}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                C+20 Balance
              </div>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(c20Balance)}</p>
            </div>
          </div>

          {/* Conversion Rate Info */}
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200/80 text-sm">
              Conversion rate: 1 Joule = {conversionRate} C+20 purchasing power
            </AlertDescription>
          </Alert>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label className="text-slate-300">Amount to Convert</Label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                max={maxAmount}
                min={0}
                className="bg-slate-800 border-slate-600 pl-10 text-lg"
                placeholder="0.00"
              />
            </div>
            
            {/* Slider */}
            <Slider
              value={[amount]}
              onValueChange={([val]) => setAmount(val)}
              max={maxAmount}
              step={1}
              className="py-2"
            />
            
            {/* Preset Buttons */}
            <div className="flex gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(Math.min(preset, maxAmount))}
                  disabled={preset > maxAmount}
                  className={cn(
                    "flex-1 border-slate-600",
                    amount === preset && "bg-amber-500/20 border-amber-500/50"
                  )}
                >
                  ${preset}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(maxAmount)}
                className="flex-1 border-slate-600"
              >
                Max
              </Button>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Preview */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Conversion Preview
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(amount)}</p>
                <p className="text-xs text-slate-500">Joules</p>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-500" />
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(c20Equivalent)}</p>
                <p className="text-xs text-slate-500">C+20 Balance</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">New C+20 Balance:</span>
                <span className="text-emerald-400 font-medium">{formatCurrency(c20Balance + c20Equivalent)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600">
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={amount <= 0 || amount > jouleBalance || isConverting}
            className="bg-amber-600 hover:bg-amber-500"
          >
            {isConverting ? (
              <>Converting...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Convert {formatCurrency(amount)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact version for wallet/header display
 */
export function JouleToC20ConverterCompact({
  anchorId,
  jouleBalance,
  c20Balance,
  onConversionComplete,
}: JouleToC20ConverterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm">
        <Zap className="w-4 h-4 text-amber-400" />
        <span className="text-slate-400">${jouleBalance.toFixed(0)}</span>
      </div>
      <JouleToC20Converter
        anchorId={anchorId}
        jouleBalance={jouleBalance}
        c20Balance={c20Balance}
        onConversionComplete={onConversionComplete}
      />
    </div>
  );
}

export default JouleToC20Converter;
