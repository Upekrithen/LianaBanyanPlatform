import { ProductDraft } from "@/components/v2/storefront/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ProductImportTableProps = {
  products: ProductDraft[];
};

export function ProductImportTable({ products }: ProductImportTableProps) {
  if (products.length === 0) {
    return <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No products in this source yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Qty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>${product.cost.toFixed(2)}</TableCell>
            <TableCell>{product.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
