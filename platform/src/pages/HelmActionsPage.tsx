import { useState, useEffect } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Compass, ChevronLeft, ChevronRight, FileText, CheckSquare,
  HelpCircle, BookOpen, Plus, Maximize2, Minimize2, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HelmSection {
  title: string;
  type: "script" | "faq" | "document" | "checklist";
  body: string;
  items?: Array<{ text?: string; q?: string; a?: string; checked?: boolean }>;
}

interface HelmContent {
  target?: string;
  target_type?: string;
  status?: string;
  sections: HelmSection[];
}

interface HelmAction {
  id: string;
  user_id: string;
  title: string;
  action_type: string;
  content: HelmContent;
  tags: string[];
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

const ACTION_TYPES = [
  { value: "pitch", label: "Pitch", color: "bg-blue-500" },
  { value: "checklist", label: "Checklist", color: "bg-green-500" },
  { value: "script", label: "Script", color: "bg-purple-500" },
  { value: "bounty", label: "Bounty", color: "bg-amber-500" },
  { value: "outreach", label: "Outreach", color: "bg-rose-500" },
];

function SectionIcon({ type }: { type: string }) {
  switch (type) {
    case "script": return <FileText className="w-4 h-4" />;
    case "faq": return <HelpCircle className="w-4 h-4" />;
    case "checklist": return <CheckSquare className="w-4 h-4" />;
    case "document": return <BookOpen className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
}

function ScriptSection({ body }: { body: string }) {
  return (
    <div className="bg-black text-white rounded-lg p-6 md:p-8">
      <p className="text-lg md:text-2xl leading-relaxed font-medium whitespace-pre-wrap">
        {body}
      </p>
    </div>
  );
}

function FAQSection({ items }: { items: Array<{ q?: string; a?: string }> }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items?.map((item, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full text-left p-4 font-semibold hover:bg-muted/50 flex items-center justify-between"
          >
            <span>"{item.q}"</span>
            <ChevronRight className={cn("w-4 h-4 transition-transform", openIdx === i && "rotate-90")} />
          </button>
          {openIdx === i && (
            <div className="px-4 pb-4 text-muted-foreground">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChecklistSection({
  items,
  onToggle,
}: {
  items: Array<{ text?: string; checked?: boolean }>;
  onToggle: (idx: number) => void;
}) {
  return (
    <div className="space-y-2">
      {items?.map((item, i) => (
        <button
          key={i}
          onClick={() => onToggle(i)}
          className={cn(
            "w-full text-left p-4 rounded-lg border flex items-start gap-3 transition-colors",
            item.checked ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700" : "hover:bg-muted/50"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
            item.checked ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/30"
          )}>
            {item.checked && <CheckSquare className="w-4 h-4" />}
          </div>
          <span className={cn("text-base", item.checked && "line-through text-muted-foreground")}>
            {item.text}
          </span>
        </button>
      ))}
    </div>
  );
}

function DocumentSection({ body }: { body: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none p-4">
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{body}</div>
    </div>
  );
}

function ActionDetailView({
  action,
  onBack,
  onUpdate,
}: {
  action: HelmAction;
  onBack: () => void;
  onUpdate: (updated: HelmAction) => void;
}) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const sections = action.content.sections || [];
  const section = sections[sectionIdx];

  const handleCheckToggle = (itemIdx: number) => {
    const updated = { ...action };
    const sec = { ...updated.content.sections[sectionIdx] };
    const items = [...(sec.items || [])];
    items[itemIdx] = { ...items[itemIdx], checked: !items[itemIdx].checked };
    sec.items = items;
    updated.content = { ...updated.content, sections: [...updated.content.sections] };
    updated.content.sections[sectionIdx] = sec;
    onUpdate(updated);
  };

  const container = fullScreen
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : "space-y-4";

  return (
    <div className={container}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {!fullScreen && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          <h2 className="text-lg font-bold truncate">{action.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {action.content.target && (
            <Badge variant="outline">{action.content.target}</Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => setFullScreen(!fullScreen)}>
            {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          {fullScreen && (
            <Button variant="ghost" size="sm" onClick={() => { setFullScreen(false); onBack(); }}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={String(sectionIdx)}
        onValueChange={(v) => setSectionIdx(Number(v))}
        className="flex-1 flex flex-col"
      >
        <div className="px-4 overflow-x-auto">
          <TabsList className="w-full justify-start">
            {sections.map((s, i) => (
              <TabsTrigger key={i} value={String(i)} className="flex items-center gap-1.5 text-xs sm:text-sm">
                <SectionIcon type={s.type} />
                <span className="hidden sm:inline">{s.title}</span>
                <span className="sm:hidden">{i + 1}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {sections.map((s, i) => (
            <TabsContent key={i} value={String(i)} className="mt-0">
              <h3 className="text-xl font-bold mb-4">{s.title}</h3>
              {s.body && s.type !== "script" && s.type !== "document" && (
                <p className="text-muted-foreground mb-4">{s.body}</p>
              )}
              {s.type === "script" && <ScriptSection body={s.body} />}
              {s.type === "faq" && <FAQSection items={s.items || []} />}
              {s.type === "checklist" && (
                <ChecklistSection items={s.items || []} onToggle={handleCheckToggle} />
              )}
              {s.type === "document" && <DocumentSection body={s.body} />}
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <div className="flex items-center justify-between p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          disabled={sectionIdx === 0}
          onClick={() => setSectionIdx(sectionIdx - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          {sectionIdx + 1} / {sections.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={sectionIdx === sections.length - 1}
          onClick={() => setSectionIdx(sectionIdx + 1)}
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default function HelmActionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState<HelmAction | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("pitch");
  const [newTarget, setNewTarget] = useState("");

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["helm-actions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("helm_actions" as never)
        .select("*")
        .order("updated_at", { ascending: false }) as { data: HelmAction[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as HelmAction[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("helm_actions" as never)
        .insert({
          user_id: user!.id,
          title: newTitle,
          action_type: newType,
          content: {
            target: newTarget || undefined,
            target_type: "general",
            status: "draft",
            sections: [
              { title: "Main Script", type: "script", body: "" },
              { title: "Preparation Checklist", type: "checklist", body: "", items: [] },
            ],
          },
          tags: [],
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helm-actions"] });
      setShowCreate(false);
      setNewTitle("");
      setNewTarget("");
      toast.success("Helm action created");
    },
    onError: () => toast.error("Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: async (action: HelmAction) => {
      const { error } = await supabase
        .from("helm_actions" as never)
        .update({ content: action.content, updated_at: new Date().toISOString() } as never)
        .eq("id", action.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["helm-actions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("helm_actions" as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["helm-actions"] });
      setSelectedAction(null);
      toast.success("Deleted");
    },
  });

  const handleUpdate = (updated: HelmAction) => {
    setSelectedAction(updated);
    updateMutation.mutate(updated);
  };

  if (selectedAction) {
    return (
      <ActionDetailView
        action={selectedAction}
        onBack={() => setSelectedAction(null)}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="helm-actions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Compass className="w-8 h-8 text-primary" />
              Helm Actions
            </h1>
            <p className="text-muted-foreground mt-1">
              Your pitches, checklists, scripts — ready to use on the go.
            </p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> New Action</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Helm Action</DialogTitle>
                <DialogDescription>A new pitch, checklist, or script for your portfolio.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title (e.g. 'Restaurant Cold Start Pitch')"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Target (optional — e.g. 'La Capital del Sabor')"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!newTitle.trim() || createMutation.isPending}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading helm actions...</div>
        ) : actions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Compass className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No helm actions yet. Create your first pitch or checklist.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {actions.map((action) => {
              const typeInfo = ACTION_TYPES.find((t) => t.value === action.action_type);
              const sectionCount = action.content.sections?.length || 0;
              return (
                <Card
                  key={action.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => setSelectedAction(action)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        {action.content.target && (
                          <CardDescription className="mt-1">
                            Target: {action.content.target}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-white text-xs", typeInfo?.color || "bg-gray-500")}>
                          {typeInfo?.label || action.action_type}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(action.id); }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{sectionCount} section{sectionCount !== 1 ? "s" : ""}</span>
                      <div className="flex items-center gap-1">
                        {action.content.sections?.map((s, i) => (
                          <SectionIcon key={i} type={s.type} />
                        ))}
                      </div>
                    </div>
                    {action.content.status && (
                      <Badge variant="outline" className="mt-2 capitalize">
                        {action.content.status}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
