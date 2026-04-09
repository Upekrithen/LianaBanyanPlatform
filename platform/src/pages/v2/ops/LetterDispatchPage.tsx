import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Lock, Unlock, Send, Mail, Eye, Clock, CheckCircle2, XCircle,
  AlertTriangle, MessageSquare, MailOpen, ArrowRight, Users,
  Calendar, Filter, RefreshCw, FileText, Edit3,
} from "lucide-react";

type DispatchStatus = "draft" | "locked" | "queued" | "sent" | "delivered" | "bounced" | "responded";
type ResponseCategory = "interested" | "meeting_request" | "declined" | "forwarded" | "no_response" | null;

type LetterRow = {
  id: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_org: string | null;
  recipient_slug: string | null;
  backup_contact: string | null;
  notes: string | null;
  phase: number;
  wave_position: number;
  dispatch_method: string;
  status: DispatchStatus;
  locked_at: string | null;
  queued_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  response_received_at: string | null;
  subject_line: string | null;
  custom_intro: string | null;
  letter_body: string | null;
  red_carpet_slug: string | null;
  letter_category: string | null;
  email_message_id: string | null;
  open_tracked: boolean;
  click_tracked: boolean;
  response_category: ResponseCategory;
  response_notes: string | null;
  created_at: string;
  updated_at: string;
};

const PHASE_LABELS: Record<number, { name: string; desc: string; color: string }> = {
  1: { name: "Phase 1: The Board Table", desc: "Days 1-3 — Crown & Academics", color: "bg-amber-600" },
  2: { name: "Phase 2: The Validators", desc: "Days 4-6 — Media & Investors", color: "bg-blue-600" },
  3: { name: "Phase 3: The Amplifiers", desc: "Days 7-9 — Media & Partnerships", color: "bg-emerald-600" },
  4: { name: "Phase 4: The Stars", desc: "Days 10-14 — Blessing & Partnerships", color: "bg-purple-600" },
};

const STATUS_CONFIG: Record<DispatchStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Lock; className?: string }> = {
  draft: { label: "Draft", variant: "outline", icon: Unlock, className: "bg-gray-100 text-gray-700 border-gray-300" },
  locked: { label: "Locked", variant: "secondary", icon: Lock, className: "bg-amber-100 text-amber-800 border-amber-300" },
  queued: { label: "Queued", variant: "default", icon: Clock, className: "bg-blue-100 text-blue-800 border-blue-300" },
  sent: { label: "Sent", variant: "default", icon: Send, className: "bg-green-100 text-green-800 border-green-300" },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle2, className: "bg-green-200 text-green-900 border-green-400" },
  bounced: { label: "Bounced", variant: "destructive", icon: XCircle },
  responded: { label: "Responded", variant: "default", icon: MessageSquare, className: "bg-purple-100 text-purple-800 border-purple-300" },
};

const PLACEHOLDER_PREFIX = "[CONTENT PENDING";

function hasLetterContent(body: string | null): boolean {
  return !!body && !body.startsWith(PLACEHOLDER_PREFIX);
}

