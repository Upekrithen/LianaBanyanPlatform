import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Simple, universal breadcrumbs for Business portal
// Always starts at Business Portal and adds known route labels
export function GlobalBreadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  // Map specific routes to readable trail segments
  const trail: Array<{ label: string; to?: string }> = [];

  // Root crumb always
  trail.push({ label: "Liana Banyan Business Portal", to: "/dashboard" });

  // Add second-level crumbs by route
  if (path.includes("/workshop")) {
    trail.push({ label: "Workshop", to: "/workshop" });
  }

  if (path.includes("/campaign-production")) {
    // Per user expectation, campaign production is accessed from Workshop
    if (!trail.some(t => t.label === "Workshop")) {
      trail.push({ label: "Workshop", to: "/workshop" });
    }
    trail.push({ label: "Campaign Production" });
  }

  if (path.startsWith("/positions")) {
    trail.push({ label: "Positions", to: "/positions" });
  }
  if (path.startsWith("/member-resources")) {
    trail.push({ label: "Member Resources", to: "/member-resources" });
  }
  if (path.startsWith("/manage-positions")) {
    trail.push({ label: "Manage Positions", to: "/manage-positions" });
  }
  if (path.startsWith("/themes")) {
    trail.push({ label: "Theme Management", to: "/themes" });
  }
  if (path.startsWith("/task-list")) {
    trail.push({ label: "Task List", to: "/task-list" });
  }
  if (path.startsWith("/task-log")) {
    trail.push({ label: "Task Log", to: "/task-log" });
  }
  if (path.startsWith("/briefcase")) {
    trail.push({ label: "Briefcase", to: "/briefcase" });
  }
  if (path.startsWith("/project/")) {
    trail.push({ label: "Project" });
  }

  const lastIndex = trail.length - 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((item, idx) => (
          <BreadcrumbItem key={`${item.label}-${idx}`}>
            {idx < lastIndex && item.to ? (
              <BreadcrumbLink asChild>
                <Link to={item.to}>{item.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
            {idx < lastIndex && <BreadcrumbSeparator />}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
