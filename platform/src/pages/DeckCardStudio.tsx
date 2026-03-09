import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Share2, Printer, Users, CreditCard, ArrowRight, ShieldCheck, Download, Image as ImageIcon, FileImage, Maximize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { uploadCanvasToImgur } from "@/lib/imgurUpload";
import { recordShare, generateShareUrl } from "@/lib/socialPlugSystem";

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT PRESETS
// ═══════════════════════════════════════════════════════════════════════════════
// Physical print specifications + digital export presets

const EXPORT_PRESETS = {
  // Digital exports
  imgur: { label: "Imgur Optimized", scale: 2, format: "png" as const, description: "1024px wide PNG — optimized for Imgur gallery" },
  socialMedia: { label: "Social Media", scale: 2, format: "png" as const, description: "High-res PNG for Twitter, LinkedIn, etc." },

  // Physical print specs (at 300 DPI)
  businessCard: { label: "Business Card (3.5×2\")", scale: 3, format: "png" as const, description: "1050×600px at 300dpi — standard business card" },
  coasterMedallion: { label: "Coaster Medallion (4\" dia)", scale: 4, format: "png" as const, description: "1200×1200px at 300dpi — tea mug coaster size" },
  postcard: { label: "Postcard (6×4\")", scale: 5, format: "png" as const, description: "1800×1200px at 300dpi — postcard/flyer format" },
} as const;

type ExportPreset = keyof typeof EXPORT_PRESETS;

