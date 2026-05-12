import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Flag, Shield, Users, Search, MapPin, Phone, Globe, Building2,
  FileText, Copy, Mail, Bookmark, BookmarkCheck, ExternalLink,
  Loader2, ChevronDown, ChevronUp, RefreshCw, Zap,
} from "lucide-react";
import BillDetailDrawer from "@/components/political/BillDetailDrawer";
import BillSearch from "@/components/political/BillSearch";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface Rep {
  id: string;
  bioguide_id: string;
  name: string;
  title: string;
  party: string | null;
  state: string;
  district: string | null;
  chamber: string;
  phone: string | null;
  website: string | null;
  office_address: string | null;
  photo_url: string | null;
  social_twitter: string | null;
  social_facebook: string | null;
}

interface SavedRep {
  id: string;
  rep_id: string;
  address_used: string | null;
  saved_at: string;
  rep_cache: Rep;
}

interface TrackedBill {
  id: string;
  bill_number: string;
  title: string;
  summary: string | null;
  sponsor_name: string | null;
  sponsor_party: string | null;
  sponsor_bioguide: string | null;
  status: string | null;
  introduced_date: string | null;
  last_action_date: string | null;
  last_action: string | null;
  tags: string[];
  lb_relevance: string | null;
  congress: number | null;
  bill_type: string | null;
  congress_url: string | null;
  policy_area: string | null;
  cosponsors_count: number;
  actions: any[];
  last_synced_at: string | null;
  is_live: boolean;
}

interface LetterTemplate {
  id: string;
  title: string;
  topic: string;
  template_body: string;
}

const STATUS_COLORS: Record<string, string> = {
  introduced: "bg-slate-500 text-white",
  committee: "bg-amber-600 text-white",
  passed_house: "bg-blue-600 text-white",
  passed_senate: "bg-indigo-600 text-white",
  signed: "bg-green-700 text-white",
  vetoed: "bg-red-700 text-white",
};

const STATUS_LABELS: Record<string, string> = {
  introduced: "Introduced",
  committee: "In Committee",
  passed_house: "Passed House",
  passed_senate: "Passed Senate",
  signed: "Signed Into Law",
  vetoed: "Vetoed",
};

