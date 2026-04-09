import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CheckCircle, AlertCircle, Loader2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLATFORM_PATTERNS: Record<string, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\//i,
  tiktok: /^https?:\/\/(www\.|vm\.)?tiktok\.com\//i,
  facebook: /^https?:\/\/(www\.|m\.)?facebook\.com\//i,
  x: /^https?:\/\/(www\.)?(twitter|x)\.com\//i,
};

function detectPlatform(url: string): string | null {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) return platform;
  }
  return null;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X (Twitter)",
};

interface BountyClaimFormProps {
  bountyId?: string;
  bountyBusinessName?: string;
  onSuccess?: () => void;
}

export function BountyClaimForm({ bountyId, bountyBusinessName, onSuccess }: BountyClaimFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [socialUrl, setSocialUrl] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [businessName, setBusinessName] = useState(bountyBusinessName ?? "");
  const [businessSearch, setBusinessSearch] = useState("");
  const [description, setDescription] = useState("");
  const [urlError, setUrlError] = useState("");

  const { data: businesses } = useQuery({
    queryKey: ["photo-bounties-search", businessSearch],
    queryFn: async () => {
      if (!businessSearch || businessSearch.length < 2) return [];
      const { data } = await supabase
        .from("photo_bounties" as never)
        .select("id, business_name, business_address")
        .ilike("business_name", `%${businessSearch}%`)
        .eq("status", "active")
        .limit(8);
      return (data ?? []) as { id: string; business_name: string; business_address: string | null }[];
    },
    enabled: businessSearch.length >= 2,
  });

  const handleUrlChange = (url: string) => {
    setSocialUrl(url);
    setUrlError("");
    const detected = detectPlatform(url);
    if (detected) {
      setPlatform(detected);
    } else if (url.length > 10) {
      setUrlError("Paste a link from Instagram, TikTok, Facebook, or X");
    }
  };

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!platform) throw new Error("Select a platform");
      if (!businessName.trim()) throw new Error("Business name required");

      const { error } = await supabase
        .from("photo_bounty_claims" as never)
        .insert({
          member_id: user.id,
          bounty_id: bountyId ?? null,
          social_url: socialUrl.trim(),
          social_platform: platform,
          business_name: businessName.trim(),
          description: description.trim() || null,
          marks_awarded: 2,
          status: "pending",
        } as never);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Bounty claimed!", description: "Your photo claim is pending verification. +2 Marks when verified." });
      setSocialUrl("");
      setPlatform("");
      if (!bountyBusinessName) setBusinessName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["bounty-claims"] });
      queryClient.invalidateQueries({ queryKey: ["bounties"] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast({ title: "Claim failed", description: err.message, variant: "destructive" });
    },
  });

  const isValid = socialUrl.trim() && platform && businessName.trim() && !urlError;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Claim Photography Bounty
        </CardTitle>
        <CardDescription>
          Post a photo to your social media, then paste the link here. LB stores only the URL (~850 bytes) — zero file uploads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social URL */}
        <div className="space-y-2">
          <Label htmlFor="social-url">Social Media URL</Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="social-url"
              placeholder="https://instagram.com/p/..."
              value={socialUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {urlError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {urlError}
            </p>
          )}
          {platform && !urlError && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Detected: {PLATFORM_LABELS[platform]}
            </Badge>
          )}
        </div>

        {/* Platform override */}
        {!platform && socialUrl.length > 0 && (
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            placeholder="Type to search or enter manually..."
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setBusinessSearch(e.target.value);
            }}
            disabled={!!bountyBusinessName}
          />
          {businesses && businesses.length > 0 && !bountyBusinessName && businessName !== businesses[0]?.business_name && (
            <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
              {businesses.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setBusinessName(b.business_name);
                    setBusinessSearch("");
                  }}
                >
                  <span className="font-medium">{b.business_name}</span>
                  {b.business_address && <span className="text-muted-foreground ml-2 text-xs">— {b.business_address}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="photo-desc">Description (optional)</Label>
          <Textarea
            id="photo-desc"
            placeholder="What's in the photo? (280 chars max)"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={2}
          />
          <p className="text-xs text-muted-foreground text-right">{description.length}/280</p>
        </div>

        {/* Reward preview */}
        <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reward on verification:</span>
          <Badge className="bg-amber-600/20 text-amber-400 border-amber-500/30">+2 Marks</Badge>
        </div>

        <Button
          onClick={() => claimMutation.mutate()}
          disabled={!isValid || claimMutation.isPending || !user}
          className="w-full"
        >
          {claimMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <><Camera className="w-4 h-4 mr-2" /> Claim Bounty</>
          )}
        </Button>

        {!user && (
          <p className="text-sm text-center text-muted-foreground">
            Sign in to claim photography bounties
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default BountyClaimForm;
