import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BookOpen, MessageSquare, CheckCircle2, Filter, Clock, Send, Archive, Loader2, AlertCircle, Lightbulb, HelpCircle, ThumbsUp, ThumbsDown, Sparkles, Bot, GitBranch, ArrowRight, Eye, XCircle } from "lucide-react";

interface SubmittedNote {
  id: string;
  user_id: string;
  item_slug: string;
  item_title: string;
  content: string;
  detail_level: string | null;
  category: string;
  section_librarian: number | null;
  status: string;
  resolution: string | null;
  response_to_member: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
}

interface HelmQueueItem {
  id: string;
  slug: string;
  title: string;
  content_type: string;
  content_markdown: string | null;
  status: string;
  auto_ingested: boolean;
  corps_source: {
    sp?: string;
    session_id?: string;
    agent?: string;
    source_file?: string;
    bridged_at?: string;
    entry_type?: string;
  } | null;
  section_librarian: number | null;
  creation_context: string | null;
  created_at: string;
}

interface PipelineItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  current_stage: string;
  status: string;
  cephas_sync_status: string | null;
  section_librarian: number | null;
  corps_source: Record<string, unknown> | null;
  updated_at: string;
}

interface SectionInfo {
  section_number: number;
  section_name: string;
  description: string;
}

const SECTION_NAMES: Record<number, string> = {
  1: 'Economics & Currency',
  2: 'Letters & Outreach',
  3: 'Initiatives & Programs',
  4: 'Technology & Architecture',
  5: 'Legal & Compliance',
  6: 'Content & Articles',
  7: 'HexIsle & Manufacturing',
};

const PIPELINE_STAGES = ['seed', 'tldr', 'blog', 'article', 'paper'] as const;

const SYNC_COLORS: Record<string, string> = {
  synced: 'text-green-400 bg-green-500/10 border-green-500/25',
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  outdated: 'text-red-400 bg-red-500/10 border-red-500/25',
  new: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
};

const CATEGORY_ICONS: Record<string, typeof AlertCircle> = {
  correction: AlertCircle,
  suggestion: Lightbulb,
  question: HelpCircle,
  praise: ThumbsUp,
  criticism: ThumbsDown,
  idea: Sparkles,
  uncategorized: MessageSquare,
};

const CATEGORY_COLORS: Record<string, string> = {
  correction: 'text-red-400 bg-red-500/10 border-red-500/25',
  suggestion: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  question: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
  praise: 'text-green-400 bg-green-500/10 border-green-500/25',
  criticism: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
  idea: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  uncategorized: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
};

const RESOLUTION_OPTIONS = [
  { value: 'incorporated', label: 'Incorporated' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'needs-discussion', label: 'Needs Discussion' },
  { value: 'escalated-to-founder', label: 'Escalated to Founder' },
];