const TAG_COLORS: Record<string, string> = {
  cooperative: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  food_security: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  housing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  small_business: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  transportation: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

// ═══════════════════════════════════════════════════════════════
// Rep Card Component
// ═══════════════════════════════════════════════════════════════

function RepCard({ rep, onSave, isSaved, saving }: {
  rep: Rep;
  onSave?: (repId: string) => void;
  isSaved: boolean;
  saving?: boolean;
}) {
  return (
    <Card className="bg-card border-border hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {rep.photo_url ? (
              <img src={rep.photo_url} alt={rep.name} className="w-full h-full object-cover" />
            ) : (
              <Users className="h-7 w-7 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-lg">{rep.name}</h4>
            <p className="text-sm text-muted-foreground">{rep.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {rep.party && (
                <Badge variant="outline" className="text-xs">
                  {rep.party}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground/70">
                {rep.state}{rep.district ? ` — District ${rep.district}` : ""}
              </span>
            </div>
          </div>
          {onSave && (
            <Button
              size="sm"
              variant={isSaved ? "secondary" : "outline"}
              disabled={isSaved || saving}
              onClick={() => onSave(rep.id)}
              className="shrink-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span className="ml-1 text-xs">{isSaved ? "Saved" : "Save"}</span>
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {rep.phone && (
            <a href={`tel:${rep.phone}`} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors text-foreground">
              <Phone className="h-3 w-3" /> {rep.phone}
            </a>
          )}
          {rep.website && (
            <a href={rep.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-muted/80 transition-colors text-blue-600 dark:text-blue-400">
              <Globe className="h-3 w-3" /> Website
            </a>
          )}
          {rep.office_address && (
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-muted rounded-full text-muted-foreground">
              <Building2 className="h-3 w-3" /> {rep.office_address}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════

export default function PoliticalExpedition() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Address lookup state
  const [address, setAddress] = useState("");
  const [lookupResults, setLookupResults] = useState<Rep[]>([]);
  const [lookupSource, setLookupSource] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Letter writer state
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [letterBody, setLetterBody] = useState("");
  const [memberName, setMemberName] = useState("");
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [drawerBill, setDrawerBill] = useState<TrackedBill | null>(null);
  const [syncing, setSyncing] = useState(false);

  // ─── Admin check ───
  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.rpc("is_admin");
      return !!data;
    },
  });

  // ─── Saved reps query ───
  const { data: savedReps = [] } = useQuery({
    queryKey: ["member-reps", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("member_reps")
        .select("*, rep_cache(*)")
        .eq("user_id", user!.id)
        .order("saved_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SavedRep[];
    },
  });

  const savedRepIds = new Set(savedReps.map((s: SavedRep) => s.rep_id));

  // ─── Tracked bills query ───
  const { data: bills = [] } = useQuery({
    queryKey: ["tracked-bills"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tracked_bills")
        .select("*")
        .order("last_action_date", { ascending: false });
      if (error) throw error;
      return (data || []) as TrackedBill[];
    },
  });

  // ─── User's tracked bills ───
  const { data: userTrackedBills = [] } = useQuery({
    queryKey: ["member-bill-tracking", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("member_bill_tracking")
        .select("bill_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((r: { bill_id: string }) => r.bill_id);
    },
  });

  const trackedBillIds = new Set(userTrackedBills);

  // ─── Letter templates query ───
  const { data: templates = [] } = useQuery({
    queryKey: ["rep-letter-templates"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rep_letter_templates")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as LetterTemplate[];
    },
  });

  // ─── Lookup reps by address ───
  const handleLookup = async () => {
    if (!address.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("rep-lookup", {
        body: { address: address.trim() },
      });

      if (error) throw error;

      if (data?.reps?.length > 0) {
        setLookupResults(data.reps);
        setLookupSource(data.source);
      } else {
        setLookupError(data?.message || "No representatives found. Try a more complete address.");
      }
    } catch (err: any) {
      setLookupError(err?.message || "Lookup failed. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  // ─── Save rep mutation ───
  const saveRepMutation = useMutation({
    mutationFn: async (repId: string) => {
      const { error } = await (supabase as any)
        .from("member_reps")
        .insert({ user_id: user!.id, rep_id: repId, address_used: address || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-reps"] });
      toast.success("Representative saved");
    },
    onError: () => toast.error("Failed to save representative"),
  });

  // ─── Unsave rep mutation ───
  const unsaveRepMutation = useMutation({
    mutationFn: async (repId: string) => {
      const { error } = await (supabase as any)
        .from("member_reps")
        .delete()
        .eq("user_id", user!.id)
        .eq("rep_id", repId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-reps"] });
      toast.success("Representative removed");
    },
    onError: () => toast.error("Failed to remove representative"),
  });

  // ─── Track bill mutation ───
  const trackBillMutation = useMutation({
    mutationFn: async (billId: string) => {
      if (trackedBillIds.has(billId)) {
        const { error } = await (supabase as any)
          .from("member_bill_tracking")
          .delete()
          .eq("user_id", user!.id)
          .eq("bill_id", billId);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("member_bill_tracking")
          .insert({ user_id: user!.id, bill_id: billId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-bill-tracking"] });
    },
  });

  // ─── Template fill logic ───
  const selectedRep = savedReps.find((s: SavedRep) => s.rep_id === selectedRepId);
  const selectedTemplate = templates.find((t: LetterTemplate) => t.topic === selectedTopic);

  useEffect(() => {
    if (selectedTemplate && selectedRep) {
      let body = selectedTemplate.template_body;
      body = body.replace(/\{\{rep_name\}\}/g, selectedRep.rep_cache.name);
      body = body.replace(/\{\{name\}\}/g, memberName || "[Your Name]");
      body = body.replace(/\{\{district\}\}/g,
        selectedRep.rep_cache.district
          ? `${selectedRep.rep_cache.state} District ${selectedRep.rep_cache.district}`
          : selectedRep.rep_cache.state
      );
      setLetterBody(body);
    } else {
      setLetterBody("");
    }
  }, [selectedRepId, selectedTopic, memberName, selectedTemplate, selectedRep]);

  // ─── Your Reps' Bills — join through bill_cosponsors ───
  const repBioguides = savedReps.map((sr: SavedRep) => sr.rep_cache.bioguide_id).filter(Boolean);
  const { data: repsBills = [] } = useQuery({
    queryKey: ["reps-bills", repBioguides.join(",")],
    enabled: repBioguides.length > 0,
    queryFn: async () => {
      const { data: cosponsorLinks } = await (supabase as any)
        .from("bill_cosponsors")
        .select("bill_id, bioguide_id")
        .in("bioguide_id", repBioguides);
      if (!cosponsorLinks?.length) return [];
      const billIds = [...new Set(cosponsorLinks.map((c: any) => c.bill_id))];
      const { data: billData } = await (supabase as any)
        .from("tracked_bills")
        .select("*")
        .in("id", billIds)
        .order("last_action_date", { ascending: false });
      return (billData || []).map((b: any) => {
        const link = cosponsorLinks.find((c: any) => c.bill_id === b.id);
        const rep = savedReps.find((sr: SavedRep) => sr.rep_cache.bioguide_id === link?.bioguide_id);
        return { ...b, rep_name: rep?.rep_cache.name, rep_role: link?.is_original ? "Sponsored by" : "Cosponsored by" };
      });
    },
  });

  // Also find bills where sponsor_bioguide matches
  const { data: sponsoredBills = [] } = useQuery({
    queryKey: ["reps-sponsored-bills", repBioguides.join(",")],
    enabled: repBioguides.length > 0,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("tracked_bills")
        .select("*")
        .in("sponsor_bioguide", repBioguides)
        .order("last_action_date", { ascending: false });
      return (data || []).map((b: any) => {
        const rep = savedReps.find((sr: SavedRep) => sr.rep_cache.bioguide_id === b.sponsor_bioguide);
        return { ...b, rep_name: rep?.rep_cache.name, rep_role: "Sponsored by" };
      });
    },
  });

  // Merge and deduplicate
  const allRepBills = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const b of [...sponsoredBills, ...repsBills]) {
      if (!map.has(b.id)) map.set(b.id, b);
    }
    return Array.from(map.values());
  }, [repsBills, sponsoredBills]);

  // ─── Admin sync handler ───
  const handleSync = async (mode: string) => {
    setSyncing(true);
    try {
      const resp = await fetch(
        `${(supabase as any).supabaseUrl}/functions/v1/congress-api-sync?mode=${mode}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
            "Content-Type": "application/json",
            "x-lb-system-key": "admin",
          },
        }
      );
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      toast.success(`Sync complete: ${JSON.stringify(json)}`);
      queryClient.invalidateQueries({ queryKey: ["tracked-bills"] });
      queryClient.invalidateQueries({ queryKey: ["reps-bills"] });
      queryClient.invalidateQueries({ queryKey: ["reps-sponsored-bills"] });
    } catch (e: any) {
      toast.error(e.message || "Sync failed");
    }
    setSyncing(false);
  };

  const handleCopyLetter = async () => {
    if (!letterBody) return;
    try {
      await navigator.clipboard.writeText(letterBody);
      toast.success("Letter copied to clipboard");
      if (selectedTemplate) {
        await (supabase as any)
          .from("rep_letter_templates")
          .update({ usage_count: (selectedTemplate as any).usage_count + 1 })
          .eq("id", selectedTemplate.id);
      }
    } catch {
      toast.error("Failed to copy — try selecting and copying manually");
    }
  };

  const handleEmailLetter = () => {
    if (!letterBody || !selectedRep) return;
    const subject = encodeURIComponent(`From a constituent — ${selectedTemplate?.title || "Civic Engagement"}`);
    const body = encodeURIComponent(letterBody);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <PortalPageLayout maxWidth="lg" xrayId="political-expedition">
      <div className="space-y-8">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-full text-white shrink-0">
            <Flag className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Political Expedition
            </h1>
            <p className="text-muted-foreground mt-1">
              Civic engagement infrastructure — not partisan messaging
            </p>
            <p className="text-xs text-purple-400 font-semibold mt-1 tracking-wider uppercase">
              It&rsquo;s What you Use it FOR
            </p>
          </div>
        </div>

        {/* ═══ NON-PARTISAN BANNER ═══ */}
        <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4" data-xray-id="pe-switzerland-banner">
          <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" /> The Switzerland Protocol
          </h3>
          <p className="text-sm text-slate-300">
            Not left or right. <strong>Forward.</strong> This tool helps you engage with YOUR representatives
            regardless of party. Democracy works when citizens participate. We track what elected officials{" "}
            <em>do</em> — not what they say.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: Find Your Representatives
            ═══════════════════════════════════════════════════════ */}
        <section data-xray-id="pe-find-reps">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Search className="h-6 w-6 text-purple-500" /> Find Your Representatives
          </h2>
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
              <Input
                placeholder="Enter your address (street, city, state, zip)"
                className="pl-10"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              />
            </div>
            <Button
              onClick={handleLookup}
              disabled={lookupLoading || !address.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Look Up
            </Button>
          </div>

          {lookupError && (
            <p className="mt-3 text-sm text-red-500">{lookupError}</p>
          )}

          {lookupResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Found {lookupResults.length} representative{lookupResults.length !== 1 ? "s" : ""}
                </p>
                {lookupSource && (
                  <Badge variant="outline" className="text-xs">
                    {lookupSource === "google_civic" ? "Live Data" : "Cached"}
                  </Badge>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {lookupResults.map((rep) => (
                  <RepCard
                    key={rep.id}
                    rep={rep}
                    isSaved={savedRepIds.has(rep.id)}
                    saving={saveRepMutation.isPending}
                    onSave={user ? (id) => saveRepMutation.mutate(id) : undefined}
                  />
                ))}
              </div>
              {!user && (
                <p className="text-xs text-muted-foreground italic">Sign in to save representatives to your profile.</p>
              )}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: Your Representatives (logged-in)
            ═══════════════════════════════════════════════════════ */}
        {user && savedReps.length > 0 && (
          <section data-xray-id="pe-your-reps">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-500" /> Your Representatives
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {savedReps.map((sr: SavedRep) => (
                <Card key={sr.id} className="bg-card border-border">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {sr.rep_cache.photo_url ? (
                          <img src={sr.rep_cache.photo_url} alt={sr.rep_cache.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{sr.rep_cache.name}</h4>
                        <p className="text-sm text-muted-foreground">{sr.rep_cache.title} — {sr.rep_cache.state}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {sr.rep_cache.phone && (
                        <a href={`tel:${sr.rep_cache.phone}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Phone className="h-3 w-3 mr-1" /> Call
                          </Button>
                        </a>
                      )}
                      {sr.rep_cache.website && (
                        <a href={sr.rep_cache.website} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" /> Website
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setSelectedRepId(sr.rep_id);
                          document.getElementById("write-your-rep")?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <Mail className="h-3 w-3 mr-1" /> Write a Letter
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:text-red-600"
                        onClick={() => unsaveRepMutation.mutate(sr.rep_id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 2B: Your Reps' Bills (K90)
            ═══════════════════════════════════════════════════════ */}
        {user && allRepBills.length > 0 && (
          <section data-xray-id="pe-reps-bills">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-500" /> Your Reps' Bills
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Legislation your saved representatives are sponsoring or cosponsoring.
            </p>
            <div className="space-y-3">
              {allRepBills.map((bill: any) => {
                const isTracked = trackedBillIds.has(bill.id);
                return (
                  <Card key={bill.id} className="bg-card border-border hover:border-emerald-500/30 transition-colors cursor-pointer" onClick={() => setDrawerBill(bill)}>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className="bg-blue-600 text-white text-xs">{bill.bill_number}</Badge>
                            {bill.status && (
                              <Badge className={`text-xs ${STATUS_COLORS[bill.status] || "bg-slate-500 text-white"}`}>
                                {STATUS_LABELS[bill.status] || bill.status}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground">{bill.title}</h3>
                          <p className="text-xs text-emerald-500 mt-0.5">
                            {bill.rep_role} <span className="font-medium">{bill.rep_name}</span>
                          </p>
                          {bill.last_action && (
                            <p className="text-xs text-muted-foreground/70 mt-1 italic">
                              Last action ({bill.last_action_date}): {bill.last_action}
                            </p>
                          )}
                        </div>
                        {user && (
                          <Button
                            size="sm"
                            variant={isTracked ? "secondary" : "outline"}
                            className="text-xs shrink-0"
                            onClick={(e) => { e.stopPropagation(); trackBillMutation.mutate(bill.id); }}
                          >
                            {isTracked ? <BookmarkCheck className="h-3.5 w-3.5 mr-1" /> : <Bookmark className="h-3.5 w-3.5 mr-1" />}
                            {isTracked ? "Tracking" : "Track"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
        {user && savedReps.length > 0 && allRepBills.length === 0 && (
          <section data-xray-id="pe-reps-bills-empty">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-500" /> Your Reps' Bills
            </h2>
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground text-sm">No bills linked to your reps yet. Sync will populate this automatically, or search below to track bills.</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: Bills That Matter
            ═══════════════════════════════════════════════════════ */}
        <section data-xray-id="pe-bills">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-500" /> Bills That Matter
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Legislation relevant to cooperative commerce, food security, housing, and community empowerment.
          </p>
          <BillSearch />

          {bills.length === 0 ? (
            <p className="text-muted-foreground/70 italic text-sm">No tracked bills yet. Check back soon.</p>
          ) : (
            <div className="space-y-3">
              {bills.map((bill: TrackedBill) => {
                const isExpanded = expandedBill === bill.id;
                const isTracked = trackedBillIds.has(bill.id);
                return (
                  <Card key={bill.id} className="bg-card border-border hover:border-purple-300/30 transition-colors cursor-pointer" onClick={() => setDrawerBill(bill)}>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge className="bg-blue-600 text-white text-xs">{bill.bill_number}</Badge>
                            {bill.status && (
                              <Badge className={`text-xs ${STATUS_COLORS[bill.status] || "bg-slate-500 text-white"}`}>
                                {STATUS_LABELS[bill.status] || bill.status}
                              </Badge>
                            )}
                            {bill.is_live && (
                              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Live</Badge>
                            )}
                            {bill.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className={`text-[10px] ${TAG_COLORS[tag] || ""}`}>
                                {tag.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                          <h3 className="font-semibold text-foreground">{bill.title}</h3>
                          {bill.sponsor_name && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              Sponsor: {bill.sponsor_name} ({bill.sponsor_party})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {user && (
                            <Button
                              size="sm"
                              variant={isTracked ? "secondary" : "outline"}
                              className="text-xs"
                              onClick={(e) => { e.stopPropagation(); trackBillMutation.mutate(bill.id); }}
                            >
                              {isTracked ? <BookmarkCheck className="h-3.5 w-3.5 mr-1" /> : <Bookmark className="h-3.5 w-3.5 mr-1" />}
                              {isTracked ? "Tracking" : "Track"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setExpandedBill(isExpanded ? null : bill.id); }}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                          {bill.summary && (
                            <p className="text-sm text-muted-foreground">{bill.summary}</p>
                          )}
                          {bill.last_action && (
                            <p className="text-xs text-muted-foreground/70 italic">
                              Last action ({bill.last_action_date}): {bill.last_action}
                            </p>
                          )}
                          {bill.lb_relevance && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                Why This Matters to LB Members
                              </p>
                              <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">{bill.lb_relevance}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 4: Write Your Rep
            ═══════════════════════════════════════════════════════ */}
        <section id="write-your-rep" data-xray-id="pe-write-rep">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-6 w-6 text-green-500" /> Write Your Rep
          </h2>

          {!user ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Sign in and save your representatives to write them a letter.</p>
              </CardContent>
            </Card>
          ) : savedReps.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Look up and save your representatives first, then come back here to write them.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Your Name</label>
                  <Input
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Select Representative</label>
                  <div className="space-y-1.5">
                    {savedReps.map((sr: SavedRep) => (
                      <button
                        key={sr.rep_id}
                        onClick={() => setSelectedRepId(sr.rep_id)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          selectedRepId === sr.rep_id
                            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        <span className="font-medium text-foreground">{sr.rep_cache.name}</span>
                        <span className="text-muted-foreground ml-2">— {sr.rep_cache.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Select Topic</label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((tmpl: LetterTemplate) => (
                      <Button
                        key={tmpl.topic}
                        size="sm"
                        variant={selectedTopic === tmpl.topic ? "default" : "outline"}
                        className={selectedTopic === tmpl.topic ? "bg-purple-600 hover:bg-purple-700" : ""}
                        onClick={() => setSelectedTopic(tmpl.topic)}
                      >
                        {tmpl.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Preview + Actions */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground block">Letter Preview</label>
                <Textarea
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="min-h-[280px] text-sm leading-relaxed"
                  placeholder="Select a representative and topic to generate a letter..."
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLetter}
                    disabled={!letterBody}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                  </Button>
                  <Button
                    onClick={handleEmailLetter}
                    disabled={!letterBody}
                    variant="outline"
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" /> Open in Email
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground/60 italic">
                  You may edit the letter before sending. Templates are starting points, not scripts.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            ADMIN: Sync Controls (K90)
            ═══════════════════════════════════════════════════════ */}
        {isAdmin && (
          <section data-xray-id="pe-admin-sync" className="border border-amber-500/30 rounded-lg p-4 bg-amber-900/10">
            <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Admin: Congress.gov Sync
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button size="sm" variant="outline" disabled={syncing} onClick={() => handleSync("bills")}>
                {syncing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                Sync Bills
              </Button>
              <Button size="sm" variant="outline" disabled={syncing} onClick={() => handleSync("members")}>
                Sync Member Bills
              </Button>
              <Button size="sm" variant="outline" disabled={syncing} onClick={() => handleSync("actions")}>
                Sync Actions
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>{bills.filter((b: TrackedBill) => b.is_live).length} live bills</span>
              <span>{bills.filter((b: TrackedBill) => !b.is_live).length} manually added</span>
              {bills.some((b: TrackedBill) => b.last_synced_at) && (
                <span>Last synced: {new Date(bills.find((b: TrackedBill) => b.last_synced_at)!.last_synced_at!).toLocaleString()}</span>
              )}
            </div>
          </section>
        )}

        {/* ═══ FOOTER ═══ */}
        <div className="mt-12 text-center border-t border-border pt-8">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">Political Expedition</strong> — Initiative #15: Power to the People
          </p>
          <p className="text-xs mt-2 text-muted-foreground/70">
            "Not left or right. Forward." — Help Each Other Help Ourselves
          </p>
        </div>
      </div>

      {/* Bill Detail Drawer */}
      {drawerBill && (
        <BillDetailDrawer
          bill={drawerBill}
          isTracked={trackedBillIds.has(drawerBill.id)}
          onTrack={(id) => { trackBillMutation.mutate(id); }}
          onClose={() => setDrawerBill(null)}
          onWriteRep={() => {
            setDrawerBill(null);
            document.getElementById("write-your-rep")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}
    </PortalPageLayout>
  );
}
