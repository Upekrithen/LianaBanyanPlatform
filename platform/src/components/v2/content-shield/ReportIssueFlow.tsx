import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReportIssueFlowProps = {
  onSubmit: (payload: { category: string; summary: string; details: string }) => void;
};

const CATEGORIES = [
  "Harassment",
  "Hate speech",
  "Misinformation",
  "Impersonation",
  "Spam",
  "Other harm",
];

export function ReportIssueFlow({ onSubmit }: ReportIssueFlowProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");

  const canContinueFromStep1 = category.length > 0;
  const canContinueFromStep2 = summary.trim().length >= 8;

  const submit = () => {
    onSubmit({ category, summary: summary.trim(), details: details.trim() });
    setStep(1);
    setCategory("");
    setSummary("");
    setDetails("");
  };

  return (
    <Card data-xray-id="content-shield-report-flow">
      <CardHeader>
        <CardTitle>Report an issue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Describe what happened in your own words. Reports are reviewed respectfully, with context.
        </p>

        {step === 1 ? (
          <div className="space-y-3">
            <Label htmlFor="cs-category">What kind of issue are you reporting?</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    category === value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-2">
            <Label htmlFor="cs-summary">Short summary</Label>
            <Input
              id="cs-summary"
              placeholder="One sentence summary of the concern"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-2">
            <Label htmlFor="cs-details">Additional details (optional)</Label>
            <Textarea
              id="cs-details"
              rows={5}
              placeholder="Share context, timing, and any links or screenshots."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap justify-between gap-2">
          <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={(step === 1 && !canContinueFromStep1) || (step === 2 && !canContinueFromStep2)}
            >
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={!canContinueFromStep1 || !canContinueFromStep2}>
              Submit report
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
