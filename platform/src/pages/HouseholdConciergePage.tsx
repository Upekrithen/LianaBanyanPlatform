/**
 * Household Concierge -- Wave 14 Mini-App / BP073 W7 (real-data wired)
 * ======================================================================
 * Task coordination, service matching (local providers from service_providers table),
 * Cost+20% pricing, Marks for task completion, provider reputation system.
 *
 * Supabase: service_providers (real), concierge_bookings (migration: 20260603100004)
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Home, Wrench, Search, Star, ShieldCheck, MapPin, Clock,
  ArrowRight, ArrowLeft, Plus, CheckCircle2, CreditCard, BookOpen,
  Sparkles, DollarSign, Tag, Users, XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getCueCard, getWalkthrough } from "@/data/initiativeWalkthroughs";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ───────────────────────────────────────────────────────────────────

// Matches service_providers table in Supabase
interface ServiceProvider {
  id: string;
  provider_name: string;
  primary_category: string;
  secondary_categories?: string[] | null;
  description?: string | null;
  tagline?: string | null;
  hourly_rate?: number | null;
  minimum_project?: number | null;
  average_rating?: number | null;
  total_reviews?: number | null;
  completed_jobs?: number | null;
  harper_verified?: boolean | null;
  identity_verified?: boolean | null;
  skills?: string[] | null;
  service_area?: string | null;
  availability_status?: string | null;
  pricing_model?: string | null;
}

// Typed stub - concierge_bookings table doesn't exist yet
// TODO: add to Supabase schema and update types.ts
interface ConciergeBookingStub {
  id: string;
  provider_id: string;
  provider_name: string;
  task_description: string;
  category: string;
  provider_cost: number;
  platform_fee: number;
  total_cost: number;
  marks_on_completion: number;
  status: "pending" | "accepted" | "completed" | "cancelled";
  scheduled_for?: string;
  created_at: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVICE_CATEGORIES = [
  { value: "cleaning", label: "Cleaning", icon: "🧹" },
  { value: "repairs", label: "Repairs & Maintenance", icon: "🔧" },
  { value: "yard", label: "Yard Work", icon: "🌿" },
  { value: "errands", label: "Errands", icon: "🚗" },
  { value: "pet_care", label: "Pet Care", icon: "🐾" },
  { value: "organizing", label: "Organizing", icon: "📦" },
  { value: "tech", label: "Tech Help", icon: "💻" },
  { value: "other", label: "Other", icon: "✨" },
];

const MARKS_PER_TASK = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Provider rate + 20% platform margin */
function costPlusTwenty(providerCost: number): number {
  return providerCost * 1.2;
}

