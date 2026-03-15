/**
 * Switch between Full Detail / More Info / At a Glance versions (Session 19, labels updated Session 12).
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type PaperVersion = "academic" | "tldr" | "grade6";

interface VersionToggleProps {
  versions: { id: PaperVersion; label: string }[];
  onSelect: (v: PaperVersion) => void;
  current?: PaperVersion;
}

const DEFAULT_VERSIONS: { id: PaperVersion; label: string }[] = [
  { id: "academic", label: "Full Detail" },
  { id: "tldr", label: "More Info" },
  { id: "grade6", label: "At a Glance" },
];

export function VersionToggle({
  versions = DEFAULT_VERSIONS,
  onSelect,
  current = "academic",
}: VersionToggleProps) {
  return (
    <div className="cephas-version-toggle flex gap-2 flex-wrap">
      {versions.map((v) => (
        <Button
          key={v.id}
          variant={current === v.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(v.id)}
        >
          {v.label}
        </Button>
      ))}
    </div>
  );
}
