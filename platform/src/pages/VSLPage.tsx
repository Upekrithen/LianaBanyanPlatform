/**
 * VSLPage — Wave 17 Mini-App
 * ===========================
 * VSL: Community Vouch and Trust Coordination System.
 *
 * SECURITIES COMPLIANCE:
 *   VSL is NOT a lending product. NOT a financial instrument. NOT a financial service.
 *   It is a coordination layer that helps community members establish trust and
 *   connect people who need short-term help with those in their trusted network.
 *   Marks = participation credits only. No guaranteed payouts. No equity.
 *
 * Canon: 2,270/228/21/83.3%/Cost+20%. Membership $5/year flat. No em-dashes.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  HandHeart,
  Star,
  Heart,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { getCueCard } from "@/data/initiativeWalkthroughs";
import { usePageSEO } from "@/hooks/usePageSEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type VSLTab = "overview" | "request" | "browse" | "my-circle" | "cue-card";

interface VouchRequest {
  id: string;
  memberName: string;
  memberSince: string;
  /** What kind of help they are looking for vouching partners for */
  helpContext: string;
  /** Number of existing vouches from the circle */
  vouchCount: number;
  trustScore: number;
  tags: string[];
}

interface MyVouch {
  id: string;
  memberName: string;
  direction: "given" | "received";
  context: string;
  date: string;
}

// ─── Stub Data (TODO: wire to Supabase vsl_vouch_requests + vsl_vouches) ────

const STUB_VOUCH_REQUESTS: VouchRequest[] = [
  {
    id: "vr-1",
    memberName: "Maria T.",
    memberSince: "March 2026",
    helpContext:
      "Looking for vouching partners as I explore joining a local group-buy circle for kitchen equipment.",
    vouchCount: 3,
    trustScore: 87,
    tags: ["group-buy", "kitchen", "new-member"],
  },
  {
    id: "vr-2",
    memberName: "James K.",
    memberSince: "January 2026",
    helpContext:
      "Building credibility with the Let's Make Bread community to participate in bulk flour purchases.",
    vouchCount: 7,
    trustScore: 94,
    tags: ["lets-make-bread", "baking", "experienced"],
  },
  {
    id: "vr-3",
    memberName: "Priya N.",
    memberSince: "April 2026",
    helpContext:
      "Need vouching partners to join a cooperative tool-sharing circle in my neighborhood.",
    vouchCount: 1,
    trustScore: 62,
    tags: ["tool-sharing", "new-member", "local"],
  },
  {
    id: "vr-4",
    memberName: "Devon M.",
    memberSince: "November 2025",
    helpContext:
      "Seeking vouches to access the Household Concierge network for my home repair services.",
    vouchCount: 11,
    trustScore: 98,
    tags: ["services", "household-concierge", "established"],
  },
];

