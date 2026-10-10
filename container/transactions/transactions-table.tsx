"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UnfoldMoreIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import {
  Banknote,
  CreditCard,
  FileText,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { GetPaymentsTransactionsResponse } from "@/queries/types.gen";

type TransactionItem = GetPaymentsTransactionsResponse[number];

interface TransactionsTableProps {
  transactions: TransactionItem[];
  isPending?: boolean;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  FAILED: "Failed",
  SUCCESSFULL: "Successful",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  SUCCESSFULL: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
};

const methodLabels: Record<string, string> = {
  MOBILE: "Mobile",
  CARD: "Card",
  CASH: "Cash",
  OFFLINE: "Offline",
};

const methodIcons: Record<string, LucideIcon> = {
  MOBILE: Smartphone,
  CARD: CreditCard,
  CASH: Banknote,
  OFFLINE: FileText,
};

const columnClass: Record<string, { head?: string; cell?: string }> = {
  transaction: { head: "pl-4", cell: "pl-4 font-medium" },
  order: { head: "", cell: "" },
  method: { head: "", cell: "" },
  amount: { head: "", cell: "tabular-nums" },
  status: { head: "", cell: "" },
  date: { head: "pr-4", cell: "pr-4 text-muted-foreground" },
};

function SortHeader({
  label,
  sorted,
  onToggle,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 font-medium cursor-pointer hover:text-foreground transition-colors"
    >
      {label}
      {sorted === "asc" ? (
        <HugeiconsIcon
          icon={ArrowUp01Icon}
          strokeWidth={2}
          className="size-3.5 text-foreground"
        />
      ) : sorted === "desc" ? (
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="size-3.5 text-foreground"
        />
      ) : (
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          strokeWidth={2}
          className="size-3.5 text-muted-foreground/40"
        />
      )}
    </button>
  );
}

export function TransactionsTable({
  transactions,
  isPending,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<TransactionItem>[] = [
    {
      accessorKey: "id",
      header: "Transaction",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">#{row.original.id}</span>
          {row.original.transactionId && (
            <span className="text-xs text-muted-foreground">
              {row.original.transactionId}
            </span>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "orderId",
      header: "Order",
      cell: ({ row }) =>
        row.original.orderId != null ? (
          <Link
            href={`/app/orders/${row.original.orderId}`}
            className="font-medium text-primary hover:underline"
          >
            #{row.original.orderId}
          </Link>
        ) : (
          "—"
        ),
      enableSorting: false,
    },
    {
      id: "method",
      header: "Method",
      cell: ({ row }) => {
        const methodType = row.original.method?.type ?? "";
        const MethodIcon = methodIcons[methodType] ?? CreditCard;
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {row.original.method?.icon ? (
                <img
                  src={row.original.method.icon}
                  alt={row.original.method.name ?? "Payment method"}
                  className="size-full object-cover"
                />
              ) : (
                <MethodIcon className="size-3.5 text-muted-foreground" />
              )}
            </div>
            <span className="text-sm">
              {row.original.method?.name ??
                methodLabels[methodType] ??
                "—"}
            </span>
            {methodType && (
              <Badge
                variant="outline"
                className="shrink-0 text-[11px] font-medium"
              >
                {methodLabels[methodType] ?? methodType}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortHeader
          label="Amount"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) =>
        row.original.amount != null
          ? `KES ${row.original.amount.toLocaleString()}`
          : "—",
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortHeader
          label="Status"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => {
        const status = row.original.status ?? "";
        return (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", statusStyles[status])}
          >
            {statusLabels[status] ?? status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdat",
      header: ({ column }) => (
        <SortHeader
          label="Date"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) =>
        row.original.createdat
          ? new Date(row.original.createdat).toLocaleDateString()
          : "—",
      sortingFn: "datetime",
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { sorting, pagination },
    isMultiSortEvent: () => false,
    autoResetPageIndex: true,
  });

  return (
    <Card className="rounded-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={columnClass[header.column.id]?.head ?? ""}
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
              {isPending ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: columns.length }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={columnClass[cell.column.id]?.cell ?? ""}
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
        </div>
      </CardContent>
      {!isPending && table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            {table.getPrePaginationRowModel().rows.length} transaction
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
