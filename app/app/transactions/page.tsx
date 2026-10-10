"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  getOrderOptions,
  getPaymentsTransactionsOptions,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionsTable } from "@/container/transactions/transactions-table";

const statusTabs = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESSFULL", label: "Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export default function TransactionsPage() {
  const { selectedStoreId } = useSelectedStore();
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  const { data: orders } = useQuery({
    ...getOrderOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const storeOrderIds = useMemo(
    () => new Set((orders ?? []).map((order) => order.id)),
    [orders],
  );

  const { data, isPending } = useQuery({
    ...getPaymentsTransactionsOptions({ query: { limit: 500 } }),
    enabled: !!selectedStoreId,
  });

  const allTransactions = useMemo(
    () =>
      (data ?? []).filter(
        (tx) => tx.orderId != null && storeOrderIds.has(tx.orderId),
      ),
    [data, storeOrderIds],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of allTransactions) {
      const status = tx.status ?? "unknown";
      map[status] = (map[status] || 0) + 1;
    }
    return map;
  }, [allTransactions]);

  const transactions = useMemo(() => {
    let filtered = allTransactions;
    if (statusTab !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          String(tx.id).includes(q) ||
          tx.transactionId?.toLowerCase().includes(q) ||
          String(tx.orderId).includes(q) ||
          tx.method?.name?.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [allTransactions, statusTab, search]);

  return (
    <div className="p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View payments received for your store orders
        </p>
      </div>
      <div className="flex items-start gap-4 mt-8">
        <Tabs value={statusTab} onValueChange={setStatusTab} className="flex-1">
          <TabsList className="h-auto flex-wrap gap-1 p-2">
            {statusTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs gap-1.5"
              >
                {tab.label}
                <span className="inline-flex items-center justify-center size-4 rounded-full bg-muted-foreground/15 text-[10px] font-medium leading-none tabular-nums">
                  {tab.value === "all"
                    ? allTransactions.length
                    : counts[tab.value] || 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        </div>
      </div>
      <TransactionsTable transactions={transactions} isPending={isPending} />
    </div>
  );
}
