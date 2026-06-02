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
import {
  UnfoldMoreIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";

interface ClothTypeItem {
  id?: number;
  name?: string;
  type?: string;
  price?: number;
  createdat?: string;
  updatedat?: string;
}

interface ClothTypesTableProps {
  clothTypes: ClothTypeItem[];
  isPending?: boolean;
}

const columnClass: Record<string, { head?: string; cell?: string }> = {
  select: { head: "w-12 pl-4", cell: "pl-4" },
  name: { head: "w-[35%] px-4", cell: "w-[35%] px-4" },
  type: { head: "w-[25%] px-4", cell: "w-[25%] px-4" },
  price: { head: "w-[20%] px-4", cell: "w-[20%] px-4" },
  createdat: {
    head: "w-[20%] px-4",
    cell: "w-[20%] px-4 text-muted-foreground",
  },
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

export function ClothTypesTable({
  clothTypes,
  isPending,
}: ClothTypesTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 12,
  });
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());

  const uniqueTypes = useMemo(() => {
    const types = new Set(clothTypes.map((item) => item.type).filter(Boolean));
    return Array.from(types).sort();
  }, [clothTypes]);

  const filteredData = useMemo(() => {
    if (typeFilter.size === 0) return clothTypes;
    return clothTypes.filter((item) => item.type && typeFilter.has(item.type));
  }, [clothTypes, typeFilter]);

  function toggleTypeFilter(type: string) {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  const columns: ColumnDef<ClothTypeItem>[] = [
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
        <span className="font-medium">{row.original.name ?? "—"}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "type",
      header: () => (
        <div className="flex items-center gap-1">
          Type
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer hover:text-foreground transition-colors"
              >
                <HugeiconsIcon
                  icon={FilterIcon}
                  strokeWidth={2}
                  className={cn(
                    "size-3.5",
                    typeFilter.size > 0
                      ? "text-foreground"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {uniqueTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => toggleTypeFilter(type ?? "")}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={typeFilter.has(type ?? "")}
                    readOnly
                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                  />
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      cell: ({ row }) => row.original.type || "—",
      enableSorting: false,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <SortHeader
          label="Price"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) =>
        row.original.price != null
          ? `KES ${row.original.price.toLocaleString()}`
          : "—",
    },
    {
      accessorKey: "createdat",
      header: ({ column }) => (
        <SortHeader
          label="Created"
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
    data: filteredData,
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
                  No cloth types found
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
            {table.getPrePaginationRowModel().rows.length} item
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
