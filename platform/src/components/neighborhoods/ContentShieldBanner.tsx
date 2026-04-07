import type { ContentShieldViolation } from "@/hooks/useContentShield";
import { AlertTriangle, ShieldAlert, ShieldX, Loader2 } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  advertising: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  tracking: <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />,
  external_scripts: <ShieldX className="w-4 h-4 text-red-500 shrink-0" />,
  competing_platform: <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />,
  financial_fraud: <ShieldX className="w-4 h-4 text-red-600 shrink-0" />,
  impersonation: <ShieldX className="w-4 h-4 text-red-600 shrink-0" />,
  css_escape: <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />,
  platform_bypass: <ShieldX className="w-4 h-4 text-red-600 shrink-0" />,
};

interface ContentShieldBannerProps {
  violations: ContentShieldViolation[];
  validating?: boolean;
}

export function ContentShieldBanner({ violations, validating }: ContentShieldBannerProps) {
  if (validating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 rounded-lg bg-muted/50">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking content against platform rules...
      </div>
    );
  }

  if (violations.length === 0) return null;

  const blocks = violations.filter((v) => v.severity === "block");
  const flags = violations.filter((v) => v.severity === "flag");

  return (
    <div className="space-y-2">
      {blocks.length > 0 && (
        <div className="border border-red-500/40 bg-red-500/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-red-700">
            <ShieldX className="w-4 h-4" />
            This content cannot be saved — {blocks.length} violation{blocks.length > 1 ? "s" : ""} found
          </div>
          <ul className="space-y-1">
            {blocks.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-600/90">
                {CATEGORY_ICONS[v.category] ?? <ShieldX className="w-4 h-4 text-red-500 shrink-0" />}
                <span>
                  <span className="font-medium capitalize">{v.category.replace(/_/g, " ")}</span>
                  {" "}({v.field_name}): {v.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {flags.length > 0 && (
        <div className="border border-amber-500/40 bg-amber-500/5 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            This content will be flagged for Harper Guild review — {flags.length} issue{flags.length > 1 ? "s" : ""}
          </div>
          <ul className="space-y-1">
            {flags.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-600/90">
                {CATEGORY_ICONS[v.category] ?? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                <span>
                  <span className="font-medium capitalize">{v.category.replace(/_/g, " ")}</span>
                  {" "}({v.field_name}): {v.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
