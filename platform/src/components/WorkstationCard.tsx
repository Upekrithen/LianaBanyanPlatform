import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Folder } from "lucide-react";

interface WorkstationCardProps {
  projectId: string;
  showAll?: boolean;
}

export function WorkstationCard({ projectId, showAll }: WorkstationCardProps) {
  const { data: workstations, isLoading } = useQuery({
    queryKey: ['workstations-card', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workstations')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2 mt-2" />
        </CardHeader>
      </Card>
    );
  }

  if (!workstations || workstations.length === 0) {
    return null;
  }

  return (
    <>
      {workstations.map(workstation => (
        <Link key={workstation.id} to={`/campaign-production/${workstation.id}`}>
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                <CardTitle className="text-lg">{workstation.workstation_name}</CardTitle>
              </div>
              <CardDescription>{workstation.description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </>
  );
}
