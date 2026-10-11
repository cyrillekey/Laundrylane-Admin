"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getOrderOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdersTable } from "@/container/orders/orders-table";
import OrdersStatisticsCard from "@/container/orders/orders-stats-card";

const allStatusTabs = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const activeStatusTabs = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "READY_FOR_DELIVERY", label: "Ready for Delivery" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
] as const;

const historyStatusTabs = [
  { value: "all", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const ongoing =
    statusParam === "history"
      ? false
      : statusParam === "active"
        ? true
        : undefined;

  const { selectedStoreId } = useSelectedStore();
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");

  const statusTabs =
    statusParam === "history"
      ? historyStatusTabs
      : statusParam === "active"
        ? activeStatusTabs
        : allStatusTabs;

  useEffect(() => {
    setStatusTab("all");
  }, [statusParam]);

  const { data } = useQuery({
    ...getOrderOptions({
      query: { storeId: selectedStoreId ?? undefined, ongoing },
    }),
    // enabled: !!selectedStoreId,
  });

  const allOrders = data ?? [];

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of allOrders) {
      const status = item.orderStatus ?? "unknown";
      map[status] = (map[status] || 0) + 1;
    }
    return map;
  }, [allOrders]);

  const orders = useMemo(() => {
    let filtered = allOrders;
    if (statusTab !== "all") {
      filtered = filtered.filter((item) => item.orderStatus === statusTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          String(item.id).includes(q) ||
          item.user?.name?.toLowerCase().includes(q) ||
          item.user?.email?.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [allOrders, statusTab, search]);

  return (
    <div className="p-8 space-y-4">
      <OrdersStatisticsCard />
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
                    ? allOrders.length
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
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
        </div>
      </div>
      <OrdersTable
        key={statusParam ?? "all"}
        orders={orders}
        title={
          statusParam === "history"
            ? "Order History"
            : statusParam === "active"
              ? "Active Orders"
              : "All Orders"
        }
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-muted-foreground">
          Loading orders...
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}
