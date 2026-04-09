import React from "react";
import { cn } from "@/lib/utils";

type StaffPageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function StaffPageHeader({
  title,
  description,
  actions,
  className,
}: StaffPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 items-center">{actions}</div> : null}
    </div>
  );
}
