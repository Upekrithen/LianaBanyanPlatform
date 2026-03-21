import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PeerContractList } from "@/components/PeerContractList";
import { FileSignature } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const PeerContracts = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <PortalPageLayout>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Peer Contracts</CardTitle>
              <CardDescription>
                Create and manage contracts directly with other members - no LB approval needed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">How Peer Contracts Work:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Propose contracts directly to other members</li>
              <li>No administrator approval required</li>
              <li>Choose participation, cash, or hybrid compensation</li>
              <li>Set deliverables and time commitments</li>
              <li>Accept, reject, or negotiate terms</li>
              <li>Scale your collaborations independently</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <PeerContractList />
    </PortalPageLayout>
  );
};

export default PeerContracts;
