import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { StickyMobileCTA } from "@/components/v2/StickyMobileCTA";
import { ProofStrip } from "@/components/v2/ProofStrip";
import { CardEditorCanvas } from "@/components/v2/cue-cards/CardEditorCanvas";
import { TemplatePicker } from "@/components/v2/cue-cards/TemplatePicker";
import { CueCardDraft, CueCardTemplate } from "@/components/v2/cue-cards/types";
import { VisualCustomization } from "@/components/v2/cue-cards/VisualCustomization";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSendEmail } from "@/hooks/useSendEmail";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STARTER_TEMPLATES: CueCardTemplate[] = [
  { id: "profile-invite", name: "Profile invite", headline: "Come see what I am building.", body: "Take a quick look at my profile and let me know what stands out.", cta: "Open profile", recommendedFor: "Personal intros and reconnecting", accent: "#2563eb" },
  { id: "storefront-welcome", name: "Storefront welcome", headline: "Welcome to my storefront.", body: "Browse what I made and share your first impression.", cta: "Visit storefront", recommendedFor: "Product and service launches", accent: "#16a34a" },
  { id: "guild-introduction", name: "Guild introduction", headline: "Join our guild conversation.", body: "We are organizing practical work and would value your voice.", cta: "View guild", recommendedFor: "Guild onboarding", accent: "#9333ea" },
  { id: "tribe-seed", name: "Tribe seed", headline: "Help us seed this local tribe.", body: "We are gathering neighbors who can support one another.", cta: "Open tribe note", recommendedFor: "Local network outreach", accent: "#ea580c" },
  { id: "project-pledge-ask", name: "Project pledge ask", headline: "Can you review this project pledge?", body: "A short look now helps us decide the next production step.", cta: "View pledge", recommendedFor: "Project check-ins", accent: "#0f766e" },
  { id: "family-table-invite", name: "Family Table invite", headline: "You are invited to the Family Table.", body: "Join us for practical household collaboration and planning.", cta: "Join Family Table", recommendedFor: "Household and kitchen coordination", accent: "#ca8a04" },
  { id: "crew-call", name: "Crew call", headline: "We are opening one crew seat.", body: "If this mission fits you, reply and we can walk through details.", cta: "Open crew call", recommendedFor: "Team formation", accent: "#0891b2" },
  { id: "workshop-intro", name: "Workshop intro", headline: "Take a quick look at our workshop lane.", body: "This card links to our current build notes and next milestones.", cta: "Open workshop", recommendedFor: "Maker and process intros", accent: "#be185d" },
];

function createDraftFromTemplate(template: CueCardTemplate): CueCardDraft {
  return {
    templateId: template.id,
    headline: template.headline,
    body: template.body,
    cta: template.cta,
    linkTarget: "profile",
    linkValue: "/member/me",
    contactInfo: "",
    accentColor: template.accent,
    fontStyle: "clean",
    imageUrl: "",
    shareMethod: "link",
    recipientName: "",
    recipientEmail: "",
  };
}

