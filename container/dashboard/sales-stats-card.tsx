"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AuthenticationService from "@/services/tokenService";

interface SalesStatsCardProps {
  orders: { total?: number; createdat?: string }[];
}

export function SalesStatsCard({ orders }: SalesStatsCardProps) {
  const { thisMonthSales, salesTrend } = useMemo(() => {
    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthOrders = orders.filter((o) => {
      const d = o.createdat ? new Date(o.createdat) : null;
      return d && d >= thisMonthStart;
    });

    const lastMonthOrders = orders.filter((o) => {
      const d = o.createdat ? new Date(o.createdat) : null;
      return d && d >= lastMonthStart && d < thisMonthStart;
    });

    const thisMonthSales = thisMonthOrders.reduce(
      (sum, o) => sum + (o.total ?? 0),
      0,
    );
    const lastMonthSales = lastMonthOrders.reduce(
      (sum, o) => sum + (o.total ?? 0),
      0,
    );

    const salesTrend =
      lastMonthSales > 0
        ? ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
        : thisMonthSales > 0
          ? 100
          : null;

    return { thisMonthSales, salesTrend: 12 };
  }, [orders]);
  const user = AuthenticationService.getUser();
  const isTrendPositive = salesTrend != null && salesTrend >= 0;
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <Card className="flex-1 min-w-0 md:flex-[1.5] bg-muted/50 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-1/3 h-full pointer-events-none" aria-hidden>
        <div className="relative w-full h-full">
          <div className="absolute top-[8%] right-[15%] size-2.5 rounded-full bg-amber-400" />
          <div className="absolute top-[25%] right-[5%] size-2 rounded-full bg-sky-400" />
          <div className="absolute top-[35%] right-[35%] size-2.5 rounded-full bg-emerald-400" />
          <div className="absolute top-[5%] right-[40%] size-1.5 rounded-full bg-pink-400" />
          <div className="absolute top-[18%] right-[25%] size-2 rounded-full bg-violet-400" />
          <div className="absolute top-[42%] right-[15%] size-1.5 rounded-full bg-orange-400" />
          <div className="absolute top-[12%] right-[50%] size-1.5 rounded-full bg-rose-400" />
          <div className="absolute top-[30%] right-[45%] size-1 rounded-full bg-cyan-400" />
          <div className="absolute top-[48%] right-[25%] size-2 rounded-full bg-yellow-400" />
          <div className="absolute top-[3%] right-[20%] size-1.5 rounded-full bg-lime-400" />
          <div className="absolute top-[20%] right-[55%] size-1 rounded-full bg-fuchsia-400" />
          <div className="absolute top-[38%] right-[8%] size-1.5 rounded-full bg-amber-300" />
        </div>
      </div>
      <CardContent className="px-6 py-2 flex flex-col gap-5 justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold">
              Congratulations {firstName}!🎉
            </span>
            <span className="text-sm text-muted-foreground">
              This month total sales
            </span>
          </div>
          <div className="flex flex-row justify-between items-end content-end">
            <div className="flex flex-col gap-0">
              <span className="text-2xl font-semibold tracking-tight">
                KES {thisMonthSales.toLocaleString()}
              </span>
              <div className="flex items-center ">
                {salesTrend != null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-sm font-medium",
                      isTrendPositive ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {isTrendPositive ? "+" : "-"}
                    {Math.abs(salesTrend).toFixed(1)}%
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/app/orders">
                View Orders
                <ArrowUpRight className="size-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
