import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContractScaleNegotiationManager } from "@/components/ContractScaleNegotiationManager";

export default function ContractScaleManager() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId
  });

  if (!projectId) {
    return <div className="p-8">Project ID not found</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Contract Scale Rate Manager</h1>
        {project && (
          <p className="text-muted-foreground mt-2">
            Manage negotiated compensation rates for {project.name}
          </p>
        )}
      </div>

      <ContractScaleNegotiationManager projectId={projectId} />
    </div>
  );
}
