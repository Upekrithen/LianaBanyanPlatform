/**
 * /my/cathedral/new — Scribe creation wizard
 * ==========================================
 * Three-step form (kept on one page for K438a; can split if member feedback
 * shows multi-step works better):
 *   1. Name + Primary field
 *   2. Adjacent fields (0–12, with level dropdowns 2..12)
 *   3. Keywords + Share level
 *
 * Per #2270 Claim 3: levels 2–3 are PhD-adjacent, 4–6 junior-adjacent,
 * 7–12 ancillary. Level dropdown shows the tier label inline.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BookPlus } from "lucide-react";
import { useEnsureCathedral, useCreateScribe } from "./useCathedral";
import type { ShareLevel } from "@/lib/cathedral-client";

const ADJACENT_LEVELS: { value: number; label: string; tier: string }[] = [
  { value: 2,  label: "Level 2",  tier: "PhD-adjacent" },
  { value: 3,  label: "Level 3",  tier: "PhD-adjacent" },
  { value: 4,  label: "Level 4",  tier: "junior-adjacent" },
  { value: 5,  label: "Level 5",  tier: "junior-adjacent" },
  { value: 6,  label: "Level 6",  tier: "junior-adjacent" },
  { value: 7,  label: "Level 7",  tier: "ancillary" },
  { value: 8,  label: "Level 8",  tier: "ancillary" },
  { value: 9,  label: "Level 9",  tier: "ancillary" },
  { value: 10, label: "Level 10", tier: "ancillary" },
  { value: 11, label: "Level 11", tier: "ancillary" },
  { value: 12, label: "Level 12", tier: "ancillary" },
];

type Adjacent = { level: number; field: string };

export default function CathedralNewScribe() {
  useEnsureCathedral();
  const navigate = useNavigate();
  const { toast } = useToast();
  const create = useCreateScribe();

  const [name, setName] = useState("");
  const [primaryField, setPrimaryField] = useState("");
  const [adjacents, setAdjacents] = useState<Adjacent[]>([]);
  const [keywordsRaw, setKeywordsRaw] = useState("");
  const [shareLevel, setShareLevel] = useState<ShareLevel>("private");

  const addAdjacent = () => {
    if (adjacents.length >= 12) return;
    setAdjacents([...adjacents, { level: 3, field: "" }]);
  };
  const updateAdjacent = (idx: number, patch: Partial<Adjacent>) => {
    setAdjacents(adjacents.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  };
  const removeAdjacent = (idx: number) => {
    setAdjacents(adjacents.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Give your Scribe a short name (e.g., 'Garden').", variant: "destructive" });
      return;
    }
    if (!primaryField.trim()) {
      toast({ title: "Primary field required", description: "What does this Scribe know best?", variant: "destructive" });
      return;
    }
    const cleanedAdj = adjacents
      .map((a) => ({ level: a.level, field: a.field.trim() }))
      .filter((a) => a.field.length > 0);
    const keywords = keywordsRaw
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    try {
      const row = await create.mutateAsync({
        name,
        primary_field: primaryField,
        adjacents: cleanedAdj,
        keywords,
        share_level: shareLevel,
      });
      toast({ title: "Scribe created", description: `'${row.name}' is now in your Cathedral.` });
      navigate(`/my/cathedral/${row.scribe_id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create Scribe.";
      toast({ title: "Create failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <PortalPageLayout title="New Scribe" backButton maxWidth="lg" xrayId="cathedral-new-scribe">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookPlus className="h-5 w-5" />
            Add a Scribe to your Cathedral
          </CardTitle>
          <CardDescription>
            A Scribe is a domain specialist with one primary field (Level 1, what they know
            best) and up to 12 adjacent fields at decreasing expertise levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Name + Primary */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">1. Name &amp; Primary Field</h3>
            <div>
              <Label htmlFor="scribe-name">Name</Label>
              <Input
                id="scribe-name"
                placeholder="e.g., Garden"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Short and concrete. You can rename later.
              </p>
            </div>
            <div>
              <Label htmlFor="scribe-primary">Primary field</Label>
              <Textarea
                id="scribe-primary"
                placeholder="e.g., 'Vegetable gardening at our specific latitude and soil'"
                value={primaryField}
                onChange={(e) => setPrimaryField(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                What this Scribe is the canonical keeper of. Specific beats generic.
              </p>
            </div>
          </section>

          {/* Step 2: Adjacents */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                2. Adjacent Fields ({adjacents.length}/12)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addAdjacent}
                disabled={adjacents.length >= 12}
              >
                <Plus className="h-3 w-3 mr-1" /> Add adjacent
              </Button>
            </div>
            {adjacents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Optional but recommended. Adjacents are how the Three Fates route content
                to this Scribe even when the topic isn't a perfect primary-field match.
              </p>
            )}
            {adjacents.map((adj, idx) => {
              const levelInfo = ADJACENT_LEVELS.find((l) => l.value === adj.level)!;
              return (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-36 shrink-0">
                    <Select
                      value={String(adj.level)}
                      onValueChange={(v) => updateAdjacent(idx, { level: Number(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ADJACENT_LEVELS.map((l) => (
                          <SelectItem key={l.value} value={String(l.value)}>
                            {l.label} <span className="text-xs text-muted-foreground">— {l.tier}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground mt-1 px-1">{levelInfo.tier}</div>
                  </div>
                  <Input
                    placeholder="Adjacent field (e.g., 'composting')"
                    value={adj.field}
                    onChange={(e) => updateAdjacent(idx, { field: e.target.value })}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeAdjacent(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </section>

          {/* Step 3: Keywords + Share */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">3. Keywords &amp; Sharing</h3>
            <div>
              <Label htmlFor="scribe-keywords">Keywords (comma-separated)</Label>
              <Input
                id="scribe-keywords"
                placeholder="garden, plant, soil, tomato, harvest"
                value={keywordsRaw}
                onChange={(e) => setKeywordsRaw(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used by the Fates router to detect when session content belongs to this
                Scribe. Will be lower-cased and de-duplicated.
              </p>
            </div>
            <div>
              <Label htmlFor="scribe-share">Share level</Label>
              <Select value={shareLevel} onValueChange={(v) => setShareLevel(v as ShareLevel)}>
                <SelectTrigger id="scribe-share"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private — only you</SelectItem>
                  <SelectItem value="commons">Commons — opt-in to global member knowledge</SelectItem>
                  <SelectItem value="guild" disabled>Guild — coming in K438b</SelectItem>
                  <SelectItem value="tribe" disabled>Tribe — coming in K438b</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                You can change this any time. Existing entries keep their original
                share-level snapshot — changing the Scribe doesn't retroactively expose
                what you already wrote.
              </p>
            </div>
            {shareLevel === "commons" && (
              <div className="border border-border rounded-md p-3 bg-muted/30">
                <Badge variant="default" className="mb-1">Commons heads-up</Badge>
                <p className="text-xs text-muted-foreground">
                  Commons entries are visible to every enrolled member. Use sparingly and
                  never include personal identifiers, secrets, or sensitive context.
                </p>
              </div>
            )}
          </section>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <Button variant="outline" onClick={() => navigate("/my/cathedral")}>Cancel</Button>
            <Button onClick={submit} disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create Scribe"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
