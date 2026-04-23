/**
 * useCathedral — shared hooks for Member Cathedral pages (K438a)
 * ==============================================================
 * Provisions the member's Cathedral on first visit (idempotent server-side
 * via cathedral.ensure_member_cathedral RPC) and exposes React Query hooks
 * for the rest of the routes.
 *
 * #2268 Claim 1(a): per-member Cathedral root + starter Scribes are created
 * by the RPC; pages can assume both exist after the ensure mutation resolves.
 */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  cathedral,
  type CathedralHealthRow,
  type MemberScribeRow,
  type ScribeEntryRow,
  type ShareLevel,
} from "@/lib/cathedral-client";

const CATHEDRAL_QK = {
  health: (memberId: string) => ["cathedral", "health", memberId] as const,
  scribes: (memberId: string) => ["cathedral", "scribes", memberId] as const,
  scribe: (scribeId: string) => ["cathedral", "scribe", scribeId] as const,
  entries: (scribeId: string) => ["cathedral", "entries", scribeId] as const,
  recentEntries: (memberId: string) => ["cathedral", "recent-entries", memberId] as const,
};

/**
 * Auto-provision the member's Cathedral on mount. Safe to call from every
 * Cathedral page; the RPC is idempotent server-side.
 */
export function useEnsureCathedral(professionalDomain?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;
    void cathedral()
      .rpc("ensure_member_cathedral", {
        p_member_id: user.id,
        p_professional_domain: professionalDomain ?? null,
      })
      .then(() => {
        qc.invalidateQueries({ queryKey: ["cathedral"] });
      });
  }, [user?.id, professionalDomain, qc]);
}

export function useCathedralHealth() {
  const { user } = useAuth();
  return useQuery<CathedralHealthRow | null>({
    queryKey: CATHEDRAL_QK.health(user?.id ?? "anon"),
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await cathedral()
        .from("member_cathedral_health" as never)
        .select("*")
        .eq("member_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as CathedralHealthRow) ?? null;
    },
  });
}

export function useMemberScribes() {
  const { user } = useAuth();
  return useQuery<MemberScribeRow[]>({
    queryKey: CATHEDRAL_QK.scribes(user?.id ?? "anon"),
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await cathedral()
        .from("member_scribes" as never)
        .select("*")
        .eq("member_id", user!.id)
        .order("active", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as MemberScribeRow[]) ?? [];
    },
  });
}

export function useMemberScribe(scribeId: string | undefined) {
  return useQuery<MemberScribeRow | null>({
    queryKey: CATHEDRAL_QK.scribe(scribeId ?? "missing"),
    enabled: !!scribeId,
    queryFn: async () => {
      const { data, error } = await cathedral()
        .from("member_scribes" as never)
        .select("*")
        .eq("scribe_id", scribeId!)
        .maybeSingle();
      if (error) throw error;
      return (data as MemberScribeRow) ?? null;
    },
  });
}

export function useScribeEntries(scribeId: string | undefined, page = 0, pageSize = 20) {
  return useQuery<{ entries: ScribeEntryRow[]; total: number }>({
    queryKey: [...CATHEDRAL_QK.entries(scribeId ?? "missing"), page, pageSize],
    enabled: !!scribeId,
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await cathedral()
        .from("scribe_entries" as never)
        .select("*", { count: "exact" })
        .eq("scribe_id", scribeId!)
        .order("ts", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return {
        entries: (data as ScribeEntryRow[]) ?? [],
        total: count ?? 0,
      };
    },
  });
}

export function useRecentEntriesAcrossCathedral(limit = 10) {
  const { user } = useAuth();
  return useQuery<ScribeEntryRow[]>({
    queryKey: [...CATHEDRAL_QK.recentEntries(user?.id ?? "anon"), limit],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await cathedral()
        .from("scribe_entries" as never)
        .select("*")
        .eq("member_id", user!.id)
        .order("ts", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as ScribeEntryRow[]) ?? [];
    },
  });
}

export function useCreateScribe() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      primary_field: string;
      adjacents: { level: number; field: string }[];
      keywords: string[];
      share_level?: ShareLevel;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await cathedral()
        .from("member_scribes" as never)
        .insert({
          member_id: user.id,
          name: input.name.trim(),
          primary_field: input.primary_field.trim(),
          adjacents: input.adjacents,
          keywords: input.keywords,
          share_level: input.share_level ?? "private",
          active: true,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as MemberScribeRow;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cathedral"] });
    },
  });
}

export function useAppendEntry(scribeId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      observation: string;
      source?: string;
      canonical_ref?: string | null;
      tags?: string[];
      session_id?: string | null;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await cathedral()
        .from("scribe_entries" as never)
        .insert({
          scribe_id: scribeId,
          member_id: user.id,
          observation: input.observation.trim(),
          source: input.source ?? "founder_dialogue",
          canonical_ref: input.canonical_ref ?? null,
          tags: input.tags ?? [],
          session_id: input.session_id ?? null,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as ScribeEntryRow;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cathedral", "entries", scribeId] });
      void qc.invalidateQueries({ queryKey: ["cathedral", "recent-entries"] });
      void qc.invalidateQueries({ queryKey: ["cathedral", "health"] });
    },
  });
}

export function useUpdateScribeShareLevel(scribeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { share_level: ShareLevel; share_target_id: string | null }) => {
      const { data, error } = await cathedral()
        .from("member_scribes" as never)
        .update({
          share_level: input.share_level,
          share_target_id: input.share_target_id,
        } as never)
        .eq("scribe_id", scribeId)
        .select()
        .single();
      if (error) throw error;
      return data as MemberScribeRow;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["cathedral"] });
    },
  });
}
