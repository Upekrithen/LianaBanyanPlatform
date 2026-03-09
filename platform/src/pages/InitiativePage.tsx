/**
 * GENERIC INITIATIVE PAGE
 * =======================
 * Shared template for all Sweet Sixteen initiatives.
 * Renders based on the URL slug. Each initiative has custom content
 * but the same structure: About, Get Involved, Statistics.
 */

import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music, BookOpen, Banknote, Scale, Hammer, Home,
  Users, Briefcase, Heart, ArrowRight, ArrowLeft, Star, DollarSign,
  UtensilsCrossed, ShoppingCart, ShoppingBag, Pill, Shield, Zap,
} from "lucide-react";

interface InitiativeConfig {
  slug: string;
  icon: React.ElementType;
  color: string;
  features: { title: string; items: string[] }[];
}

const INITIATIVE_CONFIGS: Record<string, InitiativeConfig> = {
  jukebox: {
    slug: "jukebox",
    icon: Music,
    color: "from-pink-500/5 to-rose-500/10 border-pink-500/20",
    features: [
      { title: "For Artists", items: ["Keep 83.3% of every stream, sale, and license", "Constitutionally locked — no one can change this", "Direct-to-fan sales without middlemen", "Transparent analytics on every play"] },
      { title: "For Listeners", items: ["Support artists directly", "Discover independent music", "Know exactly where your money goes", "Community-curated playlists"] },
    ],
  },
  didasko: {
    slug: "didasko",
    icon: BookOpen,
    color: "from-sky-500/5 to-blue-500/10 border-sky-500/20",
    features: [
      { title: "For Educators", items: ["Keep 83.3% of course/content revenue", "Build curriculum cooperatively", "Peer review and quality standards", "BOUNTY K-12 for public education"] },
      { title: "For Learners", items: ["Affordable courses at Cost+20%", "Community-driven content", "Certifications backed by Guilds", "Free resources via charitable pool"] },
    ],
  },
  vsl: {
    slug: "vsl",
    icon: Banknote,
    color: "from-emerald-500/5 to-green-500/10 border-emerald-500/20",
    features: [
      { title: "Voucher Short Loans", items: ["Peer-to-peer lending circles using voucher credits", "Three-gear currency integration", "Transparent terms — no hidden fees", "Community accountability"] },
      { title: "How It Works", items: ["Join a lending circle (5-20 members)", "Contribute monthly to shared pool", "Take turns borrowing from the pool", "Non-extractive terms — community first"] },
    ],
  },
  "harper-guild": {
    slug: "harper-guild",
    icon: Scale,
    color: "from-indigo-500/5 to-violet-500/10 border-indigo-500/20",
    features: [
      { title: "What Harpers Do", items: ["Ethics checking and truth-telling", "Information verification and fact-gathering", "Audit nodes for quality standards", "Hold power accountable — Community Chalkboard"] },
      { title: "Becoming a Harper", items: ["6+ months membership required", "Pass algorithmic selection (not committees)", "Peer vote confirmation", "Continuous training and certification"] },
    ],
  },
  "lets-make-bread": {
    slug: "lets-make-bread",
    icon: Briefcase,
    color: "from-amber-500/5 to-yellow-500/10 border-amber-500/20",
    features: [
      { title: "Business Simulator", items: ["$5 entry fee — practice running a business risk-free", "Virtual storefront, inventory, and customers", "Learn pricing, marketing, and operations", "Graduate to real business incubator"] },
      { title: "Real Business Incubator", items: ["When ready, launch your real business", "Mentorship from experienced members", "Access to cooperative resources", "Keep 83.3% of every sale"] },
    ],
  },
  "family-table": {
    slug: "family-table",
    icon: Heart,
    color: "from-red-500/5 to-pink-500/10 border-red-500/20",
    features: [
      { title: "What It Is", items: ["Private family operations hub", "Shared calendars, budgets, and meal planning", "Task coordination for your household", "Family document management"] },
      { title: "How It Helps", items: ["Keep your family organized in one place", "Budgeting and expense tracking", "Private — only your family sees this", "Integrates with other initiatives (groceries, dinner)"] },
    ],
  },
  "rally-group": {
    slug: "rally-group",
    icon: Users,
    color: "from-red-500/5 to-orange-500/10 border-red-500/20",
    features: [
      { title: "Crisis Response", items: ["Community mutual aid coordination", "Emergency resource mobilization", "Disaster response logistics", "The Underground Railroad network"] },
      { title: "How to Help", items: ["Volunteer as a Responder", "Donate to the Rally Fund", "Host emergency supplies at your node", "Train in crisis response"] },
    ],
  },
  "household-concierge": {
    slug: "household-concierge",
    icon: Home,
    color: "from-teal-500/5 to-cyan-500/10 border-teal-500/20",
    features: [
      { title: "Services", items: ["Cleaning, organizing, maintenance", "Pet care and sitting", "Yard work and landscaping", "Errands and deliveries"] },
      { title: "For Providers", items: ["Set your own rates", "Keep 83.3% of every job", "Build reputation through reviews", "Flexible scheduling"] },
    ],
  },
  "brass-tacks": {
    slug: "brass-tacks",
    icon: Briefcase,
    color: "from-gray-500/5 to-slate-500/10 border-gray-500/20",
    features: [
      { title: "Cooperative Manufacturing", items: ["Physical production and manufacturing", "Supply chain management at Cost+20%", "Shared tooling and equipment", "Six production levels from prototype to mass"] },
      { title: "For Makers", items: ["Access manufacturing infrastructure", "Keep 83.3% of every product sold", "Quality standards via Harper audits", "Distributed node production runs"] },
    ],
  },
  "lets-make-dinner": {
    slug: "lets-make-dinner",
    icon: UtensilsCrossed,
    color: "from-orange-500/5 to-red-500/10 border-orange-500/20",
    features: [
      { title: "Three Ways to Eat", items: ["DIY with Grocery Boxes — curated ingredients + recipes", "Group Cook — neighbors cooking together", "Chef Prepared — hire certified member chefs"] },
      { title: "The Economics", items: ["Creators and Workers keep 83.3% of every transaction", "Meal chains: one box → multiple dinners", "Kindling partners donate to initiatives", "Cost+20% pricing — transparent and fair"] },
    ],
  },
  "lets-get-groceries": {
    slug: "lets-get-groceries",
    icon: ShoppingCart,
    color: "from-green-500/5 to-emerald-500/10 border-green-500/20",
    features: [
      { title: "Cooperative Grocery", items: ["Bulk buying power for members", "Local sourcing when possible", "Cost+20% pricing on all items", "Grocery boxes for meal planning"] },
      { title: "How It Works", items: ["Order through the platform", "Pick up at local nodes or delivery", "Volume discounts passed to members", "Support local farmers and producers"] },
    ],
  },
  "lets-go-shopping": {
    slug: "lets-go-shopping",
    icon: ShoppingBag,
    color: "from-purple-500/5 to-fuchsia-500/10 border-purple-500/20",
    features: [
      { title: "Cooperative Commerce", items: ["Member-made products and services", "Curated marketplace with quality standards", "Keep 83.3% of every sale", "Cross-initiative integration"] },
      { title: "For Sellers", items: ["List products at Cost+20%", "Harper-audited quality assurance", "Reputation building through reviews", "Access to cooperative logistics"] },
    ],
  },
  "tatiana-schlossburg-health-accords": {
    slug: "tatiana-schlossburg-health-accords",
    icon: Pill,
    color: "from-blue-500/5 to-cyan-500/10 border-blue-500/20",
    features: [
      { title: "Medication Access", items: ["Cooperative purchasing for prescriptions", "Generic alternatives when available", "Transparent pricing — no hidden markups", "Emergency medication fund"] },
      { title: "How We Help", items: ["Negotiate bulk pricing", "Connect to patient assistance programs", "Charitable fund for those in need", "Education on medication costs"] },
    ],
  },
  msa: {
    slug: "msa",
    icon: Shield,
    color: "from-slate-500/5 to-zinc-500/10 border-slate-500/20",
    features: [
      { title: "Medical Savings Accounts", items: ["Cooperative medical savings pools", "Transparent administration at Cost+20%", "Pooled medical resources for members", "Emergency health fund access"] },
      { title: "How It Works", items: ["Members contribute to shared medical fund", "Use for prescriptions, procedures, wellness", "Fair terms — no insurance company extraction", "Integrates with Health Accords initiative"] },
    ],
  },
  "defense-klaus": {
    slug: "defense-klaus",
    icon: Shield,
    color: "from-amber-500/5 to-yellow-500/10 border-amber-500/20",
    features: [
      { title: "For Someone You Love", items: ["Legal defense fund for members", "Pre-paid legal services at Cost+20%", "Document preparation assistance", "Access to cooperative counsel network"] },
      { title: "How It Works", items: ["Small monthly contribution builds fund", "Access legal help when needed", "Community-supported defense", "No one faces legal trouble alone"] },
    ],
  },
  "power-to-the-people": {
    slug: "power-to-the-people",
    icon: Zap,
    color: "from-yellow-500/5 to-amber-500/10 border-yellow-500/20",
    features: [
      { title: "Political Expedition", items: ["Civic engagement and voter education", "Community organizing for democratic participation", "Non-partisan — focused on empowering people", "Tools for understanding policy impacts"] },
      { title: "Getting Involved", items: ["Register to vote through the platform", "Join local civic engagement groups", "Access voter guides and education", "Participate in community policy discussions"] },
    ],
  },
};

