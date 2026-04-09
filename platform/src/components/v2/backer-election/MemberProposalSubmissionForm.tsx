import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type MemberProposalSubmissionFormProps = {
  onSubmit: (payload: { title: string; category: string; description: string }) => Promise<void> | void;
  disabled?: boolean;
};

export function MemberProposalSubmissionForm({ onSubmit, disabled = false }: MemberProposalSubmissionFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("operations");
  const [description, setDescription] = useState("");

  const canSubmit = title.trim().length >= 4 && description.trim().length >= 12 && !disabled;

  return (
    <Card id="member-proposal-submission">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Member-submitted measures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="proposal-title">Title</Label>
          <Input id="proposal-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
              <SelectItem value="initiative">Initiative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proposal-description">Description</Label>
          <Textarea
            id="proposal-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />
        </div>
        <Button
          disabled={!canSubmit}
          onClick={() => {
            void onSubmit({ title: title.trim(), category, description: description.trim() });
            setTitle("");
            setDescription("");
            setCategory("operations");
          }}
        >
          Submit member measure
        </Button>
      </CardContent>
    </Card>
  );
}
