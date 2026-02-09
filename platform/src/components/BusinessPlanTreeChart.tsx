import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Edit
} from 'lucide-react';
import { EditableContent } from './EditableContent';

interface Task {
  id: string;
  task_name: string;
  task_description: string | null;
  category: string;
  status: string;
  priority: number;
  prerequisite_task_ids: string[];
  scheduled_start_date: string | null;
  scheduled_completion_date: string | null;
  actual_completion_date: string | null;
  made_moot_reason: string | null;
  notes: string | null;
}

interface BusinessPlanTreeChartProps {
  projectId: string;
}

export function BusinessPlanTreeChart({ projectId }: BusinessPlanTreeChartProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['development', 'marketing', 'contest']));

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('business_plan_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('priority', { ascending: true })
      .order('scheduled_start_date', { ascending: true });

    if (error) {
      toast.error('Failed to load tasks');
      console.error(error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const handleUpdateTask = async (taskId: string, field: string, value: any) => {
    const { error } = await supabase
      .from('business_plan_tasks')
      .update({ [field]: value })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update task');
      console.error(error);
    } else {
      toast.success('Task updated');
      loadTasks();
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'moot':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      in_progress: 'secondary',
      blocked: 'destructive',
      moot: 'outline',
      not_started: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    const labels = ['', 'Critical', 'High', 'Medium', 'Low', 'Deferred'];
    const variants: Record<number, any> = {
      1: 'destructive',
      2: 'default',
      3: 'secondary',
      4: 'outline',
      5: 'outline'
    };
    return <Badge variant={variants[priority] || 'outline'}>{labels[priority]}</Badge>;
  };

  const categories = Array.from(new Set(tasks.map(t => t.category)));
  const tasksByCategory = categories.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat);
    return acc;
  }, {} as Record<string, Task[]>);

  const isBlocked = (task: Task) => {
    if (!task.prerequisite_task_ids || task.prerequisite_task_ids.length === 0) return false;
    return task.prerequisite_task_ids.some(preqId => {
      const preqTask = tasks.find(t => t.id === preqId);
      return preqTask && preqTask.status !== 'completed';
    });
  };

  const getBlockingTasks = (task: Task): Task[] => {
    if (!task.prerequisite_task_ids) return [];
    return tasks.filter(t => 
      task.prerequisite_task_ids.includes(t.id) && t.status !== 'completed'
    );
  };

  if (loading) {
    return <div>Loading implementation tree...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Plan Implementation Tree</CardTitle>
              <CardDescription>
                Track progress toward your 2-week beta launch
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{tasks.filter(t => t.status === 'completed').length} Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{tasks.filter(t => t.status === 'in_progress').length} In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-gray-300" />
              <span>{tasks.filter(t => t.status === 'not_started').length} Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{tasks.filter(t => t.status === 'blocked').length} Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span>{tasks.filter(t => t.status === 'moot').length} Moot</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleCategory(category)}
          >
            <div className="flex items-center gap-2">
              {expandedCategories.has(category) ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <CardTitle className="capitalize">{category}</CardTitle>
              <Badge variant="secondary">
                {tasksByCategory[category].length} tasks
              </Badge>
            </div>
          </CardHeader>
          {expandedCategories.has(category) && (
            <CardContent className="space-y-4">
              {tasksByCategory[category].map(task => {
                const blocked = isBlocked(task);
                const blockingTasks = getBlockingTasks(task);

                return (
                  <div 
                    key={task.id} 
                    className={`p-4 border rounded-lg ${blocked ? 'border-orange-300 bg-orange-50 dark:bg-orange-950' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <EditableContent
                            content={task.task_name}
                            onSave={(value) => handleUpdateTask(task.id, 'task_name', value)}
                            label="Task Name"
                            contentType="text"
                          >
                            <h4 className="font-semibold">{task.task_name}</h4>
                          </EditableContent>
                          <div className="flex gap-2">
                            {getPriorityBadge(task.priority)}
                            {getStatusBadge(task.status)}
                          </div>
                        </div>

                        {task.task_description && (
                          <EditableContent
                            content={task.task_description}
                            onSave={(value) => handleUpdateTask(task.id, 'task_description', value)}
                            label="Task Description"
                            contentType="textarea"
                          >
                            <p className="text-sm text-muted-foreground">{task.task_description}</p>
                          </EditableContent>
                        )}

                        {blocked && (
                          <div className="bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded p-2">
                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              🚧 Blocked by:
                            </p>
                            <ul className="text-sm text-orange-700 dark:text-orange-300 ml-4 mt-1">
                              {blockingTasks.map(bt => (
                                <li key={bt.id}>• {bt.task_name}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {task.status === 'moot' && task.made_moot_reason && (
                          <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Made moot:</strong> {task.made_moot_reason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {task.scheduled_completion_date && (
                            <span>
                              📅 Due: {new Date(task.scheduled_completion_date).toLocaleDateString()}
                            </span>
                          )}
                          {task.actual_completion_date && (
                            <span className="text-green-600 dark:text-green-400">
                              ✅ Completed: {new Date(task.actual_completion_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const newStatus = task.status === 'completed' ? 'not_started' : 
                                              task.status === 'not_started' ? 'in_progress' :
                                              task.status === 'in_progress' ? 'completed' : 'not_started';
                              handleUpdateTask(task.id, 'status', newStatus);
                            }}
                          >
                            Update Status
                          </Button>
                          {task.status !== 'moot' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const reason = prompt('Why is this task no longer needed?');
                                if (reason) {
                                  handleUpdateTask(task.id, 'status', 'moot');
                                  handleUpdateTask(task.id, 'made_moot_reason', reason);
                                }
                              }}
                            >
                              Mark as Moot
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
