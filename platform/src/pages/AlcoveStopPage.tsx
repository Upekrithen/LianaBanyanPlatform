import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ALCOVES } from "@/lib/alcoveSystem";
import { useAlcoveProgress } from "@/hooks/useAlcoveProgress";

const STOP_LINKS: Record<string, { label: string; href: string }[]> = {
  "three-currencies": [{ label: "Pudding: Three Currencies", href: "/cephas/all-the-pudding" }],
  "golden-key": [{ label: "Golden Key Quest", href: "/golden-key" }],
  "howey-defense": [{ label: "Legal / Howey Context", href: "/cephas/papers" }],
  "patent-portfolio": [{ label: "Patent Portfolio", href: "/patent-portfolio" }],
  membership: [{ label: "Membership", href: "/membership" }],
  "as-you-wish": [{ label: "As You Wish", href: "/as-you-wish" }],
  "attention-bidding": [{ label: "Marketplace", href: "/marketplace" }],
  matchtrade: [{ label: "MatchTrade", href: "/matchtrade" }],
};

export default function AlcoveStopPage() {
  const { stopSlug } = useParams<{ stopSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const progress = useAlcoveProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const index = ALCOVES.findIndex((a) => a.id === stopSlug);
  const stop = index >= 0 ? ALCOVES[index] : null;

  useEffect(() => {
    if (!stop) return;
    void progress.markVisited(stop);
  }, [stopSlug]);

  const stopProgress = useMemo(
    () => progress.stops.find((s) => s.alcove.id === stopSlug),
    [progress.stops, stopSlug],
  );

  if (!stop) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="alcove-stop-missing">
        <Card className="border-slate-700 bg-slate-900/70">
          <CardContent className="py-8">
            <p className="text-slate-200">This Alcove stop does not exist.</p>
            <Button className="mt-4" onClick={() => navigate("/learn")}>Back to Alcove Hallway</Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  const previous = index > 0 ? ALCOVES[index - 1] : null;
  const next = index < ALCOVES.length - 1 ? ALCOVES[index + 1] : null;
  const linkList = [...(STOP_LINKS[stop.id] ?? [])];
  if (stop.documentSlug) {
    linkList.push({ label: "Related Cephas Archive", href: "/cephas/archive" });
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const failed = stop.questions.filter((q) => {
      const raw = (answers[q.id] ?? "").trim().toLowerCase();
      const expected = q.correctAnswer.trim().toLowerCase();
      return raw !== expected;
    });

    if (failed.length > 0) {
      toast({
        title: "Not quite yet",
        description: `You missed ${failed.length} question${failed.length > 1 ? "s" : ""}. Check the prompt and try again.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    await progress.markComprehended(stop);
    toast({
      title: "Alcove comprehended",
      description: "Marks awarded and progress updated.",
    });
    setIsSubmitting(false);
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId={`alcove-stop-${stop.id}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link to="/learn" className="hover:text-slate-200 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Alcove Hallway
          </Link>
          <span>/</span>
          <span>{stop.title}</span>
        </div>

        <Card className="border-indigo-400/20 bg-slate-950/70">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <span>{stop.icon}</span> {stop.position}. {stop.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">{stop.preview}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-indigo-400/30 text-indigo-200">Tier {stop.tier}</Badge>
              <Badge variant="outline" className="border-indigo-400/30 text-indigo-200">{stop.subtitle}</Badge>
              {stopProgress?.comprehended ? (
                <Badge variant="outline" className="border-emerald-400/40 text-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Comprehended
                </Badge>
              ) : null}
            </div>
            <Progress value={(stop.position / ALCOVES.length) * 100} className="h-2" />
            <p className="text-xs text-slate-400">Stop {stop.position} of {ALCOVES.length}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-slate-100">Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stop.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label className="text-slate-200">{q.question}</Label>
                {q.options ? (
                  <div className="grid gap-2">
                    {q.options.map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={answers[q.id] === opt ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={q.isYesNo ? "yes or no" : "Type your answer"}
                  />
                )}
              </div>
            ))}
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Checking..." : "Submit and complete stop"}
            </Button>
          </CardContent>
        </Card>

        {linkList.length > 0 ? (
          <Card className="border-slate-700 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-slate-100">Related Cephas / Platform Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {linkList.map((item) => (
                <Link key={`${item.href}-${item.label}`} to={item.href}>
                  <Badge variant="outline" className="border-sky-400/40 text-sky-200 hover:bg-sky-900/20">
                    {item.label}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="flex items-center justify-between">
          {previous ? (
            <Button variant="outline" onClick={() => navigate(`/learn/${previous.id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          ) : <div />}
          {next ? (
            <Button onClick={() => navigate(`/learn/${next.id}`)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => navigate("/learn")}>Return to Hallway</Button>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}

