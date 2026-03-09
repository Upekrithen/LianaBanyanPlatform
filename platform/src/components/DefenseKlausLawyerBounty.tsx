/**
 * Defense Klaus Lawyer Bounty Board
 * 
 * Bounty for lawyers interested in joining the Legal Defense Fund
 * Contract terms and application process
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Scale,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  Users,
  DollarSign,
} from "lucide-react";

interface LawyerBounty {
  id: string;
  title: string;
  description: string;
  practice_areas: string[];
  compensation_type: string;
  compensation_details: string;
  requirements: string[];
  is_active: boolean;
  applications_count: number;
  created_at: string;
}

interface ApplicationForm {
  bar_number: string;
  jurisdictions: string;
  experience_years: number;
  statement: string;
}

export function DefenseKlausLawyerBounty() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<LawyerBounty | null>(null);
  const [form, setForm] = useState<ApplicationForm>({
    bar_number: "",
    jurisdictions: "",
    experience_years: 0,
    statement: "",
  });

  // Fetch bounties
  const { data: bounties, isLoading } = useQuery({
    queryKey: ["defense-klaus-lawyer-bounties"],
    queryFn: async (): Promise<LawyerBounty[]> => {
      const { data, error } = await supabase
        .from("defense_klaus_lawyer_bounties")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback data for demo
        return [{
          id: "demo-bounty",
          title: "Defense Klaus Legal Defense Fund - Founding Attorneys",
          description: "Join the founding team of attorneys for the Defense Klaus Legal Defense Fund. Provide legal defense services to members who purchase the Defense Klaus bracelet. Pooled fund model ensures sustainable compensation.",
          practice_areas: ["criminal defense", "civil rights", "personal injury", "family law"],
          compensation_type: "hourly",
          compensation_details: "Competitive hourly rates paid from pooled fund. Rates negotiated based on jurisdiction and experience. Minimum guaranteed hours for active cases.",
          requirements: [
            "Active bar membership in good standing",
            "Minimum 3 years practice experience",
            "Malpractice insurance",
            "Commitment to Cost+20% pricing model",
            "Agreement to platform ethics standards"
          ],
          is_active: true,
          applications_count: 0,
          created_at: new Date().toISOString(),
        }];
      }

      return data || [];
    },
  });

  // Submit application
  const submitApplication = useMutation({
    mutationFn: async (bountyId: string) => {
      if (!user) {
        throw new Error("You must be logged in to apply");
      }

      if (!form.bar_number || !form.jurisdictions || !form.statement) {
        throw new Error("Please fill in all required fields");
      }

      const { data, error } = await supabase
        .from("defense_klaus_lawyer_applications")
        .insert({
          bounty_id: bountyId,
          user_id: user.id,
          bar_number: form.bar_number,
          jurisdictions: form.jurisdictions.split(",").map(j => j.trim()),
          experience_years: form.experience_years,
          statement: form.statement,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        // Store in localStorage for demo
        const stored = JSON.parse(localStorage.getItem("dk_lawyer_applications") || "[]");
        stored.push({
          id: crypto.randomUUID(),
          bounty_id: bountyId,
          ...form,
          status: "pending",
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("dk_lawyer_applications", JSON.stringify(stored));
        return { success: true };
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defense-klaus-lawyer-bounties"] });
      toast({
        title: "⚖️ Application Submitted",
        description: "Thank you for your interest. We'll review your application and be in touch.",
      });
      setShowApplyDialog(false);
      setForm({ bar_number: "", jurisdictions: "", experience_years: 0, statement: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = (bounty: LawyerBounty) => {
    setSelectedBounty(bounty);
    setShowApplyDialog(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-white/60">Loading bounties...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/30 border-amber-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-amber-400" />
            <div>
              <CardTitle className="text-2xl">Lawyer Bounty Board</CardTitle>
              <CardDescription className="text-amber-200">
                Join the Defense Klaus Legal Defense Fund
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/80">
            We're building a network of attorneys committed to providing affordable legal defense 
            to our members. The pooled fund model ensures sustainable compensation while keeping 
            legal services accessible.
          </p>
        </CardContent>
      </Card>

      {/* Contract Terms Overview */}
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Terms Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                Compensation Model
              </h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Hourly rates from pooled fund</li>
                <li>• Rates negotiated by jurisdiction</li>
                <li>• Minimum guaranteed hours for active cases</li>
                <li>• Bonus pool for exceptional outcomes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Member Benefits
              </h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Access to pooled legal defense fund</li>
                <li>• Network of vetted attorneys</li>
                <li>• Transparent Cost+20% pricing</li>
                <li>• Community support system</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 text-sm">
            <h4 className="font-semibold text-white mb-2">Cost+20% Commitment</h4>
            <p className="text-white/70">
              All participating attorneys agree to the platform's Cost+20% pricing model. 
              This means transparent billing where the attorney's actual costs plus a 20% margin 
              are charged to the fund. This ensures fair compensation while maintaining affordability.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bounty Listings */}
      {bounties?.map((bounty) => (
        <Card key={bounty.id} className="border-white/10 hover:border-amber-500/30 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-400" />
                  {bounty.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {bounty.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400/50">
                {bounty.applications_count} Applications
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Practice Areas */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-2">Practice Areas</h4>
              <div className="flex flex-wrap gap-2">
                {bounty.practice_areas.map((area) => (
                  <Badge key={area} variant="secondary" className="bg-white/10">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Compensation
              </h4>
              <p className="text-sm text-white/70">{bounty.compensation_details}</p>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Requirements
              </h4>
              <ul className="text-sm text-white/70 space-y-1">
                {bounty.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Apply Button */}
            <Button 
              onClick={() => handleApply(bounty)}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <Scale className="h-4 w-4 mr-2" />
              Apply to Join
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Application Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply: {selectedBounty?.title}</DialogTitle>
            <DialogDescription>
              Submit your application to join the Defense Klaus Legal Defense Fund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="bar_number">Bar Number *</Label>
              <Input
                id="bar_number"
                placeholder="e.g., CA123456"
                value={form.bar_number}
                onChange={(e) => setForm({ ...form, bar_number: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jurisdictions">Jurisdictions * (comma-separated)</Label>
              <Input
                id="jurisdictions"
                placeholder="e.g., California, New York, Federal"
                value={form.jurisdictions}
                onChange={(e) => setForm({ ...form, jurisdictions: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statement">Personal Statement *</Label>
              <Textarea
                id="statement"
                placeholder="Tell us why you want to join the Defense Klaus Legal Defense Fund and how your experience aligns with our mission..."
                rows={4}
                value={form.statement}
                onChange={(e) => setForm({ ...form, statement: e.target.value })}
              />
            </div>
            
            <Button
              onClick={() => selectedBounty && submitApplication.mutate(selectedBounty.id)}
              disabled={submitApplication.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {submitApplication.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DefenseKlausLawyerBounty;
