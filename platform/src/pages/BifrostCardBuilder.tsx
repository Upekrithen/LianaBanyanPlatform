/**
 * BIFROST CARD BUILDER
 * =====================
 * Card-minting workshop where members design custom A.T.T.I. cue cards.
 * Each card gets a unique QR code linked to the creator's referral chain.
 *
 * Innovation #1555: A.T.T.I. Campaign
 * "All That That Implies"
 *
 * SEC-safe: Service marketing and member engagement tooling only.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Palette,
  QrCode,
  Printer,
  Eye,
  Save,
  ArrowLeft,
  CreditCard,
  FileText,
  Link2,
  Copy,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  createCardDesign,
  getUserCardDesigns,
  updateCardDesign,
  getCardScanUrl,
  getReferralStats,
  CARD_TEMPLATES,
  COLOR_SCHEMES,
  type CardDesign,
} from "@/lib/attiCampaign";

// ═══════════════════════════════════════════════════════════════════════════════
// INITIATIVE OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const INITIATIVE_OPTIONS = [
  { value: "lets-make-bread", label: "Let's Make Bread" },
  { value: "hexisle-manufacturing", label: "HexIsle Manufacturing" },
  { value: "household-concierge", label: "Household Concierge" },
  { value: "jukebox", label: "JukeBox" },
  { value: "didasko", label: "Didasko" },
  { value: "msa-medical", label: "MSA Medical" },
  { value: "salt-mines", label: "Salt Mines" },
  { value: "vsl-loans", label: "VSL" },
  { value: "power-to-the-people", label: "Power to the People" },
  { value: "general", label: "General Platform" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CARD PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function CardPreview({
  design,
  referrerCode,
}: {
  design: Partial<CardDesign>;
  referrerCode?: string;
}) {
  const scheme = COLOR_SCHEMES.find(c => c.id === design.colorScheme) || COLOR_SCHEMES[0];
  const isBusiness = design.format === "business";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Preview ({isBusiness ? "Business Card" : "Postcard"})
      </h3>

      {/* Front */}
      <div
        className={`relative rounded-xl overflow-hidden shadow-xl ${
          isBusiness ? "aspect-[3.5/2]" : "aspect-[6/4]"
        }`}
        style={{
          background: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`,
        }}
      >
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <p className="text-white/60 text-xs tracking-widest uppercase mb-1">
              Liana Banyan
            </p>
            <h4 className="text-white font-bold text-lg leading-tight">
              {design.headline || "Your Headline Here"}
            </h4>
            {design.tagline && (
              <p className="text-white/80 text-sm mt-1">{design.tagline}</p>
            )}
          </div>
          <div className="flex items-end justify-between">
            <Badge className="bg-white/20 text-white border-0 text-[10px]">
              A.T.T.I.
            </Badge>
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Back */}
      <div
        className={`relative rounded-xl overflow-hidden shadow-xl bg-white ${
          isBusiness ? "aspect-[3.5/2]" : "aspect-[6/4]"
        }`}
      >
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <p className="text-slate-700 text-sm leading-relaxed">
            {design.backText || "Scan the QR code to discover a platform where creators keep 83.3% of every sale. All That That Implies."}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>lianabanyan.com/atti</span>
            {referrerCode && <span>ref: {referrerCode}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function BifrostCardBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [savedCards, setSavedCards] = useState<CardDesign[]>([]);
  const [referralStats, setReferralStats] = useState({ directReferrals: 0, totalChainMembers: 0, totalMarksEarned: 0 });
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Design state
  const [design, setDesign] = useState<Partial<CardDesign>>({
    templateId: "classic",
    initiative: "general",
    format: "business",
    headline: "",
    tagline: "",
    colorScheme: "platform",
    backText: "",
  });
  const [saving, setSaving] = useState(false);
  const [savedResult, setSavedResult] = useState<{ id: string; referrerCode: string } | null>(null);

  // Load saved cards and referral stats
  useEffect(() => {
    if (user) {
      getUserCardDesigns(user.id).then(setSavedCards);
      getReferralStats(user.id).then(setReferralStats);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to create cards");
      return;
    }
    if (!design.headline?.trim()) {
      toast.error("Please enter a headline for your card");
      return;
    }

    setSaving(true);
    const result = await createCardDesign({
      ...design,
      creatorId: user.id,
      templateId: design.templateId || "classic",
      initiative: design.initiative || "general",
      format: design.format || "business",
      headline: design.headline || "",
      colorScheme: design.colorScheme || "platform",
    } as CardDesign);
    setSaving(false);

    if (result) {
      setSavedResult(result);
      toast.success("Card design saved! Your unique QR link is ready.");
      getUserCardDesigns(user.id).then(setSavedCards);
    } else {
      toast.error("Failed to save card design");
    }
  };

  const handleCopyUrl = () => {
    if (savedResult) {
      const url = getCardScanUrl(savedResult.referrerCode, design.initiative);
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      toast.success("QR link copied to clipboard!");
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full text-white">
          <Sparkles className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Bifrost Card Builder
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Design your own A.T.T.I. cue cards with unique QR codes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Design Panel ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Card Design
              </CardTitle>
              <CardDescription>
                Create a custom cue card to share with your community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Template */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Template</label>
                <Select
                  value={design.templateId}
                  onValueChange={(v) => setDesign(prev => ({ ...prev, templateId: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CARD_TEMPLATES.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <div>
                          <span className="font-medium">{t.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{t.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Initiative */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Initiative Focus</label>
                <Select
                  value={design.initiative}
                  onValueChange={(v) => setDesign(prev => ({ ...prev, initiative: v }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INITIATIVE_OPTIONS.map(i => (
                      <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <div className="flex gap-2">
                  <Button
                    variant={design.format === "business" ? "default" : "outline"}
                    onClick={() => setDesign(prev => ({ ...prev, format: "business" }))}
                    className="flex-1 gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Business Card
                  </Button>
                  <Button
                    variant={design.format === "postcard" ? "default" : "outline"}
                    onClick={() => setDesign(prev => ({ ...prev, format: "postcard" }))}
                    className="flex-1 gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Postcard
                  </Button>
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Color Scheme</label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_SCHEMES.map(scheme => (
                    <button
                      key={scheme.id}
                      onClick={() => setDesign(prev => ({ ...prev, colorScheme: scheme.id }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        design.colorScheme === scheme.id
                          ? "border-primary shadow-md"
                          : "border-transparent hover:border-muted"
                      }`}
                    >
                      <div
                        className="w-full h-6 rounded mb-1"
                        style={{ background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.secondary})` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{scheme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Headline */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Headline *</label>
                <Input
                  value={design.headline}
                  onChange={(e) => setDesign(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g., Keep 83.3% of every sale"
                  maxLength={60}
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tagline (optional)</label>
                <Input
                  value={design.tagline}
                  onChange={(e) => setDesign(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g., A platform for creators, by creators"
                  maxLength={80}
                />
              </div>

              {/* Back Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Back of Card Text</label>
                <Textarea
                  value={design.backText}
                  onChange={(e) => setDesign(prev => ({ ...prev, backText: e.target.value }))}
                  placeholder="Scan the QR code to discover a platform where creators keep 83.3% of every sale. All That That Implies."
                  maxLength={200}
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving || !design.headline?.trim()}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Card Design"}
              </Button>
            </CardContent>
          </Card>

          {/* QR Link (shown after save) */}
          {savedResult && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Card Saved!</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 bg-muted rounded text-sm font-mono truncate">
                    {getCardScanUrl(savedResult.referrerCode, design.initiative)}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                    {copiedUrl ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link or use it in a QR code. Every scan is tracked to your referral chain.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Preview Panel ── */}
        <div className="space-y-6">
          <CardPreview design={design} referrerCode={savedResult?.referrerCode} />

          {/* Referral Stats */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Link2 className="w-5 h-5 text-amber-500" />
                  Your Referral Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-amber-500">{referralStats.directReferrals}</div>
                    <div className="text-xs text-muted-foreground">Direct</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-500">{referralStats.totalChainMembers}</div>
                    <div className="text-xs text-muted-foreground">Total Chain</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-500">{referralStats.totalMarksEarned}</div>
                    <div className="text-xs text-muted-foreground">Marks Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Cards */}
          {savedCards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Card Designs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedCards.slice(0, 5).map(card => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{card.headline}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.format} • {card.initiative} • {card.status}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {card.referrerCode}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
