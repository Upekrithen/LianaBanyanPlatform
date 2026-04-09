import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { buildTemplateVars, interpolateContent } from "@/lib/cephasTemplateEngine";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Mail,
  Globe,
  Send,
  Crown,
  GraduationCap,
  Newspaper,
  BookOpen,
  CreditCard,
  Megaphone,
  Share2,
  Keyboard,
  ArrowLeft,
  X,
  Clock,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ContentQueueItem {
  id: string;
  slug: string;
  title: string;
  content_type: string;
  content_markdown: string | null;
  source_file_path: string | null;
  destination: string;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_handle: string | null;
  send_when: string | null;
  send_frequency: string | null;
  send_format: string | null;
  status: string;
  founder_reviewed: boolean;
  founder_notes: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  sent_at: string | null;
  tags: string[] | null;
  priority: number;
  wave: number | null;
  attachments: unknown;
  created_at: string;
  updated_at: string;
}

const CONTENT_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  crown_letter: { label: "Crown", icon: <Crown className="w-3 h-3" />, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  outreach_letter: { label: "Outreach", icon: <Mail className="w-3 h-3" />, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  academic_letter: { label: "Academic", icon: <GraduationCap className="w-3 h-3" />, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  blessing_letter: { label: "Blessing", icon: <Crown className="w-3 h-3" />, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  sponsorship_letter: { label: "Sponsor", icon: <Share2 className="w-3 h-3" />, color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
  patron_letter: { label: "Patron", icon: <Crown className="w-3 h-3" />, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  political_letter: { label: "Political", icon: <Megaphone className="w-3 h-3" />, color: "bg-red-500/20 text-red-400 border-red-500/30" },
  academic_paper: { label: "Paper", icon: <GraduationCap className="w-3 h-3" />, color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  pudding_essay: { label: "Pudding", icon: <BookOpen className="w-3 h-3" />, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  cephas_article: { label: "Article", icon: <Newspaper className="w-3 h-3" />, color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  cue_card: { label: "Cue Card", icon: <CreditCard className="w-3 h-3" />, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  publication_pitch: { label: "Pitch", icon: <Send className="w-3 h-3" />, color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  media_post: { label: "Media", icon: <Share2 className="w-3 h-3" />, color: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30" },
  press_material: { label: "Press", icon: <Newspaper className="w-3 h-3" />, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  partnership_letter: { label: "Partnership", icon: <Mail className="w-3 h-3" />, color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  social_dispatch: { label: "Social", icon: <Share2 className="w-3 h-3" />, color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  red_carpet_config: { label: "Red Carpet", icon: <Crown className="w-3 h-3" />, color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  in_review: { label: "In Review", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  sent: { label: "Sent", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  published: { label: "Published", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  archived: { label: "Archived", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

const STALE_PATTERNS: { pattern: RegExp; canonical: (vars: Record<string, string>) => string }[] = [
  { pattern: /(?:2,\d{3})\s+innovations/g, canonical: (v) => `${v.innovationCount} innovations` },
  { pattern: /(?:1[56]\d)\s+[Cc]rown\s+[Jj]ewels/g, canonical: (v) => `${v.crownJewels} Crown Jewels` },
  { pattern: /(?:2,0[5-9]\d)\s+formal\s+claims/g, canonical: (v) => `${v.patentClaims} formal claims` },
];

function detectStaleStats(content: string | null, vars: Record<string, string>): string[] {
  if (!content) return [];
  const warnings: string[] = [];
  for (const { pattern, canonical } of STALE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const m of matches) {
        const expected = canonical(vars);
        if (m !== expected) {
          warnings.push(`Found "${m}" — current canonical: "${expected}"`);
        }
      }
    }
  }
  return warnings;
}

function ContentCommandCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canonicalStats = useCanonicalStats();
  const templateVars = useMemo(() => buildTemplateVars(canonicalStats), [canonicalStats]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [waveFilter, setWaveFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"priority" | "type" | "status" | "title">("priority");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [founderNotes, setFounderNotes] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["helm-content-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helm_content_queue" as never)
        .select("*")
        .order("priority", { ascending: true })
        .order("title", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ContentQueueItem[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (update: { id: string; changes: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("helm_content_queue" as never)
        .update({ ...update.changes, updated_at: new Date().toISOString() } as never)
        .eq("id", update.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["helm-content-queue"] }),
  });

  const filtered = useMemo(() => {
    let result = items;

    if (typeFilter !== "all") {
      result = result.filter((i) => i.content_type === typeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (waveFilter !== "all") {
      const w = parseInt(waveFilter);
      result = result.filter((i) => i.wave === w);
    }
    if (destinationFilter !== "all") {
      result = result.filter((i) => i.destination === destinationFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content_markdown?.toLowerCase().includes(q) ||
          i.recipient_name?.toLowerCase().includes(q) ||
          i.slug.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "priority") return a.priority - b.priority;
      if (sortBy === "type") return a.content_type.localeCompare(b.content_type);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [items, typeFilter, statusFilter, waveFilter, destinationFilter, search, sortBy]);

  const selectedItem = selectedIndex !== null ? filtered[selectedIndex] : null;

  const stats = useMemo(() => {
    const total = items.length;
    const approved = items.filter((i) => i.status === "approved" || i.status === "published" || i.status === "sent").length;
    const pending = items.filter((i) => i.status === "draft" || i.status === "in_review").length;
    const rejected = items.filter((i) => i.status === "rejected").length;
    return { total, approved, pending, rejected };
  }, [items]);

  const uniqueTypes = useMemo(() => [...new Set(items.map((i) => i.content_type))].sort(), [items]);
  const uniqueWaves = useMemo(() => [...new Set(items.map((i) => i.wave).filter(Boolean))].sort() as number[], [items]);
  const uniqueDestinations = useMemo(() => [...new Set(items.map((i) => i.destination))].sort(), [items]);

  const handleApprove = useCallback(async () => {
    if (!selectedItem) return;
    await updateMutation.mutateAsync({
      id: selectedItem.id,
      changes: {
        status: "approved",
        founder_reviewed: true,
        approved_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        founder_notes: founderNotes || selectedItem.founder_notes,
      },
    });
    toast.success(`Approved: ${selectedItem.title}`);
    if (selectedIndex !== null && selectedIndex < filtered.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setFounderNotes("");
    }
  }, [selectedItem, selectedIndex, filtered.length, founderNotes, updateMutation]);

  const handleReject = useCallback(async () => {
    if (!selectedItem) return;
    if (!founderNotes.trim()) {
      toast.error("Rejection requires notes explaining the reason.");
      return;
    }
    await updateMutation.mutateAsync({
      id: selectedItem.id,
      changes: {
        status: "rejected",
        founder_reviewed: true,
        reviewed_at: new Date().toISOString(),
        founder_notes: founderNotes,
      },
    });
    toast.success(`Rejected: ${selectedItem.title}`);
    if (selectedIndex !== null && selectedIndex < filtered.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setFounderNotes("");
    }
  }, [selectedItem, selectedIndex, filtered.length, founderNotes, updateMutation]);

  const handleSkip = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < filtered.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setFounderNotes("");
    }
  }, [selectedIndex, filtered.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setFounderNotes("");
    }
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < filtered.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setFounderNotes("");
    }
  }, [selectedIndex, filtered.length]);

  useEffect(() => {
    if (selectedItem) {
      setFounderNotes(selectedItem.founder_notes ?? "");
    }
  }, [selectedItem?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          handleApprove();
          break;
        case "r":
          e.preventDefault();
          handleReject();
          break;
        case "s":
          e.preventDefault();
          handleSkip();
          break;
        case "arrowleft":
          e.preventDefault();
          handlePrev();
          break;
        case "arrowright":
          e.preventDefault();
          handleNext();
          break;
        case "escape":
          e.preventDefault();
          setSelectedIndex(null);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex, handleApprove, handleReject, handleSkip, handlePrev, handleNext]);

  const handleFieldUpdate = async (field: string, value: string | number | null) => {
    if (!selectedItem) return;
    await updateMutation.mutateAsync({
      id: selectedItem.id,
      changes: { [field]: value },
    });
    toast.success("Updated");
  };

  if (selectedItem) {
    const typeMeta = CONTENT_TYPE_LABELS[selectedItem.content_type] ?? { label: selectedItem.content_type, color: "bg-muted text-muted-foreground" };
    const statusMeta = STATUS_BADGES[selectedItem.status] ?? { label: selectedItem.status, color: "bg-muted text-muted-foreground" };

    return (
      <PortalPageLayout>
        {/* Reader header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border -mx-4 px-4 py-3 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedIndex(null); setFounderNotes(""); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className={`text-[10px] ${typeMeta.color}`}>
                  {typeMeta.label}
                </Badge>
                <Badge variant="outline" className={`text-[10px] ${statusMeta.color}`}>
                  {statusMeta.label}
                </Badge>
                {selectedItem.wave && (
                  <Badge variant="outline" className="text-[10px]">Wave {selectedItem.wave}</Badge>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {selectedIndex !== null ? selectedIndex + 1 : 0}/{filtered.length}
                </span>
              </div>
              <h2 className="text-sm font-semibold truncate">{selectedItem.title}</h2>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon" onClick={handlePrev} disabled={selectedIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={selectedIndex === filtered.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document content */}
          <div className="lg:col-span-2">
            {selectedItem.recipient_name && (
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Recipient:</span> {selectedItem.recipient_name}
                {selectedItem.recipient_email && ` (${selectedItem.recipient_email})`}
              </p>
            )}

            {(() => {
              const staleWarnings = detectStaleStats(selectedItem.content_markdown, templateVars);
              const rendered = selectedItem.content_markdown
                ? interpolateContent(selectedItem.content_markdown, templateVars)
                : null;
              return (
                <>
                  {staleWarnings.length > 0 && (
                    <div className="mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Stale Stats Detected
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {staleWarnings.map((w, i) => (
                              <li key={i} className="text-xs text-amber-600/80 dark:text-amber-400/80">{w}</li>
                            ))}
                          </ul>
                          <p className="text-[11px] text-amber-600/60 dark:text-amber-400/60 mt-1.5">
                            Consider templatizing with {'{{variableName}}'} syntax for auto-updating stats.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {rendered ? (
                    <article className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {rendered}
                      </ReactMarkdown>
                    </article>
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                      <p className="text-muted-foreground font-medium">Content not yet loaded</p>
                      {selectedItem.source_file_path && (
                        <p className="text-sm text-muted-foreground/60 mt-2">
                          Source: <code className="text-xs bg-muted px-2 py-0.5 rounded">{selectedItem.source_file_path}</code>
                        </p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Review controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Review Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <Select value={selectedItem.status} onValueChange={(v) => handleFieldUpdate("status", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Destination</label>
                  <Select value={selectedItem.destination} onValueChange={(v) => handleFieldUpdate("destination", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="cephas">Cephas</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="physical_mail">Physical Mail</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="red_carpet">Red Carpet</SelectItem>
                      <SelectItem value="press">Press</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Send When */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Send When</label>
                  <Select value={selectedItem.send_when ?? "manual"} onValueChange={(v) => handleFieldUpdate("send_when", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="opening_gambit">Opening Gambit</SelectItem>
                      <SelectItem value="battery_dispatch_day_1">Battery Dispatch Day 1</SelectItem>
                      <SelectItem value="battery_dispatch_day_3">Battery Dispatch Day 3</SelectItem>
                      <SelectItem value="battery_dispatch_day_7">Battery Dispatch Day 7</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Send Format */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</label>
                  <div className="flex gap-2 mt-1">
                    {["digital", "physical", "both"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => handleFieldUpdate("send_format", fmt)}
                        className={`flex-1 text-xs py-1.5 rounded border capitalize ${
                          selectedItem.send_format === fmt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wave */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wave</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={selectedItem.wave ?? ""}
                    onChange={(e) => handleFieldUpdate("wave", e.target.value ? parseInt(e.target.value) : null)}
                    className="mt-1"
                    placeholder="1-10"
                  />
                </div>

                {/* Founder Notes */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Founder Notes</label>
                  <Textarea
                    value={founderNotes}
                    onChange={(e) => setFounderNotes(e.target.value)}
                    className="mt-1 min-h-[80px]"
                    placeholder="Comments, corrections, instructions..."
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleApprove}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve (A)
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleReject}
                    disabled={updateMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject (R)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSkip}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip (S)
                  </Button>
                </div>

                {/* Plugs integration for social destinations */}
                {(selectedItem.destination === "social" || selectedItem.content_type === "social_dispatch") && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate(`/dashboard/dispatch?content_id=${selectedItem.id}`)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Post via Plugs
                  </Button>
                )}

                {/* QR share for cue cards */}
                {selectedItem.content_type === "cue_card" && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate("/tools/cue-card-generator")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Share Cue Card
                  </Button>
                )}

                {/* Outbound queue — approved items with email/social/press destination */}
                {selectedItem.status === "approved" &&
                  ["email", "social", "press", "physical_mail"].includes(selectedItem.destination) && (
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                    onClick={async () => {
                      try {
                        await supabase.from("moneypenny_outbound" as never).insert({
                          content_queue_id: selectedItem.id,
                          recipient_name: selectedItem.recipient_name || selectedItem.title,
                          recipient_email: selectedItem.recipient_email || null,
                          recipient_handle: selectedItem.recipient_handle || null,
                          destination: selectedItem.destination === "physical_mail" ? "physical" : selectedItem.destination,
                          subject: selectedItem.title,
                          body_preview: selectedItem.content_markdown?.slice(0, 500) || null,
                          wave: selectedItem.wave,
                          priority: selectedItem.priority <= 2 ? "high" : "normal",
                          status: "queued",
                        } as never);
                        toast.success(`Queued for outbound: ${selectedItem.recipient_name || selectedItem.title}`);
                      } catch {
                        toast.error("Failed to queue — may already be in outbound queue.");
                      }
                    }}
                    disabled={updateMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Queue for Outbound
                  </Button>
                )}

                {/* Metadata */}
                <div className="pt-3 border-t border-border space-y-1 text-[11px] text-muted-foreground">
                  {selectedItem.reviewed_at && (
                    <p>Reviewed: {new Date(selectedItem.reviewed_at).toLocaleString()}</p>
                  )}
                  {selectedItem.approved_at && (
                    <p>Approved: {new Date(selectedItem.approved_at).toLocaleString()}</p>
                  )}
                  {selectedItem.sent_at && (
                    <p>Sent: {new Date(selectedItem.sent_at).toLocaleString()}</p>
                  )}
                  <p>Priority: {selectedItem.priority}</p>
                  {selectedItem.source_file_path && (
                    <p className="truncate" title={selectedItem.source_file_path}>
                      Source: {selectedItem.source_file_path}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="w-7 h-7" />
            Content Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            {stats.total} documents &middot; {stats.approved} approved &middot; {stats.pending} pending review
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
          >
            <Keyboard className="w-4 h-4 mr-1.5" />
            Shortcuts
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/helm")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Helm
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts panel */}
      {showShortcuts && (
        <Card className="mb-4 bg-muted/30">
          <CardContent className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Keyboard Shortcuts (active when viewing a document)</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowShortcuts(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">A</kbd> Approve</span>
              <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">R</kbd> Reject</span>
              <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">S</kbd> Skip</span>
              <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">&larr;</kbd> Prev</span>
              <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">&rarr;</kbd> Next</span>
              <span><kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd> Close reader</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-card/50">
          <CardContent className="py-3 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="py-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
            <p className="text-[11px] text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            <p className="text-[11px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="py-3 text-center">
            <XCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
            <p className="text-[11px] text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title, content, recipient, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-40">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {CONTENT_TYPE_LABELS[t]?.label ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.keys(STATUS_BADGES).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_BADGES[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={waveFilter} onValueChange={setWaveFilter}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="Wave" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Waves</SelectItem>
            {uniqueWaves.map((w) => (
              <SelectItem key={w} value={String(w)}>Wave {w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={destinationFilter} onValueChange={setDestinationFilter}>
          <SelectTrigger className="w-full md:w-36">
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            {uniqueDestinations.map((d) => (
              <SelectItem key={d} value={d} className="capitalize">{d.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort + View toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-2">{filtered.length} results</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-2"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">No documents match your filters</p>
            <Button variant="link" onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); setWaveFilter("all"); setDestinationFilter("all"); }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, idx) => {
            const typeMeta = CONTENT_TYPE_LABELS[item.content_type] ?? { label: item.content_type, color: "bg-muted text-muted-foreground" };
            const statusMeta = STATUS_BADGES[item.status] ?? { label: item.status, color: "bg-muted text-muted-foreground" };

            return (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] ${typeMeta.color}`}>
                    {typeMeta.icon}
                    <span className="ml-1">{typeMeta.label}</span>
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${statusMeta.color}`}>
                    {statusMeta.label}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  {item.recipient_name && <span>{item.recipient_name}</span>}
                  {item.wave && <span>W{item.wave}</span>}
                  <span className="capitalize">{item.destination.replace(/_/g, " ")}</span>
                  {!item.content_markdown && <Badge variant="outline" className="text-[9px] opacity-50">No content</Badge>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((item, idx) => {
            const typeMeta = CONTENT_TYPE_LABELS[item.content_type] ?? { label: item.content_type, color: "bg-muted text-muted-foreground" };
            const statusMeta = STATUS_BADGES[item.status] ?? { label: item.status, color: "bg-muted text-muted-foreground" };

            return (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(idx)}
                className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 transition-colors group flex items-center gap-3"
              >
                <div className="w-6 text-center text-[11px] text-muted-foreground/50 font-mono">
                  {item.priority}
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 w-20 justify-center ${typeMeta.color}`}>
                  {typeMeta.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors truncate block">
                    {item.title}
                  </span>
                </div>
                {item.recipient_name && (
                  <span className="text-[11px] text-muted-foreground truncate max-w-[140px] hidden sm:block">
                    {item.recipient_name}
                  </span>
                )}
                {item.wave && (
                  <Badge variant="outline" className="text-[10px] shrink-0 hidden md:flex">
                    W{item.wave}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[10px] shrink-0 w-20 justify-center ${statusMeta.color}`}>
                  {statusMeta.label}
                </Badge>
                {item.content_markdown ? (
                  <Eye className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-muted-foreground/15 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </PortalPageLayout>
  );
}

export default ContentCommandCenter;
