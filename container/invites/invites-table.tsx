"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InviteTableActions } from "./table-actions";

interface InviteItem {
  id?: number;
  email?: string;
  role?: string;
  status?: string;
  expiresAt?: string;
  acceptedAt?: string | null;
  createdat?: string;
}

interface InvitesTableProps {
  invites: InviteItem[];
  isPending?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  expired: {
    label: "Expired",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const roleConfig: Record<string, { label: string; className: string }> = {
  ORGANISATION_ADMIN: {
    label: "Org Admin",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  ORGANISATION_USER: {
    label: "Member",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  STORE_MANAGER: {
    label: "Store Manager",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

const columnClass: Record<string, { head?: string; cell?: string }> = {
  email: { head: "w-[30%] px-4", cell: "w-[30%] px-4" },
  role: { head: "w-[18%] px-4", cell: "w-[18%] px-4" },
  status: { head: "w-[14%] px-4", cell: "w-[14%] px-4" },
  createdat: { head: "w-[20%] px-4", cell: "w-[20%] px-4 text-muted-foreground" },
  expiresAt: { head: "w-[18%] px-4", cell: "w-[18%] px-4 text-muted-foreground" },
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

export function InvitesTable({ invites, isPending }: InvitesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const columns: ColumnDef<InviteItem>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "—",
      enableSorting: false,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const config = roleConfig[role ?? ""] ?? {
          label: role ?? "—",
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
        return (
          <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
            {config.label}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original.status ?? "").toLowerCase();
        const config = statusConfig[status] ?? {
          label: row.original.status ?? "—",
          className: "bg-gray-100 text-gray-700 border-gray-200",
        };
        return (
          <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
            {config.label}
          </Badge>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdat",
      header: ({ column }) => (
        <SortHeader
          label="Sent"
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
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) =>
        row.original.expiresAt
          ? new Date(row.original.expiresAt).toLocaleDateString()
          : "—",
      enableSorting: false,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <InviteTableActions id={row.original.id!} status={row.original.status} />
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: invites,
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
                  No pending invites
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
            {table.getPrePaginationRowModel().rows.length} invite
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
