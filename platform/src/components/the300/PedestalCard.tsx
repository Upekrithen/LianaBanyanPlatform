import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Users, Building2, Star, Shield, Heart, User } from "lucide-react";
import type { LeadershipPedestal } from "@/hooks/usePedestals";
import { Link } from "react-router-dom";

interface Props {
  pedestal: LeadershipPedestal;
  onSupport?: (id: string) => void;
  compact?: boolean;
}

const SEAT_ICONS: Record<string, typeof Crown> = {
  crown: Crown,
  board: Building2,
  advisory: Star,
  ambassador: Shield,
  captain_regional: Users,
};

const STATUS_STYLE: Record<string, string> = {
  invited: "border-amber-500/40 text-amber-300 bg-amber-500/10",
  accepted: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10",
  active: "border-blue-500/40 text-blue-300 bg-blue-500/10",
  declined: "border-red-500/40 text-red-300 bg-red-500/10",
  open: "border-slate-500/40 text-slate-300 bg-slate-500/10",
};

export function PedestalCard({ pedestal, onSupport, compact }: Props) {
  const SeatIcon = SEAT_ICONS[pedestal.seat_type] || Crown;

  return (
    <Card className="border-slate-700 bg-slate-800/50 hover:border-blue-500/30 transition-all group">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <SeatIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-200 truncate">
              {pedestal.seat_title}
            </h3>
            {pedestal.initiative && (
              <p className="text-[10px] text-slate-500 truncate">{pedestal.initiative}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2 space-y-2">
        <div className="flex items-center gap-2">
          {pedestal.invited_image_url ? (
            <img
              src={pedestal.invited_image_url}
              alt={pedestal.invited_name}
              className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-100">{pedestal.invited_name}</p>
            <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[pedestal.status] || ""}`}>
              {pedestal.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {!compact && pedestal.invited_description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {pedestal.invited_description}
          </p>
        )}

        <div className="flex items-center gap-1 text-xs text-amber-400/80">
          <Heart className="w-3 h-3" />
          <span>{pedestal.support_count} supporters</span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-700/50 flex gap-2">
        <Link to={`/the300/${pedestal.id}`} className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-slate-400 hover:text-blue-300"
          >
            Details
          </Button>
        </Link>
        {onSupport && pedestal.status !== "declined" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSupport(pedestal.id)}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs"
          >
            <Heart className="w-3 h-3 mr-1" />
            Support
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
