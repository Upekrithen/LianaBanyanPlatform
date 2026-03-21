import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, Scale, Lock } from "lucide-react";
import { IPAssetForm } from "@/components/ip/IPAssetForm";
import { TierSelectionWizard } from "@/components/ip/TierSelectionWizard";
import { TierComparisonTable } from "@/components/ip/TierComparisonTable";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function IPRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"comparison" | "selection" | "form">("comparison");
  const [selectedTier, setSelectedTier] = useState<"tier_a" | "tier_b" | "tier_c" | null>(null);

  const handleTierSelect = (tier: "tier_a" | "tier_b" | "tier_c") => {
    setSelectedTier(tier);
    setStep("form");
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("selection");
    } else if (step === "selection") {
      setStep("comparison");
    } else {
      navigate(-1);
    }
  };

  return (
    <PortalPageLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Register Intellectual Property</h1>
            <p className="text-muted-foreground mt-1">
              Protect your innovations while maintaining the control that matters to you
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 ${step === "comparison" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "comparison" ? "border-primary bg-primary/10" : "border-muted"}`}>
              1
            </div>
            <span className="hidden sm:inline text-sm font-medium">Compare Tiers</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step === "selection" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "selection" ? "border-primary bg-primary/10" : "border-muted"}`}>
              2
            </div>
            <span className="hidden sm:inline text-sm font-medium">Select Tier</span>
          </div>
          <div className="w-12 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 ${step === "form" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "form" ? "border-primary bg-primary/10" : "border-muted"}`}>
              3
            </div>
            <span className="hidden sm:inline text-sm font-medium">Register IP</span>
          </div>
        </div>

        {/* Step Content */}
        {step === "comparison" && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Tier A</CardTitle>
                  </div>
                  <CardDescription>Ethical Guardrails Only</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">49%</span>
                    <span className="text-muted-foreground">Creator</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Recommended Default</Badge>
                  <p className="text-sm text-muted-foreground">
                    Maximum utilization with anti-shelving protections
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Tier B</CardTitle>
                  </div>
                  <CardDescription>Category Restrictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">60%</span>
                    <span className="text-muted-foreground">Creator</span>
                  </div>
                  <Badge variant="outline" className="text-xs">Balanced Control</Badge>
                  <p className="text-sm text-muted-foreground">
                    Pre-select up to 5 prohibited use categories
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-500/20 hover:border-amber-500/50 transition-colors bg-amber-500/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-lg">Tier C</CardTitle>
                  </div>
                  <CardDescription>Case-by-Case Approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">75%</span>
                    <span className="text-muted-foreground">Creator</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">Invitation Only</Badge>
                  <p className="text-sm text-muted-foreground">
                    Requires C-suite authorization for exceptional IP
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Comparison Table */}
            <TierComparisonTable />

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <Button size="lg" onClick={() => setStep("selection")}>
                Choose Your Tier
              </Button>
            </div>
          </div>
        )}

        {step === "selection" && (
          <TierSelectionWizard onTierSelect={handleTierSelect} />
        )}

        {step === "form" && selectedTier && (
          <IPAssetForm selectedTier={selectedTier} />
        )}
      </div>
    </PortalPageLayout>
  );
}
