import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Tribe {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tribe_type: string;
  elder_id: string;
  leader_id: string;
  banner_url: string | null;
  icon_url: string | null;
  mascot_url: string | null;
  color_primary: string;
  color_secondary: string | null;
  theme_css: string | null;
  treasury_credits: number;
  treasury_reserve_pct: number;
  spending_threshold: number;
  family_table_id: string | null;
  member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface TribeMembership {
  id: string;
  tribe_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  tribe?: Tribe;
}

export function useTribes(search?: string) {
  return useQuery({
    queryKey: ["tribes", search],
    queryFn: async () => {
      let q = supabase
        .from("tribes" as any)
        .select("*")
        .eq("is_active", true)
        .order("member_count", { ascending: false });

      if (search) {
        q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Tribe[];
    },
  });
}

export function useTribe(slug: string | undefined) {
  return useQuery({
    queryKey: ["tribe", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("tribes" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Tribe;
    },
    enabled: !!slug,
  });
}

export function useMyTribes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-tribes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tribe_memberships" as any)
        .select("*, tribe:tribes(*)")
        .eq("member_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as TribeMembership[];
    },
    enabled: !!user,
  });
}

export function useTribeMembers(tribeId: string | undefined) {
  return useQuery({
    queryKey: ["tribe-members", tribeId],
    queryFn: async () => {
      if (!tribeId) return [];
      const { data, error } = await supabase
        .from("tribe_memberships" as any)
        .select("*, profile:profiles(id, full_name, avatar_url)")
        .eq("tribe_id", tribeId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!tribeId,
  });
}

export function useCreateTribe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      slug: string;
      description?: string;
      tribe_type: string;
      color_primary?: string;
      family_table_id?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("tribes" as any)
        .insert({
          ...input,
          leader_id: user.id,
          elder_id: user.id,
          status: "active",
          is_active: true,
          ledger_section_id: `tribe-${input.slug}`,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("tribe_memberships" as any).insert({
        tribe_id: data.id,
        member_id: user.id,
        role: "elder",
        is_active: true,
      });

      return data as Tribe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      queryClient.invalidateQueries({ queryKey: ["my-tribes"] });
    },
  });
}

export function useJoinTribe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tribeId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("tribe_memberships" as any)
        .insert({
          tribe_id: tribeId,
          member_id: user.id,
          role: "member",
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, tribeId) => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      queryClient.invalidateQueries({ queryKey: ["my-tribes"] });
      queryClient.invalidateQueries({ queryKey: ["tribe-members", tribeId] });
    },
  });
}

export function useLeaveTribe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tribeId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("tribe_memberships" as any)
        .update({ is_active: false })
        .eq("tribe_id", tribeId)
        .eq("member_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, tribeId) => {
      queryClient.invalidateQueries({ queryKey: ["tribes"] });
      queryClient.invalidateQueries({ queryKey: ["my-tribes"] });
      queryClient.invalidateQueries({ queryKey: ["tribe-members", tribeId] });
    },
  });
}
