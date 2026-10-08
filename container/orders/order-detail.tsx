"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileText, Printer, XCircle } from "lucide-react";
import {
  getOrderByIdOptions,
  getOrderByIdQueryKey,
  putOrderByIdStatusMutation,
  putOrderByIdCancelMutation,
  postOrderByIdInvoiceMutation,
  postOrderByIdPackingSlipMutation,
} from "@/queries/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  READY_FOR_PAYMENT: "Ready for Payment",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
};

const paymentStatusStyles: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700 border-gray-200",
  READY_FOR_PAYMENT: "bg-amber-100 text-amber-700 border-amber-200",
  PARTIALLY_PAID: "bg-blue-100 text-blue-700 border-blue-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface OrderDetailProps {
  id: number;
}

const statusFlow: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["READY_FOR_PICKUP", "READY_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_DELIVERY: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function OrderDetail({ id }: OrderDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: order, isPending } = useQuery({
    ...getOrderByIdOptions({ path: { id } }),
    enabled: !!id,
  });

  const { mutateAsync: updateStatus, isPending: updatingStatus } = useMutation({
    ...putOrderByIdStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOrderByIdQueryKey({ path: { id } }) });
      setNewStatus("");
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to update status" });
    },
  });

  const { mutateAsync: cancelOrder, isPending: cancelling } = useMutation({
    ...putOrderByIdCancelMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getOrderByIdQueryKey({ path: { id } }) });
      setCancelOpen(false);
      toast.success("Order cancelled");
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to cancel order" });
    },
  });

  const { mutateAsync: generateInvoice, isPending: generatingInvoice } = useMutation({
    ...postOrderByIdInvoiceMutation(),
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Invoice generated");
      }
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to generate invoice" });
    },
  });

  const { mutateAsync: generatePackingSlip, isPending: generatingSlip } = useMutation({
    ...postOrderByIdPackingSlipMutation(),
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Packing slip generated");
      }
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to generate packing slip" });
    },
  });

  if (isPending) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Order not found
      </div>
    );
  }

  const currentStatus = order.orderStatus ?? "PENDING";
  const nextStatuses = statusFlow[currentStatus] ?? [];
  const canCancel = currentStatus !== "CANCELLED" && currentStatus !== "COMPLETED";

  const userInitials = order.user?.name
    ? order.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : order.user?.email?.slice(0, 2).toUpperCase() ?? "—";

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Order #{order.id}
            </h1>
            <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[currentStatus])}>
              {statusLabels[currentStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {order.createdat ? new Date(order.createdat).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {nextStatuses.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={newStatus} onValueChange={(val) => {
                if (val === "CANCELLED") {
                  setCancelOpen(true);
                  setNewStatus("");
                } else {
                  updateStatus({ path: { id }, body: { status: val as any } });
                }
              }}>
                <SelectTrigger size="sm" className="w-44">
                  <SelectValue placeholder="Update Status..." />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button variant="outline" size="sm" disabled={generatingSlip} onClick={() => generatePackingSlip({ path: { id } })}>
            <Printer className="size-4" />
            Packing Slip
          </Button>
          <Button variant="outline" size="sm" disabled={generatingInvoice} onClick={() => generateInvoice({ path: { id } })}>
            <FileText className="size-4" />
            Invoice
          </Button>
          {canCancel && (
            <Button variant="outline" size="sm" onClick={() => setCancelOpen(true)}>
              <XCircle className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{order.user?.name ?? "—"}</p>
                {order.user?.email && (
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                )}
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              {order.user?.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{order.user.phone}</span>
                </div>
              )}
              {order.user?.role && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="capitalize">{order.user.role.replace(/_/g, " ").toLowerCase()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">
                {order.orderType === "PICKUP_AND_DELIVERY"
                  ? "Pickup & Delivery"
                  : order.orderType?.toLowerCase() ?? "—"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment</span>
              <Badge variant="outline" className={cn("text-xs font-medium", paymentStatusStyles[order.paymentStatus ?? "PENDING"])}>
                {paymentStatusLabels[order.paymentStatus ?? "PENDING"]}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span>{order.itemsCount ?? order.items?.length ?? 0}</span>
            </div>
            <Separator />
            {order.washType && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wash Type</span>
                  <span className="capitalize">{order.washType.toLowerCase()}</span>
                </div>
                <Separator />
              </>
            )}
            {order.weight != null && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span>{order.weight} kg</span>
                </div>
                <Separator />
              </>
            )}
            {order.pickupDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup Date</span>
                <span>{new Date(order.pickupDate).toLocaleDateString()}</span>
              </div>
            )}
            {order.deliveryWindow && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Window</span>
                <span>{order.deliveryWindow}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.product?.name ?? "Item"} x{item.quantity ?? 1}
                  </span>
                  <span>KES {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>KES {(order.deliveryFee ?? 0).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span>KES {(order.total ?? 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.items && order.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{item.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{item.product?.type?.toLowerCase() ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{item.quantity ?? 1}</td>
                    <td className="px-4 py-3 text-right">KES {(item.price ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">KES {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {order.deliveryZone && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zone</span>
              <span>{order.deliveryZone.name ?? "—"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span>{order.deliveryZone.location ?? "—"}</span>
            </div>
            {order.instructions && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground block mb-1">Instructions</span>
                  <p className="text-foreground">{order.instructions}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {order.statuses && order.statuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...order.statuses].reverse().map((status, index) => (
                <div key={status.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "size-2.5 rounded-full mt-1.5 ring-2",
                      status.status === "CANCELLED" ? "bg-red-500 ring-red-200" :
                      status.status === "COMPLETED" ? "bg-emerald-500 ring-emerald-200" :
                      "bg-primary ring-primary/20"
                    )} />
                    {index < order.statuses!.length - 1 && (
                      <div className="w-px flex-1 bg-border min-h-4" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{statusLabels[status.status ?? ""] ?? status.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {status.createdat ? new Date(status.createdat).toLocaleString() : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <XCircle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order #{order.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling} variant="outline">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelling}
              onClick={() => cancelOrder({ path: { id } })}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
