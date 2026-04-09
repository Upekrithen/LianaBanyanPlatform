import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAFF_LINKS = [
  { label: "Social Maven", to: "/staff/social-media" },
  { label: "Founder Contacts", to: "/staff/founder-contacts" },
  { label: "Launch Schedule", to: "/staff/launch-schedule" },
  { label: "Vote Gate Input", to: "/staff/chapter-engagement" },
  { label: "Ingestion Monitor", to: "/staff/engagement-ingestion" },
  { label: "Spice Editor", to: "/staff/spice-editor" },
  { label: "V2 Tracker", to: "/staff/v2-tracker" },
] as const;

type StaffSwitcherProps = {
  className?: string;
};

export function StaffSwitcher({ className }: StaffSwitcherProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {STAFF_LINKS.map((link) => (
        <Button key={link.to} size="sm" variant="outline" asChild>
          <NavLink
            to={link.to}
            className={({ isActive }) =>
              isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : undefined
            }
          >
            {link.label}
          </NavLink>
        </Button>
      ))}
    </div>
  );
}
