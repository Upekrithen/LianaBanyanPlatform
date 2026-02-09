import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sprout, Leaf, FlowerIcon, Droplet, TreeDeciduous, Apple } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlantLifecycleViewProps {
  projectId: string;
  isOwner?: boolean;
  isSteward?: boolean;
}

type LifecycleStage = 'germination' | 'seed' | 'sprout' | 'seedling' | 'plant_no_flowers' | 'plant_with_flowers' | 'plant_with_fruit';

interface StageTask {
  id: string;
  task_title: string;
  task_description: string;
  sort_order: number;
}

interface TaskAssignment {
  id: string;
  task_id: string;
  assigned_member_id: string;
  member_title: string;
  status: string;
  profiles: { full_name: string; email: string };
}

interface MemberContract {
  id: string;
  member_id: string;
  contract_title: string;
  status: string;
  start_date: string;
  profiles: { full_name: string; email: string };
}

const stageIcons = {
  germination: Droplet,
  seed: Sprout,
  sprout: Leaf,
  seedling: Leaf,
  plant_no_flowers: TreeDeciduous,
  plant_with_flowers: FlowerIcon,
  plant_with_fruit: Apple,
};

const stageNames = {
  germination: 'Germination (Idea)',
  seed: 'Seed (Design)',
  sprout: 'Sprout (Illustration)',
  seedling: 'Seedling (Prototype)',
  plant_no_flowers: 'Plant (Marketing)',
  plant_with_flowers: 'Plant (Manufacturing)',
  plant_with_fruit: 'Plant (Delivery)',
};

const stageDescriptions = {
  germination: 'Dormant seed with a radicle - initial project concept',
  seed: 'In ground with roots - design and planning phase',
  sprout: 'Emerges from soil - visual identity and description',
  seedling: 'With leaves - prototype development',
  plant_no_flowers: 'No flowers - marketing and pre-sales',
  plant_with_flowers: 'With flowers - sales and manufacturing',
  plant_with_fruit: 'With fruit - packaging and delivery',
};

export function PlantLifecycleView({ projectId, isOwner = false, isSteward = false }: PlantLifecycleViewProps) {
  const [currentStage, setCurrentStage] = useState<LifecycleStage>('germination');
  const [stageTasks, setStageTasks] = useState<StageTask[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [contracts, setContracts] = useState<MemberContract[]>([]);
  const [customIcons, setCustomIcons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const stages: LifecycleStage[] = ['germination', 'seed', 'sprout', 'seedling', 'plant_no_flowers', 'plant_with_flowers', 'plant_with_fruit'];
  const currentStageIndex = stages.indexOf(currentStage);
  const progress = ((currentStageIndex + 1) / stages.length) * 100;

  useEffect(() => {
    loadLifecycleData();
  }, [projectId]);

  const loadLifecycleData = async () => {
    try {
      setLoading(true);

      // Get current stage
      const { data: stageData } = await supabase
        .from('project_lifecycle_stages')
        .select('current_stage')
        .eq('project_id', projectId)
        .single();

      if (stageData) {
        setCurrentStage(stageData.current_stage as LifecycleStage);

        // Get tasks for current stage
        const { data: tasksData } = await supabase
          .from('lifecycle_stage_tasks')
          .select('*')
          .eq('stage', stageData.current_stage)
          .order('sort_order');

        if (tasksData) setStageTasks(tasksData);

        // Get task assignments
        const { data: assignmentsData } = await supabase
          .from('project_stage_task_assignments')
          .select(`
            *,
            profiles:assigned_member_id (full_name, email)
          `)
          .eq('project_id', projectId)
          .eq('stage', stageData.current_stage);

        if (assignmentsData) setAssignments(assignmentsData as any);
      }

      // Get member contracts
      const { data: contractsData } = await supabase
        .from('project_member_contracts')
        .select(`
          *,
          profiles:member_id (full_name, email)
        `)
        .eq('project_id', projectId)
        .in('status', ['pending', 'active']);

      if (contractsData) setContracts(contractsData as any);

    } catch (error) {
      console.error('Error loading lifecycle data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load lifecycle data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex >= stages.length) return;

    try {
      const { error } = await supabase
        .from('project_lifecycle_stages')
        .update({
          current_stage: stages[nextStageIndex],
          stage_started_at: new Date().toISOString(),
        })
        .eq('project_id', projectId);

      if (error) throw error;

      toast({
        title: 'Stage Advanced',
        description: `Project moved to ${stageNames[stages[nextStageIndex]]}`,
      });

      loadLifecycleData();
    } catch (error) {
      console.error('Error advancing stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to advance stage',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading lifecycle data...</div>;
  }

  const StageIcon = stageIcons[currentStage];
  const canManage = isOwner || isSteward;
  const customIconUrl = customIcons[currentStage];

  return (
    <div className="space-y-6">
      {/* Current Stage Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {customIconUrl ? (
                <img src={customIconUrl} alt={stageNames[currentStage]} className="h-8 w-8 object-contain" />
              ) : (
                <StageIcon className="h-8 w-8 text-primary" />
              )}
              <div>
                <CardTitle>{stageNames[currentStage]}</CardTitle>
                <CardDescription>{stageDescriptions[currentStage]}</CardDescription>
              </div>
            </div>
            {canManage && currentStageIndex < stages.length - 1 && (
              <Button onClick={handleAdvanceStage}>
                Advance to Next Stage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{currentStageIndex + 1} of {stages.length}</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Stage Timeline */}
          <div className="mt-6 flex justify-between">
            {stages.map((stage, index) => {
              const Icon = stageIcons[stage];
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              const customTimelineIcon = customIcons[stage];

              return (
                <div
                  key={stage}
                  className={`flex flex-col items-center gap-2 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  }`}
                >
                  {customTimelineIcon ? (
                    <img 
                      src={customTimelineIcon} 
                      alt={stageNames[stage]} 
                      className={`h-6 w-6 object-contain ${isActive ? 'scale-125' : ''}`} 
                    />
                  ) : (
                    <Icon className={`h-6 w-6 ${isActive ? 'scale-125' : ''}`} />
                  )}
                  <span className="text-xs hidden sm:block">{stageNames[stage].split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tasks for Current Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks for Current Stage</CardTitle>
          <CardDescription>Complete these tasks to progress to the next stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stageTasks.map((task) => {
              const assignment = assignments.find((a) => a.task_id === task.id);

              return (
                <div key={task.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.task_title}</h4>
                    {task.task_description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.task_description}</p>
                    )}
                    {assignment && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{assignment.member_title}</Badge>
                        <span className="text-sm">{assignment.profiles.full_name}</span>
                        <Badge>{assignment.status}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Member Contracts */}
      {contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Team Members</CardTitle>
            <CardDescription>Members working on this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{contract.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">{contract.profiles.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{contract.contract_title}</Badge>
                    <Badge>{contract.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
