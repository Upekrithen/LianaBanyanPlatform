import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, ExternalLink, Star, Coins, Clock } from 'lucide-react';

const CATEGORIES = ['Tabletop Terrain', 'Leather Goods', 'Food & Kitchen', 'Jewelry', 'Board Games', 'Woodworking', 'Digital Design', 'Other'];
const SOURCE_PLATFORMS = ['reddit', 'etsy', 'instagram', 'discord', 'twitter', 'tiktok', 'website', 'manual'] as const;
const PLATFORM_LABELS: Record<string, string> = {
  reddit: 'Reddit', etsy: 'Etsy', instagram: 'Instagram', discord: 'Discord',
  twitter: 'Twitter/X', tiktok: 'TikTok', website: 'Website', manual: 'Manual',
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

interface ShowcasedProject {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  is_showcased: boolean;
  showcase_source_url: string | null;
  showcase_source_platform: string | null;
  showcase_expires_at: string | null;
  creator_display_name: string | null;
  created_at: string;
}

export default function ShowcaseAdminPage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-showcased-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turnkey_projects' as never)
        .select('*')
        .eq('is_showcased', true)
        .order('created_at', { ascending: false }) as { data: ShowcasedProject[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as ShowcasedProject[];
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Showcase Admin</h1>
          <p className="text-muted-foreground text-sm">Pre-populate projects from prospective creators</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> Add Showcase
        </Button>
      </div>

      {showForm && (
        <ShowcaseCreateForm
          onSuccess={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ['admin-showcased-projects'] });
          }}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No showcased projects yet. Add one above.
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Creator</th>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Source</th>
                <th className="text-center p-3 font-medium">Demand</th>
                <th className="text-center p-3 font-medium">Credits</th>
                <th className="text-left p-3 font-medium">Expires</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <ShowcaseRow key={p.id} project={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ShowcaseRow({ project }: { project: ShowcasedProject }) {
  const { data: demandCount = 0 } = useQuery({
    queryKey: ['showcase-demand-count', project.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('showcase_demand_signals' as never)
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('signal_type', 'want') as { count: number | null };
      return count ?? 0;
    },
  });

  const { data: pledgeTotal = 0 } = useQuery({
    queryKey: ['showcase-pledge-total', project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('showcase_pledge_escrow' as never)
        .select('credits_amount')
        .eq('project_id', project.id)
        .eq('status', 'held') as { data: { credits_amount: number }[] | null };
      return (data || []).reduce((s, r) => s + r.credits_amount, 0);
    },
  });

  const expiresAt = project.showcase_expires_at ? new Date(project.showcase_expires_at) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;

  return (
    <tr className="border-t hover:bg-muted/30">
      <td className="p-3">{project.creator_display_name || '—'}</td>
      <td className="p-3 font-medium">{project.title}</td>
      <td className="p-3">
        {project.showcase_source_platform && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px]">
              {PLATFORM_LABELS[project.showcase_source_platform] || project.showcase_source_platform}
            </Badge>
            {project.showcase_source_url && (
              <a href={project.showcase_source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            )}
          </div>
        )}
      </td>
      <td className="p-3 text-center">
        <span className="inline-flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500" /> {demandCount}
        </span>
      </td>
      <td className="p-3 text-center">
        <span className="inline-flex items-center gap-1">
          <Coins className="w-3 h-3 text-amber-600" /> {pledgeTotal}
        </span>
      </td>
      <td className="p-3">
        {expiresAt && (
          <span className={`inline-flex items-center gap-1 text-xs ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
            <Clock className="w-3 h-3" />
            {expiresAt.toLocaleDateString()}
          </span>
        )}
      </td>
      <td className="p-3">
        <Badge variant={project.status === 'showcased' ? 'default' : 'secondary'}
          className={project.status === 'showcased' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
          {project.status}
        </Badge>
      </td>
    </tr>
  );
}

function ShowcaseCreateForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [creatorName, setCreatorName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      const { error } = await supabase
        .from('turnkey_projects' as never)
        .insert({
          title,
          slug: slugify(title) + '-' + Date.now().toString(36),
          description,
          category: category || 'Other',
          status: 'showcased',
          is_showcased: true,
          showcase_source_url: sourceUrl || null,
          showcase_source_platform: sourcePlatform || null,
          showcase_created_by: user.id,
          showcase_expires_at: expiresAt.toISOString(),
          creator_display_name: creatorName || null,
          creator_id: user.id,
          creator_backing_credits: 0,
          community_matched: 0,
          matching_cap: 0,
          current_tier: 'prototype',
          early_adopter_slots: 50,
          early_adopter_filled: 0,
          images: [],
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Showcase created!', description: `${title} is now live in the project directory.` });
      onSuccess();
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New Showcase Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); create.mutate(); }} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Creator Name</label>
            <Input value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="e.g. Sarah's Leather Workshop" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Source URL</label>
            <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://reddit.com/r/..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Source Platform</label>
            <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {SOURCE_PLATFORMS.map(p => <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Product Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Product name" required />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Paste from source or write a description..." rows={3} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="submit" disabled={!title.trim() || create.isPending} className="bg-amber-600 hover:bg-amber-700">
              {create.isPending ? 'Creating...' : 'Create Showcase'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
