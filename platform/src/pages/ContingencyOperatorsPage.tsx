/**
 * Contingency Operators — Thought Experiment System
 * Innovation #1188
 * 
 * Non-destructive what-if scenario sandboxes for testing platform changes
 * before committing to REALITY.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExpandableBlock } from '@/components/pudding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { 
  FlaskConical, 
  GitBranch, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  Info
} from 'lucide-react';

interface ThoughtExperiment {
  id: string;
  name: string;
  description: string;
  delta_type: string;
  delta_description: string;
  delta_config: Record<string, unknown>;
  chain_depth: number;
  factors: Array<{ name: string; weight: number; description?: string }>;
  extension_threshold: number;
  max_extensions: number;
  status: 'running' | 'paused' | 'variant' | 'adopted' | 'discarded';
  current_net_score: number;
  created_at: string;
  parent_experiment_id?: string;
  extension_number: number;
}

interface FactorTemplate {
  id: string;
  name: string;
  description: string;
  factors: Array<{ name: string; weight: number; description?: string }>;
  category: string;
  is_default: boolean;
}

const DELTA_TYPES = [
  { value: 'pricing', label: 'Pricing Change', example: 'What if rush pricing was removed?' },
  { value: 'threshold', label: 'Threshold Adjustment', example: 'What if aggregation threshold was 3 households?' },
  { value: 'currency', label: 'Currency Mechanics', example: 'What if Marks decayed 5% monthly?' },
  { value: 'policy', label: 'Policy Change', example: 'What if membership was $10/year?' },
  { value: 'feature', label: 'Feature Toggle', example: 'What if we enabled feature X?' },
  { value: 'initiative', label: 'Initiative Tweak', example: 'What if Let\'s Make Dinner had no tips?' },
];

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  running: { color: 'bg-blue-500', icon: <Play className="w-3 h-3" />, label: 'Running' },
  paused: { color: 'bg-yellow-500', icon: <Pause className="w-3 h-3" />, label: 'Paused' },
  variant: { color: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" />, label: 'Variant' },
  adopted: { color: 'bg-purple-500', icon: <CheckCircle className="w-3 h-3" />, label: 'Adopted' },
  discarded: { color: 'bg-gray-500', icon: <XCircle className="w-3 h-3" />, label: 'Discarded' },
};

export default function ContingencyOperatorsPage() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<ThoughtExperiment[]>([]);
  const [templates, setTemplates] = useState<FactorTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // New experiment form state
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    delta_type: 'pricing',
    delta_description: '',
    chain_depth: 3,
    extension_threshold: 0.10,
    max_extensions: 3,
    selected_template: '',
    factors: [] as Array<{ name: string; weight: number }>,
  });

  useEffect(() => {
    loadExperiments();
    loadTemplates();
  }, []);

  const loadExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from('thought_experiments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExperiments((data as unknown as ThoughtExperiment[]) || []);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('co_factor_templates')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      setTemplates((data as unknown as FactorTemplate[]) || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const createExperiment = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('thought_experiments')
        .insert({
          name: newExperiment.name,
          description: newExperiment.description,
          delta_type: newExperiment.delta_type,
          delta_description: newExperiment.delta_description,
          delta_config: {},
          chain_depth: newExperiment.chain_depth,
          factors: newExperiment.factors,
          extension_threshold: newExperiment.extension_threshold,
          max_extensions: newExperiment.max_extensions,
          created_by: user.id,
        });
      
      if (error) throw error;
      
      setCreateDialogOpen(false);
      setNewExperiment({
        name: '',
        description: '',
        delta_type: 'pricing',
        delta_description: '',
        chain_depth: 3,
        extension_threshold: 0.10,
        max_extensions: 3,
        selected_template: '',
        factors: [],
      });
      loadExperiments();
    } catch (err) {
      console.error('Failed to create experiment:', err);
    }
  };

  const updateExperimentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('thought_experiments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      loadExperiments();
    } catch (err) {
      console.error('Failed to update experiment:', err);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewExperiment(prev => ({
        ...prev,
        selected_template: templateId,
        factors: template.factors.map(f => ({ name: f.name, weight: f.weight })),
      }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 0.1) return 'text-green-600';
    if (score < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreIcon = (score: number) => {
    if (score > 0.05) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score < -0.05) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="contingency-operators">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-purple-600" />
            Contingency Operators
          </h1>
          <p className="text-gray-600 mt-1">
            Non-destructive what-if sandboxes • Innovation #1188
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Thought Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Create Thought Experiment
              </DialogTitle>
              <DialogDescription>
                Fork from REALITY with a single-point change. Test the cascade effects without risk.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Experiment Name</Label>
                <Input
                  id="name"
                  placeholder="No Rush Pricing Test"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              {/* Delta Type */}
              <div className="space-y-2">
                <Label>Delta Type</Label>
                <Select
                  value={newExperiment.delta_type}
                  onValueChange={(value) => setNewExperiment(prev => ({ ...prev, delta_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELTA_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.example}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Delta Description (The What-If) */}
              <div className="space-y-2">
                <Label htmlFor="delta">What If... (The Delta)</Label>
                <Textarea
                  id="delta"
                  placeholder="What if rush pricing was removed from Let's Make Dinner?"
                  value={newExperiment.delta_description}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, delta_description: e.target.value }))}
                  rows={2}
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Hypothesis / Notes</Label>
                <Textarea
                  id="description"
                  placeholder="I expect this would increase order volume but decrease revenue per order..."
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              
              {/* Factor Template */}
              <div className="space-y-2">
                <Label>Factor Template</Label>
                <Select
                  value={newExperiment.selected_template}
                  onValueChange={applyTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.factors.length} factors</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Factors Preview */}
              {newExperiment.factors.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Factors</Label>
                  <div className="flex flex-wrap gap-2">
                    {newExperiment.factors.map((factor, idx) => (
                      <Badge key={idx} variant="secondary">
                        {factor.name} ({Math.round(factor.weight * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chain Depth */}
              <div className="space-y-2">
                <Label>Chain Depth: {newExperiment.chain_depth}</Label>
                <Slider
                  value={[newExperiment.chain_depth]}
                  onValueChange={([value]) => setNewExperiment(prev => ({ ...prev, chain_depth: value }))}
                  min={1}
                  max={10}
                  step={1}
                />
                <p className="text-xs text-gray-500">How many downstream effects to trace</p>
              </div>
              
              {/* Extension Threshold */}
              <div className="space-y-2">
                <Label>Extension Threshold: +{Math.round(newExperiment.extension_threshold * 100)}%</Label>
                <Slider
                  value={[newExperiment.extension_threshold * 100]}
                  onValueChange={([value]) => setNewExperiment(prev => ({ ...prev, extension_threshold: value / 100 }))}
                  min={5}
                  max={50}
                  step={5}
                />
                <p className="text-xs text-gray-500">Net score needed to spawn extension sandbox</p>
              </div>
              
              {/* Max Extensions */}
              <div className="space-y-2">
                <Label>Max Extensions: {newExperiment.max_extensions}</Label>
                <Slider
                  value={[newExperiment.max_extensions]}
                  onValueChange={([value]) => setNewExperiment(prev => ({ ...prev, max_extensions: value }))}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>
              
              {/* Create Button */}
              <Button 
                onClick={createExperiment} 
                className="w-full"
                disabled={!newExperiment.name || !newExperiment.delta_description}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Launch Sandbox
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Info Section — Progressive Disclosure */}
      <div className="space-y-3 mb-8">
        <ExpandableBlock
          title="🧪 How Contingency Operators Work"
          subtitle="Non-destructive what-if sandboxes"
          preview="Fork from REALITY with a single-point change..."
          accentColor="#8b5cf6"
          defaultExpanded={true}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Each sandbox forks from REALITY with a single-point change (the Delta). 
              The system tracks how that change would cascade through your chosen Factors.
              When results exceed your Extension Threshold, a secondary sandbox spawns to explore further.
            </p>
            <p className="text-sm font-medium text-purple-600">
              Nothing touches the real platform until you explicitly Adopt.
            </p>
          </div>
        </ExpandableBlock>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ExpandableBlock
            title="🔀 The Delta"
            subtitle="Your single-point change"
            preview="What if rush pricing was removed?..."
            accentColor="#3b82f6"
            defaultExpanded={false}
          >
            <p className="text-sm text-muted-foreground">
              The Delta is the one thing you change from reality. Examples: "What if rush pricing was removed?" 
              or "What if membership was $10/year?" Keep it to ONE change to isolate effects.
            </p>
          </ExpandableBlock>

          <ExpandableBlock
            title="📊 Factors"
            subtitle="What you're measuring"
            preview="Revenue, user satisfaction, churn rate..."
            accentColor="#22c55e"
            defaultExpanded={false}
          >
            <p className="text-sm text-muted-foreground">
              Factors are the metrics you track to see if the change is positive or negative. 
              Choose from templates or create custom factors weighted by importance.
            </p>
          </ExpandableBlock>

          <ExpandableBlock
            title="🌳 Extensions"
            subtitle="Automatic deeper exploration"
            preview="When results exceed threshold, spawn new sandbox..."
            accentColor="#f59e0b"
            defaultExpanded={false}
          >
            <p className="text-sm text-muted-foreground">
              When an experiment's net score exceeds your Extension Threshold, the system automatically 
              spawns a secondary sandbox to explore further. This creates a tree of possibilities.
            </p>
          </ExpandableBlock>
        </div>
      </div>
      
      {/* Experiments Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({experiments.filter(e => ['running', 'paused'].includes(e.status)).length})</TabsTrigger>
          <TabsTrigger value="variants">Variants ({experiments.filter(e => e.status === 'variant').length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({experiments.filter(e => ['adopted', 'discarded'].includes(e.status)).length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading experiments...</p>
          ) : experiments.filter(e => ['running', 'paused'].includes(e.status)).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No active experiments. Create one to start testing!
              </CardContent>
            </Card>
          ) : (
            experiments
              .filter(e => ['running', 'paused'].includes(e.status))
              .map(experiment => (
                <ExperimentCard 
                  key={experiment.id} 
                  experiment={experiment}
                  onStatusChange={updateExperimentStatus}
                  getScoreColor={getScoreColor}
                  getScoreIcon={getScoreIcon}
                />
              ))
          )}
        </TabsContent>
        
        <TabsContent value="variants" className="space-y-4">
          {experiments.filter(e => e.status === 'variant').length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No variants yet. Experiments become variants when they show sustained positive results.
              </CardContent>
            </Card>
          ) : (
            experiments
              .filter(e => e.status === 'variant')
              .map(experiment => (
                <ExperimentCard 
                  key={experiment.id} 
                  experiment={experiment}
                  onStatusChange={updateExperimentStatus}
                  getScoreColor={getScoreColor}
                  getScoreIcon={getScoreIcon}
                />
              ))
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          {experiments.filter(e => ['adopted', 'discarded'].includes(e.status)).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No archived experiments yet.
              </CardContent>
            </Card>
          ) : (
            experiments
              .filter(e => ['adopted', 'discarded'].includes(e.status))
              .map(experiment => (
                <ExperimentCard 
                  key={experiment.id} 
                  experiment={experiment}
                  onStatusChange={updateExperimentStatus}
                  getScoreColor={getScoreColor}
                  getScoreIcon={getScoreIcon}
                />
              ))
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}

// Experiment Card Component
function ExperimentCard({ 
  experiment, 
  onStatusChange,
  getScoreColor,
  getScoreIcon 
}: { 
  experiment: ThoughtExperiment;
  onStatusChange: (id: string, status: string) => void;
  getScoreColor: (score: number) => string;
  getScoreIcon: (score: number) => React.ReactNode;
}) {
  const statusConfig = STATUS_CONFIG[experiment.status];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {experiment.extension_number > 0 && (
                <Badge variant="outline" className="text-xs">
                  Extension #{experiment.extension_number}
                </Badge>
              )}
              {experiment.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {experiment.delta_description}
            </CardDescription>
          </div>
          <Badge className={`${statusConfig.color} text-white gap-1`}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Score */}
          <div className="flex items-center gap-2">
            {getScoreIcon(experiment.current_net_score)}
            <span className={`text-lg font-semibold ${getScoreColor(experiment.current_net_score)}`}>
              {experiment.current_net_score >= 0 ? '+' : ''}
              {(experiment.current_net_score * 100).toFixed(1)}%
            </span>
            <span className="text-gray-500 text-sm">net score</span>
          </div>
          
          {/* Config Pills */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Badge variant="outline">Chain: {experiment.chain_depth}</Badge>
            <Badge variant="outline">{experiment.factors?.length || 0} factors</Badge>
            <Badge variant="outline">Ext: {experiment.max_extensions}</Badge>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {experiment.status === 'running' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusChange(experiment.id, 'paused')}
                >
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-green-600 border-green-300"
                  onClick={() => onStatusChange(experiment.id, 'variant')}
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Mark Variant
                </Button>
              </>
            )}
            {experiment.status === 'paused' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange(experiment.id, 'running')}
              >
                <Play className="w-3 h-3 mr-1" /> Resume
              </Button>
            )}
            {experiment.status === 'variant' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-purple-600 border-purple-300"
                  onClick={() => onStatusChange(experiment.id, 'adopted')}
                >
                  <ArrowRight className="w-3 h-3 mr-1" /> Adopt
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-gray-600"
                  onClick={() => onStatusChange(experiment.id, 'discarded')}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Discard
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Description */}
        {experiment.description && (
          <p className="text-sm text-gray-600 mt-3 border-t pt-3">
            {experiment.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
