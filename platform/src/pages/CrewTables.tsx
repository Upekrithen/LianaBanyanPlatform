import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { BeaconDropButton } from "@/components/BeaconDropButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Plus, ArrowLeft, UserPlus, CheckCircle, Sparkles,
  Briefcase, Camera, Pen, Printer, LayoutGrid, ChevronRight,
  Trophy, Play, Package, Rocket
} from "lucide-react";

interface CrewTable {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  template_type: string;
  treasure_map_ref: string | null;
  stage_current: number;
  stage_1_items: ChecklistItem[];
  stage_2_items: ChecklistItem[];
  stage_3_items: ChecklistItem[];
  min_seats_to_activate: number;
  is_active: boolean;
  completed_at: string | null;
  created_at: string;
}

interface CrewSeat {
  id: string;
  table_id: string;
  role_name: string;
  slot_type: string;
  member_id: string | null;
  seated_at: string | null;
  payment_amount: number | null;
  is_required: boolean;
}

interface ChecklistItem {
  label: string;
  done: boolean;
}

const TEMPLATES: Record<string, { label: string; icon: React.ReactNode; roles: { name: string; slot: string }[]; minSeats: number; stages: { s1: string[]; s2: string[]; s3: string[] } }> = {
  new_business_starter: {
    label: "New Business Starter",
    icon: <Briefcase className="h-5 w-5" />,
    roles: [
      { name: "Designer", slot: "primary" },
      { name: "Photographer", slot: "primary" },
      { name: "Writer", slot: "primary" },
      { name: "Printer", slot: "secondary" },
    ],
    minSeats: 3,
    stages: {
      s1: ["Gather brand references", "Define color palette", "Choose font pairing", "Draft tagline"],
      s2: ["Design logo", "Photograph products", "Write cue card copy", "Layout business card"],
      s3: ["Print business cards", "Create digital cue card", "Deliver final assets", "Celebrate"],
    },
  },
  coalition_brand: {
    label: "Coalition Brand Package",
    icon: <LayoutGrid className="h-5 w-5" />,
    roles: [
      { name: "Lead Designer", slot: "primary" },
      { name: "Photographer", slot: "primary" },
      { name: "Writer", slot: "primary" },
      { name: "Printer", slot: "primary" },
      { name: "Coordinator", slot: "secondary" },
    ],
    minSeats: 4,
    stages: {
      s1: ["Define coalition identity", "Inventory partner assets", "Set brand guidelines", "Choose typography"],
      s2: ["Design coalition logo", "Create partner banners", "Write coalition story", "Build style guide"],
      s3: ["Print coalition materials", "Distribute to partners", "Launch announcement", "Record metrics"],
    },
  },
  event_launch: {
    label: "Event Launch",
    icon: <Rocket className="h-5 w-5" />,
    roles: [
      { name: "Designer", slot: "primary" },
      { name: "Photographer", slot: "primary" },
      { name: "Coordinator", slot: "primary" },
      { name: "Runner 1", slot: "secondary" },
      { name: "Runner 2", slot: "secondary" },
    ],
    minSeats: 3,
    stages: {
      s1: ["Choose venue", "Set date & time", "Create event poster", "Plan logistics"],
      s2: ["Print posters & flyers", "Photograph venue", "Set up registration", "Brief runners"],
      s3: ["Run the event", "Photograph attendees", "Collect feedback", "Post recap"],
    },
  },
};

const STAGE_LABELS = ["PREP", "BUILD", "DELIVER"];
const STAGE_COLORS = ["text-blue-400", "text-amber-400", "text-emerald-400"];

