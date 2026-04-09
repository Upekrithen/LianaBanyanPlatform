/**
 * ContributionForm — multi-step contribution flow for the Housing Fund.
 * Type → Amount → Review (with WaterWheel estimate) → Confirm → Success.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Home, DollarSign, Wrench, CreditCard, Coins, Banknote,
  Check, ArrowRight, ArrowLeft, Zap, Sparkles, MapPin,
} from 'lucide-react';
import type { HousingProperty } from './PropertyCard';

const CONTRIBUTION_TYPES = [
  { id: 'property_donation', label: 'Property Donation', desc: 'Contribute a property you own to the cooperative', icon: Home, defaultCurrency: 'usd' },
  { id: 'airbnb_revenue', label: 'AirBnB Revenue Share', desc: 'Share a percentage of your rental income', icon: DollarSign, defaultCurrency: 'usd' },
  { id: 'maintenance_labor', label: 'Maintenance Labor', desc: 'Volunteer your time for property maintenance (Crew Call bounty)', icon: Wrench, defaultCurrency: 'marks' },
  { id: 'credit_allocation', label: 'Credit Allocation', desc: 'Spend Credits toward the Housing Fund', icon: CreditCard, defaultCurrency: 'credits' },
  { id: 'mark_pledge', label: 'Mark Pledge', desc: 'Pledge eligible Marks toward a housing project', icon: Coins, defaultCurrency: 'marks' },
  { id: 'cash_contribution', label: 'Cash Contribution', desc: 'Direct cash contribution to the Housing Fund', icon: Banknote, defaultCurrency: 'usd' },
];

const WATERWHEEL_MULTIPLIER = 2.23;

interface ContributionFormProps {
  preselectedProperty?: HousingProperty | null;
}

export default function ContributionForm({ preselectedProperty }: ContributionFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('credits');
  const [propertyId, setPropertyId] = useState(preselectedProperty?.id || '');
  const [description, setDescription] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['housing-properties-list'],
    queryFn: async () => {
      const { data } = await supabase.from('housing_properties').select('id, title, city, state').order('title');
      return data || [];
    },
  });

  const selectedType = CONTRIBUTION_TYPES.find(t => t.id === type);
  const selectedProperty = properties.find((p: any) => p.id === propertyId);
  const numAmount = parseFloat(amount) || 0;
  const waterwheelImpact = numAmount * WATERWHEEL_MULTIPLIER;

  const handleSelectType = (id: string) => {
    setType(id);
    const ct = CONTRIBUTION_TYPES.find(t => t.id === id);
    if (ct) setCurrency(ct.defaultCurrency);
  };

  const handleConfirm = async () => {
    if (!user) { toast.error('Sign in to contribute'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('housing_contributions').insert({
        contributor_id: user.id,
        property_id: propertyId || null,
        contribution_type: type,
        amount: numAmount,
        currency,
        description: description || null,
        verified: false,
      });
      if (error) throw error;
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || 'Contribution failed');
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Sign in to contribute to the Housing Fund</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 justify-center">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              s < step ? 'bg-green-600 text-white' : s === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-600' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Type selection */}
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-center">How would you like to contribute?</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {CONTRIBUTION_TYPES.map(ct => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.id}
                  onClick={() => handleSelectType(ct.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    type === ct.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/30 bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${type === ct.id ? 'bg-primary/20' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${type === ct.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ct.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ct.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button disabled={!type} onClick={() => setStep(2)}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Amount + Target */}
      {step === 2 && (
        <div className="space-y-4 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-center">
            {type === 'property_donation' ? 'Estimated Property Value' : 'Contribution Amount'}
          </h3>

          <div>
            <Label>Amount</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1"
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credits">Credits</SelectItem>
                  <SelectItem value="marks">Marks</SelectItem>
                  <SelectItem value="backed_marks">Backed Marks</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Target Property (optional)</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="General Housing Fund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Housing Fund</SelectItem>
                {properties.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} — {p.city}{p.state ? `, ${p.state}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any details about this contribution..."
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button disabled={!amount || numAmount <= 0} onClick={() => setStep(3)}>
              Review <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review + Confirm */}
      {step === 3 && (
        <div className="space-y-4 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-center">Review Your Contribution</h3>

          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{selectedType?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{numAmount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">{selectedProperty ? selectedProperty.title : 'General Housing Fund'}</span>
              </div>
            </CardContent>
          </Card>

          {/* WaterWheel impact */}
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <p className="font-semibold text-emerald-400">WaterWheel Impact</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your <span className="text-foreground font-medium">{numAmount.toLocaleString()} {currency}</span> contribution
                will generate approximately{' '}
                <span className="text-emerald-400 font-bold">{waterwheelImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}</span>{' '}
                in cooperative housing value.
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Based on WaterWheel Scenario 3 (Neighborhood Node) adjusted multiplier: ×{WATERWHEEL_MULTIPLIER}
              </p>
            </CardContent>
          </Card>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-1 rounded border-border"
            />
            <span className="text-xs text-muted-foreground">
              This is a housing access deposit, NOT a speculative instrument. I receive priority housing access, not financial returns.
            </span>
          </label>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button disabled={!termsAccepted || saving} onClick={handleConfirm} className="bg-emerald-600 hover:bg-emerald-500">
              {saving ? 'Submitting...' : 'Confirm Contribution'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center space-y-4 max-w-md mx-auto py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold">Contribution Recorded!</h3>
          <p className="text-sm text-muted-foreground">
            Your contribution is pending verification by a cooperative steward.
          </p>
          <Card className="border-emerald-500/20 bg-emerald-900/10">
            <CardContent className="p-4">
              <p className="text-sm">
                <span className="text-emerald-400 font-bold">{waterwheelImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}</span>{' '}
                estimated cooperative value from your{' '}
                <span className="font-medium">{numAmount.toLocaleString()} {currency}</span> contribution.
              </p>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => { setStep(1); setType(''); setAmount(''); setDescription(''); setTermsAccepted(false); }}>
              Make Another Contribution
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/housing')}>
              Browse Properties
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
