import { CurrencySummaryCard } from "./CurrencySummaryCard";
import { CurrencySummary, WalletCurrency } from "./types";

type CurrencyHierarchyRowProps = {
  summaries: Record<WalletCurrency, CurrencySummary>;
  marksDetailLine: string;
  selectedCurrency: WalletCurrency;
  onSelectCurrency: (currency: WalletCurrency) => void;
  creditsAnchorProps?: Record<string, string>;
};

export function CurrencyHierarchyRow({
  summaries,
  marksDetailLine,
  selectedCurrency,
  onSelectCurrency,
  creditsAnchorProps,
}: CurrencyHierarchyRowProps) {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <CurrencySummaryCard
        currency="credits"
        balance={summaries.credits.balance}
        roleLabel={summaries.credits.roleLabel}
        lastTransaction={summaries.credits.lastTransaction}
        isSelected={selectedCurrency === "credits"}
        onSelect={() => onSelectCurrency("credits")}
        className="lg:col-span-6"
        anchorProps={creditsAnchorProps}
      />

      <CurrencySummaryCard
        currency="marks"
        balance={summaries.marks.balance}
        roleLabel={summaries.marks.roleLabel}
        lastTransaction={summaries.marks.lastTransaction}
        detailLine={marksDetailLine}
        isSelected={selectedCurrency === "marks"}
        onSelect={() => onSelectCurrency("marks")}
        className="lg:col-span-4"
      />

      <CurrencySummaryCard
        currency="joules"
        balance={summaries.joules.balance}
        roleLabel={summaries.joules.roleLabel}
        lastTransaction={summaries.joules.lastTransaction}
        isSelected={selectedCurrency === "joules"}
        onSelect={() => onSelectCurrency("joules")}
        className="lg:col-span-2"
      />
    </section>
  );
}
