/**
 * Pudding-style expandable innovation detail with patent link (Session 19).
 */
import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown } from "lucide-react";

interface InnovationCardProps {
  title: string;
  description?: ReactNode;
  innovationIds?: string[];
  patentLink?: string;
  defaultExpanded?: boolean;
}

export function InnovationCard({
  title,
  description,
  innovationIds = [],
  patentLink,
  defaultExpanded = false,
}: InnovationCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Card className="cephas-innovation-card">
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-2">
          {description}
          {innovationIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {innovationIds.map((id) => (
                <Badge key={id} variant="secondary">{id}</Badge>
              ))}
            </div>
          )}
          {patentLink && (
            <a
              href={patentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary"
            >
              Patent / filing <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </CardContent>
      )}
    </Card>
  );
}
