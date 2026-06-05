/**
 * InitiativeWalkthrough — Wave 6 Phase S
 * =========================================
 * Renders the step-by-step member journey for a Sweet Sixteen initiative.
 * Each step shows what actually happens when a member uses the initiative.
 */
import { useState } from "react";
import { type WalkthroughStep } from "@/data/initiativeWalkthroughs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";

interface InitiativeWalkthroughProps {
  steps: WalkthroughStep[];
  initiativeName: string;
}

export function InitiativeWalkthrough({ steps, initiativeName }: InitiativeWalkthroughProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        Member Walkthrough: {initiativeName}
      </h2>
      <p className="text-sm text-muted-foreground">
        Step-by-step: what actually happens when you participate.
      </p>

      <div className="space-y-2">
        {steps.map((step) => {
          const isOpen = activeStep === step.number;
          return (
            <Card
              key={step.number}
              className={`border transition-all ${isOpen ? "border-primary/50 bg-primary/5" : "border-border"}`}
            >
              <CardHeader className="py-3 px-4">
                <button
                  className="flex items-start gap-3 w-full text-left"
                  onClick={() => setActiveStep(isOpen ? null : step.number)}
                  aria-expanded={isOpen}
                >
                  {/* Step number badge */}
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {step.number}
                  </span>

                  <div className="flex-1">
                    <CardTitle className="text-sm font-semibold">{step.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>

                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  )}
                </button>
              </CardHeader>

              {isOpen && (
                <CardContent className="pt-0 pb-4 px-4 pl-14">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.detail}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Expand-all shortcut */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setActiveStep(activeStep === null ? 1 : null)}
        >
          {activeStep !== null ? "Collapse" : "Expand step 1"}
        </Button>
      </div>
    </div>
  );
}
