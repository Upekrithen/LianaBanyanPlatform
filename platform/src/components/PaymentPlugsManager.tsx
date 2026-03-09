/**
 * PAYMENT PLUGS MANAGER
 * =====================
 * Manages member's external payment rails (PayPal, Ko-fi, Venmo, Cash App, Zelle).
 * These are NOT payment processing (Stripe handles that).
 * These are tip jars / donation rails that members expose on their profiles
 * for peer-to-peer support — exactly what Mike Puckett uses (PayPal.me + Ko-fi).
 *
 * Used in: Portfolio, Swoop pages, bounty listings, Rally Group
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Plus, Star, ExternalLink, Trash2 } from "lucide-react";

// Payment platform definitions
const PAYMENT_PLATFORMS = [
  {
    platform: "paypal" as const,
    displayName: "PayPal",
    icon: "💳",
    color: "bg-blue-600",
    placeholder: "YourPayPalHandle",
    urlPrefix: "https://paypal.me/",
    helpText: "Enter your PayPal.me handle (e.g., TheFreePizzaDude)",
    handlePrefix: "",
  },
  {
    platform: "kofi" as const,
    displayName: "Ko-fi",
    icon: "☕",
    color: "bg-sky-400",
    placeholder: "YourKofiHandle",
    urlPrefix: "https://ko-fi.com/",
    helpText: "Enter your Ko-fi handle",
    handlePrefix: "",
  },
  {
    platform: "venmo" as const,
    displayName: "Venmo",
    icon: "💙",
    color: "bg-blue-500",
    placeholder: "YourVenmoHandle",
    urlPrefix: "https://venmo.com/",
    helpText: "Enter your Venmo handle (with or without @)",
    handlePrefix: "@",
  },
  {
    platform: "cashapp" as const,
    displayName: "Cash App",
    icon: "💚",
    color: "bg-green-500",
    placeholder: "YourCashTag",
    urlPrefix: "https://cash.app/",
    helpText: "Enter your $cashtag (with or without $)",
    handlePrefix: "$",
  },
  {
    platform: "zelle" as const,
    displayName: "Zelle",
    icon: "💜",
    color: "bg-purple-600",
    placeholder: "email@example.com or phone",
    urlPrefix: "",
    helpText: "Enter your Zelle email or phone number",
    handlePrefix: "",
  },
] as const;

type PaymentPlatformType = typeof PAYMENT_PLATFORMS[number]["platform"];

interface PaymentPlug {
  id: string;
  platform: PaymentPlatformType;
  handle_or_url: string;
  display_name: string | null;
  is_active: boolean;
  is_primary: boolean;
}

export function PaymentPlugsManager() {
  const [plugs, setPlugs] = useState<PaymentPlug[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<PaymentPlatformType | null>(null);
  const [handleInput, setHandleInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const { toast } = useToast();

  // Fetch existing payment plugs
  useEffect(() => {
    fetchPlugs();
  }, []);

  async function fetchPlugs() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("member_payment_plugs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (!error && data) {
      setPlugs(data as PaymentPlug[]);
    }
    setLoading(false);
  }

  async function addPlug(platform: PaymentPlatformType) {
    if (!handleInput.trim()) {
      toast({ title: "Handle required", description: "Please enter your handle or URL", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("member_payment_plugs")
      .upsert({
        user_id: user.id,
        platform,
        handle_or_url: handleInput.trim(),
        display_name: nameInput.trim() || null,
        is_active: true,
        is_primary: plugs.length === 0, // First one is primary
      }, {
        onConflict: "user_id,platform",
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payment rail connected", description: `${platform} added to your profile` });
      setAdding(null);
      setHandleInput("");
      setNameInput("");
      fetchPlugs();
    }
  }

  async function removePlug(id: string) {
    const { error } = await supabase
      .from("member_payment_plugs")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({ title: "Removed", description: "Payment rail disconnected" });
      fetchPlugs();
    }
  }

  async function setPrimary(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("member_payment_plugs")
      .update({ is_primary: true })
      .eq("id", id);

    if (!error) {
      toast({ title: "Primary set", description: "This is now your primary payment rail" });
      fetchPlugs();
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const { error } = await supabase
      .from("member_payment_plugs")
      .update({ is_active: active, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchPlugs();
  }

  const connectedPlatforms = new Set(plugs.map((p) => p.platform));
  const availablePlatforms = PAYMENT_PLATFORMS.filter((p) => !connectedPlatforms.has(p.platform));

  function getUrl(plug: PaymentPlug): string {
    const platformDef = PAYMENT_PLATFORMS.find((p) => p.platform === plug.platform);
    if (!platformDef?.urlPrefix) return plug.handle_or_url;
    const handle = plug.handle_or_url.replace(/^[@$]/, "");
    return `${platformDef.urlPrefix}${handle}`;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Payment Rails
        </CardTitle>
        <CardDescription>
          External payment links shown on your profile. Donors, Swoop contributors, and bounty payers
          can send you support through any of these rails. These are peer-to-peer — the platform
          does not process these payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connected payment plugs */}
        {plugs.map((plug) => {
          const platformDef = PAYMENT_PLATFORMS.find((p) => p.platform === plug.platform);
          if (!platformDef) return null;

          return (
            <div
              key={plug.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platformDef.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{platformDef.displayName}</span>
                    {plug.is_primary && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plug.display_name || plug.handle_or_url}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getUrl(plug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <Switch
                  checked={plug.is_active}
                  onCheckedChange={(checked) => toggleActive(plug.id, checked)}
                />
                {!plug.is_primary && (
                  <Button variant="ghost" size="sm" onClick={() => setPrimary(plug.id)}>
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlug(plug.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Add new payment plug */}
        {adding ? (
          <div className="p-4 border rounded-lg border-dashed space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">
                {PAYMENT_PLATFORMS.find((p) => p.platform === adding)?.icon}
              </span>
              <span className="font-medium">
                Connect {PAYMENT_PLATFORMS.find((p) => p.platform === adding)?.displayName}
              </span>
            </div>
            <div>
              <Label>Handle / URL</Label>
              <Input
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder={PAYMENT_PLATFORMS.find((p) => p.platform === adding)?.placeholder}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {PAYMENT_PLATFORMS.find((p) => p.platform === adding)?.helpText}
              </p>
            </div>
            <div>
              <Label>Display Name (optional)</Label>
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g., My Pizza Fund"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addPlug(adding)} size="sm">
                Connect
              </Button>
              <Button variant="ghost" onClick={() => { setAdding(null); setHandleInput(""); setNameInput(""); }} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : availablePlatforms.length > 0 ? (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Add a payment rail:</Label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map((p) => (
                <Button
                  key={p.platform}
                  variant="outline"
                  size="sm"
                  onClick={() => setAdding(p.platform)}
                  className="gap-1"
                >
                  <span>{p.icon}</span>
                  {p.displayName}
                  <Plus className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            All payment rails connected
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentPlugsManager;
