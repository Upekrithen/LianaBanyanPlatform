import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KitComparisonView() {
  const rows = [
    { label: "Best for", gravity: "Foundational casting workflows", thermoplastic: "Frequent thermoplastic runs", complete: "Mixed materials and larger ambitions" },
    { label: "Typical output", gravity: "Reliable small-batch cast parts", thermoplastic: "Stronger molded pieces", complete: "Flexible production setups" },
    { label: "Price", gravity: "$249", thermoplastic: "$329", complete: "$499" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kit comparison view</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3">Dimension</th>
                <th className="py-2 pr-3">Gravity</th>
                <th className="py-2 pr-3">Thermoplastic</th>
                <th className="py-2">Complete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-medium">{row.label}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.gravity}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.thermoplastic}</td>
                  <td className="py-2 text-muted-foreground">{row.complete}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 md:hidden">
          {[
            { name: "Gravity", price: "$249", note: "Foundational casting workflows." },
            { name: "Thermoplastic", price: "$329", note: "Frequent thermoplastic production." },
            { name: "Complete", price: "$499", note: "Mixed materials and broader shop scope." },
          ].map((kit) => (
            <div key={kit.name} className="rounded-lg border p-3">
              <p className="font-medium">{kit.name} · {kit.price}</p>
              <p className="text-sm text-muted-foreground">{kit.note}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
