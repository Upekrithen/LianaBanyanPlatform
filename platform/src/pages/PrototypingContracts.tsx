import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock, Award, Wrench } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function PrototypingContracts() {
  return (
    <PortalPageLayout>
      <div>
        <h1 className="text-3xl font-bold">Prototyping Contracts</h1>
        <p className="text-muted-foreground">
          Pick up contracts to prototype designs, earn credits & reputation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            System Under Construction
          </CardTitle>
          <CardDescription>
            The prototyping contract system is being built for the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            When live, this system will allow members to:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-4 h-4" />
                  <span className="font-medium">Claim Contracts</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pick up prototyping jobs for designs in the Asset Library.
                  Each design needs 2 independent prototypers plus 1 backup.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">14-Day Deadline</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Submit photographic proof of your build within 2 weeks.
                  Report any issues, tolerances, or improvements discovered.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">Earn Credits</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed prototypes earn credits for the Asset Library.
                  Backup prototypers receive compensation even if not called upon.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="pt-2">
            <Badge variant="outline">
              Browse available designs in the Asset Library while this system is being built.
            </Badge>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
