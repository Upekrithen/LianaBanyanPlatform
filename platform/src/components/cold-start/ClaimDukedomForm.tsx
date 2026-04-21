/**
 * CLAIM YOUR SHIP (Captain Application)
 * =====================================
 * Milestone 2: The Cold Start & Stewardship System
 *
 * Application flow for users to become a Captain (The 300)
 * for a specific initiative in their city.
 *
 * NAVAL RANK PROGRESSION:
 * - Captain: 1 ship (your own) - Local leader for ONE initiative in ONE city
 * - Commodore: 3+ ships - Leader of 3+ initiatives OR 1 initiative across 3+ cities
 * - Rear Admiral: Squadron - Regional coordinator (state-level)
 * - Vice Admiral: Fleet division - Multi-state coordinator
 * - Admiral: Full fleet - National coordinator
 * - Fleet Admiral / Crown: The public figure who sets national vision (e.g., Maneet Chauhan)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Crown, MapPin, Users, Shield, AlertTriangle,
  CheckCircle, ArrowRight, Coins, FileText, Anchor, Ship, Compass
} from "lucide-react";

import { SixPersonVerification } from "./SixPersonVerification";
import { BackerPledgeEscrow } from "./BackerPledgeEscrow";

interface ClaimCaptainFormProps {
  initiativeId: string;
  initiativeName: string;
  city: string;
  state: string;
  onSuccess?: () => void;
}

export const ClaimCaptainForm: React.FC<ClaimCaptainFormProps> = ({
  initiativeId,
  initiativeName,
  city,
  state,
  onSuccess
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    legalName: '',
    zipCode: '',
    backgroundSummary: '',
    localKnowledge: '',
    scenarioFraud: '',
    scenarioConflict: '',
    pledgeAmount: 100,
    acceptTerms: false,
    acceptSixPerson: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to become a Captain.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('stewardship_applications')
        .insert({
          user_id: user.id,
          initiative_id: initiativeId,
          legal_name: formData.legalName,
          zip_code: formData.zipCode,
          city: city,
          state: state,
          country: 'USA',
          region_type: 'city',
          id_verified: false,
          background_summary: formData.backgroundSummary,
          scenario_responses: {
            local_knowledge: formData.localKnowledge,
            fraud: formData.scenarioFraud,
            conflict: formData.scenarioConflict,
            pledge_amount: formData.pledgeAmount
          },
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: `Your Captain application for ${initiativeName} in ${city}, ${state} is now pending Six-Person Verification.`,
      });

      setStep(4); // Success step
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Could not submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.legalName && formData.zipCode;
      case 2:
        return formData.backgroundSummary && formData.localKnowledge;
      case 3:
        return formData.scenarioFraud && formData.scenarioConflict &&
               formData.acceptTerms && formData.acceptSixPerson;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-blue-500/30">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Anchor className="h-6 w-6 text-blue-500" />
              Become a Captain
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {initiativeName} • {city}, {state}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Step {step} of 3
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Ship className="h-4 w-4 text-blue-500" />
                What is a Captain?
              </h4>
              <p className="text-sm text-muted-foreground">
                Captains are the commanders of their own ship — local leaders in "The 300" who execute
                initiatives in their cities. While the <strong>Fleet Admiral</strong> (like Maneet Chauhan
                for Let's Make Dinner) sets the national vision, <strong>Captains</strong> make it happen locally.
              </p>
              <div className="mt-3 mb-3 text-sm text-muted-foreground border-t border-b py-3 border-primary/10">
                <div className="flex items-start gap-2">
                  <Compass className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>The Captain's Medallion:</strong> <em>"A ship in harbor is safe, but that is not what ships are for."</em><br/>
                    You will receive a Ship's Wheel QR Medallion. The front bears our motto; the back features your branding and QR Deck Card. Customizing your Medallion later requires posting a Bounty.
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Naval Progression:</strong> Captain → Commodore (3+ ships) → Rear Admiral → Vice Admiral → Admiral → Fleet Admiral
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Full Legal Name *</Label>
                <Input
                  id="legalName"
                  required
                  placeholder="As it appears on your government ID"
                  value={formData.legalName}
                  onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Will require Stripe Identity Verification
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">Your Zip Code *</Label>
                <Input
                  id="zipCode"
                  required
                  placeholder="e.g., 85001"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Must be within or near {city}, {state}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="background">Professional Background & Why You Want This Role *</Label>
              <Textarea
                id="background"
                required
                className="min-h-[100px]"
                placeholder="Tell us about your experience and why you are drawn to this initiative..."
                value={formData.backgroundSummary}
                onChange={(e) => setFormData({...formData, backgroundSummary: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localKnowledge">Your Knowledge of {city} *</Label>
              <Textarea
                id="localKnowledge"
                required
                className="min-h-[100px]"
                placeholder={`What do you know about ${city} that would help you lead ${initiativeName} here? Local connections, community knowledge, etc.`}
                value={formData.localKnowledge}
                onChange={(e) => setFormData({...formData, localKnowledge: e.target.value})}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4 border p-4 rounded-md bg-muted/20">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Scenario Responses
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Your AI Advisor will assist you, but you must make the final call. How would you handle these situations?
              </p>

              <div className="space-y-2">
                <Label htmlFor="scenarioFraud" className="text-sm">
                  Scenario 1: You suspect a recipient is submitting fraudulent requests.
                </Label>
                <Textarea
                  id="scenarioFraud"
                  required
                  placeholder="Your response..."
                  value={formData.scenarioFraud}
                  onChange={(e) => setFormData({...formData, scenarioFraud: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenarioConflict" className="text-sm">
                  Scenario 2: The AI Advisor strongly recommends denying a request, but your human intuition says otherwise.
                </Label>
                <Textarea
                  id="scenarioConflict"
                  required
                  placeholder="Your response..."
                  value={formData.scenarioConflict}
                  onChange={(e) => setFormData({...formData, scenarioConflict: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4 border p-4 rounded-md bg-blue-500/10">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Coins className="h-4 w-4 text-blue-500" />
                Financial Backing Pledge
              </h4>
              <p className="text-xs text-muted-foreground">
                Captains must pledge Marks (backed by Joules) as collateral. This ensures accountability.
                If you fail to fulfill your duties, the backing is forfeited.
              </p>
              <div className="flex items-center gap-4">
                <Label htmlFor="pledgeAmount">Pledge Amount (Credits)</Label>
                <Input
                  id="pledgeAmount"
                  type="number"
                  min={100}
                  className="w-32"
                  value={formData.pledgeAmount}
                  onChange={(e) => setFormData({...formData, pledgeAmount: parseInt(e.target.value) || 100})}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum: 100 Credits. Higher pledges demonstrate stronger commitment.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
                />
                <label htmlFor="acceptTerms" className="text-sm leading-tight">
                  I understand that as a Captain, I am responsible for local operations and will be held
                  accountable by the community. My pledge will be escrowed until my probation period ends.
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptSixPerson"
                  checked={formData.acceptSixPerson}
                  onCheckedChange={(checked) => setFormData({...formData, acceptSixPerson: checked as boolean})}
                />
                <label htmlFor="acceptSixPerson" className="text-sm leading-tight">
                  I agree to the <strong>Six-Person Verification</strong> process: 3 people who know me
                  and 3 random community members must verify my identity and pledge backing credits.
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold">Application Submitted!</h3>
              <p className="text-muted-foreground">
                Your Captain application for <strong>{initiativeName}</strong> in <strong>{city}, {state}</strong>
                is now pending verification and escrow.
              </p>
            </div>

            <SixPersonVerification applicationId="demo-app-id" />

            <BackerPledgeEscrow applicationId="demo-app-id" pledgeAmount={formData.pledgeAmount} />
          </div>
        )}
      </CardContent>

      {step < 4 && (
        <CardFooter className="flex justify-between border-t pt-4">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
              <Anchor className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      )}

      <CardFooter className="bg-muted/50 text-xs text-muted-foreground p-4 flex flex-col gap-2 border-t">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Ship className="h-4 w-4 text-blue-500" /> The 300: The Fleet
        </div>
        <p>
          Captains are part of "The 300" — the decentralized fleet that ensures
          every community has local commanders accountable to their neighbors. The Fleet Admiral sets vision;
          Captains execute locally. Prove yourself and rise through the ranks: Commodore, Admiral, and beyond.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ClaimCaptainForm;
