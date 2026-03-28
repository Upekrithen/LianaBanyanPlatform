import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmissions, TIER_LABELS, TIER_MARKS, IMPROVEMENT_TYPE_LABELS } from "@/hooks/usePiggyback";
import { triggerCoinFlip } from "@/components/xray/CoinFlipAnimation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, Wrench, Camera, Package, Send } from "lucide-react";

type TierSlug = 'tereno_certified' | 'tereno_approved' | 'hexisle_official' | 'hexisle_compatible' | 'hexisle_adaptable' | 'hexisle_inspired';
type ImprovementType = 'tolerance_fix' | 'print_orientation' | 'fdm_optimization' | 'material_change' | 'mechanism_redesign' | 'new_function' | 'aesthetic_improvement' | 'assembly_simplification' | 'cost_reduction' | 'other';

const STEPS = [
  { title: "What Are You Improving?", icon: Package },
  { title: "What Did You Change?", icon: Wrench },
  { title: "Upload Evidence", icon: Camera },
  { title: "Proposed Tier", icon: CheckCircle },
  { title: "Submit", icon: Send },
];

export default function PiggybackSubmitPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitImprovement } = useSubmissions();
  const submitRef = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [originalPiece, setOriginalPiece] = useState("");
  const [originalDownloadId, setOriginalDownloadId] = useState<string | undefined>();
  const [isNewPiece, setIsNewPiece] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [improvementType, setImprovementType] = useState<ImprovementType | "">("");
  const [testResults, setTestResults] = useState("");
  const [stlUrl, setStlUrl] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [printerUsed, setPrinterUsed] = useState("");
  const [materialUsed, setMaterialUsed] = useState("");
  const [printSettings, setPrintSettings] = useState("");
  const [proposedTier, setProposedTier] = useState<TierSlug | "">("");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Sign in to submit improvements</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canAdvance = () => {
    switch (step) {
      case 0: return isNewPiece || originalPiece.trim().length > 0;
      case 1: return title.trim().length > 0 && description.trim().length > 0 && improvementType !== "";
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!improvementType) return;
    setSubmitting(true);
    try {
      await submitImprovement.mutateAsync({
        originalDownloadId: originalDownloadId || undefined,
        title,
        description,
        improvementType: improvementType as ImprovementType,
        stlUrl: stlUrl || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        videoUrl: videoUrl || undefined,
        testResults: testResults || undefined,
        printerUsed: printerUsed || undefined,
        materialUsed: materialUsed || undefined,
        printSettings: printSettings || undefined,
        proposedTier: proposedTier ? (proposedTier as TierSlug) : undefined,
      });

      if (submitRef.current) {
        const rect = submitRef.current.getBoundingClientRect();
        triggerCoinFlip(rect.left + rect.width / 2, rect.top, 5);
      }

      toast({
        title: "Submission received!",
        description: "You'll be notified when your improvement is reviewed.",
      });
      setTimeout(() => navigate("/dashboard/my-improvements"), 1500);
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-950/10 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Piggyback Protocol</h1>
          <p className="text-muted-foreground">Download. Print. Improve. Get Credited.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5" />; })()}
              {STEPS[step].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 0: What Are You Improving? */}
            {step === 0 && (
              <>
                <div className="space-y-3">
                  <Label>Original Piece</Label>
                  {!isNewPiece ? (
                    <Input
                      placeholder="Search HexIsle Downloads by name..."
                      value={originalPiece}
                      onChange={(e) => setOriginalPiece(e.target.value)}
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                      New piece — not currently in the library
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsNewPiece(!isNewPiece); setOriginalPiece(""); setOriginalDownloadId(undefined); }}
                  >
                    {isNewPiece ? "← Search existing pieces" : "New piece not in library"}
                  </Button>
                </div>
                {originalPiece && !isNewPiece && (
                  <div className="p-3 rounded-lg border bg-card flex items-center gap-3">
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{originalPiece}</p>
                      <p className="text-xs text-muted-foreground">Selected piece</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 1: What Did You Change? */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Improvement Type</Label>
                  <Select value={improvementType} onValueChange={(v) => setImprovementType(v as ImprovementType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(IMPROVEMENT_TYPE_LABELS) as [ImprovementType, string][]).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Short description of your improvement" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Explain what you changed and why. What problem does this solve?"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Results (optional)</Label>
                  <Textarea
                    placeholder="What did you test? How did it perform vs. the original?"
                    rows={3}
                    value={testResults}
                    onChange={(e) => setTestResults(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Step 2: Upload Evidence */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>STL File URL</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      placeholder="Paste STL file URL or drag and drop"
                      value={stlUrl}
                      onChange={(e) => setStlUrl(e.target.value)}
                      className="border-0 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Photo URLs (before/after comparison encouraged)</Label>
                  <Textarea
                    placeholder="Paste photo URLs, one per line"
                    rows={3}
                    value={photoUrls.join("\n")}
                    onChange={(e) => setPhotoUrls(e.target.value.split("\n").filter(Boolean))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video URL (optional)</Label>
                  <Input placeholder="YouTube or other video link" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Printer Used</Label>
                    <Input placeholder="e.g. Ender 3" value={printerUsed} onChange={(e) => setPrinterUsed(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Material</Label>
                    <Input placeholder="e.g. PLA+" value={materialUsed} onChange={(e) => setMaterialUsed(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Print Settings</Label>
                    <Input placeholder="e.g. 0.2mm layer" value={printSettings} onChange={(e) => setPrintSettings(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Proposed Tier */}
            {step === 3 && (
              <>
                <CardDescription>
                  Which tier do you think your improvement qualifies for? Not sure? We'll classify it for you.
                </CardDescription>
                <div className="grid gap-2">
                  {(Object.entries(TIER_LABELS) as [TierSlug, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setProposedTier(key === proposedTier ? "" : key)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        key === proposedTier
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{TIER_MARKS[key]} Marks on approval</p>
                      </div>
                      {key === proposedTier && <CheckCircle className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProposedTier("")}
                  className="text-muted-foreground"
                >
                  Skip — let the review team classify it
                </Button>
              </>
            )}

            {/* Step 4: Review & Submit */}
            {step === 4 && (
              <>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Piece:</span>{" "}
                      <span className="font-medium">{isNewPiece ? "New piece" : originalPiece || "—"}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-medium">{improvementType ? IMPROVEMENT_TYPE_LABELS[improvementType as ImprovementType] : "—"}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{title || "—"}</span>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Description:</span>{" "}
                    <span>{description || "—"}</span>
                  </div>
                  {proposedTier && (
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Proposed Tier:</span>{" "}
                      <Badge variant="outline">{TIER_LABELS[proposedTier as TierSlug]}</Badge>
                    </div>
                  )}
                  {stlUrl && (
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">STL:</span> <span className="truncate">{stlUrl}</span>
                    </div>
                  )}
                  {photoUrls.length > 0 && (
                    <div className="p-2 rounded bg-muted/50">
                      <span className="text-muted-foreground">Photos:</span> {photoUrls.length} uploaded
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs text-muted-foreground">
                  By submitting, you agree to the <strong>Piggyback Protocol</strong>: your improvement enters
                  the IP Ledger and may be manufactured by the cooperative. You retain attribution and earn
                  Marks + revenue share if promoted to production.
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            {step > 0 ? "Back" : "Cancel"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()} className="gap-1.5">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              ref={submitRef}
              onClick={handleSubmit}
              disabled={submitting || !title || !description || !improvementType}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? "Submitting..." : "Submit Improvement"} <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
