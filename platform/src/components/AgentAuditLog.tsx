import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLog {
  id: string;
  agent_email: string;
  agent_role: string;
  action_type: string;
  table_name: string;
  changes: any;
  timestamp: string;
  verified: boolean;
  verification_method: string;
}

interface AgentAuditLogProps {
  projectId?: string;
  limit?: number;
}

export const AgentAuditLog = ({ projectId, limit = 50 }: AgentAuditLogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadAuditLogs();
  }, [projectId]);

  const loadAuditLogs = async () => {
    try {
      let query = supabase
        .from('agent_action_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      case 'activate': return 'default';
      case 'deactivate': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Agent Action Audit Log
        </CardTitle>
        <CardDescription>
          Timestamped and verified record of all agent actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No audit logs found
          </p>
        ) : (
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-sm">{log.agent_email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {log.agent_role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeColor(log.action_type)}>
                        {log.action_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.table_name}
                    </TableCell>
                    <TableCell>
                      {log.verified ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">{log.verification_method}</span>
                        </div>
                      ) : (
                        <Badge variant="destructive">Unverified</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};