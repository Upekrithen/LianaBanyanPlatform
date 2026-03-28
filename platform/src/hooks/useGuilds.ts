import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  guild_type: string;
  leader_id: string;
  banner_image_url: string | null;
  banner_url?: string | null;
  icon_url: string | null;
  mascot_url: string | null;
  color_primary: string;
  color_secondary: string | null;
  theme_css: string | null;
  treasury_credits: number;
  treasury_reserve_pct: number;
  spending_threshold: number;
  member_count: number;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
  motto: string | null;
  status: string;
}

export interface GuildMembership {
  id: string;
  guild_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  is_active: boolean;
  guild?: Guild;
}

export function useGuilds(search?: string) {
  return useQuery({
    queryKey: ["guilds", search],
    queryFn: async () => {
      let q = supabase
        .from("guilds" as any)
        .select("*")
        .eq("is_active", true)
        .order("member_count", { ascending: false });

      if (search) {
        q = q.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Guild[];
    },
  });
}

export function useGuild(slug: string | undefined) {
  return useQuery({
    queryKey: ["guild", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("guilds" as any)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Guild;
    },
    enabled: !!slug,
  });
}

export function useMyGuilds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-guilds", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("guild_memberships" as any)
        .select("*, guild:guilds(*)")
        .eq("member_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as GuildMembership[];
    },
    enabled: !!user,
  });
}

export function useGuildMembers(guildId: string | undefined) {
  return useQuery({
    queryKey: ["guild-members", guildId],
    queryFn: async () => {
      if (!guildId) return [];
      const { data, error } = await supabase
        .from("guild_memberships" as any)
        .select("*, profile:profiles(id, full_name, avatar_url)")
        .eq("guild_id", guildId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!guildId,
  });
}

export function useCreateGuild() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      slug: string;
      description?: string;
      guild_type: string;
      color_primary?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("guilds" as any)
        .insert({
          ...input,
          leader_id: user.id,
          status: "active",
          is_active: true,
          activated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("guild_memberships" as any).insert({
        guild_id: data.id,
        member_id: user.id,
        role: "leader",
        is_active: true,
      });

      return data as Guild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
      queryClient.invalidateQueries({ queryKey: ["my-guilds"] });
    },
  });
}

export function useJoinGuild() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (guildId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { data, error } = await supabase
        .from("guild_memberships" as any)
        .insert({
          guild_id: guildId,
          member_id: user.id,
          role: "member",
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, guildId) => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
      queryClient.invalidateQueries({ queryKey: ["my-guilds"] });
      queryClient.invalidateQueries({ queryKey: ["guild-members", guildId] });
    },
  });
}

export function useLeaveGuild() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (guildId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("guild_memberships" as any)
        .update({ is_active: false })
        .eq("guild_id", guildId)
        .eq("member_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, guildId) => {
      queryClient.invalidateQueries({ queryKey: ["guilds"] });
      queryClient.invalidateQueries({ queryKey: ["my-guilds"] });
      queryClient.invalidateQueries({ queryKey: ["guild-members", guildId] });
    },
  });
}
