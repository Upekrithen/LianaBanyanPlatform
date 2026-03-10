/**
 * CONTINGENCY OPERATOR DIALOG — "What If?" Overlay for Beacon Runs
 * =================================================================
 * Modal dialog that overlays the current Beacon Run view.
 * Users adjust mock data fields and see live updates.
 *
 * Innovation #1554: Interactive Showcase Simulation
 *
 * SEC-safe: This is a service demonstration tool.
 * All data is explicitly labeled as showcase/demonstration content.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GitBranch,
  RotateCcw,
  Eye,
  Minus,
  Plus,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MockField, Derivation, CATEGORY_META } from "@/config/interestMockDataMap";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ContingencyOperatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onRestart: () => void;
  fields: MockField[];
  derivations: Derivation[];
  onFieldChange: (key: string, value: number) => void;
  onResetToDefaults: () => void;
  interestLabel: string;
  isCustomized: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ContingencyField({
  field,
  onChange,
}: {
  field: MockField;
  onChange: (key: string, value: number) => void;
}) {
  const isModified = field.value !== field.defaultValue;
  const inputRef = useRef<HTMLInputElement>(null);

  const increment = () => {
    const next = Math.min(field.value + field.step, field.max);
    onChange(field.key, next);
  };

  const decrement = () => {
    const next = Math.max(field.value - field.step, field.min);
    onChange(field.key, next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(field.key, Math.min(Math.max(parsed, field.min), field.max));
    }
  };

  const formatValue = (val: number): string => {
    if (field.unit === "$") return `$${val.toLocaleString()}`;
    if (field.unit === "%") return `${val}%`;
    if (field.unit) return `${val.toLocaleString()} ${field.unit}`;
    return val.toLocaleString();
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        isModified
          ? "bg-purple-500/5 border-purple-500/30"
          : "bg-muted/30 border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{field.label}</span>
        <div className="flex items-center gap-2">
          {isModified && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-500"
            >
              modified
            </Badge>
          )}
          <span className="text-sm font-mono text-muted-foreground">
            {formatValue(field.value)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={decrement}
          disabled={field.value <= field.min}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={field.value}
            onChange={handleInputChange}
            className="w-full accent-purple-500 h-2 cursor-pointer"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={increment}
          disabled={field.value >= field.max}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-10">
        <span>{formatValue(field.min)}</span>
        <span>{formatValue(field.max)}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD GROUP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ContingencyFieldGroup({
  category,
  fields,
  onChange,
}: {
  category: string;
  fields: MockField[];
  onChange: (key: string, value: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const meta = CATEGORY_META[category] || {
    label: category,
    icon: "⚙️",
    color: "text-slate-600",
  };

  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left hover:bg-muted/30 rounded-lg p-2 -mx-2 transition-colors"
      >
        <span className="text-lg">{meta.icon}</span>
        <span className={`text-sm font-semibold ${meta.color}`}>
          {meta.label}
        </span>
        <Badge variant="outline" className="text-[10px] ml-auto mr-2">
          {fields.length}
        </Badge>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2 pl-1">
          {fields.map((field) => (
            <ContingencyField
              key={field.key}
              field={field}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DERIVED VALUES DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

function DerivedValuesPanel({
  derivations,
  fieldValues,
}: {
  derivations: Derivation[];
  fieldValues: Record<string, number>;
}) {
  if (derivations.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 -mx-2">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-600">
          Calculated Values
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {derivations.map((d) => {
          const val = d.calculate(fieldValues);
          const formatted =
            d.unit === "$"
              ? `$${Math.round(val).toLocaleString()}`
              : d.unit === "%"
              ? `${val.toFixed(1)}%`
              : `${Math.round(val).toLocaleString()} ${d.unit}`.trim();

          return (
            <div
              key={d.key}
              className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg"
            >
              <div className="text-[10px] uppercase tracking-wider text-emerald-600 mb-1">
                {d.label}
              </div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {formatted}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DIALOG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ContingencyOperatorDialog({
  isOpen,
  onClose,
  onApply,
  onRestart,
  fields,
  derivations,
  onFieldChange,
  onResetToDefaults,
  interestLabel,
  isCustomized,
}: ContingencyOperatorDialogProps) {
  // Group fields by category
  const groupedFields: Record<string, MockField[]> = {};
  const categoryOrder = ["storefront", "economics", "saltMines", "coldStart", "general"];

  for (const field of fields) {
    if (!groupedFields[field.category]) {
      groupedFields[field.category] = [];
    }
    groupedFields[field.category].push(field);
  }

  // Build flat field values for derivations
  const fieldValues: Record<string, number> = {};
  for (const f of fields) {
    fieldValues[f.key] = f.value;
  }

  const hasModifications = fields.some((f) => f.value !== f.defaultValue);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <GitBranch className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                What If? — Contingency Operators
              </DialogTitle>
              <DialogDescription>
                Adjust the showcase numbers and see what changes
              </DialogDescription>
            </div>
          </div>

          {/* Interest Badge */}
          <Badge
            variant="outline"
            className="w-fit mt-2 text-purple-600 border-purple-500/30"
          >
            {interestLabel}
          </Badge>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1 -mx-1">
          {/* Field Groups */}
          {categoryOrder.map(
            (cat) =>
              groupedFields[cat] && (
                <ContingencyFieldGroup
                  key={cat}
                  category={cat}
                  fields={groupedFields[cat]}
                  onChange={onFieldChange}
                />
              )
          )}

          <Separator />

          {/* Derived Values */}
          <DerivedValuesPanel
            derivations={derivations}
            fieldValues={fieldValues}
          />

          {/* SEC Disclaimer */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  Showcase Demonstration Only
                </p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                  These numbers are hypothetical demonstration values for exploring how
                  platform services work. Not financial advice. Not a projection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetToDefaults}
            disabled={!hasModifications}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>

          <div className="flex-1" />

          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={onApply}
            disabled={!hasModifications}
            className="gap-1.5 bg-purple-600 hover:bg-purple-700"
          >
            <Eye className="w-4 h-4" />
            See the Difference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ContingencyOperatorDialog;
