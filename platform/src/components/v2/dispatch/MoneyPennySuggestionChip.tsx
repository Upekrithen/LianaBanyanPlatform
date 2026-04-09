import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type MoneyPennySuggestionChipProps = {
  label: string;
  onApply: () => void;
};

export function MoneyPennySuggestionChip({ label, onApply }: MoneyPennySuggestionChipProps) {
  return (
    <Button type="button" variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={onApply}>
      <Wand2 className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
