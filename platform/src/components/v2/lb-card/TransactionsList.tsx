import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LbCardTransaction } from "./types";
import { TransactionRow } from "./TransactionRow";

type TransactionsListProps = {
  transactions: LbCardTransaction[];
};

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card data-xray-id="lb-card-transactions-list">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No card transactions yet.
          </div>
        ) : (
          transactions.map((txn) => (
            <TransactionRow
              key={txn.id}
              transaction={txn}
              expanded={expandedId === txn.id}
              onToggleExpanded={() => setExpandedId((current) => (current === txn.id ? null : txn.id))}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
