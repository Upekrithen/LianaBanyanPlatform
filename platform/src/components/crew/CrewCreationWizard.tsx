/**
 * CREW CREATION WIZARD — 3-step formation (Name/Focus, Your Offer, Commit)
 * Creates crew + creator as first member; redirects to crew dashboard on success.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
const FOCUS_OPTIONS = [
  { id: "dinner", label: "Let's Make Dinner" },
  { id: "grocery", label: "Let's Get Groceries" },
  { id: "skill", label: "Skill Sessions" },
  { id: "product", label: "Product Launch" },
  { id: "mixed", label: "Mixed / Open" },
];

export function CrewCreationWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    focus: "mixed",
    city: "",
    state: "",
    zip: "",
    offerTitle: "",
    offerDescription: "",
    offerPrice: "",
    committed: false,
  });

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  const canStep2 = form.name.trim().length > 0 && form.focus;
  const canStep3 = form.offerTitle.trim().length > 0 && form.offerPrice.trim().length > 0;
  const canSubmit = form.committed && canStep2 && canStep3;

  const handleCreate = async () => {
    if (!user || !canSubmit) return;
    setLoading(true);
    try {
      const { data: crew, error: crewErr } = await supabase
        .from("crews")
        .insert({
          name: form.name.trim(),
          focus: form.focus,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zip: form.zip.trim() || null,
          status: "forming",
          min_members: 8,
          max_members: 12,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (crewErr || !crew) {
        toast.error(crewErr?.message ?? "Could not create crew");
        setLoading(false);
        return;
      }

      const price = form.offerPrice ? parseFloat(form.offerPrice.replace(/[^0-9.]/g, "")) : null;
      const { error: memberErr } = await supabase.from("crew_members").insert({
        crew_id: crew.id,
        user_id: user.id,
        offer_title: form.offerTitle.trim(),
        offer_description: form.offerDescription.trim() || null,
        offer_price: price,
        role: "captain",
        status: "joined",
      });

      if (memberErr) {
        toast.error(memberErr.message);
        setLoading(false);
        return;
      }

      toast.success("Crew created. Share your invite link to fill the Crew.");
      navigate(`/crew/${crew.id}`);
    } catch (e) {
      toast.error("Something went wrong.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/portal"))}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {step > 1 ? "Back" : "Portal"}
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Form Your Crew</h1>
          <p className="text-muted-foreground">12 people who back each other's first offers.</p>
        </div>

        <Progress value={(step / 3) * 100} className="h-2" />

        {/* Step 1: Name & Focus */}
        {step === 1 && (
          <Card data-xray-id="crew-wizard-step1">
            <CardHeader>
              <CardTitle>What should we call this Crew?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="crew-name">Crew name</Label>
                <Input
                  id="crew-name"
                  placeholder="East Side Supper Crew, Sunday Grocery Squad, HexIsle Founders — San Antonio"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>What will this Crew focus on?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FOCUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => update({ focus: opt.id })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.focus === opt.id ? "border-green-500 bg-green-500/10" : "border-border hover:border-green-500/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="crew-city">City</Label>
                  <Input
                    id="crew-city"
                    value={form.city}
                    onChange={(e) => update({ city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crew-state">State</Label>
                  <Input
                    id="crew-state"
                    value={form.state}
                    onChange={(e) => update({ state: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crew-zip">ZIP</Label>
                <Input
                  id="crew-zip"
                  value={form.zip}
                  onChange={(e) => update({ zip: e.target.value })}
                  placeholder="ZIP"
                />
              </div>
              <Button className="w-full" onClick={() => setStep(2)} disabled={!canStep2}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Your Offer */}
        {step === 2 && (
          <Card data-xray-id="crew-wizard-step2">
            <CardHeader>
              <CardTitle>What are you offering in this first run?</CardTitle>
              <p className="text-sm text-muted-foreground">
                Example: &quot;12-pack of homemade tortillas — $18&quot; or &quot;1-hour budgeting session — $20&quot;
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="offer-title">Title</Label>
                <Input
                  id="offer-title"
                  value={form.offerTitle}
                  onChange={(e) => update({ offerTitle: e.target.value })}
                  placeholder="e.g. 12-pack homemade tortillas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-desc">Short description (optional)</Label>
                <Textarea
                  id="offer-desc"
                  value={form.offerDescription}
                  onChange={(e) => update({ offerDescription: e.target.value })}
                  placeholder="2 lines is enough"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-price">Price ($15–$20 guideline, any amount OK)</Label>
                <Input
                  id="offer-price"
                  type="text"
                  value={form.offerPrice}
                  onChange={(e) => update({ offerPrice: e.target.value })}
                  placeholder="18"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!canStep3}>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Commitment + Create */}
        {step === 3 && (
          <Card data-xray-id="crew-wizard-commit">
            <CardHeader>
              <CardTitle>Crew Run #1 Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li>Back 1 other Crew member&apos;s offer ($15–$20)</li>
                <li>Deliver your own offer when backed</li>
                <li>4-week window to complete</li>
                <li>We&apos;ll help you meet your Crew and track progress</li>
              </ul>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="commit"
                  checked={form.committed}
                  onCheckedChange={(c) => update({ committed: c === true })}
                />
                <Label htmlFor="commit" className="cursor-pointer">
                  I&apos;m in. Let&apos;s do this.
                </Label>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCreate}
                  disabled={!canSubmit || loading}
                >
                  {loading ? "Creating…" : "Create My Crew"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
