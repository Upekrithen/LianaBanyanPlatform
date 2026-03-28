/**
 * MapControls — floating control panel for Ghost World map.
 * Zoom +/−, fit-all, search input, category filter dropdown.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ZoomIn, ZoomOut, Maximize2, Search, Menu, X } from 'lucide-react';

interface MapControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'general', label: 'General' },
  { value: 'maker', label: 'Maker' },
  { value: 'food', label: 'Food' },
  { value: 'service', label: 'Service' },
];

export default function MapControls({ search, onSearchChange, category, onCategoryChange }: MapControlsProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const zoomIn = () => (window as any).__ghostWorldZoom?.(0.8);
  const zoomOut = () => (window as any).__ghostWorldZoom?.(1.25);
  const fitAll = () => (window as any).__ghostWorldFitAll?.();

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden absolute top-16 right-3 z-30 p-2 rounded-lg bg-slate-800/80 backdrop-blur border border-slate-700"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-slate-300" /> : <Menu className="w-5 h-5 text-slate-300" />}
      </button>

      {/* Control panel */}
      <div className={`absolute top-16 right-3 z-30 flex flex-col gap-2 p-3 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700 shadow-lg transition-all
        ${mobileOpen ? 'opacity-100 translate-y-0' : 'max-md:opacity-0 max-md:pointer-events-none max-md:-translate-y-2'}
        md:opacity-100 md:pointer-events-auto md:translate-y-0`}
      >
        {/* Zoom buttons */}
        <div className="flex gap-1.5">
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700" onClick={zoomIn} title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700" onClick={zoomOut} title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-700" onClick={fitAll} title="Fit all">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search storefronts..."
            className="pl-7 h-8 text-xs bg-slate-900/60 border-slate-600 text-slate-200 placeholder:text-slate-500 w-44"
          />
        </div>

        {/* Category filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-8 text-xs bg-slate-900/60 border-slate-600 text-slate-200 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value} className="text-xs text-slate-200">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
