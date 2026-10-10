"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Banknote,
  Check,
  Clock,
  CreditCard,
  FileText,
  Package,
  PackageCheck,
  Printer,
  RefreshCw,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getCatalogOptions,
  getOrderByIdOptions,
  getOrderByIdQueryKey,
  getPaymentsTransactionsOptions,
  getStoreByIdOptions,
  putOrderByIdStatusMutation,
  putOrderByIdCancelMutation,
  postOrderByIdInvoiceMutation,
  postOrderByIdPackingSlipMutation,
} from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn, getInitials } from "@/lib/utils";
import { OrderProgressTracker } from "@/container/orders/order-progress-tracker";

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

const transactionStatusLabels: Record<string, string> = {
  PENDING: "Pending",
  FAILED: "Failed",
  SUCCESSFULL: "Successful",
  CANCELLED: "Cancelled",
};

const transactionStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  SUCCESSFULL: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
};

const paymentMethodLabels: Record<string, string> = {
  MOBILE: "Mobile",
  CARD: "Card",
  CASH: "Cash",
  OFFLINE: "Offline",
};

const paymentMethodIcons: Record<string, LucideIcon> = {
  MOBILE: Smartphone,
  CARD: CreditCard,
  CASH: Banknote,
  OFFLINE: FileText,
};

const statusStepIcons: Record<string, LucideIcon> = {
  PENDING: Clock,
  IN_PROGRESS: RefreshCw,
  READY_FOR_PICKUP: ShoppingBag,
  READY_FOR_DELIVERY: PackageCheck,
  OUT_FOR_DELIVERY: Truck,
  COMPLETED: Check,
  CANCELLED: X,
};

const statusStepStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  READY_FOR_PICKUP: "bg-blue-100 text-blue-700 ring-blue-200",
  READY_FOR_DELIVERY: "bg-blue-100 text-blue-700 ring-blue-200",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700 ring-purple-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-100 text-red-700 ring-red-200",
};

interface OrderDetailProps {
  id: number;
}

