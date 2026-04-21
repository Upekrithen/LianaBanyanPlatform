import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Position {
  id: string;
  position_title: string;
  category: string;
  compensation_type: string;
  is_active: boolean;
  credits_reserved: number;
}

interface PositionActivationManagerProps {
  projectId: string;
}

export const PositionActivationManager = ({ projectId }: PositionActivationManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPositions();
  }, [projectId]);

  const loadPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('contract_position_templates')
        .select('id, position_title, category, compensation_type, is_active, credits_reserved')
        .eq('project_id', projectId)
        .order('position_title');

      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error('Error loading positions:', error);
      toast({
        title: "Error",
        description: "Failed to load positions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (positionId: string, currentStatus: boolean) => {
    setUpdating(positionId);
    try {
      const { error } = await supabase
        .from('contract_position_templates')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', positionId);

      if (error) throw error;

      // Update local state
      setPositions(positions.map(pos =>
        pos.id === positionId ? { ...pos, is_active: !currentStatus } : pos
      ));

      toast({
        title: "Success",
        description: `Position ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating position:', error);
      toast({
        title: "Error",
        description: "Failed to update position status",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
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
        <CardTitle>Position Activation Management</CardTitle>
        <CardDescription>
          Control which positions are active and accepting applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No positions found for this project
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">
                    {position.position_title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{position.category}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {position.compensation_type}
                  </TableCell>
                  <TableCell>{position.credits_reserved}</TableCell>
                  <TableCell>
                    <Badge variant={position.is_active ? "default" : "secondary"}>
                      {position.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        {position.is_active ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={position.is_active}
                        onCheckedChange={() => handleToggleActivation(position.id, position.is_active)}
                        disabled={updating === position.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
