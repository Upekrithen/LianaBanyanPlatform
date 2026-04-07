import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shells";
import { Hero } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch, Send, CheckCircle2, XCircle, Clock, Eye,
  Plus, FileCode, Shield, Loader2, ArrowRight, Code2, Rocket
} from "lucide-react";
import { toast } from "sonner";
import { useContentShield } from "@/hooks/useContentShield";
import { ContentShieldBanner } from "@/components/neighborhoods/ContentShieldBanner";

type Submission = {
  id: string;
  neighborhood_id: string;
  title: string;
  description: string | null;
  diff_summary: string | null;
  theme_config_draft: Record<string, unknown>;
  custom_css_draft: string | null;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type Neighborhood = {
  id: string;
  slug: string;
  name: string;
  city: string;
  theme_config: Record<string, unknown>;
  custom_css: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  draft: { label: "Draft", icon: FileCode, color: "text-muted-foreground bg-muted" },
  submitted: { label: "Submitted", icon: Send, color: "text-blue-600 bg-blue-500/10" },
  under_review: { label: "Under Review", icon: Eye, color: "text-amber-600 bg-amber-500/10" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-500/10" },
  deployed: { label: "Deployed", icon: Rocket, color: "text-primary bg-primary/10" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={`gap-1 ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </Badge>
  );
}

export default function TrunkMirrorPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cssDraft, setCssDraft] = useState("");
  const [diffSummary, setDiffSummary] = useState("");
  const [selectedHood, setSelectedHood] = useState<string>("");
  const { validate, violations, validating, hasBlocks } = useContentShield();

  const { data: myHoods = [] } = useQuery({
    queryKey: ["my-neighborhoods", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .select("id, slug, name, city, theme_config, custom_css")
        .eq("owner_id", user!.id);
      if (error) throw error;
      return (data ?? []) as Neighborhood[];
    },
    enabled: !!user,
  });

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["trunk-mirror-submissions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trunk_mirror_submissions" as never)
        .select("*")
        .eq("submitted_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Submission[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("trunk_mirror_submissions" as never)
        .insert({
          neighborhood_id: selectedHood,
          submitted_by: user!.id,
          title,
          description: desc || null,
          diff_summary: diffSummary || null,
          custom_css_draft: cssDraft || null,
          theme_config_draft: {},
          status: "draft",
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Trunk Mirror submission created");
      qc.invalidateQueries({ queryKey: ["trunk-mirror-submissions"] });
      setShowNew(false);
      setTitle("");
      setDesc("");
      setCssDraft("");
      setDiffSummary("");
      setSelectedHood("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submitForReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trunk_mirror_submissions" as never)
        .update({ status: "submitted", updated_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Submitted for Harper Guild review!");
      qc.invalidateQueries({ queryKey: ["trunk-mirror-submissions"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const drafts = submissions.filter(s => s.status === "draft");
  const active = submissions.filter(s => ["submitted", "under_review"].includes(s.status));
  const history = submissions.filter(s => ["approved", "rejected", "deployed"].includes(s.status));

  return (
    <AppShell
      xrayBase="trunk-mirror"
      pageTitle="Trunk Mirror"
      breadcrumbs="Neighborhoods / Trunk Mirror"
      hero={
        <Hero
          variant="app"
          eyebrow="Advanced Builder"
          headline="Trunk Mirror: Your Local Sandbox"
          body="Customize your neighborhood beyond templates. Edit theme configs, write scoped CSS, and build unique components — then submit for Harper Guild review before going live. Two immutable conditions: core protocol preserved (Cost+20%, governance, currency) and LB ecosystem currency compatibility."
          primaryCTA={user ? { label: "New submission", onClick: () => setShowNew(true) } : undefined}
          secondaryCTA={{ label: "My neighborhoods", href: "/neighborhoods" }}
        />
      }
    >
      <div className="space-y-6 pb-16">
        {/* How it works */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              {[
                { icon: GitBranch, label: "Clone", desc: "Fork your neighborhood's current config" },
                { icon: Code2, label: "Customize", desc: "Edit theme, CSS, components locally" },
                { icon: Send, label: "Submit", desc: "Send changes for Harper Guild review" },
                { icon: Rocket, label: "Deploy", desc: "Approved changes go live automatically" },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-2">
                  <div className="bg-primary/10 text-primary rounded-md p-1.5 shrink-0">
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-muted-foreground text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New submission form */}
        {showNew && (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> New Trunk Mirror Submission</CardTitle>
              <CardDescription>Describe the customization you want to make. Attach CSS or theme changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Neighborhood *</Label>
                {myHoods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You don't own any neighborhoods yet. <a href="/neighborhoods/builder" className="text-primary hover:underline">Create one first.</a></p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myHoods.map(h => (
                      <button
                        key={h.id}
                        onClick={() => setSelectedHood(h.id)}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                          selectedHood === h.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        {h.name} — {h.city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-title">Change Title *</Label>
                <Input id="tm-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Custom hero banner + accent color overrides" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-desc">Description</Label>
                <Textarea id="tm-desc" value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                  onBlur={() => validate({ description: desc, custom_css: cssDraft })}
                  placeholder="Describe what you're changing and why..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-diff">Change Summary</Label>
                <Textarea id="tm-diff" value={diffSummary} onChange={e => setDiffSummary(e.target.value)} rows={2}
                  placeholder="e.g. Updated hero image, changed accent from blue to coral, added storefront intro banner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-css">Scoped CSS (sandboxed to your neighborhood)</Label>
                <Textarea id="tm-css" value={cssDraft} onChange={e => setCssDraft(e.target.value)} rows={6}
                  onBlur={() => validate({ description: desc, custom_css: cssDraft })}
                  className="font-mono text-xs"
                  placeholder={`.neighborhood-hero {\n  background: linear-gradient(135deg, #ff6b35, #f7c948);\n}\n.storefront-card {\n  border-radius: 12px;\n}`}
                />
                <p className="text-xs text-muted-foreground">CSS is sandboxed: no !important, no body/html selectors, no external resources. Harper Guild will verify compliance.</p>
              </div>
              <ContentShieldBanner violations={violations} validating={validating} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!selectedHood || !title.trim() || createMutation.isPending || hasBlocks}
                className="gap-2"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                Create Draft
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Submissions tabs */}
        <Tabs defaultValue="drafts">
          <TabsList>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="active">In Review ({active.length})</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="space-y-3 mt-4">
            {drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No drafts. Click "New submission" to start customizing.</p>
            ) : drafts.map(s => (
              <SubmissionCard key={s.id} sub={s} hoods={myHoods} onSubmit={() => submitForReview.mutate(s.id)} />
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-4">
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No submissions under review.</p>
            ) : active.map(s => (
              <SubmissionCard key={s.id} sub={s} hoods={myHoods} />
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No reviewed submissions yet.</p>
            ) : history.map(s => (
              <SubmissionCard key={s.id} sub={s} hoods={myHoods} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Immutable conditions reminder */}
        <Card className="bg-muted/30">
          <CardContent className="py-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1 flex items-center gap-2"><Shield className="w-4 h-4" /> Immutable Conditions</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Core protocol preserved — Cost+20%, governance, currency rules cannot be altered</li>
              <li>Must use LB ecosystem currency without breaking compatibility</li>
            </ol>
            <p className="mt-2">Harper Guild reviews every submission before deployment. Typical review time: 24-72 hours.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SubmissionCard({
  sub,
  hoods,
  onSubmit,
}: {
  sub: Submission;
  hoods: Neighborhood[];
  onSubmit?: () => void;
}) {
  const hood = hoods.find(h => h.id === sub.neighborhood_id);
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{sub.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-0.5">
              {hood ? <><GitBranch className="w-3 h-3" /> {hood.name}</> : "Unknown neighborhood"}
              <span className="text-xs">·</span>
              <Clock className="w-3 h-3" /> {new Date(sub.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <StatusBadge status={sub.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sub.description && <p className="text-sm text-muted-foreground">{sub.description}</p>}
        {sub.diff_summary && (
          <div className="bg-muted/50 rounded-md p-2 text-xs font-mono text-muted-foreground">
            {sub.diff_summary}
          </div>
        )}
        {sub.custom_css_draft && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View CSS changes</summary>
            <pre className="mt-1 bg-muted/50 rounded-md p-2 overflow-x-auto font-mono">{sub.custom_css_draft}</pre>
          </details>
        )}
        {sub.reviewer_notes && (
          <div className="border-l-2 border-primary/40 pl-3 text-sm">
            <p className="text-xs font-medium text-primary mb-0.5">Harper Guild Reviewer Notes</p>
            <p className="text-muted-foreground">{sub.reviewer_notes}</p>
          </div>
        )}
      </CardContent>
      {onSubmit && sub.status === "draft" && (
        <CardFooter>
          <Button onClick={onSubmit} size="sm" className="gap-2">
            <Send className="w-3.5 h-3.5" /> Submit for Review
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