const STUB_MY_VOUCHES: MyVouch[] = [
  {
    id: "mv-1",
    memberName: "James K.",
    direction: "given",
    context: "Vouched for James's participation in the bread-baking circle.",
    date: "May 28, 2026",
  },
  {
    id: "mv-2",
    memberName: "Sarah P.",
    direction: "received",
    context: "Sarah vouched for my reliability in the Let's Get Groceries node.",
    date: "May 15, 2026",
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SecuritiesBanner() {
  return (
    <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 mb-8 flex gap-3">
      <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-red-800 text-sm uppercase tracking-wider mb-1">
          THIS IS NOT A LOAN PRODUCT. THIS IS NOT A FINANCIAL SERVICE.
        </p>
        <p className="text-red-700 text-sm">
          VSL is a community trust and coordination system. Members vouch for
          each other's trustworthiness. No money is transferred through this
          platform. No financial returns are promised or implied. Participation
          credits (Marks) represent community engagement only and have no
          monetary value or guaranteed redemption.
        </p>
      </div>
    </div>
  );
}

function TrustScorePill({ score }: { score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-100 text-emerald-800"
      : score >= 70
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-100 text-slate-700";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      Trust {score}
    </span>
  );
}

function VouchRequestCard({
  req,
  onVouch,
}: {
  req: VouchRequest;
  onVouch: (id: string) => void;
}) {
  return (
    <Card className="border border-border hover:border-emerald-400 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {req.memberName[0]}
            </div>
            <div>
              <p className="font-semibold text-foreground">{req.memberName}</p>
              <p className="text-xs text-muted-foreground">
                Member since {req.memberSince}
              </p>
            </div>
          </div>
          <TrustScorePill score={req.trustScore} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground">{req.helpContext}</p>
        <div className="flex flex-wrap gap-1">
          {req.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            <UserCheck className="inline h-3.5 w-3.5 mr-1" />
            {req.vouchCount} existing vouch{req.vouchCount !== 1 ? "es" : ""}
          </span>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onVouch(req.id)}
          >
            Vouch for {req.memberName.split(" ")[0]}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tab Panels ──────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Origin anecdote */}
      <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-emerald-500" />
            The USAA Principle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground">
          <blockquote className="italic text-muted-foreground border-l-2 border-border pl-4 py-2">
            "I thank God, truthfully and with respect, for USAA, because when I
            had at least one dollar in my checking account, I could go to the
            gas pump and fill up in order to drive and pick up the kids from
            school, and USAA would pay it... A little generosity, just a tiny
            little bit, made ALL the difference in my life, and my wife and
            children's lives."
          </blockquote>
          <p className="text-sm text-muted-foreground">
            That is the core of VSL. The difference between "structurally
            undercapitalized" and "thriving" is often absurdly small -- if
            someone would just trust you with it.
          </p>
          <p className="text-sm text-muted-foreground">
            VSL scales that principle through community accountability instead
            of institutional generosity. It is not a bank. It is not a lender.
            It is a coordination layer built on vouch and trust.
          </p>
        </CardContent>
      </Card>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Users,
            title: "1. Your Circle Vouches",
            body: "No credit checks. No collateral. Your trustworthiness is established by the people in your network who vouch for you based on real relationship.",
          },
          {
            icon: ShieldCheck,
            title: "2. Trust is Coordination",
            body: "VSL does not move money. It helps you establish credibility so other community members can make informed decisions about working with you.",
          },
          {
            icon: Star,
            title: "3. Marks for Participation",
            body: "Vouching for verified members earns participation credits (Marks). Marks reflect engagement in the community -- they are not financial instruments.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <Card key={title} className="bg-emerald-50 border-none">
            <CardHeader className="pb-2">
              <Icon className="h-7 w-7 text-emerald-600 mb-1" />
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900">{body}</CardContent>
          </Card>
        ))}
      </div>

      {/* Crown */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Star className="h-48 w-48" />
        </div>
        <div className="relative z-10">
          <Badge className="bg-emerald-500 text-white mb-4">
            Crown: Lender Mentor
          </Badge>
          <h2 className="text-2xl font-bold mb-3">
            Why We Wrote to Jessica Jackley
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            As the co-founder of Kiva, she proved that person-to-person trust
            networks could scale globally. She saw in East Africa what the
            Founder saw in the States: the hardest-working people are often the
            most structurally undercapitalized. Where Kiva helped route capital,
            Liana Banyan re-wires the market those people operate in.
          </p>
        </div>
      </div>

      {/* Origin anecdote */}
      <Card className="bg-muted border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Origin: The $400 Truck Repair
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          My father once needed $400 to repair his truck so he could keep his
          job. The bank would not touch him -- wrong credit score, wrong zip
          code. He borrowed it from a loan shark at something close to 300%
          annualized. He paid it back in full and it nearly broke us. The VSL
          structure comes directly from the rotating savings clubs that have
          existed in West Africa, Jamaica, and immigrant communities for
          generations -- systems where a small circle of people vouch for each
          other. The cooperative wraps that tradition in formal accountability
          and makes it accessible to anyone, without the shame.
        </CardContent>
      </Card>
    </div>
  );
}

