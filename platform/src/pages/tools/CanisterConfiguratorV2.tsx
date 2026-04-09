import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Hero } from "@/components/v2/Hero";
import { StickyMobileCTA } from "@/components/v2/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import { QuestionStep } from "@/components/v2/canister/QuestionStep";
import { WorkProfileQuestionnaire } from "@/components/v2/canister/WorkProfileQuestionnaire";
import { ShopNote } from "@/components/v2/canister/ShopNote";
import { KitRecommendation } from "@/components/v2/canister/KitRecommendation";
import { KitComparisonView } from "@/components/v2/canister/KitComparisonView";
import { PioneerNodeProgressBar } from "@/components/v2/canister/PioneerNodeProgressBar";
import {
  BatchNeed,
  ConstraintNeed,
  KitTier,
  MaterialNeed,
  NodeAmbition,
  StrengthNeed,
} from "@/components/v2/canister/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 6;

function mapRecommendation(
  strengthNeed: StrengthNeed,
  materialNeed: MaterialNeed,
  batchNeed: BatchNeed,
  nodeAmbition: NodeAmbition,
): { tier: KitTier; payoff: string } {
  if (materialNeed === "mixed" || nodeAmbition === "qualifying") {
    return {
      tier: "complete",
      payoff: "Complete gives you mixed-material flexibility and enough operational headroom to support qualification-focused work.",
    };
  }
  if (materialNeed === "thermoplastic" || strengthNeed === "high_stress" || batchNeed === "large") {
    return {
      tier: "thermoplastic",
      payoff: "Thermoplastic is matched to stronger output and recurring production runs without overcomplicating your first setup.",
    };
  }
  return {
    tier: "gravity",
    payoff: "Gravity keeps setup light while supporting serious repeatable batch work for foundational shop outcomes.",
  };
}

