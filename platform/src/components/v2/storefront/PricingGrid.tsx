import { Info } from "lucide-react";
import { ProductDraft } from "@/components/v2/storefront/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type PricingGridProps = {
  products: ProductDraft[];
};

export function PricingGrid({ products }: PricingGridProps) {
  if (products.length === 0) {
    return <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Import products before setting pricing.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cooperative Pricing Grid</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Suggested (Cost+20%)</TableHead>
            <TableHead>Take-Home (83.3%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const suggested = product.cost * 1.2;
            const takeHome = suggested * 0.833;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.cost.toFixed(2)}</TableCell>
                <TableCell>${suggested.toFixed(2)}</TableCell>
                <TableCell>${takeHome.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Cooperative pricing: 20% above cost covers operations. Creator keeps 83.3% of the transaction.
        </AlertDescription>
      </Alert>
    </div>
  );
}
