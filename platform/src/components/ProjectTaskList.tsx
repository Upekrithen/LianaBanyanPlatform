import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectTaskListProps {
  projectId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  task_type: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  stage: string;
}

export function ProjectTaskList({ projectId }: ProjectTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskType, setTaskType] = useState<string>('ideation');
  const [priority, setPriority] = useState<string>('medium');
  const [dueDate, setDueDate] = useState('');
  const [stage, setStage] = useState<string>('stage_1');
  const [stageFilter, setStageFilter] = useState<string>('all');

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const loadTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const handleAddTask = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    const { error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: assignedTo.trim() || null,
        task_type: taskType,
        priority,
        due_date: dueDate || null,
        stage,
      });

    if (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } else {
      toast.success('Task added successfully');
      resetForm();
      loadTasks();
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } else {
      toast.success('Task updated');
      loadTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } else {
      toast.success('Task deleted');
      loadTasks();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setTaskType('ideation');
    setPriority('medium');
    setDueDate('');
    setStage('stage_1');
    setShowAddForm(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      in_progress: { label: 'In Progress', variant: 'default' as const, icon: Circle },
      completed: { label: 'Completed', variant: 'default' as const, icon: CheckCircle2 },
      blocked: { label: 'Blocked', variant: 'destructive' as const, icon: Circle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={status === 'completed' ? 'bg-green-600' : ''}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center p-4">Loading tasks...</div>;
  }

  const filteredTasks = stageFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.stage === stageFilter);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Project Tasks</h3>
          <p className="text-sm text-muted-foreground">
            Manage tasks and assignments for this project's production cycle
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="stage_1">Stage 1</SelectItem>
              <SelectItem value="stage_2">Stage 2</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>
              Create a task assignment for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Design product mockup"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed task description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Input
                  id="assigned-to"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Name or email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-type">Task Type</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger id="task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ideation">Ideation</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger id="stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stage_1">Stage 1</SelectItem>
                    <SelectItem value="stage_2">Stage 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTask}>Add Task</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Task List ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {stageFilter === 'all' 
                ? 'No tasks yet. Add your first task to get started.'
                : `No ${stageFilter === 'stage_1' ? 'Stage 1' : 'Stage 2'} tasks yet.`
              }
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{task.assigned_to || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {task.task_type || 'general'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.stage === 'stage_1' ? 'default' : 'secondary'}>
                        {task.stage === 'stage_1' ? 'Stage 1' : 'Stage 2'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      {task.due_date 
                        ? new Date(task.due_date).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={task.status}
                          onValueChange={(value) => handleUpdateStatus(task.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}