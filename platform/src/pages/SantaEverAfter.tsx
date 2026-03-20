import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Truck, CheckCircle, AlertTriangle, User, Star, Package, ChevronRight, ShieldCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  type SantaGift, type CaptainProfile, type GiftStatus,
  SAMPLE_GIFTS, SAMPLE_CAPTAINS,
  fetchSentGifts, fetchReceivedGifts, fetchCaptains, fetchCaptainProfile,
  activateOopsCode, fetchSantaStats,
} from "@/lib/santaService";

const STATUS_STYLES: Record<GiftStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-slate-500/20", text: "text-slate-400", label: "Pending" },
  assigned: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Assigned" },
  in_transit: { bg: "bg-purple-500/20", text: "text-purple-400", label: "In Transit" },
  delivered: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Delivered" },
  oops_code: { bg: "bg-red-500/20", text: "text-red-400", label: "Oops Code" },
  completed: { bg: "bg-green-500/20", text: "text-green-400", label: "Completed" },
  cancelled: { bg: "bg-slate-500/20", text: "text-slate-500", label: "Cancelled" },
};

const STATUS_ORDER: GiftStatus[] = ["pending", "assigned", "in_transit", "delivered", "completed"];

function StatusBadge({ status }: { status: GiftStatus }) {
  const s = STATUS_STYLES[status];
  return <Badge className={`${s.bg} ${s.text} border-0`}>{s.label}</Badge>;
}

function ConfirmCheck({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <CheckCircle className={`w-3.5 h-3.5 ${done ? "text-green-400" : "text-slate-600"}`} />
      <span className={done ? "text-green-400" : "text-slate-500"}>{label}</span>
    </div>
  );
}

