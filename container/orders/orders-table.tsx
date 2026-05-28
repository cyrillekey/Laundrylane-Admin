"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderItem {
  id?: number;
  date?: string;
  orderStatus?: string;
  orderType?: string;
  total?: number;
  itemsCount?: number;
  createdat?: string;
  user?: {
    id?: number;
    name?: string | null;
    email?: string;
  };
}

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

const typeStyles: Record<string, string> = {
  PICKUP: "bg-sky-100 text-sky-700",
  DELIVERY: "bg-violet-100 text-violet-700",
  PICKUP_AND_DELIVERY: "bg-teal-100 text-teal-700",
};

interface OrdersTableProps {
  orders: OrderItem[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    {order.user?.name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        statusStyles[order.orderStatus ?? ""],
                      )}
                    >
                      {statusLabels[order.orderStatus ?? ""] ??
                        order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-block rounded px-1.5 py-0.5 text-xs font-medium",
                        typeStyles[order.orderType ?? ""],
                      )}
                    >
                      {order.orderType === "PICKUP_AND_DELIVERY"
                        ? "Pickup & Delivery"
                        : order.orderType
                          ? order.orderType.charAt(0) +
                            order.orderType.slice(1).toLowerCase()
                          : "—"}
                    </span>
                  </TableCell>
                  <TableCell>{order.itemsCount ?? "—"}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
