/**
 * PETITIONS — Member-Proposed, Signature-Driven
 * ===============================================
 * Members propose petitions within arenas. Petitions collect signatures.
 * When they hit 500+ signatures AND pass civility review, they can
 * be promoted to Town Hall (the main governance board).
 *
 * Petition types: general, legislation, initiative, policy
 * Flow: collecting → threshold_met → civility_review → town_hall OR rejected
 */

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Megaphone, PenTool, ThumbsUp, Clock, Check,
  FileText, Users, ArrowLeft, Target, Scale,
  AlertTriangle, CheckCircle, XCircle, Landmark,
} from "lucide-react";
import { toast } from "sonner";

interface Petition {
  id: string;
  arena_id: string;
  author_id: string;
  title: string;
  description: string;
  petition_type: string;
  target_entity: string | null;
  signature_threshold: number;
  current_signatures: number;
  status: string;
  civility_review_passed: boolean | null;
  created_at: string;
  expires_at: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  collecting: { color: "bg-blue-500/10 text-blue-600", label: "Collecting Signatures", icon: PenTool },
  threshold_met: { color: "bg-amber-500/10 text-amber-600", label: "Threshold Met", icon: CheckCircle },
  civility_review: { color: "bg-purple-500/10 text-purple-600", label: "Civility Review", icon: Scale },
  town_hall: { color: "bg-green-500/10 text-green-600", label: "Promoted to Town Hall", icon: Landmark },
  rejected: { color: "bg-red-500/10 text-red-600", label: "Rejected", icon: XCircle },
  expired: { color: "bg-gray-500/10 text-gray-600", label: "Expired", icon: Clock },
};

const TYPE_LABELS: Record<string, string> = {
  general: "General Petition",
  legislation: "Legislation Support",
  initiative: "Initiative Proposal",
  policy: "Policy Change",
};

