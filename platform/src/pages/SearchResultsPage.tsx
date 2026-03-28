import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch, type SearchFilter } from '@/hooks/useSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Package, Briefcase, User, Palette } from 'lucide-react';

const filterTabs: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'products', label: 'Products' },
  { value: 'projects', label: 'Projects' },
  { value: 'makers', label: 'Makers' },
  { value: 'cards', label: 'Cue Cards' },
];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const qParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(qParam);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const { data, isLoading } = useSearch(qParam, filter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) {
      setSearchParams({ q: query });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  const totalResults = data
    ? data.products.length + data.projects.length + data.makers.length + data.cards.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Search input */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, projects, makers…"
            className="w-full h-12 rounded-xl border bg-card pl-12 pr-12 text-base outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            autoFocus
          />
          {query && (
            <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </form>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {filterTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.value)}
              className="shrink-0 touch-manipulation"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Results */}
        {isLoading && qParam.length >= 2 && (
          <div className="text-center py-12 text-muted-foreground">Searching…</div>
        )}

        {!isLoading && qParam.length >= 2 && totalResults === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-lg font-medium">No results for "{qParam}"</p>
            <p className="text-sm text-muted-foreground mt-1">Try different keywords or browse categories</p>
          </div>
        )}

        {!isLoading && qParam.length < 2 && (
          <div className="text-center py-12 text-muted-foreground">
            Type at least 2 characters to search
          </div>
        )}

        {data && qParam.length >= 2 && (
          <div className="space-y-8">
            {/* Products */}
            {(filter === 'all' || filter === 'products') && data.products.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  <Package className="h-4 w-4" />
                  Products
                  <Badge variant="secondary" className="ml-1">{data.products.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {data.products.map((p) => (
                    <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/project/${p.slug}`)}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                        </div>
                        {p.category && <Badge variant="outline" className="shrink-0">{p.category}</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {(filter === 'all' || filter === 'projects') && data.projects.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  <Briefcase className="h-4 w-4" />
                  Projects
                  <Badge variant="secondary" className="ml-1">{data.projects.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {data.projects.map((p) => (
                    <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/project/${p.slug}`)}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{p.title}</p>
                          {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                        </div>
                        <Badge variant="outline" className="shrink-0">{p.status}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Makers */}
            {(filter === 'all' || filter === 'makers') && data.makers.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  <User className="h-4 w-4" />
                  Makers
                  <Badge variant="secondary" className="ml-1">{data.makers.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {data.makers.map((m) => (
                    <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/member/${m.user_id}`)}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{m.display_name}</p>
                          {m.bio && <p className="text-xs text-muted-foreground line-clamp-1">{m.bio}</p>}
                        </div>
                        {(m.city || m.state) && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {[m.city, m.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Cue Cards */}
            {(filter === 'all' || filter === 'cards') && data.cards.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  <Palette className="h-4 w-4" />
                  Cue Cards
                  <Badge variant="secondary" className="ml-1">{data.cards.length}</Badge>
                </h2>
                <div className="space-y-2">
                  {data.cards.map((c) => (
                    <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/cue-cards/campaigns/${c.slug}`)}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-xl shrink-0">{c.icon || '🎨'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.craft_type}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