export function OrderDetail({ id }: OrderDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: order, isPending } = useQuery({
    ...getOrderByIdOptions({ path: { id } }),
    enabled: !!id,
  });

  const { selectedStoreId } = useSelectedStore();
  const { data: storeDetails, isPending: storePending } = useQuery({
    ...getStoreByIdOptions({ path: { id: selectedStoreId ?? 0 } }),
    enabled: selectedStoreId != null,
  });

  const { data: catalog } = useQuery({
    ...getCatalogOptions({ query: { storeId: selectedStoreId ?? undefined } }),
    enabled: selectedStoreId != null,
  });

  const { data: transactions, isPending: transactionsPending } = useQuery({
    ...getPaymentsTransactionsOptions({ query: { orderId: id } }),
    enabled: !!id,
  });

  const totalPaid = useMemo(
    () =>
      (transactions ?? [])
        .filter((tx) => tx.status === "SUCCESSFULL")
        .reduce((sum, tx) => sum + (tx.amount ?? 0), 0),
    [transactions],
  );

  const catalogById = useMemo(
    () =>
      new Map(
        (catalog ?? []).flatMap((entry) =>
          entry.id != null ? [[entry.id, entry] as const] : [],
        ),
      ),
    [catalog],
  );

  const orderCatalog = useMemo(() => {
    const productId = order?.items?.[0]?.productId;
    return productId != null ? catalogById.get(productId) : undefined;
  }, [order, catalogById]);
  const catalogName =
    orderCatalog?.name ?? order?.items?.[0]?.product?.name ?? null;

  const { mutateAsync: updateStatus, isPending: updatingStatus } = useMutation({
    ...putOrderByIdStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOrderByIdQueryKey({ path: { id } }),
      });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to update status",
      });
    },
  });

  const { mutateAsync: cancelOrder, isPending: cancelling } = useMutation({
    ...putOrderByIdCancelMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getOrderByIdQueryKey({ path: { id } }),
      });
      setCancelOpen(false);
      toast.success("Order cancelled");
    },
    onError: (error) => {
      toast.error("Error!", {
        description: (error as Error)?.message || "Failed to cancel order",
      });
    },
  });

  const { mutateAsync: generateInvoice, isPending: generatingInvoice } =
    useMutation({
      ...postOrderByIdInvoiceMutation(),
      onSuccess: (data) => {
        if (data?.url) {
          window.open(data.url, "_blank");
          toast.success("Invoice generated");
        }
      },
      onError: (error) => {
        toast.error("Error!", {
          description:
            (error as Error)?.message || "Failed to generate invoice",
        });
      },
    });

  const { mutateAsync: generatePackingSlip, isPending: generatingSlip } =
    useMutation({
      ...postOrderByIdPackingSlipMutation(),
      onSuccess: (data) => {
        if (data?.url) {
          window.open(data.url, "_blank");
          toast.success("Packing slip generated");
        }
      },
      onError: (error) => {
        toast.error("Error!", {
          description:
            (error as Error)?.message || "Failed to generate packing slip",
        });
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
  const canCancel = currentStatus === "PENDING";
  const scheduleRows = [
    order.pickupDate
      ? {
          label: "Pickup Date",
          value: new Date(order.pickupDate).toLocaleDateString(),
        }
      : null,
    order.pickupTime ? { label: "Pickup Time", value: order.pickupTime } : null,
    order.deliveryWindow
      ? { label: "Delivery Window", value: order.deliveryWindow }
      : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  const sortedStatuses = [...(order.statuses ?? [])].sort(
    (a, b) =>
      new Date(a.createdat ?? 0).getTime() -
      new Date(b.createdat ?? 0).getTime(),
  );

  const userInitials = order.user?.name
    ? order.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (order.user?.email?.slice(0, 2).toUpperCase() ?? "—");

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
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", statusStyles[currentStatus])}
            >
              {statusLabels[currentStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on{" "}
            {order.createdat
              ? new Date(order.createdat).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={generatingSlip}
            onClick={() => generatePackingSlip({ path: { id } })}
          >
            <Printer className="size-4" />
            Packing Slip
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={generatingInvoice}
            onClick={() => generateInvoice({ path: { id } })}
          >
            <FileText className="size-4" />
            Invoice
          </Button>
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
            >
              <XCircle className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-6 lg:w-2/3">
          <OrderProgressTracker
            status={currentStatus}
            orderType={order.orderType}
            history={(order.statuses ?? []).map((s) => s.status)}
            advancing={updatingStatus}
            onAdvance={(nextStatus) =>
              updateStatus({
                path: { id },
                body: { status: nextStatus },
              })
            }
          />
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
                    : (order.orderType?.toLowerCase() ?? "—")}
                </span>
              </div>
              {catalogName && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catalog</span>
                    <span className="flex items-center gap-2 font-medium">
                      <span className="flex size-7 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {orderCatalog?.imageUrl ? (
                          <img
                            src={orderCatalog.imageUrl}
                            alt={catalogName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package className="size-3.5 text-muted-foreground" />
                        )}
                      </span>
                      {catalogName}
                      {orderCatalog?.bulk != null && (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium"
                        >
                          {orderCatalog.bulk ? "Per Kg" : "Per Item"}
                        </Badge>
                      )}
                    </span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    paymentStatusStyles[order.paymentStatus ?? "PENDING"],
                  )}
                >
                  {paymentStatusLabels[order.paymentStatus ?? "PENDING"]}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>{order.itemsCount ?? order.items?.length ?? 0}</span>
              </div>
              {order.washType && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wash Type</span>
                    <span className="capitalize">
                      {order.washType.toLowerCase()}
                    </span>
                  </div>
                </>
              )}
              {order.weight != null && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span>{order.weight} kg</span>
                  </div>
                </>
              )}
              {orderCatalog?.description && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Summary
                    </span>
                    <p className="text-foreground">
                      {orderCatalog.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium text-right">Qty</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Price
                      </th>
                      <th className="px-4 py-3 font-medium text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          {item.product?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">
                          {item.product?.type?.toLowerCase() ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.quantity ?? 1}
                        </td>
                        <td className="px-4 py-3 text-right">
                          KES {(item.price ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          KES{" "}
                          {(
                            (item.price ?? 0) * (item.quantity ?? 1)
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

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
                    <span>
                      KES{" "}
                      {(
                        (item.price ?? 0) * (item.quantity ?? 1)
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>KES {(order.deliveryFee ?? 0).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing</span>
                {orderCatalog?.bulk != null ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      orderCatalog.bulk
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : "bg-sky-100 text-sky-700 border-sky-200",
                    )}
                  >
                    {orderCatalog.bulk
                      ? "Bulk · Per Kg"
                      : "Individual · Per Item"}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-base">
                <span>Total</span>
                <span>KES {(order.total ?? 0).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {transactionsPending ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : transactions && transactions.length > 0 ? (
                <>
                  {transactions.map((tx) => {
                    const txStatus = tx.status ?? "";
                    const methodType = tx.method?.type ?? "";
                    const MethodIcon =
                      paymentMethodIcons[methodType] ?? CreditCard;
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                            {tx.method?.icon ? (
                              <img
                                src={tx.method.icon}
                                alt={tx.method.name ?? "Payment method"}
                                className="size-full object-cover"
                              />
                            ) : (
                              <MethodIcon className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 font-medium">
                              <span className="truncate">
                                {tx.method?.name ?? "Payment"}
                              </span>
                              {methodType && (
                                <Badge
                                  variant="outline"
                                  className="shrink-0 text-[11px] font-medium"
                                >
                                  {paymentMethodLabels[methodType] ??
                                    methodType}
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.createdat
                                ? new Date(tx.createdat).toLocaleDateString()
                                : "—"}
                              {tx.transactionId
                                ? ` · ${tx.transactionId}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              transactionStatusStyles[txStatus],
                            )}
                          >
                            {transactionStatusLabels[txStatus] ?? txStatus}
                          </Badge>
                          <span className="font-medium">
                            KES {(tx.amount ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total paid</span>
                    <span>KES {totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Balance</span>
                    <span>
                      KES{" "}
                      {((order.total ?? 0) - totalPaid).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No payments recorded for this order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full space-y-6 lg:w-1/3">
          {storePending ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ) : (
            storeDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Store</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={storeDetails.logo ?? undefined} />
                      <AvatarFallback className="text-sm">
                        {getInitials(storeDetails.name ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{storeDetails.name ?? "—"}</p>
                      {storeDetails.category && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {storeDetails.category.toLowerCase()}
                        </p>
                      )}
                    </div>
                    {storeDetails.rating != null && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <Star className="size-4 fill-amber-400 text-amber-400" />
                        {storeDetails.rating}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    {storeDetails.location && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">
                          Location
                        </span>
                        <span className="text-right">
                          {storeDetails.location}
                        </span>
                      </div>
                    )}
                    {storeDetails.opening && storeDetails.closing && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours</span>
                        <span>
                          {storeDetails.opening} – {storeDetails.closing}
                        </span>
                      </div>
                    )}
                    {storeDetails.serviceNames &&
                      storeDetails.serviceNames.length > 0 && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground shrink-0">
                            Services
                          </span>
                          <span className="text-right">
                            {storeDetails.serviceNames.join(", ")}
                          </span>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.user?.name ?? "—"}</p>
                  {order.user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {order.user.email}
                    </p>
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
                    <span className="capitalize">
                      {order.user.role.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {scheduleRows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {scheduleRows.map((row, index) => (
                  <Fragment key={row.label}>
                    {index > 0 && <Separator />}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  </Fragment>
                ))}
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
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {order.instructions ? (
                <p className="text-foreground">{order.instructions}</p>
              ) : (
                <p className="text-muted-foreground">
                  No notes for this order.
                </p>
              )}
            </CardContent>
          </Card>

          {sortedStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  {sortedStatuses.map((status, index) => (
                    <div key={status.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center self-stretch">
                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full ring-2",
                            statusStepStyles[status.status ?? ""] ??
                              "bg-muted text-muted-foreground ring-border",
                          )}
                        >
                          {(() => {
                            const StepIcon =
                              statusStepIcons[status.status ?? ""] ?? Package;
                            return <StepIcon className="size-3.5" />;
                          })()}
                        </div>
                        {index < sortedStatuses.length - 1 && (
                          <div className="w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div
                        className={cn(
                          index < sortedStatuses.length - 1 && "pb-6",
                        )}
                      >
                        <p className="text-sm font-medium">
                          {statusLabels[status.status ?? ""] ?? status.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {status.createdat
                            ? new Date(status.createdat).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <XCircle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order #{order.id}? This action
              cannot be undone.
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
