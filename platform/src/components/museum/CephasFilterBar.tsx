import { useState } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentType, Depth } from "@/hooks/useCephasMuseum";

const CONTENT_TYPES: Array<{ id: ContentType; label: string; color: string }> = [
  { id: "all", label: "All", color: "#94a3b8" },
  { id: "pudding", label: "Puddings", color: "#10b981" },
  { id: "paper", label: "Papers", color: "#8b5cf6" },
  { id: "article", label: "Articles", color: "#3b82f6" },
  { id: "letter", label: "Letters", color: "#f59e0b" },
  { id: "innovation", label: "Innovations", color: "#ef4444" },
];

interface CephasFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  contentType: ContentType;
  onContentTypeChange: (v: ContentType) => void;
  domain: string;
  onDomainChange: (v: string) => void;
  domains: string[];
  depthLabel?: string;
  depthColor?: string;
}

export function CephasFilterBar({
  search,
  onSearchChange,
  contentType,
  onContentTypeChange,
  domain,
  onDomainChange,
  domains,
  depthLabel,
  depthColor = "#94a3b8",
}: CephasFilterBarProps) {
  const [showDomains, setShowDomains] = useState(false);

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder={`Search ${depthLabel ? depthLabel.toLowerCase() : "all content"}...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content type chips */}
      <div className="flex flex-wrap gap-1.5">
        {CONTENT_TYPES.map((ct) => {
          const active = contentType === ct.id;
          return (
            <button
              key={ct.id}
              onClick={() => onContentTypeChange(ct.id)}
              className="text-[0.65rem] uppercase tracking-wider font-mono px-2.5 py-1 rounded-full transition-all"
              style={{
                color: active ? "#0a1628" : ct.color,
                background: active ? ct.color : `${ct.color}12`,
                border: `1px solid ${active ? ct.color : `${ct.color}30`}`,
                fontWeight: active ? 700 : 500,
              }}
            >
              {ct.label}
            </button>
          );
        })}
      </div>

      {/* Domain filter (collapsible) */}
      {domains.length > 0 && (
        <div>
          <button
            onClick={() => setShowDomains(!showDomains)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Filter className="w-3 h-3" />
            <span>Domain{domain !== "all" ? `: ${domain}` : ""}</span>
            <ChevronDown
              className="w-3 h-3 transition-transform"
              style={{ transform: showDomains ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <AnimatePresence>
            {showDomains && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1 mt-2">
                  <button
                    onClick={() => { onDomainChange("all"); setShowDomains(false); }}
                    className="text-[0.6rem] px-2 py-0.5 rounded-full transition-all"
                    style={{
                      color: domain === "all" ? "#0a1628" : "#94a3b8",
                      background: domain === "all" ? "#94a3b8" : "rgba(148,163,184,0.1)",
                      border: "1px solid rgba(148,163,184,0.2)",
                    }}
                  >
                    All domains
                  </button>
                  {domains.map((d) => (
                    <button
                      key={d}
                      onClick={() => { onDomainChange(d); setShowDomains(false); }}
                      className="text-[0.6rem] px-2 py-0.5 rounded-full transition-all capitalize"
                      style={{
                        color: domain === d ? "#0a1628" : depthColor,
                        background: domain === d ? depthColor : `${depthColor}12`,
                        border: `1px solid ${domain === d ? depthColor : `${depthColor}25`}`,
                      }}
                    >
                      {d.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
