"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { getCatalogClothesOptions } from "@/queries/@tanstack/react-query.gen";
import { useSelectedStore } from "@/stores/selected-store";
import { Input } from "@/components/ui/input";
import { ClothTypesTable } from "@/container/cloth-types/cloth-types-table";
import { ClothTypesCreateDialog } from "@/container/forms/cloth-types/cloth-types-create-dialog";

const ClothTypesPage = () => {
  const { selectedStoreId } = useSelectedStore();
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    ...getCatalogClothesOptions({
      query: { storeId: selectedStoreId ?? undefined },
    }),
    enabled: !!selectedStoreId,
  });

  const clothTypes = useMemo(() => {
    const items = data ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Cloth Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cloth types available in your store
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search cloth types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <ClothTypesCreateDialog />
        </div>
      </div>
      <ClothTypesTable clothTypes={clothTypes} isPending={isPending} />
    </div>
  );
};

export default ClothTypesPage;