export default function CrewTables() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const autoTemplate = searchParams.get("template") || "";
  const autoTitle = searchParams.get("title") || "";
  const [tab, setTab] = useState(autoTemplate ? "create" : "browse");
  const [showCreate, setShowCreate] = useState(!!autoTemplate);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  // Create form state
  const [formTitle, setFormTitle] = useState(autoTitle);
  const [formDescription, setFormDescription] = useState("");
  const [formTemplate, setFormTemplate] = useState(autoTemplate || "new_business_starter");
  const [customRoles, setCustomRoles] = useState<{ name: string; slot: string; payment: string }[]>([
    { name: "", slot: "primary", payment: "" },
  ]);
  const [formMinSeats, setFormMinSeats] = useState("3");

  const { data: tables, isLoading } = useQuery({
    queryKey: ["crew-tables"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_tables" as never)
        .select("*")
        .order("created_at", { ascending: false }) as { data: CrewTable[] | null };
      return (data || []) as CrewTable[];
    },
  });

  const { data: allSeats } = useQuery({
    queryKey: ["crew-table-seats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_table_seats" as never)
        .select("*") as { data: CrewSeat[] | null };
      return (data || []) as CrewSeat[];
    },
  });

  function seatsForTable(tableId: string) {
    return allSeats?.filter(s => s.table_id === tableId) || [];
  }

  // Create table mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!formTitle.trim()) throw new Error("Title required");

      const isPreset = formTemplate !== "custom";
      const preset = TEMPLATES[formTemplate];
      const roles = isPreset
        ? preset.roles.map(r => ({ name: r.name, slot: r.slot, payment: "" }))
        : customRoles.filter(r => r.name.trim());

      if (roles.length < 2) throw new Error("Need at least 2 roles");

      const stageItems = isPreset ? {
        stage_1_items: preset.stages.s1.map(l => ({ label: l, done: false })),
        stage_2_items: preset.stages.s2.map(l => ({ label: l, done: false })),
        stage_3_items: preset.stages.s3.map(l => ({ label: l, done: false })),
      } : {
        stage_1_items: [{ label: "Define scope", done: false }, { label: "Gather resources", done: false }],
        stage_2_items: [{ label: "Execute work", done: false }, { label: "Review quality", done: false }],
        stage_3_items: [{ label: "Deliver results", done: false }, { label: "Celebrate", done: false }],
      };

      const { data: newTable, error } = await supabase.from("crew_tables" as never).insert({
        creator_id: user.id,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        template_type: formTemplate,
        min_seats_to_activate: isPreset ? preset.minSeats : parseInt(formMinSeats) || 3,
        ...stageItems,
      } as never).select("id").single() as { data: { id: string } | null; error: unknown };

      if (error || !newTable) throw new Error("Failed to create table");

      for (const role of roles) {
        await supabase.from("crew_table_seats" as never).insert({
          table_id: newTable.id,
          role_name: role.name,
          slot_type: role.slot,
          payment_amount: role.payment ? parseFloat(role.payment) : null,
          is_required: role.slot === "primary",
        } as never);
      }

      return newTable.id;
    },
    onSuccess: () => {
      toast({ title: "Crew Table Created!", description: "Share the link so people can join." });
      setFormTitle(""); setFormDescription("");
      setCustomRoles([{ name: "", slot: "primary", payment: "" }]);
      setShowCreate(false);
      setTab("browse");
      queryClient.invalidateQueries({ queryKey: ["crew-tables"] });
      queryClient.invalidateQueries({ queryKey: ["crew-table-seats"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  // Join seat mutation
  const joinMutation = useMutation({
    mutationFn: async ({ seatId, tableId }: { seatId: string; tableId: string }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("crew_table_seats" as never).update({
        member_id: user.id,
        seated_at: new Date().toISOString(),
      } as never).eq("id", seatId as never);
      if (error) throw error;

      // Check if table should activate
      const seats = seatsForTable(tableId);
      const table = tables?.find(t => t.id === tableId);
      const filledAfterJoin = seats.filter(s => s.member_id || s.id === seatId).length;
      if (table && filledAfterJoin >= table.min_seats_to_activate && !table.is_active) {
        await supabase.from("crew_tables" as never).update({
          is_active: true,
        } as never).eq("id", tableId as never);
      }

      return { filledAfterJoin, min: table?.min_seats_to_activate || 3 };
    },
    onSuccess: (result) => {
      const remaining = result.min - result.filledAfterJoin;
      toast({
        title: "You've joined the table!",
        description: remaining > 0
          ? `${remaining} more seat${remaining !== 1 ? "s" : ""} needed to activate.`
          : "Table is now active! Time to get to work.",
      });
      queryClient.invalidateQueries({ queryKey: ["crew-tables"] });
      queryClient.invalidateQueries({ queryKey: ["crew-table-seats"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to join", description: err.message, variant: "destructive" });
    },
  });

  // Toggle checklist item
  async function toggleChecklistItem(tableId: string, stage: number, itemIndex: number) {
    const table = tables?.find(t => t.id === tableId);
    if (!table) return;

    const key = `stage_${stage}_items` as "stage_1_items" | "stage_2_items" | "stage_3_items";
    const items = [...table[key]];
    items[itemIndex] = { ...items[itemIndex], done: !items[itemIndex].done };

    const updatePayload: Record<string, unknown> = { [key]: items };

    // Auto-advance stage if all items complete
    const allDone = items.every(i => i.done);
    if (allDone && stage === table.stage_current) {
      if (stage < 3) {
        updatePayload.stage_current = stage + 1;
      } else {
        updatePayload.completed_at = new Date().toISOString();
      }
    }

    await supabase.from("crew_tables" as never).update(updatePayload as never).eq("id", tableId as never);
    queryClient.invalidateQueries({ queryKey: ["crew-tables"] });
  }

  const openTables = tables?.filter(t => !t.completed_at) || [];
  const myTables = tables?.filter(t => t.creator_id === user?.id || allSeats?.some(s => s.table_id === t.id && s.member_id === user?.id)) || [];

  return (
    <PortalPageLayout maxWidth="xl" xrayId="crew-tables">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-8">
        <Users className="h-12 w-12 mx-auto mb-3 text-purple-400" />
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold" data-xray-id="crew-tables-title">Crew Tables</h1>
          <BeaconDropButton compact className="ml-2" />
        </div>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Assemble a project team around a shared goal. Pick roles, fill seats, and track progress through three stages.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="browse" className="gap-1"><LayoutGrid className="h-4 w-4" /> Open Tables</TabsTrigger>
            <TabsTrigger value="mine" className="gap-1"><Users className="h-4 w-4" /> My Tables</TabsTrigger>
            <TabsTrigger value="create" className="gap-1"><Plus className="h-4 w-4" /> Create</TabsTrigger>
          </TabsList>
        </div>

        {/* Browse Open Tables */}
        <TabsContent value="browse" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tables...</div>
          ) : openTables.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-medium text-lg">No Open Tables</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to create one!</p>
                <Button className="mt-4 gap-2" onClick={() => setTab("create")}>
                  <Plus className="h-4 w-4" /> Create a Table
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {openTables.map(table => {
                const seats = seatsForTable(table.id);
                const filled = seats.filter(s => s.member_id).length;
                const total = seats.length;
                const openSeats = seats.filter(s => !s.member_id);
                const templateInfo = TEMPLATES[table.template_type];

                return (
                  <Card key={table.id} className="hover:border-purple-500/30 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {templateInfo?.icon || <Users className="h-4 w-4" />}
                          {table.title}
                        </CardTitle>
                        <Badge variant={table.is_active ? "default" : "outline"} className={table.is_active ? "bg-emerald-600" : ""}>
                          {table.is_active ? "Active" : `${filled}/${total} seats`}
                        </Badge>
                      </div>
                      {table.description && (
                        <CardDescription className="text-xs">{table.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Stage indicator */}
                      {table.is_active && (
                        <div className="flex gap-1">
                          {STAGE_LABELS.map((label, i) => (
                            <div
                              key={label}
                              className={`flex-1 text-center text-[10px] font-bold py-1 rounded ${
                                table.stage_current === i + 1
                                  ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50"
                                  : table.stage_current > i + 1
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {label}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Seats */}
                      <div className="space-y-1">
                        {seats.map(seat => (
                          <div key={seat.id} className="flex items-center justify-between text-sm p-1.5 rounded bg-muted/50">
                            <div className="flex items-center gap-2">
                              {seat.member_id ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span className={seat.member_id ? "text-foreground" : "text-muted-foreground"}>
                                {seat.role_name}
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">{seat.slot_type}</Badge>
                            </div>
                            {!seat.member_id && user && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs gap-1 text-purple-400 hover:text-purple-300"
                                onClick={() => joinMutation.mutate({ seatId: seat.id, tableId: table.id })}
                                disabled={joinMutation.isPending}
                              >
                                <UserPlus className="h-3 w-3" /> Join
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Active table: Stage tracker */}
                      {table.is_active && expandedTable === table.id && (
                        <div className="border-t pt-3 space-y-2">
                          <Tabs defaultValue={`stage-${table.stage_current}`}>
                            <TabsList className="grid grid-cols-3 h-8">
                              {STAGE_LABELS.map((label, i) => (
                                <TabsTrigger key={label} value={`stage-${i + 1}`} className="text-xs">
                                  {label}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            {[1, 2, 3].map(stageNum => {
                              const key = `stage_${stageNum}_items` as "stage_1_items" | "stage_2_items" | "stage_3_items";
                              const items = table[key] || [];
                              return (
                                <TabsContent key={stageNum} value={`stage-${stageNum}`} className="space-y-1 mt-2">
                                  {items.map((item: ChecklistItem, idx: number) => (
                                    <label key={idx} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer">
                                      <Checkbox
                                        checked={item.done}
                                        onCheckedChange={() => toggleChecklistItem(table.id, stageNum, idx)}
                                      />
                                      <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                                        {item.label}
                                      </span>
                                    </label>
                                  ))}
                                </TabsContent>
                              );
                            })}
                          </Tabs>
                        </div>
                      )}

                      {table.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => setExpandedTable(expandedTable === table.id ? null : table.id)}
                        >
                          {expandedTable === table.id ? "Hide Tracker" : "Show Stage Tracker"}
                        </Button>
                      )}

                      {table.completed_at && (
                        <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <Trophy className="h-6 w-6 mx-auto text-emerald-400 mb-1" />
                          <p className="font-bold text-emerald-300 text-sm">Project Complete!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* My Tables */}
        <TabsContent value="mine" className="space-y-4">
          {!user ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">Sign in to see your tables</p>
                <Link to="/auth"><Button className="mt-3">Sign In</Button></Link>
              </CardContent>
            </Card>
          ) : myTables.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">You haven't joined or created any tables yet.</p>
                <Button className="mt-3 gap-2" onClick={() => setTab("browse")}>
                  <LayoutGrid className="h-4 w-4" /> Browse Open Tables
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myTables.map(table => {
                const seats = seatsForTable(table.id);
                const filled = seats.filter(s => s.member_id).length;
                return (
                  <Card key={table.id} className={table.is_active ? "border-emerald-500/30" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{table.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={table.is_active ? "default" : "outline"} className={table.is_active ? "bg-emerald-600" : ""}>
                          {table.is_active ? "Active" : `${filled}/${seats.length}`}
                        </Badge>
                        {table.is_active && (
                          <Badge variant="outline">Stage {table.stage_current}: {STAGE_LABELS[table.stage_current - 1]}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setExpandedTable(expandedTable === table.id ? null : table.id)}
                      >
                        {expandedTable === table.id ? "Collapse" : "Expand Tracker"}
                      </Button>
                      {table.is_active && expandedTable === table.id && (
                        <div className="mt-3 space-y-2">
                          <Tabs defaultValue={`stage-${table.stage_current}`}>
                            <TabsList className="grid grid-cols-3 h-8">
                              {STAGE_LABELS.map((label, i) => (
                                <TabsTrigger key={label} value={`stage-${i + 1}`} className="text-xs">{label}</TabsTrigger>
                              ))}
                            </TabsList>
                            {[1, 2, 3].map(stageNum => {
                              const key = `stage_${stageNum}_items` as "stage_1_items" | "stage_2_items" | "stage_3_items";
                              const items = table[key] || [];
                              return (
                                <TabsContent key={stageNum} value={`stage-${stageNum}`} className="space-y-1 mt-2">
                                  {items.map((item: ChecklistItem, idx: number) => (
                                    <label key={idx} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer">
                                      <Checkbox checked={item.done} onCheckedChange={() => toggleChecklistItem(table.id, stageNum, idx)} />
                                      <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
                                    </label>
                                  ))}
                                </TabsContent>
                              );
                            })}
                          </Tabs>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Create Table */}
        <TabsContent value="create" className="space-y-4">
          {!user ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="font-medium">Sign in to create a Crew Table</p>
                <Link to="/auth"><Button className="mt-3">Sign In</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-purple-400" /> Create a Crew Table
                  </CardTitle>
                  <CardDescription>
                    Choose a template or build custom. Team members join open seats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input placeholder="e.g. Brand Package for Taco Truck" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="What's this project about?" value={formDescription} onChange={e => setFormDescription(e.target.value)} rows={2} />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select value={formTemplate} onValueChange={setFormTemplate}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEMPLATES).map(([key, t]) => (
                          <SelectItem key={key} value={key}>{t.label} ({t.roles.length} roles)</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom (define your own roles)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template preview */}
                  {formTemplate !== "custom" && TEMPLATES[formTemplate] && (
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Roles included:</p>
                      <div className="flex flex-wrap gap-2">
                        {TEMPLATES[formTemplate].roles.map(r => (
                          <Badge key={r.name} variant={r.slot === "primary" ? "default" : "outline"}>
                            {r.name}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum {TEMPLATES[formTemplate].minSeats} seats to activate
                      </p>
                    </div>
                  )}

                  {/* Custom roles */}
                  {formTemplate === "custom" && (
                    <div className="space-y-3">
                      <Label>Roles</Label>
                      {customRoles.map((role, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Role name"
                            value={role.name}
                            onChange={e => {
                              const updated = [...customRoles];
                              updated[idx] = { ...role, name: e.target.value };
                              setCustomRoles(updated);
                            }}
                          />
                          <Select
                            value={role.slot}
                            onValueChange={v => {
                              const updated = [...customRoles];
                              updated[idx] = { ...role, slot: v };
                              setCustomRoles(updated);
                            }}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="primary">Primary</SelectItem>
                              <SelectItem value="secondary">Secondary</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Payment (Credits)"
                            type="number"
                            value={role.payment}
                            onChange={e => {
                              const updated = [...customRoles];
                              updated[idx] = { ...role, payment: e.target.value };
                              setCustomRoles(updated);
                            }}
                          />
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setCustomRoles([...customRoles, { name: "", slot: "primary", payment: "" }])}>
                        <Plus className="h-3 w-3 mr-1" /> Add Role
                      </Button>
                      <div>
                        <Label>Minimum seats to activate</Label>
                        <Input type="number" value={formMinSeats} onChange={e => setFormMinSeats(e.target.value)} className="w-24 mt-1" />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending || !formTitle.trim()}
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4" />
                    {createMutation.isPending ? "Creating..." : "Create Crew Table"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <p className="text-[10px] text-muted-foreground text-center mt-8 max-w-lg mx-auto">
        Crew Tables connect strangers around shared objectives. Payment amounts shown are illustrative.
        Actual earnings depend on project completion and member agreement. Creator keeps 83.3%.
      </p>
    </PortalPageLayout>
  );
}
