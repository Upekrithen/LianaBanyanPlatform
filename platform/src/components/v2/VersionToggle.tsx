import { cn } from "@/lib/utils";

type VersionOption = {
  id: string;
  label: string;
  disabled?: boolean;
};

type VersionToggleProps = {
  versions: VersionOption[];
  activeId: string;
  onChange: (id: string) => void;
};

export function VersionToggle({ versions, activeId, onChange }: VersionToggleProps) {
  return (
    <div className="inline-flex w-full max-w-lg items-center rounded-lg border bg-muted/40 p-1">
      {versions.map((version) => {
        const active = version.id === activeId;
        return (
          <button
            key={version.id}
            type="button"
            onClick={() => {
              if (!version.disabled) onChange(version.id);
            }}
            disabled={version.disabled}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-background font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
              version.disabled ? "cursor-not-allowed opacity-50 hover:text-muted-foreground" : null,
            )}
            aria-pressed={active}
          >
            {version.label}
          </button>
        );
      })}
    </div>
  );
}
