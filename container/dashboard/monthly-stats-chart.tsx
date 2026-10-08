"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getStatsMonthlyOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";

function formatMonth(value?: string) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
    return date.toLocaleDateString(undefined, { month: "short" });
  }
  return value;
}

const chartConfig = {
  totalSales: {
    label: "Total Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function MonthlyStatsChart() {
  const { selectedStoreId } = useSelectedStore();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data, isLoading } = useQuery({
    ...getStatsMonthlyOptions({
      query: { storeId: selectedStoreId ?? undefined, year },
    }),
    enabled: !!selectedStoreId,
  });

  const chartData = useMemo(
    () =>
      [...(data ?? [])].map((item) => ({
        month: formatMonth(item.month),
        totalSales: item.totalSales ?? 0,
      })),
    [data],
  );

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
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>
            Total sales by month for the selected store and year.
          </CardDescription>
        </div>
        <NativeSelect
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-28"
        >
          {[
            currentYear,
            currentYear - 1,
            currentYear - 2,
            currentYear - 3,
            currentYear - 4,
          ].map((option) => (
            <NativeSelectOption key={option} value={String(option)}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={chartData} margin={{ left: 0, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={60}
              tickFormatter={(value) => Number(value).toLocaleString()}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="var(--color-totalSales)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <p className="mt-2 text-center text-xs text-muted-foreground">Month</p>
      </CardContent>
    </Card>
  );
}
