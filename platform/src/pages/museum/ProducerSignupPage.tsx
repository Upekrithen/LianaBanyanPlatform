/**
 * ProducerSignupPage — Local print shops / makers sign up as producers.
 * Route: /become-a-producer
 * K397 / B093.
 */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Factory, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type BusinessType =
  | "print_shop"
  | "screen_printer"
  | "embroidery"
  | "3d_printing"
  | "cnc"
  | "general_manufacturing"
  | "other";

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  print_shop: "Print Shop",
  screen_printer: "Screen Printer",
  embroidery: "Embroidery",
  "3d_printing": "3D Printing",
  cnc: "CNC",
  general_manufacturing: "General Manufacturing",
  other: "Other",
};

const CAPABILITY_OPTIONS = [
  { value: "business_cards", label: "Business Cards" },
  { value: "postcards", label: "Postcards" },
  { value: "stickers", label: "Stickers" },
  { value: "tshirts", label: "T-Shirts" },
  { value: "mugs", label: "Mugs" },
  { value: "medallions", label: "Medallions / Coins" },
  { value: "posters", label: "Posters / Large Format" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

interface ProducerProfile {
  id: string;
  status: string;
  business_name: string;
  business_type: string;
  verified: boolean;
}

export default function ProducerSignupPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [existing, setExisting] = useState<ProducerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("print_shop");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [customCapability, setCustomCapability] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("US");
  const [turnaroundDays, setTurnaroundDays] = useState(5);
  const [minQuantity, setMinQuantity] = useState(50);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from("producer_profiles")
        .select("id, status, business_name, business_type, verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setExisting(data as ProducerProfile);
      setLoading(false);
    })();
  }, [user?.id]);

  const toggleCapability = useCallback((cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user?.id) return;
    if (!businessName.trim()) {
      toast({ title: "Business name required", variant: "destructive" });
      return;
    }
    const allCaps = customCapability.trim()
      ? [...capabilities, customCapability.trim().toLowerCase().replace(/\s+/g, "_")]
      : capabilities;
    if (allCaps.length === 0) {
      toast({ title: "Select at least one capability", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("producer_profiles")
        .insert({
          user_id: user.id,
          business_name: businessName.trim(),
          business_type: businessType,
          capabilities: allCaps,
          location_city: city.trim() || null,
          location_state: state || null,
          location_country: country.trim() || "US",
          turnaround_days: turnaroundDays,
          min_quantity: minQuantity,
          portfolio_url: portfolioUrl.trim() || null,
          notes: notes.trim() || null,
          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "You already have a producer profile", variant: "destructive" });
        } else {
          toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        }
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, businessName, businessType, capabilities, customCapability, city, state, country, turnaroundDays, minQuantity, portfolioUrl, notes, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-6">
        <div>
          <Factory className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Sign in to become a Producer</h1>
          <p className="text-sm text-slate-400">You need an account to apply.</p>
        </div>
      </div>
    );
  }

  // Already-a-producer state
  if (existing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
        <div className="max-w-lg mx-auto text-center mt-20">
          {existing.status === "active" ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-emerald-400 mb-2" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
                Active Producer
              </h1>
              <p className="text-slate-300 mb-1">{existing.business_name}</p>
              <p className="text-sm text-slate-500 mb-6">
                {BUSINESS_TYPE_LABELS[existing.business_type as BusinessType] ?? existing.business_type}
                {existing.verified && " · Verified"}
              </p>
              <Link to="/producer-board">
                <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                  Go to Producer Board
                </Button>
              </Link>
            </>
          ) : existing.status === "suspended" ? (
            <>
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-400 mb-2">Account Suspended</h1>
              <p className="text-sm text-slate-400">Your producer account is suspended. Contact support for assistance.</p>
            </>
          ) : (
            <>
              <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-amber-400 mb-2" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
                Application Under Review
              </h1>
              <p className="text-slate-300 mb-1">{existing.business_name}</p>
              <p className="text-sm text-slate-500 mb-6">A Captain will review your profile soon.</p>
              <Link to="/producer-board">
                <Button variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                  Preview the Producer Board
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Success state after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-2xl font-bold text-emerald-400 mb-2" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
            Application Submitted!
          </h1>
          <p className="text-slate-300 mb-6">
            A Captain will review your profile. You will be notified when your account is activated.
          </p>
          <Link to="/producer-board">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white">
              Explore the Producer Board
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Signup form
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="mb-8 text-center">
          <Factory className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1" style={{ fontFamily: "'Crimson Pro', Georgia, serif" }}>
            Become a Producer
          </h1>
          <p className="text-lg text-slate-300 mb-2">Bring Your Skills to the Platform</p>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Local print shops, manufacturers, and makers can claim production orders from the community.
            You set your pricing. We guarantee Cost+20% margin. Members order, you produce, everyone wins.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Business Name */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Business Name *</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your shop or brand name"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Business Type *</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200"
            >
              {Object.entries(BUSINESS_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Capabilities */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium">Capabilities * (select all that apply)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAPABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleCapability(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    capabilities.includes(opt.value)
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customCapability}
              onChange={(e) => setCustomCapability(e.target.value)}
              placeholder="Other capability (optional)"
              className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Location */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Turnaround + Min Quantity */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Turnaround (days)</label>
              <input
                type="number"
                value={turnaroundDays}
                onChange={(e) => setTurnaroundDays(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Minimum Quantity</label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(Math.max(1, Number(e.target.value)))}
                min={1}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Portfolio URL */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Portfolio URL (optional)</label>
            <input
              type="text"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us about your shop, equipment, specialties..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-amber-500/60 transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white h-12 text-base font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>

        <div className="mt-12 text-center text-slate-600 text-xs">
          Liana Banyan Decentralized Factory — Cost+20% · Creator keeps 83.3%
        </div>
      </div>
    </div>
  );
}
