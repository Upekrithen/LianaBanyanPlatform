import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductImportTable } from "@/components/v2/storefront/ProductImportTable";
import { ImportSource, ProductDraft } from "@/components/v2/storefront/types";

const SAMPLE_PRODUCTS: Record<ImportSource, ProductDraft[]> = {
  start_fresh: [
    { id: "sf-1", name: "Starter Item A", sku: "START-001", cost: 12.5, quantity: 24, source: "start_fresh" },
    { id: "sf-2", name: "Starter Item B", sku: "START-002", cost: 7.75, quantity: 40, source: "start_fresh" },
  ],
  etsy: [
    { id: "et-1", name: "Etsy Listing One", sku: "ETSY-101", cost: 18.2, quantity: 12, source: "etsy" },
    { id: "et-2", name: "Etsy Listing Two", sku: "ETSY-102", cost: 9.9, quantity: 28, source: "etsy" },
    { id: "et-3", name: "Etsy Listing Three", sku: "ETSY-103", cost: 14.45, quantity: 16, source: "etsy" },
  ],
  shopify: [
    { id: "sh-1", name: "Shopify Product One", sku: "SHOP-201", cost: 21.0, quantity: 8, source: "shopify" },
    { id: "sh-2", name: "Shopify Product Two", sku: "SHOP-202", cost: 11.35, quantity: 22, source: "shopify" },
  ],
};

type InventoryImportTabsProps = {
  importSource: ImportSource;
  products: ProductDraft[];
  onImportSourceChange: (source: ImportSource) => void;
  onProductsChange: (products: ProductDraft[]) => void;
};

export function InventoryImportTabs({
  importSource,
  products,
  onImportSourceChange,
  onProductsChange,
}: InventoryImportTabsProps) {
  const sourceProducts = useMemo(
    () => products.filter((product) => product.source === importSource),
    [products, importSource],
  );

  const loadStubData = (source: ImportSource) => {
    const retained = products.filter((product) => product.source !== source);
    const seed = SAMPLE_PRODUCTS[source].map((product) => ({ ...product, id: `${product.id}-${crypto.randomUUID()}` }));
    onProductsChange([...retained, ...seed]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Import Inventory</h2>
      <Tabs value={importSource} onValueChange={(value) => onImportSourceChange(value as ImportSource)}>
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="start_fresh">Start Fresh</TabsTrigger>
          <TabsTrigger value="etsy">Connect Etsy</TabsTrigger>
          <TabsTrigger value="shopify">Connect Shopify</TabsTrigger>
        </TabsList>

        <TabsContent value="start_fresh" className="space-y-3">
          <p className="text-sm text-muted-foreground">Create a baseline catalog now. You can sync live connectors later.</p>
          <Button type="button" variant="outline" onClick={() => loadStubData("start_fresh")}>
            Load Starter Rows
          </Button>
          <ProductImportTable products={sourceProducts} />
        </TabsContent>

        <TabsContent value="etsy" className="space-y-3">
          <p className="text-sm text-muted-foreground">Etsy OAuth is in stub mode for this milestone.</p>
          <Button type="button" variant="outline" onClick={() => loadStubData("etsy")}>
            Load Etsy Stub Data
          </Button>
          <ProductImportTable products={sourceProducts} />
        </TabsContent>

        <TabsContent value="shopify" className="space-y-3">
          <p className="text-sm text-muted-foreground">Shopify OAuth is in stub mode for this milestone.</p>
          <Button type="button" variant="outline" onClick={() => loadStubData("shopify")}>
            Load Shopify Stub Data
          </Button>
          <ProductImportTable products={sourceProducts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
