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
import { AlertTriangle, Trash2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
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
import { deleteCatalogServiceTypesByIdMutation, getCatalogServiceTypesQueryKey } from "@/queries/@tanstack/react-query.gen";
import { TableActions } from "@/container/service-types/table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";

interface ServiceTypeItem {
  id?: number;
  name?: string;
  description?: string | null;
  price?: number;
  serviceTimelines?: string;
  createdat?: string;
  updatedat?: string;
}

interface ServiceTypesTableProps {
  serviceTypes: ServiceTypeItem[];
  isPending?: boolean;
}

const columnClass: Record<string, { head?: string; cell?: string }> = {
  select: { head: "w-10 pl-4", cell: "pl-4" },
  name: { head: "px-4", cell: "px-4" },
  description: {
    head: "px-4",
    cell: "max-w-[200px] truncate text-muted-foreground px-4",
  },
  price: { head: "px-4", cell: "px-4" },
  serviceTimelines: { head: "px-4", cell: "px-4 text-muted-foreground" },
  createdat: { head: "px-4", cell: "px-4 text-muted-foreground" },
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

export function ServiceTypesTable({ serviceTypes, isPending }: ServiceTypesTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: bulkDelete, isPending: bulkDeleting } = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => deleteCatalogServiceTypesByIdMutation({ path: { id } })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogServiceTypesQueryKey() });
      setRowSelection({});
      setBulkDeleteOpen(false);
    },
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to delete service types" });
    },
  });

  const columns: ColumnDef<ServiceTypeItem>[] = [
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
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name ?? "—"}</span>
      ),
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
      accessorKey: "serviceTimelines",
      header: "Timeline",
      cell: ({ row }) => row.original.serviceTimelines || "—",
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
    data: serviceTypes,
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
                  No service types found
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
            <AlertDialogTitle>Delete Service Types</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} service
              type{selectedCount !== 1 ? "s" : ""}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={bulkDeleting}
              onClick={() =>
                bulkDelete(
                  table
                    .getSelectedRowModel()
                    .rows.map((r) => r.original.id!),
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
