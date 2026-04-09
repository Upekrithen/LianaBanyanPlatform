import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { MarketplaceFilters } from "./types";
import { FilterControls } from "./FilterControls";

type FilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MarketplaceFilters;
  onChange: (next: MarketplaceFilters) => void;
};

export function FilterDrawer({ open, onOpenChange, filters, onChange }: FilterDrawerProps) {
  return (
    <>
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(true)}>
          Filters
        </Button>
      </div>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <FilterControls filters={filters} onChange={onChange} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
