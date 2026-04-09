import React from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { StaffSwitcher } from "@/components/staff/StaffSwitcher";
import { cn } from "@/lib/utils";

type StaffPageLayoutProps = {
  children: React.ReactNode;
  xrayId?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showSwitcher?: boolean;
};

export function StaffPageLayout({
  children,
  xrayId,
  maxWidth = "xl",
  className,
  showSwitcher = true,
}: StaffPageLayoutProps) {
  return (
    <PortalPageLayout maxWidth={maxWidth} xrayId={xrayId}>
      <div className={cn("space-y-4", className)}>
        {showSwitcher && <StaffSwitcher />}
        {children}
      </div>
    </PortalPageLayout>
  );
}
