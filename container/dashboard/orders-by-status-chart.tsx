"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getStatsOrdersByStatusOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  READY_FOR_PICKUP: "Ready for Pickup",
  READY_FOR_DELIVERY: "Ready for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function formatStatusLabel(status: string) {
  return (
    statusLabels[status] ??
    status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  );
}

export function OrdersByStatusChart() {
  const { selectedStoreId } = useSelectedStore();
  const { data, isLoading } = useQuery({
    ...getStatsOrdersByStatusOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const chartData = useMemo(
    () =>
      (data ?? []).map((item, index) => ({
        status: item.status ?? "UNKNOWN",
        total: item.total ?? 0,
        fill: `var(--chart-${(index % 5) + 1})`,
      })),
    [data],
  );

  const chartConfig = useMemo(() => {
    return Object.fromEntries(
      (data ?? []).map((item, index) => {
        const status = item.status ?? "UNKNOWN";
        return [
          status,
          {
            label: formatStatusLabel(status),
            color: `var(--chart-${(index % 5) + 1})`,
          },
        ];
      }),
    ) satisfies ChartConfig;
  }, [data]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="mx-auto mt-2 h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>
          Distribution of orders by their current status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="status"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={
                <ChartLegendContent
                  nameKey="status"
                  className="flex-wrap gap-x-4 gap-y-2"
                />
              }
            />
          </PieChart>
        </ChartContainer>
        <p className="mt-[3px] text-center text-xs text-muted-foreground"></p>
      </CardContent>
    </Card>
  );
}
