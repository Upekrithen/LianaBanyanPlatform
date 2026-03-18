import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Search, ChevronDown, ChevronRight,
  ExternalLink, Hash, X
} from 'lucide-react';
import { FAQ_CHAPTERS, searchFAQ, getRelatedEntries, type FAQEntry, type FAQChapter } from '@/lib/nervous-system/knowledgeBase';

export default function FAQ() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(FAQ_CHAPTERS.map(ch => ch.id))
  );
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handle anchor scrolling on load
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Small delay to let DOM render
      setTimeout(() => {
        const el = entryRefs.current[hash];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setExpandedEntries(prev => new Set([...prev, hash]));
          // Expand the parent chapter
          for (const ch of FAQ_CHAPTERS) {
            if (ch.entries.some(e => e.id === hash)) {
              setExpandedChapters(prev => new Set([...prev, ch.id]));
              break;
            }
          }
          // Highlight flash
          el.classList.add('ring-2', 'ring-amber-400/60');
          setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400/60'), 3000);
        }
      }, 150);
    }
  }, [location.hash]);

  const searchResults = searchQuery.trim() ? searchFAQ(searchQuery) : null;

  const toggleEntry = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyAnchorLink = (entryId: string) => {
    const url = `${window.location.origin}/faq#${entryId}`;
    navigator.clipboard.writeText(url).catch(() => {});
  };

  const renderEntry = (entry: FAQEntry, highlight?: boolean) => {
    const isExpanded = expandedEntries.has(entry.id);
    return (
      <div
        key={entry.id}
        id={entry.id}
        ref={el => { entryRefs.current[entry.id] = el; }}
        className={`rounded-lg border transition-all duration-300 ${
          highlight
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
        }`}
      >
        <button
          onClick={() => toggleEntry(entry.id)}
          className="w-full text-left px-5 py-4 flex items-start gap-3 group"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ChevronRight
            className={`h-5 w-5 text-slate-500 shrink-0 mt-0.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-90 text-amber-400' : ''
            }`}
          />
          <span
            className="text-white font-medium leading-snug"
            style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", fontSize: '1rem' }}
          >
            {entry.question}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); copyAnchorLink(entry.id); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); copyAnchorLink(entry.id); } }}
            className="ml-auto opacity-0 group-hover:opacity-50 hover:!opacity-100 shrink-0 transition-opacity"
            title="Copy link to this question"
            style={{ cursor: 'pointer', padding: '0.25rem' }}
          >
            <Hash className="h-4 w-4 text-slate-400" />
          </span>
        </button>

        {isExpanded && (
          <div className="px-5 pb-4 pl-13" style={{ paddingLeft: '3.25rem' }}>
            <p
              className="text-slate-300 leading-relaxed mb-2"
              style={{ fontSize: '0.95rem', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            >
              {entry.answer}
            </p>

            {entry.detail && (
              <p
                className="text-slate-400 leading-relaxed mb-3 text-sm border-l-2 border-slate-600 pl-3"
                style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
              >
                {entry.detail}
              </p>
            )}

            {entry.learnMoreUrl && (
              <a
                href={entry.learnMoreUrl}
                target={entry.learnMoreUrl.startsWith('http') ? '_blank' : undefined}
                rel={entry.learnMoreUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (!entry.learnMoreUrl!.startsWith('http')) {
                    e.preventDefault();
                    window.open(entry.learnMoreUrl!, '_blank');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {entry.learnMoreLabel || 'Learn more'}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* See Also — chain-linked related entries */}
            {entry.relatedEntries && entry.relatedEntries.length > 0 && (() => {
              const related = getRelatedEntries(entry.id);
              if (related.length === 0) return null;
              return (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">See also</span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {related.map(rel => (
                      <button
                        key={rel.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Expand the related entry and scroll to it
                          setExpandedEntries(prev => new Set([...prev, rel.id]));
                          for (const ch of FAQ_CHAPTERS) {
                            if (ch.entries.some(e => e.id === rel.id)) {
                              setExpandedChapters(prev => new Set([...prev, ch.id]));
                              break;
                            }
                          }
                          setTimeout(() => {
                            const el = entryRefs.current[rel.id];
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              el.classList.add('ring-2', 'ring-amber-400/60');
                              setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400/60'), 3000);
                            }
                          }, 100);
                        }}
                        className="px-2.5 py-1 rounded-md text-xs bg-slate-700/40 border border-slate-600/40 text-amber-300/80 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all"
                        style={{ cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
                      >
                        {rel.question.length > 50 ? rel.question.slice(0, 47) + '...' : rel.question}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  const renderChapter = (chapter: FAQChapter) => {
    const isExpanded = expandedChapters.has(chapter.id);
    return (
      <div key={chapter.id} className="mb-6">
        <button
          onClick={() => toggleChapter(chapter.id)}
          className="w-full text-left flex items-center gap-3 px-2 py-3 group"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="text-2xl">{chapter.icon}</span>
          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            >
              {chapter.title}
            </h2>
            <p className="text-sm text-slate-400">{chapter.subtitle}</p>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-slate-500 shrink-0 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <span className="text-xs text-slate-500 shrink-0">
            {chapter.entries.length} questions
          </span>
        </button>

        {isExpanded && (
          <div className="space-y-2 mt-1">
            {chapter.entries.map(entry => renderEntry(entry))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 text-slate-400 hover:text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-4">
            <Search className="h-10 w-10 text-amber-400" />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-400">
            Everything you need to know about Liana Banyan, organized by topic.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Part of the Nervous System — the platform explaining itself.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions... (e.g. 'marks', 'no ads', 'cost')"
            className="w-full pl-12 pr-12 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", fontSize: '1rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick jump — chapter pills */}
        {!searchResults && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {FAQ_CHAPTERS.map(ch => (
              <button
                key={ch.id}
                onClick={() => {
                  setExpandedChapters(prev => new Set([...prev, ch.id]));
                  document.getElementById(`chapter-${ch.id}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-full text-sm bg-slate-800/60 border border-slate-700 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition-all"
                style={{ cursor: 'pointer', fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
              >
                {ch.icon} {ch.title}
              </button>
            ))}
          </div>
        )}

        {/* Search results */}
        {searchResults && (
          <div className="mb-8">
            <p className="text-sm text-slate-400 mb-4">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {searchResults.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">No questions match your search.</p>
                  <p className="text-sm text-slate-500 mt-1">Try different keywords or browse by chapter below.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {searchResults.map(entry => renderEntry(entry, true))}
              </div>
            )}
          </div>
        )}

        {/* Chapters */}
        {!searchResults && (
          <div>
            {FAQ_CHAPTERS.map(chapter => (
              <div key={chapter.id} id={`chapter-${chapter.id}`}>
                {renderChapter(chapter)}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <Card className="mt-12 bg-slate-800/30 border-slate-700">
          <CardContent className="py-6 text-center">
            <p className="text-amber-300 italic text-lg mb-2">
              "Help Each Other, Help Ourselves."
            </p>
            <p className="text-slate-500 text-sm">
              Can't find your answer? Explore the{' '}
              <a href="/learn" className="text-amber-400 hover:text-amber-300" onClick={(e) => { e.preventDefault(); navigate('/learn'); }}>
                Alcove Hallway
              </a>{' '}
              or visit{' '}
              <a href="/support" className="text-amber-400 hover:text-amber-300" onClick={(e) => { e.preventDefault(); navigate('/support'); }}>
                Community Support
              </a>.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
