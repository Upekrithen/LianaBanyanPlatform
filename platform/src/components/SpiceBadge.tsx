import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpiceMeta } from "@/lib/spiceRack";

type SpiceBadgeProps = {
  spice: string | null | undefined;
  showTooltip?: boolean;
  className?: string;
};

export function SpiceBadge({ spice, showTooltip = true, className }: SpiceBadgeProps) {
  const meta = getSpiceMeta(spice);
  if (!meta) return null;

  const badge = (
    <Badge variant="outline" className={className}>
      <span className="mr-1" aria-hidden="true">{meta.emoji}</span>
      {meta.displayName}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{meta.skillDomain}</p>
          <p className="text-xs text-muted-foreground mt-1">{meta.metaphorDescription}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
