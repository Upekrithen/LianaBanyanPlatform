import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

type VehicleCertBadgeProps = {
  label?: string;
  className?: string;
};

export function VehicleCertBadge({ label = "Certified by Crew", className }: VehicleCertBadgeProps) {
  return (
    <Badge
      variant="default"
      className={`gap-1 bg-emerald-600 hover:bg-emerald-700 text-white ${className ?? ""}`}
      data-xray-id="vehicle-cert-badge"
    >
      <ShieldCheck className="h-3 w-3" />
      {label}
    </Badge>
  );
}
