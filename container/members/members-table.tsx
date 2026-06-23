/* eslint-disable @next/next/no-img-element */
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

interface MemberItem {
  id?: number;
  email?: string;
  name?: string | null;
  phone?: string | null;
  role?: "CUSTOMER" | "ADMIN" | "ORGANISATION_ADMIN" | "ORGANISATION_USER" | "STORE_MANAGER";
  isVerified?: boolean;
  avatar?: string | null;
  createdat?: string;
}

interface MembersTableProps {
  members: MemberItem[];
  isPending?: boolean;
}

const roleConfig: Record<
  string,
  { label: string; className: string }
> = {
  ADMIN: {
    label: "Super Admin",
    className: "bg-red-100 text-red-700 border-red-200",
  },
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
  CUSTOMER: {
    label: "Customer",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

const columnClass: Record<string, { head?: string; cell?: string }> = {
  name: { head: "w-[25%] px-4", cell: "w-[25%] px-4" },
  email: { head: "w-[25%] px-4", cell: "w-[25%] px-4" },
  role: { head: "w-[18%] px-4", cell: "w-[18%] px-4" },
  status: { head: "w-[12%] px-4", cell: "w-[12%] px-4" },
  createdat: { head: "w-[20%] px-4", cell: "w-[20%] px-4 text-muted-foreground" },
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

export function MembersTable({ members, isPending }: MembersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const columns: ColumnDef<MemberItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const member = row.original;
        const initials = (member.name || member.email || "?")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <div className="size-8 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name ?? ""}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <span className="font-medium truncate">{member.name || "—"}</span>
          </div>
        );
      },
      enableSorting: false,
    },
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
      accessorKey: "isVerified",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={cn(
            "text-sm font-medium",
            row.original.isVerified ? "text-green-600" : "text-muted-foreground",
          )}
        >
          {row.original.isVerified ? "Verified" : "Pending"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdat",
      header: ({ column }) => (
        <SortHeader
          label="Joined"
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
    data: members,
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
                  No members found
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
            {table.getPrePaginationRowModel().rows.length} member
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
