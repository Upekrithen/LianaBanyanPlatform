import { FormEvent, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export type StartTribePayload = {
  name: string;
  category: "Neighborhood" | "Interest" | "Hobby" | "Family";
  joinType: "Open" | "Invite-only";
  charter: string;
};

type StartTribeInlineProps = {
  onSubmit: (payload: StartTribePayload) => Promise<void>;
};

export function StartTribeInline({ onSubmit }: StartTribeInlineProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StartTribePayload["category"]>("Neighborhood");
  const [joinType, setJoinType] = useState<StartTribePayload["joinType"]>("Open");
  const [charter, setCharter] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = name.trim().length > 1 && charter.trim().length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), category, joinType, charter: charter.trim() });
      setName("");
      setCategory("Neighborhood");
      setJoinType("Open");
      setCharter("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card id="start-tribe-inline">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Start a tribe in two minutes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tribe-name">Tribe name</Label>
            <Input id="tribe-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tribe-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as StartTribePayload["category"])}>
              <SelectTrigger id="tribe-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Neighborhood">Neighborhood</SelectItem>
                <SelectItem value="Interest">Interest</SelectItem>
                <SelectItem value="Hobby">Hobby</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tribe-join-type">Join type</Label>
            <Select value={joinType} onValueChange={(value) => setJoinType(value as StartTribePayload["joinType"])}>
              <SelectTrigger id="tribe-join-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Invite-only">Invite-only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="tribe-charter">Charter</Label>
            <Textarea
              id="tribe-charter"
              value={charter}
              onChange={(event) => setCharter(event.target.value)}
              rows={3}
              placeholder="One or two lines that describe your tribe."
              required
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? "Starting..." : "Start a tribe"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
