"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pagination } from "@/components/ui/pagination";
import clsx from "clsx";

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

const columnClass: Record<string, string> = {
  select: "pl-4 w-10",
  id: "font-medium",
  customer: "",
  status: "",
  type: "",
  items: "",
  total: "",
  date: "text-muted-foreground",
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<OrderItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-medium">#{row.original.id}</span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const name = row.original.user?.name;
        const email = row.original.user?.email;
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
      },
      enableSorting: false,
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.orderStatus ?? "";
        return (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusStyles[status])}
          >
            {statusLabels[status] ?? status}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "orderType",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.orderType ?? "";
        return (
          <span
            className={cn(
              "inline-block rounded px-1.5 py-0.5 text-xs font-medium",
              typeStyles[type],
            )}
          >
            {type === "PICKUP_AND_DELIVERY"
              ? "Pickup & Delivery"
              : type
                ? type.charAt(0) + type.slice(1).toLowerCase()
                : "—"}
          </span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "itemsCount",
      header: "Items",
      cell: ({ row }) => row.original.itemsCount ?? "—",
      enableSorting: false,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) =>
        row.original.total != null
          ? `KES ${row.original.total.toLocaleString()}`
          : "—",
      enableSorting: false,
    },
    {
      accessorKey: "createdat",
      header: "Date",
      cell: ({ row }) =>
        row.original.createdat
          ? new Date(row.original.createdat).toLocaleDateString()
          : "—",
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { rowSelection, pagination },
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All Orders</CardTitle>
      </CardHeader>
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {selectedCount} order{selectedCount !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={index === 0 ? "ps-6" : ""}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={clsx(
                        columnClass[cell.column.id] ?? "",
                        index === 0 ? "ps-6" : "",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            {table.getPrePaginationRowModel().rows.length} order
            {table.getPrePaginationRowModel().rows.length !== 1 ? "s" : ""}
          </p>
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      )}
    </Card>
  );
}
