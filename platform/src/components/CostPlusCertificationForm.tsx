/**
 * Cost + 20% Certification Request Form
 *
 * Allows anchor owners to request C+20 certification by providing
 * evidence of their cost structure and commitment to the model.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Upload,
  FileText,
  DollarSign,
  Shield,
  ArrowRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { requestCertification, type Anchor, COST_PLUS_CONSTANTS } from '@/lib/costPlusService';
import { CostPlusBadge } from './CostPlusBadge';

interface CostPlusCertificationFormProps {
  anchor: Anchor;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CostPlusCertificationForm({
  anchor,
  onSuccess,
  onCancel
}: CostPlusCertificationFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [costBreakdown, setCostBreakdown] = useState({
    cogs: '',
    labor: '',
    fees: '',
    margin: '',
  });
  const [agreements, setAgreements] = useState({
    honorCostPlus: false,
    allowVerification: false,
    understandRevocation: false,
  });

  const canProceedStep1 = agreements.honorCostPlus && agreements.allowVerification && agreements.understandRevocation;
  const canProceedStep2 = true; // Evidence is optional
  const canSubmit = canProceedStep1;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    const breakdown = {
      cogs: costBreakdown.cogs ? parseFloat(costBreakdown.cogs) : undefined,
      labor: costBreakdown.labor ? parseFloat(costBreakdown.labor) : undefined,
      fees: costBreakdown.fees ? parseFloat(costBreakdown.fees) : undefined,
      margin: costBreakdown.margin ? parseFloat(costBreakdown.margin) : undefined,
    };

    const result = await requestCertification(
      anchor.id,
      evidenceUrl || undefined,
      evidenceNotes || undefined,
      Object.values(breakdown).some(v => v !== undefined) ? breakdown : undefined
    );

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Certification Requested',
        description: 'Your C+20 certification request has been submitted for review.',
      });
      onSuccess?.();
    } else {
      toast({
        title: 'Request Failed',
        description: result.error || 'Failed to submit certification request.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Apply for C+20% Certification
        </h2>
        <p className="text-slate-400">
          Certify that your business follows Cost + 20% pricing for platform-routed transactions.
        </p>
      </div>

      {/* Preview of what they'll get */}
      <div className="flex justify-center">
        <CostPlusBadge
          anchor={{ ...anchor, verified_cost_plus: true, pricing_policy: 'C_PLUS_20' }}
          size="lg"
          showDetails
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === s
                ? 'bg-emerald-500 text-white'
                : step > s
                ? 'bg-emerald-500/30 text-emerald-300'
                : 'bg-slate-700 text-slate-500'
            }`}
          >
            {step > s ? <CheckCircle className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      {/* Step 1: Commitments */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-emerald-400" />
                Step 1: Commitments
              </CardTitle>
              <CardDescription>
                Agree to the C+20 pricing standard for all platform-routed transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-semibold text-emerald-300 mb-2">What is Cost + 20%?</h4>
                <p className="text-sm text-slate-300">
                  You charge enough to cover your true cost of goods, fees, and labor,
                  then add a 20% margin for yourself. Creators and Workers keep <strong>83.3%</strong> of
                  every transaction. The platform's economics (Credits, Marks, Joules) are
                  layered on top, not carved out of your margin.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="honorCostPlus"
                    checked={agreements.honorCostPlus}
                    onCheckedChange={(checked) =>
                      setAgreements(prev => ({ ...prev, honorCostPlus: checked as boolean }))
                    }
                  />
                  <Label htmlFor="honorCostPlus" className="text-sm text-slate-300 cursor-pointer">
                    I commit to honoring <strong>Cost + 20% pricing</strong> for all customers
                    routed through Liana Banyan (via Cue Cards, Slingshot, or direct links).
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="allowVerification"
                    checked={agreements.allowVerification}
                    onCheckedChange={(checked) =>
                      setAgreements(prev => ({ ...prev, allowVerification: checked as boolean }))
                    }
                  />
                  <Label htmlFor="allowVerification" className="text-sm text-slate-300 cursor-pointer">
                    I understand that the platform may request verification of my cost structure
                    (kept private) and may audit featured or high-volume anchors.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="understandRevocation"
                    checked={agreements.understandRevocation}
                    onCheckedChange={(checked) =>
                      setAgreements(prev => ({ ...prev, understandRevocation: checked as boolean }))
                    }
                  />
                  <Label htmlFor="understandRevocation" className="text-sm text-slate-300 cursor-pointer">
                    I understand that if I change my pricing in a way that breaks the C+20
                    commitment, my certification badge may be revoked until I realign.
                  </Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Evidence (Optional) */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-amber-400" />
                Step 2: Evidence (Optional)
              </CardTitle>
              <CardDescription>
                Providing cost breakdown evidence speeds up approval for featured placements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-amber-400 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    This information is <strong>private</strong> and only visible to the review team.
                    It will not be published or shared. You can skip this step for basic certification.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="evidenceUrl" className="text-slate-300">
                    Link to Cost Documentation (optional)
                  </Label>
                  <Input
                    id="evidenceUrl"
                    placeholder="https://docs.google.com/spreadsheets/..."
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Private link to a spreadsheet, invoice, or document showing your cost structure.
                  </p>
                </div>

                <div>
                  <Label className="text-slate-300">
                    Cost Breakdown (optional, for a typical $100 sale)
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label htmlFor="cogs" className="text-xs text-slate-500">Cost of Goods</Label>
                      <Input
                        id="cogs"
                        type="number"
                        placeholder="$40"
                        value={costBreakdown.cogs}
                        onChange={(e) => setCostBreakdown(prev => ({ ...prev, cogs: e.target.value }))}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="labor" className="text-xs text-slate-500">Labor</Label>
                      <Input
                        id="labor"
                        type="number"
                        placeholder="$25"
                        value={costBreakdown.labor}
                        onChange={(e) => setCostBreakdown(prev => ({ ...prev, labor: e.target.value }))}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fees" className="text-xs text-slate-500">Platform Fees</Label>
                      <Input
                        id="fees"
                        type="number"
                        placeholder="$15"
                        value={costBreakdown.fees}
                        onChange={(e) => setCostBreakdown(prev => ({ ...prev, fees: e.target.value }))}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="margin" className="text-xs text-slate-500">Your Margin</Label>
                      <Input
                        id="margin"
                        type="number"
                        placeholder="$20"
                        value={costBreakdown.margin}
                        onChange={(e) => setCostBreakdown(prev => ({ ...prev, margin: e.target.value }))}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="evidenceNotes" className="text-slate-300">
                    Additional Notes (optional)
                  </Label>
                  <Textarea
                    id="evidenceNotes"
                    placeholder="Any context about your pricing model..."
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-slate-600 text-slate-300"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Step 3: Review & Submit
              </CardTitle>
              <CardDescription>
                Review your certification request before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-slate-500 mb-1">Business</p>
                  <p className="text-white font-medium">{anchor.display_name}</p>
                  <p className="text-sm text-slate-400">{anchor.destination_url}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-slate-500 mb-1">Commitments</p>
                  <ul className="text-sm text-emerald-300 space-y-1">
                    <li>✓ Honor C+20 pricing for platform-routed transactions</li>
                    <li>✓ Allow verification of cost structure</li>
                    <li>✓ Understand revocation policy</li>
                  </ul>
                </div>

                {(evidenceUrl || evidenceNotes || Object.values(costBreakdown).some(v => v)) && (
                  <div className="p-3 rounded-lg bg-slate-900/50">
                    <p className="text-xs text-slate-500 mb-1">Evidence Provided</p>
                    {evidenceUrl && <p className="text-sm text-slate-300">📎 Documentation link</p>}
                    {Object.values(costBreakdown).some(v => v) && <p className="text-sm text-slate-300">📊 Cost breakdown</p>}
                    {evidenceNotes && <p className="text-sm text-slate-300">📝 Additional notes</p>}
                  </div>
                )}
              </div>

              {/* Benefits preview */}
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="font-semibold text-emerald-300 mb-2">What You'll Get</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>✓ Non-hideable <strong>C+20% badge</strong> on all your Cue Cards</li>
                  <li>✓ <strong>100% Joules</strong> from referrals (vs 25% without)</li>
                  <li>✓ <strong>100% Marks</strong> from reciprocal network (vs 50%)</li>
                  <li>✓ <strong>IP stake eligibility</strong> from patent buckets</li>
                  <li>✓ Access to <strong>Level 3 reciprocal exposure</strong></li>
                  <li>✓ Featured in <strong>C+20 Certified collections</strong></li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-slate-600 text-slate-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cancel button */}
      {onCancel && (
        <div className="text-center">
          <Button variant="ghost" onClick={onCancel} className="text-slate-500">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default CostPlusCertificationForm;