function RequestVouchTab() {
  const [need, setNeed] = useState("");
  const [context, setContext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to post a vouch request");
      const { error } = await (supabase as any).from("vsl_vouch_requests").insert({
        member_id: user.id,
        need_description: need,
        context: context || null,
        status: "open",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h2 className="text-2xl font-bold text-foreground">
          Vouch Request Posted
        </h2>
        <p className="text-muted-foreground max-w-md">
          Your request is now visible to members in your trust circle. As
          community members vouch for you, your trust score will increase and
          you'll be able to participate in more cooperative activities.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Post Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Request Community Vouching
        </h2>
        <p className="text-sm text-muted-foreground">
          Describe what you are trying to participate in and why you are looking
          for vouching partners. This is a trust signal -- not a financial
          application.
        </p>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 flex gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Vouch requests are visible to your established trust circle first.
            Members vouch based on real relationship -- not creditworthiness.
            VSL does not facilitate any financial transactions.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            What activity are you seeking vouching support for?
          </label>
          <Input
            placeholder="e.g., joining the neighborhood tool-sharing circle"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            How do you know the members you are hoping will vouch for you?
          </label>
          <Textarea
            placeholder="e.g., I have participated in Let's Make Dinner for 4 months, made 12 orders, and 3 of my neighbors are already members..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            required
          />
        </div>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={!need.trim() || !context.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Vouch Request
        </Button>
      </form>
    </div>
  );
}

function BrowseTab() {
  const [search, setSearch] = useState("");
  const [vouchedIds, setVouchedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: vouchRequests = STUB_VOUCH_REQUESTS, isLoading } = useQuery({
    queryKey: ["vsl_vouch_requests", "open"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("vsl_vouch_requests")
        .select("*, profiles!vsl_vouch_requests_member_id_fkey(display_name), member_trust_scores(score)")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return STUB_VOUCH_REQUESTS;
      return data.map((r: any) => ({
        id: r.id,
        memberName: r.profiles?.display_name ?? r.member_id.slice(0, 8),
        memberSince: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        helpContext: r.need_description,
        vouchCount: 0,
        trustScore: r.member_trust_scores?.score ?? 50,
        tags: [],
      })) as VouchRequest[];
    },
  });

  const filtered = vouchRequests.filter(
    (r) =>
      r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.helpContext.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t: string) => t.includes(search.toLowerCase()))
  );

  const handleVouch = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to vouch");
      const req = vouchRequests.find((r) => r.id === id);
      if (!req) return;
      const { error } = await (supabase as any).from("vsl_vouches").insert({
        voucher_id: user.id,
        vouchee_id: id,
        request_id: id,
        notes: `Vouched via VSL browse tab for: ${req.helpContext.slice(0, 100)}`,
      });
      if (error && error.code !== "23505") throw error;
      setVouchedIds((prev) => new Set([...prev, id]));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Browse Vouch Requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Community members seeking vouching partners. Vouch only for people you
          genuinely know or have worked with.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name, context, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-center text-muted-foreground py-8">Loading...</p>}
        {!isLoading && filtered.map((req) =>
          vouchedIds.has(req.id) ? (
            <Card
              key={req.id}
              className="border border-emerald-300 bg-emerald-50"
            >
              <CardContent className="pt-4 flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  You vouched for {req.memberName}. Thank you.
                </span>
              </CardContent>
            </Card>
          ) : (
            <VouchRequestCard key={req.id} req={req} onVouch={handleVouch} />
          )
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No vouch requests match your search.
          </p>
        )}
      </div>
    </div>
  );
}

