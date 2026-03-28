import { useParams, useNavigate, Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Building2, Star, Shield, Users, User, Heart, MessageCircle, Anchor, MapPin } from "lucide-react";
import { usePedestal, usePedestalSignals } from "@/hooks/usePedestals";
import { SupportButton } from "@/components/the300/SupportButton";

const SEAT_ICONS: Record<string, typeof Crown> = {
  crown: Crown,
  board: Building2,
  advisory: Star,
  ambassador: Shield,
  captain_regional: Users,
};

const STATUS_STYLE: Record<string, string> = {
  invited: "border-amber-500 text-amber-300",
  accepted: "border-emerald-500 text-emerald-300",
  active: "border-blue-500 text-blue-300",
  declined: "border-red-500 text-red-300",
  open: "border-slate-500 text-slate-300",
};

export default function PedestalDetailPage() {
  const { pedestalId } = useParams<{ pedestalId: string }>();
  const navigate = useNavigate();
  const { data: pedestal, isLoading } = usePedestal(pedestalId);
  const { data: signals = [] } = usePedestalSignals(pedestalId);

  if (isLoading) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="pedestal-detail">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Crown className="w-8 h-8 animate-pulse text-blue-400" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!pedestal) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="pedestal-detail">
        <div className="text-center py-16 space-y-4">
          <Shield className="w-16 h-16 mx-auto text-slate-500" />
          <h1 className="text-2xl font-bold">Seat Not Found</h1>
          <Button onClick={() => navigate("/the300")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to The 300
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  const SeatIcon = SEAT_ICONS[pedestal.seat_type] || Crown;
  const supportSignals = signals.filter(s => s.signal_type === "support");
  const comments = signals.filter(s => s.signal_type === "comment");

  return (
    <PortalPageLayout maxWidth="lg" xrayId="pedestal-detail">
      <div className="space-y-8 py-8">
        <Button variant="ghost" onClick={() => navigate("/the300")} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to The 300
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center shrink-0">
            {pedestal.invited_image_url ? (
              <img
                src={pedestal.invited_image_url}
                alt={pedestal.invited_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-blue-400" />
            )}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SeatIcon className="w-5 h-5 text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                {pedestal.seat_title}
              </h1>
              <Badge variant="outline" className={STATUS_STYLE[pedestal.status] || ""}>
                {pedestal.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-lg text-slate-300">{pedestal.invited_name}</p>
            {pedestal.initiative && (
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                {pedestal.initiative}
              </Badge>
            )}
            {pedestal.tier && (
              <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs ml-1">
                {pedestal.tier} tier
              </Badge>
            )}
            {pedestal.circle && (
              <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs ml-1">
                {pedestal.circle}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        {pedestal.invited_description && (
          <Card className="border-slate-700 bg-slate-800/30">
            <CardContent className="p-6">
              <p className="text-slate-300 leading-relaxed">{pedestal.invited_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Letter summary */}
        {pedestal.letter_summary && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Crown Letter Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed italic">{pedestal.letter_summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Support section */}
        <Card className="border-slate-700 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" />
              Community Support ({pedestal.support_count})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SupportButton pedestalId={pedestal.id} />
            {supportSignals.length > 0 && (
              <p className="text-xs text-slate-500">
                {supportSignals.length} member{supportSignals.length !== 1 ? "s" : ""} have voiced support
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        {comments.length > 0 && (
          <Card className="border-slate-700 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="p-3 rounded-lg bg-slate-700/30 text-sm text-slate-300">
                  {c.comment_text}
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Captain CTA */}
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-6 text-center space-y-3">
          <Anchor className="w-8 h-8 mx-auto text-blue-400" />
          <h3 className="text-lg font-semibold text-blue-200">
            Or become a Captain in your region
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Regional Captain slots are open pedestals. Stake your Marks, choose your city,
            and lead your local community.
          </p>
          <Link to="/captain/become">
            <Button className="bg-blue-600 hover:bg-blue-500">
              <MapPin className="w-4 h-4 mr-2" />
              Become a Captain
            </Button>
          </Link>
        </div>
      </div>
    </PortalPageLayout>
  );
}
