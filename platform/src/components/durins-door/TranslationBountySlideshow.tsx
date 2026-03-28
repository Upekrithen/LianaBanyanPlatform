import { useState } from 'react';
import { ChevronUp, ChevronDown, BookOpen, ArrowLeft, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlipSection } from '@/components/FlipSection';
import { type TranslationBounty } from '@/data/translationBounties';

interface TranslationBountySlideshowProps {
  bounties: TranslationBounty[];
  allUnlocked: boolean;
}

export function TranslationBountySlideshow({ bounties, allUnlocked }: TranslationBountySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const visibleBounties = allUnlocked ? bounties : bounties.slice(0, 5);
  const bounty = visibleBounties[currentIndex] || visibleBounties[0];
  const isLocked = !allUnlocked && currentIndex >= 2;

  const goUp = () => {
    setFlippedId(null);
    setCurrentIndex((prev) => (prev <= 0 ? visibleBounties.length - 1 : prev - 1));
  };
  const goDown = () => {
    setFlippedId(null);
    setCurrentIndex((prev) => (prev >= visibleBounties.length - 1 ? 0 : prev + 1));
  };

  if (!bounty) return null;

  return (
    <div className="flex flex-col h-full" data-xray-id="durins-door-slideshow">
      {/* Title bar with arrows */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-stone-700/50">
        <button onClick={goUp} className="p-1 rounded hover:bg-stone-700/50 text-stone-400 hover:text-stone-200 transition-colors">
          <ChevronUp className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-stone-200">Translation Bounties</span>
          <span className="text-xs text-stone-500">{currentIndex + 1}/{visibleBounties.length}</span>
        </div>
        <button onClick={goDown} className="p-1 rounded hover:bg-stone-700/50 text-stone-400 hover:text-stone-200 transition-colors">
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Bounty card area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {isLocked ? (
          <div className="text-center p-6 rounded-lg bg-stone-800/50 border border-stone-700">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm text-stone-400 mb-1">Locked</p>
            <p className="text-xs text-stone-500">Enter "friend" in 12 languages to unlock all bounties</p>
          </div>
        ) : (
          <FlipSection
            isFlipped={flippedId === bounty.id}
            className="w-full max-w-md"
            front={
              <div
                className="p-5 rounded-lg border border-stone-600 bg-stone-800/80 cursor-pointer hover:border-emerald-500/50 transition-colors"
                onClick={() => setFlippedId(bounty.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                    <h3 className="text-base font-semibold text-stone-100">{bounty.document}</h3>
                  </div>
                  <span className="text-lg font-bold text-emerald-400 whitespace-nowrap ml-2">{bounty.marks} Marks</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-stone-400">Target: {bounty.language}</p>
                  <Badge variant={bounty.status === 'in-progress' ? 'secondary' : 'outline'} className="text-xs">
                    {bounty.status === 'in-progress' ? 'In Progress' : 'Open'}
                  </Badge>
                </div>
                <p className="text-xs text-emerald-500/60 mt-3 text-center">tap to see details</p>
              </div>
            }
            back={
              <div className="p-5 rounded-lg border border-emerald-500/30 bg-stone-800/90">
                <h3 className="text-base font-bold text-emerald-400 mb-2">Translate: {bounty.document}</h3>
                <p className="text-xs text-stone-300 mb-3">
                  Translate this document into {bounty.language}. Use X-Ray Goggles to see the
                  source text alongside the translation interface. Verified translations earn {bounty.marks} Marks.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Eye className="h-3 w-3 text-cyan-400" />
                    <span>Use X-Ray Goggles to view source text in context</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                    <span>Submit via the Help Wanted bounty board</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs text-stone-400" onClick={() => setFlippedId(null)}>
                    <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </Button>
                  <Button size="sm" className="text-xs flex-1 bg-emerald-600 hover:bg-emerald-700" asChild>
                    <a href="/help-wanted" target="_blank" rel="noopener noreferrer">Translate</a>
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href="/help-wanted">View All</a>
                  </Button>
                </div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default TranslationBountySlideshow;
