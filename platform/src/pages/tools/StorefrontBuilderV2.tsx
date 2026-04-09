import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StickyMobileCTA } from "@/components/v2/StickyMobileCTA";
import { BuilderStepsColumn } from "@/components/v2/storefront/BuilderStepsColumn";
import { InventoryImportTabs } from "@/components/v2/storefront/InventoryImportTabs";
import { LaunchChecklist } from "@/components/v2/storefront/LaunchChecklist";
import { LivePreviewPane } from "@/components/v2/storefront/LivePreviewPane";
import { PricingGrid } from "@/components/v2/storefront/PricingGrid";
import { StorefrontTypeSelector } from "@/components/v2/storefront/StorefrontTypeSelector";
import { TemplatePicker } from "@/components/v2/storefront/TemplatePicker";
import {
  ChecklistItem,
  ImportSource,
  PreviewMode,
  ProductDraft,
  StorefrontType,
} from "@/components/v2/storefront/types";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STEP_LABELS = [
  "Storefront Type",
  "Template",
  "Inventory Import",
  "Pricing Grid",
  "Launch Checklist",
];

const TEMPLATE_NAMES: Record<string, string> = {
  "food-counter": "Counter Service",
  "food-family": "Family Plates",
  "food-truck": "Truck Route",
  "food-bakery": "Bakery Shelf",
  "food-catering": "Catering Board",
  "food-market": "Farmstand",
  "crafts-gallery": "Maker Gallery",
  "crafts-custom": "Custom Orders",
  "crafts-seasonal": "Seasonal Drop",
  "crafts-workshop": "Workshop Passes",
  "crafts-studio": "Studio Catalog",
  "crafts-repair": "Repair Bench",
  "services-bookings": "Booking Lane",
  "services-packages": "Package Planner",
  "services-consulting": "Consult Desk",
  "services-local": "Local Crew",
  "services-maintenance": "Maintenance Board",
  "services-events": "Event Support",
  "digital-downloads": "Download Shelf",
  "digital-membership": "Member Vault",
  "digital-courses": "Course Path",
  "digital-audio": "Audio Studio",
  "digital-design": "Design Asset Hub",
  "digital-license": "License Desk",
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "catalog", label: "At least one inventory item is imported.", checked: false },
  { id: "pricing", label: "Pricing grid reviewed for cost, suggested, and take-home.", checked: false },
  { id: "preview", label: "Desktop and mobile preview were both reviewed.", checked: false },
  { id: "details", label: "Storefront type and template are selected.", checked: false },
];

function clampStep(value: number) {
  return Math.min(Math.max(value, 1), STEP_LABELS.length);
}

type DraftStatus = "draft" | "ready_to_publish";

