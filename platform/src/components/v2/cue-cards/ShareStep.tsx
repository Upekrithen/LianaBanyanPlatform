import { CueCardDraft } from "@/components/v2/cue-cards/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ShareStepProps = {
  draft: CueCardDraft;
  onChange: (nextDraft: CueCardDraft) => void;
  shareUrl: string;
};

export function ShareStep({ draft, onChange, shareUrl }: ShareStepProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">Share</h3>
      <Tabs value={draft.shareMethod} onValueChange={(value) => onChange({ ...draft, shareMethod: value as CueCardDraft["shareMethod"] })}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="link">Shareable link</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="link" className="space-y-2">
          <Label>Shareable link</Label>
          <Input readOnly value={shareUrl || "Link appears after send"} />
        </TabsContent>
        <TabsContent value="email" className="space-y-2">
          <div className="space-y-1.5">
            <Label>Recipient name</Label>
            <Input
              value={draft.recipientName}
              onChange={(event) => onChange({ ...draft, recipientName: event.target.value })}
              placeholder="Recipient"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Recipient email</Label>
            <Input
              type="email"
              value={draft.recipientEmail}
              onChange={(event) => onChange({ ...draft, recipientEmail: event.target.value })}
              placeholder="name@example.com"
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
