/**
 * NonprofitLanding — lianabanyan.org entry experience
 * Mission ONE hero, Gleaner's Corner, Earmark Credits, charitable subscriptions.
 */
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Landmark, Wheat, Target, HeartHandshake,
  ArrowRight, Users, MapPin, UtensilsCrossed
} from "lucide-react";

const FEATURES = [
  { icon: Wheat, title: "Gleaner's Corner", desc: "3.3% of every sale flows here. See the fund grow in real time and where it's deployed.", href: "/gleaners-corner", color: "amber" },
  { icon: Target, title: "Earmark Credits", desc: "Direct your credits to the initiatives, areas, and guilds you care about most.", href: "/earmark", color: "emerald" },
  { icon: HeartHandshake, title: "Subscribe to Feed Someone", desc: "Fund a monthly meal subscription for someone in need. Same food, no stigma.", href: "/subscribe-to-feed", color: "rose" },
] as const;

const COLOR_MAP: Record<string, string> = {
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
  rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40",
};

export default function NonprofitLanding() {
  const { data: stats } = useQuery({
    queryKey: ["org-impact-stats"],
    queryFn: async () => {
      const [earmarks, subs] = await Promise.all([
        supabase.from("earmarked_credits" as never).select("amount_cents", { count: "exact" }),
        supabase.from("charitable_subscriptions" as never).select("subscription_count, meals_funded", { count: "exact" }),
      ]);
      const earmarkRows = (earmarks.data || []) as { amount_cents: number }[];
      const subRows = (subs.data || []) as { subscription_count: number; meals_funded: number }[];
      return {
        earmarkTotal: earmarkRows.reduce((s, r) => s + r.amount_cents, 0),
        earmarkCount: earmarks.count || 0,
        subCount: subRows.reduce((s, r) => s + r.subscription_count, 0),
        mealsFunded: subRows.reduce((s, r) => s + r.meals_funded, 0),
      };
    },
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      {/* Mission ONE Hero */}
      <Link to="/mission-one" className="block group">
        <section className="relative overflow-hidden py-24 px-6 bg-gradient-to-br from-emerald-950 via-zinc-900 to-amber-950 border-b border-emerald-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
              <Landmark className="w-4 h-4" />
              lianabanyan.org
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="text-emerald-400">MISSION ONE</span>
            </h1>
            <p className="text-2xl text-amber-300/80 font-serif italic mb-2">
              Everyone Eats Tonight
            </p>
            <p className="text-base text-zinc-400 max-w-xl mx-auto mb-8">
              "For it rains on the Just and the Unjust alike." Same restaurant, same menu, same dignity. No one turned away.
            </p>
            <span className="inline-flex items-center gap-2 text-emerald-400 group-hover:gap-3 transition-all">
              Learn about Mission ONE <ArrowRight className="w-5 h-5" />
            </span>
          </div>
        </section>
      </Link>

      {/* Impact Stats */}
      <section className="max-w-4xl mx-auto px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: UtensilsCrossed, label: "Meals Funded", value: stats?.mealsFunded || 0 },
            { icon: Users, label: "Active Subscribers", value: stats?.subCount || 0 },
            { icon: Target, label: "Credits Earmarked", value: stats?.earmarkCount || 0 },
            { icon: MapPin, label: "Cities Active", value: 0 },
          ].map((s) => (
            <Card key={s.label} className="bg-zinc-900/80 border-zinc-800 backdrop-blur">
              <CardContent className="p-4 text-center">
                <s.icon className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                <p className="text-[11px] text-zinc-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const colors = COLOR_MAP[f.color] || "";
            return (
              <Link key={f.href} to={f.href}>
                <Card className={`bg-zinc-900/60 border-zinc-800 ${colors.split(" ").slice(3).join(" ")} transition-all h-full cursor-pointer group`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      <f.icon className={`w-5 h-5 ${colors.split(" ")[0]}`} />
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-500">{f.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sign In / Auth */}
      <section className="max-w-4xl mx-auto px-6 pb-16 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Sign In / Join — $5/year
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300">
              Fund Dashboard
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <a
            href="https://lianabanyan.com"
            className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            &larr; Visit Marketplace (lianabanyan.com)
          </a>
        </div>
      </section>
    </div>
  );
}
