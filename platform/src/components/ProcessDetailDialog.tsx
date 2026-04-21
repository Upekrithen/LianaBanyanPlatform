import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProcessDetailDialogProps {
  process: any;
  open: boolean;
  onClose: () => void;
}

export function ProcessDetailDialog({ process, open, onClose }: ProcessDetailDialogProps) {
  const { data: steps, isLoading } = useQuery({
    queryKey: ['process-steps', process.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('process_steps')
        .select('*')
        .eq('process_id', process.id)
        .order('step_number');

      if (error) throw error;
      return data;
    },
    enabled: open && !!process.id
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{process.process_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Process Overview */}
          <div className="space-y-4">
            <p className="text-muted-foreground">{process.description}</p>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Estimated Duration:</span>
              <span className="text-muted-foreground">{process.estimated_duration}</span>
            </div>

            {process.prerequisites && process.prerequisites.length > 0 && (
              <div className="p-4 border rounded-lg space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Prerequisites
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {process.prerequisites.map((prereq: string, idx: number) => (
                    <li key={idx}>• {prereq}</li>
                  ))}
                </ul>
              </div>
            )}

            {process.liana_banyan_support && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Liana Banyan Support
                </p>
                <p className="text-sm text-muted-foreground">{process.liana_banyan_support}</p>
              </div>
            )}
          </div>

          {/* Process Steps */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Step-by-Step Guide</h3>

            {isLoading ? (
              <div className="text-center py-4">Loading steps...</div>
            ) : steps && steps.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {steps.map((step, idx) => (
                  <AccordionItem key={step.id} value={`step-${idx}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Badge variant="outline" className="shrink-0">
                          Step {step.step_number}
                        </Badge>
                        <span className="font-medium">{step.step_title}</span>
                        {step.estimated_time && (
                          <span className="text-sm text-muted-foreground ml-auto mr-4">
                            {step.estimated_time}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <p className="text-muted-foreground">{step.step_description}</p>

                      {step.required_documents && step.required_documents.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Required Documents:
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {step.required_documents.map((doc: string, idx: number) => (
                              <li key={idx}>• {doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.resources_links && Array.isArray(step.resources_links) && step.resources_links.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-sm">Resources:</p>
                          <div className="space-y-2">
                            {step.resources_links.map((resource: any, idx: number) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                className="w-full justify-between"
                                asChild
                              >
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <span className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {resource.name}
                                  </span>
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.notes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{step.notes}</p>
                        </div>
                      )}

                      {step.is_optional && (
                        <Badge variant="secondary">Optional Step</Badge>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No steps defined yet for this process.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
