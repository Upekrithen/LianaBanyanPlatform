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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Plus, Search, AlertTriangle, ShieldX, ShieldCheck,
  FileCode, Clock, Loader2, Copy, FlaskConical
} from "lucide-react";
import { toast } from "sonner";

interface ProhibitedPattern {
  id: string;
  category: string;
  pattern: string;
  description: string;
  severity: "block" | "flag";
  applies_to: string[];
  is_active: boolean;
  created_at: string;
}

interface AuditLogEntry {
  id: string;
  neighborhood_id: string | null;
  submission_id: string | null;
  field_name: string;
  category: string;
  severity: string;
  blocked: boolean;
  created_at: string;
}

const CATEGORIES = [
  "advertising",
  "tracking",
  "external_scripts",
  "competing_platform",
  "financial_fraud",
  "impersonation",
  "css_escape",
  "platform_bypass",
] as const;

const FIELDS = ["description", "welcome_message", "custom_css", "theme_config", "hero_image_url"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  advertising: "text-amber-600 bg-amber-500/10",
  tracking: "text-red-600 bg-red-500/10",
  external_scripts: "text-red-600 bg-red-500/10",
  competing_platform: "text-orange-600 bg-orange-500/10",
  financial_fraud: "text-red-700 bg-red-500/10",
  impersonation: "text-purple-600 bg-purple-500/10",
  css_escape: "text-blue-600 bg-blue-500/10",
  platform_bypass: "text-red-600 bg-red-500/10",
};