export default function CanisterConfiguratorV2() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const [primaryWork, setPrimaryWork] = useState("");
  const [currentTools, setCurrentTools] = useState("");
  const [strengthNeed, setStrengthNeed] = useState<StrengthNeed>("everyday");
  const [materialNeed, setMaterialNeed] = useState<MaterialNeed>("resin");
  const [batchNeed, setBatchNeed] = useState<BatchNeed>("small");
  const [constraints, setConstraints] = useState<ConstraintNeed[]>([]);
  const [nodeAmbition, setNodeAmbition] = useState<NodeAmbition>("learning");

  const profileReady = primaryWork.trim().length > 0 && currentTools.trim().length > 0;
  const recommendation = useMemo(
    () => mapRecommendation(strengthNeed, materialNeed, batchNeed, nodeAmbition),
    [strengthNeed, materialNeed, batchNeed, nodeAmbition],
  );

  const toggleConstraint = (constraint: ConstraintNeed) => {
    setConstraints((prev) =>
      prev.includes(constraint) ? prev.filter((entry) => entry !== constraint) : [...prev, constraint],
    );
  };

  const persistSession = async () => {
    if (!user) return;
    await supabase.from("canister_configurator_sessions" as never).insert({
      user_id: user.id,
      primary_work: primaryWork,
      current_tools: currentTools,
      strength_need: strengthNeed,
      material_need: materialNeed,
      batch_need: batchNeed,
      constraints,
      node_ambition: nodeAmbition,
      recommended_kit: recommendation.tier,
      recommendation_payoff: recommendation.payoff,
      completed_steps: step,
    } as never);
  };

  const goNext = async () => {
    if (step === 0 && !profileReady) return;
    if (step < TOTAL_STEPS) {
      setStep((value) => value + 1);
      return;
    }
    await persistSession();
    toast.success("Configurator session saved.");
  };

  const goBack = () => setStep((value) => Math.max(0, value - 1));

  const mobilePrimaryLabel =
    step < TOTAL_STEPS ? "Continue" : showComparison ? "Show me my kit" : "Show side by side";

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="canister-configurator">
      <div data-tour-target="canister-configurator" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to="/factory/canister" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Canister
        </Link>
      </div>

      <Hero
        variant="app"
        eyebrow="Design your first serious shop, not a toy"
        headline="Configure a Canister that fits the work you really do."
        body="The Configurator walks you through your actual work—materials, batch sizes, constraints—then maps to Gravity ($249), Thermoplastic ($329), or Complete ($499)."
        primaryCTA={{ label: "Describe my work", onClick: () => setStep(0) }}
        secondaryCTA={{ label: "Show me kits side by side", onClick: () => setShowComparison(true) }}
        proofStrip={["Gravity $249", "Thermoplastic $329", "Complete $499"]}
      />

      <div className="mt-6 space-y-4">
        {step === 0 ? (
          <QuestionStep stepLabel="Step 0" question="What work does your shop need to do right now?">
            <WorkProfileQuestionnaire
              primaryWork={primaryWork}
              currentTools={currentTools}
              onPrimaryWorkChange={setPrimaryWork}
              onCurrentToolsChange={setCurrentTools}
            />
            <ShopNote
              title="Start from current reality"
              note="Use your existing workflow as the baseline so the kit recommendation is matched to real constraints."
              diagram={<p className="text-xs text-muted-foreground">Workflow to materials to batch to constraints to kit mapping</p>}
            />
          </QuestionStep>
        ) : null}

        {step === 1 ? (
          <QuestionStep stepLabel="Step 1" question="How strong does the output need to be?">
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: "everyday", label: "Everyday use" },
                { value: "durable", label: "Durable repeated use" },
                { value: "high_stress", label: "High-stress output" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={strengthNeed === item.value ? "default" : "outline"}
                  onClick={() => setStrengthNeed(item.value as StrengthNeed)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <ShopNote
              title="Strength targets material pressure needs"
              note="Higher stress output usually pushes recommendation toward thermoplastic-capable setups."
              diagram={<p className="text-xs text-muted-foreground">Everyday to durable to high-stress</p>}
            />
          </QuestionStep>
        ) : null}

        {step === 2 ? (
          <QuestionStep stepLabel="Step 2" question="What are you injecting / pressing / printing?">
            <div className="grid gap-2 md:grid-cols-4">
              {[
                { value: "resin", label: "Resin / casting" },
                { value: "silicone", label: "Silicone / molds" },
                { value: "thermoplastic", label: "Thermoplastic pellets" },
                { value: "mixed", label: "Mixed materials" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={materialNeed === item.value ? "default" : "outline"}
                  onClick={() => setMaterialNeed(item.value as MaterialNeed)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <ShopNote
              title="Material choice drives kit base"
              note="Mixed materials usually benefit from Complete; thermoplastic-heavy workflows usually map to Thermoplastic."
              diagram={<p className="text-xs text-muted-foreground">Material profile to base kit recommendation</p>}
            />
          </QuestionStep>
        ) : null}

        {step === 3 ? (
          <QuestionStep stepLabel="Step 3" question="How many pieces per run? How often?">
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: "small", label: "Small runs, occasional" },
                { value: "medium", label: "Medium runs, weekly" },
                { value: "large", label: "Large runs, frequent" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={batchNeed === item.value ? "default" : "outline"}
                  onClick={() => setBatchNeed(item.value as BatchNeed)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <ShopNote
              title="Batch rhythm affects setup pressure"
              note="Frequent larger batches often justify a stronger baseline kit to keep throughput stable."
              diagram={<p className="text-xs text-muted-foreground">Small to medium to large throughput profile</p>}
            />
          </QuestionStep>
        ) : null}

        {step === 4 ? (
          <QuestionStep stepLabel="Step 4" question="What constraints shape your shop right now?">
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { value: "compact", label: "Compact space" },
                { value: "low_noise", label: "Low noise requirement" },
                { value: "venting_ready", label: "Venting already available" },
                { value: "limited_power", label: "Limited power access" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={constraints.includes(item.value as ConstraintNeed) ? "default" : "outline"}
                  onClick={() => toggleConstraint(item.value as ConstraintNeed)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <ShopNote
              title="Constraint alignment prevents rework"
              note="Capturing space, power, and venting now keeps your first kit aligned with the way you actually operate."
              diagram={<p className="text-xs text-muted-foreground">Constraints filter recommendation confidence</p>}
            />
          </QuestionStep>
        ) : null}

        {step === 5 ? (
          <QuestionStep stepLabel="Step 5" question="How far toward Pioneer Node status?">
            <div className="grid gap-2 md:grid-cols-3">
              {[
                { value: "learning", label: "Learning baseline" },
                { value: "building", label: "Building repeatability" },
                { value: "qualifying", label: "Qualifying toward Node readiness" },
              ].map((item) => (
                <Button
                  key={item.value}
                  variant={nodeAmbition === item.value ? "default" : "outline"}
                  onClick={() => setNodeAmbition(item.value as NodeAmbition)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <ShopNote
              title="Node ambition is descriptive planning"
              note="This step sets how much operational headroom the recommendation should preserve for your next milestones."
              diagram={<p className="text-xs text-muted-foreground">Learning to building to qualifying</p>}
            />
          </QuestionStep>
        ) : null}

        {step >= TOTAL_STEPS ? (
          <div className="space-y-4">
            <KitRecommendation tier={recommendation.tier} payoffSentence={recommendation.payoff} />
            {showComparison ? <KitComparisonView /> : null}
            <PioneerNodeProgressBar kit={recommendation.tier} />
          </div>
        ) : null}

        <div className="hidden items-center justify-between gap-2 md:flex">
          <Button variant="outline" onClick={goBack} disabled={step === 0}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            {step >= TOTAL_STEPS ? (
              <Button variant="outline" onClick={() => setShowComparison((value) => !value)}>
                {showComparison ? "Show me my kit" : "Show side by side"}
              </Button>
            ) : null}
            <Button onClick={() => void goNext()} disabled={step === 0 && !profileReady}>
              {step < TOTAL_STEPS ? "Continue" : "Save Session"}
            </Button>
          </div>
        </div>
      </div>

      <StickyMobileCTA
        primary={{
          label: mobilePrimaryLabel,
          onClick: () => {
            if (step >= TOTAL_STEPS) {
              setShowComparison((value) => !value);
              return;
            }
            if (step === 0 && !profileReady) return;
            setStep((value) => value + 1);
          },
        }}
        secondary={{
          label: "Back",
          onClick: goBack,
        }}
      />
    </PortalPageLayout>
  );
}
