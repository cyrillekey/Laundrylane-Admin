/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, ArrowUp01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
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
import {
  deleteCatalogByIdMutation,
  getCatalogQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { deleteCatalogById } from "@/queries/sdk.gen";
import { TableActions } from "@/container/catalog/table-actions";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

type SortKey = "price" | "createdat";
type SortDir = "asc" | "desc";

export function CatalogTable({ catalogs, isPending }: CatalogTableProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutateAsync: bulkDelete, isPending: bulkDeleting } = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => deleteCatalogById({ path: { id } })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getCatalogQueryKey() });
      setSelected(new Set());
      setBulkDeleteOpen(false);
    },
  });

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (prev?.key === key) {
        if (prev.dir === "asc") return { key, dir: "desc" };
        return null;
      }
      return { key, dir: "asc" };
    });
  }

  const sorted = useMemo(() => {
    if (!sort) return catalogs;
    return [...catalogs].sort((a, b) => {
      const aVal = sort.key === "price" ? a.price : a.createdat;
      const bVal = sort.key === "price" ? b.price : b.createdat;
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [catalogs, sort]);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === catalogs.length) {
      setSelected(new Set());
    } else {
      setSelected(
        new Set(catalogs.map((c) => c.id).filter(Boolean) as number[]),
      );
    }
  }

  const COL_COUNT = 7;

  return (
    <Card className="rounded-lg">
      {selected.size > 0 && (
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {selected.size} item{selected.size !== 1 ? "s" : ""} selected
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
            <TableRow>
              <TableHead className="w-10 pl-4">
                <input
                  type="checkbox"
                  checked={
                    catalogs.length > 0 && selected.size === catalogs.length
                  }
                  onChange={toggleAll}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </TableHead>
              <TableHead className="px-4">Name</TableHead>
              <TableHead className="px-4">Description</TableHead>
              <TableHead className="px-4">
                <button
                  type="button"
                  onClick={() => toggleSort("price")}
                  className="inline-flex items-center gap-1 font-medium cursor-pointer hover:text-foreground transition-colors"
                >
                  Price
                  {sort?.key === "price" ? (
                    sort.dir === "asc" ? (
                      <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3.5 text-foreground" />
                    ) : (
                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5 text-foreground" />
                    )
                  ) : (
                    <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="size-3.5 text-muted-foreground/40" />
                  )}
                </button>
              </TableHead>
              <TableHead className="px-4">Pricing Type</TableHead>
              <TableHead className="px-4">Services</TableHead>
              <TableHead className="px-4">
                <button
                  type="button"
                  onClick={() => toggleSort("createdat")}
                  className="inline-flex items-center gap-1 font-medium cursor-pointer hover:text-foreground transition-colors"
                >
                  Created
                  {sort?.key === "createdat" ? (
                    sort.dir === "asc" ? (
                      <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-3.5 text-foreground" />
                    ) : (
                      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-3.5 text-foreground" />
                    )
                  ) : (
                    <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="size-3.5 text-muted-foreground/40" />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-12 pr-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: COL_COUNT + 1 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : catalogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COL_COUNT + 1}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No catalog items found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((item) => (
                <TableRow
                  key={item.id}
                  className={selected.has(item.id!) ? "bg-muted/50" : undefined}
                >
                  <TableCell className="pl-4">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id!)}
                      onChange={() => toggleSelect(item.id!)}
                      className="size-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="px-4">
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
                      <span className="font-medium truncate">
                        {item.name ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground px-4">
                    {item.description || "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    {item.price != null
                      ? `KES ${item.price.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium",
                        item.bulk
                          ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                          : "bg-amber-100 text-amber-700 border-amber-200",
                      )}
                    >
                      {item.bulk ? "Per Kg" : "Per Item"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4">
                    {item.services && item.services.length > 0
                      ? item.services.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4 text-muted-foreground">
                    {item.createdat
                      ? new Date(item.createdat).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="pr-4">
                    <TableActions id={item.id!} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
