import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreviewMode, ProductDraft, StorefrontType } from "@/components/v2/storefront/types";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<StorefrontType, string> = {
  food: "Food",
  crafts: "Crafts",
  services: "Services",
  digital: "Digital",
};

type LivePreviewPaneProps = {
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  storefrontType: StorefrontType;
  templateName: string;
  products: ProductDraft[];
  currentStepLabel: string;
};

export function LivePreviewPane({
  previewMode,
  onPreviewModeChange,
  storefrontType,
  templateName,
  products,
  currentStepLabel,
}: LivePreviewPaneProps) {
  const displayProducts = products.slice(0, previewMode === "mobile" ? 2 : 4);

  return (
    <Card className="bg-card/60">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Live Preview</CardTitle>
          <div className="inline-flex rounded-md border p-1">
            <button
              type="button"
              onClick={() => onPreviewModeChange("desktop")}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                previewMode === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => onPreviewModeChange("mobile")}
              className={cn(
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                previewMode === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              Mobile
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "mx-auto rounded-xl border bg-background p-4",
            previewMode === "desktop" ? "max-w-xl" : "max-w-xs",
          )}
        >
          <p className="text-xs text-muted-foreground">Current step: {currentStepLabel}</p>
          <h3 className="mt-2 text-lg font-semibold">Your Storefront</h3>
          <p className="text-sm text-muted-foreground">
            {TYPE_LABELS[storefrontType]} template: {templateName || "Not selected yet"}
          </p>
          <div className="mt-4 space-y-2">
            {displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <p className="text-sm">{product.name}</p>
                  <p className="text-sm font-medium">${(product.cost * 1.2).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Import inventory to preview listing cards.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
