import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

interface PersonalNote {
  id: string;
  item_slug: string;
  item_title: string;
  content: string;
  detail_level: string | null;
  created_at: string;
  updated_at: string;
}

interface SubmittedNote {
  id: string;
  item_slug: string;
  item_title: string;
  content: string;
  detail_level: string | null;
  category: string;
  status: string;
  response_to_member: string | null;
  created_at: string;
}

const LS_KEY = 'lb_tour_notes_anon';

function getAnonNotes(): Record<string, PersonalNote[]> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

function setAnonNotes(notes: Record<string, PersonalNote[]>) {
  localStorage.setItem(LS_KEY, JSON.stringify(notes));
}

export function useTourNotes(itemSlug: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const qk = ['tour-notes', itemSlug, user?.id ?? 'anon'];

  const personalNotes = useQuery({
    queryKey: qk,
    queryFn: async (): Promise<PersonalNote[]> => {
      if (!user) {
        const all = getAnonNotes();
        return all[itemSlug] || [];
      }
      const { data, error } = await supabase
        .from('tour_notes_personal' as never)
        .select('*')
        .eq('item_slug', itemSlug)
        .order('created_at', { ascending: false }) as { data: PersonalNote[] | null; error: unknown };
      if (error || !data) return [];
      return data;
    },
    staleTime: 60_000,
  });

  const savePersonal = useMutation({
    mutationFn: async (args: { content: string; itemTitle: string; detailLevel?: string }) => {
      if (!user) {
        const all = getAnonNotes();
        const note: PersonalNote = {
          id: crypto.randomUUID(),
          item_slug: itemSlug,
          item_title: args.itemTitle,
          content: args.content,
          detail_level: args.detailLevel || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        all[itemSlug] = [note, ...(all[itemSlug] || [])];
        setAnonNotes(all);
        return note;
      }
      const { data, error } = await supabase
        .from('tour_notes_personal' as never)
        .insert({
          user_id: user.id,
          item_slug: itemSlug,
          item_title: args.itemTitle,
          content: args.content,
          detail_level: args.detailLevel || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const submitForReview = useMutation({
    mutationFn: async (args: { content: string; itemTitle: string; detailLevel?: string }) => {
      if (!user) throw new Error('Must be signed in to submit notes for review');
      const { data, error } = await supabase
        .from('tour_notes_submitted' as never)
        .insert({
          user_id: user.id,
          item_slug: itemSlug,
          item_title: args.itemTitle,
          content: args.content,
          detail_level: args.detailLevel || null,
        })
        .select()
        .single();
      if (error) throw error;

      try {
        await supabase.functions.invoke('categorize-tour-note', {
          body: { note_id: (data as any).id, content: args.content, item_slug: itemSlug, item_title: args.itemTitle },
        });
      } catch { /* categorization is best-effort */ }

      return data;
    },
  });

  const hasNotes = useCallback((): boolean => {
    return (personalNotes.data?.length ?? 0) > 0;
  }, [personalNotes.data]);

  return { personalNotes, savePersonal, submitForReview, hasNotes };
}

export function useNotesIndicator(slugs: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tour-notes-indicators', slugs.join(','), user?.id ?? 'anon'],
    queryFn: async (): Promise<Set<string>> => {
      if (!user) {
        const all = getAnonNotes();
        return new Set(slugs.filter(s => (all[s]?.length ?? 0) > 0));
      }
      if (slugs.length === 0) return new Set();
      const { data, error } = await supabase
        .from('tour_notes_personal' as never)
        .select('item_slug')
        .in('item_slug', slugs) as { data: { item_slug: string }[] | null; error: unknown };
      if (error || !data) return new Set();
      return new Set(data.map(r => r.item_slug));
    },
    staleTime: 60_000,
    enabled: slugs.length > 0,
  });
}
