/**
 * MATCHTRADE — MARKS-for-MARKS Service Exchange
 * ===============================================
 * "Babysitting for plumbing. Guitar lessons for lawn care."
 *
 * Offer your service priced in MARKS.
 * Back it with Credits in your cache (guarantee).
 * Find someone offering what you need.
 * MatchTrade → both deliver → both earn MARKS.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeftRight, Plus, Search, Star, Coins, Shield,
  Handshake, Check, Clock, AlertTriangle, Filter, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { calculateMatchTradeCacheRequired, MATCHTRADE_BOUNTY_COST } from "@/lib/currencyService";

const CATEGORIES = [
  "Design", "Development", "Writing", "Marketing", "Accounting",
  "Legal", "Photography", "Video", "Music", "Tutoring",
  "Repair", "Cleaning", "Cooking", "Childcare", "Pet Care",
  "Gardening", "Moving", "Translation", "Consulting", "Kickstarter",
  "3D Printing", "Manufacturing", "Social Media", "Other",
];

export default function MatchTrade() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Open offers
  const { data: offers, isLoading } = useQuery({
    queryKey: ["matchtrade-offers", searchQuery, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("matchtrade_offers")
        .select("*, profiles:offerer_id(full_name)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") query = query.eq("category", categoryFilter);
      if (searchQuery) query = query.or(`service_title.ilike.%${searchQuery}%,service_description.ilike.%${searchQuery}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // My offers
  const { data: myOffers } = useQuery({
    queryKey: ["my-matchtrade-offers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("matchtrade_offers")
        .select("*")
        .eq("offerer_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // My active matches
  const { data: myMatches } = useQuery({
    queryKey: ["my-matchtrade-matches", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get offers I'm involved in that are matched
      const { data: matchedOffers } = await supabase
        .from("matchtrade_offers")
        .select("matched_with_offer_id")
        .eq("offerer_id", user.id)
        .not("matched_with_offer_id", "is", null);

      if (!matchedOffers || matchedOffers.length === 0) return [];

      const matchIds = matchedOffers.map(o => o.matched_with_offer_id).filter(Boolean);
      const { data } = await supabase
        .from("matchtrade_matches")
        .select("*, offer_a:offer_a_id(*, profiles:offerer_id(full_name)), offer_b:offer_b_id(*, profiles:offerer_id(full_name))")
        .or(`offer_a_id.in.(${matchIds.join(",")}),offer_b_id.in.(${matchIds.join(",")})`)
        .in("status", ["active", "a_delivered", "b_delivered"]);

      return data || [];
    },
    enabled: !!user,
  });

  // Create offer
  const createOffer = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error("Must be logged in");
      const marksPrice = Number(formData.get("marks_price"));
      const creditsNeeded = calculateMatchTradeCacheRequired(marksPrice);

      const { error } = await supabase.from("matchtrade_offers").insert({
        offerer_id: user.id,
        service_title: formData.get("title") as string,
        service_description: formData.get("description") as string,
        category: formData.get("category") as string,
        marks_price: marksPrice,
        credits_cached: creditsNeeded,
        cache_locked: true,
        seeking_category: formData.get("seeking_category") as string || null,
        seeking_description: formData.get("seeking") as string || null,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("MatchTrade offer created!");
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["matchtrade-offers"] });
      queryClient.invalidateQueries({ queryKey: ["my-matchtrade-offers"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const statusColors: Record<string, string> = {
    open: "bg-green-500/10 text-green-600",
    matched: "bg-blue-500/10 text-blue-600",
    in_progress: "bg-amber-500/10 text-amber-600",
    delivered: "bg-purple-500/10 text-purple-600",
    completed: "bg-primary/10 text-primary",
    disputed: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">MatchTrade</h1>
            <p className="text-muted-foreground">
              MARKS-for-MARKS service exchange. Babysitting for plumbing. Guitar lessons for lawn care.
            </p>
          </div>
        </div>
        {user && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Offer a Service</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create MatchTrade Offer</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createOffer.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What I'm Offering *</label>
                  <Input name="title" placeholder="e.g., Kickstarter campaign management" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea name="description" placeholder="Describe what you'll deliver..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <select name="category" className="w-full h-10 rounded-md border bg-background px-3" required>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">MARKS Price *</label>
                    <Input name="marks_price" type="number" min="1" placeholder="500" required />
                    <p className="text-xs text-muted-foreground mt-1">
                      Requires equal Credits in cache as guarantee
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm">
                  <div className="flex items-center gap-2 font-medium text-amber-600 mb-1">
                    <Shield className="w-4 h-4" />
                    Credit Cache Guarantee
                  </div>
                  <p className="text-muted-foreground">
                    Your Credits are locked as a guarantee. If you deliver, you get them back plus the other person's MARKS.
                    If you don't deliver, your Credits compensate them.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">What I'm Looking For</label>
                  <select name="seeking_category" className="w-full h-10 rounded-md border bg-background px-3 mb-2">
                    <option value="">Any category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Textarea name="seeking" placeholder="Describe what service you need in return..." rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={createOffer.isPending}>
                  {createOffer.isPending ? "Creating..." : "Post MatchTrade Offer"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* How it works — per Cephas spec */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6 grid md:grid-cols-4 gap-4 text-center text-sm">
          <div>
            <Coins className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="font-medium">1. Buy Joules</p>
            <p className="text-muted-foreground">Joules go to your Stake Account as collateral</p>
          </div>
          <div>
            <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="font-medium">2. Stake Account = Limit</p>
            <p className="text-muted-foreground">Your Joules cap how many MARKS you can offer</p>
          </div>
          <div>
            <Handshake className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="font-medium">3. Match by Location</p>
            <p className="text-muted-foreground">LB finds providers in your area</p>
          </div>
          <div>
            <Check className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="font-medium">4. Confirm & Transfer</p>
            <p className="text-muted-foreground">Work done → you confirm → MARKS transfer</p>
          </div>
        </CardContent>
        <CardContent className="pt-0 text-xs text-muted-foreground text-center">
          Posting a need costs {MATCHTRADE_BOUNTY_COST} MARK. Posting an offer is FREE. Every MARK is backed by Joules.
        </CardContent>
      </Card>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search offers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Offers ({offers?.length || 0})</TabsTrigger>
          <TabsTrigger value="my-offers">My Offers ({myOffers?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active Trades ({myMatches?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {isLoading ? (
            <p>Loading offers...</p>
          ) : offers && offers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{offer.service_title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by {(offer as any).profiles?.full_name || "Member"}
                        </p>
                      </div>
                      <Badge className={statusColors[offer.status]}>{offer.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {offer.service_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{offer.service_description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{offer.category}</Badge>
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-4 h-4" />
                        {offer.marks_price} MARKS
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Shield className="w-3 h-3" />
                        {offer.credits_cached} Credits cached
                      </div>
                    </div>
                    {offer.seeking_description && (
                      <div className="p-2 rounded bg-muted/50 text-xs">
                        <span className="font-medium">Looking for: </span>
                        {offer.seeking_category && <Badge variant="outline" className="text-xs mr-1">{offer.seeking_category}</Badge>}
                        {offer.seeking_description}
                      </div>
                    )}
                    {user && user.id !== offer.offerer_id && (
                      <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("MatchTrade proposal — select one of your offers to match with this one.")}>
                        <Handshake className="w-4 h-4" />
                        Propose Match
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No open offers. Be the first to offer a service!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-offers" className="space-y-4">
          {myOffers && myOffers.length > 0 ? (
            myOffers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{offer.service_title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{offer.category}</span>
                      <span className="font-medium text-amber-600">{offer.marks_price} MARKS</span>
                      <span>{offer.credits_cached} Credits cached</span>
                    </div>
                  </div>
                  <Badge className={statusColors[offer.status]}>{offer.status}</Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No offers posted yet. Create one to start trading services!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {myMatches && myMatches.length > 0 ? (
            myMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Handshake className="w-5 h-5 text-primary" />
                      <span className="font-medium">Active MatchTrade</span>
                    </div>
                    <Badge className={statusColors[match.status]}>{match.status}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded bg-muted/50">
                      <p className="font-medium">{(match as any).offer_a?.service_title}</p>
                      <p className="text-muted-foreground">{(match as any).offer_a?.profiles?.full_name}</p>
                      {match.a_delivered_at && <Badge className="mt-2 bg-green-500/10 text-green-600"><Check className="w-3 h-3 mr-1" /> Delivered</Badge>}
                    </div>
                    <div className="p-3 rounded bg-muted/50">
                      <p className="font-medium">{(match as any).offer_b?.service_title}</p>
                      <p className="text-muted-foreground">{(match as any).offer_b?.profiles?.full_name}</p>
                      {match.b_delivered_at && <Badge className="mt-2 bg-green-500/10 text-green-600"><Check className="w-3 h-3 mr-1" /> Delivered</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active trades. Browse offers to start one!
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