export default function SantaEverAfter() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"sent" | "received">("sent");
  const [sentGifts, setSentGifts] = useState<SantaGift[]>(SAMPLE_GIFTS);
  const [receivedGifts, setReceivedGifts] = useState<SantaGift[]>([]);
  const [captains, setCaptains] = useState<CaptainProfile[]>(SAMPLE_CAPTAINS);
  const [myCaptainProfile, setMyCaptainProfile] = useState<CaptainProfile | null>(null);
  const [oopsInput, setOopsInput] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchSentGifts(user.id).then(setSentGifts);
    fetchReceivedGifts(user.id).then(setReceivedGifts);
    fetchCaptains().then(setCaptains);
    fetchCaptainProfile(user.id).then(setMyCaptainProfile);
  }, [user?.id]);

  if (!user) {
    return (
      <PortalPageLayout variant="stage" maxWidth="xl" xrayId="santa-ever-after">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-slate-900/80 border-slate-800 max-w-md">
            <CardContent className="py-8 text-center">
              <p className="text-slate-400 mb-4">Sign in to access Santa Ever After.</p>
              <Button asChild><Link to="/auth">Sign in</Link></Button>
            </CardContent>
          </Card>
        </div>
      </PortalPageLayout>
    );
  }

  const activeGifts = tab === "sent" ? sentGifts : receivedGifts;

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="santa-ever-after">
      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gift className="w-8 h-8 text-red-400" />
            Santa Ever After
          </h1>
          <p className="text-slate-400">Giving Without Getting Caught — Buy a gift. Someone else delivers it. Everyone wins.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Gifts Sent", value: sentGifts.length, icon: Gift },
            { label: "Active Captains", value: captains.filter(c => c.isActive).length, icon: User },
            { label: "Completed", value: sentGifts.filter(g => g.status === "completed").length, icon: CheckCircle },
            { label: "Oops Codes", value: sentGifts.filter(g => g.oopsCodeUsed).length, icon: AlertTriangle },
          ].map(s => (
            <Card key={s.label} className="bg-slate-900/60 border-slate-800">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Gifts */}
        <section className="space-y-4">
          <div className="flex gap-2">
            <Button variant={tab === "sent" ? "default" : "outline"} size="sm" onClick={() => setTab("sent")}>Gifts I've Sent</Button>
            <Button variant={tab === "received" ? "default" : "outline"} size="sm" onClick={() => setTab("received")}>Gifts I'm Receiving</Button>
          </div>

          {activeGifts.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-800"><CardContent className="py-8 text-center text-slate-400">No gifts yet. Send one!</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {activeGifts.map(gift => (
                <Card key={gift.id} className="bg-slate-900/60 border-slate-800">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold">{gift.giftDescription}</p>
                        <p className="text-sm text-slate-400">To: {gift.recipientName} &middot; {gift.amountPaid} {gift.currencyType}</p>
                      </div>
                      <StatusBadge status={gift.status} />
                    </div>
                    {/* Progress bar */}
                    <div className="flex gap-1 mb-3">
                      {STATUS_ORDER.map((s, i) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full ${STATUS_ORDER.indexOf(gift.status) >= i ? "bg-primary" : "bg-slate-800"}`} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <ConfirmCheck done={gift.senderConfirmed} label="Sender" />
                      <ConfirmCheck done={gift.captainConfirmed} label="Captain" />
                      <ConfirmCheck done={gift.recipientConfirmed} label="Recipient" />
                      {gift.captainName && <span className="text-xs text-slate-400">Captain: {gift.captainName}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <Separator className="border-slate-800" />

        {/* Captain Collateral Directory */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Captain Collateral Directory
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {captains.map(cap => (
              <Card key={cap.id} className="bg-slate-900/60 border-slate-800">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">{cap.displayName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-400">Deliveries:</span> {cap.deliveriesCompleted}</div>
                    <div><span className="text-slate-400">Rating:</span> {cap.rating.toFixed(1)} <Star className="inline w-3 h-3 text-yellow-400" /></div>
                    <div><span className="text-slate-400">Success:</span> {cap.successRate}%</div>
                    <div><span className="text-slate-400">Staked:</span> {cap.totalStaked}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Captain Dashboard (if user is a captain) */}
        {myCaptainProfile && (
          <>
            <Separator className="border-slate-800" />
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-500" />
                My Captain Dashboard
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400">Deliveries</p><p className="text-2xl font-bold">{myCaptainProfile.deliveriesCompleted}</p></CardContent></Card>
                <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400">Rating</p><p className="text-2xl font-bold">{myCaptainProfile.rating.toFixed(1)}</p></CardContent></Card>
                <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400">Marks Staked</p><p className="text-2xl font-bold">{myCaptainProfile.totalStaked}</p></CardContent></Card>
                <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3"><p className="text-xs text-slate-400">Success Rate</p><p className="text-2xl font-bold">{myCaptainProfile.successRate}%</p></CardContent></Card>
              </div>
            </section>
          </>
        )}

        <Separator className="border-slate-800" />

        {/* The Oops Code */}
        <section className="space-y-4">
          <Card className="bg-red-950/30 border-red-900/50">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Something went wrong? Enter 9-9-9-9
              </CardTitle>
              <CardDescription className="text-red-300/70">
                The Oops Code is your panic button. Only available for gifts that are in transit or delivered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  maxLength={7}
                  placeholder="9-9-9-9"
                  value={oopsInput}
                  onChange={e => setOopsInput(e.target.value)}
                  className="bg-slate-900 border border-red-800 rounded px-4 py-2 text-center text-xl font-mono tracking-widest w-40 text-white"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={oopsInput !== "9-9-9-9"}
                  onClick={async () => {
                    const eligible = sentGifts.find(g => g.status === "in_transit" || g.status === "delivered");
                    if (!eligible) return;
                    const ok = await activateOopsCode(eligible.id);
                    if (ok && user?.id) {
                      fetchSentGifts(user.id).then(setSentGifts);
                      setOopsInput("");
                    }
                  }}
                >
                  Activate Oops Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="border-slate-800" />

        {/* How It Works */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Gift, title: "You buy the gift", desc: "Choose a product or describe a custom gift — someone else delivers it." },
              { icon: ShieldCheck, title: "Captain Collateral stakes their own Marks", desc: "Your delivery captain puts skin in the game as a guarantee of successful delivery." },
              { icon: CheckCircle, title: "Three-party verification", desc: "You confirm purchase, captain confirms delivery, recipient confirms receipt." },
              { icon: AlertTriangle, title: "The Oops Code (9-9-9-9)", desc: "The panic button — use it if anything goes wrong with the delivery." },
            ].map(item => (
              <Card key={item.title} className="bg-slate-900/60 border-slate-800">
                <CardContent className="py-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PortalPageLayout>
  );
}
