"use client";

import { useSelectedStore } from "@/stores/selected-store";
import { StatCard } from "@/container/dashboard/stat-card";
import { SalesStatsCard } from "@/container/dashboard/sales-stats-card";
import { useQuery } from "@tanstack/react-query";
import {
  getStatsCustomersOptions,
  getStatsOrdersOptions,
} from "@/queries/@tanstack/react-query.gen";

export default function AppDashboard() {
  const { selectedStoreId } = useSelectedStore();
  const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
    ...getStatsOrdersOptions({
      query: { storeId: selectedStoreId ?? undefined },      
    }),
    enabled: !!selectedStoreId,    
  });
  const { data: inProgressResponse, isLoading: isLoadingInProgress } = useQuery(
    {
      ...getStatsOrdersOptions({
        query: {
          storeId: selectedStoreId ?? undefined,
          status: [
            "IN_PROGRESS",
            "PENDING",
            "READY_FOR_DELIVERY",
            "OUT_FOR_DELIVERY",
            "READY_FOR_PICKUP",
          ],
        },
      }),
      enabled: !!selectedStoreId,
      
    },
  );
  const { isLoading: isLoadingCustomers, data: customersResponse } = useQuery({
    ...getStatsCustomersOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap gap-4">
        <SalesStatsCard />
        <StatCard
          title="Total Orders"
          value={statsResponse?.totalOrders ?? 0}
          href="/app/orders"
          trend={statsResponse?.delta}
          loading={isLoadingStats}
        />
        <StatCard
          title="Active Orders"
          value={inProgressResponse?.totalOrders ?? 0}
          href="/app/orders"
          trend={inProgressResponse?.delta ?? 0}
          loading={isLoadingInProgress}
        />
        <StatCard
          title="Customers"
          value={customersResponse?.totalCustomers ?? 0}
          href="/app/customers"
          loading={isLoadingCustomers}
          trend={customersResponse?.delta ?? 0}
        />
      </div>
    </div>
  );
}
