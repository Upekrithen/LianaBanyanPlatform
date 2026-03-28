import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Search, Upload, Box, Loader2, Filter } from 'lucide-react';

type CategoryFilter = 'all' | 'terrain' | 'hinge' | 'miniature' | 'building' | 'accessory' | 'tool' | 'component' | 'other';
type SortBy = 'newest' | 'popular' | 'name';

interface STLFile {
  id: string;
  filename: string;
  display_name: string;
  description: string | null;
  version: string;
  file_url: string;
  thumbnail_url: string | null;
  file_size_bytes: number | null;
  category: string;
  tags: string[];
  download_count: number;
  is_public: boolean;
  license: string;
  created_at: string;
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All Files' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'hinge', label: 'Hinges' },
  { value: 'miniature', label: 'Miniatures' },
  { value: 'building', label: 'Buildings' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'tool', label: 'Tools' },
  { value: 'component', label: 'Components' },
];

function STLCard({ file }: { file: STLFile }) {
  const sizeLabel = file.file_size_bytes
    ? file.file_size_bytes > 1048576
      ? `${(file.file_size_bytes / 1048576).toFixed(1)} MB`
      : `${(file.file_size_bytes / 1024).toFixed(0)} KB`
    : null;

  return (
    <Card className="group hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center">
        {file.thumbnail_url ? (
          <img src={file.thumbnail_url} alt={file.display_name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <Box className="w-12 h-12 text-cyan-400/40 mx-auto" />
            <span className="text-[10px] text-gray-500 mt-1 block">.STL</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-gray-900/80 text-cyan-300 text-[10px]">v{file.version}</Badge>
      </div>
      <CardContent className="p-3 space-y-2 bg-gray-950 text-white">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {file.display_name}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>{file.category}</span>
          {sizeLabel && <span>{sizeLabel}</span>}
          <span>{file.download_count} DL</span>
        </div>
        <Button
          size="sm"
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
          onClick={(e) => {
            e.stopPropagation();
            if (file.file_url) window.open(file.file_url, '_blank');
          }}
        >
          <FileDown className="w-3 h-3 mr-1" />Download
        </Button>
      </CardContent>
    </Card>
  );
}

export default function STLVault() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [search, setSearch] = useState('');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['stl-vault', category, sortBy, search],
    queryFn: async () => {
      let q = supabase.from('stl_files').select('*');

      if (category !== 'all') q = q.eq('category', category);
      if (search) q = q.ilike('display_name', `%${search}%`);

      if (sortBy === 'newest') q = q.order('created_at', { ascending: false });
      else if (sortBy === 'popular') q = q.order('download_count', { ascending: false });
      else q = q.order('display_name', { ascending: true });

      const { data, error } = await q.limit(60);
      if (error) throw error;
      return (data || []) as STLFile[];
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              STL Vault
            </h1>
            <p className="text-gray-400 text-sm mt-1">Design files for the Distributed Factory. Download, print, test, report.</p>
          </div>
          {user && (
            <Button variant="outline" className="border-cyan-700 text-cyan-400 hover:bg-cyan-950">
              <Upload className="w-4 h-4 mr-2" />Upload STL
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search designs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-800 text-white placeholder:text-gray-600"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <Button
                key={c.value}
                variant={category === c.value ? 'default' : 'ghost'}
                size="sm"
                className={category === c.value ? 'bg-cyan-600' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <Select value={sortBy} onValueChange={(v: SortBy) => setSortBy(v)}>
            <SelectTrigger className="w-36 bg-gray-900 border-gray-800 text-gray-300">
              <Filter className="w-3 h-3 mr-1" /><SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Box className="w-16 h-16 mx-auto text-gray-700" />
            <h3 className="text-lg font-medium text-gray-300">The Vault is being loaded</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              STL design files are coming soon. Register as a maker to be first to upload.
            </p>
            <Button variant="outline" className="border-cyan-700 text-cyan-400" onClick={() => navigate('/register-maker')}>
              Register as Maker
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map(f => <STLCard key={f.id} file={f} />)}
          </div>
        )}
      </div>
    </div>
  );
}