function ContentDot({ body }: { body: string | null }) {
  const loaded = hasLetterContent(body);
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${loaded ? "bg-green-500" : "bg-red-500"}`}
      title={loaded ? "Letter content loaded" : "No letter content"}
    />
  );
}

function StatusBadge({ status }: { status: DispatchStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className={`gap-1 text-xs ${cfg.className ?? ""}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function LetterCard({
  letter,
  onLock,
  onUnlock,
  onQueue,
  onPreview,
  onRespond,
}: {
  letter: LetterRow;
  onLock: () => void;
  onUnlock: () => void;
  onQueue: () => void;
  onPreview: () => void;
  onRespond: () => void;
}) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ContentDot body={letter.letter_body} />
              <p className="font-semibold text-sm truncate">{letter.recipient_name}</p>
              <StatusBadge status={letter.status as DispatchStatus} />
            </div>
            {letter.recipient_email && (
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-2.5 w-2.5 shrink-0" /> {letter.recipient_email}
              </p>
            )}
            {letter.backup_contact && (
              <p className="text-[10px] text-muted-foreground/70 truncate">{letter.backup_contact}</p>
            )}
            {letter.recipient_org && (
              <p className="text-xs text-muted-foreground truncate">{letter.recipient_org}</p>
            )}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {letter.letter_category && (
                <Badge variant="outline" className="text-[10px]">{letter.letter_category}</Badge>
              )}
              {letter.dispatch_method && letter.dispatch_method !== "email" && (
                <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-700">{letter.dispatch_method}</Badge>
              )}
            </div>
            {letter.red_carpet_slug && (
              <p className="text-[10px] text-blue-600 mt-1 truncate">
                /RedCarpet/{letter.red_carpet_slug}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPreview} title="Preview">
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {letter.status === "draft" && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onLock} title="Lock for send">
                <Lock className="h-3.5 w-3.5" />
              </Button>
            )}
            {letter.status === "locked" && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onUnlock} title="Unlock (back to draft)">
                  <Unlock className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" onClick={onQueue} title="Queue for send">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {(letter.status === "sent" || letter.status === "delivered") && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={onRespond} title="Log response">
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        {letter.sent_at && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Sent: {new Date(letter.sent_at).toLocaleDateString()}
          </p>
        )}
        {letter.response_category && (
          <Badge variant="default" className="text-[10px] mt-1 bg-green-600">
            {letter.response_category.replace("_", " ")}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function LetterDispatchPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("phases");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [previewLetter, setPreviewLetter] = useState<LetterRow | null>(null);
  const [respondLetter, setRespondLetter] = useState<LetterRow | null>(null);
  const [responseCategory, setResponseCategory] = useState<string>("");
  const [responseNotes, setResponseNotes] = useState("");
  const [editingBody, setEditingBody] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editSubject, setEditSubject] = useState("");

  const { data: letters = [], isLoading, refetch } = useQuery({
    queryKey: ["letter-dispatch"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("letter_dispatch_queue" as never)
        .select("*")
        .order("phase", { ascending: true })
        .order("wave_position", { ascending: true }) as { data: LetterRow[] | null; error: unknown };
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("letter_dispatch_queue" as never)
        .update(updates as never)
        .eq("id", id as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["letter-dispatch"] });
    },
  });

  const batchUpdate = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("letter_dispatch_queue" as never)
        .update(updates as never)
        .in("id", ids as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["letter-dispatch"] });
      toast.success("Batch update complete");
    },
  });

  const sendLetter = useMutation({
    mutationFn: async (letterId: string) => {
      const { data, error } = await supabase.functions.invoke("dispatch-letter", {
        body: { letter_dispatch_id: letterId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["letter-dispatch"] });
      toast.success("Letter dispatched");
    },
    onError: (err: Error) => {
      toast.error(`Send failed: ${err.message}`);
    },
  });

  const logResponse = useMutation({
    mutationFn: async ({ id, category, notes }: { id: string; category: string; notes: string }) => {
      const { error } = await supabase
        .from("letter_dispatch_queue" as never)
        .update({
          status: "responded",
          response_category: category,
          response_notes: notes,
          response_received_at: new Date().toISOString(),
        } as never)
        .eq("id", id as never);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["letter-dispatch"] });
      setRespondLetter(null);
      setResponseCategory("");
      setResponseNotes("");
      toast.success("Response logged");
    },
  });

  const filtered = useMemo(() => {
    if (filterStatus === "all") return letters;
    return letters.filter((l) => l.status === filterStatus);
  }, [letters, filterStatus]);

  const byPhase = useMemo(() => {
    const map: Record<number, LetterRow[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const l of filtered) {
      (map[l.phase] ??= []).push(l);
    }
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const s = { total: letters.length, draft: 0, locked: 0, queued: 0, sent: 0, delivered: 0, bounced: 0, responded: 0 };
    for (const l of letters) {
      s[l.status as keyof typeof s] = (s[l.status as keyof typeof s] as number) + 1;
    }
    return s;
  }, [letters]);

  const contentStats = useMemo(() => {
    const loaded = letters.filter((l) => hasLetterContent(l.letter_body)).length;
    return { loaded, total: letters.length };
  }, [letters]);

  const handleLock = (id: string) => {
    updateStatus.mutate({ id, updates: { status: "locked", locked_at: new Date().toISOString(), locked_by: user?.id } });
    toast.success("Letter locked for send");
  };

  const handleUnlock = (id: string) => {
    updateStatus.mutate({ id, updates: { status: "draft", locked_at: null, locked_by: null } });
    toast.info("Letter unlocked");
  };

  const handleQueue = (id: string) => {
    updateStatus.mutate({ id, updates: { status: "queued", queued_at: new Date().toISOString() } });
    toast.success("Letter queued");
  };

  const handleSend = (id: string) => {
    sendLetter.mutate(id);
  };

  const handleBatchLock = (phase: number) => {
    const ids = byPhase[phase]?.filter((l) => l.status === "draft").map((l) => l.id) ?? [];
    if (ids.length === 0) return toast.info("No draft letters in this phase");
    batchUpdate.mutate({ ids, updates: { status: "locked", locked_at: new Date().toISOString(), locked_by: user?.id } });
  };

  const handleBatchQueue = () => {
    const ids = letters.filter((l) => l.status === "locked").map((l) => l.id);
    if (ids.length === 0) return toast.info("No locked letters to queue");
    batchUpdate.mutate({ ids, updates: { status: "queued", queued_at: new Date().toISOString() } });
  };

  const queuedLetters = letters.filter((l) => l.status === "queued");

  return (
    <AppShell title="Letter Dispatch" subtitle="Opening Gambit — 4-Phase Compressed Wave">
      <div className="space-y-6">
        {/* Stats Strip */}
        <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
          {(["total", "draft", "locked", "queued", "sent", "delivered", "bounced", "responded"] as const).map((key) => (
            <Card key={key} className="text-center">
              <CardContent className="p-2">
                <p className="text-2xl font-bold">{stats[key]}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
              </CardContent>
            </Card>
          ))}
          <Card className={`text-center ${contentStats.loaded === contentStats.total ? "border-green-300 bg-green-50/50" : "border-amber-300 bg-amber-50/50"}`}>
            <CardContent className="p-2">
              <p className="text-2xl font-bold">
                <span className={contentStats.loaded === contentStats.total ? "text-green-700" : "text-amber-700"}>
                  {contentStats.loaded}
                </span>
                <span className="text-sm text-muted-foreground">/{contentStats.total}</span>
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="h-2.5 w-2.5" /> Letters Loaded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Batch Actions */}
        <Card>
          <CardContent className="p-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium mr-2">Batch:</span>
            {[1, 2, 3, 4].map((phase) => (
              <Button key={phase} variant="outline" size="sm" onClick={() => handleBatchLock(phase)}>
                <Lock className="h-3 w-3 mr-1" /> Lock Phase {phase}
              </Button>
            ))}
            <Button variant="default" size="sm" onClick={handleBatchQueue}>
              <Send className="h-3 w-3 mr-1" /> Queue All Locked ({stats.locked})
            </Button>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </CardContent>
        </Card>

        {/* Queued Letters — Ready to Send */}
        {queuedLetters.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Ready to Send ({queuedLetters.length} queued)
                <Badge variant="outline" className="text-[10px]">Rate limit: 10/hr</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                {queuedLetters.slice(0, 10).map((l) => (
                  <Button key={l.id} variant="outline" size="sm" onClick={() => handleSend(l.id)} disabled={sendLetter.isPending}>
                    <Send className="h-3 w-3 mr-1" />
                    {l.recipient_name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(STATUS_CONFIG).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_CONFIG[s as DispatchStatus].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="phases">Phase View</TabsTrigger>
            <TabsTrigger value="wave">Wave Matrix</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>

          {/* Phase View */}
          <TabsContent value="phases">
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading dispatch queue...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((phase) => {
                  const cfg = PHASE_LABELS[phase];
                  const phaseLetters = byPhase[phase] ?? [];
                  return (
                    <div key={phase}>
                      <div className={`${cfg.color} text-white px-3 py-2 rounded-t-lg`}>
                        <p className="font-semibold text-sm">{cfg.name}</p>
                        <p className="text-xs opacity-80">{cfg.desc} — {phaseLetters.length} letters</p>
                      </div>
                      <div className="border border-t-0 rounded-b-lg p-2 max-h-[60vh] overflow-y-auto bg-muted/30">
                        {phaseLetters.length === 0 ? (
                          <p className="text-xs text-center py-4 text-muted-foreground">No letters</p>
                        ) : (
                          phaseLetters.map((letter) => (
                            <LetterCard
                              key={letter.id}
                              letter={letter}
                              onLock={() => handleLock(letter.id)}
                              onUnlock={() => handleUnlock(letter.id)}
                              onQueue={() => handleQueue(letter.id)}
                              onPreview={() => setPreviewLetter(letter)}
                              onRespond={() => setRespondLetter(letter)}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Wave Matrix */}
          <TabsContent value="wave">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Compressed Wave Timeline (10-14 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((phase) => {
                    const cfg = PHASE_LABELS[phase];
                    const phaseLetters = byPhase[phase] ?? [];
                    const sentCount = phaseLetters.filter((l) => ["sent", "delivered", "responded"].includes(l.status)).length;
                    const pct = phaseLetters.length > 0 ? Math.round((sentCount / phaseLetters.length) * 100) : 0;
                    return (
                      <div key={phase} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{cfg.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {sentCount}/{phaseLetters.length} sent ({pct}%)
                          </span>
                        </div>
                        <div className="h-8 bg-muted rounded-lg overflow-hidden flex">
                          {phaseLetters.map((l) => {
                            const statusColors: Record<string, string> = {
                              draft: "bg-gray-300",
                              locked: "bg-yellow-400",
                              queued: "bg-blue-400",
                              sent: "bg-blue-600",
                              delivered: "bg-green-500",
                              bounced: "bg-red-500",
                              responded: "bg-emerald-600",
                            };
                            return (
                              <div
                                key={l.id}
                                className={`${statusColors[l.status] ?? "bg-gray-300"} border-r border-white/20 cursor-pointer hover:opacity-80 transition-opacity`}
                                style={{ flex: 1 }}
                                title={`${l.recipient_name} — ${l.status}`}
                                onClick={() => setPreviewLetter(l)}
                              />
                            );
                          })}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {phaseLetters.slice(0, 8).map((l) => (
                            <span key={l.id} className="text-[9px] text-muted-foreground">
                              {l.recipient_name.split(" ").pop()}
                            </span>
                          ))}
                          {phaseLetters.length > 8 && (
                            <span className="text-[9px] text-muted-foreground">+{phaseLetters.length - 8} more</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 mt-4 text-[10px] text-muted-foreground">
                  {Object.entries({ draft: "bg-gray-300", locked: "bg-yellow-400", queued: "bg-blue-400", sent: "bg-blue-600", delivered: "bg-green-500", responded: "bg-emerald-600" }).map(([k, v]) => (
                    <span key={k} className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-sm ${v}`} />
                      {k}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Response Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const responded = letters.filter((l) => l.status === "responded" || l.response_category);
                  const sentNoReply = letters.filter((l) => l.status === "sent" || l.status === "delivered");
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(["interested", "meeting_request", "declined", "forwarded", "no_response"] as const).map((cat) => {
                          const count = responded.filter((l) => l.response_category === cat).length;
                          return (
                            <Card key={cat} className="text-center">
                              <CardContent className="p-2">
                                <p className="text-xl font-bold">{count}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{cat.replace("_", " ")}</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {sentNoReply.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Awaiting Response ({sentNoReply.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {sentNoReply.map((l) => (
                              <Button key={l.id} variant="outline" size="sm" className="text-xs h-7" onClick={() => setRespondLetter(l)}>
                                {l.recipient_name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {responded.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Logged Responses ({responded.length})</p>
                          <div className="space-y-2">
                            {responded.map((l) => (
                              <div key={l.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                                <span className="font-medium">{l.recipient_name}</span>
                                <Badge variant="outline" className="text-[10px]">{l.response_category?.replace("_", " ")}</Badge>
                                {l.response_notes && (
                                  <span className="text-xs text-muted-foreground truncate flex-1">{l.response_notes}</span>
                                )}
                                {l.response_received_at && (
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {new Date(l.response_received_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewLetter} onOpenChange={(open) => { if (!open) { setPreviewLetter(null); setEditingBody(false); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              Letter Preview
              {previewLetter && <StatusBadge status={previewLetter.status as DispatchStatus} />}
            </DialogTitle>
          </DialogHeader>
          {previewLetter && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-lg">{previewLetter.recipient_name}</p>
                  {previewLetter.recipient_org && (
                    <p className="text-sm text-muted-foreground">{previewLetter.recipient_org}</p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {PHASE_LABELS[previewLetter.phase]?.name}
                </Badge>
              </div>

              <div className="bg-muted/50 p-3 rounded space-y-1.5 text-sm">
                <p><span className="font-medium">To:</span> {previewLetter.recipient_email ?? <span className="text-red-500">No email on file</span>}</p>
                {previewLetter.backup_contact && (
                  <p><span className="font-medium">Backup:</span> <span className="text-muted-foreground">{previewLetter.backup_contact}</span></p>
                )}
                <p><span className="font-medium">Category:</span> {previewLetter.letter_category}</p>
                <p><span className="font-medium">Method:</span> {previewLetter.dispatch_method}</p>
                {previewLetter.red_carpet_slug && (
                  <p><span className="font-medium">Red Carpet:</span>{" "}
                    <a href={`/RedCarpet/${previewLetter.red_carpet_slug}`} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                      /RedCarpet/{previewLetter.red_carpet_slug}
                    </a>
                  </p>
                )}
                {previewLetter.notes && (
                  <p><span className="font-medium">Notes:</span> <span className="text-muted-foreground italic">{previewLetter.notes}</span></p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium">Subject Line:</p>
                  {!editingBody && (
                    <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => {
                      setEditingBody(true);
                      setEditBody(previewLetter.letter_body ?? "");
                      setEditSubject(previewLetter.subject_line ?? "");
                    }}>
                      <Edit3 className="h-3 w-3" /> Edit Letter
                    </Button>
                  )}
                </div>
                {editingBody ? (
                  <Input
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="text-sm mb-2"
                    placeholder="Subject line..."
                  />
                ) : (
                  <p className="text-sm font-medium bg-muted/30 px-2 py-1 rounded">{previewLetter.subject_line ?? "—"}</p>
                )}
              </div>

              {previewLetter.custom_intro && !editingBody && (
                <div>
                  <p className="text-xs font-medium mb-1">Custom Intro:</p>
                  <p className="text-sm bg-amber-50 p-2 rounded border border-amber-200">{previewLetter.custom_intro}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium flex items-center gap-1.5">
                    Letter Body
                    <ContentDot body={previewLetter.letter_body} />
                  </p>
                  {!editingBody && previewLetter.letter_body && (
                    <span className="text-[10px] text-muted-foreground">
                      {previewLetter.letter_body.trim().split(/\s+/).length} words
                    </span>
                  )}
                </div>
                {editingBody ? (
                  <>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="text-sm min-h-[200px] font-mono"
                      rows={12}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                      {editBody.trim().split(/\s+/).filter(Boolean).length} words
                    </p>
                  </>
                ) : (
                  <div className="text-sm bg-white p-3 rounded border max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {previewLetter.letter_body || <span className="text-muted-foreground italic">No letter body loaded yet</span>}
                  </div>
                )}
                {previewLetter.updated_at && !editingBody && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Last edited: {new Date(previewLetter.updated_at).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                {previewLetter.locked_at && <p>Locked: {new Date(previewLetter.locked_at).toLocaleString()}</p>}
                {previewLetter.queued_at && <p>Queued: {new Date(previewLetter.queued_at).toLocaleString()}</p>}
                {previewLetter.sent_at && <p>Sent: {new Date(previewLetter.sent_at).toLocaleString()}</p>}
                {previewLetter.email_message_id && <p>Message ID: {previewLetter.email_message_id}</p>}
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            {editingBody && (
              <>
                <Button variant="outline" onClick={() => setEditingBody(false)}>Cancel Edit</Button>
                <Button onClick={() => {
                  if (previewLetter) {
                    const now = new Date().toISOString();
                    updateStatus.mutate({
                      id: previewLetter.id,
                      updates: { letter_body: editBody, subject_line: editSubject, updated_at: now },
                    });
                    setPreviewLetter({ ...previewLetter, letter_body: editBody, subject_line: editSubject, updated_at: now });
                    setEditingBody(false);
                    toast.success("Letter saved");
                  }
                }}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Save Changes
                </Button>
              </>
            )}
            {!editingBody && previewLetter?.status === "draft" && hasLetterContent(previewLetter.letter_body) && (
              <Button variant="secondary" onClick={() => { handleLock(previewLetter.id); setPreviewLetter(null); }}>
                <Lock className="h-3 w-3 mr-1" /> Lock for Send
              </Button>
            )}
            {!editingBody && previewLetter?.status === "locked" && (
              <Button variant="default" onClick={() => { handleQueue(previewLetter.id); setPreviewLetter(null); }}>
                <ArrowRight className="h-3 w-3 mr-1" /> Queue
              </Button>
            )}
            {!editingBody && previewLetter?.status === "queued" && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => { handleSend(previewLetter.id); setPreviewLetter(null); }} disabled={sendLetter.isPending}>
                <Send className="h-3 w-3 mr-1" /> Send Now
              </Button>
            )}
            {!editingBody && (
              <Button variant="outline" onClick={() => setPreviewLetter(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Logger Modal */}
      <Dialog open={!!respondLetter} onOpenChange={() => setRespondLetter(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Log Response — {respondLetter?.recipient_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Response Category</label>
              <Select value={responseCategory} onValueChange={setResponseCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="meeting_request">Meeting Request</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="forwarded">Forwarded to Someone</SelectItem>
                  <SelectItem value="no_response">No Response (30+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Details about the response..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondLetter(null)}>Cancel</Button>
            <Button
              disabled={!responseCategory || logResponse.isPending}
              onClick={() => {
                if (respondLetter && responseCategory) {
                  logResponse.mutate({ id: respondLetter.id, category: responseCategory, notes: responseNotes });
                }
              }}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
