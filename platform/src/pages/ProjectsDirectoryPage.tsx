import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Factory, Package, Trophy, Crown, ChevronRight, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects, useProjectBounties, useProjectCaptains } from '@/hooks/useProductionProjects';

type SortKey = 'funding' | 'bounties' | 'alpha';

export default function ProjectsDirectoryPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: allBounties = [] } = useProjectBounties();
  const { data: allCaptains = [] } = useProjectCaptains();
  const [sort, setSort] = useState<SortKey>('funding');

  const sorted = useMemo(() => {
    const list = [...projects];
    switch (sort) {
      case 'funding':
        return list.sort((a, b) => b.overall_pct - a.overall_pct);
      case 'bounties':
        return list.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aBounties = allBounties.filter((bty) =>
            bty.category === 'manufacturing' ? aName.includes('canister') : true
          ).length;
          const bBounties = allBounties.filter((bty) =>
            bty.category === 'manufacturing' ? bName.includes('canister') : true
          ).length;
          return bBounties - aBounties;
        });
      case 'alpha':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [projects, sort, allBounties]);

  const bountyCountFor = (name: string) => {
    const isCanister = name.toLowerCase().includes('canister');
    return allBounties.filter((b) => (isCanister ? b.category === 'manufacturing' : true)).length;
  };

  const captainCountFor = (name: string) => {
    const prefix = name.split('—')[0]?.trim();
    return allCaptains.filter((c) => c.initiative?.includes(prefix)).length;
  };

  const openCaptainCountFor = (name: string) => {
    const prefix = name.split('—')[0]?.trim();
    return allCaptains.filter((c) => c.initiative?.includes(prefix) && c.status === 'open').length;
  };

  return (
    <PortalPageLayout
      title="Production Projects"
      subtitle="What's being built — and how you can contribute"
      maxWidth="xl"
      xrayId="projects-directory"
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="funding">Funding Progress</SelectItem>
              <SelectItem value="bounties">Bounty Count</SelectItem>
              <SelectItem value="alpha">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-muted-foreground">Loading projects…</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Factory className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No production projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((proj) => {
              const bCount = bountyCountFor(proj.name);
              const cTotal = captainCountFor(proj.name);
              const cOpen = openCaptainCountFor(proj.name);
              return (
                <Card key={proj.id} className="hover:shadow-md transition-shadow" data-xray-id={`project-card-${proj.id}`}>
                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Factory className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{proj.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {proj.products.length} product{proj.products.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Funding</span>
                        <span className="font-medium">{proj.overall_pct.toFixed(1)}%</span>
                      </div>
                      <Progress value={proj.overall_pct} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        ${proj.total_pledged.toLocaleString()} / ${proj.total_target.toLocaleString()}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> {proj.products.length} product{proj.products.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" /> {bCount} bounties
                      </span>
                      <span className="flex items-center gap-1">
                        <Crown className="h-3 w-3 text-purple-500" />
                        {cOpen > 0 ? `${cOpen} open seat${cOpen !== 1 ? 's' : ''}` : `${cTotal} seat${cTotal !== 1 ? 's' : ''}`}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link to={`/production/${proj.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Project <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