function MyCircleTab() {
  const { data: trustScore } = useQuery({
    queryKey: ["member_trust_scores", "mine"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await (supabase as any)
        .from("member_trust_scores")
        .select("score, components")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.score ?? null;
    },
  });

  const { data: myVouches = STUB_MY_VOUCHES } = useQuery({
    queryKey: ["vsl_vouches", "mine"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return STUB_MY_VOUCHES;
      const { data, error } = await (supabase as any)
        .from("vsl_vouches")
        .select("*, voucher:profiles!vsl_vouches_voucher_id_fkey(display_name), vouchee:profiles!vsl_vouches_vouchee_id_fkey(display_name)")
        .or(`voucher_id.eq.${user.id},vouchee_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error || !data || data.length === 0) return STUB_MY_VOUCHES;
      return data.map((v: any) => ({
        id: v.id,
        memberName: v.voucher_id === user.id ? v.vouchee?.display_name ?? "Member" : v.voucher?.display_name ?? "Member",
        direction: v.voucher_id === user.id ? "given" : "received",
        context: v.notes ?? "Vouched via VSL",
        date: new Date(v.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      })) as MyVouch[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          My Trust Circle
        </h2>
        <p className="text-sm text-muted-foreground">
          Vouches you have given and received. Your trust score reflects
          community participation -- not creditworthiness.
        </p>
      </div>

      {/* Trust Score Display */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
        <CardContent className="pt-6 flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-black text-emerald-700">
              {trustScore ?? "--"}
            </p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Trust Score
            </p>
          </div>
          <div className="text-sm text-emerald-800 space-y-1">
            <p>
              <strong>Vouches given:</strong>{" "}
              {myVouches.filter((v) => v.direction === "given").length}
            </p>
            <p>
              <strong>Vouches received:</strong>{" "}
              {myVouches.filter((v) => v.direction === "received").length}
            </p>
            <p className="text-xs text-emerald-600 mt-2">
              Trust Score is a participation metric, not a credit score.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Marks participation note (pawn-gated wording) */}
      <Card className="border-dashed border-slate-300">
        <CardContent className="pt-4 flex gap-3">
          <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong>Participation credits (Marks):</strong> Vouching for
            verified community members earns Marks. Marks are community
            participation credits only. They are not financial instruments and
            carry no guaranteed monetary value.{" "}
            {/* TODO (pawn): surface current Marks balance from marksPayoutWiring after pawn rate-lock by Founder */}
          </div>
        </CardContent>
      </Card>

      {/* Vouch history */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-3">
          Vouch History
        </h3>
        <div className="space-y-3">
          {myVouches.map((v) => (
            <Card key={v.id} className="border border-border">
              <CardContent className="pt-4 flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${
                    v.direction === "given"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {v.direction === "given"
                      ? `You vouched for ${v.memberName}`
                      : `${v.memberName} vouched for you`}
                  </p>
                  <p className="text-xs text-muted-foreground">{v.context}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {v.date}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    v.direction === "given"
                      ? "border-emerald-400 text-emerald-700"
                      : "border-blue-400 text-blue-700"
                  }`}
                >
                  {v.direction}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          {/* TODO: load from Supabase vsl_vouches JOIN member_profiles */}
          Showing stub history. Real vouch history loads after auth.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS: { id: VSLTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: HandHeart },
  { id: "request", label: "Request Vouches", icon: Plus },
  { id: "browse", label: "Browse Requests", icon: Search },
  { id: "my-circle", label: "My Circle", icon: UserCheck },
  { id: "cue-card", label: "Cue Card", icon: Star },
];

export default function VSLPage() {
  usePageSEO({
    title: "VSL | Liana Banyan",
    description: "The Liana Banyan community media and video-sharing layer. Creators keep 83.3% -- no ad revenue splits.",
    canonical: "https://lianabanyan.com/initiatives/vsl",
  });
  const navigate = useNavigate();
  const [tab, setTab] = useState<VSLTab>("overview");
  const cueCard = getCueCard("vsl");

  return (
    <LaunchConditionOverlay
      initiativeSlug="vsl"
      initiativeName="VSL (Vouch Short Loans)"
    >
      <PortalPageLayout maxWidth="xl" xrayId="vsl-page">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge
              variant="outline"
              className="text-emerald-600 border-emerald-600"
            >
              Initiative #9
            </Badge>
            <Badge variant="outline" className="text-slate-500 border-slate-400 text-xs">
              Trust Coordination System
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            VSL (Vouch Short Loans)
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Community trust and vouching coordination. Members vouch for each
            other's trustworthiness to unlock cooperative participation.
          </p>
        </div>

        {/* Securities Banner -- always visible */}
        <SecuritiesBanner />

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={tab === id ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(id)}
              className={tab === id ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {tab === "overview" && <OverviewTab />}
          {tab === "request" && <RequestVouchTab />}
          {tab === "browse" && <BrowseTab />}
          {tab === "my-circle" && <MyCircleTab />}
          {tab === "cue-card" && cueCard && (
            <div className="max-w-md">
              <InitiativeCueCard card={cueCard} />
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Share this card with someone who needs community trust coordination.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/cephas/founder-proof")}
          >
            Read the Founder's Anecdotes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/initiatives")}
          >
            All Initiatives
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
