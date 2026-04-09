import { CheckCircle2 } from "lucide-react";

type AttributionConfirmationProps = {
  readyToSend: boolean;
};

export function AttributionConfirmation({ readyToSend }: AttributionConfirmationProps) {
  return (
    <section className="space-y-2 rounded-lg border bg-card/40 p-4">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
        <div>
          <p className="text-sm font-medium">Attribution confirmation</p>
          <p className="text-sm text-muted-foreground">Responses to this card are attributed to you only.</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {readyToSend ? "Card is ready to send." : "Complete content and share details to send."}
      </p>
    </section>
  );
}
