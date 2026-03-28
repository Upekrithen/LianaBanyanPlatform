import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Anchor, ArrowLeft, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCaptain } from "@/hooks/useCaptain";
import { ShipMedallionCard } from "@/components/captain/ShipMedallionCard";

export default function ShipMedallionPage() {
  const navigate = useNavigate();
  const { captain, isCaptain, isLoading } = useCaptain();

  if (isLoading) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="ship-medallion">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Anchor className="w-8 h-8 animate-pulse text-blue-400" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!isCaptain || !captain) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="ship-medallion">
        <div className="text-center py-16 space-y-4">
          <QrCode className="w-16 h-16 mx-auto text-slate-500" />
          <h1 className="text-2xl font-bold">Medallion Access Required</h1>
          <p className="text-muted-foreground">
            Only Captains can produce Ship Medallions. Become a Captain first.
          </p>
          <Button onClick={() => navigate("/captain/become")} className="bg-blue-600 hover:bg-blue-500">
            Become a Captain
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="md" xrayId="ship-medallion">
      <div className="space-y-6 py-8">
        <Button variant="ghost" onClick={() => navigate("/captain/dashboard")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center space-y-2">
          <Badge variant="outline" className="border-blue-500/40 text-blue-300">
            <Anchor className="w-3 h-3 mr-1" />
            Captain's Medallion
          </Badge>
          <h1 className="text-3xl font-bold">Your Ship Medallion</h1>
          <p className="text-slate-400 italic">
            "A ship in harbor is safe, but that is not what ships are BUILT for."
          </p>
        </div>

        <ShipMedallionCard captain={captain} />

        <div className="text-center text-sm text-slate-500">
          Your Medallion is your proof of operational leadership.
          It links to your Captain profile and QR-scannable by anyone in the ecosystem.
        </div>
      </div>
    </PortalPageLayout>
  );
}
