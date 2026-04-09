import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PublishCheck = {
  id: string;
  label: string;
  checked: boolean;
};

type PublishControlsProps = {
  checks: PublishCheck[];
  publishDisabled: boolean;
  publishing: boolean;
  onToggleCheck: (id: string, checked: boolean) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function PublishControls({
  checks,
  publishDisabled,
  publishing,
  onToggleCheck,
  onSaveDraft,
  onPublish,
}: PublishControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox
                id={`publish-${check.id}`}
                checked={check.checked}
                onCheckedChange={(next) => onToggleCheck(check.id, next === true)}
                className="mt-0.5"
              />
              <Label htmlFor={`publish-${check.id}`} className="cursor-pointer leading-5">
                {check.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onSaveDraft}>Save Draft</Button>
          <Button disabled={publishDisabled || publishing} onClick={onPublish}>
            {publishing ? "Publishing..." : "Publish Run"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
