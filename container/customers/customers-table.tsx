"use client";

import { useState, useMemo } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { CustomerTableActions } from "@/container/customers/table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";

interface CustomerItem {
  id?: number;
  email?: string;
  name?: string | null;
  phone?: string | null;
  isVerified?: boolean;
  totalOrders?: number;
  activeOrders?: number;
  lastOrderDate?: string | null;
  createdat?: string;
}

interface CustomersTableProps {
  customers: CustomerItem[];
  isPending?: boolean;
}

const columnClass: Record<string, { head?: string; cell?: string }> = {
  select: { head: "w-12 pl-4", cell: "pl-4" },
  name: { head: "w-[22%] px-4", cell: "w-[22%] px-4" },
  email: { head: "w-[22%] px-4", cell: "w-[22%] px-4" },
  phone: { head: "w-[18%] px-4", cell: "w-[18%] px-4" },
  totalOrders: { head: "w-[12%] px-4", cell: "w-[12%] px-4" },
  activeOrders: { head: "w-[12%] px-4", cell: "w-[12%] px-4" },
  lastOrderDate: { head: "w-[14%] px-4", cell: "w-[14%] px-4 text-muted-foreground" },
  actions: { head: "w-12 pr-4", cell: "pr-4" },
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
        <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3.5 text-foreground" />
      ) : sorted === "desc" ? (
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5 text-foreground" />
      ) : (
        <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="size-3.5 text-muted-foreground/40" />
      )}
    </button>
  );
}

export function CustomersTable({ customers, isPending }: CustomersTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const columns: ColumnDef<CustomerItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="size-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="size-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name || "—"}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "—",
      enableSorting: false,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "—",
      enableSorting: false,
    },
    {
      accessorKey: "totalOrders",
      header: ({ column }) => (
        <SortHeader
          label="Orders"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) =>
        row.original.totalOrders != null ? row.original.totalOrders : "—",
    },
    {
      accessorKey: "activeOrders",
      header: ({ column }) => (
        <SortHeader
          label="Active"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) =>
        row.original.activeOrders != null ? row.original.activeOrders : "—",
    },
    {
      accessorKey: "lastOrderDate",
      header: ({ column }) => (
        <SortHeader
          label="Last Order"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) =>
        row.original.lastOrderDate
          ? new Date(row.original.lastOrderDate).toLocaleDateString()
          : "—",
      sortingFn: "datetime",
    },
    {
      id: "actions",
      header: "",
      cell: () => <CustomerTableActions />,
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: customers,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { rowSelection, sorting, pagination },
    isMultiSortEvent: () => false,
    autoResetPageIndex: true,
  });

  return (
    <Card className="rounded-lg">
      <CardContent className="p-0">
        <Table className="text-base table-fixed">
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
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-muted/50" : undefined}
                >
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
      </CardContent>
      {!isPending && table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            {table.getPrePaginationRowModel().rows.length} customer
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
