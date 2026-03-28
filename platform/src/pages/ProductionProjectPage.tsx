import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Factory, Trophy, Shield, ChevronRight, Users, Coins, Target,
  ArrowUp, Hammer, Crown, Star, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  useProject, useProjectBounties, useProjectCaptains, useClaimBounty, useNominateCaptain,
  type ProductionLevel, type Product,
} from '@/hooks/useProductionProjects';
import { PledgeModal } from '@/components/projects/PledgeModal';

/* ── Bounty-to-Partnership ladder ── */
const LADDER = [
  { marks: 0, title: 'Bounty Hunter', mult: '1×', color: 'text-gray-500' },
  { marks: 500, title: 'Contractor', mult: '1.5×', color: 'text-blue-500' },
  { marks: 1000, title: 'Senior Contractor', mult: '1.75×', color: 'text-indigo-500' },
  { marks: 2000, title: 'Partner', mult: '2×, revenue share', color: 'text-amber-600' },
  { marks: 5000, title: 'Senior Partner', mult: '2.5×', color: 'text-yellow-500' },
];

/* ── Tier Card ── */
function TierCard({
  level, activeTierNumber, productName, onPledge,
}: {
  level: ProductionLevel;
  activeTierNumber: number;
  productName?: string;
  onPledge: (level: ProductionLevel) => void;
}) {
  const isActive = level.level_number === activeTierNumber;
  const color = level.is_funded ? 'border-green-500/50 bg-green-50/40 dark:bg-green-950/20'
    : isActive ? 'border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20 ring-2 ring-amber-400/30'
    : 'border-border bg-muted/30';

  return (
    <div className={cn('rounded-lg border p-4 transition-all', color)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant={level.is_funded ? 'default' : 'secondary'} className="flex-shrink-0">
            Level {level.level_number}
          </Badge>
          <span className="font-semibold truncate">{level.level_name}</span>
          {isActive && !level.is_funded && (
            <Badge className="bg-amber-500 text-white text-xs flex-shrink-0">Active</Badge>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            {level.units_count.toLocaleString()} units × ${level.unit_price.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>
            ${level.current_votes.toLocaleString()} / ${level.votes_needed.toLocaleString()}
          </span>
          <span className="font-medium">{level.progress_pct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={cn(
              'h-2.5 rounded-full transition-all duration-500',
              level.is_funded ? 'bg-green-500' : 'bg-amber-500',
            )}
            style={{ width: `${level.progress_pct}%` }}
          />
        </div>
      </div>

      {!level.is_funded && (
        <Button size="sm" className="mt-3 w-full" onClick={() => onPledge(level)}>
          <Coins className="h-4 w-4 mr-1" /> Pledge
        </Button>
      )}
      {level.is_funded && (
        <p className="text-xs text-green-600 font-medium mt-2 text-center">Fully Funded</p>
      )}
    </div>
  );
}

/* ── Product Tier Section ── */
function ProductSection({ product }: { product: Product }) {
  const [pledgeLevel, setPledgeLevel] = useState<ProductionLevel | null>(null);
  const activeTier = product.levels.find((l) => !l.is_funded)?.level_number ?? 999;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">{product.name}</h3>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {product.levels.map((l) => (
          <TierCard
            key={l.id}
            level={l}
            activeTierNumber={activeTier}
            productName={product.name}
            onPledge={setPledgeLevel}
          />
        ))}
      </div>
      <PledgeModal
        open={!!pledgeLevel}
        onOpenChange={(o) => !o && setPledgeLevel(null)}
        level={pledgeLevel}
        productName={product.name}
      />
    </div>
  );
}

/* ── Page ── */
export default function ProductionProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProject(projectId);
  const { user } = useAuth();

  const isCanister = project?.name?.toLowerCase().includes('canister');
  const bountyCategory = isCanister ? 'manufacturing' : undefined;

  const { data: bounties = [] } = useProjectBounties(bountyCategory);
  const { data: captains = [] } = useProjectCaptains(project?.name?.split('—')[0]?.trim());
  const claimBounty = useClaimBounty();
  const nominate = useNominateCaptain();

  const totalMarks = bounties.reduce((s, b) => s + b.reward_marks, 0);

  if (!project) {
    return (
      <PortalPageLayout title="Production Project" subtitle="Loading…" maxWidth="xl" xrayId="production-project">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Loading project…</div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title={project.name}
      subtitle={isCanister ? 'DO THE WORK = GET THE STATUS' : `Campaign · ${project.products.length} product${project.products.length > 1 ? 's' : ''}`}
      maxWidth="xl"
      xrayId="production-project-page"
    >
      <div className="space-y-8">

        {/* ── Hero / Overall Progress ── */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-muted-foreground">{project.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall Funding</span>
                <span>${project.total_pledged.toLocaleString()} / ${project.total_target.toLocaleString()}</span>
              </div>
              <Progress value={project.overall_pct} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">{project.overall_pct.toFixed(1)}% funded</p>
            </div>
          </CardContent>
        </Card>

        {/* ── Production Tiers ── */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Factory className="h-5 w-5 text-amber-500" /> Production Tiers
          </h2>
          {project.products.length === 1 ? (
            <ProductSection product={project.products[0]} />
          ) : (
            <Tabs defaultValue={project.products[0]?.id}>
              <TabsList className="mb-4">
                {project.products.map((p) => (
                  <TabsTrigger key={p.id} value={p.id}>{p.name}</TabsTrigger>
                ))}
              </TabsList>
              {project.products.map((p) => (
                <TabsContent key={p.id} value={p.id}>
                  <ProductSection product={p} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </section>

        {/* ── Bounty Board ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" /> Bounty Board
            </h2>
            <Badge variant="outline" className="text-xs">
              {bounties.length} open · {totalMarks.toLocaleString()} Marks available
            </Badge>
          </div>
          {bounties.length === 0 ? (
            <p className="text-muted-foreground text-sm">No open bounties for this project right now.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {bounties.map((b) => (
                <Card key={b.id} data-xray-id={`bounty-${b.id}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm leading-tight">{b.title}</h4>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs capitalize">{b.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">{b.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                        <Target className="h-4 w-4" /> {b.reward_marks} Marks
                      </div>
                      {user ? (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={claimBounty.isPending}
                          onClick={() => claimBounty.mutate(b.id)}
                        >
                          Claim
                        </Button>
                      ) : (
                        <Link to="/auth">
                          <Button size="sm" variant="outline">Sign in to Claim</Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-3 text-right">
            <Link to="/dashboard/bounty-arena" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Full Bounty Arena <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* ── Captain Seats ── */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-purple-500" /> Captain Seats
          </h2>
          {captains.length === 0 ? (
            <p className="text-muted-foreground text-sm">No leadership seats found for this project.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {captains.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">{c.seat_title}</h4>
                      <Badge variant={c.status === 'open' ? 'default' : 'secondary'} className="capitalize text-xs">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.invited_description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {c.support_count} supporters
                      </span>
                      {c.status === 'open' && user && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={nominate.isPending}
                          onClick={() => nominate.mutate(c.id)}
                        >
                          <Star className="h-3 w-3 mr-1" /> Nominate / Apply
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── Bounty-to-Partnership Ladder ── */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <ArrowUp className="h-5 w-5 text-green-500" /> Bounty → Partnership Ladder
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-amber-400 to-yellow-500" />
                {LADDER.map((step, i) => (
                  <div key={step.marks} className="relative flex items-start gap-3">
                    <div className={cn(
                      'absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                      'bg-background',
                      i === 0 ? 'border-gray-400' : 'border-amber-500',
                    )}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn('font-bold text-sm', step.color)}>{step.title}</span>
                        <Badge variant="outline" className="text-xs">{step.mult}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {step.marks === 0 ? 'Start here' : `${step.marks.toLocaleString()}+ Marks earned`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </PortalPageLayout>
  );
}