/** 83.3% stays with provider, 16.7% platform */
function providerEarns(total: number): number {
  return total * 0.833;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{value?.toFixed(1) ?? "N/A"}</span>
    </span>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────

function ProviderCard({ provider, onBook }: { provider: ServiceProvider; onBook: (p: ServiceProvider) => void }) {
  const rate = provider.hourly_rate ?? 0;
  const memberPrice = costPlusTwenty(rate);

  const categoryMeta = SERVICE_CATEGORIES.find((c) => c.value === provider.primary_category);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {categoryMeta?.icon && <span>{categoryMeta.icon}</span>}
              {provider.provider_name}
            </CardTitle>
            <CardDescription className="mt-0.5">
              {provider.tagline ?? provider.primary_category}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {provider.harper_verified && (
              <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-300 gap-1 font-normal">
                <ShieldCheck className="h-3 w-3" />
                Harper verified
              </Badge>
            )}
            {provider.availability_status === "available" && (
              <Badge className="text-xs bg-green-100 text-green-700 border-green-300 font-normal">
                Available
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {provider.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>
        )}

        {/* Reputation */}
        <div className="flex items-center justify-between text-sm">
          <StarRating value={provider.average_rating ?? 0} />
          <span className="text-xs text-muted-foreground">
            {provider.total_reviews ?? 0} reviews | {provider.completed_jobs ?? 0} jobs
          </span>
        </div>

        {/* Cost+20% pricing */}
        {rate > 0 && (
          <div className="bg-muted/50 rounded p-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider rate:</span>
              <span>${rate.toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform margin (+20%):</span>
              <span>${(rate * 0.2).toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border/50 pt-1">
              <span>Your rate (Cost+20%):</span>
              <span>${memberPrice.toFixed(2)}/hr</span>
            </div>
            <p className="text-muted-foreground/70">Provider keeps 83.3% of your payment</p>
          </div>
        )}

        {provider.skills && provider.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {provider.skills.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs font-normal">{s}</Badge>
            ))}
            {provider.skills.length > 4 && (
              <Badge variant="outline" className="text-xs font-normal">+{provider.skills.length - 4}</Badge>
            )}
          </div>
        )}

        {provider.service_area && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {provider.service_area}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          size="sm"
          className="w-full gap-2"
          onClick={() => onBook(provider)}
          disabled={provider.availability_status === "unavailable"}
        >
          <CheckCircle2 className="h-4 w-4" />
          {provider.availability_status === "unavailable" ? "Unavailable" : "Book This Provider"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Booking Dialog ───────────────────────────────────────────────────────────

function BookingDialog({
  provider,
  onClose,
  onBooked,
}: {
  provider: ServiceProvider | null;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [form, setForm] = useState({ task_description: "", hours: "1", scheduled_for: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!provider) return null;

  const hours = parseFloat(form.hours) || 1;
  const providerRate = provider.hourly_rate ?? 0;
  const providerCost = providerRate * hours;
  const platformFee = providerCost * 0.2;
  const total = costPlusTwenty(providerCost);
  const providerEarnsAmt = providerEarns(total);

  const handleBook = async () => {
    if (!form.task_description) {
      toast({ title: "Describe the task", description: "Please describe what needs to be done.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to book a provider");

      const { error } = await (supabase as any).from("concierge_bookings").insert({
        requester_id: user.id,
        provider_id: provider.id,
        provider_name: provider.provider_name,
        task_description: form.task_description,
        category: provider.primary_category,
        provider_cost: providerCost,
        platform_fee: platformFee,
        total_cost: total,
        marks_on_completion: MARKS_PER_TASK,
        scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
        status: "pending",
      });
      if (error) throw error;

      toast({
        title: "Booking requested",
        description: `Your request to ${provider.provider_name} has been sent. You earn ${MARKS_PER_TASK} Marks on completion.`,
      });
      onBooked();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!provider} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book {provider.provider_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Describe the task *</Label>
            <Textarea
              rows={3}
              placeholder="What needs to be done? Include any relevant details about your home or the specific problem."
              value={form.task_description}
              onChange={(e) => setForm({ ...form, task_description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Estimated hours</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred date</Label>
              <Input
                type="date"
                value={form.scheduled_for}
                onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
              />
            </div>
          </div>

          {/* Transparent pricing breakdown */}
          <div className="rounded border bg-teal-50/50 border-teal-200 p-3 space-y-1.5 text-sm">
            <p className="font-medium text-teal-900 flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              Transparent Pricing (Cost+20%)
            </p>
            <div className="flex justify-between text-muted-foreground">
              <span>Provider rate ({hours} hr{hours !== 1 ? "s" : ""} @ ${providerRate.toFixed(2)}/hr):</span>
              <span>${providerCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform margin (20%):</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-teal-200 pt-1.5">
              <span>You pay:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-teal-700 text-xs">
              <span>Provider earns (83.3%):</span>
              <span>${providerEarnsAmt.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded border bg-amber-50/50 border-amber-200 p-2 text-xs text-amber-800 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
            You earn {MARKS_PER_TASK} Marks when this task is marked complete. Marks are participation credits only.
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleBook} disabled={loading}>
              {loading ? "Requesting..." : "Confirm Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── My Bookings ────────────────────────────────────────────────────────────

function MyBookingsPanel() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["concierge_bookings", "mine"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("concierge_bookings")
        .select("*")
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <div className="py-10 text-center text-muted-foreground text-sm">Loading bookings...</div>;

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-3">
          <Home className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">No bookings yet.</p>
          <p className="text-sm text-muted-foreground">Book a service provider and your active jobs will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {stubs.map((b) => (
        <Card key={b.id}>
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">{b.task_description}</p>
              <p className="text-xs text-muted-foreground">{b.provider_name} | ${b.total_cost.toFixed(2)}</p>
            </div>
            <Badge variant={b.status === "completed" ? "default" : "outline"} className="capitalize">
              {b.status}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Become a Provider ────────────────────────────────────────────────────────

function BecomeProviderPanel() {
  const navigate = useNavigate();
  return (
    <Card className="bg-gradient-to-br from-teal-800 to-cyan-900 text-white border-none">
      <CardContent className="py-10 text-center space-y-4 px-8">
        <Wrench className="h-12 w-12 text-teal-300 mx-auto" />
        <h2 className="text-2xl font-bold">Own Your Neighborhood Route</h2>
        <p className="text-teal-100 max-w-lg mx-auto">
          Stop driving across town for single jobs. Claim a neighborhood, build a dense route,
          and keep 83.3% of every transaction. The platform handles billing, scheduling, and routing.
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
          <div>
            <p className="text-2xl font-bold text-teal-300">83.3%</p>
            <p className="text-xs text-teal-200">you keep</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-300">Cost+20%</p>
            <p className="text-xs text-teal-200">member price</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-300">{MARKS_PER_TASK}</p>
            <p className="text-xs text-teal-200">Marks/job</p>
          </div>
        </div>

        <Button
          size="lg"
          className="bg-teal-400 hover:bg-teal-300 text-teal-900 font-bold border-none gap-2"
          onClick={() => navigate("/service-node/register")}
        >
          Register as a Service Node <ArrowRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HouseholdConciergePage() {
  usePageSEO({
    title: "Household Concierge | Liana Banyan",
    description: "Neighbor-to-neighbor household task coordination. No gig economy extraction -- providers keep 83.3%.",
    canonical: "https://lianabanyan.com/initiatives/household-concierge",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["service-providers", categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("service_providers")
        .select("*")
        .order("average_rating", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("primary_category", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ServiceProvider[];
    },
  });

  const filtered = providers.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.provider_name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      (p.skills ?? []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const cueCard = getCueCard("household-concierge");
  const walkthrough = getWalkthrough("household-concierge");

  return (
    <LaunchConditionOverlay initiativeSlug="household-concierge" initiativeName="Household Concierge">
      <PortalPageLayout maxWidth="xl" xrayId="household-concierge-page">
        <div className="space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/initiatives")} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            All Initiatives
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-teal-600" />
              <div>
                <h1 className="text-3xl font-bold">Household Concierge</h1>
                <p className="text-muted-foreground">
                  Home services by vetted neighbors. Cost+20% pricing. 83.3% to providers.
                </p>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="find" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-0">
              <TabsTrigger value="find" className="gap-1.5">
                <Search className="h-4 w-4" />
                Find a Provider
              </TabsTrigger>
              <TabsTrigger value="my-bookings" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger value="earn" className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                Offer Skills
              </TabsTrigger>
              {walkthrough && (
                <TabsTrigger value="walkthrough" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  How It Works
                </TabsTrigger>
              )}
              {cueCard && (
                <TabsTrigger value="cue-card" className="gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Cue Card
                </TabsTrigger>
              )}
            </TabsList>

            {/* ── Find a Provider ── */}
            <TabsContent value="find" className="mt-4 space-y-4">
              {/* Search + filter */}
              <div className="flex gap-3 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers or skills..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={categoryFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategoryFilter("all")}
                >
                  All
                </Badge>
                {SERVICE_CATEGORIES.map((c) => (
                  <Badge
                    key={c.value}
                    variant={categoryFilter === c.value ? "default" : "outline"}
                    className="cursor-pointer gap-1"
                    onClick={() => setCategoryFilter(c.value)}
                  >
                    {c.icon} {c.label}
                  </Badge>
                ))}
              </div>

              {/* Providers grid */}
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading providers...</p>
              ) : filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center space-y-3">
                    <Search className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-muted-foreground">
                      {providers.length === 0
                        ? "No providers in the directory yet. Be the first!"
                        : "No providers match your search."}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => navigate("/service-node/register")}>
                      Register as a provider
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p) => (
                    <ProviderCard key={p.id} provider={p} onBook={setSelectedProvider} />
                  ))}
                </div>
              )}

              {/* Cost+20% explainer */}
              <Card className="bg-teal-50/50 border-teal-200">
                <CardContent className="py-4 flex gap-3">
                  <Tag className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-teal-900">Cost+20% Pricing</p>
                    <p className="text-teal-700 mt-0.5">
                      The provider sets their direct cost. You pay that + 20% platform margin.
                      The provider keeps 83.3% of your total payment. Both parties see the full
                      breakdown before any work begins. No app extracting 50% while calling it a "service fee."
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Marks for task completion */}
              <Card className="bg-amber-50/50 border-amber-200">
                <CardContent className="py-4 flex gap-3">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Earn Marks on Completion</p>
                    <p className="text-amber-700 mt-0.5">
                      You earn {MARKS_PER_TASK} Marks when a booked task is marked complete and reviewed.
                      Marks are participation credits that unlock platform features.
                      They are not securities and not redeemable for cash.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── My Bookings ── */}
            <TabsContent value="my-bookings" className="mt-4">
              <MyBookingsPanel />
            </TabsContent>

            {/* ── Offer Skills ── */}
            <TabsContent value="earn" className="mt-4">
              <div className="space-y-6">
                <BecomeProviderPanel />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-teal-600" />
                      Provider Economics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Here is what a provider earning $30/hr actually makes through Household Concierge
                      vs. a gig app that takes 40-50%.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded border border-red-200 bg-red-50/50 p-3 space-y-1">
                        <p className="font-semibold text-red-800">Typical gig app</p>
                        <p className="text-muted-foreground">$30/hr rate</p>
                        <p className="text-muted-foreground">40-50% platform cut</p>
                        <p className="font-bold text-red-700">$15-18/hr earned</p>
                      </div>
                      <div className="rounded border border-teal-200 bg-teal-50/50 p-3 space-y-1">
                        <p className="font-semibold text-teal-800">Household Concierge</p>
                        <p className="text-muted-foreground">$30/hr rate, member pays $36</p>
                        <p className="text-muted-foreground">16.7% platform margin</p>
                        <p className="font-bold text-teal-700">${(36 * 0.833).toFixed(2)}/hr earned</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The difference is structural: Cost+20% with 83.3% to providers vs. variable extraction
                      with no visibility into what the platform takes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Walkthrough ── */}
            {walkthrough && (
              <TabsContent value="walkthrough" className="mt-4">
                <InitiativeWalkthrough
                  steps={walkthrough.steps}
                  initiativeName="Household Concierge"
                />
                {walkthrough.originAnecdote && (
                  <Card className="mt-4 bg-muted/30">
                    <CardContent className="py-4 text-sm text-muted-foreground italic leading-relaxed">
                      "{walkthrough.originAnecdote}"
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* ── Cue Card ── */}
            {cueCard && (
              <TabsContent value="cue-card" className="mt-4">
                <div className="max-w-md">
                  <InitiativeCueCard card={cueCard} />
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Onboarding hook */}
          {!user && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Join the cooperative ($5/year) to book services and earn Marks on completion.
                </p>
                <Button size="sm" onClick={() => navigate("/join")}>
                  Join Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking dialog */}
        <BookingDialog
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onBooked={() => {
            toast({
              title: "Request sent",
              description: "The provider will confirm your booking shortly.",
            });
          }}
        />
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
