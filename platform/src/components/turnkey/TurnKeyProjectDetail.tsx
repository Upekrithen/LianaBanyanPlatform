import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, PartyPopper } from 'lucide-react';
import { useTurnKeyProject } from '@/hooks/useTurnKeyProject';
import { useShowcaseDemand } from '@/hooks/useShowcaseDemand';
import { MatchedFundingBar } from './MatchedFundingBar';
import { TierCascadeVisual } from './TierCascadeVisual';
import { EarlyAdopterMeter } from './EarlyAdopterMeter';
import { BackingModal } from './BackingModal';
import { RedCarpetBanner } from '@/components/showcase/RedCarpetBanner';
import { DemandSignalPanel } from '@/components/showcase/DemandSignalPanel';
import { PledgeModal } from '@/components/showcase/PledgeModal';
import { BridgeLinks } from '@/components/bridge/BridgeLinks';

const METHOD_LABELS: Record<string, string> = {
  fdm: 'FDM', sla: 'SLA', sls: 'SLS', injection: 'Injection Mold',
  handmade: 'Handmade', digital: 'Digital', mixed: 'Mixed',
};

const PLATFORM_LABELS: Record<string, string> = {
  reddit: 'Reddit', etsy: 'Etsy', instagram: 'Instagram', discord: 'Discord',
  twitter: 'Twitter/X', tiktok: 'TikTok', website: 'Website', manual: 'Manual',
};

export default function TurnKeyProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { project, tiers, backerCount, isLoading } = useTurnKeyProject(slug);
  const demand = useShowcaseDemand(project?.id);
  const [showBacking, setShowBacking] = useState(false);
  const [showPledge, setShowPledge] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>;
  }

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Project not found.</div>;
  }

  const isShowcased = project.status === 'showcased';
  const wasClaimed = project.status === 'active' && (project as Record<string, unknown>).claimed_at;

  const unitPrice = tiers.find(t => t.tier === project.current_tier)?.unit_price_credits ?? Math.ceil(project.creator_backing_credits * 1.2);
  const remaining = project.early_adopter_slots - project.early_adopter_filled;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Conversion celebration banner */}
      {wasClaimed && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <PartyPopper className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            {project.creator_display_name || 'The creator'} joined! Pledges are now pre-orders.
          </p>
        </div>
      )}

      {/* Showcase Banner — replaces normal backing panel */}
      {isShowcased && (
        <RedCarpetBanner
          wantCount={demand.wantCount}
          pledgeTotal={demand.pledgeTotal}
          commentCount={demand.comments.length}
          creatorName={project.creator_display_name || undefined}
          onWantClick={() => {/* handled inside WantThisButton in sidebar */}}
          onPledgeClick={() => setShowPledge(true)}
        />
      )}

      {/* Image Gallery */}
      {project.images && project.images.length > 0 && (
        <div className="space-y-2">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img src={project.images[imageIdx]} alt={project.title} className="w-full h-full object-cover" />
          </div>
          {project.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {project.images.map((img, i) => (
                <button key={i} onClick={() => setImageIdx(i)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 ${i === imageIdx ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title + Meta */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground mt-1">{project.description}</p>
          {/* Source attribution for showcased projects */}
          {isShowcased && (project as Record<string, unknown>).showcase_source_platform && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <span>Spotted on {PLATFORM_LABELS[(project as Record<string, unknown>).showcase_source_platform as string] || (project as Record<string, unknown>).showcase_source_platform}</span>
              {(project as Record<string, unknown>).showcase_source_url && (
                <a href={(project as Record<string, unknown>).showcase_source_url as string} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline inline-flex items-center gap-0.5">
                  View source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="secondary">{project.category}</Badge>
          {project.production_method && (
            <Badge variant="outline">{METHOD_LABELS[project.production_method] || project.production_method}</Badge>
          )}
        </div>
      </div>

      {/* Bridge-to-Local: outbound links to creator's other shops */}
      <BridgeLinks creatorId={project.creator_id} />

      {isShowcased ? (
        /* Demand Signal Panel — replaces tier cascade + backing for showcased */
        <DemandSignalPanel demand={demand} projectId={project.id} onPledgeClick={() => setShowPledge(true)} />
      ) : (
        <>
          {/* Matched Funding Panel */}
          <MatchedFundingBar
            creatorBacking={project.creator_backing_credits}
            communityMatched={project.community_matched}
            matchingCap={project.matching_cap}
          />

          <Button size="lg" className="w-full" onClick={() => setShowBacking(true)}>
            Back This Project
          </Button>

          {/* Tier Cascade */}
          <Card>
            <CardHeader><CardTitle className="text-base">Production Cascade</CardTitle></CardHeader>
            <CardContent>
              <TierCascadeVisual
                currentTier={project.current_tier}
                earlyAdopterFilled={project.early_adopter_filled}
                earlyAdopterSlots={project.early_adopter_slots}
              />
            </CardContent>
          </Card>

          {/* Early Adopter Section */}
          <Card>
            <CardHeader><CardTitle className="text-base">Early Adopter</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <EarlyAdopterMeter filled={project.early_adopter_filled} total={project.early_adopter_slots} />

              <div className="grid grid-cols-2 gap-3">
                {project.stl_file_url && (
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Print It Yourself</div>
                    <div className="text-xs text-muted-foreground">Download STL file</div>
                    <div className="text-primary font-bold mt-2">{Math.ceil(unitPrice * 0.6).toLocaleString()} Credits</div>
                  </div>
                )}
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Get It Shipped</div>
                  <div className="text-xs text-muted-foreground">Production + shipping</div>
                  <div className="text-primary font-bold mt-2">{unitPrice.toLocaleString()} Credits</div>
                </div>
              </div>

              {remaining > 0 && remaining <= 15 && (
                <p className="text-sm text-amber-600 font-medium text-center animate-pulse">
                  Only {remaining} of {project.early_adopter_slots} slots remaining!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Backer count */}
          <p className="text-center text-sm text-muted-foreground">
            {backerCount} {backerCount === 1 ? 'person has' : 'people have'} backed this project
          </p>

          <BackingModal
            open={showBacking}
            onClose={() => setShowBacking(false)}
            projectId={project.id}
            projectTitle={project.title}
            unitPriceCredits={unitPrice}
            hasStl={!!project.stl_file_url}
          />
        </>
      )}

      {/* Pledge modal for showcased projects */}
      {isShowcased && (
        <PledgeModal
          open={showPledge}
          onClose={() => setShowPledge(false)}
          projectId={project.id}
          projectTitle={project.title}
          creatorName={project.creator_display_name || undefined}
        />
      )}
    </div>
  );
}
