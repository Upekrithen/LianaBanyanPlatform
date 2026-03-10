/**
 * FlyoverSearch — Debounced search bar for Crow's Nest items
 * ===========================================================
 * Filters by title, tags, and glimpse text.
 * "/" hotkey focuses. Escape clears. Shows result count.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrowsNest } from "@/contexts/CrowsNestContext";
import { ALL_CROWS_NEST_ITEMS } from "@/data/crowsNestItems";

interface FlyoverSearchProps {
  filteredCount: number;
}

export function FlyoverSearch({ filteredCount }: FlyoverSearchProps) {
  const { searchQuery, setSearch } = useCrowsNest();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search
  const handleChange = useCallback(
    (value: string) => {
      setLocalQuery(value);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearch(value);
      }, 300);
    },
    [setSearch]
  );

  // Clear
  const handleClear = useCallback(() => {
    setLocalQuery("");
    setSearch("");
    inputRef.current?.focus();
  }, [setSearch]);

  // "/" hotkey to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Escape to clear when focused
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (localQuery) {
          handleClear();
        } else {
          inputRef.current?.blur();
        }
      }
    },
    [localQuery, handleClear]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const totalCount = ALL_CROWS_NEST_ITEMS.length;

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={localQuery}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Search items... (press "/" to focus)'
          className="pl-9 pr-8 h-9 text-sm"
          aria-label="Search Crow's Nest items"
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap" aria-live="polite">
        {filteredCount} of {totalCount}
      </span>
    </div>
  );
}
