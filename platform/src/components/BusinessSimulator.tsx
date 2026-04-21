/**
 * Business Simulator Component
 *
 * Allows users (including Ghosts) to run "what-if" business simulations
 * using platform economics defaults before committing real resources.
 *
 * Innovation #1188: Contingency Operators
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  Play,
  RefreshCcw,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Target,
  Lightbulb,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  INITIATIVE_TEMPLATES,
  PLATFORM_ECONOMICS,
  createBusinessScenario,
  getDefaultAssumptions,
  calculateProjectedOutcomes,
  createThoughtExperiment,
  getInitiativesByCategory,
  type BusinessScenario,
  type BusinessAssumptions,
  type BusinessProjections,
  type InitiativeTemplate,
} from '@/lib/businessSimulationService';

interface BusinessSimulatorProps {
  onSimulationComplete?: (scenario: BusinessScenario, projections: BusinessProjections) => void;
  onAdopt?: (scenario: BusinessScenario) => void;
  isGhostMode?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Food & Home',
  health: 'Health & Safety',
  finance: 'Finance & Work',
  creative: 'Creative & Learning',
  growth: 'Growth',
};

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-green-100 text-green-800',
  health: 'bg-red-100 text-red-800',
  finance: 'bg-blue-100 text-blue-800',
  creative: 'bg-purple-100 text-purple-800',
  growth: 'bg-amber-100 text-amber-800',
};

export function BusinessSimulator({
  onSimulationComplete,
  onAdopt,
  isGhostMode = false
}: BusinessSimulatorProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // State
  const [selectedInitiative, setSelectedInitiative] = useState<string>('');
  const [assumptions, setAssumptions] = useState<BusinessAssumptions | null>(null);
  const [projections, setProjections] = useState<BusinessProjections | null>(null);
  const [scenario, setScenario] = useState<BusinessScenario | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  // Grouped initiatives
  const initiativesByCategory = useMemo(() => getInitiativesByCategory(), []);
  const selectedTemplate = useMemo(
    () => INITIATIVE_TEMPLATES.find(t => t.id === selectedInitiative),
    [selectedInitiative]
  );

  // Load defaults when initiative changes
  useEffect(() => {
    if (selectedInitiative) {
      const defaults = getDefaultAssumptions(selectedInitiative);
      setAssumptions(defaults);
      setProjections(null);
      setHasRun(false);
      setScenarioName(selectedTemplate?.name || 'My Business');
    }
  }, [selectedInitiative, selectedTemplate]);

  // Update assumption helper
  const updateAssumption = (key: keyof BusinessAssumptions, value: number) => {
    if (assumptions) {
      setAssumptions({ ...assumptions, [key]: value });
    }
  };

  // Run simulation
  const runSimulation = async () => {
    if (!selectedInitiative || !assumptions) return;

    setIsRunning(true);

    // Simulate processing delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const newScenario = createBusinessScenario(selectedInitiative, assumptions);
    newScenario.name = scenarioName || `${selectedTemplate?.name} Simulation`;

    const newProjections = calculateProjectedOutcomes(assumptions);

    newScenario.projections = newProjections;
    newScenario.status = 'completed';

    setScenario(newScenario);
    setProjections(newProjections);
    setHasRun(true);
    setIsRunning(false);

    onSimulationComplete?.(newScenario, newProjections);

    toast({
      title: "Simulation Complete",
      description: `Net score: ${(newProjections.netScore * 100).toFixed(0)}%`,
    });
  };

  // Save to database (members only)
  const saveSimulation = async () => {
    if (!scenario || !user) {
      toast({
        title: "Sign up to save",
        description: "Become a member to save your simulations",
        variant: "destructive",
      });
      return;
    }

    const result = await createThoughtExperiment(scenario, user.id);
    if (result) {
      toast({
        title: "Saved!",
        description: "Your simulation has been saved to Thought Experiments",
      });
    }
  };

  // Adopt scenario (begin real business)
  const handleAdopt = () => {
    if (scenario) {
      onAdopt?.(scenario);
      toast({
        title: "Ready to start!",
        description: "Your business idea is ready to become real",
      });
    }
  };

  // Reset
  const resetSimulation = () => {
    if (selectedInitiative) {
      const defaults = getDefaultAssumptions(selectedInitiative);
      setAssumptions(defaults);
    }
    setProjections(null);
    setScenario(null);
    setHasRun(false);
  };

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.7) return 'bg-green-100';
    if (score >= 0.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Business Simulator
            {isGhostMode && <Badge variant="outline">Ghost Mode</Badge>}
          </CardTitle>
          <CardDescription>
            Test your business idea with platform economics before committing real resources.
            Creators/Workers keep 83.3% — always.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Initiative Type</Label>
              <Select value={selectedInitiative} onValueChange={setSelectedInitiative}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an initiative..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(initiativesByCategory).map(([category, templates]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {CATEGORY_LABELS[category] || category}
                      </div>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scenario Name</Label>
              <Input
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="My Business Idea"
              />
            </div>
          </div>

          {selectedTemplate && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={CATEGORY_COLORS[selectedTemplate.category]}>
                  {CATEGORY_LABELS[selectedTemplate.category]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assumptions Editor */}
      {assumptions && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Assumptions
            </CardTitle>
            <CardDescription>
              Adjust these values to match your situation. Defaults are based on platform data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="capacity">Capacity</TabsTrigger>
              </TabsList>

              <TabsContent value="revenue" className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Average Order Value</Label>
                    <span className="text-sm font-medium">${assumptions.averageOrderValue}</span>
                  </div>
                  <Slider
                    value={[assumptions.averageOrderValue]}
                    onValueChange={([v]) => updateAssumption('averageOrderValue', v)}
                    min={5}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Orders Per Week</Label>
                    <span className="text-sm font-medium">{assumptions.ordersPerWeek}</span>
                  </div>
                  <Slider
                    value={[assumptions.ordersPerWeek]}
                    onValueChange={([v]) => updateAssumption('ordersPerWeek', v)}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Customer Retention Rate</Label>
                    <span className="text-sm font-medium">{(assumptions.customerRetentionRate * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[assumptions.customerRetentionRate * 100]}
                    onValueChange={([v]) => updateAssumption('customerRetentionRate', v / 100)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Monthly Growth Rate</Label>
                    <span className="text-sm font-medium">{(assumptions.monthlyGrowthRate * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[assumptions.monthlyGrowthRate * 100]}
                    onValueChange={([v]) => updateAssumption('monthlyGrowthRate', v / 100)}
                    min={0}
                    max={30}
                    step={1}
                  />
                </div>
              </TabsContent>

              <TabsContent value="costs" className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Cost of Goods Sold</Label>
                    <span className="text-sm font-medium">{(assumptions.costOfGoodsSoldPercent * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[assumptions.costOfGoodsSoldPercent * 100]}
                    onValueChange={([v]) => updateAssumption('costOfGoodsSoldPercent', v / 100)}
                    min={5}
                    max={90}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Platform Fee (Cost + 20%)</Label>
                    <span className="text-sm font-medium text-muted-foreground">
                      {((1 - PLATFORM_ECONOMICS.CREATOR_SHARE) * 100).toFixed(1)}% (fixed)
                    </span>
                  </div>
                  <Progress value={(1 - PLATFORM_ECONOMICS.CREATOR_SHARE) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    You keep 83.3% of revenue. This cannot be changed.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Customer Acquisition Cost</Label>
                    <span className="text-sm font-medium">${assumptions.customerAcquisitionCost}</span>
                  </div>
                  <Slider
                    value={[assumptions.customerAcquisitionCost]}
                    onValueChange={([v]) => updateAssumption('customerAcquisitionCost', v)}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
              </TabsContent>

              <TabsContent value="capacity" className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Hours Per Week</Label>
                    <span className="text-sm font-medium">{assumptions.hoursPerWeek}h</span>
                  </div>
                  <Slider
                    value={[assumptions.hoursPerWeek]}
                    onValueChange={([v]) => updateAssumption('hoursPerWeek', v)}
                    min={1}
                    max={60}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Capacity Utilization</Label>
                    <span className="text-sm font-medium">{(assumptions.productionCapacityUtilization * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[assumptions.productionCapacityUtilization * 100]}
                    onValueChange={([v]) => updateAssumption('productionCapacityUtilization', v / 100)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={runSimulation} disabled={isRunning} className="flex-1">
              {isRunning ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
            {hasRun && (
              <Button variant="outline" onClick={resetSimulation}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Results */}
      {projections && scenario && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Simulation Results
              <Badge className={getScoreBg(projections.netScore)}>
                {(projections.netScore * 100).toFixed(0)}% Score
              </Badge>
            </CardTitle>
            <CardDescription>
              Based on platform economics and your assumptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Monthly Revenue */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Monthly Revenue
                  </div>
                  <p className="text-2xl font-bold">
                    ${projections.monthlyRevenue.toFixed(0)}
                  </p>
                </CardContent>
              </Card>

              {/* Monthly Profit */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Monthly Net Benefit
                  </div>
                  <p className={`text-2xl font-bold ${projections.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${projections.monthlyProfit.toFixed(0)}
                  </p>
                </CardContent>
              </Card>

              {/* Break-even */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Target className="h-4 w-4" />
                    Break-even
                  </div>
                  <p className="text-2xl font-bold">
                    {projections.breakEvenMonths} months
                  </p>
                </CardContent>
              </Card>

              {/* Hourly Rate */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Clock className="h-4 w-4" />
                    $/Hour
                  </div>
                  <p className={`text-2xl font-bold ${projections.returnOnTime >= 15 ? 'text-green-600' : 'text-amber-600'}`}>
                    ${projections.returnOnTime.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Detailed Metrics */}
            <div className="space-y-4">
              <h4 className="font-semibold">Detailed Analysis</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Revenue (Year 1)</span>
                    <span className="font-medium">${projections.annualRevenue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Net Benefit</span>
                    <span className="font-medium">${projections.annualProfit.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net Margin</span>
                    <span className="font-medium">{(projections.profitMargin * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orders to Break Even</span>
                    <span className="font-medium">{projections.breakEvenOrders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Expenses</span>
                    <span className="font-medium">${projections.monthlyExpenses.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data Confidence</span>
                    <span className="font-medium">{(projections.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Net Score Breakdown */}
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Net Score</span>
                  <span className={`text-xl font-bold ${getScoreColor(projections.netScore)}`}>
                    {(projections.netScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={projections.netScore * 100}
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on viability (40%), sustainability (35%), and utilization (25%)
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {!isGhostMode && user && (
              <Button onClick={saveSimulation} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save to Thought Experiments
              </Button>
            )}
            {projections.netScore >= 0.5 && onAdopt && (
              <Button onClick={handleAdopt} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Adopt This Plan
              </Button>
            )}
            {isGhostMode && (
              <p className="text-sm text-muted-foreground">
                <Users className="inline h-4 w-4 mr-1" />
                Become a member ($5/year) to save simulations
              </p>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Factor Templates Preview */}
      {selectedTemplate && !hasRun && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Simulation Factors</CardTitle>
            <CardDescription>
              These factors will influence your scenario outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.factors.map(factor => (
                <Badge key={factor.name} variant="outline" className="py-1">
                  {factor.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({(factor.weight * 100).toFixed(0)}%)
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BusinessSimulator;
