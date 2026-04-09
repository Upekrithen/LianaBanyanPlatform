import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, ArrowRight, DollarSign } from "lucide-react";

type CrewRole = {
  id: string;
  role_name: string;
  description: string | null;
  hourly_rate: number | null;
  schedule_description: string | null;
  claimed_by: string | null;
};

type CrewCallBandProps = {
  storefrontName: string;
  roles: CrewRole[];
};

export function CrewCallBand({ storefrontName, roles }: CrewCallBandProps) {
  const openRoles = roles.filter((r) => !r.claimed_by);
  if (openRoles.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          {storefrontName} is Hiring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {openRoles.map((role) => (
          <div
            key={role.id}
            className="flex items-start justify-between gap-3 p-3 rounded-lg border"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm">{role.role_name}</span>
              </div>
              {role.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {role.description}
                </p>
              )}
              {role.schedule_description && (
                <p className="text-xs text-muted-foreground">
                  {role.schedule_description}
                </p>
              )}
            </div>
            <div className="text-right shrink-0 space-y-1">
              {role.hourly_rate != null && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <DollarSign className="w-3 h-3" />
                  {role.hourly_rate}/hr
                </Badge>
              )}
              <Link to="/help-wanted">
                <Button size="sm" variant="outline" className="gap-1">
                  Apply <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
