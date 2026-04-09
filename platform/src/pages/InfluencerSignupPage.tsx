import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { grantInfluencerBatteryDispatchAccess } from "@/lib/batteryDispatchAccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function InfluencerSignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [acceptAgreement, setAcceptAgreement] = useState(false);
  const [acknowledgeDeadline, setAcknowledgeDeadline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const graceDeadline = useMemo(() => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);
    return deadline.toLocaleDateString();
  }, []);

  const canSubmit = !!user && acceptAgreement && acknowledgeDeadline && !isSubmitting;

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    setIsSubmitting(true);
    try {
      await grantInfluencerBatteryDispatchAccess(
        user.id,
        `Influencer self-declared. First publication due within 30 days (${graceDeadline}).`,
      );
      toast.success("Influencer path activated. Battery Dispatch access granted.");
      navigate("/dashboard/dispatch");
    } catch (error) {
      console.error(error);
      toast.error("Could not activate Influencer path. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Sign in to activate the Influencer path.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Influencer Signup</CardTitle>
              <CardDescription>
                Battery Dispatch is included when you commit to active publishing.
              </CardDescription>
            </div>
            <Badge variant="secondary">Included Benefit</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Creator Agreement (summary)</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Use truthful disclosure for promotional/incentivized content.</li>
              <li>Respect platform guardrails and community standards.</li>
              <li>Keep participation active to retain Battery Dispatch access.</li>
            </ul>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">30-day first-publish requirement</p>
            <p className="text-sm text-muted-foreground">
              Publish your first piece by <span className="font-medium text-foreground">{graceDeadline}</span> to keep your path active.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={acceptAgreement}
                onCheckedChange={(checked) => setAcceptAgreement(checked === true)}
              />
              <span>I accept the Creator Agreement and disclosure commitments.</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <Checkbox
                checked={acknowledgeDeadline}
                onCheckedChange={(checked) => setAcknowledgeDeadline(checked === true)}
              />
              <span>I understand I must publish my first piece within 30 days.</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting ? "Activating..." : "Activate Influencer Path"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/dispatch")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
