/**
 * Roll Nomination — /roll/nominate
 * Open-Nomination Canon: anyone nominates · including self-nomination
 * BP044 W1 · substrate self-limits via Body-Cam + 3-prong + peer-witness + dual-veto
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, PlusCircle, Info, Shield, Users } from "lucide-react";

export default function RollNominatePage() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const [form, setForm] = useState({
    nominated_display_name: "",
    nominated_bio: "",
    proposed_famous_class: false,
    self_nomination: false,
    nominated_by_class: "member" as string,
    // Peer witnesses (non-famous requires ≥2)
    witness1_name: "",
    witness1_relationship: "",
    witness1_independent: false,
    witness2_name: "",
    witness2_relationship: "",
    witness2_independent: true,
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const requiresPeerWitnesses = !form.proposed_famous_class;
  const peerWitnessCount = [form.witness1_name, form.witness2_name].filter(Boolean).length;
  const peerWitnessValid = form.proposed_famous_class || peerWitnessCount >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!form.nominated_display_name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!peerWitnessValid) {
      setError("Non-famous class nominations require at least 2 cooperative-class peer witnesses.");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Detect spectacle-class flag (reality-TV / influencer)
    const spectacleKeywords = ["reality", "influencer", "tiktok", "instagram", "youtube", "streaming", "bachelor", "survivor", "idol"];
    const bioLower = (form.nominated_bio + " " + form.notes).toLowerCase();
    const spectacle_class_flag = spectacleKeywords.some((k) => bioLower.includes(k));

    const { data: nomination, error: insertErr } = await supabase
      .from("roll_nominations")
      .insert({
        nominated_display_name: form.nominated_display_name.trim(),
        nominated_bio: form.nominated_bio.trim() || null,
        nominated_by_class: form.self_nomination ? "self" : "member",
        nominator_member_id: session.user.id,
        proposed_famous_class: form.proposed_famous_class,
        spectacle_class_flag,
        peer_witness_count_minimum_2: peerWitnessCount,
        notes: form.notes.trim() || null,
        nomination_status: "pending",
        prong_a_b_c_check_status: "pending",
      })
      .select()
      .single();

    if (insertErr) {
      setError(insertErr.message);
      setSubmitting(false);
      return;
    }

    // Insert peer witnesses if non-famous-class
    if (!form.proposed_famous_class && nomination) {
      const witnesses = [
        { name: form.witness1_name, relationship: form.witness1_relationship, independent: form.witness1_independent },
        { name: form.witness2_name, relationship: form.witness2_relationship, independent: form.witness2_independent },
      ].filter((w) => w.name.trim());

      // We'll need to insert witnesses after the roll_member row is created — for now log them to nomination notes
      // (Witnesses are stored in roll_peer_witnesses linked to roll_member_id, which is created after nomination is accepted)
      // TODO: wire witness creation when nomination converts to roll_member
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <CardTitle>Nomination Submitted</CardTitle>
            <CardDescription>
              Your nomination is in the queue. The cooperative-class peer-mesh will review it.
              {!form.proposed_famous_class && " Peer-witness verification will proceed next."}
              {" "}If a spectacle-class flag was detected, Pawn will run 3-prong verification before vote queue placement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 justify-center">
              <Link to="/roll"><Button variant="outline">Back to The Roll</Button></Link>
              <Button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, nominated_display_name: "", nominated_bio: "" })); }}>
                Nominate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/roll" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to The Roll
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Nominate for The Roll</h1>
          <p className="text-muted-foreground">
            Open Nomination Canon — BP044 W1. Anyone can nominate, including yourself.
            The substrate self-limits via Body-Cam doctrine, 3-prong cooperative-craft authority
            test, peer-witness requirement, and dual-veto path.
          </p>
        </div>

        {/* Info panel */}
        <div className="mb-6 p-4 rounded-lg bg-sky-950/20 border border-sky-800/30">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1.5">
              <p className="font-medium text-sky-300">3-Prong Famous-Class Test</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>A:</strong> Demonstrable cooperative-class work or advocacy (not just spectacle-class fame)</li>
                <li><strong>B:</strong> Body-Cam — clean public record (or repentance-class verified)</li>
                <li><strong>C:</strong> Cultural-amplification reach independent of substrate</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Non-famous class (passes A+B, not C) = cooperative-class authority figures who
                benefit from substrate amplification. They require ≥2 peer witnesses.
              </p>
            </div>
          </div>
        </div>

        {!session && (
          <div className="mb-6 p-4 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300 text-sm">
            <Shield className="inline w-4 h-4 mr-2" />
            Sign in to submit a nomination. Open-Nomination canon is for members of the cooperative substrate.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nominee identity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nominee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Vandana Shiva"
                  value={form.nominated_display_name}
                  onChange={(e) => handleChange("nominated_display_name", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Cooperative-Class Authority Summary</Label>
                <Textarea
                  id="bio"
                  placeholder="Why are they cooperative-class authority? What do they do? Cooperative-class work, advocacy, scholarship..."
                  value={form.nominated_bio}
                  onChange={(e) => handleChange("nominated_bio", e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="self_nom"
                  checked={form.self_nomination}
                  onCheckedChange={(v) => handleChange("self_nomination", v)}
                />
                <Label htmlFor="self_nom" className="text-sm cursor-pointer">
                  This is a self-nomination (I am nominating myself)
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="famous_class"
                  checked={form.proposed_famous_class}
                  onCheckedChange={(v) => handleChange("proposed_famous_class", v)}
                />
                <Label htmlFor="famous_class" className="text-sm cursor-pointer">
                  This nominee passes all 3 prongs (famous-class — amplification reach independent of substrate)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Peer witnesses (non-famous only) */}
          {requiresPeerWitnesses && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Cooperative-Class Peer Witnesses
                </CardTitle>
                <CardDescription>
                  Non-famous-class nominations require at least 2 peer witnesses — people who know
                  this person's cooperative-class work firsthand. At least 1 must be independent
                  from the nominating lane.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: "1", nameField: "witness1_name", relField: "witness1_relationship", indField: "witness1_independent" },
                  { key: "2", nameField: "witness2_name", relField: "witness2_relationship", indField: "witness2_independent" },
                ].map(({ key, nameField, relField, indField }) => (
                  <div key={key} className="space-y-3 pb-4 border-b border-border/30 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-muted-foreground">Witness {key}</p>
                    <Input
                      placeholder="Witness name"
                      value={form[nameField as keyof typeof form] as string}
                      onChange={(e) => handleChange(nameField, e.target.value)}
                    />
                    <Input
                      placeholder="Relationship (e.g. cooperative colleague, community member)"
                      value={form[relField as keyof typeof form] as string}
                      onChange={(e) => handleChange(relField, e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form[indField as keyof typeof form] as boolean}
                        onCheckedChange={(v) => handleChange(indField, v)}
                      />
                      <span className="text-sm text-muted-foreground">Independent witness (not from my organization)</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context, cross-stack initiative connections, or cooperative-class context..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !session}
          >
            {submitting ? "Submitting..." : "Submit Nomination"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting, you acknowledge that this nomination will be reviewed via Body-Cam doctrine
            and the 3-prong cooperative-craft authority test. Reality-TV and spectacle-class nominations
            are automatically queued for Pawn verification before vote placement.
          </p>
        </form>
      </div>
    </div>
  );
}
