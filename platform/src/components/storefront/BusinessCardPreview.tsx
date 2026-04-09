import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CreditCard,
  QrCode,
  Printer,
  Loader2,
  Check,
} from "lucide-react";

type BusinessCardPreviewProps = {
  storefrontId: string;
  storefrontName: string;
  storefrontSlug?: string | null;
  ownerName: string;
  category: string;
  tagline?: string | null;
  location?: string | null;
};

const CARD_TIERS = [
  { qty: 100, price: 15, label: "100 cards" },
  { qty: 250, price: 30, label: "250 cards" },
  { qty: 500, price: 45, label: "500 cards" },
] as const;

export function BusinessCardPreview({
  storefrontId,
  storefrontName,
  storefrontSlug,
  ownerName,
  category,
  tagline,
  location,
}: BusinessCardPreviewProps) {
  const { user } = useAuth();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [selectedTier, setSelectedTier] = useState(0);
  const [loading, setLoading] = useState(false);

  const tier = CARD_TIERS[selectedTier];
  const qrUrl = `https://lianabanyan.com/storefront/${storefrontSlug ?? storefrontId}`;
  const categoryLabel = category?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleOrder = async () => {
    if (!user) {
      toast.error("Sign in to order business cards");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("printful-api", {
        body: {
          action: "create_order",
          data: {
            confirm: false,
            order: {
              recipient: { name: ownerName, email },
              items: [
                {
                  variant_id: "business_card_standard",
                  quantity: tier.qty,
                  files: [
                    {
                      type: "front",
                      url: "template:business_card_front",
                      options: {
                        storefront_name: storefrontName,
                        owner_name: ownerName,
                        phone,
                        email,
                        qr_url: qrUrl,
                        tagline: tagline ?? "",
                      },
                    },
                    {
                      type: "back",
                      url: "template:business_card_back",
                      options: {
                        category: categoryLabel,
                        location: location ?? "",
                        cta: "Scan to book instantly",
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      });

      if (error) throw error;

      toast.success(
        `${tier.qty} business cards ordered! They'll ship directly to you.`
      );
    } catch {
      toast.error("Failed to create print order. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Business Cards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Card preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Front */}
          <div className="rounded-lg border-2 border-dashed p-4 bg-white dark:bg-zinc-900 space-y-2 text-center min-h-[140px] flex flex-col justify-center">
            <p className="font-bold text-sm">{storefrontName}</p>
            <p className="text-xs text-muted-foreground">{ownerName}</p>
            {phone && (
              <p className="text-xs text-muted-foreground">{phone}</p>
            )}
            <p className="text-xs text-muted-foreground">{email}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-primary">
              <QrCode className="w-4 h-4" />
              <span>Scan to book instantly</span>
            </div>
          </div>

          {/* Back */}
          <div className="rounded-lg border-2 border-dashed p-4 bg-white dark:bg-zinc-900 space-y-2 text-center min-h-[140px] flex flex-col justify-center">
            <Badge variant="outline" className="mx-auto text-[10px]">
              {categoryLabel}
            </Badge>
            {tagline && (
              <p className="text-xs italic text-muted-foreground">
                &ldquo;{tagline}&rdquo;
              </p>
            )}
            {location && (
              <p className="text-xs text-muted-foreground">{location}</p>
            )}
            <p className="text-[10px] text-muted-foreground">
              Accepting Credits and Cards
            </p>
            <Badge variant="secondary" className="mx-auto text-[10px]">
              Liana Banyan Member
            </Badge>
          </div>
        </div>

        {/* Edit fields */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Phone</Label>
            <Input
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Quantity selection */}
        <div className="flex gap-2">
          {CARD_TIERS.map((t, i) => (
            <button
              key={t.qty}
              onClick={() => setSelectedTier(i)}
              className={`flex-1 p-2 rounded-lg border-2 text-center transition-colors ${
                selectedTier === i
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground">${t.price}</p>
            </button>
          ))}
        </div>

        <Button
          className="w-full gap-2"
          disabled={loading || !user}
          onClick={handleOrder}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Printer className="w-4 h-4" />
          )}
          Order {tier.qty} Cards &mdash; ${tier.price}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Printed and shipped by Printful. Usually arrives in 5-7 business days.
        </p>
      </CardContent>
    </Card>
  );
}
