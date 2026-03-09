import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LifeLineMedicationsRequest() {
  const { toast } = useToast();
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [reason, setReason] = useState("");

  const { data: initiative } = useQuery({
    queryKey: ["lifeline-initiative"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .eq("initiative_slug", "lifeline_medications")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmitRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("lifeline_requests")
      .insert({
        user_id: user.id,
        initiative_id: initiative?.id,
        medication_name: medication,
        dosage,
        reason_for_request: reason,
        status: "pending",
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Submitted", description: "We'll review your request and get back to you." });
      setMedication("");
      setDosage("");
      setReason("");
    }
  };

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-emerald-500" />
          <CardTitle>Health Accords Medication Request</CardTitle>
        </div>
        <CardDescription>
          Request assistance with medication costs. We research and manufacture at cost + 20%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Medication Name</Label>
          <Input
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="e.g., Insulin"
          />
        </div>

        <div className="space-y-2">
          <Label>Dosage</Label>
          <Input
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 10mg daily"
          />
        </div>

        <div className="space-y-2">
          <Label>Reason for Request</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you need this medication..."
            rows={4}
          />
        </div>

        <Button onClick={handleSubmitRequest} className="w-full">
          Submit Request
        </Button>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-2">
          <p className="font-semibold">How the Health Accords Work:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>We research and start production businesses for needed medications</li>
            <li>Medications sold at cost + 20% (e.g., insulin)</li>
            <li>Not just buying meds, but making them affordable long-term</li>
            <li>Cap on assistance is starting production capability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
