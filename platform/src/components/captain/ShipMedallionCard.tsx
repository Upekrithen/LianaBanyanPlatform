import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Anchor, QrCode, Award } from "lucide-react";
import type { CaptainProfile } from "@/hooks/useCaptain";

interface Props {
  captain: CaptainProfile;
}

export function ShipMedallionCard({ captain }: Props) {
  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 overflow-hidden">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center">
          {captain.medallion_produced ? (
            <Award className="w-12 h-12 text-blue-300" />
          ) : (
            <Anchor className="w-12 h-12 text-blue-400" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-blue-100">Ship Medallion</h3>
          <p className="text-sm text-blue-400/60 italic mt-1">
            "A ship in harbor is safe, but that is not what ships are BUILT for."
          </p>
        </div>

        {captain.medallion_produced ? (
          <div className="space-y-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
              Medallion Produced
            </Badge>
            {captain.medallion_qr_code && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <QrCode className="w-4 h-4" />
                <span className="font-mono">{captain.medallion_qr_code.slice(0, 16)}...</span>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Produce Your First Medallion
          </Button>
        )}

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
          <div>
            <div className="font-bold text-slate-200">{captain.orders_managed}</div>
            Managed
          </div>
          <div>
            <div className="font-bold text-slate-200">{captain.orders_fulfilled}</div>
            Fulfilled
          </div>
          <div>
            <div className="font-bold text-emerald-400">{captain.fulfillment_rate}%</div>
            Rate
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