export default function CueCardCreatorV2() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const sendEmail = useSendEmail();

  const [phase, setPhase] = useState<"templates" | "editor">("templates");
  const [draft, setDraft] = useState<CueCardDraft>(() => createDraftFromTemplate(STARTER_TEMPLATES[0]));
  const [mobileShowPreview, setMobileShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdCardId, setCreatedCardId] = useState<string>("");

  const selectedTemplate = useMemo(
    () => STARTER_TEMPLATES.find((template) => template.id === draft.templateId) ?? STARTER_TEMPLATES[0],
    [draft.templateId],
  );

  const shareUrl = createdCardId ? `${window.location.origin}/cue/${createdCardId}` : "";

  const saveCueCard = async () => {
    const basePayload: Record<string, unknown> = {
      member_id: user?.id,
      user_id: user?.id,
      title: draft.headline,
      template_key: draft.templateId,
      link_target: draft.linkTarget,
      link_value: draft.linkValue,
      contact_info: draft.contactInfo || null,
      cta_text: draft.cta,
      body_text: draft.body,
      accent_color: draft.accentColor,
      font_style: draft.fontStyle,
      image_url: draft.imageUrl || null,
      attribution_note: "Responses to this card are attributed to you only.",
      attribution_level: 1,
    };

    const { data, error } = await supabase
      .from("cue_cards" as never)
      .insert(basePayload as never)
      .select("id")
      .maybeSingle();

    if (error) {
      // Fallback with a narrower payload for environments with leaner cue_cards schemas.
      const fallbackPayload: Record<string, unknown> = {
        member_id: user?.id,
        user_id: user?.id,
        shared_beacons: [],
      };

      const fallback = await supabase
        .from("cue_cards" as never)
        .insert(fallbackPayload as never)
        .select("id")
        .maybeSingle();

      if (fallback.error) {
        throw fallback.error;
      }

      return (fallback.data as { id: string } | null)?.id || crypto.randomUUID();
    }

    return (data as { id: string } | null)?.id || crypto.randomUUID();
  };

  const handleSend = async () => {
    if (!user) {
      toast.error("Please sign in first.");
      return;
    }
    if (draft.shareMethod === "email" && !draft.recipientEmail.trim()) {
      toast.error("Recipient email is required for email send.");
      return;
    }

    setSaving(true);
    try {
      const cardId = await saveCueCard();
      setCreatedCardId(cardId);
      const nextShareUrl = `${window.location.origin}/cue/${cardId}`;

      if (draft.shareMethod === "email" && draft.recipientEmail.trim()) {
        await sendEmail.mutateAsync({
          email: draft.recipientEmail.trim(),
          type: "outreach",
          data: {
            recipientName: draft.recipientName || undefined,
            senderName: user.user_metadata?.full_name || "A Liana Banyan member",
            subject: draft.headline,
            body: `${draft.body}\n\n${nextShareUrl}`,
            cueCardType: selectedTemplate.name,
          },
        });
      }

      toast.success(draft.shareMethod === "email" ? "Card saved and email queued." : "Card saved. Share link is ready.");
    } catch (error) {
      console.error(error);
      toast.error("Could not send card.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="cue-card-creator">
      <div data-tour-target="cue-card-creator" />

      <div className="mb-6 flex items-center justify-between">
        <Link to="/cue-cards" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <section className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Cue Card Creator</p>
        <h1 className="text-3xl font-bold">Make an invite card that feels like you.</h1>
        <p className="max-w-4xl text-muted-foreground">
          Build a shareable outreach card tied to your profile, storefront, or guild, then send it by link or email with simple one-level attribution built in.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => { setDraft(createDraftFromTemplate(STARTER_TEMPLATES[0])); setPhase("editor"); }}>
            Create new card
          </Button>
          <Button type="button" variant="outline" onClick={() => setPhase("templates")}>
            Use a starter layout
          </Button>
        </div>
        <ProofStrip
          items={[
            "Profile, storefront, or guild links",
            "one-level attribution only",
            "email or shareable link",
          ]}
        />
      </section>

      <div className="mt-8 space-y-6">
        {phase === "templates" ? (
          <TemplatePicker
            templates={STARTER_TEMPLATES}
            selectedTemplateId={draft.templateId}
            onSelectTemplate={(templateId) => {
              const template = STARTER_TEMPLATES.find((item) => item.id === templateId);
              if (!template) return;
              setDraft(createDraftFromTemplate(template));
              setPhase("editor");
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
              {isMobile ? (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setMobileShowPreview((value) => !value)}>
                    <Eye className="mr-2 h-4 w-4" />
                    {mobileShowPreview ? "Hide preview" : "Show preview"}
                  </Button>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button type="button" variant="outline">Adjust design</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Adjust design</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4">
                        <VisualCustomization draft={draft} onChange={setDraft} />
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              ) : null}
            </div>

            <CardEditorCanvas
              draft={draft}
              onChange={setDraft}
              shareUrl={shareUrl}
              mobileShowPreview={mobileShowPreview}
              includeVisualCustomization={!isMobile}
            />

            <div className="flex flex-wrap justify-between gap-2">
              <Button type="button" variant="outline" onClick={() => setPhase("templates")}>
                Change template
              </Button>
              <Button type="button" onClick={() => void handleSend()} disabled={saving}>
                {saving ? "Sending..." : "Send card"}
              </Button>
            </div>
          </>
        )}
      </div>

      {isMobile ? (
        <StickyMobileCTA
          primary={{
            label: phase === "templates" ? "Continue" : "Send card",
            onClick: () => {
              if (phase === "templates") {
                setPhase("editor");
                return;
              }
              void handleSend();
            },
          }}
          secondary={{
            label: "Use a starter layout",
            onClick: () => setPhase("templates"),
          }}
        />
      ) : null}
    </PortalPageLayout>
  );
}
