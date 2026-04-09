import { BillCard } from "./BillCard";
import { BillItem } from "./types";

type ActiveBillsListProps = {
  bills: BillItem[];
  selectedBillId: string | null;
  onSelectBill: (billId: string) => void;
};

export function ActiveBillsList({ bills, selectedBillId, onSelectBill }: ActiveBillsListProps) {
  return (
    <section className="space-y-3" data-xray-id="political-expedition-active-bills-list">
      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active bills matched this issue yet.</p>
      ) : (
        bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} active={bill.id === selectedBillId} onSelect={onSelectBill} />
        ))
      )}
    </section>
  );
}
