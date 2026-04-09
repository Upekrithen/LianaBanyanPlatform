import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StorefrontType, TemplateOption } from "@/components/v2/storefront/types";

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: "food-counter", name: "Counter Service", type: "food", recommendedFor: "Coffee shops and breakfast spots", description: "Fast menu rows with clear pickup windows." },
  { id: "food-family", name: "Family Plates", type: "food", recommendedFor: "Meal prep and weekly bundles", description: "Bundle-focused layout with recurring ordering." },
  { id: "food-truck", name: "Truck Route", type: "food", recommendedFor: "Food trucks and rotating stops", description: "Daily location note and quick order cards." },
  { id: "food-bakery", name: "Bakery Shelf", type: "food", recommendedFor: "Bakeries and pastry sellers", description: "Photo-first cards for small-batch items." },
  { id: "food-catering", name: "Catering Board", type: "food", recommendedFor: "Events and catering teams", description: "Package tiers and lead-time reminders." },
  { id: "food-market", name: "Farmstand", type: "food", recommendedFor: "Produce and fresh goods", description: "Inventory availability by market day." },

  { id: "crafts-gallery", name: "Maker Gallery", type: "crafts", recommendedFor: "Artists and handmade goods", description: "Large previews and collection rails." },
  { id: "crafts-custom", name: "Custom Orders", type: "crafts", recommendedFor: "Commission-based creators", description: "Request-first flow with quote callouts." },
  { id: "crafts-seasonal", name: "Seasonal Drop", type: "crafts", recommendedFor: "Holiday and seasonal products", description: "Limited-run banners and countdown row." },
  { id: "crafts-workshop", name: "Workshop Passes", type: "crafts", recommendedFor: "Class-based craft businesses", description: "Session tiles with attendee limits." },
  { id: "crafts-studio", name: "Studio Catalog", type: "crafts", recommendedFor: "Multi-category craft studios", description: "Category side rail with compact cards." },
  { id: "crafts-repair", name: "Repair Bench", type: "crafts", recommendedFor: "Fix-and-restore specialists", description: "Service steps with intake checklist." },

  { id: "services-bookings", name: "Booking Lane", type: "services", recommendedFor: "Appointments and sessions", description: "Time slot cards with service tiers." },
  { id: "services-packages", name: "Package Planner", type: "services", recommendedFor: "Retainers and bundled services", description: "Package comparisons and scope notes." },
  { id: "services-consulting", name: "Consult Desk", type: "services", recommendedFor: "Consultants and advisors", description: "Offer grid with scheduling focus." },
  { id: "services-local", name: "Local Crew", type: "services", recommendedFor: "In-person local teams", description: "Service zones and availability details." },
  { id: "services-maintenance", name: "Maintenance Board", type: "services", recommendedFor: "Recurring maintenance providers", description: "Recurring tasks with check-in cadence." },
  { id: "services-events", name: "Event Support", type: "services", recommendedFor: "Pop-up and event specialists", description: "Date-first cards and booking windows." },

  { id: "digital-downloads", name: "Download Shelf", type: "digital", recommendedFor: "File packs and templates", description: "Digital products with file previews." },
  { id: "digital-membership", name: "Member Vault", type: "digital", recommendedFor: "Private content subscriptions", description: "Access levels and membership callouts." },
  { id: "digital-courses", name: "Course Path", type: "digital", recommendedFor: "Course creators and trainers", description: "Curriculum lane with module cards." },
  { id: "digital-audio", name: "Audio Studio", type: "digital", recommendedFor: "Music and podcast bundles", description: "Track list layout and release highlights." },
  { id: "digital-design", name: "Design Asset Hub", type: "digital", recommendedFor: "Design packs and assets", description: "Filterable categories with quick previews." },
  { id: "digital-license", name: "License Desk", type: "digital", recommendedFor: "Licensed digital usage", description: "Usage terms alongside purchase options." },
];

type TemplatePickerProps = {
  storefrontType: StorefrontType;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
};

export function TemplatePicker({ storefrontType, selectedTemplateId, onSelectTemplate }: TemplatePickerProps) {
  const templates = useMemo(
    () => TEMPLATE_OPTIONS.filter((template) => template.type === storefrontType),
    [storefrontType],
  );
  const [hoverTemplateId, setHoverTemplateId] = useState<string | null>(null);

  const previewTemplate =
    templates.find((template) => template.id === hoverTemplateId) ||
    templates.find((template) => template.id === selectedTemplateId) ||
    templates[0];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pick a Template</h2>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate(template.id)}
                onMouseEnter={() => setHoverTemplateId(template.id)}
                onMouseLeave={() => setHoverTemplateId(null)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-card/70",
                )}
              >
                <p className="font-medium">{template.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                <p className="mt-3 text-xs">
                  <span className="text-muted-foreground">Recommended for:</span>{" "}
                  <span className="font-medium">{template.recommendedFor}</span>
                </p>
              </button>
            );
          })}
        </div>
        <Card className="h-fit bg-card/60">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium">Hover Preview</p>
            {previewTemplate ? (
              <>
                <p className="text-base font-semibold">{previewTemplate.name}</p>
                <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
                <p className="text-xs">
                  <span className="text-muted-foreground">Recommended for:</span>{" "}
                  {previewTemplate.recommendedFor}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Hover a template to preview.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
