/**
 * STEWARD APPLICATION — Become a Steward (Apprentice onboarding)
 * Route: /steward/apply (protected)
 * Creates steward_profiles row with tier='apprentice', then redirects to /steward.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const INITIATIVE_OPTIONS = [
  "Let's Make Dinner",
  "Let's Get Groceries",
  "Defense Klaus",
  "Rally Group",
  "VSL",
  "Let's Make Bread",
  "Harper Guild",
  "JukeBox",
  "Didasko",
  "Power to the People",
  "Brass Tacks",
  "Other",
];

export default function StewardApply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [initiatives, setInitiatives] = useState<string[]>([]);

  const { data: existing } = useQuery({
    queryKey: ["steward-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("steward_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("steward_profiles").insert({
        user_id: user.id,
        steward_tier: "apprentice",
        total_projects_managed: 0,
        successful_projects: 0,
        total_pledged: 0,
        total_earned: 0,
        concurrent_limit: 1,
        max_pledge_limit: 500,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steward-profile", user?.id] });
      toast.success("Application submitted. You're now an Apprentice Steward.");
      navigate("/steward");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Application failed");
    },
  });

  if (!user) {
    return (
      <PortalPageLayout>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Sign in to apply as a Steward.</p>
            <Button asChild><Link to="/auth">Sign in</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existing) {
    return (
      <div className="container max-w-xl mx-auto p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You already have a Steward profile.</p>
            <Button asChild><Link to="/steward">Go to Dashboard</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto p-6 space-y-6" data-xray-id="steward-apply">
      <Button variant="ghost" asChild>
        <Link to="/steward" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Become a Steward
          </CardTitle>
          <CardDescription>
            Apply to join as an Apprentice. Manage campaigns, pledge Marks, and earn operational surplus when projects succeed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="motivation">Why do you want to be a Steward?</Label>
            <Textarea
              id="motivation"
              placeholder="Brief motivation (optional)"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="experience">Relevant experience (optional)</Label>
            <Textarea
              id="experience"
              placeholder="Campaign management, community organizing, etc."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label>Which initiative(s) do you want to steward? (optional)</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">Select one or more.</p>
            <div className="flex flex-wrap gap-2">
              {INITIATIVE_OPTIONS.map((init) => (
                <Button
                  key={init}
                  type="button"
                  variant={initiatives.includes(init) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setInitiatives((prev) =>
                      prev.includes(init) ? prev.filter((i) => i !== init) : [...prev, init]
                    )
                  }
                >
                  {init}
                </Button>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending ? "Submitting…" : "Submit application"}
          </Button>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