export default function LibrarianDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("queue");
  const [filterSection, setFilterSection] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  const { data: sections = [] } = useQuery({
    queryKey: ["librarian-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("librarian_section_map" as never)
        .select("section_number, section_name, description")
        .order("section_number") as { data: SectionInfo[] | null; error: unknown };
      if (error || !data) return [];
      return data;
    },
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["librarian-queue", filterSection, filterCategory],
    queryFn: async () => {
      let query = supabase
        .from("tour_notes_submitted" as never)
        .select("*")
        .order("created_at", { ascending: false });

      if (filterSection) query = query.eq("section_librarian", filterSection);
      if (filterCategory) query = query.eq("category", filterCategory);

      const { data, error } = query as unknown as { data: SubmittedNote[] | null; error: unknown };
      if (error || !data) return [];
      return data;
    },
  });

  const processNote = useMutation({
    mutationFn: async (args: { noteId: string; resolution: string; response?: string }) => {
      const updates: Record<string, unknown> = {
        status: 'resolved',
        resolution: args.resolution,
        processed_by: user?.email || 'admin',
        processed_at: new Date().toISOString(),
      };
      if (args.response) updates.response_to_member = args.response;

      const { error } = await supabase
        .from("tour_notes_submitted" as never)
        .update(updates)
        .eq("id", args.noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["librarian-queue"] });
      toast.success("Note processed");
    },
    onError: () => toast.error("Failed to process note"),
  });

  const archiveNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("tour_notes_submitted" as never)
        .update({ status: 'archived' })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["librarian-queue"] });
      toast.success("Note archived");
    },
  });

  const { data: autoIngested = [], isLoading: autoLoading } = useQuery({
    queryKey: ["auto-ingested-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helm_content_queue" as never)
        .select("*")
        .eq("auto_ingested", true)
        .order("created_at", { ascending: false }) as { data: HelmQueueItem[] | null; error: unknown };
      if (error || !data) return [];
      return data;
    },
  });

  const { data: pipelineItems = [], isLoading: pipelineLoading } = useQuery({
    queryKey: ["content-pipeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_pipeline" as never)
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50) as { data: PipelineItem[] | null; error: unknown };
      if (error || !data) return [];
      return data;
    },
  });

  const { data: compiledCount = 0 } = useQuery({
    queryKey: ["compiled-documents-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("compiled_documents" as never)
        .select("id", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
  });

  const updateQueueStatus = useMutation({
    mutationFn: async (args: { id: string; status: string }) => {
      const { error } = await supabase
        .from("helm_content_queue" as never)
        .update({ status: args.status })
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auto-ingested-queue"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const publishContent = useMutation({
    mutationFn: async (helmQueueId: string) => {
      const { data, error } = await supabase.functions.invoke("publish-approved-content", {
        body: { helm_queue_id: helmQueueId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auto-ingested-queue"] });
      queryClient.invalidateQueries({ queryKey: ["content-pipeline"] });
      toast.success(data?.action === 'marked_ready_to_send' ? 'Marked ready to send' : 'Published to Cephas');
    },
    onError: () => toast.error("Failed to publish"),
  });

  const queueNotes = notes.filter(n => ['submitted', 'categorized', 'assigned'].includes(n.status));
  const resolvedNotes = notes.filter(n => n.status === 'resolved');
  const archivedNotes = notes.filter(n => n.status === 'archived');

  const statsByCategory = notes.reduce<Record<string, number>>((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});

  const statsBySection = notes.reduce<Record<number, number>>((acc, n) => {
    if (n.section_librarian) acc[n.section_librarian] = (acc[n.section_librarian] || 0) + 1;
    return acc;
  }, {});

  function renderNoteCard(note: SubmittedNote, showActions: boolean) {
    const Icon = CATEGORY_ICONS[note.category] || MessageSquare;
    const colorClass = CATEGORY_COLORS[note.category] || CATEGORY_COLORS.uncategorized;
    const section = sections.find(s => s.section_number === note.section_librarian);

    return (
      <Card key={note.id} className="border-border/50">
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={colorClass}>
                  <Icon className="w-3 h-3 mr-1" />
                  {note.category}
                </Badge>
                {section && <Badge variant="secondary">{section.section_name}</Badge>}
                <Badge variant="outline">{note.status}</Badge>
              </div>
              <p className="text-sm font-medium">{note.item_title}</p>
              <p className="text-xs text-muted-foreground">
                Slug: {note.item_slug} | Level: {note.detail_level || 'N/A'}
              </p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="w-3 h-3 inline mr-1" />
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">{note.content}</p>
          </div>

          {note.resolution && (
            <div className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
              <p className="text-xs text-green-400 font-medium">Resolution: {note.resolution}</p>
              {note.response_to_member && (
                <p className="text-xs text-muted-foreground mt-1">Response: {note.response_to_member}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">By: {note.processed_by}</p>
            </div>
          )}

          {showActions && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              {note.category === 'question' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Response to member</label>
                  <Textarea
                    placeholder="Write your response..."
                    value={responseText[note.id] || ''}
                    onChange={(e) => setResponseText(prev => ({ ...prev, [note.id]: e.target.value }))}
                    rows={2}
                    className="text-xs"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {RESOLUTION_OPTIONS.map(opt => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant="outline"
                    onClick={() => processNote.mutate({
                      noteId: note.id,
                      resolution: opt.value,
                      response: responseText[note.id] || undefined,
                    })}
                    disabled={processNote.isPending}
                    className="text-xs h-7"
                  >
                    {opt.label}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => archiveNote.mutate(note.id)}
                  disabled={archiveNote.isPending}
                  className="text-xs h-7 text-muted-foreground"
                >
                  <Archive className="w-3 h-3 mr-1" /> Archive
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6" data-xray-id="librarian-dashboard">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold">Librarian Dashboard</h1>
          <p className="text-sm text-muted-foreground">Staff of Librarians — Notes Processing Pipeline</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{queueNotes.length}</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{resolvedNotes.length}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{notes.filter(n => n.category === 'question').length}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{sections.length}</p>
            <p className="text-xs text-muted-foreground">Sections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{compiledCount}</p>
            <p className="text-xs text-muted-foreground">Compiled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filter:</span>
            <Button
              size="sm" variant={filterSection === null ? "default" : "outline"}
              onClick={() => setFilterSection(null)} className="text-xs h-7"
            >All Sections</Button>
            {sections.map(s => (
              <Button
                key={s.section_number} size="sm"
                variant={filterSection === s.section_number ? "default" : "outline"}
                onClick={() => setFilterSection(s.section_number)}
                className="text-xs h-7"
              >{s.section_name}</Button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-xs font-medium text-muted-foreground ml-6">Category:</span>
            <Button
              size="sm" variant={filterCategory === null ? "default" : "outline"}
              onClick={() => setFilterCategory(null)} className="text-xs h-7"
            >All</Button>
            {Object.keys(CATEGORY_ICONS).map(cat => (
              <Button
                key={cat} size="sm"
                variant={filterCategory === cat ? "default" : "outline"}
                onClick={() => setFilterCategory(cat)}
                className="text-xs h-7"
              >{cat} ({statsByCategory[cat] || 0})</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">
            Queue ({queueNotes.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedNotes.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedNotes.length})
          </TabsTrigger>
          <TabsTrigger value="auto-ingested">
            <Bot className="w-3 h-3 mr-1" /> Auto-Ingested ({autoIngested.length})
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <GitBranch className="w-3 h-3 mr-1" /> Pipeline
          </TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-3 mt-4">
          {isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
          {!isLoading && queueNotes.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No notes in queue</CardContent></Card>
          )}
          {queueNotes.map(n => renderNoteCard(n, true))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3 mt-4">
          {resolvedNotes.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No resolved notes yet</CardContent></Card>
          )}
          {resolvedNotes.map(n => renderNoteCard(n, false))}
        </TabsContent>

        <TabsContent value="archived" className="space-y-3 mt-4">
          {archivedNotes.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Archive empty</CardContent></Card>
          )}
          {archivedNotes.map(n => renderNoteCard(n, false))}
        </TabsContent>

        <TabsContent value="auto-ingested" className="space-y-3 mt-4">
          {autoLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
          {!autoLoading && autoIngested.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">
              <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No auto-ingested content yet. Content from the Stitchpunk Corps pipeline will appear here.</p>
            </CardContent></Card>
          )}
          {autoIngested.map(item => (
            <Card key={item.id} className="border-border/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold">{item.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{item.content_type}</Badge>
                      {item.section_librarian && (
                        <Badge variant="secondary">
                          {SECTION_NAMES[item.section_librarian] || `Section ${item.section_librarian}`}
                        </Badge>
                      )}
                      <Badge variant={
                        item.status === 'published' ? 'default' :
                        item.status === 'approved' ? 'default' :
                        item.status === 'rejected' ? 'destructive' : 'outline'
                      }>{item.status}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                {item.corps_source && (
                  <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                    {item.corps_source.agent && <span>Agent: <strong>{item.corps_source.agent}</strong></span>}
                    {item.corps_source.session_id && <span>Session: {item.corps_source.session_id}</span>}
                    {item.corps_source.bridged_at && (
                      <span>Bridged: {new Date(item.corps_source.bridged_at).toLocaleString()}</span>
                    )}
                  </div>
                )}

                {item.content_markdown && (
                  <div className="p-3 bg-muted/50 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-xs whitespace-pre-wrap">{item.content_markdown.slice(0, 500)}{item.content_markdown.length > 500 ? '…' : ''}</p>
                  </div>
                )}

                {item.status !== 'published' && item.status !== 'rejected' && (
                  <div className="flex gap-1.5 pt-2 border-t border-border/50">
                    {item.status === 'draft' && (
                      <Button size="sm" variant="outline" className="text-xs h-7"
                        onClick={() => updateQueueStatus.mutate({ id: item.id, status: 'in_review' })}
                        disabled={updateQueueStatus.isPending}>
                        <Eye className="w-3 h-3 mr-1" /> Review
                      </Button>
                    )}
                    <Button size="sm" className="text-xs h-7"
                      onClick={() => publishContent.mutate(item.id)}
                      disabled={publishContent.isPending}>
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve & Publish
                    </Button>
                    <Button size="sm" variant="destructive" className="text-xs h-7"
                      onClick={() => updateQueueStatus.mutate({ id: item.id, status: 'rejected' })}
                      disabled={updateQueueStatus.isPending}>
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-3 mt-4">
          {pipelineLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}
          {!pipelineLoading && pipelineItems.length === 0 && (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">
              <GitBranch className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No content in the pipeline yet.</p>
            </CardContent></Card>
          )}
          {pipelineItems.map(item => (
            <Card key={item.id} className="border-border/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.section_librarian && (
                        <Badge variant="secondary">
                          {SECTION_NAMES[item.section_librarian] || `Section ${item.section_librarian}`}
                        </Badge>
                      )}
                      {item.cephas_sync_status && (
                        <Badge variant="outline" className={SYNC_COLORS[item.cephas_sync_status] || ''}>
                          {item.cephas_sync_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <div key={stage} className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.current_stage === stage
                          ? 'bg-primary text-primary-foreground font-bold'
                          : PIPELINE_STAGES.indexOf(item.current_stage as typeof PIPELINE_STAGES[number]) > idx
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {stage.toUpperCase()}
                      </span>
                      {idx < PIPELINE_STAGES.length - 1 && (
                        <ArrowRight className="w-3 h-3 mx-0.5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                {item.corps_source && (
                  <p className="text-xs text-muted-foreground">
                    Auto-ingested via Stitchpunk Corps
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sections" className="space-y-3 mt-4">
          {sections.map(s => (
            <Card key={s.section_number}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Section {s.section_number}: {s.section_name}
                  </CardTitle>
                  <Badge variant="secondary">{statsBySection[s.section_number] || 0} notes</Badge>
                </div>
                <CardDescription className="text-xs">{s.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
