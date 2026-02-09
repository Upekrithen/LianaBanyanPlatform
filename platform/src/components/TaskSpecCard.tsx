import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, AlertCircle, Lightbulb, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface TaskSpec {
  criticalDecisions: string[];
  technicalSpecs: string[];
  suggestions: string[];
  risks?: string[];
}

interface TaskSpecCardProps {
  category: string;
  spec: TaskSpec;
}

export function TaskSpecCard({ category, spec }: TaskSpecCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="border-l-4 border-l-primary/50">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Technical Specifications & Decisions
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Critical Decisions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <h4 className="font-semibold text-sm">Critical Decisions</h4>
              </div>
              <ul className="space-y-1.5 ml-6">
                {spec.criticalDecisions.map((decision, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="mr-2">
                      D{idx + 1}
                    </Badge>
                    {decision}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Specs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-sm">Technical Requirements</h4>
              </div>
              <ul className="space-y-1.5 ml-6">
                {spec.technicalSpecs.map((spec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">
                      T{idx + 1}
                    </Badge>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-sm">Implementation Suggestions</h4>
              </div>
              <ul className="space-y-1.5 ml-6">
                {spec.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="mr-2 bg-yellow-50">
                      S{idx + 1}
                    </Badge>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks (if any) */}
            {spec.risks && spec.risks.length > 0 && (
              <div className="space-y-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <h4 className="font-semibold text-sm text-destructive">Potential Risks</h4>
                </div>
                <ul className="space-y-1.5 ml-6">
                  {spec.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-destructive/80">
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