export default function DeckCardStudio() {
  const { toast } = useToast();
  const [cardTitle, setCardTitle] = useState("My Brand Deck Card");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasDigitalCard, setHasDigitalCard] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [exportPreset, setExportPreset] = useState<ExportPreset>("imgur");
  const cardRef = useRef<HTMLDivElement>(null);

  /** Export card with selected preset */
  const handleExport = async (format: "png" | "jpg" = "png") => {
    if (!cardRef.current) return;
    const preset = EXPORT_PRESETS[exportPreset];
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: preset.scale,
        backgroundColor: format === "jpg" ? "#1e1b4b" : null, // Dark bg for JPG (no transparency)
        useCORS: true,
      });

      const link = document.createElement("a");
      const safeName = cardTitle.replace(/[^a-zA-Z0-9]/g, "_");

      if (format === "jpg") {
        link.download = `${safeName}_DeckCard.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.92);
      } else {
        link.download = `${safeName}_DeckCard.png`;
        link.href = canvas.toDataURL("image/png");
      }

      link.click();
      toast({
        title: "Downloaded!",
        description: `${preset.label} ${format.toUpperCase()} saved to Downloads.`,
      });
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not generate image.", variant: "destructive" });
    }
  };

  /** Upload card to Imgur */
  const handleUploadImgur = async () => {
    if (!cardRef.current) return;
    setIsUploading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: EXPORT_PRESETS.imgur.scale,
        backgroundColor: null,
        useCORS: true,
      });
      const result = await uploadCanvasToImgur(canvas, {
        title: `${cardTitle} — Liana Banyan Deck Card`,
        description: "Generated with Deck Card Studio. Scan QR to view portfolio. lianabanyan.com",
      });
      if (result.success && result.link) {
        toast({ title: "Uploaded to Imgur!", description: result.link });
        window.open(result.link, "_blank");
      } else {
        toast({ title: "Upload Failed", description: result.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Upload Failed", description: "Could not upload to Imgur.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  /** Share to all connected social plugs */
  const handleShareToPlugs = async () => {
    setIsSharing(true);
    try {
      const shareUrl = generateShareUrl("deck_card", cardTitle);
      // Record the share for analytics
      await recordShare("deck_card", cardTitle, "multi", shareUrl);

      // Use Web Share API if available, otherwise copy link
      if (navigator.share) {
        await navigator.share({
          title: `${cardTitle} — Liana Banyan Deck Card`,
          text: `Check out my Deck Card on Liana Banyan! ${cardTitle}`,
          url: shareUrl,
        });
        toast({ title: "Shared!", description: "Deck Card shared via your device." });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied!", description: "Share link copied to clipboard. Paste it anywhere!" });
      }
    } catch (err) {
      // User cancelled share dialog — not an error
      if (err instanceof Error && err.name !== "AbortError") {
        toast({ title: "Share Failed", description: "Could not share.", variant: "destructive" });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasDigitalCard(true);
      toast({
        title: "Digital Card Generated!",
        description: "Your immutable QR hash has been minted on the Test-Net Ledger.",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 rounded-full text-white">
          <QrCode className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Deck Card Studio</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Generate your free digital Cue Card, then join the Volume Dump to print physical copies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Digital Generation */}
        <div className="space-y-6">
          <Card className="border-2 border-indigo-100 dark:border-indigo-900">
            <CardHeader>
              <CardTitle>1. Your Free Digital Card</CardTitle>
              <CardDescription>
                Included with your $5/yr membership. Use this to mount your own viral marketing campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Card Title / Project Name</label>
                <Input 
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="e.g., Sarah's Artisan Bakery"
                />
              </div>
              
              {!hasDigitalCard ? (
                <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400">
                  <QrCode className="h-12 w-12 mb-2 opacity-50" />
                  <p>Preview will appear here</p>
                </div>
              ) : (
                <div ref={cardRef} className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex flex-col items-center justify-center text-white shadow-inner relative overflow-hidden">
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none">
                      <ShieldCheck className="h-3 w-3 mr-1" /> IP Ledger Minted
                    </Badge>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                    <QrCode className="h-24 w-24 text-slate-900" />
                  </div>
                  <h3 className="font-bold text-xl">{cardTitle}</h3>
                  <p className="text-indigo-100 text-sm mt-1">Scan to view portfolio</p>
                </div>
              )}

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleGenerate}
                disabled={isGenerating || hasDigitalCard}
              >
                {isGenerating ? "Minting to Ledger..." : hasDigitalCard ? "Card Generated" : "Generate Digital Card"}
              </Button>

              {hasDigitalCard && (
                <div className="flex flex-col gap-3">
                  {/* Export Preset Selector */}
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <Maximize2 className="h-3 w-3" /> Export Preset
                    </label>
                    <Select value={exportPreset} onValueChange={(v) => setExportPreset(v as ExportPreset)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EXPORT_PRESETS).map(([key, preset]) => (
                          <SelectItem key={key} value={key}>
                            <span className="font-medium">{preset.label}</span>
                            <span className="text-xs text-muted-foreground ml-2">({preset.description})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleExport("png")}>
                      <Download className="h-4 w-4 mr-2" /> PNG
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleExport("jpg")}>
                      <FileImage className="h-4 w-4 mr-2" /> JPG
                    </Button>
                  </div>

                  {/* Imgur Upload */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleUploadImgur}
                    disabled={isUploading}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading to Imgur..." : "Upload to Imgur Gallery"}
                  </Button>

                  {/* Share to Connected Plugs */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShareToPlugs}
                    disabled={isSharing}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {isSharing ? "Sharing..." : "Share to Connected Plugs"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Physical Volume Dump */}
        <div className="space-y-6">
          <Card className={`transition-opacity duration-500 ${!hasDigitalCard ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-slate-500" />
                2. Physical Print Run (Volume Dump)
              </CardTitle>
              <CardDescription>
                Turn your digital card into physical business cards or 3D Medallions. 
                We batch orders locally to hit the 6 Production Levels for massive discounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Current Local Pool: Phoenix, AZ</h4>
                    <p className="text-sm text-slate-500">Target: Level 6 (500+ orders)</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Cost+20% Active
                  </Badge>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mt-4">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>325 Orders Pooled</span>
                  <span>175 to reach Level 6</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg hover:border-indigo-300 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium">Standard Business Cards</p>
                      <p className="text-xs text-slate-500">Qty: 250 • Premium Cardstock</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">$14.50</p>
                    <p className="text-xs text-green-600 line-through">$45.00 Retail</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg hover:border-indigo-300 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="font-medium">3D Printed Medallions</p>
                      <p className="text-xs text-slate-500">Qty: 50 • SLS Nylon</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">$35.00</p>
                    <p className="text-xs text-green-600 line-through">$120.00 Retail</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900 text-sm">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Captain Backed
                </h4>
                <p className="text-amber-700 dark:text-amber-300">
                  This print run is backed by Captain <strong>@MarcusT</strong>. He has locked 500 Marks as collateral to guarantee delivery. The order is fulfilled locally via the Salt Mines.
                </p>
              </div>

            </CardContent>
            <CardFooter>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white group">
                Join Local Print Pool <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}