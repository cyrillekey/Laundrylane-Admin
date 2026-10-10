"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getOrderOptions } from "@/queries/@tanstack/react-query.gen";
import type { GetOrderResponse } from "@/queries/types.gen";
import { useSelectedStore } from "@/stores/selected-store";

type RecentOrder = GetOrderResponse[number];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
  READY_FOR_PICKUP: "bg-blue-100 text-blue-700 border-blue-200",
  READY_FOR_DELIVERY: "bg-blue-100 text-blue-700 border-blue-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  READY_FOR_PICKUP: "Ready for Pickup",
  READY_FOR_DELIVERY: "Ready for Delivery",
  OUT_FOR_DELIVERY: "Out for Delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function CustomerCell({ order }: { order: RecentOrder }) {
  const name = order.user?.name;
  const email = order.user?.email;
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (email?.slice(0, 2).toUpperCase() ?? "—");
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {name ?? <span className="text-muted-foreground">—</span>}
        </span>
        {email && (
          <span className="text-xs text-muted-foreground">{email}</span>
        )}
      </div>
    </div>
  );
}

export function RecentOrdersTable() {
  const { selectedStoreId } = useSelectedStore();
  const { data, isLoading } = useQuery({
    ...getOrderOptions({
      query: {
        storeId: selectedStoreId ?? undefined,
        ongoing: true,
        limit: 10,
        order_by: "createdat",
      },
    }),
    enabled: !!selectedStoreId,
  });

  const orders = useMemo(
    () =>
      [...(data ?? [])]
        .sort(
          (a, b) =>
            new Date(b.createdat ?? 0).getTime() -
            new Date(a.createdat ?? 0).getTime(),
        )
        .slice(0, 10),
    [data],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="mt-1 h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Recent Open Orders</CardTitle>
          <CardDescription>
            The 10 most recent orders still in progress.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/orders">
            View All
            <ArrowUpRight className="size-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-6">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No open orders
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const status = order.orderStatus ?? "";
                return (
                  <TableRow key={order.id}>
                    <TableCell className="ps-6 font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell>
                      <CustomerCell order={order} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          statusStyles[status],
                        )}
                      >
                        {statusLabels[status] ?? status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.total != null
                        ? `KES ${order.total.toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.createdat
                        ? new Date(order.createdat).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
