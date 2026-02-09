import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  XCircle,
  Eye,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function FailureQueueDashboard() {
  const queryClient = useQueryClient();
  const [selectedFailure, setSelectedFailure] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: failures, isLoading } = useQuery({
    queryKey: ['operation-failures'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('operation_failures')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const retryQueueMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-failure-queue');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed} failures. ${data.succeeded} succeeded.`);
      queryClient.invalidateQueries({ queryKey: ['operation-failures'] });
    },
    onError: (error: any) => {
      toast.error('Failed to process queue: ' + error.message);
    }
  });

  const resolveFailureMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from('operation_failures')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: notes
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Failure marked as resolved');
      queryClient.invalidateQueries({ queryKey: ['operation-failures'] });
      setSelectedFailure(null);
      setResolutionNotes("");
    },
    onError: (error: any) => {
      toast.error('Failed to resolve: ' + error.message);
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      retrying: { variant: 'default', icon: RefreshCw, label: 'Retrying' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Failed' },
      resolved: { variant: 'default', icon: CheckCircle2, label: 'Resolved' },
      manual_review: { variant: 'destructive', icon: AlertTriangle, label: 'Manual Review' }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const stats = {
    pending: failures?.filter(f => f.status === 'pending').length || 0,
    retrying: failures?.filter(f => f.status === 'retrying').length || 0,
    manual_review: failures?.filter(f => f.status === 'manual_review').length || 0,
    resolved: failures?.filter(f => f.status === 'resolved').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Failure Queue Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and resolve failed operations
          </p>
        </div>
        <Button 
          onClick={() => retryQueueMutation.mutate()}
          disabled={retryQueueMutation.isPending}
        >
          {retryQueueMutation.isPending ? (
            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
          ) : (
            <><PlayCircle className="mr-2 h-4 w-4" /> Process Queue</>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retrying</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retrying}</div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Manual Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.manual_review}</div>
          </CardContent>
        </Card>

        <Card className="border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Failures List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Failures</CardTitle>
          <CardDescription>
            Latest failed operations requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : failures && failures.length > 0 ? (
            <div className="space-y-4">
              {failures.map((failure: any) => (
                <div key={failure.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(failure.status)}
                        <span className="font-medium">{failure.operation_type}</span>
                        <span className="text-sm text-muted-foreground">
                          Attempt {failure.attempt_count}/{failure.max_retries}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(failure.created_at).toLocaleString()}
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedFailure(failure)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Failure Details</DialogTitle>
                          <DialogDescription>
                            {failure.operation_type} - {failure.id}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Error Message</h4>
                            <pre className="p-3 bg-muted rounded text-sm">
                              {failure.error_message}
                            </pre>
                          </div>

                          {failure.error_stack && (
                            <div>
                              <h4 className="font-medium mb-2">Stack Trace</h4>
                              <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
                                {failure.error_stack}
                              </pre>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium mb-2">Operation Data</h4>
                            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                              {JSON.stringify(failure.operation_data, null, 2)}
                            </pre>
                          </div>

                          {failure.status === 'manual_review' && (
                            <div>
                              <h4 className="font-medium mb-2">Resolution Notes</h4>
                              <Textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Describe how you resolved this issue..."
                                rows={4}
                              />
                              <Button
                                className="mt-2"
                                onClick={() => resolveFailureMutation.mutate({
                                  id: failure.id,
                                  notes: resolutionNotes
                                })}
                                disabled={resolveFailureMutation.isPending || !resolutionNotes}
                              >
                                Mark as Resolved
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <p className="text-sm">{failure.error_message}</p>

                  {failure.requires_admin && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Requires Admin Attention
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No failures in queue - all systems operational!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
