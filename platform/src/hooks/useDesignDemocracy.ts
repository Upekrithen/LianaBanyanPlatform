import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/* ───────────────────────────────────────────────────────────────────────── */
/*  Types                                                                    */
/* ───────────────────────────────────────────────────────────────────────── */

export interface ElementOverlay {
  id: string;
  element_ref: string;
  page_path: string;
  submitted_by: string;
  overlay_type: 'text' | 'image' | 'svg' | 'html';
  overlay_content: string;
  screenshot_before: string | null;
  screenshot_after: string | null;
  status: 'pending' | 'voting' | 'approved' | 'rejected' | 'featured';
  upvotes: number;
  downvotes: number;
  lark_id: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface PageTheme {
  id: string;
  page_path: string | null;
  theme_name: string;
  submitted_by: string;
  css_content: string;
  preview_screenshot: string | null;
  status: 'pending' | 'voting' | 'approved' | 'rejected' | 'featured';
  upvotes: number;
  downvotes: number;
  scope: 'element' | 'page' | 'site';
  created_at: string;
}

export interface DesignVote {
  id: string;
  voter_id: string;
  voteable_type: 'element_overlay' | 'page_theme' | 'design_contest_submission';
  voteable_id: string;
  vote: -1 | 1;
  created_at: string;
}

export interface ThemePreference {
  id: string;
  user_id: string;
  scope: 'personal' | 'guild' | 'tribe';
  scope_id: string | null;
  active_theme_id: string | null;
  created_at: string;
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Element Overlays                                                         */
/* ───────────────────────────────────────────────────────────────────────── */

export function useElementOverlays(pagePath: string) {
  return useQuery({
    queryKey: ['element-overlays', pagePath],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('element_overlays')
        .select('*')
        .eq('page_path', pagePath)
        .order('upvotes', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ElementOverlay[];
    },
    enabled: !!pagePath,
  });
}

export function useSubmitOverlay() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (overlay: {
      element_ref: string;
      page_path: string;
      overlay_type: ElementOverlay['overlay_type'];
      overlay_content: string;
      screenshot_before?: string;
      screenshot_after?: string;
      lark_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('element_overlays')
        .insert({ ...overlay, submitted_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as ElementOverlay;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['element-overlays', vars.page_path] });
      toast({ title: 'Overlay submitted', description: 'Your design is now in the review queue.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Submit failed', description: err.message, variant: 'destructive' });
    },
  });
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Page Themes                                                              */
/* ───────────────────────────────────────────────────────────────────────── */

export function usePageThemes(pagePath?: string) {
  return useQuery({
    queryKey: ['page-themes', pagePath ?? 'all'],
    queryFn: async () => {
      let q = (supabase as any).from('page_themes').select('*');
      if (pagePath) {
        q = q.or(`page_path.eq.${pagePath},page_path.is.null`);
      }
      q = q.order('upvotes', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PageTheme[];
    },
  });
}

export function useSubmitTheme() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (theme: {
      theme_name: string;
      css_content: string;
      page_path?: string;
      scope?: PageTheme['scope'];
      preview_screenshot?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('page_themes')
        .insert({
          theme_name: theme.theme_name,
          css_content: theme.css_content,
          page_path: theme.page_path ?? null,
          scope: theme.scope ?? 'page',
          preview_screenshot: theme.preview_screenshot ?? null,
          submitted_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PageTheme;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['page-themes'] });
      toast({ title: 'Theme submitted', description: 'Your theme is now in the review queue.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Submit failed', description: err.message, variant: 'destructive' });
    },
  });
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Design Votes                                                             */
/* ───────────────────────────────────────────────────────────────────────── */

export function useDesignVote() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      voteable_type: DesignVote['voteable_type'];
      voteable_id: string;
      vote: -1 | 1;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('design_votes')
        .upsert(
          {
            voter_id: user.id,
            voteable_type: params.voteable_type,
            voteable_id: params.voteable_id,
            vote: params.vote,
          },
          { onConflict: 'voter_id,voteable_type,voteable_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data as DesignVote;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['element-overlays'] });
      qc.invalidateQueries({ queryKey: ['page-themes'] });
      qc.invalidateQueries({ queryKey: ['theme-gallery'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Vote failed', description: err.message, variant: 'destructive' });
    },
  });
}

export function useMyVotes(voteableType: DesignVote['voteable_type'], voteableIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-design-votes', voteableType, voteableIds],
    queryFn: async () => {
      if (!user || voteableIds.length === 0) return {};
      const { data, error } = await (supabase as any)
        .from('design_votes')
        .select('voteable_id, vote')
        .eq('voter_id', user.id)
        .eq('voteable_type', voteableType)
        .in('voteable_id', voteableIds);
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of data ?? []) map[row.voteable_id] = row.vote;
      return map;
    },
    enabled: !!user && voteableIds.length > 0,
  });
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Theme Preferences                                                        */
/* ───────────────────────────────────────────────────────────────────────── */

export function useMyThemePreference(scope: ThemePreference['scope'], scopeId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['theme-preference', scope, scopeId ?? 'self'],
    queryFn: async () => {
      if (!user) return null;
      let q = (supabase as any)
        .from('theme_preferences')
        .select('*, active_theme:page_themes(*)')
        .eq('user_id', user.id)
        .eq('scope', scope);
      if (scopeId) q = q.eq('scope_id', scopeId);
      else q = q.is('scope_id', null);
      const { data, error } = await q.maybeSingle();
      if (error) throw error;
      return data as (ThemePreference & { active_theme: PageTheme | null }) | null;
    },
    enabled: !!user,
  });
}

export function useSetThemePreference() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      scope: ThemePreference['scope'];
      scope_id?: string;
      active_theme_id: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('theme_preferences')
        .upsert(
          {
            user_id: user.id,
            scope: params.scope,
            scope_id: params.scope_id ?? null,
            active_theme_id: params.active_theme_id,
          },
          { onConflict: 'user_id,scope,scope_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data as ThemePreference;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['theme-preference'] });
      toast({ title: 'Theme applied', description: 'Your theme preference has been saved.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Failed to set theme', description: err.message, variant: 'destructive' });
    },
  });
}

/* ───────────────────────────────────────────────────────────────────────── */
/*  Theme Gallery (featured + top-voted)                                     */
/* ───────────────────────────────────────────────────────────────────────── */

export function useThemeGallery(filter?: { scope?: string; pagePath?: string }) {
  return useQuery({
    queryKey: ['theme-gallery', filter?.scope ?? 'all', filter?.pagePath ?? 'all'],
    queryFn: async () => {
      let q = (supabase as any)
        .from('page_themes')
        .select('*')
        .in('status', ['approved', 'featured', 'voting']);

      if (filter?.scope) q = q.eq('scope', filter.scope);
      if (filter?.pagePath) q = q.or(`page_path.eq.${filter.pagePath},page_path.is.null`);

      q = q.order('status', { ascending: true }).order('upvotes', { ascending: false }).limit(50);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PageTheme[];
    },
  });
}
