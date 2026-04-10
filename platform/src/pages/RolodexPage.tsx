/**
 * THE ROLODEX — /rolodex
 * Innovation #2233: Tiered Reciprocal Promotion Network
 * Crown Jewel #207
 *
 * Tab 1: "My Rolodex" — manage your own curated recommendations
 * Tab 2: "My Connections" — tiered partnerships (L1-L4)
 * Tab 3: "Discover" — browse other members' recommendations + subscribe
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  Plus, BookOpen, Handshake, DollarSign, Shield,
  ExternalLink, Search, Users, Tag, Star, Trash2, UserPlus, X,
} from "lucide-react";
import { useWildfireRun } from "@/contexts/WildfireRunContext";

/* ─── Type definitions ─── */

interface RolodexRecommendation {
  id: string;
  curator_id: string;
  title: string;
  description: string | null;
  category: string;
  external_url: string | null;
  storefront_id: string | null;
  recommended_member_id: string | null;
  tags: string[];
  created_at: string;
}

interface RolodexConnection {
  id: string;
  member_id: string;
  partner_id: string;
  level: number;
  status: "pending" | "active" | "expired" | "cancelled";
  started_at: string | null;
  expires_at: string | null;
  conditions_json: Record<string, unknown>;
  auto_share: boolean;
  created_at: string;
}

/* ─── Constants ─── */

const CATEGORIES = [
  "manufacturing", "food", "service", "technology", "retail",
  "creative", "education", "health", "finance", "other",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  manufacturing: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  service: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  technology: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  retail: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  creative: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  education: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  finance: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  other: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
};

