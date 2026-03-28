import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/* ───── types ───── */

export type ResourceType =
  | "tutorial" | "tool" | "example" | "documentation"
  | "video" | "podcast" | "book" | "other";

export type ResourceStatus = "pending" | "community" | "recommended" | "featured" | "hidden";

export interface CephasResource {
  id: string;
  article_slug: string;
  submitted_by: string;
  url: string;
  title: string;
  description: string | null;
  resource_type: ResourceType | null;
  upvotes: number;
  downvotes: number;
  flags: number;
  status: ResourceStatus;
  marks_earned: number;
  created_at: string;
  my_vote?: number | null;
}

export type VoteValue = -1 | 0 | 1;

export interface KnowledgeEdge {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  edge_type: string;
  auto_generated: boolean;
  created_at: string;
}

/* ───── helpers ───── */

function statusForCounts(up: number, flags: number): ResourceStatus {
  if (up >= 25 && flags === 0) return "featured";
  if (up >= 10) return "recommended";
  if (up >= 3) return "community";
  return "pending";
}

/* ───── resource hooks ───── */

export function useResourceLinks(articleSlug: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["cephas-resources", articleSlug],
    enabled: !!articleSlug,
    queryFn: async () => {
      const { data: resources, error } = await supabase
        .from("cephas_resource_links" as any)
        .select("*")
        .eq("article_slug", articleSlug!)
        .in("status", ["community", "recommended", "featured"])
        .order("upvotes", { ascending: false });
      if (error) throw error;

      let myVotes: Record<string, number> = {};
      if (user) {
        const ids = (resources as any[]).map((r: any) => r.id);
        if (ids.length) {
          const { data: votes } = await supabase
            .from("cephas_resource_votes" as any)
            .select("resource_id, vote")
            .eq("voter_id", user.id)
            .in("resource_id", ids);
          for (const v of (votes ?? []) as any[]) {
            myVotes[v.resource_id] = v.vote;
          }
        }
      }

      return (resources as any[]).map((r: any) => ({
        ...r,
        my_vote: myVotes[r.id] ?? null,
      })) as CephasResource[];
    },
  });
}

export function useSubmitResource() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      article_slug: string;
      url: string;
      title: string;
      description?: string;
      resource_type?: ResourceType;
    }) => {
      if (!user) throw new Error("Must be signed in");
      const { data, error } = await supabase
        .from("cephas_resource_links" as any)
        .insert({
          article_slug: input.article_slug,
          submitted_by: user.id,
          url: input.url,
          title: input.title,
          description: input.description ?? null,
          resource_type: input.resource_type ?? "other",
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["cephas-resources", vars.article_slug] });
    },
  });
}

export function useVoteOnResource() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { resourceId: string; articleSlug: string; vote: VoteValue }) => {
      if (!user) throw new Error("Must be signed in");

      const { data: existing } = await supabase
        .from("cephas_resource_votes" as any)
        .select("id, vote")
        .eq("resource_id", input.resourceId)
        .eq("voter_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cephas_resource_votes" as any)
          .update({ vote: input.vote } as any)
          .eq("id", (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cephas_resource_votes" as any)
          .insert({
            resource_id: input.resourceId,
            voter_id: user.id,
            vote: input.vote,
          } as any);
        if (error) throw error;
      }

      const oldVote = existing ? (existing as any).vote as number : 0;
      const upDelta = (input.vote === 1 ? 1 : 0) - (oldVote === 1 ? 1 : 0);
      const downDelta = (input.vote === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);
      const flagDelta = (input.vote === 0 ? 1 : 0) - (oldVote === 0 ? 1 : 0);

      const { data: resource } = await supabase
        .from("cephas_resource_links" as any)
        .select("upvotes, downvotes, flags")
        .eq("id", input.resourceId)
        .single();

      if (resource) {
        const r = resource as any;
        const newUp = (r.upvotes ?? 0) + upDelta;
        const newDown = (r.downvotes ?? 0) + downDelta;
        const newFlags = (r.flags ?? 0) + flagDelta;
        const newStatus = newFlags >= 3 ? "hidden" : statusForCounts(newUp, newFlags);
        await supabase
          .from("cephas_resource_links" as any)
          .update({
            upvotes: newUp,
            downvotes: newDown,
            flags: newFlags,
            status: newStatus,
          } as any)
          .eq("id", input.resourceId);
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["cephas-resources", vars.articleSlug] });
    },
  });
}

/* ───── knowledge graph hooks ───── */

export function useKnowledgeLinks(sourceType: string | undefined, sourceId: string | undefined) {
  return useQuery({
    queryKey: ["knowledge-edges", sourceType, sourceId],
    enabled: !!sourceType && !!sourceId,
    queryFn: async () => {
      const { data: outgoing, error: e1 } = await supabase
        .from("knowledge_graph_edges" as any)
        .select("*")
        .eq("source_type", sourceType!)
        .eq("source_id", sourceId!);
      if (e1) throw e1;

      const { data: incoming, error: e2 } = await supabase
        .from("knowledge_graph_edges" as any)
        .select("*")
        .eq("target_type", sourceType!)
        .eq("target_id", sourceId!);
      if (e2) throw e2;

      return [...(outgoing ?? []), ...(incoming ?? [])] as KnowledgeEdge[];
    },
  });
}

export function useRelatedFeatures(articleSlug: string | undefined) {
  return useQuery({
    queryKey: ["related-features", articleSlug],
    enabled: !!articleSlug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_graph_edges" as any)
        .select("*")
        .eq("target_type", "cephas_article")
        .eq("target_id", articleSlug!);
      if (error) throw error;
      return (data ?? []).filter((e: any) => e.source_type === "platform_feature") as KnowledgeEdge[];
    },
  });
}

export function useRelatedArticles(featurePath: string | undefined) {
  return useQuery({
    queryKey: ["related-articles", featurePath],
    enabled: !!featurePath,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_graph_edges" as any)
        .select("*")
        .eq("source_type", "platform_feature")
        .eq("source_id", featurePath!);
      if (error) throw error;
      return (data ?? []).filter((e: any) => e.target_type === "cephas_article") as KnowledgeEdge[];
    },
  });
}