export default function StorefrontBuilderV2() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [storefrontType, setStorefrontType] = useState<StorefrontType>("food");
  const [templateId, setTemplateId] = useState("");
  const [importSource, setImportSource] = useState<ImportSource>("start_fresh");
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const stepParam = Number(searchParams.get("step") || "1");
    setCurrentStep(clampStep(Number.isNaN(stepParam) ? 1 : stepParam));
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadDraft = async () => {
      const { data: draft, error } = await supabase
        .from("storefront_drafts" as never)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !draft || !isMounted) {
        return;
      }

      const draftRecord = draft as Record<string, any>;
      setDraftId(draftRecord.id ?? null);
      setStorefrontType((draftRecord.storefront_type as StorefrontType) ?? "food");
      setTemplateId((draftRecord.template_id as string) ?? "");
      setImportSource((draftRecord.import_source as ImportSource) ?? "start_fresh");
      setChecklist((draftRecord.checklist as ChecklistItem[]) ?? DEFAULT_CHECKLIST);

      const stepFromDraft = clampStep(Number(draftRecord.current_step ?? 1));
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("step", String(stepFromDraft));
        return next;
      });

      const { data: draftProducts } = await supabase
        .from("product_drafts" as never)
        .select("*")
        .eq("draft_id", draftRecord.id)
        .order("created_at", { ascending: true });

      if (draftProducts && isMounted) {
        setProducts((draftProducts as Record<string, any>[]).map((product) => ({
          id: product.id,
          name: product.name ?? "Unnamed Product",
          sku: product.sku ?? "",
          cost: Number(product.cost ?? 0),
          quantity: Number(product.quantity ?? 0),
          source: (product.source as ImportSource) ?? "start_fresh",
        })));
      }
    };

    loadDraft();

    return () => {
      isMounted = false;
    };
  }, [user, setSearchParams]);

  const templateName = useMemo(() => TEMPLATE_NAMES[templateId] ?? "", [templateId]);
  const allChecklistChecked = checklist.every((item) => item.checked);

  const canContinue =
    (currentStep === 1 && storefrontType.length > 0) ||
    (currentStep === 2 && templateId.length > 0) ||
    (currentStep === 3 && products.length > 0) ||
    currentStep === 4 ||
    (currentStep === 5 && allChecklistChecked);

  const moveToStep = (step: number) => {
    const clamped = clampStep(step);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("step", String(clamped));
      return next;
    });
  };

  const persistDraft = async (status: DraftStatus, showToast = true) => {
    if (!user) {
      toast.error("Please sign in first.");
      return false;
    }

    setIsSavingDraft(true);
    try {
      const draftPayload = {
        user_id: user.id,
        storefront_type: storefrontType,
        template_id: templateId || null,
        import_source: importSource,
        current_step: currentStep,
        checklist,
        status,
      };

      let nextDraftId = draftId;

      if (draftId) {
        const { error } = await supabase
          .from("storefront_drafts" as never)
          .update(draftPayload as never)
          .eq("id", draftId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("storefront_drafts" as never)
          .insert(draftPayload as never)
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("Draft insert failed");
        nextDraftId = (data as Record<string, any>).id as string;
        setDraftId(nextDraftId);
      }

      if (nextDraftId) {
        await supabase.from("product_drafts" as never).delete().eq("draft_id", nextDraftId);
        if (products.length > 0) {
          const draftRows = products.map((product) => ({
            draft_id: nextDraftId,
            user_id: user.id,
            name: product.name,
            sku: product.sku,
            cost: product.cost,
            quantity: product.quantity,
            source: product.source,
            metadata: {},
          }));
          const { error: productError } = await supabase
            .from("product_drafts" as never)
            .insert(draftRows as never);
          if (productError) throw productError;
        }
      }

      if (showToast) {
        toast.success(status === "draft" ? "Draft saved." : "Storefront marked ready to publish.");
      }
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Could not save draft.");
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!allChecklistChecked) {
      toast.error("Complete all launch checklist items to publish.");
      return;
    }

    setIsPublishing(true);
    try {
      const saved = await persistDraft("ready_to_publish", false);
      if (!saved) return;
      toast.success("Storefront is ready to publish.");
    } finally {
      setIsPublishing(false);
    }
  };

  const primaryCtaLabel = currentStep === 5 ? "Publish Storefront" : "Continue";

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="storefront-builder">
      <div data-tour-target="storefront-builder" />

      <div className="mb-6 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          <Button type="button" variant="outline" onClick={() => setMobilePreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button type="button" variant="outline" onClick={() => void persistDraft("draft")} disabled={isSavingDraft}>
            Save Draft
          </Button>
        </div>
      </div>

      <header className="mb-6 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Storefront Builder.</p>
        <h1 className="text-3xl font-bold">Open your doors in five steps.</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pick a type, choose a template, bring in inventory, set cooperative pricing, and go live. Save a draft any time.
        </p>
        <div className="inline-flex flex-wrap items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <span>5 steps</span>
          <span aria-hidden>·</span>
          <span>Cost+20% pricing</span>
          <span aria-hidden>·</span>
          <span>83.3% creator keep</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_360px]">
        <BuilderStepsColumn steps={STEP_LABELS} currentStep={currentStep} onSelectStep={moveToStep} />

        <Card className="bg-card/50">
          <CardContent className="space-y-5 p-4 sm:p-6">
            {currentStep === 1 ? (
              <StorefrontTypeSelector value={storefrontType} onChange={setStorefrontType} />
            ) : null}
            {currentStep === 2 ? (
              <TemplatePicker storefrontType={storefrontType} selectedTemplateId={templateId} onSelectTemplate={setTemplateId} />
            ) : null}
            {currentStep === 3 ? (
              <InventoryImportTabs
                importSource={importSource}
                products={products}
                onImportSourceChange={setImportSource}
                onProductsChange={setProducts}
              />
            ) : null}
            {currentStep === 4 ? <PricingGrid products={products} /> : null}
            {currentStep === 5 ? (
              <LaunchChecklist
                items={checklist}
                onToggleItem={(itemId, checked) =>
                  setChecklist((prev) => prev.map((item) => (item.id === itemId ? { ...item, checked } : item)))
                }
              />
            ) : null}

            <div className="hidden items-center justify-between gap-2 border-t pt-4 md:flex">
              <Button type="button" variant="outline" onClick={() => moveToStep(currentStep - 1)} disabled={currentStep === 1}>
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => void persistDraft("draft")} disabled={isSavingDraft}>
                  Save Draft
                </Button>
                {currentStep < 5 ? (
                  <Button type="button" onClick={() => moveToStep(currentStep + 1)} disabled={!canContinue}>
                    {primaryCtaLabel}
                  </Button>
                ) : (
                  <Button type="button" onClick={handlePublish} disabled={!allChecklistChecked || isPublishing}>
                    {isPublishing ? "Publishing..." : primaryCtaLabel}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="hidden xl:block">
          <LivePreviewPane
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            storefrontType={storefrontType}
            templateName={templateName}
            products={products}
            currentStepLabel={STEP_LABELS[currentStep - 1]}
          />
        </div>
      </div>

      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogContent className="h-screen w-screen max-w-none rounded-none p-4" draggable={false}>
          <DialogHeader>
            <DialogTitle>Storefront Preview</DialogTitle>
          </DialogHeader>
          <LivePreviewPane
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            storefrontType={storefrontType}
            templateName={templateName}
            products={products}
            currentStepLabel={STEP_LABELS[currentStep - 1]}
          />
        </DialogContent>
      </Dialog>

      {isMobile ? (
        <StickyMobileCTA
          primary={{
            label: primaryCtaLabel,
            onClick: () => {
              if (currentStep < 5) {
                if (!canContinue) return;
                moveToStep(currentStep + 1);
                return;
              }
              if (!allChecklistChecked) return;
              void handlePublish();
            },
          }}
          secondary={{
            label: "Save Draft",
            onClick: () => void persistDraft("draft"),
          }}
        />
      ) : null}
    </PortalPageLayout>
  );
}
