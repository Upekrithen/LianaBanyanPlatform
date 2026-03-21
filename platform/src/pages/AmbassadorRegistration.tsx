/**
 * AMBASSADOR REGISTRATION — Apply to become an Ambassador (Session 5 V1).
 * 10-slot human-guided onboarding. SEC-safe: Marks are effort-debt, not commissions.
 * data-xray-id: ambassador-register-form
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const FOCUS_OPTIONS = [
  { key: "dinner", label: "Let's Make Dinner" },
  { key: "groceries", label: "Let's Get Groceries" },
  { key: "hexisle", label: "HexIsle & Builds" },
  { key: "all", label: "All of the above" },
];

export default function AmbassadorRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name ?? "");
  const [city, setCity] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const toggleFocus = (key: string) => {
    if (key === "all") {
      setFocusAreas(focusAreas.length === 4 ? [] : FOCUS_OPTIONS.map((o) => o.key));
      return;
    }
    setFocusAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: maxRow } = await supabase
        .from("ambassadors")
        .select("ambassador_number")
        .order("ambassador_number", { ascending: false })
        .limit(1)
        .single();
      const nextNumber = (maxRow?.ambassador_number ?? 0) + 1;
      const focusFinal = focusAreas.includes("all")
        ? ["dinner", "groceries", "hexisle"]
        : focusAreas.filter((k) => k !== "all");
      const { error: insertError } = await supabase.from("ambassadors").insert({
        user_id: user.id,
        display_name: displayName.trim(),
        ambassador_number: nextNumber,
        generation: 1,
        city: city.trim() || null,
        focus_areas: focusFinal.length ? focusFinal : null,
        bio: bio.trim() || null,
        status: "active",
      });
      if (insertError) throw insertError;
      navigate("/ambassador/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("ambassadors").select("id").eq("user_id", user.id).single().then(({ data }) => {
      if (data) navigate("/ambassador/dashboard", { replace: true });
    });
  }, [user?.id, navigate]);

  if (!user) {
    return (
      <PortalPageLayout maxWidth="sm" xrayId="ambassador-registration">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">Sign in to register as an Ambassador.</p>
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign in
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="sm" xrayId="ambassador-registration">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/portal")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Portal
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Become an Ambassador</CardTitle>
            <p className="text-sm text-muted-foreground">
              You&apos;re signing up to personally guide 10 new members into Liana Banyan.
              This isn&apos;t a referral link — you&apos;ll walk alongside each person, step by step.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How recruits will see you"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Antonio, TX"
                />
              </div>
              <div>
                <Label className="mb-2 block">What areas interest you? (check all that apply)</Label>
                <div className="space-y-2">
                  {FOCUS_OPTIONS.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={opt.key === "all" ? focusAreas.length === 4 : focusAreas.includes(opt.key)}
                        onCheckedChange={() => toggleFocus(opt.key)}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Short bio (shown to your recruits)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A sentence or two about why you're an Ambassador."
                  className="min-h-[80px] resize-none"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering…" : "Register as Ambassador"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