export default function ContentShieldAdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [testContent, setTestContent] = useState("");
  const [testResults, setTestResults] = useState<string[] | null>(null);
  const [testRunning, setTestRunning] = useState(false);

  const [newCategory, setNewCategory] = useState<string>("advertising");
  const [newPattern, setNewPattern] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSeverity, setNewSeverity] = useState<"block" | "flag">("block");
  const [newAppliesTo, setNewAppliesTo] = useState<string[]>([...FIELDS]);

  const { data: patterns = [], isLoading: loadingPatterns } = useQuery({
    queryKey: ["content-shield-patterns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhood_prohibited_patterns" as never)
        .select("*")
        .order("category", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ProhibitedPattern[];
    },
    enabled: !!user,
  });

  const { data: auditLog = [], isLoading: loadingLog } = useQuery({
    queryKey: ["content-shield-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhood_content_shield_log" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as AuditLogEntry[];
    },
    enabled: !!user,
  });

  const addPatternMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("neighborhood_prohibited_patterns" as never)
        .insert({
          category: newCategory,
          pattern: newPattern,
          description: newDescription,
          severity: newSeverity,
          applies_to: newAppliesTo,
          created_by: user!.id,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pattern added");
      queryClient.invalidateQueries({ queryKey: ["content-shield-patterns"] });
      setShowNew(false);
      setNewPattern("");
      setNewDescription("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const togglePatternMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("neighborhood_prohibited_patterns" as never)
        .update({ is_active: active } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-shield-patterns"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleTestContent = async () => {
    if (!testContent.trim()) return;
    setTestRunning(true);
    try {
      const results: string[] = [];
      for (const p of patterns.filter((p) => p.is_active)) {
        try {
          const re = new RegExp(p.pattern, "gi");
          if (re.test(testContent)) {
            results.push(`[${p.severity.toUpperCase()}] ${p.category}: ${p.description} (pattern: ${p.pattern})`);
          }
        } catch {
          /* skip invalid regex */
        }
      }
      setTestResults(results);
    } finally {
      setTestRunning(false);
    }
  };

  const activePatterns = patterns.filter((p) => p.is_active);
  const inactivePatterns = patterns.filter((p) => !p.is_active);
  const blockLogs = auditLog.filter((l) => l.blocked);
  const flagLogs = auditLog.filter((l) => !l.blocked);

  return (
    <AppShell
      xrayBase="content-shield-admin"
      pageTitle="Content Shield Admin"
      breadcrumbs="Ops / Content Shield"
      hero={
        <Hero
          variant="app"
          eyebrow="Operations"
          headline="Content Shield Administration"
          body="Manage prohibited content patterns, review the audit log, and test new patterns against sample content. Patterns are append-mostly — disable rather than delete."
          primaryCTA={{ label: "Add Pattern", onClick: () => setShowNew(true) }}
          proofStrip={[
            `${activePatterns.length} active patterns`,
            `${blockLogs.length} blocks`,
            `${flagLogs.length} flags`,
            `${CATEGORIES.length} categories`,
          ]}
        />
      }
    >
      <div className="space-y-6 pb-16">
        <Tabs defaultValue="patterns">
          <TabsList>
            <TabsTrigger value="patterns">Patterns ({patterns.length})</TabsTrigger>
            <TabsTrigger value="audit">Audit Log ({auditLog.length})</TabsTrigger>
            <TabsTrigger value="tester">Pattern Tester</TabsTrigger>
          </TabsList>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4 mt-4">
            {/* New pattern form */}
            {showNew && (
              <Card className="border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> New Prohibited Pattern</CardTitle>
                  <CardDescription>Add a regex pattern to detect prohibited content in neighborhood fields.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select value={newSeverity} onValueChange={(v) => setNewSeverity(v as "block" | "flag")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="block">Block (hard reject)</SelectItem>
                          <SelectItem value="flag">Flag (Harper review)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Regex Pattern</Label>
                    <Input
                      value={newPattern}
                      onChange={(e) => setNewPattern(e.target.value)}
                      placeholder="(?i)(pattern|to|match)"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">PostgreSQL regex syntax. Use (?i) for case-insensitive.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Human-readable explanation of what this catches"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Applies To</Label>
                    <div className="flex flex-wrap gap-2">
                      {FIELDS.map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            setNewAppliesTo((prev) =>
                              prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            newAppliesTo.includes(f)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                  <Button
                    onClick={() => addPatternMutation.mutate()}
                    disabled={!newPattern.trim() || !newDescription.trim() || newAppliesTo.length === 0 || addPatternMutation.isPending}
                    className="gap-2"
                  >
                    {addPatternMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Pattern
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Pattern list by category */}
            {loadingPatterns ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              CATEGORIES.map((cat) => {
                const catPatterns = patterns.filter((p) => p.category === cat);
                if (catPatterns.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <h3 className="text-sm font-semibold capitalize flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {cat.replace(/_/g, " ")} ({catPatterns.length})
                    </h3>
                    <div className="space-y-1">
                      {catPatterns.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                            !p.is_active ? "opacity-50 bg-muted/30" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className={`text-xs ${CATEGORY_COLORS[p.category] ?? ""}`}>
                                {p.severity === "block" ? (
                                  <ShieldX className="w-3 h-3 mr-0.5" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 mr-0.5" />
                                )}
                                {p.severity}
                              </Badge>
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono truncate max-w-xs">
                                {p.pattern}
                              </code>
                            </div>
                            <p className="text-muted-foreground">{p.description}</p>
                            <div className="flex gap-1 flex-wrap">
                              {p.applies_to.map((f) => (
                                <Badge key={f} variant="outline" className="text-xs py-0">{f}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(p.pattern);
                                toast.success("Pattern copied");
                              }}
                              title="Copy pattern"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={p.is_active ? "outline" : "default"}
                              className="text-xs h-7"
                              onClick={() => togglePatternMutation.mutate({ id: p.id, active: !p.is_active })}
                              disabled={togglePatternMutation.isPending}
                            >
                              {p.is_active ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4 mt-4">
            {loadingLog ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : auditLog.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No audit log entries</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {auditLog.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 text-sm p-2 rounded-md ${
                          log.blocked ? "bg-red-500/5" : "bg-amber-500/5"
                        }`}
                      >
                        {log.blocked ? (
                          <ShieldX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{log.category}</Badge>
                            <Badge variant={log.blocked ? "destructive" : "secondary"} className="text-xs">
                              {log.blocked ? "Blocked" : "Flagged"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{log.field_name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                            {log.neighborhood_id && ` — hood: ${log.neighborhood_id.slice(0, 8)}...`}
                            {log.submission_id && ` — sub: ${log.submission_id.slice(0, 8)}...`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pattern Tester Tab */}
          <TabsContent value="tester" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" /> Pattern Tester
                </CardTitle>
                <CardDescription>
                  Paste content below to see which active patterns it triggers. Uses client-side regex matching.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Content to Test</Label>
                  <Textarea
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={6}
                    placeholder="Paste neighborhood description, CSS, or any content here to check against active patterns..."
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={handleTestContent} disabled={testRunning || !testContent.trim()} className="gap-2">
                  {testRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Test Against Patterns
                </Button>
                {testResults !== null && (
                  <div className="space-y-2">
                    {testResults.length === 0 ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-sm text-emerald-700">
                        <ShieldCheck className="w-4 h-4" />
                        No patterns matched — content passes all active rules.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">
                          {testResults.length} pattern{testResults.length > 1 ? "s" : ""} matched:
                        </p>
                        {testResults.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-red-500/5 text-sm">
                            <ShieldX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span className="font-mono text-xs">{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
