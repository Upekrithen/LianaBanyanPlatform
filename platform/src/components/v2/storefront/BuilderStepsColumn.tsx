import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/v2/storefront/Stepper";

type BuilderStepsColumnProps = {
  steps: string[];
  currentStep: number;
  onSelectStep: (step: number) => void;
};

export function BuilderStepsColumn({ steps, currentStep, onSelectStep }: BuilderStepsColumnProps) {
  return (
    <Card className="bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Builder Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <Stepper steps={steps} currentStep={currentStep} onSelectStep={onSelectStep} />
      </CardContent>
    </Card>
  );
}
