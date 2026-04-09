import { CueCardDraft } from "@/components/v2/cue-cards/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ContentPanelProps = {
  draft: CueCardDraft;
  onChange: (nextDraft: CueCardDraft) => void;
};

export function ContentPanel({ draft, onChange }: ContentPanelProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">Content</h3>

      <div className="space-y-1.5">
        <Label>Link target</Label>
        <Select
          value={draft.linkTarget}
          onValueChange={(value) => onChange({ ...draft, linkTarget: value as CueCardDraft["linkTarget"] })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="storefront">Storefront</SelectItem>
            <SelectItem value="guild">Guild</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Target path or URL</Label>
        <Input
          value={draft.linkValue}
          onChange={(event) => onChange({ ...draft, linkValue: event.target.value })}
          placeholder="/member/me"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Headline</Label>
        <Input value={draft.headline} onChange={(event) => onChange({ ...draft, headline: event.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label>Body</Label>
        <Textarea
          value={draft.body}
          onChange={(event) => onChange({ ...draft, body: event.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>CTA text</Label>
        <Input value={draft.cta} onChange={(event) => onChange({ ...draft, cta: event.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label>Contact info</Label>
        <Input
          value={draft.contactInfo}
          onChange={(event) => onChange({ ...draft, contactInfo: event.target.value })}
          placeholder="name@email.com"
        />
      </div>
    </section>
  );
}
