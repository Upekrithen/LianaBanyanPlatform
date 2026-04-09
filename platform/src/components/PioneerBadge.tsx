import { Badge } from "@/components/ui/badge";
import { usePioneerAssignment } from "@/hooks/usePioneerAssignment";
import { cn } from "@/lib/utils";

interface PioneerBadgeProps {
  role: string;
  className?: string;
}

export function PioneerBadge({ role, className }: PioneerBadgeProps) {
  const { pioneerNumber, tierLabel, tierColor } = usePioneerAssignment(role);

  if (!pioneerNumber) return null;

  return (
    <Badge className={cn("border", tierColor, className)}>
      Pioneer #{pioneerNumber} — {tierLabel}
    </Badge>
  );
}
