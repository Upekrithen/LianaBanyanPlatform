import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Briefcase,
  Scale,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { ProcessDetailDialog } from "@/components/ProcessDetailDialog";
import { PositionDetailDialog } from "@/components/PositionDetailDialog";

export default function MemberResources() {
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  const { data: processes, isLoading: loadingProcesses } = useQuery({
    queryKey: ['business-processes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('business_processes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: positions, isLoading: loadingPositions } = useQuery({
    queryKey: ['service-positions'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('service_positions')
        .select('*')
        .eq('is_current_need', true)
        .order('priority_level', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const ipProtectionProcesses = processes?.filter(p => p.process_category === 'ip_protection') || [];
  const otherProcesses = processes?.filter(p => p.process_category !== 'ip_protection') || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core_operations': return <Briefcase className="h-4 w-4" />;
      case 'member_support': return <Users className="h-4 w-4" />;
      case 'technical': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Member Resources</h1>
        <p className="text-muted-foreground">
          Guides, processes, and positions to support your success with Liana Banyan
        </p>
      </div>

      <Tabs defaultValue="processes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="processes">
            <BookOpen className="h-4 w-4 mr-2" />
            Process Guides
          </TabsTrigger>
          <TabsTrigger value="positions">
            <Briefcase className="h-4 w-4 mr-2" />
            Available Positions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processes" className="space-y-6">
          {/* IP Protection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6" />
              <h2 className="text-2xl font-semibold">Intellectual Property Protection</h2>
            </div>
            
            {loadingProcesses ? (
              <div className="text-center py-8">Loading processes...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ipProtectionProcesses.map((process) => (
                  <Card key={process.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProcess(process)}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold">{process.process_name}</h3>
                          <p className="text-sm text-muted-foreground">{process.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{process.estimated_duration}</span>
                      </div>

                      {process.prerequisites && process.prerequisites.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Prerequisites:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {process.prerequisites.slice(0, 2).map((prereq: string, idx: number) => (
                              <li key={idx}>• {prereq}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {process.liana_banyan_support && (
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium mb-1 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Liana Banyan Support:
                          </p>
                          <p className="text-sm text-muted-foreground">{process.liana_banyan_support}</p>
                        </div>
                      )}

                      <Button variant="outline" className="w-full" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProcess(process);
                      }}>
                        View Step-by-Step Guide
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Other Processes Section */}
          {otherProcesses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Other Processes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherProcesses.map((process) => (
                  <Card key={process.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedProcess(process)}>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">{process.process_name}</h3>
                      <p className="text-sm text-muted-foreground">{process.description}</p>
                      <Button variant="outline" className="w-full">View Details</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Open Service Positions</h2>
            <p className="text-muted-foreground">
              Join Liana Banyan as a service provider or agent. All positions offer participation, credits, or hybrid compensation.
            </p>
          </div>

          {loadingPositions ? (
            <div className="text-center py-8">Loading positions...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions?.map((position) => (
                <Card key={position.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPosition(position)}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(position.position_category)}
                          <h3 className="text-lg font-semibold">{position.position_title}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getPriorityColor(position.priority_level) as any}>
                            {position.priority_level}
                          </Badge>
                          <Badge variant="outline">{position.compensation_type}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">{position.description}</p>

                    {position.estimated_time_commitment && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{position.estimated_time_commitment}</span>
                      </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPosition(position);
                    }}>
                      View Details & Apply
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedProcess && (
        <ProcessDetailDialog
          process={selectedProcess}
          open={!!selectedProcess}
          onClose={() => setSelectedProcess(null)}
        />
      )}

      {selectedPosition && (
        <PositionDetailDialog
          position={selectedPosition}
          open={!!selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </div>
  );
}

