import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTurnKeyProjects } from '@/hooks/useTurnKeyProjects';
import { TurnKeyProjectCard } from '@/components/turnkey/TurnKeyProjectCard';
import { Rocket } from 'lucide-react';

const CATEGORIES = ['All', 'Tabletop Terrain', 'Leather Goods', 'Food & Kitchen', 'Jewelry', 'Board Games', 'Woodworking', 'Digital Design', 'Other'];

type SortOption = 'newest' | 'most_backed' | 'almost_funded' | 'most_wanted' | 'most_pledged';
type FilterTab = 'all' | 'showcase';

export default function ProjectDirectory() {
  const [searchParams] = useSearchParams();
  const cueCardFilter = searchParams.get('cue_card') || undefined;
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('newest');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const { data: projects = [], isLoading } = useTurnKeyProjects({
    category: category === 'All' ? undefined : category,
    cueCardSlug: cueCardFilter,
    sort,
    showcaseOnly: filterTab === 'showcase',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm">Back a creator. Fund production. Get amazing products.</p>
        </div>
        <Link to="/cue-cards/campaigns">
          <Button><Rocket className="w-4 h-4 mr-2" /> Start a Project</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterTab === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All Projects
        </button>
        <button
          onClick={() => setFilterTab('showcase')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            filterTab === 'showcase' ? 'bg-amber-500 text-white' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50'
          }`}
        >
          Showcase
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most_backed">Most Backed</SelectItem>
            <SelectItem value="almost_funded">Almost Funded</SelectItem>
            <SelectItem value="most_wanted">Most Wanted</SelectItem>
            <SelectItem value="most_pledged">Most Pledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">📦</p>
          <p className="text-muted-foreground">
            {filterTab === 'showcase' ? 'No showcased projects yet.' : 'No projects yet. Be the first!'}
          </p>
          <Link to="/cue-cards/campaigns"><Button>Start a Project</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => <TurnKeyProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
