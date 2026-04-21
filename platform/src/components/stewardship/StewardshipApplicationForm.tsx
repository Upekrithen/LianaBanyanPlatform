import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StewardshipService } from "../../services/stewardshipService";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Users, AlertTriangle } from "lucide-react";

interface StewardshipApplicationFormProps {
  initiativeId: string;
  initiativeName: string;
  userId: string;
}

export const StewardshipApplicationForm: React.FC<StewardshipApplicationFormProps> = ({
  initiativeId,
  initiativeName,
  userId
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    backgroundSummary: '',
    scenarioFraud: '',
    scenarioConflict: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const applicationId = await StewardshipService.submitApplication({
        user_id: userId,
        initiative_id: initiativeId,
        legal_name: formData.legalName,
        id_verified: false, // Will be verified via Stripe Identity later
        background_summary: formData.backgroundSummary,
        scenario_responses: {
          fraud: formData.scenarioFraud,
          conflict: formData.scenarioConflict
        }
      });

      if (applicationId) {
        toast({
          title: "Application Submitted",
          description: "Your stewardship application is now pending Six-Person Verification.",
        });
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Stewardship Application
        </CardTitle>
        <CardDescription>
          Apply to become the Human Steward for <strong>{initiativeName}</strong>.
          This role requires Six-Person Verification and a financial backing pledge.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="legalName">Full Legal Name</Label>
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
            <Label htmlFor="background">Professional Background & Why You Want This Role</Label>
            <Textarea
              id="background"
              required
              className="min-h-[100px]"
              placeholder="Tell us about your experience and why you are drawn to this initiative..."
              value={formData.backgroundSummary}
              onChange={(e) => setFormData({...formData, backgroundSummary: e.target.value})}
            />
          </div>

          <div className="space-y-4 border p-4 rounded-md bg-muted/20">
            <h4 className="font-semibold text-sm">Scenario Responses</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Your AI Advisor will assist you, but you must make the final call. How would you handle these situations?
            </p>

            <div className="space-y-2">
              <Label htmlFor="scenarioFraud" className="text-sm">Scenario 1: You suspect a recipient is submitting fraudulent requests.</Label>
              <Textarea
                id="scenarioFraud"
                required
                placeholder="Your response..."
                value={formData.scenarioFraud}
                onChange={(e) => setFormData({...formData, scenarioFraud: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenarioConflict" className="text-sm">Scenario 2: The AI Advisor strongly recommends denying a request, but your human intuition says otherwise.</Label>
              <Textarea
                id="scenarioConflict"
                required
                placeholder="Your response..."
                value={formData.scenarioConflict}
                onChange={(e) => setFormData({...formData, scenarioConflict: e.target.value})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application for Verification"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-muted/50 text-xs text-muted-foreground p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Users className="h-4 w-4" /> Next Steps: Six-Person Verification
        </div>
        <p>
          If your application passes initial review, you will need 3 people who know you and 3 random community members to verify your identity and pledge backing credits to your stewardship fund.
        </p>
      </CardFooter>
    </Card>
  );
};
