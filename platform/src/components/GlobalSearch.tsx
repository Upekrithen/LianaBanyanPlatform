import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, Briefcase, User, Palette } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearch(debouncedQuery);

  const flatResults = useCallback(() => {
    if (!data) return [];
    const items: { type: string; label: string; desc: string; url: string; icon: typeof Package }[] = [];
    data.products.slice(0, 3).forEach((p) =>
      items.push({ type: 'Products', label: p.name, desc: p.category || '', url: `/project/${p.slug}`, icon: Package })
    );
    data.projects.slice(0, 3).forEach((p) =>
      items.push({ type: 'Projects', label: p.title, desc: p.status, url: `/project/${p.slug}`, icon: Briefcase })
    );
    data.makers.slice(0, 3).forEach((m) =>
      items.push({ type: 'Makers', label: m.display_name, desc: [m.city, m.state].filter(Boolean).join(', '), url: `/member/${m.user_id}`, icon: User })
    );
    data.cards.slice(0, 3).forEach((c) =>
      items.push({ type: 'Cue Cards', label: c.title, desc: c.craft_type, url: `/cue-cards/campaigns/${c.slug}`, icon: Palette })
    );
    return items;
  }, [data]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = flatResults();
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        navigate(items[selectedIndex].url);
        setOpen(false);
        setQuery('');
      } else if (query.length >= 2) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setOpen(false);
        setQuery('');
      }
    }
  };

  const handleNavigate = (url: string) => {
    navigate(url);
    setOpen(false);
    setQuery('');
    setMobileOpen(false);
  };

  const items = flatResults();
  const hasResults = items.length > 0;

  return (
    <>
      {/* Desktop search bar */}
      <div ref={containerRef} className="relative hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelectedIndex(-1); }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, projects, makers…"
            className="h-9 w-64 lg:w-80 rounded-lg border bg-muted/40 pl-9 pr-8 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setOpen(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && debouncedQuery.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Searching…</div>
            ) : !hasResults ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No results for "{debouncedQuery}"</div>
            ) : (
              <>
                {items.map((item, i) => {
                  const showHeader = i === 0 || items[i - 1].type !== item.type;
                  return (
                    <div key={`${item.type}-${item.label}-${i}`}>
                      {showHeader && (
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.type}
                        </p>
                      )}
                      <button
                        onClick={() => handleNavigate(item.url)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors ${
                          selectedIndex === i ? 'bg-muted/60' : ''
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate font-medium">{item.label}</span>
                        {item.desc && <span className="text-xs text-muted-foreground truncate ml-auto">{item.desc}</span>}
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => handleNavigate(`/search?q=${encodeURIComponent(query)}`)}
                  className={`w-full px-3 py-2.5 text-center text-sm font-medium text-primary hover:bg-primary/5 border-t ${
                    selectedIndex === items.length ? 'bg-primary/5' : ''
                  }`}
                >
                  View all results →
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile search icon */}
      <button
        onClick={() => setMobileOpen(true)}
        className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile full-width overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-background sm:hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMobileOpen(false);
                else if (e.key === 'Enter' && query.length >= 2) {
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                  setMobileOpen(false);
                  setQuery('');
                }
              }}
              placeholder="Search products, projects, makers…"
              className="flex-1 h-10 bg-transparent text-base outline-none"
            />
            <button onClick={() => { setMobileOpen(false); setQuery(''); }} className="p-2 touch-manipulation">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-56px)]">
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="p-6 text-center text-muted-foreground">Searching…</div>
            )}
            {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
              <div className="p-6 text-center text-muted-foreground">No results for "{debouncedQuery}"</div>
            )}
            {items.map((item, i) => {
              const showHeader = i === 0 || items[i - 1].type !== item.type;
              return (
                <div key={`m-${item.type}-${item.label}-${i}`}>
                  {showHeader && (
                    <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.type}
                    </p>
                  )}
                  <button
                    onClick={() => handleNavigate(item.url)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors touch-manipulation"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      {item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}
                    </div>
                  </button>
                </div>
              );
            })}
            {hasResults && (
              <button
                onClick={() => handleNavigate(`/search?q=${encodeURIComponent(query)}`)}
                className="w-full px-4 py-4 text-center text-sm font-medium text-primary hover:bg-primary/5 border-t touch-manipulation"
              >
                View all results →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
