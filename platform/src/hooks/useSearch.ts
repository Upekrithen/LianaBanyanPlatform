import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SearchFilter = 'all' | 'products' | 'projects' | 'makers' | 'cards';

export interface SearchResultProduct {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string | null;
}

export interface SearchResultProject {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  category: string;
  status: string;
}

export interface SearchResultMaker {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  state: string | null;
}

export interface SearchResultCueCard {
  id: string;
  title: string;
  slug: string;
  craft_type: string;
  icon: string;
}

export interface SearchResults {
  products: SearchResultProduct[];
  projects: SearchResultProject[];
  makers: SearchResultMaker[];
  cards: SearchResultCueCard[];
}

async function searchProducts(q: string): Promise<SearchResultProduct[]> {
  const pattern = `%${q}%`;
  const { data } = await supabase
    .from('turnkey_projects' as never)
    .select('id, title, description, slug, category')
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .eq('status', 'showcased')
    .limit(20) as { data: any[] | null };
  return (data || []).map((r: any) => ({
    id: r.id,
    name: r.title,
    description: r.description,
    slug: r.slug,
    category: r.category,
  }));
}

async function searchProjects(q: string): Promise<SearchResultProject[]> {
  const pattern = `%${q}%`;
  const { data } = await supabase
    .from('turnkey_projects' as never)
    .select('id, title, description, slug, category, status')
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .neq('status', 'draft')
    .limit(20) as { data: SearchResultProject[] | null };
  return data || [];
}

async function searchMakers(q: string): Promise<SearchResultMaker[]> {
  const pattern = `%${q}%`;
  const { data } = await supabase
    .from('member_profiles' as never)
    .select('id, user_id, display_name, bio, city, state')
    .or(`display_name.ilike.${pattern},bio.ilike.${pattern}`)
    .limit(20) as { data: SearchResultMaker[] | null };
  return data || [];
}

async function searchCueCards(q: string): Promise<SearchResultCueCard[]> {
  const pattern = `%${q}%`;
  const { data } = await supabase
    .from('cue_card_campaigns' as never)
    .select('id, title, slug, craft_type, icon')
    .or(`title.ilike.${pattern},craft_type.ilike.${pattern}`)
    .eq('is_active', true)
    .limit(20) as { data: SearchResultCueCard[] | null };
  return data || [];
}

export function useSearch(query: string, filter: SearchFilter = 'all') {
  return useQuery({
    queryKey: ['global-search', query, filter],
    queryFn: async (): Promise<SearchResults> => {
      const [products, projects, makers, cards] = await Promise.all([
        filter === 'all' || filter === 'products' ? searchProducts(query) : [],
        filter === 'all' || filter === 'projects' ? searchProjects(query) : [],
        filter === 'all' || filter === 'makers' ? searchMakers(query) : [],
        filter === 'all' || filter === 'cards' ? searchCueCards(query) : [],
      ]);
      return { products, projects, makers, cards };
    },
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
