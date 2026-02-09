import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  variant?: "default" | "card";
}

export const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
  variant = "default",
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (variant === "card") {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto hover:bg-accent/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-semibold text-left">{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className="h-5 w-5 flex-shrink-0 ml-2" />
          )}
        </Button>
        {isExpanded && (
          <div className="p-4 pt-0 border-t">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-between p-2 h-auto hover:bg-accent/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-left">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 ml-2" />
        )}
      </Button>
      {isExpanded && <div className="pl-4">{children}</div>}
    </div>
  );
};
