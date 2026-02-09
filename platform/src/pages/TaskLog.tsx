import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardList, Plus, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

interface TaskLogEntry {
  id: string;
  task_summary: string;
  task_details: string | null;
  created_at: string;
}

export default function TaskLog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskLogEntry[]>([]);
  const [newSummary, setNewSummary] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("task_log")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading tasks", description: error.message, variant: "destructive" });
      return;
    }

    setTasks(data || []);
  };

  const addTask = async () => {
    if (!user || !newSummary.trim()) {
      toast({ title: "Please enter a task summary", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("task_log")
      .insert({
        user_id: user.id,
        task_summary: newSummary,
        task_details: newDetails || null,
      });

    if (error) {
      toast({ title: "Error adding task", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Task logged successfully" });
    setNewSummary("");
    setNewDetails("");
    setIsAdding(false);
    loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("task_log")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Task deleted" });
    loadTasks();
  };

  const exportTasks = () => {
    const content = tasks
      .map((task, index) => {
        const date = format(new Date(task.created_at), "MMM dd, yyyy");
        return `${index + 1}. [${date}] ${task.task_summary}${
          task.task_details ? `\n   Details: ${task.task_details}` : ""
        }`;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "task-log.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Task log exported" });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Log</h1>
          <p className="text-muted-foreground">Track all implemented features and requests</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportTasks} variant="outline" disabled={tasks.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Task Entry</CardTitle>
            <CardDescription>Log a new feature or task that was completed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="summary">Task Summary</Label>
              <Input
                id="summary"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="I'll create a..."
              />
            </div>
            <div>
              <Label htmlFor="details">Additional Details (Optional)</Label>
              <Textarea
                id="details"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Any additional context or notes..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addTask}>Save Entry</Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Task History ({tasks.length})
          </CardTitle>
          <CardDescription>All features and tasks logged over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks logged yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            #{tasks.length - index}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.created_at), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{task.task_summary}</p>
                        {task.task_details && (
                          <p className="text-sm text-muted-foreground">{task.task_details}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
