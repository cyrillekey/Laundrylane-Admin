/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { AlertTriangle, Trash2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UnfoldMoreIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCatalogQueryKey } from "@/queries/@tanstack/react-query.gen";
import { deleteCatalogById } from "@/queries/sdk.gen";
import { TableActions } from "@/container/catalog/table-actions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";

interface CatalogItem {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  services?: Array<string>;
  bulk?: boolean;
  createdat?: string;
  updatedat?: string;
}

interface CatalogTableProps {
  catalogs: CatalogItem[];
  isPending?: boolean;
}

const columnClass: Record<string, { head?: string; cell?: string }> = {
  select: { head: "w-10 pl-4", cell: "pl-4" },
  name: { head: "px-4", cell: "px-4" },
  description: {
    head: "px-4",
    cell: "max-w-[180px] truncate text-muted-foreground px-4",
  },
  price: { head: "px-4", cell: "px-4" },
  bulk: { head: "px-4", cell: "px-4" },
  services: { head: "px-4", cell: "px-4" },
  createdat: { head: "px-4", cell: "px-4 text-muted-foreground" },
  actions: { head: "w-12 pr-4", cell: "pr-4" },
};

type PricingFilter = "all" | "per-kg" | "per-item";

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

export function CatalogTable({ catalogs, isPending }: CatalogTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [pricingFilter, setPricingFilter] = useState<PricingFilter>("all");

  const filteredCatalogs = useMemo(() => {
    if (pricingFilter === "all") return catalogs;
    return catalogs.filter((item) =>
      pricingFilter === "per-kg" ? item.bulk === true : item.bulk === false,
    );
  }, [catalogs, pricingFilter]);

  useEffect(() => {
    setRowSelection({});
  }, [pricingFilter]);

  const queryClient = useQueryClient();
  const { mutateAsync: bulkDelete, isPending: bulkDeleting } = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => deleteCatalogById({ path: { id } })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogQueryKey() });
      setRowSelection({});
      setBulkDeleteOpen(false);
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to delete catalog items" });
    },
  });

  const columns: ColumnDef<CatalogItem>[] = [
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
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded overflow-hidden bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name ?? ""}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-muted-foreground text-xs">
                  —
                </div>
              )}
            </div>
            <span className="font-medium truncate">{item.name ?? "—"}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "—",
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
      accessorKey: "bulk",
      header: () => (
        <div className="flex items-center gap-1">
          Pricing Type
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
                    pricingFilter !== "all"
                      ? "text-foreground"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setPricingFilter("all")}
                className={pricingFilter === "all" ? "bg-accent" : undefined}
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPricingFilter("per-kg")}
                className={pricingFilter === "per-kg" ? "bg-accent" : undefined}
              >
                Per Kg
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setPricingFilter("per-item")}
                className={
                  pricingFilter === "per-item" ? "bg-accent" : undefined
                }
              >
                Per Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium",
            row.original.bulk
              ? "bg-indigo-100 text-indigo-700 border-indigo-200"
              : "bg-amber-100 text-amber-700 border-amber-200",
          )}
        >
          {row.original.bulk ? "Per Kg" : "Per Item"}
        </Badge>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) =>
        row.original.services && row.original.services.length > 0
          ? row.original.services.join(", ")
          : "—",
      enableSorting: false,
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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <TableActions id={row.original.id!} />,
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: filteredCatalogs,
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

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <Card className="rounded-lg">
      {selectedCount > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
          >
            <Trash2 className="size-4 mr-1.5" />
            Delete Selected
          </Button>
        </div>
      )}
      <CardContent className="p-0">
        <Table className="text-base">
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
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No catalog items found
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
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="size-8 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Catalog Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} catalog item
              {selectedCount !== 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={bulkDeleting}
              onClick={() =>
                bulkDelete(
                  table.getSelectedRowModel().rows.map((r) => r.original.id!),
                )
              }
            >
              {bulkDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