// Initiatives that have dedicated pages - redirect to them
const DEDICATED_PAGES: Record<string, string> = {
  "family-table": "/family",
  "lets-make-dinner": "/lets-make-dinner",
};

export default function InitiativePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dedicated page if one exists
  if (slug && DEDICATED_PAGES[slug]) {
    return <Navigate to={DEDICATED_PAGES[slug]} replace />;
  }
  
  const config = INITIATIVE_CONFIGS[slug || ""] || null;

  // Fetch initiative data
  const { data: initiative } = useQuery({
    queryKey: ["initiative", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("initiative_stats")
        .select("*")
        .eq("id", slug)
        .single();
      if (data) return data;
      // Fallback
      const { data: fallback } = await supabase
        .from("initiatives")
        .select("*")
        .eq("id", slug)
        .single();
      return fallback;
    },
    enabled: !!slug,
  });

  if (!config) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">Initiative not found: {slug}</p>
      </div>
    );
  }

  const Icon = config.icon;
  const totalRaised = Number(initiative?.total_raised || 0);
  const goalAmount = Number(initiative?.goal_amount || 0);
  const progressPercent = goalAmount > 0 ? (totalRaised / goalAmount) * 100 : 0;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Back to Initiatives button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/?view=initiatives')}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to 16 Initiatives
      </Button>
      
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{initiative?.name || slug}</h1>
          <p className="text-muted-foreground">{initiative?.tagline || ""}</p>
        </div>
      </div>

      <Card className={`border bg-gradient-to-br ${config.color}`}>
        <CardHeader>
          <CardTitle>About This Initiative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{initiative?.description}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {config.features.map((feature, i) => (
              <div key={i} className="space-y-2">
                <h3 className="font-semibold">{feature.title}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {feature.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {goalAmount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Funding Progress</span>
              <span>${totalRaised.toLocaleString()} / ${goalAmount.toLocaleString()}</span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{initiative?.donation_count || 0} donations</span>
              <span>{initiative?.unique_donors || 0} donors</span>
            </div>
          </CardContent>
        </Card>
      )}

      {initiative?.volunteer_roles && initiative.volunteer_roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volunteer Roles Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {initiative.volunteer_roles.map((role: string) => (
                <Badge key={role} variant="outline">{role}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button className="gap-2" onClick={() => navigate("/initiatives")}>
          <ArrowRight className="w-4 h-4" />
          Browse All Initiatives
        </Button>
        {user && (
          <Button variant="outline" className="gap-2">
            <Heart className="w-4 h-4" />
            Support This Initiative
          </Button>
        )}
      </div>
    </div>
  );
}
