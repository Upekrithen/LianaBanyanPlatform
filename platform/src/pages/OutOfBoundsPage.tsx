import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Megaphone, Plus, Send, Copy, Check, ExternalLink,
  Trash2, Settings, FileText, Globe, Rocket, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OobPlug {
  id: string;
  user_id: string;
  platform: string;
  platform_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

interface OobPost {
  id: string;
  user_id: string;
  title: string;
  body: string;
  format_overrides: Record<string, unknown>;
  target_plugs: string[];
  status: string;
  post_results: Record<string, unknown>;
  created_at: string;
}

const PLATFORMS = [
  { value: "twitter", label: "Twitter/X", icon: "🐦", configFields: [], autoPost: true },
  { value: "bluesky", label: "Bluesky", icon: "🦋", configFields: [], autoPost: true },
  { value: "linkedin", label: "LinkedIn", icon: "💼", configFields: [], autoPost: true },
  { value: "reddit", label: "Reddit", icon: "🔴", configFields: ["subreddit"], autoPost: true },
  { value: "discord", label: "Discord", icon: "💜", configFields: ["webhook_url"], autoPost: true },
  { value: "pnyx", label: "LB Pnyx", icon: "🏛️", configFields: ["room_name"], autoPost: false },
  { value: "substack", label: "Substack", icon: "📧", configFields: ["publication_name"], autoPost: false },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500",
  posted: "bg-green-500",
  partial: "bg-amber-500",
  failed: "bg-red-500",
};

function PlugManager({
  plugs,
  onCreatePlug,
  onDeletePlug,
}: {
  plugs: OobPlug[];
  onCreatePlug: (platform: string, config: Record<string, string>) => void;
  onDeletePlug: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newPlatform, setNewPlatform] = useState("reddit");
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const selectedPlatformInfo = PLATFORMS.find((p) => p.value === newPlatform);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Plugs (Posting Targets)</h3>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Plug</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Posting Target</DialogTitle>
              <DialogDescription>
                Configure where to post. Phase 1: manual copy-paste. Phase 2: auto-post via API.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={newPlatform} onValueChange={(v) => { setNewPlatform(v); setConfigValues({}); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.icon} {p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlatformInfo?.configFields.map((field) => (
                <Input
                  key={field}
                  placeholder={field.replace(/_/g, " ")}
                  value={configValues[field] || ""}
                  onChange={(e) => setConfigValues({ ...configValues, [field]: e.target.value })}
                />
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => {
                onCreatePlug(newPlatform, configValues);
                setShowAdd(false);
                setConfigValues({});
              }}>
                Add Plug
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {plugs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No plugs configured. Add one to start posting.</p>
      ) : (
        <div className="grid gap-2">
          {plugs.map((plug) => {
            const pInfo = PLATFORMS.find((p) => p.value === plug.platform);
            return (
              <div key={plug.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{pInfo?.icon}</span>
                  <div>
                    <span className="font-medium">{pInfo?.label || plug.platform}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {Object.values(plug.platform_config).filter(Boolean).join(" · ")}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDeletePlug(plug.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OutOfBoundsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("compose");
  const [editingPost, setEditingPost] = useState<OobPost | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedPlugs, setSelectedPlugs] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: plugs = [] } = useQuery({
    queryKey: ["oob-plugs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oob_plugs" as never)
        .select("*")
        .order("created_at", { ascending: false }) as { data: OobPlug[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as OobPlug[];
    },
    enabled: !!user,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["oob-posts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oob_posts" as never)
        .select("*")
        .order("created_at", { ascending: false }) as { data: OobPost[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as OobPost[];
    },
    enabled: !!user,
  });

  const createPlugMutation = useMutation({
    mutationFn: async ({ platform, config }: { platform: string; config: Record<string, string> }) => {
      const { error } = await supabase
        .from("oob_plugs" as never)
        .insert({ user_id: user!.id, platform, platform_config: config } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oob-plugs"] });
      toast.success("Plug added");
    },
  });

  const deletePlugMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("oob_plugs" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oob-plugs"] });
      toast.success("Plug removed");
    },
  });

  const savePostMutation = useMutation({
    mutationFn: async () => {
      if (editingPost) {
        const { error } = await supabase
          .from("oob_posts" as never)
          .update({ title, body, target_plugs: selectedPlugs } as never)
          .eq("id", editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("oob_posts" as never)
          .insert({
            user_id: user!.id,
            title,
            body,
            target_plugs: selectedPlugs,
            status: "draft",
          } as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oob-posts"] });
      resetForm();
      toast.success(editingPost ? "Post updated" : "Draft saved");
    },
  });

  const markPostedMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("oob_posts" as never)
        .update({ status: "posted" } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oob-posts"] });
      toast.success("Marked as posted");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("oob_posts" as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oob-posts"] });
      toast.success("Post deleted");
    },
  });

  const postNowMutation = useMutation({
    mutationFn: async (post: OobPost) => {
      const targetPlugIds = post.target_plugs || [];
      if (targetPlugIds.length === 0) throw new Error("No target plugs selected");

      const targetPlugRecords = plugs.filter((p) => targetPlugIds.includes(p.id));
      if (targetPlugRecords.length === 0) throw new Error("Selected plugs not found");

      const results: Record<string, { success: boolean; url?: string; error?: string }> = {};
      const posted: string[] = [];
      const copied: string[] = [];
      const failed: string[] = [];
      const fullText = `${post.title}\n\n${post.body}`;

      for (const plug of targetPlugRecords) {
        const pInfo = PLATFORMS.find((p) => p.value === plug.platform);

        if (plug.platform === "substack") {
          await navigator.clipboard.writeText(fullText);
          results[plug.platform] = { success: true };
          copied.push(pInfo?.label || plug.platform);
          continue;
        }

        if (plug.platform === "pnyx") {
          results[plug.platform] = { success: true };
          posted.push("Pnyx (internal)");
          continue;
        }

        if (!pInfo?.autoPost) {
          await navigator.clipboard.writeText(fullText);
          results[plug.platform] = { success: true };
          copied.push(pInfo?.label || plug.platform);
          continue;
        }

        try {
          const { data: session } = await supabase.auth.getSession();
          const token = session?.session?.access_token;
          if (!token) throw new Error("Not authenticated");

          const payload: Record<string, string> = {
            platform: plug.platform,
            text: fullText,
          };

          if (plug.platform === "discord" && plug.platform_config?.webhook_url) {
            payload.accountId = "";
          }

          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || "https://bzmicoleqgfiblniojkz.supabase.co"}/functions/v1/social-post`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          const resData = await res.json();
          results[plug.platform] = {
            success: resData.success,
            url: resData.postUrl,
            error: resData.error,
          };

          if (resData.success) {
            posted.push(pInfo?.label || plug.platform);
          } else {
            failed.push(`${pInfo?.label}: ${resData.error}`);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          results[plug.platform] = { success: false, error: msg };
          failed.push(`${pInfo?.label}: ${msg}`);
        }
      }

      const newStatus = failed.length === 0
        ? "posted"
        : posted.length > 0
          ? "partial"
          : "failed";

      await supabase
        .from("oob_posts" as never)
        .update({ status: newStatus, post_results: results } as never)
        .eq("id", post.id);

      return { posted, copied, failed };
    },
    onSuccess: ({ posted, copied, failed }) => {
      queryClient.invalidateQueries({ queryKey: ["oob-posts"] });
      const parts: string[] = [];
      if (posted.length) parts.push(`Posted to ${posted.join(", ")}`);
      if (copied.length) parts.push(`Copied for ${copied.join(", ")}`);
      if (failed.length) parts.push(`Failed: ${failed.join("; ")}`);
      toast[failed.length ? "warning" : "success"](parts.join(". ") || "Done");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Dispatch failed");
    },
  });

  const resetForm = () => {
    setTitle("");
    setBody("");
    setSelectedPlugs([]);
    setEditingPost(null);
  };

  const loadPostForEdit = (post: OobPost) => {
    setTitle(post.title);
    setBody(post.body);
    setSelectedPlugs(post.target_plugs || []);
    setEditingPost(post);
    setActiveTab("compose");
  };

  const copyToClipboard = async (post: OobPost) => {
    const text = `${post.title}\n\n${post.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(post.id);
    toast.success("Copied to clipboard — paste into target platform");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePlug = (plugId: string) => {
    setSelectedPlugs((prev) =>
      prev.includes(plugId) ? prev.filter((id) => id !== plugId) : [...prev, plugId]
    );
  };

  return (
    <PortalPageLayout maxWidth="lg" xrayId="out-of-bounds">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-primary" />
            Out of Bounds
          </h1>
          <p className="text-muted-foreground mt-1">
            Compose once. Post everywhere. Track responses. Reach beyond the platform boundary.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="compose" className="flex items-center gap-1">
              <FileText className="w-4 h-4" /> Compose
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-1">
              <Send className="w-4 h-4" /> Posts
              {posts.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{posts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="plugs" className="flex items-center gap-1">
              <Settings className="w-4 h-4" /> Plugs
              {plugs.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">{plugs.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{editingPost ? "Edit Post" : "Compose New Post"}</CardTitle>
                <CardDescription>
                  Write your content. Select target plugs. Save as draft, then copy-paste to each platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Post body (markdown supported)"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />

                {plugs.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Plugs</label>
                    <div className="flex flex-wrap gap-3">
                      {plugs.map((plug) => {
                        const pInfo = PLATFORMS.find((p) => p.value === plug.platform);
                        const checked = selectedPlugs.includes(plug.id);
                        return (
                          <label
                            key={plug.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors",
                              checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                            )}
                          >
                            <Checkbox checked={checked} onCheckedChange={() => togglePlug(plug.id)} />
                            <span>{pInfo?.icon} {pInfo?.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 justify-end">
                  {editingPost && (
                    <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                  )}
                  <Button
                    onClick={() => savePostMutation.mutate()}
                    disabled={!title.trim() || !body.trim() || savePostMutation.isPending}
                  >
                    {editingPost ? "Update" : "Save Draft"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Send className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No posts yet. Compose one first.</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription>
                          {new Date(post.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={cn("text-white", STATUS_COLORS[post.status] || "bg-gray-500")}>
                        {post.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 mb-3">
                      {post.body}
                    </p>
                    {post.target_plugs?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.target_plugs.map((plugId) => {
                          const plug = plugs.find((p) => p.id === plugId);
                          const pInfo = plug ? PLATFORMS.find((p) => p.value === plug.platform) : null;
                          return pInfo ? (
                            <Badge key={plugId} variant="outline" className="text-xs">
                              {pInfo.icon} {pInfo.label}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.status === "draft" && post.target_plugs?.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => postNowMutation.mutate(post)}
                          disabled={postNowMutation.isPending}
                        >
                          {postNowMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Rocket className="w-4 h-4 mr-1" />
                          )}
                          Post Now
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(post)}>
                        {copiedId === post.id ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                        {copiedId === post.id ? "Copied" : "Copy"}
                      </Button>
                      {post.status === "draft" && (
                        <Button size="sm" variant="outline" onClick={() => markPostedMutation.mutate(post.id)}>
                          <ExternalLink className="w-4 h-4 mr-1" /> Mark Posted
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => loadPostForEdit(post)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => deletePostMutation.mutate(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {post.post_results && Object.keys(post.post_results).length > 0 && (
                      <div className="mt-3 text-xs space-y-1 border-t pt-2">
                        {Object.entries(post.post_results).map(([platform, result]) => {
                          const r = result as { success?: boolean; url?: string; error?: string };
                          const pInfo = PLATFORMS.find((p) => p.value === platform);
                          return (
                            <div key={platform} className="flex items-center gap-2">
                              <span>{pInfo?.icon || "📡"}</span>
                              <span className="font-medium">{pInfo?.label || platform}</span>
                              {r.success ? (
                                <>
                                  <Badge variant="outline" className="text-green-600 border-green-300 text-[10px]">OK</Badge>
                                  {r.url && (
                                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                      View
                                    </a>
                                  )}
                                </>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-300 text-[10px]">
                                  {r.error || "Failed"}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="plugs" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <PlugManager
                  plugs={plugs}
                  onCreatePlug={(platform, config) => createPlugMutation.mutate({ platform, config })}
                  onDeletePlug={(id) => deletePlugMutation.mutate(id)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}
