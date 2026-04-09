import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TourIntroModalProps = {
  onStart: () => void;
  onSkip: () => void;
  onRemindLater: () => void;
};

export function TourIntroModal({ onStart, onSkip, onRemindLater }: TourIntroModalProps) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Want a guided walk through Liana Banyan?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can take the Grand Tour now, skip it, or ask for a reminder later.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onRemindLater}>
              Remind me later
            </Button>
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip
            </Button>
            <Button type="button" onClick={onStart}>
              Start
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
