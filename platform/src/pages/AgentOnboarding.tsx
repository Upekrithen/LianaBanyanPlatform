import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { KeirseyAssessmentCard } from "@/components/onboarding/KeirseyAssessmentCard";
import { KeirseyResultsForm } from "@/components/onboarding/KeirseyResultsForm";
import { Loader2 } from "lucide-react";

interface OnboardingRecord {
  id: string;
  status: string;
  keirsey_completed: boolean;
  keirsey_temperament: string | null;
  keirsey_variant: string | null;
  approval_status: string | null;
  started_at: string;
  completed_at: string | null;
}

export default function AgentOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingRecord, setOnboardingRecord] = useState<OnboardingRecord | null>(null);
  const [showResultsForm, setShowResultsForm] = useState(false);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("agent_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create new onboarding record
        const { data: newRecord, error: createError } = await supabase
          .from("agent_onboarding")
          .insert([{ user_id: user.id, status: "in_progress" }])
          .select()
          .single();

        if (createError) throw createError;
        setOnboardingRecord(newRecord);
      } else {
        setOnboardingRecord(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading onboarding status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultsSubmitted = () => {
    setShowResultsForm(false);
    loadOnboardingStatus();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressPercentage = onboardingRecord?.keirsey_completed ? 100 : 50;
  const isComplete = onboardingRecord?.status === "assessment_complete";
  const isApproved = onboardingRecord?.approval_status === "approved";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LB Agent Onboarding</h1>
            <p className="text-muted-foreground mt-1">
              Complete your personality assessment to join the LianaBanyan team
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Onboarding Progress</CardTitle>
                <CardDescription>Complete all required steps to activate your agent account</CardDescription>
              </div>
              <Badge variant={isApproved ? "default" : "secondary"}>
                {isApproved ? "Approved" : isComplete ? "Under Review" : "In Progress"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Overall Completion</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {isApproved && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Your onboarding has been approved! Welcome to the LianaBanyan team.
                </AlertDescription>
              </Alert>
            )}

            {isComplete && !isApproved && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your assessment is complete and under HR review. You'll be notified once approved.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Keirsey Assessment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              onboardingRecord?.keirsey_completed
                ? "border-green-500 bg-green-500/10"
                : "border-primary bg-primary/10"
            }`}>
              {onboardingRecord?.keirsey_completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <span className="text-sm font-semibold">1</span>
              )}
            </div>
            <h2 className="text-xl font-semibold">Keirsey Temperament Sorter</h2>
            {onboardingRecord?.keirsey_completed && (
              <Badge variant="outline" className="ml-auto">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>

          {!onboardingRecord?.keirsey_completed ? (
            <>
              <KeirseyAssessmentCard />
              
              {!showResultsForm ? (
                <Card className="border-2 border-dashed">
                  <CardContent className="py-8">
                    <div className="text-center space-y-4">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold mb-1">Ready to submit your results?</h3>
                        <p className="text-sm text-muted-foreground">
                          After completing the assessment, return here to record your temperament type
                        </p>
                      </div>
                      <Button onClick={() => setShowResultsForm(true)}>
                        Submit Assessment Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <KeirseyResultsForm
                  onboardingId={onboardingRecord?.id || ""}
                  onCancel={() => setShowResultsForm(false)}
                  onSuccess={handleResultsSubmitted}
                />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Assessment Complete</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium text-foreground">Temperament:</span>{" "}
                        {onboardingRecord.keirsey_temperament?.charAt(0).toUpperCase() + 
                         onboardingRecord.keirsey_temperament?.slice(1)}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Variant:</span>{" "}
                        {onboardingRecord.keirsey_variant?.split("").map((c, i) => 
                          i === 0 ? c.toUpperCase() : c
                        ).join("")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Next Steps */}
        {!isApproved && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What's Next:</strong> Once you've completed the Keirsey assessment, HR will review your 
              onboarding package. You'll receive an email notification when your agent account is activated.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