const LEVEL_CONFIG = [
  { level: 1, name: "Open Book", icon: BookOpen, badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { level: 2, name: "Handshake", icon: Handshake, badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  { level: 3, name: "Pipeline", icon: DollarSign, badgeClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { level: 4, name: "Coalition", icon: Shield, badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expired: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

/* ─── WildFire Tour mock data ─── */

const WILDFIRE_RECOMMENDATIONS: RolodexRecommendation[] = [
  {
    id: "wf-rec-1", curator_id: "wf-user", title: "Affordable 1.5HP Water Chiller",
    description: "Best value chiller for a cold plunge build. Tested 4 brands — this one held up after 6 months of daily use.",
    category: "manufacturing", external_url: "https://example.com/chiller",
    storefront_id: null, recommended_member_id: null, tags: ["cold plunge", "equipment", "tested"],
    created_at: new Date().toISOString(),
  },
  {
    id: "wf-rec-2", curator_id: "wf-user", title: "PVC Pipe Supplier — Custom Lengths",
    description: "This vendor cuts custom plumbing lengths and ships in 3 days. Essential for plunge builds.",
    category: "manufacturing", external_url: null,
    storefront_id: null, recommended_member_id: null, tags: ["plumbing", "supplier"],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "wf-rec-3", curator_id: "wf-user", title: "Sarah's Recipe Testing Service",
    description: "She'll test your recipe 3 times and give detailed notes. Uses her own kitchen and ingredients.",
    category: "food", external_url: null,
    storefront_id: null, recommended_member_id: "wf-sarah", tags: ["recipe", "testing", "quality"],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "wf-rec-4", curator_id: "wf-user", title: "Logo Design with Jake — $40 flat",
    description: "Jake does clean, simple logos. Turnaround in 48 hours. Three revision rounds included.",
    category: "creative", external_url: null,
    storefront_id: null, recommended_member_id: "wf-jake", tags: ["design", "logo", "affordable"],
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

const WILDFIRE_CONNECTIONS: RolodexConnection[] = [
  {
    id: "wf-conn-1", member_id: "wf-user", partner_id: "wf-sarah",
    level: 2, status: "active", started_at: new Date(Date.now() - 604800000).toISOString(),
    expires_at: null, conditions_json: {}, auto_share: true, created_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: "wf-conn-2", member_id: "wf-user", partner_id: "wf-jake",
    level: 1, status: "active", started_at: new Date(Date.now() - 2592000000).toISOString(),
    expires_at: null, conditions_json: {}, auto_share: false, created_at: new Date(Date.now() - 2592000000).toISOString(),
  },
];

/* ─── Component ─── */

export default function RolodexPage() {
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const queryClient = useQueryClient();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form state
  const [newRec, setNewRec] = useState({ title: "", description: "", category: "", external_url: "", tags: "" });
  const [newConn, setNewConn] = useState({ partnerId: "", level: "1", durationDays: "" });

  /* ─── Queries ─── */

  const myRecsQuery = useQuery({
    queryKey: ["rolodex-my-recs", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rolodex_recommendations")
        .select("*")
        .eq("curator_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RolodexRecommendation[];
    },
    enabled: !!user?.id && !isWildfireTour,
  });

  const connectionsQuery = useQuery({
    queryKey: ["rolodex-connections", user?.id],
    queryFn: async () => {
      const { data: asInitiator } = await (supabase as any)
        .from("rolodex_connections").select("*").eq("member_id", user!.id);
      const { data: asPartner } = await (supabase as any)
        .from("rolodex_connections").select("*").eq("partner_id", user!.id);
      return {
        initiated: (asInitiator ?? []) as RolodexConnection[],
        received: (asPartner ?? []) as RolodexConnection[],
      };
    },
    enabled: !!user?.id && !isWildfireTour,
  });

  const discoverQuery = useQuery({
    queryKey: ["rolodex-discover", searchTerm, categoryFilter],
    queryFn: async () => {
      let q = (supabase as any)
        .from("rolodex_recommendations")
        .select("*")
        .neq("curator_id", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(50);
      if (categoryFilter && categoryFilter !== "all") q = q.eq("category", categoryFilter);
      if (searchTerm) q = q.ilike("title", `%${searchTerm}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as RolodexRecommendation[];
    },
    enabled: !isWildfireTour,
  });

  const subsQuery = useQuery({
    queryKey: ["rolodex-my-subs", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rolodex_subscriptions")
        .select("curator_id")
        .eq("subscriber_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((s: any) => s.curator_id as string));
    },
    enabled: !!user?.id && !isWildfireTour,
  });

  /* ─── Mutations ─── */

  const addRecMutation = useMutation({
    mutationFn: async (rec: { title: string; description: string; category: string; external_url?: string; tags: string[] }) => {
      const { error } = await (supabase as any)
        .from("rolodex_recommendations")
        .insert({ ...rec, curator_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolodex-my-recs"] });
      setAddDialogOpen(false);
      setNewRec({ title: "", description: "", category: "", external_url: "", tags: "" });
    },
  });

  const deleteRecMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("rolodex_recommendations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rolodex-my-recs"] }),
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (conn: { partner_id: string; level: number; expires_at?: string }) => {
      const { error } = await (supabase as any)
        .from("rolodex_connections")
        .insert({ ...conn, member_id: user!.id, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolodex-connections"] });
      setInviteDialogOpen(false);
      setNewConn({ partnerId: "", level: "1", durationDays: "" });
    },
  });

  const respondConnectionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "cancelled" }) => {
      const { error } = await (supabase as any)
        .from("rolodex_connections")
        .update({ status, started_at: status === "active" ? new Date().toISOString() : undefined })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rolodex-connections"] }),
  });

  const toggleSubMutation = useMutation({
    mutationFn: async ({ curatorId, isSubscribed }: { curatorId: string; isSubscribed: boolean }) => {
      if (isSubscribed) {
        const { error } = await (supabase as any)
          .from("rolodex_subscriptions")
          .delete()
          .eq("subscriber_id", user!.id)
          .eq("curator_id", curatorId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("rolodex_subscriptions")
          .insert({ subscriber_id: user!.id, curator_id: curatorId });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rolodex-my-subs"] }),
  });

  /* ─── Derived data ─── */

  const myRecs = isWildfireTour ? WILDFIRE_RECOMMENDATIONS : (myRecsQuery.data ?? []);
  const allConnections = isWildfireTour
    ? { initiated: WILDFIRE_CONNECTIONS, received: [] as RolodexConnection[] }
    : (connectionsQuery.data ?? { initiated: [], received: [] });
  const allConns = [...allConnections.initiated, ...allConnections.received];
  const discoverRecs = isWildfireTour ? WILDFIRE_RECOMMENDATIONS.slice(0, 2) : (discoverQuery.data ?? []);
  const subscribedCurators = subsQuery.data ?? new Set<string>();

  const pendingIncoming = allConnections.received.filter((c) => c.status === "pending");
  const pendingOutgoing = allConnections.initiated.filter((c) => c.status === "pending");

  const connectionsByLevel = useMemo(() => {
    const grouped: Record<number, RolodexConnection[]> = { 1: [], 2: [], 3: [], 4: [] };
    allConns.filter((c) => c.status === "active").forEach((c) => {
      (grouped[c.level] ||= []).push(c);
    });
    return grouped;
  }, [allConns]);

  /* ─── Handlers ─── */

  const handleAddRec = () => {
    if (!newRec.title || !newRec.category) return;
    addRecMutation.mutate({
      title: newRec.title,
      description: newRec.description,
      category: newRec.category,
      external_url: newRec.external_url || undefined,
      tags: newRec.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  const handleInvite = () => {
    if (!newConn.partnerId) return;
    const expiresAt = newConn.durationDays
      ? new Date(Date.now() + Number(newConn.durationDays) * 86400000).toISOString()
      : undefined;
    createConnectionMutation.mutate({
      partner_id: newConn.partnerId,
      level: Number(newConn.level),
      expires_at: expiresAt,
    });
  };

  /* ─── Render ─── */

  return (
    <PortalPageLayout
      maxWidth="sm"
      xrayId="rolodex"
      title="The Rolodex"
      subtitle="Curate what you trust. Connect with who you trust."
    >
      <Tabs defaultValue="my-rolodex" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-rolodex">My Rolodex</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: MY ROLODEX ═══ */}
        <TabsContent value="my-rolodex" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Recommendations</h2>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Recommendation</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label htmlFor="rec-title">Title *</Label>
                    <Input id="rec-title" value={newRec.title} onChange={(e) => setNewRec((r) => ({ ...r, title: e.target.value }))} placeholder="e.g. Affordable 1.5HP Water Chiller" />
                  </div>
                  <div>
                    <Label htmlFor="rec-desc">Description</Label>
                    <Textarea id="rec-desc" value={newRec.description} onChange={(e) => setNewRec((r) => ({ ...r, description: e.target.value }))} placeholder="Why do you recommend this?" rows={3} />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select value={newRec.category} onValueChange={(v) => setNewRec((r) => ({ ...r, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rec-url">External URL</Label>
                    <Input id="rec-url" value={newRec.external_url} onChange={(e) => setNewRec((r) => ({ ...r, external_url: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <Label htmlFor="rec-tags">Tags (comma-separated)</Label>
                    <Input id="rec-tags" value={newRec.tags} onChange={(e) => setNewRec((r) => ({ ...r, tags: e.target.value }))} placeholder="cold plunge, equipment, tested" />
                  </div>
                  <Button onClick={handleAddRec} disabled={!newRec.title || !newRec.category} className="w-full">
                    Add Recommendation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {myRecs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Your Rolodex is empty.</p>
                <p className="text-sm mt-1">Start curating what you trust — products, people, and places that others should know about.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myRecs.map((rec, index) => (
                <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-semibold">{rec.title}</CardTitle>
                          {rec.description && (
                            <CardDescription className="mt-1 line-clamp-2">{rec.description}</CardDescription>
                          )}
                        </div>
                        {rec.external_url && (
                          <a href={rec.external_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary ml-2">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className={CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.other}>{rec.category}</Badge>
                        {rec.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs"><Tag className="w-3 h-3 mr-0.5" />{tag}</Badge>
                        ))}
                      </div>
                      {!isWildfireTour && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-destructive hover:text-destructive"
                          onClick={() => deleteRecMutation.mutate(rec.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ TAB 2: CONNECTIONS ═══ */}
        <TabsContent value="connections" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Connections</h2>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><UserPlus className="w-4 h-4" /> Invite</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Connection</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    {/* TODO: Replace with member search component when available */}
                    <Label htmlFor="conn-partner">Partner Member ID</Label>
                    <Input id="conn-partner" value={newConn.partnerId} onChange={(e) => setNewConn((c) => ({ ...c, partnerId: e.target.value }))} placeholder="Paste member UUID" />
                  </div>
                  <div>
                    <Label>Connection Level</Label>
                    <Select value={newConn.level} onValueChange={(v) => setNewConn((c) => ({ ...c, level: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LEVEL_CONFIG.map((lc) => (
                          <SelectItem key={lc.level} value={String(lc.level)}>
                            L{lc.level}: {lc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="conn-days">Duration (days, leave blank for permanent)</Label>
                    <Input id="conn-days" type="number" value={newConn.durationDays} onChange={(e) => setNewConn((c) => ({ ...c, durationDays: e.target.value }))} placeholder="Optional" />
                  </div>
                  <Button onClick={handleInvite} disabled={!newConn.partnerId} className="w-full">
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pending invitations */}
          {(pendingIncoming.length > 0 || pendingOutgoing.length > 0) && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingIncoming.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div>
                      <span className="text-sm font-medium">{conn.member_id.slice(0, 8)}...</span>
                      <Badge className="ml-2" variant="outline">L{conn.level}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => respondConnectionMutation.mutate({ id: conn.id, status: "active" })}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => respondConnectionMutation.mutate({ id: conn.id, status: "cancelled" })}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingOutgoing.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                    <div>
                      <span className="text-sm text-muted-foreground">{conn.partner_id.slice(0, 8)}...</span>
                      <Badge className="ml-2" variant="outline">L{conn.level}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Pending...</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Connections by level */}
          {LEVEL_CONFIG.map((lc) => {
            const conns = connectionsByLevel[lc.level] || [];
            const Icon = lc.icon;
            return (
              <div key={lc.level} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">L{lc.level}: {lc.name}</span>
                  <Badge className={lc.badgeClass}>{conns.length}</Badge>
                </div>
                {conns.length === 0 ? (
                  <p className="text-xs text-muted-foreground pl-6">No active {lc.name} connections.</p>
                ) : (
                  <div className="space-y-1 pl-6">
                    {conns.map((conn, idx) => {
                      const partnerId = conn.member_id === user?.id ? conn.partner_id : conn.member_id;
                      return (
                        <motion.div key={conn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm">{partnerId.slice(0, 8)}...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={STATUS_COLORS[conn.status]}>{conn.status}</Badge>
                            {conn.expires_at && (
                              <span className="text-xs text-muted-foreground">
                                expires {new Date(conn.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </TabsContent>

        {/* ═══ TAB 3: DISCOVER ═══ */}
        <TabsContent value="discover" className="mt-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recommendations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {discoverRecs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No recommendations found.</p>
                <p className="text-sm mt-1">Try adjusting your search or category filter.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {discoverRecs.map((rec, index) => {
                const isSubscribed = subscribedCurators.has(rec.curator_id);
                return (
                  <motion.div key={rec.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-semibold">{rec.title}</CardTitle>
                            {rec.description && (
                              <CardDescription className="mt-1 line-clamp-2">{rec.description}</CardDescription>
                            )}
                          </div>
                          {rec.external_url && (
                            <a href={rec.external_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary ml-2">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <Badge className={CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.other}>{rec.category}</Badge>
                          {rec.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs"><Tag className="w-3 h-3 mr-0.5" />{tag}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            by {rec.curator_id.slice(0, 8)}...
                          </span>
                          <Button
                            size="sm"
                            variant={isSubscribed ? "outline" : "default"}
                            className="gap-1 text-xs"
                            onClick={() => !isWildfireTour && toggleSubMutation.mutate({ curatorId: rec.curator_id, isSubscribed })}
                          >
                            <Star className="w-3 h-3" />
                            {isSubscribed ? "Subscribed" : "Subscribe"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
