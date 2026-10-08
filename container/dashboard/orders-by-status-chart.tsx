"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      (data ?? []).map((item, index) => [
        item.status ?? "UNKNOWN",
        {
          label: item.status ?? "UNKNOWN",
          color: `var(--chart-${(index % 5) + 1})`,
        },
      ]),
    ) satisfies ChartConfig;
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <CardDescription>
          Distribution of orders by their current status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="status"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
