"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Activity, Users } from "lucide-react";
import {
  getOrderOptions,
  getUserOptions,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { StatCard } from "@/container/dashboard/stat-card";
import { SalesStatsCard } from "@/container/dashboard/sales-stats-card";

export default function AppDashboard() {
  const { selectedStoreId } = useSelectedStore();

  const { data: user } = useQuery({
    ...getUserOptions(),
  });

  const { data: ordersData } = useQuery({
    ...getOrderOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
  });

  const allOrders = ordersData ?? [];

  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const activeOrders = allOrders.filter(
      (o) => o.orderStatus !== "COMPLETED" && o.orderStatus !== "CANCELLED",
    ).length;
    const uniqueCustomers = new Set(
      allOrders.map((o) => o.user?.id).filter(Boolean),
    ).size;

    return { totalOrders, activeOrders, uniqueCustomers };
  }, [allOrders]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap gap-4">
        <SalesStatsCard orders={allOrders} />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          iconClassName="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Active Orders"
          value={stats.activeOrders}
          description="Not completed or cancelled"
          icon={Activity}
          iconClassName="bg-indigo-100 text-indigo-700"
        />
        <StatCard
          title="Customers"
          value={stats.uniqueCustomers}
          icon={Users}
          iconClassName="bg-sky-100 text-sky-700"
        />
      </div>
    </div>
  );
}
