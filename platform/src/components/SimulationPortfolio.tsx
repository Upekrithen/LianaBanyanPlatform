/**
 * Simulation Portfolio Component
 * ==============================
 * Displays saved business simulations from Thought Experiment.
 * Members: Persisted in database
 * Ghosts: Stored in localStorage (browser only)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FolderOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Target,
  Eye,
  CheckCircle2,
  Ghost,
  Trash2,
  Calendar,
} from 'lucide-react';
import type { BusinessScenario, BusinessProjections } from '@/lib/businessSimulationService';

interface SavedSimulation {
  scenario: BusinessScenario;
  projections: BusinessProjections;
  savedAt: string;
}

interface SimulationPortfolioProps {
  simulations: SavedSimulation[];
  isGhostMode?: boolean;
  onViewDetails?: (sim: SavedSimulation) => void;
  onAdopt?: (sim: SavedSimulation) => void;
  onDelete?: (sim: SavedSimulation) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  health: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  finance: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  creative: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  growth: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
};

export function SimulationPortfolio({
  simulations,
  isGhostMode = false,
  onViewDetails,
  onAdopt,
  onDelete,
}: SimulationPortfolioProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (score >= 0.5) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const sortedSimulations = [...simulations].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  if (simulations.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Simulations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Run your first "What If?" simulation to see it here.
          </p>
          {isGhostMode && (
            <p className="text-sm text-muted-foreground">
              <Ghost className="inline w-4 h-4 mr-1" />
              Ghost simulations are stored in your browser only.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{simulations.length}</div>
            <div className="text-xs text-muted-foreground">Total Simulations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {simulations.filter(s => s.projections.netScore >= 0.7).length}
            </div>
            <div className="text-xs text-muted-foreground">High Score (70%+)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              ${Math.max(...simulations.map(s => s.projections.monthlyProfit)).toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">Best Monthly Margin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              ${Math.max(...simulations.map(s => s.projections.returnOnTime)).toFixed(2)}/hr
            </div>
            <div className="text-xs text-muted-foreground">Best Hourly Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Your Simulations
            {isGhostMode && (
              <Badge variant="outline" className="ml-2 gap-1">
                <Ghost className="w-3 h-3" />
                Browser Only
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {simulations.length} simulation{simulations.length !== 1 ? 's' : ''} saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {sortedSimulations.map((sim, index) => (
                <Card key={index} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {sim.scenario.name || sim.scenario.initiativeName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={CATEGORY_COLORS[sim.scenario.category] || 'bg-muted'}
                          >
                            {sim.scenario.initiativeName}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(sim.savedAt)}
                          </span>
                        </div>
                      </div>
                      <Badge className={getScoreBadgeClass(sim.projections.netScore)}>
                        {(sim.projections.netScore * 100).toFixed(0)}% Score
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <DollarSign className="w-3 h-3" />
                          Revenue
                        </div>
                        <div className="font-bold">${sim.projections.monthlyRevenue.toFixed(0)}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          {sim.projections.monthlyProfit >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          Margin
                        </div>
                        <div className={`font-bold ${sim.projections.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${sim.projections.monthlyProfit.toFixed(0)}
                        </div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <Target className="w-3 h-3" />
                          Break-even
                        </div>
                        <div className="font-bold">{sim.projections.breakEvenMonths} mo</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          $/Hour
                        </div>
                        <div className={`font-bold ${sim.projections.returnOnTime >= 15 ? 'text-green-600' : 'text-amber-600'}`}>
                          ${sim.projections.returnOnTime.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onViewDetails && (
                        <Button variant="outline" size="sm" onClick={() => onViewDetails(sim)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      )}
                      {onAdopt && sim.projections.netScore >= 0.5 && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onAdopt(sim)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Adopt
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          onClick={() => onDelete(sim)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimulationPortfolio;
