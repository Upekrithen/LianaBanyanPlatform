import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SocialImport {
  id: string;
  user_id: string;
  source_platform: string;
  source_url: string;
  source_title: string | null;
  source_description: string | null;
  source_images: string[];
  status: 'imported' | 'draft' | 'converted';
  project_id: string | null;
  created_at: string;
}

interface ExtractedMetadata {
  title: string;
  description: string;
  images: string[];
  platform: string;
  source_url: string;
}

function detectPlatform(url: string): string {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes('reddit.com') || host.includes('redd.it')) return 'reddit';
  if (host.includes('discord.com') || host.includes('discord.gg')) return 'discord';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('etsy.com')) return 'etsy';
  if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
  if (host.includes('tiktok.com')) return 'tiktok';
  return 'website';
}

export function useExtractFromUrl() {
  const [extracting, setExtracting] = useState(false);
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extract = async (url: string) => {
    setExtracting(true);
    setError(null);
    setMetadata(null);

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      setExtracting(false);
      return null;
    }

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('extract-url-metadata', {
        body: { url },
      });

      if (fnErr) throw fnErr;

      const result: ExtractedMetadata = {
        title: data?.title || '',
        description: data?.description || '',
        images: data?.images || [],
        platform: data?.platform || detectPlatform(url),
        source_url: url,
      };

      setMetadata(result);
      return result;
    } catch (err) {
      const platform = detectPlatform(url);
      const fallback: ExtractedMetadata = {
        title: '',
        description: '',
        images: [],
        platform,
        source_url: url,
      };
      setMetadata(fallback);
      setError('Could not auto-extract metadata — you can fill in details manually.');
      return fallback;
    } finally {
      setExtracting(false);
    }
  };

  return { extract, extracting, metadata, setMetadata, error };
}

export function useCreateImport() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      source_platform: string;
      source_url: string;
      source_title?: string;
      source_description?: string;
      source_images?: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_imports' as never)
        .insert({
          user_id: user.id,
          source_platform: input.source_platform,
          source_url: input.source_url,
          source_title: input.source_title || null,
          source_description: input.source_description || null,
          source_images: input.source_images || [],
          status: 'imported',
        } as never)
        .select('*')
        .single() as { data: SocialImport | null; error: unknown };

      if (error || !data) throw error || new Error('Failed to save import');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-imports'] });
    },
  });
}

export function useConvertImport() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ importId, projectId }: { importId: string; projectId: string }) => {
      const { error } = await supabase
        .from('social_imports' as never)
        .update({ status: 'converted', project_id: projectId } as never)
        .eq('id', importId) as { error: unknown };

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-imports'] });
    },
  });
}

export function useMyImports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['social-imports', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_imports' as never)
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false }) as { data: SocialImport[] | null; error: unknown };

      if (error) throw error;
      return (data || []) as SocialImport[];
    },
    enabled: !!user,
  });
}
