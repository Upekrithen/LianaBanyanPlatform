import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RepRecipient } from "./types";

type SubmissionFlowProps = {
  recipients: RepRecipient[];
  selectedRecipientId: string | null;
  onSelectRecipient: (recipientId: string) => void;
  onReview: () => void;
  onSend: () => void;
  canReview: boolean;
  canSend: boolean;
};

export function SubmissionFlow({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  onReview,
  onSend,
  canReview,
  canSend,
}: SubmissionFlowProps) {
  return (
    <Card data-xray-id="political-expedition-submission-flow">
      <CardHeader>
        <CardTitle>Submission Flow</CardTitle>
        <CardDescription>Choose recipient, review your letter, then send through your email client.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {recipients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved recipients yet. Save one in the lookup section.</p>
          ) : (
            recipients.map((recipient) => (
              <button
                key={recipient.id}
                type="button"
                onClick={() => onSelectRecipient(recipient.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${selectedRecipientId === recipient.id ? "border-primary bg-primary/10" : "bg-background"}`}
              >
                {recipient.name} - {recipient.title}
              </button>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onReview} disabled={!canReview}>
            Review
          </Button>
          <Button onClick={onSend} disabled={!canSend}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