export default function Petitions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const arenaFilter = searchParams.get("arena");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("general");
  const [newTarget, setNewTarget] = useState("");

  // Load arenas for reference
  const { data: arenas } = useQuery({
    queryKey: ["arenas"],
    queryFn: async () => {
      const { data } = await supabase.from("arenas").select("*").eq("is_active", true);
      return data || [];
    },
  });

  // Load petitions
  const { data: petitions, isLoading } = useQuery({
    queryKey: ["all-petitions", arenaFilter],
    queryFn: async () => {
      let query = supabase
        .from("petitions")
        .select("*")
        .order("current_signatures", { ascending: false });

      if (arenaFilter) {
        const arena = arenas?.find((a: any) => a.slug === arenaFilter);
        if (arena) query = query.eq("arena_id", arena.id);
      }

      const { data } = await query;
      return (data || []) as Petition[];
    },
    enabled: !arenaFilter || (arenas && arenas.length > 0),
  });

  // Check which petitions user already signed
  const { data: mySigs } = useQuery({
    queryKey: ["my-signatures", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("petition_signatures")
        .select("petition_id")
        .eq("user_id", user.id);
      return (data || []).map((s: any) => s.petition_id);
    },
    enabled: !!user,
  });

  // Sign petition
  const signPetition = useMutation({
    mutationFn: async (petitionId: string) => {
      if (!user) throw new Error("Log in to sign petitions");
      const { error } = await supabase.from("petition_signatures").insert({
        petition_id: petitionId,
        user_id: user.id,
      });
      if (error) throw error;

      // Increment signature count
      const petition = petitions?.find((p) => p.id === petitionId);
      if (petition) {
        const newCount = petition.current_signatures + 1;
        const newStatus = newCount >= petition.signature_threshold ? "threshold_met" : petition.status;
        await supabase
          .from("petitions")
          .update({ current_signatures: newCount, status: newStatus })
          .eq("id", petitionId);
      }
    },
    onSuccess: () => {
      toast.success("Signature added!");
      queryClient.invalidateQueries({ queryKey: ["all-petitions"] });
      queryClient.invalidateQueries({ queryKey: ["my-signatures"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to sign"),
  });

  // Create petition
  const createPetition = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Log in to create petitions");
      if (!newTitle || !newDescription) throw new Error("Title and description required");

      // Default to first arena if no filter
      const defaultArena = arenaFilter
        ? arenas?.find((a: any) => a.slug === arenaFilter)
        : arenas?.[0];

      if (!defaultArena) throw new Error("No arena available");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // 90-day expiry

      const { error } = await supabase.from("petitions").insert({
        arena_id: defaultArena.id,
        author_id: user.id,
        title: newTitle,
        description: newDescription,
        petition_type: newType,
        target_entity: newTarget || null,
        signature_threshold: 500,
        current_signatures: 1, // Author signs automatically
        status: "collecting",
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Petition created! Share it to collect signatures.");
      setCreateDialogOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewType("general");
      setNewTarget("");
      queryClient.invalidateQueries({ queryKey: ["all-petitions"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create petition"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/arenas")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Megaphone className="w-7 h-7 text-amber-500" />
              Petitions
            </h1>
            <p className="text-muted-foreground">
              Propose. Collect signatures. Reach Town Hall.
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <PenTool className="w-4 h-4" />
          New Petition
        </Button>
      </div>

      {/* Town Hall Flow */}
      <Card className="border-amber-500/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <PenTool className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="font-medium">Create</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="font-medium">500+ Signatures</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-center">
              <Scale className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <p className="font-medium">Civility Review</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="text-center">
              <Landmark className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="font-medium">Town Hall</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{petitions?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Total Petitions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{petitions?.filter((p) => p.status === "collecting").length || 0}</div>
            <div className="text-xs text-muted-foreground">Collecting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{petitions?.filter((p) => p.status === "threshold_met" || p.status === "town_hall").length || 0}</div>
            <div className="text-xs text-muted-foreground">Reached Threshold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold">{petitions?.filter((p) => p.status === "town_hall").length || 0}</div>
            <div className="text-xs text-muted-foreground">In Town Hall</div>
          </CardContent>
        </Card>
      </div>

      {/* Petition List */}
      <div className="space-y-4">
        {petitions?.map((petition) => {
          const config = STATUS_CONFIG[petition.status] || STATUS_CONFIG.collecting;
          const Icon = config.icon;
          const hasSigned = mySigs?.includes(petition.id);
          const progress = (petition.current_signatures / petition.signature_threshold) * 100;

          return (
            <Card key={petition.id} className={petition.status === "town_hall" ? "border-green-500/20" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{petition.title}</h3>
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[petition.petition_type] || petition.petition_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{petition.description}</p>
                    {petition.target_entity && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Directed at: {petition.target_entity}
                      </p>
                    )}
                  </div>
                  <Badge className={config.color}>
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{petition.current_signatures} / {petition.signature_threshold} signatures</span>
                    <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(petition.created_at).toLocaleDateString()}
                    {petition.expires_at && ` · Expires ${new Date(petition.expires_at).toLocaleDateString()}`}
                  </span>
                  {petition.status === "collecting" && user && (
                    <Button
                      size="sm"
                      variant={hasSigned ? "outline" : "default"}
                      disabled={hasSigned || signPetition.isPending}
                      onClick={() => signPetition.mutate(petition.id)}
                      className="gap-2"
                    >
                      {hasSigned ? (
                        <><Check className="w-4 h-4" /> Signed</>
                      ) : (
                        <><ThumbsUp className="w-4 h-4" /> Sign</>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!petitions || petitions.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No petitions yet. Be the first to propose one.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a Petition</DialogTitle>
            <DialogDescription>
              Propose something that matters. Get 500 signatures and pass civility review
              to promote your petition to Town Hall.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What are you petitioning for?"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explain your petition clearly. Policy-focused wording is required for Town Hall promotion."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Petition</SelectItem>
                  <SelectItem value="legislation">Legislation Support</SelectItem>
                  <SelectItem value="initiative">Initiative Proposal</SelectItem>
                  <SelectItem value="policy">Policy Change</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Directed At (optional)</label>
              <Input
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g., Congress, Local School Board, The 300..."
                className="mt-1"
              />
            </div>

            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs">
              <p className="font-medium text-amber-600 mb-1">Civility Rules for Town Hall Promotion:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>· Policy-focused wording required</li>
                <li>· No inflammatory language</li>
                <li>· "Support legislation X" is allowed</li>
                <li>· "X religion is wrong" is NOT allowed</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createPetition.mutate()}
              disabled={!newTitle || !newDescription || createPetition.isPending}
              className="gap-2"
            >
              <Megaphone className="w-4 h-4" />
              Create Petition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
