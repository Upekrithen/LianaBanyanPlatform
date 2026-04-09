/**
 * Innovation Pedestal — three-level reading view per the Knight Session 19 spec.
 * Levels: "At a Glance" → "More Info" → "Full Detail"
 */
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lightbulb } from "lucide-react";
import { InnovationSourceLinks } from "@/components/cephas/InnovationSourceLinks";

type ReadingLevel = "glance" | "more" | "full";

interface InnovationPedestalProps {
  innovationNumber: number;
  title: string;
  /** Full "A system comprises..." spec paragraph */
  fullSpec: string;
  category?: string;
  patentBag?: string;
  relatedIds?: string[];
  academicPaperSlug?: string;
}

function generateGlance(fullSpec: string): string {
  const first = fullSpec
    .replace(/^A system comprises:\s*/i, "")
    .split(",")[0]
    .replace(/^\(\d+\)\s*/, "")
    .trim();
  return first.endsWith(".") ? first : first + ".";
}

function generateMoreInfo(fullSpec: string): string {
  const clauses = fullSpec
    .replace(/^A system comprises:\s*/i, "")
    .split(/,\s*\(\d+\)\s*/);
  const cleaned = clauses.slice(0, 3).map((c) =>
    c.replace(/^\(\d+\)\s*/, "").trim()
  );
  return cleaned.join(". ").replace(/\.\./g, ".") + ".";
}

export function InnovationPedestal({
  innovationNumber,
  title,
  fullSpec,
  category,
  patentBag,
  relatedIds = [],
  academicPaperSlug,
}: InnovationPedestalProps) {
  const [level, setLevel] = useState<ReadingLevel>("glance");

  const levels: { key: ReadingLevel; label: string }[] = [
    { key: "glance", label: "At a Glance" },
    { key: "more", label: "More Info" },
    { key: "full", label: "Full Detail" },
  ];

  return (
    <Card className="border-l-4 border-l-amber-500" data-xray-id={`pedestal-${innovationNumber}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              #{innovationNumber}: {title}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {category && <Badge variant="outline">{category}</Badge>}
              {patentBag && <Badge variant="secondary">{patentBag}</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1">
          {levels.map(({ key, label }) => (
            <Button
              key={key}
              variant={level === key ? "default" : "ghost"}
              size="sm"
              onClick={() => setLevel(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="prose prose-sm max-w-none">
          {level === "glance" && <p>{generateGlance(fullSpec)}</p>}
          {level === "more" && <p>{generateMoreInfo(fullSpec)}</p>}
          {level === "full" && <p className="text-sm leading-relaxed">{fullSpec}</p>}
        </div>

        {level === "full" ? <InnovationSourceLinks innovationNumber={innovationNumber} enabled /> : null}

        {relatedIds.length > 0 && (
          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground mr-2">Related:</span>
            {relatedIds.map((id) => (
              <Badge key={id} variant="secondary" className="mr-1 text-xs">
                {id}
              </Badge>
            ))}
          </div>
        )}

        {academicPaperSlug && (
          <a
            href={`/cephas/papers/${academicPaperSlug}`}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View academic paper <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
